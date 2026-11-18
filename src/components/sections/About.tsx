import Image from 'next/image';
import { profile } from '@/data/profile';
import { education } from '@/data/experience';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function About() {
  const degree = education[0];
  const facts = [
    { k: 'Based in', v: profile.location.label },
    { k: 'Experience', v: `${profile.experienceSummary}, professional and freelance` },
    { k: 'Education', v: `${degree.degree} — ${degree.institution} (${degree.start}–${degree.end})` },
    { k: 'Languages', v: profile.about.languages.map((l) => `${l.language} (${l.level.toLowerCase()})`).join(', ') },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          id="about-title"
          index="01"
          label="About"
          title={<>Engineer by training, <em className="italic">builder</em> by habit.</>}
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <figure className="lg:col-span-4" data-reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-surface">
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 60vw, 100vw"
                className="object-cover object-[50%_30%] grayscale-[20%] transition-[filter] duration-700 hover:grayscale-0"
              />
            </div>
            <figcaption className="mt-3 flex justify-between font-mono text-[11px] text-subtle">
              <span>Fig. 01 — {profile.name}</span>
              <span>{profile.location.city}, IN</span>
            </figcaption>
          </figure>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="font-display text-3xl leading-[1.15] text-fg sm:text-4xl" data-reveal>
              {profile.about.lead}
            </p>
            <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-muted">
              {profile.about.paragraphs.map((p, i) => (
                <p key={i} data-reveal>{p}</p>
              ))}
            </div>

            <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3" data-reveal>
              {profile.about.principles.map((pr, i) => (
                <li key={pr.title} className="bg-bg p-5">
                  <span className="label-mono text-accent-strong">0{i + 1}</span>
                  <p className="mt-3 font-medium text-fg">{pr.title}</p>
                  <p className="mt-1 text-sm text-muted">{pr.text}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-10 divide-y divide-line border-y border-line" data-reveal>
              {facts.map((f) => (
                <div key={f.k} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="label-mono pt-0.5">{f.k}</dt>
                  <dd className="text-[15px] text-fg">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
