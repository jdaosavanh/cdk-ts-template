import CustomStack from "../custom-stack"
import {aws_ec2, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import { VpcConfig } from "../config";
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  Vpc
} from "aws-cdk-lib/aws-ec2";

export class Ec2Stack extends CustomStack {
  vpcConfig: VpcConfig;
  constructor(scope: Construct, id: string, props: StackProps, config: VpcConfig) {
    super(scope, id, props, config);
    this.vpcConfig = config;
    this.ec2s(config)
  }

  ec2s(config: VpcConfig) {
    const role = new Role(this, 'ec2-ssm-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    });
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMFullAccess'));

    role.addToPolicy(new PolicyStatement({
      actions: [
        'ssm-guiconnect:CancelConnection',
        'ssm-guiconnect:GetConnection',
        'ssm-guiconnect:StartConnection'
      ],
      resources: ['*'],
    }));
    const vpc = this.vpc();
    const securityGroup = new SecurityGroup(
      this,
      'ec2-ssm-sg',
      {
        vpc: vpc,
        allowAllOutbound: true,
      }
    )
    securityGroup.addIngressRule(Peer.ipv4('10.0.0.0/8'), Port.tcp(22), 'Allow SSH from network');

    const instance = new Instance(this, 'control-plane', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
      machineImage: new aws_ec2.AmazonLinuxImage({
        generation: aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: role,
      securityGroup: securityGroup
    });
  }

   vpc(){
     return Vpc.fromLookup(this, 'vpc', {
       vpcName: this.vpcConfig.vpcName,
     });
   }

}
