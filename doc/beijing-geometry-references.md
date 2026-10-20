# 几何实验室参考资料核查记录

核查日期：2026-10-16。配套[需求规划](beijing-geometry-lab-plan.md)。本轮通过公开HTTP页面、GitHub API、README和许可文件研究资料；未克隆或运行第三方工程，未对在线绘图产品做完整操作验收。原始抓取保存在本次会话临时目录，下面保留可再次访问的来源及结论。

## 1. 官方课程与北京入口

| 来源 | 本轮取得的内容 | 结论边界 |
| --- | --- | --- |
| [教育部2022年义务教育课标通知](https://www.moe.gov.cn/srcsite/A26/s8001/202204/t20220420_619921.html) | 正文及数学附件入口，注明2022年5月9日版本为准 | 已确认发布依据；数学PDF下载成功但为扫描内容，未完成正文逐条核对 |
| [2022年数学课标附件](https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220510531636118932.pdf) | 下载成功，文本提取仅有分页符 | 不引用未经阅读确认的页码与条款 |
| [教育部高中课标通知](https://www.moe.gov.cn/srcsite/A26/s8001/202006/t20200603_462199.html) | 2017年版2020年修订通知及附件压缩包链接 | 未逐页核查数学附件；不据此断言2026年各届唯一适用版本 |
| [北京教育考试院](https://www.bjeea.cn/) | 官网首页和中招/高中学考/高考导航 | 未完成近年试卷收集与频率分析 |
| [国家教材平台](https://basic.smartedu.cn/tchMaterial) | 页面标题，动态应用壳 | 未取得目标学校的教材版本与完整章节 |

## 2. 网站核查

| 网站 | 本轮访问结果 | 采用程度 |
| --- | --- | --- |
| [geogebra](https://www.geogebra.org/geometry) | 页面标题、语言与应用入口 | 功能标杆；未实时作图 |
| [desmos](https://www.desmos.com/geometry) | 页面标题与Loading应用壳 | 候选产品；交互待实操 |
| [mathigon](https://mathigon.org/course/euclidean-geometry) | 取得Euclidean Geometry课程正文，包含半圆直角探究、证明、作图和折纸目录 | 学习节奏与题型设计参考，非内容复制 |
| [polypad](https://polypad.amplify.com/) | 官网介绍虚拟操作材料、3D多面体、活动分享与教师功能 | 虚拟实物与自由探索参考；宣传能力未逐项实测 |
| [cindyjs](https://cindyjs.org/) | 官网介绍CindyScript、构造、图库、Apache-2.0代码许可与网站CC-BY-SA 4.0标记 | 可进入技术候选；网站与库许可分开 |
| [jsxgraph](https://jsxgraph.org/wp/) | 官网列几何/曲线/多触控/可访问性与LGPL或MIT双许可 | 可进入技术验证；无需据此假定所有可访问性已自动实现 |
| [geometryexpressions](https://www.geometryexpressions.com/) | 官网介绍Geometry Expressions、GXWeb与GenerativeGX | 后期数形结合参考 |
| [geogebra_license](https://www.geogebra.org/license) | 取得官方许可正文，非商业与商业用途区分明确 | 整套软件/素材引用需核对适用协议，仓库元数据不能替代许可正文 |
| [cabri](https://cabri.com/en/) | 取得Cabri II Plus、Cabri 3D、Cabri Express产品介绍 | 课堂工具设计参考 |
| [euclid_actual](https://mathcs.clarku.edu/~djoyce/elements/Euclid.html) | 取得欧几里得传记正文，说明后世资料与历史不确定性 | 历史素材参考；命题入口另列于主文档 |
| [circles_mathigon](https://mathigon.org/course/circles) | 取得圆课程正文与圆定理、圆内接多边形、圆锥曲线目录 | 圆实验与内容组织参考 |
| [phet_area](https://phet.colorado.edu/en/simulations/area-builder) | 取得Area Builder页面标题与站点内容 | 面积/周长反馈参考，未操作模拟 |

## 3. GitHub核查

下列push日期仅记录API返回值，不代表质量或持续维护承诺；库许可也不自动授权示例中的第三方内容。

| 仓库 | API最近push | README/许可核对 |
| --- | --- | --- |
| [jsxgraph/jsxgraph](https://github.com/jsxgraph/jsxgraph) | 2026-10-15 | README双许可LGPL或MIT；LICENSE.MIT正文另行读取，允许按MIT选择路径使用。API只识别LGPL-3.0。 |
| [CindyJS/CindyJS](https://github.com/CindyJS/CindyJS) | 2026-10-14 | README与LICENSE均Apache-2.0；官网说明CindyScript与构造能力。 |
| [geogebra/geogebra](https://github.com/geogebra/geogebra) | 2026-10-15 | README说明镜像并要求查看官网许可；API license=null。 |
| [mathigon/textbooks](https://github.com/mathigon/textbooks) | 2025-02-25 | README写All rights reserved；未取得明确可复用许可，API license=null。 |
| [phetsims/area-builder](https://github.com/phetsims/area-builder) | 2026-10-09 | README明确旧仓库不再维护、迁至尚未公开monorepo；archived=false不改变该说明。 |
| [dgpad/dgpad](https://github.com/dgpad/dgpad) | 2018-04-25 | API返回仓库存在，但未取得可用README/许可正文；不列首期实现候选。 |
| [mathigon/euclid.js](https://github.com/mathigon/euclid.js) | 2025-02-12 | README与LICENSE为MIT；不可变几何对象、交点与SVG/Canvas工具，不是完整约束引擎。 |

JSXGraph MIT原文：[LICENSE.MIT](https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT)。CindyJS：[LICENSE](https://github.com/CindyJS/CindyJS/blob/master/LICENSE)。Mathigon几何库：[LICENSE](https://github.com/mathigon/euclid.js/blob/master/LICENSE)。正式引入前锁定所用版本/commit并核对文件。

`mathigon/euclid`与`mathigon/polypad`本轮返回404；前者由textbooks README定位到真实仓库`mathigon/euclid.js`。后者没有据此认定Polypad不存在，只是不列出猜测的开源仓库。

## 4. 书目与未取得完整正文的资料

| 来源 | 本轮结果 | 规划中的处理 |
| --- | --- | --- |
| Princeton《How to Solve It》书目入口 | 浏览器校验页 | 保留已知书目推荐，版次与章节待核 |
| AMS《Geometry Revisited》书目入口、MAA书评 | 浏览器校验页 | 保留作者与主题推荐，不声称读到书目正文 |
| Harvard《Measurement》书目入口 | 空响应 | 保留推荐，中文版本/书目字段待核 |
| Hilbert/Cohn-Vossen《Geometry and the Imagination》 | 辅助百科请求超时 | 仅列通行书目与检索入口，不编造本次访问内容 |
| Geometry Unbound作者站 | Not Acceptable访问限制页 | 不进入首期核心书单 |
| Cut-the-Knot几何页 | 响应编码解码失败 | 本轮不据此作内容结论 |
| 3Blue1Brown旧线性代数课程路径 | 返回Not Found | 不列为已核验几何课程来源 |
| DGPad官网 | 空响应 | 保留历史线索，不作为可用性已验证的网站 |
| Bing的北京考试与高中课标限定域名检索 | 页面返回无相关结果 | 改为直接核对教育部与北京考试院，不推断公开资料不存在 |

## 5. 下一轮资料研究

1. 确认目标教材后读取合法教材/教参目录与正文，补课标条目、章节和适用届别。
2. 从可追溯公开题源建立18题启动样本；记录题目条件与分支，不先贴热门/高频标签。
3. 实操GeoGebra、Desmos、Polypad的各一个代表几何活动，以及JSXGraph/CindyJS示例，记录触屏、键盘和加载情况。
4. 通过出版社或图书馆补核书籍版次、中文译名、ISBN与实际引用章节。
5. 将来源与实验内容卡关联，区分“事实来源、数学依据、交互启发、代码依赖、素材许可”。
