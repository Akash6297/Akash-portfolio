// One-off helper that printed public/resume/Akash-Mandal-Resume.pdf from the legacy
// resume builder (akash-mandal.vercel.app/resume.html) while it was still online.
//
// The phone number is removed and the street address is replaced with the city, so
// the public PDF carries no private contact details.
//
// Once the legacy site is replaced, update the resume by exporting a new PDF from
// your editor of choice and overwriting public/resume/Akash-Mandal-Resume.pdf.
//
//   RESUME_SOURCE=https://akash-mandal.vercel.app/resume.html npm run assets:resume

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const SOURCE = process.env.RESUME_SOURCE ?? 'https://akash-mandal.vercel.app/resume.html';
const OUT_DIR = 'public/resume';
const OUT = `${OUT_DIR}/Akash-Mandal-Resume.pdf`;
const PUBLIC_LOCATION = 'Purulia, West Bengal, India';

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

await page.route('**/api/resume', async (route) => {
  const response = await route.fetch();
  const data = await response.json();
  data.personalInfo.phone = '';
  data.personalInfo.address = PUBLIC_LOCATION;
  await route.fulfill({ response, json: data });
});

await page.goto(SOURCE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Saved ${OUT}`);
