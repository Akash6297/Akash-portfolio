import type { Page } from '@playwright/test';

/** Collects console errors, page errors and failed same-origin requests. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    const url = new URL(res.url());
    if (url.hostname === 'localhost' && res.status() >= 400) errors.push(`HTTP ${res.status()} ${url.pathname}`);
  });
  page.on('requestfailed', (req) => {
    if (new URL(req.url()).hostname === 'localhost') errors.push(`failed: ${req.url()}`);
  });
  return errors;
}

/** Scrolls through the page so lazy images load and reveal animations run. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
}

/**
 * Horizontal overflow in px. body uses `overflow-x: clip`, which would hide real
 * overflow, so it is disabled while measuring.
 */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = 'visible';
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= document.documentElement.clientWidth + 1) return false;
        // Ignore content inside horizontally scrolling or clipping containers.
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o !== 'visible') return false;
        }
        return getComputedStyle(el).position !== 'fixed';
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    document.body.style.overflowX = prev;
    return { overflow, offenders };
  });
}

/** Images that failed to load (naturalWidth 0 once complete). */
export async function brokenImages(page: Page) {
  return page.evaluate(() =>
    [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
  );
}
