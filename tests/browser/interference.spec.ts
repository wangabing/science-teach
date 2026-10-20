import {test,expect,type Page} from '@playwright/test';
async function range(page:Page,id:string,value:number){await page.locator(`#wave-${id}`).fill(String(value));await page.locator(`#wave-${id}`).dispatchEvent('input');}

test('quiet-point task uses amplitude, keeps evidence through animation, and invalidates edits',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto('/labs/interference/');
 await expect(page.getByRole('button',{name:'播放波纹',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'准备静点任务'}).click();
 await expect(page.locator('#wave-amplitude')).toHaveText('2.000');await expect(page.locator('#wave-task-note')).not.toContainText('找到了');
 await range(page,'phase',180);await expect(page.locator('#wave-amplitude')).toHaveText('0.000');await expect(page.locator('#wave-task-note')).toContainText('找到了');
 await page.getByRole('button',{name:'播放波纹',exact:true}).click();await page.clock.runFor(400);
 await expect(page.locator('#wave-amplitude')).toHaveText('0.000');
 await page.getByRole('button',{name:'暂停波纹',exact:true}).click();
 const frozen=await page.locator('#wave-motion').innerText();await page.clock.runFor(1000);await expect(page.locator('#wave-motion')).toHaveText(frozen);
 await page.getByRole('button',{name:'单步 +0.05 s'}).click();await expect(page.locator('#wave-motion')).not.toHaveText(frozen);
 await range(page,'wavelength',5);await expect(page.locator('#wave-task-note')).toContainText('固定条件改变');
 await page.getByRole('button',{name:'不够，还要看整个周期'}).click();await expect(page.locator('#wave-transfer-note')).toContainText('振幅与合成实线');
 await page.getByRole('button',{name:'播放波纹',exact:true}).click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.getByRole('button',{name:'播放波纹',exact:true})).toHaveAttribute('aria-pressed','false');expect(errors).toEqual([]);
});

test('probe keyboard/pointer, one-source mode and two-record restore/export',async({page})=>{
 await page.goto('/labs/interference/');
 await page.getByRole('button',{name:/探针 x/}).focus();await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('button',{name:/探针 x 0.2/})).toBeFocused();
 await expect(page.locator('#wave-path-difference')).toHaveText('-0.400 cm');
 await page.evaluate(()=>document.fonts.ready);await page.locator('#wave-map').scrollIntoViewIfNeeded();
 const target=await page.locator('#wave-map').evaluate(svg=>{const m=(svg as SVGSVGElement).getScreenCTM()!;const p=new DOMPoint(360,120).matrixTransform(m);return {x:p.x,y:p.y};});
 await page.mouse.click(target.x,target.y);
 await expect(page.getByRole('button',{name:/探针 x 0.0，y 4.0/})).toBeVisible();
 await page.getByRole('button',{name:'记下这组波纹'}).click();
 await range(page,'phase',180);await page.getByRole('button',{name:'记下这组波纹'}).click();
 await expect(page.locator('#wave-record-comparison')).toContainText('相位 0→180');
 await page.getByRole('button',{name:'恢复 A',exact:true}).click();
 await expect(page.locator('#wave-phase')).toHaveValue('0');await expect(page.locator('#wave-amplitude')).toHaveText('2.000');
 await expect(page.getByRole('button',{name:'播放波纹',exact:true})).toHaveAttribute('aria-pressed','false');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'导出 CSV'}).click();
 const download=await downloadPromise;expect(download.suggestedFilename()).toBe('wave-interference-observations.csv');
 const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));
 const csv=Buffer.concat(chunks).toString('utf8');expect(csv).toContain('wavelength_cm');expect(csv).toContain('equal-amplitude-v1,both,4,6,180,0,4');
 await page.getByLabel('哪些波源在工作？').selectOption('one');await expect(page.locator('#wave-amplitude')).toHaveText('1.000');
 await page.getByRole('button',{name:'记下这组波纹'}).click();await expect(page.locator('#wave-record-note')).toContainText('替换最早');
 await page.reload();await expect(page.getByRole('button',{name:'导出 CSV'})).toBeDisabled();
});

for(const width of [320,390])test(`wave lab at ${width}px is paused, touch-operable and visible with phase control`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto('/labs/interference/');await page.getByRole('button',{name:'准备静点任务'}).tap();
 await expect(page.locator('#wave-field')).toBeInViewport({ratio:1});await expect(page.locator('#wave-phase')).toBeInViewport({ratio:1});
 await range(page,'phase',180);await expect(page.locator('#wave-amplitude')).toHaveText('0.000');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`test-results/discovery/interference-${width}.png`,fullPage:true});await context.close();
});

test('canvas failure retains evidence and no-script explanation remains accessible',async({browser})=>{
 const context=await browser.newContext();await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,...args:Parameters<typeof get>){return args[0]==='2d'?null:get.apply(this,args);} as typeof get;});
 const page=await context.newPage();await page.goto('/labs/interference/');await expect(page.locator('#wave-render-note')).toContainText('暂不可显示');
 await range(page,'phase',180);await expect(page.locator('#wave-amplitude')).toHaveText('0.000');await context.close();
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});const other=await noJS.newPage();await other.goto('/labs/interference/');
 await expect(other.locator('.wave-noscript')).toContainText('等距点处');expect(await other.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await noJS.close();
});

test('new experiment is discoverable from physical catalog',async({page})=>{
 await page.goto('/spaces/physics/');await page.locator('.experiment-card[href="/labs/interference/"]').click();
 await expect(page.getByRole('heading',{level:1})).toContainText('安静');await page.screenshot({path:'test-results/discovery/interference-desktop.png',fullPage:true});
});
