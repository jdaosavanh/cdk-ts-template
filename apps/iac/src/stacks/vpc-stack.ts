import CustomStack from "../custom-stack"
import {aws_ec2, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import { VpcConfig } from "../config";

export class VpcStack extends CustomStack {
    constructor(scope: Construct, id: string, props: StackProps, config: VpcConfig) {
        super(scope,id,props,config);
        const vpc = this.vpc(config)
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
}
