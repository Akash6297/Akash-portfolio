'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface SkillView {
  name: string;
  note: string;
  usedIn: Array<{ slug: string; name: string }>;
  color?: string;
  icon: React.ReactNode;
}

/**
 * One category of skills. Hovering, focusing or tapping a skill updates the readout
 * at the bottom of the panel (no floating tooltips, so nothing overflows on mobile).
 */
export function SkillPanel({ index, title, description, skills }: { index: number; title: string; description: string; skills: SkillView[] }) {
  const [hovered, setHovered] = useState<SkillView | null>(null);
  const [pinned, setPinned] = useState<SkillView | null>(null);
  const active = hovered ?? pinned;
  const readoutId = `skill-readout-${index}`;

  return (
    <div className="flex flex-col bg-bg p-6 sm:p-7" onMouseLeave={() => setHovered(null)}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-medium text-fg">{title}</h3>
        <span className="label-mono">0{index}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{description}</p>

      <ul className="mt-6 flex flex-wrap gap-1.5">
        {skills.map((s) => {
          const isActive = active?.name === s.name;
          return (
            <li key={s.name}>
              <button
                type="button"
                aria-describedby={readoutId}
                aria-pressed={pinned?.name === s.name}
                onMouseEnter={() => setHovered(s)}
                onFocus={() => setPinned(s)}
                onClick={() => setPinned(s)}
                className={cn(
                  'inline-flex min-h-9 items-center gap-2 rounded-md border px-2.5 text-[13px] transition-colors duration-200',
                  isActive ? 'border-line-strong bg-raised text-fg' : 'border-line text-muted hover:text-fg',
                )}
                style={isActive && s.color ? ({ color: s.color } as React.CSSProperties) : undefined}
              >
                {s.icon}
                <span className={isActive ? 'text-fg' : undefined}>{s.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div id={readoutId} aria-live="polite" className="mt-auto min-h-[5.5rem] border-t border-line pt-4 text-sm">
        <div className="mt-2">
          {active ? (
            <>
              <p className="text-fg">
                <span className="font-medium">{active.name}</span> <span className="text-muted">— {active.note}</span>
              </p>
              {active.usedIn.length > 0 && (
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-subtle">
                  Used in{' '}
                  {active.usedIn.map((p, i) => (
                    <span key={p.slug}>
                      <Link href={`/work/${p.slug}`} className="text-muted underline decoration-line-strong underline-offset-2 hover:text-fg">
                        {p.name}
                      </Link>
                      {i < active.usedIn.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </>
          ) : (
            <p className="font-mono text-[11px] text-subtle">{skills.length} technologies — select one for details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
