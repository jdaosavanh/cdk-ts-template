import CustomStack from "../custom-stack"
import { aws_ec2, CfnOutput, StackProps } from "aws-cdk-lib";
import {Construct} from "constructs";
import { VpcConfig } from "../config";
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType, KeyPair,
  Peer,
  Port,
  SecurityGroup,
  Vpc
} from "aws-cdk-lib/aws-ec2";
import { readFile, readFileSync } from "node:fs";
import * as path from "node:path";
import * as fs from "fs";

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
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.allTcp(), 'Allow access inside vpc');


    //const userDataScript = readFileSync('./install-worker.sh', 'utf8');
    const file = fs.readFileSync(path.resolve(__dirname, "../scripts/install-k8-master.sh"), 'utf8');
    const userData = aws_ec2.UserData.custom(file);
    const controlPlane = new Instance(this, 'control-plane', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: new aws_ec2.AmazonLinuxImage({
        generation: aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: role,
      securityGroup: securityGroup,
      userData: userData
    });

    const workerfile = fs.readFileSync(path.resolve(__dirname, "../scripts/install-worker.sh"), 'utf8');
    const workeruserData = aws_ec2.UserData.custom(workerfile);
    const worker = new Instance(this, 'worker', {
      vpc: vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
      machineImage: new aws_ec2.AmazonLinuxImage({
        generation: aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: role,
      securityGroup: securityGroup,
      userData: workeruserData
    });

    new CfnOutput(this, 'controlplane-ip', { value: controlPlane.instancePrivateIp });
    new CfnOutput(this, 'worker-ip', { value: worker.instancePrivateIp });
    new CfnOutput(this, 'controlplane-instance', { value: controlPlane.instanceId });
    new CfnOutput(this, 'worker-instance', { value: worker.instanceId });

  }

   vpc(){
     return Vpc.fromLookup(this, 'vpc', {
       vpcName: this.vpcConfig.vpcName,
     });
   }

}
