# 重心与稳定：验收记录

日期：2026-10-16。环境：Node.js 24、Astro 7、TypeScript、Three.js，本机 Chrome，生产构建预览。变更：`add-center-of-mass-stability`。

## 科学模型与构建
- `npm test`：45 项通过，其中 7 项重心模型测试覆盖加权重心、降低配重、临界状态、左右对称、质量缩放、独立世界坐标投影与力矩、左右释放、首次接触、接触前能量守恒及非法输入。
- `npm run build`：63 个文件类型检查，零错误、警告和提示；18 个静态页面生成成功。Vite 仍提示已有 Three.js 分块超过 500 kB，三维运行时按实验页加载，首页不加载。
- `openspec validate add-center-of-mass-stability --strict`：通过。

## 浏览器与画面
专属检查 `npm run test:browser:balance` 已通过：
- 初始读数、稳定释放、正负方向失稳、临界附近判据、重力翻倒、暂停/继续、首次侧面接触停止。
- 实际鼠标拖动二维/三维配重、键盘微调、视角切换保留状态。
- 两段演示、手动接管、预测反馈和固定 20° 的运输挑战。
- 离页/返回、后台暂停、WebGL 初始化失败与实际上下文丢失后的同状态二维操作。
- 320/390 px 无横向溢出、触摸操作、减少动态、无 JavaScript 内容及十一实验入口。

画面审阅了三维主场景、二维装置、桌面与手机长页：整体重心标记置于配重之上，标签分开并放大，橙色支撑边界可见；手机采用装置、落点尺、控件依次排列。无脚本初始图从同一物理模型生成。截图位于 `test-results/balance/`：`balance-stage.png`、`balance-2d.png`、`balance-desktop.png`、`balance-390.png`、`balance-320.png`，为本地生成产物。

`BROWSER_CHECK_URL=http://127.0.0.1:4326 npm run test:browser`：八组全站回归全部通过，覆盖首页、浮力、单摆、六实验探索、教学演示、透镜与路线、三维透镜/莫比乌斯带及重心实验。首次启动误用默认 4321 端口导致入口等待超时，指定实际生产预览 4326 后完整通过。

## 教学与模型边界
- 架按均匀刚体、配重按固定点质量处理，仅左右翻倒且支点不滑动；真实物体可能先滑动。
- 释放动画由力矩与惯量驱动；接触前核验守恒，首次侧面接触后仅停止展示，不模拟碰撞、反弹、变形或声响。停止后的零角速度不能解释为碰撞过程守恒。
- 静态判据显示释放初始条件，运动数据单独更新；原支撑面不是落地后接触面。
- 本轮未开展青少年真实试用，浏览器验收不能证明教育效果；后续可按路线邀请 3–5 位目标年龄体验者记录操作卡点与证据解释。
- 所有内容为本地开发与验证，未提交版本或部署。

## 文档与归档
[需求](balance-requirements.md)、[设计](balance-design.md)、[接口](balance-interfaces.md)、[用户操作](balance-user-guide.md) 均位于 `doc/`。同步 `center-of-mass-stability` 主规格，并归档至 `openspec/changes/archive/2026-10-16-add-center-of-mass-stability/`。
