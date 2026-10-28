import {test,expect} from '@playwright/test';
import {experiments} from '../../src/data/labs';
import {studios} from '../../src/data/discovery-studios';
import {curation} from '../../src/data/curation';
const legacyControls:Record<string,string>={buoyancy:'#immersion',pendulum:'#length',lens:'#screen-distance',interference:'#wave-phase',circuits:'#circuit-emf',resistors:'#divider-upper',capacitors:'#rc-resistance',area:'#leg-a',sections:'#offset',mobius:'#paper-progress',reflection:'#geo-position','circle-angles':'#geo-position','triangle-rigidity':'#geo-position','ellipse-string':'#geo-position',moon:'#moon-node',orbit:'#speed','three-body':'#perturbation',bridge:'#load',balance:'#balance-load-y',gears:'#output-teeth'};
for(const experiment of experiments)test(`${experiment.slug}: mobile guidance and durable conditions roundtrip`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:320,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(experiment.href);
 const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');
 const start=page.getByRole('link',{name:'开始动手 ↓',exact:true});
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
  await expect(start).toBeVisible();const box=(await start.boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(844);
  await start.click();
  expect(await page.evaluate(selector=>{const target=document.querySelector(selector);return !!target&&(target===document.activeElement||target.contains(document.activeElement));},curation[experiment.slug]!.target)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 await expect(panel.getByRole('heading',{name:'把这次发现，留给下次的自己'})).toBeVisible();
 // Read computed colors, including inherited dark experiment backgrounds.
 const contrast=await panel.locator('h2').evaluate(heading=>{
  const rgb=(s:string)=>s.match(/[\d.]+/g)!.map(Number),lum=(a:number[])=>a.slice(0,3).map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i]!,0);
  let parent:Element|null=heading,bg=[255,255,255];while(parent){const color=rgb(getComputedStyle(parent).backgroundColor);if((color[3]??1)===1){bg=color;break;}parent=parent.parentElement;}
  const a=lum(rgb(getComputedStyle(heading).color)),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });expect(contrast).toBeGreaterThanOrEqual(4.5);
 const studio=studios.find(s=>s.slug===experiment.slug),selector=legacyControls[experiment.slug]??`#dis-input-${studio!.compare}`;
 const control=page.locator(selector);await control.evaluate(el=>{let p=el.parentElement;while(p){if(p instanceof HTMLDetailsElement)p.open=true;p=p.parentElement;}});const initial=await control.inputValue();
 await page.getByLabel('我的解释与证据（可选）').fill('A：先保持其他条件');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await expect(panel.locator('.discovery-records article')).toHaveCount(1);
 const isSelect=await control.evaluate(el=>el instanceof HTMLSelectElement);
 const changed=await control.evaluate(el=>{if(el instanceof HTMLSelectElement)return [...el.options].find(o=>o.value!==el.value)!.value;const input=el as HTMLInputElement;return input.value===input.max?input.min:input.max;});
 if(isSelect)await control.selectOption(changed);else{await control.fill(changed);await control.dispatchEvent('input');}const second=await control.inputValue();expect(second).not.toBe(initial);
 await page.getByLabel('我的解释与证据（可选）').fill('B：改变一个条件后观察');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await expect(panel.locator('.discovery-records article')).toHaveCount(2);
 await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(2);
 for(const [letter,expected,words] of [['A',initial,'A：先保持其他条件'],['B',second,'B：改变一个条件后观察']]){
  await page.getByRole('button',{name:`恢复发现 ${letter}`,exact:true}).click();await expect(control).toHaveValue(expected!);await expect(page.getByLabel('我的解释与证据（可选）')).toHaveValue(words!);await expect(panel.locator('[role=status]')).toContainText('不恢复独立任务资格');
 }
 // A valid-looking envelope with an unknown condition must never reach a model.
 await page.evaluate(slug=>{const key=`science-teach:discoveries:${slug}:v1`,data=JSON.parse(localStorage.getItem(key)!);data.records[0].conditions.unexpected=42;localStorage.setItem(key,JSON.stringify(data));},experiment.slug);
 await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('[role=status]')).toContainText('不兼容');await expect(panel.locator('.discovery-records article')).toHaveCount(0);
 await page.getByRole('button',{name:'清除本机发现',exact:true}).click();await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(0);expect(errors).toEqual([]);
});

test('circuit topology restores and clears independent challenge credit',async({page})=>{
 await page.goto('/labs/circuits/');const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');
 await page.getByText('需要灵感？看三种接法',{exact:true}).click();await page.getByRole('button',{name:'示例：两灯并联',exact:true}).click();
 await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 const before=await page.locator('#circuit-wire-list').textContent();await page.locator('#circuit-prepare').click();await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();
 await expect(page.locator('#circuit-wire-list')).toHaveText(before!);await expect(page.locator('#circuit-challenge-note')).toContainText('不计');
});
test('puzzle construction survives a desktop-to-phone reload',async({page})=>{
 await page.setViewportSize({width:1200,height:900});await page.goto('/labs/area/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#next-piece').click();await page.locator('#next-piece').click();
 await expect(page.locator('#area-progress')).toHaveText('2 / 4');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#area-progress')).toHaveText('2 / 4');
 const inside=await page.locator('#triangle-0').evaluate(el=>{const m=(el as unknown as SVGGraphicsElement).transform.baseVal.consolidate()!.matrix;return m.f>=450;});expect(inside).toBe(true);
});
test('partial paper cut and idler topology are recoverable paused constructions',async({page})=>{
 await page.goto('/labs/mobius/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#paper-cut-progress').fill('55');await page.locator('#paper-cut-progress').dispatchEvent('input');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#paper-cut-progress')).toHaveValue('55');await expect(page.locator('#paper-cut-stage-note')).toContainText('剩余部分');
 await page.goto('/labs/gears/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#idler').click();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#idler')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#idler-field')).toBeVisible();
});
test('shared workbench preserves legal non-step dragged conditions',async({page})=>{
 await page.goto('/labs/belt-drive/');const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 await page.evaluate(()=>{const key='science-teach:discoveries:belt-drive:v1',data=JSON.parse(localStorage.getItem(key)!);data.records[0].conditions.ratio=1.234567;localStorage.setItem(key,JSON.stringify(data));});
 await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(1);await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
 const ratio=await page.evaluate(()=>JSON.parse(localStorage.getItem('science-teach:discoveries:belt-drive:v1')!).records[1].conditions.ratio);expect(ratio).toBe(1.234567);
});

test('RC restores a charged hold state and does not invent past curve history',async({page})=>{
 await page.goto('/labs/capacitors/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#rc-step-second').click();await page.locator('[data-rc-mode="hold"]').click();
 const voltage=await page.locator('#rc-voltage').textContent();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();
 await expect(page.locator('#rc-voltage')).toHaveText(voltage!);await expect(page.locator('#rc-clock')).toHaveText('已暂停 · t = 1.00 s');await expect(page.locator('#rc-current')).toHaveText('0.000 mA');await expect(page.locator('#rc-trace-note')).toContainText('不补造历史');await expect(page.locator('#rc-task-note')).toContainText('不计');
});
