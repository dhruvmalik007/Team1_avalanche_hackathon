import { environments } from '@/lib/environments';
import { parseGithubRepo, fetchRepoMeta, fetchRepoTags, listRepoContents } from '@/lib/github';
import EnvironmentDetailsClient from '@/components/environments/EnvironmentDetailsClient';

export default async function EnvironmentDetails({ params }: { params: { owner: string; slug: string } }) {
  const env = environments.find((e) => e.owner === params.owner && e.slug === params.slug);
  if (!env) return <div>Environment not found.</div>;

  let repoInfo: { version?: string; lastPush?: string; stars?: number } | undefined
  let files: { name: string; type: string }[] = []
  const parsed = parseGithubRepo(env.repoUrl)
  if (parsed) {
    const [meta, tags, contents] = await Promise.all([
      fetchRepoMeta(parsed.owner, parsed.repo),
      fetchRepoTags(parsed.owner, parsed.repo),
      listRepoContents(parsed.owner, parsed.repo),
    ])
    repoInfo = { version: tags[0]?.name || env.version, lastPush: meta?.pushed_at, stars: meta?.stargazers_count }
    files = contents.map((c) => ({ name: c.name, type: c.type }))
  }

  return (
    <EnvironmentDetailsClient env={env} repoInfo={repoInfo} files={files} />
  )
}
