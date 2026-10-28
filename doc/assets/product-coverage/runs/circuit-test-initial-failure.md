# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-coverage.spec.ts >> circuit topology restores and clears independent challenge credit
- Location: tests/browser/product-coverage.spec.ts:43:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-circuit-preset="parallel"]')
    - locator resolved to <button type="button" data-circuit-preset="parallel">示例：两灯并联</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    166 × waiting for element to be visible, enabled and stable
        - element is not visible
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "跳到主要内容" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - link "科学探索实验室首页" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e5]: ∴
      - generic [ref=e6]:
        - text: 科学探索实验室
        - generic [ref=e7]: SCIENCE, IN YOUR HANDS
    - navigation "主导航" [ref=e8]:
      - link "探索空间" [ref=e9] [cursor=pointer]:
        - /url: /#spaces
      - link "全部实验" [ref=e10] [cursor=pointer]:
        - /url: /experiments/
      - link "关于" [ref=e11] [cursor=pointer]:
        - /url: /about/
  - main [ref=e12]:
    - complementary "第一次动手" [ref=e13]:
      - generic [ref=e14]:
        - text: 先做一件事
        - paragraph [ref=e15]: 从空板开始，自己连接两盏灯
      - link "开始动手 ↓" [ref=e16] [cursor=pointer]:
        - /url: "#circuit-prepare"
    - generic [ref=e17]:
      - paragraph [ref=e18]:
        - link "物理实验室" [ref=e19] [cursor=pointer]:
          - /url: /spaces/physics/
        - text: / 电路接线工坊
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: 接线工坊 · 让电流有路可走
          - heading "少一盏灯， 另一盏还亮吗？" [level=1] [ref=e23]: 少一盏灯，另一盏还亮吗？
        - paragraph [ref=e24]:
          - text: 两盏灯，同一节电源。命运连在一起，还是各走各的路？
          - generic [ref=e25]: 点两个接线柱，亲手接上一根导线。先让它亮起来，再解释电流怎样回来。
      - region [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: 问题的来处
          - generic [ref=e29]: 1800 年 · 伏打电堆
        - generic [ref=e30]:
          - heading "怎样让电流不只出现一瞬间？" [level=2] [ref=e31]
          - group [ref=e32]:
            - generic "读一段背景，带着问题动手" [ref=e33] [cursor=pointer]
      - group "电路接线工作台" [ref=e34]:
        - generic [ref=e35]:
          - heading "一盏灯的两条路" [level=2] [ref=e36]
          - generic [ref=e37]: 直流 · 稳态 · 电阻灯
        - generic [ref=e38]:
          - strong [ref=e39]: 先做一件事：补上回来的路
          - paragraph [ref=e40]: 已接好 P → A1。再点 B1、N，让灯1的两端接到电源两极。
          - status [ref=e41]: 灯1还没亮：检查它的两端是否分别有路接到电源两极。
        - generic [ref=e42]:
          - generic [ref=e43]:
            - group "六接线柱实验板" [ref=e44]:
              - img [aria-hidden] [ref=e45]:
                - generic [ref=e49]: 电源
                - generic [ref=e50]: 6 V
                - generic [ref=e51]: r = 1 Ω
                - generic [ref=e54]:
                  - generic [ref=e58]: 灯1
                  - generic [ref=e59]: 无电流
                - generic [ref=e60]:
                  - generic [ref=e64]: 灯2
                  - generic [ref=e65]: 无电流
              - button "接线柱 P" [ref=e66] [cursor=pointer]: P ＋
              - button "接线柱 N" [ref=e67] [cursor=pointer]: N −
              - button "接线柱 A1" [ref=e68] [cursor=pointer]: A1
              - button "接线柱 B1" [ref=e69] [cursor=pointer]: B1
              - button "接线柱 A2" [ref=e70] [cursor=pointer]: A2
              - button "接线柱 B2" [ref=e71] [cursor=pointer]: B2
            - paragraph [ref=e72]: 只有接线柱处相连，交叉导线不会自动相连。
            - generic [ref=e73]:
              - status [ref=e74]: 点一个接线柱，再点另一个。
              - button "取消接线" [ref=e75] [cursor=pointer]
              - button "拆掉全部导线" [ref=e76] [cursor=pointer]
            - generic "已接导线" [ref=e77]:
              - button "拆线 P–A1" [ref=e78] [cursor=pointer]
          - complementary "实时电路仪表" [ref=e79]:
            - generic [ref=e80]:
              - text: 电源送出了多少？
              - strong [ref=e81]: 0.000 A
              - paragraph [ref=e82]: 总电流
            - generic [ref=e83]:
              - generic [ref=e84]:
                - term [ref=e85]: 外端电压 U
                - definition [ref=e86]: 6.000 V
              - generic [ref=e87]:
                - term [ref=e88]: 灯上总功率
                - definition [ref=e89]: 0.000 W
            - article [ref=e90]:
              - generic [ref=e91]:
                - heading "灯1" [level=3] [ref=e92]
                - generic [ref=e93]: 无电流
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - term [ref=e96]: 电流 |I|
                  - definition [ref=e97]: 0.000 A
                - generic [ref=e98]:
                  - term [ref=e99]: 两端电压 |U|
                  - definition [ref=e100]: 0.000 V
                - generic [ref=e101]:
                  - term [ref=e102]: 功率 P
                  - definition [ref=e103]: 0.000 W
              - button "断开灯1" [pressed] [ref=e104] [cursor=pointer]
            - article [ref=e105]:
              - generic [ref=e106]:
                - heading "灯2" [level=3] [ref=e107]
                - generic [ref=e108]: 悬浮 · 无电流
              - generic [ref=e109]:
                - generic [ref=e110]:
                  - term [ref=e111]: 电流 |I|
                  - definition [ref=e112]: 0.000 A
                - generic [ref=e113]:
                  - term [ref=e114]: 两端电压 |U|
                  - definition [ref=e115]: 悬浮
                - generic [ref=e116]:
                  - term [ref=e117]: 功率 P
                  - definition [ref=e118]: 0.000 W
              - button "断开灯2" [pressed] [ref=e119] [cursor=pointer]
            - paragraph [ref=e120]: 光晕随功率增强，仅作相对提示。数值才是定量证据；箭头表示约定电流方向。
        - status [ref=e121]: 断路：从电源出发，还找不到经过灯返回另一极的完整路径。找一找没有接回的灯端。
        - group [ref=e122]:
          - generic "调节电源与灯的电阻" [ref=e123] [cursor=pointer]
        - group [ref=e124]:
          - generic "需要灵感？看三种接法" [ref=e125] [cursor=pointer]
        - region [ref=e126]:
          - generic [ref=e127]:
            - paragraph [ref=e128]: 轮到你设计
            - heading "一盏断开， 另一盏仍亮。" [level=2] [ref=e129]: 一盏断开，另一盏仍亮。
            - paragraph [ref=e130]: 从空板开始，自己让两灯都亮，再亲手断开灯1验证。目标是各有通路，不要求亮度完全不变。
            - button "开始独立接线" [ref=e131] [cursor=pointer]
          - status [ref=e133]: 你会怎样接？不必先记住“串联”或“并联”的名字。
        - region [ref=e134]:
          - generic [ref=e135]:
            - heading "留住两种接法" [level=2] [ref=e136]
            - button "记下当前接法" [ref=e137] [cursor=pointer]
            - button "导出 CSV" [disabled] [ref=e138]
          - paragraph [ref=e139]: 仅本页保留最近两组，刷新清除；第三组替换最早一组。恢复重算读数，不恢复挑战完成状态。
          - status [ref=e140]: 记一组，再只改接法或一个参数，留下对照。
          - paragraph
        - generic [ref=e141]:
          - heading "另一盏仍亮，就一定一样亮吗？" [level=2] [ref=e142]
          - paragraph [ref=e143]: 并联时断开灯1，灯2的功率会怎样？考虑电源还有 1 Ω 内阻。先预测，再亲手断灯。
          - group "并联断灯功率预测" [ref=e144]:
            - button "完全不变" [ref=e145] [cursor=pointer]
            - button "略微增大" [ref=e146] [cursor=pointer]
            - button "也变成零" [ref=e147] [cursor=pointer]
          - status [ref=e148]: 先选一个判断，再比较电源端电压与灯2功率。
      - generic [ref=e149]:
        - generic [ref=e150]:
          - paragraph [ref=e151]: 每一瓦，都有去处
          - heading "灯上的功率， 没有拿走全部。" [level=2] [ref=e152]: 灯上的功率，没有拿走全部。
          - paragraph [ref=e153]: E·I = P灯1 + P灯2 + I²r
          - status [ref=e154]: 0.000 = 0.000 + 0.000 + 0.000 W
          - paragraph [ref=e155]: 读数保留三位小数，相加可能有舍入差。内阻也消耗功率；负载改变时，内阻压降改变，外端电压 U = E − Ir 也会变。
        - group [ref=e156]:
          - generic "这块实验板能解释到哪里？" [ref=e157] [cursor=pointer]
      - complementary [ref=e158]:
        - paragraph [ref=e159]: 电学里功率怎样分配？机械里功率又怎样传递？
        - link "去齿轮工坊比较转速与扭矩 ↗" [ref=e160] [cursor=pointer]:
          - /url: /labs/gears/
        - link "全部实验 ↗" [ref=e161] [cursor=pointer]:
          - /url: /experiments/
    - paragraph [ref=e162]:
      - link "下一站：电阻分压台——6 V怎样分出3 V？ ↗" [ref=e163] [cursor=pointer]:
        - /url: /labs/resistors/
    - region "把发现留下来" [ref=e165]:
      - paragraph [ref=e166]: 先预测，再用证据解释
      - heading "把这次发现，留给下次的自己" [level=2] [ref=e167]
      - paragraph [ref=e168]: 断开一盏灯，另一盏还亮的接法有什么共同点？
      - generic [ref=e169]: 我的预测（可选）
      - textbox "我的预测（可选）" [ref=e170]:
        - /placeholder: 先写下想法，再改变条件检验。
      - generic [ref=e171]:
        - generic [ref=e172]:
          - heading "换个条件，再试一次" [level=3] [ref=e173]
          - paragraph [ref=e174]: 接成并联后只断开灯1，比较灯2功率；考虑电源还有内阻。
        - generic [ref=e175]:
          - heading "看哪里？" [level=3] [ref=e176]
          - paragraph [ref=e177]: 二维亲手接线与测量；三维同步端子、导线与灯位置，交叉不自动连接。
      - generic [ref=e178]: 我的解释与证据（可选）
      - textbox "我的解释与证据（可选）" [ref=e179]:
        - /placeholder: 我改变了……，保持了……；这两组证据说明……，但不能说明……
      - generic [ref=e180]:
        - button "保存这次发现" [ref=e181] [cursor=pointer]
        - button "清除本机发现" [ref=e182] [cursor=pointer]
        - link "回到装置再试 ↑" [ref=e183] [cursor=pointer]:
          - /url: "#circuit-prepare"
      - paragraph [ref=e184]: 仅此浏览器保存最近两组，第三组替换最早一组。条件、预测和解释一起保存；文字不自动判分。与原实验的临时记录分别保存。
      - status [ref=e185]: 尚未保存。启用交互后可以记录；请勿在这里填写个人身份信息。
      - paragraph [ref=e186]: 留两组不同条件，再比较改变了什么。
      - group [ref=e187]:
        - generic "先修与两种探索深度" [ref=e188] [cursor=pointer]
      - group [ref=e189]:
        - generic "模型、来源与核验边界" [ref=e190] [cursor=pointer]
    - generic [ref=e191]:
      - generic [ref=e192]:
        - generic [ref=e193]:
          - paragraph [ref=e194]: 同一装置，换个角度
          - heading "空间观察台" [level=2] [ref=e195]
        - button "打开三维视图" [ref=e196] [cursor=pointer]
      - paragraph [ref=e197]: 上方二维实验负责接线、构造和测量；这里同步呈现当前几何。平面对象置于空间台面，厚度、球体大小及变形显示均为示意，不新增测量值。
      - status
      - status [ref=e198]: 三维按需打开；拖动旋转、滚轮缩放，也可用方向键。二维与测量始终可用。
  - contentinfo [ref=e199]:
    - link "∴ 科学探索实验室" [ref=e200] [cursor=pointer]:
      - /url: /
    - paragraph [ref=e201]: 先好奇，再动手。让每一个「为什么」都有探索的起点。
    - link "模型与科学说明 ↗" [ref=e202] [cursor=pointer]:
      - /url: /about/#models
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {experiments} from '../../src/data/labs';
  3  | import {studios} from '../../src/data/discovery-studios';
  4  | import {curation} from '../../src/data/curation';
  5  | const legacyControls:Record<string,string>={buoyancy:'#immersion',pendulum:'#length',lens:'#screen-distance',interference:'#wave-phase',circuits:'#circuit-emf',resistors:'#divider-upper',capacitors:'#rc-resistance',area:'#leg-a',sections:'#offset',mobius:'#paper-progress',reflection:'#geo-position','circle-angles':'#geo-position','triangle-rigidity':'#geo-position','ellipse-string':'#geo-position',moon:'#moon-node',orbit:'#speed','three-body':'#perturbation',bridge:'#load',balance:'#balance-load-y',gears:'#output-teeth'};
  6  | for(const experiment of experiments)test(`${experiment.slug}: mobile guidance and durable conditions roundtrip`,async({page})=>{
  7  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  8  |  await page.setViewportSize({width:320,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  9  |  await page.goto(experiment.href);
  10 |  const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');
  11 |  const start=page.getByRole('link',{name:'开始动手 ↓',exact:true});
  12 |  for(const width of [320,390]){
  13 |   await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));
  14 |   await expect(start).toBeVisible();const box=(await start.boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(844);
  15 |   await start.click();
  16 |   expect(await page.evaluate(selector=>{const target=document.querySelector(selector);return !!target&&(target===document.activeElement||target.contains(document.activeElement));},curation[experiment.slug]!.target)).toBe(true);
  17 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  18 |  }
  19 |  await expect(panel.getByRole('heading',{name:'把这次发现，留给下次的自己'})).toBeVisible();
  20 |  // Read computed colors, including inherited dark experiment backgrounds.
  21 |  const contrast=await panel.locator('h2').evaluate(heading=>{
  22 |   const rgb=(s:string)=>s.match(/[\d.]+/g)!.map(Number),lum=(a:number[])=>a.slice(0,3).map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i]!,0);
  23 |   let parent:Element|null=heading,bg=[255,255,255];while(parent){const color=rgb(getComputedStyle(parent).backgroundColor);if((color[3]??1)===1){bg=color;break;}parent=parent.parentElement;}
  24 |   const a=lum(rgb(getComputedStyle(heading).color)),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  25 |  });expect(contrast).toBeGreaterThanOrEqual(4.5);
  26 |  const studio=studios.find(s=>s.slug===experiment.slug),selector=legacyControls[experiment.slug]??`#dis-input-${studio!.compare}`;
  27 |  const control=page.locator(selector);await control.evaluate(el=>{let p=el.parentElement;while(p){if(p instanceof HTMLDetailsElement)p.open=true;p=p.parentElement;}});const initial=await control.inputValue();
  28 |  await page.getByLabel('我的解释与证据（可选）').fill('A：先保持其他条件');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await expect(panel.locator('.discovery-records article')).toHaveCount(1);
  29 |  const isSelect=await control.evaluate(el=>el instanceof HTMLSelectElement);
  30 |  const changed=await control.evaluate(el=>{if(el instanceof HTMLSelectElement)return [...el.options].find(o=>o.value!==el.value)!.value;const input=el as HTMLInputElement;return input.value===input.max?input.min:input.max;});
  31 |  if(isSelect)await control.selectOption(changed);else{await control.fill(changed);await control.dispatchEvent('input');}const second=await control.inputValue();expect(second).not.toBe(initial);
  32 |  await page.getByLabel('我的解释与证据（可选）').fill('B：改变一个条件后观察');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await expect(panel.locator('.discovery-records article')).toHaveCount(2);
  33 |  await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(2);
  34 |  for(const [letter,expected,words] of [['A',initial,'A：先保持其他条件'],['B',second,'B：改变一个条件后观察']]){
  35 |   await page.getByRole('button',{name:`恢复发现 ${letter}`,exact:true}).click();await expect(control).toHaveValue(expected!);await expect(page.getByLabel('我的解释与证据（可选）')).toHaveValue(words!);await expect(panel.locator('[role=status]')).toContainText('不恢复独立任务资格');
  36 |  }
  37 |  // A valid-looking envelope with an unknown condition must never reach a model.
  38 |  await page.evaluate(slug=>{const key=`science-teach:discoveries:${slug}:v1`,data=JSON.parse(localStorage.getItem(key)!);data.records[0].conditions.unexpected=42;localStorage.setItem(key,JSON.stringify(data));},experiment.slug);
  39 |  await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('[role=status]')).toContainText('不兼容');await expect(panel.locator('.discovery-records article')).toHaveCount(0);
  40 |  await page.getByRole('button',{name:'清除本机发现',exact:true}).click();await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(0);expect(errors).toEqual([]);
  41 | });
  42 | 
  43 | test('circuit topology restores and clears independent challenge credit',async({page})=>{
  44 |  await page.goto('/labs/circuits/');const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');
> 45 |  await page.locator('[data-circuit-preset="parallel"]').click();
     |                                                         ^ Error: locator.click: Test timeout of 90000ms exceeded.
  46 |  await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
  47 |  const before=await page.locator('#circuit-wire-list').textContent();await page.locator('#circuit-prepare').click();await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();
  48 |  await expect(page.locator('#circuit-wire-list')).toHaveText(before!);await expect(page.locator('#circuit-challenge-note')).toContainText('不计');
  49 | });
  50 | test('puzzle construction survives a desktop-to-phone reload',async({page})=>{
  51 |  await page.setViewportSize({width:1200,height:900});await page.goto('/labs/area/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#next-piece').click();await page.locator('#next-piece').click();
  52 |  await expect(page.locator('#area-progress')).toHaveText('2 / 4');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
  53 |  await page.setViewportSize({width:390,height:844});await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#area-progress')).toHaveText('2 / 4');
  54 |  const inside=await page.locator('#triangle-0').evaluate(el=>{const m=(el as unknown as SVGGraphicsElement).transform.baseVal.consolidate()!.matrix;return m.f>=450;});expect(inside).toBe(true);
  55 | });
  56 | test('partial paper cut and idler topology are recoverable paused constructions',async({page})=>{
  57 |  await page.goto('/labs/mobius/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#paper-cut-progress').fill('55');await page.locator('#paper-cut-progress').dispatchEvent('input');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#paper-cut-progress')).toHaveValue('55');await expect(page.locator('#paper-cut-stage-note')).toContainText('剩余部分');
  58 |  await page.goto('/labs/gears/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#idler').click();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await expect(page.locator('#idler')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#idler-field')).toBeVisible();
  59 | });
  60 | test('shared workbench preserves legal non-step dragged conditions',async({page})=>{
  61 |  await page.goto('/labs/belt-drive/');const panel=page.locator('[data-personal-discoveries]');await expect(panel).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
  62 |  await page.evaluate(()=>{const key='science-teach:discoveries:belt-drive:v1',data=JSON.parse(localStorage.getItem(key)!);data.records[0].conditions.ratio=1.234567;localStorage.setItem(key,JSON.stringify(data));});
  63 |  await page.reload();await expect(panel).toHaveAttribute('data-ready','true');await expect(panel.locator('.discovery-records article')).toHaveCount(1);await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();
  64 |  const ratio=await page.evaluate(()=>JSON.parse(localStorage.getItem('science-teach:discoveries:belt-drive:v1')!).records[1].conditions.ratio);expect(ratio).toBe(1.234567);
  65 | });
  66 | 
  67 | test('RC restores a charged hold state and does not invent past curve history',async({page})=>{
  68 |  await page.goto('/labs/capacitors/');await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.locator('#rc-step-second').click();await page.locator('[data-rc-mode="hold"]').click();
  69 |  const voltage=await page.locator('#rc-voltage').textContent();await page.getByRole('button',{name:'保存这次发现',exact:true}).click();await page.reload();await expect(page.locator('[data-personal-discoveries]')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'恢复发现 A',exact:true}).click();
  70 |  await expect(page.locator('#rc-voltage')).toHaveText(voltage!);await expect(page.locator('#rc-clock')).toHaveText('已暂停 · t = 1.00 s');await expect(page.locator('#rc-current')).toHaveText('0.000 mA');await expect(page.locator('#rc-trace-note')).toContainText('不补造历史');await expect(page.locator('#rc-task-note')).toContainText('不计');
  71 | });
  72 | 
```