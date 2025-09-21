'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import type { RunRecord } from '@rlhub/api-types';
import { getRun } from '../../../../lib/api';
import Link from 'next/link';

export default function RunDetailsPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const savedOnce = useRef(false);

  const isDone = run?.status === 'COMPLETED' || run?.status === 'FAILED';

  useEffect(() => {
    let cancelled = false;
    let timer: any;

    async function tick() {
      try {
        const data = await getRun(runId);
        if (cancelled) return;
        setRun(data);
        if (data.status === 'COMPLETED' && !savedOnce.current) {
          try {
            // Save to local history for quick demo access
            const userKey = 'demo-user';
            const key = `my_runs_${userKey}`;
            const prev = JSON.parse(localStorage.getItem(key) || '[]');
            const item = {
              runId: data.runId,
              envId: data.envId,
              status: data.status,
              score: data.score,
              artifactsHash: data.artifacts?.hash,
              createdAt: new Date(data.createdAt * 1000).toISOString(),
            };
            localStorage.setItem(key, JSON.stringify([item, ...prev]));
            savedOnce.current = true;
          } catch {}
        }
        if (data.status !== 'COMPLETED' && data.status !== 'FAILED') {
          timer = setTimeout(tick, 1200);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load run');
        timer = setTimeout(tick, 2000);
      }
    }

    tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [runId]);

  const pct = useMemo(() => Math.max(0, Math.min(100, run?.progress?.pct ?? (run?.status === 'COMPLETED' ? 100 : 0))), [run]);

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px' }}>Run Details</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><span style={{ opacity: 0.6 }}>Run ID:</span> <code>{runId}</code></div>
          <div><span style={{ opacity: 0.6 }}>Environment:</span> {run?.envId || '—'}</div>
          <div><span style={{ opacity: 0.6 }}>Status:</span> {run?.status || 'LOADING'}</div>
          <div>
            <div style={{ height: 10, background: '#222', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#6d28d9' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              <span>{run?.progress?.msg || (run?.status ?? '—')}</span>
              <span>{pct}%</span>
            </div>
          </div>
          {run?.score != null && (
            <div><span style={{ opacity: 0.6 }}>Score:</span> {run.score}</div>
          )}
          {run?.artifacts?.resultsUrl && (
            <div>
              <span style={{ opacity: 0.6 }}>Artifacts:</span> <Link className="link" href={run.artifacts.resultsUrl} target="_blank">results.json</Link>
            </div>
          )}
        </div>
      </div>
      <div>
        <Link className="btn" href="/dashboard/history">Back to History</Link>
      </div>
      {error && <div className="card" style={{ marginTop: 16, color: '#f87171' }}>Error: {error}</div>}
    </div>
  );
}
