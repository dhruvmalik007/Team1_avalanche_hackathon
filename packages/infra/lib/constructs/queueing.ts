import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'

export class QueueingConstruct extends Construct {
  public readonly runsQueue: sqs.Queue
  public readonly dlq: sqs.Queue

  constructor(scope: Construct, id: string) {
    super(scope, id)

    this.dlq = new sqs.Queue(this, 'RunsDLQ', {
      retentionPeriod: cdk.Duration.days(14),
    })

    this.runsQueue = new sqs.Queue(this, 'RunsQueue', {
      visibilityTimeout: cdk.Duration.minutes(5),
      deadLetterQueue: { queue: this.dlq, maxReceiveCount: 5 },
    })
  }
}
