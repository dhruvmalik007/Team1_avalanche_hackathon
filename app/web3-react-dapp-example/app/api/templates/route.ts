import { NextResponse } from 'next/server';
import { listRepoContents, type RepoContent } from '../../../lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const verifiersOwner = 'PrimeIntellect-ai';
    const verifiersRepo = 'verifiers';
    const primeRlRepo = 'prime-rl';

    const [verifiersEnvs, primeRlConfigs]: [RepoContent[], RepoContent[]] = await Promise.all([
      listRepoContents(verifiersOwner, verifiersRepo, 'environments'),
      listRepoContents(verifiersOwner, primeRlRepo, 'configs'),
    ]);

    const envTemplates = (verifiersEnvs || [])
      .filter((e: RepoContent) => e.type === 'dir')
      .map((e: RepoContent) => ({
        name: e.name,
        repoUrl: `https://github.com/${verifiersOwner}/${verifiersRepo}`,
        envPath: `environments/${e.name}`,
        htmlUrl: e.html_url,
      }));

    const configTemplates = (primeRlConfigs || [])
      .filter((c: RepoContent) => c.type === 'file' && (c.name.endsWith('.yaml') || c.name.endsWith('.yml') || c.name.endsWith('.json')))
      .map((c: RepoContent) => ({ name: c.name, path: c.path, htmlUrl: c.html_url, downloadUrl: c.download_url }));

    return NextResponse.json({ verifiers: envTemplates, primeRl: configTemplates });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load templates';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
