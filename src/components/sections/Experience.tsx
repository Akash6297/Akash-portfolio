import { ArrowUpRight } from 'lucide-react';
import { experience, education, certifications } from '@/data/experience';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn, formatDuration, formatMonth } from '@/lib/utils';

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="experience-title"
          index="02"
          label="Experience"
          title={<>Where I&apos;ve <em className="italic">shipped</em> work.</>}
          intro="Full-time, freelance and internship roles — from client websites to full-stack applications."
        />

        <ol className="relative">
          {experience.map((job, i) => {
            const current = job.end === 'present';
            return (
              <li
                key={job.company + job.start}
                className="relative grid grid-cols-1 gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-10"
                data-reveal
              >
                <div className="md:col-span-3">
                  <p className="font-mono text-[13px] text-fg">
                    {formatMonth(job.start)} — {formatMonth(job.end)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    {formatDuration(job.start, job.end)} · {job.type}
                  </p>
                </div>

                <div className="relative md:col-span-9 md:pl-10">
                  {/* Timeline rail */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1.5 hidden w-px bg-line md:block',
                      i === experience.length - 1 ? 'h-6 bg-gradient-to-b from-line to-transparent' : 'bottom-[-2.5rem]',
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -left-[4px] top-1.5 hidden size-[9px] rounded-full border md:block',
                      current ? 'live-dot border-live bg-live' : 'border-line-strong bg-bg',
                    )}
                  />

                  <h3 className="text-xl font-medium text-fg sm:text-2xl">
                    {job.role} <span className="text-subtle">·</span> <span className="text-muted">{job.company}</span>
                  </h3>
                  <p className="mt-1 text-sm text-subtle">{job.location}</p>
                  <p className="mt-4 text-[17px] text-fg/90">{job.summary}</p>
                  <ul className="mt-4 space-y-2.5">
                    {job.responsibilities.map((r) => (
                      <li key={r} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                    {job.stack.map((t) => (
                      <li key={t} className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <div data-reveal className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
          <div className="bg-bg p-6 sm:p-8">
            <h3 className="label-mono">Education</h3>
            <ul className="mt-6 space-y-6">
              {education.map((e) => (
                <li key={e.institution}>
                  <p className="font-medium text-fg">{e.degree}</p>
                  <p className="mt-1 text-sm text-muted">{e.institution}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    {e.start}–{e.end}
                    {e.score ? ` · ${e.score}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bg p-6 sm:p-8">
            <h3 className="label-mono">Certifications</h3>
            <ul className="mt-6 space-y-4">
              {certifications.map((c) => (
                <li key={c.credentialId}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4"
                  >
                    <span>
                      <span className="font-medium text-fg group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">{c.title}</span>
                      <span className="mt-1 block text-sm text-muted">{c.issuer} · Coursera · {c.date}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-subtle">Credential {c.credentialId}</span>
                    </span>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-subtle transition-colors group-hover:text-fg" aria-hidden />
                    <span className="sr-only">(opens credential in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
