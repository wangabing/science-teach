# 三维实验接口

网站静态运行，无新增 HTTP 或后台接口。

- `topology(n)`：n 为 0/1/2，返回 sides、boundaries、circuits、cutComponents、linked，非法 n 抛 RangeError。
- `stripPoint(n,t,v)`：返回空间坐标。`stripNormal` 返回连续局部法向；`tracePoint(n,progress,edge)` 将 0–1 进度映射到一圈/两圈路径。
- `cutBands(n)`：返回每一连通分量的 turn、min、max 参数范围。
- `PaperState`：twists、progress、edge、cut；DOM 控件和三维/二维视图共享这一个状态。
- `createStage(host,background,onLost)`：返回 scene、camera、controls、renderer、canvas、render、frame、preset、dispose；按需绘制，限制 DPR≤2，自适应尺寸，监听 context loss。
- `createMobiusScene(host,onLost)`：返回 update(PaperState)、preset、dispose；颜色表示剪后组件，而非莫比乌斯带的正反面。
- `createLensScene(host,change,onLost)`：update(LensInput,extensions)、preset、dispose；拖动回调 change(id,value) 进入原薄透镜模型，取消演示并触发全部读数更新。

透镜长度单位 cm，三维换算每 cm=0.18 场景单位。物高 2 cm，不同视图共享 solveLens、rayHeights；图像模糊是分离量指示，不是完整光学 PSF。纸带单位为无量纲几何单位，圈数不代表米或秒。

生命周期：离页 pause 与 dispose；pageshow.persisted 重新初始化场景，读取当前控件/状态；异步导入完成前若离页，不创建场景。初始化失败/context loss 释放场景，显示动态 SVG，保持实验参数。DOM 控件为键盘和无 WebGL 操作的公共入口。
