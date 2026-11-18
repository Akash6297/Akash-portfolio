import { ArrowDown, ArrowRight } from 'lucide-react';
import { profile } from '@/data/profile';
import { socials } from '@/data/socials';
import { skillGroups } from '@/data/skills';
import { sortedProjects } from '@/data/projects';
import { experience } from '@/data/experience';
import { Availability } from '@/components/ui/Availability';
import { ButtonLink } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/MagneticLink';
import { Terminal, type TerminalData } from '@/components/hero/Terminal';
import { formatMonth } from '@/lib/utils';

const delay = (ms: number) => ({ animationDelay: `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  // Only the data the terminal needs is sent to the browser.
  const terminalData: TerminalData = {
    name: profile.name,
    role: profile.role,
    location: profile.location.label,
    statement: profile.hero.statement,
    availability: profile.availability.open ? profile.availability.label : 'Not taking new work right now',
    email: profile.email,
    resume: profile.resume.href,
    socials: socials.map(({ label, href, handle }) => ({ label, href, handle })),
    skills: skillGroups.map((g) => ({ title: g.title, items: g.skills.map((s) => s.name) })),
    projects: sortedProjects.map(({ slug, name, tagline, category }) => ({ slug, name, tagline, category })),
    experience: experience.map((e) => ({
      period: `${formatMonth(e.start)} – ${formatMonth(e.end)}`,
      role: e.role,
      company: e.company,
    })),
  };

  const facts = [
    { label: 'Currently', value: `${profile.current.role} at ${profile.current.company}` },
    { label: 'Based in', value: `${profile.location.city}, ${profile.location.region} · IST` },
    { label: 'Core stack', value: 'React · Next.js · Node.js · MongoDB · PostgreSQL' },
    { label: 'Experience', value: `${profile.experienceSummary} · ${sortedProjects.length} projects documented` },
  ];

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      <div aria-hidden className="bg-grid-fade absolute inset-0 -z-10" />

      <div className="container-page">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="animate-enter" style={delay(0)}>
              <Availability />
            </div>

            <h1 id="hero-title" className="font-display mt-7 text-[clamp(2.9rem,8.4vw,5.9rem)] text-fg animate-enter" style={delay(80)}>
              Building digital experiences that <em className="italic text-fg/95">actually work</em>
              <span className="text-accent">.</span>
            </h1>

            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted animate-enter" style={delay(160)}>
              <span className="text-fg">{profile.name}</span>
              <span aria-hidden className="text-line-strong">/</span>
              <span>{profile.role}</span>
              <span aria-hidden className="text-line-strong">/</span>
              <span>{profile.location.country}</span>
            </p>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted animate-enter" style={delay(220)}>
              {profile.hero.statement} {profile.hero.intro}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-enter" style={delay(300)}>
              <Magnetic>
                <ButtonLink href="/#projects" className="w-full sm:w-auto">
                  View my work
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/#contact" variant="secondary" className="w-full sm:w-auto">
                  Let&apos;s connect
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </ButtonLink>
              </Magnetic>
            </div>
          </div>

          <div className="animate-enter lg:col-span-5 lg:pt-6" style={delay(380)}>
            <Terminal data={terminalData} />
          </div>
        </div>

        <dl data-reveal className="mt-16 grid grid-cols-1 gap-px border-y border-line bg-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="bg-bg py-5 sm:px-5 sm:first:pl-0 sm:[&:nth-child(3)]:pl-0 lg:[&:nth-child(3)]:pl-5"
            >
              <dt className="label-mono">{f.label}</dt>
              <dd className="mt-2 text-[15px] text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
