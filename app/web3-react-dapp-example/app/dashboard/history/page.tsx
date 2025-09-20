'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallets } from '@privy-io/react-auth';
import { timeAgo } from '../../../lib/time';
import { RlHubClient } from '@rlhub/api-client';

type Run = {
  runId: string;
  envId: string;
  name: string;
  status: string;
  score?: number;
  artifactsHash?: string;
  createdAt: string;
};

export default function HistoryPage() {
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    if (!primaryAddress) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    (async () => {
      if (apiBase) {
        try {
          const client = new RlHubClient(apiBase);
          const data = await client.listUserRuns(primaryAddress, 50);
          const mapped: Run[] = data.map((r) => ({
            runId: r.runId,
            envId: r.envId,
            name: r.envId,
            status: r.status,
            score: r.score,
            artifactsHash: r.artifacts?.hash,
            createdAt: String(r.createdAt > 1e12 ? r.createdAt : r.createdAt * 1000),
          }));
          setRuns(mapped);
          return;
        } catch (e) {
          console.warn('Falling back to local history', e);
        }
      }
      try {
        const key = `my_runs_${primaryAddress}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        setRuns(data);
      } catch {}
    })();
  }, [primaryAddress]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Run History</h2>
      {!primaryAddress ? (
        <div className="card">Sign in to view your history.</div>
      ) : runs.length === 0 ? (
        <div className="card">No runs yet. Open an environment and click <em>Run Eval (demo)</em> to create one.</div>
      ) : (
        <div className="grid">
          {runs.map((r) => (
            <div className="card" key={r.runId}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>{r.name || r.envId}</div>
                <span className="tag">{r.status}</span>
              </div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>Run ID: <span style={{ fontFamily: 'monospace' }}>{r.runId}</span></div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>Score: {r.score ?? '—'}</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>Created {timeAgo(r.createdAt)}</div>
              <div style={{ marginTop: 10 }}>
                <Link className="btn" href={`/dashboard/environments/${r.envId}`}>Open Environment</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
