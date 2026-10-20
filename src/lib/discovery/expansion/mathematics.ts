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
const common = {
  source: source.math,
  sourceTitle: "Wolfram MathWorld · 相关词条",
  era: "经典几何与数学",
  stage: "初中直观 · 高中论证拓展",
};
export const mathAdditions = [
  define({
    ...common,
    id: "M11",
    slug: "pythagorean-squares",
    name: "勾股面积拼证",
    question: "三条边上的正方形，怎样对上面积账？",
    topic: "平面几何 · 勾股关系",
    known:
      "直角三角形，a、b为直角边；三维以等厚薄板表达面积，不把厚度计入面积。",
    proof: "c²=a²+b²；边长平方对应正方形面积，数值检验不替代一般证明。",
    history:
      "勾股关系在多个古代文明中出现；《周髀算经》与赵爽弦图体现了中国古代以面积解释几何的传统。",
    controls: [
      c("a", "直角边a", "", 1, 5, 0.1, 3),
      c("b", "直角边b", "", 1, 5, 0.1, 4),
    ],
    compare: "a",
    metric: "residual",
    scenes: ["三四五", 3, "改变一边", 4],
    counter: { b: 1 },
    invitation: "改变一条直角边，对照三个正方形面积。",
    look: "a²+b²−c²是否保持0？",
    hint: "图中面积随边长平方变化，斜边需要重新计算。",
    legend: ["青色：a²", "金色：b²", "蓝色：c²"],
    transfer: "改变另一条边，不变量仍成立吗？",
    solve: (p) => {
      const a = p.a!,
        d = p.b!,
        h = Math.hypot(a, d),
        s = 24,
        b = new Apparatus();
      b.plate(
        [
          [380, 300],
          [380 + a * s, 300],
          [380, 300 - d * s],
        ],
        C.ink,
      )
        .box(380, 300, a * s, a * s, C.teal, 0.12)
        .box(380 - d * s, 300 - d * s, d * s, d * s, C.gold, 0.12);
      const A: Point = [380 + a * s, 300],
        B: Point = [380, 300 - d * s],
        n: Point = [d * s, -a * s];
      b.plate(
        [A, B, [B[0] + n[0], B[1] + n[1]], [A[0] + n[0], A[1] + n[1]]],
        C.blue,
      ).text(80, 55, "三个正方形 · 面积单位为平方单位");
      return b.finish(
        [
          m("residual", "面积差", a * a + d * d - h * h, ""),
          m("hypotenuse", "斜边", h, ""),
          m("area", "两直角边正方形总面积", a * a + d * d, ""),
        ],
        "直角条件保持，面积差仅有浮点舍入误差；一般结论仍需面积拼证。",
        [graph("斜边平方", "a", "", 1, 5, (x) => x * x + d * d)],
      );
    },
  }),
  define({
    ...common,
    id: "M12",
    slug: "triangle-centroid",
    name: "三角形重心",
    question: "顶点移动，三条中线还会相交吗？",
    topic: "平面几何 · 中线与重心",
    known: "A=(−3,0)，B=(3,0)，C=(x,h)，h>0；读数采用坐标单位。",
    proof: "G=(A+B+C)/3；中线分点满足CG:GD=2:1，其中D为AB中点。",
    history:
      "三角形中线共点是经典欧氏几何命题，也与均匀三角薄板的重心位置一致。",
    controls: [
      c("x", "顶点横坐标", "", -4, 4, 0.2, 1),
      c("height", "顶点高度", "", 1, 5, 0.2, 3),
    ],
    compare: "x",
    metric: "ratio",
    scenes: ["向左移动", -2, "向右移动", 2],
    counter: { height: 1 },
    invitation: "左右移动顶点，寻找三条中线的共同点。",
    look: "顶点位置变化后，重心分割中线的比值保持吗？",
    hint: "中线连的是顶点与对边中点，不能与角平分线混淆。",
    legend: ["青边：三角形", "金线：三条中线", "金球：重心"],
    transfer: "把三角形压扁一些，共点比值还成立吗？",
    solve: (p) => {
      const A: Point = [190, 360],
        B: Point = [610, 360],
        V: Point = [400 + p.x! * 55, 360 - p.height! * 55],
        G: Point = [(A[0] + B[0] + V[0]) / 3, (A[1] + B[1] + V[1]) / 3],
        b = new Apparatus();
      b.plate([A, B, V]);
      for (const [u, v, w] of [
        [A, B, V],
        [B, A, V],
        [V, A, B],
      ])
        b.line(u!, [(v![0] + w![0]) / 2, (v![1] + w![1]) / 2], C.gold);
      b.ball(...G, 8).text(80, 55, "均匀三角薄板 · 中线共点");
      return b.finish(
        [
          m("ratio", "顶点到重心/重心到中点", 2, ""),
          m("gx", "重心横坐标", p.x! / 3, ""),
          m("gy", "重心纵坐标", p.height! / 3, ""),
        ],
        `重心G=(${(p.x! / 3).toFixed(3)},${(p.height! / 3).toFixed(3)})；中线被分成2:1。`,
      );
    },
  }),
  define({
    ...common,
    id: "M13",
    slug: "similarity-shadow",
    name: "相似测高",
    question: "一根标杆，怎样量出高塔的高度？",
    topic: "平面几何 · 相似三角形",
    known: "水平地面、平行阳光，标杆高1 m，太阳高度角相同；不计算地球曲率。",
    proof: "H/S塔=h/s杆=tanα；H=S塔 tanα。",
    history:
      "古代测量常用影长和相似关系求不可直接到达的高度，中国《海岛算经》也包含重差测量方法。",
    controls: [
      c("sun", "太阳高度角", "°", 10, 75, 1, 30),
      c("height", "塔高", "m", 2, 12, 0.5, 6),
    ],
    compare: "sun",
    metric: "inferred",
    scenes: ["低太阳", 25, "高太阳", 50],
    counter: { height: 10 },
    invitation: "改变太阳高度，让两条影子同时变化。",
    look: "影长改变，反算的塔高是否仍相同？",
    hint: "比较影长比，阳光角度在两处必须相同。",
    legend: ["高青柱：塔", "短金柱：标杆", "细线：平行阳光"],
    transfer: "换成更高的塔，方法需要改变吗？",
    solve: (p) => {
      const a = deg(p.sun!),
        S = p.height! / Math.tan(a),
        s = 1 / Math.tan(a),
        scale = 520 / (S + p.height! + 3),
        b = new Apparatus();
      b.base()
        .box(140, 350 - p.height! * scale, 14, p.height! * scale)
        .line([140, 350 - p.height! * scale], [140 + S * scale, 350], C.gold)
        .box(570, 350 - scale, 8, scale, C.gold)
        .line([570, 350 - scale], [570 + s * scale, 350], C.gold);
      return b.finish(
        [
          m("inferred", "影长法反算塔高", S / s, "m"),
          m("tower_shadow", "塔影长", S, "m"),
          m("stick_shadow", "标杆影长", s, "m"),
        ],
        `塔影${S.toFixed(3)} m，标杆影${s.toFixed(3)} m；二者比值给出塔高。`,
        [
          graph(
            "塔影长",
            "°",
            "m",
            10,
            75,
            (x) => p.height! / Math.tan(deg(x)),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "M14",
    slug: "sine-rule-circle",
    name: "正弦定理",
    question: "角和对边，怎样一起锁定外接圆？",
    topic: "三角函数 · 正弦定理",
    known: "圆半径R固定，两端点A、B与圆周顶点C；所取角A∈(0,180°)。",
    proof: "a=2R sinA，所以a/sinA=2R。",
    history:
      "正弦定理把弦长与所对角联系起来，在天文测量、导航和三角测量中长期使用。",
    controls: [
      c("angle", "所对圆周角", "°", 15, 165, 1, 45),
      c("radius", "外接圆半径", "", 1, 4, 0.1, 2),
    ],
    compare: "angle",
    metric: "diameter",
    scenes: ["小角", 30, "大角", 60],
    counter: { radius: 3 },
    invitation: "转动圆周角，观察对边弦长。",
    look: "a/sinA保持什么值？",
    hint: "角与对边要对应；补角也有同一正弦。",
    legend: ["圆环：外接圆", "青线：对边弦", "金点：圆周顶点"],
    transfer: "换一个外接圆半径，比值怎样改变？",
    solve: (p) => {
      const a = deg(p.angle!),
        R = p.radius!,
        r = 40 + 25 * R,
        b = new Apparatus(),
        A: Point = [400 + r * Math.cos(a), 230 + r * Math.sin(a)],
        B: Point = [400 + r * Math.cos(a), 230 - r * Math.sin(a)],
        V: Point = [400 - r, 230];
      b.ring(400, 230, r, C.blue)
        .plate([A, B, V])
        .line(A, B, C.gold)
        .ball(...V, 7);
      return b.finish(
        [
          m("diameter", "边长/角的正弦", 2 * R, ""),
          m("side", "所对边长", 2 * R * Math.sin(a), ""),
          m("sine", "角的正弦", Math.sin(a), ""),
        ],
        `a/sinA=${2 * R}，等于直径；绘图取角的主支时需要结合所处圆弧。`,
        [graph("对边弦长", "°", "", 15, 165, (x) => 2 * R * Math.sin(deg(x)))],
      );
    },
  }),
  define({
    ...common,
    id: "M15",
    slug: "cosine-rule-hinge",
    name: "余弦定理",
    question: "两根杆一样长，第三边为什么会变？",
    topic: "三角函数 · 余弦定理",
    known: "两边a、b与夹角C给定，0<C<180°，长度单位归一化。",
    proof: "c²=a²+b²−2ab cosC；C=90°时退化为勾股定理。",
    history:
      "欧几里得《几何原本》以几何形式给出钝角和锐角三角形关系，现代余弦写法统一了两种情况。",
    controls: [
      c("angle", "两杆夹角", "°", 5, 175, 1, 60),
      c("a", "第一杆长", "", 1, 4, 0.1, 3),
      c("b", "第二杆长", "", 1, 4, 0.1, 2),
    ],
    compare: "angle",
    metric: "third",
    scenes: ["锐角", 60, "直角", 90],
    counter: { angle: 120 },
    invitation: "打开两杆铰链，测量两端间距。",
    look: "什么时候第三边平方等于两边平方和？",
    hint: "余弦项随锐角、直角、钝角改变符号。",
    legend: ["青杆：两条已知边", "金线：第三边", "节点：铰接端"],
    transfer: "夹角变为钝角，第三边平方更大还是更小？",
    solve: (p) => {
      const a = deg(p.angle!),
        v = Math.sqrt(p.a! ** 2 + p.b! ** 2 - 2 * p.a! * p.b! * Math.cos(a)),
        A: Point = [320, 310],
        B: Point = [320 + 70 * p.a!, 310],
        D: Point = [
          320 + 70 * p.b! * Math.cos(a),
          310 - 70 * p.b! * Math.sin(a),
        ],
        b = new Apparatus();
      b.plate([A, B, D])
        .line(B, D, C.gold)
        .ball(...A, 10)
        .text(80, 55, "两边与夹角 · 第三边随角改变");
      return b.finish(
        [
          m("third", "第三边长度", v, ""),
          m("correction", "余弦修正项", -2 * p.a! * p.b! * Math.cos(a), ""),
        ],
        `第三边${v.toFixed(4)}；余弦修正项${(-2 * p.a! * p.b! * Math.cos(a)).toFixed(4)}。`,
        [
          graph("第三边", "°", "", 5, 175, (x) =>
            Math.sqrt(
              p.a! ** 2 + p.b! ** 2 - 2 * p.a! * p.b! * Math.cos(deg(x)),
            ),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "M16",
    slug: "ptolemy-quadrilateral",
    name: "托勒密四边形",
    question: "圆内接四边形，两条对角线藏着什么关系？",
    topic: "平面几何 · 圆与度量",
    known: "四顶点按圆周顺序排列，前三点角度0°、70°、180°，第四点可动。",
    proof: "圆内接凸四边形满足AC·BD=AB·CD+BC·DA。",
    era: "公元2世纪 · 托勒密",
    history:
      "托勒密在天文学和弦表研究中使用圆内接四边形关系，这一恒等式也是欧氏几何的重要定理。",
    controls: [
      c("angle", "第四点圆周位置", "°", 200, 340, 1, 260),
      c("radius", "圆半径", "", 1, 3, 0.1, 2),
    ],
    compare: "angle",
    metric: "residual",
    scenes: ["靠近下方", 240, "靠近右方", 310],
    counter: { radius: 3 },
    invitation: "沿圆周拖动第四点，比较对角线与对边乘积。",
    look: "两边乘积之和与对角线乘积是否同步？",
    hint: "四点必须按圆周顺序组成凸四边形。",
    legend: ["青边：内接四边形", "金线：两条对角线", "蓝环：共同外接圆"],
    transfer: "只改变圆半径，等式两边按几次方变化？",
    solve: (p) => {
      const R = p.radius!,
        angles = [0, 70, 180, p.angle!],
        v = angles.map(
          (x) => [R * Math.cos(deg(x)), R * Math.sin(deg(x))] as Point,
        ),
        d = (i: number, j: number) =>
          Math.hypot(v[i]![0] - v[j]![0], v[i]![1] - v[j]![1]),
        lhs = d(0, 2) * d(1, 3),
        rhs = d(0, 1) * d(2, 3) + d(1, 2) * d(3, 0),
        pts = v.map(([x, y]) => [400 + x * 55, 230 - y * 55] as Point),
        b = new Apparatus();
      b.ring(400, 230, R * 55, C.blue)
        .plate(pts)
        .line(pts[0]!, pts[2]!, C.gold)
        .line(pts[1]!, pts[3]!, C.gold);
      return b.finish(
        [
          m("residual", "两边差", lhs - rhs, ""),
          m("diagonals", "对角线乘积", lhs, ""),
          m("opposite", "对边乘积之和", rhs, ""),
        ],
        "数值差在浮点舍入范围内；这是圆内接条件下的不变量，不是任意四边形公式。",
      );
    },
  }),
  define({
    ...common,
    id: "M17",
    slug: "parabola-focus-directrix",
    name: "抛物线焦准线",
    question: "离一个点和一条线一样远，会走出什么曲线？",
    topic: "解析几何 · 抛物线",
    known: "焦点F=(0,f)，准线y=−f；P=(x,x²/(4f))，f>0。",
    proof: "PF²=x²+(y−f)²=(y+f)²=dist(P,准线)²。",
    history:
      "阿波罗尼奥斯系统研究圆锥曲线；焦点—准线定义把曲线几何转化为坐标方程。",
    controls: [
      c("x", "曲线上横坐标", "", -3, 3, 0.1, 1),
      c("focus", "焦距参数f", "", 0.5, 2, 0.1, 1),
    ],
    compare: "x",
    metric: "difference",
    scenes: ["左侧一点", -2, "右侧一点", 2],
    counter: { focus: 0.5 },
    invitation: "沿抛物线移动点P，比较两段距离。",
    look: "离焦点的距离与到准线的垂距是否相等？",
    hint: "到一条线的距离要沿垂线量。",
    legend: ["青线：抛物线", "金线：到焦点距离", "蓝线：到准线垂距"],
    transfer: "焦点靠近顶点，曲线会更宽还是更窄？",
    solve: (p) => {
      const f = p.focus!,
        x = p.x!,
        y = (x * x) / (4 * f),
        s = 45,
        P: Point = [400 + x * s, 300 - y * s],
        b = new Apparatus(),
        d = Math.hypot(x, y - f);
      b.trace(
        Array.from({ length: 81 }, (_, i) => {
          const t = -3 + (6 * i) / 80;
          return [400 + t * s, 300 - ((t * t) / (4 * f)) * s] as Point;
        }),
      )
        .line([230, 300 + f * s], [570, 300 + f * s], C.blue)
        .ball(400, 300 - f * s, 7, C.gold)
        .line(P, [400, 300 - f * s], C.gold)
        .line(P, [P[0], 300 + f * s], C.blue)
        .ball(...P, 8);
      return b.finish(
        [
          m("difference", "焦距减准线距", d - (y + f), ""),
          m("focus_distance", "PF", d, ""),
          m("line_distance", "到准线距离", y + f, ""),
        ],
        `PF=${d.toFixed(4)}，到准线距离${(y + f).toFixed(4)}；两者相等。`,
      );
    },
  }),
  define({
    ...common,
    id: "M18",
    slug: "hyperbola-focal-difference",
    name: "双曲线双焦点",
    question: "到两点的距离差固定，会留下什么轨迹？",
    topic: "解析几何 · 双曲线",
    known: "a=1，焦点±c，c>a；P=(a cosh u,b sinh u)，b=√(c²−a²)，显示右支。",
    proof: "|PF₁−PF₂|=2a；x²/a²−y²/b²=1。",
    history:
      "双曲线的距离差定义与抛物线的等距、椭圆的距离和并列，构成解析几何的经典实验线索。",
    controls: [
      c("parameter", "曲线参数u", "", -1.5, 1.5, 0.05, 0.5),
      c("focus", "半焦距c", "", 1.2, 2.5, 0.1, 1.8),
    ],
    compare: "parameter",
    metric: "difference",
    scenes: ["下半支", -0.8, "上半支", 0.8],
    counter: { focus: 2.4 },
    invitation: "沿双曲线移动P，分别量到两个焦点的距离。",
    look: "距离在变，距离差为什么不变？",
    hint: "绝对值对应两支；不要误把距离和固定。",
    legend: ["青线：双曲线", "金点：两焦点", "金线：到焦点距离"],
    transfer: "改变焦点间距，距离差还能保持2a吗？",
    solve: (p) => {
      const a = 1,
        f = p.focus!,
        v = Math.sqrt(f * f - a * a),
        x = Math.cosh(p.parameter!),
        y = v * Math.sinh(p.parameter!),
        L = Math.hypot(x + f, y),
        R = Math.hypot(x - f, y),
        s = 47,
        b = new Apparatus(),
        P: Point = [400 + x * s, 230 - y * s];
      for (const side of [-1, 1])
        b.trace(
          Array.from({ length: 81 }, (_, i) => {
            const u = -1.5 + (3 * i) / 80;
            return [
              400 + side * Math.cosh(u) * s,
              230 - v * Math.sinh(u) * s,
            ] as Point;
          }),
        );
      for (const sign of [-1, 1])
        b.ball(400 + sign * f * s, 230, 6, C.gold).line(
          P,
          [400 + sign * f * s, 230],
          C.gold,
        );
      b.ball(...P, 8);
      return b.finish(
        [
          m("difference", "两焦距绝对差", Math.abs(L - R), ""),
          m("left", "到左焦点", L, ""),
          m("right", "到右焦点", R, ""),
        ],
        "两焦距绝对差固定2；双曲线两支在定义中的距离差符号相反。",
      );
    },
  }),
  define({
    ...common,
    id: "M19",
    slug: "circle-inversion",
    name: "圆反演",
    question: "一个点靠近圆心，它的伙伴会去哪？",
    topic: "几何变换 · 反演",
    stage: "高中拓展",
    known: "圆心原点，反演半径R；点P沿正x轴，OP>0，P与P′同射线。",
    proof: "OP·OP′=R²；二次反演回到原点；圆心无有限反演像。",
    history:
      "19世纪的反演几何把某些圆与直线互相变换，常用于化简圆的相切和角度关系。",
    controls: [
      c("distance", "原点距离OP", "", 0.2, 5, 0.1, 2),
      c("radius", "反演半径R", "", 0.5, 2, 0.1, 1),
    ],
    compare: "distance",
    metric: "product",
    scenes: ["圆内一点", 0.5, "圆外一点", 2],
    counter: { radius: 2 },
    invitation: "把原点P向圆心移动，看P′怎样远离。",
    look: "两个距离的乘积保持什么值？",
    hint: "显示会自动缩放，读数可区分距离变化与取景变化。",
    legend: ["蓝环：反演圆", "青点：P", "金点：P′"],
    transfer: "改变反演半径，保持的乘积会怎样变化？",
    solve: (p) => {
      const d = p.distance!,
        R = p.radius!,
        inv = (R * R) / d,
        s = 290 / Math.max(d, inv, R, 1),
        b = new Apparatus();
      b.ring(250, 230, R * s, C.blue)
        .line([250, 230], [250 + Math.max(d, inv) * s, 230], C.ink)
        .ball(250 + d * s, 230, 8, C.teal)
        .ball(250 + inv * s, 230, 8, C.gold)
        .text(80, 55, "同射线 · OP×OP′=R² · 自适应取景");
      return b.finish(
        [
          m("product", "两距离乘积", d * inv, ""),
          m("image", "反演像距离", inv, ""),
          m("twice", "再次反演距离", (R * R) / inv, ""),
        ],
        `P′距圆心${inv.toFixed(4)}；圆心本身没有有限反演像，控件不含OP=0。`,
        [graph("反演距离", "OP", "OP′", 0.2, 5, (x) => (R * R) / x)],
      );
    },
  }),
  define({
    ...common,
    id: "M20",
    slug: "determinant-area",
    name: "行列式面积",
    question: "剪切一个平行四边形，面积会变吗？",
    topic: "向量 · 行列式",
    known: "u=(3,0)，v=(s,h)，h可带符号；有向面积与普通面积区分。",
    proof: "det(u,v)=uₓvᵧ−uᵧvₓ=3h；剪切s不改变底与高。",
    history: "行列式从线性方程研究中发展，也有面积倍率和定向的几何解释。",
    controls: [
      c("shear", "剪切量s", "", -3, 3, 0.1, 1),
      c("height", "有向高度h", "", -2, 2, 0.1, 1.5),
    ],
    compare: "shear",
    metric: "area",
    scenes: ["向左剪切", -1, "向右剪切", 2],
    counter: { height: -1.5 },
    invitation: "左右剪切顶边，保持垂直高度。",
    look: "普通面积不变，翻到另一侧时有向面积怎样变化？",
    hint: "剪切不等于拉伸；负行列式表示定向翻转。",
    legend: ["青板：平行四边形", "金线：底边", "蓝线：固定垂高"],
    transfer: "高度改变符号后，面积与有向面积怎样区分？",
    solve: (p) => {
      const s = 55,
        x = p.shear!,
        h = p.height!,
        pts: Point[] = [
          [300, 270],
          [465, 270],
          [465 + x * s, 270 - h * s],
          [300 + x * s, 270 - h * s],
        ],
        b = new Apparatus();
      b.plate(pts)
        .line(pts[0]!, pts[1]!, C.gold)
        .line([300 + x * s, 270], [300 + x * s, 270 - h * s], C.blue);
      return b.finish(
        [
          m("area", "普通面积", Math.abs(3 * h), ""),
          m("oriented", "有向面积", 3 * h, ""),
        ],
        h === 0
          ? "高度为0：平行四边形退化，变换不可逆。"
          : `普通面积${Math.abs(3 * h).toFixed(3)}，有向面积${(3 * h).toFixed(3)}。`,
        [],
        h === 0 ? "boundary" : "valid",
      );
    },
  }),
  define({
    ...common,
    id: "M21",
    slug: "cross-product-space",
    name: "空间叉积",
    question: "两条向量，怎样确定一个垂直方向？",
    topic: "空间向量 · 叉积",
    stage: "高中拓展",
    known: "u=(2,0,0)，v=(s,h,z)；叉积按右手定则，有向量而非只比较长度。",
    proof: "u×v=(0,−2z,2h)，与u、v点积均为0；模长等于平行四边形面积。",
    history:
      "19世纪向量分析把力矩、面积定向和电磁学表达统一，叉积在三维中编码方向与大小。",
    controls: [
      c("height", "v的y分量", "", -2, 2, 0.1, 1),
      c("depth", "v的z分量", "", -2, 2, 0.1, 1),
      c("shear", "v的x分量", "", -2, 2, 0.1, 0.5),
    ],
    compare: "height",
    metric: "area",
    scenes: ["较低分量", 0.5, "较高分量", 1.5],
    counter: { height: 0, depth: 0 },
    invitation: "改变第二向量的高度，再转到三维核对垂直。",
    look: "叉积长度与两向量张成的面积如何对应？",
    hint: "两向量平行时叉积为零，零向量没有方向。",
    legend: ["青线：u", "蓝线：v", "金线：u×v"],
    transfer: "两向量平行时，还能用叉积定义法向方向吗？",
    solve: (p) => {
      const h = p.height!,
        z = p.depth!,
        s = p.shear!,
        area = 2 * Math.hypot(h, z),
        b = new Apparatus(),
        O: Point = [350, 280];
      b.line(O, [470, 280])
        .line(O, [350 + s * 60 + z * 20, 280 - h * 60], C.blue)
        .line(O, [350 + 2 * h * 20, 280 + 2 * z * 60], C.gold);
      b.solids = [
        {
          type: "line",
          points: [
            [0, 0, 0],
            [2, 0, 0],
          ],
          color: C.teal,
        },
        {
          type: "line",
          points: [
            [0, 0, 0],
            [s, h, z],
          ],
          color: C.blue,
        },
        {
          type: "line",
          points: [
            [0, 0, 0],
            [0, -2 * z, 2 * h],
          ],
          color: C.gold,
        },
        {
          type: "polygon",
          points: [
            [0, 0, 0],
            [2, 0, 0],
            [2 + s, h, z],
            [s, h, z],
          ],
          color: C.teal,
          opacity: 0.3,
        },
      ];
      return b.finish(
        [
          m("area", "叉积模=面积", area, ""),
          m("dot", "叉积与v点积", -2 * z * h + 2 * h * z, ""),
        ],
        area === 0
          ? "两向量平行，叉积为零；没有可定义的唯一法向方向。"
          : `叉积=(0,${-2 * z},${2 * h})，模长${area.toFixed(4)}。`,
        [],
        area === 0 ? "boundary" : "valid",
      );
    },
  }),
  define({
    ...common,
    id: "M22",
    slug: "skew-lines-distance",
    name: "异面直线公垂线",
    question: "空间两条线之间，最短距离怎样量？",
    topic: "立体几何 · 异面直线",
    known: "第一线沿x轴，第二线位于z=h平面，方向(cosθ,sinθ,0)，且过(0,0,h)。",
    proof: "θ≠0时d=|w·(u×v)|/|u×v|=|h|；θ=0为平行特例，仍d=|h|。",
    history:
      "空间坐标法将异面直线距离转化为法向投影，补充了仅凭二维投影难以判断的空间直觉。",
    controls: [
      c("angle", "两线方向夹角", "°", 0, 170, 5, 60),
      c("height", "两平面间距", "", 0.2, 3, 0.1, 1),
    ],
    compare: "angle",
    metric: "distance",
    scenes: ["小夹角", 30, "大夹角", 90],
    counter: { angle: 0 },
    invitation: "转动上方直线，再从侧面看两线间隙。",
    look: "俯视似乎交叉，为什么空间中仍不相交？",
    hint: "切换正面和俯视；二维投影相交不等于三维相交。",
    legend: ["青线：下方直线", "蓝线：上方直线", "金线：公垂线段"],
    transfer: "夹角为0时是异面还是平行？",
    solve: (p) => {
      const a = deg(p.angle!),
        h = p.height!,
        b = new Apparatus();
      b.line([160, 300], [640, 300])
        .line(
          [400 - 200 * Math.cos(a), 300 - 55 * h + 80 * Math.sin(a)],
          [400 + 200 * Math.cos(a), 300 - 55 * h - 80 * Math.sin(a)],
          C.blue,
        )
        .line([400, 300], [400, 300 - 55 * h], C.gold);
      b.solids = [
        {
          type: "line",
          points: [
            [-3, 0, 0],
            [3, 0, 0],
          ],
          color: C.teal,
        },
        {
          type: "line",
          points: [
            [-3 * Math.cos(a), -3 * Math.sin(a), h],
            [3 * Math.cos(a), 3 * Math.sin(a), h],
          ],
          color: C.blue,
        },
        {
          type: "line",
          points: [
            [0, 0, 0],
            [0, 0, h],
          ],
          color: C.gold,
        },
      ];
      return b.finish(
        [
          m("distance", "最短距离", h, ""),
          m("angle", "方向夹角", p.angle!, "°"),
        ],
        p.angle! === 0
          ? "现在是平行直线，不再称为异面；距离仍为两平面间距。"
          : "俯视投影可相交，但公垂线跨越两个平面，距离保持。",
      );
    },
  }),
  define({
    ...common,
    id: "M23",
    slug: "sphere-plane-section",
    name: "球的截面",
    question: "切平面远离球心，截面会怎样缩小？",
    topic: "立体几何 · 球与截面",
    known: "球半径R，平面距球心d；d>R时无交集，不把虚数半径画成圆。",
    proof: "截圆半径r=√(R²−d²)；面积π(R²−d²)，条件0≤d≤R。",
    history:
      "球的截面关系用一个直角三角形连接平面几何与立体几何，是空间问题数形结合的典型。",
    controls: [
      c("distance", "平面距球心", "", 0, 3, 0.1, 0.5),
      c("radius", "球半径", "", 1, 3, 0.1, 2),
    ],
    compare: "distance",
    metric: "area",
    scenes: ["靠近球心", 0.5, "远离球心", 1.5],
    counter: { distance: 3, radius: 1 },
    invitation: "向外移动切平面，观察截圆收缩。",
    look: "截面半径与平面位移是线性关系吗？",
    hint: "先判断有没有交集，再使用平方根。",
    legend: ["蓝球：球面", "金面：切平面", "青环：真实截圆"],
    transfer: "平面移到球外时，还存在截面圆吗？",
    solve: (p) => {
      const R = p.radius!,
        d = p.distance!,
        valid = d <= R,
        r = valid ? Math.sqrt(R * R - d * d) : null,
        b = new Apparatus();
      b.ring(400, 230, R * 55, C.blue).line(
        [230, 230 - d * 55],
        [570, 230 - d * 55],
        C.gold,
      );
      if (r !== null)
        b.line([400 - r * 55, 230 - d * 55], [400 + r * 55, 230 - d * 55]);
      b.solids = [
        {
          type: "sphere",
          points: [[0, 0, 0]],
          radius: R,
          color: C.blue,
          opacity: 0.22,
        },
        {
          type: "polygon",
          points: [
            [-3, d, -3],
            [3, d, -3],
            [3, d, 3],
            [-3, d, 3],
          ],
          color: C.gold,
          opacity: 0.3,
        },
      ];
      if (r !== null)
        b.solids.push({
          type: "line",
          points: Array.from(
            { length: 97 },
            (_, i) =>
              [
                r * Math.cos((i * pi) / 48),
                d,
                r * Math.sin((i * pi) / 48),
              ] as Vec3,
          ),
          color: C.teal,
        });
      return b.finish(
        [
          m("area", "截圆面积", r === null ? null : pi * r * r, ""),
          m("section_radius", "截圆半径", r, ""),
        ],
        !valid
          ? "平面在球外：截圆半径与面积未定义。"
          : r === 0
            ? "平面与球相切，截面退化为一点。"
            : `截圆半径${r!.toFixed(4)}，面积${(pi * r! * r!).toFixed(4)}。`,
        [],
        valid ? (r === 0 ? "boundary" : "valid") : "invalid",
      );
    },
  }),
  define({
    ...common,
    id: "M24",
    slug: "cuboid-diagonal",
    name: "长方体空间对角线",
    question: "箱子的最长直线，为什么要勾股两次？",
    topic: "立体几何 · 空间距离",
    known: "互相垂直的三条棱a、b、c；对角线连接相对顶点。",
    proof: "d底²=a²+b²；d体²=d底²+c²=a²+b²+c²。",
    history:
      "三维勾股关系把平面距离扩展为欧氏空间距离，也是坐标几何中距离公式的来源。",
    controls: [
      c("height", "箱高c", "", 1, 4, 0.1, 2),
      c("width", "箱宽a", "", 1, 4, 0.1, 3),
      c("depth", "箱深b", "", 1, 4, 0.1, 2),
    ],
    compare: "height",
    metric: "diagonal",
    scenes: ["矮箱", 1, "高箱", 3],
    counter: { width: 4 },
    invitation: "拉高箱子，先看底面对角线再看体对角线。",
    look: "体对角线增量与高度增量相同吗？",
    hint: "两次使用直角三角形，第二次的底边是底面对角线。",
    legend: ["青线：12条棱", "蓝线：底面对角线", "金线：体对角线"],
    transfer: "箱宽增加时，底面对角线也要重新算吗？",
    solve: (p) => {
      const a = p.width!,
        d = p.depth!,
        h = p.height!,
        b = new Apparatus(),
        v: Vec3[] = Array.from({ length: 8 }, (_, i) => [
          i & 1 ? a : 0,
          i & 2 ? h : 0,
          i & 4 ? d : 0,
        ]),
        pr = ([x, y, z]: Vec3): Point => [
          240 + x * 65 + z * 28,
          350 - y * 55 - z * 17,
        ];
      for (let i = 0; i < 8; i++)
        for (const bit of [1, 2, 4])
          if (!(i & bit)) {
            b.line(pr(v[i]!), pr(v[i | bit]!));
          }
      b.line(pr(v[0]!), pr(v[5]!), C.blue).line(pr(v[0]!), pr(v[7]!), C.gold);
      b.solids = [];
      for (let i = 0; i < 8; i++)
        for (const bit of [1, 2, 4])
          if (!(i & bit))
            b.solids.push({
              type: "line",
              points: [v[i]!, v[i | bit]!],
              color: C.teal,
            });
      b.solids.push(
        { type: "line", points: [v[0]!, v[7]!], color: C.gold },
        { type: "line", points: [v[0]!, v[5]!], color: C.blue },
      );
      return b.finish(
        [
          m("diagonal", "体对角线", Math.hypot(a, d, h), ""),
          m("base", "底面对角线", Math.hypot(a, d), ""),
        ],
        "底面与竖直棱垂直；体对角线用三条互相垂直的分量计算。",
        [graph("体对角线", "箱高", "", 1, 4, (x) => Math.hypot(a, d, x))],
      );
    },
  }),
  define({
    ...common,
    id: "M25",
    slug: "solid-of-revolution",
    name: "旋转体",
    question: "一片直角三角形，转一圈会装下多少？",
    topic: "立体几何 · 旋转体",
    known:
      "直角三角形绕高所在直线旋转，形成圆锥；进度只改变部署角，不改变完整圆锥体积公式。",
    proof: "完整圆锥V=πr²h/3，侧面积=πr√(r²+h²)；部分角体积按角比例计算。",
    history:
      "旋转构造把平面图形连接到立体体积，古代穷竭法与现代积分都可推导圆锥体积。",
    controls: [
      c("angle", "旋转扫过角", "°", 0, 360, 5, 180),
      c("radius", "底面半径", "", 0.5, 3, 0.1, 2),
      c("height", "锥高", "", 1, 4, 0.1, 3),
    ],
    compare: "angle",
    metric: "volume",
    scenes: ["半圈", 180, "完整一圈", 360],
    counter: { angle: 0 },
    invitation: "让三角板转一圈，观察圆锥怎样形成。",
    look: "半圈扫过的体积与一圈有什么比例？",
    hint: "这里算扫过的扇形体积，只有360°才是完整圆锥。",
    legend: ["青色：扫过锥面", "金色：当前母线", "中轴：旋转轴"],
    transfer: "旋转角为0时，有没有扫过体积？",
    solve: (p) => {
      const r = p.radius!,
        h = p.height!,
        A = deg(p.angle!),
        b = new Apparatus();
      b.solids = [];
      for (let i = 0; i < Math.max(1, Math.ceil(p.angle! / 10)); i++) {
        const t = (A * i) / Math.max(1, Math.ceil(p.angle! / 10)),
          u = (A * (i + 1)) / Math.max(1, Math.ceil(p.angle! / 10)),
          a: Vec3 = [r * Math.cos(t), 0, r * Math.sin(t)],
          d: Vec3 = [r * Math.cos(u), 0, r * Math.sin(u)];
        b.solids.push({
          type: "polygon",
          points: [[0, h, 0], a, d],
          color: C.teal,
          opacity: 0.45,
        });
        b.drawing += "";
      }
      b.plate([
        [400, 100],
        [400 - r * 55, 340],
        [400 + r * 55, 340],
      ])
        .line(
          [400, 100],
          [400 + r * 55 * Math.cos(A), 340 - r * 15 * Math.sin(A)],
          C.gold,
        )
        .text(80, 55, `旋转${p.angle}° · 2D为轴向构造投影`);
      b.solids = b.solids.filter(
        (s) => s.type === "polygon" && s.points[0]![1] === h,
      );
      b.solids.push(
        { type: "line", points: [[0, 0, 0], [0, h, 0]], color: C.ink },
        { type: "polygon", points: [[0, 0, 0], [0, h, 0], [r * Math.cos(A), 0, r * Math.sin(A)]], color: C.gold, opacity: 0.5 },
        { type: "line", points: [[0, h, 0], [r * Math.cos(A), 0, r * Math.sin(A)]], color: C.gold },
      );
      return b.finish(
        [
          m(
            "volume",
            "扫过体积",
            (((pi * r * r * h) / 3) * p.angle!) / 360,
            "",
          ),
          m("full", "完整圆锥体积", (pi * r * r * h) / 3, ""),
        ],
        `已扫过${p.angle}°，体积为完整圆锥的${(p.angle! / 3.6).toFixed(1)}%。`,
      );
    },
  }),
  define({
    ...common,
    id: "M26",
    slug: "riemann-area",
    name: "黎曼和",
    question: "把曲线下切成小条，面积会越来越准吗？",
    topic: "微积分 · 定积分",
    stage: "高中拓展",
    known: "函数y=x²，区间[0,1]，使用左端点或右端点矩形；高度单位归一化。",
    proof: "积分₀¹x²dx=1/3；左和≤1/3≤右和，分割越细误差趋0。",
    era: "19世纪 · 黎曼",
    history:
      "黎曼积分用分割与求和建立曲边面积的严格定义，使“无限细小条”成为可检验的极限过程。",
    controls: [
      c("count", "矩形条数", "", 2, 60, 1, 8),
      c("side", "采样端点", "", 0, 1, 1, 0, [
        [0, "左端点"],
        [1, "右端点"],
      ]),
    ],
    compare: "count",
    metric: "error",
    scenes: ["粗分割", 5, "细分割", 40],
    counter: { side: 1 },
    invitation: "增加矩形条数，比较总面积与1/3。",
    look: "误差向0靠近，是否表示有限条时已经精确？",
    hint: "单调增函数的左和偏小、右和偏大。",
    legend: ["青板：矩形条", "金线：y=x²", "灰线：坐标轴"],
    transfer: "换成右端点，误差符号会怎样变化？",
    solve: (p) => {
      const n = p.count!,
        right = p.side!,
        sum = Array.from(
          { length: n },
          (_, i) => ((i + right) / n) ** 2 / n,
        ).reduce((a, b) => a + b, 0),
        b = new Apparatus();
      b.line([150, 360], [680, 360], C.ink).line([150, 360], [150, 80], C.ink);
      for (let i = 0; i < n; i++)
        b.box(
          150 + (i * 500) / n,
          360 - 250 * ((i + right) / n) ** 2,
          500 / n,
          250 * ((i + right) / n) ** 2,
          C.teal,
          0.2,
        );
      b.trace(
        Array.from(
          { length: 81 },
          (_, i) => [150 + (500 * i) / 80, 360 - 250 * (i / 80) ** 2] as Point,
        ),
        C.gold,
      );
      return b.finish(
        [
          m("error", "求和减精确面积", sum - 1 / 3, ""),
          m("sum", "矩形面积和", sum, ""),
          m("exact", "精确积分", 1 / 3, ""),
        ],
        `${n}条矩形，${right ? "右" : "左"}和${sum.toFixed(6)}；误差${(sum - 1 / 3).toFixed(6)}。`,
        [
          graph("绝对误差", "条数", "", 2, 60, (k) => {
            const j = Math.round(k);
            return Math.abs(
              Array.from(
                { length: j },
                (_, i) => ((i + right) / j) ** 2 / j,
              ).reduce((a, b) => a + b, 0) -
                1 / 3,
            );
          }),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "M27",
    slug: "monte-carlo-pi",
    name: "蒙特卡洛圆周率",
    question: "随机撒点，能量出圆周率吗？",
    topic: "概率 · 频率与面积",
    known: "固定种子的伪随机点均匀分布于单位正方形，四分之一圆面积比为π/4。",
    proof: "π估计=4N圆内/N；随机误差可涨可落，增加样本不保证每一步更准。",
    era: "20世纪 · 蒙特卡洛方法",
    history:
      "蒙特卡洛方法借随机抽样估计难算的量；固定种子便于课堂复现，不代表真实物理随机源。",
    controls: [
      c("count", "投点数", "", 50, 2000, 50, 300),
      c("seed", "随机种子", "", 1, 20, 1, 7),
    ],
    compare: "count",
    metric: "estimate",
    scenes: ["少量投点", 100, "更多投点", 1500],
    counter: { seed: 13 },
    invitation: "增加随机点，看圆内占比怎样变化。",
    look: "样本更多时，误差一定每次都减小吗？",
    hint: "比较多个种子，单次幸运接近不等于普遍精确。",
    legend: ["青点：圆内", "金点：圆外", "圆弧：单位四分之一圆"],
    transfer: "换一个种子，估计值是否完全相同？",
    solve: (p) => {
      let state = p.seed!,
        inside = 0;
      const rand = () => {
          state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
          return state / 4294967296;
        },
        b = new Apparatus();
      b.plate(
        [
          [230, 360],
          [530, 360],
          [530, 60],
          [230, 60],
        ],
        C.blue,
      );
      for (let i = 0; i < p.count!; i++) {
        const x = rand(),
          y = rand(),
          ok = x * x + y * y <= 1;
        if (ok) inside++;
        b.ball(230 + x * 300, 360 - y * 300, 1.5, ok ? C.teal : C.gold, 0);
      }
      b.trace(
        Array.from(
          { length: 81 },
          (_, i) =>
            [
              230 + 300 * Math.cos((i * pi) / 160),
              360 - 300 * Math.sin((i * pi) / 160),
            ] as Point,
        ),
        C.ink,
      );
      return b.finish(
        [
          m("estimate", "π的抽样估计", (4 * inside) / p.count!, ""),
          m("inside", "圆内点数", inside, ""),
          m("error", "与π的误差", (4 * inside) / p.count! - pi, ""),
        ],
        `圆内${inside}/${p.count}，π估计${((4 * inside) / p.count!).toFixed(5)}；波动不是模型失效。`,
      );
    },
  }),
  define({
    ...common,
    id: "M28",
    slug: "bayes-screening",
    name: "贝叶斯分诊树",
    question: "检测阳性，真的有病的概率多大？",
    topic: "概率 · 条件概率",
    known:
      "假想筛查而非医疗建议，灵敏度90%、假阳性率5%，人群基率可变；使用期望人数。",
    proof: "P(D|+)=P(+|D)P(D)/[P(+|D)P(D)+P(+|¬D)P(¬D)]。",
    history: "贝叶斯公式将新证据与先验概率结合；自然频数树有助于避免忽略基率。",
    controls: [
      c("prevalence", "人群患病率", "%", 0.1, 30, 0.1, 1),
      c("population", "假想样本人群", "人", 1000, 20000, 1000, 10000),
    ],
    compare: "prevalence",
    metric: "posterior",
    scenes: ["低基率", 1, "较高基率", 10],
    counter: { prevalence: 0.1 },
    invitation: "提高假想患病率，比较阳性人群的组成。",
    look: "阳性准确率为什么不等于灵敏度90%？",
    hint: "真假阳性来自大小不同的两个人群。",
    legend: ["青枝：患病人群", "金枝：未患病人群", "末端：阳性期望人数"],
    transfer: "基率非常低时，假阳性能占多数吗？",
    solve: (p) => {
      const q = p.prevalence! * 0.01,
        N = p.population!,
        tp = N * q * 0.9,
        fp = N * (1 - q) * 0.05,
        b = new Apparatus();
      b.ball(150, 230, 18, C.ink)
        .line([170, 230], [390, 130])
        .line([170, 230], [390, 330], C.gold)
        .box(390, 105, 130, 50)
        .box(390, 305, 130, 50, C.gold)
        .line([520, 130], [650, 130])
        .line([520, 330], [650, 330], C.gold)
        .text(390, 95, `患病 ${(N * q).toFixed(1)}人`)
        .text(390, 390, `未患病 ${(N * (1 - q)).toFixed(1)}人`)
        .text(550, 100, `真阳 ${tp.toFixed(1)}`)
        .text(550, 300, `假阳 ${fp.toFixed(1)}`);
      b.box(560, 150, (110 * tp) / (tp + fp), 18, C.teal, 0.2).box(
        560,
        350,
        (110 * fp) / (tp + fp),
        18,
        C.gold,
        0.2,
      );
      return b.finish(
        [
          m("posterior", "阳性中的患病概率", (100 * tp) / (tp + fp), "%"),
          m("true", "真阳性期望人数", tp, "人"),
          m("false", "假阳性期望人数", fp, "人"),
        ],
        `阳性中约${((100 * tp) / (tp + fp)).toFixed(2)}%患病；人数是模型期望，可为小数。`,
        [
          graph(
            "阳性后验",
            "患病率%",
            "%",
            0.1,
            30,
            (x) =>
              (100 * ((0.9 * x) / 100)) /
              ((0.9 * x) / 100 + 0.05 * (1 - x / 100)),
          ),
        ],
      );
    },
  }),
  define({
    ...common,
    id: "M29",
    slug: "complex-rotation",
    name: "复数旋转",
    question: "乘以一个复数，为什么会转动？",
    topic: "复数 · 几何意义",
    stage: "高中",
    known: "初始复数z=2+i，乘数w=ρ(cosθ+i sinθ)，乘法分解为伸缩与旋转。",
    proof: "zw=ρ[(2cosθ−sinθ)+i(2sinθ+cosθ)]；|zw|=|z|ρ，辐角相加。",
    history: "复数平面赋予代数乘法几何意义，欧拉公式连接三角函数、指数与旋转。",
    controls: [
      c("angle", "乘数辐角", "°", 0, 360, 5, 45),
      c("scale", "乘数模长", "", 0.2, 2, 0.1, 1),
    ],
    compare: "angle",
    metric: "modulus",
    scenes: ["四分之一圈", 90, "半圈", 180],
    counter: { scale: 2 },
    invitation: "让乘数转过90°，观察原向量的像。",
    look: "只改变辐角时，向量长度是否保持？",
    hint: "模长管伸缩，辐角管转向。",
    legend: ["青向量：原复数", "金向量：乘积", "蓝环：同模圆"],
    transfer: "乘数模为2时，结果的模会怎样？",
    solve: (p) => {
      const a = deg(p.angle!),
        r = p.scale!,
        x = r * (2 * Math.cos(a) - Math.sin(a)),
        y = r * (2 * Math.sin(a) + Math.cos(a)),
        b = new Apparatus();
      b.line([100, 230], [700, 230], C.ink)
        .line([400, 50], [400, 410], C.ink)
        .ring(400, 230, Math.sqrt(5) * r * 36, C.blue)
        .line([400, 230], [472, 194])
        .line([400, 230], [400 + x * 36, 230 - y * 36], C.gold);
      return b.finish(
        [
          m("modulus", "乘积模长", Math.sqrt(5) * r, ""),
          m("real", "实部", x, ""),
          m("imaginary", "虚部", y, ""),
        ],
        `乘积=${x.toFixed(3)}${y < 0 ? "" : "+"}${y.toFixed(3)}i；只转角不改变模长。`,
      );
    },
  }),
  define({
    ...common,
    id: "M30",
    slug: "quadratic-discriminant",
    name: "二次函数判别式",
    question: "抛物线抬高一点，两个交点会去哪？",
    topic: "函数 · 判别式与零点",
    known: "y=x²−2x+c，开口向上；交点指与x轴的实交点。",
    proof: "Δ=b²−4ac=4−4c；Δ>0两实根，Δ=0重根，Δ<0无实根。",
    history:
      "二次方程的代数解法历史悠久，坐标几何使判别式能对应图像与轴的相交关系。",
    controls: [
      c("constant", "常数项c", "", -2, 3, 0.1, 0),
      c("probe", "观察横坐标", "", -1, 3, 0.1, 1),
    ],
    compare: "constant",
    metric: "discriminant",
    scenes: ["两交点", 0, "无实交点", 2],
    counter: { constant: 1 },
    invitation: "抬高抛物线，观察两个零点接近并消失。",
    look: "判别式为0时，为什么只剩一个接触位置？",
    hint: "无实根时不要把平方根强行算为0。",
    legend: ["青线：二次函数", "金点：实零点", "蓝点：当前函数值"],
    transfer: "恰好相切时，重根的横坐标是多少？",
    solve: (p) => {
      const q = p.constant!,
        delta = 4 - 4 * q,
        b = new Apparatus();
      b.line([150, 300], [700, 300], C.ink)
        .line([250, 65], [250, 410], C.ink)
        .trace(
          Array.from({ length: 81 }, (_, i) => {
            const x = -1 + (4 * i) / 80;
            return [250 + 100 * x, 300 - 30 * (x * x - 2 * x + q)] as Point;
          }),
        );
      if (delta >= 0)
        for (const root of [1 - Math.sqrt(delta) / 2, 1 + Math.sqrt(delta) / 2])
          b.ball(250 + 100 * root, 300, 7, C.gold);
      b.ball(
        250 + 100 * p.probe!,
        300 - 30 * (p.probe! ** 2 - 2 * p.probe! + q),
        7,
        C.blue,
      );
      return b.finish(
        [
          m("discriminant", "判别式", delta, ""),
          m("roots", "不同实根个数", delta > 0 ? 2 : delta === 0 ? 1 : 0, ""),
          m("vertex", "顶点纵坐标", q - 1, ""),
        ],
        delta < 0
          ? "没有实零点；图像整体位于x轴上方。"
          : delta === 0
            ? "重根x=1，图像与x轴相切。"
            : "两个不同实根；继续抬高观察合并过程。",
        [graph("函数图像", "x", "y", -1, 3, (x) => x * x - 2 * x + q)],
      );
    },
  }),
];
