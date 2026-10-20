import {defineConfig} from '@playwright/test';
export default defineConfig({
 outputDir:'test-results/lens-workbench',timeout:90000,testDir:'./tests/browser',testMatch:'lens-workbench.spec.ts',fullyParallel:false,
 use:{baseURL:process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4321',channel:process.env.PLAYWRIGHT_CHANNEL??'chrome',trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --host 127.0.0.1',url:(process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4321')+'/labs/lens/',reuseExistingServer:true},
});
