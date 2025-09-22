import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as ecr from 'aws-cdk-lib/aws-ecr'

export interface ComputeConstructProps {
  artifactsBucketName: string
}

export class ComputeConstruct extends Construct {
  public readonly vpc: ec2.Vpc
  public readonly cluster: ecs.Cluster
  public readonly taskRole: iam.Role
  public readonly taskDef: ecs.FargateTaskDefinition
  public readonly logGroup: logs.LogGroup
  public readonly repository: ecr.Repository

  constructor(scope: Construct, id: string, props: ComputeConstructProps) {
    super(scope, id)

    this.vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 })
    this.cluster = new ecs.Cluster(this, 'Cluster', { vpc: this.vpc })

    this.taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    this.logGroup = new logs.LogGroup(this, 'TaskLogs', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    this.taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      cpu: 512,
      memoryLimitMiB: 1024,
      taskRole: this.taskRole,
    })

    this.repository = new ecr.Repository(this, 'RunnerRepository')

    const execRole = this.taskDef.obtainExecutionRole()
    if (execRole) {
      this.repository.grantPull(execRole)
    }

    this.taskDef.addContainer('Worker', {
      image: ecs.ContainerImage.fromEcrRepository(this.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'worker', logGroup: this.logGroup }),
      environment: {
        ARTIFACTS_BUCKET: props.artifactsBucketName,
        AWS_REGION: cdk.Stack.of(this).region,
      },
      command: ['node', '/app/dist/index.js'],
    })
  }
}
