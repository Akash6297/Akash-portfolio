import { approach } from '@/data/services';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProcessRail } from '@/components/approach/ProcessRail';

export function Approach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="approach-title"
          index="06"
          label="Development approach"
          title={<>From first call to <em className="italic">production</em>.</>}
          intro="The same five steps whether it is a landing page or a multi-tenant app — only the depth of each step changes."
        />
        <ProcessRail>
          <ol className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-6">
            {approach.map((s, i) => (
              <li key={s.step} className="relative pl-10 md:pl-0 md:pt-12" data-reveal style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}>
                <span
                  aria-hidden
                  className="absolute left-0 top-0.5 grid size-[1.375rem] place-items-center rounded-full border border-line-strong bg-bg font-mono text-[10px] text-fg md:-top-[0.6875rem] md:left-0"
                >
                  {i + 1}
                </span>
                <p className="label-mono text-accent-strong">{s.step}</p>
                <h3 className="font-display mt-2 text-3xl text-fg">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.text}</p>
                <ul className="mt-5 space-y-1.5 font-mono text-[11px] text-subtle">
                  {s.outputs.map((o) => (
                    <li key={o} className="flex items-center gap-2">
                      <span aria-hidden className="h-px w-2.5 bg-line-strong" />
                      {o}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </ProcessRail>
      </div>
    </section>
  );
}
