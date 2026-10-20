import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const base=process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4321';
const out='test-results/learning';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'chrome',headless:true});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 const goto=async slug=>{await page.goto(`${base}/labs/${slug}/`,{waitUntil:'networkidle'});if(slug==='sections')await page.getByText('看看示例 · 截面怎样变化',{exact:true}).click();};
 const txt=async id=>page.locator(`#${id}`).innerText();
 const range=async(id,v)=>{await page.locator(`#${id}`).fill(String(v));await page.locator(`#${id}`).dispatchEvent('input');};
 const advance=async ms=>page.clock.runFor(ms);
 const pauseCheck=async(id)=>{await page.locator('#demo-pause').click();const frozen=await txt(id);await advance(600);assert.equal(await txt(id),frozen,`${id} freezes`);};
 await goto('area');assert.equal(await txt('area-progress'),'0 / 4');await advance(500);assert.equal(await txt('area-progress'),'0 / 4');
 await page.locator('#next-piece').click();assert.equal(await txt('area-progress'),'1 / 4');
 await page.locator('#demo').click();await advance(2600);await pauseCheck('area-progress');await page.locator('#demo-pause').click();await advance(8000);assert.equal(await txt('area-progress'),'4 / 4');
 await range('leg-a',6);assert.equal(await txt('area-progress'),'0 / 4');assert.ok((await txt('area-live-formula')).includes('52'));await advance(1000);assert.equal(await txt('area-progress'),'0 / 4');
 await page.locator('#demo').click();await advance(1000);await page.locator('#next-piece').click();const manual=await txt('area-progress');await advance(8500);assert.equal(await txt('area-progress'),manual);console.log('area demonstrations passed');
 await goto('sections');assert.equal(await txt('section-area'),'4.000');assert.equal(await txt('section-perimeter'),'8.000');
 await page.locator('#hexagon').click();assert.ok(Math.abs(Number(await txt('section-area'))-3*Math.sqrt(3))<.002);assert.equal(await page.locator('#section-bars .comparison-row').count(),6);
 await page.locator('#demo').click();await advance(4500);assert.equal(await txt('section-vertices'),'6');await pauseCheck('section-area');await page.locator('#demo-pause').click();await advance(6500);assert.equal(await txt('section-vertices'),'3');
 await page.locator('#demo').click();await advance(1000);await page.locator('#reset').click();await advance(11000);assert.equal(await txt('section-area'),'4.000');
 await goto('orbit');await page.locator('#demo-ellipse').click();await advance(1500);assert.ok(Number(await txt('orbit-eccentricity'))>.1);assert.ok(await page.locator('#orbit-history path').count()>2);await pauseCheck('orbit-time');
 const t=parseFloat(await txt('orbit-time'));await page.locator('#step').click();assert.ok(Math.abs(parseFloat(await txt('orbit-time'))-t-.25)<.11,'single step stays 15 seconds at fast playback');
 await page.locator('#run').click();await advance(10000);assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');assert.ok((await txt('demo-stage')).includes('一圈演示完成'));
 await page.locator('#demo').click();await advance(8000);assert.ok((await txt('demo-stage')).includes('一圈演示完成'));assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');
 await page.locator('#reset').click();assert.equal(await txt('orbit-time'),'0.0 min');assert.equal(await page.locator('#time-rate').inputValue(),'1');
 await page.locator('#demo-ellipse').click();await advance(1000);await range('speed',0);await advance(1000);assert.equal(await txt('orbit-time'),'0.0 min');assert.ok(!(await txt('orbit-apsides')).includes('NaN'));console.log('sections and orbit passed');
 await goto('three-body');await range('star-mass',1.5);assert.ok((await page.locator('#three-body-table tr').first().innerText()).includes('1.50'));await range('velocity-scale',1.2);assert.ok((await txt('three-live-formula')).includes('1.20'));
 await page.locator('#show-forces').uncheck();assert.equal(await page.locator('#forces-a path').count(),0);await page.locator('#show-forces').check();assert.equal(await page.locator('#forces-a path').count(),3);
 await page.locator('#demo').click();await advance(1500);assert.equal(await txt('three-distance'),'0.000000');await pauseCheck('three-time');const before=Number(await txt('three-time'));await page.locator('#step').click();assert.ok(Math.abs(Number(await txt('three-time'))-before-.01)<.001);
 await page.locator('#run').click();await advance(5000);assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');assert.ok((await txt('demo-stage')).includes('结束'));
 await page.locator('#demo-sensitive').click();await advance(6000);assert.ok(Number(await txt('three-distance'))>.005);assert.ok((await txt('demo-stage')).includes('结束'));
 await page.locator('#demo-mass').click();await advance(6000);assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');assert.ok(Number(await txt('three-time'))>0);assert.ok((await txt('demo-stage')).includes('结束')||(await txt('three-feedback')).includes('自动暂停'));
 await page.locator('#reset').click();assert.equal(await txt('three-time'),'0.00');
 await goto('bridge');await page.locator('#guide-next').click();assert.equal(await txt('bridge-status'),'不稳定');await page.locator('#guide-next').click();assert.equal(await txt('bridge-status'),'模型稳定');
 await page.locator('#member-8').focus();await page.keyboard.press('Enter');assert.equal(await txt('bridge-status'),'模型稳定');assert.ok((await txt('bridge-inspection')).includes('当前'));assert.ok((await txt('bridge-member-formula')).includes('× 1000'));
 await page.locator('#remove-member').click();assert.equal(await txt('bridge-status'),'不稳定');
 await page.locator('#demo').click();await advance(6000);await pauseCheck('load-value');await page.locator('#demo-pause').click();await advance(6500);assert.equal(await txt('load-value'),'80 kN');assert.equal(await txt('bridge-reactions'),'40.0 / 40.0 kN');assert.equal(await txt('bridge-live-formula'),'40.00 + 40.00 = 80.00 kN');
 await page.screenshot({path:`${out}/bridge-desktop.png`,fullPage:true});
 await page.locator('#demo').click();await advance(6000);await range('load',30);await advance(12000);assert.equal(await txt('load-value'),'30 kN');console.log('three body and bridge passed');
 await goto('gears');await page.locator('#demo').click();await advance(3000);await pauseCheck('input-turns');await page.locator('#run').click();await advance(15000);assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');assert.ok(Math.abs(Number(await txt('input-turns'))-3)<.021);assert.ok(Math.abs(Number(await txt('output-turns'))-1)<.008);
 assert.ok((await txt('gear-live-formula')).includes('20 / 60'));assert.ok((await txt('gear-torque-formula')).includes('3.000'));assert.equal(await txt('gear-direction'),'反向');
 await page.locator('#demo-idler').click();await advance(16000);assert.equal(await txt('gear-direction'),'同向');assert.ok(Math.abs(Number(await txt('output-turns'))-1)<.008);
 await page.screenshot({path:`${out}/gears-desktop.png`,fullPage:true});
 await page.locator('#demo').click();await advance(1000);await range('output-teeth',40);await advance(17000);assert.equal(await txt('input-turns'),'0.000');
 for(const slug of ['area','sections','orbit','three-body','bridge','gears']){
  await goto(slug);await page.locator('#demo').click();await advance(800);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const snapshot=await page.locator('.lab').innerText();await advance(1000);assert.equal(await page.locator('.lab').innerText(),snapshot,`${slug} pauses in background`);
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${slug} overflow ${width}`);await page.screenshot({path:`${out}/${slug}-${width}.png`,fullPage:true});}
 }
 const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.clock.install();await reduced.goto(`${base}/labs/area/`,{waitUntil:'networkidle'});await reduced.locator('#demo').click();await reduced.clock.runFor(8500);assert.equal(await reduced.locator('#area-progress').innerText(),'4 / 4');await reduced.close();
 assert.deepEqual(errors,[]);console.log('Learning checks passed: six demos, live formulas/data, pause/resume/completion/manual takeover/background, reduced motion, keyboard inspection, 320/390px.');
}finally{await browser.close();}
