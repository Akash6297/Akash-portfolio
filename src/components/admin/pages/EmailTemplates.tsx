'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { renderHtml, renderSubject, type TemplateConfig } from '@/lib/email/templates';
import { adminFetch } from '../api';
import { Badge, Button, Card, inputClass, Notice, PageHeader, Spinner, useToast } from '../ui';
import { cn } from '@/lib/utils';

interface Template { name: string; label: string; description: string; variables: string[]; optional: boolean; subject: string; config: TemplateConfig }

const SAMPLE: Record<string, string> = {
  name: 'Priya Sharma', email: 'priya@example.com', subject: 'New website for our clinic', message: 'Hi Akash,\nWe need a new website with online booking.',
  replyMessage: 'Thanks Priya — happy to help. Are you free for a call this week?', originalMessage: 'We need a new website with online booking.',
  date: '2026-12-01', time: '11:00 AM', meetingLink: 'https://meet.google.com/abc-defg-hij',
};

export function EmailTemplates() {
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    adminFetch<{ templates: Template[] }>('/api/admin/email-templates').then((res) => {
      if (res.ok) setTemplates(res.data.templates);
      else setError(res.data.message ?? 'Could not load templates.');
    });
  }, []);

  const t = templates?.[active];
  const update = (patch: Partial<Template> | { config: Partial<TemplateConfig> }) =>
    setTemplates((all) => all!.map((x, i) => (i === active ? { ...x, ...patch, config: { ...x.config, ...('config' in patch ? patch.config : {}) } } : x)));

  const previewHtml = useMemo(() => (t ? renderHtml(t.config, SAMPLE) : ''), [t]);

  const save = async () => {
    if (!t) return;
    setSaving(true);
    const res = await adminFetch(`/api/admin/email-templates/${t.name}`, { method: 'PUT', body: { subject: t.subject, config: t.config } });
    setSaving(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
  };

  const test = async () => {
    if (!t) return;
    setTesting(true);
    const res = await adminFetch(`/api/admin/email-templates/${t.name}`, { method: 'POST' });
    setTesting(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
  };

  return (
    <>
      <PageHeader title="Email templates" description="The emails your site sends. Use {{variables}} to insert details; visitor input is always escaped." />
      {error && <Notice tone="error">{error}</Notice>}
      {!templates && !error && <Spinner />}
      {templates && t && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr]">
          <ul className="space-y-1">
            {templates.map((x, i) => (
              <li key={x.name}>
                <button type="button" aria-pressed={i === active} onClick={() => setActive(i)}
                  className={cn('w-full rounded-md px-3 py-2.5 text-left text-sm', i === active ? 'bg-raised text-fg' : 'text-muted hover:bg-raised/60 hover:text-fg')}>
                  {x.label}
                  {x.optional && x.config.enabled === false && <span className="ml-2"><Badge tone="warn">Off</Badge></span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 space-y-6">
            <Card className="p-5">
              <p className="text-sm text-muted">{t.description}</p>
              <p className="mt-2 flex flex-wrap gap-1.5">{t.variables.map((v) => <code key={v} className="rounded-sm bg-raised px-1.5 py-0.5 font-mono text-xs text-fg">{`{{${v}}}`}</code>)}</p>

              <div className="mt-5 grid grid-cols-1 gap-4">
                {t.optional && (
                  <label className="flex items-center gap-3 text-sm text-fg">
                    <input type="checkbox" checked={t.config.enabled !== false} onChange={(e) => update({ config: { enabled: e.target.checked } })} className="size-4 accent-[#4f7dff]" />
                    Send this email automatically
                  </label>
                )}
                <Labeled label="Subject"><input value={t.subject} onChange={(e) => update({ subject: e.target.value })} className={inputClass} /></Labeled>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
                  <Labeled label="Header"><input value={t.config.headerText} onChange={(e) => update({ config: { headerText: e.target.value } })} className={inputClass} /></Labeled>
                  <Labeled label="Colour"><input type="color" value={t.config.primaryColor} onChange={(e) => update({ config: { primaryColor: e.target.value } })} className="h-11 w-full cursor-pointer rounded-md border border-line-strong bg-bg p-1" /></Labeled>
                </div>
                <Labeled label="Body" help="Plain text. Line breaks are kept; <b>, <i> and <p> are allowed.">
                  <textarea rows={9} value={t.config.bodyText} onChange={(e) => update({ config: { bodyText: e.target.value } })} className={cn(inputClass, 'resize-y font-mono text-[13px]')} />
                </Labeled>
                <Labeled label="Footer"><input value={t.config.footerText} onChange={(e) => update({ config: { footerText: e.target.value } })} className={inputClass} /></Labeled>
                <label className="flex items-center gap-3 text-sm text-fg">
                  <input type="checkbox" checked={t.config.showSocials} onChange={(e) => update({ config: { showSocials: e.target.checked } })} className="size-4 accent-[#4f7dff]" />
                  Show GitHub and LinkedIn links
                </label>
                {t.config.showSocials && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Labeled label="GitHub URL"><input value={t.config.githubLink ?? ''} onChange={(e) => update({ config: { githubLink: e.target.value } })} className={inputClass} /></Labeled>
                    <Labeled label="LinkedIn URL"><input value={t.config.linkedinLink ?? ''} onChange={(e) => update({ config: { linkedinLink: e.target.value } })} className={inputClass} /></Labeled>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button loading={testing} onClick={test}><Send className="size-4" aria-hidden /> Send test to my inbox</Button>
                <Button variant="primary" loading={saving} onClick={save}>Save template</Button>
              </div>
            </Card>

            <div>
              <p className="label-mono mb-2">Preview · {renderSubject(t.subject, SAMPLE)}</p>
              <iframe title={`Preview of ${t.label}`} srcDoc={previewHtml} sandbox="" className="h-[30rem] w-full rounded-lg border border-line bg-white" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Labeled({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
      {help && <span className="mt-1.5 block text-xs text-subtle">{help}</span>}
    </label>
  );
}
