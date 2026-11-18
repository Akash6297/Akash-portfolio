'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SlotState = { state: 'idle' } | { state: 'loading' } | { state: 'ready'; slots: string[]; note?: string } | { state: 'error'; message: string };
type Status = { state: 'idle' } | { state: 'sending' } | { state: 'sent'; message: string } | { state: 'error'; message: string };

// Today's date in IST as YYYY-MM-DD (slots are scheduled in IST).
function todayIst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}
function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const inputClass =
  'mt-2 block w-full rounded-md border border-line-strong bg-surface px-3.5 py-3 text-base text-fg placeholder:text-subtle/70 transition-colors hover:border-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

export function BookingForm({ email }: { email: string }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<SlotState>({ state: 'idle' });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const min = todayIst();
  const max = addDays(min, 60);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setTime('');
    setSlots({ state: 'loading' });
    fetch(`/api/bookings/slots?date=${date}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setSlots({ state: 'error', message: data.message ?? 'Could not load times.' });
        else setSlots({ state: 'ready', slots: data.availableSlots ?? [], note: data.message });
      })
      .catch(() => !cancelled && setSlots({ state: 'error', message: 'Could not load times. Check your connection.' }));
    return () => {
      cancelled = true;
    };
  }, [date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setStatus({ state: 'error', message: 'Please choose a date and a time.' });
      return;
    }
    setStatus({ state: 'sending' });
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date, time, website: honeypot.current?.value ?? '', startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setStatus({ state: 'sent', message: data.message });
      else setStatus({ state: 'error', message: data.message ?? 'Booking failed. Please try again.' });
    } catch {
      setStatus({ state: 'error', message: 'Network error — please try again.' });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (status.state === 'sent') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-lg border border-line bg-surface p-8 outline-none">
        <span className="grid size-10 place-items-center rounded-full border border-live/40 text-live"><Check className="size-5" aria-hidden /></span>
        <p className="font-display mt-6 text-3xl text-fg">Request received.</p>
        <p className="mt-2 text-muted">{status.message}</p>
        <p className="mt-1 text-sm text-subtle">{date} at {time} (IST) — you&apos;ll get an email once it&apos;s confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-bg p-5 sm:p-8" aria-describedby="booking-note">
      <p className="text-sm text-muted">A free 30-minute discovery call. Times are in India Standard Time (IST, UTC+5:30).</p>

      <div className="mt-5">
        <label htmlFor="booking-date" className="text-sm text-muted">Date</label>
        <input id="booking-date" type="date" required min={min} max={max} value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputClass, '[color-scheme:dark]')} />
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm text-muted">Time</legend>
        <div className="mt-2 min-h-11">
          {slots.state === 'idle' && <p className="py-2.5 text-sm text-subtle">Choose a date to see available times.</p>}
          {slots.state === 'loading' && (
            <p className="flex items-center gap-2 py-2.5 text-sm text-subtle"><LoaderCircle className="size-4 animate-spin" aria-hidden /> Checking availability…</p>
          )}
          {slots.state === 'error' && <p className="py-2.5 text-sm text-[#ff6369]">{slots.message}</p>}
          {slots.state === 'ready' &&
            (slots.slots.length ? (
              <div className="flex flex-wrap gap-2">
                {slots.slots.map((s) => (
                  <label key={s} className={cn('cursor-pointer rounded-md border px-3 py-2 font-mono text-[13px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent', time === s ? 'border-fg bg-fg text-bg' : 'border-line-strong text-muted hover:border-subtle hover:text-fg')}>
                    <input type="radio" name="booking-time" value={s} checked={time === s} onChange={() => setTime(s)} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
            ) : (
              <p className="py-2.5 text-sm text-subtle">{slots.note ?? 'No times left on this day — try another date.'}</p>
            ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className="text-sm text-muted">Name</label>
          <input id="booking-name" required autoComplete="name" maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="booking-email" className="text-sm text-muted">Email</label>
          <input id="booking-email" type="email" required autoComplete="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="booking-message" className="text-sm text-muted">What would you like to discuss? <span className="text-subtle">(optional)</span></label>
        <textarea id="booking-message" rows={3} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={cn(inputClass, 'resize-y')} />
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="booking-website">Website</label>
        <input ref={honeypot} id="booking-website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status.state === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mt-5 flex gap-3 rounded-md border border-[#e5484d]/40 bg-[#e5484d]/10 p-4 text-sm text-fg outline-none">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#ff6369]" aria-hidden />
          <p>{status.message} <a href={`mailto:${email}`} className="underline underline-offset-4">Email me instead</a>.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="booking-note" className="text-xs text-subtle">Requests are confirmed by email with a meeting link.</p>
        <button
          type="submit"
          disabled={status.state === 'sending'}
          className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-fg px-5 text-sm font-medium text-bg transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
        >
          {status.state === 'sending' ? <><LoaderCircle className="size-4 animate-spin" aria-hidden /> Sending…</> : <>Request call <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden /></>}
        </button>
      </div>
    </form>
  );
}
