import {test,expect,type Page} from '@playwright/test';
async function range(page:Page,id:string,n:number){await page.locator(`#${id}`).fill(String(n));await page.locator(`#${id}`).dispatchEvent('input');}
async function noGL(page:Page){await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(kind:string,...args:unknown[]){return /webgl/.test(kind)?null:Reflect.apply(original,this,[kind,...args]);}});});}

test('height comparison fixes all other conditions, including 2D keyboard movement',async({page})=>{
 await noGL(page);await page.goto('/labs/balance/');await page.locator('[data-balance-preset="high"]').click();
 await page.getByRole('button',{name:'留作 A，只改高度',exact:true}).click();
 for(const id of ['balance-tilt','balance-width','balance-mass','balance-load-x'])await expect(page.locator(`#${id}`)).toBeDisabled();
 await range(page,'balance-b-height',.15);await expect(page.locator('#balance-load-y')).toHaveValue('0.15');
 await expect(page.locator('#balance-fixed-conditions')).toContainText('25.0°');await expect(page.locator('#balance-fixed-conditions')).toContainText('4.0 kg');
 await expect(page.locator('#balance-pair article')).toHaveCount(2);await expect(page.locator('#balance-pair article').last()).toContainText('45.00°');
 await page.locator('#balance-load').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#balance-load-x')).toHaveValue('0');
 await page.keyboard.press('ArrowUp');await expect(page.locator('#balance-load-y')).toHaveValue('0.16');
 await page.getByRole('button',{name:'结束对照',exact:true}).click();await expect(page.locator('#balance-tilt')).toBeEnabled();await expect(page.locator('#balance-compare-panel')).toBeHidden();
 await page.getByRole('button',{name:'留作 A，只改高度',exact:true}).click();await page.locator('[data-balance-preset="wide"]').click();await expect(page.locator('#balance-compare-note')).toContainText('已结束');await expect(page.locator('#balance-width')).toBeEnabled();
});

test('challenge transfer requires prediction, doubles both masses, and expires after an edit',async({page})=>{
 await page.goto('/labs/balance/');await expect(page.locator('#balance-transfer')).toBeHidden();
 await page.getByRole('button',{name:'准备运输挑战',exact:true}).click();await range(page,'balance-load-y',.2);await page.getByRole('button',{name:'检验我的方案',exact:true}).click();
 await expect(page.locator('#balance-transfer')).toBeVisible();await page.getByRole('button',{name:'把所有质量加倍，检验',exact:true}).click();await expect(page.locator('#balance-transfer-note')).toContainText('先选');await expect(page.locator('#balance-transfer-evidence')).toBeHidden();
 await page.getByRole('button',{name:'临界角变大',exact:true}).click();await page.getByRole('button',{name:'把所有质量加倍，检验',exact:true}).click();
 await expect(page.locator('#balance-transfer-note')).toContainText('不同');await expect(page.locator('#balance-transfer-note')).toContainText('不是只加配重');
 const cards=page.locator('#balance-transfer-evidence article');await expect(cards.first()).toContainText('架 2.0 kg · 配重 4.0 kg');await expect(cards.last()).toContainText('架 4.0 kg · 配重 8.0 kg');
 const before=await cards.first().locator('dd').allTextContents(),after=await cards.last().locator('dd').allTextContents();expect(after.slice(0,3)).toEqual(before.slice(0,3));expect(Number.parseFloat(after[3]!)).toBeCloseTo(2*Number.parseFloat(before[3]!),1);
 await range(page,'balance-width',.5);await expect(page.locator('#balance-transfer')).toBeHidden();
 await page.getByRole('button',{name:'检验我的方案',exact:true}).click();await page.getByRole('button',{name:'临界角不变',exact:true}).click();await page.getByRole('button',{name:'把所有质量加倍，检验',exact:true}).click();await expect(page.locator('#balance-transfer-note')).toContainText('支持');
});

