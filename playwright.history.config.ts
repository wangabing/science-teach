import {defineConfig} from '@playwright/test';
import base from './playwright.lens.config';
export default defineConfig({...base,outputDir:'test-results/history',testMatch:'experiment-history.spec.ts',use:{...base.use,screenshot:'only-on-failure'}});
