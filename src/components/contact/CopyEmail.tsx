'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the mailto link still works.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="grid size-9 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-raised hover:text-fg"
      aria-label={copied ? 'Email copied' : 'Copy email address'}
    >
      {copied ? <Check className="size-3.5 text-live" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  );
}
