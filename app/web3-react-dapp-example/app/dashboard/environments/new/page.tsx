'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import Link from 'next/link';
import { deployAndRegister } from '../../../../lib/registry';

export default function NewEnvironment() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tags, setTags] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  if (!authenticated) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '24px auto' }}>
        <h2>Sign in required</h2>
        <p style={{ opacity: 0.8 }}>Please sign in with Privy (wallet or OAuth) to continue.</p>
        <button className="btn btn-accent" onClick={() => login()}>
          Sign in with Privy
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 12px' }}>Create Environment</h2>
      <p style={{ opacity: 0.85 }}>Signed in as <strong>{primaryAddress ?? 'user'}</strong></p>

      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My cool env" style={inputStyle} />
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Slug</div>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="owner/slug" style={inputStyle} />
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Repository URL (optional)</div>
            <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" style={inputStyle} />
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Tags (comma separated)</div>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="math, eval, train" style={inputStyle} />
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Description</div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description..." style={{ ...inputStyle, minHeight: 120 }} />
          </label>
          <div>
            <button className="btn btn-accent" disabled={pending} onClick={async () => {
              if (!slug || !name) return;
              try {
                setPending(true);
                setStatus('Preparing deployment...');

                // Generate simple defaults
                const envId = slug; // owner/slug style supported
                const envPath = slug || 'env/path';
                const commitHash = randomHex(16);
                const metadataCID = `bafy${randomHex(10)}`;

                // Choose server-signer vs client wallet flow
                const useServer = process.env.NEXT_PUBLIC_USE_SERVER_SIGNER === '1';
                let registryAddress: string | undefined;
                let registerTxHash: string;
                let deployTxHash: string | undefined;

                if (useServer) {
                  const resp = await fetch('/api/registry/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      envId,
                      repoUrl: repoUrl || '',
                      envPath,
                      commitHash,
                      metadataCID,
                      registryAddress: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
                    }),
                  });
                  if (!resp.ok) throw new Error(await resp.text());
                  const data = await resp.json();
                  registryAddress = data.registryAddress;
                  registerTxHash = data.registerTxHash;
                  setStatus(`Registered. Tx: ${registerTxHash}`);
                } else {
                  // Deploy (if bytecode provided) and register via wallet
                  const res = await deployAndRegister({
                    envId,
                    repoUrl: repoUrl || '',
                    envPath,
                    commitHash,
                    metadataCID,
                  });
                  registryAddress = res.registryAddress;
                  registerTxHash = res.registerTxHash as string;
                  deployTxHash = res.deployTxHash as string | undefined;
                  setStatus(`Registered. Tx: ${registerTxHash}`);
                }

                // Persist to profile format (extra fields tolerated)
                const now = new Date().toISOString();
                const item = {
                  owner: primaryAddress ?? 'user',
                  slug,
                  name,
                  description: desc,
                  tags: (tags || '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                  stars: 0,
                  version: '0.1.0',
                  updatedAt: now,
                  repoUrl: repoUrl || undefined,
                  registryAddress,
                  registerTxHash,
                  deployTxHash,
                  commitHash,
                  envPath,
                };
                const key = `my_envs_${primaryAddress ?? 'user'}`;
                const prev = JSON.parse(localStorage.getItem(key) || '[]');
                const next = [item, ...prev];
                localStorage.setItem(key, JSON.stringify(next));
                setSaved(now);
                setLastTx(registerTxHash || null);
              } catch (e: any) {
                console.error('save error', e);
                setStatus(e?.message || 'Error');
              } finally {
                setPending(false);
              }
            }}>Save</button>
            {pending && (
              <div style={{ marginTop: 10, opacity: 0.85 }}>Deploying & registering on-chain... {status}</div>
            )}
            {saved && !pending && (
              <div style={{ marginTop: 10, opacity: 0.85 }}>
                Saved! View it on your <Link className="link" href="/dashboard/profile">Profile</Link>.
                {process.env.NEXT_PUBLIC_EXPLORER_BASE && lastTx && (
                  <>
                    {' '}•{' '}
                    <Link className="link" href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE}/tx/${lastTx}`} target="_blank">View Tx</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 40,
  padding: '0 12px',
  background: '#141417',
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 8,
  color: 'white',
  width: '100%'
};

function onSave(
  { name, slug, desc, repoUrl, tags, owner }: { name: string; slug: string; desc: string; repoUrl?: string; tags?: string; owner: string },
  setSaved: (s: string) => void
) {
  const now = new Date().toISOString();
  const item = {
    owner,
    slug,
    name,
    description: desc,
    tags: (tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    stars: 0,
    version: '0.1.0',
    updatedAt: now,
    repoUrl: repoUrl || undefined,
  };
  try {
    const key = `my_envs_${owner}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [item, ...prev];
    localStorage.setItem(key, JSON.stringify(next));
    setSaved(now);
  } catch (e) {
    console.error('save error', e);
  }
}

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(arr);
  else for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
