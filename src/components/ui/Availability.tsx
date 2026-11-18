import type { ProfileData } from '@/data/types';
import { cn } from '@/lib/utils';

/** Availability pill driven by profile.availability (a setting, not a live status). */
export function Availability({ availability, className }: { availability: ProfileData['availability']; className?: string }) {
  const { open, label } = availability;
  return (
    <span className={cn('inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pl-2.5 pr-3.5 text-[13px] text-muted', className)}>
      <span aria-hidden className={cn('size-2 rounded-full', open ? 'live-dot relative bg-live' : 'bg-subtle')} />
      {open ? label : 'Not taking new work right now'}
    </span>
  );
}
