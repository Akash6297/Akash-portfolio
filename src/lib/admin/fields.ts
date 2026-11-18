// Field definitions for everything editable in the admin panel. Shared by the form
// renderer (browser) and the API (server-side validation via `sanitize`).

export type Field =
  | { type: 'text' | 'textarea' | 'url' | 'email' | 'month' | 'paragraphs'; name: string; label: string; required?: boolean; max?: number; help?: string; placeholder?: string; rows?: number }
  | { type: 'number'; name: string; label: string; required?: boolean; min?: number; max?: number; help?: string }
  | { type: 'checkbox'; name: string; label: string; help?: string }
  | { type: 'select'; name: string; label: string; options: Array<{ value: string; label: string }>; required?: boolean; help?: string }
  | { type: 'checklist'; name: string; label: string; options: Array<{ value: string; label: string }>; help?: string }
  | { type: 'lines' | 'tags'; name: string; label: string; help?: string; required?: boolean }
  | { type: 'image'; name: string; label: string; help?: string; required?: boolean }
  | { type: 'images'; name: string; label: string; help?: string }
  | { type: 'group'; name: string; label: string; fields: Field[]; itemLabel: string; help?: string };

export interface CollectionConfig {
  key: string;
  label: string;
  singular: string;
  description: string;
  fields: Field[];
  /** Field shown as the item title in lists. */
  titleField: string;
  subtitleField?: string;
  /** Unique, URL-safe field (projects use `slug`). */
  uniqueField?: string;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    if (!cur[k] || typeof cur[k] !== 'object' || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  });
  cur[keys[keys.length - 1]] = value;
}

// ── Validation ────────────────────────────────────────────────────────────────

const URL_RE = /^(https?:\/\/[^\s]+|\/[^\s]*|mailto:[^\s]+)$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MONTH_RE = /^(\d{4}-(0[1-9]|1[0-2])|present)$/;

export function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

const asString = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
const asList = (v: unknown) =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split(/\r?\n/) : [])
    .map((x) => asString(x, 1000))
    .filter(Boolean)
    .slice(0, 100);

function sanitizeImage(v: unknown) {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const src = asString(o.src, 1000);
  if (!src || !URL_RE.test(src)) return undefined;
  const image: Record<string, unknown> = {
    src,
    alt: asString(o.alt, 300),
    width: Math.max(1, Math.round(Number(o.width) || 1600)),
    height: Math.max(1, Math.round(Number(o.height) || 1000)),
  };
  if (o.caption) image.caption = asString(o.caption, 300);
  if (o.device === 'mobile' || o.device === 'desktop') image.device = o.device;
  return image;
}

/**
 * Keeps only the defined fields, coerces types and validates. Returns the clean
 * object and a map of field errors (empty when valid).
 */
