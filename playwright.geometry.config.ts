import {defineConfig} from '@playwright/test';
import base from './playwright.lens.config';
export default defineConfig({...base,outputDir:'test-results/geometry',testMatch:'geometry-studios.spec.ts',use:{...base.use,screenshot:'only-on-failure'}});
