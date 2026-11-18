import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { EmailTemplate } from '@/lib/db/models';
import { adminInbox, sendTemplate } from '@/lib/email/mailer';
import { templateDefinition, type TemplateConfig } from '@/lib/email/templates';
import { fail, handleError, json, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ name: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { name } = await params;
  const def = templateDefinition(name);
  if (!def) return fail(404, 'Unknown template.');
  const body = await readJson<{ subject?: unknown; config?: Partial<TemplateConfig> }>(request, 32 * 1024);
  const subject = str(body?.subject, 200);
  const c = body?.config ?? {};
  if (!subject) return fail(400, 'The subject cannot be empty.');
  if (!str(c.bodyText, 10000)) return fail(400, 'The body cannot be empty.');

  const config: TemplateConfig = {
    primaryColor: /^#[0-9a-f]{3,8}$/i.test(String(c.primaryColor)) ? String(c.primaryColor) : def.config.primaryColor,
    headerText: str(c.headerText, 200),
    bodyText: str(c.bodyText, 10000),
    footerText: str(c.footerText, 300),
    showSocials: c.showSocials === true,
    githubLink: str(c.githubLink, 300),
    linkedinLink: str(c.linkedinLink, 300),
    ...(def.optional ? { enabled: c.enabled !== false } : {}),
  };

  try {
    await requireDb();
    await EmailTemplate.findOneAndUpdate(
      { templateName: name },
      { templateName: name, subject, htmlContent: JSON.stringify(config), variables: def.variables.map((v) => `{{${v}}}`) },
      { upsert: true },
    );
    return json({ ok: true, message: 'Template saved.' });
  } catch (err) {
    return handleError(err, 'email-templates/put');
  }
}

/** Sends the saved template to your own inbox with sample values. */
export async function POST(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { name } = await params;
  const def = templateDefinition(name);
  if (!def) return fail(404, 'Unknown template.');
  const sample: Record<string, string> = {
    name: 'Sample Visitor', email: 'visitor@example.com', subject: 'Sample subject', message: 'This is a sample message.\nIt has two lines.',
    replyMessage: 'Thanks for reaching out — here is my reply.', originalMessage: 'The original message would appear here.',
    date: '2026-12-01', time: '11:00 AM', meetingLink: 'https://meet.google.com/sample',
  };
  try {
    const to = adminInbox();
    if (!to) return fail(503, 'Email is not configured (EMAIL_USER / EMAIL_PASS).');
    const sent = await sendTemplate(name, to, sample);
    return json({ ok: true, message: sent ? `Test email sent to ${to}.` : 'This template is switched off, so nothing was sent.' });
  } catch (err) {
    return handleError(err, 'email-templates/test');
  }
}
