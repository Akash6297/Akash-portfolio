import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  projects: [
    // Public site — `npm run test:e2e` (against the production build).
    { name: 'site', testMatch: /(site|smart-import)\.spec\.ts/ },
    // Admin panel — `npm run test:admin` (starts an in-memory MongoDB; see scripts/test-admin.mjs).
    { name: 'admin', testMatch: /admin\.spec\.ts/, fullyParallel: false },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
    // Tests must never touch the production database or send real email.
    env: { MONGO_URI: '', EMAIL_USER: '', EMAIL_PASS: '', IMGBB_API_KEY: '' },
  },
});
