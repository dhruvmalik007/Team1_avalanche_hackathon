#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';
// Discovered bootstrap qualifier from SSM/CloudFormation: 1744753737
const qualifier = process.env.CDK_QUALIFIER || '1744753737';

new InfraStack(app, 'RlHubInfraStack', {
  env: account && region ? { account, region } : undefined,
  synthesizer: new cdk.DefaultStackSynthesizer({ qualifier }),
});
