import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { sanitize } from '@/lib/admin/fields';
import { adminItem, normaliseUnique, resolveCollection, revalidateSite } from '@/lib/admin/content-api';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ collection: string; id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection, id } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved || !isValidObjectId(id)) return fail(404, 'Not found.');
  try {
    await requireDb();
    const doc = await resolved.model.findById(id).lean();
    if (!doc) return fail(404, 'Not found.');
    return json({ ok: true, item: adminItem(collection, doc as Record<string, unknown>) });
  } catch (err) {
    return handleError(err, `content/${collection}/get`);
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection, id } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved || !isValidObjectId(id)) return fail(404, 'Not found.');
  const body = await readJson(request, 512 * 1024);
  if (!body) return fail(400, 'Invalid data.');
  const { value, errors } = sanitize(resolved.config.fields, body);
  normaliseUnique(resolved.config, value);
  if (Object.keys(errors).length) return fail(422, 'Please fix the highlighted fields.', { fields: errors });

  try {
    await requireDb();
    const { model, config } = resolved;
    if (config.uniqueField && (await model.exists({ _id: { $ne: id }, [config.uniqueField]: value[config.uniqueField] }))) {
      return fail(409, `Another ${config.singular} already uses "${value[config.uniqueField]}".`, { fields: { [config.uniqueField]: 'Must be unique.' } });
    }
    // Replace the editable fields; unknown legacy fields on the document are kept.
    const doc = await model.findByIdAndUpdate(id, { $set: value }, { returnDocument: 'after' }).lean();
    if (!doc) return fail(404, 'Not found.');
    revalidateSite();
    return json({ ok: true, message: 'Saved. The site is updated.', item: adminItem(collection, doc as Record<string, unknown>) });
  } catch (err) {
    return handleError(err, `content/${collection}/update`);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection, id } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved || !isValidObjectId(id)) return fail(404, 'Not found.');
  try {
    await requireDb();
    const { model, config } = resolved;
    const count = await model.estimatedDocumentCount();
    if (count <= 1 && collection !== 'achievements') {
      // An empty collection would make the site fall back to the built-in content.
      return fail(400, `Keep at least one ${config.singular}. Unpublish or edit it instead.`);
    }
    await model.findByIdAndDelete(id);
    revalidateSite();
    return json({ ok: true, message: 'Deleted.' });
  } catch (err) {
    return handleError(err, `content/${collection}/delete`);
  }
}
