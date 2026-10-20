import {test,expect,type Page} from '@playwright/test';
const key='science-teach:lens-notebook:v1';
async function range(page:Page,id:string,n:number){await page.locator(`#${id}`).fill(String(n));await page.locator(`#${id}`).dispatchEvent('input');}
async function tools(page:Page){await page.getByText('更多探索 · 情景、演示与视角',{exact:true}).click();}

test('first focus is optional and only manual focus completes it',async({page})=>{
 await page.clock.install();await page.goto('/labs/lens/');
 await expect(page.locator('#lens-advanced')).not.toHaveAttribute('open','');
 await page.getByRole('button',{name:'开始第一次调焦',exact:true}).click();
 await expect(page.locator('#screen-distance')).toHaveValue('8');
 await expect(page.locator('#screen-badge')).toHaveText('尚未对焦');
 await range(page,'screen-distance',15);
 await expect(page.locator('#first-focus-feedback')).toContainText('你调清晰了');
 await page.getByRole('button',{name:'开始第一次调焦',exact:true}).click();await tools(page);
 await page.getByRole('button',{name:'演示：寻找清晰像',exact:true}).click();await page.clock.runFor(16000);
 await expect(page.locator('#first-focus-feedback')).not.toContainText('你调清晰了');
});

test('saved conditions survive reload, restore stops a demo, and clearing removes storage',async({page})=>{
 await page.clock.install();await page.goto('/labs/lens/');
 await page.locator('#show-extensions').uncheck();await page.getByRole('button',{name:'记下这一刻',exact:true}).click();
 await range(page,'object-distance',15);await range(page,'screen-distance',30);await page.getByRole('button',{name:'记下这一刻',exact:true}).click();
 await expect(page.locator('#lens-record-comparison')).toContainText('15.00 → 30.00');
 await page.reload();await expect(page.locator('#record-feedback')).toContainText('已找回 2/6');
 await tools(page);await page.getByRole('button',{name:'演示：跨越焦点',exact:true}).click();await page.clock.runFor(1000);
 await page.getByRole('button',{name:'恢复第 2 组条件',exact:true}).click();await page.clock.runFor(16000);
 await expect(page.locator('#object-distance')).toHaveValue('15');await expect(page.locator('#screen-distance')).toHaveValue('30');
 await expect(page.locator('#show-extensions')).not.toBeChecked();await expect(page.locator('#screen-badge')).toHaveText('接近清晰');
 await page.getByRole('button',{name:'清空记录',exact:true}).click();expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
 await page.reload();await expect(page.locator('#lens-records')).toContainText('还没有记录');
});

test('real-image challenge explains the actual obstruction',async({page})=>{
 await page.goto('/labs/lens/');await page.locator('[data-challenge="small"]').click();
 for(const [u,message] of [[6,'虚像'],[10,'平行'],[10.1,'100 cm'],[30,'移远']] as const){await range(page,'object-distance',u);await page.getByRole('button',{name:'检验我的设计',exact:true}).click();await expect(page.locator('#challenge-feedback')).toContainText(message);}
 await range(page,'screen-distance',25);await page.getByRole('button',{name:'检验我的设计',exact:true}).click();await expect(page.locator('#challenge-feedback')).toContainText('移近');
});

for(const width of [320,390])test(`mobile ${width}: preview and controls stay visible together`,async({page})=>{
 await page.setViewportSize({width,height:667});await page.goto('/labs/lens/');await page.getByRole('button',{name:'开始第一次调焦',exact:true}).click();
 for(const id of ['object-distance','screen-distance','focal-length']){
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await expect(page.locator('#pocket-preview')).toBeInViewport({ratio:1});await expect(page.locator(`#${id}`)).toBeInViewport({ratio:1});
 }
 await range(page,'screen-distance',15);await expect(page.locator('#pocket-state')).toHaveText(await page.locator('#screen-badge').innerText());
 expect(await page.locator('#pocket-blur-value').getAttribute('stdDeviation')).toBe(await page.locator('#screen-blur-value').getAttribute('stdDeviation'));
 await range(page,'object-distance',6);await expect(page.locator('#pocket-state')).toHaveText('虚像不可投屏');
 await range(page,'object-distance',10);await expect(page.locator('#pocket-state')).toHaveText('无法对焦');
 expect(await page.locator('#pocket-projection').innerHTML()).toBe((await page.locator('#screen-projection').innerHTML()).replaceAll('screen-blur','pocket-blur'));
 await range(page,'object-distance',30);await range(page,'screen-distance',8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#screen-distance').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/lens/workbench-${width}.png`});
});

test('invalid local records and denied storage leave the experiment usable',async({page})=>{
 await page.addInitScript(k=>localStorage.setItem(k,'{"version":1,"records":[{"object":"<img>"}]}'),key);
 await page.goto('/labs/lens/');await expect(page.locator('#record-feedback')).toContainText('未能读取');
 await expect(page.locator('#lens-records')).toContainText('还没有记录');
 await page.getByRole('button',{name:'记下这一刻',exact:true}).click();await expect(page.locator('#record-feedback')).toContainText('已记录 1/6');
 const blocked=await page.context().browser()!.newContext();
 await blocked.addInitScript(()=>{for(const method of ['getItem','setItem','removeItem'])Object.defineProperty(Storage.prototype,method,{value:()=>{throw new Error('denied');}});});
 const other=await blocked.newPage();await other.goto('/labs/lens/');await other.getByRole('button',{name:'记下这一刻',exact:true}).click();
 await expect(other.locator('#record-feedback')).toContainText('仅保留在当前页面');await range(other,'screen-distance',25);await expect(other.locator('#screen-badge')).toHaveText('尚未对焦');await blocked.close();
});
