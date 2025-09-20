'use client';

import { useParams } from 'next/navigation';
import { environments } from '../../../../../lib/environments';

export default function EnvironmentDetails() {
  const params = useParams();
  const owner = String(params.owner);
  const slug = String(params.slug);
  const env = environments.find((e) => e.owner === owner && e.slug === slug);

  if (!env) {
    return <div>Environment not found.</div>;
  }

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px' }}>{env.name}</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ opacity: 0.9, marginBottom: 8 }}>{env.description}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {env.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>Author</div>
            <div>@{env.owner}</div>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>Version</div>
            <div>{env.version}</div>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: 12 }}>Stars</div>
            <div>★ {env.stars}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
