import type { Project } from '@/data/types';
import { cn } from '@/lib/utils';

/**
 * Designed cover for projects without a public demo. It shows the project's real
 * architecture and stack, and is clearly labelled — it never imitates a screenshot.
 */
export function ProjectCover({ project, className, large }: { project: Pick<Project, 'name' | 'category' | 'year' | 'stack' | 'architecture'>; className?: string; large?: boolean }) {
  const flow = project.architecture ?? project.stack.slice(0, 4);
  return (
    <figure
      className={cn('relative isolate flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-lg border border-line bg-surface p-5 sm:p-7', className)}
      aria-label={`${project.name}: ${project.category}. No public demo; source code available.`}
    >
      <div aria-hidden className="bg-grid-fade-corner absolute inset-0 -z-10" />

      <div className="flex items-start justify-between gap-4">
        <span className="label-mono">{project.category}</span>
        <span className="label-mono text-right">{project.year ?? ''}</span>
      </div>

      <div>
        <p className={cn('font-display text-fg', large ? 'text-5xl sm:text-7xl' : 'text-4xl sm:text-5xl')}>{project.name}</p>
        <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[11px] text-muted sm:text-xs">
          {flow.map((node, i) => (
            <li key={node} className="flex items-center gap-2">
              <span className="rounded-sm border border-line-strong bg-bg/70 px-2 py-1">{node}</span>
              {i < flow.length - 1 && <span aria-hidden className="text-subtle">→</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
        <span className="font-mono text-[11px] text-subtle">No public demo · source on GitHub</span>
        <span aria-hidden className="font-mono text-[11px] text-subtle">{project.stack.length} technologies</span>
      </div>
    </figure>
  );
}
