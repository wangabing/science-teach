import {test,expect,type Page} from '@playwright/test';
const open=async(page:Page)=>{await page.goto('/labs/tidal-roche/');await expect(page.locator('[data-discovery]'),`初始化失败：${await page.locator('[data-discovery]').getAttribute('data-load-error')??''}`).toHaveAttribute('data-ready','true');};
const distance=(page:Page)=>page.getByRole('slider',{name:'装置旁直接调整中心距离',exact:true});
const values=async(page:Page)=>JSON.parse((await page.locator('#dis-three').getAttribute('data-measurements'))!);
const measurement=async(page:Page,key:string)=>(await values(page)).find((m:{key:string})=>m.key===key).value;
async function dragBody(page:Page,touch=false){
 const bodyCanvas=page.getByLabel('三维潮汐实验：拖动青色小天体改变距离；空白处拖动或方向键旋转；下方距离滑块可用键盘操作',{exact:true});
 const handles=JSON.parse((await page.locator('#dis-three').getAttribute('data-handles'))!);
 const handle=handles.find((h:{key:string})=>h.key==='distance');
 await bodyCanvas.scrollIntoViewIfNeeded();const box=(await bodyCanvas.boundingBox())!;
 const x=box.x+box.width*handle.x+(touch?15:0),y=box.y+box.height*handle.y;
 if(touch){
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=10;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*4,y}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
 }else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-70,y,{steps:12});await page.mouse.up();}
}
test('complete tidal approach, double-view manipulation and evidence task',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:1050});await open(page);
 await page.getByRole('link',{name:'演示入口 ↓',exact:true}).click();
 const demo=page.getByRole('button',{name:'演示：逐渐靠近',exact:true});await expect(demo).toBeInViewport();
 await page.getByRole('button',{name:'打开三维视图',exact:true}).click();await expect(page.locator('#dis-three canvas')).toBeVisible();
 const initialHash=await page.locator('#dis-three').getAttribute('data-geometry-hash');
 await demo.click();await expect(page.getByRole('button',{name:'暂停演示',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect.poll(async()=>Number(await distance(page).inputValue())).toBeLessThan(1500);
 await page.getByRole('button',{name:'暂停演示',exact:true}).click();const stopped=await distance(page).inputValue();
 await expect(demo).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#dis-three')).not.toHaveAttribute('data-geometry-hash',initialHash!);
 await expect(page.locator('#dis-demo-state')).toContainText('演示不计独立任务');
 await expect(page.locator('#dis-task-note')).not.toHaveAttribute('data-complete','true');
 await page.clock.install();await page.clock.runFor(1500);await expect(distance(page)).toHaveValue(stopped);
 await page.getByRole('button',{name:'靠近一步',exact:true}).click();expect(Number(await distance(page).inputValue())).toBe(Number(stopped)-100);
 const beforeDrag=await distance(page).inputValue();await dragBody(page);await expect(distance(page)).not.toHaveValue(beforeDrag);
 await page.getByRole('button',{name:'撤销',exact:true}).click();await expect(distance(page)).toHaveValue(beforeDrag);
 const same=await distance(page).inputValue();
 const c=page.locator('#dis-three canvas');await c.focus();await page.keyboard.press('ArrowRight');await expect(distance(page)).toHaveValue(same);
 await page.locator('#dis-stage').screenshot({path:info.outputPath('tidal-3d.png')});
 await page.getByRole('button',{name:'回到二维证据',exact:true}).click();await expect(distance(page)).toHaveValue(same);
 const handle=page.locator('#dis-drawing [data-tidal-handle]');const box=(await handle.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+45,box.y+box.height/2,{steps:8});await page.mouse.up();await expect(distance(page)).not.toHaveValue(same);
 await page.getByRole('button',{name:'准备独立探索',exact:true}).click();
 await page.getByRole('button',{name:'打开三维视图',exact:true}).click();
 const primary=page.getByRole('slider',{name:/^中心距离/});
 await primary.evaluate(e=>{const input=e as HTMLInputElement;input.value='1500';input.dispatchEvent(new Event('input',{bubbles:true}));});const far=await measurement(page,'tidal'),self=await measurement(page,'self');
 await page.getByRole('button',{name:'记下这一组',exact:true}).click();await page.getByRole('button',{name:'核验这次观察',exact:true}).click();
 await primary.evaluate(e=>{const input=e as HTMLInputElement;input.value='750';input.dispatchEvent(new Event('input',{bubbles:true}));});expect((await measurement(page,'tidal'))/far).toBeCloseTo(8,9);expect(await measurement(page,'self')).toBeCloseTo(self,12);
 await page.getByRole('button',{name:'记下这一组',exact:true}).click();await page.getByRole('button',{name:'核验这次观察',exact:true}).click();
 await expect(page.locator('#dis-task-note')).toHaveAttribute('data-complete','true');await expect(page.locator('#dis-record-gallery article')).toHaveCount(2);
 await expect(page.locator('#dis-charts [data-current-cursor]')).toHaveCount(1);
 await c.evaluate(el=>el.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(page.locator('#dis-svg')).toBeVisible();
 await distance(page).press('Home');await expect(distance(page)).toHaveValue('100');expect(errors).toEqual([]);
});
for(const width of [320,390])test(`tidal touch, keyboard and reduced motion at ${width}px`,async({browser},info)=>{
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  await open(page);await page.getByRole('button',{name:'演示：逐渐靠近',exact:true}).tap();
  await expect(page.locator('#dis-demo-state')).toContainText('减少动态');
  const initial=Number(await distance(page).inputValue());await page.getByRole('button',{name:'靠近一步',exact:true}).tap();await expect(distance(page)).toHaveValue(String(initial-100));
  await distance(page).focus();await page.keyboard.press('ArrowRight');await expect(distance(page)).toHaveValue(String(initial-90));
  await page.getByRole('button',{name:'打开三维视图',exact:true}).tap();await expect(page.locator('#dis-three canvas')).toBeVisible();
  const before=await distance(page).inputValue();await dragBody(page,true);await expect(distance(page)).not.toHaveValue(before);
  const overlay=(await page.locator('.dis-spatial-readings').boundingBox())!,stage=(await page.locator('#dis-stage').boundingBox())!;expect(overlay.height).toBeLessThan(stage.height*.3);
  await page.locator('#dis-stage').screenshot({path:info.outputPath(`tidal-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }finally{await context.close();}
});
test('tidal remains operable without WebGL and explains simulation limits',async({browser})=>{
 const context=await browser.newContext(),page=await context.newPage();
 try{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){return /webgl/.test(type)?null:original.call(this,type,...args as []);} as typeof HTMLCanvasElement.prototype.getContext;});
  await open(page);await page.getByRole('button',{name:'打开三维视图',exact:true}).click();await expect(page.getByRole('button',{name:'重试三维视图',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'靠近一步',exact:true}).click();await expect(distance(page)).toHaveValue('900');
  await expect(page.locator('#dis-model-note')).toContainText('不求解真实形变');await expect(page.locator('#dis-model-note')).toContainText('不等于流体Roche极限');
 }finally{await context.close();}
});
test('the Roche marker cannot intercept dragging the body at the boundary',async({page})=>{
 await open(page);const slider=distance(page);
 await slider.evaluate(el=>{const e=el as HTMLInputElement;e.value='1320';e.dispatchEvent(new Event('input',{bubbles:true}));});
 const body=page.locator('#dis-drawing [data-tidal-handle]');await body.scrollIntoViewIfNeeded();
 const box=(await body.boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+40,y,{steps:8});await page.mouse.up();
 await expect(slider).not.toHaveValue('1320');
});
