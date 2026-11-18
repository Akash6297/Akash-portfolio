import Link from 'next/link';
import { AppWindow, ArrowRight, Building2, Gauge, Layers, LayoutTemplate, PenTool, Server, ShoppingBag, type LucideIcon } from 'lucide-react';
import { services } from '@/data/services';
import { getProject } from '@/data/projects';
import { SectionHeader } from '@/components/ui/SectionHeader';

// Icon keys used in src/data/services.ts.
const ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  layout: LayoutTemplate,
  server: Server,
  'shopping-bag': ShoppingBag,
  building: Building2,
  'app-window': AppWindow,
  gauge: Gauge,
  'pen-tool': PenTool,
};

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="services-title"
          index="07"
          label="Services"
          title={<>What I can <em className="italic">build</em> for you.</>}
          intro="For companies hiring and for business owners with a project. Each service links to work that shows it."
        />
        <ul data-reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Layers;
            const proof = s.proof ? getProject(s.proof) : undefined;
            return (
              <li key={s.title} className="group flex flex-col bg-bg p-6 transition-colors duration-300 hover:bg-surface">
                <div className="flex items-start justify-between">
                  <Icon className="size-5 text-muted transition-colors group-hover:text-accent-strong" strokeWidth={1.5} aria-hidden />
                  <span className="label-mono">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-subtle">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {proof ? (
                    <Link href={`/work/${proof.slug}`} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
                      See {proof.name}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-9 items-center text-sm text-subtle">Current work at MavenPro</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
