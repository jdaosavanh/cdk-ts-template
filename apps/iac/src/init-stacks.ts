import { VpcStack } from "./stacks"
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
}

export default InitStacks
