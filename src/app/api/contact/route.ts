import { CONTACT_LIMITS, validateContact, type ContactInput } from '@/lib/contact';
import { tryDb } from '@/lib/db/connect';
import { Message } from '@/lib/db/models';
import { adminInbox, isEmailConfigured, sendTemplate } from '@/lib/email/mailer';
import { getProfile } from '@/lib/content';
import { clientIp, fail, json, rateLimited, readJson, spamCheck } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJson(request, 16 * 1024);
  if (!body) return fail(400, 'Invalid request.');

  const spam = spamCheck(body, CONTACT_LIMITS.minFillMs);
  if (spam) return fail(400, spam);

  const input: ContactInput = {
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
    subject: String(body.subject ?? ''),
    message: String(body.message ?? ''),
  };
  const errors = validateContact(input);
  if (Object.keys(errors).length) return fail(422, 'Please check the highlighted fields.', { fields: errors });

  if (rateLimited(`contact:${clientIp(request)}`, 5, 10 * 60_000)) {
    return fail(429, 'Too many messages in a short time. Please try again later or email me directly.');
  }

  const profile = await getProfile();
  const vars = {
    name: input.name.replace(/[\r\n]+/g, ' ').trim(),
    email: input.email.trim(),
    subject: input.subject.replace(/[\r\n]+/g, ' ').trim(),
    message: input.message.trim(),
  };

  // 1. Save to the admin inbox (when a database is configured).
  const saved = await tryDb(() => Message.create({ ...vars, source: 'contact' }));

  // 2. Notify you by email.
  let notified = false;
  if (isEmailConfigured()) {
    try {
      await sendTemplate('adminNotification', adminInbox(), vars, { name: vars.name, address: vars.email });
      notified = true;
    } catch (error) {
      console.error('[contact] notification failed:', (error as Error).message);
    }
  }

  // Never claim success unless the message is stored or delivered.
  if (!saved && !notified) {
    return fail(isEmailConfigured() ? 502 : 503, `Your message couldn't be delivered right now. Please email ${profile.email} directly.`);
  }

  // 3. Confirmation to the visitor (switch off in Admin → Email templates).
  if (isEmailConfigured()) {
    try {
      await sendTemplate('userConfirmation', vars.email, vars);
    } catch (error) {
      console.warn('[contact] confirmation failed:', (error as Error).message);
    }
  }

  return json({ ok: true, message: "Thanks — your message has reached me. I'll reply to the email you provided." });
}
