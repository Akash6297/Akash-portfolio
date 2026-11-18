// Shared contact-form rules: used by the form for instant feedback and by the API
// route as the source of truth. Keep them in one place so they never drift apart.

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 140 },
  message: { min: 20, max: 5000 },
  /** Submissions faster than this after the form loads are treated as bots. */
  minFillMs: 3000,
} as const;

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

// Pragmatic email check: something@something.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const { name, email, subject, message } = CONTACT_LIMITS;

  const n = input.name.trim();
  if (n.length < name.min) errors.name = 'Please enter your name.';
  else if (n.length > name.max) errors.name = `Please keep your name under ${name.max} characters.`;

  const e = input.email.trim();
  if (!e) errors.email = 'Please enter your email address.';
  else if (e.length > email.max || !EMAIL_RE.test(e)) errors.email = 'Please enter a valid email address.';

  const s = input.subject.trim();
  if (s.length < subject.min) errors.subject = 'Please add a short subject.';
  else if (s.length > subject.max) errors.subject = `Please keep the subject under ${subject.max} characters.`;

  const m = input.message.trim();
  if (m.length < message.min) errors.message = `Please share a few more details (at least ${message.min} characters).`;
  else if (m.length > message.max) errors.message = `Please keep your message under ${message.max} characters.`;

  return errors;
}
