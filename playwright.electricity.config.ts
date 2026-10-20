import {defineConfig} from '@playwright/test';
import base from './playwright.lens.config';
export default defineConfig({...base,outputDir:'test-results/electricity',testMatch:'electricity.spec.ts',use:{...base.use,screenshot:'only-on-failure'}});
