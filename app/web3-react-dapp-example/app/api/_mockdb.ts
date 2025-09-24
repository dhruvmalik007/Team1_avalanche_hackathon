import type { RunRecord, SubmitRunRequest, SubmitRunResponse, EnvironmentDTO } from '@rlhub/api-types';
import { environments as localEnvs } from '../../lib/environments';

// Simple in-memory store to simulate SQS -> SFN -> ECS progression
// NOTE: This persists only per dev server process. Do NOT use for production.

type Progress = { pct: number; msg?: string };

type RunInternal = RunRecord & {
  progress: Progress;
  _createdAtMs: number;
};

const runs = new Map<string, RunInternal>();
const usersRuns = new Map<string, string[]>(); // userId -> runIds

function nowSec(): number { return Math.floor(Date.now() / 1000); }
function makeId(): string {
  // Prefer crypto.randomUUID if available
  // Fallback to timestamp-rand
  try {
    const rnd = (globalThis as any)?.crypto?.randomUUID;
    if (typeof rnd === 'function') {
      return rnd();
    }
  } catch { void 0; }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function listEnvironments(): EnvironmentDTO[] {
  return localEnvs.map((e) => ({
    envId: `${e.owner}/${e.slug}`,
    name: e.name,
    description: e.description,
    tags: e.tags,
    repoUrl: e.repoUrl,
    commit: undefined,
    createdAt: Math.floor(new Date(e.updatedAt).getTime() / 1000) - 3600, // mock
    updatedAt: Math.floor(new Date(e.updatedAt).getTime() / 1000),
  }));
}

export function createRun(userId: string, body: SubmitRunRequest): SubmitRunResponse {
  const { envId = 'demo/unknown', onChain } = body || {};
  const runId = makeId();
  const createdAt = nowSec();
  const run: RunInternal = {
    runId,
    envId,
    userId,
    status: 'QUEUED',
    score: undefined,
    artifacts: undefined,
    onChain: !!onChain,
    txHash: undefined,
    createdAt,
    updatedAt: createdAt,
    progress: { pct: 0, msg: 'Enqueued to SQS' },
    _createdAtMs: Date.now(),
  };
  runs.set(runId, run);
  const ids = usersRuns.get(userId) || [];
  ids.unshift(runId);
  usersRuns.set(userId, ids);
  return { runId, statusUrl: `/api/runs/${encodeURIComponent(runId)}` };
}

export function getRun(runId: string): RunInternal | undefined {
  const r = runs.get(runId);
  if (!r) return undefined;
  advance(r);
  return r;
}

export function listUserRuns(userId: string, limit = 50): RunRecord[] {
  const ids = usersRuns.get(userId) || [];
  const out: RunRecord[] = [];
  for (const id of ids.slice(0, limit)) {
    const r = runs.get(id);
    if (r) {
      advance(r);
      const { progress: _p, _createdAtMs: _m, ...pub } = r;
      void _p; void _m;
      out.push(pub);
    }
  }
  return out;
}

function advance(run: RunInternal) {
  const elapsed = Date.now() - run._createdAtMs; // ms
  const sec = elapsed / 1000;
  let changed = false;

  if (sec < 1) {
    if (run.status !== 'QUEUED') { run.status = 'QUEUED'; changed = true; }
    run.progress = { pct: 5, msg: 'SQS: queued' };
  } else if (sec < 3) {
    if (run.status !== 'RUNNING') { run.status = 'RUNNING'; changed = true; }
    run.progress = { pct: 25, msg: 'Step Functions: PrepareRun' };
  } else if (sec < 6) {
    if (run.status !== 'RUNNING') { run.status = 'RUNNING'; changed = true; }
    run.progress = { pct: 65, msg: 'ECS: task executing' };
  } else if (sec < 8) {
    if (run.status !== 'RUNNING') { run.status = 'RUNNING'; changed = true; }
    run.progress = { pct: 85, msg: 'Post-run: uploading artifacts' };
  } else if (run.status !== 'COMPLETED' && run.status !== 'FAILED') {
    run.status = 'COMPLETED';
    run.progress = { pct: 100, msg: 'Completed' };
    run.score = Math.round(Math.random() * 1000) / 1000;
    run.artifacts = { resultsUrl: `https://mock-s3.local/artifacts/${run.runId}/results.json`, hash: `sha256:${run.runId.slice(0, 8)}` };
    changed = true;
  }

  if (changed) run.updatedAt = nowSec();
}

export type { RunInternal, Progress };