export function sanitize(fields: Field[], input: unknown, prefix = ''): { value: Record<string, unknown>; errors: Record<string, string> } {
  const value: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const raw = getPath(input, field.name);
    const key = prefix + field.name;
    let out: unknown;
    switch (field.type) {
      case 'text':
      case 'textarea': {
        out = asString(raw, field.max ?? (field.type === 'text' ? 300 : 5000));
        break;
      }
      case 'paragraphs': {
        // Stored as string[]; edited as text with blank lines between paragraphs.
        const parts = Array.isArray(raw) ? raw : asString(raw, 20000).split(/\r?\n\s*\r?\n/);
        out = parts.map((p) => asString(p, 3000).replace(/\s*\r?\n\s*/g, ' ')).filter(Boolean).slice(0, 20);
        break;
      }
      case 'url': {
        out = asString(raw, 1000);
        if (out && !URL_RE.test(out as string)) errors[key] = 'Enter a full URL (https://…) or a path starting with /.';
        break;
      }
      case 'email': {
        out = asString(raw, 254);
        if (out && !EMAIL_RE.test(out as string)) errors[key] = 'Enter a valid email address.';
        break;
      }
      case 'month': {
        out = asString(raw, 20).toLowerCase();
        if (out && !MONTH_RE.test(out as string)) errors[key] = 'Use YYYY-MM (e.g. 2025-04) or "present".';
        break;
      }
      case 'number': {
        const n = Number(raw);
        out = Number.isFinite(n) ? n : 0;
        break;
      }
      case 'checkbox':
        out = raw === true || raw === 'true' || raw === 'on';
        break;
      case 'select': {
        const s = asString(raw, 100);
        out = field.options.some((o) => o.value === s) ? s : field.options[0]?.value ?? '';
        break;
      }
      case 'checklist': {
        const allowed = new Set(field.options.map((o) => o.value));
        out = (Array.isArray(raw) ? raw : []).map((x) => asString(x, 100)).filter((x) => allowed.has(x));
        break;
      }
      case 'lines':
        out = asList(raw);
        break;
      case 'tags':
        out = (Array.isArray(raw) ? raw : asString(raw, 2000).split(',')).map((x) => asString(x, 100)).filter(Boolean).slice(0, 60);
        break;
      case 'image':
        out = sanitizeImage(raw);
        break;
      case 'images':
        out = (Array.isArray(raw) ? raw : []).map(sanitizeImage).filter(Boolean).slice(0, 30);
        break;
      case 'group': {
        const items = Array.isArray(raw) ? raw.slice(0, 50) : [];
        out = items.map((item, i) => {
          const r = sanitize(field.fields, item, `${key}.${i}.`);
          Object.assign(errors, r.errors);
          return r.value;
        });
        break;
      }
    }
    const required = 'required' in field && field.required;
    const empty = out === undefined || out === '' || (Array.isArray(out) && out.length === 0);
    if (required && empty && !errors[key]) errors[key] = `${field.label} is required.`;
    if (out !== undefined) setPath(value, field.name, out);
  }
  return { value, errors };
}

// ── Option lists ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'full-stack', label: 'Full-Stack' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'products', label: 'SaaS / Products' },
  { value: 'experiments', label: 'Experiments' },
];

export const SERVICE_ICONS = [
  { value: 'layers', label: 'Layers (full-stack)' },
  { value: 'layout', label: 'Layout (frontend)' },
  { value: 'server', label: 'Server (backend)' },
  { value: 'shopping-bag', label: 'Shopping bag (e-commerce)' },
  { value: 'building', label: 'Building (business)' },
  { value: 'app-window', label: 'App window (web apps)' },
  { value: 'gauge', label: 'Gauge (optimisation)' },
  { value: 'pen-tool', label: 'Pen tool (WordPress / design)' },
];

export const SOCIAL_IDS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
];

// ── Collections ──────────────────────────────────────────────────────────────

