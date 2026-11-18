'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LoaderCircle, X } from 'lucide-react';

const inputClass =
  'mt-1.5 block w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base text-fg placeholder:text-subtle/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

/**
 * Collects a name before opening WhatsApp, so the conversation also lands in the
 * admin inbox as a lead. Opening WhatsApp never depends on the lead being saved.
 */
export function WhatsAppLead({ number }: { number: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [sending, setSending] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const text = `Hi Akash, I'm ${form.name}. ${form.message || "I'd like to discuss a project."}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    // Open the window synchronously (popup blockers), then record the lead.
    // ('noopener' in the features string would make window.open return null.)
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    try {
      await fetch('/api/leads/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startedAt: startedAt.current }),
      });
    } catch {
      // Lead capture is best-effort; the chat is already open.
    }
    if (!win) window.location.href = url; // popup blocked: continue in this tab
    setSending(false);
    close();
  };

  return (
    <>
      <button type="button" onClick={open} className="inline-flex min-h-9 items-center gap-2 text-fg hover:underline hover:underline-offset-4">
        Chat on WhatsApp <ArrowUpRight className="size-3.5 text-subtle" aria-hidden />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="wa-title"
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-line-strong bg-bg p-0 text-fg backdrop:bg-black/70"
        onClick={(e) => e.target === dialog.current && close()}
      >
        <form onSubmit={submit} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="wa-title" className="text-lg font-medium">Chat on WhatsApp</h3>
              <p className="mt-1 text-sm text-muted">Tell me who you are and I&apos;ll pick it up on WhatsApp.</p>
            </div>
            <button type="button" onClick={close} className="grid size-9 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg" aria-label="Close">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="wa-name" className="text-sm text-muted">Name</label>
              <input id="wa-name" required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="wa-contact" className="text-sm text-muted">Phone or email</label>
              <input id="wa-contact" required minLength={5} maxLength={120} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="wa-message" className="text-sm text-muted">Message <span className="text-subtle">(optional)</span></label>
              <textarea id="wa-message" rows={2} maxLength={500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={sending} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-fg text-sm font-medium text-bg hover:bg-white disabled:opacity-70">
            {sending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null} Continue to WhatsApp
          </button>
        </form>
      </dialog>
    </>
  );
}
