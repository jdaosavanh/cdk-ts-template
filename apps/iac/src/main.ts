import { App, Environment} from "aws-cdk-lib";
import InitStacks from './init-stacks'
import * as process from "process";

const app = new App()

const getEnv = () => {
    const env: Environment = {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
    const awsAccount = env.account
    if(!awsAccount) {
        throw  new Error(
            'Not aws account. Check AWS config or login'
        )
    }
    return env
}

const initialize = () => {
    const env = getEnv()
    const stacks = new InitStacks(app, env)
    console.log('Initializing Stacks...')
    app.synth()
}

initialize()
