'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { collectionConfig, slugify } from '@/lib/admin/fields';
import { adminFetch } from '../api';
import { FormFields } from '../FormFields';
import { Button, Notice, PageHeader, Spinner, useToast } from '../ui';

type Value = Record<string, unknown>;

const NEW_DEFAULTS: Record<string, Value> = {
  projects: { published: true, featured: false, kind: 'personal', filters: [], stack: [], gallery: [], links: {}, caseStudy: {} },
  experience: { type: 'Full-time', end: 'present' },
  services: { icon: 'layers' },
};

export const PREFILL_KEY = (collection: string) => `admin-prefill:${collection}`;

export function CollectionEditor({ collectionKey, id }: { collectionKey: string; id: string }) {
  const config = collectionConfig(collectionKey)!;
  const router = useRouter();
  const toast = useToast();
  const isNew = id === 'new';
  const [value, setValue] = useState<Value | null>(isNew ? null : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (isNew) {
      let initial: Value = structuredClone(NEW_DEFAULTS[collectionKey] ?? {});
      try {
        const stored = sessionStorage.getItem(PREFILL_KEY(collectionKey));
        if (stored) {
          initial = { ...initial, ...JSON.parse(stored) };
          sessionStorage.removeItem(PREFILL_KEY(collectionKey));
          setPrefilled(true);
        }
      } catch {
        // sessionStorage unavailable: start empty
      }
      setValue(initial);
      return;
    }
    adminFetch<{ item: Value }>(`/api/admin/content/${collectionKey}/${id}`).then((res) => {
      if (res.ok) setValue(res.data.item);
      else setLoadError(res.data.message ?? 'Could not load this item.');
    });
  }, [collectionKey, id, isNew]);

  const save = async () => {
    if (!value) return;
    setSaving(true);
    setErrors({});
    const body = { ...value };
    if (config.uniqueField && !body[config.uniqueField]) body[config.uniqueField] = slugify(String(body[config.titleField] ?? ''));
    const res = await adminFetch<{ item?: Value & { id: string } }>(isNew ? `/api/admin/content/${collectionKey}` : `/api/admin/content/${collectionKey}/${id}`, {
      method: isNew ? 'POST' : 'PUT',
      body,
    });
    setSaving(false);
    if (!res.ok) {
      setErrors(res.data.fields ?? {});
      toast('error', res.data.message ?? 'Could not save.');
      return;
    }
    toast('success', res.data.message ?? 'Saved.');
    if (isNew && res.data.item) router.replace(`/admin/content/${collectionKey}/${res.data.item.id}`);
    else if (res.data.item) setValue(res.data.item);
  };

  const remove = async () => {
    if (!window.confirm(`Delete this ${config.singular}? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/content/${collectionKey}/${id}`, { method: 'DELETE' });
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) router.push(`/admin/content/${collectionKey}`);
  };

  const title = value ? String(value[config.titleField] ?? '') : '';
  const errorCount = Object.keys(errors).length;

  return (
    <>
      <Link href={`/admin/content/${collectionKey}`} className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> {config.label}
      </Link>
      <PageHeader
        title={isNew ? `New ${config.singular}` : title || `Edit ${config.singular}`}
        actions={
          <>
            {collectionKey === 'projects' && !isNew && typeof value?.slug === 'string' && (
              <a href={`/work/${value.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-strong px-4 text-sm text-fg hover:bg-raised">
                <ExternalLink className="size-4" aria-hidden /> View
              </a>
            )}
            {!isNew && <Button variant="danger" onClick={remove}>Delete</Button>}
            <Button variant="primary" loading={saving} onClick={save} disabled={!value}>
              {isNew ? 'Create' : 'Save changes'}
            </Button>
          </>
        }
      />
      {loadError && <Notice tone="error">{loadError}</Notice>}
      {prefilled && <div className="mb-6"><Notice>Fields were pre-filled by Smart import. Check them before saving.</Notice></div>}
      {errorCount > 0 && <div className="mb-6"><Notice tone="error">{errorCount === 1 ? '1 field needs' : `${errorCount} fields need`} attention.</Notice></div>}
      {!value && !loadError && <Spinner />}
      {value && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <FormFields fields={config.fields} value={value} onChange={setValue} errors={errors} />
          <div className="sticky bottom-0 mt-8 flex justify-end gap-2 border-t border-line bg-bg/95 py-4 backdrop-blur">
            <Button type="submit" variant="primary" loading={saving}>{isNew ? 'Create' : 'Save changes'}</Button>
          </div>
        </form>
      )}
    </>
  );
}