export const COLLECTIONS: CollectionConfig[] = [
  {
    key: 'projects',
    label: 'Projects',
    singular: 'project',
    description: 'Projects on the home page and their case-study pages.',
    titleField: 'name',
    subtitleField: 'category',
    uniqueField: 'slug',
    fields: [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'text', name: 'slug', label: 'URL slug', required: true, help: 'Used in /work/<slug>. Lowercase letters, numbers and dashes.' },
      { type: 'text', name: 'tagline', label: 'One-line summary', required: true, max: 240 },
      { type: 'text', name: 'category', label: 'Category label', required: true, placeholder: 'e.g. Productivity SaaS' },
      { type: 'checklist', name: 'filters', label: 'Filter tabs', options: FILTERS },
      { type: 'checkbox', name: 'featured', label: 'Featured (large layout on the home page)' },
      { type: 'checkbox', name: 'published', label: 'Published (visible on the site)' },
      { type: 'number', name: 'order', label: 'Order', help: 'Lower numbers appear first.' },
      { type: 'text', name: 'year', label: 'Year' },
      { type: 'text', name: 'role', label: 'Your role', required: true },
      { type: 'select', name: 'kind', label: 'Type', options: [
        { value: 'product', label: 'Own product' }, { value: 'client', label: 'Client project' },
        { value: 'personal', label: 'Personal project' }, { value: 'team', label: 'Team project' },
      ] },
      { type: 'tags', name: 'stack', label: 'Technologies', help: 'Comma-separated.' },
      { type: 'url', name: 'links.live', label: 'Live URL' },
      { type: 'url', name: 'links.source', label: 'Source code URL' },
      { type: 'image', name: 'cover', label: 'Cover screenshot', help: 'Leave empty to use a generated cover.' },
      { type: 'images', name: 'gallery', label: 'Screenshots' },
      { type: 'lines', name: 'architecture', label: 'Architecture flow', help: 'One step per line, left to right.' },
      { type: 'textarea', name: 'caseStudy.overview', label: 'Overview', required: true },
      { type: 'textarea', name: 'caseStudy.problem', label: 'Problem', required: true },
      { type: 'textarea', name: 'caseStudy.solution', label: 'Solution', required: true },
      { type: 'lines', name: 'caseStudy.process', label: 'Development process', help: 'One step per line.' },
      { type: 'lines', name: 'caseStudy.features', label: 'Key features', help: 'One per line.' },
      { type: 'lines', name: 'caseStudy.results', label: 'Results', help: 'Only verifiable outcomes. One per line.' },
    ],
  },
  {
    key: 'experience',
    label: 'Experience',
    singular: 'role',
    description: 'Jobs on the experience timeline, newest first.',
    titleField: 'role',
    subtitleField: 'company',
    fields: [
      { type: 'text', name: 'role', label: 'Role / title', required: true },
      { type: 'text', name: 'company', label: 'Company', required: true },
      { type: 'text', name: 'location', label: 'Location' },
      { type: 'month', name: 'start', label: 'Start (YYYY-MM)', required: true },
      { type: 'month', name: 'end', label: 'End (YYYY-MM or "present")', required: true },
      { type: 'select', name: 'type', label: 'Type', options: [
        { value: 'Full-time', label: 'Full-time' }, { value: 'Freelance', label: 'Freelance' }, { value: 'Internship', label: 'Internship' },
      ] },
      { type: 'text', name: 'summary', label: 'One-line summary', max: 240 },
      { type: 'lines', name: 'responsibilities', label: 'Responsibilities', help: 'One per line.' },
      { type: 'tags', name: 'stack', label: 'Technologies', help: 'Comma-separated.' },
      { type: 'number', name: 'order', label: 'Order', help: 'Lower numbers appear first.' },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    singular: 'education entry',
    description: 'Degrees and schools.',
    titleField: 'degree',
    subtitleField: 'institution',
    fields: [
      { type: 'text', name: 'degree', label: 'Degree', required: true },
      { type: 'text', name: 'institution', label: 'Institution', required: true },
      { type: 'text', name: 'start', label: 'Start year', required: true },
      { type: 'text', name: 'end', label: 'End year', required: true },
      { type: 'text', name: 'score', label: 'Score', placeholder: 'e.g. CGPA 8.32' },
      { type: 'number', name: 'order', label: 'Order' },
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    singular: 'certification',
    description: 'Certificates with credential links.',
    titleField: 'title',
    subtitleField: 'issuer',
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true },
      { type: 'text', name: 'issuer', label: 'Issuer', required: true },
      { type: 'text', name: 'platform', label: 'Platform', placeholder: 'e.g. Coursera' },
      { type: 'text', name: 'date', label: 'Date', required: true, placeholder: 'e.g. Sep 2022' },
      { type: 'text', name: 'credentialId', label: 'Credential ID' },
      { type: 'url', name: 'url', label: 'Credential URL' },
      { type: 'number', name: 'order', label: 'Order' },
    ],
  },
  {
    key: 'achievements',
    label: 'Achievements',
    singular: 'achievement',
    description: 'Awards and milestones. The section appears on the site once there is at least one.',
    titleField: 'title',
    subtitleField: 'date',
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true },
      { type: 'textarea', name: 'description', label: 'Description', required: true, rows: 3 },
      { type: 'text', name: 'date', label: 'Date' },
      { type: 'url', name: 'link', label: 'Link' },
      { type: 'image', name: 'image', label: 'Image' },
      { type: 'number', name: 'order', label: 'Order' },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    singular: 'skill group',
    description: 'Groups of technologies in the expertise section.',
    titleField: 'title',
    subtitleField: 'description',
    fields: [
      { type: 'text', name: 'title', label: 'Group title', required: true },
      { type: 'text', name: 'id', label: 'Group ID', required: true, help: 'Short identifier, e.g. "frontend".' },
      { type: 'text', name: 'description', label: 'Description', max: 240 },
      { type: 'group', name: 'skills', label: 'Skills', itemLabel: 'Skill', fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'text', name: 'icon', label: 'Icon key', help: 'Simple Icons slug, e.g. react, nextdotjs. Leave empty for a monogram.' },
        { type: 'text', name: 'note', label: 'What you use it for', required: true, max: 200 },
        { type: 'tags', name: 'aliases', label: 'Also matches', help: 'Other names used in project stacks, comma-separated.' },
      ] },
      { type: 'number', name: 'order', label: 'Order' },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    singular: 'service',
    description: 'Services offered, each optionally linked to a project that proves it.',
    titleField: 'title',
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true },
      { type: 'textarea', name: 'description', label: 'Description', required: true, rows: 3 },
      { type: 'select', name: 'icon', label: 'Icon', options: SERVICE_ICONS },
      { type: 'lines', name: 'deliverables', label: 'Deliverables', help: 'One per line.' },
      { type: 'text', name: 'proof', label: 'Proof project slug', help: 'e.g. tribal-trends. Leave empty for none.' },
      { type: 'number', name: 'order', label: 'Order' },
    ],
  },
];

