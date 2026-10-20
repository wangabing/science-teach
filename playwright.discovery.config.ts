import {defineConfig} from '@playwright/test';
import base from './playwright.lens.config';
export default defineConfig({...base,outputDir:'test-results/discovery',testMatch:['first-task.spec.ts','interference.spec.ts'],use:{...base.use,screenshot:'only-on-failure'}});
