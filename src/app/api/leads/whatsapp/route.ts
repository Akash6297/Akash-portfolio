import { tryDb } from '@/lib/db/connect';
import { Message } from '@/lib/db/models';
import { clientIp, fail, json, rateLimited, readJson, spamCheck, str } from '@/lib/api';

export const runtime = 'nodejs';

/** Records a WhatsApp chat request in the admin inbox (best effort). */
export async function POST(request: Request) {
  const body = await readJson(request, 4096);
  if (!body) return fail(400, 'Invalid request.');
  const spam = spamCheck(body, 2000);
  if (spam) return fail(400, spam);
  const name = str(body.name, 80);
  const contact = str(body.contact, 120);
  const message = str(body.message, 500);
  if (name.length < 2 || contact.length < 5) return fail(422, 'Please add your name and a phone number or email.');
  if (rateLimited(`wa:${clientIp(request)}`, 5, 10 * 60_000)) return fail(429, 'Too many requests.');
  const saved = await tryDb(() =>
    Message.create({ name, email: contact, subject: 'WhatsApp chat', message: `[WhatsApp Lead]: ${message || '(no message)'}`, source: 'whatsapp' }),
  );
  return json({ ok: true, saved: Boolean(saved) });
}
