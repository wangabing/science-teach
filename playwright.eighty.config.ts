import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "eighty-experiments.spec.ts",
  timeout: 60000,
  workers: 2,
  fullyParallel: true,
  outputDir: "test-results/eighty",
  use: {
    baseURL: process.env.BROWSER_CHECK_URL ?? "http://127.0.0.1:4335",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
