import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects, getProject, getAdjacentProjects } from '@/data/projects';
import { skillGroups } from '@/data/skills';
import { BrowserFrame, PhoneFrame } from '@/components/ui/BrowserFrame';
import { ProjectCover } from '@/components/ui/ProjectCover';
import { TechIcon } from '@/components/ui/TechIcon';
import { ButtonLink } from '@/components/ui/Button';
import { projectJsonLd, jsonLdScript } from '@/lib/structured-data';
import { hostname } from '@/lib/utils';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.name} — ${project.category} case study`;
  return {
    title,
    description: `${project.tagline} Built with ${project.stack.slice(0, 5).join(', ')}.`,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { type: 'article', title, description: project.tagline, url: `/work/${project.slug}` },
    twitter: { card: 'summary_large_image', title, description: project.tagline },
  };
}

const KIND_LABEL = { client: 'Client project', product: 'Own product', personal: 'Personal project', team: 'Team project' } as const;

// Map a stack entry to a skill icon, when one exists.
const iconFor = (tech: string) => {
  const n = tech.toLowerCase();
  for (const g of skillGroups) for (const s of g.skills) {
    if ([s.name, ...(s.aliases ?? [])].some((x) => x.toLowerCase() === n)) return s.icon;
  }
  return undefined;
};

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { previous, next } = getAdjacentProjects(project.slug);
  const cs = project.caseStudy;
  const desktopShots = project.gallery.filter((g) => g.device !== 'mobile');
  const mobileShots = project.gallery.filter((g) => g.device === 'mobile');

  const toc = [
    ['overview', 'Overview'],
    ['problem', 'Problem'],
    ['solution', 'Solution'],
    project.architecture ? ['architecture', 'Architecture'] : null,
    ['process', 'Development process'],
    ['technologies', 'Technologies'],
    ['features', 'Key features'],
    project.gallery.length ? ['screenshots', 'Screenshots'] : null,
    cs.results?.length ? ['results', 'Results'] : null,
    ['links', 'Links'],
  ].filter(Boolean) as Array<[string, string]>;

  const num = (id: string) => String(toc.findIndex(([t]) => t === id) + 1).padStart(2, '0');

  const meta = [
    { k: 'Role', v: project.role },
    { k: 'Type', v: KIND_LABEL[project.kind] },
    { k: 'Category', v: project.category },
    ...(project.year ? [{ k: 'Year', v: project.year }] : []),
  ];

  return (
    <article className="pb-24 pt-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(projectJsonLd(project))} />

      <header className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-subtle">
          <Link href="/#projects" className="inline-flex min-h-9 items-center gap-1.5 hover:text-fg">
            <ArrowLeft className="size-3.5" aria-hidden /> Work
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-muted">{project.name}</span>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="label-mono animate-enter">{project.category}{project.year ? ` · ${project.year}` : ''}</p>
            <h1 className="font-display mt-4 text-[clamp(3.25rem,10vw,7.5rem)] text-fg animate-enter" style={{ animationDelay: '60ms' }}>
              {project.name}
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted animate-enter" style={{ animationDelay: '120ms' }}>{project.tagline}</p>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end lg:justify-end animate-enter" style={{ animationDelay: '180ms' }}>
            {project.links.live && (
              <ButtonLink href={project.links.live} external className="w-full lg:w-auto">
                Visit {hostname(project.links.live)} <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            )}
            {project.links.source && (
              <ButtonLink href={project.links.source} external variant="secondary" className="w-full lg:w-auto">
                View source on GitHub <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            )}
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden border-y border-line bg-line md:grid-cols-4">
          {meta.map((m) => (
            <div key={m.k} className="bg-bg py-4 pr-4 md:px-5 md:first:pl-0">
              <dt className="label-mono">{m.k}</dt>
              <dd className="mt-1.5 text-[15px] text-fg">{m.v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="container-page mt-12 md:mt-16">
        {project.cover ? (
          <BrowserFrame image={project.cover} url={project.links.live} priority sizes="(min-width: 1200px) 1136px, 100vw" />
        ) : (
          <ProjectCover project={project} large />
        )}
      </div>

      <div className="container-page mt-16 grid grid-cols-1 gap-12 md:mt-24 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="label-mono mb-4">On this page</p>
            <ol className="space-y-1 border-l border-line">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted transition-colors hover:border-fg hover:text-fg">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="space-y-20 lg:col-span-8 lg:col-start-5">
          <Block id="overview" n={num('overview')} title="Overview">
            <p className="font-display text-3xl leading-[1.2] text-fg sm:text-[2.25rem]">{cs.overview}</p>
          </Block>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <Block id="problem" n={num('problem')} title="Problem">
              <p className="text-[17px] leading-relaxed text-muted">{cs.problem}</p>
            </Block>
            <Block id="solution" n={num('solution')} title="Solution">
              <p className="text-[17px] leading-relaxed text-muted">{cs.solution}</p>
            </Block>
          </div>

          {project.architecture && (
            <Block id="architecture" n={num('architecture')} title="Architecture">
              <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
                {project.architecture.map((node, i) => (
                  <li key={node} className="flex items-center gap-2 sm:flex-1">
                    <span className="flex w-full items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 font-mono text-[13px] text-fg">
                      <span className="text-subtle">{String(i + 1).padStart(2, '0')}</span>
                      {node}
                    </span>
                    {i < project.architecture!.length - 1 && <ArrowRight aria-hidden className="hidden size-4 shrink-0 text-subtle sm:block" />}
                  </li>
                ))}
              </ol>
            </Block>
          )}

          <Block id="process" n={num('process')} title="Development process">
            <ol className="space-y-0 border-t border-line">
              {cs.process.map((step, i) => (
                <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-4 text-[16px] leading-relaxed text-muted">
                  <span className="font-mono text-xs leading-7 text-subtle">{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Block>

          <Block id="technologies" n={num('technologies')} title="Technologies">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <li key={t} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-muted">
                  <TechIcon icon={iconFor(t)} name={t} className="text-subtle" />
                  {t}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="features" n={num('features')} title="Key features">
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {cs.features.map((f) => (
                <li key={f} className="bg-bg p-5 text-[15px] leading-relaxed text-fg/90">{f}</li>
              ))}
            </ul>
          </Block>

          {project.gallery.length > 0 && (
            <Block id="screenshots" n={num('screenshots')} title="Screenshots">
              <div className="space-y-8">
                {desktopShots.map((img) => (
                  <figure key={img.src}>
                    <BrowserFrame image={img} url={project.links.live} sizes="(min-width: 1024px) 760px, 100vw" />
                    {img.caption && <figcaption className="mt-3 text-sm text-subtle">{img.caption}</figcaption>}
                  </figure>
                ))}
                {mobileShots.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-6 rounded-lg border border-line bg-surface/40 py-10">
                    {mobileShots.map((img) => (
                      <figure key={img.src} className="w-[260px]">
                        <PhoneFrame image={img} />
                        {img.caption && <figcaption className="mt-3 text-center text-sm text-subtle">{img.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                )}
                <p className="font-mono text-[11px] text-subtle">Screenshots captured from the live site.</p>
              </div>
            </Block>
          )}

          {cs.results && cs.results.length > 0 && (
            <Block id="results" n={num('results')} title="Results">
              <ul className="space-y-3">
                {cs.results.map((r) => (
                  <li key={r} className="flex gap-3 text-[16px] leading-relaxed text-fg/90">
                    <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="links" n={num('links')} title="Links">
            <div className="flex flex-col gap-3 sm:flex-row">
              {project.links.live && (
                <ButtonLink href={project.links.live} external>
                  Live project <ArrowUpRight className="size-4" aria-hidden />
                </ButtonLink>
              )}
              {project.links.source && (
                <ButtonLink href={project.links.source} external variant="secondary">
                  Source code <ArrowUpRight className="size-4" aria-hidden />
                </ButtonLink>
              )}
              <ButtonLink href="/#contact" variant="ghost">
                Discuss a similar project <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
            {!project.links.live && (
              <p className="mt-4 text-sm text-subtle">There is no public demo for this project; the source code is available on GitHub.</p>
            )}
          </Block>
        </div>
      </div>

      <nav aria-label="More projects" className="container-page mt-24 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        <Link href={`/work/${previous.slug}`} className="group bg-bg p-6 transition-colors hover:bg-surface sm:p-8">
          <span className="label-mono inline-flex items-center gap-2"><ArrowLeft className="size-3.5" aria-hidden /> Previous</span>
          <span className="font-display mt-3 block text-3xl text-fg">{previous.name}</span>
          <span className="mt-1 block text-sm text-muted">{previous.category}</span>
        </Link>
        <Link href={`/work/${next.slug}`} className="group bg-bg p-6 text-right transition-colors hover:bg-surface sm:p-8">
          <span className="label-mono inline-flex items-center gap-2">Next <ArrowRight className="size-3.5" aria-hidden /></span>
          <span className="font-display mt-3 block text-3xl text-fg">{next.name}</span>
          <span className="mt-1 block text-sm text-muted">{next.category}</span>
        </Link>
      </nav>
    </article>
  );
}

function Block({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} data-reveal>
      <h2 id={`${id}-h`} className="mb-6 flex items-center gap-3">
        <span className="label-mono text-accent-strong">{n}</span>
        <span className="label-mono text-fg">{title}</span>
      </h2>
      {children}
    </section>
  );
}
