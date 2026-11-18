import 'server-only';
import nodemailer from 'nodemailer';
import { tryDb } from '@/lib/db/connect';
import { EmailTemplate } from '@/lib/db/models';
import { renderHtml, renderSubject, renderText, templateDefinition, type TemplateConfig } from './templates';

export function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

/** Where notifications for you are delivered. */
export function adminInbox() {
  return process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER || '';
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('Email is not configured (EMAIL_USER / EMAIL_PASS).');
  }
}

function transporter() {
  const port = Number(process.env.EMAIL_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: { name: string; address: string };
  fromName?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo, fromName = 'Akash Mandal' }: SendOptions) {
  if (!isEmailConfigured()) throw new EmailNotConfiguredError();
  await transporter().sendMail({
    from: { name: fromName, address: process.env.EMAIL_USER! },
    to,
    subject,
    html,
    text,
    replyTo,
  });
}

/** The stored template (if customised in the admin panel) merged over the built-in default. */
export async function loadTemplate(name: string): Promise<{ subject: string; config: TemplateConfig }> {
  const def = templateDefinition(name);
  if (!def) throw new Error(`Unknown email template: ${name}`);
  const doc = await tryDb(() => EmailTemplate.findOne({ templateName: name }).lean());
  if (!doc) return { subject: def.subject, config: def.config };
  let stored: Partial<TemplateConfig> = {};
  try {
    stored = JSON.parse(doc.htmlContent);
  } catch {
    // Unparseable legacy content: fall back to the default body.
  }
  return { subject: doc.subject || def.subject, config: { ...def.config, ...stored } };
}

/** Renders a template with variables and sends it. Returns false if the template is switched off. */
export async function sendTemplate(name: string, to: string, vars: Record<string, string>, replyTo?: SendOptions['replyTo']) {
  const { subject, config } = await loadTemplate(name);
  if (config.enabled === false) return false;
  await sendEmail({
    to,
    subject: renderSubject(subject, vars),
    html: renderHtml(config, vars),
    text: renderText(config, vars),
    replyTo,
    fromName: name === 'adminNotification' || name === 'bookingRequest' ? 'Portfolio' : 'Akash Mandal',
  });
  return true;
}
