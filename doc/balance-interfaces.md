# 重心与稳定：接口

没有 HTTP、后台或数据库接口。

## 模型
- `BalanceInput`：width（m）、tilt（°）、loadX/loadY（m）、loadMass/bodyMass（kg）。UI 的 bodyMass 固定 2。所有输入有限、宽度/质量为正，配重在架内，模型允许 |tilt|<85°，UI 限 ±60°。
- `solveBalance(p)`：mass、cx/cy、projection、margin、status（stable/critical/unstable）、edge、normal、moment、criticalLeft/Right。临界角单位 °，力矩 N·m，距离 m。
- `startTipping(p)`：稳定或临界返回 null；失稳返回 `{phi,omega,time,edge,landed}`，φ/ω 是 rad/rad·s⁻¹，time 为 s。
- `stepTipping(p,state,dt)`：纯函数返回下一状态，固定子步积分，首次接触后状态冻结。UI 仅以已释放的条件调用，手动变参清除旧状态。
- `tippingInertia`、`tippingEnergy`：用于惯量、接触前能量核验。
- `bodyPoint`、`platformPoint`：体坐标绕边缘、台面到世界坐标变换，2D/3D 共享约定。

## 场景
`createBalanceScene(host,move,onLost)` 返回 `update(p,fall)`、`preset(name)`、`dispose()`。move(x,y) 返回模型米坐标，进入 DOM 控制器的同一校验/边界处理入口；场景不自行求解物理。

## 状态与控件
`balance-tilt/width/load-y/load-x/mass` 是统一参数源；模式 idle/demo/demo-paused/fall/fall-paused 互斥。视图切换保存全部参数和释放状态。宽度改变更新横向滑块对称范围并夹紧旧值；拖动/微调/键盘进入相同入口。预测与挑战仅当前页面保留，重新探索清空。

visibilitychange/pagehide 暂停；pagehide dispose；pageshow.persisted 读取现有状态重建场景。初始化异步完成时若已离页，取消创建。WebGL loss 释放场景、显式切回 SVG，保持模型与 DOM 操作。
