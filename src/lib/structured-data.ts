import { profile } from '@/data/profile';
import { socials } from '@/data/socials';
import { experience, education } from '@/data/experience';
import type { Project } from '@/data/types';
import { site, siteUrl } from './site';

export function personJsonLd() {
  const current = experience.find((e) => e.end === 'present');
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: profile.name,
    url: siteUrl,
    image: `${siteUrl}${profile.portrait.src}`,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.city,
      addressRegion: profile.location.region,
      addressCountry: profile.location.countryCode,
    },
    worksFor: current ? { '@type': 'Organization', name: current.company } : undefined,
    alumniOf: education.slice(0, 1).map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    knowsAbout: ['React', 'Next.js', 'Node.js', 'Express.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Web development'],
    sameAs: socials.filter((s) => s.id !== 'email').map((s) => s.href),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: site.name,
    description: site.description,
    inLanguage: 'en',
    author: { '@id': `${siteUrl}/#person` },
  };
}

export function projectJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.tagline,
    url: `${siteUrl}/work/${project.slug}`,
    image: project.cover ? `${siteUrl}${project.cover.src}` : undefined,
    dateCreated: project.year,
    author: { '@id': `${siteUrl}/#person` },
    keywords: project.stack.join(', '),
    sameAs: [project.links.live, project.links.source].filter(Boolean),
  };
}

/** Serialises JSON-LD safely for a <script> tag. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
