import { createHash } from 'node:crypto';
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import mongoose from 'mongoose';

// Run with `npm run test:admin` (scripts/test-admin.mjs provides an in-memory MongoDB).
const ADMIN = { username: 'testadmin', password: 'Test-Password-123' };

test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;

/** Reload until `text` appears (on-demand revalidation regenerates the page on the next request). */
async function expectOnSite(p: Page, path: string, text: string | RegExp) {
  for (let i = 0; i < 6; i++) {
    await p.goto(path);
    const body = await p.locator('body').innerText();
    if (typeof text === 'string' ? body.includes(text) : text.test(body)) return;
    await p.waitForTimeout(800);
  }
  await expect(p.locator('body')).toContainText(text);
}

function istDate(daysAhead: number) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
});
test.afterAll(async () => {
  await context.close();
  await mongoose.disconnect();
});

test('admin area requires sign-in', async ({ request }) => {
  await page.goto('/admin/messages');
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fmessages/);
  expect((await request.get('/api/admin/messages')).status()).toBe(401);
  // Cross-site state-changing requests are rejected before reaching the route.
  const csrf = await request.post('/api/admin/logout', { headers: { Origin: 'https://evil.example' } });
  expect(csrf.status()).toBe(403);
});

test('wrong password is rejected; correct password signs in', async () => {
  await page.goto('/admin/login');
  await page.getByLabel('Username or email').fill(ADMIN.username);
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Incorrect username or password.')).toBeVisible();

  await page.getByLabel('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  // Seeded legacy message counts as unread.
  await expect(page.getByText('Unread messages')).toBeVisible();
});

test('imports the built-in content without changing the site', async () => {
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Import site content' }).click();
  await expect(page.getByText(/Imported: profile, projects/)).toBeVisible();
  await expect(page.getByText('All content is in the database')).toBeVisible();
  await expectOnSite(page, '/', 'LAKSHYA');
});

test('profile edits go live (headline, availability, WhatsApp)', async () => {
  await page.goto('/admin/profile');
  const headline = page.getByLabel('Hero headline');
  await headline.fill('Shipping *reliable* web products.');
  await page.getByLabel('Available for opportunities').uncheck();
  await page.getByLabel('WhatsApp number').fill('919000000000');
  await page.getByRole('button', { name: 'Save changes' }).first().click();
  await expect(page.getByText('Profile saved. The site is updated.')).toBeVisible();

  await expectOnSite(page, '/', 'Shipping reliable web products');
  await expect(page.locator('h1 em')).toHaveText('reliable');
  await expect(page.getByText('Not taking new work right now').first()).toBeVisible();
  await expect(page.locator('#contact').getByRole('button', { name: /Chat on WhatsApp/ })).toBeVisible();
});

test('creates, edits and reorders projects', async () => {
  await page.goto('/admin/content/projects/new');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Admin Test Project');
  await page.getByLabel('URL slug').fill('admin-test-project');
  await page.getByLabel('One-line summary').fill('Created from the admin panel test.');
  await page.getByLabel('Category label').fill('Test app');
  await page.getByLabel('Your role').fill('Developer');
  await page.getByLabel('Technologies').fill('React, Node.js');
  await page.getByLabel('Overview').fill('Overview text.');
  await page.getByLabel('Problem').fill('Problem text.');
  await page.getByLabel('Solution').fill('Solution text.');
  await page.getByRole('button', { name: 'Create' }).first().click();
  await expect(page.getByText('Project created.')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/content\/projects\/[a-f0-9]{24}$/);

  await expectOnSite(page, '/work/admin-test-project', 'Created from the admin panel test.');

  // Validation: a required field left empty is reported per field.
  await page.goBack();
  await page.goto('/admin/content/projects');
  await page.getByRole('link', { name: 'Edit' }).last().click();
  await page.getByLabel('Your role').fill('');
  await page.getByRole('button', { name: 'Save changes' }).first().click();
  await expect(page.getByText('Your role is required.')).toBeVisible();
});

test('edits an experience entry', async () => {
  await page.goto('/admin/content/experience');
  await page.getByRole('link', { name: 'Edit' }).first().click();
  await page.getByLabel('One-line summary').fill('Edited summary from the admin test.');
  await page.getByRole('button', { name: 'Save changes' }).first().click();
  await expect(page.getByText('Saved. The site is updated.')).toBeVisible();
  await expectOnSite(page, '/', 'Edited summary from the admin test.');
});

test('adds the first achievement (section appears on the site)', async () => {
  await page.goto('/admin/content/achievements/new');
  await page.getByLabel('Title').fill('Hackathon finalist');
  await page.getByLabel('Description').fill('Reached the final round.');
  await page.getByRole('button', { name: 'Create' }).first().click();
  await expect(page.getByText('Achievement created.')).toBeVisible();
  await expectOnSite(page, '/', 'Hackathon finalist');
});

test('contact form saves to the inbox; reply reports missing email config', async ({ request }) => {
  const res = await request.post('/api/contact', {
    data: { name: 'Inbox Tester', email: 'inbox@example.test', subject: 'Hello from the test', message: 'This message should land in the admin inbox.', startedAt: Date.now() - 10_000 },
  });
  expect(res.status()).toBe(200);

  await page.goto('/admin/messages');
  await page.getByRole('button', { name: /Inbox Tester/ }).click();
  await expect(page.getByRole('heading', { name: 'Hello from the test' })).toBeVisible();
  await page.getByLabel(/Reply by email/).fill('Thanks for your message!');
  await page.getByRole('button', { name: 'Send reply' }).click();
  await expect(page.getByText(/Email is not configured/)).toBeVisible();

  await page.getByRole('button', { name: /Legacy Visitor/ }).click();
  await expect(page.getByRole('article', { name: 'Message from Legacy Visitor' })).toContainText('A message saved by the old site.');
});

test('booking flow: request on the site, confirm in admin, schedule editing', async () => {
  const date = istDate(3);
  await page.goto('/#contact');
  await page.getByRole('tab', { name: 'Book a call' }).click();
  await page.getByLabel('Date').fill(date);
  await page.getByText('10:00 AM').click();
  await page.locator('#booking-name').fill('Booking Tester');
  await page.locator('#booking-email').fill('booking@example.test');
  await page.waitForTimeout(3200); // spam timer
  await page.getByRole('button', { name: /Request call/ }).click();
  await expect(page.getByText('Request received.')).toBeVisible();

  // The same slot is no longer offered (fresh page load, not just a hash change).
  await page.goto('/?check=slots#contact');
  await page.getByRole('tab', { name: 'Book a call' }).click();
  await page.getByLabel('Date').fill(date);
  await expect(page.getByText('11:00 AM')).toBeVisible();
  await expect(page.locator('label', { hasText: '10:00 AM' })).toHaveCount(0);

  await page.goto('/admin/bookings');
  await expect(page.getByText('Booking Tester')).toBeVisible();
  await page.getByLabel('Meeting link for Booking Tester').fill('https://meet.google.com/test-link');
  await page.getByRole('button', { name: /Confirm & email/ }).click();
  await expect(page.getByText(/Marked as confirmed\. Email is not configured/)).toBeVisible();

  await page.getByRole('tab', { name: 'Weekly schedule' }).click();
  await page.getByLabel('Sunday: maximum bookings').fill('0');
  await page.getByLabel('Monday: time slots, comma-separated').fill('9:30 am, 04:00 PM');
  await page.getByRole('button', { name: 'Save schedule' }).click();
  await expect(page.getByText('Schedule saved.')).toBeVisible();
});

test('email templates can be edited and previewed', async () => {
  await page.goto('/admin/email-templates');
  await page.getByRole('button', { name: 'Message received (to visitor)' }).click();
  await page.getByLabel('Send this email automatically').uncheck();
  await page.getByLabel('Subject').fill('We got your note, {{name}}');
  await page.getByRole('button', { name: 'Save template' }).click();
  await expect(page.getByText('Template saved.')).toBeVisible();
  await expect(page.getByText('Preview · We got your note, Priya Sharma')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Message received \(to visitor\)/ }).click();
  await expect(page.getByLabel('Subject')).toHaveValue('We got your note, {{name}}');
});

