// Resume data shared by the public /resume page, the admin builder and its live preview.
// Shape matches the previous builder's `resumes` document, plus `privacy`.
import type { Field } from '@/lib/admin/fields';

export interface ResumeData {
  personalInfo: {
    name: string; title: string; email: string; phone: string; address: string;
    linkedin: string; github: string; website?: string; photoUrl: string; photoShape: 'square' | 'circle'; summary: string;
  };
  experience: Array<{ company: string; position: string; startDate: string; endDate: string; description: string }>;
  education: Array<{ institution: string; degree: string; startDate: string; endDate: string; scoreType: string; scoreValue: string; description: string }>;
  skillCategories: Array<{ name: string; items: string }>;
  skills: string[];
  languages: Array<{ language: string; proficiency: string }>;
  projects: Array<{ name: string; description: string; link: string }>;
  sections: Array<{ id: SectionId; name: string; order: number; isVisible: boolean }>;
  selectedTemplate: 'classic' | 'modern' | 'minimal';
  typography: { font: string; size: number; lineHeight: number; sectionGap: number; accentColor: string };
  privacy: { showPhone: boolean; showAddress: boolean };
}

export type SectionId = 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'languages';

export const DEFAULT_SECTIONS: ResumeData['sections'] = [
  { id: 'summary', name: 'Summary', order: 0, isVisible: true },
  { id: 'experience', name: 'Experience', order: 1, isVisible: true },
  { id: 'projects', name: 'Projects', order: 2, isVisible: true },
  { id: 'education', name: 'Education', order: 3, isVisible: true },
  { id: 'skills', name: 'Skills', order: 4, isVisible: true },
  { id: 'languages', name: 'Languages', order: 5, isVisible: true },
];

