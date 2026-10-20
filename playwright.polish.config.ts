import {defineConfig} from '@playwright/test';
import lensConfig from './playwright.lens.config';
const base=process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4321';
export default defineConfig({...lensConfig,testMatch:'balance-paper.spec.ts',webServer:{command:'npm run dev -- --host 127.0.0.1',url:base+'/labs/balance/',reuseExistingServer:true}});
