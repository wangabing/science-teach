# 四实验室升级：课程、期刊与GitHub核查记录

核查日期：2026-10-17。配套[总规划](four-labs-upgrade-plan.md)与[首批规格](four-labs-first-batch-spec.md)。本轮进行了实际HTTP访问、GitHub API/README/许可读取和Crossref论文书目信息/摘要读取；**未克隆运行外部产品，未完成全部论文全文、国内教材章节或北京真题核查**。下表区分证据类型；访问成功也可能只是验证页。

## 1. 课程来源

| 代号 | 来源 | 本轮取得的证据 | 使用边界 |
| --- | --- | --- | --- |
| K1 | [教育部义务教育课程方案和课程标准（2022年版）通知](https://www.moe.gov.cn/srcsite/A26/s8001/202204/t20220420_619921.html) | 正文，数学/物理附件入口，数学2022年5月9日版本说明；[物理PDF](https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582357585169.pdf)下载成功 | PDF文本提取未得到有效正文，未逐页阅读；数学正文逐条核查也未完成。不写未经核实的条款页码 |
| K2 | [教育部高中课程方案与课程标准（2017年版2020年修订）通知](https://www.moe.gov.cn/srcsite/A26/s8001/202006/t20200603_462199.html) | 正式发布页及附件入口 | 未核对所有后续修订和2026年学校适用届别；主题映射暂不认证为指定教材同步 |
| K3 | [北京教育考试院](https://www.bjeea.cn/)、[国家中小学智慧教育平台教材入口](https://basic.smartedu.cn/tchMaterial) | 沿用上一轮权威入口研究记录 | 本轮未收集新试卷/目标学校版本，未统计命题频率。不虚构北京真题题号 |

数学/物理基础概念按通行课程体系提候选映射，具体“必修/选择性必修/某年级”标签要与实际教材核对。统计力学、相对论、天体物理、工程结构不是一概初高中必修，按先修知识分层标注。

## 2. 期刊依据：从论文到可教的问题

Crossref元数据用于确认标题、DOI、刊物与年份；取得摘要时可以确认其研究范围，不等于核查全文方法。本文没有把论文结论直接等同于本站模型的验证。对基础实验，课程标准与权威教材承担公式依据；一流期刊为前沿选题和经典理论来源提供补充。

| 代号 | 核对的论文与刊物 | 本轮阅读范围 | 对应实验与使用方式 |
| --- | --- | --- | --- |
| J1 | Einstein，关于悬浮粒子热运动的论文，*Annalen der Physik*，1905；[10.1002/andp.19053220806](https://doi.org/10.1002/andp.19053220806) | Crossref标题/刊物/年份 | P09布朗运动的经典来源；随机模型和均方位移另用独立数学判据验证 |
| J2 | Lorenz，*Deterministic Nonperiodic Flow*，*Journal of the Atmospheric Sciences*，1963；[DOI](https://doi.org/10.1175/1520-0469%281963%29020%3C0130%3ADNF%3E2.0.CO%3B2) | Crossref书目 | C01及既有三体的初态敏感性叙事参考；这是流体低维系统论文，不当作本站某组三体初态的混沌证明 |
| J3 | Hales，*A proof of the Kepler conjecture*，*Annals of Mathematics*，2005；[10.4007/annals.2005.162.1065](https://doi.org/10.4007/annals.2005.162.1065) | Crossref书目 | M10球堆：解释密堆与有限箱体差异；学生操作不是完整证明，实施前核对论证综述 |
| J4 | Atwater等，*Materials challenges for the Starshot lightsail*，*Nature Materials*，2018；[10.1038/s41563-018-0075-8](https://doi.org/10.1038/s41563-018-0075-8) | Crossref精确标题搜索取得书目；未取得全文 | C05的材料、热负荷与工程设想入口；首版低速太阳光压模型不代表Starshot系统实现 |
| J5 | Einstein，*Zur Elektrodynamik bewegter Körper*，*Annalen der Physik*，1905；[10.1002/andp.19053221004](https://doi.org/10.1002/andp.19053221004) | Crossref书目 | C03有限光速/因果，C04狭义相对论固有时；超光速文明通信不属于已证实结论 |
| J6 | EHT Collaboration，*First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole*，*The Astrophysical Journal Letters*，2019；[10.3847/2041-8213/ab0ec7](https://doi.org/10.3847/2041-8213/ab0ec7) | Crossref书目与摘要，读到射电干涉重建、暗影与亮环及Kerr相容范围；出版社页面是Captcha | C06连接观测证据与弯光；简化Schwarzschild演示不能宣称重现整套EHT成像/吸积盘模拟 |
| J7 | LIGO/Virgo，*Observation of Gravitational Waves from a Binary Black Hole Merger*，*Physical Review Letters*，2016；[10.1103/PhysRevLett.116.061102](https://doi.org/10.1103/PhysRevLett.116.061102) | Crossref书目 | C09引力波与啁啾选题；模型实现需补波形/数据许可、近似阶数与独立基准，不直接下载论文图做背景 |
| J8 | Planck Collaboration，*Planck 2018 results. VI. Cosmological parameters*，*Astronomy & Astrophysics*，2020；[10.1051/0004-6361/201833910](https://doi.org/10.1051/0004-6361/201833910) | Crossref标题/副标题/摘要；正文站403 | C10温度/偏振/透镜信息与模型参数的研究入口；不能把噪声示意图当Planck实测或智子证据 |
| J9 | Silverberg等，*Using origami design principles to fold reprogrammable mechanical metamaterials*，*Science*，2014；[10.1126/science.1252876](https://doi.org/10.1126/science.1252876) | Crossref书目与编辑摘要，包含单元折叠后软/硬状态变化 | S09几何与材料响应联动的研究启发；刚性折痕动画不能直接导出材料刚度 |
| J10 | Freeman等，*Active learning increases student performance in science, engineering, and mathematics*，*PNAS*，2014；[10.1073/pnas.1319030111](https://doi.org/10.1073/pnas.1319030111) | Crossref书目与摘要；研究讨论大学STEM主动学习 | 支持主动操作与反馈的设计方向，不外推为本站对北京中学生的已验证教学效果，也不照搬论文效应量作为产品目标 |

没有把所有期刊笼统称为“世界顶刊”：Science、Nature Materials、Annals、PRL以及专业天文期刊各承担相应研究依据，历史经典论文也保留其真实发表背景。选择标准是与实验问题和证据相关，而非刊名装饰。

本轮纠正一条猜测的光帆DOI：`10.1038/s41566-018-0177-8`返回404，已排除，改用精确标题检索确认的J4。Crossref部分请求曾429，后顺序重试取得J5/J6/J8，未把429写成论文不存在。

## 3. 权威教材与机构科普

| 代号 | 来源 | 核查与用途 |
| --- | --- | --- |
| T1 | [The Feynman Lectures on Physics，Caltech](https://www.feynmanlectures.caltech.edu/) | 经典力学、电磁、热学讲解入口；本轮返回403 Cloudflare校验，未取得正文。未逐章核对P01–P10所有推导，开发前按主题补章节与引用位置 |
| T2 | [Euclid's Elements，Clark University在线整理](https://mathcs.clarku.edu/~djoyce/elements/elements.html)；Hilbert/Cohn-Vossen，*Geometry and the Imagination* | Elements引言/目录页本轮200且取得标题；其余书目未逐章读取。古典几何和空间思维阅读入口；Cavalieri、圆锥曲线、拓扑的现代推导需另外核查具体章节，不把所有内容归于《几何原本》 |
| T3 | [OpenStax Astronomy 2e](https://openstax.org/details/books/astronomy-2e) | 天体观测、恒星、引力和宇宙学教材入口；本轮仅取得OpenStax应用页面，未取得教材正文或核对所有章节 |
| T4 | Gere/Goodno，*Mechanics of Materials*；Hibbeler，*Structural Analysis*；传热学常用教材 | 梁、索、结构平衡与热阻的内容作者参考；书目为通行参考，本轮未取得出版社正文，版次、公式条件和参数来源须实施前补核 |
| N1 | [NASA Advanced Composite Solar Sail System](https://www.nasa.gov/mission/acs3/) | 已读任务页正文：太阳帆利用阳光压力推进，是现实技术验证；没有据此宣称星际激光光帆已落地 |
| N2 | [NASA Webb Orbit](https://science.nasa.gov/mission/webb/orbit/) | 已读轨道与拉格朗日点介绍；页面科普中的稳定说法不能替代CR3BP的线性稳定性判据，L1/L2需明确不稳定 |
| N3 | [JPL Deep Space Network](https://www.jpl.nasa.gov/missions/dsn/) | 本轮访问403，保留为深空通信机构入口；链路预算、噪声与太阳广播的具体公式须实施前补核，不据此认证小说放大机制 |

现代教材/图像/译文分别有许可，定律可原创讲解不代表出版社图或第三方翻译可搬用。历史引子优先讲问题和方法，不写未经核对的引语、传奇现场或单一发明者归功。

## 4. GitHub与产品核查

| 代号 | 仓库/产品 | 实际读取与状态（2026-10-17） | 借鉴与限制 |
| --- | --- | --- | --- |
| G1 | [OrigamiSimulator](https://github.com/amandaghassaei/OrigamiSimulator)、[在线产品](https://origamisimulator.org/) | 官网HTML、GitHub API、README、MIT正文；README说明同时折叠、迭代小位移及应变显示；未运行在线折叠 | 研究二维折痕/三维形状、调参/测应变的连续工作流。代码MIT不自动覆盖模型库内全部第三方图形 |
| G2 | [ShellFormFinding](https://github.com/amandaghassaei/ShellFormFinding)、[作者项目说明](https://amandaghassaei.com/projects/shell_form_finding/) | 项目正文、README与API；代码许可API为空，license入口未取得正文 | 官网讲纯受压设计，README讲预载受拉找形；二者通过悬挂模型倒置关联，不能混称刚体坍塌模拟。借鉴支座/载荷编辑与平衡反馈，源码不默认可复用 |
| G3 | [LinkageOptimization](https://github.com/amandaghassaei/LinkageOptimization) | 仓库API存在，最后push为2015年；README/许可API未取得内容 | 连杆产品研究线索，不能据此宣称是已验证可用或持续维护的优秀产品；不进入首批依赖 |
| G4 | [Matter.js](https://github.com/liabru/matter-js) | API、README、MIT正文 | 2D刚体候选；不能当作梁挠度、应力、热传导或材料破坏的求解器 |
| G5 | [Rapier现主仓库](https://github.com/dimforge/rapier)、[Typescript入口](https://github.com/dimforge/rapier/tree/master/typescript) | 现仓库API、README、Apache-2.0正文；[旧rapier.js](https://github.com/dimforge/rapier.js)已archived，description指向迁移 | 后续刚体/关节候选；采用前锁实际包版本、WASM加载、低端设备和状态可复现性，不用旧仓库作为新依赖依据 |
| G6 | [Box2D](https://github.com/erincatto/box2d) | API存在、描述为游戏用2D物理引擎、API识别MIT；未读许可文件正文 | 只作为技术参考；正式复用前补实际版本与许可正文。C/WASM集成成本另评估 |

读取许可正文的文件证据（GitHub blob SHA）：G1 LICENSE `2949ddd80291b8580989ae778c527d06eff1ffe5`；G4 LICENSE `0e1ed72ff0030ea67071620dc7466093da8ff047`；G5 LICENSE `97f4383a35a48ddd50566a879e836491d2fe9b75`。这是文件证据，不代表已经锁定依赖commit或包版本。

raw.githubusercontent.com多次访问失败后改用GitHub contents API读取README/许可并解码，没有把失败请求当作不存在。桥梁关键词搜索返回了界面练习项目和低相关条目，未列入“优秀产品”。没有克隆、导入第三方代码或素材。

## 5. 从研究到开发的补核清单

1. 每项补课程条目/实际教材先修知识；当前用主题映射，不假定北京统一教材。
2. 给基础模型补教材具体章、符号/单位、近似条件；给前沿实验补原文方法或可公开验证的综述。
3. 需要真实数据时记录出处、许可、单位、校准和处理步骤；合成数据就地标注。
4. 实操每个参考产品至少一个代表任务，检查触屏、键盘、无脚本/降级与国内网络；本轮README研究不能代替该步骤。
5. 需要代码复用时锁版本、逐文件核许可与依赖；没有许可的作品只借鉴思路。
6. 由教师和领域审阅者分别检查“适合学生学什么”与“科学模型是否说得过头”。建立审阅状态，不用刊物品牌代替评审。

补充检索：本轮尝试限定教育部域名检索后续高中课标修订，搜索返回低相关内容，教育部分类页未取得可用列表；未据此断言不存在新修订。最新适用版仍需按目标届别从学校/教育主管部门核对，2020发布页仅作为已确认来源。
