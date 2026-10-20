import {defineConfig} from '@playwright/test';
import base from './playwright.lens.config';
export default defineConfig({...base,outputDir:'test-results/circuits',testMatch:'circuits.spec.ts',use:{...base.use,screenshot:'only-on-failure'}});
