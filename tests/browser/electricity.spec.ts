import {test,expect,type Page} from '@playwright/test';
async function slider(page:Page,id:string,value:string){await page.locator(id).fill(value);await page.locator(id).dispatchEvent('input');}
async function csv(page:Page){const pending=page.waitForEvent('download');await page.locator('#study-export').click();const stream=await (await pending).createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks).toString('utf8');}

test('divider independent task, loading, snapshot and export stay coherent',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/resistors/');
 await expect(page.locator('#divider-output')).toHaveText('3.000 V');await page.locator('#divider-prepare').click();await expect(page.locator('#divider-output')).toHaveText('4.000 V');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#divider-upper')).toHaveValue('600');
 await slider(page,'#divider-upper','1000');await expect(page.locator('#divider-task-note')).toContainText('独立调阻完成');await page.locator('#study-save').click();
 await page.locator('#divider-load-toggle').click();await expect(page.locator('#divider-output')).toHaveText('2.000 V');await expect(page.locator('#divider-current')).toHaveText('4.000 mA');await expect(page.locator('#divider-task-note')).not.toContainText('独立调阻完成');
 await page.locator('[data-divider-answer=lower]').click();await expect(page.locator('#divider-transfer-note')).toContainText('2 V');await expect(page.locator('#divider-output')).toHaveText('2.000 V');
 await page.locator('#study-save').click();await expect(page.locator('#study-comparison')).toContainText('3.000→2.000 V');
 const data=await csv(page);expect(data).toContain('loaded-divider-v1');expect(data.trim().split('\r\n')).toHaveLength(3);
 await page.getByRole('button',{name:'恢复 A',exact:true}).click();await expect(page.locator('#divider-output')).toHaveText('3.000 V');await expect(page.locator('#divider-task-note')).toContainText('不计为独立');
 await slider(page,'#divider-emf','9');await slider(page,'#divider-lower','2000');await page.locator('#study-save').click();await expect(page.locator('#study-records article')).toHaveCount(2);await expect(page.locator('#study-comparison')).toContainText('多个条件改变');
 await page.reload();await expect(page.locator('#study-records')).toBeEmpty();await expect(page.locator('#study-export')).toBeDisabled();expect(errors).toEqual([]);
});

test('RC exact stepping, continuous switches, signed current and independent observation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/capacitors/');
 await expect(page.locator('#rc-clock')).toHaveText('已暂停 · t = 0.00 s');await page.locator('#rc-step-second').click();
 await expect(page.locator('#rc-voltage')).toHaveText('3.793 V');await expect(page.locator('#rc-current')).toHaveText('+2.207 mA');await expect(page.locator('#rc-task-note')).toContainText('切“保持');
 await page.locator('[data-rc-mode=hold]').click();await expect(page.locator('#rc-voltage')).toHaveText('3.793 V');await expect(page.locator('#rc-current')).toHaveText('0.000 mA');await expect(page.locator('#rc-clock')).toContainText('1.00 s');
 await page.locator('#rc-step-second').click();await expect(page.locator('#rc-voltage')).toHaveText('3.793 V');await expect(page.locator('#rc-task-note')).toContainText('现在切“放电”');
 await page.locator('[data-rc-mode=discharge]').click();await expect(page.locator('#rc-voltage')).toHaveText('3.793 V');await expect(page.locator('#rc-current')).toHaveText('−3.793 mA');
 await page.locator('#rc-step-second').click();await expect(page.locator('#rc-voltage')).toHaveText('1.395 V');await expect(page.locator('#rc-task-note')).toContainText('观察完成');
 await page.locator('#study-save').click();const ledger=await page.locator('#rc-ledger').innerText();const data=await csv(page);expect(data).toContain('ideal-rc-v1');expect(data).toContain('C_F');expect(data).toContain(',discharge,');expect(Number(data.trim().split('\r\n')[1]!.split(',')[7])).toBeLessThan(0);
 await slider(page,'#rc-capacitance','2000');await expect(page.locator('#rc-voltage')).toHaveText('0.000 V');await expect(page.locator('#rc-tau')).toHaveText('2.000 s');await expect(page.locator('#rc-ledger')).toHaveText('0.000 = 0.000 + 0.000 mJ');
 await page.getByRole('button',{name:'恢复 A',exact:true}).click();await expect(page.locator('#rc-voltage')).toHaveText('1.395 V');await expect(page.locator('#rc-ledger')).toHaveText(ledger);await expect(page.locator('#rc-trace-note')).toContainText('此前曲线未保存');await expect(page.locator('#rc-task-note')).toContainText('不计为独立观察完成');await expect(page.locator('#rc-clock')).toContainText('已暂停');
 await page.locator('#rc-prepare').click();await page.locator('#rc-step-second').click();await page.locator('#rc-step-second').click();await expect(page.locator('#rc-voltage')).toHaveText('5.188 V');await slider(page,'#rc-emf','3');await expect(page.locator('#rc-voltage')).toHaveText('0.000 V');await expect(page.locator('#rc-source-label')).toHaveText('3 V');expect(errors).toEqual([]);
});

test('RC same-time capacity comparison, playback and hidden pause',async({page})=>{
 await page.clock.install();await page.goto('/labs/capacitors/');await page.locator('#rc-step-second').click();await page.locator('#study-save').click();
 await slider(page,'#rc-capacitance','2000');await page.locator('#rc-step-second').click();await expect(page.locator('#rc-voltage')).toHaveText('2.361 V');await page.locator('#study-save').click();await expect(page.locator('#study-comparison')).toContainText('同刻同挡位');
 await page.locator('[data-rc-answer=lower]').click();await expect(page.locator('#rc-transfer-note')).toContainText('3.793→2.361 V');
 await page.locator('#rc-play').click();await page.clock.runFor(500);await expect(page.locator('#rc-clock')).toContainText('正在推进');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.locator('#rc-play')).toHaveText('播放');const stopped=await page.locator('#rc-clock').innerText();await page.clock.runFor(5000);await expect(page.locator('#rc-clock')).toHaveText(stopped);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#rc-play')).toHaveText('播放');
});

test.describe('mobile',()=>{test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 for(const slug of ['resistors','capacitors'])test(`${slug} touch, catalog and layout`,async({page})=>{
  await page.goto('/spaces/physics/');await page.locator(`a[href="/labs/${slug}/"]`).first().tap();await expect(page.locator('.study-tools button').first()).toBeEnabled();
  const button=page.locator(slug==='resistors'?'#divider-load-toggle':'#rc-step-second');await button.tap();const box=await button.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByText('读一段背景，带着问题动手',{exact:true}).tap();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
 });});
test.describe('no JS',()=>{test.use({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const slug of ['resistors','capacitors'])test(`${slug} honest fallback`,async({page})=>{
  await page.goto(`/labs/${slug}/`);await expect(page.locator('.study-tools button').first()).toBeDisabled();await expect(page.locator('.study-noscript')).toContainText('启用 JavaScript');
  await page.getByText('读一段背景，带着问题动手',{exact:true}).click();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });});
