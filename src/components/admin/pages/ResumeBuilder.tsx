'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { RESUME_FIELDS, normaliseResume, publicResume, type ResumeData } from '@/lib/resume-shared';
import type { Field } from '@/lib/admin/fields';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { adminFetch } from '../api';
import { FormFields } from '../FormFields';
import { Button, Card, Notice, PageHeader, Spinner, useToast } from '../ui';
import { cn } from '@/lib/utils';

type Value = Record<string, unknown>;

const STEPS: Array<{ title: string; names: string[] }> = [
  { title: 'Template & style', names: ['selectedTemplate', 'typography.font', 'typography.size', 'typography.lineHeight', 'typography.sectionGap', 'typography.accentColor'] },
  { title: 'Sections', names: ['sections'] },
  { title: 'Personal information', names: ['personalInfo.name', 'personalInfo.title', 'personalInfo.email', 'personalInfo.phone', 'privacy.showPhone', 'personalInfo.address', 'privacy.showAddress', 'personalInfo.linkedin', 'personalInfo.github', 'personalInfo.website', 'photo', 'personalInfo.photoShape', 'personalInfo.summary'] },
  { title: 'Experience', names: ['experience'] },
  { title: 'Projects', names: ['projects'] },
  { title: 'Education', names: ['education'] },
  { title: 'Skills', names: ['skillCategories'] },
  { title: 'Languages', names: ['languages'] },
];
const fieldsFor = (names: string[]) => names.map((n) => RESUME_FIELDS.find((f) => f.name === n)).filter(Boolean) as Field[];

export function ResumeBuilder() {
  const toast = useToast();
  const [value, setValue] = useState<Value | null>(null);
  const [initial, setInitial] = useState<ResumeData | null>(null);
  const [stored, setStored] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [showPublic, setShowPublic] = useState(true);

  useEffect(() => {
    adminFetch<{ resume: ResumeData & { photo?: Value }; stored: boolean }>('/api/admin/resume').then((res) => {
      if (!res.ok) return setLoadError(res.data.message ?? 'Could not load the resume.');
      setValue(res.data.resume as unknown as Value);
      setInitial(res.data.resume);
      setStored(res.data.stored);
    });
  }, []);

  // Live preview from the unsaved form state.
  const preview = useMemo(() => {
    if (!value || !initial) return null;
    const v = value as Value & { photo?: { src?: string }; personalInfo?: Value; sections?: Array<Value> };
    const draft = {
      ...v,
      personalInfo: { ...(v.personalInfo ?? {}), photoUrl: v.photo?.src ?? '' },
      sections: (v.sections ?? []).map((s, i) => ({ ...s, order: i })),
      experience: (v.experience as Value[] | undefined)?.map((e) => ({ company: '', position: '', startDate: '', endDate: '', description: '', ...e })),
      projects: (v.projects as Value[] | undefined)?.map((p) => ({ name: '', description: '', link: '', ...p })),
    };
    const resume = normaliseResume(draft as never, initial);
    return showPublic ? publicResume(resume) : resume;
  }, [value, initial, showPublic]);

  const save = async () => {
    if (!value) return;
    setSaving(true);
    setErrors({});
    const res = await adminFetch('/api/admin/resume', { method: 'PUT', body: value });
    setSaving(false);
    if (!res.ok) setErrors(res.data.fields ?? {});
    else setStored(true);
    toast(res.ok ? 'success' : 'error', res.data.message ?? (res.ok ? 'Saved.' : 'Could not save.'));
  };

  return (
    <>
      <PageHeader
        title="Resume builder"
        description="Edit your resume and preview it live. The public version is at /resume, where visitors can print or save it as a PDF."
        actions={
          <>
            <a href="/resume" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-strong px-4 text-sm text-fg hover:bg-raised">
              <ExternalLink className="size-4" aria-hidden /> Open /resume
            </a>
            <Button variant="primary" loading={saving} disabled={!value} onClick={save}>Save resume</Button>
          </>
        }
      />
      {loadError && <Notice tone="error">{loadError}</Notice>}
      {!stored && <div className="mb-6"><Notice>No saved resume yet — this one is generated from your site content. Saving stores it.</Notice></div>}
      {Object.keys(errors).length > 0 && <div className="mb-6"><Notice tone="error">Some fields need attention: {Object.values(errors).slice(0, 3).join(' ')}</Notice></div>}
      {!value && !loadError && <Spinner />}
      {value && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <nav aria-label="Resume sections" className="mb-4 flex flex-wrap gap-1">
              {STEPS.map((s, i) => (
                <button key={s.title} type="button" aria-pressed={step === i} onClick={() => setStep(i)}
                  className={cn('min-h-8 rounded-md px-2.5 text-[13px]', step === i ? 'bg-raised text-fg' : 'text-muted hover:text-fg')}>
                  {i}. {s.title}
                </button>
              ))}
            </nav>
            <Card className="p-5">
              <h2 className="mb-4 text-lg font-medium text-fg">{STEPS[step].title}</h2>
              <FormFields fields={fieldsFor(STEPS[step].names)} value={value} onChange={setValue} errors={errors} />
            </Card>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="label-mono">Live preview</p>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={showPublic} onChange={(e) => setShowPublic(e.target.checked)} className="accent-[#4f7dff]" />
                As the public sees it
              </label>
            </div>
            <div className="max-h-[78vh] overflow-auto rounded-lg border border-line bg-[#18181b] p-3">
              {/* zoom scales layout as well as rendering, so the A4 page fits without dead space */}
              <div className="w-fit shadow-xl" style={{ zoom: 0.62 }}>
                {preview && <ResumeDocument resume={preview} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
