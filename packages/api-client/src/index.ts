import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import type { EnvironmentDTO, RunRecord, SubmitRunRequest, SubmitRunResponse } from '@rlhub/api-types'

export type InfraClientConfig = {
  region?: string
  bucketName: string
  queueUrl: string
  stateMachineArn?: string
}

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    ;(stream as Readable)
      .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}

function nowMs() { return Date.now() }
function genRunId() { return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` }

export class RlHubInfraClient {
  private readonly region: string
  private readonly bucketName: string
  private readonly queueUrl: string
  private readonly s3: S3Client
  private readonly sqs: SQSClient

  constructor(cfg?: Partial<InfraClientConfig>) {
    this.region = cfg?.region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
    this.bucketName = (cfg?.bucketName || process.env.NEXT_PRIVATE_S3_ARTIFACTS_BUCKET || '').trim()
    this.queueUrl = (cfg?.queueUrl || process.env.NEXT_PRIVATE_SQS_RUNS_QUEUE_URL || '').trim()
    if (!this.bucketName) throw new Error('Missing artifacts bucket name (NEXT_PRIVATE_S3_ARTIFACTS_BUCKET)')
    if (!this.queueUrl) throw new Error('Missing runs queue URL (NEXT_PRIVATE_SQS_RUNS_QUEUE_URL)')
    this.s3 = new S3Client({ region: this.region })
    this.sqs = new SQSClient({ region: this.region })
  }

  private statusKey(runId: string) { return `runs/${runId}/status.json` }
  private userIndexKey(userId: string, runId: string) { return `users/${userId}/runs/${runId}.json` }

  async submitRun(body: SubmitRunRequest & { userId: string }): Promise<SubmitRunResponse> {
    const runId = genRunId()
    const createdAt = nowMs()
    const msgBody = JSON.stringify({ ...body, runId, createdAt })

    // 1) Enqueue message to SQS (EventBridge Pipe will start SFN)
    await this.sqs.send(new SendMessageCommand({ QueueUrl: this.queueUrl, MessageBody: msgBody }))

    // 2) Persist initial status in S3 so the UI can poll status immediately
    const status: RunRecord = {
      runId,
      envId: body.envId,
      userId: body.userId,
      status: 'QUEUED',
      onChain: !!body.onChain,
      createdAt,
      updatedAt: createdAt,
    }
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.statusKey(runId),
      Body: Buffer.from(JSON.stringify(status)),
      ContentType: 'application/json',
    }))

    // User index for listing
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.userIndexKey(body.userId, runId),
      Body: Buffer.from(JSON.stringify({ runId, envId: body.envId, createdAt })),
      ContentType: 'application/json',
    }))

    return { runId, statusUrl: `/api/runs/${encodeURIComponent(runId)}` }
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    try {
      const out = await this.s3.send(new GetObjectCommand({ Bucket: this.bucketName, Key: this.statusKey(runId) }))
      const txt = await streamToString(out.Body as any)
      return JSON.parse(txt) as RunRecord
    } catch (e: any) {
      if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) return undefined
      throw e
    }
  }

  async listUserRuns(userId: string, limit = 50): Promise<RunRecord[]> {
    // List index keys and fetch each status (best-effort, up to limit)
    const prefix = `users/${userId}/runs/`
    const listed = await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucketName, Prefix: prefix, MaxKeys: limit }))
    const keys = (listed.Contents || []).map(o => o.Key!).filter(Boolean)
    const runIds = keys.map(k => k.split('/').slice(-1)[0].replace(/\.json$/, ''))
    const results: RunRecord[] = []
    for (const id of runIds) {
      const r = await this.getRun(id)
      if (r) results.push(r)
    }
    // Sort newest first
    results.sort((a,b) => (b.createdAt||0) - (a.createdAt||0))
    return results
  }
}

export type { EnvironmentDTO, RunRecord, SubmitRunRequest, SubmitRunResponse }
// import type { EnvironmentDTO, RunRecord, SubmitRunRequest, SubmitRunResponse } from '@rlhub/api-types';

// export class RlHubClient {
//   constructor(private baseUrl: string, private token?: string) {}

//   private headers(): HeadersInit {
//     const h: Record<string, string> = { 'Content-Type': 'application/json' };
//     if (this.token) h.Authorization = `Bearer ${this.token}`;
//     return h;
//   }

//   async listEnvironments(): Promise<EnvironmentDTO[]> {
//     const res = await fetch(`${this.baseUrl}/environments`, { headers: this.headers(), cache: 'no-store' });
//     if (!res.ok) throw new Error(`listEnvironments failed: ${res.status}`);
//     return res.json();
//   }

//   async submitRun(body: SubmitRunRequest): Promise<SubmitRunResponse> {
//     const res = await fetch(`${this.baseUrl}/runs`, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
//     if (!res.ok) throw new Error(`submitRun failed: ${res.status}`);
//     return res.json();
//   }

//   async getRun(runId: string): Promise<RunRecord> {
//     const res = await fetch(`${this.baseUrl}/runs/${encodeURIComponent(runId)}`, { headers: this.headers(), cache: 'no-store' });
//     if (!res.ok) throw new Error(`getRun failed: ${res.status}`);
//     return res.json();
//   }

//   async listUserRuns(userId: string, limit = 50): Promise<RunRecord[]> {
//     const res = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}/runs?limit=${limit}`, { headers: this.headers(), cache: 'no-store' });
//     if (!res.ok) throw new Error(`listUserRuns failed: ${res.status}`);
//     return res.json();
//   }
// }
