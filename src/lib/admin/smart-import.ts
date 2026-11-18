// Smart import: turns pasted text (or OCR output) into a pre-filled admin form.
// Deterministic heuristics — no AI service, nothing leaves the browser.

export type ImportTarget = 'projects' | 'experience' | 'education' | 'certifications' | 'services' | 'achievements';

const KEYWORDS: Record<ImportTarget, RegExp> = {
  experience: /\b(experience|position|role|company|employ|job|intern(ship)?|worked|responsibilit|full[- ]time|freelance|present)\b/gi,
  projects: /\b(project|built|app|application|website|platform|github|repo|demo|live|stack|features?|deployed)\b/gi,
  education: /\b(b\.?tech|bachelor|master|degree|university|college|school|cgpa|gpa|percentage|graduat)\b/gi,
  certifications: /\b(certificat|credential|coursera|udemy|specialization|issued|license)\b/gi,
  services: /\b(service|offer|we provide|i provide|package|clients? get|deliverables?)\b/gi,
  achievements: /\b(award|winner|won|rank|achievement|hackathon|recogni[sz]ed|prize)\b/gi,
};

const WEIGHT: Record<ImportTarget, number> = { experience: 1.1, projects: 1, education: 1.6, certifications: 1.8, services: 1.2, achievements: 1.5 };

/** Technologies recognised in free text (matched case-insensitively, output in this spelling). */
const TECH = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'PostgreSQL', 'MySQL', 'SQLite', 'Supabase',
  'Firebase', 'Tailwind CSS', 'SCSS', 'HTML', 'CSS', 'Vite', 'Redux', 'React Router', 'Python', 'Django', 'Flask', 'Streamlit', 'Java',
  'PHP', 'WordPress', 'AWS', 'Azure', 'Docker', 'Vercel', 'Netlify', 'Git', 'GitHub', 'REST API', 'GraphQL', 'JWT', 'bcrypt',
  'Nodemailer', 'Razorpay', 'Stripe', 'Framer Motion', 'Chart.js', 'Google Apps Script', 'Google Sheets', 'PWA', 'SEO', 'Figma',
];

const MONTHS: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

const JOB_TITLE = /\b(developer|engineer|designer|manager|analyst|consultant|specialist|architect|lead|intern|administrator|officer)\b/i;
const ROLE_AT_COMPANY = /^[^\n]{2,60}\s(?:at|@)\s[^\n]{2,60}$/im;

export function detectSection(text: string): { target: ImportTarget; scores: Record<ImportTarget, number> } {
  const scores = Object.fromEntries(
    (Object.keys(KEYWORDS) as ImportTarget[]).map((k) => [k, (text.match(KEYWORDS[k]) ?? []).length * WEIGHT[k]]),
  ) as Record<ImportTarget, number>;
  // Structural signals are stronger than single keywords.
  const firstLine = text.trim().split('\n')[0] ?? '';
  if (JOB_TITLE.test(firstLine)) scores.experience += 2;
  if (ROLE_AT_COMPANY.test(firstLine)) scores.experience += 3;
  if (DATE_RANGE.test(text)) {
    scores.experience += 2;
    scores.education += 1;
  }
  const target = (Object.keys(scores) as ImportTarget[]).reduce((best, k) => (scores[k] > scores[best] ? k : best), 'experience' as ImportTarget);
  return { target, scores };
}

