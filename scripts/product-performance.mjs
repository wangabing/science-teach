import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4371';
const outputDir=process.env.PERFORMANCE_OUTPUT_DIR??'doc/assets/product-improvement';
const paths=process.env.PERFORMANCE_PATHS?.split(',')??['/','/experiments/','/labs/lens/','/labs/sections/','/labs/moon/','/labs/bridge/','/labs/belt-drive/','/labs/tidal-roche/'];
const label=process.argv[2]??'after';
const conditions={viewport:{width:390,height:844},latency:100,downloadThroughput:200000,uploadThroughput:100000,cpuSlowdown:4,cache:'disabled; fresh context per page',catalogMilestone:'window load + filter ready; all requested resources completed',runs:3};
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'chrome'});
const results=[];
try{
for(const pathname of paths){
 for(let run=1;run<=conditions.runs;run++){
  const context=await browser.newContext({viewport:conditions.viewport,reducedMotion:'reduce'}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:conditions.latency,downloadThroughput:conditions.downloadThroughput,uploadThroughput:conditions.uploadThroughput});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:conditions.cpuSlowdown});
  let transferred=0;cdp.on('Network.loadingFinished',e=>transferred+=e.encodedDataLength);
  await page.goto(base+pathname,{waitUntil:'domcontentloaded'});
  if(pathname==='/')await page.locator('#preview-toggle').waitFor({state:'visible'});
  else if(pathname==='/experiments/'){await page.waitForLoadState('load');await page.locator('[data-catalog-filter][data-ready="true"]').waitFor();}
  else if(['belt-drive','tidal-roche'].some(s=>pathname.includes(s)))await page.locator('[data-discovery][data-ready="true"]').waitFor();
  else await page.waitForFunction(()=>[...document.scripts].filter(s=>s.type==='module').length>0&&document.readyState==='complete');
  // Perform a real native input edit, then wait for a model-grounded visible response.
  if(pathname.includes('/lens/')){await page.locator('#screen-distance').fill('15');await page.locator('#screen-distance').dispatchEvent('input');await page.waitForFunction(()=>document.querySelector('#screen-distance-value')?.textContent?.includes('15'));}
  const measurement=await page.evaluate(()=>({elapsedMs:performance.now(),height:document.documentElement.scrollHeight,htmlBytes:new TextEncoder().encode(document.documentElement.outerHTML).length,cards:document.querySelectorAll('.experiment-card').length}));
  results.push({pathname,run,...measurement,transferredBytes:transferred});await context.close();
  console.log(`${pathname} ${run}/${conditions.runs}: ${Math.round(measurement.elapsedMs)}ms, ${transferred} bytes`);
 }
}
}finally{await browser.close();}
await mkdir(outputDir,{recursive:true});
await writeFile(`${outputDir}/performance-${label}.json`,JSON.stringify({recordedAt:new Date().toISOString(),conditions,limits:'Local synthetic conditions; elapsed milestones differ by page and are not a real-user metric. No cross-page speed ranking.',results},null,2));
console.log(`Saved ${results.length} ${label} measurements`);
