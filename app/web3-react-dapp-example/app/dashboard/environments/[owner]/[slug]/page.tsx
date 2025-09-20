'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { environments } from '../../../../../lib/environments';
import { parseGithubRepo, fetchRepoMeta, fetchRepoTags, listRepoContents } from '../../../../../lib/github';
import { timeAgo } from '../../../../../lib/time';

export default function EnvironmentDetails() {
  const { owner, slug } = useParams<{ owner: string; slug: string }>();
  const env = environments.find((e) => e.owner === owner && e.slug === slug);
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const [repoInfo, setRepoInfo] = useState<{ version?: string; lastPush?: string; stars?: number }>();
  const [files, setFiles] = useState<{ name: string; type: string }[]>([]);

  if (!env) {
    return <div>Environment not found.</div>;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const parsed = parseGithubRepo(env.repoUrl);
      if (parsed) {
        const meta = await fetchRepoMeta(parsed.owner, parsed.repo);
        const tags = await fetchRepoTags(parsed.owner, parsed.repo);
        const contents = await listRepoContents(parsed.owner, parsed.repo);
        if (cancelled) return;
        setRepoInfo({ version: tags[0]?.name || env.version, lastPush: meta?.pushed_at, stars: meta?.stargazers_count });
        setFiles(contents.map((c) => ({ name: c.name, type: c.type })));
      }
    })();
    return () => { cancelled = true; };
  }, [env.repoUrl, env.version]);

  function runDemo() {
    try {
      const user = primaryAddress ?? 'user';
      const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const key = `my_runs_${user}`;
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const rec = {
        runId,
        envId: `${env.owner}/${env.slug}`,
        name: env.name,
        status: 'COMPLETED',
        score: Math.round(Math.random() * 1000) / 1000,
        artifactsHash: 'demo-hash',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([rec, ...prev]));
      alert('Demo run recorded in your History.');
    } catch (e) {
      console.error(e);
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
                <button className="btn btn-accent" onClick={runDemo}>Run Eval (demo)</button>
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
