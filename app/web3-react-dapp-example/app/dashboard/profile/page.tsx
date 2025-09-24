'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { timeAgo } from '@/lib/time';
import { parseGithubRepo, fetchRepoMeta, fetchRepoTags } from '@/lib/github';
import { listUserEnvironments } from '@/lib/api';

type MyEnv = {
  envId?: string; // owner/slug
  owner?: string;
  slug?: string;
  name: string;
  description?: string;
  tags: string[];
  stars?: number;
  version?: string;
  updatedAt: string | number;
  repoUrl?: string;
  // Optional on-chain fields
  registryAddress?: string;
  registerTxHash?: string;
  deployTxHash?: string;
};

type RepoInfo = {
  version?: string;
  lastPush?: string;
  stars?: number;
};

export default function ProfilePage() {
  const { user, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const [myEnvs, setMyEnvs] = useState<MyEnv[]>([]);
  const displayName = user?.email?.address || primaryAddress || 'user';

  useEffect(() => {
    if (!primaryAddress) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await listUserEnvironments(primaryAddress, 100);
        if (cancelled) return;
        // Normalize into MyEnv shape
        const norm: MyEnv[] = (data || []).map((e: any) => ({
          envId: e.envId,
          owner: e.owner,
          slug: e.slug,
          name: e.name,
          description: e.description,
          tags: e.tags || [],
          stars: e.stars ?? 0,
          version: e.version || '0.1.0',
          updatedAt: e.updatedAt || Date.now(),
          repoUrl: e.repoUrl,
          registryAddress: e.registryAddress,
          registerTxHash: e.registerTxHash,
          deployTxHash: e.deployTxHash,
        }));
        setMyEnvs(norm);
      } catch {
        // Fallback to localStorage if backend is not configured
        try {
          const key = `my_envs_${primaryAddress}`;
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          setMyEnvs(data);
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [primaryAddress]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div className="card" style={{ width: 280, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 96, height: 96, borderRadius: 999, background: '#222' }} />
            <div style={{ fontWeight: 800, fontSize: 20 }}>{displayName}</div>
            <div style={{ opacity: 0.8, fontFamily: 'monospace' }}>{primaryAddress ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}` : ''}</div>
            {!authenticated && (
              <button className="btn btn-accent" onClick={() => login()}>Sign In</button>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Environments</h2>
          {myEnvs.length === 0 ? (
            <div className="card">No environments saved yet. Create one from <Link className="link" href="/dashboard/environments/new">New Environment</Link>.</div>
          ) : (
            <div className="grid">
              {myEnvs.map((env) => (
                <EnvCard key={`${env.owner}/${env.slug}`} env={env} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EnvCard({ env }: { env: MyEnv }) {
  const [repoInfo, setRepoInfo] = useState<RepoInfo>({});
  const explorerBase = process.env.NEXT_PUBLIC_EXPLORER_BASE;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const parsed = parseGithubRepo(env.repoUrl);
      if (!parsed) return;
      const meta = await fetchRepoMeta(parsed.owner, parsed.repo);
      const tags = await fetchRepoTags(parsed.owner, parsed.repo);
      if (cancelled) return;
      const latestTag = tags[0]?.name;
      setRepoInfo({
        version: latestTag || env.version,
        lastPush: meta?.pushed_at,
        stars: meta?.stargazers_count,
      });
    })();
    return () => { cancelled = true; };
  }, [env.repoUrl, env.version]);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: '#6d28d9' }} />
        {env.name}
      </div>
      <div style={{ opacity: 0.85, marginTop: 4 }}>{env.description}</div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {env.tags.map((t) => (
          <span className="tag" key={t}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85, marginTop: 10 }}>
        <span>Version {repoInfo.version || env.version}</span>
        <span>★ {repoInfo.stars ?? env.stars}</span>
      </div>
      <div style={{ opacity: 0.7, marginTop: 4 }}>
        Updated {repoInfo.lastPush ? timeAgo(repoInfo.lastPush) : timeAgo(env.updatedAt)}
      </div>
      {(env.registryAddress || env.registerTxHash || env.deployTxHash) && explorerBase && (
        <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {env.registryAddress && (
            <Link className="link" href={`${explorerBase}/address/${env.registryAddress}`} target="_blank">Registry</Link>
          )}
          {env.registerTxHash && (
            <Link className="link" href={`${explorerBase}/tx/${env.registerTxHash}`} target="_blank">Register Tx</Link>
          )}
          {env.deployTxHash && (
            <Link className="link" href={`${explorerBase}/tx/${env.deployTxHash}`} target="_blank">Deploy Tx</Link>
          )}
        </div>
      )}
      {env.repoUrl && (
        <div style={{ marginTop: 10 }}>
          <Link className="link" href={env.repoUrl} target="_blank">View Repository</Link>
        </div>
      )}
    </div>
  );
}
