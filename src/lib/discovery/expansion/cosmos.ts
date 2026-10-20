import {
  define,
  Apparatus,
  c,
  m,
  graph,
  source,
  colors as C,
  pi,
  deg,
  type Point,
} from "./kit.ts";
const common = {
  source: source.space,
  sourceTitle: "NASA Science · 天文与行星科学阅读",
  stage: "高中拓展 · 硬科幻模型",
  era: "经典天体物理与现代观测",
};
const G = 6.6743e-11,
  MS = 1.98847e30,
  RS = 6.957e8,
  AU = 149597870700,
  LIGHT = 299792458;
const star = (b: Apparatus, x = 400, y = 230, r = 22) =>
  b.ball(x, y, r, C.gold);
export const cosmosAdditions = [
  define({
    ...common,
    id: "C11",
    slug: "kepler-area-clock",
    name: "开普勒等面积",
    question: "行星靠近太阳，为什么走得更快？",
    topic: "轨道 · 开普勒定律",
    known: "单位中心引力参数μ=1、半长轴a=1，椭圆轨道；轨道相位为偏近点角E。",
    proof: "r=1−e cosE，v=√(2/r−1)，面积速度h/2=√(1−e²)/2；M=E−e sinE。",
    era: "1609年 · 开普勒",
    history:
      "开普勒依据第谷的观测总结椭圆轨道与等面积定律，牛顿引力后来解释其动力学来源。",
    controls: [
      c("phase", "偏近点角E", "°", 0, 360, 5, 30),
      c("eccentricity", "偏心率", "", 0, 0.8, 0.05, 0.5),
    ],
    compare: "phase",
    metric: "areal",
    scenes: ["近日点", 0, "远日点", 180],
    counter: { eccentricity: 0 },
    invitation: "从近日点移到远日点，对照速率与面积速度。",
    look: "速率变了，面积速度是否仍固定？",
    hint: "E不是随时间匀速增加的真近点角；用M换算历时。",
    legend: ["金球：中心天体", "青线：椭圆", "扇形：自近日点扫过区域"],
    transfer: "偏心率为0时，近日点与远日点还有区别吗？",
    solve: (p) => {
      const e = p.eccentricity!,
        E = deg(p.phase!),
        x = Math.cos(E) - e,
        y = Math.sqrt(1 - e * e) * Math.sin(E),
        r = 1 - e * Math.cos(E),
        b = new Apparatus(true);
      star(b, 400, 230);
      b.trace(
        Array.from(
          { length: 121 },
          (_, i) =>
            [
              400 + 170 * (Math.cos((i * pi) / 60) - e),
              230 - 170 * Math.sqrt(1 - e * e) * Math.sin((i * pi) / 60),
            ] as Point,
        ),
      )
        .plate(
          [
            [400, 230],
            ...Array.from({ length: 61 }, (_, i) => {
              const q = (E * i) / 60;
              return [
                400 + 170 * (Math.cos(q) - e),
                230 - 170 * Math.sqrt(1 - e * e) * Math.sin(q),
              ] as Point;
            }),
          ],
          C.blue,
        )
        .ball(400 + x * 170, 230 - y * 170, 8, C.teal);
      return b.finish(
        [
          m("areal", "面积速度", Math.sqrt(1 - e * e) / 2, "归一化"),
          m("speed", "轨道速率", Math.sqrt(2 / r - 1), "归一化"),
          m("elapsed", "轨道周期进度", (E - e * Math.sin(E)) / (2 * pi), ""),
        ],
        "同一条椭圆上面积速度恒定；位置控件是E，不能把等角步进当成等时步进。",
        [
          graph("速率随E", "°", "归一化", 0, 360, (a) =>
            Math.sqrt(2 / (1 - e * Math.cos(deg(a))) - 1),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C12",
    slug: "escape-speed-well",
    name: "逃逸速度",
    question: "离开星球，究竟需要多快？",
    topic: "轨道 · 引力势阱",
    known: "孤立球形地球，半径6371 km；表面以上高度，无空气和自转。",
    proof: "v逃=√(2GM/r)，v圆=√(GM/r)，二者比恒为√2。",
    history:
      "逃逸速度由把引力势能提升至无穷远所需能量决定；它不要求发动机一直保持这个速率。",
    controls: [
      c("altitude", "地表高度", "km", 0, 40000, 500, 0),
      c("mass", "星球质量/地球", "", 0.5, 3, 0.1, 1),
    ],
    compare: "altitude",
    metric: "escape",
    scenes: ["地表", 0, "高轨", 20000],
    counter: { mass: 2 },
    invitation: "把起点移到高轨道，比较圆轨道与逃逸速度。",
    look: "两条速度曲线始终相差什么比例？",
    hint: "半径用距地心距离，不是距地表高度。",
    legend: ["蓝球：星球", "青环：所在半径", "金线：引力势井示意"],
    transfer: "质量变为两倍，逃逸速度也翻倍吗？",
    solve: (p) => {
      const mu = G * 5.9722e24 * p.mass!,
        r = (6371 + p.altitude!) * 1000,
        v = Math.sqrt((2 * mu) / r) / 1000,
        b = new Apparatus(true);
      b.ball(400, 230, 55, C.blue)
        .ring(400, 230, 75 + (100 * p.altitude!) / 40000)
        .ball(475 + (100 * p.altitude!) / 40000, 230, 8, C.gold)
        .text(80, 60, "孤立球体 · 不含大气损耗与自转");
      return b.finish(
        [
          m("escape", "逃逸速度", v, "km/s"),
          m("circular", "圆轨道速度", v / Math.SQRT2, "km/s"),
          m("ratio", "两速度之比", Math.SQRT2, ""),
        ],
        `此处逃逸速度${v.toFixed(3)} km/s；圆轨道速度更低，但沿轨道持续受引力。`,
        [
          graph(
            "逃逸速度",
            "km",
            "km/s",
            0,
            40000,
            (h) => Math.sqrt((2 * mu) / ((6371 + h) * 1000)) / 1000,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C13",
    slug: "hohmann-transfer",
    name: "霍曼转移",
    question: "去更高的轨道，为什么要点火两次？",
    topic: "轨道 · 轨道机动",
    known: "共面地球圆轨道，起点半径7000 km；两次瞬时切向脉冲，无摄动。",
    proof:
      "aₜ=(r₁+r₂)/2；Δv₁=√(μ/r₁)(√(2r₂/(r₁+r₂))−1)，Δv₂=√(μ/r₂)(1−√(2r₁/(r₁+r₂)))。",
    era: "1925年 · 霍曼",
    history:
      "霍曼研究两圆轨道之间的节能双脉冲转移，其理想几何仍是航天轨道设计的基础。",
    controls: [
      c("target", "目标轨道半径", "km", 8000, 42000, 1000, 14000),
      c("phase", "转移进度", "", 0, 1, 0.02, 0.5),
    ],
    compare: "target",
    metric: "delta",
    scenes: ["近目标", 14000, "远目标", 35000],
    counter: { target: 8000 },
    invitation: "升高目标圆轨道，观察连接两圈的转移椭圆。",
    look: "第二次点火为什么不能省掉？",
    hint: "到达远地点时若不圆化，会沿原椭圆返回。",
    legend: ["青环：起点圆轨道", "蓝环：目标圆轨道", "金线：半椭圆转移"],
    transfer: "目标很近时，总速度增量是否也很小？",
    solve: (p) => {
      const mu = 398600.4418,
        r1 = 7000,
        r2 = p.target!,
        a = (r1 + r2) / 2,
        e = (r2 - r1) / (r2 + r1),
        dv1 = Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1),
        dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))),
        s = 170 / r2,
        b = new Apparatus(true);
      b.ball(400, 230, 15, C.blue)
        .ring(400, 230, r1 * s)
        .ring(400, 230, r2 * s, C.blue)
        .trace(
          Array.from({ length: 81 }, (_, i) => {
            const E = (pi * i) / 80;
            return [
              400 + a * s * (Math.cos(E) - e),
              230 - a * s * Math.sqrt(1 - e * e) * Math.sin(E),
            ] as Point;
          }),
          C.gold,
        )
        .ball(
          400 + a * s * (Math.cos(pi * p.phase!) - e),
          230 - a * s * Math.sqrt(1 - e * e) * Math.sin(pi * p.phase!),
          7,
          C.gold,
        );
      return b.finish(
        [
          m("delta", "总速度增量", dv1 + dv2, "km/s"),
          m("first", "第一次点火", dv1, "km/s"),
          m("second", "第二次点火", dv2, "km/s"),
          m(
            "duration",
            "转移时间",
            (pi * Math.sqrt((a * a * a) / mu)) / 3600,
            "h",
          ),
        ],
        "图中进度为椭圆参数，不是匀速时间；速度增量按瞬时脉冲解析解。",
        [
          graph(
            "总Δv",
            "km",
            "km/s",
            8000,
            42000,
            (r) =>
              Math.sqrt(mu / r1) * (Math.sqrt((2 * r) / (r1 + r)) - 1) +
              Math.sqrt(mu / r) * (1 - Math.sqrt((2 * r1) / (r1 + r))),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C14",
    slug: "exoplanet-transit",
    name: "系外行星凌星",
    question: "恒星暗了一点，怎样推断行星大小？",
    topic: "观测 · 凌星测光",
    known:
      "均匀亮度恒星、中央过境、无临边昏暗；测光按两圆重叠面积，行星半径小于恒星。",
    proof: "完全入盘时深度δ=(Rp/Rs)²；接触阶段用两圆交叠面积/πRs²。",
    history:
      "开普勒和TESS通过微小周期性变暗寻找系外行星；单次变暗还不能独自排除全部假阳性。",
    controls: [
      c("radius", "行星/恒星半径比", "", 0.02, 0.2, 0.01, 0.1),
      c("position", "行星横向位置/星半径", "", -1.5, 1.5, 0.05, 0),
    ],
    compare: "radius",
    metric: "depth",
    scenes: ["小行星", 0.05, "两倍半径", 0.1],
    counter: { position: 1.5 },
    invitation: "让小行星从恒星前方经过，比较暗下去的比例。",
    look: "半径翻倍，凌星深度变几倍？",
    hint: "亮度损失取决于被挡面积，不取决于行星质量。",
    legend: ["金球：恒星", "蓝球：前景行星", "曲线：相对光通量"],
    transfer: "行星不在星盘前方时，亮度损失是多少？",
    solve: (p) => {
      const r = p.radius!,
        flux = (x: number) => {
          const d = Math.abs(x);
          let area = 0;
          if (d <= 1 - r) area = pi * r * r;
          else if (d < 1 + r) {
            area =
              r * r * Math.acos((d * d + r * r - 1) / (2 * d * r)) +
              Math.acos((d * d + 1 - r * r) / (2 * d)) -
              0.5 *
                Math.sqrt(
                  Math.max(
                    0,
                    (-d + r + 1) * (d + r - 1) * (d - r + 1) * (d + r + 1),
                  ),
                );
          }
          return 1 - area / pi;
        },
        b = new Apparatus(true);
      star(b, 400, 230, 120);
      b.ball(400 + p.position! * 120, 230, r * 120, C.blue, 2.2);
      return b.finish(
        [
          m("depth", "当前光通量损失", (1 - flux(p.position!)) * 100, "%"),
          m("maximum", "全入盘凌星深度", r * r * 100, "%"),
        ],
        `当前变暗${((1 - flux(p.position!)) * 100).toFixed(4)}%；仅由均匀星盘的几何遮挡生成。`,
        [graph("凌星光变", "星半径", "相对光通量", -1.5, 1.5, flux)],
      );
    },
  }),
  define({
    ...common,
    id: "C15",
    slug: "stellar-radial-velocity",
    name: "恒星视向速度",
    question: "看不见行星，能从恒星的摇摆找到它吗？",
    topic: "观测 · 多普勒测星",
    known: "太阳质量恒星、圆轨道、行星质量远小于恒星；测量沿视线分量。",
    proof: "K≈(Mp/Ms)√(GMs/a)sin i；v视=K sinφ。",
    history:
      "系外行星视向速度法测量恒星谱线周期偏移，得到的是包含轨道倾角的质量信息。",
    controls: [
      c("inclination", "轨道倾角", "°", 0, 90, 5, 60),
      c("mass", "行星质量/木星", "", 0.1, 5, 0.1, 1),
      c("orbit", "轨道半径", "AU", 0.1, 3, 0.1, 1),
      c("phase", "轨道相位", "°", 0, 360, 5, 90),
    ],
    compare: "inclination",
    metric: "amplitude",
    scenes: ["正面看轨道", 0, "侧面看轨道", 90],
    counter: { mass: 3 },
    invitation: "把轨道从正面转为侧面，观察谱线速度振幅。",
    look: "正面看轨道，没有视向速度就等于没有行星吗？",
    hint: "看不到的是沿视线的分量，不是恒星停止运动。",
    legend: ["金球：恒星", "青环：行星轨道", "蓝球：行星"],
    transfer: "增加行星质量，会怎样影响恒星摇摆幅度？",
    solve: (p) => {
      const i = deg(p.inclination!),
        a = deg(p.phase!),
        K =
          ((p.mass! * 1.89813e27) / MS) *
          Math.sqrt((G * MS) / (p.orbit! * AU)) *
          Math.sin(i),
        b = new Apparatus(true);
      const orbitRadius=110+30*p.orbit!,reflex=orbitRadius*(p.mass!*1.89813e27/MS)*200;
      b.ball(400-reflex*Math.cos(a),230+reflex*Math.sin(a)*Math.cos(i),18,C.gold,-reflex/65*Math.sin(a)*Math.sin(i));
      b.trace(
        Array.from(
          { length: 97 },
          (_, j) =>
            [
              400 + orbitRadius * Math.cos((j * pi) / 48),
              230 - orbitRadius * Math.sin((j * pi) / 48) * Math.cos(i),
            ] as Point,
        ),
      ).ball(
        400 + orbitRadius * Math.cos(a),
        230 - orbitRadius * Math.sin(a) * Math.cos(i),
        9,
        C.blue,
        orbitRadius/65 * Math.sin(a) * Math.sin(i),
      );
      b.text(90,60,'恒星反向位移放大200倍 · 行星轨道为显示比例');
      b.solids[1]!.points=Array.from({length:97},(_,j)=>{
        const phase=j*pi/48;
        return [(orbitRadius*Math.cos(phase))/65,(orbitRadius*Math.sin(phase)*Math.cos(i))/65,(orbitRadius*Math.sin(phase)*Math.sin(i))/65];
      });
      return b.finish(
        [
          m("amplitude", "视向速度半振幅", K, "m/s"),
          m("velocity", "当前视向速度", K * Math.sin(a), "m/s"),
        ],
        `半振幅${K.toFixed(3)} m/s；恒星绕质心反向摇摆在图中放大200倍，不改变速度读数。低倾角会隐藏信号，质量与倾角存在简并。`,
        [graph("视向速度", "°", "m/s", 0, 360, (x) => K * Math.sin(deg(x)))],
      );
    },
  }),
  define({
    ...common,
    id: "C16",
    slug: "habitable-zone",
    name: "宜居带",
    question: "在宜居带里，就一定适合生命吗？",
    topic: "恒星 · 辐照与温度",
    known:
      "仅按入射通量0.35–1.1倍地球定义教学带；灰体平衡、反照率0.3、无温室效应。",
    proof: "F/F地=L/r²；T=[L☉L(1−A)/(16πσr²)]^(1/4)。",
    history:
      "宜居带是允许液态水的条件线索，实际表面环境还受大气、地质和恒星活动影响。",
    controls: [
      c("luminosity", "恒星光度/太阳", "", 0.1, 4, 0.1, 1),
      c("distance", "行星距离", "AU", 0.3, 4, 0.1, 1),
    ],
    compare: "luminosity",
    metric: "temperature",
    scenes: ["太阳光度", 1, "更亮恒星", 2],
    counter: { distance: 4 },
    invitation: "改变恒星亮度，观察宜居带向哪里移动。",
    look: "落在带内是否足以推断地表有液态水？",
    hint: "平衡温度不是含大气温室效应的地表温度。",
    legend: ["金球：恒星", "青蓝环：通量阈值", "蓝点：行星"],
    transfer: "把行星移得很远，低温模型说明什么、没说明什么？",
    solve: (p) => {
      const L = p.luminosity!,
        r = p.distance!,
        inner = Math.sqrt(L / 1.1),
        outer = Math.sqrt(L / 0.35),
        T =
          ((3.828e26 * L * 0.7) / (16 * pi * 5.670374419e-8 * (r * AU) ** 2)) **
          0.25,
        b = new Apparatus(true);
      star(b);
      b.ring(400, 230, 35 + inner * 40)
        .ring(400, 230, 35 + outer * 40, C.blue)
        .ball(400 + 35 + r * 40, 230, 9, C.blue);
      return b.finish(
        [
          m("temperature", "灰体平衡温度", T, "K"),
          m("inner", "教学带内缘", inner, "AU"),
          m("outer", "教学带外缘", outer, "AU"),
          m("flux", "入射通量/地球", L / (r * r), ""),
        ],
        `平衡温度${T.toFixed(1)} K；${r >= inner && r <= outer ? "位于通量定义的带内，但不保证适居。" : "不在本模型定义的通量带内。"}`,
        [
          graph(
            "平衡温度",
            "AU",
            "K",
            0.3,
            4,
            (x) =>
              ((3.828e26 * L * 0.7) /
                (16 * pi * 5.670374419e-8 * (x * AU) ** 2)) **
              0.25,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C17",
    slug: "stellar-blackbody",
    name: "恒星光谱",
    question: "更热的恒星，峰值颜色怎样改变？",
    topic: "恒星 · 黑体辐射",
    known: "恒星按理想黑体，忽略大气谱线；曲线为Bλ并按本温度峰值归一化。",
    proof: "λ峰T=2.897771955×10⁻³ m·K，L=4πR²σT⁴。",
    era: "19—20世纪 · 维恩与普朗克",
    history:
      "黑体辐射的测量推动量子理论发展，维恩位移关系使光谱峰值成为温度线索。",
    controls: [
      c("temperature", "有效温度", "K", 2500, 15000, 250, 6000),
      c("radius", "半径/太阳", "", 0.5, 3, 0.1, 1),
    ],
    compare: "temperature",
    metric: "peak",
    scenes: ["较冷恒星", 3000, "较热恒星", 9000],
    counter: { radius: 2 },
    invitation: "加热恒星模型，看光谱峰从红侧移向蓝侧。",
    look: "温度翻倍，峰值波长和总光度各怎样变化？",
    hint: "图是按波长的Bλ，不能与按频率的Bν峰值混用。",
    legend: ["球色：温度示意", "金线：辐射方向", "曲线：归一化波长谱"],
    transfer: "半径加倍但温度不变，光谱峰会移动吗？",
    solve: (p) => {
      const T = p.temperature!,
        peak = 2.897771955e6 / T,
        planck = (nm: number) =>
          1 / (nm ** 5 * Math.expm1(1.438776877e7 / (nm * T))),
        max = planck(peak),
        L =
          (4 * pi * (p.radius! * RS) ** 2 * 5.670374419e-8 * T ** 4) / 3.828e26,
        b = new Apparatus(true);
      const heatColor = `#${Math.round(255-105*(T-2500)/12500).toString(16).padStart(2,'0')}${Math.round(130+75*(T-2500)/12500).toString(16).padStart(2,'0')}${Math.round(75+180*(T-2500)/12500).toString(16).padStart(2,'0')}`;
      b.ball(400,230,35+15*p.radius!,heatColor);
      for (let i = 0; i < 12; i++) {
        const a = (i * pi) / 6;
        b.line(
          [400 + 90 * Math.cos(a), 230 + 90 * Math.sin(a)],
          [400 + 145 * Math.cos(a), 230 + 145 * Math.sin(a)],
          heatColor,
        );
      }
      return b.finish(
        [
          m("peak", "Bλ峰值波长", peak, "nm"),
          m("luminosity", "黑体光度/太阳", L, ""),
        ],
        `峰值${peak.toFixed(1)} nm；球色是示意，不是经过色彩管理的真实恒星照片。`,
        [graph("Bλ归一化", "nm", "", 100, 2500, (x) => planck(x) / max)],
      );
    },
  }),
  define({
    ...common,
    id: "C18",
    slug: "stellar-lifetime",
    name: "恒星寿命",
    question: "燃料更多的大恒星，为什么反而短命？",
    topic: "恒星 · 主序标度",
    known:
      "0.5–5太阳质量的粗略主序幂律，L∝M³·⁵；寿命按太阳100亿年归一。不是恒星演化计算。",
    proof: "燃料∝M，消耗率∝L；t≈10Gyr×M/L=10M⁻²·⁵ Gyr。",
    history:
      "赫罗图与恒星结构理论把质量、光度和演化联系起来，幂律只用于说明燃料与消耗的竞争。",
    controls: [
      c("mass", "恒星质量/太阳", "", 0.5, 5, 0.1, 1),
      c("fraction", "已用主序寿命比例", "", 0, 1, 0.05, 0.3),
    ],
    compare: "mass",
    metric: "lifetime",
    scenes: ["太阳质量", 1, "两倍质量", 2],
    counter: { mass: 0.5 },
    invitation: "增加恒星质量，看燃料和光度哪一个增长更快。",
    look: "更有燃料为什么不一定活得更久？",
    hint: "寿命取决于燃料除以消耗速率。",
    legend: ["金球：主序星示意", "青条：剩余寿命比例", "曲线：幂律寿命"],
    transfer: "低质量星的长寿预测是否代表它不消耗燃料？",
    solve: (p) => {
      const M = p.mass!,
        L = M ** 3.5,
        t = (10 * M) / L,
        b = new Apparatus(true);
      star(b, 400, 200, 25 + 12 * M);
      b.box(180, 340, 440 * (1 - p.fraction!), 20).text(
        150,
        60,
        "粗略主序标度 · 不模拟红巨星或爆发阶段",
      );
      return b.finish(
        [
          m("lifetime", "估计主序寿命", t, "Gyr"),
          m("luminosity", "光度/太阳", L, ""),
          m("remaining", "估计剩余主序寿命", t * (1 - p.fraction!), "Gyr"),
        ],
        `幂律寿命约${t.toFixed(3)} Gyr；未考虑成分、质量损失与各演化阶段。`,
        [
          graph(
            "主序寿命估计",
            "太阳质量",
            "Gyr",
            0.5,
            5,
            (x) => 10 * x ** -2.5,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C19",
    slug: "neutron-star-compactness",
    name: "中子星致密度",
    question: "把太阳压进一座城，会发生什么？",
    topic: "致密天体 · 紧致度",
    known:
      "球形非旋转质量，紧致度rs/R；只给几何与Schwarzschild表面红移，不求物态方程。",
    proof: "rs=2GM/c²；R>rs时z=(1−rs/R)⁻¹/²−1；R≤rs无静止表面观察者。",
    history:
      "中子星把核物理与相对论连接；真实最大质量、半径和稳定性需要物态方程及广义相对论结构计算。",
    controls: [
      c("radius", "天体半径", "km", 4, 20, 0.5, 12),
      c("mass", "质量/太阳", "", 1, 3, 0.1, 1.4),
    ],
    compare: "radius",
    metric: "compactness",
    scenes: ["较大半径", 16, "较小半径", 8],
    counter: { radius: 4, mass: 3 },
    invitation: "压缩天体，比较半径与引力半径。",
    look: "接近rs时，为什么不能继续沿用静止表面公式？",
    hint: "并不是画出一个球就证明这种天体可以稳定存在。",
    legend: ["蓝球：假想天体", "金环：引力半径", "曲线：紧致度"],
    transfer: "半径落入rs以内时，表面红移还能给有限值吗？",
    solve: (p) => {
      const rs = (2 * G * MS * p.mass!) / LIGHT ** 2 / 1000,
        q = rs / p.radius!,
        b = new Apparatus(true);
      b.ball(400, 230, p.radius! * 8, C.blue).ring(400, 230, rs * 8, C.gold);
      b.solids[0]!.opacity=.24;
      b.text(90,65,'透明剖视：金环为引力半径，不是实际物质壳层');
      return b.finish(
        [
          m("compactness", "紧致度rs/R", q, ""),
          m("schwarzschild", "引力半径", rs, "km"),
          m(
            "redshift",
            "静止表面红移",
            q < 1 ? 1 / Math.sqrt(1 - q) - 1 : null,
            "",
          ),
        ],
        q >= 1
          ? "R≤rs：静止表面模型失效；不能解释为普通中子星。"
          : "几何红移有效不等于物态方程允许稳定天体。",
        [],
        q >= 1 ? "invalid" : "valid",
      );
    },
  }),
  define({
    ...common,
    id: "C20",
    slug: "cosmological-redshift",
    name: "宇宙红移",
    question: "光在宇宙中旅行，波长为何被拉长？",
    topic: "宇宙学 · 膨胀红移",
    known: "采用FLRW尺度因子关系，不把宇宙红移直接当作狭义相对论多普勒速度。",
    proof: "1+z=a今/a发，λ观=(1+z)λ发；T观=T发/(1+z)。",
    history:
      "星系红移与距离关系推动膨胀宇宙图景；光谱整体移位能提供膨胀历史的线索。",
    controls: [
      c("redshift", "红移z", "", 0, 8, 0.1, 1),
      c("wavelength", "发射波长", "nm", 400, 700, 10, 500),
    ],
    compare: "redshift",
    metric: "observed",
    scenes: ["较近红移", 0.5, "较高红移", 2],
    counter: { redshift: 0 },
    invitation: "拉大宇宙尺度因子比，观察同一列波被拉长。",
    look: "波长伸长几倍，单个光子能量变为几分之一？",
    hint: "这里不从z反推唯一距离或旅行时间。",
    legend: ["青波：发射波", "金波：观测波", "两端：发射与接收位置"],
    transfer: "z=0表示这里的波长比是多少？",
    solve: (p) => {
      const q = 1 + p.redshift!,
        b = new Apparatus(true);
      for (const [y, period, col] of [
        [160, 40, C.teal],
        [310, 40 * q, C.gold],
      ] as [number, number, string][])
        b.trace(
          Array.from(
            { length: 301 },
            (_, i) =>
              [
                100 + 2 * i,
                y - 35 * Math.sin((2 * pi * 2 * i) / period),
              ] as Point,
          ),
          col,
        );
      return b.finish(
        [
          m("observed", "观测波长", p.wavelength! * q, "nm"),
          m("scale", "尺度因子比", q, ""),
          m("energy", "光子能量/发射能量", 1 / q, ""),
        ],
        `波长放大${q.toFixed(2)}倍，单光子能量降为${(1 / q).toFixed(4)}；不是普通介质中波速改变。`,
        [graph("观测波长", "z", "nm", 0, 8, (z) => p.wavelength! * (1 + z))],
      );
    },
  }),
  define({
    ...common,
    id: "C21",
    slug: "gravitational-clock",
    name: "引力钟",
    question: "靠近大质量天体，时钟怎样变慢？",
    topic: "相对论 · 引力时间膨胀",
    known:
      "Schwarzschild外部静止观察者，对照无穷远时钟；半径以rs计，忽略自转。",
    proof: "dτ/dt=√(1−rs/r)；地面工程比较还需处理实际参考位置和运动。",
    era: "1915年 · 广义相对论",
    history:
      "引力影响钟速已被精密时钟实验验证；黑洞附近的极端演示不能直接替代地球定位系统的完整校正。",
    controls: [
      c("radius", "距中心半径/rs", "", 1.1, 10, 0.1, 3),
      c("time", "远处经过时间", "h", 0, 24, 0.5, 12),
    ],
    compare: "radius",
    metric: "ratio",
    scenes: ["较近静止钟", 1.5, "较远静止钟", 6],
    counter: { radius: 1.1 },
    invitation: "把时钟移近引力半径，比较累计固有时。",
    look: "静止在近视界处，是否需要额外支撑？",
    hint: "公式只适用r>rs；自由下落的钟需要另一条世界线。",
    legend: ["暗球：引力半径", "青点：静止近处钟", "金环：远处参照示意"],
    transfer: "无限接近rs，静止观察者的支撑需求如何理解？",
    solve: (p) => {
      const r = p.radius!,
        q = Math.sqrt(1 - 1 / r),
        b = new Apparatus(true);
      b.ball(400, 230, 35, C.ink)
        .ring(400, 230, 35 + 17 * r, C.blue)
        .ball(435 + 17 * r, 230, 10, C.teal)
        .text(90, 60, "外部静止世界线 · 不含自由落体");
      const hand=(x:number,value:number,color:string)=>{
        const a=value/12*2*pi;
        b.ring(x,335,35,color).line([x,335],[x+29*Math.sin(a),335-29*Math.cos(a)],color).ball(x,335,4,color);
      };
      hand(190,p.time!,C.gold);hand(605,p.time!*q,C.teal);
      b.text(145,405,'远处参照钟',C.gold).text(560,405,'近处静止钟',C.teal);
      return b.finish(
        [
          m("ratio", "近钟/远钟速率", q, ""),
          m("proper", "近处累计固有时", p.time! * q, "h"),
          m("difference", "累计时间差", p.time! * (1 - q), "h"),
        ],
        `近处钟速率为远处的${q.toFixed(4)}；保持静止需要支撑，视界上不适用。`,
        [graph("钟速比", "r/rs", "", 1.1, 10, (x) => Math.sqrt(1 - 1 / x))],
      );
    },
  }),
  define({
    ...common,
    id: "C22",
    slug: "einstein-lens",
    name: "引力透镜",
    question: "一个遥远光源，为什么会出现两个像？",
    topic: "相对论 · 引力透镜",
    known: "弱场薄透镜、点质量，角位置以爱因斯坦角归一化；不模拟强场多圈像。",
    proof: "θ±=(β±√(β²+4))/2；β→0时形成爱因斯坦环，点源放大率在对齐极限发散。",
    history:
      "引力偏转的预测与观测打开相对论天文窗口；透镜还能探测不可直接发光的质量分布。",
    controls: [
      c("offset", "源角偏移/爱因斯坦角", "", 0, 3, 0.05, 0.8),
      c("einstein", "爱因斯坦角", "角秒", 0.2, 2, 0.1, 1),
    ],
    compare: "offset",
    metric: "separation",
    scenes: ["靠近对齐", 0.3, "偏离对齐", 1.5],
    counter: { offset: 0 },
    invitation: "把背景光源移向透镜中心，看两个像靠近环。",
    look: "两个像的间距与源偏移怎样联系？",
    hint: "光源、透镜和像的位置要分清，图是角位置平面。",
    legend: ["中央金球：点透镜", "青点：源方向", "蓝点或环：像位置"],
    transfer: "完全对齐时，为什么不能给点源一个有限总放大率？",
    solve: (p) => {
      const u = p.offset!,
        root = Math.sqrt(u * u + 4),
        plus = (u + root) / 2,
        minus = (u - root) / 2,
        b = new Apparatus(true);
      b.ball(400, 230, 10, C.gold).ball(400 + u * 70, 230, 6, C.teal, 0.4);
      if (u === 0) b.ring(400, 230, 70, C.blue);
      else
        b.ball(400 + plus * 70, 230, 9, C.blue).ball(
          400 + minus * 70,
          230,
          9,
          C.blue,
        );
      b.line([110,280],[710,280],C.ink)
        .text(90,65,`角位置平面 · 1显示单位 = ${p.einstein!.toFixed(1)}角秒`)
        .text(350,340,'透镜方向',C.gold)
        .text(440+u*50,180,'原光源方向',C.teal);
      if(u===0)b.text(300,120,'对齐：爱因斯坦环',C.blue);
      else b.text(400+plus*70,310,'像＋',C.blue).text(350+minus*70,310,'像－',C.blue);
      return b.finish(
        [
          m("separation", "双像角间距", root * p.einstein!, "角秒"),
          m(
            "magnification",
            "点源总放大率",
            u === 0 ? null : (u * u + 2) / (u * root),
            "",
          ),
        ],
        u === 0
          ? "精确对齐形成环；理想点源放大率发散，有限源大小未建模。"
          : "蓝色为两个像方向；空间台面表示角位置，非真实三维射线路径。",
        [graph("像间距", "源偏移", "θE", 0, 3, (x) => Math.sqrt(x * x + 4))],
      );
    },
  }),
  define({
    ...common,
    id: "C23",
    slug: "relativistic-precession",
    name: "水星进动",
    question: "椭圆轨道的方向，为什么会慢慢转动？",
    topic: "相对论 · 轨道进动",
    known: "太阳中心弱场一阶广义相对论修正；不含其他行星摄动，图面进动角放大。",
    proof: "每圈Δϖ=6πGM/[a(1−e²)c²]，角秒乘206264.806；图中放大5000倍。",
    era: "1915年 · 水星近日点",
    history:
      "水星近日点进动中的额外约43角秒/世纪，是广义相对论的经典检验之一；不是全部总进动。",
    controls: [
      c("axis", "半长轴", "AU", 0.3, 1, 0.01, 0.39),
      c("eccentricity", "偏心率", "", 0, 0.6, 0.02, 0.2),
      c("orbits", "叠画圈数", "", 1, 8, 1, 4),
    ],
    compare: "axis",
    metric: "precession",
    scenes: ["水星附近", 0.39, "地球附近", 1],
    counter: { eccentricity: 0.6 },
    invitation: "减小轨道半长轴，看每圈额外进动变多少。",
    look: "放大的玫瑰线能当作肉眼所见轨道吗？",
    hint: "读数用真实角秒，图面仅为了看清方向累积。",
    legend: ["金球：太阳", "青线：逐圈轨道", "图面：进动角放大5000倍"],
    transfer: "偏心率增大，会使修正项怎样变化？",
    solve: (p) => {
      const a = p.axis!,
        e = p.eccentricity!,
        q = (6 * pi * G * MS) / (a * AU * (1 - e * e) * LIGHT ** 2),
        b = new Apparatus(true);
      star(b);
      for (let n = 0; n < p.orbits!; n++)
        b.trace(
          Array.from({ length: 121 }, (_, i) => {
            const t = (i * pi) / 60,
              ang = t + n * q * 5000,
              r = (150 * (1 - e * e)) / (1 + e * Math.cos(t));
            return [400 + r * Math.cos(ang), 230 - r * Math.sin(ang)] as Point;
          }),
          n % 2 ? C.blue : C.teal,
        );
      return b.finish(
        [
          m("precession", "每圈额外进动", q * 206264.806, "角秒"),
          m(
            "century",
            "每世纪额外进动",
            (q * 206264.806 * 100) / a ** 1.5,
            "角秒/世纪",
          ),
        ],
        "只计算太阳引力的一阶相对论修正；图面角度放大5000倍，不是数值积分的真实角速度。",
        [
          graph(
            "额外进动",
            "AU",
            "角秒/圈",
            0.3,
            1,
            (x) =>
              ((6 * pi * G * MS) / (x * AU * (1 - e * e) * LIGHT ** 2)) *
              206264.806,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C24",
    slug: "hill-sphere",
    name: "希尔球",
    question: "行星的卫星，最远能跟到哪里？",
    topic: "天体力学 · 引力竞争",
    known:
      "太阳质量恒星、圆轨道、行星质量远小于恒星；希尔半径为近似尺度，不保证内部所有轨道稳定。",
    proof: "rH≈a(Mp/(3Ms))^(1/3)；稳定区还依赖顺逆行、偏心率和摄动。",
    history:
      "希尔问题研究较小天体附近的受限三体运动，解释行星卫星与恒星引力竞争的空间尺度。",
    controls: [
      c("mass", "行星质量/地球", "", 1, 300, 1, 1),
      c("orbit", "公转半径", "AU", 0.3, 5, 0.1, 1),
    ],
    compare: "mass",
    metric: "hill",
    scenes: ["地球质量", 1, "八倍质量", 8],
    counter: { orbit: 0.3 },
    invitation: "增加行星质量，观察影响范围是否按同倍数扩大。",
    look: "质量增加八倍，希尔半径增加几倍？",
    hint: "立方根增长，不是线性；边界不是实体壳。",
    legend: ["金球：恒星方向", "蓝球：行星", "青环：近似希尔尺度"],
    transfer: "更靠近恒星时，同一行星还能留住同样远的卫星吗？",
    solve: (p) => {
      const r = p.orbit! * AU * ((p.mass! * 5.9722e24) / (3 * MS)) ** (1 / 3),
        b = new Apparatus(true);
      star(b, 110, 230, 30);
      b.ball(470, 230, 17, C.blue)
        .ring(470, 230, 35 + 25 * p.mass! ** (1 / 3))
        .line([150, 230], [440, 230], C.gold)
        .text(90, 60, "分离尺度示意 · 不按日地距离同比例绘制");
      return b.finish(
        [
          m("hill", "希尔半径", r / 1e6, "千km"),
          m("ratio", "希尔半径/公转半径", r / (p.orbit! * AU), ""),
        ],
        `近似希尔半径${(r / 1e6).toFixed(1)}千km；不是严格稳定轨道边界。`,
        [
          graph(
            "希尔半径",
            "地球质量",
            "千km",
            1,
            300,
            (x) =>
              (p.orbit! * AU * ((x * 5.9722e24) / (3 * MS)) ** (1 / 3)) / 1e6,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C25",
    slug: "rocket-mass-ledger",
    name: "火箭质量账本",
    question: "燃料加倍，速度增量也翻倍吗？",
    topic: "航行 · 火箭方程",
    known:
      "真空无外力、恒定有效排气速度，质量比含燃料消耗；不含引力与气动损失。",
    proof: "Δv=vₑ ln(m₀/mf)；质量比为指数代价，不能用普通恒质量F=ma直接累计。",
    era: "1903年 · 齐奥尔科夫斯基",
    history:
      "火箭方程说明反作用推进与质量消耗的关系，是讨论硬科幻推进方案的基础约束。",
    controls: [
      c("ratio", "初末质量比", "", 1, 20, 0.5, 3),
      c("exhaust", "有效排气速度", "km/s", 1, 10, 0.5, 4.5),
    ],
    compare: "ratio",
    metric: "delta",
    scenes: ["质量比2", 2, "质量比4", 4],
    counter: { ratio: 1 },
    invitation: "增加燃料质量比，比较可获得的速度增量。",
    look: "翻倍质量比带来固定倍数还是固定增量？",
    hint: "质量比1意味着没有可消耗的推进剂。",
    legend: ["青体：末态干质量", "金体：推进剂占比", "红线：排气方向"],
    transfer: "不消耗推进剂时，火箭方程给出多少Δv？",
    solve: (p) => {
      const q = p.ratio!,
        v = p.exhaust! * Math.log(q),
        b = new Apparatus(true);
      b.box(330, 120, 100, 190, C.teal, 1)
        .plate(
          [
            [330, 120],
            [380, 65],
            [430, 120],
          ],
          C.teal,
        )
        .box(340, 140, 80, 150 * (1 - 1 / q), C.gold, 0.8);
      for(const solid of b.solids)if(solid.color===C.teal)solid.opacity=.18;
      b.text(90,55,'透明剖视 · 金色体积表示可消耗推进剂占比');
      for (let i = 0; i < 4; i++)
        b.line([345 + 22 * i, 310], [335 + 28 * i, 360], C.red);
      return b.finish(
        [
          m("delta", "理想速度增量", v, "km/s"),
          m("propellant", "推进剂初始质量占比", 100 * (1 - 1 / q), "%"),
        ],
        `理想Δv=${v.toFixed(3)} km/s；实际任务还需扣除损失并考虑分级。`,
        [
          graph(
            "速度增量",
            "质量比",
            "km/s",
            1,
            20,
            (x) => p.exhaust! * Math.log(x),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C26",
    slug: "relativistic-energy",
    name: "相对论能量",
    question: "越来越接近光速，能量代价为何陡增？",
    topic: "航行 · 相对论动能",
    known: "自由粒子或飞船的平动动能，不包含推进系统效率、制动或燃料质量变化。",
    proof: "γ=1/√(1−β²)，K=(γ−1)mc²；低速极限趋近mv²/2。",
    era: "1905年 · 狭义相对论",
    history:
      "相对论能量关系对高速粒子已获广泛验证；用于星际飞船只说明最低平动能量账本，不能证明推进可实现。",
    controls: [
      c("beta", "速度/光速", "", 0.01, 0.99, 0.01, 0.5),
      c("mass", "载荷质量", "kg", 1, 1000, 1, 100),
    ],
    compare: "beta",
    metric: "kinetic",
    scenes: ["半光速", 0.5, "九成光速", 0.9],
    counter: { beta: 0.01 },
    invitation: "把速度推近光速，比较经典与相对论能量。",
    look: "β从0.9到0.99，能量曲线为什么更陡？",
    hint: "有静质量物体不能靠有限能量达到光速。",
    legend: ["青体：载荷", "金线：运动方向", "曲线：每单位静能的动能"],
    transfer: "低速时，相对论公式能回到经典近似吗？",
    solve: (p) => {
      const q = p.beta!,
        gamma = 1 / Math.sqrt(1 - q * q),
        K = (gamma - 1) * p.mass! * LIGHT ** 2,
        b = new Apparatus(true);
      b.box(250 + q * 200, 190, 100, 70, C.teal, 1)
        .line([160, 225], [250 + q * 200, 225], C.gold)
        .text(90, 60, "平动动能下限 · 不含燃料与制动");
      return b.finish(
        [
          m("kinetic", "相对论动能", K, "J"),
          m("gamma", "洛伦兹因子", gamma, ""),
          m("classical", "经典动能估计", 0.5 * p.mass! * (q * LIGHT) ** 2, "J"),
        ],
        `γ=${gamma.toFixed(5)}；速度越近光速，经典估计越不足。`,
        [
          graph(
            "K/(mc²)",
            "β",
            "",
            0.01,
            0.99,
            (x) => 1 / Math.sqrt(1 - x * x) - 1,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C27",
    slug: "interstellar-dust-impact",
    name: "星际尘埃撞击",
    question: "一粒尘埃，怎样变成星际航行的难题？",
    topic: "航行 · 高速碰撞能量",
    known:
      "飞船参考系中静质量尘埃的相对论动能；只算能量，不模拟等离子体、屏蔽或损伤。",
    proof: "m=4πρr³/3，K=(γ−1)mc²，密度ρ=3000 kg/m³；TNT当量仅作能量单位换算。",
    history:
      "高速星际探测概念必须考虑尘埃碰撞，极小粒子也可携带显著能量；工程防护远比能量换算复杂。",
    controls: [
      c("radius", "尘埃半径", "μm", 1, 100, 1, 10),
      c("beta", "相对速率/光速", "", 0.01, 0.8, 0.01, 0.2),
    ],
    compare: "radius",
    metric: "energy",
    scenes: ["小尘埃", 10, "两倍半径", 20],
    counter: { beta: 0.01 },
    invitation: "把尘埃半径加倍，核算撞击能量。",
    look: "尺寸增加两倍，质量和能量增加几倍？",
    hint: "体积按半径三次方增加，不是面积平方。",
    legend: ["金球：尘埃放大示意", "青板：飞船迎风面", "红线：相对运动"],
    transfer: "降低巡航速度，能量风险怎样变化？",
    solve: (p) => {
      const mass = ((4 * pi) / 3) * (p.radius! * 1e-6) ** 3 * 3000,
        K = (1 / Math.sqrt(1 - p.beta! ** 2) - 1) * mass * LIGHT ** 2,
        b = new Apparatus(true);
      b.box(570, 100, 30, 260, C.teal, 1)
        .ball(200, 230, 5 + p.radius! * 0.3, C.gold)
        .line([240, 230], [550, 230], C.red);
      return b.finish(
        [
          m("energy", "单粒子相对动能", K, "J"),
          m("mass", "尘埃质量", mass, "kg"),
          m("tnt", "等能量TNT质量", K / 4.184e6, "kg"),
        ],
        `单粒能量${K.toExponential(3)} J；TNT数仅为能量换算，不能当成真实爆炸或材料破坏预测。`,
        [
          graph(
            "撞击能量",
            "μm",
            "J",
            1,
            100,
            (r) =>
              (1 / Math.sqrt(1 - p.beta! ** 2) - 1) *
              (((4 * pi) / 3) * (r * 1e-6) ** 3 * 3000) *
              LIGHT ** 2,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C28",
    slug: "telescope-resolution",
    name: "望远镜分辨率",
    question: "望远镜更大，能把多近的两颗星分开？",
    topic: "观测 · 衍射极限",
    known: "圆形孔径、单色理想成像，采用瑞利判据；不含大气视宁度和像差。",
    proof: "θR=1.22λ/D；分辨率不是放大倍数或光子数。",
    history:
      "大口径既收集更多光，也降低衍射角尺度；自适应光学与空间望远镜处理不同限制。",
    controls: [
      c("diameter", "望远镜口径", "m", 0.1, 10, 0.1, 1),
      c("wavelength", "观测波长", "nm", 400, 2000, 50, 550),
      c("separation", "双星角距", "角秒", 0.02, 2, 0.02, 0.2),
    ],
    compare: "diameter",
    metric: "resolution",
    scenes: ["小口径", 1, "大口径", 4],
    counter: { diameter: 0.1 },
    invitation: "增加口径，对照双星角距与衍射极限。",
    look: "把图放大是否能绕过衍射极限？",
    hint: "本实验只给理想极限；真实望远镜还受大气和误差影响。",
    legend: ["青环：圆孔镜面", "两金点：双星", "蓝环：衍射角示意"],
    transfer: "口径很小时，即使放大图像也能分开双星吗？",
    solve: (p) => {
      const theta = ((1.22 * p.wavelength! * 1e-9) / p.diameter!) * 206264.806,
        b = new Apparatus(true);
      b.ring(220, 230, 40 + 7 * p.diameter!, C.blue)
        .ball(500 - p.separation! * 40, 230, 8, C.gold)
        .ball(500 + p.separation! * 40, 230, 8, C.gold)
        .ring(500 - p.separation! * 40, 230, Math.min(100, theta * 70), C.blue)
        .ring(500 + p.separation! * 40, 230, Math.min(100, theta * 70), C.blue);
      return b.finish(
        [
          m("resolution", "瑞利极限角", theta, "角秒"),
          m("ratio", "双星角距/极限角", p.separation! / theta, ""),
        ],
        p.separation! >= theta
          ? "超过瑞利角尺度，理想条件下可按此判据分辨。"
          : "角距低于瑞利尺度；本图圆环仅作尺度说明，不是Airy强度图。",
        [
          graph(
            "瑞利角",
            "m",
            "角秒",
            0.1,
            10,
            (D) => ((1.22 * p.wavelength! * 1e-9) / D) * 206264.806,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C29",
    slug: "interferometer-baseline",
    name: "干涉仪基线",
    question: "两台望远镜，怎样获得更细的角尺度？",
    topic: "观测 · 干涉基线",
    known:
      "两单元理想远场相干干涉；λ/B为特征条纹角尺度，不等于完整成像能力或集光面积。",
    proof: "条纹角尺度≈λ/B；相位差φ=2πB sinθ/λ。",
    history:
      "甚长基线干涉将远隔台站的信号结合，事件视界望远镜以地球尺度基线获得极细角尺度。",
    controls: [
      c("baseline", "基线长度", "km", 0.1, 10000, 0.1, 1000),
      c("wavelength", "观测波长", "mm", 0.5, 10, 0.1, 1.3),
      c("phase", "显示相位", "°", 0, 360, 5, 0),
    ],
    compare: "baseline",
    metric: "scale",
    scenes: ["较短基线", 1000, "地球级基线", 8000],
    counter: { baseline: 0.1 },
    invitation: "拉长台站间基线，观察角条纹变细。",
    look: "角尺度变细是否意味着集光面积也增加？",
    hint: "两台站只有单一基线，完整图像需要多基线和重建。",
    legend: ["两青碟：接收台站", "金线：基线", "蓝波：相干信号示意"],
    transfer: "很短的基线还能获得黑洞级角分辨能力吗？",
    solve: (p) => {
      const scale =
          ((p.wavelength! * 0.001) / (p.baseline! * 1000)) * 206264806,
        b = new Apparatus(true),
        s = 100 + (220 * Math.log10(1 + p.baseline!)) / 4;
      for (const x of [400 - s, 400 + s])
        b.plate(
          [
            [x - 35, 180],
            [x, 210],
            [x + 35, 180],
          ],
          C.blue,
        )
          .line([x, 210], [x, 330])
          .box(x - 30, 330, 60, 15, C.ink);
      b.line([400 - s, 350], [400 + s, 350], C.gold).trace(
        Array.from(
          { length: 121 },
          (_, i) =>
            [100 + 5 * i, 110 - 20 * Math.sin(i / 4 + deg(p.phase!))] as Point,
        ),
        C.blue,
      );
      return b.finish(
        [
          m("scale", "特征条纹角尺度", scale, "毫角秒"),
          m(
            "baseline_wavelengths",
            "基线/波长",
            (p.baseline! * 1e6) / p.wavelength!,
            "",
          ),
        ],
        `λ/B=${scale.toExponential(3)}毫角秒；台站间距为对数取景，不能从图面直接量km。`,
        [
          graph(
            "角尺度",
            "km",
            "毫角秒",
            0.1,
            10000,
            (B) => ((p.wavelength! * 0.001) / (B * 1000)) * 206264806,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "C30",
    slug: "hubble-distance-ladder",
    name: "哈勃距离梯",
    question: "红移越大，离我们就一定按直线更远吗？",
    topic: "宇宙学 · 低红移近似",
    known:
      "仅限低红移z≤0.1，采用v≈cz和d≈cz/H₀；不是高红移测距或完整宇宙年龄模型。",
    proof: "v≈H₀d，d≈cz/H₀；1 Mpc=3.08567758×10¹⁹ km。",
    era: "1920年代 · 勒梅特与哈勃",
    history:
      "星系距离与退行红移的统计关系成为膨胀宇宙的重要证据，现代H₀测量仍存在不同方法间的张力。",
    controls: [
      c("redshift", "低红移z", "", 0.001, 0.1, 0.001, 0.03),
      c("hubble", "哈勃常数", "km/(s·Mpc)", 60, 80, 1, 70),
    ],
    compare: "redshift",
    metric: "distance",
    scenes: ["较低红移", 0.02, "两倍红移", 0.04],
    counter: { hubble: 80 },
    invitation: "增加低红移，比较近似距离和光行时尺度。",
    look: "H₀换一个值，同样红移的距离如何变化？",
    hint: "光行时仅d/c低z近似，不是精确宇宙学回望时间。",
    legend: ["左点：本地星系", "青点：远方星系", "金线：低z距离示意"],
    transfer: "H₀的不确定性会怎样传递到距离？",
    solve: (p) => {
      const v = (p.redshift! * LIGHT) / 1000,
        d = v / p.hubble!,
        b = new Apparatus(true);
      b.ball(160, 230, 15, C.gold)
        .ball(240 + (400 * p.redshift!) / 0.1, 230, 15, C.teal)
        .line([180, 230], [220 + (400 * p.redshift!) / 0.1, 230], C.gold)
        .text(90, 60, "仅低z近似 · 不外推到遥远早期宇宙");
      return b.finish(
        [
          m("distance", "低z近似距离", d, "Mpc"),
          m("velocity", "cz近似退行速度", v, "km/s"),
          m("lighttime", "d/c近似时间尺度", d * 3.26156, "百万年"),
        ],
        `距离约${d.toFixed(2)} Mpc；z≤0.1仍有宇宙学高阶修正，时间不是精确回望时间。`,
        [
          graph(
            "低z距离",
            "z",
            "Mpc",
            0.001,
            0.1,
            (z) => (z * LIGHT) / 1000 / p.hubble!,
          ),
        ],
      );
    },
  }),
];