/** Light clean-up: whitespace, bullet glyphs, sentence capitals. Never rewrites wording. */
export function tidy(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\s*[•●▪◦‣\-*]\s*/gm, '• ')
    .split('\n')
    .map((l) => l.trim())
    // Capitalise sentence starts, but never URLs or e-mail addresses.
    .map((l) => (l && /^[a-z]/.test(l) && !/^(https?:\/\/|www\.|\S+@\S+)/i.test(l) ? l[0].toUpperCase() + l.slice(1) : l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
const bullets = (text: string) => lines(text).filter((l) => /^[•●▪\-*]/.test(l)).map((l) => l.replace(/^[•●▪\-*]\s*/, ''));
const urls = (text: string) => [...text.matchAll(/https?:\/\/[^\s)>\]]+/gi)].map((m) => m[0].replace(/[.,;]$/, ''));
const MONTH_YEAR = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4})\b/i;
function findLocation(text: string) {
  if (/\bremote\b/i.test(text)) return 'Remote';
  // "City, Region" or "City, Region, Country" (multi-word names allowed).
  // Spaces only (not \s), so a match never spans two lines.
  const m = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*, *[A-Z][a-z]+(?: [A-Z][a-z]+)*(?:, *[A-Z][a-z]+)?)\b/);
  return m?.[1] ?? '';
}
const techIn = (text: string) => TECH.filter((t) => new RegExp(`(^|[^\\w])${t.replace(/[.+]/g, '\\$&')}(?![\\w])`, 'i').test(text));
const proseLines = (text: string) => lines(text).filter((l) => !/^[•●▪\-*]/.test(l) && !/^https?:\/\//.test(l));

/** "Apr 2025", "04/2025", "2025-04", "Present" → "YYYY-MM" | "present". */
function toMonth(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (/present|current|now/.test(s)) return 'present';
  let m = s.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (m && MONTHS[m[1]]) return `${m[2]}-${MONTHS[m[1]]}`;
  m = s.match(/(\d{1,2})[/-](\d{4})/);
  if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
  m = s.match(/(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  m = s.match(/(\d{4})/);
  return m ? `${m[1]}-01` : '';
}

const DATE_RANGE = /((?:[A-Za-z]{3,9}\.?\s+\d{4})|(?:\d{1,2}[/-]\d{4})|(?:\d{4}-\d{2})|(?:\d{4}))\s*(?:–|—|-|to)\s*((?:[A-Za-z]{3,9}\.?\s+\d{4})|(?:\d{1,2}[/-]\d{4})|(?:\d{4}-\d{2})|(?:\d{4})|present|current|now)/i;

export function extract(target: ImportTarget, raw: string): Record<string, unknown> {
  const text = raw.trim();
  const ls = proseLines(text);
  const first = ls[0] ?? '';
  const rest = ls.slice(1);
  const found = urls(text);

  switch (target) {
    case 'experience': {
      const range = text.match(DATE_RANGE);
      // "Role at Company" / "Role — Company" / "Role, Company"
      const head = first.replace(DATE_RANGE, '').trim();
      const parts = head.split(/\s+(?:at|@)\s+|\s+[—–|-]\s+|,\s+/);
      const type = /freelance/i.test(text) ? 'Freelance' : /intern/i.test(text) ? 'Internship' : 'Full-time';
      return {
        role: parts[0] ?? '',
        company: parts[1] ?? (rest[0] && !DATE_RANGE.test(rest[0]) ? rest[0] : ''),
        location: findLocation(text),
        start: range ? toMonth(range[1]) : '',
        end: range ? toMonth(range[2]) : 'present',
        type,
        summary: rest.find((l) => !DATE_RANGE.test(l) && l.length > 30)?.slice(0, 240) ?? '',
        responsibilities: bullets(text),
        stack: techIn(text),
      };
    }
    case 'projects': {
      const github = found.find((u) => /github\.com/.test(u));
      const live = found.find((u) => !/github\.com/.test(u));
      const name = first.replace(/[:|—–-].*$/, '').trim();
      const prose = rest.join(' ');
      const sentences = prose.split(/(?<=[.!?])\s+/).filter(Boolean);
      return {
        name,
        slug: '',
        tagline: (first.includes(':') || first.includes('—') ? first.split(/[:—]/).slice(1).join(':').trim() : sentences[0] ?? '').slice(0, 240),
        category: /e-?commerce|store|shop/i.test(text) ? 'E-commerce' : /portfolio/i.test(text) ? 'Portfolio website' : 'Web app',
        filters: [
          ...(/(node|express|api|database|mongo|postgres|backend)/i.test(text) && /(react|next|frontend|ui)/i.test(text) ? ['full-stack'] : []),
          ...(/(react|next|frontend|ui|tailwind)/i.test(text) ? ['frontend'] : []),
          ...(/(node|express|api|backend|database)/i.test(text) ? ['backend'] : []),
        ],
        role: 'Design and development',
        kind: /client/i.test(text) ? 'client' : 'personal',
        stack: techIn(text),
        links: { live: live ?? '', source: github ?? '' },
        caseStudy: { overview: prose.slice(0, 1200), problem: '', solution: '', process: [], features: bullets(text), results: [] },
        published: false,
      };
    }
    case 'education': {
      const range = text.match(/(\d{4})\s*(?:–|—|-|to)\s*(\d{4}|present)/i);
      const score = text.match(/(cgpa|gpa|percentage|score)\s*[:\-]?\s*([\d.]+%?)/i) ?? text.match(/([\d.]+%)/);
      const degreeLine = ls.find((l) => /b\.?tech|bachelor|master|degree|diploma|secondary|class\s*\d+/i.test(l)) ?? first;
      const institution = ls.find((l) => l !== degreeLine && /(university|college|school|institute)/i.test(l)) ?? (degreeLine === first ? rest[0] ?? '' : first);
      return {
        degree: degreeLine.replace(range?.[0] ?? '', '').trim(),
        institution: institution.replace(range?.[0] ?? '', '').trim(),
        start: range?.[1] ?? '',
        end: range?.[2] ?? '',
        score: score ? (score[2] ? `${score[1].toUpperCase()} ${score[2]}` : score[1]) : '',
      };
    }
    case 'certifications': {
      const id = text.match(/(?:credential\s*id|certificate\s*id|id)\s*[:#]?\s*([A-Z0-9-]{6,})/i);
      const date = text.match(MONTH_YEAR);
      const issuer = text.match(/(?:issued by|by|from|offered by)\s+([^\n.,]+)/i);
      const platform = (text.match(/\b(coursera|udemy|edx|linkedin learning|google|microsoft|aws|meta|ibm)\b/i) ?? [])[1];
      return {
        title: first,
        issuer: (issuer?.[1]?.trim() ?? rest[0] ?? '').replace(/\s+(?:on|via|through)\s+.+$/i, ''),
        platform: platform ? platform[0].toUpperCase() + platform.slice(1) : '',
        date: date?.[1] ?? '',
        credentialId: id?.[1] ?? '',
        url: found[0] ?? '',
      };
    }
    case 'services':
      return { title: first, description: rest.filter((l) => !/^[•\-*]/.test(l)).join(' ').slice(0, 600), icon: 'layers', deliverables: bullets(text) };
    case 'achievements': {
      const date = text.match(MONTH_YEAR) ?? text.match(/\b((?:19|20)\d{2})\b/);
      return { title: first, description: rest.join(' ').slice(0, 1000), date: date?.[1] ?? '', link: found[0] ?? '' };
    }
  }
}
