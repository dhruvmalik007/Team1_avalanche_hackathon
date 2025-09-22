import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { StorageConstruct } from './constructs/storage';
import { QueueingConstruct } from './constructs/queueing';
import { ComputeConstruct } from './constructs/compute';
import { OrchestrationConstruct } from './constructs/orchestration';
import { TriggerConstruct } from './constructs/trigger';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1) Storage
    const storage = new StorageConstruct(this, 'Storage', { removalPolicy: cdk.RemovalPolicy.DESTROY });

    // 2) Queueing
    const queueing = new QueueingConstruct(this, 'Queueing');

    // 3) Compute (VPC, Cluster, TaskDef)
    const compute = new ComputeConstruct(this, 'Compute', {
      artifactsBucketName: storage.artifactsBucket.bucketName,
    });
    // Grant S3 access to task role
    storage.artifactsBucket.grantReadWrite(compute.taskRole);

    // 4) Orchestration (SFN -> ECS RunTask)
    const orchestration = new OrchestrationConstruct(this, 'Orchestration', {
      vpc: compute.vpc,
      cluster: compute.cluster,
      taskDefinition: compute.taskDef,
    });

    // 5) Trigger (SQS -> SFN) using EventBridge Pipes
    const trigger = new TriggerConstruct(this, 'Trigger', {
      queue: queueing.runsQueue,
      stateMachine: orchestration.stateMachine,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ArtifactsBucketName', { value: storage.artifactsBucket.bucketName });
    new cdk.CfnOutput(this, 'RunsQueueUrl', { value: queueing.runsQueue.queueUrl });
    new cdk.CfnOutput(this, 'ClusterName', { value: compute.cluster.clusterName });
    new cdk.CfnOutput(this, 'StateMachineArn', { value: orchestration.stateMachine.stateMachineArn });
    new cdk.CfnOutput(this, 'RunnerRepositoryName', { value: compute.repository.repositoryName });
    new cdk.CfnOutput(this, 'RunnerRepositoryUri', { value: compute.repository.repositoryUri });
  }
}
