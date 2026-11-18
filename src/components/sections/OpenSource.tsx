import { ArrowUpRight, GitCommitHorizontal, Star } from 'lucide-react';
import { getGitHubData, describeEvent } from '@/lib/github';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { timeAgo } from '@/lib/utils';

// Colours for the language bar (GitHub's linguist palette for the common ones).
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', Python: '#3572A5',
  'C++': '#f34b7d', Java: '#b07219', SCSS: '#c6538c', PLpgSQL: '#336790',
};

export async function OpenSource() {
  const data = await getGitHubData();
  const own = data.repos.filter((r) => !r.fork);
  const recent = own.slice(0, 6);
  const events = data.events.map((e) => ({ e, d: describeEvent(e) })).filter((x) => x.d).slice(0, 6);
  const total = data.languages.reduce((n, l) => n + l.count, 0);
  const top = data.languages.slice(0, 6);
  const other = total - top.reduce((n, l) => n + l.count, 0);

  return (
    <section id="open-source" aria-labelledby="oss-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="oss-title"
          index="05"
          label="Open source"
          title={<>Building in <em className="italic">public</em>.</>}
          intro={
            <>
              Live from the GitHub API, refreshed hourly.{' '}
              {data.source === 'snapshot' && (
                <span className="text-subtle">GitHub was unreachable at the last refresh, so this shows a snapshot from {new Date(data.fetchedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</span>
              )}
            </>
          }
        />

        <div data-reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-12">
          {/* Summary */}
          <div className="bg-bg p-6 sm:p-8 lg:col-span-4">
            <p className="label-mono">Public repositories</p>
            <p className="font-display mt-3 text-7xl text-fg">{data.publicRepos}</p>
            <p className="mt-8 label-mono">Primary language of {own.length} original repos</p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={top.map((l) => `${l.name} ${l.count}`).join(', ')}>
              {top.map((l) => (
                <span key={l.name} style={{ width: `${(l.count / total) * 100}%`, background: LANG_COLORS[l.name] ?? '#8a8a93' }} />
              ))}
              {other > 0 && <span style={{ width: `${(other / total) * 100}%` }} className="bg-subtle" />}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {top.map((l) => (
                <li key={l.name} className="flex items-center gap-2 text-muted">
                  <span aria-hidden className="size-2 rounded-full" style={{ background: LANG_COLORS[l.name] ?? '#8a8a93' }} />
                  {l.name} <span className="ml-auto font-mono text-xs text-subtle">{l.count}</span>
                </li>
              ))}
            </ul>
            <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-10 items-center gap-1.5 text-sm text-fg hover:underline hover:underline-offset-4">
              github.com/Akash6297 <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          {/* Recently updated */}
          <div className="bg-bg p-6 sm:p-8 lg:col-span-5">
            <p className="label-mono">Recently updated</p>
            <ul className="mt-4 divide-y divide-line">
              {recent.map((r) => (
                <li key={r.name}>
                  <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-3.5">
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-sm text-fg group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">{r.name}</span>
                      <span className="mt-1 flex items-center gap-3 text-xs text-subtle">
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <span aria-hidden className="size-1.5 rounded-full" style={{ background: LANG_COLORS[r.language] ?? '#8a8a93' }} />
                            {r.language}
                          </span>
                        )}
                        {r.stars > 0 && (
                          <span className="flex items-center gap-1"><Star className="size-3" aria-hidden />{r.stars}</span>
                        )}
                        <span>updated {timeAgo(r.pushedAt)}</span>
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-subtle group-hover:text-fg" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity */}
          <div className="bg-bg p-6 sm:p-8 lg:col-span-3">
            <p className="label-mono">Recent public activity</p>
            {events.length ? (
              <ol className="mt-5 space-y-4">
                {events.map(({ e, d }) => (
                  <li key={e.id} className="flex gap-3 text-sm">
                    <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
                    <span className="min-w-0">
                      <span className="text-muted">{d!.verb} </span>
                      <span className="break-words font-mono text-[13px] text-fg">{d!.repo}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-subtle">
                        {d!.detail ? `${d!.detail} · ` : ''}
                        <time dateTime={e.createdAt}>{timeAgo(e.createdAt)}</time>
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 text-sm text-muted">No public events in the last 90 days.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
