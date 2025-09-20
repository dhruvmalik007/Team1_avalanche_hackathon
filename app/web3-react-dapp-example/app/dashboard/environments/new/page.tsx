'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export default function NewEnvironment() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');

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
            <div style={{ opacity: 0.8, marginBottom: 6 }}>Description</div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description..." style={{ ...inputStyle, minHeight: 120 }} />
          </label>
          <div>
            <button className="btn btn-accent">Save</button>
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
