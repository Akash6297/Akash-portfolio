import 'server-only';
import { githubUsername } from '@/data/socials';
import snapshot from '@/data/github-snapshot.json';

export interface GitHubRepo {
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  fork: boolean;
  pushedAt: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  commits: number | null;
  ref: string | null;
  refType: string | null;
  action: string | null;
}

export interface GitHubData {
  source: 'live' | 'snapshot';
  fetchedAt: string;
  publicRepos: number;
  profileUrl: string;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  languages: Array<{ name: string; count: number }>;
}

const REVALIDATE_SECONDS = 60 * 60; // the GitHub section refreshes at most once an hour

async function request<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-site',
  };
  // Server-only token: never exposed to the browser.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

type ApiRepo = {
  name: string; description: string | null; html_url: string; homepage: string | null;
  language: string | null; stargazers_count: number; fork: boolean; pushed_at: string;
};
type ApiEvent = {
  id: string; type: string; repo: { name: string }; created_at: string;
  payload?: { commits?: unknown[]; size?: number; ref?: string | null; ref_type?: string; action?: string };
};
type ApiUser = { public_repos: number; html_url: string };

function summarise(repos: GitHubRepo[]) {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.fork || !repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export async function getGitHubData(): Promise<GitHubData> {
  try {
    const [user, apiRepos, apiEvents] = await Promise.all([
      request<ApiUser>(`/users/${githubUsername}`),
      request<ApiRepo[]>(`/users/${githubUsername}/repos?per_page=100&sort=pushed`),
      request<ApiEvent[]>(`/users/${githubUsername}/events/public?per_page=30`),
    ]);
    const repos: GitHubRepo[] = apiRepos.map((r) => ({
      name: r.name, description: r.description, htmlUrl: r.html_url, homepage: r.homepage || null,
      language: r.language, stars: r.stargazers_count, fork: r.fork, pushedAt: r.pushed_at,
    }));
    const events: GitHubEvent[] = apiEvents.map((e) => ({
      id: e.id, type: e.type, repo: e.repo.name, createdAt: e.created_at,
      commits: e.payload?.commits?.length ?? e.payload?.size ?? null,
      ref: e.payload?.ref ?? null, refType: e.payload?.ref_type ?? null, action: e.payload?.action ?? null,
    }));
    return {
      source: 'live',
      fetchedAt: new Date().toISOString(),
      publicRepos: user.public_repos,
      profileUrl: user.html_url,
      repos,
      events,
      languages: summarise(repos),
    };
  } catch (error) {
    console.warn('[github] falling back to snapshot:', (error as Error).message);
    const repos = snapshot.repos as GitHubRepo[];
    return {
      source: 'snapshot',
      fetchedAt: snapshot.fetchedAt,
      publicRepos: snapshot.user.publicRepos,
      profileUrl: snapshot.user.htmlUrl,
      repos,
      events: snapshot.events as GitHubEvent[],
      languages: summarise(repos),
    };
  }
}

/** Human-readable description of a public event, or null for events we don't show. */
export function describeEvent(event: GitHubEvent) {
  const repo = event.repo.split('/')[1] ?? event.repo;
  switch (event.type) {
    case 'PushEvent':
      return { verb: 'Pushed to', repo, detail: event.commits ? `${event.commits} commit${event.commits > 1 ? 's' : ''}` : null };
    case 'CreateEvent':
      return { verb: event.refType === 'repository' ? 'Created repository' : `Created ${event.refType ?? 'ref'} in`, repo, detail: event.refType !== 'repository' ? event.ref : null };
    case 'ReleaseEvent':
      return { verb: 'Published a release in', repo, detail: null };
    case 'PullRequestEvent':
      return { verb: `${event.action === 'closed' ? 'Closed' : 'Opened'} a pull request in`, repo, detail: null };
    case 'IssuesEvent':
      return { verb: `${event.action === 'closed' ? 'Closed' : 'Opened'} an issue in`, repo, detail: null };
    case 'WatchEvent':
      return { verb: 'Starred', repo: event.repo, detail: null };
    case 'ForkEvent':
      return { verb: 'Forked', repo: event.repo, detail: null };
    default:
      return null;
  }
}
