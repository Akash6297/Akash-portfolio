'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { collectionConfig, getPath } from '@/lib/admin/fields';
import { adminFetch } from '../api';
import { Badge, Button, EmptyState, Notice, PageHeader, Spinner, useToast } from '../ui';

type Item = Record<string, unknown> & { id: string };

export function CollectionList({ collectionKey }: { collectionKey: string }) {
  const config = collectionConfig(collectionKey)!;
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [source, setSource] = useState<'database' | 'defaults'>('database');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminFetch<{ items: Item[]; source: 'database' | 'defaults' }>(`/api/admin/content/${collectionKey}`);
    if (!res.ok) return setError(res.data.message ?? 'Could not load.');
    setItems(res.data.items);
    setSource(res.data.source);
  }, [collectionKey]);

  useEffect(() => {
    load();
  }, [load]);

  const importContent = async () => {
    setBusy(true);
    const res = await adminFetch('/api/admin/import', { method: 'POST' });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    load();
  };

  const move = async (index: number, to: number) => {
    if (!items) return;
    const next = [...items];
    const [it] = next.splice(index, 1);
    next.splice(to, 0, it);
    setItems(next);
    const res = await adminFetch(`/api/admin/content/${collectionKey}/reorder`, { method: 'POST', body: { ids: next.map((i) => i.id) } });
    if (!res.ok) {
      toast('error', res.data.message ?? 'Could not save the order.');
      load();
    }
  };

  const remove = async (item: Item) => {
    const title = String(getPath(item, config.titleField) ?? config.singular);
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/content/${collectionKey}/${item.id}`, { method: 'DELETE' });
    toast(res.ok ? 'success' : 'error', res.data.message ?? (res.ok ? 'Deleted.' : 'Delete failed.'));
    if (res.ok) load();
  };

  const readOnly = source === 'defaults';
  const canCreate = !readOnly || (items?.length ?? 0) === 0;

  return (
    <>
      <PageHeader
        title={config.label}
        description={config.description}
        actions={
          canCreate && (
            <Link href={`/admin/content/${collectionKey}/new`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg hover:bg-white">
              <Plus className="size-4" aria-hidden /> New {config.singular}
            </Link>
          )
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {readOnly && items && items.length > 0 && (
        <div className="mb-6">
          <Notice tone="warn">
            These are the built-in {config.label.toLowerCase()} the site shows today. Import them into the database to edit, reorder or add more.
            <div className="mt-3">
              <Button variant="primary" size="sm" loading={busy} onClick={importContent}>Import site content</Button>
            </div>
          </Notice>
        </div>
      )}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <EmptyState title={`No ${config.label.toLowerCase()} yet`}>Create the first one with “New {config.singular}”.</EmptyState>}
      {items && items.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {items.map((item, i) => {
            const title = String(getPath(item, config.titleField) ?? '');
            const subtitle = config.subtitleField ? String(getPath(item, config.subtitleField) ?? '') : '';
            return (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-fg">
                    <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</span>
                    {title || '(untitled)'}
                    {item.featured === true && <Badge tone="accent">Featured</Badge>}
                    {item.published === false && <Badge tone="warn">Hidden</Badge>}
                  </p>
                  {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
                </div>
                {!readOnly && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${title} up`}><ArrowUp className="size-3.5" aria-hidden /></Button>
                    <Button size="sm" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${title} down`}><ArrowDown className="size-3.5" aria-hidden /></Button>
                    {collectionKey === 'projects' && typeof item.slug === 'string' && (
                      <a href={`/work/${item.slug}`} target="_blank" rel="noopener noreferrer" className="grid size-8 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg" aria-label={`View ${title} on the site`}>
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    )}
                    <Link href={`/admin/content/${collectionKey}/${item.id}`} className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-fg hover:bg-raised">
                      <Pencil className="size-3.5" aria-hidden /> Edit
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => remove(item)} aria-label={`Delete ${title}`}><Trash2 className="size-3.5" aria-hidden /></Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
