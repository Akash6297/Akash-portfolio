import 'server-only';
import { revalidatePath } from 'next/cache';
import { contentModels, type ContentCollection } from '@/lib/db/models';
import { collectionConfig, slugify, type CollectionConfig } from './fields';
import { toPlain } from '@/lib/content';

/** Refresh every public page after content changes (ISR on-demand revalidation). */
export function revalidateSite() {
  revalidatePath('/', 'layout');
}

export function resolveCollection(key: string): { config: CollectionConfig; model: (typeof contentModels)[ContentCollection] } | null {
  const config = collectionConfig(key);
  if (!config || !(key in contentModels)) return null;
  return { config, model: contentModels[key as ContentCollection] };
}

/** Admin-facing view of a stored document (fills defaults the forms expect). */
export function adminItem(key: string, doc: Record<string, unknown>) {
  const item = toPlain<Record<string, unknown>>(doc);
  if (key === 'projects' && item.published === undefined) item.published = true;
  return item;
}

/** Normalises the unique field (projects' slug) before saving. */
export function normaliseUnique(config: CollectionConfig, value: Record<string, unknown>) {
  if (config.uniqueField) {
    const raw = String(value[config.uniqueField] || value[config.titleField] || '');
    value[config.uniqueField] = slugify(raw);
  }
  return value;
}
