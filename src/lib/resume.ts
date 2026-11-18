import 'server-only';
import { cache } from 'react';
import { tryDb } from '@/lib/db/connect';
import { Resume } from '@/lib/db/models';
import { getEducation, getExperience, getProfile, getProjects, getSkillGroups } from '@/lib/content';
import { formatMonth } from '@/lib/utils';
import { DEFAULT_SECTIONS, normaliseResume, RESUME_FONTS, type ResumeData } from './resume-shared';

/** A resume built from the site content, used when none has been saved yet. */
async function fallbackResume(): Promise<ResumeData> {
  const [profile, experience, education, projects, skills] = await Promise.all([getProfile(), getExperience(), getEducation(), getProjects(), getSkillGroups()]);
  const github = profile.socials.find((s) => s.id === 'github')?.href ?? '';
  const linkedin = profile.socials.find((s) => s.id === 'linkedin')?.href ?? '';
  return {
    personalInfo: {
      name: profile.name, title: profile.role, email: profile.email, phone: '', address: profile.location.label,
      linkedin, github, website: '', photoUrl: '', photoShape: 'circle',
      summary: `${profile.hero.statement} ${profile.hero.intro}`,
    },
    experience: experience.map((e) => ({
      company: e.company, position: e.role, startDate: formatMonth(e.start), endDate: formatMonth(e.end),
      description: e.responsibilities.map((r) => `• ${r}`).join('\n'),
    })),
    education: education.map((e) => ({
      institution: e.institution, degree: e.degree, startDate: e.start, endDate: e.end,
      scoreType: '', scoreValue: e.score ?? '', description: '',
    })),
    skillCategories: skills.slice(0, 5).map((g) => ({ name: g.title, items: g.skills.map((s) => s.name).join(', ') })),
    skills: [],
    languages: profile.about.languages.map((l) => ({ language: l.language, proficiency: l.level })),
    projects: projects.filter((p) => p.featured).slice(0, 4).map((p) => ({ name: p.name, description: p.tagline, link: p.links.live ?? p.links.source ?? '' })),
    sections: DEFAULT_SECTIONS,
    selectedTemplate: 'classic',
    typography: { font: RESUME_FONTS[0].value, size: 13, lineHeight: 1.5, sectionGap: 16, accentColor: '#1e3a5f' },
    privacy: { showPhone: false, showAddress: true },
  };
}

/** Full resume including private fields — for the admin builder only. */
export const getResumeAdmin = cache(async (): Promise<{ resume: ResumeData; stored: boolean }> => {
  const fallback = await fallbackResume();
  const doc = await tryDb(() => Resume.findOne().lean());
  if (!doc) return { resume: fallback, stored: false };
  return { resume: normaliseResume(doc as Record<string, unknown>, fallback), stored: true };
});
