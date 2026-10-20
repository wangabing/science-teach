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
  type Vec3,
} from "./kit.ts";
import { beltObservation } from './belt.ts';
const common = {
  source: source.engineering,
  sourceTitle: "Engineering LibreTexts · 静力学与工程模型",
  stage: "初中直观 · 高中定量拓展",
  era: "经典机构与工程设计",
};
export const engineeringAdditions = [
  define({
    ...common,
    id: "S11",
    slug: "triangle-truss-joint",
    name: "三角桁架节点",
    question: "屋架变平，杆件真的更省力吗？",
    topic: "结构 · 节点平衡",
    known: "对称两杆桁架、两端铰支，顶点竖直集中载荷；杆只承轴力，无自重。",
    proof: "每杆压缩力N=P/(2sinθ)，水平推力H=P/(2tanθ)，θ=atan(2h/L)。",
    history:
      "节点平衡法将复杂桁架分解成单个节点的力矢量平衡，形状改变会显著改变内力。",
    controls: [
      c("height", "桁架高度", "m", 0.3, 3, 0.1, 1.5),
      c("span", "总跨度", "m", 2, 6, 0.2, 4),
      c("load", "顶点载荷", "kN", 1, 20, 1, 10),
    ],
    compare: "height",
    metric: "compression",
    scenes: ["较高屋架", 2, "较平屋架", 0.5],
    counter: { load: 20 },
    invitation: "把屋架压平，比较杆压和支座水平推力。",
    look: "竖向载荷没变，杆内力为什么会激增？",
    hint: "小倾角需要更大的轴力才能提供同样竖向分量。",
    legend: ["青杆：两受压杆", "红箭头：集中载荷", "金箭头：支座向内的水平反力"],
    transfer: "载荷翻倍而几何不变，内力怎样变？",
    solve: (p) => {
      const a = Math.atan((2 * p.height!) / p.span!),
        N = p.load! / (2 * Math.sin(a)),
        b = new Apparatus(),
        scale=Math.min(480/p.span!,240/p.height!),
        left=400-p.span!*scale/2,right=400+p.span!*scale/2,top=350-p.height!*scale,
        H=p.load!/(2*Math.tan(a)),forceLength=25+60*p.load!/20,horizontalLength=20+60*H/(H+10);
      b.base()
        .line([left, 350], [400, top])
        .line([400, top], [right, 350])
        .arrow([400,top-10-forceLength],[400,top-10],C.red)
        .arrow([left-horizontalLength,340],[left,340],C.gold)
        .arrow([right+horizontalLength,340],[right,340],C.gold)
        .plate(
          [
            [left-20, 375],
            [left+20, 375],
            [left, 350],
          ],
          C.ink,
        )
        .plate(
          [
            [right-20, 375],
            [right+20, 375],
            [right, 350],
          ],
          C.ink,
        );
      b.text(80,55,'箭长限幅示意 · 杆架几何按高跨比绘制');
      return b.finish(
        [
          m("compression", "每杆压力", N, "kN"),
          m("horizontal", "每端水平推力", p.load! / (2 * Math.tan(a)), "kN"),
        ],
        `每杆压力${N.toFixed(3)} kN；浅屋架不能仅凭外形轻薄判断更省材料。`,
        [
          graph(
            "每杆压力",
            "m",
            "kN",
            0.3,
            3,
            (h) => p.load! / (2 * Math.sin(Math.atan((2 * h) / p.span!))),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S12",
    slug: "moving-load-beam",
    name: "移动荷载梁",
    question: "重物移到哪里，梁最吃力？",
    topic: "结构 · 支座反力与弯矩",
    known: "两端简支、单点载荷、梁长4 m，忽略自重，挠度未求解。",
    proof: "RA=P(L−a)/L，RB=Pa/L；Mmax=Pa(L−a)/L，发生在荷载点。",
    history:
      "移动荷载与影响线帮助桥梁工程判断车辆位置造成的最不利内力；这里用单点静载说明。",
    controls: [
      c("position", "载荷距左支座", "m", 0, 4, 0.1, 1),
      c("load", "点载荷", "kN", 1, 20, 1, 10),
    ],
    compare: "position",
    metric: "moment",
    scenes: ["靠近支座", 0.5, "跨中", 2],
    counter: { position: 0 },
    invitation: "沿梁移动重物，看两端反力如何分担。",
    look: "最大弯矩什么时候出现？",
    hint: "载荷恰在支座上时，不在跨内产生弯矩。",
    legend: ["青杆：简支梁", "红箭头：移动载荷", "金线：反力方向"],
    transfer: "载荷落在支座处，跨内弯矩是多少？",
    solve: (p) => {
      const x = p.position!,
        P = p.load!,
        RA = (P * (4 - x)) / 4,
        RB = (P * x) / 4,
        M = (P * x * (4 - x)) / 4,
        b = new Apparatus();
      b.base()
        .box(120, 255, 560, 18)
        .plate(
          [
            [100, 315],
            [140, 315],
            [120, 275],
          ],
          C.ink,
        )
        .plate(
          [
            [660, 315],
            [700, 315],
            [680, 275],
          ],
          C.ink,
        )
        .arrow([120+x*140,240-3*P],[120+x*140,250],C.red)
        .arrow([120,330],[120,330-3*RA],C.gold)
        .arrow([680,330],[680,330-3*RB],C.gold)
        .text(90, 70, "无自重 · 单点静载 · 弯矩图独立读数");
      return b.finish(
        [
          m("moment", "最大弯矩", M, "kN·m"),
          m("left", "左反力", RA, "kN"),
          m("right", "右反力", RB, "kN"),
        ],
        `两反力之和${(RA + RB).toFixed(2)} kN，最大弯矩${M.toFixed(3)} kN·m。`,
        [
          graph("沿梁弯矩", "m", "kN·m", 0, 4, (s) =>
            s <= x ? RA * s : RB * (4 - s),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S13",
    slug: "euler-column",
    name: "欧拉压杆",
    question: "柱子加长一倍，临界载荷会怎样？",
    topic: "结构 · 弹性屈曲",
    known:
      "细长理想直杆，线弹性、中心受压；E=200 GPa，I=1×10⁻⁸ m⁴；端部系数K可选。",
    proof: "Pcr=π²EI/(KL)²；临界值不是短柱压碎强度，也不是实际设计允许荷载。",
    era: "18世纪 · 欧拉",
    history: "欧拉屈曲揭示结构可能在材料压坏前失稳，长细比与边界条件是核心。",
    controls: [
      c("length", "柱长", "m", 0.5, 3, 0.1, 1),
      c("factor", "有效长度系数K", "", 0.5, 2, 0.5, 1, [
        [0.5, "两端固结K=0.5"],
        [1, "两端铰接K=1"],
        [2, "一端固结一端自由K=2"],
      ]),
      c("load", "当前轴压", "kN", 0, 30, 1, 5),
    ],
    compare: "length",
    metric: "critical",
    scenes: ["短柱", 1, "两倍长度", 2],
    counter: { factor: 2 },
    invitation: "拉长同一截面的柱，比较临界压力。",
    look: "变细长后，失稳会比材料压碎更早吗？",
    hint: "超过临界值时不能继续把直柱画面当成稳定解。",
    legend: ["青柱：理想压杆", "红线：轴向载荷", "曲线：欧拉临界值"],
    transfer: "把端部改为悬臂，临界力变化多少？",
    solve: (p) => {
      const cr = (pi * pi * 200e9 * 1e-8) / (p.factor! * p.length!) ** 2 / 1000,
        b = new Apparatus();
      b.base()
        .box(380, 360 - 90 * p.length!, 40, 90 * p.length!)
        .line([400, 50], [400, 330 - 90 * p.length!], C.red)
        .text(80, 65, `K=${p.factor} · 直柱仅表示基态`);
      const top=360-90*p.length!;
      if(p.factor===.5)b.box(350,top-10,100,10,C.ink);
      if(p.factor===1){b.plate([[385,top-10],[415,top-10],[400,top]],C.ink).plate([[385,375],[415,375],[400,360]],C.ink);}
      b.arrow([440,top-15-Math.min(70,p.load!*2)],[440,top-15],C.red);
      if(p.load!>=cr){b.trace(Array.from({length:41},(_,i)=>[400+25*Math.sin(pi*i/40),top+(360-top)*i/40] as Point),C.gold,.4).text(480,220,'金线：失稳模态示意');}
      return b.finish(
        [
          m("critical", "欧拉临界载荷", cr, "kN"),
          m("ratio", "载荷/临界值", p.load! / cr, ""),
        ],
        p.load! >= cr
          ? "达到或超过欧拉临界值，直杆稳定性失效；不模拟后屈曲。"
          : "低于理想屈曲临界；仍需材料、初弯曲和安全系数校核。",
        [
          graph(
            "临界载荷",
            "m",
            "kN",
            0.5,
            3,
            (L) => (pi * pi * 200e9 * 1e-8) / (p.factor! * L) ** 2 / 1000,
          ),
        ],
        p.load! >= cr ? "boundary" : "valid",
      );
    },
  }),
  define({
    ...common,
    id: "S14",
    slug: "eccentric-column-stress",
    name: "偏心受压柱",
    question: "同一重量偏一点，柱边缘会多危险？",
    topic: "结构 · 轴力与弯曲",
    known:
      "一阶线弹性轴压+弯矩，不含P–Δ放大；矩形截面100×100 mm。拉应力不代表混凝土可承受。",
    proof: "σmax=P/A+Pe c/I，σmin=P/A−Pe c/I；矩形核心界限e≤h/6。",
    history:
      "偏心受压说明荷载路径与截面同样重要；实际柱设计还需稳定、材料非线性和构造条件。",
    controls: [
      c("eccentricity", "偏心距", "mm", 0, 40, 1, 5),
      c("load", "压力", "kN", 10, 200, 10, 100),
    ],
    compare: "eccentricity",
    metric: "maximum",
    scenes: ["居中加载", 0, "偏心加载", 25],
    counter: { eccentricity: 40 },
    invitation: "把上方荷载向边缘移，观察两侧应力。",
    look: "什么时候一侧开始出现拉应力？",
    hint: "正号表示压应力；负的最小应力表示受拉。",
    legend: ["青柱：矩形柱", "红线：偏心荷载", "金线：截面中轴"],
    transfer: "偏心超过截面核心，为什么全截面受压假设不成立？",
    solve: (p) => {
      const P = p.load! * 1000,
        e = p.eccentricity! * 0.001,
        A = 0.01,
        I = 0.1 ** 4 / 12,
        s = P / A / 1e6,
        k = (P * e * 0.05) / I / 1e6,
        b = new Apparatus();
      b.base()
        .box(320, 140, 160, 220)
        .line([400, 100], [400, 370], C.gold)
        .line([400 + e * 2400, 70], [400 + e * 2400, 140], C.red)
        .text(90, 65, "一阶应力叠加 · 正压负拉");
      b.arrow([400+e*2400,140-Math.min(90,20+p.load!*.3)],[400+e*2400,140],C.red);
      b.line([520,220],[520+Math.min(170,Math.abs(s+k)*3),220],C.red)
        .line([520,270],[520+Math.min(170,Math.abs(s-k)*3),270],s-k<0?C.blue:C.red)
        .text(510,205,'两侧应力幅值（长度限幅）');
      return b.finish(
        [
          m("maximum", "最大压应力", s + k, "MPa"),
          m("minimum", "另一侧应力", s - k, "MPa"),
        ],
        s - k < 0
          ? "一侧已受拉；本模型仅给线弹性截面应力，不表示材料安全。"
          : "两侧仍为压应力；真实承载还需屈曲与材料校核。",
        [
          graph(
            "最大压应力",
            "mm",
            "MPa",
            0,
            40,
            (x) => s + (P * x * 0.001 * 0.05) / I / 1e6,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S15",
    slug: "retaining-wall-overturn",
    name: "挡土墙抗倾覆",
    question: "墙底宽一点，为什么更稳？",
    topic: "结构 · 抗倾覆",
    known:
      "每米墙长，矩形重力墙，墙高3 m，土重度18 kN/m³、主动土压系数1/3，墙重度24 kN/m³；仅验倾覆。",
    proof: "Pa=KaγH²/2；倾覆矩PaH/3，抗倾覆矩γ墙BH·B/2；比值不等于全面安全。",
    history:
      "重力式挡土墙利用自重和底宽抵抗土压力；排水、滑移和地基承载同样重要。",
    controls: [
      c("width", "墙底宽", "m", 0.5, 3, 0.1, 1),
      c("height", "墙高", "m", 1, 4, 0.1, 3),
    ],
    compare: "width",
    metric: "factor",
    scenes: ["窄墙", 1, "宽墙", 2],
    counter: { width: 0.5 },
    invitation: "加宽墙底，看抗倾覆矩与土压力矩。",
    look: "比值提高后，还能直接宣布整座墙安全吗？",
    hint: "这里未算滑移、承载、地下水与地震。",
    legend: ["青块：墙体", "金面：土体方向", "红线：等效土压力"],
    transfer: "墙底很窄时，抗倾覆矩为何快速降低？",
    solve: (p) => {
      const B = p.width!,
        H = p.height!,
        P = 3 * H * H,
        M = (P * H) / 3,
        R = (24 * B * H * B) / 2,
        b = new Apparatus();
      b.base()
        .box(320, 360 - H * 65, B * 70, H * 65)
        .plate(
          [
            [320 + B * 70, 360],
            [700, 360],
            [700, 360 - H * 65],
            [320 + B * 70, 360 - H * 65],
          ],
          C.gold,
        )
        .arrow(
          [680, 360 - (H * 65) / 3],
          [320 + B * 70, 360 - (H * 65) / 3],
          C.red,
        )
        .arrow([320+B*35,220-H*15],[320+B*35,300-H*15],C.gold)
        .text(90,65,'红：土压合力 · 金：墙重 · 墙趾为倾覆转轴');
      return b.finish(
        [
          m("factor", "抗矩/倾覆矩", R / M, ""),
          m("overturn", "土压倾覆矩", M, "kN·m/m"),
          m("resist", "墙重抗矩", R, "kN·m/m"),
        ],
        "仅输出该理想墙型的倾覆矩比，不采用未声明的规范安全阈值。",
        [graph("抗矩比", "m", "", 0.5, 3, (x) => (24 * x * H * x) / 2 / M)],
      );
    },
  }),
  define({
    ...common,
    id: "S16",
    slug: "slope-friction",
    name: "斜坡摩擦",
    question: "坡更陡一点，什么时候会滑？",
    topic: "岩土直观 · 摩擦稳定",
    known:
      "单块刚体置于平直斜面，无黏聚力、无孔隙水、无地震；不是真实边坡设计。",
    proof: "沿坡驱动力mg sinθ，最大静摩擦μmg cosθ；抗滑比μ/tanθ。",
    history:
      "库仑摩擦模型帮助解释滑动临界；真实土坡还需破坏面、土体强度和水压力分析。",
    controls: [
      c("angle", "坡角", "°", 5, 60, 1, 25),
      c("friction", "静摩擦系数", "", 0.1, 1, 0.05, 0.5),
    ],
    compare: "angle",
    metric: "factor",
    scenes: ["较缓坡", 20, "较陡坡", 40],
    counter: { friction: 0.1 },
    invitation: "慢慢抬高坡面，找出摩擦不足的临界。",
    look: "抗滑比小于1时，静止画面还代表稳定吗？",
    hint: "本图仅示意初始位置，超过阈值不积分滑落运动。",
    legend: ["青坡：倾斜接触面", "金块：刚体", "曲线：抗滑比"],
    transfer: "湿滑降低摩擦系数，临界坡角怎样改变？",
    solve: (p) => {
      const a = deg(p.angle!),
        q = p.friction! / Math.tan(a),
        b = new Apparatus(),
        run=360*Math.cos(a),rise = 360 * Math.sin(a),
        contact:Point=[180+run*.55,365-rise*.45],
        block=([[-27,0],[27,0],[27,35],[-27,35]] as Point[]).map(([u,v])=>[contact[0]+u*Math.cos(a)+v*Math.sin(a),contact[1]+u*Math.sin(a)-v*Math.cos(a)] as Point);
      b.prism(
        [
          [180, 365],
          [180+run, 365],
          [180, 365 - rise],
        ],
        C.teal,
      )
        .prism(block,C.gold,.55)
        .text(80, 65, "单块摩擦模型 · 不模拟滑落");
      const force=Math.min(Math.sin(a),p.friction!*Math.cos(a))*85,center:Point=[contact[0]+20*Math.sin(a),contact[1]-20*Math.cos(a)];
      b.arrow(center,[center[0]-force*Math.cos(a),center[1]-force*Math.sin(a)],C.red,.4)
        .text(80,95,q<1?'红箭头：最大静摩擦仍不足':'红箭头：实际静摩擦，未必等于极限');
      return b.finish(
        [
          m("factor", "抗滑比", q, ""),
          m("critical", "临界坡角", (Math.atan(p.friction!) * 180) / pi, "°"),
        ],
        q < 1
          ? "静摩擦不足，不能维持静止；画面不代表稳定状态。"
          : "静摩擦可满足本刚体平衡；不是土坡工程安全结论。",
        [
          graph(
            "抗滑比",
            "°",
            "",
            5,
            60,
            (x) => p.friction! / Math.tan(deg(x)),
          ),
        ],
        q < 1 ? "boundary" : "valid",
      );
    },
  }),
  define({
    ...common,
    id: "S17",
    slug: "screw-jack",
    name: "螺旋千斤顶",
    question: "转好多圈，怎样换来很大的举升力？",
    topic: "机构 · 螺旋传动",
    known: "恒定效率η代表简化总损失，手柄半径0.2 m；不从效率推断自锁性。",
    proof: "每转输入功F·2πr，输出功Wp；F=Wp/(2πrη)，提升h需h/p转。",
    history: "螺旋机构把转动转换为很小的轴向位移，以长行程换取大机械优势。",
    controls: [
      c("pitch", "螺距", "mm", 1, 10, 0.5, 4),
      c("load", "负载", "kN", 1, 20, 1, 10),
      c("efficiency", "综合效率", "", 0.2, 1, 0.05, 0.5),
      c("turn", "累计手柄转数", "圈", 0, 10, 0.02, 0),
    ],
    time: {key:'turn',max:10,rate:.4,caption:'每秒转0.4圈；托盘位移=圈数×螺距，位移按1000 px/m显示。'},
    compare: "pitch",
    metric: "force",
    scenes: ["细螺距", 2, "粗螺距", 8],
    counter: { efficiency: 0.2 },
    invitation: "换成更细的螺纹，比较手柄力和所需圈数。",
    look: "省力的同时，要多转多少圈？",
    hint: "效率只做能量损失参数，不能由此判断停手会不会倒转。",
    legend: ["青杆：螺杆", "金线：手柄", "上板：载荷托盘"],
    transfer: "效率下降时，输入力会怎样增加？",
    solve: (p) => {
      const pitch = p.pitch! * 0.001,
        F = (p.load! * 1000 * pitch) / (2 * pi * 0.2 * p.efficiency!),
        b = new Apparatus(),rise=p.turn!*pitch,top=180-rise*1000,angle=p.turn!*2*pi;
      b.base().box(340,330,120,40,C.ink,.9).box(385,top+25,30,330-top-25).box(310,top,180,25,C.gold,.9);
      const helix=Array.from({length:201},(_,i)=>{const y=top+25+(305-top)*i/200,a=(y-top)/(6+3*p.pitch!)*2*pi+angle;return {p:[400+18*Math.cos(a),y] as Point,z:18/65*Math.sin(a)};});
      b.trace(helix.map(v=>v.p),C.gold);
      b.solids.push({type:'tube',points:helix.map(v=>b.v(v.p,v.z)),radius:.018,color:C.gold});
      const ends:Vec3[]=[[-1.8*Math.cos(angle),b.v([400,310])[1],-1.8*Math.sin(angle)],[1.8*Math.cos(angle),b.v([400,310])[1],1.8*Math.sin(angle)]];
      b.line([400-117*Math.cos(angle),310],[400+117*Math.cos(angle),310],C.ink);
      b.solids.push({type:'tube',points:ends,radius:.05,color:C.ink});
      b.arrow([560,100],[560,100+20+p.load!*3],C.red).text(80,65,`举升 ${(rise*100).toFixed(2)} cm · 螺纹为示意`);
      return b.finish(
        [
          m("force", "所需手柄切向力", F, "N"),
          m("turns", "提升10cm所需圈数", 0.1 / pitch, "圈"),
          m("rise", "当前举升高度", rise*100, "cm"),
          m(
            "input",
            "提升10cm输入功",
            (p.load! * 1000 * 0.1) / p.efficiency!,
            "J",
          ),
        ],
        `手柄力${F.toFixed(2)} N；提升10cm需${(0.1 / pitch).toFixed(1)}圈，省力不省功。`,
        [
          graph(
            "手柄力",
            "mm",
            "N",
            1,
            10,
            (x) =>
              (p.load! * 1000 * x * 0.001) / (2 * pi * 0.2 * p.efficiency!),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S18",
    slug: "wedge-lift",
    name: "楔块举升",
    question: "一个小斜面，怎样推起重物？",
    topic: "机构 · 理想楔块",
    known: "无摩擦、准静态楔块，负载只能竖直运动；仅理想机械优势，不模拟自锁。",
    proof: "h=x tanθ；F=W tanθ；Fx=Wh。",
    history: "楔是经典简单机械，通过斜面把较长水平位移换成较短竖直位移。",
    controls: [
      c("angle", "楔角", "°", 5, 40, 1, 15),
      c("load", "竖向负载", "N", 100, 2000, 100, 1000),
      c("stroke", "水平推进量", "cm", 1, 20, 1, 10),
    ],
    compare: "angle",
    metric: "force",
    scenes: ["小楔角", 10, "大楔角", 30],
    counter: { stroke: 20 },
    invitation: "改变楔角，比较推力与举升距离。",
    look: "省下的力，是否要用更多水平推进量换回来？",
    hint: "理想无摩擦条件下输入输出功相等。",
    legend: ["青色：楔块", "金块：竖直导向负载", "底座：水平导轨"],
    transfer: "推进距离加倍时，举升和做功怎样变化？",
    solve: (p) => {
      const t = Math.tan(deg(p.angle!)),
        F = p.load! * t,
        h = p.stroke! * 0.01 * t,
        b = new Apparatus();
      // The follower's right lower corner is the highest contact point on the
      // rising wedge; putting its centre on the slope would intersect the solid.
      const shift=p.stroke!*5,contactX=420,contactY=350-(contactX+35-(220-shift))*t;
      b.base()
        .prism(
          [
            [220-shift, 350],
            [580-shift, 350],
            [580-shift, 350 - 360 * t],
          ],
          C.teal,
        )
        .box(contactX-35,contactY-60,70,60,C.gold,.7)
        .line([contactX-42,70],[contactX-42,350],C.ink)
        .line([contactX+42,70],[contactX+42,350],C.ink)
        .arrow([650,320],[650-Math.min(100,20+F*.05),320],C.red)
        .text(80,65,'向左推进楔块 · 导向负载右下角接触，只能竖直移动');
      return b.finish(
        [
          m("force", "理想水平推力", F, "N"),
          m("rise", "竖向举升", h * 100, "cm"),
          m("input", "输入=输出功", F * p.stroke! * 0.01, "J"),
        ],
        "无摩擦模型中能量相等；实际接触摩擦可显著增加推力并影响自锁。",
        [graph("推力", "°", "N", 5, 40, (x) => p.load! * Math.tan(deg(x)))],
      );
    },
  }),
  define({
    ...common,
    id: "S19",
    slug: "belt-drive",
    name: "皮带传动",
    question: "换一只大轮，转速与力矩怎样交换？",
    topic: "机构 · 带传动",
    known: "开式理想无滑动皮带，主动轮半径0.1 m，忽略张力与包角限制。",
    proof: "ω₁r₁=ω₂r₂；P=τω守恒，τ₂/τ₁=r₂/r₁。",
    history:
      "皮带传动将动力传到不同轴，理想速比由直径确定，实际还会受滑移和弹性影响。",
    controls: [
      c("ratio", "从动/主动半径比", "", 0.5, 3, 0.1, 2),
      c("speed", "主动转速", "rpm", 30, 300, 10, 120),
      c("torque", "主动扭矩", "N·m", 1, 10, 1, 3),
      c("time", "经过时间", "s", 0, 30, 0.01, 0),
    ],
    compare: "ratio",
    metric: "speed",
    time: {key:'time',max:30,rate:.15,loop:true},
    drag: {key:'ratio',axis:'x',min:.5,max:3},
    scenes: ["等大轮", 1, "大从动轮", 2],
    counter: { ratio: 0.5 },
    invitation: "增大右侧皮带轮，比较转速和扭矩。",
    look: "输出扭矩增大，输出功率也增大了吗？",
    hint: "开式皮带两轮同向，不同于外啮合齿轮反向。",
    legend: ["左轮：主动", "右轮：从动", "金线：开式皮带"],
    transfer: "从动轮更小时，会加速还是减速？",
    solve: beltObservation,
  }),
  define({
    ...common,
    id: "S20",
    slug: "planetary-gear",
    name: "行星齿轮",
    question: "固定不同零件，传动关系为什么会变？",
    topic: "机构 · 周转轮系",
    known:
      "内齿圈固定，太阳轮驱动、行星架输出；太阳齿数20，齿圈齿数为40–100偶数。",
    proof: "(ωs−ωc)/(ωr−ωc)=−Nr/Ns，ωr=0⇒ωc=ωs/(1+Nr/Ns)。",
    history:
      "周转轮系在紧凑空间实现同轴变速，行星架与固定件的选择决定不同传动模式。",
    controls: [
      c("ring", "齿圈齿数", "齿", 40, 100, 2, 60),
      c("speed", "太阳轮转速", "rpm", 30, 300, 10, 120),
      c("time", "经过时间", "s", 0, 30, .01, 0),
    ],
    compare: "ring",
    metric: "carrier",
    time: {key:'time',max:30,rate:.15,loop:true,caption:'真实角速度的0.15倍慢放；外齿圈固定。'},
    scenes: ["60齿圈", 60, "100齿圈", 100],
    counter: { ring: 40 },
    invitation: "增大固定齿圈齿数，观察行星架输出转速。",
    look: "行星轮自转与行星架公转能混为一谈吗？",
    hint: "该模型只演示齿圈固定模式，不表示所有周转轮系公式相同。",
    legend: ["金环：固定齿圈", "青轮：太阳轮", "蓝轮：三个行星轮"],
    transfer: "齿圈40齿时，理想减速比是多少？",
    solve: (p) => {
      const nr = p.ring!,
        ns = 20,
        np = (nr - ns) / 2,
        ratio = 1 + nr / ns,
        R = 155,
        rs = (R * ns) / nr,
        rp = (R * np) / nr,
        b = new Apparatus(),
        sunAngle=p.speed!*2*pi/60*(p.time??0),
        carrierAngle=sunAngle/ratio;
      b.base().ring(400,230,R,C.gold,-.18).ring(400,230,R,C.gold,.18).gear(400,230,rs,ns,sunAngle);
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * pi) / 3+carrierAngle;
        b.gear(
          400 + (rs + rp) * Math.cos(a),
          230 + (rs + rp) * Math.sin(a),
          rp,np,carrierAngle-(ns/np)*(sunAngle-carrierAngle),
          C.blue,
        ).line(
          [400, 230],
          [400 + (rs + rp) * Math.cos(a), 230 + (rs + rp) * Math.sin(a)],
          C.ink,
        );
      }
      b.text(70,55,'金色齿圈固定 · 青色太阳轮驱动 · 蓝色行星轮')
        .text(70,425,`行星架 ${(p.speed!/ratio).toFixed(1)} rpm · 齿形为示意，速比由节圆决定`);
      return b.finish(
        [
          m("carrier", "行星架输出转速", p.speed! / ratio, "rpm"),
          m("ratio", "太阳轮/行星架速比", ratio, ""),
          m("planet", "行星轮齿数", np, "齿"),
        ],
        "同模数几何满足Nr=Ns+2Np；齿形为示意，不是可制造齿廓。行星轮自转与行星架公转按同一轮系约束推进。",
        [
          graph(
            "输出转速",
            "齿圈齿数",
            "rpm",
            40,
            100,
            (x) => p.speed! / (1 + x / 20),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S21",
    slug: "four-bar-linkage",
    name: "四杆机构",
    question: "转动一根杆，另外两根怎样跟随？",
    topic: "机构 · 闭环约束",
    known:
      "固定杆4、输入杆1、连杆3、输出杆2.5，选择两圆交点的上支；展示装配几何不求动力学。",
    proof: "输入端A=(cosθ,sinθ)，另一固定端D=(4,0)；B满足|B−A|=3、|B−D|=2.5。",
    history:
      "四杆闭环是常见机构，长度约束决定运动，装配分支和死点必须与动画外观分开。",
    controls: [
      c("angle", "输入杆转角", "°", 0, 360, 5, 60),
      c("branch", "装配分支", "", 1, 2, 1, 1, [
        [1, "第一交点"],
        [2, "第二交点"],
      ]),
    ],
    compare: "angle",
    metric: "residual",
    scenes: ["小转角", 45, "大转角", 150],
    counter: { branch: 2 },
    invitation: "转动输入杆，核对闭环两杆长度。",
    look: "画面在运动，杆长残差是否仍接近0？",
    hint: "切换交点是另一个装配分支，不是杆长变化。",
    legend: ["短青杆：输入", "金杆：连杆", "蓝杆：输出"],
    transfer: "另一装配分支是否也满足相同杆长？",
    solve: (p) => {
      const t = deg(p.angle!),
        A: Point = [Math.cos(t), Math.sin(t)],
        D: Point = [4, 0],
        dx = D[0] - A[0],
        dy = -A[1],
        d = Math.hypot(dx, dy),
        u = (9 - 6.25 + d * d) / (2 * d),
        h = Math.sqrt(Math.max(0, 9 - u * u)),
        s = p.branch! === 1 ? 1 : -1,
        B: Point = [
          A[0] + (u * dx) / d - (s * h * dy) / d,
          A[1] + (u * dy) / d + (s * h * dx) / d,
        ],
        pr = ([x, y]: Point): Point => [200 + x * 70, 230 - y * 70],
        b = new Apparatus();
      b.line(pr([0, 0]), pr(D), C.ink)
        .line(pr([0, 0]), pr(A))
        .line(pr(A), pr(B), C.gold)
        .line(pr(B), pr(D), C.blue);
      for (const V of [[0, 0], A, B, D] as Point[]) b.ball(...pr(V), 6);
      return b.finish(
        [
          m(
            "residual",
            "两活动杆长残差",
            Math.abs(Math.hypot(B[0] - A[0], B[1] - A[1]) - 3) +
              Math.abs(Math.hypot(B[0] - 4, B[1]) - 2.5),
            "",
          ),
          m(
            "output",
            "输出杆角度",
            (Math.atan2(B[1], B[0] - 4) * 180) / pi,
            "°",
          ),
        ],
        "每一帧由两圆相交求解；输入角不是动态力矩或转速解。",
      );
    },
  }),
  define({
    ...common,
    id: "S22",
    slug: "scissor-lift",
    name: "剪叉升降",
    question: "平台快收拢时，为什么越来越难推？",
    topic: "机构 · 虚功与奇异位形",
    known: "单级理想剪叉，杆长2 m，水平驱动底部跨度，负载竖直；无摩擦无自重。",
    proof: "h=Lsinθ，x=Lcosθ；|F|=W|dh/dx|=Wcotθ。",
    history:
      "剪叉机构以交叉杆展开升降，接近平放时机械优势不利，驱动力可能很大。",
    controls: [
      c("angle", "杆与水平夹角", "°", 5, 75, 1, 30),
      c("load", "平台负载", "kN", 1, 10, 0.5, 4),
    ],
    compare: "angle",
    metric: "force",
    scenes: ["较展开", 50, "接近平放", 10],
    counter: { angle: 5 },
    invitation: "收拢剪叉，比较平台高度与水平驱动力。",
    look: "平台越低，驱动力一定越小吗？",
    hint: "奇异位形附近小高度变化要求很大的水平力。",
    legend: ["青杆：交叉剪叉", "上板：升降平台", "金线：水平驱动"],
    transfer: "趋近平放时，理想力为什么会发散？",
    solve: (p) => {
      const a = deg(p.angle!),
        h = 2 * Math.sin(a),
        x = 2 * Math.cos(a),
        F = p.load! / Math.tan(a),
        b = new Apparatus(),
        left = 400 - x * 50,
        right = 400 + x * 50,
        y = 360 - h * 100;
      b.base()
        .line([left, 360], [right, y])
        .line([right, 360], [left, y])
        .box(left - 20, y - 15, right - left + 40, 15, C.gold)
        .ball(400, (360 + y) / 2, 8, C.ink);
      return b.finish(
        [
          m("force", "水平驱动力大小", F, "kN"),
          m("height", "平台高度", h, "m"),
          m("span", "底部水平跨度", x, "m"),
        ],
        "模型限定θ≥5°；不能把无限驱动力的平放极限当成可操作初态。",
        [
          graph(
            "水平驱动力",
            "°",
            "kN",
            5,
            75,
            (x) => p.load! / Math.tan(deg(x)),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S23",
    slug: "spherical-cap-dome",
    name: "球冠穹顶",
    question: "同样的跨度，屋顶抬高会用多少材料？",
    topic: "建造 · 曲面几何",
    known: "球冠底面半径a、高h，薄壳只计算几何面积与封闭体积，不给承载结论。",
    proof: "R=(a²+h²)/(2h)，A=2πRh=π(a²+h²)，V=πh(3a²+h²)/6。",
    history:
      "穹顶把围护空间与曲面材料连接；球冠几何不能替代壳体稳定、开口与支座分析。",
    controls: [
      c("height", "穹顶高度", "m", 0.5, 4, 0.1, 2),
      c("radius", "底面半径", "m", 2, 6, 0.2, 4),
    ],
    compare: "height",
    metric: "area",
    scenes: ["浅穹顶", 1, "高穹顶", 3],
    counter: { radius: 6 },
    invitation: "抬高同跨度的穹顶，比较面积和围合体积。",
    look: "更大的体积需要按相同比例增加表面积吗？",
    hint: "面积不含底板；不凭曲面完整就判定结构安全。",
    legend: ["青曲面：球冠", "金环：底口", "蓝线：经线参照"],
    transfer: "跨度变大而高度不变，球面半径怎样变化？",
    solve: (p) => {
      const a = p.radius!,
        h = p.height!,
        R = (a * a + h * h) / (2 * h),
        theta = Math.acos((R - h) / R),
        b = new Apparatus(),
        s = 40;
      b.trace(
        Array.from({ length: 81 }, (_, i) => {
          const t = -theta + (2 * theta * i) / 80;
          return [
            400 + R * Math.sin(t) * s,
            350 - (R * Math.cos(t) - (R - h)) * s,
          ] as Point;
        }),
      );
      b.line([400 - a * s, 350], [400 + a * s, 350], C.gold);
      b.solids = [];
      for (let j = 0; j < 12; j++)
        for (let i = 0; i < 24; i++) {
          const v = (t: number, u: number): Vec3 => [
            R * Math.sin(t) * Math.cos(u),
            R * Math.cos(t) - (R - h),
            R * Math.sin(t) * Math.sin(u),
          ];
          b.solids.push({
            type: "polygon",
            points: [
              v((theta * j) / 12, (2 * pi * i) / 24),
              v((theta * (j + 1)) / 12, (2 * pi * i) / 24),
              v((theta * (j + 1)) / 12, (2 * pi * (i + 1)) / 24),
              v((theta * j) / 12, (2 * pi * (i + 1)) / 24),
            ],
            color: C.teal,
            opacity: 0.6,
          });
        }
      return b.finish(
        [
          m("area", "穹顶曲面面积", pi * (a * a + h * h), "m²"),
          m("volume", "围合球冠体积", (pi * h * (3 * a * a + h * h)) / 6, "m³"),
          m("sphere", "母球半径", R, "m"),
        ],
        "这里只作空间与用料几何比较，不包含厚度、应力、壳屈曲或施工稳定性。",
        [graph("曲面面积", "m", "m²", 0.5, 4, (x) => pi * (a * a + x * x))],
      );
    },
  }),
  define({
    ...common,
    id: "S24",
    slug: "diagonal-bracing",
    name: "斜撑抗剪",
    question: "方框为什么容易歪，斜撑怎样帮忙？",
    topic: "结构 · 侧向刚度",
    known:
      "两层模型：框架侧向刚度固定10 kN/m，加一根仅轴向线弹性斜撑；小位移，宽高各3 m，EA=1000 kN。",
    proof: "斜撑贡献k=EA cos²θ/L；δ=P/(k框+k撑)。",
    history:
      "三角形斜撑通过轴力提供抗侧刚度；拉压性能、节点和屈曲会影响真实效果。",
    controls: [
      c("brace", "是否加斜撑", "", 0, 1, 1, 0, [
        [0, "无斜撑"],
        [1, "有斜撑"],
      ]),
      c("load", "水平荷载", "kN", 0.5, 5, 0.5, 2),
    ],
    compare: "brace",
    metric: "displacement",
    scenes: ["只有框架", 0, "加上斜撑", 1],
    counter: { load: 5 },
    invitation: "加一根斜撑，比较相同水平荷载下的位移。",
    look: "几何三角化怎样转换为可计算的刚度？",
    hint: "图面变形放大并限幅，未做节点与杆件屈曲验算。",
    legend: ["青杆：框架", "金杆：斜撑", "红线：侧向荷载"],
    transfer: "载荷增大时，线弹性位移按什么比例变化？",
    solve: (p) => {
      const k = 10 + (p.brace! * 1000 * 0.5) / Math.sqrt(18),
        d = p.load! / k,
        shift = Math.min(90, d * 900),
        b = new Apparatus();
      b.base()
        .line([220, 350], [220 + shift, 120])
        .line([220 + shift, 120], [560 + shift, 120])
        .line([560 + shift, 120], [560, 350]);
      if (p.brace!) b.line([220, 350], [560 + shift, 120], C.gold);
      b.line([130, 120], [210 + shift, 120], C.red);
      return b.finish(
        [
          m("displacement", "顶部侧移", d * 1000, "mm"),
          m("stiffness", "总侧向刚度", k, "kN/m"),
        ],
        `侧移${(d * 1000).toFixed(3)} mm；显示变形放大并限幅，不代表大变形有限元。`,
        [graph("侧移", "kN", "mm", 0.5, 5, (P) => (P / k) * 1000)],
      );
    },
  }),
  define({
    ...common,
    id: "S25",
    slug: "honeycomb-relative-density",
    name: "蜂窝材料",
    question: "空心蜂窝，怎样比较轻与实？",
    topic: "材料几何 · 相对密度",
    known:
      "规则六边形薄壁、忽略节点重叠，t/l≤0.1；相对密度只给几何，不预测强度。",
    proof: "每胞分摊壁面积3lt，胞面积3√3l²/2，ρ*/ρs≈2t/(√3l)。",
    history:
      "蜂窝与泡沫材料通过结构形态降低重量；相同密度仍可因受力方向和缺陷产生很不同的刚度。",
    controls: [
      c("thickness", "壁厚/边长", "", 0.01, 0.1, 0.005, 0.03),
      c("density", "实体密度", "kg/m³", 300, 2700, 100, 1000),
    ],
    compare: "thickness",
    metric: "relative",
    scenes: ["薄壁", 0.03, "两倍壁厚", 0.06],
    counter: { thickness: 0.1 },
    invitation: "加厚蜂窝壁，比较等效密度。",
    look: "重量增加能否直接推断承载强度也翻倍？",
    hint: "只有密度关系，没有材料失效或屈曲模型。",
    legend: ["青边：六边形胞壁", "空白：孔隙", "三维：贯穿厚度的胞壁"],
    transfer: "接近薄壁范围上限，节点重叠误差为什么更重要？",
    solve: (p) => {
      const q = (2 * p.thickness!) / Math.sqrt(3),
        b = new Apparatus();
      b.solids = [];
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 5; col++) {
          const x = 210 + col * 75,
            y = 140 + row * 86 + (col % 2) * 43,
            pts = Array.from(
              { length: 6 },
              (_, i) =>
                [
                  x + 50 * Math.cos((i * pi) / 3),
                  y + 50 * Math.sin((i * pi) / 3),
                ] as Point,
            );
          for (let i = 0; i < 6; i++) {
            const a = pts[i]!,
              v = pts[(i + 1) % 6]!,
              dx = v[0] - a[0],
              dy = v[1] - a[1],
              n = Math.hypot(dx, dy),
              t = (50 * p.thickness!) / 2;
            b.prism(
              [
                [a[0] - (dy / n) * t, a[1] + (dx / n) * t],
                [v[0] - (dy / n) * t, v[1] + (dx / n) * t],
                [v[0] + (dy / n) * t, v[1] - (dx / n) * t],
                [a[0] + (dy / n) * t, a[1] - (dx / n) * t],
              ],
              C.teal,
              1.2,
            );
          }
        }
      return b.finish(
        [
          m("relative", "薄壁相对密度", q, ""),
          m("effective", "等效体积密度", q * p.density!, "kg/m³"),
        ],
        `相对密度约${q.toFixed(4)}；图中壁厚为可读性示意，真实壁厚比看控件。`,
        [
          graph(
            "相对密度",
            "t/l",
            "",
            0.01,
            0.1,
            (x) => (2 * x) / Math.sqrt(3),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S26",
    slug: "sandwich-beam",
    name: "夹芯梁",
    question: "把材料放远一点，为什么能更抗弯？",
    topic: "结构 · 夹芯截面",
    known:
      "两片铝面板各厚1 mm、宽0.1 m，中间芯材只保持间距、不计轴向刚度；简支跨长1 m、中央力100 N。",
    proof: "I=2[bt³/12+bt(h/2+t/2)²]；δ=PL³/(48EI)，E=70 GPa。",
    history:
      "夹芯结构把强面板分开放置，以较少高强材料获得较大抗弯惯性矩；芯材剪切与面板皱曲仍需另验。",
    controls: [
      c("core", "芯层厚度", "mm", 2, 40, 1, 10),
      c("load", "中央载荷", "N", 20, 200, 10, 100),
    ],
    compare: "core",
    metric: "deflection",
    scenes: ["薄芯层", 5, "厚芯层", 25],
    counter: { core: 2 },
    invitation: "分开两片面板，比较同载荷下的挠度。",
    look: "铝材用量没有变，惯性矩为什么增加？",
    hint: "忽略芯层剪切会低估实际挠度，尤其短厚梁。",
    legend: ["青板：上下铝面板", "金块：轻质芯材示意", "红线：中央载荷"],
    transfer: "芯层太薄时，面板为什么更容易弯？",
    solve: (p) => {
      const h = p.core! * 0.001,
        t = 0.001,
        bw = 0.1,
        I = 2 * ((bw * t ** 3) / 12 + bw * t * (h / 2 + t / 2) ** 2),
        d = p.load! / (48 * 70e9 * I),
        gap = 20 + p.core! * 2,
        b = new Apparatus();
      b.box(150, 230 - gap / 2, 500, 8)
        .box(150, 230 + gap / 2, 500, 8)
        .box(150, 238 - gap / 2, 500, gap - 8, C.gold, 1)
        .line([400, 90], [400, 225 - gap / 2], C.red)
        .base();
      return b.finish(
        [
          m("deflection", "弯曲挠度估计", d * 1000, "mm"),
          m("inertia", "面板总惯性矩", I, "m⁴"),
        ],
        "相同面板用量，增大分离距离提高抗弯惯性矩；未计芯材剪切和界面失效。",
        [
          graph(
            "弯曲挠度",
            "mm",
            "mm",
            2,
            40,
            (x) =>
              (p.load! /
                (48 *
                  70e9 *
                  2 *
                  ((bw * t ** 3) / 12 +
                    bw * t * ((x * 0.001) / 2 + t / 2) ** 2))) *
              1000,
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S27",
    slug: "room-reverberation",
    name: "房间混响",
    question: "给教室加吸声材料，回声会怎样变短？",
    topic: "建筑环境 · 声学",
    known:
      "Sabine扩散声场近似，房间8×6×3 m，总表面积180 m²；均匀平均吸声系数0.05–0.5。",
    proof: "T60≈0.161V/A，A=αS；高吸声、非扩散声场不适用。",
    era: "19世纪末 · 萨宾",
    history:
      "萨宾通过礼堂实验把衰减时间、体积与吸声量连接，奠定建筑声学的重要基础。",
    controls: [
      c("absorption", "平均吸声系数", "", 0.05, 0.5, 0.01, 0.1),
      c("volume", "房间体积倍率", "", 0.5, 2, 0.1, 1),
    ],
    compare: "absorption",
    metric: "reverberation",
    scenes: ["硬表面", 0.1, "增加吸声", 0.3],
    counter: { absorption: 0.05 },
    invitation: "增加吸声比例，看声能衰减到−60dB要多久。",
    look: "房间变大而相似缩放时，混响时间怎样变化？",
    hint: "体积倍率缩放三维尺度，面积按倍率的2/3次方变化。",
    legend: ["青框：房间", "金面：吸声示意", "曲线：声压级衰减"],
    transfer: "低吸声的房间，声音为什么拖得更久？",
    solve: (p) => {
      const q = p.volume!,
        V = 144 * q,
        S = 180 * q ** (2 / 3),
        T = (0.161 * V) / (p.absorption! * S),
        b = new Apparatus(),
        v: Vec3[] = [
          [0, 0, 0],
          [8, 0, 0],
          [8, 3, 0],
          [0, 3, 0],
          [0, 0, 6],
          [8, 0, 6],
          [8, 3, 6],
          [0, 3, 6],
        ],
        pr = ([x, y, z]: Vec3): Point => [
          130 + x * 50 + z * 22,
          350 - y * 75 - z * 15,
        ];
      for (const [i, j] of [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ])
        b.line(pr(v[i!]!), pr(v[j!]!));
      b.solids = v
        .slice(0, 0)
        .map(() => ({ type: "line" as const, points: [] }));
      for (const [i, j] of [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ])
        b.solids.push({
          type: "line",
          points: [
            v[i!]!.map((x) => x * q ** (1 / 3)) as Vec3,
            v[j!]!.map((x) => x * q ** (1 / 3)) as Vec3,
          ],
          color: C.teal,
        });
      b.box(
        170,
        300 - 200 * p.absorption!,
        220,
        200 * p.absorption!,
        C.gold,
        0.12,
      ).text(100, 65, `平均吸声系数 ${p.absorption} · 金色为吸声量示意`);
      return b.finish(
        [
          m("reverberation", "Sabine混响时间T60", T, "s"),
          m("absorption_area", "等效吸声面积", p.absorption! * S, "m²"),
        ],
        "只估计扩散声场混响，不计算回声路径、语言清晰度或实际教室达标性。",
        [graph("衰减示意", "s", "dB", 0, Math.max(1, T), (t) => (-60 * t) / T)],
      );
    },
  }),
  define({
    ...common,
    id: "S28",
    slug: "solar-shading",
    name: "日照遮阳",
    question: "挑檐伸出多少，能挡住夏天的阳光？",
    topic: "建筑环境 · 太阳几何",
    known:
      "太阳光位于墙法向竖直平面，水平挑檐紧贴窗顶，窗高1.5 m；不计散射和方位偏差。",
    proof: "竖向阴影h=D tanα；遮挡比例=min(h/H窗,1)。",
    history:
      "被动遮阳利用季节太阳高度差，实际设计还要结合朝向、纬度、时刻和周边遮挡。",
    controls: [
      c("depth", "挑檐进深", "m", 0, 1.5, 0.05, 0.5),
      c("altitude", "太阳高度角", "°", 10, 75, 1, 60),
    ],
    compare: "depth",
    metric: "shaded",
    scenes: ["浅挑檐", 0.3, "深挑檐", 0.9],
    counter: { altitude: 15 },
    invitation: "伸出挑檐，观察窗面阴影向下移动。",
    look: "夏季高太阳和冬季低太阳会得到相同遮挡吗？",
    hint: "这不是全年建筑日照时数模拟。",
    legend: ["青面：窗", "金板：水平挑檐", "红线：太阳边界射线"],
    transfer: "低太阳高度时，固定挑檐还挡得住整扇窗吗？",
    solve: (p) => {
      const h = p.depth! * Math.tan(deg(p.altitude!)),
        f = Math.min(1, h / 1.5),
        b = new Apparatus();
      b.box(380, 120, 20, 240, C.ink, 0.8)
        .box(400, 120, 180, 240, C.blue, 0.1)
        .box(400, 105, 180 * p.depth!, 15, C.gold, 0.8)
        .line(
          [400 + 180 * p.depth!, 120],
          [400, 120 + Math.min(280, h * 160)],
          C.red,
        )
        .box(405, 125, 170, 230 * f, C.teal, 0.1);
      return b.finish(
        [
          m("shaded", "窗高遮挡比例", 100 * f, "%"),
          m("shadow", "理论竖向阴影", h, "m"),
        ],
        `直射遮挡约${(100 * f).toFixed(1)}%；未计算朝向、辐照能量和全年日照。`,
        [
          graph(
            "遮挡比例",
            "m",
            "%",
            0,
            1.5,
            (D) => 100 * Math.min(1, (D * Math.tan(deg(p.altitude!))) / 1.5),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S29",
    slug: "rainwater-harvesting",
    name: "雨水收集",
    question: "一场雨，屋顶能存下多少水？",
    topic: "建筑环境 · 水量平衡",
    known:
      "单场降雨、屋面径流系数0.8；雨前水箱为空，不计首段弃流、蒸发与用水。",
    proof: "V来=雨深×面积×径流系数；存水=min(V来,容量)，溢流=max(V来−容量,0)。",
    history:
      "雨水收集在不同文明中长期使用；工程系统还需处理水质、弃流和多时段供需。",
    controls: [
      c("rain", "单场雨量", "mm", 0, 100, 5, 20),
      c("area", "集雨屋顶面积", "m²", 20, 200, 10, 100),
      c("capacity", "水箱容量", "m³", 0.5, 10, 0.5, 2),
    ],
    compare: "rain",
    metric: "stored",
    scenes: ["小雨量", 10, "大雨量", 60],
    counter: { rain: 0 },
    invitation: "增加这场雨的雨量，看水箱何时溢流。",
    look: "超过容量后，降雨增加的水去了哪里？",
    hint: "收集量与存下的量不同，要把溢流记到账本里。",
    legend: ["青斜面：集雨屋顶", "蓝箱：储水", "金线：落水管与溢流路径"],
    transfer: "不下雨时，空水箱会凭空获得水吗？",
    solve: (p) => {
      const inflow = p.rain! * 0.001 * p.area! * 0.8,
        stored = Math.min(inflow, p.capacity!),
        overflow = Math.max(0, inflow - p.capacity!),
        b = new Apparatus();
      b.plate(
        [
          [100, 180],
          [310, 100],
          [510, 180],
        ],
        C.teal,
      )
        .line([510, 180], [620, 180], C.gold)
        .line([620, 180], [620, 270], C.gold)
        .box(540, 270, 150, 120, C.blue)
        .box(
          545,
          385 - (110 * stored) / p.capacity!,
          140,
          (110 * stored) / p.capacity!,
          C.blue,
        );
      return b.finish(
        [
          m("stored", "本场最终存水", stored, "m³"),
          m("inflow", "进入系统水量", inflow, "m³"),
          m("overflow", "溢流", overflow, "m³"),
        ],
        `来水${inflow.toFixed(3)}=存水${stored.toFixed(3)}+溢流${overflow.toFixed(3)} m³；不预测全年节水率。`,
        [
          graph("最终存水", "mm", "m³", 0, 100, (x) =>
            Math.min(x * 0.001 * p.area! * 0.8, p.capacity!),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "S30",
    slug: "stack-ventilation",
    name: "烟囱通风",
    question: "不装风扇，温差能让空气动起来吗？",
    topic: "建筑环境 · 热压通风",
    known:
      "稳态小温差近似，室外293 K，室内更热；等效开口面积、流量系数0.6，不含风压与管道摩擦。",
    proof: "Q≈CdA√(2gHΔT/T外)；温差为0时热压驱动为0。",
    history:
      "烟囱效应利用密度差驱动通风，传统建筑与现代被动设计都有应用，但真实气流网络需要阻力与风场分析。",
    controls: [
      c("height", "进排气高度差", "m", 1, 12, 0.5, 4),
      c("difference", "室内外温差", "K", 0, 30, 1, 10),
      c("area", "等效开口面积", "m²", 0.02, 0.5, 0.02, 0.1),
    ],
    compare: "height",
    metric: "flow",
    scenes: ["低烟囱", 2, "高烟囱", 8],
    counter: { difference: 0 },
    invitation: "抬高排风口，比较温差驱动的空气流量。",
    look: "高度增加四倍，流量会增加四倍吗？",
    hint: "平方根标度；温差为0时本模型不产生气流，但现实可能有风。",
    legend: ["青框：建筑与竖井", "金线：上升流向", "蓝口：低处进风"],
    transfer: "没有温差时，热压公式还能给非零流量吗？",
    solve: (p) => {
      const Q =
          0.6 *
          p.area! *
          Math.sqrt((2 * 9.8 * p.height! * p.difference!) / 293),
        b = new Apparatus();
      b.box(220, 170, 250, 200)
        .box(470, 340 - 22 * p.height!, 70, 30 + 22 * p.height!, C.ink, 0.8)
        .line([260, 330], [500, 330], C.blue)
        .line([505, 330], [505, 340 - 22 * p.height!], C.gold)
        .text(90, 60, "热压近似 · 排气高度差决定驱动力");
      return b.finish(
        [
          m("flow", "体积通风量", Q * 3600, "m³/h"),
          m(
            "pressure",
            "热压差近似",
            (1.2 * 9.8 * p.height! * p.difference!) / 293,
            "Pa",
          ),
        ],
        p.difference! === 0
          ? "无温差，无热压驱动；并不表示真实建筑一定没有风。"
          : `模型通风量${(Q * 3600).toFixed(1)} m³/h；未包括风压、阻力与开口耦合。`,
        [
          graph(
            "热压通风量",
            "m",
            "m³/h",
            1,
            12,
            (H) =>
              0.6 *
              p.area! *
              Math.sqrt((2 * 9.8 * H * p.difference!) / 293) *
              3600,
          ),
        ],
      );
    },
  }),
];
