'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ImageUp, ScanText } from 'lucide-react';
import { collectionConfig } from '@/lib/admin/fields';
import { detectSection, extract, tidy, type ImportTarget } from '@/lib/admin/smart-import';
import { PREFILL_KEY } from './CollectionEditor';
import { Badge, Button, Card, inputClass, Notice, PageHeader, useToast } from '../ui';
import { cn } from '@/lib/utils';

// OCR runs in the browser with Tesseract.js (pinned version, loaded only when used).
const TESSERACT_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
type TesseractGlobal = { recognize: (image: File, lang: string, opts?: { logger?: (m: { status: string; progress: number }) => void }) => Promise<{ data: { text: string } }> };

function loadTesseract(): Promise<TesseractGlobal> {
  const w = window as unknown as { Tesseract?: TesseractGlobal };
  if (w.Tesseract) return Promise.resolve(w.Tesseract);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TESSERACT_SRC;
    script.async = true;
    script.onload = () => (w.Tesseract ? resolve(w.Tesseract) : reject(new Error('OCR library failed to load.')));
    script.onerror = () => reject(new Error('Could not load the OCR library (check your connection).'));
    document.head.appendChild(script);
  });
}

const TARGETS: ImportTarget[] = ['experience', 'projects', 'education', 'certifications', 'services', 'achievements'];

export function SmartImport() {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = useState('');
  const [refine, setRefine] = useState(true);
  const [override, setOverride] = useState<ImportTarget | ''>('');
  const [ocr, setOcr] = useState<{ busy: boolean; progress: number; status: string }>({ busy: false, progress: 0, status: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const cleaned = refine ? tidy(text) : text;
  const detection = useMemo(() => (cleaned.trim() ? detectSection(cleaned) : null), [cleaned]);
  const target = override || detection?.target || 'experience';
  const result = useMemo(() => (cleaned.trim() ? extract(target, cleaned) : null), [cleaned, target]);

  const runOcr = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('error', 'Upload an image (PNG, JPG or WebP).');
    setOcr({ busy: true, progress: 0, status: 'Loading OCR…' });
    try {
      const Tesseract = await loadTesseract();
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => setOcr({ busy: true, progress: Math.round(m.progress * 100), status: m.status }),
      });
      setText((t) => (t ? `${t}\n\n${data.text}` : data.text).trim());
      toast('success', 'Text extracted from the image. Check it for OCR mistakes.');
    } catch (error) {
      toast('error', (error as Error).message);
    } finally {
      setOcr({ busy: false, progress: 0, status: '' });
    }
  };

  const openEditor = () => {
    if (!result) return;
    try {
      sessionStorage.setItem(PREFILL_KEY(target), JSON.stringify(result));
    } catch {
      return toast('error', 'Your browser blocked temporary storage, so the form could not be pre-filled.');
    }
    router.push(`/admin/content/${target}/new`);
  };

  const config = collectionConfig(target)!;
  const preview = result
    ? config.fields
        .map((f) => {
          const v = f.name.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], result);
          const shown = Array.isArray(v) ? v.join(f.type === 'tags' ? ', ' : ' · ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : typeof v === 'object' && v ? '' : String(v ?? '');
          return { label: f.label, value: shown };
        })
        .filter((r) => r.value)
    : [];

  return (
    <>
      <PageHeader
        title="Smart import"
        description="Paste a job description, project notes or a certificate — or upload a screenshot — and it fills in the right form for you to check before saving."
      />
      <Notice>
        This runs entirely in your browser using pattern matching (and OCR for images). It is not an AI writer: it never invents or rewrites details, so review every field before saving.
      </Notice>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <label htmlFor="import-text" className="mb-1.5 block text-sm text-muted">Text</label>
          <textarea id="import-text" rows={14} value={text} onChange={(e) => setText(e.target.value)} className={cn(inputClass, 'resize-y font-mono text-[13px]')}
            placeholder={'Full-Stack Developer at MavenPro\nApr 2025 – Present · Kolkata, India\n• Built REST APIs with Node.js and MongoDB\n• …'} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => runOcr(e.target.files?.[0] ?? undefined)} />
            <Button onClick={() => fileRef.current?.click()} loading={ocr.busy}>
              <ImageUp className="size-4" aria-hidden /> {ocr.busy ? `${ocr.status} ${ocr.progress}%` : 'Read text from image'}
            </Button>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" checked={refine} onChange={(e) => setRefine(e.target.checked)} className="size-4 accent-[#4f7dff]" />
              Tidy formatting (spacing, bullets, capitals)
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-muted"><ScanText className="size-4" aria-hidden /> Detected section</p>
            <select aria-label="Section to fill" value={target} onChange={(e) => setOverride(e.target.value as ImportTarget)} className={cn(inputClass, 'w-auto py-1.5')}>
              {TARGETS.map((t) => <option key={t} value={t}>{collectionConfig(t)!.label}</option>)}
            </select>
          </div>
          {detection && !override && <p className="mt-2"><Badge tone="accent">Auto-detected: {collectionConfig(detection.target)!.label}</Badge></p>}
          {!result ? (
            <p className="py-16 text-center text-sm text-subtle">Paste text or read an image to see the extracted fields.</p>
          ) : (
            <>
              <dl className="mt-4 divide-y divide-line rounded-md border border-line">
                {preview.length ? preview.map((r) => (
                  <div key={r.label} className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-[9rem_1fr]">
                    <dt className="text-xs text-subtle">{r.label}</dt>
                    <dd className="whitespace-pre-wrap break-words text-sm text-fg">{r.value}</dd>
                  </div>
                )) : <p className="p-3 text-sm text-subtle">Nothing recognised yet.</p>}
              </dl>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" onClick={openEditor}>Open in {config.label} editor <ArrowRight className="size-4" aria-hidden /></Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
