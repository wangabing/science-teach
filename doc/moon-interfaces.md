# 月相与日月食：接口

静态网站，无服务端 API。参数、模型与视图在当前页面通信，不持久保存。

## 参数与科学接口
`MoonInput`：`phase`（°，0–360）、`node`（°，0–360）、`inclination`（°，0–10，默认 5.145）、`distance`（R⊕，56–64，默认 60.27）。模型允许任意有限相位/交点角并周期归一；拒绝非法倾角、距离和非有限输入。

- `moonPosition(input)`：真实比例三维坐标。
- `solveMoon(input)`：坐标、太阳/地球方向、观察基底、相位角、受光比例、月相名称、黄纬、教学天数、太阳角半径/月球角半径/中心角距/遮挡与局地食类型、月球阴影截面/覆盖/食类型。
- `phaseFromPlan(x,z,input)`：投影拖动的逆映射。
- `diskOverlap(r,R,d)`：两个圆面积交集，处理包含/相离/相切/零半径。
- `occultation(point,blocker,radius)`：任意表面采样点的太阳遮挡分数及角大小；用于日食和月食像素。
- `lunarShadow(moon)`：背日侧本影/半影截面与月盘重叠。

长度均为 R⊕，内部角度三角函数为弧度；界面与 MoonInput 使用度。月相名称按轨道阶段区间粗分，不表示精确历书时刻。局地太阳盘与地心月盘视点不同，接口没有暗含全球可见范围。

## 视图与状态接口
`createMoonScene(host,onMove,onLost,onTextureFailed)` 返回 `update(input,result)`、`preset(name)`、`dispose()`。场景只请求修改轨道位置，不拥有参数状态。相机支持立体、俯视、靠近地月；共享 stage 的 astronomy/astronomy-top 预设只供本页使用。

`createSkyPainter(moonCanvas,sunCanvas,onReady,onFailed)` 返回 `paint(result)`、`dispose()`。NASA 图片经同源 Canvas 采样，不调用外部服务。

`moon-phase`、`moon-node`、`moon-inclination`、`moon-distance` 是范围控件；`data-moon-preset` / `data-moon-phase` / `data-moon-step` 为情景、八相位定位和微调入口。`moon-demo-cycle` / `moon-demo-nodes` / `moon-pause` 控制两段演示。预测与挑战分别通过 `data-moon-prediction`、`moon-challenge-start/check` 操作，消息写入相应 status 文本。

## 生命周期
进入后加载 Three.js；后台暂停，pagehide 停止演示并释放三维，pageshow.persisted 恢复当前参数的场景。WebGL 丢失后同状态 SVG 操作可继续。图像加载失败不改变科学读数。演示与挑战仅当前页面有效。

## 近期实验共用观察条
`LabObservationBar.astro` 接收 stage/controls 选择器与两项现有读数 ID。MutationObserver 镜像 DOM 读数，IntersectionObserver/滚动与尺寸事件判断手机离开画面的操作阶段，不调用第二套模型。回看按钮保留参数，仅滚动到当前可见场景。透镜、纸带、重心与月相各自提供不同的读数。
