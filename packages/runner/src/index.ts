import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

function env(name: string, required = true): string {
  const v = process.env[name]
  if (!v && required) throw new Error(`Missing env ${name}`)
  return v || ''
}

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)) }

async function main() {
  const inputStr = env('INPUT')
  const ARTIFACTS_BUCKET = env('ARTIFACTS_BUCKET')
  const AWS_REGION = env('AWS_REGION')

  const s3 = new S3Client({ region: AWS_REGION })

  const input = JSON.parse(inputStr)
  const runId: string = input.runId || `run_${Date.now()}`
  const envId: string = input.envId || 'unknown/env'
  const userId: string = input.userId || 'unknown-user'

  const statusKey = `runs/${runId}/status.json`
  const resultsKey = `runs/${runId}/artifacts/results.json`

  async function writeStatus(partial: any) {
    const base = {
      runId,
      envId,
      userId,
      status: 'RUNNING',
      createdAt: input.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...partial,
    }
    await s3.send(new PutObjectCommand({
      Bucket: ARTIFACTS_BUCKET,
      Key: statusKey,
      Body: Buffer.from(JSON.stringify(base)),
      ContentType: 'application/json',
    }))
  }

  // Mark RUNNING
  await writeStatus({ status: 'RUNNING', progress: { pct: 5, msg: 'Starting runner' } })

  // Simulate work with staged progress updates
  await sleep(2000)
  await writeStatus({ status: 'RUNNING', progress: { pct: 25, msg: 'Setting up environment' } })

  await sleep(2000)
  await writeStatus({ status: 'RUNNING', progress: { pct: 60, msg: 'Evaluating policy' } })

  await sleep(2000)
  await writeStatus({ status: 'RUNNING', progress: { pct: 85, msg: 'Aggregating results' } })

  // Produce a simple results.json
  const results = {
    runId,
    envId,
    metrics: { score: Math.round(Math.random() * 1000) / 10 },
    params: input.params || {},
    completedAt: Date.now(),
  }
  await s3.send(new PutObjectCommand({
    Bucket: ARTIFACTS_BUCKET,
    Key: resultsKey,
    Body: Buffer.from(JSON.stringify(results, null, 2)),
    ContentType: 'application/json',
  }))

  await writeStatus({
    status: 'COMPLETED',
    progress: { pct: 100, msg: 'Done' },
    score: results.metrics.score,
    artifacts: { resultsUrl: `s3://${ARTIFACTS_BUCKET}/${resultsKey}` },
  })

  console.log('Runner completed', { runId, resultsKey })
}

main().catch(async (err) => {
  try {
    const ARTIFACTS_BUCKET = process.env.ARTIFACTS_BUCKET
    const AWS_REGION = process.env.AWS_REGION
    const runId = (() => { try { return JSON.parse(process.env.INPUT || '{}').runId } catch { return undefined } })() || `run_${Date.now()}`
    const s3 = ARTIFACTS_BUCKET && AWS_REGION ? new S3Client({ region: AWS_REGION }) : undefined
    const statusKey = `runs/${runId}/status.json`
    if (s3 && ARTIFACTS_BUCKET) {
      await s3.send(new PutObjectCommand({
        Bucket: ARTIFACTS_BUCKET,
        Key: statusKey,
        Body: Buffer.from(JSON.stringify({ runId, status: 'FAILED', error: String(err), updatedAt: Date.now() })),
        ContentType: 'application/json',
      }))
    }
  } catch {}
  console.error('Runner error:', err)
  process.exit(1)
})
