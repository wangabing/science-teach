# 科学探索实验室 · science-teach

面向青少年的互动科学探索网站。使用 Astro 静态构建、TypeScript 和 Three.js，无需后端、账号或 API 密钥。

## 本地启动

需要 Node.js **24+**（`.nvmrc` 已指定 24）。

```sh
npm ci
npm run dev
```

打开终端显示的地址，默认 http://localhost:4321。

```sh
npm test          # 292 项科学模型与证据逻辑测试
npm run check     # Astro / TypeScript 检查
npm run build     # 类型检查与静态构建，产物为 dist/
npm run preview   # 本地预览生产构建
```

预览服务器启动后，在另一个终端运行 `npm run test:browser`。默认使用本机 Chrome，可通过 `PLAYWRIGHT_CHANNEL` 选择浏览器通道，通过 `BROWSER_CHECK_URL` 指定服务器地址。截图输出到 `test-results/`。

本次全站质量修复与逐项核查见 [140项实验质量复核](doc/experiment-quality-repair.md)。

## 页面与当前范围

- `/`：明亮首页、可调摆长的轻量预览、四个空间入口。
- `/experiments/`：真实可用实验目录。
- `/spaces/physics/`：物理实验室，已开放37个实验。
- `/stem-lab/buoyancy/`：三维浮力实验，含数值、公式与静态降级。
- `/stem-lab/pendulum/`：三维单摆与能量，含测量、对照、任务和动态二维降级。
- `/spaces/geometry/`：37项实验，按初中几何、立体几何、函数与数形结合、概率与经典数学组织。
- `/spaces/cosmos/`：33项实验，含月相、轨道、三日凌空、光锥、光帆、黑洞、引力波与背景辐射。
- `/spaces/structures/`：工程与建造实验室，33项承重、机构与环境设计实验。
- `/labs/moon/`：月相与日月食，含 NASA 纹理、连续球面光照、三维轨道拖动、地球天空视图、日全食/环食/红色月食、交点演示与挑战。
- `/labs/balance/`：重心与稳定，含配重拖动、倾斜释放、重力转动、二维/三维切换、两段演示与运输挑战。
- `/labs/mobius/`：三维纸带，含沿面/沿边追踪、中心剪切预测、三种纸带对照和实体活动。
- `/labs/lens/`：透镜成像，含三维直接拖动、发光 F、独立光屏调焦、五情景、标准演示、预测、挑战与观测记录。
- `/labs/resistors/`：电阻分压台，调阻分压、负载分流、功率账本与对照导出。
- `/labs/capacitors/`：电容时间台，充电/开路保持/放电、双曲线、时间常数与储能对照。
- `/labs/circuits/`：电路接线工坊，支持六端口自由接线、串并联、断灯挑战、内阻功率账本和两组记录导出。
- `/labs/interference/`：双源波纹，含静点任务、可移动探针、分量与合成曲线、两组条件恢复和 CSV 导出。
- `/labs/area/`、`/labs/sections/`、`/labs/orbit/`、`/labs/three-body/`、`/labs/bridge/`、`/labs/gears/`：六个独立操作台。
- `/about/`：学习方式、科学模型与来源说明。

站名暂用“科学探索实验室”。四个空间共140个可用实验，本次每个空间新增20项，共80项。全部实验提供联动的二维证据与可旋转三维观察；平面实验的三维装置与显示厚度有明确说明。品牌、域名与后续实验选题可以继续调整。

## 目录

- `src/data/labs.ts`：空间和实验元信息，首页计数与目录均从这里生成。
- `src/layouts/`、`src/components/`：主站布局、仪器示意与实验卡片。
- `src/lib/stem-lab/`：浮力和单摆纯物理模型。
- `src/lib/exploration/`：几何、轨道、三体、桁架、齿轮、重心与波纹叠加纯模型。
- `src/scripts/exploration/`：实验的 SVG / Canvas 交互与动画时钟。
- `src/scripts/spatial/`：共享三维视角、生命周期和透镜/纸带/重心/月相场景。
- `src/scripts/stem-lab/`：三维场景、控件和教学交互。
- `tests/`：迁移并重新验证的模型测试。
- `scripts/`：主站与140个实验的浏览器验收。
- `doc/`：交接、实验操作与项目搭建记录。
- `bak/`：只读参考资料，不参与构建、类型检查或版本提交。

首页不加载 Three.js，完整场景在进入实验页后加载。构建为静态站，可将 `dist/` 部署到支持静态文件的托管平台；域名确定前不设置虚假的 canonical / sitemap 地址。

