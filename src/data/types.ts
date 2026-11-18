// Shared content types. Every piece of portfolio content lives in src/data/*.ts and is
// typed here, so a missing field shows up as a type error instead of a broken page.

export type ProjectFilter = 'full-stack' | 'frontend' | 'backend' | 'products' | 'experiments';

export interface ImageAsset {
  /** Path under /public, e.g. "/images/projects/lakshya/desktop.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** "mobile" renders the image inside a phone-width frame. */
  device?: 'desktop' | 'mobile';
}

export interface Project {
  slug: string;
  name: string;
  /** One line, shown on cards and in search results. */
  tagline: string;
  /** Human label, e.g. "Productivity SaaS". */
  category: string;
  filters: ProjectFilter[];
  /** Featured projects get the large editorial layout on the home page. */
  featured: boolean;
  /** Lower numbers appear first. */
  order: number;
  year?: string;
  role: string;
  /** "client" = built for a client, "product" = own product, "personal" = personal/learning project. */
  kind: 'client' | 'product' | 'personal' | 'team';
  stack: string[];
  links: { live?: string; source?: string };
  /** Real screenshot used as the hero image. Projects without one get a generated cover. */
  cover?: ImageAsset;
  gallery: ImageAsset[];
  /** Request flow for the architecture strip, left to right. */
  architecture?: string[];
  caseStudy: {
    overview: string;
    problem: string;
    solution: string;
    process: string[];
    features: string[];
    /** Only verifiable outcomes. Leave empty rather than estimating. */
    results?: string[];
  };
}

export interface ExperienceItem {
  company: string;
  role: string;
  location: string;
  start: string; // "2025-04"
  end: string | 'present';
  type: 'Full-time' | 'Freelance' | 'Internship';
  summary: string;
  responsibilities: string[];
  stack: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  start: string;
  end: string;
  score?: string;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  url: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  /** Key in src/components/ui/TechIcon.tsx. Omit for a monogram. */
  icon?: string;
  note: string;
  /** Other names this skill has in project stacks, used to list "Used in" projects. */
  aliases?: string[];
}

export interface Service {
  title: string;
  description: string;
  icon: string; // lucide icon name (see src/components/sections/Services.tsx)
  deliverables: string[];
  /** Slug of a project that demonstrates this service. */
  proof?: string;
}
