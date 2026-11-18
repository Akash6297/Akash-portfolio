import { requireAdmin } from '@/lib/auth/session';
import { requireDb } from '@/lib/db/connect';
import { contentModels, SiteProfile, type ContentCollection } from '@/lib/db/models';
import { defaults } from '@/lib/content';
import { profile as defaultProfile } from '@/data/profile';
import { revalidateSite } from '@/lib/admin/content-api';
import { handleError, json } from '@/lib/api';

export const runtime = 'nodejs';

/** Status of each content collection: imported into the database or still on built-in content. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await requireDb();
    const status = await Promise.all(
      (Object.keys(contentModels) as ContentCollection[]).map(async (key) => ({ key, count: await contentModels[key].estimatedDocumentCount(), builtIn: defaults[key].length })),
    );
    return json({ ok: true, profileImported: Boolean(await SiteProfile.exists({})), collections: status });
  } catch (err) {
    return handleError(err, 'import/status');
  }
}

/**
 * Copies the built-in content (src/data) into empty collections so it can be edited.
 * Never overwrites a collection that already has documents.
 */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await requireDb();
    const imported: string[] = [];
    if (!(await SiteProfile.exists({}))) {
      await SiteProfile.create(defaultProfile as unknown as Record<string, unknown>);
      imported.push('profile');
    }
    for (const key of Object.keys(contentModels) as ContentCollection[]) {
      const model = contentModels[key];
      if ((await model.estimatedDocumentCount()) > 0) continue;
      const items = defaults[key] as unknown as Array<Record<string, unknown>>;
      if (!items.length) continue;
      await model.insertMany(
        items.map((item, i) => ({ ...item, order: typeof item.order === 'number' ? item.order : i + 1, ...(key === 'projects' ? { published: true } : {}) })),
      );
      imported.push(key);
    }
    revalidateSite();
    return json({
      ok: true,
      imported,
      message: imported.length ? `Imported: ${imported.join(', ')}.` : 'Everything is already in the database.',
    });
  } catch (err) {
    return handleError(err, 'import/run');
  }
}
