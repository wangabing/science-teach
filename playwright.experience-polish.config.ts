import { defineConfig } from "@playwright/test";
import base from "./playwright.expansion.config";
export default defineConfig({
  ...base,
  testMatch: "experiment-experience-polish.spec.ts",
  outputDir: "test-results/experience-polish",
  timeout: 60000,
});
