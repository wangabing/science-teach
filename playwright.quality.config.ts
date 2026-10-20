import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',testMatch:'experiment-quality.spec.ts',timeout:90000,workers:2,fullyParallel:true,outputDir:'test-results/quality',use:{baseURL:process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4324',channel:'chrome',trace:'retain-on-failure',screenshot:'only-on-failure'}});
