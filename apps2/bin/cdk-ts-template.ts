#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkTsTemplateStack } from '../lib/cdk-ts-template-stack';

const app = new cdk.App();
new CdkTsTemplateStack(app, 'CdkTsTemplateStack');
