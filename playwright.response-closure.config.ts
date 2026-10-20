import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',testMatch:'response-closure.spec.ts',timeout:60000,workers:1,outputDir:'test-results/response-closure',use:{baseURL:process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4343',channel:'chrome',trace:'retain-on-failure',screenshot:'only-on-failure'}});
