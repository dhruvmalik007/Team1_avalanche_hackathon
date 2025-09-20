export type RepoMeta = {
  name: string;
  full_name: string;
  description?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  default_branch: string;
  owner: { login: string; avatar_url?: string };
};

export type RepoTag = { name: string; commit: { sha: string; url: string } };

export type RepoContent = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
};

const GITHUB_API = 'https://api.github.com';

export function headers() {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchRepoMeta(owner: string, repo: string): Promise<RepoMeta | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: headers(), cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as RepoMeta;
  } catch {
    return null;
  }
}

export async function fetchRepoTags(owner: string, repo: string): Promise<RepoTag[]> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/tags`, { headers: headers(), cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as RepoTag[];
  } catch {
    return [];
  }
}

export async function listRepoContents(owner: string, repo: string, path = '', ref?: string): Promise<RepoContent[]> {
  try {
    const enc = path ? `/${encodeURIComponent(path)}` : '';
    const q = ref ? `?ref=${encodeURIComponent(ref)}` : '';
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents${enc}${q}`, { headers: headers(), cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as RepoContent[];
  } catch {
    return [];
  }
}

export function parseGithubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export async function fetchFileRaw(downloadUrl: string): Promise<string> {
  try {
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}
