# 每空间20项新增与140项双视图交付

> 质量更正（2026-10-17）：本页保留上一版交付记录。此前的技术检查漏掉了皮带装置缺少真实运动、历史内容不足、部分控制与画面脱节等问题，不能作为产品体验已达标的依据。本次重新检查的修复、逐项证据和验证范围见[实验质量复核](experiment-quality-repair.md)。

本次在四个空间各增加20项，共新增80项，保留原60项，目录合计140项：物理37、数学与几何37、宇宙与三体33、工程与建造33。工程空间以“材料、支座与载荷约束下的设计取舍”为定位，连接承重、机构和建筑环境。

## 体验标准

每个新增实验都有独立科学模型与主题装置、可控制的变量、两组单变量情景、同状态二维/三维视图、实时读数、必要的证据曲线、历史背景、来源和模型边界。操作采用“先看现象—只改一个条件—留下两组记录—说明理由”的顺序；情景按钮、参考状态和恢复记录不能冒充独立完成。

二维优先保留标注、测量和论证，三维支持旋转、缩放、方向键和相机预设。新增实验使用同一装置构造器同时生成SVG和空间几何，旧实验读取实际构造状态；没有把二维截图贴到三维平面上。平面数学、光路和电路采用可旋转的平面构造或仪器台，显示厚度、曲线高度、矢量长度有示意说明，不作为额外测量量。三维观察辅助理解，不改变原有物理模型；长度与角度以二维构造和仪表为准，不从透视图直接量取。

手机320/390px提供可折叠的实时观察窗，调整滑块时保持控件可见。所有新增实验支持撤销、重置、两组装置快照、CSV和无脚本阅读；WebGL失效时保留可操作的二维证据。

## 全站双视图覆盖

| 范围 | 数量 | 二维与三维的对应方式 |
| --- | ---: | --- |
| 本次新增P11–P30、M11–M30、C11–C30、S11–S30 | 80 | 同一次求解产生绘图、空间几何和仪表读数；逐项比较两个情景的数值与几何变化 |
| 上次新增P01–P10、M01–M10、C01–C10、S01–S10 | 40 | 保留已有空间模型，其余从实际矢量装置生成三维构造；补上8项原来只有读数变化的空间测量证据 |
| 面积、截面、轨道、三体、桥梁、齿轮、干涉、电路、电阻、电容、反射、圆周角、三角形锁形、拉线椭圆 | 14 | 新增空间观察台；截面使用真实立方体顶点与切面，干涉使用同一波函数高度场，其余跟随实际SVG构造与变换，电学补充实时电压仪表 |
| 浮力、单摆、透镜、月相、重心、莫比乌斯带 | 6 | 保留原三维装置与二维证据；浮力/单摆新增显式二维切换并保持绘图更新，其他4项复查原有切换与数据联动 |
| 合计 | **140** | 全部保留原路由和操作入口 |

原40项中补齐的测量几何为：P01独立重力与加速度矢量、P07水温柱、C04双时钟、C07潮汐比矢量、C08接收信号包络、C09固定时间窗波形、S04探测位移、S10热流。对数或放大显示均标明含义，失稳/未定义读数不补造数值。伽利略质量对比中，加速度保持不变、重力随质量变化，这是要表达的科学证据。

## 教学组织与来源边界

初中先观察与控制变量，高中再做定量计算、向量与函数论证；狭义/广义相对论、天体测量、材料稳定性和工程模型标为拓展。不能将这些拓展笼统称为北京中高考必修内容。教学衔接沿用[北京几何规划](beijing-geometry-lab-plan.md)和[四空间升级规划](four-labs-upgrade-plan.md)，本轮没有实施北京教师或真实学生复评。

产品借鉴沿用[上一轮逐项打磨记录](forty-experiments-polish-delivery.md)中PhET的控制变量、Polypad的可操作构造、Ray Optics的图线证据和Origami Simulator的空间观察原则；复用设计原则，自行编写模型和界面。本轮未宣称新近实操了所有外部产品或复制其作品。

2026-10-17实际HTTP核查：OpenStax物理卷1/卷2、MathWorld、NASA Science、LibreTexts Engineering Statics均返回200。OpenStax得到应用外壳页面，LibreTexts核查到书籍概览；NASA/MathWorld为资料入口。下面来源是延伸阅读入口，不等于逐篇论文全文审阅、课程认证或作者背书。科学正确性由公式、量纲、已知基准和不变量测试共同验证。

## 80项作品矩阵

表中的情景只改变列出的主变量；其他变量保持参考值。每项页面另有模型边界、反例、独立任务与历史说明。

### 物理：经典理论与实验

