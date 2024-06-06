import { Stack, StackProps, Tags} from 'aws-cdk-lib'
import { BaseConfig } from "./config";
import { Construct, IConstruct } from "constructs";

class CustomStack extends Stack {
    config: BaseConfig
    id: string;

    constructor(scope: Construct, id: string,props: StackProps, config: BaseConfig ) {
        super(scope, id, props);
        this.config = config;
        this.id = id;
        this.addTags(this)
    }

    addTags(resource: IConstruct) {
        Tags.of(resource).add('stack-name', this.id)
        Tags.of(resource).add('environment', this.config.environment)
        Tags.of(resource).add('domain', this.config.domain)
    }
}

export default CustomStack
