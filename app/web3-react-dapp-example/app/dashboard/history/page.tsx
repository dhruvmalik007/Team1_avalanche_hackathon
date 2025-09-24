'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallets } from '@privy-io/react-auth';
import type { RunRecord } from '@rlhub/api-types';
import { listUserRuns } from '@/lib/api';
import { timeAgo } from '@/lib/time';

export default function HistoryPage() {
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;
  const userId = primaryAddress || 'demo-user';

  const [items, setItems] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    

    async function load() {
      try {
        const data = await listUserRuns(userId, 50);
        if (cancelled) return;
        setItems(data);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load history');
        setLoading(false);
      }
    }

    load();
    // Refresh periodically to pick up new runs
    const timer = setInterval(load, 3000);
    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, [userId]);

  const rows = useMemo(() => items.map((r) => ({
    runId: r.runId,
    envId: r.envId,
    status: r.status,
    score: r.score ?? null,
    createdAt: r.createdAt,
  })), [items]);

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px' }}>Run History</h2>
      {loading && <div className="card">Loading…</div>}
      {error && <div className="card" style={{ color: '#f87171' }}>Error: {error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="card">No runs found yet. Go to <Link className="link" href="/dashboard/environments">Environments</Link> to start a run.</div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                <th style={{ padding: '8px 6px' }}>Run ID</th>
                <th style={{ padding: '8px 6px' }}>Environment</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Score</th>
                <th style={{ padding: '8px 6px' }}>Created</th>
                <th style={{ padding: '8px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const [owner, slug] = row.envId.split('/');
                return (
                  <tr key={row.runId} style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <td style={{ padding: '8px 6px', fontFamily: 'monospace' }}>{row.runId.slice(0, 10)}…</td>
                    <td style={{ padding: '8px 6px' }}>
                      <Link className="link" href={`/dashboard/environments/${owner}/${slug}`}>{row.envId}</Link>
                    </td>
                    <td style={{ padding: '8px 6px' }}>{row.status}</td>
                    <td style={{ padding: '8px 6px' }}>{row.score != null ? row.score : '—'}</td>
                    <td style={{ padding: '8px 6px' }}>{timeAgo(new Date(row.createdAt * 1000).toISOString())}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <Link className="btn" href={`/dashboard/runs/${row.runId}`}>Open</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