| 编号 / 作品 | 核心问题 | 科学依据与条件 | 两组情景 | 阅读入口 |
| --- | --- | --- | --- | --- |
| P11 [抛体发射台](../src/lib/discovery/expansion/physics.ts) · `/labs/projectile-launch/` | 相同速度，哪个角度飞得远？ | x=v cosθ t，y=v sinθ t−gt²/2；R=v²sin2θ/g，T=2v sinθ/g。 真空、平地起落，g=9.8 m/s²；轨迹按当前射程自适应取景。 | 低角度：发射角 30 °；高角度：只改变发射角 60 ° | [OpenStax · Projectile Motion](https://openstax.org/details/books/university-physics-volume-1) |
| P12 [阿特伍德机](../src/lib/discovery/expansion/physics.ts) · `/labs/atwood-machine/` | 只差一点质量，如何慢慢加速？ | a=(m₂−m₁)g/(m₁+m₂)，T=2m₁m₂g/(m₁+m₂)。 轻绳、无摩擦无质量滑轮；两块质量可不同，绳长保持。 | 质量相同：右侧质量 1 kg；右侧更重：只改变右侧质量 2 kg | [OpenStax · Applications of Newton’s Laws](https://openstax.org/details/books/university-physics-volume-1) |
| P13 [圆周运动台](../src/lib/discovery/expansion/physics.ts) · `/labs/centripetal-force/` | 速度翻倍，拉绳要多用多少力？ | aᵣ=v²/r；Fᵣ=mv²/r；T=2πr/v。 水平面匀速圆周运动，竖直支持力平衡重力；箭头仅示意方向。 | 慢速：速率 2 m/s；两倍速率：只改变速率 4 m/s | [OpenStax · Uniform Circular Motion](https://openstax.org/details/books/university-physics-volume-1) |
| P14 [力矩平衡尺](../src/lib/discovery/expansion/physics.ts) · `/labs/torque-balance/` | 更远的位置，能用更小的力吗？ | τ=Fr；静止平衡时F右 r右=20×0.6=12 N·m。 理想无质量杠杆，左侧20 N、力臂0.6 m；右力竖直向下。 | 短力臂：右侧力臂 0.6 m；长力臂：只改变右侧力臂 1.2 m | [OpenStax · Static Equilibrium](https://openstax.org/details/books/university-physics-volume-1) |
| P15 [弹簧能量仓](../src/lib/discovery/expansion/physics.ts) · `/labs/spring-energy-store/` | 多压一倍，能量会多一倍吗？ | E=kx²/2=mv²/2；v=x√(k/m)。 线性弹簧，忽略摩擦；压缩后释放至原长，把弹性势能转为滑块动能。 | 压缩一点：压缩量 0.1 m；压缩两倍：只改变压缩量 0.2 m | [OpenStax · Potential Energy](https://openstax.org/details/books/university-physics-volume-1) |
| P16 [文丘里管](../src/lib/discovery/expansion/physics.ts) · `/labs/venturi-tube/` | 流得更快的地方，压力更高吗？ | A₁v₁=A₂v₂；p₂=p₁+ρ(v₁²−v₂²)/2，ρ=1000 kg/m³。 水平、稳态、不可压、无黏液体；宽管直径4 cm，宽段表压100 kPa。 | 较宽缩口：窄管直径 3 cm；较窄缩口：只改变窄管直径 2 cm | [OpenStax · Bernoulli’s Equation](https://openstax.org/details/books/university-physics-volume-1) |
| P17 [液柱压力台](../src/lib/discovery/expansion/physics.ts) · `/labs/hydrostatic-pressure/` | 同一深度，容器形状重要吗？ | p表=ρgh，p绝=p大气+ρgh；同一液体同一水平面压强相等。 静止均匀液体，表面承受101325 Pa大气压；探针读表压和绝对压。 | 一米深：探针深度 1 m；两米深：只改变探针深度 2 m | [OpenStax · Pressure in a Fluid](https://openstax.org/details/books/university-physics-volume-1) |
| P18 [双缝光屏](../src/lib/discovery/expansion/physics.ts) · `/labs/young-double-slit/` | 两条缝，为什么不只出现两条亮线？ | Δx=λL/d；I/Imax=cos²(πdy/(λL))。 单色相干光、等强点缝、远场小角近似；包络与真实光强未标定。 | 近双缝：双缝间距 0.2 mm；远双缝：只改变双缝间距 0.4 mm | [OpenStax · Young’s Double Slit Experiment](https://openstax.org/details/books/university-physics-volume-3) |
| P19 [单缝衍射](../src/lib/discovery/expansion/physics.ts) · `/labs/single-slit-diffraction/` | 缝越窄，光为什么散得越开？ | 第一暗纹sinθ=λ/a；中央亮纹宽≈2λL/a；I/I₀=(sinβ/β)²。 单色远场、均匀单缝；暗纹角满足sinθ=λ/a，屏宽用小角近似。 | 宽缝：缝宽 0.2 mm；窄缝：只改变缝宽 0.1 mm | [OpenStax · Single-Slit Diffraction](https://openstax.org/details/books/university-physics-volume-3) |
| P20 [拍频听音台](../src/lib/discovery/expansion/physics.ts) · `/labs/acoustic-beats/` | 两个近似音调，为什么一强一弱？ | sin2πf₁t+sin2πf₂t=2sin[π(f₁+f₂)t]cos[π(f₂−f₁)t]；拍频=∣f₂−f₁∣。 等振幅、同相正弦叠加；波形可视化，不自动播放声音。 | 慢拍：频率差 2 Hz；快拍：只改变频率差 4 Hz | [OpenStax · Beats](https://openstax.org/details/books/university-physics-volume-1) |
| P21 [驻波弦](../src/lib/discovery/expansion/physics.ts) · `/labs/standing-wave-string/` | 一根弦，怎样同时出现几个波腹？ | v=√(T/μ)，fₙ=nv/(2L)，y∝sin(nπx/L)cos(2πfₙt)。 两端固定、理想均匀弦，小振幅；振幅显示不代表实际米数。 | 基频：谐波阶数 1 ；第三谐波：只改变谐波阶数 3  | [OpenStax · Standing Waves](https://openstax.org/details/books/university-physics-volume-1) |
| P22 [多普勒声源](../src/lib/discovery/expansion/physics.ts) · `/labs/doppler-source/` | 靠近的声源，声音为何更尖？ | f观=f源 c/(c−u)，远离取u<0；不是声速本身改变。 静止空气声速340 m/s，观察者静止，声源匀速亚声速运动；向观察者运动为正。 | 接近：接近速度 80 m/s；远离：只改变接近速度 -80 m/s | [OpenStax · Doppler Effect](https://openstax.org/details/books/university-physics-volume-1) |
| P23 [通电导线受力](../src/lib/discovery/expansion/physics.ts) · `/labs/wire-magnetic-force/` | 电流不变，转一下导线会怎样？ | F=BIL sinθ；方向由Iℓ×B确定，θ为导线与磁场夹角。 均匀磁场，直导线有效长度0.2 m；仅计算磁场内部分，箭头示意力方向。 | 平行：电流与磁场夹角 0 °；垂直：只改变电流与磁场夹角 90 ° | [OpenStax · Magnetic Force on a Current-Carrying Conductor](https://openstax.org/details/books/university-physics-volume-2) |
| P24 [理想变压器](../src/lib/discovery/expansion/physics.ts) · `/labs/ideal-transformer/` | 电压升高，功率也凭空增大吗？ | U₂/U₁=N₂/N₁；I₂=U₂/R，U₁I₁=U₂I₂。 理想交流变压器、纯电阻负载；输入为有效值，不适用于直流稳态。 | 等匝：副原匝数比 1 ；两倍匝数：只改变副原匝数比 2  | [OpenStax · Transformers](https://openstax.org/details/books/university-physics-volume-2) |
| P25 [RLC选频台](../src/lib/discovery/expansion/physics.ts) · `/labs/rlc-frequency-selector/` | 哪种频率能最容易通过电路？ | Z=√[R²+(ωL−1/ωC)²]，I=U/Z，f₀=1/(2π√LC)。 串联RLC正弦稳态，电压为有效值；不模拟接通瞬态。 | 低频：驱动频率 50 Hz；接近谐振：只改变驱动频率 160 Hz | [OpenStax · RLC Series Circuits](https://openstax.org/details/books/university-physics-volume-2) |
| P26 [卡诺热机](../src/lib/discovery/expansion/physics.ts) · `/labs/carnot-engine/` | 热机能把所有热量都变成功吗？ | η=1−Tc/Th；W=Qhη，Qc=QhTc/Th，ΔS=Qh/Th−Qc/Tc=0。 可逆理想上限，热库恒温；冷库不得高于热库。温度必须用K。 | 低温冷库：冷库温度 300 K；较热冷库：只改变冷库温度 400 K | [OpenStax · Carnot Cycle](https://openstax.org/details/books/university-physics-volume-2) |
| P27 [混合量热](../src/lib/discovery/expansion/physics.ts) · `/labs/mixing-calorimetry/` | 两杯水混合，温度一定取平均吗？ | m热c(T热−T)=m冷c(T−T冷)；T=(m热T热+m冷T冷)/(m热+m冷)。 同种液态水、隔热、忽略容器热容，无相变；0–90°C范围。 | 等量热水：热水质量 0.5 kg；双份热水：只改变热水质量 1 kg | [OpenStax · Calorimetry](https://openstax.org/details/books/university-physics-volume-2) |
| P28 [导热桥](../src/lib/discovery/expansion/physics.ts) · `/labs/fourier-heat-bridge/` | 厚一倍，热流能少一半吗？ | Q̇=kAΔT/L；T(x)=Th−ΔT·x/L。 一维稳态平板，两端温度固定60°C与20°C，接触与对流热阻忽略。 | 较薄层：导热长度 5 cm；两倍厚度：只改变导热长度 10 cm | [OpenStax · Heat Transfer](https://openstax.org/details/books/university-physics-volume-2) |
| P29 [光电效应](../src/lib/discovery/expansion/physics.ts) · `/labs/photoelectric-effect/` | 更亮的红光，一定能打出电子吗？ | Kmax=max(hc/λ−W,0)，仅hc/λ>W时逸出；截止电压Kmax/e。 理想单光子光电效应，逸出功固定2.3 eV；强度仅以光子通量比例表示，不给未经标定的电流。 | 短波：波长 400 nm；长波：只改变波长 700 nm | [OpenStax · Photoelectric Effect](https://openstax.org/details/books/university-physics-volume-3) |
| P30 [卢瑟福散射](../src/lib/discovery/expansion/physics.ts) · `/labs/rutherford-scattering/` | 原子几乎是空的，为什么还会大角度偏转？ | tan(θ/2)=kZze²/(2Eb)，Z=79，z=2；使用e²/(4πε₀)=1.439964 MeV·fm。 非相对论α粒子散射于固定点状金核，忽略电子屏蔽及核力；轨迹仅示意渐近偏角。 | 远掠：碰撞参数 100 fm；近掠：只改变碰撞参数 20 fm | [OpenStax · Rutherford’s Nuclear Model](https://openstax.org/details/books/university-physics-volume-3) |

### 数学与几何：从构造到论证

| 编号 / 作品 | 核心问题 | 科学依据与条件 | 两组情景 | 阅读入口 |
| --- | --- | --- | --- | --- |
| M11 [勾股面积拼证](../src/lib/discovery/expansion/mathematics.ts) · `/labs/pythagorean-squares/` | 三条边上的正方形，怎样对上面积账？ | c²=a²+b²；边长平方对应正方形面积，数值检验不替代一般证明。 直角三角形，a、b为直角边；三维以等厚薄板表达面积，不把厚度计入面积。 | 三四五：直角边a 3 ；改变一边：只改变直角边a 4  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M12 [三角形重心](../src/lib/discovery/expansion/mathematics.ts) · `/labs/triangle-centroid/` | 顶点移动，三条中线还会相交吗？ | G=(A+B+C)/3；中线分点满足CG:GD=2:1，其中D为AB中点。 A=(−3,0)，B=(3,0)，C=(x,h)，h>0；读数采用坐标单位。 | 向左移动：顶点横坐标 -2 ；向右移动：只改变顶点横坐标 2  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M13 [相似测高](../src/lib/discovery/expansion/mathematics.ts) · `/labs/similarity-shadow/` | 一根标杆，怎样量出高塔的高度？ | H/S塔=h/s杆=tanα；H=S塔 tanα。 水平地面、平行阳光，标杆高1 m，太阳高度角相同；不计算地球曲率。 | 低太阳：太阳高度角 25 °；高太阳：只改变太阳高度角 50 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M14 [正弦定理](../src/lib/discovery/expansion/mathematics.ts) · `/labs/sine-rule-circle/` | 角和对边，怎样一起锁定外接圆？ | a=2R sinA，所以a/sinA=2R。 圆半径R固定，两端点A、B与圆周顶点C；所取角A∈(0,180°)。 | 小角：所对圆周角 30 °；大角：只改变所对圆周角 60 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M15 [余弦定理](../src/lib/discovery/expansion/mathematics.ts) · `/labs/cosine-rule-hinge/` | 两根杆一样长，第三边为什么会变？ | c²=a²+b²−2ab cosC；C=90°时退化为勾股定理。 两边a、b与夹角C给定，0<C<180°，长度单位归一化。 | 锐角：两杆夹角 60 °；直角：只改变两杆夹角 90 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M16 [托勒密四边形](../src/lib/discovery/expansion/mathematics.ts) · `/labs/ptolemy-quadrilateral/` | 圆内接四边形，两条对角线藏着什么关系？ | 圆内接凸四边形满足AC·BD=AB·CD+BC·DA。 四顶点按圆周顺序排列，前三点角度0°、70°、180°，第四点可动。 | 靠近下方：第四点圆周位置 240 °；靠近右方：只改变第四点圆周位置 310 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M17 [抛物线焦准线](../src/lib/discovery/expansion/mathematics.ts) · `/labs/parabola-focus-directrix/` | 离一个点和一条线一样远，会走出什么曲线？ | PF²=x²+(y−f)²=(y+f)²=dist(P,准线)²。 焦点F=(0,f)，准线y=−f；P=(x,x²/(4f))，f>0。 | 左侧一点：曲线上横坐标 -2 ；右侧一点：只改变曲线上横坐标 2  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M18 [双曲线双焦点](../src/lib/discovery/expansion/mathematics.ts) · `/labs/hyperbola-focal-difference/` | 到两点的距离差固定，会留下什么轨迹？ | ∣PF₁−PF₂∣=2a；x²/a²−y²/b²=1。 a=1，焦点±c，c>a；P=(a cosh u,b sinh u)，b=√(c²−a²)，显示右支。 | 下半支：曲线参数u -0.8 ；上半支：只改变曲线参数u 0.8  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M19 [圆反演](../src/lib/discovery/expansion/mathematics.ts) · `/labs/circle-inversion/` | 一个点靠近圆心，它的伙伴会去哪？ | OP·OP′=R²；二次反演回到原点；圆心无有限反演像。 圆心原点，反演半径R；点P沿正x轴，OP>0，P与P′同射线。 | 圆内一点：原点距离OP 0.5 ；圆外一点：只改变原点距离OP 2  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M20 [行列式面积](../src/lib/discovery/expansion/mathematics.ts) · `/labs/determinant-area/` | 剪切一个平行四边形，面积会变吗？ | det(u,v)=uₓvᵧ−uᵧvₓ=3h；剪切s不改变底与高。 u=(3,0)，v=(s,h)，h可带符号；有向面积与普通面积区分。 | 向左剪切：剪切量s -1 ；向右剪切：只改变剪切量s 2  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M21 [空间叉积](../src/lib/discovery/expansion/mathematics.ts) · `/labs/cross-product-space/` | 两条向量，怎样确定一个垂直方向？ | u×v=(0,−2z,2h)，与u、v点积均为0；模长等于平行四边形面积。 u=(2,0,0)，v=(s,h,z)；叉积按右手定则，有向量而非只比较长度。 | 较低分量：v的y分量 0.5 ；较高分量：只改变v的y分量 1.5  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M22 [异面直线公垂线](../src/lib/discovery/expansion/mathematics.ts) · `/labs/skew-lines-distance/` | 空间两条线之间，最短距离怎样量？ | θ≠0时d=∣w·(u×v)∣/∣u×v∣=∣h∣；θ=0为平行特例，仍d=∣h∣。 第一线沿x轴，第二线位于z=h平面，方向(cosθ,sinθ,0)，且过(0,0,h)。 | 小夹角：两线方向夹角 30 °；大夹角：只改变两线方向夹角 90 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M23 [球的截面](../src/lib/discovery/expansion/mathematics.ts) · `/labs/sphere-plane-section/` | 切平面远离球心，截面会怎样缩小？ | 截圆半径r=√(R²−d²)；面积π(R²−d²)，条件0≤d≤R。 球半径R，平面距球心d；d>R时无交集，不把虚数半径画成圆。 | 靠近球心：平面距球心 0.5 ；远离球心：只改变平面距球心 1.5  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M24 [长方体空间对角线](../src/lib/discovery/expansion/mathematics.ts) · `/labs/cuboid-diagonal/` | 箱子的最长直线，为什么要勾股两次？ | d底²=a²+b²；d体²=d底²+c²=a²+b²+c²。 互相垂直的三条棱a、b、c；对角线连接相对顶点。 | 矮箱：箱高c 1 ；高箱：只改变箱高c 3  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M25 [旋转体](../src/lib/discovery/expansion/mathematics.ts) · `/labs/solid-of-revolution/` | 一片直角三角形，转一圈会装下多少？ | 完整圆锥V=πr²h/3，侧面积=πr√(r²+h²)；部分角体积按角比例计算。 直角三角形绕高所在直线旋转，形成圆锥；进度只改变部署角，不改变完整圆锥体积公式。 | 半圈：旋转扫过角 180 °；完整一圈：只改变旋转扫过角 360 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M26 [黎曼和](../src/lib/discovery/expansion/mathematics.ts) · `/labs/riemann-area/` | 把曲线下切成小条，面积会越来越准吗？ | 积分₀¹x²dx=1/3；左和≤1/3≤右和，分割越细误差趋0。 函数y=x²，区间[0,1]，使用左端点或右端点矩形；高度单位归一化。 | 粗分割：矩形条数 5 ；细分割：只改变矩形条数 40  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M27 [蒙特卡洛圆周率](../src/lib/discovery/expansion/mathematics.ts) · `/labs/monte-carlo-pi/` | 随机撒点，能量出圆周率吗？ | π估计=4N圆内/N；随机误差可涨可落，增加样本不保证每一步更准。 固定种子的伪随机点均匀分布于单位正方形，四分之一圆面积比为π/4。 | 少量投点：投点数 100 ；更多投点：只改变投点数 1500  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M28 [贝叶斯分诊树](../src/lib/discovery/expansion/mathematics.ts) · `/labs/bayes-screening/` | 检测阳性，真的有病的概率多大？ | P(D∣+)=P(+∣D)P(D)/[P(+∣D)P(D)+P(+∣¬D)P(¬D)]。 假想筛查而非医疗建议，灵敏度90%、假阳性率5%，人群基率可变；使用期望人数。 | 低基率：人群患病率 1 %；较高基率：只改变人群患病率 10 % | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M29 [复数旋转](../src/lib/discovery/expansion/mathematics.ts) · `/labs/complex-rotation/` | 乘以一个复数，为什么会转动？ | zw=ρ[(2cosθ−sinθ)+i(2sinθ+cosθ)]；∣zw∣=∣z∣ρ，辐角相加。 初始复数z=2+i，乘数w=ρ(cosθ+i sinθ)，乘法分解为伸缩与旋转。 | 四分之一圈：乘数辐角 90 °；半圈：只改变乘数辐角 180 ° | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |
| M30 [二次函数判别式](../src/lib/discovery/expansion/mathematics.ts) · `/labs/quadratic-discriminant/` | 抛物线抬高一点，两个交点会去哪？ | Δ=b²−4ac=4−4c；Δ>0两实根，Δ=0重根，Δ<0无实根。 y=x²−2x+c，开口向上；交点指与x轴的实交点。 | 两交点：常数项c 0 ；无实交点：只改变常数项c 2  | [Wolfram MathWorld · 相关词条](https://mathworld.wolfram.com/) |

### 宇宙与三体：由观测证据解释硬科幻

| 编号 / 作品 | 核心问题 | 科学依据与条件 | 两组情景 | 阅读入口 |
| --- | --- | --- | --- | --- |
| C11 [开普勒等面积](../src/lib/discovery/expansion/cosmos.ts) · `/labs/kepler-area-clock/` | 行星靠近太阳，为什么走得更快？ | r=1−e cosE，v=√(2/r−1)，面积速度h/2=√(1−e²)/2；M=E−e sinE。 单位中心引力参数μ=1、半长轴a=1，椭圆轨道；轨道相位为偏近点角E。 | 近日点：偏近点角E 0 °；远日点：只改变偏近点角E 180 ° | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C12 [逃逸速度](../src/lib/discovery/expansion/cosmos.ts) · `/labs/escape-speed-well/` | 离开星球，究竟需要多快？ | v逃=√(2GM/r)，v圆=√(GM/r)，二者比恒为√2。 孤立球形地球，半径6371 km；表面以上高度，无空气和自转。 | 地表：地表高度 0 km；高轨：只改变地表高度 20000 km | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C13 [霍曼转移](../src/lib/discovery/expansion/cosmos.ts) · `/labs/hohmann-transfer/` | 去更高的轨道，为什么要点火两次？ | aₜ=(r₁+r₂)/2；Δv₁=√(μ/r₁)(√(2r₂/(r₁+r₂))−1)，Δv₂=√(μ/r₂)(1−√(2r₁/(r₁+r₂)))。 共面地球圆轨道，起点半径7000 km；两次瞬时切向脉冲，无摄动。 | 近目标：目标轨道半径 14000 km；远目标：只改变目标轨道半径 35000 km | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C14 [系外行星凌星](../src/lib/discovery/expansion/cosmos.ts) · `/labs/exoplanet-transit/` | 恒星暗了一点，怎样推断行星大小？ | 完全入盘时深度δ=(Rp/Rs)²；接触阶段用两圆交叠面积/πRs²。 均匀亮度恒星、中央过境、无临边昏暗；测光按两圆重叠面积，行星半径小于恒星。 | 小行星：行星/恒星半径比 0.05 ；两倍半径：只改变行星/恒星半径比 0.1  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C15 [恒星视向速度](../src/lib/discovery/expansion/cosmos.ts) · `/labs/stellar-radial-velocity/` | 看不见行星，能从恒星的摇摆找到它吗？ | K≈(Mp/Ms)√(GMs/a)sin i；v视=K sinφ。 太阳质量恒星、圆轨道、行星质量远小于恒星；测量沿视线分量。 | 正面看轨道：轨道倾角 0 °；侧面看轨道：只改变轨道倾角 90 ° | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C16 [宜居带](../src/lib/discovery/expansion/cosmos.ts) · `/labs/habitable-zone/` | 在宜居带里，就一定适合生命吗？ | F/F地=L/r²；T=[L☉L(1−A)/(16πσr²)]^(1/4)。 仅按入射通量0.35–1.1倍地球定义教学带；灰体平衡、反照率0.3、无温室效应。 | 太阳光度：恒星光度/太阳 1 ；更亮恒星：只改变恒星光度/太阳 2  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C17 [恒星光谱](../src/lib/discovery/expansion/cosmos.ts) · `/labs/stellar-blackbody/` | 更热的恒星，峰值颜色怎样改变？ | λ峰T=2.897771955×10⁻³ m·K，L=4πR²σT⁴。 恒星按理想黑体，忽略大气谱线；曲线为Bλ并按本温度峰值归一化。 | 较冷恒星：有效温度 3000 K；较热恒星：只改变有效温度 9000 K | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C18 [恒星寿命](../src/lib/discovery/expansion/cosmos.ts) · `/labs/stellar-lifetime/` | 燃料更多的大恒星，为什么反而短命？ | 燃料∝M，消耗率∝L；t≈10Gyr×M/L=10M⁻²·⁵ Gyr。 0.5–5太阳质量的粗略主序幂律，L∝M³·⁵；寿命按太阳100亿年归一。不是恒星演化计算。 | 太阳质量：恒星质量/太阳 1 ；两倍质量：只改变恒星质量/太阳 2  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C19 [中子星致密度](../src/lib/discovery/expansion/cosmos.ts) · `/labs/neutron-star-compactness/` | 把太阳压进一座城，会发生什么？ | rs=2GM/c²；R>rs时z=(1−rs/R)⁻¹/²−1；R≤rs无静止表面观察者。 球形非旋转质量，紧致度rs/R；只给几何与Schwarzschild表面红移，不求物态方程。 | 较大半径：天体半径 16 km；较小半径：只改变天体半径 8 km | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C20 [宇宙红移](../src/lib/discovery/expansion/cosmos.ts) · `/labs/cosmological-redshift/` | 光在宇宙中旅行，波长为何被拉长？ | 1+z=a今/a发，λ观=(1+z)λ发；T观=T发/(1+z)。 采用FLRW尺度因子关系，不把宇宙红移直接当作狭义相对论多普勒速度。 | 较近红移：红移z 0.5 ；较高红移：只改变红移z 2  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C21 [引力钟](../src/lib/discovery/expansion/cosmos.ts) · `/labs/gravitational-clock/` | 靠近大质量天体，时钟怎样变慢？ | dτ/dt=√(1−rs/r)；地面工程比较还需处理实际参考位置和运动。 Schwarzschild外部静止观察者，对照无穷远时钟；半径以rs计，忽略自转。 | 较近静止钟：距中心半径/rs 1.5 ；较远静止钟：只改变距中心半径/rs 6  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C22 [引力透镜](../src/lib/discovery/expansion/cosmos.ts) · `/labs/einstein-lens/` | 一个遥远光源，为什么会出现两个像？ | θ±=(β±√(β²+4))/2；β→0时形成爱因斯坦环，点源放大率在对齐极限发散。 弱场薄透镜、点质量，角位置以爱因斯坦角归一化；不模拟强场多圈像。 | 靠近对齐：源角偏移/爱因斯坦角 0.3 ；偏离对齐：只改变源角偏移/爱因斯坦角 1.5  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C23 [水星进动](../src/lib/discovery/expansion/cosmos.ts) · `/labs/relativistic-precession/` | 椭圆轨道的方向，为什么会慢慢转动？ | 每圈Δϖ=6πGM/[a(1−e²)c²]，角秒乘206264.806；图中放大5000倍。 太阳中心弱场一阶广义相对论修正；不含其他行星摄动，图面进动角放大。 | 水星附近：半长轴 0.39 AU；地球附近：只改变半长轴 1 AU | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C24 [希尔球](../src/lib/discovery/expansion/cosmos.ts) · `/labs/hill-sphere/` | 行星的卫星，最远能跟到哪里？ | rH≈a(Mp/(3Ms))^(1/3)；稳定区还依赖顺逆行、偏心率和摄动。 太阳质量恒星、圆轨道、行星质量远小于恒星；希尔半径为近似尺度，不保证内部所有轨道稳定。 | 地球质量：行星质量/地球 1 ；八倍质量：只改变行星质量/地球 8  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C25 [火箭质量账本](../src/lib/discovery/expansion/cosmos.ts) · `/labs/rocket-mass-ledger/` | 燃料加倍，速度增量也翻倍吗？ | Δv=vₑ ln(m₀/mf)；质量比为指数代价，不能用普通恒质量F=ma直接累计。 真空无外力、恒定有效排气速度，质量比含燃料消耗；不含引力与气动损失。 | 质量比2：初末质量比 2 ；质量比4：只改变初末质量比 4  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C26 [相对论能量](../src/lib/discovery/expansion/cosmos.ts) · `/labs/relativistic-energy/` | 越来越接近光速，能量代价为何陡增？ | γ=1/√(1−β²)，K=(γ−1)mc²；低速极限趋近mv²/2。 自由粒子或飞船的平动动能，不包含推进系统效率、制动或燃料质量变化。 | 半光速：速度/光速 0.5 ；九成光速：只改变速度/光速 0.9  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C27 [星际尘埃撞击](../src/lib/discovery/expansion/cosmos.ts) · `/labs/interstellar-dust-impact/` | 一粒尘埃，怎样变成星际航行的难题？ | m=4πρr³/3，K=(γ−1)mc²，密度ρ=3000 kg/m³；TNT当量仅作能量单位换算。 飞船参考系中静质量尘埃的相对论动能；只算能量，不模拟等离子体、屏蔽或损伤。 | 小尘埃：尘埃半径 10 μm；两倍半径：只改变尘埃半径 20 μm | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C28 [望远镜分辨率](../src/lib/discovery/expansion/cosmos.ts) · `/labs/telescope-resolution/` | 望远镜更大，能把多近的两颗星分开？ | θR=1.22λ/D；分辨率不是放大倍数或光子数。 圆形孔径、单色理想成像，采用瑞利判据；不含大气视宁度和像差。 | 小口径：望远镜口径 1 m；大口径：只改变望远镜口径 4 m | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C29 [干涉仪基线](../src/lib/discovery/expansion/cosmos.ts) · `/labs/interferometer-baseline/` | 两台望远镜，怎样获得更细的角尺度？ | 条纹角尺度≈λ/B；相位差φ=2πB sinθ/λ。 两单元理想远场相干干涉；λ/B为特征条纹角尺度，不等于完整成像能力或集光面积。 | 较短基线：基线长度 1000 km；地球级基线：只改变基线长度 8000 km | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |
| C30 [哈勃距离梯](../src/lib/discovery/expansion/cosmos.ts) · `/labs/hubble-distance-ladder/` | 红移越大，离我们就一定按直线更远吗？ | v≈H₀d，d≈cz/H₀；1 Mpc=3.08567758×10¹⁹ km。 仅限低红移z≤0.1，采用v≈cz和d≈cz/H₀；不是高红移测距或完整宇宙年龄模型。 | 较低红移：低红移z 0.02 ；两倍红移：只改变低红移z 0.04  | [NASA Science · 天文与行星科学阅读](https://science.nasa.gov/) |

### 工程与建造：约束下的设计

| 编号 / 作品 | 核心问题 | 科学依据与条件 | 两组情景 | 阅读入口 |
| --- | --- | --- | --- | --- |
| S11 [三角桁架节点](../src/lib/discovery/expansion/engineering.ts) · `/labs/triangle-truss-joint/` | 屋架变平，杆件真的更省力吗？ | 每杆压缩力N=P/(2sinθ)，水平推力H=P/(2tanθ)，θ=atan(2h/L)。 对称两杆桁架、两端铰支，顶点竖直集中载荷；杆只承轴力，无自重。 | 较高屋架：桁架高度 2 m；较平屋架：只改变桁架高度 0.5 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S12 [移动荷载梁](../src/lib/discovery/expansion/engineering.ts) · `/labs/moving-load-beam/` | 重物移到哪里，梁最吃力？ | RA=P(L−a)/L，RB=Pa/L；Mmax=Pa(L−a)/L，发生在荷载点。 两端简支、单点载荷、梁长4 m，忽略自重，挠度未求解。 | 靠近支座：载荷距左支座 0.5 m；跨中：只改变载荷距左支座 2 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S13 [欧拉压杆](../src/lib/discovery/expansion/engineering.ts) · `/labs/euler-column/` | 柱子加长一倍，临界载荷会怎样？ | Pcr=π²EI/(KL)²；临界值不是短柱压碎强度，也不是实际设计允许荷载。 细长理想直杆，线弹性、中心受压；E=200 GPa，I=1×10⁻⁸ m⁴；端部系数K可选。 | 短柱：柱长 1 m；两倍长度：只改变柱长 2 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S14 [偏心受压柱](../src/lib/discovery/expansion/engineering.ts) · `/labs/eccentric-column-stress/` | 同一重量偏一点，柱边缘会多危险？ | σmax=P/A+Pe c/I，σmin=P/A−Pe c/I；矩形核心界限e≤h/6。 一阶线弹性轴压+弯矩，不含P–Δ放大；矩形截面100×100 mm。拉应力不代表混凝土可承受。 | 居中加载：偏心距 0 mm；偏心加载：只改变偏心距 25 mm | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S15 [挡土墙抗倾覆](../src/lib/discovery/expansion/engineering.ts) · `/labs/retaining-wall-overturn/` | 墙底宽一点，为什么更稳？ | Pa=KaγH²/2；倾覆矩PaH/3，抗倾覆矩γ墙BH·B/2；比值不等于全面安全。 每米墙长，矩形重力墙，墙高3 m，土重度18 kN/m³、主动土压系数1/3，墙重度24 kN/m³；仅验倾覆。 | 窄墙：墙底宽 1 m；宽墙：只改变墙底宽 2 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S16 [斜坡摩擦](../src/lib/discovery/expansion/engineering.ts) · `/labs/slope-friction/` | 坡更陡一点，什么时候会滑？ | 沿坡驱动力mg sinθ，最大静摩擦μmg cosθ；抗滑比μ/tanθ。 单块刚体置于平直斜面，无黏聚力、无孔隙水、无地震；不是真实边坡设计。 | 较缓坡：坡角 20 °；较陡坡：只改变坡角 40 ° | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S17 [螺旋千斤顶](../src/lib/discovery/expansion/engineering.ts) · `/labs/screw-jack/` | 转好多圈，怎样换来很大的举升力？ | 每转输入功F·2πr，输出功Wp；F=Wp/(2πrη)，提升h需h/p转。 恒定效率η代表简化总损失，手柄半径0.2 m；不从效率推断自锁性。 | 细螺距：螺距 2 mm；粗螺距：只改变螺距 8 mm | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S18 [楔块举升](../src/lib/discovery/expansion/engineering.ts) · `/labs/wedge-lift/` | 一个小斜面，怎样推起重物？ | h=x tanθ；F=W tanθ；Fx=Wh。 无摩擦、准静态楔块，负载只能竖直运动；仅理想机械优势，不模拟自锁。 | 小楔角：楔角 10 °；大楔角：只改变楔角 30 ° | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S19 [皮带传动](../src/lib/discovery/expansion/engineering.ts) · `/labs/belt-drive/` | 换一只大轮，转速与力矩怎样交换？ | ω₁r₁=ω₂r₂；P=τω守恒，τ₂/τ₁=r₂/r₁。 开式理想无滑动皮带，主动轮半径0.1 m，忽略张力与包角限制。 | 等大轮：从动/主动半径比 1 ；大从动轮：只改变从动/主动半径比 2  | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S20 [行星齿轮](../src/lib/discovery/expansion/engineering.ts) · `/labs/planetary-gear/` | 固定不同零件，传动关系为什么会变？ | (ωs−ωc)/(ωr−ωc)=−Nr/Ns，ωr=0⇒ωc=ωs/(1+Nr/Ns)。 内齿圈固定，太阳轮驱动、行星架输出；太阳齿数20，齿圈齿数为40–100偶数。 | 60齿圈：齿圈齿数 60 齿；100齿圈：只改变齿圈齿数 100 齿 | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S21 [四杆机构](../src/lib/discovery/expansion/engineering.ts) · `/labs/four-bar-linkage/` | 转动一根杆，另外两根怎样跟随？ | 输入端A=(cosθ,sinθ)，另一固定端D=(4,0)；B满足∣B−A∣=3、∣B−D∣=2.5。 固定杆4、输入杆1、连杆3、输出杆2.5，选择两圆交点的上支；展示装配几何不求动力学。 | 小转角：输入杆转角 45 °；大转角：只改变输入杆转角 150 ° | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S22 [剪叉升降](../src/lib/discovery/expansion/engineering.ts) · `/labs/scissor-lift/` | 平台快收拢时，为什么越来越难推？ | h=Lsinθ，x=Lcosθ；∣F∣=W∣dh/dx∣=Wcotθ。 单级理想剪叉，杆长2 m，水平驱动底部跨度，负载竖直；无摩擦无自重。 | 较展开：杆与水平夹角 50 °；接近平放：只改变杆与水平夹角 10 ° | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S23 [球冠穹顶](../src/lib/discovery/expansion/engineering.ts) · `/labs/spherical-cap-dome/` | 同样的跨度，屋顶抬高会用多少材料？ | R=(a²+h²)/(2h)，A=2πRh=π(a²+h²)，V=πh(3a²+h²)/6。 球冠底面半径a、高h，薄壳只计算几何面积与封闭体积，不给承载结论。 | 浅穹顶：穹顶高度 1 m；高穹顶：只改变穹顶高度 3 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S24 [斜撑抗剪](../src/lib/discovery/expansion/engineering.ts) · `/labs/diagonal-bracing/` | 方框为什么容易歪，斜撑怎样帮忙？ | 斜撑贡献k=EA cos²θ/L；δ=P/(k框+k撑)。 两层模型：框架侧向刚度固定10 kN/m，加一根仅轴向线弹性斜撑；小位移，宽高各3 m，EA=1000 kN。 | 只有框架：是否加斜撑 0 ；加上斜撑：只改变是否加斜撑 1  | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S25 [蜂窝材料](../src/lib/discovery/expansion/engineering.ts) · `/labs/honeycomb-relative-density/` | 空心蜂窝，怎样比较轻与实？ | 每胞分摊壁面积3lt，胞面积3√3l²/2，ρ*/ρs≈2t/(√3l)。 规则六边形薄壁、忽略节点重叠，t/l≤0.1；相对密度只给几何，不预测强度。 | 薄壁：壁厚/边长 0.03 ；两倍壁厚：只改变壁厚/边长 0.06  | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S26 [夹芯梁](../src/lib/discovery/expansion/engineering.ts) · `/labs/sandwich-beam/` | 把材料放远一点，为什么能更抗弯？ | I=2[bt³/12+bt(h/2+t/2)²]；δ=PL³/(48EI)，E=70 GPa。 两片铝面板各厚1 mm、宽0.1 m，中间芯材只保持间距、不计轴向刚度；简支跨长1 m、中央力100 N。 | 薄芯层：芯层厚度 5 mm；厚芯层：只改变芯层厚度 25 mm | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S27 [房间混响](../src/lib/discovery/expansion/engineering.ts) · `/labs/room-reverberation/` | 给教室加吸声材料，回声会怎样变短？ | T60≈0.161V/A，A=αS；高吸声、非扩散声场不适用。 Sabine扩散声场近似，房间8×6×3 m，总表面积180 m²；均匀平均吸声系数0.05–0.5。 | 硬表面：平均吸声系数 0.1 ；增加吸声：只改变平均吸声系数 0.3  | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S28 [日照遮阳](../src/lib/discovery/expansion/engineering.ts) · `/labs/solar-shading/` | 挑檐伸出多少，能挡住夏天的阳光？ | 竖向阴影h=D tanα；遮挡比例=min(h/H窗,1)。 太阳光位于墙法向竖直平面，水平挑檐紧贴窗顶，窗高1.5 m；不计散射和方位偏差。 | 浅挑檐：挑檐进深 0.3 m；深挑檐：只改变挑檐进深 0.9 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S29 [雨水收集](../src/lib/discovery/expansion/engineering.ts) · `/labs/rainwater-harvesting/` | 一场雨，屋顶能存下多少水？ | V来=雨深×面积×径流系数；存水=min(V来,容量)，溢流=max(V来−容量,0)。 单场降雨、屋面径流系数0.8；雨前水箱为空，不计首段弃流、蒸发与用水。 | 小雨量：单场雨量 10 mm；大雨量：只改变单场雨量 60 mm | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |
| S30 [烟囱通风](../src/lib/discovery/expansion/engineering.ts) · `/labs/stack-ventilation/` | 不装风扇，温差能让空气动起来吗？ | Q≈CdA√(2gHΔT/T外)；温差为0时热压驱动为0。 稳态小温差近似，室外293 K，室内更热；等效开口面积、流量系数0.6，不含风压与管道摩擦。 | 低烟囱：进排气高度差 2 m；高烟囱：只改变进排气高度差 8 m | [Engineering LibreTexts · 静力学与工程模型](https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)) |

## 逐项视觉复核

截图来自本地生产构建Chrome；拼图按编号从左到右、从上到下排列。测试运行中的完整二维/三维/手机图保存在 `/tmp/science-teach-eighty-release/`；下列拼图随交付文档保存。

| 空间 | 二维证据 | 三维观察 |
| --- | --- | --- |
| 物理P11–P30 | [20项二维](assets/eighty/P-2d.jpg) | [20项三维](assets/eighty/P-3d.jpg) |
| 数学M11–M30 | [20项二维](assets/eighty/M-2d.jpg) | [20项三维](assets/eighty/M-3d.jpg) |
| 宇宙C11–C30 | [20项二维](assets/eighty/C-2d.jpg) | [20项三维](assets/eighty/C-3d.jpg) |
| 工程S11–S30 | [20项二维](assets/eighty/S-2d.jpg) | [20项三维](assets/eighty/S-3d.jpg) |

手机20项一组：[物理](assets/eighty/P-mobile.jpg)、[数学](assets/eighty/M-mobile.jpg)、[宇宙](assets/eighty/C-mobile.jpg)、[工程](assets/eighty/S-mobile.jpg)。原40项新增空间证据：[P](assets/eighty/retained-P.jpg)、[M](assets/eighty/retained-M.jpg)、[C](assets/eighty/retained-C.jpg)、[S](assets/eighty/retained-S.jpg)。原14项空间观察台：[拼图](assets/eighty/legacy.jpg)。17张拼图已逐项审阅，无缺图；最终源截图294张。可机读[验收摘要](assets/eighty/validation.json)记录数量与关键源码哈希。

复核发现并修正了情景扩大后的相机裁切、旋转角为零时三角板消失、少数仪器只改读数、移动端预览遮挡控件、部分新路由客户端未初始化等问题。补上液柱压力台的容器宽度控制和安培力进入/离开图面的明确约定；取景包围盒根据装置变化重新计算。科学显示采用明确示意比例；例如天体距离与半径不共用真实比例，时空涟漪振幅放大，蜂窝墙厚与旋转体扫角直接参与几何构造。

## 验收记录

- `npm test`：Node.js 24.22.0下268项全部通过。包含80项有效输入/端点/情景/几何/独立证据检查、四学科解析基准、原40项情景空间几何联动，以及凹多边形、斜面与退化面的三角剖分验证。
- `npm run build`：Node.js 24.22.0下通过，生成147页；类型检查0错误、0警告、0提示。
- 旧功能Playwright：6项透镜工作台、8项重心/纸带、12项首次任务/干涉、7项电路、3项全140历史、7项电阻电容、19项几何、90项前40工作台、41项前40打磨，共193项通过。
- 浏览器脚本：主站、浮力、单摆、六实验、标准演示、透镜/路线、三维、重心、月相、实时观察条，共10组通过。覆盖真实Chrome、模拟触摸、320/390px、键盘、页面离开/返回、减少动态与无脚本内容。
- 最终双视图专项：Node.js 24.22.0与最终生产构建上137项全部通过（80项新增、40项保留工作台、14项旧实验空间台、浮力/单摆2项显式二维切换、1项遍历80页的无脚本检查）。与旧功能193项合计330项Playwright检查通过。新增80项另核查三维投影边界，全部情景装置在取景内。

首轮发现的问题均保留修正依据：新路由客户端初始化遗漏、手机焦点遮挡、8项原实验只有读数变化、三维取景裁切、凹面错误填充、三体空间台只同步A系统。测试同时修正了跨引擎浮点末位的精确比较，并为桥梁/电容设置可观察的稳定结构/非零时刻；没有删除科学或几何变化断言。

## 维护与运行

`npm run build`后用`npm run preview`启动，设置`BROWSER_CHECK_URL`为预览地址，再运行`npm run test:browser`。新增和双视图专项为`npm run test:browser:eighty`；对应版本化规格在`tests/browser/eighty-experiments.spec.ts`，模型和不变量检查在`tests/eighty-additions.test.ts`。新内容由`src/lib/discovery/expansion/`管理；目录、历史与情景复用已有系统。

本机最初使用Node 23.4.0，最终在临时目录获取Node 24.22.0，补做268项模型测试、完整构建与双视图收尾验收；项目依赖未因此改变。浏览器使用本机Chrome与软件渲染，不替代真实手机GPU、Safari/Firefox或课堂验证。未发布公网、未推送提交。

OpenSpec变更：`add-eighty-crafted-experiments`，最终同步归档至 `openspec/changes/archive/2026-10-17-add-eighty-crafted-experiments/`。
