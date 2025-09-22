import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'

export interface OrchestrationConstructProps {
  vpc: ec2.IVpc
  cluster: ecs.ICluster
  taskDefinition: ecs.FargateTaskDefinition
}

export class OrchestrationConstruct extends Construct {
  public readonly stateMachine: sfn.StateMachine

  constructor(scope: Construct, id: string, props: OrchestrationConstructProps) {
    super(scope, id)

    // Security group for tasks launched by Step Functions (public for simplicity)
    const sg = new ec2.SecurityGroup(this, 'RunTasksSG', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for on-demand ECS tasks launched by Step Functions',
    })

    const runTask = new tasks.EcsRunTask(this, 'RunWorkerTask', {
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      launchTarget: new tasks.EcsFargateLaunchTarget(),
      assignPublicIp: true,
      securityGroups: [sg],
      containerOverrides: [
        {
          containerDefinition: props.taskDefinition.defaultContainer!,
          environment: [
            // Pass the full Step Functions state input to the container
            { name: 'INPUT', value: sfn.JsonPath.stringAt('$') },
          ],
        },
      ],
    })

    const definition = runTask

    this.stateMachine = new sfn.StateMachine(this, 'RunStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    })

    // Permissions for SFN to run tasks
    this.stateMachine.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ecs:RunTask', 'ecs:DescribeTasks', 'ecs:StopTask'],
      resources: ['*'],
    }))
    this.stateMachine.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [
        props.taskDefinition.obtainExecutionRole().roleArn,
        props.taskDefinition.taskRole.roleArn,
      ],
    }))
  }
}
