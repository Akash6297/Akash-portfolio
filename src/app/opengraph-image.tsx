import { renderOg, OG_SIZE } from '@/lib/og';
import { profile } from '@/data/profile';

export const alt = `${profile.name} — ${profile.role}`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
  return renderOg({
    eyebrow: profile.role,
    title: 'Building digital experiences that actually work.',
    subtitle: `${profile.name} — React, Next.js, Node.js and the databases behind them.`,
    footer: `${profile.location.label} · ${profile.availability.open ? profile.availability.label : 'Portfolio'}`,
  });
}
