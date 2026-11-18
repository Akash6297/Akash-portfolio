import { renderOg, OG_SIZE } from '@/lib/og';
import { getProfile } from '@/lib/content';
import { profile as defaultProfile } from '@/data/profile';

export const alt = `${defaultProfile.name} — ${defaultProfile.role}`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const profile = await getProfile();
  return renderOg({
    eyebrow: profile.role,
    title: profile.hero.headline.replaceAll('*', ''),
    subtitle: `${profile.name} — React, Next.js, Node.js and the databases behind them.`,
    footer: `${profile.location.label} · ${profile.availability.open ? profile.availability.label : 'Portfolio'}`,
  });
}