export const RESUME_FONTS = [
  { value: "var(--font-geist), 'Inter', system-ui, sans-serif", label: 'Geist (sans-serif)' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia (serif)' },
  { value: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', label: 'System UI' },
];

/** Converts the old builder's rich-text HTML into plain text with line breaks. */
export function htmlToText(value: unknown) {
  if (typeof value !== 'string') return '';
  if (!/[<&]/.test(value)) return value.trim();
  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Splits text into bullet points when lines start with •, - or *. */
export function toBullets(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bulleted = lines.filter((l) => /^[•\-*]\s*/.test(l));
  if (bulleted.length >= Math.max(1, lines.length - 1)) {
    return { bullets: lines.map((l) => l.replace(/^[•\-*]\s*/, '')), text: '' };
  }
  return { bullets: [] as string[], text };
}

export const RESUME_FIELDS: Field[] = [
  { type: 'text', name: 'personalInfo.name', label: 'Name', required: true },
  { type: 'text', name: 'personalInfo.title', label: 'Title', required: true },
  { type: 'email', name: 'personalInfo.email', label: 'Email', required: true },
  { type: 'text', name: 'personalInfo.phone', label: 'Phone', help: 'Shown on the public resume only if "Show phone" is ticked.' },
  { type: 'text', name: 'personalInfo.address', label: 'Address', help: 'Shown on the public resume only if "Show address" is ticked.' },
  { type: 'checkbox', name: 'privacy.showPhone', label: 'Show phone on the public resume' },
  { type: 'checkbox', name: 'privacy.showAddress', label: 'Show address on the public resume' },
  { type: 'url', name: 'personalInfo.linkedin', label: 'LinkedIn URL' },
  { type: 'url', name: 'personalInfo.github', label: 'GitHub URL' },
  { type: 'url', name: 'personalInfo.website', label: 'Website URL' },
  { type: 'image', name: 'photo', label: 'Photo', help: 'Leave empty for no photo.' },
  { type: 'select', name: 'personalInfo.photoShape', label: 'Photo shape', options: [{ value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' }] },
  { type: 'textarea', name: 'personalInfo.summary', label: 'Summary', rows: 5, required: true },
  { type: 'group', name: 'experience', label: 'Experience', itemLabel: 'Position', fields: [
    { type: 'text', name: 'company', label: 'Company', required: true },
    { type: 'text', name: 'position', label: 'Position', required: true },
    { type: 'text', name: 'startDate', label: 'Start', required: true, placeholder: 'e.g. April 2025' },
    { type: 'text', name: 'endDate', label: 'End', required: true, placeholder: 'e.g. Present' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 5, help: 'Start lines with • for bullet points.' },
  ] },
  { type: 'group', name: 'projects', label: 'Projects', itemLabel: 'Project', fields: [
    { type: 'text', name: 'name', label: 'Name', required: true },
    { type: 'url', name: 'link', label: 'Link' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 3 },
  ] },
  { type: 'group', name: 'education', label: 'Education', itemLabel: 'Education', fields: [
    { type: 'text', name: 'institution', label: 'Institution', required: true },
    { type: 'text', name: 'degree', label: 'Degree', required: true },
    { type: 'text', name: 'startDate', label: 'Start', required: true },
    { type: 'text', name: 'endDate', label: 'End', required: true },
    { type: 'text', name: 'scoreType', label: 'Score type', placeholder: 'CGPA / Percentage' },
    { type: 'text', name: 'scoreValue', label: 'Score' },
    { type: 'textarea', name: 'description', label: 'Description', rows: 2 },
  ] },
  { type: 'group', name: 'skillCategories', label: 'Skill categories', itemLabel: 'Category', fields: [
    { type: 'text', name: 'name', label: 'Category', required: true },
    { type: 'text', name: 'items', label: 'Skills', required: true, max: 600, help: 'Comma-separated.' },
  ] },
  { type: 'group', name: 'languages', label: 'Languages', itemLabel: 'Language', fields: [
    { type: 'text', name: 'language', label: 'Language', required: true },
    { type: 'text', name: 'proficiency', label: 'Proficiency', required: true },
  ] },
  { type: 'group', name: 'sections', label: 'Sections (order & visibility)', itemLabel: 'Section', fields: [
    { type: 'select', name: 'id', label: 'Section', options: DEFAULT_SECTIONS.map((s) => ({ value: s.id, label: s.name })) },
    { type: 'text', name: 'name', label: 'Heading', required: true },
    { type: 'checkbox', name: 'isVisible', label: 'Visible' },
  ] },
  { type: 'select', name: 'selectedTemplate', label: 'Template', options: [
    { value: 'classic', label: 'Classic' }, { value: 'modern', label: 'Modern (sidebar)' }, { value: 'minimal', label: 'Minimal' },
  ] },
  { type: 'select', name: 'typography.font', label: 'Font', options: RESUME_FONTS },
  { type: 'number', name: 'typography.size', label: 'Base font size (px)', min: 10, max: 16 },
  { type: 'number', name: 'typography.lineHeight', label: 'Line height', min: 1.1, max: 2 },
  { type: 'number', name: 'typography.sectionGap', label: 'Space between sections (px)', min: 4, max: 40 },
  { type: 'text', name: 'typography.accentColor', label: 'Accent colour', placeholder: '#1e3a5f' },
];

/** Brings any stored/partial resume into a complete, safe shape. */
export function normaliseResume(raw: Partial<ResumeData> & Record<string, unknown>, fallback: ResumeData): ResumeData {
  const p = (raw.personalInfo ?? {}) as Partial<ResumeData['personalInfo']>;
  const t = (raw.typography ?? {}) as Partial<ResumeData['typography']>;
  const fonts = RESUME_FONTS.map((f) => f.value);
  const clamp = (n: unknown, min: number, max: number, d: number) => {
    const v = Number(n);
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
  };
  const sections = (Array.isArray(raw.sections) && raw.sections.length ? raw.sections : fallback.sections)
    .filter((s) => DEFAULT_SECTIONS.some((d) => d.id === s.id))
    .map((s, i) => ({ id: s.id, name: s.name || s.id, order: typeof s.order === 'number' ? s.order : i, isVisible: s.isVisible !== false }))
    .sort((a, b) => a.order - b.order);
  for (const d of DEFAULT_SECTIONS) if (!sections.some((s) => s.id === d.id)) sections.push({ ...d, order: sections.length, isVisible: false });

  return {
    personalInfo: {
      name: p.name || fallback.personalInfo.name,
      title: p.title || fallback.personalInfo.title,
      email: p.email || fallback.personalInfo.email,
      phone: p.phone ?? '',
      address: p.address ?? '',
      linkedin: p.linkedin ?? '',
      github: p.github ?? '',
      website: p.website ?? '',
      photoUrl: p.photoUrl ?? '',
      photoShape: p.photoShape === 'square' ? 'square' : 'circle',
      summary: htmlToText(p.summary) || fallback.personalInfo.summary,
    },
    experience: (raw.experience ?? fallback.experience).map((e) => ({ ...e, description: htmlToText(e.description) })),
    education: (raw.education ?? fallback.education).map((e) => ({ ...e, scoreType: e.scoreType ?? '', scoreValue: e.scoreValue ?? '', description: htmlToText(e.description) })),
    skillCategories: raw.skillCategories ?? fallback.skillCategories,
    skills: raw.skills ?? [],
    languages: raw.languages ?? fallback.languages,
    projects: (raw.projects ?? fallback.projects).map((pr) => ({ ...pr, link: pr.link ?? '', description: htmlToText(pr.description) })),
    sections,
    selectedTemplate: (['classic', 'modern', 'minimal'] as const).includes(raw.selectedTemplate as 'classic') ? (raw.selectedTemplate as ResumeData['selectedTemplate']) : 'classic',
    typography: {
      font: fonts.includes(t.font ?? '') ? (t.font as string) : fonts[0],
      size: clamp(t.size, 10, 16, 13),
      lineHeight: clamp(t.lineHeight, 1.1, 2, 1.5),
      sectionGap: clamp(t.sectionGap, 4, 40, 16),
      accentColor: /^#[0-9a-f]{3,8}$/i.test(t.accentColor ?? '') ? (t.accentColor as string) : '#1e3a5f',
    },
    privacy: {
      showPhone: Boolean((raw.privacy as ResumeData['privacy'] | undefined)?.showPhone),
      showAddress: Boolean((raw.privacy as ResumeData['privacy'] | undefined)?.showAddress),
    },
  };
}

/** Removes private details the owner hasn't chosen to publish. */
export function publicResume(resume: ResumeData): ResumeData {
  return {
    ...resume,
    personalInfo: {
      ...resume.personalInfo,
      phone: resume.privacy.showPhone ? resume.personalInfo.phone : '',
      address: resume.privacy.showAddress ? resume.personalInfo.address : '',
    },
  };
}
