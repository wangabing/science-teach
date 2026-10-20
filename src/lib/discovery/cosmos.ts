import { tidalApparatus } from './tidal.ts';
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
  rng,
  gaussian,
  type Model,
  type Inputs,
  type Solid,
} from './core.ts';
export const LIGHT = 299792458,
  AU = 149597870700,
  G = 6.6743e-11,
  SOLAR = 1.98847e30,
  SIGMA = 5.670374419e-8;
const sky = (text: string) => label(35, 40, text, '#68d8ee');
export function threeSuns(p: Inputs) {
  const masses = [1, p.mass!, 0.5],
    pos = [
      [-1, 0],
      [1, 0],
      [0, 1.4],
    ],
    vel = [
      [0, -0.35],
      [0, 0.35],
      [-0.4, 0],
    ],
    dt = 0.002,
    steps = Math.round(p.time! / dt),
    trails: number[][][] = pos.map(() => []);
  let stopped = false;
  const acceleration = () =>
    pos.map((a, i) => {
      const out = [0, 0];
      pos.forEach((b, j) => {
        if (i === j) return;
        const dx = b[0]! - a[0]!,
          dy = b[1]! - a[1]!,
          d = Math.hypot(dx, dy);
        if (d < 0.08) stopped = true;
        const f = masses[j]! / Math.max(d, 0.08) ** 3;
        out[0]! += dx * f;
        out[1]! += dy * f;
      });
      return out;
    });
  let acc = acceleration();
  const energy = () => {
    let e = vel.reduce((s, v, i) => s + 0.5 * masses[i]! * (v[0]! ** 2 + v[1]! ** 2), 0);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < i; j++)
        e -=
          (masses[i]! * masses[j]!) /
          Math.hypot(pos[i]![0]! - pos[j]![0]!, pos[i]![1]! - pos[j]![1]!);
    return e;
  };
  const E0 = energy();
  for (let k = 0; k < steps && !stopped; k++) {
    for (let i = 0; i < 3; i++)
      for (let a = 0; a < 2; a++) {
        vel[i]![a]! += (acc[i]![a]! * dt) / 2;
        pos[i]![a]! += vel[i]![a]! * dt;
      }
    acc = acceleration();
    for (let i = 0; i < 3; i++) for (let a = 0; a < 2; a++) vel[i]![a]! += (acc[i]![a]! * dt) / 2;
    if (k % 10 === 0) pos.forEach((v, i) => trails[i]!.push([...v]));
  }
  const planet = [p.planet!, 0],
    flux = pos.reduce(
      (s, v, i) =>
        s +
        (1361 * masses[i]! ** 3.5) /
          Math.max(0.01, (v[0]! - planet[0]!) ** 2 + (v[1]! - planet[1]!) ** 2),
      0,
    ),
    T = ((flux * (1 - p.albedo!)) / (4 * SIGMA)) ** 0.25,
    solids: Solid[] = pos.map((v, i) => ({
      type: 'sphere',
      points: [[v[0]!, 0, v[1]!]],
      radius: 0.12 * masses[i]!,
      color: ['#ffd98a', '#fff4cf', '#ff9c6d'][i],
    }));
  solids.push({ type: 'sphere', points: [[planet[0]!, 0, 0]], radius: 0.18, color: '#68d8ee' });
  trails.forEach((t, i) => {
    if (t.length > 1)
      solids.push({
        type: 'line',
        points: t.map((v) => [v[0]!, 0, v[1]!]),
        color: ['#ffd98a', '#fff4cf', '#ff9c6d'][i],
      });
  });
  let draw = sky('三恒星万有引力积分 · 行星为固定、不反作用的测光探针');
  const sc = 220 / Math.max(2, ...pos.flat().map(Math.abs), p.planet!);
  trails.forEach(
    (a, i) =>
      (draw += path(
        a.map((v) => [400 + v[0]! * sc, 240 + v[1]! * sc]),
        ['#ffd98a', '#fff4cf', '#ff9c6d'][i],
        2,
      )),
  );
  pos.forEach(
    (v, i) =>
      (draw += circle(
        400 + v[0]! * sc,
        240 + v[1]! * sc,
        12,
        ['#ffd98a', '#fff4cf', '#ff9c6d'][i],
      )),
  );
  draw += circle(400 + planet[0]! * sc, 240, 7, '#68d8ee');
  return obs(
    [
      m('flux', '探针总辐照度', flux, 'W/m²'),
      m('temperature', '瞬时灰体平衡温度', T, 'K'),
      m('energy_error', '恒星系统相对能量误差', (energy() - E0) / Math.abs(E0), ''),
      m('elapsed', '积分时长', Math.min(steps * dt, p.time!), '归一化时间'),
    ],
    draw,
    'G=1，恒星质量/距离/时间为归一化量；将距离单位映射AU以演示辐照，光度采用示意质量幂律。固定测光探针不是宜居行星轨道，平衡温度忽略大气、热惯性和昼夜；近接触即停止，不能预测小说纪元。',
    [],
    stopped ? 'boundary' : 'valid',
    solids,
  );
}
export function restrictedAcceleration(mu: number, x: number, y: number, vx: number, vy: number) {
  const a = Math.hypot(x + mu, y),
    b = Math.hypot(x - 1 + mu, y);
  return [
    2 * vy + x - ((1 - mu) * (x + mu)) / a ** 3 - (mu * (x - 1 + mu)) / b ** 3,
    -2 * vx + y - ((1 - mu) * y) / a ** 3 - (mu * y) / b ** 3,
  ];
}
export function jacobi(mu: number, s: number[]) {
  const [x, y, vx, vy] = s;
  return (
    x! ** 2 +
    y! ** 2 +
    2 * ((1 - mu) / Math.hypot(x! + mu, y!) + mu / Math.hypot(x! - 1 + mu, y!)) -
    vx! ** 2 -
    vy! ** 2
  );
}
function rk4(s: number[], dt: number, f: (a: number[]) => number[]) {
  const a = f(s),
    b = f(s.map((v, i) => v + (dt * a[i]!) / 2)),
    c = f(s.map((v, i) => v + (dt * b[i]!) / 2)),
    d = f(s.map((v, i) => v + dt * c[i]!));
  return s.map((v, i) => v + (dt * (a[i]! + 2 * b[i]! + 2 * c[i]! + d[i]!)) / 6);
}
export function lagrange(p: Inputs) {
  const mu = p.ratio!;
  const equilibrium = (lo: number, hi: number) => {
    for (let i = 0; i < 70; i++) {
      const mid = (lo + hi) / 2,
        aa = restrictedAcceleration(mu, mid, 0, 0, 0)[0]!;
      if (aa > 0) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  };
  const x =
      p.point === 1
        ? equilibrium(-mu + 0.00001, 1 - mu - 0.00001)
        : p.point === 2
          ? equilibrium(1 - mu + 0.00001, 3)
          : 0.5 - mu,
    y = p.point ? 0 : Math.sqrt(3) / 2;
  let s = [x + p.offset!, y, 0, 0],
    C = jacobi(mu, s),
    trail: [number, number][] = [[s[0]!, s[1]!]],
    stop = false;
  for (let k = 0; k < Math.round(p.time! / 0.005); k++) {
    if (Math.min(Math.hypot(s[0]! + mu, s[1]!), Math.hypot(s[0]! - 1 + mu, s[1]!)) < 0.03) {
      stop = true;
      break;
    }
    s = rk4(s, 0.005, (a) => [
      a[2]!,
      a[3]!,
      ...restrictedAcceleration(mu, a[0]!, a[1]!, a[2]!, a[3]!),
    ]);
    if (k % 10 === 0) trail.push([s[0]!, s[1]!]);
  }
  const inertial = p.frame === 1,
    transform = (a: number, b: number, t: number): [number, number] =>
      inertial ? [a * Math.cos(t) - b * Math.sin(t), a * Math.sin(t) + b * Math.cos(t)] : [a, b],
    viewTrail = trail.map(([a, b], i) => transform(a, b, i === 0 ? 0 : (i - 1) * 0.05 + 0.005)),
    primary = transform(-mu, 0, p.time!),
    secondary = transform(1 - mu, 0, p.time!),
    station = transform(x, y, p.time!);
  const draw =
    sky(inertial ? '惯性坐标系 · 主星和特殊构型共同转动' : '共转坐标系 · 平衡点附近无质量探针') +
    circle(350 + primary[0] * 180, 250 - primary[1] * 180, 25, '#ffd98a') +
    circle(350 + secondary[0] * 180, 250 - secondary[1] * 180, 12, '#68d8ee') +
    path(
      viewTrail.map(([a, b]) => [350 + a * 180, 250 - b * 180]),
      '#68d8ee',
      2,
    ) +
    circle(350 + station[0] * 180, 250 - station[1] * 180, 7, '#cf9cff', false);
  return obs(
    [
      m('jacobi', 'Jacobi常数', jacobi(mu, s), ''),
      m('drift', 'Jacobi常数漂移', jacobi(mu, s) - C, ''),
      m('displacement', '偏离所选平衡点距离', Math.hypot(s[0]! - x, s[1]! - y), ''),
      m('stable', 'L4线性稳定条件', mu * (1 - mu) < 1 / 27 ? 1 : 0, ''),
    ],
    draw,
    '圆形限制三体模型：两主星做圆轨道，探针质量忽略。共转系含科里奥利项；μ(1−μ)<1/27时L4/L5线性稳定。平衡位置不代表任何扰动都安全；L1/L2不稳定。',
    [curve(inertial ? '探针惯性轨迹' : '探针共转轨迹', 'x', 'y', viewTrail)],
    stop ? 'boundary' : 'valid',
    [
      { type: 'sphere', points: [[primary[0], 0, primary[1]]], radius: 0.08, color: '#ffd98a' },
      { type: 'sphere', points: [[secondary[0], 0, secondary[1]]], radius: 0.04, color: '#68d8ee' },
      { type: 'line', points: viewTrail.map(([a, b]) => [a, 0, b]), color: '#68d8ee' },
      {
        type: 'sphere',
        points: [[transform(s[0]!, s[1]!, p.time!)[0], 0, transform(s[0]!, s[1]!, p.time!)[1]]],
        radius: 0.035,
        color: '#cf9cff',
      },
    ],
  );
}
export function lightEvents(D: number, u: number, wait = 0) {
  const arrival = D / (1 - u),
    reply = arrival + wait,
    x = D + u * reply;
  return { arrival, reply, return: reply + x, x };
}
export function lightCone(p: Inputs) {
  const r = lightEvents(p.distance!, p.speed!, p.wait!),
    scale = 340 / Math.max(r.return, p.distance!, 1),
    ox = 170,
    oy = 400,
    draw =
      sky('竖轴：地球系时间 · 横轴：距离 · 光速=1光年/年') +
      line(ox, oy, ox, 65, '#68d8ee') +
      line(ox, oy, 730, oy, '#68d8ee') +
      path(
        [
          [ox, oy],
          [ox + p.distance! * scale, oy],
          [ox + r.x * scale, oy - r.reply * scale],
        ],
        '#ffd98a',
        2,
      ) +
      path(
        [
          [ox, oy],
          [ox + r.arrival * scale, oy - r.arrival * scale],
          [ox + r.x * scale, oy - r.reply * scale],
          [ox, oy - r.return * scale],
        ],
        '#68d8ee',
        4,
      ) +
      line(ox, oy, ox + 330, oy - 330, '#cf9cff', 1, true) +
      label(ox + 10, oy - r.return * scale, '收到回复', '#68d8ee');
  return obs(
    [
      m('clock', '发送后地球时间', p.time!, '年'),
      m('outbound', '对方收到时刻', r.arrival, '年'),
      m('reply', '对方发回时刻', r.reply, '年'),
      m('return', '地球收到回复时刻', r.return, '年'),
      m('range', '回复发出距离', r.x, '光年'),
    ],
    draw +
      circle(
        ox +
          (p.time! <= r.arrival
            ? p.time!
            : p.time! <= r.reply
              ? p.distance! + p.speed! * p.time!
              : Math.max(0, r.return - p.time!)) *
            scale,
        oy - Math.min(p.time!, r.return) * scale,
        8,
        '#ffd98a',
      ),
    '地球系中匀速目的地x=D+ut，|u|<1；等待时间也是地球系时间。忽略加速/宇宙膨胀。纠缠不能传递可控超光速消息；“黑暗森林”是小说命题，不是物理定律。',
    [
      curve('目的地世界线', '光年', '年', [
        [p.distance!, 0],
        [r.x, r.reply],
      ]),
      curve('信号世界线', '光年', '年', [
        [0, 0],
        [r.arrival, r.arrival],
        [r.x, r.reply],
        [0, r.return],
      ]),
    ],
  );
}
export function clocks(p: Inputs) {
  const b = p.speed!,
    gamma = 1 / Math.sqrt(1 - b * b),
    earth = (2 * p.distance!) / b,
    ship = earth / gamma,
    scale = Math.min(330 / earth, 480 / p.distance!),
    draw =
      sky('地球惯性系 · 对称往返，掉头时间忽略') +
      line(170, 400, 170, 60, '#68d8ee') +
      path(
        [
          [170, 400],
          [170 + p.distance! * scale, 400 - earth * scale / 2],
          [170, 400 - earth * scale],
        ],
        '#ffd98a',
        4,
      ) +
      label(210, 90, `地球 ${earth.toFixed(2)} 年`, '#68d8ee') +
      label(440, 260, `船钟 ${ship.toFixed(2)} 年`, '#ffd98a');
  return obs(
    [
      m('gamma', '洛伦兹因子γ', gamma, ''),
      m('earth', '地球历时', earth, '年'),
      m('ship', '飞船固有时', ship, '年'),
      m('difference', '年龄差', earth - ship, '年'),
      m('length', '巡航系单程收缩距离', p.distance! / gamma, '光年'),
    ],
    draw,
    '狭义相对论惯性段固有时积分；瞬时掉头理想化用于比较路径，实际加速阶段应另积分。双方“都看到对方慢”不意味着两条世界线固有时相等。',
    [
      curve(
        '船钟/地球钟',
        'v/c',
        '比值',
        sample(0.01, 0.99, 100, (v) => Math.sqrt(1 - v * v)),
      ),
    ],
  );
}
export function sailForce(S: number, A: number, _mass: number, rho: number, angle: number) {
  const a = rad(angle),
    co = Math.max(0, Math.cos(a)),
    q = (S * A * co) / LIGHT;
  return {
    x: q * (1 - rho + 2 * rho * co * co),
    y: q * 2 * rho * co * Math.sin(a),
    absorbed: (1 - rho) * S * A * co,
  };
}
export function sail(p: Inputs) {
  if (p.mode === 1) return radialSail(p);
  const S = 1361 / p.radius! ** 2,
    f = sailForce(S, p.area!, p.mass!, p.reflectivity!, p.angle!),
    a = f.x / p.mass!,
    forceMagnitude = Math.hypot(f.x,f.y),
    forceScale = 150 * 2 / Math.PI * Math.atan(Math.asinh(forceMagnitude / 1e-4)) / Math.max(forceMagnitude,1e-20),
    gravity = (G * SOLAR) / (p.radius! * AU) ** 2,
    net = a - gravity,
    T = p.emissivity! > 0 ? (f.absorbed / (2 * p.emissivity! * SIGMA * p.area!)) ** 0.25 : null,
    draw =
      sky('太阳光压 · 光束k向右 · 倾斜帆的合力未必沿光束') +
      circle(110, 230, 60, '#ffd98a') +
      [160, 210, 260, 310].map((x) => arrow(x, 220, 40, 0, '#ffd98a')).join('') +
      line(
        450 - (14 * Math.sqrt(p.area!)) * Math.sin(rad(p.angle!)),
        230 - (14 * Math.sqrt(p.area!)) * Math.cos(rad(p.angle!)),
        450 + (14 * Math.sqrt(p.area!)) * Math.sin(rad(p.angle!)),
        230 + (14 * Math.sqrt(p.area!)) * Math.cos(rad(p.angle!)),
        '#68d8ee',
        8,
      ) +
      arrow(
        450,
        230,
        forceScale * f.x,
        -forceScale * f.y,
        '#cf9cff',
      );
  return obs(
    [
      m('force_x', '沿光束力', f.x, 'N'),
      m('force_y', '横向力', f.y, 'N'),
      m('acceleration', '沿光束加速度', a, 'm/s²'),
      m('absorbed', '吸收功率', f.absorbed, 'W'),
      m('temperature', '双面辐射平衡温度', T, 'K'),
      m('radial_net', '本地径向净加速度', p.angle === 0 ? net : null, 'm/s²'),
      m('speed_gain', '均匀光束无引力速度增量', a * p.days! * 86400, 'm/s'),
    ],
    draw,
    '帆宽随面积平方根变化；力箭头为非线性放大示意。局部平面均匀光束，反射为镜面、未反射部分全部吸收；ε>0才定义热平衡。最后一项只适用于固定照度无引力实验，不是太阳系飞行预测。径向净加速度仅适用正对太阳且径向静止初值；不对应地球公转或0.2c航行。',
    [
      curve(
        '帆角与沿光束加速度',
        '°',
        'm/s²',
        sample(0, 90, 90, (v) => sailForce(S, p.area!, p.mass!, p.reflectivity!, v).x / p.mass!),
      ),
    ],
    T === null ? 'boundary' : 'valid',
  );
}
export function radialSail(p: Inputs) {
  let state = [p.radius! * AU, 0],
    stopped = false;
  const dt = 300,
    trace: [number, number][] = [[0, state[0]! / AU]],
    rho = p.reflectivity!;
  const accel = (r: number) =>
    ((1 + rho) * 1361 * (AU / r) ** 2 * p.area!) / (p.mass! * LIGHT) - (G * SOLAR) / r ** 2;
  let t = 0;
  for (let k = 0; k < Math.round((p.days! * 86400) / dt); k++) {
    if (state[0]! < 0.5 * AU || Math.abs(state[1]!) > 0.01 * LIGHT) {
      stopped = true;
      break;
    }
    state = rk4(state, dt, (a) => [a[1]!, accel(a[0]!)]);
    t += dt;
    if (k % 24 === 0) trace.push([t / 86400, state[0]! / AU]);
  }
  return obs(
    [
      m('radius', '当前径向距离', state[0]! / AU, 'AU'),
      m('velocity', '径向速度', state[1]!, 'm/s'),
      m('acceleration', '当前净加速度', accel(state[0]!), 'm/s²'),
      m('days', '已积分天数', t / 86400, '天'),
    ],
    sky('一维径向理想航行 · 正对太阳 · 初始径向静止') +
      circle(120, 240, 55, '#ffd98a') +
      line(200, 240, 700, 240, '#68d8ee', 2, true) +
      path(
        [
          [500, 150],
          [540, 240],
          [500, 330],
        ],
        '#68d8ee',
        5,
      ) +
      arrow(540, 240, 80 * Math.sign(state[1]!), 0, '#cf9cff'),
    '固定正对太阳，包含1/r²光压与太阳引力；没有公转离心项、转向或地球逃逸。达到r<0.5AU或|v|>0.01c即停止。本模式不使用局部台倾角，热平衡请回局部测力台。',
    [curve('径向距离随时间', '天', 'AU', trace)],
    stopped ? 'boundary' : 'valid',
  );
}
export function blackholeRay(impact: number) {
  let s = [1 / 80, Math.sqrt(Math.max(0, 1 / impact ** 2 - 1 / 80 ** 2 + 2 / 80 ** 3))],
    phi = 0,
    captured = false,
    escaped = false;
  const pts: [number, number][] = [];
  for (let i = 0; i < 18000; i++) {
    const r = 1 / s[0]!;
    if (i % 8 === 0) pts.push([r * Math.cos(phi), r * Math.sin(phi)]);
    if (r <= 2.001) {
      captured = true;
      break;
    }
    if (i > 20 && r > 80 && s[1]! < 0) {
      escaped = true;
      break;
    }
    s = rk4(s, 0.001, (a) => [a[1]!, 3 * a[0]! ** 2 - a[0]!]);
    phi += 0.001;
  }
  return { pts, captured, escaped, phi };
}
const rayCache = new Map<number, ReturnType<typeof blackholeRay>>();
export function blackhole(p: Inputs) {
  const b = p.impact!;
  let r = rayCache.get(b);
  if (!r) {
    r = blackholeRay(b);
    rayCache.set(b, r);
  }
  const critical = 3 * Math.sqrt(3),
    sc = 13,
    draw =
      sky('Schwarzschild零测地线 · 长度单位GM/c²') +
      circle(400, 240, 2 * sc, '#030711') +
      circle(400, 240, 3 * sc, '#ffd98a', false) +
      circle(400, 240, critical * sc, '#cf9cff', false) +
      path(
        r.pts.map(([x, y]) => [400 + x * sc, 240 - y * sc]),
        '#68d8ee',
        3,
      ) +
      label(
        40,
        420,
        r.captured ? '光线进入视界：捕获' : r.escaped ? '光线弯折后逃逸' : '临界轨道积分达上限',
        '#68d8ee',
      );
  return obs(
    [
      m('impact', '所选光线冲量参数', b, 'GM/c²'),
      m('critical', '临界冲量参数', critical, 'GM/c²'),
      m('horizon', '事件视界半径', 2, 'GM/c²'),
      m('photon', '光子球半径', 3, 'GM/c²'),
      m('capture', '是否捕获', r.captured ? 1 : 0, ''),
      m('angle', '有限起止半径累计轨道角', r.phi, 'rad'),
    ],
    draw,
    '非旋转、无电荷、静态黑洞；积分u″+u=3u²，起止r=80M。紫圈为远方观察者临界冲量参数尺度，并非物质表面；光子球3M与阴影尺度3√3M不同。未计算旋转黑洞、吸积盘辐射转移或EHT真实图像。',
    [curve('光轨道', 'GM/c²', 'GM/c²', r.pts)],
    r.captured ? 'boundary' : 'valid',
    [
      { type: 'sphere', points: [[0, 0, 0]], radius: 2, color: '#030711' },
      ...[3, critical].map((radius) => ({
        type: 'line' as const,
        points: Array.from(
          { length: 129 },
          (_, i) =>
            [radius * Math.cos((i * Math.PI) / 64), 0, radius * Math.sin((i * Math.PI) / 64)] as [
              number,
              number,
              number,
            ],
        ),
        color: radius === 3 ? '#ffd98a' : '#cf9cff',
      })),
      { type: 'line', points: r.pts.map(([x, y]) => [x, 0, y]), color: '#68d8ee' },
    ],
  );
}
export function tides(p: Inputs) {
  const M = p.mass! * SOLAR,
    R = p.radius! * 1e3,
    r = p.distance! * 1e6,
    density = p.density! * 1000,
    tidal = (2 * G * M * R) / r ** 3,
    self = (4 * Math.PI * G * density * R) / 3,
    ratio = tidal / self,
    roche = 2.44 * ((3 * M) / (4 * Math.PI * density)) ** (1 / 3),
    apparatus = tidalApparatus(p, ratio, roche / 1e6);
  return obs(
    [
      m('tidal', '中心至近侧潮汐加速度近似', tidal, 'm/s²'),
      m('self', '表面自引力', self, 'm/s²'),
      m('ratio', '潮汐/自引力', ratio, ''),
      m('roche', '流体Roche极限', roche / 1e6, '千km'),
      m('distance', '当前中心距离', r / 1e6, '千km'),
    ],
    apparatus.drawing,
    '均质球体、R≪r的牛顿潮汐近似；Roche系数2.44适用流体、圆轨道等假设，刚性/材料强度另论。金箭头是相对质心的径向拉伸，紫箭头是自引力约束；位置和箭长为对数示意，半径放大。本页不求解真实形变、碎裂或公转轨迹。局部潮汐/自引力比=1不等于流体Roche极限。密度高不能推出无限强度；小说水滴材料并无已验证实现。',
    [curve('潮汐 / 自引力随距离变化', '千km', '比值', sample(100, 2000, 121, d => (2 * G * M * R / (d * 1e6) ** 3) / self), '#ffd98a')],
    R / r > 0.01 ? 'boundary' : 'valid',
    apparatus.solids,
  );
}
export function radio(p: Inputs) {
  const d = p.distance! * 9.4607304725808e15,
    lambda = LIGHT / (p.frequency! * 1e9),
    loss = 20 * Math.log10((4 * Math.PI * d) / lambda),
    received = 10 * Math.log10(p.power!) + p.txgain! + p.rxgain! - loss,
    noise = 10 * Math.log10(1.380649e-23 * 20 * p.bandwidth!),
    snr = received - noise,
    draw =
      sky('自由空间链路预算 · 发射端→接收端') +
      path(
        [
          [130, 140],
          [130, 330],
          [250, 235],
        ],
        '#ffd98a',
        3,
      ) +
      path(
        [
          [670, 140],
          [670, 330],
          [550, 235],
        ],
        '#68d8ee',
        3,
      ) +
      [300, 370, 440, 510].map((x) => circle(x, 235, 8 + 40 / (1 + Math.exp(-snr / 20)), '#68d8ee', false)).join('') +
      label(270, 380, `传播损耗 ${loss.toFixed(1)} dB`, '#68d8ee');
  return obs(
    [
      m('loss', '自由空间路径损耗', loss, 'dB'),
      m('received', '接收功率', received, 'dBW'),
      m('noise', '20K系统噪声功率', noise, 'dBW'),
      m('snr', '带内信噪比', snr, 'dB'),
      m('capacity', 'Shannon理想容量', p.bandwidth! * Math.log2(1 + 10 ** (snr / 10)), 'bit/s'),
    ],
    draw,
    '波环大小仅示意带内信噪比，不代表波长或真实波前大小。远场Friis、各向同性参考增益、固定20K系统噪声；忽略指向损失、星际介质与编码细节。太阳引力透镜有严格几何和观测限制，不等于任意频段的小说式广播放大器。',
    [
      curve(
        '距离与接收功率',
        '光年',
        'dBW',
        sample(
          0.1,
          10,
          80,
          (x) =>
            10 * Math.log10(p.power!) +
            p.txgain! +
            p.rxgain! -
            20 * Math.log10((4 * Math.PI * x * 9.4607304725808e15) / lambda),
        ),
      ),
    ],
  );
}
export function chirpValues(m1: number, m2: number, f: number) {
  const total = (m1 + m2) * SOLAR,
    mc = ((m1 * m2) ** 0.6 / (m1 + m2) ** 0.2) * SOLAR,
    isco = LIGHT ** 3 / (6 ** 1.5 * Math.PI * G * total),
    fdot = (96 / 5) * Math.PI ** (8 / 3) * ((G * mc) / LIGHT ** 3) ** (5 / 3) * f ** (11 / 3),
    remaining = (5 / 256) * ((G * mc) / LIGHT ** 3) ** (-5 / 3) * (Math.PI * f) ** (-8 / 3);
  return { mc, isco, fdot, remaining };
}
export function chirp(p: Inputs) {
  const r = chirpValues(p.m1!, p.m2!, p.frequency!),
    phaseTime = Math.min(p.time!, r.remaining * (1 - (p.frequency! / r.isco) ** (8 / 3))),
    instant = p.frequency! * Math.max(1e-12, 1 - Math.max(0, phaseTime) / r.remaining) ** (-3 / 8),
    orbitPhase =
      ((Math.PI * p.frequency! * r.remaining * 8) / 5) *
      (1 - Math.max(0, 1 - Math.max(0, phaseTime) / r.remaining) ** (5 / 8)),
    separation = 3 * (p.frequency! / instant) ** (2 / 3),
    valid = p.frequency! < r.isco,
    amp =
      (4 * (G * r.mc) ** (5 / 3) * (Math.PI * instant) ** (2 / 3)) /
      (LIGHT ** 4 * p.distance! * 3.085677581491367e22),
    tmax = Math.min(r.remaining * 0.8, 2),
    points = sample(0, tmax, 1000, (t) => {
      const f = p.frequency! * (1 - t / r.remaining) ** (-3 / 8);
      if (f >= r.isco) return NaN;
      const phase =
        ((2 * Math.PI * p.frequency! * r.remaining * 8) / 5) *
        (1 - (1 - t / r.remaining) ** (5 / 8));
      return (f / p.frequency!) ** (2 / 3) * Math.cos(phase);
    }),
    draw =
      sky('最低阶后牛顿旋近 · 强场截止前的啁啾') +
      path(
        points
          .filter((a) => Number.isFinite(a[1]))
          .map(([x, y]) => [80 + (x / tmax) * 640, 240 - y * 90]),
        '#68d8ee',
        2,
      ) +
      label(40, 420, '幅度归一化；不生成合并与铃振段', '#68d8ee');
  return obs(
    [
      m('current_frequency', '当前波频率', valid ? instant : null, 'Hz'),
      m('chirp_mass', '啁啾质量', r.mc / SOLAR, '太阳质量'),
      m(
        'frequency_rate',
        '瞬时频率增长率',
        valid ? chirpValues(p.m1!, p.m2!, instant).fdot : null,
        'Hz/s',
      ),
      m('arm_difference', '4km臂最大差分长度', valid ? amp * 4000 : null, 'm'),
      m('strain', '最佳朝向应变振幅', valid ? amp : null, ''),
      m('isco', 'Schwarzschild ISCO截止频率', r.isco, 'Hz'),
      m(
        'remaining',
        '形式外推至无限频率时间',
        valid ? Math.max(0, r.remaining - phaseTime) : null,
        's',
      ),
    ],
    draw,
    '圆形无自旋双星最低阶旋近，距离为欧氏光度近似，忽略红移；ISCO即截止。外推时间不是精确合并时刻。真实GW150914需数值相对论模板，不绘制虚构合并段。三维双星间距依f^(−2/3)缩小，半径与间距为显示比例；相位由频率积分。',
    [curve('归一化旋近波形', 's', 'h/h₀', points)],
    valid ? 'valid' : 'boundary',
    [
      {
        type: 'sphere',
        points: [
          [
            (-p.m2! / (p.m1! + p.m2!)) * separation * Math.cos(orbitPhase),
            0,
            (-p.m2! / (p.m1! + p.m2!)) * separation * Math.sin(orbitPhase),
          ],
        ],
        radius: 0.3,
        color: '#ffd98a',
      },
      {
        type: 'sphere',
        points: [
          [
            (p.m1! / (p.m1! + p.m2!)) * separation * Math.cos(orbitPhase),
            0,
            (p.m1! / (p.m1! + p.m2!)) * separation * Math.sin(orbitPhase),
          ],
        ],
        radius: 0.3,
        color: '#68d8ee',
      },
    ],
  );
}
export function planck(nu: number, T: number) {
  const h = 6.62607015e-34,
    k = 1.380649e-23;
  return (2 * h * nu ** 3) / LIGHT ** 2 / Math.expm1((h * nu) / (k * T));
}
export function cmb(p: Inputs) {
  const random = rng(p.seed!),
    pixels: { x: number; y: number; value: number }[] = [];
  let square = 0;
  for (let j = 0; j < 18; j++)
    for (let i = 0; i < 36; i++) {
      const lon = (2 * Math.PI * i) / 36,
        lat = Math.PI * (j / 17 - 0.5),
        anis =
          60 * Math.cos(3 * lon) * Math.cos(2 * lat) + 25 * Math.sin(7 * lon) * Math.cos(5 * lat),
        foreground =
          p.foreground! * 120 * Math.exp((-lat * lat) / 0.06) * (1 + 0.3 * Math.cos(lon)),
        noise = p.noise! * gaussian(random),
        v = anis + foreground + noise;
      square += v * v;
      pixels.push({ x: i, y: j, value: v });
    }
  const draw =
    sky('合成全天图 · 非Planck观测数据 · μK色差放大') +
    pixels
      .map((q) => {
        const t = clamp((q.value + 180) / 360, 0, 1),
          color = `rgb(${Math.round(50 + 205 * t)},${Math.round(110 + 60 * (1 - Math.abs(t - 0.5) * 2))},${Math.round(230 - 180 * t)})`;
        return rect(76 + q.x * 18, 80 + q.y * 18, 18, 18, color).replace(
          'fill-opacity=".17"',
          'fill-opacity="1"',
        );
      })
      .join('');
  return obs(
    [
      m('temperature', '背景黑体温度', 2.725, 'K'),
      m('rms', '合成图RMS', Math.sqrt(square / pixels.length), 'μK'),
      m('intensity', '选定频率黑体谱辐亮度', planck(p.frequency! * 1e9, 2.725), 'W/(m²·sr·Hz)'),
      m('frequency', '观察频率', p.frequency!, 'GHz'),
    ],
    draw,
    '固定种子、指定平滑各向异性+银河带前景+独立高斯仪器噪声；二维等经纬图非等面积，不从该RMS推断宇宙参数。黑体谱按Planck定律计算；小说“宇宙闪烁”没有对应的已证实操控机制。',
    [
      curve(
        '2.725K黑体谱',
        'GHz',
        'W/(m²·sr·Hz)',
        sample(1, 600, 160, (f) => planck(f * 1e9, 2.725)),
      ),
    ],
  );
}
export const cosmosModels: Model[] = [
  {
    id: 'C01',
    solve: threeSuns,
    spatial: true,
    controls: [
      c('mass', '第二恒星质量', '归一化', 0.5, 2, 0.1, 1),
      c('planet', '固定探针位置x', 'AU映射', 2, 5, 0.1, 3),
      c('albedo', '反照率', '', 0, 0.8, 0.05, 0.3),
      c('time', '积分时间', '归一化', 0, 5, 0.01, 0),
    ],
    time: { key: 'time', max: 5, rate: 0.2 },
  },
  {
    id: 'C02',
    solve: lagrange,
    spatial: true,
    controls: [
      c('frame', '观察坐标系', '', 0, 1, 1, 0, [
        [0, '共转坐标系'],
        [1, '惯性坐标系'],
      ]),
      c('point', '平衡点', '', 0, 2, 1, 0, [
        [0, 'L4'],
        [1, 'L1'],
        [2, 'L2'],
      ]),
      c('ratio', '小主星质量占比μ', '', 0.001, 0.2, 0.001, 0.01),
      c('offset', 'L4横向扰动', '', 0, 0.1, 0.005, 0.01),
      c('time', '共转积分时间', '', 0, 20, 0.05, 0),
    ],
    time: { key: 'time', max: 20, rate: 1 },
  },
  {
    id: 'C03',
    solve: lightCone,
    controls: [
      c('distance', '初始距离', '光年', 1, 10, 0.1, 4),
      c('speed', '目的地速度', 'c', -0.5, 0.8, 0.05, 0),
      c('wait', '对方等待（地球系）', '年', 0, 5, 0.1, 0),
      c('time', '发送后时间', '年', 0, 130, 0.1, 0),
    ],
    time: { key: 'time', max: 130, rate: 4 },
  },
  {
    id: 'C04',
    solve: clocks,
    controls: [
      c('speed', '巡航速度', 'c', 0.05, 0.99, 0.01, 0.8),
      c('distance', '地球系单程距离', '光年', 1, 10, 0.5, 4),
    ],
  },
  {
    id: 'C05',
    solve: sail,
    controls: [
      c('mode', '研究模式', '', 0, 1, 1, 0, [
        [0, '局部光压台'],
        [1, '径向理想航行'],
      ]),
      c('area', '帆面积', 'm²', 1, 100, 1, 10),
      c('mass', '总质量', 'kg', 0.1, 10, 0.1, 1),
      c('reflectivity', '镜面反射率', '', 0, 1, 0.05, 1),
      c('angle', '帆法向与光束夹角', '°', 0, 90, 1, 0),
      c('radius', '距太阳', 'AU', 0.5, 5, 0.1, 1),
      c('emissivity', '双面发射率', '', 0, 1, 0.05, 0.8),
      c('days', '恒定光束持续', '天', 0, 30, 0.1, 1),
    ],
  },
  {
    id: 'C06',
    solve: blackhole,
    spatial: true,
    controls: [c('impact', '入射冲量参数b', 'GM/c²', 2, 12, 0.01, 6)],
  },
  {
    id: 'C07',
    solve: tides,
    drag: {key:'distance',axis:'x',min:100,max:2000},
    demonstration: {key:'distance',from:1500,to:250,duration:10,step:100,title:'演示：逐渐靠近',caption:'固定其他条件扫描距离，不是实际下落时间；本页不计算碎裂动力学。'},
    controls: [
      c('mass', '中心天体质量', '太阳质量', 0.1, 10, 0.1, 1),
      c('radius', '小天体半径', 'km', 1, 1000, 1, 100),
      c('density', '小天体密度', 'g/cm³', 0.5, 20, 0.5, 3),
      c('distance', '中心距离', '千km', 100, 2000, 10, 1000),
    ],
  },
  {
    id: 'C08',
    solve: radio,
    controls: [
      c('distance', '传播距离', '光年', 0.1, 10, 0.1, 4),
      c('power', '发射功率', 'W', 100, 1000000, 100, 100000),
      c('frequency', '无线电频率', 'GHz', 0.1, 10, 0.1, 1),
      c('txgain', '发射增益', 'dBi', 0, 100, 1, 70),
      c('rxgain', '接收增益', 'dBi', 0, 100, 1, 70),
      c('bandwidth', '接收带宽', 'Hz', 1, 1000, 1, 10),
    ],
  },
  {
    id: 'C09',
    solve: chirp,
    spatial: true,
    time: { key: 'time', max: 0.1, rate: 0.01 },
    controls: [
      c('m1', '第一质量', '太阳质量', 1, 50, 1, 30),
      c('m2', '第二质量', '太阳质量', 1, 50, 1, 30),
      c('frequency', '起始引力波频率', 'Hz', 10, 200, 1, 20),
      c('distance', '距离', 'Mpc', 10, 1000, 10, 400),
      c('time', '旋近观测时刻', 's', 0, 0.1, 0.001, 0),
    ],
  },
  {
    id: 'C10',
    solve: cmb,
    controls: [
      c('frequency', '频率', 'GHz', 10, 600, 1, 160),
      c('foreground', '前景系数', '', 0, 2, 0.1, 1),
      c('noise', '噪声标准差', 'μK', 0, 100, 5, 20),
      c('seed', '随机种子', '', 1, 999, 1, 42),
    ],
  },
];
