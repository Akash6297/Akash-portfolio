'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CircleAlert, LoaderCircle, Check } from 'lucide-react';
import { CONTACT_LIMITS, validateContact, type ContactErrors, type ContactInput } from '@/lib/contact';
import { cn } from '@/lib/utils';

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent'; message: string }
  | { state: 'error'; message: string };

const EMPTY: ContactInput = { name: '', email: '', subject: '', message: '' };

export function ContactForm({ email }: { email: string }) {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const startedAt = useRef<number>(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const update = (field: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validateContact(next));
  };
  const blur = (field: keyof ContactInput) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateContact(values));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(found).length) {
      const first = (['name', 'email', 'subject', 'message'] as const).find((k) => found[k]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus({ state: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot.current?.value ?? '', startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; fields?: ContactErrors };
      if (res.ok && data.ok) {
        setStatus({ state: 'sent', message: data.message ?? 'Message sent.' });
        setValues(EMPTY);
        setTouched({});
      } else {
        if (data.fields) setErrors(data.fields);
        setStatus({ state: 'error', message: data.message ?? 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ state: 'error', message: 'Network error — check your connection and try again.' });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const fieldClass = (invalid: boolean) =>
    cn(
      'mt-2 block w-full rounded-md border bg-surface px-3.5 py-3 text-base text-fg placeholder:text-subtle/70 transition-colors',
      'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
      invalid ? 'border-[#e5484d]' : 'border-line-strong hover:border-subtle',
    );

  const show = (field: keyof ContactInput) => (touched[field] ? errors[field] : undefined);

  if (status.state === 'sent') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-lg border border-line bg-surface p-8 outline-none">
        <span className="grid size-10 place-items-center rounded-full border border-live/40 text-live">
          <Check className="size-5" aria-hidden />
        </span>
        <p className="font-display mt-6 text-3xl text-fg">Message sent.</p>
        <p className="mt-2 text-muted">{status.message}</p>
        <button type="button" onClick={() => { setStatus({ state: 'idle' }); startedAt.current = Date.now(); }} className="mt-6 min-h-10 text-sm text-fg underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg border border-line bg-bg p-5 sm:p-8" aria-describedby="contact-form-note">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={show('name')}>
          <input id="contact-name" name="name" autoComplete="name" value={values.name} onChange={update('name')} onBlur={blur('name')}
            maxLength={CONTACT_LIMITS.name.max} aria-invalid={!!show('name')} aria-describedby={show('name') ? 'contact-name-error' : undefined}
            className={fieldClass(!!show('name'))} placeholder="Your name" required />
        </Field>
        <Field id="contact-email" label="Email" error={show('email')}>
          <input id="contact-email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={update('email')} onBlur={blur('email')}
            maxLength={CONTACT_LIMITS.email.max} aria-invalid={!!show('email')} aria-describedby={show('email') ? 'contact-email-error' : undefined}
            className={fieldClass(!!show('email'))} placeholder="you@company.com" required />
        </Field>
      </div>
      <div className="mt-5">
        <Field id="contact-subject" label="Subject" error={show('subject')}>
          <input id="contact-subject" name="subject" value={values.subject} onChange={update('subject')} onBlur={blur('subject')}
            maxLength={CONTACT_LIMITS.subject.max} aria-invalid={!!show('subject')} aria-describedby={show('subject') ? 'contact-subject-error' : undefined}
            className={fieldClass(!!show('subject'))} placeholder="Full-stack role, new website, API work…" required />
        </Field>
      </div>
      <div className="mt-5">
        <Field
          id="contact-message"
          label="Project details"
          error={show('message')}
          hint={<span className="font-mono">{values.message.trim().length}/{CONTACT_LIMITS.message.max}</span>}
        >
          <textarea id="contact-message" name="message" rows={6} value={values.message} onChange={update('message')} onBlur={blur('message')}
            maxLength={CONTACT_LIMITS.message.max} aria-invalid={!!show('message')} aria-describedby={show('message') ? 'contact-message-error' : undefined}
            className={cn(fieldClass(!!show('message')), 'resize-y')} placeholder="What are you building, what's the timeline, and how can I help?" required />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input ref={honeypot} id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status.state === 'error' && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mt-5 flex gap-3 rounded-md border border-[#e5484d]/40 bg-[#e5484d]/10 p-4 text-sm text-fg outline-none">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#ff6369]" aria-hidden />
          <p>
            {status.message}{' '}
            <a href={`mailto:${email}`} className="underline underline-offset-4">Email me instead</a>.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-form-note" className="text-xs text-subtle">
          Sent straight to my inbox. Your details are only used to reply.
        </p>
        <button
          type="submit"
          disabled={status.state === 'sending'}
          className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-fg px-5 text-sm font-medium text-bg transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
        >
          {status.state === 'sending' ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              Send message <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm text-muted">{label}</label>
        {hint && <span className="text-[11px] text-subtle">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-[#ff6369]">
          {error}
        </p>
      )}
    </div>
  );
}
