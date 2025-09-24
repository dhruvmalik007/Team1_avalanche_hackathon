"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import type { Environment } from '@/lib/environments';
import { timeAgo } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { submitRun } from '@/lib/api';

export default function EnvironmentDetailsClient(
  { env, repoInfo, files }: { env: Environment; repoInfo?: { version?: string; lastPush?: string; stars?: number }; files: { name: string; type: string }[] }
) {
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  async function runEval() {
    try {
      setSubmitting(true);
      const envId = `${env.owner}/${env.slug}`;
      const userId = primaryAddress || 'demo-user';
      const resp = await submitRun({ envId, onChain: false, params: { n: 10, rollouts: 1 }, userId });
      router.push(`/dashboard/runs/${encodeURIComponent(resp.runId)}`);
    } catch (e) {
      console.error(e);
      alert('Failed to start run.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px' }}>{env.name}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr', gap: 16 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ opacity: 0.9, marginBottom: 8 }}>{env.description}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {env.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ opacity: 0.6, fontSize: 12 }}>Author</div>
                  <div>@{env.owner}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6, fontSize: 12 }}>Version</div>
                  <div>{repoInfo?.version || env.version}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6, fontSize: 12 }}>Stars</div>
                  <div>★ {repoInfo?.stars ?? env.stars}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="accent" onClick={runEval} isLoading={isSubmitting} disabled={isSubmitting}>
                  Run Eval
                </Button>
                {env.repoUrl && (
                  <Link className="btn" href={env.repoUrl} target="_blank">Open Repo</Link>
                )}
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Files</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {files.slice(0, 10).map((f) => (
                  <li key={f.name} style={{ opacity: 0.9 }}>{f.type === 'dir' ? '📁' : '📄'} {f.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>About</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><span style={{ opacity: 0.6 }}>Last Modified:</span> {repoInfo?.lastPush ? timeAgo(repoInfo.lastPush) : timeAgo(env.updatedAt)}</div>
              <div><span style={{ opacity: 0.6 }}>Version:</span> {repoInfo?.version || env.version}</div>
              <div><span style={{ opacity: 0.6 }}>Repo:</span> {env.repoUrl ? <Link className="link" href={env.repoUrl} target="_blank">{env.repoUrl}</Link> : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
