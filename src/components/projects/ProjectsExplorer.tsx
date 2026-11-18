'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import * as m from 'motion/react-m';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project, ProjectFilter } from '@/data/types';
import { BrowserFrame } from '@/components/ui/BrowserFrame';
import { ProjectCover } from '@/components/ui/ProjectCover';
import { canOptimize, cn } from '@/lib/utils';

export type ProjectSummary = Omit<Project, 'caseStudy' | 'gallery'>;
type FilterKey = 'all' | ProjectFilter;

const ORDER: FilterKey[] = ['all', 'full-stack', 'frontend', 'backend', 'products', 'experiments'];
const ease = [0.16, 1, 0.3, 1] as const;

export function ProjectsExplorer({ items, labels }: { items: ProjectSummary[]; labels: Record<FilterKey, string> }) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c = Object.fromEntries(ORDER.map((k) => [k, 0])) as Record<FilterKey, number>;
    c.all = items.length;
    items.forEach((p) => p.filters.forEach((f) => (c[f] += 1)));
    return c;
  }, [items]);

  const visible = items.filter((p) => filter === 'all' || p.filters.includes(filter));
  // On "All", featured projects get the editorial layout and the rest go to the index.
  // Filtered views show the top three matches large and the remainder in the index.
  const featured = filter === 'all' ? visible.filter((p) => p.featured) : visible.slice(0, 3);
  const rest = visible.filter((p) => !featured.includes(p));

  return (
    <div>
      <div
        role="group"
        aria-label="Filter projects by category"
        className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
      >
        {ORDER.map((key) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={cn(
                'relative min-h-10 shrink-0 rounded-md px-3.5 text-sm transition-colors',
                active ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {active && <m.span layoutId="project-filter" className="absolute inset-0 -z-10 rounded-md border border-line-strong bg-raised" aria-hidden />}
              {labels[key]}
              <span className="ml-1.5 font-mono text-[11px] text-subtle">{counts[key]}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        {filter === 'all' ? '' : ` in ${labels[filter]}`}.
      </p>

      <div>
        <AnimatePresence mode="popLayout" initial={false}>
          {featured.map((project, i) => (
            <m.div
              key={project.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.55, ease }}
            >
              <FeaturedProject project={project} index={items.indexOf(project) + 1} flip={i % 2 === 1} />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {rest.length > 0 && <ProjectIndex projects={rest} all={items} title={filter === 'all' ? 'More projects' : 'More in this category'} />}
    </div>
  );
}

function FeaturedProject({ project, index, flip, priority }: { project: ProjectSummary; index: number; flip: boolean; priority?: boolean }) {
  const href = `/work/${project.slug}`;
  const extra = project.stack.length - 6;
  return (
    <article className="grid grid-cols-1 items-center gap-8 border-t border-line py-12 md:py-16 lg:grid-cols-12 lg:gap-12" aria-labelledby={`p-${project.slug}`}>
      <Link
        href={href}
        className={cn('group relative block lg:col-span-7', flip && 'lg:order-last')}
        aria-label={`Read the ${project.name} case study`}
        tabIndex={-1}
      >
        <div className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
          {project.cover ? (
            <BrowserFrame
              image={project.cover}
              url={project.links.live}
              priority={priority}
              className="transition-colors duration-500 group-hover:border-line-strong"
              imageClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.025]"
            />
          ) : (
            <ProjectCover project={project} className="transition-colors duration-500 group-hover:border-line-strong" />
          )}
        </div>
        <span className="pointer-events-none absolute bottom-4 left-4 inline-flex translate-y-2 items-center gap-1.5 rounded-sm bg-fg px-2.5 py-1 text-xs font-medium text-bg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View case study <ArrowRight className="size-3" aria-hidden />
        </span>
      </Link>

      <div className="lg:col-span-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-subtle">
          <span className="text-accent-strong">{String(index).padStart(2, '0')}</span>
          <span>{project.category}</span>
          {project.year && <span>{project.year}</span>}
        </p>
        <h3 id={`p-${project.slug}`} className="font-display mt-4 text-4xl text-fg sm:text-5xl">
          <Link href={href} className="hover:text-white">
            {project.name}
          </Link>
        </h3>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">{project.tagline}</p>
        <p className="mt-4 text-sm text-subtle">
          <span className="text-muted">Role —</span> {project.role}
        </p>
        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.stack.slice(0, 6).map((t) => (
            <li key={t} className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted">{t}</li>
          ))}
          {extra > 0 && <li className="px-1 py-0.5 font-mono text-[11px] text-subtle">+{extra} more</li>}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href={href} className="group inline-flex min-h-10 items-center gap-2 font-medium text-fg">
            Read case study
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          {project.links.live && (
            <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-muted hover:text-fg">
              Live site <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          {project.links.source && (
            <a href={project.links.source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-muted hover:text-fg">
              Source <ArrowUpRight className="size-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ProjectIndex({ projects, all, title }: { projects: ProjectSummary[]; all: ProjectSummary[]; title: string }) {
  const [hovered, setHovered] = useState<ProjectSummary | null>(null);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div className="mt-8 border-t border-line pt-12" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }} onPointerLeave={() => setHovered(null)}>
      <h3 className="label-mono mb-6">{title}</h3>
      <div className="hidden grid-cols-12 gap-6 border-b border-line pb-3 font-mono text-[11px] uppercase tracking-wider text-subtle md:grid" aria-hidden>
        <span className="col-span-1">No.</span>
        <span className="col-span-5">Project</span>
        <span className="col-span-2">Category</span>
        <span className="col-span-3">Stack</span>
        <span className="col-span-1 text-right">Links</span>
      </div>
      <ul>
        <AnimatePresence mode="popLayout" initial={false}>
          {projects.map((p) => (
            <m.li
              key={p.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.4, ease }}
              className="group relative grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface/60 md:grid-cols-12 md:items-center md:gap-6 md:px-2"
              onPointerEnter={() => setHovered(p)}
            >
              <span className="pt-1 font-mono text-xs text-subtle md:col-span-1 md:pt-0">
                {String(all.indexOf(p) + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 md:col-span-5">
                <Link href={`/work/${p.slug}`} className="font-medium text-fg after:absolute after:inset-0 after:content-['']">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm text-muted md:line-clamp-1">{p.tagline}</p>
                <p className="mt-2 font-mono text-[11px] text-subtle md:hidden">{p.category}{p.year ? ` · ${p.year}` : ''}</p>
              </div>
              <span className="hidden text-sm text-muted md:col-span-2 md:block">{p.category}</span>
              <span className="hidden truncate font-mono text-[11px] text-subtle md:col-span-3 md:block">{p.stack.slice(0, 3).join(' · ')}</span>
              <span className="relative z-10 flex items-center justify-end gap-1 md:col-span-1">
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-md text-subtle hover:bg-raised hover:text-fg" aria-label={`${p.name} live site (opens in a new tab)`}>
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                )}
                {p.links.source && (
                  <a href={p.links.source} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-md font-mono text-[11px] text-subtle hover:bg-raised hover:text-fg" aria-label={`${p.name} source code (opens in a new tab)`}>
                    {'</>'}
                  </a>
                )}
              </span>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>

      {enabled && (
        <m.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-40 w-[320px]"
          style={{ x: sx, y: sy, translateX: 24, translateY: '-50%' }}
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.94 }}
          transition={{ duration: 0.25, ease }}
        >
          {hovered && (
            <div className="overflow-hidden rounded-md border border-line-strong bg-surface shadow-2xl">
              {hovered.cover ? (
                <div className="relative aspect-[16/10]">
                  <Image src={hovered.cover.src} unoptimized={!canOptimize(hovered.cover.src)} alt="" fill sizes="320px" className="object-cover object-top" />
                </div>
              ) : (
                <div className="flex aspect-[16/10] flex-col justify-end bg-grid p-4">
                  <p className="font-display text-3xl text-fg">{hovered.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-subtle">No public demo · source on GitHub</p>
                </div>
              )}
            </div>
          )}
        </m.div>
      )}
    </div>
  );
}
