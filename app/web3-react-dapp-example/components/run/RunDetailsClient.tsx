"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RunRecord } from '@rlhub/api-types';
import { getRun } from '@/lib/api';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import ProgressArea, { type ProgressPoint } from '@/components/charts/ProgressArea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function RunDetailsClient({ runId, initial }: { runId: string; initial: RunRecord | null }) {
  const [run, setRun] = useState<RunRecord | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const savedOnce = useRef(false);
  const [series, setSeries] = useState<ProgressPoint[]>(() => {
    const base = initial?.progress?.pct ?? (initial?.status === 'COMPLETED' ? 100 : 0);
    const pct0 = Math.max(0, Math.min(100, base));
    return initial ? [{ t: Date.now(), pct: pct0, msg: initial.progress?.msg || initial.status }] : [];
  });

  const isDone = run?.status === 'COMPLETED' || run?.status === 'FAILED';

  useEffect(() => {
    let cancelled = false;
    let timer: any;

    async function tick() {
      try {
        const data = await getRun(runId);
        if (cancelled) return;
        setRun(data);
        const pctNew = Math.max(0, Math.min(100, data?.progress?.pct ?? (data?.status === 'COMPLETED' ? 100 : 0)));
        setSeries((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.pct !== pctNew || last.msg !== (data.progress?.msg || data.status)) {
            return [...prev, { t: Date.now(), pct: pctNew, msg: data.progress?.msg || data.status }];
          }
          return prev;
        });
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
          } catch { /* ignore */ }
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

    if (!isDone) tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [runId, isDone]);

  const pct = useMemo(() => Math.max(0, Math.min(100, run?.progress?.pct ?? (run?.status === 'COMPLETED' ? 100 : 0))), [run]);

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px' }}>Run Details</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><span style={{ opacity: 0.6 }}>Run ID:</span> <code>{runId}</code></div>
          <div><span style={{ opacity: 0.6 }}>Environment:</span> {run?.envId || initial?.envId || '—'}</div>
          <div><span style={{ opacity: 0.6 }}>Status:</span> {run?.status || initial?.status || 'LOADING'}</div>
          <div>
            <Progress value={pct} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              <span>{run?.progress?.msg || run?.status || initial?.status || '—'}</span>
              <span>{pct}%</span>
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <ProgressArea data={series} />
          </div>
          {((run || initial)?.score != null) && (
            <div><span style={{ opacity: 0.6 }}>Score:</span> {(run || initial)!.score}</div>
          )}
          {((run || initial)?.artifacts?.resultsUrl) && (
            <div>
              <span style={{ opacity: 0.6 }}>Artifacts:</span> <Link className="link" href={(run || initial)!.artifacts!.resultsUrl!} target="_blank">results.json</Link>
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Live Progress</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Live progress for {runId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <ProgressArea data={series} />
                  <Separator />
                  <div>
                    <div className="opacity-70 text-sm mb-2">Updates</div>
                    <ScrollArea className="h-48 w-full rounded-md border border-zinc-800">
                      <div className="p-3 space-y-2">
                        {series.map((pt, i) => (
                          <div key={i} className="text-sm flex items-center justify-between gap-4">
                            <span className="opacity-70">
                              {new Date(pt.t).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="font-mono">{pt.pct}%</span>
                            <span className="truncate" title={pt.msg || ''}>{pt.msg || ''}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div>
        <Link className="btn" href="/dashboard/history">Back to History</Link>
      </div>
      {error && <div className="card" style={{ marginTop: 16, color: '#f87171' }}>Error: {error}</div>}
    </div>
  );
}
