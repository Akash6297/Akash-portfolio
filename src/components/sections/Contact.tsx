import { ArrowUpRight, Download, MapPin } from 'lucide-react';
import { profile } from '@/data/profile';
import { socials } from '@/data/socials';
import { Availability } from '@/components/ui/Availability';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { ContactForm } from '@/components/contact/ContactForm';
import { CopyEmail } from '@/components/contact/CopyEmail';

export function Contact() {
  const external = socials.filter((s) => s.id !== 'email');
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-20 md:py-28">
      <div className="container-page">
        <div className="flex items-center gap-3 border-t border-line pt-4" data-reveal>
          <span className="label-mono text-accent-strong">08</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
          <span className="label-mono">Contact</span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <h2 id="contact-title" className="font-display text-[clamp(2.75rem,6.5vw,5rem)] text-fg" data-reveal>
              Have an idea? <em className="italic text-muted">Let&apos;s build something meaningful.</em>
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted" data-reveal>
              {profile.contact.text}
            </p>
            <div className="mt-8" data-reveal>
              <Availability />
              <p className="mt-3 text-sm text-subtle">{profile.availability.detail}</p>
            </div>

            <dl className="mt-10 divide-y divide-line border-y border-line" data-reveal>
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <dt className="label-mono">Email</dt>
                <dd className="flex min-w-0 items-center gap-1">
                  <a href={`mailto:${profile.email}`} className="truncate text-fg hover:underline hover:underline-offset-4">{profile.email}</a>
                  <CopyEmail email={profile.email} />
                </dd>
              </div>
              {external.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-4">
                  <dt className="label-mono">{s.label}</dt>
                  <dd>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-9 items-center gap-2 text-fg">
                      <SocialIcon id={s.id} className="size-3.5 text-muted group-hover:text-fg" />
                      <span className="group-hover:underline group-hover:underline-offset-4">{s.handle}</span>
                      <ArrowUpRight className="size-3.5 text-subtle" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 py-4">
                <dt className="label-mono">Location</dt>
                <dd className="inline-flex items-center gap-2 text-fg"><MapPin className="size-3.5 text-muted" aria-hidden />{profile.location.label}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-4">
                <dt className="label-mono">Resume</dt>
                <dd>
                  <a href={profile.resume.href} download={profile.resume.fileName} className="inline-flex min-h-9 items-center gap-2 text-fg hover:underline hover:underline-offset-4">
                    <Download className="size-3.5 text-muted" aria-hidden /> PDF, 2 pages
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6" data-reveal>
            <ContactForm email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
