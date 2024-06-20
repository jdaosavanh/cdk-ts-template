import CustomStack from "../custom-stack"
import {StackProps, aws_elasticloadbalancingv2, aws_elasticloadbalancingv2_targets} from "aws-cdk-lib";
import {Construct} from "constructs";
import {VpcConfig} from "../config";
import {
    Peer,
    Port,
    SecurityGroup,
    Vpc
} from "aws-cdk-lib/aws-ec2";
import {
    ApplicationTargetGroup,
    ListenerAction,
    ListenerCondition
} from "aws-cdk-lib/aws-elasticloadbalancingv2";


export class AlbStack extends CustomStack {
    vpcConfig: VpcConfig;

    constructor(scope: Construct, id: string, props: StackProps, config: VpcConfig) {
        super(scope, id, props, config);
        this.vpcConfig = config;
        this.alb(config)
    }

    alb(config: VpcConfig) {
        const vpc = this.vpc();
        const securityGroup = new SecurityGroup(
            this,
            'alb-sg',
            {
                vpc: vpc,
                allowAllOutbound: true,
            }
        )
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.HTTP, 'Allow http');
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.HTTPS, 'Allow https');

        const lb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'LB',
            {
                vpc,
                securityGroup,
                internetFacing: true
            });

        // Add a listener and open up the load balancer's security group
        // to the world.
        const listener = lb.addListener('Listener', {
            port: 80,
            // 'open: true' is the default, you can leave it out if you want. Set it
            // to 'false' and use `listener.connections` if you want to be selective
            // about who can access the load balancer.
            open: true,
        });

        const targetGroup = new ApplicationTargetGroup(this, 'target-group',
            {
                port: 31788,
                protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
                targetType: aws_elasticloadbalancingv2.TargetType.INSTANCE,
                targets: [new aws_elasticloadbalancingv2_targets.InstanceIdTarget("i-0529f031cbd705a9c")],
                vpc,
            })


        // Create an AutoScaling group and add it as a load balancing
        // target to the listener.
        listener.addAction('k8s', {
            action: ListenerAction.forward([targetGroup])
        });

        // listener.addAction('k8s', {
        //     priority: 1,
        //     conditions: [ListenerCondition.pathPatterns(["*"])],
        //     action: ListenerAction.forward([targetGroup])
        // });

        // listener.addTargetGroups('k8s', {
        //     targetGroups: [targetGroup]
        // });

    }

    vpc() {
        return Vpc.fromLookup(this, 'vpc', {
            vpcName: this.vpcConfig.vpcName,
        });
    }

}
