import {test,expect} from '@playwright/test';
import {experiments} from '../../src/data/labs';
import {studios} from '../../src/data/discovery-studios';
import {experimentHistory} from '../../src/data/experiment-history';
import {modelById} from '../../src/lib/discovery/registry';
import {format,solveModel} from '../../src/lib/discovery/core';
import fs from 'node:fs/promises';
const directory=process.env.QUALITY_SCREENSHOT_DIR??'/tmp/science-teach-quality';
for(const experiment of experiments) {
 test(`${experiment.slug} student entry, real controls, history and spatial evidence`,async({page},info)=>{
  await fs.mkdir(directory,{recursive:true});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1080});
  await page.goto(experiment.href);
  const history=page.locator('[data-experiment-history]');
  await expect(history).toHaveCount(1);
  const story=experimentHistory[experiment.slug]!;
  expect(story.lead).not.toBe(story.background);
  await expect(history.locator('.history-lead')).toHaveText(story.lead);
  await history.getByText('读一段背景，带着问题动手',{exact:true}).click();
  await expect(history.locator('.history-expanded')).toBeVisible();
  await expect(history.locator('a').first()).toHaveAttribute('href',/^https:\/\//);
  await history.getByText('读一段背景，带着问题动手',{exact:true}).click();
  const studio=studios.find(s=>s.slug===experiment.slug);
  if(studio){
   const model=modelById(studio.id);
   await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
   expect(await history.evaluate(e=>e.getBoundingClientRect().bottom)).toBeLessThan(await page.locator('#dis-tools').evaluate(e=>e.getBoundingClientRect().top));
   // A real keyboard gesture on the control beside the apparatus must update BOTH input surfaces.
   const direct=page.getByRole('slider',{name:`装置旁直接调整${model.controls.find(c=>c.key===studio.compare)!.label}`,exact:true});
   await direct.press('End');
   const comparison=model.controls.find(c=>c.key===studio.compare)!;
   const maximum=Number(await direct.getAttribute('max'));
   await expect(page.locator(`#dis-input-${studio.compare}`)).toHaveValue(String(maximum));
   await expect(page.locator('#dis-direct-value')).toHaveText(`${format(maximum)} ${comparison.unit}`.trim());
   await page.getByRole('button',{name:'重置',exact:true}).click();
   await page.locator('#dis-stage').screenshot({path:`${directory}/${studio.id}-2d.png`});
   await page.getByRole('button',{name:'打开三维视图',exact:true}).click();
   await expect(page.locator('#dis-three canvas')).toBeVisible();
   await expect(page.locator('.dis-spatial-readings')).toBeVisible();
   // Check every actual control in the rendered UI, not just the authored A/B presets.
   const probes=[];
   for(const control of model.controls){
    await page.getByRole('button',{name:'重置',exact:true}).click();
    const input=page.locator(`#dis-input-${control.key}`);
    await page.locator('#dis-advanced').evaluateAll(els=>els.forEach(e=>(e as HTMLDetailsElement).open=true));
    for(const [key,declared] of [['Home',control.min],['End',control.max]] as const){
     const value=control.options?declared:Number(await input.getAttribute(key==='Home'?'min':'max'));
     if(control.options)await input.selectOption(String(value));else await input.press(key);
     await expect(input).toHaveValue(String(value));
     const actualInputs=await page.locator('[data-dis-input]').evaluateAll(inputs=>Object.fromEntries(inputs.map(el=>[(el as HTMLElement).dataset.disInput!,Number((el as HTMLInputElement).value)])));
     const expected=solveModel(model,actualInputs);
     const actual=JSON.parse((await page.locator('#dis-three').getAttribute('data-measurements'))!);
     expect(actual.length).toBe(expected.metrics.length);
     for(const metric of expected.metrics){
      const measured=actual.find((m:{key:string})=>m.key===metric.key);
      expect(measured.unit).toBe(metric.unit);
      if(metric.value===null)expect(measured.value).toBeNull();else expect(Math.abs(measured.value-metric.value)).toBeLessThanOrEqual(Math.max(1e-300,Math.abs(metric.value)*1e-9,/residual|drift/.test(metric.key)?1e-9:0));
      await expect(page.locator(`[data-reading="${metric.key}"] dd`)).toHaveText(`${format(measured.value)} ${metric.unit}`.trim());
     }
     probes.push({control:control.key,value,status:expected.status,spatialRevision:await page.locator('#dis-three').getAttribute('data-revision')});
    }
   }
   await page.getByRole('button',{name:'重置',exact:true}).click();
   if(model.time){
    const before=await page.locator('#dis-three').getAttribute('data-geometry-hash');
    await page.getByRole('button',{name:'单步',exact:true}).click();
    await expect.poll(()=>page.locator('#dis-three').getAttribute('data-geometry-hash')).not.toBe(before);
    const value=await page.locator('#dis-clock').textContent();
    await page.locator('#dis-play').click();
    await expect.poll(()=>page.locator('#dis-clock').textContent()).not.toBe(value);
    await page.locator('#dis-play').click();
    await expect(page.locator('#dis-play')).toHaveAttribute('aria-pressed','false');
   }
   await page.locator('#dis-stage').screenshot({path:`${directory}/${studio.id}-3d.png`});
   await page.getByRole('button',{name:'回到二维证据',exact:true}).click();
   await page.setViewportSize({width:390,height:844});
   await direct.scrollIntoViewIfNeeded();
   await direct.press('Home');
   await expect(page.locator('#dis-direct-value')).toHaveText(`${format(comparison.min)} ${comparison.unit}`.trim());
   await page.screenshot({path:`${directory}/${studio.id}-mobile.png`});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await fs.writeFile(`${directory}/${studio.id}-audit.json`,JSON.stringify({id:studio.id,slug:studio.slug,history:true,controls:probes,playback:!!model.time,errors},null,2));
  } else {
   await page.screenshot({path:`${directory}/legacy-${experiment.slug}-entry.png`});
   const flatSelectors:Record<string,string>={area:'#area-svg',sections:'#cube-view',orbit:'#orbit-svg','three-body':'#three-a',bridge:'#bridge-svg',gears:'#gear-svg',interference:'#wave-map',circuits:'#circuit-svg',resistors:'#divider-svg',capacitors:'#rc-svg',reflection:'#geo-svg','circle-angles':'#geo-svg','triangle-rigidity':'#geo-svg','ellipse-string':'#geo-svg'};
   const opener=page.getByRole('button',{name:'打开三维视图',exact:true});
   if(await opener.count()) {
    await page.locator(flatSelectors[experiment.slug]!).screenshot({path:`${directory}/legacy-${experiment.slug}-2d.png`});
    await expect(opener).toBeEnabled();await opener.click();
    await expect(page.locator('[data-legacy-host] canvas')).toBeVisible();
    await page.locator('[data-legacy-host]').screenshot({path:`${directory}/legacy-${experiment.slug}-3d.png`});
   } else {
    const native:Record<string,[string,string,string]>={buoyancy:['#lab-viewport','#buoyancy-2d','查看二维实验'],pendulum:['#apparatus','#fallback-svg','查看二维实验'],lens:['#lens-spatial','#lens-bench','切换二维光路'],moon:['#moon-spatial','#moon-2d','切换二维示意'],mobius:['#paper-spatial','#paper-fallback','切换二维示意'],balance:['#balance-spatial','#balance-2d','切换二维示意']};
    const [host,flat,toggle]=native[experiment.slug]!;
    await expect(page.locator(`${host} canvas`)).toBeVisible();
    await page.locator(host).screenshot({path:`${directory}/legacy-${experiment.slug}-3d.png`});
    if(experiment.slug==='lens')await page.locator('#lens-advanced').evaluate(e=>(e as HTMLDetailsElement).open=true);
    await page.getByRole('button',{name:toggle,exact:true}).click();
    await expect(page.locator(`${host} canvas`)).not.toBeVisible();
    await expect(page.locator(flat)).toBeVisible();
    await page.locator(flat).screenshot({path:`${directory}/legacy-${experiment.slug}-2d.png`});
   }
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:`${directory}/legacy-${experiment.slug}-mobile.png`});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await fs.writeFile(`${directory}/legacy-${experiment.slug}-audit.json`,JSON.stringify({slug:experiment.slug,history:true,twoDimensional:true,threeDimensional:true,errors},null,2));
  }
  expect(errors).toEqual([]);
  await info.attach('history-and-operation',{body:JSON.stringify({slug:experiment.slug,history:story.period}),contentType:'application/json'});
 });
}

