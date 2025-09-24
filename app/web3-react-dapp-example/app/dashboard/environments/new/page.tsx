'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { deployAndRegister } from '@/lib/registry';
import { saveEnvironment } from '@/lib/api';

export default function NewEnvironment() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [envPath, setEnvPath] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [tags, setTags] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  // Templates from GitHub
  type EnvTemplate = { name: string; repoUrl: string; envPath: string; htmlUrl?: string };
  type ConfigTemplate = { name: string; path: string; htmlUrl?: string; downloadUrl?: string };
  const [envTemplates, setEnvTemplates] = useState<EnvTemplate[]>([]);
  const [configTemplates, setConfigTemplates] = useState<ConfigTemplate[]>([]);
  const [selectedEnvTemplate, setSelectedEnvTemplate] = useState<string>('');
  const [selectedConfigTemplate, setSelectedConfigTemplate] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/templates', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load templates');
        const data = await res.json();
        if (cancelled) return;
        setEnvTemplates(data?.verifiers || []);
        setConfigTemplates(data?.primeRl || []);
      } catch (e: any) {
        // Non-fatal: allow manual input
        console.warn('template load error', e?.message || e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!authenticated) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '24px auto' }}>
        <h2>Sign in required</h2>
        <p style={{ opacity: 0.8 }}>Please sign in with Privy (wallet or OAuth) to continue.</p>
        <Button variant="accent" onClick={() => login()}>
          Sign in with Privy
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 12px' }}>Create Environment</h2>
      <p style={{ opacity: 0.85 }}>Signed in as <strong>{primaryAddress ?? 'user'}</strong></p>

      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Template pickers */}
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Environment Template (Verifiers)</div>
            <select
              value={selectedEnvTemplate}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedEnvTemplate(val);
                const t = envTemplates.find((x) => x.name === val);
                if (t) {
                  setRepoUrl(t.repoUrl);
                  setEnvPath(t.envPath);
                  if (!name) setName(t.name.replace(/[_-]/g, ' '));
                  if (!slug) setSlug(t.name);
                }
              }}
              style={inputStyle}
            >
              <option value="">— Select a template (optional) —</option>
              {envTemplates.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Config Template (prime-rl) — optional</div>
            <select
              value={selectedConfigTemplate}
              onChange={(e) => setSelectedConfigTemplate(e.target.value)}
              style={inputStyle}
            >
              <option value="">— None —</option>
              {configTemplates.map((c) => (
                <option key={c.path} value={c.path}>{c.name}</option>
              ))}
            </select>
          </label>

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
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Environment Path in Repo (e.g. environments/math_python)</div>
            <input value={envPath} onChange={(e) => setEnvPath(e.target.value)} placeholder="environments/example" style={inputStyle} />
          </label>
          <label>
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Commit Hash (optional)</div>
            <input value={commitHash} onChange={(e) => setCommitHash(e.target.value)} placeholder="git commit SHA (optional)" style={inputStyle} />
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
            <Button variant="accent" isLoading={pending} disabled={pending} onClick={async () => {
              if (!slug || !name) return;
              try {
                setPending(true);
                setStatus('Preparing deployment...');

                // Generate values
                let envId_deploy = slug; // owner/slug style supported
                const envPathValue = envPath || (slug ? `environments/${slug.split('/').slice(-1)[0]}` : 'env/path');
                const commitHashValue = commitHash || randomHex(16);
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
                      envId_deploy,
                      repoUrl: repoUrl || '',
                      envPath: envPathValue,
                      commitHash: commitHashValue,
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
                  let envId = slug;
                  // Deploy (if bytecode provided) and register via wallet
                  const provider = await wallets[0]?.getEthereumProvider?.();
                  if (!provider) {
                    throw new Error('No EIP-1193 provider from wallet. Ensure a wallet is connected or enable server signer.');
                  }
                  const res = await deployAndRegister({
                    envId,
                    repoUrl: repoUrl || '',
                    envPath: envPathValue,
                    commitHash: commitHashValue,
                    metadataCID,
                    provider,
                  });
                  registryAddress = res.registryAddress;
                  registerTxHash = res.registerTxHash as string;
                  deployTxHash = res.deployTxHash as string | undefined;
                  setStatus(`Registered. Tx: ${registerTxHash}`);
                }

                // Persist to backend via API (S3 via infra) and fallback to localStorage
                const nowIso = new Date().toISOString();
                const nowSec = Math.floor(Date.now() / 1000);
                const userId = primaryAddress ?? 'demo-user';
                const envId = slug; // owner/slug
                const envDto = {
                  envId,
                  name,
                  description: desc,
                  tags: (tags || '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                  repoUrl: repoUrl || undefined,
                  commit: commitHashValue,
                  createdAt: nowSec,
                  updatedAt: nowSec,
                  // extra fields tolerated by backend
                  owner: primaryAddress ?? 'user',
                  slug,
                  registryAddress,
                  registerTxHash,
                  deployTxHash,
                  envPath: envPathValue,
                  template: selectedEnvTemplate || undefined,
                  configTemplate: selectedConfigTemplate || undefined,
                  version: '0.1.0',
                  stars: 0,
                  userId,
                } as any;

                try {
                  await saveEnvironment(envDto);
                } catch (e) {
                  // Fallback to localStorage if backend save fails
                  const key = `my_envs_${userId}`;
                  const prev = JSON.parse(localStorage.getItem(key) || '[]');
                  const next = [envDto, ...prev];
                  localStorage.setItem(key, JSON.stringify(next));
                }

                setSaved(nowIso);
                setLastTx(registerTxHash || null);
              } catch (e: any) {
                console.error('save error', e);
                setStatus(e?.message || 'Error');
                // Persist a draft to backend even if on-chain registration failed
                try {
                  const nowIso = new Date().toISOString();
                  const nowSec = Math.floor(Date.now() / 1000);
                  const userId = primaryAddress ?? 'demo-user';
                  const envId = slug;
                  const envPathValue2 = envPath || (slug ? `environments/${slug.split('/').slice(-1)[0]}` : 'env/path');
                  const commitHashValue2 = commitHash || randomHex(16);
                  const envDto = {
                    envId,
                    name,
                    description: desc,
                    tags: (tags || '')
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                    repoUrl: repoUrl || undefined,
                    commit: commitHashValue2,
                    createdAt: nowSec,
                    updatedAt: nowSec,
                    owner: primaryAddress ?? 'user',
                    slug,
                    envPath: envPathValue2,
                    version: '0.1.0',
                    stars: 0,
                    userId,
                    status: 'draft',
                  } as any;
                  await saveEnvironment(envDto);
                  setSaved(nowIso);
                } catch {
                  // ignore secondary failure
                }
              } finally {
                setPending(false);
              }
            }}>Save</Button>
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
