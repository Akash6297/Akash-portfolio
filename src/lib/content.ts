import 'server-only';
import { cache } from 'react';
import { tryDb } from '@/lib/db/connect';
import { contentModels, SiteProfile, type ContentCollection } from '@/lib/db/models';
import { profile as defaultProfile } from '@/data/profile';
import { projects as defaultProjects } from '@/data/projects';
import { experience as defaultExperience, education as defaultEducation, certifications as defaultCertifications } from '@/data/experience';
import { achievements as defaultAchievements } from '@/data/achievements';
import { skillGroups as defaultSkillGroups } from '@/data/skills';
import { services as defaultServices } from '@/data/services';
import type {
  Achievement, Certification, EducationItem, ExperienceItem, ProfileData, Project, Service, SkillGroup,
} from '@/data/types';

// Public content comes from MongoDB once it has been imported through the admin
// panel; otherwise (or if the database is unreachable) the built-in files are used.

export const defaults = {
  projects: defaultProjects,
  experience: defaultExperience,
  education: defaultEducation,
  certifications: defaultCertifications,
  achievements: defaultAchievements,
  skills: defaultSkillGroups,
  services: defaultServices,
} satisfies Record<ContentCollection, unknown[]>;

/** Removes Mongo internals and converts ids so documents are plain, serialisable objects. */
export function toPlain<T>(doc: Record<string, unknown>): T & { id: string } {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc as Record<string, unknown> & { _id?: { toString(): string } };
  void __v; void createdAt; void updatedAt;
  return JSON.parse(JSON.stringify({ ...rest, id: _id ? _id.toString() : '' }));
}

/** Fills fields missing from a stored document with the defaults (deep, objects only). */
function mergeDefaults<T>(base: T, stored: unknown): T {
  if (stored === undefined || stored === null) return base;
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return stored as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
    out[key] = key in out ? mergeDefaults(out[key], value) : value;
  }
  return out as T;
}

async function loadList<T>(collection: ContentCollection, filter: Record<string, unknown> = {}): Promise<T[]> {
  const docs = await tryDb(async () => {
    const model = contentModels[collection];
    const count = await model.estimatedDocumentCount();
    if (count === 0) return null; // not imported yet → defaults
    return model.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  });
  if (!docs) return defaults[collection] as T[];
  return docs.map((d) => toPlain<T>(d as Record<string, unknown>));
}

export const getProfile = cache(async (): Promise<ProfileData> => {
  const doc = await tryDb(() => SiteProfile.findOne().lean());
  return doc ? mergeDefaults(defaultProfile, toPlain(doc as Record<string, unknown>)) : defaultProfile;
});

export const getProjects = cache(async (): Promise<Project[]> =>
  (await loadList<Project & { published?: boolean }>('projects')).filter((p) => p.published !== false),
);

export const getProject = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug));

export const getExperience = cache(() => loadList<ExperienceItem>('experience'));
export const getEducation = cache(() => loadList<EducationItem>('education'));
export const getCertifications = cache(() => loadList<Certification>('certifications'));
export const getAchievements = cache(() => loadList<Achievement>('achievements'));
export const getSkillGroups = cache(() => loadList<SkillGroup>('skills'));
export const getServices = cache(() => loadList<Service>('services'));

export function adjacentProjects(projects: Project[], slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