export const collectionConfig = (key: string) => COLLECTIONS.find((c) => c.key === key);

export const PROFILE_FIELDS: Field[] = [
  { type: 'checkbox', name: 'availability.open', label: 'Available for opportunities' },
  { type: 'text', name: 'availability.label', label: 'Availability label' },
  { type: 'text', name: 'availability.detail', label: 'Availability detail' },
  { type: 'text', name: 'name', label: 'Full name', required: true },
  { type: 'text', name: 'role', label: 'Role', required: true },
  { type: 'email', name: 'email', label: 'Public email', required: true },
  { type: 'text', name: 'whatsapp', label: 'WhatsApp number', help: 'International format, digits only (e.g. 9198xxxxxxxx). Leave empty to hide the WhatsApp option.' },
  { type: 'text', name: 'location.city', label: 'City' },
  { type: 'text', name: 'location.region', label: 'State / region' },
  { type: 'text', name: 'location.country', label: 'Country' },
  { type: 'text', name: 'location.label', label: 'Location (as displayed)' },
  { type: 'text', name: 'current.role', label: 'Current role' },
  { type: 'text', name: 'current.company', label: 'Current company' },
  { type: 'text', name: 'experienceSummary', label: 'Experience summary', placeholder: 'e.g. 2+ years' },
  { type: 'text', name: 'hero.headline', label: 'Hero headline', required: true, help: 'Wrap words in *asterisks* for italics.' },
  { type: 'textarea', name: 'hero.statement', label: 'Hero statement', rows: 2 },
  { type: 'textarea', name: 'hero.intro', label: 'Hero introduction', rows: 2 },
  { type: 'image', name: 'portrait', label: 'Portrait', help: 'A 4:5 crop works best.' },
  { type: 'textarea', name: 'about.lead', label: 'About — lead sentence', rows: 2 },
  { type: 'paragraphs', name: 'about.paragraphs', label: 'About — paragraphs', help: 'Separate paragraphs with a blank line.', rows: 10 },
  { type: 'group', name: 'about.principles', label: 'About — principles', itemLabel: 'Principle', fields: [
    { type: 'text', name: 'title', label: 'Title', required: true },
    { type: 'text', name: 'text', label: 'Text', required: true },
  ] },
  { type: 'group', name: 'about.languages', label: 'Languages', itemLabel: 'Language', fields: [
    { type: 'text', name: 'language', label: 'Language', required: true },
    { type: 'text', name: 'level', label: 'Level', required: true },
  ] },
  { type: 'text', name: 'contact.headline', label: 'Contact headline' },
  { type: 'textarea', name: 'contact.text', label: 'Contact text', rows: 2 },
  { type: 'group', name: 'socials', label: 'Social links', itemLabel: 'Link', fields: [
    { type: 'select', name: 'id', label: 'Type', options: SOCIAL_IDS },
    { type: 'text', name: 'label', label: 'Label', required: true },
    { type: 'text', name: 'handle', label: 'Handle shown', required: true },
    { type: 'url', name: 'href', label: 'URL', required: true },
  ] },
  { type: 'url', name: 'resume.href', label: 'Resume PDF link', help: 'Path or URL of the downloadable PDF.' },
  { type: 'text', name: 'resume.fileName', label: 'Resume PDF file name' },
  { type: 'text', name: 'footer.statement', label: 'Footer statement' },
  { type: 'text', name: 'footer.closing', label: 'Footer closing line' },
];
