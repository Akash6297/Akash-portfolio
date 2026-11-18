'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Toasts ───────────────────────────────────────────────────────────────────

type Toast = { id: number; tone: 'success' | 'error'; message: string };
const ToastContext = createContext<(tone: Toast['tone'], message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} role={t.tone === 'error' ? 'alert' : 'status'} className={cn('pointer-events-auto flex items-start gap-3 rounded-md border bg-surface p-3.5 text-sm shadow-2xl', t.tone === 'error' ? 'border-[#e5484d]/50' : 'border-live/40')}>
            {t.tone === 'error' ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#ff6369]" aria-hidden /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-live" aria-hidden />}
            <p className="flex-1 text-fg">{t.message}</p>
            <button type="button" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} className="text-subtle hover:text-fg" aria-label="Dismiss">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ── Building blocks ──────────────────────────────────────────────────────────

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl text-fg">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean; size?: 'sm' | 'md' };

export function Button({ variant = 'secondary', loading, size = 'md', className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'min-h-8 px-2.5 text-[13px]' : 'min-h-10 px-4',
        variant === 'primary' && 'bg-fg text-bg hover:bg-white',
        variant === 'secondary' && 'border border-line-strong bg-surface text-fg hover:border-subtle hover:bg-raised',
        variant === 'ghost' && 'text-muted hover:bg-raised hover:text-fg',
        variant === 'danger' && 'border border-[#e5484d]/40 text-[#ff6369] hover:bg-[#e5484d]/10',
        className,
      )}
      {...rest}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-lg border border-line bg-surface/40', className)}>{children}</div>;
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'accent' | 'live' | 'warn' | 'danger'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider',
        tone === 'neutral' && 'border-line-strong text-muted',
        tone === 'accent' && 'border-accent/50 text-accent-strong',
        tone === 'live' && 'border-live/40 text-live',
        tone === 'warn' && 'border-[#f5a524]/40 text-[#f5a524]',
        tone === 'danger' && 'border-[#e5484d]/40 text-[#ff6369]',
      )}
    >
      {children}
    </span>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'error'; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-md border p-4 text-sm',
        tone === 'info' && 'border-accent/30 bg-accent/5 text-fg',
        tone === 'warn' && 'border-[#f5a524]/35 bg-[#f5a524]/5 text-fg',
        tone === 'error' && 'border-[#e5484d]/40 bg-[#e5484d]/10 text-fg',
      )}
    >
      <CircleAlert className={cn('mt-0.5 size-4 shrink-0', tone === 'info' ? 'text-accent-strong' : tone === 'warn' ? 'text-[#f5a524]' : 'text-[#ff6369]')} aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="flex items-center gap-2 py-10 text-sm text-subtle" role="status">
      <LoaderCircle className="size-4 animate-spin" aria-hidden /> {label}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export const inputClass =
  'block w-full rounded-md border border-line-strong bg-bg px-3 py-2.5 text-[15px] text-fg placeholder:text-subtle/70 transition-colors hover:border-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-[#e5484d]';