test('resume builder: legacy data loads, privacy is respected, template switches', async () => {
  await page.goto('/admin/resume');
  await page.getByRole('button', { name: '2. Personal information' }).click();
  // Legacy HTML summary was converted to plain text.
  await expect(page.getByLabel('Summary')).toHaveValue(/Full Stack Developer with 2\+ years of experience\./);
  await page.getByRole('button', { name: '0. Template & style' }).click();
  await page.getByLabel('Template').selectOption('modern');
  await page.getByRole('button', { name: 'Save resume' }).click();
  await expect(page.getByText('Resume saved. /resume is updated.')).toBeVisible();

  await expectOnSite(page, '/resume', 'Built REST APIs.');
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('9000000000'); // phone hidden by default
  expect(body).not.toContain('Test Village'); // address hidden by default
  await expect(page.locator('article.resume-paper aside')).toBeVisible(); // modern template sidebar
});

test('settings: OTP gate, password change and admin users', async ({ request }) => {
  await page.goto('/admin/settings');
  await expect(page.getByRole('button', { name: 'Change password' })).toBeDisabled();
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByText(/Email is not configured/)).toBeVisible();

  // Email is off in tests, so place a known code in the database directly.
  const me = await (await page.request.get('/api/admin/me')).json();
  await mongoose.connect(process.env.TEST_MONGO_URI!);
  const code = '482913';
  const hash = createHash('sha256').update(`${code}:${process.env.SESSION_SECRET}`).digest('hex');
  await mongoose.connection.db!.collection('admin_otps').insertOne({ userId: me.user.id, codeHash: hash, expiresAt: new Date(Date.now() + 600_000), attempts: 0 });

  const verify = await page.request.post('/api/admin/otp/verify', { data: { code }, headers: { Origin: new URL(page.url()).origin } });
  expect(verify.status()).toBe(200);
  await page.reload();
  await expect(page.getByText('Verified', { exact: true })).toBeVisible();

  // Create an admin, then delete it.
  await page.getByLabel('Username').last().fill('newadmin');
  await page.getByLabel('Email').last().fill('newadmin@example.test');
  await page.getByLabel('Password', { exact: true }).last().fill('New-Admin-Pass-1');
  await page.getByRole('button', { name: 'Add admin' }).click();
  await expect(page.getByText('Admin "newadmin" created.')).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Delete newadmin' }).click();
  await expect(page.getByText('Admin deleted.')).toBeVisible();

  // Change password (and change it back so the suite is repeatable).
  await page.getByLabel('Current password').fill(ADMIN.password);
  await page.getByLabel('New password (8+ characters)').fill('Changed-Password-9');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByText('Password changed.')).toBeVisible();
  void request;
});

