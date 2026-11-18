import {
  siAndroid, siAxios, siChartdotjs, siCss, siDeno, siExpress, siFirebase, siFramer, siGit, siGithub,
  siGoogleappsscript, siGooglecloud, siHtml5, siJavascript, siJsonwebtokens, siJupyter, siMongodb, siMongoose,
  siNetlify, siNextdotjs, siNodedotjs, siPostgresql, siPwa, siPython, siReact, siReactrouter, siSass, siSqlite,
  siStreamlit, siSupabase, siTailwindcss, siTypescript, siVercel, siVite, siVitest, siWordpress, siZod,
  type SimpleIcon,
} from 'simple-icons';
import { cn } from '@/lib/utils';

// Brand marks from Simple Icons (CC0). Add an entry here to use a new `icon` key in src/data.
const ICONS: Record<string, SimpleIcon> = {
  android: siAndroid, axios: siAxios, chartdotjs: siChartdotjs, css: siCss, deno: siDeno, express: siExpress,
  firebase: siFirebase, framer: siFramer, git: siGit, github: siGithub, googleappsscript: siGoogleappsscript,
  googlecloud: siGooglecloud, html5: siHtml5, javascript: siJavascript, jsonwebtokens: siJsonwebtokens,
  jupyter: siJupyter, mongodb: siMongodb, mongoose: siMongoose, netlify: siNetlify, nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs, postgresql: siPostgresql, pwa: siPwa, python: siPython, react: siReact,
  reactrouter: siReactrouter, sass: siSass, sqlite: siSqlite, streamlit: siStreamlit, supabase: siSupabase,
  tailwindcss: siTailwindcss, typescript: siTypescript, vercel: siVercel, vite: siVite, vitest: siVitest,
  wordpress: siWordpress, zod: siZod,
};

/** Relative luminance of a hex colour, used to avoid near-black brand colours on a dark UI. */
function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Brand colour shown on hover (falls back to foreground for dark marks). */
export function brandColor(key?: string) {
  const icon = key ? ICONS[key] : undefined;
  if (!icon) return undefined;
  return luminance(icon.hex) < 0.08 ? '#f5f5f5' : `#${icon.hex}`;
}

export function TechIcon({ icon, name, className }: { icon?: string; name: string; className?: string }) {
  const data = icon ? ICONS[icon] : undefined;
  if (!data) {
    const letters = name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <span
        aria-hidden
        className={cn('inline-grid size-4 shrink-0 place-items-center rounded-[3px] border border-current text-[7px] font-semibold leading-none tracking-tight', className)}
      >
        {letters}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('size-4 shrink-0 fill-current', className)}>
      <path d={data.path} />
    </svg>
  );
}
