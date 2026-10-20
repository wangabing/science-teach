import {test,expect,type Page} from '@playwright/test';
const port=(page:Page,id:string)=>page.getByRole('button',{name:`接线柱 ${id}`,exact:true});
async function wire(page:Page,a:string,b:string){await port(page,a).click();await port(page,b).click();}
async function example(page:Page,name:string){await page.getByText('需要灵感？看三种接法',{exact:true}).click();await page.getByRole('button',{name:`示例：${name}`,exact:true}).click();}

test('keyboard closes first loop, cancels selection, prevents duplicates and removes wire',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/labs/circuits/');
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'跳到主要内容'})).toBeFocused();await expect(page.getByRole('link',{name:'跳到主要内容'})).toBeVisible();
  await expect(page.locator('#circuit-current')).toHaveText('0.000 A');
  await port(page,'B1').focus();await page.keyboard.press('Enter');await expect(port(page,'B1')).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('Escape');await expect(port(page,'B1')).toHaveAttribute('aria-pressed','false');
  await port(page,'B1').focus();await page.keyboard.press('Space');await port(page,'N').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#circuit-current')).toHaveText('0.286 A');await expect(page.locator('#circuit-first-note')).toContainText('灯1亮了');
  await expect(page.locator('#circuit-lamp-power-2')).toHaveText('0.000 W');
  await wire(page,'N','B1');await expect(page.locator('#circuit-selection')).toContainText('已连接，不重复');await expect(page.locator('#circuit-wire-list button')).toHaveCount(2);
  await page.getByRole('button',{name:'拆线 B1–N',exact:true}).click();await expect(page.locator('#circuit-current')).toHaveText('0.000 A');
  expect(errors).toEqual([]);
});

test('series, lamp bypass and supply short have distinct model-backed diagnostics',async({page})=>{
  await page.goto('/labs/circuits/');await example(page,'两灯串联');
  await expect(page.locator('#circuit-current')).toHaveText('0.146 A');await expect(page.locator('#circuit-lamp-power-1')).toHaveText('0.428 W');
  await wire(page,'A1','B1');await expect(page.locator('#circuit-lamp-state-1')).toHaveText('被导线绕过');await expect(page.locator('#circuit-current')).toHaveText('0.286 A');await expect(page.locator('#circuit-diagnosis')).toContainText('有灯被导线绕过');
  await wire(page,'P','N');await expect(page.locator('#circuit-diagnosis')).toContainText('电源被导线短接');await expect(page.locator('#circuit-current')).toHaveText('6.000 A');await expect(page.locator('#circuit-power-ledger')).toHaveText('36.000 = 0.000 + 0.000 + 36.000 W');
  await page.getByRole('button',{name:'拆线 P–N',exact:true}).click();await expect(page.locator('#circuit-current')).toHaveText('0.286 A');
});

test('independent challenge needs own wiring and actual disconnection, then edits invalidate',async({page})=>{
  await page.goto('/labs/circuits/');await page.getByRole('button',{name:'开始独立接线'}).click();
  for(const [a,b] of [['P','A1'],['B1','A2'],['B2','N']])await wire(page,a!,b!);
  await expect(page.locator('#circuit-challenge-note')).toContainText('两盏灯都亮了');await page.getByRole('button',{name:'断开灯1',exact:true}).click();
  await expect(page.locator('#circuit-challenge-note')).toContainText('还没有形成两条独立通路');await expect(page.locator('#circuit-lamp-power-2')).toHaveText('0.000 W');
  await page.getByRole('button',{name:'开始独立接线'}).click();
  for(const [a,b] of [['P','A1'],['B1','N'],['P','A2'],['B2','N']])await wire(page,a!,b!);
  await expect(page.locator('#circuit-challenge-note')).not.toContainText('验证完成');
  await page.getByRole('button',{name:'断开灯1',exact:true}).click();await expect(page.locator('#circuit-challenge-note')).toContainText('独立接线验证完成');
  await expect(page.locator('#circuit-challenge-evidence')).toContainText('1.488 W → 断开灯1 1.633 W');
  await wire(page,'A1','A2');await expect(page.locator('#circuit-challenge-note')).not.toContainText('验证完成');await expect(page.locator('#circuit-challenge-evidence')).toBeEmpty();
  await page.getByText('调节电源与灯的电阻',{exact:true}).click();await page.getByLabel('电动势 E').fill('9');await page.getByLabel('电动势 E').dispatchEvent('input');
  await expect(page.locator('#circuit-challenge-note')).toContainText('当前任务已结束');
});

