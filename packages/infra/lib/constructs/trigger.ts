import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as pipes from 'aws-cdk-lib/aws-pipes'

export interface TriggerConstructProps {
  queue: sqs.IQueue
  stateMachine: sfn.IStateMachine
}

export class TriggerConstruct extends Construct {
  public readonly pipe: pipes.CfnPipe

  constructor(scope: Construct, id: string, props: TriggerConstructProps) {
    super(scope, id)

    // Role assumed by EventBridge Pipes
    const role = new iam.Role(this, 'PipesRole', {
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
    })

    role.addToPolicy(new iam.PolicyStatement({
      actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl', 'sqs:ChangeMessageVisibility'],
      resources: [props.queue.queueArn],
    }))

    role.addToPolicy(new iam.PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [props.stateMachine.stateMachineArn],
    }))

    this.pipe = new pipes.CfnPipe(this, 'RunsPipe', {
      roleArn: role.roleArn,
      source: props.queue.queueArn,
      sourceParameters: {
        sqsQueueParameters: {
          batchSize: 1,
        },
      },
      target: props.stateMachine.stateMachineArn,
      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: 'FIRE_AND_FORGET',
        },
        // Forward the SQS message body directly as state input
        inputTemplate: '<$.body>'
      },
    })
  }
}
