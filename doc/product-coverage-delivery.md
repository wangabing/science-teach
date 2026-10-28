# 全目录学习与发现覆盖交付（2026-10-22）

依据[产品体检](product-health-report-2026-10-21.md)和[上一轮六试点交付](product-improvement-delivery.md)。本轮执行当前具备条件的工程工作；[外部条件 TODO](product-followup-todo.md)独立跟踪后续安排。

重启后的独立复验与新增CI专项回归门禁见[恢复执行记录](product-resume-validation.md)：303项单测、147页构建、34项主规格和191项浏览器检查全部通过。下文保留原交付时的环境及证据。

## 实施路径与范围

隔离 Node24 → 逐项学习资料与轻量目录 → 120 共用工作台 → 16 新增独立状态适配 → 全目录手机/持久化验收 → 受影响旧功能回归 → 证据索引及 OpenSpec 归档。详细技术决策、依赖与任务见 [OpenSpec 设计](../openspec/changes/archive/2026-10-22-extend-product-learning-coverage/design.md)和[任务清单](../openspec/changes/archive/2026-10-22-extend-product-learning-coverage/tasks.md)。

- 全 140 项都有探索目标、检索术语、实际首动作、先修、预测、迁移问题、视图职责和模型边界；保留原六试点精修与四项首页推荐。
- 120 共用项复用各自已有的情景、控制量、主观察量、推导和来源，明确为“对照核验提示”；新增独立项分别整理解析提示。不能据此宣称外部科学复核、具体教材认证或学习效果。
- 140 项支持两组本机发现和解释，重载后可恢复与清除。原临时记录、透镜六组记录保持独立。非法版本、未知字段、越界/枚举错误和非法复合结构被拒绝。
- 纸带保留剪切与追踪构造；接线保留拓扑；拼图用各拼板的逻辑坐标跨尺寸恢复；RC 保留当前电压/挡位/时间及一致能量账本。恢复暂停、重算、清独立资格，不补造过去轨迹。
- 目录与空间页用轻量仪器缩略图，140 链接及无脚本阅读保留；实验页与首页推荐仍呈现实际装置。

## 验证与复现

使用官方 SHA256 校验的隔离 Node v24.22.1（系统 Node 未替换），本机 Chrome 155，生产静态预览 `http://127.0.0.1:4371`。

```sh
npm test
npm run build
npm run review:index
PLAYWRIGHT_CHANNEL=chrome npm run test:browser:coverage
PLAYWRIGHT_CHANNEL=chrome npm run test:browser:product
# 已启动服务时加 BROWSER_CHECK_URL=http://127.0.0.1:4371
PERFORMANCE_OUTPUT_DIR=doc/assets/product-coverage PERFORMANCE_PATHS=/experiments/ npm run measure:product -- after
```

全目录覆盖索引见 [asset-index.json](assets/product-coverage/asset-index.json)，分别记录资料整理、解析/情景核验提示、来源角色、外部审阅、教材/反馈与保存字段。历史来源可读性不等于公式适用性；本轮未重新逐条联网核对外链。

最终通过数与运行证据见 [validation.json](assets/product-coverage/validation.json)。303项单测通过；类型检查0错误/警告/提示；147页构建成功。145个唯一新增覆盖用例（140项逐页+5项专项）、13项产品路径、141项既有质量回归、33个受影响专项均有通过证据。初跑发现浮力/单摆独立布局未接入公共组件，已补接；电路闭合面板、几何重复文本的测试定位问题已修复并重跑。完整初跑、失败和最终重跑均保留，不将初跑冒充全通过。

## 性能与限制

固定 390×844、100 ms 延迟、200000 B/s 下载、4 倍 CPU 减速、禁缓存，目录前后各三次采样；受控基线保留最终资料、仅关闭轻量缩略图，使用独立目录构建。观测里程碑统一为window load及筛选器就绪，初始过早采样另存为performance-initial-*，不用于最终结论。页面观测里程碑与完整真实用户指标不同，不外推真实设备的 LCP/INP 或课堂效果。前后原始 JSON 保存于同目录，见[最终对比](assets/product-coverage/performance-comparison.md)：中位加载里程碑约10.85s→6.75s（−37.8%），传输约2.06MB→1.27MB（−38.4%），DOM HTML−76.3%。

三维公共依赖仍有约 600 kB 的压缩后分块；构建保留警告。它主要用于三维实验，不以提高阈值隐藏问题；后续需结合 EXT03 的真实设备、内存和交互证据确定更细粒度加载策略。

## 后续条件与排期

本地工程完成后，EXT01 托管 CI → EXT02 正式发布；EXT03 实机和 EXT06 学科复核可分批并行；EXT04 真实学生反馈及 EXT05 教材核对由实际参与安排决定。每项前提、责任角色、验收和工时估算见 [TODO](product-followup-todo.md)，尚无虚构负责人或日期承诺。本轮未推送、上线或联系参与者。

OpenSpec 12/12任务已关闭，四条新增要求已同步主规格，归档于 `2026-10-22-extend-product-learning-coverage`。归档前35项（34主规格+活动变更）、归档后34项主规格严格验证均通过。预览4371保留运行，最终构建已替换。
