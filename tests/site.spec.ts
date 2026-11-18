import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/data/projects';
import { brokenImages, horizontalOverflow, scrollThrough, watchErrors } from './helpers';

const WIDTHS = [360, 390, 430, 768, 1024, 1440, 1920];

test.describe('home page — responsive', () => {
  for (const width of WIDTHS) {
    test(`renders cleanly at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      const errors = watchErrors(page);
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Building digital experiences');
      await scrollThrough(page);
      const { overflow, offenders } = await horizontalOverflow(page);
      expect(overflow, `overflow by ${overflow}px: ${offenders.join(', ')}`).toBeLessThanOrEqual(0);
      expect(await brokenImages(page)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('case studies', () => {
  for (const p of projects) {
    test(`/work/${p.slug}`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(`/work/${p.slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.name);
      for (const id of ['overview', 'problem', 'solution', 'process', 'technologies', 'features', 'links']) {
        await expect(page.locator(`#${id}`)).toBeVisible();
      }
      await scrollThrough(page);
      expect(await brokenImages(page)).toEqual([]);
      expect((await horizontalOverflow(page)).overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test('unknown slug returns 404', async ({ page }) => {
    const res = await page.goto('/work/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('doesn');
  });
});

test.describe('navigation', () => {
  test('desktop nav scrolls to sections', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    for (const label of ['About', 'Experience', 'Projects', 'Skills', 'Contact']) {
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${label.toLowerCase()}$`));
      await expect(page.locator(`#${label.toLowerCase()}`)).toBeInViewport();
    }
  });

  test('mobile menu opens, navigates and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: /Projects/ }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator('#projects')).toBeInViewport();
    // Escape closes the menu too.
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('project card opens its case study and back link returns', async ({ page }) => {
    await page.goto('/');
    await page.locator('#projects').getByRole('link', { name: 'LAKSHYA', exact: true }).click();
    await expect(page).toHaveURL(/\/work\/lakshya$/);
    await page.getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });
});

test.describe('projects filter', () => {
  test('filters by category and updates counts', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#projects');
    const group = section.getByRole('group', { name: 'Filter projects by category' });
    for (const [label, filter] of [['Backend', 'backend'], ['Experiments', 'experiments'], ['Frontend', 'frontend']] as const) {
      await group.getByRole('button', { name: new RegExp(`^${label.replace('/', '\\/')}`) }).click();
      const expected = projects.filter((p) => p.filters.includes(filter)).length;
      await expect(section.locator('article, ul > li:has(a[href^="/work/"])')).toHaveCount(expected);
    }
    await group.getByRole('button', { name: /^All/ }).click();
    await expect(section.locator('article, ul > li:has(a[href^="/work/"])')).toHaveCount(projects.length);
  });
});

test.describe('terminal', () => {
  test('runs commands and opens a project', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Terminal command' });
    await input.fill('help');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('Open a case study');
    await input.fill('projects');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('LAKSHYA');
    await page.getByRole('button', { name: 'experience', exact: true }).click();
    await expect(page.getByRole('log')).toContainText('MavenPro');
    await input.fill('nonsense');
    await input.press('Enter');
    await expect(page.getByRole('log')).toContainText('command not found');
    await input.fill('open 1');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/work\/lakshya$/);
  });
});

test.describe('contact form', () => {
  test('shows validation errors without sending', async ({ page }) => {
    let posted = false;
    page.on('request', (r) => { if (r.url().endsWith('/api/contact')) posted = true; });
    await page.goto('/#contact');
    await page.getByRole('button', { name: /Send message/ }).click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    await expect(page.getByText('Please enter your email address.')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeFocused();
    expect(posted).toBe(false);
  });

  test('API rejects bots, fast submissions and invalid input', async ({ request }) => {
    const valid = { name: 'Test', email: 'test@example.com', subject: 'Hello there', message: 'This is a test message long enough.' };
    const old = Date.now() - 10_000;
    expect((await request.post('/api/contact', { data: { ...valid, website: 'spam', startedAt: old } })).status()).toBe(400);
    expect((await request.post('/api/contact', { data: { ...valid, startedAt: Date.now() } })).status()).toBe(400);
    const invalid = await request.post('/api/contact', { data: { ...valid, email: 'nope', startedAt: old } });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).fields.email).toBeTruthy();
  });
});

test.describe('resume & legacy links', () => {
  test('resume page, PDF download and legacy redirects', async ({ page, request }) => {
    const pdf = await request.get('/resume/Akash-Mandal-Resume.pdf');
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    for (const [legacy, target] of [['/resume.html', '/resume'], ['/admin/dashboard.html', '/admin'], ['/admin/login.html', '/admin/login']]) {
      const res = await request.get(legacy, { maxRedirects: 0 });
      expect([307, 308]).toContain(res.status());
      expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(target);
    }

    // Header link opens the live resume page.
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator('article.resume-paper h1')).toHaveText('Akash Mandal');
    await expect(page.getByRole('button', { name: 'Print / Save as PDF' })).toBeVisible();
    // No private details on the public resume: no phone number, no street/village address.
    // ("Balarampur" alone is legitimately the school name, so check the address form "Vill-".)
    expect(await page.locator('article.resume-paper').innerText()).not.toMatch(/\d{10}|Vill-/);

    // PDF download from the resume page.
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'PDF' }).click();
    expect((await download).suggestedFilename()).toBe('Akash-Mandal-Resume.pdf');
  });
});

test.describe('SEO', () => {
  test('metadata, structured data, robots and sitemap', async ({ page, request }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Akash Mandal/);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBeTruthy();
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toContain('opengraph-image');
    expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image');
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(ld.map((x: { '@type': string }) => x['@type'])).toEqual(['Person', 'WebSite']);

    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const p of projects) expect(sitemap).toContain(`/work/${p.slug}`);
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
    const og = await request.get('/opengraph-image');
    expect(og.headers()['content-type']).toBe('image/png');
    await page.goto('/work/lakshya');
    const caseOg = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect((await request.get(new URL(caseOg!).pathname)).headers()['content-type']).toBe('image/png');
  });
});

test.describe('accessibility (axe)', () => {
  for (const path of ['/', '/work/lakshya', '/work/tribal-trends']) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
});
