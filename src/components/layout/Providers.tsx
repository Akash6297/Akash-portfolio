'use client';

import { LazyMotion, MotionConfig } from 'motion/react';

// Animation features are code-split and fetched after the page is interactive.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

/**
 * Motion is loaded through LazyMotion (small initial bundle) and globally follows the
 * visitor's "reduce motion" OS setting.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
