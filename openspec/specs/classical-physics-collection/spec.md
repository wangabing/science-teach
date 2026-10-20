# classical-physics-collection Specification

## Purpose
提供10项可重复测量的经典力学、电磁、热学统计与光学实验，明确解析规律、守恒判据与适用边界。 支持中国初高中知识主题的自主探索与课堂演示，并以逐项模型和浏览器验收保证操作可复现；不将工程测试等同于教材认证或真实教学效果验证。

## Requirements
### Requirement: P01 伽利略斜面：重一点，会先到吗？
The experiment SHALL implement the following interaction and evidence: 释放无转动滑块，等时打点，比较质量与坡度. It MUST respect these model limits and checks: 牛顿方程、动/静摩擦分开；无摩擦时a=g sinθ，与质量无关。明确滑块不是滚动球. Its content SHALL identify 初中直观/高中定量；K1/K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P01 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P02 碰撞轨道：速度没了，动量去哪了？
The experiment SHALL implement the following interaction and evidence: 设置两车质量速度，测碰前/后动量和动能. It MUST respect these model limits and checks: 一维碰撞、恢复系数0≤e≤1；动量守恒，非弹性碰撞机械能损失可见；不把损失叫消失. Its content SHALL identify 高中；K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P02 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P03 共振台：轻推，为什么越摆越大？
The experiment SHALL implement the following interaction and evidence: 扫驱动频率，比较阻尼和稳态振幅/相位. It MUST respect these model limits and checks: 受迫阻尼振子；有阻尼时峰值位置不必等于固有频率。与已有自由单摆区分. Its content SHALL identify 高中/拓展；K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P03 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P04 电场探针：看不见的力指向哪？
The experiment SHALL implement the following interaction and evidence: 放两源电荷、移动试探点，画电势与电场. It MUST respect these model limits and checks: 库仑叠加；场线不是粒子轨迹；点源奇点设明确排除半径，不用静默软化改变定律. Its content SHALL identify 高中；K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P04 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P05 法拉第线圈：磁铁停下，电流还在吗？
The experiment SHALL implement the following interaction and evidence: 移磁铁、反向/调速/开路，比较磁通与感应电动势. It MUST respect these model limits and checks: 法拉第与楞次定律；匀定磁通时emf=0，开路可有emf但电流为0；注明准静态近似. Its content SHALL identify 高中/初中现象；K1/K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P05 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P06 磁场分选器：同样快，谁转得更弯？
The experiment SHALL implement the following interaction and evidence: 发射带电粒子，调q/m、速度、B，比较圆轨道. It MUST respect these model limits and checks: 非相对论洛伦兹力，v⊥B时r=mv/abs(q)B；磁力不做功，B=0/q=0为直线. Its content SHALL identify 高中；K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P06 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P07 焦耳量热：电流的热账本
The experiment SHALL implement the following interaction and evidence: 接电阻加热同一杯水，比较电流、时间与温升. It MUST respect these model limits and checks: I²Rt、热容与可选散热；能量输入=内能增加+散失；不复刻已有分压台. Its content SHALL identify 初中/高中；K1/K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P07 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P08 气体活塞：同样加热，为什么升温不同？
The experiment SHALL implement the following interaction and evidence: 切换定容/准静态定压，比较p-V图和热/功/内能. It MUST respect these model limits and checks: 理想气体与第一定律，Q=ΔU+W；单原子模型注明Cv=3R/2；不把准静态当任意快速活塞. Its content SHALL identify 高中；K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P08 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P09 布朗显微镜：乱走，也有可测的规律？
The experiment SHALL implement the following interaction and evidence: 固定种子，多粒子/多次重复，比较时间与均方位移. It MUST respect these model limits and checks: 二维随机过程〈r²〉=4Dt；单条轨迹不必单调；不是液体分子的真实显微照片. Its content SHALL identify 高中拓展；J1、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P09 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

### Requirement: P10 光的转弯：怎样把光留在水里？
The experiment SHALL implement the following interaction and evidence: 调界面两侧折射率与入射角，找全反射边界. It MUST respect these model limits and checks: Snell定律；只有高n到低n有临界角；如显示强度需偏振/Fresnel能量一致. Its content SHALL identify 初中现象/高中；K1/K2、T1 as topic-level guidance and reference provenance, without claiming unverified textbook alignment.

#### Scenario: P10 independent exploration
- **WHEN** a student changes the defined inputs and performs the experiment
- **THEN** the distinctive construction and measurements recompute under the model constraints, invalid/degenerate states are explained, and a separate reasoning/counterexample route remains available

