'use client';

/* eslint-disable @next/next/no-img-element -- admin previews of arbitrary URLs */
import { useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { getPath, setPath, type Field } from '@/lib/admin/fields';
import { uploadImage } from './api';
import { Button, inputClass, useToast } from './ui';
import { cn } from '@/lib/utils';

type Value = Record<string, unknown>;
type Errors = Record<string, string>;

interface FormFieldsProps {
  fields: Field[];
  value: Value;
  onChange: (next: Value) => void;
  errors?: Errors;
  /** Error-key prefix for nested groups. */
  prefix?: string;
}

/** Renders a form for a list of field definitions (see src/lib/admin/fields.ts). */
export function FormFields({ fields, value, onChange, errors = {}, prefix = '' }: FormFieldsProps) {
  const set = (name: string, v: unknown) => {
    const next = structuredClone(value);
    setPath(next, name, v);
    onChange(next);
  };
  return (
    <div className="grid grid-cols-1 gap-5">
      {fields.map((field) => (
        <FieldControl key={field.name} field={field} value={getPath(value, field.name)} onChange={(v) => set(field.name, v)} errors={errors} errorKey={prefix + field.name} />
      ))}
    </div>
  );
}

function FieldControl({ field, value, onChange, errors, errorKey }: { field: Field; value: unknown; onChange: (v: unknown) => void; errors: Errors; errorKey: string }) {
  const id = useId();
  const error = errors[errorKey];
  const help = 'help' in field ? field.help : undefined;
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy };
  const required = 'required' in field && field.required;

  let control: React.ReactNode;
  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
    case 'month':
      control = (
        <input
          {...common}
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          value={(value as string) ?? ''}
          placeholder={field.type === 'month' ? 'YYYY-MM' : field.placeholder}
          maxLength={field.max ?? (field.type === 'url' ? 1000 : 300)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
      break;
    case 'textarea':
    case 'paragraphs':
    case 'lines': {
      const display = Array.isArray(value) ? value.join(field.type === 'paragraphs' ? '\n\n' : '\n') : ((value as string) ?? '');
      control = (
        <textarea
          {...common}
          rows={'rows' in field && field.rows ? field.rows : field.type === 'textarea' ? 4 : 5}
          value={display}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, 'resize-y leading-relaxed')}
        />
      );
      break;
    }
    case 'tags':
      control = (
        <input {...common} value={Array.isArray(value) ? value.join(', ') : ((value as string) ?? '')} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      );
      break;
    case 'number':
      control = (
        <input {...common} type="number" step="any" min={field.min} max={field.max} value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} className={cn(inputClass, 'max-w-40')} />
      );
      break;
    case 'checkbox':
      return (
        <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-fg">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#4f7dff]" />
          {field.label}
        </label>
      );
    case 'select':
      control = (
        <select {...common} value={(value as string) ?? field.options[0]?.value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, 'max-w-md')}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'checklist': {
      const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
      control = (
        <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-labelledby={`${id}-label`}>
          {field.options.map((o) => (
            <label key={o.value} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={selected.has(o.value)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(o.value);
                  else next.delete(o.value);
                  onChange(field.options.map((x) => x.value).filter((v) => next.has(v)));
                }}
                className="size-4 accent-[#4f7dff]"
              />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    }
    case 'image':
      control = <ImageInput value={value as Value | undefined} onChange={onChange} />;
      break;
    case 'images':
      control = <ImageList value={Array.isArray(value) ? (value as Value[]) : []} onChange={onChange} />;
      break;
    case 'group':
      control = <GroupInput field={field} value={Array.isArray(value) ? (value as Value[]) : []} onChange={onChange} errors={errors} errorKey={errorKey} />;
      break;
  }

  const isFieldset = field.type === 'group' || field.type === 'images' || field.type === 'checklist';
  return (
    <div>
      <label htmlFor={isFieldset ? undefined : id} id={`${id}-label`} className="mb-1.5 block text-sm text-muted">
        {field.label} {required && <span className="text-[#ff6369]" aria-hidden>*</span>}
      </label>
      {control}
      {help && <p id={`${id}-help`} className="mt-1.5 text-xs text-subtle">{help}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-[13px] text-[#ff6369]">{error}</p>}
    </div>
  );
}

function ImageInput({ value, onChange, extra }: { value?: Value; onChange: (v: unknown) => void; extra?: React.ReactNode }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const src = (value?.src as string) ?? '';

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file);
    setUploading(false);
    if (!res.ok) return toast('error', res.message);
    onChange({ ...(value ?? {}), src: res.url, width: res.width, height: res.height, alt: (value?.alt as string) || '' });
    toast('success', 'Image uploaded.');
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-bg/60 p-3 sm:flex-row">
      <div className="grid h-24 w-full shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-surface sm:w-36">
        {src ? <img src={src} alt="" className="h-full w-full object-cover object-top" /> : <ImagePlus className="size-5 text-subtle" aria-hidden />}
      </div>
      <div className="grid flex-1 grid-cols-1 gap-2">
        <input aria-label="Image URL" placeholder="https://… or /images/…" value={src} onChange={(e) => onChange({ ...(value ?? {}), src: e.target.value })} className={inputClass} />
        <input aria-label="Alternative text" placeholder="Alt text (describe the image)" value={(value?.alt as string) ?? ''} onChange={(e) => onChange({ ...(value ?? {}), src, alt: e.target.value })} className={inputClass} />
        {extra}
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
          <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-3.5" aria-hidden /> Upload
          </Button>
          {src && (
            <Button size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ItemControls({ index, length, onMove, onRemove, label }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}><ArrowUp className="size-3.5" aria-hidden /></Button>
      <Button size="sm" variant="ghost" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}><ArrowDown className="size-3.5" aria-hidden /></Button>
      <Button size="sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 className="size-3.5" aria-hidden /></Button>
    </div>
  );
}

function ImageList({ value, onChange }: { value: Value[]; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-3">
      {value.map((img, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-subtle">Screenshot {i + 1}</span>
            <ItemControls index={i} length={value.length} label={`screenshot ${i + 1}`} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
          <ImageInput
            value={img}
            onChange={(v) => onChange(value.map((x, j) => (j === i ? (v ?? {}) : x)).filter((x) => x && Object.keys(x as object).length))}
            extra={
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_9rem]">
                <input aria-label="Caption" placeholder="Caption (optional)" value={(img.caption as string) ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} className={inputClass} />
                <select aria-label="Frame" value={(img.device as string) ?? 'desktop'} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, device: e.target.value } : x)))} className={inputClass}>
                  <option value="desktop">Browser frame</option>
                  <option value="mobile">Phone frame</option>
                </select>
              </div>
            }
          />
        </div>
      ))}
      <Button size="sm" onClick={() => onChange([...value, { src: '', alt: '', device: 'desktop' }])}>
        <Plus className="size-3.5" aria-hidden /> Add screenshot
      </Button>
    </div>
  );
}