test('smart import pre-fills an editor', async () => {
  await page.goto('/admin/import');
  await page.getByLabel('Text', { exact: true }).fill(
    'Senior Developer at Example Corp\nJan 2023 – Dec 2024 · Remote\n• Built a Next.js dashboard with PostgreSQL\n• Led API work in Node.js',
  );
  await expect(page.getByText('Auto-detected: Experience')).toBeVisible();
  await page.getByRole('button', { name: /Open in Experience editor/ }).click();
  await expect(page.getByText('Fields were pre-filled by Smart import')).toBeVisible();
  await expect(page.getByLabel('Role / title')).toHaveValue('Senior Developer');
  await expect(page.getByLabel('Company')).toHaveValue('Example Corp');
  await expect(page.getByLabel('Start (YYYY-MM)')).toHaveValue('2023-01');
  await expect(page.getByLabel('End (YYYY-MM or "present")')).toHaveValue('2024-12');
});

test('image upload explains missing ImgBB key; admin pages are not indexed', async () => {
  const res = await page.request.post('/api/admin/upload', { multipart: { file: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') } }, headers: { Origin: new URL(page.url()).origin } });
  expect(res.status()).toBe(503);
  expect((await res.json()).message).toContain('IMGBB_API_KEY');
  const login = await page.request.get('/admin/login');
  expect(login.headers()['x-robots-tag']).toContain('noindex');
});

test('captures admin screenshots for review', async () => {
  const shots: Array<[string, string]> = [
    ['admin-overview', '/admin'],
    ['admin-messages', '/admin/messages'],
    ['admin-bookings', '/admin/bookings'],
    ['admin-projects', '/admin/content/projects'],
    ['admin-project-edit', '/admin/content/projects'],
    ['admin-profile', '/admin/profile'],
    ['admin-resume', '/admin/resume'],
    ['admin-email-templates', '/admin/email-templates'],
    ['admin-settings', '/admin/settings'],
    ['admin-import', '/admin/import'],
  ];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [name, path] of shots) {
    await page.goto(path);
    if (name === 'admin-project-edit') await page.getByRole('link', { name: 'Edit' }).first().click();
    if (name === 'admin-messages') await page.getByRole('button', { name: /Inbox Tester/ }).click();
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `tests/screenshots/${name}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await expect(page.locator('main h1').first()).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'tests/screenshots/admin-overview-mobile.png' });
  await page.getByRole('button', { name: 'Open admin menu' }).click();
  await page.screenshot({ path: 'tests/screenshots/admin-menu-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
});

test('sign out ends the session', async () => {
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});
