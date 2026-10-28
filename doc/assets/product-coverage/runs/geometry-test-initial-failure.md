# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: geometry-studios.spec.ts >> reflection independent keyboard search, reference credit and undo/redo
- Location: tests/browser/geometry-studios.spec.ts:10:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/由三角不等式，PA/)
Expected: visible
Error: strict mode violation: getByText(/由三角不等式，PA/) resolved to 3 elements:
    1) <li>由三角不等式，PA + PB′ ≥ AB′；只有A、P、B′共线且P在两点之间时取等号。A、B在l…</li> aka getByText('由三角不等式，PA + PB′ ≥ AB′；只有A、P、B′共线且P在两点之间时取等号。A、B在l同侧，保证线段AB′穿过l。', { exact: true })
    2) <p>再做定量：作B关于直线l的对称点B′。因为P在对称轴上，所以PB = PB′；于是原路程PA + …</p> aka getByText('再做定量：作B关于直线l的对称点B′。因为P')
    3) <p>作B关于直线l的对称点B′。因为P在对称轴上，所以PB = PB′；于是原路程PA + PB变成P…</p> aka getByText('作B关于直线l的对称点B′。因为P在对称轴上，所以PB').nth(2)

Call log:
  - Expect "toBeVisible" getByText(/由三角不等式，PA/) with timeout 5000ms
  - waiting for getByText(/由三角不等式，PA/)

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - paragraph [ref=e15]: 拖动绿色的P，或用滑块寻找更短的路线。
      - link "开始动手 ↓" [ref=e16] [cursor=pointer]:
        - /url: "#geo-position"
    - generic [ref=e17]:
      - paragraph [ref=e18]:
        - link "数学与几何实验室" [ref=e19] [cursor=pointer]:
          - /url: /spaces/geometry/
        - text: / 镜像寻路
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: 初中几何 · 轴对称 · 最短路径
          - heading "先到墙边，怎样走最短？" [level=1] [ref=e23]
          - paragraph [ref=e24]: 把折线，拉成直线。
        - paragraph [ref=e25]: A到B，途中必须碰一下直线l。接触点P选在哪里？先靠自己的判断，再借一面“数学镜子”。
      - region [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: 问题的来处
          - generic [ref=e29]: 古典几何 · 海伦与反射路径
        - generic [ref=e30]:
          - heading "把折线拉直，是一种解题方法。" [level=2] [ref=e31]
          - group [ref=e32]:
            - generic "读一段背景，带着问题动手" [ref=e33] [cursor=pointer]
      - group "镜像寻路工作台" [ref=e34]:
        - generic [ref=e35]:
          - heading "镜像寻路" [level=2] [ref=e36]
          - generic [ref=e37]: 拖动 · 观察 · 解释
          - generic [ref=e38]:
            - button "撤销" [ref=e39] [cursor=pointer]
            - button "重做" [disabled] [ref=e40]
            - button "重置" [ref=e41] [cursor=pointer]
        - generic [ref=e42]:
          - paragraph [ref=e43]:
            - generic [ref=e44]: 已知
            - text: A、B在直线l同侧；P在l上。距离使用统一的长度单位u。
          - paragraph [ref=e45]:
            - generic [ref=e46]: 研究
            - text: 找出PA + PB的最小值，并说明为什么。
        - generic [ref=e47]:
          - generic [ref=e48]:
            - heading "先做一次自己的观察" [level=3] [ref=e49]
            - paragraph [ref=e50]: 固定A(−4,3)、B(4,5)，亲手移动P，核验是否已找到最短路线。判定允许路程多出不超过0.001 u；这只是数值核验。
          - button "准备独立探索" [ref=e51] [cursor=pointer]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic "图形标记说明" [ref=e54]:
              - generic [ref=e55]: ● 已知点
              - generic [ref=e56]: ● 绿色可动点
              - generic [ref=e57]: ┄ 金色辅助线
            - group "镜像寻路互动图形，绿色点可用方向键或下方滑块移动" [ref=e58]:
              - generic [ref=e61]:
                - generic [ref=e62]: l
                - generic [ref=e66]: B′
                - generic [ref=e67]: AB′与l的交点
                - generic [ref=e70]: A
                - generic [ref=e72]: B
                - generic [ref=e73]: P
              - slider "移动点P，左右键改变位置" [ref=e74]
            - paragraph [ref=e78]:
              - text: 拖动绿色的P，或用滑块寻找更短的路线。
              - generic [ref=e79]: 点聚焦后，← → 调整；Shift加速；Home/End到端点。
            - generic [ref=e80]:
              - generic [ref=e81]:
                - generic [ref=e82]: P在直线上的横坐标
                - status [ref=e83]: "-1.00 u"
              - slider "P在直线上的横坐标" [ref=e84] [cursor=pointer]: "-1"
            - generic "当前几何证据" [ref=e85]:
              - generic [ref=e86]:
                - term [ref=e87]: PA
                - definition [ref=e88]: 4.243 u
              - generic [ref=e89]:
                - term [ref=e90]: PB = PB′
                - definition [ref=e91]: 7.071 u
              - generic [ref=e92]:
                - term [ref=e93]: 总路程
                - definition [ref=e94]: 11.314 u
              - generic [ref=e95]:
                - term [ref=e96]: 比当前最短多出
                - definition [ref=e97]: 0.000 u
            - paragraph [ref=e98]: PB与PB′始终相等。当前允许直线上的点，最短参考 11.314 u。把两段反射路径拉直，可找到取等号的位置。 读数为近似值，长度使用统一单位u。
          - complementary "作图与已知条件" [ref=e99]:
            - paragraph [ref=e100]: 作一条有理由的辅助线
            - button "显示镜像B′与辅助线AB′" [pressed] [ref=e101] [cursor=pointer]
            - button "限制P在线段[−5,−2]" [ref=e102] [cursor=pointer]
            - group [ref=e103]:
              - generic "改变已知条件" [ref=e104] [cursor=pointer]
            - generic [ref=e105]:
              - paragraph [ref=e106]: 把判断交给当前图形
              - button "核验这次观察" [ref=e107] [cursor=pointer]
              - status [ref=e108]: 正在观察参考状态，不计为独立完成。可重新准备后亲手验证。
            - group [ref=e109]:
              - generic "需要时，看参考状态" [ref=e110] [cursor=pointer]
              - paragraph [ref=e111]: 参考用于理解，不计为独立操作。你也可以在看过后重新准备任务。
              - button "应用参考状态" [ref=e112] [cursor=pointer]
        - generic [ref=e113]:
          - paragraph [ref=e114]: 换个条件，再试一次
          - heading "如果只允许P在线段[−5,−2]内活动，原来P=−1的答案还能用吗？" [level=2] [ref=e115]
          - group "迁移问题预测" [ref=e116]:
            - button "还能，最短点不会变" [ref=e117] [cursor=pointer]
            - button "不能，要检查允许范围" [ref=e118] [cursor=pointer]
          - status [ref=e119]: 先预测，再用下面的按钮检查反例。预测按钮不会改变当前图形。
          - button "试试：把P限制在线段内" [ref=e120] [cursor=pointer]
        - region [ref=e121]:
          - generic [ref=e122]:
            - heading "留下两组证据" [level=2] [ref=e123]
            - button "记下这一组" [ref=e124] [cursor=pointer]
            - button "导出 CSV" [disabled] [ref=e125]
          - paragraph [ref=e126]: 仅当前页保留最近两组，刷新清除；第三组替换最早一组。恢复输入并重算，不恢复独立任务状态。
          - status [ref=e127]: 先留一组，再改变一个条件。
          - paragraph
      - generic [ref=e128]:
        - generic [ref=e129]:
          - paragraph [ref=e130]: 从“好像如此”到“为什么必然”
          - heading "为什么辅助线要画到镜子另一边？" [level=2] [ref=e131]
          - paragraph [ref=e132]: 实验中的数值能帮你提出猜想。下面的论证解释适用条件内的一般关系。
          - group [ref=e133]:
            - generic "展开一般论证" [active] [ref=e134] [cursor=pointer]
            - list [ref=e135]:
              - listitem [ref=e136]: 作B关于直线l的对称点B′。因为P在对称轴上，所以PB = PB′；于是原路程PA + PB变成PA + PB′。
              - listitem [ref=e137]: 由三角不等式，PA + PB′ ≥ AB′；只有A、P、B′共线且P在两点之间时取等号。A、B在l同侧，保证线段AB′穿过l。
              - listitem [ref=e138]: 如果P只能在线段内活动，先检查交点是否在允许区间。交点在外时，距离和沿区间向交点方向减小，最小值出现在靠近交点的端点。不能直接把直线上的答案搬到线段上。
        - complementary [ref=e139]:
          - paragraph [ref=e140]: 把实验带回纸上
          - paragraph [ref=e141]: 在纸上画同侧两点A、B和直线l，折纸找B的镜像，用尺连接A与B′；再把可接触范围缩成一小段。
          - group [ref=e142]:
            - generic "适用条件与边界" [ref=e143] [cursor=pointer]
      - complementary [ref=e144]:
        - generic [ref=e145]: 课堂连接
        - paragraph [ref=e146]: 初中几何 · 轴对称 · 最短路径。可用于课前猜想、课堂探究或课后解释。按知识主题组织，具体教材章节与北京真题对应需由教师结合所用版本核对。
        - paragraph [ref=e147]: 给自己的证明写三行：已知什么？用了哪条辅助关系？结论在什么条件下成立？
      - navigation "几何探索路线" [ref=e148]:
        - link "回到几何实验室 ↗" [ref=e149] [cursor=pointer]:
          - /url: /spaces/geometry/
        - link "查看完整探索路线 ↗" [ref=e150] [cursor=pointer]:
          - /url: /experiments/#trail-geometry-reasoning
        - link "下一站：圆周角观测台 ↗" [ref=e151] [cursor=pointer]:
          - /url: /labs/circle-angles/
    - region "把发现留下来" [ref=e153]:
      - paragraph [ref=e154]: 先预测，再用证据解释
      - heading "把这次发现，留给下次的自己" [level=2] [ref=e155]
      - paragraph [ref=e156]: 找出PA + PB的最小值，并说明为什么。
      - generic [ref=e157]: 我的预测（可选）
      - textbox "我的预测（可选）" [ref=e158]:
        - /placeholder: 先写下想法，再改变条件检验。
      - generic [ref=e159]:
        - generic [ref=e160]:
          - heading "换个条件，再试一次" [level=3] [ref=e161]
          - paragraph [ref=e162]: 如果只允许P在线段[−5,−2]内活动，原来P=−1的答案还能用吗？
        - generic [ref=e163]:
          - heading "看哪里？" [level=3] [ref=e164]
          - paragraph [ref=e165]: 二维拖动受约束的点并检查辅助线和读数；三维空间台同步同一平面构造，图形证明仍依据二维关系。
      - generic [ref=e166]: 我的解释与证据（可选）
      - textbox "我的解释与证据（可选）" [ref=e167]:
        - /placeholder: 我改变了……，保持了……；这两组证据说明……，但不能说明……
      - generic [ref=e168]:
        - button "保存这次发现" [ref=e169] [cursor=pointer]
        - button "清除本机发现" [ref=e170] [cursor=pointer]
        - link "回到装置再试 ↑" [ref=e171] [cursor=pointer]:
          - /url: "#geo-position"
      - paragraph [ref=e172]: 仅此浏览器保存最近两组，第三组替换最早一组。条件、预测和解释一起保存；文字不自动判分。与原实验的临时记录分别保存。
      - status [ref=e173]: 尚未保存。启用交互后可以记录；请勿在这里填写个人身份信息。
      - paragraph [ref=e174]: 留两组不同条件，再比较改变了什么。
      - group [ref=e175]:
        - generic "先修与两种探索深度" [ref=e176] [cursor=pointer]
      - group [ref=e177]:
        - generic "模型、来源与核验边界" [ref=e178] [cursor=pointer]
    - generic [ref=e179]:
      - generic [ref=e180]:
        - generic [ref=e181]:
          - paragraph [ref=e182]: 同一装置，换个角度
          - heading "空间观察台" [level=2] [ref=e183]
        - button "打开三维视图" [ref=e184] [cursor=pointer]
      - paragraph [ref=e185]: 上方二维实验负责接线、构造和测量；这里同步呈现当前几何。平面对象置于空间台面，厚度、球体大小及变形显示均为示意，不新增测量值。
      - status
      - status [ref=e186]: 三维按需打开；拖动旋转、滚轮缩放，也可用方向键。二维与测量始终可用。
  - contentinfo [ref=e187]:
    - link "∴ 科学探索实验室" [ref=e188] [cursor=pointer]:
      - /url: /
    - paragraph [ref=e189]: 先好奇，再动手。让每一个「为什么」都有探索的起点。
    - link "模型与科学说明 ↗" [ref=e190] [cursor=pointer]:
      - /url: /about/#models
```

# Test source

```ts
  1  | import {test as base,expect,type Page} from '@playwright/test';
  2  | const test=base.extend<{checkedPage:Page}>({checkedPage:async({page},use)=>{
  3  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await use(page);expect(errors).toEqual([]);
  4  | }});
  5  | const button=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
  6  | async function range(page:Page,name:RegExp,value:string){const control=page.getByRole('slider',{name});await control.fill(value);await control.dispatchEvent('input');}
  7  | const note=(page:Page)=>page.locator('#geo-task-note');
  8  | async function downloadCSV(page:Page){const pending=page.waitForEvent('download');await button(page,'导出 CSV').click();const stream=await(await pending).createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks).toString('utf8');}
  9  | 
  10 | test('reflection independent keyboard search, reference credit and undo/redo',async({checkedPage:page})=>{
  11 |  await page.goto('/labs/reflection/');await button(page,'准备独立探索').click();
  12 |  const handle=page.getByRole('slider',{name:'移动点P，左右键改变位置',exact:true});await handle.focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#geo-position-value')).toHaveText('-2.90 u');
  13 |  await range(page,/^P在直线上的横坐标/,'-1');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立寻找已完成');await expect(page.locator('#geo-reading-2')).toHaveText('11.314 u');
  14 |  await button(page,'撤销').click();await expect(note(page)).toContainText('任务与历史笔迹未恢复');await expect(page.locator('#geo-position-value')).toHaveText('-2.90 u');
  15 |  await button(page,'重做').click();await expect(page.locator('#geo-position-value')).toHaveText('-1.00 u');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('先准备');
  16 |  await page.getByText('需要时，看参考状态',{exact:true}).click();await button(page,'应用参考状态').click();await expect(note(page)).toContainText('不计为独立完成');
> 17 |  await page.getByText('展开一般论证',{exact:true}).click();await expect(page.getByText(/由三角不等式，PA/)).toBeVisible();
     |                                                                                                ^ Error: expect(locator).toBeVisible() failed
  18 | });
  19 | 
  20 | test('reflection segment changes optimum; snapshots compare, export and restore recomputed values',async({checkedPage:page})=>{
  21 |  await page.goto('/labs/reflection/');await range(page,/^P在直线上的横坐标/,'-1');await button(page,'记下这一组').click();
  22 |  await button(page,'试试：把P限制在线段内').click();await expect(page.locator('#geo-position-value')).toHaveText('-2.00 u');await expect(page.locator('#geo-state-note')).toContainText('交点在允许线段外');
  23 |  await page.getByRole('button',{name:'不能，要检查允许范围',exact:true}).click();await expect(page.locator('#geo-position-value')).toHaveText('-2.00 u');
  24 |  await button(page,'记下这一组').click();await expect(page.locator('#study-comparison')).toContainText('多个条件改变');
  25 |  const data=await downloadCSV(page);expect(data).toContain('analytic-geometry-v1');expect(data).toContain('optimal_x_u');expect(data.trim().split('\r\n')).toHaveLength(3);
  26 |  await button(page,'恢复 A').click();await expect(page.locator('#geo-reading-2')).toHaveText('11.314 u');await expect(page.getByRole('button',{name:'限制P在线段[−5,−2]',exact:true})).toHaveAttribute('aria-pressed','false');await expect(note(page)).toContainText('未恢复');
  27 |  await button(page,'记下这一组').click();await expect(page.locator('#study-records article')).toHaveCount(2);await page.reload();await expect(page.locator('#study-records')).toBeEmpty();await expect(button(page,'导出 CSV')).toBeDisabled();
  28 | });
  29 | 
  30 | test('circle requires two manual positions, rejects endpoints and distinguishes opposite arcs',async({checkedPage:page})=>{
  31 |  await page.goto('/labs/circle-angles/');await button(page,'准备独立探索').click();await button(page,'核验这次观察').click();await expect(note(page)).toContainText('还没有新的手动位置');
  32 |  await range(page,/^P沿圆周的位置/,'270');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('第一位置');
  33 |  await range(page,/^P沿圆周的位置/,'315');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await expect(page.locator('#geo-reading-0')).toHaveText('60.00 °');
  34 |  await button(page,'试试：把P移到另一侧弧').click();await expect(page.locator('#geo-reading-0')).toHaveText('120.00 °');await expect(page.locator('#geo-reading-1')).toHaveText('240.0 °');
  35 |  await range(page,/^P沿圆周的位置/,'120');await expect(page.locator('#geo-reading-0')).toHaveText('未定义');await expect(page.locator('#geo-state-note')).toContainText('一条角边长度为零');
  36 |  await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^较小中心角/,'180');await range(page,/^P沿圆周的位置/,'270');await expect(page.locator('#geo-reading-0')).toHaveText('90.00 °');
  37 | });
  38 | 
  39 | test('triangle locking preserves current third side, disables free hinge and mirror keeps lengths',async({checkedPage:page})=>{
  40 |  await page.goto('/labs/triangle-rigidity/');await button(page,'准备独立探索').click();await range(page,/^两杆的铰链角/,'80');
  41 |  const third=await page.locator('#geo-reading-0').innerText(),area=await page.locator('#geo-reading-2').innerText();
  42 |  await button(page,'锁定当前第三边').click();await expect(page.getByRole('slider',{name:/^两杆的铰链角/})).toBeDisabled();await expect(page.locator('#geo-reading-0')).toHaveText(third);
  43 |  await page.getByRole('button',{name:'翻到基线下侧',exact:true}).click();await expect(page.locator('#geo-reading-0')).toHaveText(third);await expect(page.locator('#geo-reading-2')).toHaveText(area);
  44 |  await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await button(page,'记下这一组').click();
  45 |  await button(page,'解锁第三边').click();await expect(note(page)).not.toContainText('独立观察已完成');await expect(page.getByRole('slider',{name:/^两杆的铰链角/})).toBeEnabled();await button(page,'恢复 A').click();await expect(note(page)).toContainText('未恢复');
  46 | });
  47 | 
  48 | test('triangle impossible and degenerate states recover without NaN or fake task credit',async({checkedPage:page})=>{
  49 |  await page.goto('/labs/triangle-rigidity/');await button(page,'试试：把杆长改为1、2、3').click();await expect(page.locator('#geo-reading-3')).toHaveText('退化共线');await expect(page.locator('#geo-reading-2')).toHaveText('0.000 u²');
  50 |  await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^锁定的第三边 BC/,'4');await expect(page.locator('#geo-reading-3')).toHaveText('不能构成');await expect(page.locator('#geo-handle')).toBeHidden();
  51 |  const data=await (async()=>{await button(page,'记下这一组').click();return downloadCSV(page);})();expect(data).toContain('impossible');
  52 |  await range(page,/^锁定的第三边 BC/,'2');await expect(page.locator('#geo-reading-3')).toHaveText('三边锁定');await expect(page.locator('#geo-handle')).toBeVisible();
  53 | });
  54 | 
  55 | test('ellipse observes constant sum, distinguishes actual trace, restores without forged history and handles invalid shapes',async({checkedPage:page})=>{
  56 |  await page.goto('/labs/ellipse-string/');await button(page,'准备独立探索').click();await range(page,/^沿椭圆的位置参数/,'90');await button(page,'核验这次观察').click();
  57 |  await range(page,/^沿椭圆的位置参数/,'180');await button(page,'核验这次观察').click();await expect(note(page)).toContainText('独立观察已完成');await expect(page.locator('#geo-reading-2')).toHaveText('10.000 u');await expect(page.locator('.geo-pencil')).toHaveCount(2);
  58 |  await button(page,'记下这一组').click();await page.getByText('改变已知条件',{exact:true}).click();await range(page,/^半焦距/,'0');await expect(page.locator('#geo-reading-3')).toHaveText('0.000');await expect(page.locator('.geo-pencil')).toHaveCount(0);
  59 |  await button(page,'恢复 A').click();await expect(page.locator('#geo-reading-2')).toHaveText('10.000 u');await expect(page.locator('.geo-pencil')).toHaveCount(0);await expect(note(page)).toContainText('未恢复');
  60 |  await button(page,'试试：让焦点间距等于绳长').click();await expect(page.locator('#geo-state-note')).toContainText('a=c');await expect(page.getByRole('slider',{name:/^沿椭圆的位置参数/})).toBeDisabled();
  61 |  await range(page,/^半焦距/,'4');await expect(page.locator('#geo-state-note')).toContainText('a<c');await range(page,/^有效绳长的一半/,'5');await expect(page.getByRole('slider',{name:/^沿椭圆的位置参数/})).toBeEnabled();
  62 | });
  63 | 
  64 | test('real pointer drag stays on constrained baseline and produces one undo transaction',async({checkedPage:page})=>{
  65 |  await page.goto('/labs/reflection/');const handle=page.getByRole('slider',{name:'移动点P，左右键改变位置',exact:true});await handle.scrollIntoViewIfNeeded();
  66 |  const box=await handle.boundingBox(),board=await page.locator('#geo-svg').boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();
  67 |  await page.mouse.move(board!.x+board!.width*(400-38)/800,board!.y+board!.height*.2,{steps:10});await page.mouse.up();
  68 |  await expect(page.locator('#geo-position-value')).toHaveText('-1.00 u');await expect(page.locator('#geo-handle')).toHaveAttribute('transform','translate(362 280)');
  69 |  await button(page,'撤销').click();await expect(page.locator('#geo-position-value')).toHaveText('-3.00 u');await expect(button(page,'撤销')).toBeDisabled();
  70 | });
  71 | 
  72 | test.describe('touch and responsive',()=>{
  73 |  test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  74 |  for(const slug of ['reflection','circle-angles','triangle-rigidity','ellipse-string'])test(`${slug} touch controls, 44px point and no overflow`,async({checkedPage:page})=>{
  75 |   await page.goto(`/labs/${slug}/`);await button(page,'准备独立探索').tap();await button(page,'核验这次观察').tap();
  76 |   const point=page.locator('#geo-handle');const box=await point.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
  77 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  78 |   await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  79 |  });
  80 |  for(const sample of [{slug:'reflection',x:362,y:196,value:'-1.00 u'},{slug:'circle-angles',x:400,y:80,value:'90.0 °'},{slug:'triangle-rigidity',x:400+(320/7)*(-3+4*Math.cos(80*Math.PI/180)),y:280-(320/7)*4*Math.sin(80*Math.PI/180),value:'80.0 °'},{slug:'ellipse-string',x:400,y:128,value:'90.0 °'}])test(`actual touch drag of ${sample.slug} preserves construction`,async({checkedPage:page})=>{
  81 |   await page.goto(`/labs/${sample.slug}/`);const point=page.locator('#geo-handle');await point.scrollIntoViewIfNeeded();const box=await point.boundingBox(),board=await page.locator('#geo-svg').boundingBox();
  82 |   const client=await page.context().newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box!.x+box!.width/2,y:box!.y+box!.height/2}]});
  83 |   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:board!.x+board!.width*sample.x/800,y:board!.y+board!.height*sample.y/560}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  84 |   await expect(page.locator('#geo-position-value')).toHaveText(sample.value);
  85 |   if(sample.slug==='reflection')await expect(point).toHaveAttribute('transform','translate(362 280)');
  86 |  });
  87 | });
  88 | 
  89 | test.describe('without JavaScript',()=>{test.use({javaScriptEnabled:false,viewport:{width:390,height:844}});
  90 |  for(const slug of ['reflection','circle-angles','triangle-rigidity','ellipse-string'])test(`${slug} static figure, conditions and general reasoning`,async({page})=>{
  91 |   await page.goto(`/labs/${slug}/`);await expect(button(page,'准备独立探索')).toBeDisabled();await expect(page.locator('#geo-handle')).toHaveAttribute('tabindex','-1');await expect(page.locator('.geo-noscript')).toContainText('启用JavaScript');
  92 |   await page.getByText('展开一般论证',{exact:true}).click();await expect(page.locator('.geo-reasoning ol')).toBeVisible();await page.getByText('读一段背景，带着问题动手',{exact:true}).click();await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
  93 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  94 |  });});
  95 | 
```