test('example and restore cannot claim independent completion; records compare and export',async({page})=>{
  await page.goto('/labs/circuits/');await example(page,'两灯并联');await page.getByRole('button',{name:'断开灯1',exact:true}).click();
  await expect(page.locator('#circuit-challenge-note')).not.toContainText('验证完成');await page.getByRole('button',{name:'接回灯1',exact:true}).click();
  await page.getByRole('button',{name:'记下当前接法'}).click();
  await page.getByText('调节电源与灯的电阻',{exact:true}).click();await page.getByLabel('灯1电阻').fill('40');await page.getByLabel('灯1电阻').dispatchEvent('input');
  await page.getByRole('button',{name:'记下当前接法'}).click();await expect(page.locator('#circuit-comparison')).toContainText('灯1电阻 20→40 Ω');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'导出 CSV'}).click();const download=await pending;
  const stream=await download.createReadStream(),chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));const csv=Buffer.concat(chunks).toString('utf8');
  expect(csv).toContain('internal_resistance_ohm');expect(csv).toContain('resistive-lamps-v1');expect(csv.trim().split('\r\n')).toHaveLength(3);
  await page.getByRole('button',{name:'恢复 A',exact:true}).click();await expect(page.locator('#circuit-current')).toHaveText('0.545 A');await expect(page.locator('#circuit-challenge-note')).toContainText('不计为独立完成');
  await page.getByRole('button',{name:'记下当前接法'}).click();await expect(page.locator('#circuit-records article')).toHaveCount(2);
  await page.reload();await expect(page.locator('#circuit-records')).toBeEmpty();await expect(page.getByRole('button',{name:'导出 CSV'})).toBeDisabled();
});

test('transfer feedback explains internal resistance without replacing current circuit',async({page})=>{
  await page.goto('/labs/circuits/');await page.getByRole('button',{name:'完全不变',exact:true}).click();
  await expect(page.locator('#circuit-transfer-note')).toContainText('再检查电源内阻');
  await expect(page.locator('#circuit-current')).toHaveText('0.000 A');
  await page.getByRole('button',{name:'略微增大',exact:true}).click();await expect(page.locator('#circuit-transfer-note')).toContainText('1.488→1.633 W');
});

test.describe('mobile touch',()=>{
  test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test('tap terminals, read both lamps and operate without page overflow',async({page})=>{
    await page.goto('/spaces/physics/');await page.getByRole('link').filter({has:page.getByRole('heading',{name:/电路接线工坊/})}).click();
    await port(page,'B1').tap();await port(page,'N').tap();await expect(page.locator('#circuit-current')).toHaveText('0.286 A');
    for(const id of ['P','N','A1','B1','A2','B2']){const box=await port(page,id).boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.getByText('读一段背景，带着问题动手',{exact:true}).tap();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
  });
});

test.describe('no JavaScript',()=>{
  test.use({javaScriptEnabled:false,viewport:{width:390,height:844}});
  test('reading and honest numeric fallback remain available',async({page})=>{
    await page.goto('/labs/circuits/');await expect(page.getByText(/启用 JavaScript 后可接线与测量/)).toBeVisible();await expect(port(page,'P')).toBeDisabled();
    await page.getByText('读一段背景，带着问题动手',{exact:true}).click();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
    await page.getByText('这块实验板能解释到哪里？',{exact:true}).click();await expect(page.getByText(/直流稳态、理想导线、固定电阻灯和电源内阻/)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  });
});
