import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'

export interface StorageConstructProps {
  removalPolicy?: cdk.RemovalPolicy
}

export class StorageConstruct extends Construct {
  public readonly artifactsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: StorageConstructProps = {}) {
    super(scope, id)

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: props.removalPolicy ?? cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
