'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { environments } from '../../lib/environments';

export default function Homepage() {
  const { login, authenticated } = usePrivy();

  return (
    <div>
      <section className="hero">
        <div className="marquee" role="list">
          {[...environments, ...environments].map((env, i) => (
            <div className="marquee-item" key={`${env.slug}-${i}`} role="listitem">
              <div className="marquee-dot" />
              <div className="marquee-title">{env.name}</div>
              <div className="marquee-meta">
                <span>★ {env.stars}</span>
                <span>v{env.version}</span>
                <span>
                  {typeof env.costPerRunUSD === 'number' ? `$${env.costPerRunUSD.toFixed(2)}/run` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h1 style={{ margin: '0 0 8px' }}>Avalanche RL Environment Hub</h1>
        <p style={{ opacity: 0.85, margin: '8px 0' }}>
          A hub where users can select an RL environment, run it off‑chain with verifiers and record verifiable
          receipts on an Avalanche L1. Built for a 1‑day hackathon: Next.js App Router + Privy, Subnet‑EVM for
          registry and receipts, and Prime Intellect tooling for evaluation and verification.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <Link className="btn btn-accent" href="/dashboard/environments">
            Explore Environments
          </Link>
          {!authenticated && (
            <button className="btn" onClick={() => login()}>
              Sign in with Privy
            </button>
          )}
        </div>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>What we built</h3>
          <p style={{ opacity: 0.85 }}>
            A Subnet‑EVM based L1 with a simple registry to track environments and on‑chain receipts. Off‑chain runs
            produce results and a hash of artifacts; the hash + score is submitted on‑chain. Anyone can re‑run and
            verify.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>How it works</h3>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
            <li>Login via wallet or OAuth (Privy)</li>
            <li>Pick an environment and install/register on‑chain</li>
            <li>Run a small eval locally using verifiers/prime‑rl</li>
            <li>Submit on‑chain run receipt with score + artifacts hash</li>
            <li>Browse runs and reproduce results</li>
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Stack</h3>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
            <li>Next.js 14 App Router + Turborepo</li>
            <li>Privy auth (wallet / OAuth)</li>
            <li>Avalanche L1 (Subnet‑EVM) via Avalanche‑CLI</li>
            <li>Prime Intellect verifiers / prime‑rl for RL evaluation</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
