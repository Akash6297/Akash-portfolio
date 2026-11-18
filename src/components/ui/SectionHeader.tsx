import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  index: string;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/** "02 — Experience" label, editorial serif title and optional intro, on a hairline rule. */
export function SectionHeader({ index, label, title, intro, id, className, children }: SectionHeaderProps) {
  return (
    <header className={cn('mb-12 md:mb-16', className)}>
      <div className="flex items-center gap-3 border-t border-line pt-4" data-reveal>
        <span className="label-mono text-accent-strong">{index}</span>
        <span aria-hidden className="h-px w-6 bg-line-strong" />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
        <h2 id={id} className="font-display text-[2.5rem] text-fg sm:text-5xl md:col-span-7 md:text-6xl" data-reveal>
          {title}
        </h2>
        {intro && (
          <p className="max-w-md text-base leading-relaxed text-muted md:col-span-5 md:justify-self-end" data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
            {intro}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
