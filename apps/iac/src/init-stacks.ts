import { VpcStack, Ec2Stack } from "./stacks"
import {App, Environment} from "aws-cdk-lib";
import {BaseConfig, VpcConfig} from "./config";

class InitStacks {
    app: App;
    env: Environment
    config: BaseConfig
    constructor(app: App, env: Environment) {
        this.app = app;
        this.env = env;
        this.config = new BaseConfig({})
        const vpc = this.vpcStack()
        const ec2s = this.ec2Stack()
        ec2s.addDependency(vpc)
    }

    getStackProps(props?: Environment) {
        if(props) {
            return {
                env: props,
            }
        }
        return  {
            env: this.env
        }
    }

    vpcStack(){
        const stackProps = this.getStackProps()
        const vpcConfig = new VpcConfig({})
        const stackName = vpcConfig.autoResourceName('vpc-stack')
        return new VpcStack(this.app, stackName, stackProps, vpcConfig)
    }

    ec2Stack(){
      const stackProps = this.getStackProps()
      const ec2 = new VpcConfig({})
      const stackName = ec2.autoResourceName('ec2-stack')
      return new Ec2Stack(this.app, stackName, stackProps, ec2)
    }
}

export default InitStacks
