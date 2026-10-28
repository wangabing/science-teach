import {test,expect} from '@playwright/test';
import {curation} from '../../src/data/curation';
const pilots=[{slug:'lens',control:'#screen-distance'},{slug:'sections',control:'#offset'},{slug:'moon',control:'#moon-node'},{slug:'bridge',control:'#load'},{slug:'belt-drive',control:'#dis-input-ratio'},{slug:'tidal-roche',control:'#dis-input-distance'}];
test('homepage offers four starting points and directory preserves a shareable searchable catalog',async({page})=>{
 await page.goto('/');await expect(page.locator('.starting-experiment')).toHaveCount(4);await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('link',{name:'全部实验 ↗',exact:true}).click();
 const search=page.getByRole('searchbox',{name:'想探索什么？'});await search.fill('放大镜');await page.getByRole('button',{name:'查找实验',exact:true}).click();
 await expect(page.locator('[data-catalog-entry]:visible')).toHaveCount(1);await expect(page).toHaveURL(/q=/);await page.reload();await expect(search).toHaveValue('放大镜');
 await page.getByRole('combobox',{name:'探索空间',exact:true}).selectOption('cosmos');await expect(page.getByText('没有找到匹配实验。',{exact:false})).toBeVisible();
 await page.goBack();await expect(page.locator('[data-catalog-entry]:visible')).toHaveCount(1);
 await page.getByRole('button',{name:'清除筛选',exact:true}).click();await expect(page.locator('[data-catalog-entry]:visible')).toHaveCount(140);
 await page.getByRole('combobox',{name:'探索目标',exact:true}).selectOption('construct');await expect(page.locator('[data-catalog-entry]:visible')).toHaveCount(Object.values(curation).filter(g=>g.goal==='construct').length);
});
test('without scripts the complete directory remains readable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('/experiments/?q=不存在');await expect(page.locator('.experiment-card')).toHaveCount(140);await context.close();
});
for(const pilot of pilots)test(`${pilot.slug} saves two discoveries and restores actual conditions without automatic credit`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`/labs/${pilot.slug}/`);
 const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');
 const contrasts=await page.locator('.pilot-learning h2,aside.next-exploration h2').evaluateAll(headings=>headings.map(heading=>{
  const rgb=(value:string)=>value.match(/[\d.]+/g)!.map(Number);
  const luminance=(channels:number[])=>channels.slice(0,3).map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i]!,0);
  let parent:Element|null=heading,background=[255,255,255];
  while(parent){const color=rgb(getComputedStyle(parent).backgroundColor);if((color[3]??1)===1){background=color;break;}parent=parent.parentElement;}
  const a=luminance(rgb(getComputedStyle(heading).color)),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 }));
 for(const contrast of contrasts)expect(contrast).toBeGreaterThanOrEqual(4.5);
 const control=page.locator(pilot.control),initial=await control.inputValue();
 await page.getByLabel('我的预测（可选）').fill('先改变一个条件');await page.getByLabel('我的解释与证据（可选）').fill('A组的证据');
 await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 await control.fill(initial===await control.getAttribute('max')?(await control.getAttribute('min'))!:(await control.getAttribute('max'))!);await control.dispatchEvent('input');
 await page.getByLabel('我的解释与证据（可选）').fill('B组的证据');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(2);
 await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(control).toHaveValue(initial);await expect(page.getByLabel('我的解释与证据（可选）')).toHaveValue('A组的证据');
 await expect(panel.locator('[role=status]')).toContainText('不恢复独立任务资格');await panel.screenshot({path:info.outputPath(`${pilot.slug}-evidence.png`)});
 if(pilot.slug==='moon')await expect(page.locator('#moon-first-feedback')).not.toContainText('通过');
 if(pilot.slug==='belt-drive'){await page.getByRole('button',{name:'打开三维视图',exact:true}).click();await expect(page.locator('#dis-three canvas')).toBeVisible();}
 await page.getByRole('button',{name:'清除本机发现',exact:true}).click();await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(0);expect(errors).toEqual([]);
});
for(const width of [320,390])test(`first operation is reachable at ${width}px and reduced motion`,async({page},info)=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 for(const pilot of pilots){await page.goto(`/labs/${pilot.slug}/`);await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');
 await page.screenshot({path:info.outputPath(`${pilot.slug}-first-${width}.png`)});const start=page.getByRole('link',{name:'开始动手 ↓',exact:true});const box=(await start.boundingBox())!;expect(box.y+box.height).toBeLessThan(844);
 await start.click();expect(await page.evaluate(()=>document.activeElement?.tagName)).toMatch(/BUTTON|INPUT/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});
test('malformed and denied local storage fail safely',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('science-teach:discoveries:lens:v1','{"schemaVersion":9}'));
 await page.goto('/labs/lens/');const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('[role=status]')).toContainText('不兼容');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('denied');};Storage.prototype.removeItem=()=>{throw new Error('denied');};});
 await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await expect(panel.locator('[role=status]')).toContainText('仅保留在当前页面');await expect(panel.locator('.discovery-records article')).toHaveCount(1);
});
test('shared workbench carries a route to a real next question',async({page})=>{
 await page.goto('/labs/young-double-slit/?trail=waves-to-matter');
 await expect(page.getByRole('link',{name:'继续探索：单缝衍射 ↗'})).toHaveAttribute('href',/single-slit-diffraction\/\?trail=waves-to-matter/);
});

test('WebGL failure leaves native 2D evidence and parameter edits usable',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:unknown[]){if(kind.startsWith('webgl'))return null;return Reflect.apply(original,this,[kind,...args]);} as typeof original;});
 await page.goto('/labs/tidal-roche/');await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'打开三维视图',exact:true}).click();await expect(page.locator('#dis-view-note')).toContainText('三维不可用');
 await expect(page.locator('#dis-svg')).toBeVisible();const old=await page.locator('#dis-direct-value').textContent();await page.locator('#dis-direct-input').press('End');await expect(page.locator('#dis-direct-value')).not.toHaveText(old!);
});
