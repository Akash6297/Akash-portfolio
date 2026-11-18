'use client';

import { useEffect, useState } from 'react';
import { PROFILE_FIELDS, type Field } from '@/lib/admin/fields';
import { adminFetch } from '../api';
import { FormFields } from '../FormFields';
import { Button, Card, Notice, PageHeader, Spinner, useToast } from '../ui';

type Value = Record<string, unknown>;

const GROUPS: Array<{ title: string; description: string; names: string[] }> = [
  { title: 'Availability', description: 'Shown in the hero, contact section and terminal.', names: ['availability.open', 'availability.label', 'availability.detail'] },
  { title: 'Identity & contact', description: 'Name, role and how people reach you.', names: ['name', 'role', 'email', 'whatsapp', 'location.city', 'location.region', 'location.country', 'location.label', 'current.role', 'current.company', 'experienceSummary'] },
  { title: 'Hero', description: 'The first screen of the site.', names: ['hero.headline', 'hero.statement', 'hero.intro'] },
  { title: 'About', description: 'Portrait, bio, principles and languages.', names: ['portrait', 'about.lead', 'about.paragraphs', 'about.principles', 'about.languages'] },
  { title: 'Contact section & links', description: 'Contact copy, social links and the resume PDF.', names: ['contact.headline', 'contact.text', 'socials', 'resume.href', 'resume.fileName'] },
  { title: 'Footer', description: '', names: ['footer.statement', 'footer.closing'] },
];

const fieldsFor = (names: string[]) => names.map((n) => PROFILE_FIELDS.find((f) => f.name === n)).filter(Boolean) as Field[];

export function ProfileEditor() {
  const toast = useToast();
  const [value, setValue] = useState<Value | null>(null);
  const [source, setSource] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<{ profile: Value; source: string }>('/api/admin/profile').then((res) => {
      if (!res.ok) return setLoadError(res.data.message ?? 'Could not load the profile.');
      setValue(res.data.profile);
      setSource(res.data.source);
    });
  }, []);

  const save = async () => {
    if (!value) return;
    setSaving(true);
    setErrors({});
    const res = await adminFetch('/api/admin/profile', { method: 'PUT', body: value });
    setSaving(false);
    if (!res.ok) setErrors(res.data.fields ?? {});
    else setSource('database');
    toast(res.ok ? 'success' : 'error', res.data.message ?? (res.ok ? 'Saved.' : 'Could not save.'));
  };

  return (
    <>
      <PageHeader
        title="Profile & hero"
        description="Your headline, bio, availability and contact details across the site."
        actions={<Button variant="primary" loading={saving} disabled={!value} onClick={save}>Save changes</Button>}
      />
      {loadError && <Notice tone="error">{loadError}</Notice>}
      {source === 'defaults' && <div className="mb-6"><Notice>This shows the built-in profile. Saving stores it in the database, and from then on edits here update the site.</Notice></div>}
      {Object.keys(errors).length > 0 && <div className="mb-6"><Notice tone="error">Some fields need attention.</Notice></div>}
      {!value && !loadError && <Spinner />}
      {value && (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
          {GROUPS.map((g) => (
            <Card key={g.title} className="p-5 sm:p-6">
              <h2 className="text-lg font-medium text-fg">{g.title}</h2>
              {g.description && <p className="mb-5 mt-1 text-sm text-muted">{g.description}</p>}
              <FormFields fields={fieldsFor(g.names)} value={value} onChange={setValue} errors={errors} />
            </Card>
          ))}
          <div className="sticky bottom-0 flex justify-end border-t border-line bg-bg/95 py-4 backdrop-blur">
            <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
          </div>
        </form>
      )}
    </>
  );
}
