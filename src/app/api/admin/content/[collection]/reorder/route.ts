import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { resolveCollection, revalidateSite } from '@/lib/admin/content-api';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ collection: string }> };

/** Body: { ids: string[] } in the desired order. */
export async function POST(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved) return fail(404, 'Unknown collection.');
  const body = await readJson<{ ids?: unknown }>(request, 32 * 1024);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === 'string' && isValidObjectId(id)) : [];
  if (!ids.length) return fail(400, 'Nothing to reorder.');
  try {
    await requireDb();
    await resolved.model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } })));
    revalidateSite();
    return json({ ok: true, message: 'Order saved.' });
  } catch (err) {
    return handleError(err, `content/${collection}/reorder`);
  }
}
