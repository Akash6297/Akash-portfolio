// Captures real screenshots of live project sites and saves optimised WebP files to
// public/images/projects/<slug>/. Re-run any time a project's design changes:
//
//   npm run assets:screenshots            # all projects
//   npm run assets:screenshots lakshya    # one project
//
// Requires Playwright's Chromium: `npx playwright install chromium`.

import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('public/images/projects');

/** Each shot: [file name, path on the site, viewport]. */
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const TARGETS = [
  { slug: 'lakshya', base: 'https://lakshya-ved.vercel.app', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'smoothweb', base: 'https://smoothweb.in', shots: [['desktop', '/', DESKTOP], ['services', '/services', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'smoothcard', base: 'https://card.smoothweb.in', shots: [['desktop', '/', DESKTOP], ['creator', 'https://smoothweb.in/create', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'smoothweb-toolkit', base: 'https://tools.smoothweb.in', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'backgroundblaster', base: 'https://akash6297.github.io/BackgroundBlaster', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'udeline', base: 'https://udeline.com', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'sayandip-portfolio', base: 'https://sayandipdutta.online', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'mission-2026', base: 'https://mission-2026.vercel.app', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'secure-docs', base: 'https://family-secure-doc.vercel.app', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
  { slug: 'placement-cell', base: 'https://placementcellrkmgec.netlify.app', shots: [['desktop', '/', DESKTOP], ['mobile', '/', MOBILE]] },
];

const only = process.argv[2];
const browser = await chromium.launch();

for (const target of TARGETS.filter((t) => !only || t.slug === only)) {
  const dir = path.join(OUT, target.slug);
  await mkdir(dir, { recursive: true });
  for (const [name, route, viewport] of target.shots) {
    const url = route.startsWith('http') ? route : target.base + route;
    const { width, height, ...rest } = viewport;
    const context = await browser.newContext({ viewport: { width, height }, ...rest, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(2500); // let entrance animations and fonts settle
      const png = await page.screenshot({ type: 'png' });
      const file = path.join(dir, `${name}.webp`);
      await sharp(png).webp({ quality: 82 }).toFile(file);
      console.log(`✓ ${target.slug}/${name}.webp  ←  ${url}`);
    } catch (error) {
      console.warn(`✗ ${target.slug}/${name}: ${error.message.split('\n')[0]}`);
    } finally {
      await context.close();
    }
  }
}

await browser.close();
