'use client';

import { useEffect, useState } from 'react';

/** Renders the build year on the server, then the visitor's current year after hydration. */
export function CurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{year}</span>;
}
