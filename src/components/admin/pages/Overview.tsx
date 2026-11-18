'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Database, Inbox } from 'lucide-react';
import { COLLECTIONS } from '@/lib/admin/fields';
import { adminFetch } from '../api';
import { Badge, Button, Card, Notice, PageHeader, Spinner, useToast } from '../ui';

interface ImportStatus {
  profileImported: boolean;
  collections: Array<{ key: string; count: number; builtIn: number }>;
}

export function Overview() {
  const toast = useToast();
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [unread, setUnread] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    const [s, m, b] = await Promise.all([
      adminFetch<ImportStatus>('/api/admin/import'),
      adminFetch<{ messages: unknown[] }>('/api/admin/messages?filter=unread'),
      adminFetch<{ bookings: unknown[] }>('/api/admin/bookings?status=pending'),
    ]);
    if (!s.ok) setError(s.data.message ?? 'Could not load the dashboard.');
    else setStatus(s.data);
    if (m.ok) setUnread(m.data.messages.length);
    if (b.ok) setPending(b.data.bookings.length);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runImport = async () => {
    setImporting(true);
    const res = await adminFetch('/api/admin/import', { method: 'POST' });
    setImporting(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? (res.ok ? 'Imported.' : 'Import failed.'));
    load();
  };

  const notImported = status ? [...(status.profileImported ? [] : ['profile']), ...status.collections.filter((c) => c.count === 0 && c.builtIn > 0).map((c) => c.key)] : [];

  return (
    <>
      <PageHeader title="Overview" description="Messages, bookings and the content behind your portfolio." />
      {error && <div className="mb-6"><Notice tone="error">{error}</Notice></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat href="/admin/messages" icon={Inbox} label="Unread messages" value={unread} />
        <Stat href="/admin/bookings" icon={CalendarDays} label="Pending call requests" value={pending} />
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-5 text-muted" aria-hidden />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-fg">Site content</h2>
            {!status ? (
              <Spinner />
            ) : notImported.length ? (
              <>
                <p className="mt-1 text-sm text-muted">
                  These sections still use the built-in content from the code. Import them once to edit them here — the site looks exactly the same afterwards.
                </p>
                <p className="mt-3 flex flex-wrap gap-1.5">{notImported.map((k) => <Badge key={k} tone="warn">{k}</Badge>)}</p>
                <Button variant="primary" className="mt-5" loading={importing} onClick={runImport}>
                  Import site content
                </Button>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">All content is in the database and editable here. Changes go live immediately.</p>
            )}
          </div>
        </div>
        {status && (
          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            <li className="bg-bg">
              <Link href="/admin/profile" className="block p-4 hover:bg-surface">
                <p className="text-sm text-fg">Profile & hero</p>
                <p className="mt-1 font-mono text-xs text-subtle">{status.profileImported ? 'in database' : 'built-in'}</p>
              </Link>
            </li>
            {COLLECTIONS.map((c) => {
              const s = status.collections.find((x) => x.key === c.key);
              return (
                <li key={c.key} className="bg-bg">
                  <Link href={`/admin/content/${c.key}`} className="block p-4 hover:bg-surface">
                    <p className="text-sm text-fg">{c.label}</p>
                    <p className="mt-1 font-mono text-xs text-subtle">{s?.count ? `${s.count} in database` : `${s?.builtIn ?? 0} built-in`}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

function Stat({ href, icon: Icon, label, value }: { href: string; icon: typeof Inbox; label: string; value: number | null }) {
  return (
    <Link href={href} className="group rounded-lg border border-line bg-surface/40 p-6 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-muted" aria-hidden />
        <ArrowRight className="size-4 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className="font-display mt-6 text-5xl text-fg">{value ?? '—'}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Link>
  );
}
