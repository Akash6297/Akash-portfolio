import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { SiteProfile } from '@/lib/db/models';
import { PROFILE_FIELDS, sanitize } from '@/lib/admin/fields';
import { revalidateSite } from '@/lib/admin/content-api';
import { getProfile } from '@/lib/content';
import { fail, handleError, json, readJson } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await requireDb();
    const stored = await SiteProfile.exists({});
    return json({ ok: true, source: stored ? 'database' : 'defaults', profile: await getProfile() });
  } catch (err) {
    return handleError(err, 'profile/get');
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await readJson(request, 256 * 1024);
  if (!body) return fail(400, 'Invalid data.');
  const { value, errors } = sanitize(PROFILE_FIELDS, body);
  if (Object.keys(errors).length) return fail(422, 'Please fix the highlighted fields.', { fields: errors });
  try {
    await requireDb();
    // Stored profile = current profile (defaults included) + edits, so nothing is lost.
    const current = await getProfile();
    const merged = deepMerge(current as unknown as Record<string, unknown>, value);
    await SiteProfile.findOneAndUpdate({}, { $set: merged }, { upsert: true });
    revalidateSite();
    return json({ ok: true, message: 'Profile saved. The site is updated.' });
  } catch (err) {
    return handleError(err, 'profile/put');
  }
}

function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  delete out.id;
  for (const [k, v] of Object.entries(patch)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])
      ? deepMerge(base[k] as Record<string, unknown>, v as Record<string, unknown>)
      : v;
  }
  return out;
}
