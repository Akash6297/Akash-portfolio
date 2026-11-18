import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Message } from '@/lib/db/models';
import { sendTemplate } from '@/lib/email/mailer';
import { EMAIL_RE, fail, handleError, json, readJson, str } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Message not found.');
  const reply = str((await readJson(request, 32 * 1024))?.replyMessage, 10000);
  if (reply.length < 2) return fail(400, 'Write a reply first.');
  try {
    await requireDb();
    const original = await Message.findById(id);
    if (!original) return fail(404, 'Message not found.');
    if (!EMAIL_RE.test(original.email)) {
      return fail(400, `"${original.email}" is not an email address, so the reply can't be emailed. WhatsApp leads may contain a phone number instead.`);
    }
    await sendTemplate('adminReply', original.email, {
      name: original.name,
      subject: original.subject || original.message.slice(0, 60),
      replyMessage: reply,
      originalMessage: original.message,
    });
    original.replied = true;
    original.isRead = true;
    original.replies = [...(original.replies ?? []), { text: reply, sentAt: new Date() }];
    await original.save();
    return json({ ok: true, message: `Reply sent to ${original.email}.` });
  } catch (err) {
    return handleError(err, 'messages/reply');
  }
}
