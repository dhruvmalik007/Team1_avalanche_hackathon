import 'server-only'
import { RlHubInfraClient } from '@rlhub/api-client'
import type { RunRecord, SubmitRunRequest, SubmitRunResponse } from '@rlhub/api-types'

function client(): RlHubInfraClient {
  return new RlHubInfraClient()
}

export async function getRunSSR(runId: string): Promise<RunRecord | null> {
  const r = await client().getRun(runId)
  return r ?? null
}

export async function listUserRunsSSR(userId: string, limit = 50): Promise<RunRecord[]> {
  return client().listUserRuns(userId, limit)
}

export async function submitRunSSR(body: SubmitRunRequest & { userId: string }): Promise<SubmitRunResponse> {
  return client().submitRun(body)
}
