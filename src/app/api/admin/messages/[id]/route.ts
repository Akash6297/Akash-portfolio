import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { Message } from '@/lib/db/models';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Message not found.');
  const body = await readJson(request, 1024);
  try {
    await requireDb();
    const updated = await Message.findByIdAndUpdate(id, { isRead: body?.isRead !== false }, { returnDocument: 'after' });
    if (!updated) return fail(404, 'Message not found.');
    return json({ ok: true });
  } catch (err) {
    return handleError(err, 'messages/update');
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isValidObjectId(id)) return fail(404, 'Message not found.');
  try {
    await requireDb();
    await Message.findByIdAndDelete(id);
    return json({ ok: true, message: 'Message deleted.' });
  } catch (err) {
    return handleError(err, 'messages/delete');
  }
}