for(const n of [0,1,2])test(`paper ${n}: partial cut, completed components and both boundaries`,async({page})=>{
 await page.goto('/labs/mobius/');await page.locator(`[data-paper-twists="${n}"]`).click();await page.locator('[data-paper-predict="2"]').click();
 for(const percent of [25,50,75]){
  await range(page,'paper-cut-progress',percent);await expect(page.locator('#paper-cut-stage-note')).toContainText(`${percent}%`);await expect(page.locator('#paper-cut-result')).toContainText('还没剪完');await expect(page.locator('#paper-prediction-note')).not.toContainText('支持');await expect(page.locator('#paper-components')).toBeHidden();await expect(page.locator('#paper-progress')).toBeDisabled();
 }
 await range(page,'paper-cut-progress',100);await expect(page.locator('#paper-sides')).toHaveText('2');await expect(page.locator('#paper-boundaries')).toHaveText(n===1?'2':'4');
 if(n===1)await expect(page.locator('[data-paper-component="1"]')).toBeHidden();else await expect(page.locator('[data-paper-component="1"]')).toBeVisible();
 if(n!==1)await page.locator('[data-paper-component="1"]').click();
 await page.getByRole('button',{name:'沿新切边走',exact:true}).click();await expect(page.locator('#paper-trace-note')).toContainText('沿新切边');
 const marker=page.locator('#paper-trace-marker'),start=[await marker.getAttribute('cx'),await marker.getAttribute('cy')];
 await range(page,'paper-progress',50);if(n===1)expect([await marker.getAttribute('cx'),await marker.getAttribute('cy')]).not.toEqual(start);
 await range(page,'paper-progress',100);const finish=[await marker.getAttribute('cx'),await marker.getAttribute('cy')];for(let i=0;i<2;i++)expect(Number(finish[i])).toBeCloseTo(Number(start[i]),6);
 await expect(page.locator('#paper-circuits')).toHaveText(n===1?'2.00 圈':'1.00 圈');await expect(page.locator('#paper-trace-note')).toContainText('回到出发位置');
 await page.getByRole('button',{name:'沿纸边走',exact:true}).click();expect([await marker.getAttribute('cx'),await marker.getAttribute('cy')]).not.toEqual(start);
 await range(page,'paper-cut-progress',50);await expect(page.locator('#paper-components')).toBeHidden();await expect(page.locator('#paper-new-edge')).toBeHidden();await expect(page.locator('#paper-cut-result')).toContainText('还没剪完');
 await page.getByRole('button',{name:'恢复未剪纸带',exact:true}).click();await expect(page.locator('#paper-cut-progress')).toHaveValue('0');await expect(page.locator('#paper-progress')).toBeEnabled();
});

test('automatic cutting pauses, manual scrubbing cancels, and backgrounding waits for resume',async({page})=>{
 await noGL(page);await page.clock.install();await page.goto('/labs/mobius/');await page.getByRole('button',{name:'沿中线剪开',exact:true}).click();await page.clock.runFor(1000);
 const first=Number(await page.locator('#paper-cut-progress').inputValue());expect(first).toBeGreaterThan(0);expect(first).toBeLessThan(100);
 await page.getByRole('button',{name:'暂停剪切',exact:true}).click();const frozen=await page.locator('#paper-cut-progress').inputValue();await page.clock.runFor(1500);await expect(page.locator('#paper-cut-progress')).toHaveValue(frozen);
 await page.getByRole('button',{name:'继续剪切',exact:true}).click();await page.clock.runFor(1000);expect(Number(await page.locator('#paper-cut-progress').inputValue())).toBeGreaterThan(first);
 await range(page,'paper-cut-progress',50);await page.clock.runFor(10000);await expect(page.locator('#paper-cut-progress')).toHaveValue('50');
 await page.getByRole('button',{name:'继续自动剪切',exact:true}).click();await page.clock.runFor(500);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const paused=await page.locator('#paper-cut-progress').inputValue();await page.clock.runFor(10000);await expect(page.locator('#paper-cut-progress')).toHaveValue(paused);await expect(page.locator('#paper-cut-pause')).toHaveText('继续剪切');
 await page.getByRole('button',{name:'重新探索',exact:true}).click();await page.clock.runFor(10000);await expect(page.locator('#paper-cut-progress')).toHaveValue('0');
});

for(const width of [320,390])test(`mobile ${width}: comparison and deliberate reduced-motion cutting`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.clock.install();
 await page.goto('/labs/balance/');await page.locator('[data-balance-preset="high"]').click();await page.getByRole('button',{name:'留作 A，只改高度',exact:true}).click();await range(page,'balance-b-height',.15);
 await page.locator('#balance-b-height').evaluate(n=>n.closest('label')!.scrollIntoView({block:'start'}));await expect(page.locator('#balance-pair svg').first()).toBeInViewport({ratio:1});await expect(page.locator('#balance-pair svg').last()).toBeInViewport({ratio:1});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:`test-results/polish/balance-${width}.png`});
 await page.goto('/labs/mobius/');await page.getByRole('button',{name:'沿中线剪开',exact:true}).click();await page.clock.runFor(1000);await expect(page.locator('#paper-cut-progress')).toHaveValue('0');
 await range(page,'paper-cut-progress',50);await page.locator('#paper-cut-progress').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/polish/paper-partial-${width}.png`});
 await range(page,'paper-cut-progress',100);await page.getByRole('button',{name:'沿新切边走',exact:true}).click();await range(page,'paper-progress',50);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#paper-spatial').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/polish/paper-trace-${width}.png`});
});
