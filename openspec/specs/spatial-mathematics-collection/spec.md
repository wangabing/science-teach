# spatial-mathematics-collection Specification

## Purpose
提供10项立体几何、数形结合、概率和经典数学实验，以约束构造、可见不变量和反例支持推理。 支持中国初高中知识主题的自主探索与课堂演示，并以逐项模型和浏览器验收保证操作可复现；不将工程测试等同于教材认证或真实教学效果验证。

## Requirements
### Requirement: M01 折起立方体：六个面，真能合上吗？
The experiment SHALL implement the following interaction and evidence: 选展开图、逐铰链折叠，跟踪面名与法向. It MUST respect these model limits and checks: 穷举六连方并验证闭合；11种有效展开图按平面旋转/镜像去重；碰撞与最终重叠分开. Its content SHALL identify 初中/空间拓展；K1、G1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M01 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M02 等高切片：外形不同，体积能一样吗？
The experiment SHALL implement the following interaction and evidence: 同高度取截面，同步面积与体积累计. It MUST respect these model limits and checks: Cavalieri原理；只有所有对应截面面积相同才推出等体积，少数切片不是证明. Its content SHALL identify 高中/经典拓展；K2、T2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M02 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M03 空间垂线：看上去垂直，真的垂直吗？
The experiment SHALL implement the following interaction and evidence: 旋转视角、拖空间点、构造垂足，联动向量. It MUST respect these model limits and checks: 点积/投影；投影直角不推出空间垂直；零向量与平行异面情况独立处理. Its content SHALL identify 高中；K2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M03 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M04 切圆锥：圆、椭圆、抛物线如何相遇？
The experiment SHALL implement the following interaction and evidence: 转切平面，连动真实截线与平面坐标；选看Dandelin球. It MUST respect these model limits and checks: 双圆锥分类、平面过顶点退化；不把三维圆的投影视觉压扁等同于真实椭圆截面. Its content SHALL identify 高中/拓展；K2、T2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M04 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M05 动点函数：图形的面积怎样变成一条曲线？
The experiment SHALL implement the following interaction and evidence: P沿矩形边界走，建立路程s与三角形面积A(s). It MUST respect these model limits and checks: 分段一次函数；折点来自路径段切换，端点/方向明确；不能用拟合曲线替代解析关系. Its content SHALL identify 初中数形结合/高中回顾；K1/K2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M05 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M06 单位圆示波台：圆怎么画出正弦波？
The experiment SHALL implement the following interaction and evidence: 点绕单位圆，投影与角度、函数图像同步. It MUST respect these model limits and checks: 弧度、正弦/余弦、相位与周期；角度单位切换一致，参数角与几何方向明确. Its content SHALL identify 高中；K2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M06 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M07 切线显微镜：把割线缩小，会留下什么？
The experiment SHALL implement the following interaction and evidence: 收拢两个点，比较割线斜率与导数. It MUST respect these model limits and checks: 极限直观；光滑函数与绝对值函数在零点不可导反例，h=0不能直接用0/0计算. Its content SHALL identify 高中；K2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M07 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M08 高尔顿钉板：随机落下，为什么出现山峰？
The experiment SHALL implement the following interaction and evidence: 固定种子重复投球，比较样本数、偏置与理论柱状图. It MUST respect these model limits and checks: 先用独立伯努利路径/二项分布；动画钉板不是已验证的刚体碰撞；样本分布不必精确等理论. Its content SHALL identify 初中统计/高中概率；K1/K2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M08 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M09 多面体侦探：顶点、棱、面为什么差出2？
The experiment SHALL implement the following interaction and evidence: 标记并计数、展成图、加入有孔反例. It MUST respect these model limits and checks: 凸多面体V−E+F=2；有孔表面需合适胞腔分解，不能对任意网格机械套公式. Its content SHALL identify 经典拓展；T2 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M09 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: M10 球堆仓库：同样的空间，怎样装更多球？
The experiment SHALL implement the following interaction and evidence: 对比简单立方、面心立方/六方密堆，观察层与晶胞. It MUST respect these model limits and checks: 无限等球密堆密度π/√18；有限箱体有边界效应，模拟不能证明Kepler猜想. Its content SHALL identify 高中空间/经典拓展；J3 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: M10 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

