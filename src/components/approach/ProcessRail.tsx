'use client';

import { useRef } from 'react';
import { useScroll, useSpring } from 'motion/react';
import * as m from 'motion/react-m';

/**
 * Draws the process line as the section scrolls into view: horizontal on desktop,
 * vertical on mobile. Static (fully drawn) under reduced motion.
 */
export function ProcessRail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative">
      {/* Desktop: horizontal rail */}
      <div aria-hidden className="absolute inset-x-0 top-0 hidden h-px bg-line md:block">
        <m.div className="h-full origin-left bg-accent" style={{ scaleX: progress }} />
      </div>
      {/* Mobile: vertical rail */}
      <div aria-hidden className="absolute bottom-0 left-[0.6875rem] top-0 w-px bg-line md:hidden">
        <m.div className="w-full origin-top bg-accent" style={{ scaleY: progress, height: '100%' }} />
      </div>
      {children}
    </div>
  );
}
