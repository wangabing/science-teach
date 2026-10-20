import {test,expect} from '@playwright/test';
import {studios} from '../../src/data/discovery-studios';
import {modelById} from '../../src/lib/discovery/registry';
for(const id of ['P01','P08','P07','C04','C05','C08','C17','S04','S10','S24'])test(`${id} evidence remains operable in space and parameter demonstration`,async({page},info)=>{
 const studio=studios.find(s=>s.id===id)!,model=modelById(id);
 await page.goto(`/labs/${studio.slug}/`);await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 const direct=page.locator('#dis-direct-input');
 await page.getByRole('button',{name:'打开三维视图',exact:true}).click();
 await expect(page.locator('#dis-three canvas')).toBeVisible();
 const before=await page.locator('#dis-three').getAttribute('data-measurements');
 await direct.press('End');
 await expect(page.locator('#dis-three')).not.toHaveAttribute('data-measurements',before!);
 await expect(page.locator('#dis-input-'+studio.compare)).toHaveValue((await direct.getAttribute('max'))!);
 const bounds=JSON.parse((await page.locator('#dis-three').getAttribute('data-projected-bounds'))!);
 for(const x of bounds)expect(Math.abs(x)).toBeLessThan(1);
 if(model.demonstration){
  await page.getByRole('button',{name:model.demonstration.title,exact:true}).click();
  await expect(page.getByRole('button',{name:'暂停演示',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'暂停演示',exact:true}).click();
  const value=await page.locator('#dis-input-'+model.demonstration.key).inputValue();
  await page.getByRole('button',{name:'扫描一步',exact:true}).click();
  await expect(page.locator('#dis-input-'+model.demonstration.key)).not.toHaveValue(value);
  await expect(page.locator('#dis-demo-state')).not.toContainText('千km');
 }
 await page.locator('#dis-stage').screenshot({path:info.outputPath(`${id}-space.png`)});
 await page.getByRole('button',{name:'回到二维证据',exact:true}).click();
 const evidence=page.locator('#dis-drawing [data-response-evidence]');await expect(evidence).toBeVisible();
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#dis-stage').screenshot({path:info.outputPath(`${id}-mobile.png`)});
});
test('generic scan supports reduced motion, undo and reset',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/labs/stellar-blackbody/');
 await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 const model=modelById('C17'),c=model.demonstration!;
 await page.getByRole('button',{name:c.title,exact:true}).click();await expect(page.locator('#dis-demo-state')).toContainText('减少动态');
 const before=await page.locator('#dis-direct-input').inputValue();
 await page.getByRole('button',{name:'扫描一步',exact:true}).click();await expect(page.locator('#dis-direct-input')).not.toHaveValue(before);
 await page.getByRole('button',{name:'撤销',exact:true}).click();await expect(page.locator('#dis-direct-input')).toHaveValue(before);
 await page.getByRole('button',{name:'重置',exact:true}).click();await expect(page.locator('#dis-demo-state')).toContainText('可操作');
});
for(const id of ['M09','M10'])test(`${id} discrete demonstration never emits invalid apparatus states`,async({page})=>{
 const studio=studios.find(s=>s.id===id)!,model=modelById(id),demo=model.demonstration!,errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/labs/${studio.slug}/`);await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 await page.clock.install();await page.getByRole('button',{name:demo.title,exact:true}).click();
 await page.clock.runFor(1800);await page.getByRole('button',{name:'暂停演示',exact:true}).click();
 const value=Number(await page.locator('#dis-input-'+demo.key).inputValue());
 const control=model.controls.find(c=>c.key===demo.key)!;
 expect(Number.isInteger(value)).toBe(true);if(control.options)expect(control.options.map(o=>o[0])).toContain(value);
 expect(errors).toEqual([]);
});
test('C10 batches sky pixels while preserving spatial color and live parameter evidence',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/labs/cosmic-background/');await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'打开三维视图',exact:true}).click();
 await expect(page.locator('#dis-three canvas')).toBeVisible();
 await expect(page.locator('#dis-three')).toHaveAttribute('data-surface-batches','1');
 const hash=await page.locator('#dis-three').getAttribute('data-geometry-hash');
 await page.locator('#dis-direct-input').press('End');
 await expect(page.locator('#dis-three')).not.toHaveAttribute('data-geometry-hash',hash!);
 await page.getByRole('button',{name:'正面',exact:true}).click();
 await page.locator('#dis-stage').screenshot({path:info.outputPath('C10-batched.png')});
 await page.getByRole('button',{name:'回到二维证据',exact:true}).click();
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(errors).toEqual([]);
});
