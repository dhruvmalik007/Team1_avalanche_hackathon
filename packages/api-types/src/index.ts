// Shared API type definitions for RLHub

export type RunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface EnvironmentDTO {
  envId: string;            // owner/slug
  name: string;
  description?: string;
  tags?: string[];
  repoUrl?: string;
  commit?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Progress {
  pct: number;
  msg?: string;
}

export interface SubmitRunRequest {
  envId: string;
  commit?: string;
  params?: Record<string, unknown>;
  onChain?: boolean;
}

export interface SubmitRunResponse {
  runId: string;
  statusUrl: string;
}

export interface RunRecord {
  runId: string;
  envId: string;
  userId: string;
  status: RunStatus;
  progress?: Progress;
  score?: number;
  artifacts?: { resultsUrl?: string; hash?: string };
  onChain?: boolean;
  txHash?: string;
  createdAt: number;
  updatedAt: number;
}
