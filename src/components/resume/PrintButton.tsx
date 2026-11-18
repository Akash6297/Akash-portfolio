'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-9 items-center gap-2 rounded-md bg-fg px-3 text-sm font-medium text-bg hover:bg-white"
    >
      <Printer className="size-3.5" aria-hidden /> Print / Save as PDF
    </button>
  );
}
