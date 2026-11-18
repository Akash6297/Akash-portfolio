'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, CheckCheck, Trash2, X } from 'lucide-react';
import { adminFetch } from '../api';
import { Badge, Button, EmptyState, inputClass, Notice, PageHeader, Spinner, useToast } from '../ui';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'confirmed' | 'rejected' | 'completed';
interface Booking { id: string; name: string; email: string; date: string; time: string; message: string; status: Status; meetingLink: string; createdAt: string }
type Schedule = Record<string, { maxBookings: number; slots: string[] }>;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const STATUS_TONE: Record<Status, 'warn' | 'live' | 'danger' | 'neutral'> = { pending: 'warn', confirmed: 'live', rejected: 'danger', completed: 'neutral' };

export function Bookings() {
  const [tab, setTab] = useState<'requests' | 'schedule'>('requests');
  return (
    <>
      <PageHeader title="Bookings" description="Discovery-call requests from the contact section, and the weekly times you offer." />
      <div role="tablist" aria-label="Bookings views" className="mb-6 inline-flex rounded-md border border-line bg-surface p-1">
        {(['requests', 'schedule'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn('min-h-9 rounded-[6px] px-4 text-sm capitalize', tab === t ? 'bg-raised text-fg' : 'text-muted hover:text-fg')}>
            {t === 'requests' ? 'Requests' : 'Weekly schedule'}
          </button>
        ))}
      </div>
      {tab === 'requests' ? <Requests /> : <ScheduleEditor />}
    </>
  );
}

function Requests() {
  const toast = useToast();
  const [status, setStatus] = useState<'all' | Status>('all');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState('');
  const [links, setLinks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{ bookings: Booking[] }>(`/api/admin/bookings${status === 'all' ? '' : `?status=${status}`}`);
    if (res.ok) setBookings(res.data.bookings);
    else setError(res.data.message ?? 'Could not load bookings.');
  }, [status]);

  useEffect(() => {
    setBookings(null);
    load();
  }, [load]);

  const update = async (b: Booking, next: Status) => {
    setBusy(b.id + next);
    const res = await adminFetch(`/api/admin/bookings/${b.id}`, { method: 'PATCH', body: { status: next, meetingLink: links[b.id] ?? b.meetingLink } });
    setBusy(null);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) load();
  };

  const remove = async (b: Booking) => {
    if (!window.confirm(`Delete the booking from ${b.name}?`)) return;
    const res = await adminFetch(`/api/admin/bookings/${b.id}`, { method: 'DELETE' });
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) load();
  };

  return (
    <>
      <label className="mb-4 flex items-center gap-2 text-sm text-muted">
        Show
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={cn(inputClass, 'w-auto py-1.5')}>
          <option value="all">All bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Declined</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      {!bookings && !error && <Spinner />}
      {bookings && bookings.length === 0 && <EmptyState title="No bookings">Call requests from the “Book a call” form appear here.</EmptyState>}
      {bookings && bookings.length > 0 && (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-lg border border-line p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-medium text-fg">{b.name} <Badge tone={STATUS_TONE[b.status]}>{b.status === 'rejected' ? 'declined' : b.status}</Badge></p>
                  <p className="text-sm text-muted"><a href={`mailto:${b.email}`} className="underline underline-offset-4">{b.email}</a></p>
                </div>
                <p className="font-mono text-sm text-fg">{b.date} · {b.time} IST</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-fg/85">{b.message}</p>
              <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <input aria-label={`Meeting link for ${b.name}`} placeholder="Meeting link (https://meet.google.com/…)" value={links[b.id] ?? b.meetingLink}
                    onChange={(e) => setLinks({ ...links, [b.id]: e.target.value })} className={cn(inputClass, 'sm:max-w-sm')} />
                )}
                <div className="flex flex-wrap gap-2">
                  {b.status !== 'confirmed' && b.status !== 'completed' && (
                    <Button size="sm" variant="primary" loading={busy === b.id + 'confirmed'} onClick={() => update(b, 'confirmed')}><Check className="size-3.5" aria-hidden /> Confirm & email</Button>
                  )}
                  {b.status === 'confirmed' && (
                    <>
                      <Button size="sm" loading={busy === b.id + 'confirmed'} onClick={() => update(b, 'confirmed')}>Resend confirmation</Button>
                      <Button size="sm" loading={busy === b.id + 'completed'} onClick={() => update(b, 'completed')}><CheckCheck className="size-3.5" aria-hidden /> Mark completed</Button>
                    </>
                  )}
                  {b.status === 'pending' && (
                    <Button size="sm" variant="danger" loading={busy === b.id + 'rejected'} onClick={() => update(b, 'rejected')}><X className="size-3.5" aria-hidden /> Decline & email</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(b)} aria-label={`Delete booking from ${b.name}`}><Trash2 className="size-3.5" aria-hidden /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ScheduleEditor() {
  const toast = useToast();
  const [schedule, setSchedule] = useState<Record<string, { maxBookings: number; slots: string }> | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<{ weeklySchedule: Schedule }>('/api/admin/booking-settings').then((res) => {
      if (!res.ok) return setError(res.data.message ?? 'Could not load the schedule.');
      setSchedule(Object.fromEntries(Object.entries(res.data.weeklySchedule).map(([k, v]) => [k, { maxBookings: v.maxBookings, slots: v.slots.join(', ') }])));
    });
  }, []);

  const save = async () => {
    if (!schedule) return;
    setSaving(true);
    const body = { weeklySchedule: Object.fromEntries(Object.entries(schedule).map(([k, v]) => [k, { maxBookings: v.maxBookings, slots: v.slots.split(',').map((s) => s.trim()).filter(Boolean) }])) };
    const res = await adminFetch('/api/admin/booking-settings', { method: 'PUT', body });
    setSaving(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
  };

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!schedule) return <Spinner />;
  return (
    <>
      <p className="mb-4 text-sm text-muted">Times are in IST, written like <code className="font-mono text-fg">10:00 AM</code>. Set the daily limit to 0 to close a day.</p>
      <div className="divide-y divide-line rounded-lg border border-line">
        {WEEKDAYS.map((day, i) => {
          const d = schedule[String(i)];
          return (
            <div key={day} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[8rem_7rem_1fr] sm:items-center">
              <p className="font-medium text-fg">{day}</p>
              <label className="text-sm text-muted">
                <span className="sr-only">{day} daily limit</span>
                <input type="number" min={0} max={24} value={d.maxBookings} onChange={(e) => setSchedule({ ...schedule, [i]: { ...d, maxBookings: Number(e.target.value) } })} className={inputClass} aria-label={`${day}: maximum bookings`} />
              </label>
              <input value={d.slots} onChange={(e) => setSchedule({ ...schedule, [i]: { ...d, slots: e.target.value } })} className={inputClass} aria-label={`${day}: time slots, comma-separated`} placeholder="10:00 AM, 11:00 AM" />
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" loading={saving} onClick={save}>Save schedule</Button>
      </div>
    </>
  );
}
