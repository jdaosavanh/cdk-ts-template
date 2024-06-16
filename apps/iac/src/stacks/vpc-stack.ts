import CustomStack from "../custom-stack"
import { StackProps, aws_ec2, aws_networkmanager as nm, custom_resources as cr } from 'aws-cdk-lib';
import {Construct} from "constructs";
import { VpcConfig } from "../config";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class VpcStack extends CustomStack {
    constructor(scope: Construct, id: string, props: StackProps, config: VpcConfig) {
        super(scope,id,props,config);
        const vpc = this.vpc(config)
        if (false) {
          this.vpcAttachment(config, vpc);
        }
    }

    vpc(config: VpcConfig) {
        const vpcProps: aws_ec2.VpcProps = {
            vpcName: config.vpcName,
            ipAddresses: aws_ec2.IpAddresses.cidr(config.vpcCIDR),
            maxAzs: config.vpcMaxAzs,
            natGateways: config.vpcNatGateways,
            subnetConfiguration: [
                {
                    name: config.vpcPublicSubnetGN,
                    cidrMask: config.vpcPublicSubnetMask,
                    subnetType: aws_ec2.SubnetType.PUBLIC
                },
                {
                    name: config.vpcAppSubnetGN,
                    cidrMask: config.vpcPrivateSubnetMask,
                    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS
                },
                {
                    name: config.vpcDBSubnetGN,
                    cidrMask: config.vpcIsolatedSubnetMask,
                    subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED
                }
            ]
        }
        return new aws_ec2.Vpc(this, 'vpc', vpcProps)
    }

  vpcAttachment(config: VpcConfig, vpc: aws_ec2.IVpc) {
    const subnetArns = vpc.privateSubnets.map(
      (subnet) => `arn:aws:ec2:${this.region}:${this.account}:subnet/${subnet.subnetId}`,
    );
    const coreNetworkId: string = 'core-network-0eaa88748f9d5e362';
    const coreNetworkArn: string = `arn:aws:networkmanager::012625350074:core-network/${coreNetworkId}`;
    const attachment = new nm.CfnVpcAttachment(this, config.vpcName + 'CloudwanAttachment', {
      coreNetworkId: coreNetworkId,
      subnetArns: subnetArns,
      vpcArn: vpc.vpcArn,
      tags: [
        {
          key: 'environment',
          value: config.environment,
        },
        {
          key: 'Name',
          value: `${this.config.namePrefix()}-attachment`,
        },
      ],
    });
    // Add a route to Cloud WAN for each private subnet
    for (const subnet of vpc.selectSubnets({ subnetGroupName: config.vpcAppSubnetGN }).subnets) {
      const addRoutev4SdkCall: cr.AwsSdkCall = {
        service: 'EC2',
        action: 'createRoute',
        parameters: {
          CoreNetworkArn: coreNetworkArn,
          RouteTableId: subnet.routeTable.routeTableId,
          DestinationCidrBlock: "10.0.0.0/8",
        },
        region: this.region,
        physicalResourceId: cr.PhysicalResourceId.of(
          subnet.routeTable.routeTableId + '-cloudwan-route',
        ),
      };
      new cr.AwsCustomResource(this, `${subnet.node.id}-v4route`, {
        onCreate: addRoutev4SdkCall,
        onUpdate: addRoutev4SdkCall,
        logRetention: RetentionDays.FIVE_DAYS,
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new PolicyStatement({
            actions: ['ec2:CreateRoute'],
            effect: Effect.ALLOW,
            resources: [`arn:aws:ec2:*:*:route-table/${subnet.routeTable.routeTableId}`],
          }),
        ]),
      }).node.addDependency(attachment);
    }
  }
}
