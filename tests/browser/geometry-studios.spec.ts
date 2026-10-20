import {test as base,expect,type Page} from '@playwright/test';
const test=base.extend<{checkedPage:Page}>({checkedPage:async({page},use)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await use(page);expect(errors).toEqual([]);
}});
const button=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
async function range(page:Page,name:RegExp,value:string){const control=page.getByRole('slider',{name});await control.fill(value);await control.dispatchEvent('input');}
const note=(page:Page)=>page.locator('#geo-task-note');
async function downloadCSV(page:Page){const pending=page.waitForEvent('download');await button(page,'导出 CSV').click();const stream=await(await pending).createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks).toString('utf8');}

test('reflection independent keyboard search, reference credit and undo/redo',async({checkedPage:page})=>{
 await page.goto('/labs/reflection/');await button(page,'准备独立探索').click();
 const handle=page.getByRole('slider',{name:'移动点P，左右键改变位置',exact:true});await handle.focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#geo-position-value')).toHaveText('-2.90 u');
 await range(page,/^P在直线上的横坐标/,'-1');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立寻找已完成');await expect(page.locator('#geo-reading-2')).toHaveText('11.314 u');
 await button(page,'撤销').click();await expect(note(page)).toContainText('任务与历史笔迹未恢复');await expect(page.locator('#geo-position-value')).toHaveText('-2.90 u');
 await button(page,'重做').click();await expect(page.locator('#geo-position-value')).toHaveText('-1.00 u');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('先准备');
 await page.getByText('需要时，看参考状态',{exact:true}).click();await button(page,'应用参考状态').click();await expect(note(page)).toContainText('不计为独立完成');
 await page.getByText('展开一般论证',{exact:true}).click();await expect(page.getByText(/由三角不等式，PA/)).toBeVisible();
});

test('reflection segment changes optimum; snapshots compare, export and restore recomputed values',async({checkedPage:page})=>{
 await page.goto('/labs/reflection/');await range(page,/^P在直线上的横坐标/,'-1');await button(page,'记下这一组').click();
 await button(page,'试试：把P限制在线段内').click();await expect(page.locator('#geo-position-value')).toHaveText('-2.00 u');await expect(page.locator('#geo-state-note')).toContainText('交点在允许线段外');
 await page.getByRole('button',{name:'不能，要检查允许范围',exact:true}).click();await expect(page.locator('#geo-position-value')).toHaveText('-2.00 u');
 await button(page,'记下这一组').click();await expect(page.locator('#study-comparison')).toContainText('多个条件改变');
 const data=await downloadCSV(page);expect(data).toContain('analytic-geometry-v1');expect(data).toContain('optimal_x_u');expect(data.trim().split('\r\n')).toHaveLength(3);
 await button(page,'恢复 A').click();await expect(page.locator('#geo-reading-2')).toHaveText('11.314 u');await expect(page.getByRole('button',{name:'限制P在线段[−5,−2]',exact:true})).toHaveAttribute('aria-pressed','false');await expect(note(page)).toContainText('未恢复');
 await button(page,'记下这一组').click();await expect(page.locator('#study-records article')).toHaveCount(2);await page.reload();await expect(page.locator('#study-records')).toBeEmpty();await expect(button(page,'导出 CSV')).toBeDisabled();
});

test('circle requires two manual positions, rejects endpoints and distinguishes opposite arcs',async({checkedPage:page})=>{
 await page.goto('/labs/circle-angles/');await button(page,'准备独立探索').click();await button(page,'核验这次观察').click();await expect(note(page)).toContainText('还没有新的手动位置');
 await range(page,/^P沿圆周的位置/,'270');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('第一位置');
 await range(page,/^P沿圆周的位置/,'315');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await expect(page.locator('#geo-reading-0')).toHaveText('60.00 °');
 await button(page,'试试：把P移到另一侧弧').click();await expect(page.locator('#geo-reading-0')).toHaveText('120.00 °');await expect(page.locator('#geo-reading-1')).toHaveText('240.0 °');
 await range(page,/^P沿圆周的位置/,'120');await expect(page.locator('#geo-reading-0')).toHaveText('未定义');await expect(page.locator('#geo-state-note')).toContainText('一条角边长度为零');
 await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^较小中心角/,'180');await range(page,/^P沿圆周的位置/,'270');await expect(page.locator('#geo-reading-0')).toHaveText('90.00 °');
});

test('triangle locking preserves current third side, disables free hinge and mirror keeps lengths',async({checkedPage:page})=>{
 await page.goto('/labs/triangle-rigidity/');await button(page,'准备独立探索').click();await range(page,/^两杆的铰链角/,'80');
 const third=await page.locator('#geo-reading-0').innerText(),area=await page.locator('#geo-reading-2').innerText();
 await button(page,'锁定当前第三边').click();await expect(page.getByRole('slider',{name:/^两杆的铰链角/})).toBeDisabled();await expect(page.locator('#geo-reading-0')).toHaveText(third);
 await page.getByRole('button',{name:'翻到基线下侧',exact:true}).click();await expect(page.locator('#geo-reading-0')).toHaveText(third);await expect(page.locator('#geo-reading-2')).toHaveText(area);
 await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await button(page,'记下这一组').click();
 await button(page,'解锁第三边').click();await expect(note(page)).not.toContainText('独立观察已完成');await expect(page.getByRole('slider',{name:/^两杆的铰链角/})).toBeEnabled();await button(page,'恢复 A').click();await expect(note(page)).toContainText('未恢复');
});