function GroupInput({ field, value, onChange, errors, errorKey }: { field: Extract<Field, { type: 'group' }>; value: Value[]; onChange: (v: unknown) => void; errors: Errors; errorKey: string }) {
  const titleKey = field.fields.find((f) => f.type === 'text')?.name;
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <details key={i} open={value.length <= 3 || Object.keys(errors).some((k) => k.startsWith(`${errorKey}.${i}.`))} className="group rounded-md border border-line bg-bg/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0 truncate text-sm text-fg">
              <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, '0')} </span>
              {(titleKey && (item[titleKey] as string)) || `${field.itemLabel} ${i + 1}`}
            </span>
            {/* preventDefault: clicking these buttons must not also open/close the panel */}
            <span onClick={(e) => e.preventDefault()}>
              <ItemControls index={i} length={value.length} label={`${field.itemLabel.toLowerCase()} ${i + 1}`} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
            </span>
          </summary>
          <div className="border-t border-line p-3">
            <FormFields fields={field.fields} value={item} onChange={(next) => onChange(value.map((x, j) => (j === i ? next : x)))} errors={errors} prefix={`${errorKey}.${i}.`} />
          </div>
        </details>
      ))}
      <Button size="sm" onClick={() => onChange([...value, {}])}>
        <Plus className="size-3.5" aria-hidden /> Add {field.itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
