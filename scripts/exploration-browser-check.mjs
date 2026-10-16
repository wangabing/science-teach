import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const base=process.env.BROWSER_CHECK_URL??'http://127.0.0.1:4321';
const out='test-results/exploration';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'chrome',headless:true});
const errors=[];
const paths=['area','sections','orbit','three-body','bridge','gears'];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 const goto=async slug=>{const response=await page.goto(`${base}/labs/${slug}/`,{waitUntil:'networkidle'});assert.equal(response.status(),200);};
 const range=async(id,v)=>{await page.locator(`#${id}`).fill(String(v));await page.locator(`#${id}`).dispatchEvent('input');};
 const steps=async n=>{await page.evaluate(n=>{for(let i=0;i<n;i++)document.getElementById('step').click();},n);};
 const paused=async()=>{assert.equal(await page.locator('#run').getAttribute('aria-pressed'),'false');};
 await goto('area');
 // Pointer coordinates are converted from SVG world to CSS pixels: no assumed scale.
 const points=await page.evaluate(()=>{const svg=document.getElementById('area-svg');const m=svg.getScreenCTM();return [[75,100],[465,100]].map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform(m);return {x:p.x,y:p.y};});});
 await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:10});await page.mouse.up();
 assert.ok((await page.locator('#area-feedback').innerText()).includes('1 / 4'));
 await page.locator('.advanced-tools').evaluate(e=>e.open=true);await page.locator('#piece-1').click();await page.locator('#place').click();assert.ok((await page.locator('#area-feedback').innerText()).includes('朝向还没对上'));
 await page.locator('#rotate').click();await page.locator('#place').click();
 await page.locator('#piece-2').click();for(let i=0;i<3;i++)await page.locator('#rotate').click();await page.locator('#place').click();
 await page.locator('#piece-3').click();await page.locator('#place').click();assert.ok((await page.locator('#area-feedback').innerText()).includes('搬家完成'));
 await range('leg-a',6);assert.ok((await page.locator('#area-feedback').innerText()).includes('0 / 4'));assert.equal(await page.locator('#area-equation').innerText(),'36 + 16 = 52');
 assert.equal(await page.locator('#area-hints polygon').count(),4);
 await page.locator('#triangle-0').focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#area-feedback').innerText()).includes('1 / 4'));
 await page.locator('#reset').click();await page.locator('#hint').click();
 await page.locator('#piece-0').click();await page.locator('#place').click();await page.locator('#piece-1').click();await page.locator('#rotate').click();await page.locator('#place').click();await page.locator('#piece-2').click();for(let i=0;i<3;i++)await page.locator('#rotate').click();await page.locator('#place').click();await page.locator('#piece-3').click();await page.locator('#place').click();
 assert.ok((await page.locator('#area-feedback').innerText()).includes('搬家完成'));
 await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:`${out}/area-desktop.png`,fullPage:true});
 assert.ok((await page.locator('#area-feedback').innerText()).includes('搬家完成'),'full-page capture keeps puzzle state');
 await page.setViewportSize({width:390,height:844});assert.ok((await page.locator('#area-feedback').innerText()).includes('搬家完成'),'responsive layout keeps puzzle state');await page.setViewportSize({width:1440,height:1000});
 await goto('sections');await page.locator('#hexagon').click();assert.ok((await page.locator('#shape-label').textContent()).includes('6 个顶点'));
 await page.locator('#triangle').click();assert.ok((await page.locator('#shape-label').textContent()).includes('3 个顶点'));
 await page.locator('#square').click();assert.ok((await page.locator('#shape-label').textContent()).includes('4 个顶点'));
 await range('azimuth',63);await range('tilt',50);await range('offset',.4);assert.ok((await page.locator('#shape-label').textContent()).includes('5 个顶点'));
 await range('offset',1.8);assert.ok((await page.locator('#section-feedback').innerText()).includes('没有切出多边形'));
 await page.locator('#hexagon').click();await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:`${out}/sections-desktop.png`,fullPage:true});
 await goto('orbit');await paused();await page.locator('#circular').click();await steps(500);assert.ok(Math.abs(parseFloat(await page.locator('#orbit-radius').innerText())-7871)<40);
 await page.locator('#run').click();await page.waitForTimeout(250);await page.locator('#run').click();const stopped=await page.locator('#orbit-time').innerText();await page.waitForTimeout(150);assert.equal(await page.locator('#orbit-time').innerText(),stopped);
 await page.screenshot({path:`${out}/orbit-desktop.png`,fullPage:true});
 await page.locator('#fall').click();await steps(160);assert.ok((await page.locator('#orbit-feedback').innerText()).includes('撞到地球'));assert.ok(await page.locator('#run').isDisabled());
 await page.locator('#escape').click();await steps(800);assert.ok((await page.locator('#orbit-feedback').innerText()).includes('逃逸'));await paused();
 await page.locator('#reset').click();assert.ok(!(await page.locator('#run').isDisabled()));
 await page.locator('#run').click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await paused();
 await goto('three-body');await paused();await range('perturbation',0);await steps(150);assert.equal(await page.locator('#three-distance').innerText(),'0.000000');
 await range('perturbation',.001);await page.locator('#sensitive').click();await steps(1000);assert.ok(parseFloat(await page.locator('#three-distance').innerText())>.005);
 assert.ok(parseFloat(await page.locator('#energy-a').innerText())<2);await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:`${out}/three-body-desktop.png`,fullPage:true});
 await page.locator('#reset').click();assert.equal(await page.locator('#three-time').innerText(),'0.00');
 await goto('bridge');assert.equal(await page.locator('#bridge-status').innerText(),'不稳定');
 await page.locator('#node-0').click();await page.locator('#node-4').click();await page.locator('#node-2').click();await page.locator('#node-4').click();
 assert.equal(await page.locator('#bridge-status').innerText(),'模型稳定');assert.equal(await page.locator('#bridge-reactions').innerText(),'20.0 / 20.0 kN');
 const displacement=parseFloat(await page.locator('#bridge-displacement').innerText());await range('load',80);assert.ok(Math.abs(parseFloat(await page.locator('#bridge-displacement').innerText())-displacement*2)<.03);
 await page.locator('#load-node').selectOption('3');assert.equal(await page.locator('#bridge-reactions').innerText(),'80.0 / 0.0 kN');
 await page.locator('#truss').click();await page.screenshot({path:`${out}/bridge-desktop.png`,fullPage:true});
 await page.locator('#member-8').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#bridge-status').innerText(),'模型稳定');await page.locator('#remove-member').click();assert.equal(await page.locator('#bridge-status').innerText(),'不稳定');
 await page.locator('#reset').click();assert.equal(await page.locator('#load-value').innerText(),'40 kN');
 await goto('gears');await paused();assert.ok(!(await page.locator('#idler-teeth').isVisible()));
 await range('output-teeth',60);assert.equal(await page.locator('#gear-speed').innerText(),'4.00 rpm');
 await page.locator('#idler').click();assert.equal(await page.locator('#gear-direction').innerText(),'同向');assert.ok((await page.locator('#gear-feedback').innerText()).includes('挑战完成'));
 await range('idler-teeth',53);assert.equal(await page.locator('#gear-speed').innerText(),'4.00 rpm');
 const before=await page.locator('#gear-wheels').innerHTML();await page.locator('#step').click();assert.notEqual(await page.locator('#gear-wheels').innerHTML(),before);await paused();
 await page.screenshot({path:`${out}/gears-desktop.png`,fullPage:true});
 await page.locator('#reset').click();assert.equal(await page.locator('#gear-direction').innerText(),'反向');assert.equal(await page.locator('#gear-speed').innerText(),'6.00 rpm');
 // Both mobile widths, all six pages, controls and real diagrams remain usable.
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  for(const path of paths){await goto(path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${path} ${width}`);await page.screenshot({path:`${out}/${path}-${width}.png`,fullPage:true});}
 }
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 await touch.goto(`${base}/labs/area/`,{waitUntil:'networkidle'});
 await touch.locator('.advanced-tools').evaluate(e=>e.open=true);await touch.getByRole('button',{name:'选择青绿块'}).tap();await touch.getByRole('button',{name:'放入对应位置'}).tap();assert.ok((await touch.locator('#area-feedback').innerText()).includes('1 / 4'));await touch.close();
 const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
 for(const path of paths){await reduced.goto(`${base}/labs/${path}/`,{waitUntil:'networkidle'});if(['orbit','three-body','gears'].includes(path))assert.equal(await reduced.locator('#run').getAttribute('aria-pressed'),'false');}
 await reduced.locator('#input-teeth').focus();await reduced.keyboard.press('ArrowRight');assert.equal(await reduced.locator('#input-teeth-value').innerText(),'21');await reduced.close();
 const noJS=await browser.newPage({javaScriptEnabled:false});
 for(const path of paths){await noJS.goto(`${base}/labs/${path}/`);assert.equal(await noJS.locator('h1').count(),1);assert.ok(await noJS.locator('noscript').isVisible());assert.ok(await noJS.locator('svg').count()>0);assert.ok((await noJS.locator('.lab-notes').innerText()).length>100);}
 await noJS.close();assert.deepEqual(errors,[]);console.log('Six exploration labs passed: complete puzzle, real sections, orbit outcomes, paired three-body, truss equilibrium, gear challenge, pause/reset, keyboard, touch, 320/390px, reduced motion and no-JS.');
}finally{await browser.close();}
