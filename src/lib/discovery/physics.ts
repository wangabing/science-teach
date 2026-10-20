import {
  control as c,
  metric as m,
  obs,
  curve,
  sample,
  rad,
  clamp,
  line,
  path,
  circle,
  rect,
  label,
  arrow,
  colors,
  rng,
  gaussian,
  type Model,
  type Inputs,
} from './core.ts';
const g = 9.8,
  k = 8.9875517923e9,
  mu0 = 4 * Math.PI * 1e-7;
export function incline(p: Inputs) {
  const theta = rad(p.theta!),
    stuck = Math.tan(theta) <= p.static! + 1e-12,
    a = stuck ? 0 : g * (Math.sin(theta) - Math.min(p.kinetic!, p.static!) * Math.cos(theta)),
    end = a > 0 ? Math.sqrt((2 * p.length!) / a) : null,
    t = Math.min(p.time!, end ?? p.time!),
    s = 0.5 * a * t * t,
    v = a * t,
    normal = p.mass! * g * Math.cos(theta),
    loss = Math.min(p.kinetic!, p.static!) * normal * s;
  const displayLength=Math.min(500,260/Math.max(.01,Math.sin(theta)));
  const sx = 110 + ((displayLength * s) / p.length!) * Math.cos(theta),
    sy = 130 + ((displayLength * s) / p.length!) * Math.sin(theta),
    endx = 110 + displayLength * Math.cos(theta),
    endy = 130 + displayLength * Math.sin(theta);
  const drawing =
    line(100, 140, endx, endy + 10, colors.ink, 7) +
    rect(sx - 18, sy - 32, 36, 25) +
    arrow(sx, sy, 0, Math.min(420-sy,20 + 35 * Math.log1p(p.mass! * g))) +
    label(75, 90, '无转动滑块 · 等时打点') +
    label(530, 100, stuck ? '静摩擦平衡' : '沿斜面向下');
  const dots = Array.from({ length: 9 }, (_, i) => {
    const ss = 0.5 * a * ((t * i) / 8) ** 2;
    return circle(
      110 + ((displayLength * ss) / p.length!) * Math.cos(theta),
      130 + ((displayLength * ss) / p.length!) * Math.sin(theta),
      3,
      colors.gold,
    );
  }).join('');
  return obs(
    [
      m('acceleration', '沿斜面加速度', a, 'm/s²'),
      m('distance', '位移', s, 'm'),
      m('speed', '速度', v, 'm/s'),
      m('arrival', '到达时间', end, 's'),
      m('kinetic', '动能', 0.5 * p.mass! * v * v, 'J'),
      m('loss', '摩擦耗散', loss, 'J'),
    ],
    drawing + dots,
    `${stuck ? '保持静止：静摩擦足以平衡重力分量。' : end !== null && p.time! >= end ? '已到终点，计时在接触挡块前停止。' : '由牛顿方程解析计算滑动。'} μk有效值不超过μs；长度与时间为SI，图形尺寸示意。`,
    [
      curve(
        '位移 s(t)',
        's',
        'm',
        sample(0, end ?? 3, 80, (x) => 0.5 * a * x * x),
      ),
      curve(
        '速度 v(t)',
        's',
        'm/s',
        sample(0, end ?? 3, 80, (x) => a * x),
      ),
    ],
  );
}
export function collision(p: Inputs) {
  const { mass1: a, mass2: b, v1: u, v2: v, restitution: e, time: t } = p as Record<string, number>;
  const hit = u! > v! ? 2 / (u! - v!) : Infinity,
    after = t! >= hit,
    V1 = (a! * u! + b! * v! - b! * e! * (u! - v!)) / (a! + b!),
    V2 = (a! * u! + b! * v! + a! * e! * (u! - v!)) / (a! + b!),
    xhit = -1 + u! * hit;
  const x1 = after ? xhit + V1 * (t! - hit) : -1 + u! * t!,
    x2 = after ? xhit + V2 * (t! - hit) : 1 + v! * t!,
    scale = Math.min(100, 270 / Math.max(2, Math.abs(x1), Math.abs(x2))),
    momentum = a! * u! + b! * v!,
    before = 0.5 * a! * u! ** 2 + 0.5 * b! * v! ** 2,
    energy = 0.5 * a! * V1 ** 2 + 0.5 * b! * V2 ** 2;
  return obs(
    [
      m('momentum', '总动量', momentum, 'kg·m/s'),
      m('momentum_after', '碰后总动量', a! * V1 + b! * V2, 'kg·m/s'),
      m('energy_before', '碰前动能', before, 'J'),
      m('energy_after', '碰后动能', Number.isFinite(hit) ? energy : null, 'J'),
      m('v1_after', '车A碰后速度', Number.isFinite(hit) ? V1 : null, 'm/s'),
      m('v2_after', '车B碰后速度', Number.isFinite(hit) ? V2 : null, 'm/s'),
    ],
    line(50, 310, 750, 310) +
      rect(400 + x1 * scale - 50, 255, 50, 50) +
      rect(400 + x2 * scale, 255, 50, 50, colors.purple) +
      label(400 + x1 * scale - 40, 240, 'A') +
      label(400 + x2 * scale + 12, 240, 'B') +
      label(65, 95, '一维隔离轨道 · 无外力冲量') +
      label(65, 135, Number.isFinite(hit) ? `接触时刻 ${hit.toFixed(3)} s` : '当前速度不会相遇'),
    `${after ? '已碰撞。' : '尚未接触。'} 动量保持；损失动能${(Number.isFinite(hit) ? before - energy : 0).toFixed(3)} J转为形变、热等内部能量。轨道位置指两车的相向接触端，车身宽度为示意。`,
    [
      curve('碰撞前后速度A', '阶段', 'm/s', [
        [0, u!],
        [1, u!],
        [1, V1],
        [2, V1],
      ]),
      curve(
        '碰撞前后速度B',
        '阶段',
        'm/s',
        [
          [0, v!],
          [1, v!],
          [1, V2],
          [2, V2],
        ],
        colors.purple,
      ),
    ],
  );
}
export function resonance(p: Inputs) {
  const w = 2 * Math.PI * p.frequency!,
    w0 = 2 * Math.PI * p.natural!,
    den = Math.hypot(w0 * w0 - w * w, 2 * p.damping! * w0 * w),
    valid = den > 1e-12,
    A = valid ? p.force! / p.mass! / den : null,
    phase = Math.atan2(2 * p.damping! * w0 * w, w0 * w0 - w * w),
    x = (A ?? 0) * Math.cos(w * p.time! - phase),
    visual = clamp(x * 100, -180, 180);
  const amp = (f: number) => {
    const q = 2 * Math.PI * f,
      d = Math.hypot(w0 * w0 - q * q, 2 * p.damping! * w0 * q);
    return d > 1e-10 ? p.force! / p.mass! / d : NaN;
  };
  const spring = Array.from(
    { length: 25 },
    (_, i) =>
      [100 + ((240 + visual) * i) / 24, 220 + (i === 0 || i === 24 ? 0 : i % 2 ? 14 : -14)] as [
        number,
        number,
      ],
  );
  return obs(
    [
      m('amplitude', '稳态振幅', A, 'm'),
      m('phase', '相位滞后', (phase * 180) / Math.PI, '°'),
      m('position', '当前位移', valid ? x : null, 'm'),
      m(
        'peak',
        '振幅峰值频率',
        p.damping! < 1 / Math.sqrt(2) ? p.natural! * Math.sqrt(1 - 2 * p.damping! ** 2) : 0,
        'Hz',
      ),
    ],
    rect(65, 150, 30, 140, colors.ink) +
      path(spring) +
      rect(340 + visual, 180, 85, 80) +
      arrow(425 + visual, 220, 55 * Math.cos(w * p.time!), 0) +
      label(65, 80, '稳态受迫振动 · 非起振过程') +
      label(70, 350, '显示位移限幅；真实振幅见读数'),
    valid
      ? '稳态解；阻尼越大峰越宽。位移显示限幅，不改变数值。'
      : '无阻尼且精确共振，不存在有限稳态振幅；请增加阻尼或改变频率。',
    [curve('幅频响应（参考解）', 'Hz', 'm', sample(0.1, 3, 160, amp))],
    valid ? 'valid' : 'invalid',
  );
}
export function electricField(p: Inputs) {
  const field = (x: number, y: number) => {
    let ex = 0,
      ey = 0,
      V = 0;
    for (const [cx, q] of [
      [-2, p.q1!],
      [2, p.q2!],
    ]) {
      const dx = x - cx!,
        d = Math.hypot(dx, y);
      if (d < 0.25) return null;
      ex += (k * q! * 1e-9 * dx) / d ** 3;
      ey += (k * q! * 1e-9 * y) / d ** 3;
      V += (k * q! * 1e-9) / d;
    }
    return { ex, ey, V };
  };
  const f = field(p.x!, p.y!);
  let drawing = label(45, 45, '电荷单位nC · 排除半径0.25 m');
  for (let x = -4; x <= 4; x++)
    for (let y = -2; y <= 2; y++) {
      const a = field(x, y);
      if (a && Math.hypot(a.ex, a.ey) > 1e-9) {
        const z = Math.hypot(a.ex, a.ey);
        drawing += arrow(
          400 + x * 70,
          230 - y * 70,
          (a.ex / z) * 24,
          (-a.ey / z) * 24,
          colors.blue,
        );
      }
    }
  drawing +=
    circle(260, 230, 14, p.q1! >= 0 ? colors.red : colors.blue) +
    circle(540, 230, 14, p.q2! >= 0 ? colors.red : colors.blue) +
    label(250, 235, p.q1! >= 0 ? '+' : '−', '#ffffff') +
    label(530, 235, p.q2! >= 0 ? '+' : '−', '#ffffff') +
    circle(400 + p.x! * 70, 230 - p.y! * 70, 9) +
    label(416 + p.x! * 70, 220 - p.y! * 70, 'P');
  return obs(
    [
      m('ex', '电场x分量', f?.ex ?? null, 'N/C'),
      m('ey', '电场y分量', f?.ey ?? null, 'N/C'),
      m('potential', '电势（无穷远为零）', f?.V ?? null, 'V'),
      m('magnitude', '场强大小', f ? Math.hypot(f.ex, f.ey) : null, 'N/C'),
    ],
    drawing,
    f
      ? '箭头仅表示局部方向，长度归一；电场/电势由库仑叠加计算。场方向不是粒子实际轨迹。'
      : 'P进入点电荷排除区，模型不报告有限场强。请移开探针。',
    [
      curve(
        '经过P的水平电势剖面',
        'm',
        'V',
        sample(-4, 4, 121, (x) => field(x, p.y!)?.V ?? NaN),
      ),
    ],
    f ? 'valid' : 'invalid',
  );
}
export function induction(p: Inputs) {
  const z = clamp(p.z! + p.velocity! * p.time!, -0.2, 0.2),
    moving = p.z! + p.velocity! * p.time! > -0.2 && p.z! + p.velocity! * p.time! < 0.2,
    v = moving ? p.velocity! : 0,
    r = p.radius!,
    N = p.turns!,
    mag = p.polarity! * 0.1;
  const flux = (x: number) => (N * mu0 * mag * r * r) / (2 * (r * r + x * x) ** 1.5),
    derivative = (x: number) => (-3 * N * mu0 * mag * r * r * x) / (2 * (r * r + x * x) ** 2.5),
    emf = -derivative(z) * v,
    I = p.closed! ? emf / p.resistance! : 0,
    F = I * derivative(z);
  let drawing = label(40, 55, '轴向小磁体 · 规定速度扫描');
  for (let i = 0; i < 7; i++)
    drawing += `<ellipse cx="${375 + i * 8}" cy="235" rx="20" ry="100" fill="none" stroke="${colors.gold}" stroke-width="3"/>`;
  drawing +=
    rect(400 + z * 1150 - 50, 210, 100, 50, colors.red) +
    label(400 + z * 1150 - 35, 240, p.polarity! > 0 ? 'S     N' : 'N     S') +
    (v===0?label(400+z*1150-18,300,'静止',colors.ink,16):arrow(400 + z * 1150, 290, Math.sign(v) * 65, 0)) +
    circle(650, 120, 45, colors.ink, false) +
    line(
      650,
      120,
      650 + Math.sin(clamp(I * 300, -1.2, 1.2)) * 32,
      120 - Math.cos(clamp(I * 300, -1.2, 1.2)) * 32,
      colors.red,
    ) +
    label(625, 190, '检流计');
  return obs(
    [
      m('flux_linkage', '磁链', flux(z), 'Wb·turn'),
      m('emf', '感应电动势', emf, 'V'),
      m('current', '回路电流', I, 'A'),
      m('heat', '电阻热功率', I * I * p.resistance!, 'W'),
      m('external', '维持运动的外力功率', -F * v, 'W'),
      m('position', '磁铁轴位置', z, 'm'),
    ],
    drawing,
    `${p.closed! ? '回路闭合。' : '回路开路：可以有电动势，电流为零。'} ${moving ? '正方向按线圈法向定义。' : '到达扫描端点并停止。'} 忽略自感；规定运动由外力维持，外力功率等于电阻耗散。`,
    [
      curve('磁链 λ(z)', 'm', 'Wb·turn', sample(-0.2, 0.2, 100, flux)),
      curve(
        '电动势 ε(z)（规定速度）',
        'm',
        'V',
        sample(-0.2, 0.2, 100, (x) => -derivative(x) * p.velocity!),
      ),
    ],
  );
}
export function magnetic(p: Inputs) {
  const mass = p.mass! * 1.6605390666e-27,
    q = p.charge! * 1.602176634e-19,
    v = p.speed! * 1000,
    w = (q * p.field!) / mass,
    r = w ? Math.abs(v / w) : null,
    t = p.time! * 1e-6;
  const at = (tt: number): [number, number] =>
    w ? [(v / w) * Math.sin(w * tt), (v / w) * (Math.cos(w * tt) - 1)] : [v * tt, 0];
  const points = Array.from({ length: 140 }, (_, i) => at((t * i) / 139)),
    scale = 175 / Math.max(0.005, ...points.map((a) => Math.hypot(...a))),
    pos = at(t);
  const drawing =
    Array.from({ length: 28 }, (_, i) =>
      label(
        100 + (i % 7) * 95,
        100 + Math.floor(i / 7) * 85,
        p.field! >= 0 ? '⊙' : '⊗',
        colors.blue,
        22,
      ),
    ).join('') +
    path(points.map(([x, y]) => [400 + x * scale, 220 - y * scale])) +
    circle(400 + pos[0] * scale, 220 - pos[1] * scale, 9) +
    label(45, 45, '带电粒子 · 均匀磁场垂直纸面') +
    label(45, 420, '轨迹自动缩放；磁力不改变速率');
  return obs(
    [
      m('radius', '轨道半径', r, 'm'),
      m('speed', '速率', v, 'm/s'),
      m('energy', '动能', 0.5 * mass * v * v, 'J'),
      m('period', '回旋周期', w ? (2 * Math.PI) / Math.abs(w) : null, 's'),
    ],
    drawing,
    '非相对论、无电场。q或B为零时沿直线运动；符号决定转弯方向。',
    [
      curve(
        '横坐标 x(t)',
        'μs',
        'm',
        sample(0, p.time!, 100, (x) => at(x * 1e-6)[0]),
      ),
    ],
  );
}
export function calorimeter(p: Inputs) {
  const power = p.current! ** 2 * p.resistance!,
    C = 4180 * p.water!,
    H = p.loss!,
    rise = (t: number) => (H ? (power / H) * -Math.expm1((-H * t) / C) : (power * t) / C);
  const boil =
      power > 80 * H ? (H ? (-C / H) * Math.log1p((-80 * H) / power) : (80 * C) / power) : Infinity,
    t = Math.min(p.time!, boil),
    dT = rise(t),
    Q = power * t,
    U = C * dT;
  const drawing =
    rect(270, 145, 260, 230, colors.blue) +
    rect(280, 220, 240, 145, colors.blue) +
    path(
      [
        [330, 160],
        [330, 290],
        [350, 310],
        [370, 290],
        [390, 310],
        [410, 290],
        [430, 310],
        [450, 290],
        [450, 160],
      ],
      colors.red,
      5,
    ) +
    label(45, 65, '液态水量热 · 忽略容器热容') +
    label(315, 410, `${(20 + dT).toFixed(2)} °C`) +
    arrow(530, 240, 90, 0, colors.gold) +
    label(610, 220, '散热');
  return obs(
    [
      m('temperature', '水温', 20 + dT, '°C'),
      m('input', '电能输入', Q, 'J'),
      m('internal', '水内能增加', U, 'J'),
      m('dissipated', '向环境散热', Q - U, 'J'),
      m('power', '电热功率', power, 'W'),
    ],
    drawing,
    p.time! >= boil
      ? '已达100°C，液态升温模型停止；相变潜热未纳入。'
      : '环境20°C，线性散热HΔT；输入电能=水内能增加+散热。',
    [
      curve(
        '温度随时间（液态段）',
        's',
        '°C',
        sample(0, Math.min(600, boil), 100, (x) => 20 + rise(x)),
      ),
    ],
    p.time! >= boil ? 'boundary' : 'valid',
  );
}
export function gas(p: Inputs) {
  const R = 8.314462618,
    Cv = 1.5 * p.moles! * R,
    Cp = 2.5 * p.moles! * R,
    atPressure = p.process! === 1,
    dT = p.heat! / (atPressure ? Cp : Cv),
    T = 300 + dT,
    V0 = 0.01,
    V = atPressure ? (V0 * T) / 300 : V0,
    pressure = (p.moles! * R * T) / V,
    W = atPressure ? p.moles! * R * dT : 0,
    U = Cv * dT;
  const height = clamp((170 * V) / V0, 100, 290),
    drawing =
      rect(260, 90, 270, 310, colors.ink) +
      rect(270, 390 - height, 250, height, colors.blue) +
      rect(255, 380 - height, 280, 16, colors.gold) +
      arrow(395, 390 - height, 0, -45) +
      label(45, 50, atPressure ? '准静态定压 · 活塞可动' : '定容 · 活塞锁定') +
      label(585, 245, 'Q → U + W');
  return obs(
    [
      m('temperature', '气体温度', T, 'K'),
      m('pressure', '压强', pressure, 'Pa'),
      m('volume', '体积', V, 'm³'),
      m('internal', '内能变化', U, 'J'),
      m('work', '气体对外做功', W, 'J'),
      m('heat', '吸收热量', p.heat!, 'J'),
    ],
    drawing,
    '单原子理想气体，初温300K、初体积0.01m³。准静态过程，Q=ΔU+W；动画活塞位移为示意。',
    [
      curve(
        'p–V过程',
        'L',
        'Pa',
        sample(0, p.heat!, 80, (q) => q).map(([q]) => {
          const temp = 300 + q / (atPressure ? Cp : Cv),
            vv = atPressure ? (V0 * temp) / 300 : V0;
          return [vv * 1000, (p.moles! * R * temp) / vv];
        }),
      ),
    ],
  );
}
let brownCache: { key: string; paths: [number, number][][]; msd: [number, number][] } | undefined;
export function brownian(p: Inputs) {
  const key = [p.seed, p.particles, p.diffusion].join('/');
  if (brownCache?.key !== key) {
    const random = rng(p.seed!),
      n = p.particles!,
      paths = Array.from({ length: n }, () => [[0, 0]] as [number, number][]),
      msd: [number, number][] = [[0, 0]],
      sigma = Math.sqrt(2 * p.diffusion! * 0.05);
    for (let j = 1; j <= 200; j++) {
      let sum = 0;
      for (const a of paths) {
        const last = a[j - 1]!,
          next: [number, number] = [
            last[0] + sigma * gaussian(random),
            last[1] + sigma * gaussian(random),
          ];
        a.push(next);
        sum += next[0] ** 2 + next[1] ** 2;
      }
      msd.push([j * 0.05, sum / n]);
    }
    brownCache = { key, paths, msd };
  }
  const index = Math.round(p.time! / 0.05),
    paths = brownCache.paths,
    msd = brownCache.msd[index]![1],
    scale = 7;
  const drawing =
    rect(90, 45, 620, 380, colors.blue) +
    paths
      .map((a, i) => {
        const pt = a[index]!;
        return (
          (i < 3
            ? path(
                a.slice(0, index + 1).map(([x, y]) => [400 + x * scale, 235 - y * scale]),
                i === 0 ? colors.teal : colors.gold,
                1.5,
              )
            : '') + circle(400 + pt[0] * scale, 235 - pt[1] * scale, 3, colors.teal)
        );
      })
      .join('') +
    label(110, 75, '合成随机过程 · 非显微照片');
  return obs(
    [
      m('msd', '样本均方位移', msd, 'μm²'),
      m('theory', '理论均方位移', 4 * p.diffusion! * p.time!, 'μm²'),
      m('count', '样本粒子数', p.particles!, '个'),
      m('time', '观察时间', p.time!, 's'),
    ],
    drawing,
    '二维独立高斯增量，固定种子可复现；理论是系综平均，单条轨迹和有限样本不必单调。边框仅视窗，不是反射容器。',
    [
      curve('样本均方位移', 's', 'μm²', brownCache.msd),
      curve(
        '理论4Dt',
        's',
        'μm²',
        sample(0, 10, 40, (t) => 4 * p.diffusion! * t),
        colors.gold,
      ),
    ],
  );
}
export function refraction(p: Inputs) {
  const i = rad(p.angle!),
    ratio = (p.n1! / p.n2!) * Math.sin(i),
    tir = ratio > 1,
    rt = tir ? null : Math.asin(clamp(ratio, -1, 1)),
    critical = p.n1! > p.n2! ? (Math.asin(p.n2! / p.n1!) * 180) / Math.PI : null;
  let R = 1;
  if (!tir) {
    const ci = Math.cos(i),
      ct = Math.cos(rt!),
      rs = (p.n1! * ci - p.n2! * ct) / (p.n1! * ci + p.n2! * ct),
      rp = (p.n2! * ci - p.n1! * ct) / (p.n2! * ci + p.n1! * ct);
    R = (rs * rs + rp * rp) / 2;
  }
  const drawing =
    rect(40, 45, 720, 185, colors.blue) +
    line(40, 230, 760, 230) +
    line(400, 50, 400, 430, colors.gold, 2, true) +
    arrow(
      400 - 180 * Math.sin(i),
      230 - 180 * Math.cos(i),
      180 * Math.sin(i),
      180 * Math.cos(i),
      colors.teal,
    ) +
    arrow(400, 230, 180 * Math.sin(i), -180 * Math.cos(i), colors.red) +
    (rt === null ? '' : arrow(400, 230, 180 * Math.sin(rt), 180 * Math.cos(rt), colors.blue)) +
    label(55, 90, `n₁ = ${p.n1}`) +
    label(55, 380, `n₂ = ${p.n2}`) +
    label(530, 410, tir ? '全反射' : '折射与反射并存');
  return obs(
    [
      m('transmitted_angle', '折射角', rt === null ? null : (rt * 180) / Math.PI, '°'),
      m('critical', '临界角', critical, '°'),
      m('reflectance', '反射能流比', R, ''),
      m('transmittance', '透射能流比', 1 - R, ''),
    ],
    drawing,
    '无吸收平面界面、非偏振光Fresnel能流。箭头方向真实，线条亮度示意；只有高折射率向低折射率才可能全反射。',
    [
      curve(
        '角度与折射（参考）',
        '°',
        '°',
        sample(0, 89.9, 120, (x) => {
          const y = (p.n1! / p.n2!) * Math.sin(rad(x));
          return y <= 1 ? (Math.asin(y) * 180) / Math.PI : NaN;
        }),
      ),
    ],
  );
}
export const physicsModels: Model[] = [
  {
    id: 'P01',
    controls: [
      c('mass', '滑块质量', 'kg', 0.1, 5, 0.1, 1),
      c('theta', '斜面角度', '°', 0, 60, 1, 30),
      c('length', '轨道长度', 'm', 0.5, 3, 0.1, 2),
      c('static', '静摩擦系数', '', 0, 0.8, 0.02, 0),
      c('kinetic', '滑动摩擦系数（有效值≤静摩擦）', '', 0, 0.8, 0.02, 0),
      c('time', '释放后时间', 's', 0, 3, 0.01, 0.5),
    ],
    solve: incline,
    time: { key: 'time', max: 3, rate: 0.5 },
  },
  {
    id: 'P02',
    controls: [
      c('mass1', '车A质量', 'kg', 0.2, 5, 0.1, 1),
      c('mass2', '车B质量', 'kg', 0.2, 5, 0.1, 1),
      c('v1', '车A初速度', 'm/s', -4, 4, 0.1, 2),
      c('v2', '车B初速度', 'm/s', -4, 4, 0.1, -1),
      c('restitution', '恢复系数', '', 0, 1, 0.05, 1),
      c('time', '释放后时间', 's', 0, 4, 0.01, 0),
    ],
    solve: collision,
    time: { key: 'time', max: 4, rate: 0.5 },
  },
  {
    id: 'P03',
    controls: [
      c('frequency', '驱动频率', 'Hz', 0.1, 3, 0.01, 0.8),
      c('natural', '固有频率', 'Hz', 0.5, 2, 0.05, 1),
      c('damping', '阻尼比', '', 0, 1, 0.01, 0.12),
      c('mass', '质量', 'kg', 0.2, 5, 0.1, 1),
      c('force', '驱动力振幅', 'N', 0.1, 10, 0.1, 1),
      c('time', '相位时间', 's', 0, 10, 0.02, 0),
    ],
    solve: resonance,
    time: { key: 'time', max: 10, rate: 1 },
  },
  {
    id: 'P04',
    controls: [
      c('q1', '左源电荷', 'nC', -5, 5, 0.5, 2),
      c('q2', '右源电荷', 'nC', -5, 5, 0.5, -2),
      c('x', '探针横坐标', 'm', -4, 4, 0.05, 0),
      c('y', '探针纵坐标', 'm', -2, 2, 0.05, 1),
    ],
    solve: electricField,
    drag: { key: 'x', axis: 'x', min: -4, max: 4 },
  },
  {
    id: 'P05',
    controls: [
      c('z', '磁铁起始轴位置', 'm', -0.2, 0.2, 0.005, -0.1),
      c('velocity', '规定运动速度', 'm/s', -0.2, 0.2, 0.01, 0.05),
      c('radius', '线圈半径', 'm', 0.03, 0.1, 0.005, 0.05),
      c('turns', '线圈匝数', '', 10, 200, 10, 100),
      c('resistance', '总电阻', 'Ω', 1, 50, 1, 10),
      c('polarity', '磁极朝向', '', -1, 1, 2, 1, [
        [-1, '反向'],
        [1, '正向'],
      ]),
      c('closed', '回路状态', '', 0, 1, 1, 1, [
        [0, '开路'],
        [1, '闭合'],
      ]),
      c('time', '扫描时间', 's', 0, 8, 0.02, 0),
    ],
    solve: induction,
    time: { key: 'time', max: 8, rate: 1 },
  },
  {
    id: 'P06',
    controls: [
      c('mass', '粒子质量', 'u', 1, 10, 1, 1),
      c('charge', '电荷数', 'e', -2, 2, 1, 1),
      c('speed', '初速', 'km/s', 100, 5000, 100, 1000),
      c('field', '磁感应强度', 'T', -2, 2, 0.1, 0.5),
      c('time', '飞行时间', 'μs', 0, 0.2, 0.001, 0.06),
    ],
    solve: magnetic,
    time: { key: 'time', max: 0.2, rate: 0.02 },
  },
  {
    id: 'P07',
    controls: [
      c('current', '电流', 'A', 0, 5, 0.1, 2),
      c('resistance', '电阻', 'Ω', 1, 50, 1, 10),
      c('water', '水质量', 'kg', 0.1, 2, 0.1, 0.5),
      c('loss', '散热系数', 'W/K', 0, 10, 0.5, 0),
      c('time', '加热时间', 's', 0, 600, 1, 120),
    ],
    solve: calorimeter,
    time: { key: 'time', max: 600, rate: 30 },
  },
  {
    id: 'P08',
    controls: [
      c('moles', '物质的量', 'mol', 0.1, 2, 0.1, 1),
      c('process', '过程', '', 0, 1, 1, 0, [
        [0, '定容'],
        [1, '准静态定压'],
      ]),
      c('heat', '已输入热量', 'J', 0, 2000, 10, 500),
    ],
    solve: gas,
    time: { key: 'heat', max: 2000, rate: 100 },
  },
  {
    id: 'P09',
    controls: [
      c('seed', '随机种子', '', 1, 99, 1, 12),
      c('particles', '粒子数', '', 1, 256, 1, 128),
      c('diffusion', '扩散系数', 'μm²/s', 0.1, 5, 0.1, 1),
      c('time', '观察时间', 's', 0, 10, 0.05, 2),
    ],
    solve: brownian,
    time: { key: 'time', max: 10, rate: 1 },
  },
  {
    id: 'P10',
    controls: [
      c('n1', '入射侧折射率', '', 1, 2, 0.001, 1.333),
      c('n2', '透射侧折射率', '', 1, 2, 0.01, 1),
      c('angle', '相对法线入射角', '°', 0, 89, 1, 30),
    ],
    solve: refraction,
    drag: { key: 'angle', axis: 'angle', min: 0, max: 89 },
  },
];
