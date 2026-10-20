import {
  control as c,
  metric as m,
  obs,
  curve,
  sample,
  rad,
  line,
  path,
  circle,
  rect,
  label,
  arrow,
  colors,
  type Model,
  type Inputs,
  type Vec3,
  type Solid,
} from './core.ts';
import { bisect, linearSolve, eigenvaluesSymmetric, mul, div, type Complex } from './numerics.ts';
export function archProfile(span: number, rise: number, load: number, type: number) {
  if (type === 0) {
    const a = bisect((x) => x * (Math.cosh(span / (2 * x)) - 1) - rise, span / 100, span * 1e6);
    return {
      H: load * a,
      V: load * a * Math.sinh(span / (2 * a)),
      y: (x: number) => rise - a * (Math.cosh(x / a) - 1),
    };
  }
  if (type === 1)
    return {
      H: (load * span ** 2) / (8 * rise),
      V: (load * span) / 2,
      y: (x: number) => rise * (1 - (4 * x * x) / span ** 2),
    };
  return {
    H: (load * span) / (4 * rise),
    V: load / 2,
    y: (x: number) => rise * (1 - (2 * Math.abs(x)) / span),
  };
}
export function arch(p: Inputs) {
  const r = archProfile(p.span!, p.rise!, p.load!, p.loading!),
    scale = 520 / p.span!,
    thrust = sample(-p.span! / 2, p.span! / 2, 81, r.y),
    shape = (x: number) => p.envelope! * (1 - (4 * x * x) / p.span! ** 2),
    error = Math.max(...thrust.map(([x, y]) => Math.abs(y - shape(x)))),
    inside = error <= p.thickness! / 2;
  const draw =
    rect(90, 330, 80, 70, colors.ink) +
    rect(630, 330, 80, 70, colors.ink) +
    path(
      sample(-p.span! / 2, p.span! / 2, 70, (x) => shape(x)).map(([x, y]) => [
        400 + x * scale,
        330 - y * scale,
      ]),
      colors.teal,
      Math.max(3, p.thickness! * scale),
    ) +
    path(
      thrust.map(([x, y]) => [400 + x * scale, 330 - y * scale]),
      colors.gold,
      5,
    ) +
    arrow(140, 340, -55, 0) +
    arrow(660, 340, 55, 0) +
    label(45, 60, '金线：给定载荷的推力线 · 青色：拱体垂直包络');
  return obs(
    [
      m('horizontal', '支座水平推力', r.H, 'N'),
      m('vertical', '每侧竖向反力', r.V, 'N'),
      m('deviation', '最大竖向偏离', error, 'm'),
      m('margin', '包络余量', p.thickness! / 2 - error, 'm'),
    ],
    draw,
    `${inside ? '推力线位于所设竖向包络内。' : '推力线超出包络，请改变拱形/厚度或载荷分布。'} 这是二维竖向包络判据，未校验砌块接触摩擦、压碎和屈曲，不能作为施工认证。`,
    [
      curve('推力线高度', 'm', 'm', thrust),
      curve('所设拱体中心线', 'm', 'm', sample(-p.span! / 2, p.span! / 2, 81, shape), colors.teal),
    ],
    inside ? 'valid' : 'boundary',
  );
}
export function cantilever(p: Inputs) {
  const E = p.modulus! * 1e9,
    b = p.rotated! ? p.height! : p.width!,
    h = p.rotated! ? p.width! : p.height!,
    I = (b * h ** 3) / 12,
    L = p.length!,
    F = p.force!,
    delta = (F * L ** 3) / (3 * E * I),
    sigma = (6 * F * L) / (b * h * h),
    slender = L / Math.max(b, h),
    valid = slender >= 10 && delta / L <= 0.05,
    y = (x: number) => (F * x * x * (3 * L - x)) / (6 * E * I),
    visual = Math.min(p.magnify!, delta ? (0.25 * L) / delta : p.magnify!);
  const drawing =
    rect(90, 140, 35, 200, colors.ink) +
    line(125, 220, 685, 220, colors.ink, 3, true) +
    path(
      sample(0, L, 60, y).map(([x, yy]) => [125 + (560 * x) / L, 220 + (yy * visual * 560) / L]),
      colors.teal,
      8,
    ) +
    arrow(685, 160, 0, 60, colors.red) +
    label(50, 55, `端载悬臂 · 变形显示×${Number(visual.toPrecision(3))}`) +
    rect(610, 330, b * 1400, h * 1400, colors.gold) +
    label(590, 420, '截面朝向');
  return obs(
    [
      m('deflection', '端部挠度', delta * 1000, 'mm'),
      m('inertia', '截面惯性矩', I, 'm⁴'),
      m('stress', '根部正应力', sigma / 1e6, 'MPa'),
      m('volume', '材料体积', b * h * L, 'm³'),
      m('slender', '长细几何比', slender, ''),
      m('ratio', '挠度/跨度', delta / L, ''),
    ],
    drawing,
    `${valid ? '线弹性小挠度范围内。' : '超出长细梁或小挠度条件，读数仅为越界参考。'} 固定端y=y′=0。未建塑性、断裂、连接柔度或屈曲；截面体积不等于价格。`,
    [curve('解析挠曲线', 'm', 'm', sample(0, L, 80, y))],
    valid ? 'valid' : 'boundary',
  );
}
export function towerResponse(p: Inputs, frequency = p.frequency!) {
  const w = 2 * Math.PI * frequency,
    w1 = 2 * Math.PI * p.natural!,
    w2 = 2 * Math.PI * p.tuning!,
    m1 = 1000,
    m2 = p.damper!,
    k1 = m1 * w1 * w1,
    k2 = m2 * w2 * w2,
    c1 = 2 * 0.03 * m1 * w1,
    c2 = 2 * 0.15 * m2 * w2,
    ag = p.acceleration!;
  const base: Complex = [k1 - m1 * w * w, c1 * w],
    bare = div([-m1 * ag, 0], base);
  if (!m2) return { tower: bare, damper: [0, 0] as Complex, bare };
  const a: Complex = [k1 + k2 - m1 * w * w, (c1 + c2) * w],
    b: Complex = [-k2, -c2 * w],
    d: Complex = [k2 - m2 * w * w, c2 * w],
    ad = mul(a, d),
    bb = mul(b, b),
    det: Complex = [ad[0] - bb[0], ad[1] - bb[1]],
    rhs1: Complex = [-m1 * ag, 0],
    rhs2: Complex = [-m2 * ag, 0],
    n1 = mul(rhs1, d),
    n2 = mul(b, rhs2),
    n3 = mul(a, rhs2),
    n4 = mul(b, rhs1);
  return {
    tower: div([n1[0] - n2[0], n1[1] - n2[1]], det),
    damper: div([n3[0] - n4[0], n3[1] - n4[1]], det),
    bare,
  };
}
export function seismic(p: Inputs) {
  const r = towerResponse(p),
    A = Math.hypot(...r.tower),
    bare = Math.hypot(...r.bare),
    w = 2 * Math.PI * p.frequency!,
    x = (r.tower[0] * Math.cos(w * p.time!) - r.tower[1] * Math.sin(w * p.time!)) * 1500,
    xd = (r.damper[0] * Math.cos(w * p.time!) - r.damper[1] * Math.sin(w * p.time!)) * 1500;
  const drawing =
    rect(140, 370, 520, 20, colors.ink) +
    path(
      [
        [240, 370],
        [240 + x, 120],
        [560 + x, 120],
        [560, 370],
      ],
      colors.teal,
      7,
    ) +
    line(240 + x, 120, 560 + x, 120, colors.teal, 12) +
    rect(365 + xd, 150, 70, 55, colors.gold) +
    line(400 + x, 120, 400 + xd, 150, colors.gold, 4) +
    arrow(300, 420, 120 * Math.cos(w * p.time!), 0) +
    label(40, 50, '基座加速度激励 · 位移显示×1500');
  return obs(
    [
      m('tower_amplitude', '塔顶相对位移振幅', A * 1000, 'mm'),
      m('bare_amplitude', '无阻尼器对照', bare * 1000, 'mm'),
      m('damper_amplitude', '附加质量相对基座振幅', Math.hypot(...r.damper) * 1000, 'mm'),
      m('response_ratio', '相对对照振幅比', bare ? A / bare : null, ''),
    ],
    drawing,
    '线性两自由度稳态模型；主塔等效质量1000kg，主阻尼比0.03，附加阻尼比0.15。单个频点改善不保证所有地震更安全。',
    [
      curve(
        '加阻尼器幅频',
        'Hz',
        'mm',
        sample(0.1, 3, 120, (f) => Math.hypot(...towerResponse(p, f).tower) * 1000),
      ),
      curve(
        '无阻尼器幅频',
        'Hz',
        'mm',
        sample(0.1, 3, 120, (f) => Math.hypot(...towerResponse(p, f).bare) * 1000),
        colors.gold,
      ),
    ],
  );
}
export function tensegrityState(radius: number, height: number, pretension: number, EI: number) {
  const nodes: Vec3[] = Array.from({ length: 6 }, (_, i) => {
    const a = (2 * Math.PI * (i % 3)) / 3 + (i >= 3 ? (5 * Math.PI) / 6 : 0);
    return [radius * Math.cos(a), i >= 3 ? height : 0, radius * Math.sin(a)];
  });
  const diagonal = Math.sqrt(height ** 2 + (2 - Math.sqrt(3)) * radius ** 2),
    lambda = pretension / diagonal,
    edges: { a: number; b: number; force: number; EA: number; kind: string }[] = [];
  const distance = (a: number, b: number) =>
    Math.hypot(...nodes[a]!.map((v, k) => v - nodes[b]![k]!));
  for (let i = 0; i < 3; i++) {
    edges.push(
      { a: i, b: i + 3, force: -lambda * distance(i, i + 3), EA: 2e5, kind: 'rod' },
      { a: (i + 1) % 3, b: i + 3, force: pretension, EA: 2e4, kind: 'cable' },
      { a: i + 3, b: ((i + 1) % 3) + 3, force: lambda * radius, EA: 2e4, kind: 'cable' },
    );
  }
  const K = Array.from({ length: 9 }, () => Array(9).fill(0) as number[]),
    forces = Array(9).fill(0) as number[];
  for (const e of edges) {
    const d = nodes[e.b]!.map((v, k) => v - nodes[e.a]![k]!),
      L = Math.hypot(...d),
      n = d.map((x) => x / L);
    for (const [node, sign] of [
      [e.a, 1],
      [e.b, -1],
    ])
      if (node! >= 3)
        for (let j = 0; j < 3; j++) forces[(node! - 3) * 3 + j]! += sign! * e.force * n[j]!;
    for (const [ni, si] of [
      [e.a, -1],
      [e.b, 1],
    ])
      for (const [nj, sj] of [
        [e.a, -1],
        [e.b, 1],
      ])
        if (ni! >= 3 && nj! >= 3)
          for (let a = 0; a < 3; a++)
            for (let b = 0; b < 3; b++)
              K[(ni! - 3) * 3 + a]![(nj! - 3) * 3 + b]! +=
                si! *
                sj! *
                ((e.EA / L) * n[a]! * n[b]! + (e.force / L) * ((a === b ? 1 : 0) - n[a]! * n[b]!));
  }
  const eigen = eigenvaluesSymmetric(K),
    roundoff = Number.EPSILON * Math.max(...K.flat().map(Math.abs)) * K.length * 100,
    force = edges.find((e) => e.kind === 'rod')!.force,
    L = distance(0, 3),
    critical = (Math.PI ** 2 * EI) / L ** 2;
  return {
    nodes,
    edges,
    // A mechanism's zero mode can land on either side of zero across JS engines.
    // Suppress only values below the assembled matrix's floating-point resolution.
    minimum: Math.abs(eigen[0]!) <= roundoff ? 0 : eigen[0]!,
    residual: Math.hypot(...forces),
    compression: -force,
    buckling: critical,
    displacement: linearSolve(K, [1, 0, 0, 0, 0, 0, 0, 0, 0]),
  };
}
export function tensegrity(p: Inputs) {
  const r = tensegrityState(p.radius!, p.height!, p.tension!, p.rigidity!),
    valid = r.minimum > 1e-5 && r.compression < r.buckling;
  const solids: Solid[] = r.edges.map((e) => ({
    type: 'line',
    points: [r.nodes[e.a]!, r.nodes[e.b]!],
    color: e.kind === 'rod' ? colors.teal : colors.gold,
  }));
  const project = (v: Vec3): [number, number] => [
    400 + v[0] * 100 + v[2] * 50,
    370 - v[1] * 110 + v[2] * 22,
  ];
  const drawing =
    r.edges
      .map((e) =>
        line(
          ...project(r.nodes[e.a]!),
          ...project(r.nodes[e.b]!),
          e.kind === 'rod' ? colors.teal : colors.gold,
          e.kind === 'rod' ? 7 : 2,
        ),
      )
      .join('') +
    r.nodes.map((n, i) => circle(...project(n), 7, i < 3 ? colors.ink : colors.gold)).join('') +
    label(35, 45, '下三节点固定 · 三杆张拉整体 · 上三节点线性扰动');
  return obs(
    [
      m('cable_tension', '斜索张力', p.tension!, 'N'),
      m('rod_compression', '杆压力', r.compression, 'N'),
      m('stiffness', '最小切线刚度特征值', r.minimum, 'N/m'),
      m('residual', '顶部平衡残差', r.residual, 'N'),
      m('buckling', '铰支杆Euler临界力', r.buckling, 'N'),
      m(
        'probe_deflection',
        '顶部1N探测横向位移',
        valid && r.displacement ? r.displacement[0]! * 1000 : null,
        'mm',
      ),
    ],
    drawing,
    `${valid ? '平衡、线性刚度和本模型杆屈曲检查通过。' : '预应力不足/失稳或杆屈曲风险，请调整张力与杆抗弯刚度。'} 索只受拉，杆受压；杆EA=200kN、索EA=20kN，不建材料破坏或大变形。`,
    [],
    valid ? 'valid' : 'boundary',
    solids,
  );
}
export function suspension(p: Inputs) {
  const L = p.span!,
    f = p.sag!,
    q = p.load!,
    H = (q * L * L) / (8 * f),
    V = (q * L) / 2,
    T = Math.hypot(H, V),
    y = (x: number) => (4 * f * x * (L - x)) / L ** 2,
    scale = 600 / L,
    verticalScale = Math.min(scale, 170 / f);
  let drawing =
    line(90, 335, 710, 335, colors.ink, 6) +
    line(100, 120, 100, 380, colors.ink, 8) +
    line(700, 120, 700, 380, colors.ink, 8) +
    path(
      sample(0, L, 80, y).map(([x, yy]) => [100 + x * scale, 160 + yy * verticalScale]),
      colors.gold,
      5,
    );
  for (let i = 1; i < 12; i++) {
    const x = (L * i) / 12;
    drawing += line(
      100 + x * scale,
      160 + y(x) * verticalScale,
      100 + x * scale,
      335,
      colors.teal,
      2,
    );
  }
  drawing +=
    arrow(100, 160, -50, -40) +
    arrow(700, 160, 50, -40) +
    label(40, 50, '均布桥面荷载 · 抛物线主索 · 显示自动缩放');
  return obs(
    [
      m('horizontal', '锚点水平拉力', H, 'N'),
      m('vertical', '每塔竖向反力', V, 'N'),
      m('tension', '塔顶索张力', T, 'N'),
      m('ratio', '垂跨比', f / L, ''),
    ],
    drawing,
    '忽略索自重与桥面弯曲，柔索承受按水平长度均布的桥面荷载；垂度越小水平张力越大。极小垂度模型不包含索弹性伸长。',
    [curve('主索垂度曲线', 'm', 'm', sample(0, L, 80, y))],
  );
}
export function crank(p: Inputs) {
  const r = p.crank!,
    L = p.rod!,
    theta = rad(p.angle!),
    d = L * L - r * r * Math.sin(theta) ** 2,
    valid = d > 1e-10,
    x = valid ? r * Math.cos(theta) + Math.sqrt(d) : null,
    vel = valid
      ? (-r * Math.sin(theta) - (r * r * Math.sin(theta) * Math.cos(theta)) / Math.sqrt(d)) *
        p.omega!
      : null,
    scale = 500 / (L + 2 * r),
    ax = 180 + r * scale * Math.cos(theta),
    ay = 250 - r * scale * Math.sin(theta),
    bx = x === null ? 600 : 180 + x * scale;
  const drawing =
    line(100, 250, 735, 250, colors.ink, 2, true) +
    circle(180, 250, r * scale, colors.blue, false) +
    line(180, 250, ax, ay, colors.gold, 8) +
    (valid
      ? line(ax, ay, bx, 250, colors.teal, 8) + rect(bx - 24, 230, 48, 40)
      : label(420, 180, '此角度无法装配')) +
    circle(180, 250, 8) +
    circle(ax, ay, 8) +
    label(45, 50, '曲柄滑块 · 右侧装配分支');
  return obs(
    [
      m('slider', '滑块横坐标', x, 'm'),
      m('velocity', '滑块速度', vel, 'm/s'),
      m('stroke', '整周行程', L >= r ? 2 * r : null, 'm'),
      m(
        'rod_error',
        '连杆长度残差',
        valid ? Math.hypot(x! - r * Math.cos(theta), r * Math.sin(theta)) - L : null,
        'm',
      ),
    ],
    drawing,
    `${L >= r ? '可以整周装配。' : '连杆短于曲柄，部分角度无法装配。'} 平方根为零时到达分支奇异位置，不报告无穷速度。`,
    [
      curve(
        '位置随转角',
        '°',
        'm',
        sample(0, 360, 121, (a) => {
          const t = rad(a),
            q = L * L - r * r * Math.sin(t) ** 2;
          return q > 0 ? r * Math.cos(t) + Math.sqrt(q) : NaN;
        }),
      ),
    ],
    valid ? 'valid' : 'invalid',
  );
}
export function pulley(p: Inputs) {
  const n = p.segments!,
    h = p.height!,
    s = n * h,
    F = p.weight! / (n * p.efficiency!),
    input = F * s,
    useful = p.weight! * h;
  let drawing = line(100, 80, 700, 80, colors.ink, 9) + label(35, 45, '准静态吊装 · 绳不可伸长');
  const cy = 330 - h * 130;
  if (n === 1) {
    drawing +=
      path(
        [
          [230, 85],
          [230, cy],
          [300, cy],
        ],
        colors.gold,
        4,
      ) +
      circle(230, 85, 20, colors.teal, false) +
      path(
        [
          [230, 65],
          [580, 65],
          [600, 85],
          [600, cy + 30],
        ],
        colors.gold,
        4,
      ) +
      circle(580, 85, 20, colors.teal, false) +
      rect(250, cy, 100, 60);
  } else {
    let rope = `M210 85V${cy - 20}`;
    for (let k = 0; k < n / 2; k++) {
      const x = 210 + k * 120;
      rope += ` A20 20 0 0 0 ${x + 40} ${cy - 20} V105 A20 20 0 0 1 ${x + 80} 105`;
      if (k < n / 2 - 1) rope += ` H${x + 120} V${cy - 20}`;
      else rope += ` H600 V${cy + 30}`;
      drawing +=
        circle(x + 20, cy - 20, 20, colors.teal, false) +
        circle(x + 60, 105, 20, colors.teal, false) +
        line(x + 20, cy, 350, cy + 35, colors.ink, 2);
    }
    drawing +=
      `<path d="${rope}" fill="none" stroke="${colors.gold}" stroke-width="4"/>` +
      rect(300, cy + 35, 100, 60);
  }
  drawing +=
    arrow(640, 160, 0, 90, colors.red) +
    label(600, 290, `F=${F.toFixed(1)}N`) +
    label(65, 440, `${n}条承重绳段 · 金色连续绳 · 自由端向下拉`);
  return obs(
    [
      m('force', '手拉力', F, 'N'),
      m('rope', '拉绳长度', s, 'm'),
      m('height', '货物提升', h, 'm'),
      m('input', '输入功', input, 'J'),
      m('useful', '重力势能增加', useful, 'J'),
      m('loss', '耗散', input - useful, 'J'),
    ],
    drawing,
    'n由承重绳段定义，不由滑轮数量推算。主图按承重段分组显示；效率是整体简化参数，不模拟每个轮子的摩擦。',
    [
      curve(
        '拉力与绳段数',
        '段',
        'N',
        [1, 2, 4].map((x) => [x, p.weight! / (x * p.efficiency!)]),
      ),
    ],
  );
}
export function hydraulic(p: Inputs) {
  const a = p.small! * 1e-4,
    b = p.large! * 1e-4,
    x = p.displacement! / 100,
    y = (a * x) / b,
    F = (p.load! * a) / b,
    pressure = p.load! / b;
  const drawing =
    rect(130, 100, 140, 280, colors.blue) +
    rect(430, 100, 240, 280, colors.blue) +
    rect(240, 330, 210, 50, colors.blue) +
    rect(125, 180 + x * 900, 150, 16, colors.gold) +
    rect(425, 220 - y * 900, 250, 16, colors.gold) +
    rect(490, 150 - y * 900, 120, 70) +
    arrow(200, 120, 0, 60, colors.red) +
    arrow(550, 180 - y * 900, 0, -70) +
    label(40, 50, '不可压流体 · 活塞液面与位移为示意');
  return obs(
    [
      m('input_force', '小活塞施力', F, 'N'),
      m('output_force', '负载', p.load!, 'N'),
      m('pressure', '增量压强', pressure, 'Pa'),
      m('output_displacement', '大活塞提升', y * 100, 'cm'),
      m('input_work', '输入功', F * x, 'J'),
      m('output_work', '输出功', p.load! * y, 'J'),
    ],
    drawing,
    '理想无损液压、忽略活塞高差产生的静水压与惯性。面积比放大力，同时缩短行程；不能放大能量。',
    [
      curve(
        '输入行程与输出行程',
        'cm',
        'cm',
        sample(0, 20, 40, (t) => (a / b) * t),
      ),
    ],
  );
}
export function canopy(p: Inputs) {
  // Rigid Miura cell dimensions: theta is the folding half-angle, alpha the sector angle.
  const a = p.panel!,
    b = p.panel!,
    alpha = rad(60),
    theta = rad(p.fold!),
    den = Math.sqrt(1 - Math.sin(alpha) ** 2 * Math.sin(theta) ** 2),
    l = a * den,
    v = (b * Math.cos(alpha)) / den,
    w = (b * Math.cos(theta) * Math.sin(alpha)) / den,
    H = a * Math.sin(alpha) * Math.sin(theta),
    L = 2 * l,
    W = 2 * w,
    area = L * W,
    load = p.snow! * area;
  const E = 2e9,
    t = 0.005,
    I = (W * t ** 3) / 12,
    deflection = (5 * load * L ** 3) / (384 * E * I),
    valid = deflection < L * 0.05,
    solids: Solid[] = [];
  const vertex = (i: number, j: number): Vec3 => [
    (i - 2) * l + (j % 2) * v,
    (i % 2) * H,
    (j - 1.5) * w,
  ];
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 4; i++)
      solids.push({
        type: 'polygon',
        points: [vertex(i, j), vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)],
        color: (i + j) % 2 ? colors.teal : colors.gold,
        opacity: 0.7,
      });
  const drawing =
    solids
      .map((s) =>
        path(
          s.points.map(([x, y, z]) => [400 + x * 160 + z * 45, 270 - y * 160 + z * 35]),
          s.color,
          2,
          true,
        ),
      )
      .join('') +
    arrow(400, 90, 0, 75, colors.red) +
    label(40, 45, 'Miura刚性折叠 · 各面边长与平面角保持不变');
  return obs(
    [
      m('length', '投影展开长', L, 'm'),
      m('width', '投影展开宽', W, 'm'),
      m('height', '折叠高度', H, 'm'),
      m('load', '均布雪载合力', load, 'N'),
      m('deflection', '等效平板挠度参考', deflection * 1000, 'mm'),
      m('area', '投影覆盖面积', area, 'm²'),
    ],
    drawing,
    `${valid ? '等效平板挠度在小挠度范围内。' : '等效平板已越界，不能报告可靠承载预测。'} 尺寸按Miura单元关系；三维面板按平行四边形刚性机构，未求任意折痕铰链应力。承载另用5mm等效平板简支条带近似，E=2GPa，不等于真实折纸棚强度。`,
    [
      curve(
        '折叠角与覆盖面积',
        '°',
        'm²',
        sample(0, 80, 70, (v) => {
          const tt = rad(v),
            dd = Math.sqrt(1 - Math.sin(alpha) ** 2 * Math.sin(tt) ** 2);
          return (2 * a * dd * 2 * b * Math.cos(tt) * Math.sin(alpha)) / dd;
        }),
      ),
    ],
    valid ? 'valid' : 'boundary',
    solids,
  );
}
export function thermalHouse(p: Inputs) {
  const totalArea = 60,
    windowArea = p.window!,
    wallArea = totalArea - windowArea,
    Rwall = 0.04 + p.insulation! / 0.04 + 0.13,
    Uw = 1 / Rwall,
    G = Uw * wallArea + p.glass! * windowArea,
    delta = p.indoor! - p.outdoor!,
    flow = G * delta,
    C = 3e6,
    T = (t: number) => p.outdoor! + delta * Math.exp((-G * t) / C),
    now = T(p.time! * 3600);
  const drawing =
    path(
      [
        [180, 180],
        [400, 75],
        [620, 180],
        [620, 390],
        [180, 390],
      ],
      colors.teal,
      4,
      true,
    ) +
    rect(260, 220, 100 + windowArea * 3, 100, colors.blue) +
    rect(175, 185, 10 + 100 * p.insulation!, 200, colors.gold) +
    arrow(620, 240, 120 * 2 / Math.PI * Math.atan(Math.asinh(flow / 1000)), 0, colors.red) +
    label(45, 45, '墙体/窗并联传热 · 室内集总热容') +
    label(280, 170, `${now.toFixed(1)} °C`) +
    label(280, 420, `保温厚度 ${(p.insulation! * 100).toFixed(0)} cm`);
  return obs(
    [
      m('conductance', '总传热系数UA', G, 'W/K'),
      m('initial_flow', '初始热流', flow, 'W'),
      m('temperature', '自由冷却后室温', now, '°C'),
      m('volume', '保温材料体积', wallArea * p.insulation!, 'm³'),
      m('tau', '温差衰减时间常数', C / G / 3600, 'h'),
    ],
    drawing,
    '总围护60m²，保温导热率0.04W/(m·K)，表面热阻0.17m²K/W，室内热容3MJ/K。忽略太阳、通风、湿迁移和热桥；无供暖自由冷却，不是建筑节能认证。',
    [
      curve(
        '室温衰减',
        'h',
        '°C',
        sample(0, 48, 100, (h) => T(h * 3600)),
      ),
    ],
  );
}
export const engineeringModels: Model[] = [
  {
    id: 'S01',
    controls: [
      c('span', '跨度', 'm', 2, 10, 0.2, 6),
      c('rise', '推力线矢高', 'm', 0.5, 3, 0.1, 1.5),
      c('envelope', '抛物拱中心矢高', 'm', 0.5, 3, 0.1, 1.5),
      c('thickness', '拱体竖向包络厚度', 'm', 0.1, 1, 0.05, 0.3),
      c('load', '载荷强度（点载时为总力）', 'N/m 或 N', 10, 500, 10, 100),
      c('loading', '载荷类型', '', 0, 2, 1, 1, [
        [0, '沿链自重：悬链线'],
        [1, '水平均布：抛物线'],
        [2, '中央点载：折线'],
      ]),
    ],
    solve: arch,
  },
  {
    id: 'S02',
    controls: [
      c('length', '梁跨度', 'm', 0.2, 1, 0.05, 0.5),
      c('width', '截面宽', 'm', 0.005, 0.08, 0.005, 0.02),
      c('height', '截面高', 'm', 0.005, 0.08, 0.005, 0.04),
      c('modulus', '等效弹性模量', 'GPa', 1, 200, 1, 10),
      c('force', '端载', 'N', 0, 100, 1, 10),
      c('rotated', '旋转截面', '', 0, 1, 1, 0, [
        [0, '原朝向'],
        [1, '旋转90°'],
      ]),
      c('magnify', '变形显示倍率', '', 1, 200, 1, 100),
    ],
    solve: cantilever,
  },
  {
    id: 'S03',
    controls: [
      c('natural', '主塔固有频率', 'Hz', 0.5, 2, 0.05, 1),
      c('frequency', '地面激励频率', 'Hz', 0.1, 3, 0.01, 1),
      c('damper', '附加质量', 'kg', 0, 150, 10, 50),
      c('tuning', '附加系统调谐频率', 'Hz', 0.5, 2, 0.05, 1),
      c('acceleration', '地面加速度振幅', 'm/s²', 0.01, 1, 0.01, 0.1),
      c('time', '振动时间', 's', 0, 10, 0.02, 0),
    ],
    solve: seismic,
    time: { key: 'time', max: 10, rate: 1 },
  },
  {
    id: 'S04',
    controls: [
      c('radius', '底面外接圆半径', 'm', 0.5, 1.5, 0.1, 1),
      c('height', '顶部高度', 'm', 1, 2, 0.1, 1.5),
      c('tension', '斜索预张力', 'N', 0, 1000, 10, 100),
      c('rigidity', '杆抗弯刚度EI', 'N·m²', 10, 1000, 10, 200),
    ],
    solve: tensegrity,
    spatial: true,
  },
  {
    id: 'S05',
    controls: [
      c('span', '主跨', 'm', 10, 100, 5, 40),
      c('sag', '索垂度', 'm', 0.5, 15, 0.5, 5),
      c('load', '桥面均布荷载', 'N/m', 100, 5000, 100, 1000),
    ],
    solve: suspension,
  },
  {
    id: 'S06',
    controls: [
      c('crank', '曲柄长', 'm', 0.2, 2, 0.1, 1),
      c('rod', '连杆长', 'm', 0.5, 4, 0.1, 2),
      c('angle', '曲柄转角', '°', 0, 360, 1, 45),
      c('omega', '角速度', 'rad/s', 0, 5, 0.1, 1),
    ],
    solve: crank,
    time: { key: 'angle', max: 360, rate: 45, rateAt:p=>p.omega!*180/Math.PI, caption:'按设定角速度运动；角速度为0时保持静止。' },
    drag: { key: 'angle', axis: 'angle', min: 0, max: 360 },
  },
  {
    id: 'S07',
    controls: [
      c('weight', '货物重量', 'N', 10, 500, 10, 100),
      c('segments', '承重绳段', '', 1, 4, 1, 2, [
        [1, '固定滑轮：1段'],
        [2, '动滑轮：2段'],
        [4, '滑轮组：4段'],
      ]),
      c('height', '货物提升', 'm', 0, 1, 0.01, 0.5),
      c('efficiency', '整体效率', '', 0.5, 1, 0.05, 1),
    ],
    solve: pulley,
    time: { key: 'height', max: 1, rate: 0.1 },
  },
  {
    id: 'S08',
    controls: [
      c('small', '小活塞面积', 'cm²', 1, 10, 1, 2),
      c('large', '大活塞面积', 'cm²', 10, 100, 5, 40),
      c('load', '负载', 'N', 100, 5000, 100, 1000),
      c('displacement', '小活塞下压', 'cm', 0, 20, 0.1, 5),
    ],
    solve: hydraulic,
    time: { key: 'displacement', max: 20, rate: 2 },
  },
  {
    id: 'S09',
    controls: [
      c('panel', '单元边长', 'm', 0.3, 1, 0.1, 0.5),
      c('fold', '折叠半角', '°', 0, 80, 1, 30),
      c('snow', '等效均布雪载', 'N/m²', 0, 500, 10, 20),
    ],
    solve: canopy,
    spatial: true,
    time: { key: 'fold', max: 80, rate: 10 },
  },
  {
    id: 'S10',
    controls: [
      c('insulation', '保温厚度', 'm', 0.01, 0.3, 0.01, 0.1),
      c('window', '窗面积', 'm²', 2, 20, 1, 10),
      c('glass', '窗传热系数', 'W/(m²K)', 0.8, 6, 0.2, 2),
      c('indoor', '初始室温', '°C', 10, 30, 1, 20),
      c('outdoor', '室外温度', '°C', -20, 35, 1, 0),
      c('time', '无供暖时间', 'h', 0, 48, 0.1, 8),
    ],
    solve: thermalHouse,
    time: { key: 'time', max: 48, rate: 2 },
  },
];