项目的实现取舍与验收记录见 [搭建记录](doc/project-setup.md)，实验说明见 [浮力](doc/buoyancy-lab.md) 与 [单摆](doc/pendulum-lab.md)。

六个新增实验的文档：[需求](doc/exploration-requirements.md)、[设计](doc/exploration-design.md)、[接口](doc/exploration-interfaces.md)、[用户操作](doc/exploration-user-guide.md)、[验收](doc/exploration-validation.md)。新增实验使用 SVG，无 WebGL 也可互动。

六实验教学改进：[需求、设计与接口](doc/experiment-learning-design.md)、[验收记录](doc/experiment-learning-validation.md)。新增标准演示、公式代入和实时数据，数学操作可分步引导，桥梁选杆查看与拆除分开。

透镜成像与短探索路线：[需求/设计/接口](doc/lens-imaging-design.md)、[操作指南](doc/lens-imaging-user-guide.md)、[验收](doc/lens-imaging-validation.md)。

三维内容创作与光学重做：[需求与设计](doc/spatial-labs-design.md)、[接口](doc/spatial-labs-interfaces.md)、[操作指南](doc/spatial-labs-user-guide.md)、[验收](doc/spatial-labs-validation.md)。

重心与稳定：[需求](doc/balance-requirements.md)、[设计](doc/balance-design.md)、[接口](doc/balance-interfaces.md)、[操作](doc/balance-user-guide.md)、[验收](doc/balance-validation.md)。月相与日月食已完成，近期实验已进行一轮共同体验审阅。

月相与日月食：[需求](doc/moon-requirements.md)、[设计](doc/moon-design.md)、[接口](doc/moon-interfaces.md)、[操作](doc/moon-user-guide.md)、[验收](doc/moon-validation.md)。NASA 纹理署名见 [素材清单](public/textures/astronomy/CREDITS.md)。

近期四节实验的共同体验改进：[审阅与后续优先级](doc/recent-labs-experience-review.md)。手机离开画面调参数时可见实时观察条并一键回看；三维标签统一提高可读性。

学生模拟反馈驱动的打磨：[后续计划](doc/student-feedback-work-plan.md)、[首次任务交付](doc/first-task-polish.md)。新实验：[双源波纹操作指南与验证](doc/wave-interference-user-guide.md)、[电路接线工坊](doc/circuit-wiring-user-guide.md)。后续创作：[GitHub 借鉴与新实验路线](doc/new-experiment-creation-roadmap.md)。

北京几何首期已实现：[四实验操作、边界与验收](doc/geometry-studios-user-guide.md)。新增 `/labs/reflection/`、`/labs/circle-angles/`、`/labs/triangle-rigidity/`、`/labs/ellipse-string/`，支持受约束拖点、辅助线、反例、一般论证和证据导出。课程主题已标注，具体北京教材与真题对应待教师核对。

四空间升级设计依据（40项已实现）：[40项实验与实验室定位](doc/four-labs-upgrade-plan.md)、[首批8项开发规格](doc/four-labs-first-batch-spec.md)、[课程与期刊/GitHub来源核查](doc/four-labs-upgrade-references.md)。

四实验室完整升级：[40项操作与交付记录](doc/four-labs-expansion-delivery.md)、[总规划](doc/four-labs-upgrade-plan.md)、[来源核查](doc/four-labs-upgrade-references.md)。新增页支持独立任务、两组证据、CSV、二维/三维降级与手机操作；`npm run test:browser:expansion`运行完整新增验收。

40项逐个打磨：[改进清单、标杆与截图验收](doc/forty-experiments-polish-delivery.md)。增加专属装置、80组探索情景、实时观察反馈、手机调参观察窗与A/B画面记录；`npm run test:browser:experience-polish`复验逐项体验。

80项新增与全站双视图交付详见 [交付矩阵与验收记录](doc/eighty-experiments-delivery.md)。运行 `npm run test:browser:eighty` 可复查新增80项和原有双视图联动。

实验体验的四层验收与全站风险筛查见 [执行方案](doc/experiment-experience-acceptance-plan.md)和[实施记录](doc/experiment-experience-implementation.md)。

全量体验修复记录：[60条巡检线索逐项闭环](doc/experiment-experience-closure.md)。真实学生试用与教师复核安排在推广反馈阶段，不作为本轮产品修复门禁。

```sh
npm run test:browser:response-closure  # 参数扫描、离散状态、三维联动与手机回归
# 完成全量巡检后生成原始线索闭环记录（保留原报告）
node --experimental-strip-types scripts/close-experience-findings.mjs
```