test('triangle impossible and degenerate states recover without NaN or fake task credit',async({checkedPage:page})=>{
 await page.goto('/labs/triangle-rigidity/');await button(page,'试试：把杆长改为1、2、3').click();await expect(page.locator('#geo-reading-3')).toHaveText('退化共线');await expect(page.locator('#geo-reading-2')).toHaveText('0.000 u²');
 await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^锁定的第三边 BC/,'4');await expect(page.locator('#geo-reading-3')).toHaveText('不能构成');await expect(page.locator('#geo-handle')).toBeHidden();
 const data=await (async()=>{await button(page,'记下这一组').click();return downloadCSV(page);})();expect(data).toContain('impossible');
 await range(page,/^锁定的第三边 BC/,'2');await expect(page.locator('#geo-reading-3')).toHaveText('三边锁定');await expect(page.locator('#geo-handle')).toBeVisible();
});

test('ellipse observes constant sum, distinguishes actual trace, restores without forged history and handles invalid shapes',async({checkedPage:page})=>{
 await page.goto('/labs/ellipse-string/');await button(page,'准备独立探索').click();await range(page,/^沿椭圆的位置参数/,'90');await button(page,'核验这次观察').click();
 await range(page,/^沿椭圆的位置参数/,'180');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await expect(page.locator('#geo-reading-2')).toHaveText('10.000 u');await expect(page.locator('.geo-pencil')).toHaveCount(2);
 await button(page,'记下这一组').click();await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^半焦距/,'0');await expect(page.locator('#geo-reading-3')).toHaveText('0.000');await expect(page.locator('.geo-pencil')).toHaveCount(0);
 await button(page,'恢复 A').click();await expect(page.locator('#geo-reading-2')).toHaveText('10.000 u');await expect(page.locator('.geo-pencil')).toHaveCount(0);await expect(note(page)).toContainText('未恢复');
 await button(page,'试试：让焦点间距等于绳长').click();await expect(page.locator('#geo-state-note')).toContainText('a=c');await expect(page.getByRole('slider',{name:/^沿椭圆的位置参数/})).toBeDisabled();
 await range(page,/^半焦距/,'4');await expect(page.locator('#geo-state-note')).toContainText('a<c');await range(page,/^有效绳长的一半/,'5');await expect(page.getByRole('slider',{name:/^沿椭圆的位置参数/})).toBeEnabled();
});

test('real pointer drag stays on constrained baseline and produces one undo transaction',async({checkedPage:page})=>{
 await page.goto('/labs/reflection/');const handle=page.getByRole('slider',{name:'移动点P，左右键改变位置',exact:true});await handle.scrollIntoViewIfNeeded();
 const box=await handle.boundingBox(),board=await page.locator('#geo-svg').boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();
 await page.mouse.move(board!.x+board!.width*(400-38)/800,board!.y+board!.height*.2,{steps:10});await page.mouse.up();
 await expect(page.locator('#geo-position-value')).toHaveText('-1.00 u');await expect(page.locator('#geo-handle')).toHaveAttribute('transform','translate(362 280)');
 await button(page,'撤销').click();await expect(page.locator('#geo-position-value')).toHaveText('-3.00 u');await expect(button(page,'撤销')).toBeDisabled();
});

test.describe('touch and responsive',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 for(const slug of ['reflection','circle-angles','triangle-rigidity','ellipse-string'])test(`${slug} touch controls, 44px point and no overflow`,async({checkedPage:page})=>{
  await page.goto(`/labs/${slug}/`);await button(page,'准备独立探索').tap();await button(page,'核验这次观察').tap();
  const point=page.locator('#geo-handle');const box=await point.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
 for(const sample of [{slug:'reflection',x:362,y:196,value:'-1.00 u'},{slug:'circle-angles',x:400,y:80,value:'90.0 °'},{slug:'triangle-rigidity',x:400+(320/7)*(-3+4*Math.cos(80*Math.PI/180)),y:280-(320/7)*4*Math.sin(80*Math.PI/180),value:'80.0 °'},{slug:'ellipse-string',x:400,y:128,value:'90.0 °'}])test(`actual touch drag of ${sample.slug} preserves construction`,async({checkedPage:page})=>{
  await page.goto(`/labs/${sample.slug}/`);const point=page.locator('#geo-handle');await point.scrollIntoViewIfNeeded();const box=await point.boundingBox(),board=await page.locator('#geo-svg').boundingBox();
  const client=await page.context().newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box!.x+box!.width/2,y:box!.y+box!.height/2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:board!.x+board!.width*sample.x/800,y:board!.y+board!.height*sample.y/560}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#geo-position-value')).toHaveText(sample.value);
  if(sample.slug==='reflection')await expect(point).toHaveAttribute('transform','translate(362 280)');
 });
});

test.describe('without JavaScript',()=>{test.use({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const slug of ['reflection','circle-angles','triangle-rigidity','ellipse-string'])test(`${slug} static figure, conditions and general reasoning`,async({page})=>{
  await page.goto(`/labs/${slug}/`);await expect(button(page,'准备独立探索')).toBeDisabled();await expect(page.locator('#geo-handle')).toHaveAttribute('tabindex','-1');await expect(page.locator('.geo-noscript')).toContainText('启用JavaScript');
  await page.getByText('展开一般论证',{exact:true}).click();await expect(page.locator('.geo-reasoning ol')).toBeVisible();await page.getByText('读一段背景，带着问题动手',{exact:true}).click();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });});
