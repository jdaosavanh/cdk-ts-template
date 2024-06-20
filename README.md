# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkTsTemplateStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## K8s

kubectl create deployment nginx --image=nginx:alpine -–dry-run=client -o yaml
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml


## AWS

aws ssm start-session \
    --profile profile-name \
    --target instance-id

aws ssm start-session \
    --profile devops \
    --target instance-id \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["30000"], "localPortNumber":["9000"]}'

cdk deploy stack-name --require-approval never --profile devops 
