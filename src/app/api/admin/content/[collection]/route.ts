import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { sanitize } from '@/lib/admin/fields';
import { adminItem, normaliseUnique, resolveCollection, revalidateSite } from '@/lib/admin/content-api';
import { defaults } from '@/lib/content';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved) return fail(404, 'Unknown collection.');
  try {
    await requireDb();
    const docs = await resolved.model.find().sort({ order: 1, createdAt: 1 }).lean();
    if (docs.length === 0) {
      // Not imported yet: show what the site currently displays (read-only until imported).
      const builtIn = defaults[collection as keyof typeof defaults] as unknown[];
      return json({ ok: true, source: 'defaults', items: builtIn.map((d, i) => ({ ...(d as object), id: `default-${i}` })) });
    }
    return json({ ok: true, source: 'database', items: docs.map((d) => adminItem(collection, d as Record<string, unknown>)) });
  } catch (err) {
    return handleError(err, `content/${collection}/list`);
  }
}

export async function POST(request: Request, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { collection } = await params;
  const resolved = resolveCollection(collection);
  if (!resolved) return fail(404, 'Unknown collection.');
  const body = await readJson(request, 512 * 1024);
  if (!body) return fail(400, 'Invalid data.');
  const { value, errors } = sanitize(resolved.config.fields, body);
  normaliseUnique(resolved.config, value);
  if (Object.keys(errors).length) return fail(422, 'Please fix the highlighted fields.', { fields: errors });

  try {
    await requireDb();
    const { model, config } = resolved;
    const builtIn = defaults[collection as keyof typeof defaults] as unknown[];
    if ((await model.estimatedDocumentCount()) === 0 && builtIn.length > 0) {
      return fail(409, `Import the current ${config.label.toLowerCase()} first (Overview → Import site content), so nothing on the site disappears.`);
    }
    if (config.uniqueField && (await model.exists({ [config.uniqueField]: value[config.uniqueField] }))) {
      return fail(409, `Another ${config.singular} already uses "${value[config.uniqueField]}".`, { fields: { [config.uniqueField]: 'Must be unique.' } });
    }
    if (!('order' in value) || !value.order) {
      const last = await model.findOne().sort({ order: -1 }).select('order').lean();
      value.order = Number((last as { order?: number } | null)?.order ?? 0) + 1;
    }
    const doc = await model.create(value);
    revalidateSite();
    return json({ ok: true, message: `${config.singular[0].toUpperCase()}${config.singular.slice(1)} created.`, item: adminItem(collection, doc.toObject()) }, 201);
  } catch (err) {
    return handleError(err, `content/${collection}/create`);
  }
}
