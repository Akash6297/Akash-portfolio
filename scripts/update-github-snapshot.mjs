// Refreshes src/data/github-snapshot.json — the fallback the GitHub section shows if the
// live API is unreachable or rate-limited at build/revalidation time.
//
//   node scripts/update-github-snapshot.mjs

import { writeFile } from 'node:fs/promises';

const USER = 'Akash6297';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-snapshot' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const get = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
};

const [user, repos, events] = await Promise.all([
  get(`/users/${USER}`),
  get(`/users/${USER}/repos?per_page=100&sort=pushed`),
  get(`/users/${USER}/events/public?per_page=30`),
]);

const snapshot = {
  fetchedAt: new Date().toISOString(),
  user: { publicRepos: user.public_repos, htmlUrl: user.html_url },
  repos: repos.map((r) => ({
    name: r.name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage || null,
    language: r.language,
    stars: r.stargazers_count,
    fork: r.fork,
    pushedAt: r.pushed_at,
  })),
  events: events.map((e) => ({
    id: e.id,
    type: e.type,
    repo: e.repo.name,
    createdAt: e.created_at,
    commits: e.payload?.commits?.length ?? e.payload?.size ?? null,
    ref: e.payload?.ref ?? null,
    refType: e.payload?.ref_type ?? null,
    action: e.payload?.action ?? null,
  })),
};

await writeFile('src/data/github-snapshot.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Saved ${snapshot.repos.length} repos and ${snapshot.events.length} events.`);
