'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { environments as initialData, Environment } from '@/lib/environments';
import { useRouter } from 'next/navigation';

export default function EnvironmentsHub() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) return initialData;
    const q = query.toLowerCase();
    return initialData.filter((e) =>
      [e.name, e.description, e.owner, e.slug, ...e.tags].some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div>
      <h1 style={{ margin: '8px 0 12px' }}>Explore Environments</h1>

      <div className="topbar" style={{ position: 'static', border: 'none', background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search environments..."
            style={{
              height: 36,
              background: '#141417',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 8,
              color: 'white',
              padding: '0 12px',
              width: 280,
            }}
          />
        </div>
      </div>

      <div className="grid">
        {filtered.map((env) => (
          <div
            className="card"
            key={`${env.owner}/${env.slug}`}
            onClick={() => router.push(`/dashboard/environments/${env.owner}/${env.slug}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: '#6d28d9' }} />
              {env.name}
            </div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>{env.description}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {env.tags.slice(0, 3).map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, marginTop: 12 }}>
              <span>Version {env.version}</span>
              <span>★ {env.stars}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <Link className="btn btn-accent" href="/dashboard/environments/new">
          Create Environment
        </Link>
      </div>
    </div>
  );
}