test('belt drive supports on-apparatus resizing and synchronized motion',async({page})=>{
 await page.setViewportSize({width:1440,height:1080});await page.goto('/labs/belt-drive/');
 await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 const svg=page.locator('#dis-svg');await svg.scrollIntoViewIfNeeded();const box=(await svg.boundingBox())!;
 await page.mouse.move(box.x+650/800*box.width,box.y+230/460*box.height);await page.mouse.down();
 await page.mouse.move(box.x+695/800*box.width,box.y+230/460*box.height);await page.mouse.up();
 await expect(page.locator('#dis-input-ratio')).toHaveValue('3');
 await page.locator('#dis-play').click();await expect.poll(()=>page.locator('#dis-clock').textContent()).not.toBe('0 s');
 await page.locator('#dis-play').click();const time=Number(await page.locator('#dis-input-time').inputValue());
 await page.locator('#dis-view').click();await expect(page.locator('#dis-three canvas')).toBeVisible();
 const metrics=JSON.parse((await page.locator('#dis-three').getAttribute('data-measurements'))!);
 const v=(k:string)=>metrics.find((m:{key:string})=>m.key===k).value;
 expect(v('input_turns')).toBeCloseTo(120*time/60,8);expect(v('output_turns')).toBeCloseTo(v('input_turns')/3,8);
 expect(v('belt_speed')).toBeCloseTo(120*2*Math.PI*.1/60,8);
});
