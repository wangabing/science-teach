import {test,expect,type Page} from '@playwright/test';
test.use({hasTouch:true});
async function range(page:Page,id:string,n:number){await page.locator(`#${id}`).fill(String(n));await page.locator(`#${id}`).dispatchEvent('input');}

test('pendulum shows actual endpoints and retains conditions across edits',async({page})=>{
 await page.clock.install();await page.goto('/stem-lab/pendulum/');
 await expect(page.getByRole('button',{name:'保留这组周期'})).toBeDisabled();
 await page.getByRole('button',{name:'释放摆球'}).click();await page.clock.runFor(5000);
 await expect(page.locator('#period-endpoints')).toContainText('t₂=');
 await page.getByRole('button',{name:'暂停',exact:true}).click();
 await page.getByRole('button',{name:'保留这组周期'}).click();
 await range(page,'mass',2);await expect(page.locator('#period-endpoints')).not.toContainText('t₂=');
 await expect(page.locator('#period-records')).toContainText('m=1 kg');
 await page.getByRole('button',{name:'释放摆球'}).click();await page.clock.runFor(5000);
 await page.getByRole('button',{name:'保留这组周期'}).click();
 await expect(page.locator('#period-comparison')).toContainText('质量 1→2 kg');
 await expect(page.locator('#period-comparison')).toContainText('只改变一个量');
 await page.reload();await expect(page.locator('#period-records')).toBeEmpty();
});

test('section selection links both views, works by keyboard, and clears on plane edit',async({page})=>{
 await page.goto('/labs/sections/');await range(page,'azimuth',63);await range(page,'tilt',50);await range(page,'offset',.4);
 await expect(page.getByRole('button',{name:/^顶点 /})).toHaveCount(5);
 await page.getByRole('button',{name:'顶点 1',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('#section-source')).toContainText('顶点 1 ← 原棱');
 await expect(page.locator('#cube-view circle[r="10"]')).toHaveCount(1);
 await expect(page.locator('#flat-view circle[r="10"]')).toHaveCount(1);
 await expect(page.getByRole('button',{name:'顶点 1',exact:true})).toBeFocused();
 await range(page,'offset',.5);await expect(page.locator('#section-source')).toContainText('先选一个顶点');
});

test('moon distinguishes manual node evidence from examples and invalidates fixed edits',async({page})=>{
 await page.goto('/labs/moon/');await page.getByRole('button',{name:'准备独立交点任务'}).click();
 await expect(page.locator('#moon-lunar-status')).toHaveText('没有月食');
 await range(page,'moon-node',0);await expect(page.locator('#moon-first-feedback')).toContainText('通过');
 await page.getByRole('button',{name:'月全食',exact:true}).click();
 await page.getByRole('button',{name:'检验我的对齐'}).click();await expect(page.locator('#moon-challenge-note')).toContainText('不计独立观察');
 await page.getByRole('button',{name:'准备独立交点任务'}).click();await range(page,'moon-inclination',0);
 await range(page,'moon-inclination',5.145);await range(page,'moon-node',0);
 await expect(page.locator('#moon-first-feedback')).toContainText('重新准备');
});

test('lens saves from first success and guides a second independent focus',async({page})=>{
 await page.goto('/labs/lens/');await page.getByRole('button',{name:'开始第一次调焦'}).click();await range(page,'screen-distance',15);
 await page.getByRole('button',{name:'记下这次调焦'}).click();await expect(page.locator('#lens-records tr')).toHaveCount(1);
 await page.getByRole('button',{name:'改物距，再调焦'}).click();await expect(page.locator('#object-distance')).toBeFocused();
 await range(page,'object-distance',15);await range(page,'screen-distance',30);
 await page.getByRole('button',{name:'记下这一刻',exact:true}).click();await expect(page.locator('#lens-records tr')).toHaveCount(2);
 await range(page,'object-distance',6);await expect(page.getByRole('link',{name:/去眼睛观察窗/})).toBeVisible();
});

for(const width of [320,390])test(`first tasks at ${width}px with reduced motion`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 for(const path of ['/stem-lab/buoyancy/','/stem-lab/pendulum/','/labs/sections/','/labs/moon/','/labs/lens/']){
  await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path).toBe(true);
 }
 await page.goto('/labs/sections/');await page.getByRole('button',{name:'顶点 1',exact:true}).tap();
 await expect(page.locator('#section-source')).toContainText('顶点 1 ← 原棱');
 const source=(await page.locator('#section-source').innerText()).match(/原棱 (\d+)/);if(!source)throw new Error('Missing edge source');
 await range(page,'offset',0);await expect(page.locator('#section-source')).toContainText('先选一个顶点');
 await page.locator('#cube-view').scrollIntoViewIfNeeded();
 // Recompute after scrolling before a real touch hit.
 const hit=await page.locator(`#cube-view [data-section-edge="${Number(source[1])-1}"]`).first().evaluate(node=>{const l=node as SVGLineElement;const q=new DOMPoint(l.x1.baseVal.value*.75+l.x2.baseVal.value*.25,l.y1.baseVal.value*.75+l.y2.baseVal.value*.25).matrixTransform(l.getScreenCTM()!);return {x:q.x,y:q.y};});
 await page.touchscreen.tap(hit.x,hit.y);await expect(page.locator('#section-source')).toContainText('加粗原棱');
 await page.goto('/stem-lab/buoyancy/');await range(page,'immersion',10);
 await expect(page.locator('#displaced-link')).toContainText('1000 cm³');
 await expect(page.locator('#buoyancy-task-note')).toContainText('手动');
 await page.getByRole('button',{name:'播放入水过程'}).click();await expect(page.locator('#buoyancy-task-note')).toContainText('示例');
});
