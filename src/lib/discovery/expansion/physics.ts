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
export const physicsAdditions = [
  define({
    id: "P11",
    slug: "projectile-launch",
    name: "抛体发射台",
    question: "相同速度，哪个角度飞得远？",
    topic: "力学 · 运动分解",
    known: "真空、平地起落，g=9.8 m/s²；轨迹按当前射程自适应取景。",
    proof: "x=v cosθ t，y=v sinθ t−gt²/2；R=v²sin2θ/g，T=2v sinθ/g。",
    era: "17世纪 · 伽利略",
    history:
      "伽利略把水平匀速运动与竖直加速运动叠加，说明理想抛体轨迹为何是抛物线。",
    source: source.physics,
    sourceTitle: "OpenStax · Projectile Motion",
    controls: [
      c("angle", "发射角", "°", 5, 85, 1, 30),
      c("speed", "初速度", "m/s", 2, 30, 0.5, 12),
      c("progress", "飞行进度", "", 0, 1, 0.01, 0.5),
    ],
    compare: "angle",
    metric: "range",
    scenes: ["低角度", 30, "高角度", 60],
    counter: { angle: 45 },
    invitation: "改变发射角，让金色小球走过轨迹。",
    look: "30°和60°的射程相同，最高点也一样吗？",
    hint: "比较互余角，先固定初速度。",
    legend: ["青色：完整轨迹", "金色：当前位置", "两轴：水平与高度"],
    transfer: "只比较射程，能唯一确定发射角吗？",
    solve: (p) => {
      const a = deg(p.angle!),
        v = p.speed!,
        T = (2 * v * Math.sin(a)) / 9.8,
        R = (v * v * Math.sin(2 * a)) / 9.8,
        H = (v * v * Math.sin(a) ** 2) / 19.6,
        t = T * p.progress!,
        s = 500 / Math.max(R, 2 * H, 1),
        b = new Apparatus();
      b.base()
        .line([120, 350], [700, 350], C.ink)
        .trace(
          Array.from({ length: 81 }, (_, i) => {
            const u = (T * i) / 80;
            return [
              120 + v * Math.cos(a) * u * s,
              350 - (v * Math.sin(a) * u - 4.9 * u * u) * s,
            ] as Point;
          }),
        )
        .ball(
          120 + v * Math.cos(a) * t * s,
          350 - (v * Math.sin(a) * t - 4.9 * t * t) * s,
          11,
        )
        .text(90, 60, "同高起落 · 无空气阻力");
      return b.finish(
        [
          m("range", "水平射程", R, "m"),
          m("height", "最大高度", H, "m"),
          m("flight", "飞行时间", T, "s"),
        ],
        `射程${R.toFixed(2)} m；高度${H.toFixed(2)} m。互余角同射程不等于同轨迹。`,
        [
          graph(
            "射程随角度",
            "°",
            "m",
            5,
            85,
            (x) => (v * v * Math.sin(2 * deg(x))) / 9.8,
          ),
        ],
      );
    },
  }),
  define({
    id: "P12",
    slug: "atwood-machine",
    name: "阿特伍德机",
    question: "只差一点质量，如何慢慢加速？",
    topic: "力学 · 牛顿定律",
    known: "轻绳、无摩擦无质量滑轮；两块质量可不同，绳长保持。",
    proof: "a=(m₂−m₁)g/(m₁+m₂)，T=2m₁m₂g/(m₁+m₂)。",
    era: "1784年 · 阿特伍德",
    history: "阿特伍德机用两侧重力之差产生较小加速度，便于测量牛顿第二定律。",
    source: source.physics,
    sourceTitle: "OpenStax · Applications of Newton’s Laws",
    controls: [
      c("mass2", "右侧质量", "kg", 0.5, 5, 0.1, 2),
      c("mass1", "左侧质量", "kg", 0.5, 5, 0.1, 1),
      c("position", "初始位置偏移（右向下）", "m", -0.8, 0.8, 0.02, 0.3),
      c("time", "释放后时间", "s", 0, 2, .01, 0),
    ],
    compare: "mass2",
    metric: "acceleration",
    time: {key:'time',max:2,rate:.15,caption:'从静止释放，真实时间的0.15倍慢放；到行程端点停止。'},
    scenes: ["质量相同", 1, "右侧更重", 2],
    counter: { mass2: 0.5 },
    invitation: "增加右侧砝码，观察两侧运动趋势。",
    look: "加速度变了，绳两边张力是否仍相同？",
    hint: "合外力除以两块总质量，不能只除以较重的质量。",
    legend: ["青色：左砝码", "金色：右砝码", "圆轮：理想滑轮"],
    transfer: "右侧比左侧轻时，加速度符号表示什么？",
    solve: (p) => {
      const a = ((p.mass2! - p.mass1!) * 9.8) / (p.mass1! + p.mass2!),
        T = (2 * p.mass1! * p.mass2! * 9.8) / (p.mass1! + p.mass2!),
        available=Math.max(0,.8-Math.sign(a)*p.position!),
        arrival=Math.abs(a)>1e-12?Math.sqrt(2*available/Math.abs(a)):2,
        t=Math.min(p.time??0,arrival),
        displacement=p.position!+.5*a*t*t,
        y = displacement * 80,
        b = new Apparatus();
      b.base()
        .wheel(400, 100, 55, displacement*80/55, C.ink)
        .line([345, 100], [345, 250 - y])
        .line([455, 100], [455, 250 + y], C.gold)
        .box(315, 250 - y, 60, 55)
        .box(425, 250 + y, 40 + 15 * p.mass2!, 55, C.gold)
        .text(125, 60, "同一根轻绳 · 两侧等张力");
      return b.finish(
        [
          m("acceleration", "右块向下加速度", a, "m/s²"),
          m("tension", "绳张力", T, "N"),
          m('position','右块位置',displacement,'m'),
          m('speed','右块速度',a*t,'m/s'),
          m('arrival','运动行程结束时间',arrival,'s'),
        ],
        `右块向下为正：a=${a.toFixed(3)} m/s²。初始静止，位置按x=x₀+at²/2推进；到行程端点暂停，不模拟碰撞。`,
        [
          graph(
            "加速度",
            "kg",
            "m/s²",
            0.5,
            5,
            (x) => ((x - p.mass1!) * 9.8) / (x + p.mass1!),
          ),
        ],
      );
    },
  }),
  define({
    id: "P13",
    slug: "centripetal-force",
    name: "圆周运动台",
    question: "速度翻倍，拉绳要多用多少力？",
    topic: "力学 · 圆周运动",
    known: "水平面匀速圆周运动，竖直支持力平衡重力；箭头仅示意方向。",
    proof: "aᵣ=v²/r；Fᵣ=mv²/r；T=2πr/v。",
    era: "17世纪 · 惠更斯与牛顿",
    history:
      "圆周运动将不断改变的速度方向与指向圆心的加速度联系起来，是轨道力学的重要起点。",
    source: source.physics,
    sourceTitle: "OpenStax · Uniform Circular Motion",
    controls: [
      c("speed", "速率", "m/s", 0.5, 10, 0.1, 2),
      c("radius", "轨道半径", "m", 0.5, 4, 0.1, 2),
      c("mass", "质量", "kg", 0.1, 3, 0.1, 1),
      c("angle", "转角", "°", 0, 360, 1, 35),
    ],
    compare: "speed",
    metric: "force",
    scenes: ["慢速", 2, "两倍速率", 4],
    counter: { radius: 4 },
    invitation: "把速率加倍，比较向心力。",
    look: "速率不变时，速度为什么仍在变？",
    hint: "速度包含方向；向心力始终垂直瞬时速度。",
    legend: ["圆环：运动平面", "金球：质点", "径向线：绳与力的方向"],
    transfer: "同样速率，把半径加倍会怎样？",
    solve: (p) => {
      const F = (p.mass! * p.speed! ** 2) / p.radius!,
        a = deg(p.angle!),
        r = 50 + 28 * p.radius!,
        b = new Apparatus();
      b.ring(400, 225, r)
        .line(
          [400, 225],
          [400 + r * Math.cos(a), 225 - r * Math.sin(a)],
          C.gold,
        )
        .ball(400 + r * Math.cos(a), 225 - r * Math.sin(a), 14)
        .line(
          [400 + r * Math.cos(a), 225 - r * Math.sin(a)],
          [
            400 + r * Math.cos(a) - 50 * Math.sin(a),
            225 - r * Math.sin(a) - 50 * Math.cos(a),
          ],
          C.blue,
        )
        .text(80, 55, "切向速度 · 径向拉力（力线限幅显示）");
      const fshow = (90 * F) / (F + 8);
      b.line(
        [400 + r * Math.cos(a), 225 - r * Math.sin(a)],
        [400 + (r - fshow) * Math.cos(a), 225 - (r - fshow) * Math.sin(a)],
        C.red,
      );
      b.solids=b.solids.map(s=>s.type==='label'?s:{...s,points:s.points.map(v=>[v[0],0,v[1]])});
      return b.finish(
        [
          m("force", "所需向心力", F, "N"),
          m("period", "周期", (2 * pi * p.radius!) / p.speed!, "s"),
        ],
        `所需向心力${F.toFixed(3)} N；速率翻倍时力增为四倍。`,
        [
          graph(
            "向心力",
            "m/s",
            "N",
            0.5,
            10,
            (x) => (p.mass! * x * x) / p.radius!,
          ),
        ],
      );
    },
  }),
  define({
    id: "P14",
    slug: "torque-balance",
    name: "力矩平衡尺",
    question: "更远的位置，能用更小的力吗？",
    topic: "力学 · 力矩",
    known: "理想无质量杠杆，左侧20 N、力臂0.6 m；右力竖直向下。",
    proof: "τ=Fr；静止平衡时F右 r右=20×0.6=12 N·m。",
    era: "古希腊 · 阿基米德",
    history: "杠杆规律用力与力臂的乘积描述平衡，阿基米德的论述成为静力学经典。",
    source: source.physics,
    sourceTitle: "OpenStax · Static Equilibrium",
    controls: [
      c("arm", "右侧力臂", "m", 0.2, 1.5, 0.05, 0.6),
      c("force", "实际右侧力", "N", 0, 80, 1, 20),
    ],
    compare: "arm",
    metric: "required",
    scenes: ["短力臂", 0.6, "长力臂", 1.2],
    counter: { force: 0 },
    invitation: "向外移动右侧作用点，检查平衡所需的力。",
    look: "实际力不随位置自动改变，比较净力矩再判断平衡。",
    hint: "读数给出所需力；图上的实际力仍由另一滑块决定。",
    legend: ["三角支座：支点", "金色：左侧固定载荷", "青色：右侧作用点"],
    transfer: "移远作用点后，保持原来的力还能平衡吗？",
    solve: (p) => {
      const net = p.force! * p.arm! - 12,
        b = new Apparatus();
      b.base()
        .plate(
          [
            [380, 370],
            [420, 370],
            [400, 310],
          ],
          C.ink,
        )
        .line([200, 310], [680, 310], C.ink)
        .line([280, 310], [280, 365], C.gold)
        .ball(280, 365, 14, C.gold)
        .line([400 + 180 * p.arm!, 310], [400 + 180 * p.arm!, 365])
        .ball(400 + 180 * p.arm!, 365, 14)
        .text(
          80,
          70,
          `左力矩 12 N·m · 右力矩 ${(p.force! * p.arm!).toFixed(2)} N·m`,
        );
      return b.finish(
        [
          m("required", "平衡所需右力", 12 / p.arm!, "N"),
          m("net", "顺时针净力矩", net, "N·m"),
        ],
        Math.abs(net) < 1e-8
          ? "力矩平衡。"
          : "当前不平衡；装置示意保持水平并不代表已经平衡。",
        [graph("所需力", "m", "N", 0.2, 1.5, (x) => 12 / x)],
      );
    },
  }),
  define({
    id: "P15",
    slug: "spring-energy-store",
    name: "弹簧能量仓",
    question: "多压一倍，能量会多一倍吗？",
    topic: "力学 · 弹性势能",
    known: "线性弹簧，忽略摩擦；压缩后释放至原长，把弹性势能转为滑块动能。",
    proof: "E=kx²/2=mv²/2；v=x√(k/m)。",
    era: "17世纪 · 胡克",
    history:
      "胡克定律描述弹性范围内力与形变成正比，力—位移图下的面积给出弹性势能。",
    source: source.physics,
    sourceTitle: "OpenStax · Potential Energy",
    controls: [
      c("compression", "压缩量", "m", 0, 0.5, 0.01, 0.1),
      c("stiffness", "劲度系数", "N/m", 20, 500, 10, 100),
      c("mass", "滑块质量", "kg", 0.1, 2, 0.1, 0.5),
      c('release','释放进度','',0,1,.01,0),
    ],
    compare: "compression",
    metric: "energy",
    time: {key:'release',max:1,rate:.25,rateAt:p=>Math.sqrt(p.stiffness!/p.mass!)*2/Math.PI*.02,caption:'简谐释放到原长；真实时间的0.02倍慢放，进度不是秒。'},
    scenes: ["压缩一点", 0.1, "压缩两倍", 0.2],
    counter: { compression: 0 },
    invitation: "压缩弹簧，比较力—位移图下面积。",
    look: "储能翻几倍，释放后的速度又翻几倍？",
    hint: "力随压缩增加，做功不是末态力直接乘位移。",
    legend: ["折线：弹簧", "青色：滑块", "金色：原长位置"],
    transfer: "没有压缩时，能否凭弹簧获得动能？",
    solve: (p) => {
      const x = p.compression!,
        k = p.stiffness!,
        E = (k * x * x) / 2,
        displacement=x*Math.cos((p.release??0)*pi/2),
        kinetic=E*Math.sin((p.release??0)*pi/2)**2,
        end = 390 - 200 * displacement,
        b = new Apparatus();
      b.base()
        .box(80, 185, 25, 130, C.ink)
        .spring(105,250,end-105)
        .box(end, 215, 65, 70)
        .line([390, 180], [390, 320], C.gold)
        .text(100, 70, "弹性范围内 · 无摩擦释放");
      return b.finish(
        [
          m("energy", "弹性势能", E, "J"),
          m("force", "末态弹力", k * x, "N"),
          m("speed", "原长处速率", x * Math.sqrt(k / p.mass!), "m/s"),
          m('elastic','当前弹性势能',E-kinetic,'J'),
          m('kinetic','当前动能',kinetic,'J'),
        ],
        `储能${E.toFixed(3)} J；不能把变化的弹力当作恒力计算功。`,
        [graph("弹力", "m", "N", 0, 0.5, (q) => k * q)],
      );
    },
  }),
  define({
    id: "P16",
    slug: "venturi-tube",
    name: "文丘里管",
    question: "流得更快的地方，压力更高吗？",
    topic: "流体 · 连续性与伯努利",
    known: "水平、稳态、不可压、无黏液体；宽管直径4 cm，宽段表压100 kPa。",
    proof: "A₁v₁=A₂v₂；p₂=p₁+ρ(v₁²−v₂²)/2，ρ=1000 kg/m³。",
    era: "18世纪 · 伯努利与文丘里",
    history: "伯努利关系连接流速、高度与压力，文丘里管通过缩口制造可测的压差。",
    source: source.physics,
    sourceTitle: "OpenStax · Bernoulli’s Equation",
    controls: [
      c("diameter", "窄管直径", "cm", 1.5, 4, 0.1, 3),
      c("speed", "宽管流速", "m/s", 0.1, 2, 0.1, 1),
    ],
    compare: "diameter",
    metric: "pressure",
    scenes: ["较宽缩口", 3, "较窄缩口", 2],
    counter: { speed: 0.1 },
    invitation: "收窄中央管口，看流速与压差一起变化。",
    look: "管径减半，面积和流速各怎样变化？",
    hint: "先算面积比，不是直径比。",
    legend: ["青色边界：流管", "金色线：流动方向", "竖柱：压差示意"],
    transfer: "把流速降下来，压差会按几次方缩小？",
    solve: (p) => {
      const v = p.speed! * (4 / p.diameter!) ** 2,
        pressure = 100000 + 500 * (p.speed! ** 2 - v * v),
        h = 25 * p.diameter!,
        b = new Apparatus();
      b.plate(
        [
          [80, 130],
          [270, 130],
          [340, 230 - h],
          [460, 230 - h],
          [530, 130],
          [720, 130],
          [720, 330],
          [530, 330],
          [460, 230 + h],
          [340, 230 + h],
          [270, 330],
          [80, 330],
        ],
        C.blue,
      )
        .line([100, 230], [690, 230], C.gold)
        .box(170, 30, 15, 100, C.blue)
        .box(390, 230-h-pressure/1000, 15, pressure/1000, C.blue)
        .text(100, 410, "水平稳流 · 蓝柱长度随表压变化，不代表实际水柱高度");
      b.solids.shift(); // Replace the section polygon by a genuine circular flow passage.
      const rings=[[80,100],[270,100],[340,h],[460,h],[530,100],[720,100]];
      for(let k=0;k<rings.length-1;k++)for(let i=0;i<32;i++){
        const a=i*2*pi/32,d=(i+1)*2*pi/32,[x,r]=rings[k]!,[nx,nr]=rings[k+1]!;
        b.solids.push({type:'polygon',points:[b.v([x!,230+r!*Math.cos(a)],r!/65*Math.sin(a)),b.v([nx!,230+nr!*Math.cos(a)],nr!/65*Math.sin(a)),b.v([nx!,230+nr!*Math.cos(d)],nr!/65*Math.sin(d)),b.v([x!,230+r!*Math.cos(d)],r!/65*Math.sin(d))],color:C.blue,opacity:.18});
      }
      for(const [x,r] of rings)b.solids.push({type:'line',points:Array.from({length:49},(_,i)=>b.v([x!,230+r!*Math.cos(i*pi/24)],r!/65*Math.sin(i*pi/24))),color:C.blue});
      b.arrow([100,230],[100+30+p.speed!*35,230],C.gold).arrow([350,230],[350+Math.min(95,20+v*10),230],C.gold);
      return b.finish(
        [
          m("pressure", "窄口表压", pressure / 1000, "kPa"),
          m("speed", "窄口流速", v, "m/s"),
          m("drop", "压差", (100000 - pressure) / 1000, "kPa"),
        ],
        `窄口流速${v.toFixed(2)} m/s，表压${(pressure / 1000).toFixed(2)} kPa；实际损失与气蚀未建模。`,
        [
          graph(
            "窄口表压",
            "cm",
            "kPa",
            1.5,
            4,
            (d) =>
              (100000 +
                500 * (p.speed! ** 2 - (p.speed! * (4 / d) ** 2) ** 2)) /
              1000,
          ),
        ],
      );
    },
  }),
  define({
    id: "P17",
    slug: "hydrostatic-pressure",
    name: "液柱压力台",
    question: "同一深度，容器形状重要吗？",
    topic: "流体 · 液体压强",
    stage: "初中定量 · 高中复核",
    known: "静止均匀液体，表面承受101325 Pa大气压；探针读表压和绝对压。",
    proof: "p表=ρgh，p绝=p大气+ρgh；同一液体同一水平面压强相等。",
    era: "17世纪 · 帕斯卡",
    history:
      "静水压与液柱高度有关，宽底与窄底不改变同深度的压强，这常被称作静水压佯谬。",
    source: source.physics,
    sourceTitle: "OpenStax · Pressure in a Fluid",
    controls: [
      c("depth", "探针深度", "m", 0, 5, 0.1, 1),
      c("density", "液体密度", "kg/m³", 700, 1400, 10, 1000),
      c("width", "容器显示宽度", "示意单位", 300, 600, 20, 480),
    ],
    compare: "depth",
    metric: "gauge",
    scenes: ["一米深", 1, "两米深", 2],
    counter: { density: 700 },
    invitation: "把探针往下放，对照液面和压力。",
    look: "深度为0时，为什么表压为0而绝对压不为0？",
    hint: "不要把大气压重复加进ρgh。",
    legend: ["蓝色：静止液体", "金球：压力探针", "横线：自由液面"],
    transfer: "密度减小，保持深度时读数怎样变化？",
    solve: (p) => {
      const q = p.density! * 9.8 * p.depth!,
        b = new Apparatus();
      b.box(400 - p.width! / 2, 100, p.width!, 270, C.blue, 0.8);
      for (const solid of b.solids) solid.opacity = 0.12;
      b.line([400 - p.width! / 2, 100], [400 + p.width! / 2, 100], C.blue)
        .ball(400, 100 + 50 * p.depth!, 12)
        .line([410, 100 + 50 * p.depth!], [700, 100 + 50 * p.depth!], C.gold)
        .text(175, 65, "自由液面 · 大气压101325 Pa");
      return b.finish(
        [
          m("gauge", "探针表压", q / 1000, "kPa"),
          m("absolute", "绝对压", (101325 + q) / 1000, "kPa"),
        ],
        `表压${(q / 1000).toFixed(3)} kPa；绝对压仍包含大气压。`,
        [
          graph(
            "表压随深度",
            "m",
            "kPa",
            0,
            5,
            (h) => (p.density! * 9.8 * h) / 1000,
          ),
        ],
      );
    },
  }),
  define({
    id: "P18",
    slug: "young-double-slit",
    name: "双缝光屏",
    question: "两条缝，为什么不只出现两条亮线？",
    topic: "光学 · 干涉",
    known: "单色相干光、等强点缝、远场小角近似；包络与真实光强未标定。",
    proof: "Δx=λL/d；I/Imax=cos²(πdy/(λL))。",
    era: "1801年 · 托马斯·杨",
    history:
      "杨的双缝实验以明暗相间的干涉条纹支持光的波动解释；这里的强度是归一化教学模型。",
    source: source.waves,
    sourceTitle: "OpenStax · Young’s Double Slit Experiment",
    controls: [
      c("separation", "双缝间距", "mm", 0.1, 1, 0.05, 0.3),
      c("wavelength", "波长", "nm", 400, 700, 10, 550),
      c("distance", "屏距", "m", 0.5, 3, 0.1, 1.5),
    ],
    compare: "separation",
    metric: "spacing",
    scenes: ["近双缝", 0.2, "远双缝", 0.4],
    counter: { wavelength: 700 },
    invitation: "拉开两条缝，比较屏上条纹间距。",
    look: "双缝距离增大时，条纹反而更密吗？",
    hint: "只改变间距，保持波长和屏距。",
    legend: ["左侧：相干入射", "两孔：双缝", "右侧：归一化亮条纹"],
    transfer: "改用更长波长，会把条纹拉开吗？",
    solve: (p) => {
      const spacing =
          (p.wavelength! * 1e-9 * p.distance!) / (p.separation! * 1e-3),
        b = new Apparatus();
      b.box(245, 90, 15, 280, C.ink)
        .box(650, 80, 15, 300, C.ink)
        .ball(250, 230 - 40 * p.separation!, 5, C.gold)
        .ball(250, 230 + 40 * p.separation!, 5, C.gold)
        .line([100, 230], [240, 230], C.gold);
      for (let i = -7; i <= 7; i++) {
        const y = 230 + i * spacing * 12000;
        if (y > 85 && y < 375) b.line([620, y], [690, y], C.gold);
      }
      return b.finish(
        [m("spacing", "相邻亮纹间距", spacing * 1000, "mm")],
        `亮纹间距${(spacing * 1000).toFixed(3)} mm；屏幕条纹位置按固定显示比例示意。`,
        [
          graph(
            "归一化强度",
            "mm",
            "",
            -15,
            15,
            (y) => Math.cos((pi * y * 0.001) / spacing) ** 2,
          ),
        ],
      );
    },
  }),
  define({
    id: "P19",
    slug: "single-slit-diffraction",
    name: "单缝衍射",
    question: "缝越窄，光为什么散得越开？",
    topic: "光学 · 衍射",
    known: "单色远场、均匀单缝；暗纹角满足sinθ=λ/a，屏宽用小角近似。",
    proof: "第一暗纹sinθ=λ/a；中央亮纹宽≈2λL/a；I/I₀=(sinβ/β)²。",
    era: "19世纪 · 夫琅禾费",
    history:
      "夫琅禾费研究远场衍射，为光谱测量与衍射光学建立基础；几何光学的直线边界在窄缝处不再够用。",
    source: source.waves,
    sourceTitle: "OpenStax · Single-Slit Diffraction",
    controls: [
      c("width", "缝宽", "mm", 0.03, 0.3, 0.01, 0.1),
      c("wavelength", "波长", "nm", 400, 700, 10, 550),
      c("distance", "屏距", "m", 0.5, 3, 0.1, 1),
    ],
    compare: "width",
    metric: "central",
    scenes: ["宽缝", 0.2, "窄缝", 0.1],
    counter: { distance: 2 },
    invitation: "缩窄单缝，观察中央亮带扩散。",
    look: "中央亮带宽度与缝宽成什么关系？",
    hint: "中央亮纹两侧各有一个第一暗纹。",
    legend: ["金色：光束", "左板：狭缝", "右屏：第一暗纹边界"],
    transfer: "同样缝宽，把屏移远会怎样？",
    solve: (p) => {
      const a = p.width! * 0.001,
        lam = p.wavelength! * 1e-9,
        w = (2 * lam * p.distance!) / a,
        b = new Apparatus(),
        dy = Math.min(145, w * 9000);
      b.box(220, 80, 18, 300, C.ink)
        .line([100, 230], [220, 230], C.gold)
        .box(660, 65, 15, 330, C.ink)
        .line([238, 230], [660, 230 - dy], C.gold)
        .line([238, 230], [660, 230 + dy], C.gold)
        .plate(
          [
            [238, 230],
            [660, 230 - dy],
            [660, 230 + dy],
          ],
          C.gold,
        );
      return b.finish(
        [
          m("central", "中央亮纹宽度", w * 1000, "mm"),
          m("angle", "第一暗纹角", (Math.asin(lam / a) * 180) / pi, "°"),
        ],
        `中央宽度${(w * 1000).toFixed(3)} mm；图面角度为放大示意，数值采用远场近似。`,
        [
          graph("归一化强度", "mm", "", -30, 30, (y) => {
            const z = (pi * a * y * 0.001) / (lam * p.distance!);
            return Math.abs(z) < 1e-9 ? 1 : (Math.sin(z) / z) ** 2;
          }),
        ],
      );
    },
  }),
  define({
    id: "P20",
    slug: "acoustic-beats",
    name: "拍频听音台",
    question: "两个近似音调，为什么一强一弱？",
    topic: "波动 · 拍频",
    known: "等振幅、同相正弦叠加；波形可视化，不自动播放声音。",
    proof: "sin2πf₁t+sin2πf₂t=2sin[π(f₁+f₂)t]cos[π(f₂−f₁)t]；拍频=|f₂−f₁|。",
    era: "19世纪 · 声学与调音",
    history:
      "乐器调音时，接近同音的两声源会出现缓慢强弱变化，拍频给出频率差的直观线索。",
    source: source.physics,
    sourceTitle: "OpenStax · Beats",
    controls: [
      c("difference", "频率差", "Hz", 0, 10, 0.5, 2),
      c("base", "第一频率", "Hz", 20, 80, 1, 40),
      c("time", "观察时刻", "s", 0, 2, 0.01, 0.5),
    ],
    compare: "difference",
    metric: "beat",
    scenes: ["慢拍", 2, "快拍", 4],
    counter: { difference: 0 },
    invitation: "把频率差加倍，数一数包络鼓起的次数。",
    look: "快速振动频率和缓慢拍频是同一个量吗？",
    hint: "拍频计强度峰，不能把带符号包络的周期直接当拍周期。",
    legend: ["青色：叠加振动", "金色：包络上边界", "横向：时间"],
    transfer: "两个频率完全相同，还会有拍吗？",
    time: { key: "time", max: 2, rate: 0.25 },
    solve: (p) => {
      const f = p.base!,
        df = p.difference!,
        b = new Apparatus();
      b.trace(
        Array.from({ length: 601 }, (_, i) => {
          const t = i / 300;
          return [
            80 + i,
            230 -
              60 * (Math.sin(2 * pi * f * t) + Math.sin(2 * pi * (f + df) * t)),
          ] as Point;
        }),
      )
        .trace(
          Array.from(
            { length: 201 },
            (_, i) =>
              [
                80 + i * 3,
                230 - 120 * Math.abs(Math.cos((pi * df * i) / 100)),
              ] as Point,
          ),
          C.gold,
        )
        .line([80 + 300 * p.time!, 85], [80 + 300 * p.time!, 375], C.red)
        .text(80, 55, "时间窗2秒 · 位移归一化");
      return b.finish(
        [
          m("beat", "拍频", df, "Hz"),
          m(
            "envelope",
            "当前包络幅值",
            2 * Math.abs(Math.cos(pi * df * p.time!)),
            "",
          ),
        ],
        df === 0
          ? "同频同相，无拍；振动仍存在。"
          : `每秒${df}次强弱起伏；快速载波约${(f + df / 2).toFixed(1)} Hz。`,
        [
          graph(
            "包络幅值",
            "s",
            "",
            0,
            2,
            (t) => 2 * Math.abs(Math.cos(pi * df * t)),
          ),
        ],
      );
    },
  }),
  define({
    id: "P21",
    slug: "standing-wave-string",
    name: "驻波弦",
    question: "一根弦，怎样同时出现几个波腹？",
    topic: "波动 · 驻波与谐波",
    known: "两端固定、理想均匀弦，小振幅；振幅显示不代表实际米数。",
    proof: "v=√(T/μ)，fₙ=nv/(2L)，y∝sin(nπx/L)cos(2πfₙt)。",
    era: "18世纪 · 梅森与欧拉",
    history: "弦长、张力和线密度决定乐音；驻波把边界条件与离散谐波联系起来。",
    source: source.physics,
    sourceTitle: "OpenStax · Standing Waves",
    controls: [
      c("mode", "谐波阶数", "", 1, 6, 1, 1),
      c("tension", "张力", "N", 10, 100, 5, 40),
      c("length", "弦长", "m", 0.5, 2, 0.1, 1),
      c("phase", "振动相位", "°", 0, 360, 1, 0),
    ],
    compare: "mode",
    metric: "frequency",
    scenes: ["基频", 1, "第三谐波", 3],
    counter: { tension: 10 },
    invitation: "选择第三谐波，找到不动的波节。",
    look: "阶数增大，频率和波腹数怎样变化？",
    hint: "两端始终为波节；相位改变形状，不改变固有频率。",
    legend: ["青线：弦形", "端点：固定边界", "金点：内部波节"],
    transfer: "降低张力，所有谐波频率会怎样变化？",
    solve: (p) => {
      const v = Math.sqrt(p.tension! / 0.01),
        f = (p.mode! * v) / (2 * p.length!),
        b = new Apparatus();
      b.trace(
        Array.from(
          { length: 121 },
          (_, i) =>
            [
              100 + 5 * i,
              230 -
                90 *
                  Math.sin((p.mode! * pi * i) / 120) *
                  Math.cos(deg(p.phase!)),
            ] as Point,
        ),
      );
      for (let i = 0; i <= p.mode!; i++)
        b.ball(100 + (600 * i) / p.mode!, 230, 6, C.gold);
      b.box(80, 160, 20, 140, C.ink).box(700, 160, 20, 140, C.ink);
      return b.finish(
        [
          m("frequency", "谐波频率", f, "Hz"),
          m("speed", "弦波速", v, "m/s"),
          m("wavelength", "波长", (2 * p.length!) / p.mode!, "m"),
        ],
        `第${p.mode}谐波有${p.mode}个波腹，频率${f.toFixed(2)} Hz；线密度固定0.01 kg/m。`,
        [graph("谐波频率", "阶", "Hz", 1, 6, (n) => (n * v) / (2 * p.length!))],
      );
    },
  }),
  define({
    id: "P22",
    slug: "doppler-source",
    name: "多普勒声源",
    question: "靠近的声源，声音为何更尖？",
    topic: "波动 · 多普勒效应",
    known:
      "静止空气声速340 m/s，观察者静止，声源匀速亚声速运动；向观察者运动为正。",
    proof: "f观=f源 c/(c−u)，远离取u<0；不是声速本身改变。",
    era: "1842年 · 多普勒",
    history:
      "多普勒提出相对运动导致频率偏移；声波和光波的传播模型不同，不能直接套用同一公式。",
    source: source.physics,
    sourceTitle: "OpenStax · Doppler Effect",
    controls: [
      c("speed", "接近速度", "m/s", -150, 150, 5, 50),
      c("frequency", "源频率", "Hz", 200, 1000, 20, 500),
      c('time','经过时间','s',0,.02,.0001,.01),
    ],
    compare: "speed",
    metric: "observed",
    time: {key:'time',max:.02,rate:.002,caption:'真实时间的0.002倍慢放；每个圆为一次发射波峰，传播速度相同。'},
    scenes: ["接近", 80, "远离", -80],
    counter: { speed: 0 },
    invitation: "切换接近与远离，比较观察频率。",
    look: "前方波面被压缩，后方波面怎样变化？",
    hint: "这里观察者不动；速度符号已含方向。",
    legend: ["金色：当前声源", "青圈：过去发出的波面", "右侧：静止观察者"],
    transfer: "声源静止时，观测频率等于多少？",
    solve: (p) => {
      const f = (p.frequency! * 340) / (340 - p.speed!),
        b = new Apparatus();
      for (let i = 0; i <= Math.floor((p.time??0)*p.frequency!); i++) {
        const emitted=i/p.frequency!,age=(p.time??0)-emitted;
        if(age>1e-7)b.ring(300+p.speed!*emitted*32,230,340*age*32,C.blue);
      }
      b.ball(300+p.speed!*(p.time??0)*32, 230, 14)
        .box(690, 205, 25, 50)
        .text(90, 55, "波峰发射后向外传播 · 金球是当前声源");
      return b.finish(
        [
          m("observed", "观察频率", f, "Hz"),
          m("ratio", "频率比", f / p.frequency!, ""),
        ],
        p.speed! === 0
          ? "声源静止：无频移。"
          : `观察频率${f.toFixed(2)} Hz；传播声速仍为340 m/s。`,
        [
          graph(
            "观察频率",
            "m/s",
            "Hz",
            -150,
            150,
            (u) => (p.frequency! * 340) / (340 - u),
          ),
        ],
      );
    },
  }),
  define({
    id: "P23",
    slug: "wire-magnetic-force",
    name: "通电导线受力",
    question: "电流不变，转一下导线会怎样？",
    topic: "电磁学 · 安培力",
    known: "均匀磁场，直导线有效长度0.2 m；仅计算磁场内部分，箭头示意力方向。",
    proof: "F=BIL sinθ；方向由Iℓ×B确定，θ为导线与磁场夹角。",
    era: "19世纪 · 安培",
    history:
      "电流之间与电流在磁场中的相互作用推动电动力学发展，也是电动机工作的基础。",
    source: source.electric,
    sourceTitle: "OpenStax · Magnetic Force on a Current-Carrying Conductor",
    controls: [
      c("angle", "电流与磁场夹角", "°", 0, 180, 5, 30),
      c("current", "电流", "A", -5, 5, 0.5, 2),
      c("field", "磁感应强度", "T", 0.1, 1, 0.1, 0.5),
    ],
    compare: "angle",
    metric: "force",
    scenes: ["平行", 0, "垂直", 90],
    counter: { current: 0 },
    invitation: "把导线从平行转到垂直磁场。",
    look: "磁力为0，是否一定说明没有电流？",
    hint: "还要检查夹角；负电流会反转力方向。",
    legend: ["蓝线：磁场方向", "青杆：导线", "金球：受力参考点"],
    transfer: "保持导线位置，反转电流会怎样？",
    solve: (p) => {
      const a = deg(p.angle!),
        F = p.field! * p.current! * 0.2 * Math.sin(a),
        b = new Apparatus();
      for (let y = 130; y <= 330; y += 50)
        b.line([120, y], [680, y], C.blue, -0.5);
      b.line(
        [400 - 125 * Math.cos(a), 230 + 125 * Math.sin(a)],
        [400 + 125 * Math.cos(a), 230 - 125 * Math.sin(a)],
        C.teal,
        0.2,
      )
        .ball(400, 230, 10, C.gold, 0.2 - F * 2)
        .text(90, 60, "B向右 · 正电流沿青杆向上 · 正读数力进入图面")
        .text(
          440,
          220,
          Math.abs(F) < 1e-12 ? "F=0" : F > 0 ? "⊗ F" : "⊙ F",
          C.gold,
        );
      b.solids.push({
        type: "line",
        points: [
          [0, 0, 0.2],
          [0, 0, 0.2 - F * 2],
        ],
        color: C.gold,
      });
      return b.finish(
        [m("force", "带符号磁力", F, "N")],
        `磁力${F.toFixed(3)} N；正值表示进入图面，负值表示离开图面（Iℓ×B）；三维金球偏移仅放大示意。`,
        [
          graph(
            "磁力",
            "°",
            "N",
            0,
            180,
            (x) => p.field! * p.current! * 0.2 * Math.sin(deg(x)),
          ),
        ],
      );
    },
  }),
  define({
    id: "P24",
    slug: "ideal-transformer",
    name: "理想变压器",
    question: "电压升高，功率也凭空增大吗？",
    topic: "电磁学 · 交流变压",
    known: "理想交流变压器、纯电阻负载；输入为有效值，不适用于直流稳态。",
    proof: "U₂/U₁=N₂/N₁；I₂=U₂/R，U₁I₁=U₂I₂。",
    era: "19世纪 · 电力输送",
    history: "变压器使交流电压能高效升降，帮助长距离输电降低电流及线路损耗。",
    source: source.electric,
    sourceTitle: "OpenStax · Transformers",
    controls: [
      c("ratio", "副原匝数比", "", 0.25, 4, 0.25, 1),
      c("voltage", "原边有效电压", "V", 2, 24, 1, 12),
      c("resistance", "负载电阻", "Ω", 10, 200, 10, 60),
    ],
    compare: "ratio",
    metric: "secondary",
    scenes: ["等匝", 1, "两倍匝数", 2],
    counter: { resistance: 120 },
    invitation: "增加副边匝数，核对两侧功率。",
    look: "升压时，原边电流怎样随负载变化？",
    hint: "变压器转移能量，不能创造能量。",
    legend: ["灰框：闭合铁芯", "青色：原边", "金色：副边"],
    transfer: "负载电阻加倍，会怎样影响电流和功率？",
    solve: (p) => {
      const U = p.voltage! * p.ratio!,
        P = (U * U) / p.resistance!,
        b = new Apparatus();
      b.box(220, 110, 360, 35, C.ink)
        .box(220, 315, 360, 35, C.ink)
        .box(220, 110, 35, 240, C.ink)
        .box(545, 110, 35, 240, C.ink);
      b.coil(238,150,155,24,8,C.teal).coil(562,150,155,24,8*p.ratio!,C.gold);
      b.text(90,65,'交流有效值 · 闭合铁芯与真实绕组路径')
        .text(150,380,'原边',C.teal).text(530,380,'副边',C.gold);
      return b.finish(
        [
          m("secondary", "副边电压", U, "V"),
          m("output_current", "副边电流", U / p.resistance!, "A"),
          m("input_current", "原边电流", P / p.voltage!, "A"),
          m("power", "输入=输出功率", P, "W"),
        ],
        `输出${U.toFixed(2)} V；输入输出均为${P.toFixed(3)} W，未考虑磁芯与铜损。`,
        [graph("输出电压", "匝比", "V", 0.25, 4, (x) => p.voltage! * x)],
      );
    },
  }),
  define({
    id: "P25",
    slug: "rlc-frequency-selector",
    name: "RLC选频台",
    question: "哪种频率能最容易通过电路？",
    topic: "电磁学 · 交流谐振",
    known: "串联RLC正弦稳态，电压为有效值；不模拟接通瞬态。",
    proof: "Z=√[R²+(ωL−1/ωC)²]，I=U/Z，f₀=1/(2π√LC)。",
    era: "19世纪 · 电磁振荡",
    history: "LC储能交换与电阻耗散构成电谐振，选频思想被用于无线电与滤波器。",
    source: source.electric,
    sourceTitle: "OpenStax · RLC Series Circuits",
    controls: [
      c("frequency", "驱动频率", "Hz", 20, 500, 5, 100),
      c("resistance", "电阻", "Ω", 5, 100, 5, 20),
      c("inductance", "电感", "mH", 10, 200, 10, 100),
      c("capacitance", "电容", "μF", 1, 100, 1, 10),
    ],
    compare: "frequency",
    metric: "current",
    scenes: ["低频", 50, "接近谐振", 160],
    counter: { resistance: 100 },
    invitation: "扫过160 Hz附近，寻找电流峰。",
    look: "电阻增大，峰值和峰宽怎样变化？",
    hint: "先算自己的L、C对应的谐振频率，不总是160 Hz。",
    legend: ["青色：电阻", "金色：电感", "蓝色双板：电容"],
    transfer: "保持频率，增加电阻会把电流峰抬高吗？",
    solve: (p) => {
      const L = p.inductance! * 0.001,
        cap = p.capacitance! * 1e-6,
        R = p.resistance!,
        I = (f: number) =>
          12 / Math.hypot(R, 2 * pi * f * L - 1 / (2 * pi * f * cap)),
        b = new Apparatus();
      b.line([120, 230], [220, 230])
        .box(220, 210, 80, 40)
        .line([300, 230], [350, 230]);
      for (let i = 0; i < 5; i++) b.ring(360 + i * 20, 230, 12, C.gold);
      b.line([450, 230], [530, 230])
        .line([530, 190], [530, 270], C.blue)
        .line([550, 190], [550, 270], C.blue)
        .line([550, 230], [680, 230])
        .text(90, 70, "串联交流 · 12 V有效值");
      b.ring(400, 345, 36, C.blue).line(
        [400, 345],
        [
          400 + 30 * Math.sin((I(p.frequency!) / (12 / R)) * Math.PI),
          345 + 30 * Math.cos((I(p.frequency!) / (12 / R)) * Math.PI),
        ],
        C.gold,
      );
      return b.finish(
        [
          m("current", "电流有效值", I(p.frequency!), "A"),
          m("resonance", "谐振频率", 1 / (2 * pi * Math.sqrt(L * cap)), "Hz"),
          m("power", "电阻耗散功率", I(p.frequency!) ** 2 * R, "W"),
        ],
        `电流${I(p.frequency!).toFixed(4)} A；储能元件无平均耗散，电阻耗散${(I(p.frequency!) ** 2 * R).toFixed(3)} W。`,
        [graph("电流频响", "Hz", "A", 20, 500, I)],
      );
    },
  }),
  define({
    id: "P26",
    slug: "carnot-engine",
    name: "卡诺热机",
    question: "热机能把所有热量都变成功吗？",
    topic: "热学 · 热机效率",
    known: "可逆理想上限，热库恒温；冷库不得高于热库。温度必须用K。",
    proof: "η=1−Tc/Th；W=Qhη，Qc=QhTc/Th，ΔS=Qh/Th−Qc/Tc=0。",
    era: "1824年 · 卡诺",
    history:
      "卡诺研究热机功的极限，效率上限由两热库温度决定，而不是由工质种类决定。",
    source: source.electric,
    sourceTitle: "OpenStax · Carnot Cycle",
    controls: [
      c("cold", "冷库温度", "K", 200, 600, 10, 300),
      c("hot", "热库温度", "K", 400, 1000, 10, 600),
      c("heat", "吸收热量", "J", 100, 2000, 100, 1000),
    ],
    compare: "cold",
    metric: "efficiency",
    scenes: ["低温冷库", 300, "较热冷库", 400],
    counter: { cold: 600, hot: 400 },
    invitation: "升高冷库温度，看功和排热怎样分配。",
    look: "效率下降时，排出的热量增加了吗？",
    hint: "冷热库相同时没有热机温差；反过来不能当热机算。",
    legend: ["红盒：热库", "青轮：理想热机", "蓝盒：冷库"],
    transfer: "冷库比热库还热时，热机公式的方向还适用吗？",
    solve: (p) => {
      const valid = p.cold! <= p.hot!,
        eta = valid ? 1 - p.cold! / p.hot! : null,
        b = new Apparatus();
      b.box(250, 75, 300, 55, C.red)
        .ring(400, 225, 60)
        .box(250, 330, 300, 55, C.blue)
        .line([400, 130], [400, 165], C.red)
        .line([400, 285], [400, 330], C.blue)
        .line([460, 225], [650, 225], C.gold);
      if (eta !== null)
        b.box(640, 120, 20, 220 * eta, C.gold, 0.3).text(
          570,
          385,
          `功占比 ${(eta * 100).toFixed(1)}%`,
        );
      return b.finish(
        [
          m("efficiency", "最大热效率", eta === null ? null : eta * 100, "%"),
          m("work", "输出功", eta === null ? null : p.heat! * eta, "J"),
          m(
            "rejected",
            "排出热量",
            eta === null ? null : p.heat! * (1 - eta),
            "J",
          ),
        ],
        valid
          ? `理想上限${(eta! * 100).toFixed(2)}%；实际不可逆热机效率更低。`
          : "冷库高于热库：热机方向不适用，不能输出负效率冒充热机。",
        [
          graph(
            "可逆效率",
            "K",
            "%",
            200,
            Math.min(600, p.hot!),
            (x) => 100 * (1 - x / p.hot!),
          ),
        ],
        valid ? "valid" : "invalid",
      );
    },
  }),
  define({
    id: "P27",
    slug: "mixing-calorimetry",
    name: "混合量热",
    question: "两杯水混合，温度一定取平均吗？",
    topic: "热学 · 能量守恒",
    stage: "初中定量 · 高中复核",
    known: "同种液态水、隔热、忽略容器热容，无相变；0–90°C范围。",
    proof: "m热c(T热−T)=m冷c(T−T冷)；T=(m热T热+m冷T冷)/(m热+m冷)。",
    era: "18世纪 · 量热学",
    history:
      "量热法用可测的温度变化比较热量，约瑟夫·布莱克等人的研究推动热与温度的区分。",
    source: source.electric,
    sourceTitle: "OpenStax · Calorimetry",
    controls: [
      c("hotmass", "热水质量", "kg", 0.1, 2, 0.1, 0.5),
      c("hottemp", "热水初温", "°C", 30, 90, 5, 80),
      c("coldmass", "冷水质量", "kg", 0.1, 2, 0.1, 0.5),
      c("coldtemp", "冷水初温", "°C", 0, 30, 5, 20),
    ],
    compare: "hotmass",
    metric: "temperature",
    scenes: ["等量热水", 0.5, "双份热水", 1],
    counter: { hotmass: 0.1 },
    invitation: "多倒一份热水，比较混合后的平衡温度。",
    look: "平衡温度更靠近哪一杯的初温？",
    hint: "算的是质量加权平均，不是两个温度直接平均。",
    legend: ["红杯：热水", "蓝杯：冷水", "中央杯：平衡混合"],
    transfer: "只有很少热水时，混合温度还接近50°C吗？",
    solve: (p) => {
      const T =
          (p.hotmass! * p.hottemp! + p.coldmass! * p.coldtemp!) /
          (p.hotmass! + p.coldmass!),
        Q = p.hotmass! * 4180 * (p.hottemp! - T),
        b = new Apparatus();
      b.box(90, 180, 150, 170, C.red)
        .box(560, 180, 150, 170, C.blue)
        .box(310, 150, 180, 210)
        .line([240, 220], [310, 230], C.red)
        .line([560, 220], [490, 230], C.blue)
        .text(320, 120, `平衡 ${T.toFixed(2)} °C`);
      b.box(100, 340 - p.hotmass! * 65, 130, p.hotmass! * 65, C.red, 0.7).box(
        570,
        340 - p.coldmass! * 65,
        130,
        p.coldmass! * 65,
        C.blue,
        0.7,
      );
      return b.finish(
        [
          m("temperature", "平衡温度", T, "°C"),
          m("transferred", "热水放出=冷水吸收", Q, "J"),
        ],
        `平衡温度${T.toFixed(3)}°C；两杯交换${Q.toFixed(1)} J，隔热系统总能量守恒。`,
        [
          graph(
            "平衡温度",
            "kg",
            "°C",
            0.1,
            2,
            (x) =>
              (x * p.hottemp! + p.coldmass! * p.coldtemp!) / (x + p.coldmass!),
          ),
        ],
      );
    },
  }),
  define({
    id: "P28",
    slug: "fourier-heat-bridge",
    name: "导热桥",
    question: "厚一倍，热流能少一半吗？",
    topic: "热学 · 傅里叶导热",
    known: "一维稳态平板，两端温度固定60°C与20°C，接触与对流热阻忽略。",
    proof: "Q̇=kAΔT/L；T(x)=Th−ΔT·x/L。",
    era: "1822年 · 傅里叶",
    history: "傅里叶用数学描述温度场与热传导，其思想连接工程热学和偏微分方程。",
    source: source.electric,
    sourceTitle: "OpenStax · Heat Transfer",
    controls: [
      c("thickness", "导热长度", "cm", 1, 20, 1, 5),
      c("conductivity", "导热系数", "W/(m·K)", 0.1, 5, 0.1, 1),
      c("area", "传热面积", "m²", 0.01, 0.1, 0.01, 0.05),
    ],
    compare: "thickness",
    metric: "flow",
    scenes: ["较薄层", 5, "两倍厚度", 10],
    counter: { conductivity: 0.1 },
    invitation: "增加材料厚度，比较稳态热流。",
    look: "材料内部的温度梯度也改变了吗？",
    hint: "这里端温固定，稳态导热与材料蓄热不同。",
    legend: ["红端：60°C", "蓝端：20°C", "金线：温度分布"],
    transfer: "同样厚度，换低导热材料会怎样？",
    solve: (p) => {
      const q = (p.conductivity! * p.area! * 40) / (p.thickness! * 0.01),
        w = 120 + 15 * p.thickness!,
        b = new Apparatus();
      b.box(110, 135, 35, 220, C.red)
        .box(145, 160, w, 170, C.gold, 1)
        .box(145 + w, 135, 35, 220, C.blue)
        .line([145, 170], [145 + w, 310], C.red)
        .text(100, 65, "端温固定 · 一维稳态");
      return b.finish(
        [
          m("flow", "传导热功率", q, "W"),
          m("gradient", "温度梯度大小", 40 / (p.thickness! * 0.01), "K/m"),
        ],
        `每秒传热${q.toFixed(3)} J；不表示温度每秒下降相同数值。`,
        [graph("温度分布", "相对位置", "°C", 0, 1, (x) => 60 - 40 * x)],
      );
    },
  }),
  define({
    id: "P29",
    slug: "photoelectric-effect",
    name: "光电效应",
    question: "更亮的红光，一定能打出电子吗？",
    topic: "近代物理 · 光量子",
    known:
      "理想单光子光电效应，逸出功固定2.3 eV；强度仅以光子通量比例表示，不给未经标定的电流。",
    proof: "Kmax=max(hc/λ−W,0)，仅hc/λ>W时逸出；截止电压Kmax/e。",
    era: "1905年 · 爱因斯坦",
    history:
      "爱因斯坦用光量子解释阈频与最大动能，说明光强与单个光子能量的作用不同。",
    source: source.waves,
    sourceTitle: "OpenStax · Photoelectric Effect",
    controls: [
      c("wavelength", "波长", "nm", 250, 800, 10, 400),
      c("intensity", "光子通量比例", "", 0.2, 3, 0.2, 1),
    ],
    compare: "wavelength",
    metric: "voltage",
    scenes: ["短波", 400, "长波", 700],
    counter: { intensity: 3, wavelength: 700 },
    invitation: "把波长调长，观察电子是否还能逸出。",
    look: "加大长波光的通量，能否越过能量阈值？",
    hint: "电子能否出来看每个光子能量，不看总光量。",
    legend: ["金线：入射光", "灰板：金属", "青球：可逸出电子"],
    transfer: "低于阈频时，增加强度为什么仍没有电子？",
    solve: (p) => {
      const photon = 1239.841984 / p.wavelength!,
        K = Math.max(0, photon - 2.3),
        emit = photon > 2.3,
        b = new Apparatus();
      b.box(360, 90, 35, 280, C.ink).trace(
        [
          [90, 140],
          [150, 120],
          [190, 160],
          [230, 120],
          [270, 160],
          [350, 180],
        ],
        C.gold,
      );
      if (emit)
        for (let i = 0; i < Math.ceil(p.intensity! * 3); i++)
          b.ball(430 + i * 20, 160 + i * 15, 5, C.teal, i * 0.02);
      b.text(90, 65, "光子能量阈值2.3 eV");
      return b.finish(
        [
          m("voltage", "截止电压", K, "V"),
          m("photon", "单光子能量", photon, "eV"),
          m("emission", "是否逸出", emit ? 1 : 0, ""),
        ],
        emit
          ? `可逸出；最大动能${K.toFixed(3)} eV。通量影响电子数，未改变最大动能。`
          : "低于阈频，不逸出；0 V仅表示无可测截止动能，不表示已产生静止电子。",
        [
          graph("可逸出最大动能", "nm", "eV", 250, 800, (x) =>
            Math.max(0, 1239.841984 / x - 2.3),
          ),
        ],
      );
    },
  }),
  define({
    id: "P30",
    slug: "rutherford-scattering",
    name: "卢瑟福散射",
    question: "原子几乎是空的，为什么还会大角度偏转？",
    topic: "近代物理 · 库仑散射",
    known:
      "非相对论α粒子散射于固定点状金核，忽略电子屏蔽及核力；轨迹仅示意渐近偏角。",
    proof: "tan(θ/2)=kZze²/(2Eb)，Z=79，z=2；使用e²/(4πε₀)=1.439964 MeV·fm。",
    era: "1911年 · 卢瑟福",
    history:
      "盖革—马斯登散射实验中的少量大角度偏转，推动卢瑟福提出原子核模型。",
    source: source.waves,
    sourceTitle: "OpenStax · Rutherford’s Nuclear Model",
    controls: [
      c("impact", "碰撞参数", "fm", 10, 200, 5, 50),
      c("energy", "α粒子能量", "MeV", 2, 10, 0.5, 5),
    ],
    compare: "impact",
    metric: "angle",
    scenes: ["远掠", 100, "近掠", 20],
    counter: { energy: 10 },
    invitation: "让入射线靠近原子核，比较偏转角。",
    look: "碰撞参数越小，偏转为什么越大？",
    hint: "线段只表示入射和出射渐近方向，不冒充完整双曲线轨迹。",
    legend: ["金球：点状金核", "青线：入射渐近线", "红线：出射渐近方向"],
    transfer: "能量增大后，同一碰撞参数的偏转会怎样？",
    solve: (p) => {
      const theta =
          2 * Math.atan((1.439964 * 158) / (2 * p.energy! * p.impact!)),
        b = new Apparatus(),
        y = 230 - p.impact! * 0.5;
      b.ball(400, 230, 18, C.gold)
        .line([90, y], [400, y])
        .line(
          [400, y],
          [400 + 240 * Math.cos(theta), y - 150 * Math.sin(theta)],
          C.red,
        )
        .text(90, 65, "核大小与轨道尺度均为示意 · 点核库仑模型");
      return b.finish(
        [m("angle", "渐近散射角", (theta * 180) / pi, "°")],
        `偏角${((theta * 180) / pi).toFixed(2)}°；越近核的轨迹偏转越明显，真实原子尺度未按比例绘制。`,
        [
          graph(
            "散射角",
            "fm",
            "°",
            10,
            200,
            (x) =>
              (2 * Math.atan((1.439964 * 158) / (2 * p.energy! * x)) * 180) /
              pi,
          ),
        ],
      );
    },
  }),
];
