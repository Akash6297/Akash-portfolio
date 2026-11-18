/* eslint-disable @next/next/no-img-element -- printable document; remote photos are rendered as plain <img> */
import type { ResumeData, SectionId } from '@/lib/resume-shared';
import { toBullets } from '@/lib/resume-shared';
import { safeHref } from '@/lib/utils';

/**
 * Printable A4 resume. Pure component (no hooks): used by the public /resume page
 * and by the live preview in the admin builder.
 */
export function ResumeDocument({ resume }: { resume: ResumeData }) {
  const { personalInfo: p, typography: t } = resume;
  const accent = t.accentColor;
  const style = {
    fontFamily: t.font,
    fontSize: `${t.size}px`,
    lineHeight: t.lineHeight,
    '--accent': accent,
    '--gap': `${t.sectionGap}px`,
  } as React.CSSProperties;

  const contact = [
    p.address && { label: p.address },
    p.email && { label: p.email, href: `mailto:${p.email}` },
    p.phone && { label: p.phone, href: `tel:${p.phone.replace(/\s/g, '')}` },
    p.linkedin && { label: p.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: p.linkedin },
    p.github && { label: p.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: p.github },
    p.website && { label: p.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: p.website },
  ].filter(Boolean) as Array<{ label: string; href?: string }>;

  const visible = resume.sections.filter((s) => s.isVisible);
  const heading = (id: SectionId) => resume.sections.find((s) => s.id === id)?.name ?? id;

  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'summary':
        return p.summary ? <p className="whitespace-pre-line">{p.summary}</p> : null;
      case 'experience':
        return resume.experience.length ? (
          <div className="space-y-3">
            {resume.experience.map((e, i) => (
              <Entry key={i} title={e.company} subtitle={e.position} dates={`${e.startDate} – ${e.endDate}`} body={e.description} />
            ))}
          </div>
        ) : null;
      case 'projects':
        return resume.projects.length ? (
          <div className="space-y-2.5">
            {resume.projects.map((pr, i) => (
              <div key={i} className="break-inside-avoid">
                <p>
                  <strong className="text-[#111]">{pr.name}</strong>
                  {safeHref(pr.link) && (
                    <>
                      {' '}
                      <a href={safeHref(pr.link)} className="text-[0.85em] underline" style={{ color: accent }}>
                        {pr.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    </>
                  )}
                </p>
                {pr.description && <p className="whitespace-pre-line">{pr.description}</p>}
              </div>
            ))}
          </div>
        ) : null;
      case 'education':
        return resume.education.length ? (
          <div className="space-y-2.5">
            {resume.education.map((e, i) => (
              <Entry
                key={i}
                title={e.institution}
                subtitle={[e.degree, e.scoreValue && `${e.scoreType ? `${e.scoreType}: ` : ''}${e.scoreValue}`].filter(Boolean).join(' · ')}
                dates={`${e.startDate} – ${e.endDate}`}
                body={e.description}
              />
            ))}
          </div>
        ) : null;
      case 'skills':
        return resume.skillCategories.length || resume.skills.length ? (
          <div className="space-y-1">
            {resume.skillCategories.map((c, i) => (
              <p key={i}>
                <strong className="text-[#111]">{c.name}:</strong> {c.items}
              </p>
            ))}
            {resume.skills.length > 0 && <p>{resume.skills.join(', ')}</p>}
          </div>
        ) : null;
      case 'languages':
        return resume.languages.length ? (
          <p className="flex flex-wrap gap-x-6 gap-y-1">
            {resume.languages.map((l, i) => (
              <span key={i}>
                <strong className="text-[#111]">{l.language}</strong> — {l.proficiency}
              </span>
            ))}
          </p>
        ) : null;
    }
  };

  const Section = ({ id }: { id: SectionId }) => {
    const content = renderSection(id);
    if (!content) return null;
    return (
      <section style={{ marginTop: 'var(--gap)' }}>
        <h2
          className={resume.selectedTemplate === 'minimal' ? 'mb-1.5 font-serif text-[1.15em] italic' : 'mb-1.5 border-b pb-1 text-[0.78em] font-semibold uppercase tracking-[0.14em]'}
          style={{ color: resume.selectedTemplate === 'minimal' ? '#111' : accent, borderColor: accent }}
        >
          {heading(id)}
        </h2>
        {content}
      </section>
    );
  };

  const photo = p.photoUrl ? (
    <img src={p.photoUrl} alt="" className={`size-[92px] shrink-0 object-cover ${p.photoShape === 'circle' ? 'rounded-full' : 'rounded-md'}`} style={{ border: `2px solid ${accent}` }} />
  ) : null;

  const ContactList = ({ vertical }: { vertical?: boolean }) => (
    <ul className={vertical ? 'space-y-1 text-[0.9em]' : 'mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.88em] text-[#444]'}>
      {contact.map((c) => (
        <li key={c.label} className="break-all">
          {safeHref(c.href) ? <a href={safeHref(c.href)} className="hover:underline">{c.label}</a> : c.label}
        </li>
      ))}
    </ul>
  );

  if (resume.selectedTemplate === 'modern') {
    const side: SectionId[] = ['skills', 'languages'];
    return (
      <article className="resume-paper grid grid-cols-[34%_1fr] text-[#333]" style={style}>
        <aside className="px-6 py-8 text-[#222]" style={{ background: `color-mix(in srgb, ${accent} 9%, white)` }}>
          {photo && <div className="mb-5">{photo}</div>}
          <h1 className="text-[1.9em] font-bold leading-tight text-[#111]">{p.name}</h1>
          <p className="mt-1 text-[0.95em] font-medium uppercase tracking-wider" style={{ color: accent }}>{p.title}</p>
          <div className="mt-5"><ContactList vertical /></div>
          {visible.filter((s) => side.includes(s.id)).map((s) => <Section key={s.id} id={s.id} />)}
        </aside>
        <div className="px-7 py-8">
          {visible.filter((s) => !side.includes(s.id)).map((s) => <Section key={s.id} id={s.id} />)}
        </div>
      </article>
    );
  }

  return (
    <article className="resume-paper px-10 py-9 text-[#333]" style={style}>
      <header className={`flex items-start justify-between gap-6 ${resume.selectedTemplate === 'classic' ? 'border-b-2 pb-4' : 'pb-2'}`} style={{ borderColor: accent }}>
        <div>
          <h1 className={resume.selectedTemplate === 'minimal' ? 'font-serif text-[2.4em] font-normal leading-tight text-[#111]' : 'text-[2.2em] font-bold leading-tight'} style={resume.selectedTemplate === 'classic' ? { color: accent } : undefined}>
            {p.name}
          </h1>
          <p className="mt-0.5 text-[1em] uppercase tracking-[0.12em] text-[#555]">{p.title}</p>
          <ContactList />
        </div>
        {resume.selectedTemplate === 'classic' && photo}
      </header>
      {visible.map((s) => <Section key={s.id} id={s.id} />)}
    </article>
  );
}

function Entry({ title, subtitle, dates, body }: { title: string; subtitle: string; dates: string; body: string }) {
  const { bullets, text } = toBullets(body);
  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <strong className="text-[#111]">{title}</strong>
        <span className="text-[0.88em] text-[#666]">{dates}</span>
      </div>
      {subtitle && <p className="italic text-[#555]">{subtitle}</p>}
      {bullets.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
      {text && <p className="mt-1 whitespace-pre-line">{text}</p>}
    </div>
  );
}
