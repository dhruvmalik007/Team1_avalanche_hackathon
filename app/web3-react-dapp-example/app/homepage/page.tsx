'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { environments } from '@/lib/environments';
import { ArrowRight, Shield, Zap, Boxes, Network, LineChart, Code } from 'lucide-react';

export default function Homepage() {
  const { login, authenticated } = usePrivy();
  const [tab, setTab] = useState<'python' | 'cli' | 'rest'>('python');
  const envCount = environments.length;
  const avgCost = useMemo(() => {
    const costs = environments.map(e => e.costPerRunUSD ?? 0);
    const valid = costs.filter(c => c > 0);
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    return avg.toFixed(2);
  }, []);

  const code = useMemo(() => {
    if (tab === 'python') {
      return `import verifiers as vf
from openai import AsyncOpenAI
client = AsyncOpenAI()
env = vf.load_environment("vf-math-python")
results = await env.evaluate(client=client, model="gpt-4.1-mini", num_examples=10)
# hash artifacts (sha256 of sorted JSON)
import json, hashlib
h = hashlib.sha256(json.dumps(results, sort_keys=True).encode()).hexdigest()
print("artifactsHash:", h)`;
    }
    if (tab === 'cli') {
      return `# install and evaluate
vf-install vf-math-python --from-repo https://github.com/PrimeIntellect-ai/verifiers
vf-eval vf-math-python -m <MODEL_NAME> -n 10 -r 1 -o results.json
# compute artifacts hash
jq -S . results.json | shasum -a 256 | awk '{print $1}'`;
    }
    return `// submit a run (frontend)
const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/runs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <Privy JWT>',
  },
  body: JSON.stringify({
    envId: 'vf-math-python',
    commit: '<git sha>',
    params: { n: 10, rollouts: 1 },
    onChain: true,
  }),
});
const data = await res.json();
console.log('runId', data.runId);`;
  }, [tab]);

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-purple-950/40 to-transparent p-8 md:p-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300">
            Avalanche VM RL Hub
            <span className="h-1 w-1 rounded-full bg-[#6d28d9]" />
            Verifiable Receipts On-Chain
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
              Train. Evaluate. Verify.
            </span>{' '}
            Reinforcement Learning on Avalanche.
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-300">
            Launch and verify RL environment runs with Prime Intellect verifiers or PRIME‑RL.
            Publish immutable receipts on a Subnet‑EVM L1. Reproduce results with confidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="accent" asChild>
              <Link href="/dashboard/environments" className="inline-flex items-center gap-2">
                Explore Environments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!authenticated && (
              <Button variant="outline" onClick={() => login()}>
                Sign in with Privy
              </Button>
            )}
            <Link href="/dashboard/environments/new" className="text-sm text-zinc-400 underline-offset-4 hover:underline">
              Register an environment
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof / marquee */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {['Prime Intellect', 'Avalanche', 'Privy', ...environments.map(e => e.name)].slice(0, 8).map((label, i) => (
            <span
              key={i}
              className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-violet-400" /> Verifiable results
            </CardTitle>
            <CardDescription>Immutable receipts record commit, artifacts hash and score on-chain.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-300">
            Anyone can rerun to reproduce. Optional verifier signatures strengthen trust.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Network className="h-5 w-5 text-violet-400" /> Avalanche‑ready
            </CardTitle>
            <CardDescription>Create an L1 in minutes with Avalanche‑CLI and deploy a simple registry.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-300">
            Subnet‑EVM compatibility keeps smart contracts simple and fast.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-violet-400" /> Plug‑and‑play runners
            </CardTitle>
            <CardDescription>Use verifiers CLI or PRIME‑RL; small evals in minutes.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-300">
            Hash artifacts and submit receipts from the UI or backend workflow.
          </CardContent>
        </Card>
      </section>

      {/* Example SDK / Code */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Run an evaluation</h3>
            <p className="text-sm text-zinc-400">Choose your workflow: Python verifiers, CLI, or REST API.</p>
          </div>
          <div className="flex items-center gap-2">
            {([
              { k: 'python', label: 'Python' },
              { k: 'cli', label: 'CLI' },
              { k: 'rest', label: 'REST' },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  tab === t.k
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Example</span>
            </div>
            <span className="rounded bg-zinc-900 px-2 py-0.5">{tab.toUpperCase()}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-200">
            <code>{code}</code>
          </pre>
        </div>
      </section>

      {/* Featured Environments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Featured environments</h3>
          <Link href="/dashboard/environments" className="text-sm text-zinc-400 underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {environments.map((env) => (
            <Card key={env.slug} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{env.name}</CardTitle>
                <CardDescription>{env.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-zinc-300">
                <div className="mb-3 flex flex-wrap gap-2">
                  {env.tags.map((t) => (
                    <span key={t} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span>★ {env.stars}</span>
                  <span>v{env.version}</span>
                  <span>{typeof env.costPerRunUSD === 'number' ? `$${env.costPerRunUSD.toFixed(2)}/run` : '—'}</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between">
                <Link href={`/dashboard/environments/${env.owner}/${env.slug}`} className="text-sm text-violet-300 underline-offset-4 hover:underline">
                  View details
                </Link>
                <Button variant="accent" asChild>
                  <Link href={`/dashboard/environments/${env.owner}/${env.slug}`} className="inline-flex items-center gap-2">
                    Run eval
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Boxes, title: 'Install or register', desc: 'Select an environment, pin a commit and register on-chain.' },
          { icon: LineChart, title: 'Evaluate', desc: 'Run a small eval via verifiers/PRIME‑RL and compute artifact hash.' },
          { icon: Shield, title: 'Submit receipt', desc: 'Publish score and artifacts hash to Avalanche for provenance.' },
        ].map(({ icon: Icon, title, desc }, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-violet-400" /> {title}
              </CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* Stats + CTA */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold">{envCount}</div>
            <div className="text-sm text-zinc-400">Environments</div>
          </div>
          <div>
            <div className="text-3xl font-bold">~${avgCost}</div>
            <div className="text-sm text-zinc-400">Avg. cost per run</div>
          </div>
          <div>
            <div className="text-3xl font-bold">~5 min</div>
            <div className="text-sm text-zinc-400">Chain setup (local)</div>
          </div>
          <div className="flex items-center justify-end">
            <Button variant="accent" asChild>
              <Link href="/dashboard/environments" className="inline-flex items-center gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
