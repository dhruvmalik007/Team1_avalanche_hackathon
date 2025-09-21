import type { EnvironmentDTO, SubmitRunRequest, SubmitRunResponse, RunRecord } from '@rlhub/api-types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
  return res.json();
}

async function postJson<T>(url: string, body: any, expectedStatus?: number): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
  if (expectedStatus && res.status !== expectedStatus) throw new Error(`${url} status ${res.status}`);
  if (!res.ok && !expectedStatus) throw new Error(`${url} failed: ${res.status}`);
  return res.json();
}

export async function fetchEnvironments(): Promise<EnvironmentDTO[]> {
  return getJson<EnvironmentDTO[]>('/api/environments');
}

export async function submitRun(body: SubmitRunRequest & { userId?: string }): Promise<SubmitRunResponse> {
  return postJson<SubmitRunResponse>('/api/runs', body, 202);
}

export async function getRun(runId: string): Promise<RunRecord> {
  return getJson<RunRecord>(`/api/runs/${encodeURIComponent(runId)}`);
}

export async function listUserRuns(userId: string, limit = 50): Promise<RunRecord[]> {
  return getJson<RunRecord[]>(`/api/users/${encodeURIComponent(userId)}/runs?limit=${limit}`);
}
