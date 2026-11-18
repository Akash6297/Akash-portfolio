'use client';

import { useEffect } from 'react';
import * as m from 'motion/react-m';

// The first page load renders without an entrance fade (so content paints
// immediately); later client-side navigations get a short fade-up.
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <m.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
