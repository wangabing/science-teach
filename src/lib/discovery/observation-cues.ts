import { format, type Inputs, type Observation } from "./core.ts";
/** Interpret only the current calculated state; this never awards learning credit. */
export function observationCue(id: string, p: Inputs, o: Observation): string {
  const v = (key: string) =>
    o.metrics.find((m) => m.key === key)?.value ?? null;
  const n = (key: string) => format(v(key));
  if (
    o.status === "invalid" ||
    (o.status === "boundary" && !["C06", "S01", "M01", "M04"].includes(id))
  )
    return o.note;
  switch (id) {
    case "P01":
      return v("acceleration") === 0
        ? "滑块没有自行出发。先检查坡度和静摩擦；加重不一定能让它滑动。"
        : `沿坡加速度 ${n("acceleration")} m/s²；到达时间 ${n("arrival")} s。只改质量，再比较计时。`;
    case "P02":
      return `碰前总动量 ${n("momentum")}，碰后 ${n("momentum_after")} kg·m/s；动能从 ${n("energy_before")} 到 ${n("energy_after")} J。两本账分开看。`;
    case "P03":
      return `当前驱动 ${p.frequency} Hz，稳态振幅 ${n("amplitude")} m。峰值频率 ${n("peak")} Hz；继续扫频，而不是只盯住一个时刻。`;
    case "P04":
      return `P处电势 ${n("potential")} V，电场大小 ${n("magnitude")} N/C。${v("potential") === 0 && v("magnitude") !== 0 ? "电势抵消了，电场却没有抵消。" : "试试两源中点，再改变电荷符号。"}`;
    case "P05":
      return p.velocity === 0
        ? "规定速度为0，磁链仍可存在，但感应电动势和电流为0。"
        : p.closed === 0
          ? `开路：电动势 ${n("emf")} V，但电流为0。`
          : `电动势 ${n("emf")} V，电流 ${n("current")} A；在同一位置反向速度，检查符号。`;
    case "P06":
      return v("radius") === null
        ? "轨道进入直线极限，圆半径不再是有限量。速率仍由初始速度决定。"
        : `轨道半径 ${n("radius")} m，速率 ${n("speed")} m/s。磁力改变方向，并不增加速率。`;
    case "P07":
      return `输入 ${n("input")} J = 内能增加 ${n("internal")} J + 散热 ${n("dissipated")} J。当前水温 ${n("temperature")} °C。`;
    case "P08":
      return `热量 ${n("heat")} J，其中 ${n("internal")} J进入内能，${n("work")} J成为对外做功。${p.process ? "活塞升高消耗了部分输入。" : "锁定体积后，气体不做体积功。"}`;
    case "P09":
      return `样本均方位移 ${n("msd")} μm²，理论 ${n("theory")} μm²。样本起伏不等于统计规律失效。`;
    case "P10":
      return v("transmitted_angle") === null
        ? "进入全反射：透射方向不再存在，透射能量比例为0。"
        : `折射角 ${n("transmitted_angle")}°；反射比例 ${n("reflectance")}，透射比例 ${n("transmittance")}。`;
    case "M01":
      return `${p.fold === 90 ? "已经完全折起。" : "现在还没有完全折起。"}${v("valid") === 1 ? "这张六连方能形成六个不同朝向；核对面号和相对面。" : "这个网不能闭合为正方体；检查重复朝向或环路。"}`;
    case "M02":
      return `切片高度 ${n("slice_height")} m，截面积 ${n("area")} m²，总体积 ${n("volume")} m³。移动金色切片，再检验其他高度。`;
    case "M03":
      return `两方向点积为 ${n("dot_x")} 和 ${n("dot_y")}。${v("perpendicular") === 1 ? "这条非零向量垂直该平面。" : "只有一个点积为0还不够；继续调整另一个分量。"}`;
    case "M04":
      return `倾角 ${p.angle}°，离心率 ${n("eccentricity")}。${p.offset === 0 ? "切平面过顶点，截线退化。" : p.angle! < 60 ? "截线为椭圆。" : p.angle === 60 ? "恰到母线平行的临界：抛物线。" : "截线为双曲线，有限锥中只显示部分分支。"}`;
    case "M05":
      return `P的高 ${n("y")}，底长 ${p.width}，面积 ${n("area")}。${p.distance! > p.width! + p.height! && p.distance! < 2 * p.width! + p.height! ? "沿顶边，高不变，所以面积进入平台。" : "把高的变化与函数分段对应起来。"}`;
    case "M06":
      return `纵坐标 sinθ=${n("sin")}，横坐标 cosθ=${n("cos")}。平方和 ${n("identity")}；多转360°再检查。`;
    case "M07":
      return `当前差商 ${n("secant")}，导数 ${n("derivative")}。${v("derivative") === null ? "这里左右极限不一致，不能用一条切线概括。" : "缩小正、负Δx，看看是否走向相同值。"}`;
    case "M08":
      return `样本均值 ${n("mean")}，理论均值 ${n("theory_mean")}。${p.probability === 0.5 ? "左右公平，分布围绕中间。" : "左右不公平，分布中心随概率移动。"}`;
    case "M09":
      return `${n("vertices")}个顶点 − ${n("edges")}条棱 + ${n("faces")}个面 = ${n("chi")}。${p.surface ? "环面的洞改变了拓扑。" : "凸多面体的结果与棱柱边数无关。"}`;
    case "M10":
      return `单胞等效球数 ${n("per_cell")}，体积分数 ${n("fraction")}。${p.arrangement ? "面心立方利用面中心位置，空隙较小。" : "简单立方的层与层正对，空隙较大。"}`;
    case "C01":
      return `探针总辐照 ${n("flux")} W/m²，灰体平衡温度 ${n("temperature")} K。先固定时刻，再比较探针距离。`;
    case "C02":
      return `偏离 ${n("displacement")}（归一化长度），Jacobi数值漂移 ${n("drift")}。轨迹偏离与积分误差是两种证据。`;
    case "C03":
      return (v("clock") ?? 0) < (v("return") ?? 0)
        ? `当前 ${n("clock")} 年；回信预计在地球系 ${n("return")} 年抵达，还没结束。`
        : `回信已经抵达：往返 ${n("return")} 年。${p.speed! > 0 ? "目的地在远离，所以比静止时更久。" : "再改变目的地速度，比较等待时间。"}`;
    case "C04":
      return `地球经过 ${n("earth")} 年，船钟经过 ${n("ship")} 年；差 ${n("difference")} 年。这是同一次往返的两条世界线。`;
    case "C05":
      return p.mode===1?`已积分 ${n('days')} 天；当前距太阳 ${n('radius')} AU，径向速度 ${n('velocity')} m/s，净加速度 ${n('acceleration')} m/s²。这里同时考虑光压和太阳引力。`:`沿光束推力 ${n("force_x")} N，吸收功率 ${n("absorbed")} W。光压与热负荷要一起看；径向模式还需扣除太阳引力。`;
    case "C06":
      return v("capture") === 1
        ? `b=${p.impact}M低于临界 ${n("critical")}M，这束光被捕获，不能再返回远方。`
        : `b=${p.impact}M高于临界 ${n("critical")}M，光线弯折后逃逸。靠近临界时弯折更强。`;
    case "C07":
      return `潮汐/表面自引力比 ${n("ratio")}。${(v("ratio") ?? 0) > 1 ? "此模型下相对拉伸超过自引力。" : "此模型下自引力较强；继续靠近观察变化。"}注意小物体近似的范围。`;
    case "C08":
      return `接收 ${n("received")} dBW，噪声 ${n("noise")} dBW，信噪比 ${n("snr")} dB。功率用对数表示，不能直接相加当瓦数。`;
    case "C09":
      return `当前频率 ${n("current_frequency")} Hz，增长率 ${n("frequency_rate")} Hz/s，形式外推倒计时 ${n("remaining")} s（非合并时刻）。到强场截止后不外推合并。`;
    case "C10":
      return `合成图RMS ${n("rms")} μK。${p.noise === 0 && p.foreground === 0 ? "噪声和银河前景已关闭，指定的宇宙温差仍然保留。" : "分别关闭前景和噪声，辨认它们的作用。"}`;
    case "S01":
      return `包络余量 ${n("margin")} m，水平推力 ${n("horizontal")} N。${(v("margin") ?? 0) < 0 ? "推力线越出设定包络；调整拱形或加载方式。" : "金线仍在包络中；这只是本模型的一个检查。"}`;
    case "S02":
      return `端部挠度 ${n("deflection")} mm，截面惯性矩 ${n("inertia")} m⁴。只旋转同一截面，再比较挠度。`;
    case "S03":
      return `带配重/无配重振幅比 ${n("response_ratio")}。${(v("response_ratio") ?? 1) < 1 ? "当前频点有所减振。" : "当前频点没有减振。"}扫过其他频率再判断。`;
    case "S04":
      return `杆压力 ${n("rod_compression")} N，Euler临界力 ${n("buckling")} N。最小刚度 ${n("stiffness")} N/m；画面站立不能替代这些检查。`;
    case "S05":
      return `水平锚力 ${n("horizontal")} N，塔顶索张力 ${n("tension")} N。先固定跨度与荷载，只改变垂度。`;
    case "S06":
      return `滑块位置 ${n("slider")} m，速度 ${n("velocity")} m/s，杆长残差 ${n("rod_error")} m。不同角度速度不同，杆长约束却保持。`;
    case "S07":
      return `拉力 ${n("force")} N，拉绳 ${n("rope")} m。输入功 ${n("input")} J，货物增加势能 ${n("useful")} J。省力的代价是距离。`;
    case "S08":
      return `输入力 ${n("input_force")} N，输出行程 ${n("output_displacement")} cm。输入/输出功 ${n("input_work")} / ${n("output_work")} J，能量没有被放大。`;
    case "S09":
      return `覆盖面积 ${n("area")} m²，简化条带挠度 ${n("deflection")} mm。部署几何与承载模型是两层检查。`;
    case "S10":
      return `总传热系数 ${n("conductance")} W/K，${p.time}小时后室温 ${n("temperature")} °C。保温加厚仍无法消除窗的并联热损失。`;
    default:
      return o.note;
  }
}
