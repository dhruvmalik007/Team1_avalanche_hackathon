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
