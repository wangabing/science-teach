import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'four-lab-expansion.spec.ts',
  timeout: 45000,
  workers: 2,
  fullyParallel: true,
  outputDir: 'test-results/expansion',
  use: {
    baseURL: process.env.BROWSER_CHECK_URL ?? 'http://127.0.0.1:4335',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
