import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/** Loads a Google Font subset for OG rendering; returns null (default font) if offline. */
async function loadFont(family: string, text: string, ital = false) {
  try {
    const query = `family=${family.replace(/ /g, '+')}${ital ? ':ital@1' : ''}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`, { signal: AbortSignal.timeout(5000) })).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url, { signal: AbortSignal.timeout(5000) })).arrayBuffer();
  } catch {
    return null;
  }
}

interface OgOptions {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
}

/** Shared Open Graph card: dark, editorial serif title, mono metadata. */
export async function renderOg({ eyebrow, title, subtitle, footer }: OgOptions) {
  const serif = await loadFont('Instrument Serif', title);
  const sans = await loadFont('Geist', `${eyebrow}${subtitle}${footer}AKASH.`);

  const fonts = [
    serif && { name: 'Instrument Serif', data: serif, weight: 400 as const, style: 'normal' as const },
    sans && { name: 'Geist', data: sans, weight: 400 as const, style: 'normal' as const },
  ].filter(Boolean) as Array<{ name: string; data: ArrayBuffer; weight: 400; style: 'normal' }>;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: '#09090b', color: '#f5f5f5', padding: '64px 72px', fontFamily: 'Geist',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: '#8a8a93', letterSpacing: 2 }}>
          <span style={{ color: '#f5f5f5', fontSize: 26, letterSpacing: 4 }}>
            AKASH<span style={{ color: '#4f7dff' }}>.</span>
          </span>
          <span style={{ textTransform: 'uppercase' }}>{eyebrow}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Instrument Serif', fontSize: title.length > 40 ? 80 : 104, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
          <div style={{ marginTop: 28, fontSize: 30, color: '#a1a1aa', maxWidth: 940, lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, color: '#8a8a93', borderTop: '1px solid #2f2f37', paddingTop: 24 }}>
          <span style={{ width: 10, height: 10, borderRadius: 10, background: '#3ddc97' }} />
          {footer}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
