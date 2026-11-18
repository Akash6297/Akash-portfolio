'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { adminFetch } from '../api';
import { Badge, Button, EmptyState, inputClass, Notice, PageHeader, Spinner, useToast } from '../ui';
import { cn } from '@/lib/utils';

interface Message {
  id: string; name: string; email: string; subject: string; message: string; source: 'contact' | 'whatsapp';
  isRead: boolean; replied: boolean; replies: Array<{ text: string; sentAt: string }>; createdAt: string;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'whatsapp', label: 'WhatsApp leads' },
] as const;

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

export function Messages() {
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await adminFetch<{ messages: Message[] }>(`/api/admin/messages?filter=${filter}`);
    if (res.ok) {
      setMessages(res.data.messages);
      setError('');
    } else setError(res.data.message ?? 'Could not load messages.');
  }, [filter]);

  useEffect(() => {
    setMessages(null);
    load();
  }, [load]);

  const selected = messages?.find((m) => m.id === selectedId) ?? null;

  const open = async (m: Message) => {
    setSelectedId(m.id);
    setReply('');
    if (!m.isRead) {
      setMessages((all) => all?.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)) ?? null);
      await adminFetch(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { isRead: true } });
    }
  };

  const markUnread = async (m: Message) => {
    await adminFetch(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { isRead: false } });
    setSelectedId(null);
    load();
  };

  const remove = async (m: Message) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    const res = await adminFetch(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) {
      setSelectedId(null);
      load();
    }
  };

  const sendReply = async () => {
    if (!selected) return;
    setSending(true);
    const res = await adminFetch(`/api/admin/messages/${selected.id}/reply`, { method: 'POST', body: { replyMessage: reply } });
    setSending(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? (res.ok ? 'Reply sent.' : 'Reply failed.'));
    if (res.ok) {
      setReply('');
      load();
    }
  };

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the contact form and WhatsApp option." />
      <div role="group" aria-label="Filter messages" className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn('min-h-9 rounded-md px-3 text-sm', filter === f.id ? 'bg-raised text-fg' : 'text-muted hover:text-fg')}>
            {f.label}
          </button>
        ))}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!messages && !error && <Spinner />}
      {messages && messages.length === 0 && <EmptyState title="No messages here">New messages from the contact form appear here.</EmptyState>}

      {messages && messages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {messages.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m)} aria-current={selectedId === m.id ? 'true' : undefined}
                  className={cn('block w-full p-4 text-left transition-colors hover:bg-surface', selectedId === m.id && 'bg-raised')}>
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn('truncate text-sm', m.isRead ? 'text-muted' : 'font-semibold text-fg')}>
                      {!m.isRead && <span className="mr-2 inline-block size-1.5 rounded-full bg-accent align-middle" aria-label="Unread" />}
                      {m.name}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-subtle">{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-fg/80">{m.subject || m.message.slice(0, 60)}</span>
                  <span className="mt-1.5 flex gap-1.5">
                    {m.source === 'whatsapp' && <Badge tone="live">WhatsApp</Badge>}
                    {m.replied && <Badge>Replied</Badge>}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 rounded-lg border border-line p-5 sm:p-6">
            {!selected ? (
              <p className="py-16 text-center text-sm text-subtle">Select a message to read it.</p>
            ) : (
              <article aria-label={`Message from ${selected.name}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-medium text-fg">{selected.subject || '(no subject)'}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {selected.name} · <a href={`mailto:${selected.email}`} className="underline underline-offset-4">{selected.email}</a>
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-subtle">{fmt(selected.createdAt)} IST</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => markUnread(selected)}><Mail className="size-3.5" aria-hidden /> Mark unread</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(selected)}><Trash2 className="size-3.5" aria-hidden /> Delete</Button>
                  </div>
                </div>
                <p className="mt-5 whitespace-pre-wrap break-words rounded-md border border-line bg-surface/50 p-4 text-[15px] leading-relaxed text-fg">{selected.message}</p>

                {selected.replies.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <p className="label-mono">Your replies</p>
                    {selected.replies.map((r, i) => (
                      <div key={i} className="rounded-md border border-accent/25 bg-accent/5 p-4">
                        <p className="whitespace-pre-wrap text-sm text-fg">{r.text}</p>
                        <p className="mt-2 font-mono text-[11px] text-subtle"><MailOpen className="mr-1 inline size-3" aria-hidden />Sent {fmt(r.sentAt)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <label htmlFor="reply" className="mb-1.5 block text-sm text-muted">Reply by email (uses the “Reply” email template)</label>
                  <textarea id="reply" rows={6} value={reply} onChange={(e) => setReply(e.target.value)} className={cn(inputClass, 'resize-y')} placeholder={`Hi ${selected.name.split(' ')[0]},`} />
                  <div className="mt-3 flex justify-end">
                    <Button variant="primary" loading={sending} disabled={reply.trim().length < 2} onClick={sendReply}>
                      <Reply className="size-4" aria-hidden /> Send reply
                    </Button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </>
  );
}
