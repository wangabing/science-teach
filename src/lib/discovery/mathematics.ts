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
  rng,
  type Model,
  type Inputs,
  type Vec3,
  type Solid,
} from './core.ts';
type Cell = [number, number];
const key = (a: Cell[]) => {
  const x = Math.min(...a.map((p) => p[0])),
    y = Math.min(...a.map((p) => p[1]));
  return a
    .map((p) => [p[0] - x, p[1] - y])
    .sort((a, b) => a[0]! - b[0]! || a[1]! - b[1]!)
    .map((p) => p.join(','))
    .join(';');
};
function canonical(a: Cell[]) {
  return Array.from({ length: 8 }, (_, k) =>
    key(
      a.map(([x, y]) => {
        if (k >= 4) x = -x;
        for (let i = 0; i < k % 4; i++) [x, y] = [-y, x];
        return [x, y];
      }),
    ),
  ).sort()[0]!;
}
export function polyominoes(n = 6): Cell[][] {
  let set = new Map<string, Cell[]>([['0,0', [[0, 0]]]]);
  for (let size = 1; size < n; size++) {
    const next = new Map<string, Cell[]>();
    for (const a of set.values())
      for (const [x, y] of a)
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const p: Cell = [x + dx!, y + dy!];
          if (a.some((q) => q[0] === p[0] && q[1] === p[1])) continue;
          const b = [...a, p],
            k = canonical(b);
          if (!next.has(k))
            next.set(
              k,
              k.split(';').map((s) => s.split(',').map(Number) as Cell),
            );
        }
    set = next;
  }
  return [...set.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}
const add = (a: Vec3, b: Vec3): Vec3 => a.map((x, i) => x + b[i]!) as Vec3,
  scale = (a: Vec3, s: number): Vec3 => a.map((x) => x * s) as Vec3,
  dot = (a: Vec3, b: Vec3) => a.reduce((v, x, i) => v + x * b[i]!, 0),
  cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
const rotate = (v: Vec3, axis: Vec3, t: number) =>
  add(
    add(scale(v, Math.cos(t)), scale(cross(axis, v), Math.sin(t))),
    scale(axis, dot(axis, v) * (1 - Math.cos(t))),
  );
export const hexominoes = polyominoes();
export function foldNet(cells: Cell[], angle = Math.PI / 2) {
  const frames = new Map<number, { o: Vec3; u: Vec3; v: Vec3; n: Vec3 }>();
  frames.set(0, { o: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, 1] });
  const queue = [0];
  let consistent = true,
    cycles = 0;
  for (let j = 0; j < queue.length; j++) {
    const i = queue[j]!,
      f = frames.get(i)!;
    for (let k = 0; k < cells.length; k++) {
      const dx = cells[k]![0] - cells[i]![0],
        dy = cells[k]![1] - cells[i]![1];
      if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
      const axis = dx ? f.v : f.u,
        t = dx ? -dx * angle : dy * angle,
        u = rotate(f.u, axis, t),
        v = rotate(f.v, axis, t),
        n = cross(u, v),
        o = add(f.o, scale(add(scale(dx ? f.u : f.v, dx || dy), scale(dx ? u : v, dx || dy)), 0.5));
      const old = frames.get(k);
      if (old) {
        if (k !== queue[j - 1]) cycles++;
        if (Math.hypot(...old.o.map((x, z) => x - o[z]!)) > 1e-7 || dot(old.n, n) < 1 - 1e-7)
          consistent = false;
      } else {
        frames.set(k, { o, u, v, n });
        queue.push(k);
      }
    }
  }
  const normals = [...frames.values()].map((f) => f.n.map((x) => Math.round(x)).join(','));
  return {
    frames,
    valid: consistent && frames.size === 6 && new Set(normals).size === 6,
    consistent,
    cycles,
  };
}
export function cubeNet(p: Inputs) {
  const cells = hexominoes[p.net!]!,
    result = foldNet(cells),
    current = foldNet(cells, rad(p.fold!)),
    solids: Solid[] = [...current.frames.entries()]
      .sort(([a], [b]) => a - b)
      .map(([i, f]) => ({
        type: 'polygon',
        points: [
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ].map(([x, y]) => add(f.o, add(scale(f.u, x!), scale(f.v, y!)))),
        color: [colors.teal, colors.gold, colors.blue, colors.purple, colors.red, colors.ink][i],
        opacity: 0.65,
        label: String(i + 1),
      }));
  const max = Math.max(...cells.flat()),
    s = 260 / (max + 1);
  let drawing = cells
    .map(
      ([x, y], i) =>
        rect(
          60 + x * s,
          90 + y * s,
          s - 3,
          s - 3,
          [colors.teal, colors.gold, colors.blue, colors.purple, colors.red, colors.ink][i],
        ) + label(70 + x * s, 115 + y * s, String(i + 1)),
    )
    .join('');
  const project = (v: Vec3): [number, number] => [
      v[0] * 0.8 + v[2] * 0.6,
      -v[1] * 0.8 + v[2] * 0.35,
    ],
    projected = solids.flatMap((s) => s.points.map(project)),
    xmin = Math.min(...projected.map((p) => p[0])),
    xmax = Math.max(...projected.map((p) => p[0])),
    ymin = Math.min(...projected.map((p) => p[1])),
    ymax = Math.max(...projected.map((p) => p[1])),
    sc = Math.min(250 / (xmax - xmin || 1), 260 / (ymax - ymin || 1)),
    toScreen = (v: Vec3): [number, number] => {
      const [x, y] = project(v);
      return [570 + (x - (xmin + xmax) / 2) * sc, 250 + (y - (ymin + ymax) / 2) * sc];
    };
  drawing +=
    line(380, 85, 380, 405, colors.ink, 1, true) +
    solids
      .map(
        (s) =>
          path(s.points.map(toScreen), s.color, 2, true) +
          label(
            ...toScreen(scale(s.points.reduce(add, [0, 0, 0]), 0.25)),
            s.label!,
            colors.ink,
            22,
          ),
      )
      .join('');
  drawing += label(40, 40, `六连方 ${p.net! + 1}/35 · 左：面号 · 右：刚体折叠${p.fold}°`);
  return obs(
    [
      m('valid', '完全折起能否组成正方体', result.valid ? 1 : 0, ''),
      m('faces', '面数', 6, ''),
      m(
        'normals',
        '完全折起不同朝向数',
        new Set([...result.frames.values()].map((f) => f.n.map(Math.round).join(','))).size,
        '',
      ),
      m('all_nets', '35种六连方中有效网数', hexominoes.filter((a) => foldNet(a).valid).length, ''),
    ],
    drawing,
    '每面绕公共棱做刚体90°铰链变换；判据校验环路位置一致与六个不同面朝向。中途动画不进行连续碰撞检测，不能把穿插示意当作无碰撞折法证明。',
    [],
    result.valid ? 'valid' : 'boundary',
    solids,
  );
}
export function cavalieri(p: Inputs) {
  const z = Math.min(p.slice!, p.height!),
    r = p.radius!,
    h = p.height!,
    offset = (p.shear! * z) / h,
    area = Math.PI * r * r,
    solids: Solid[] = [];
  for (let i = 0; i <= 12; i++) {
    const y = (h * i) / 12;
    for (const side of [-1, 1])
      solids.push({
        type: 'line',
        points: Array.from({ length: 49 }, (_, j) => {
          const a = (j * Math.PI) / 24;
          return [
            side * 2 * r + (side === 1 ? (p.shear! * y) / h : 0) + r * Math.cos(a),
            y,
            r * Math.sin(a),
          ] as Vec3;
        }),
        color: colors.teal,
      });
  }
  for(const side of [-1,1])solids.push({type:'polygon',color:colors.gold,opacity:.65,points:Array.from({length:48},(_,j)=>{const a=j*Math.PI/24;return [side*2*r+(side===1?offset:0)+r*Math.cos(a),z,r*Math.sin(a)] as Vec3;})});
  const draw =
    rect(100, 90, 180, 280) +
    path(
      [
        [440, 370],
        [620, 370],
        [620 + p.shear! * 40, 90],
        [440 + p.shear! * 40, 90],
      ],
      colors.teal,
      3,
      true,
    ) +
    line(80, 370 - (z / h) * 280, 730, 370 - (z / h) * 280, colors.gold, 5) +
    label(45, 45, '每一高度的水平截面相同 · 斜移不改变截面积');
  return obs(
    [
      m('slice_height', '当前切片高度', z, 'm'),
      m('area', '两体截面积', area, 'm²'),
      m('volume', '两体体积', area * h, 'm³'),
      m('offset', '该层横向位移', offset, 'm'),
    ],
    draw,
    '祖暅原理：同高且每一对应高度截面积相等，体积才相等。仅一层截面相等不足以推断体积相等。',
    [
      curve('直柱截面积', 'm', 'm²', [
        [0, area],
        [h, area],
      ]),
      curve(
        '斜柱截面积',
        'm',
        'm²',
        [
          [0, area],
          [h, area],
        ],
        colors.gold,
      ),
    ],
    p.slice! <= h ? 'valid' : 'boundary',
    solids,
  );
}
export function perpendicular(p: Inputs) {
  const v: Vec3 = [p.x!, p.y!, p.z!],
    length = Math.hypot(...v),
    angle = length ? (Math.acos(Math.abs(p.z!) / length) * 180) / Math.PI : null,
    solids: Solid[] = [
      {
        type: 'polygon',
        points: [
          [-2, -2, 0],
          [2, -2, 0],
          [2, 2, 0],
          [-2, 2, 0],
        ],
        color: colors.teal,
        opacity: 0.2,
      },
      { type: 'line', points: [[0, 0, 0], v], color: colors.gold },
      {
        type: 'line',
        points: [
          [-2, 0, 0],
          [2, 0, 0],
        ],
        color: colors.red,
      },
      {
        type: 'line',
        points: [
          [0, -2, 0],
          [0, 2, 0],
        ],
        color: colors.blue,
      },
    ];
  return obs(
    [
      m('dot_x', '与平面第一方向点积', p.x!, ''),
      m('dot_y', '与平面第二方向点积', p.y!, ''),
      m('normal_angle', '与法向夹角', angle, '°'),
      m(
        'perpendicular',
        '是否垂直平面',
        length && Math.abs(p.x!) + Math.abs(p.y!) < 1e-8 ? 1 : 0,
        '',
      ),
    ],
    path(
      [
        [140, 300],
        [420, 380],
        [670, 180],
        [390, 100],
      ],
      colors.teal,
      3,
      true,
    ) +
      arrow(400, 260, p.x! * 50 + p.y! * 30, -p.z! * 60 + p.y! * 20) +
      label(40, 45, '平面z=0 · 红蓝方向不共线 · 旋转视角验证'),
    '对平面内两条相交直线均垂直才可判线面垂直；零向量不定义方向。透视图中的直角不是证明。',
    [],
    length ? 'valid' : 'invalid',
    solids,
  );
}
export function conics(p: Inputs) {
  const angle = rad(p.angle!),
    k = Math.tan(rad(30)),
    s = Math.tan(angle),
    den = 1 - k * k * s * s,
    kind = Math.abs(den) < 1e-5 ? '抛物线' : den > 0 ? '椭圆' : '双曲线',
    solids: Solid[] = [];
  for (const sign of [-1, 1])
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      solids.push({
        type: 'line',
        points: [
          [0, 0, 0],
          [k * 3 * Math.cos(a), sign * 3, k * 3 * Math.sin(a)],
        ],
        color: colors.teal,
      });
    }
  solids.push({
    type: 'polygon',
    points: [
      [-2, p.offset! - 2 * s, -2],
      [2, p.offset! + 2 * s, -2],
      [2, p.offset! + 2 * s, 2],
      [-2, p.offset! - 2 * s, 2],
    ],
    color: colors.gold,
    opacity: 0.35,
  });
  const segments: Vec3[][] = [];
  for (const sign of [-1, 1]) {
    let run: Vec3[] = [];
    for (let i = 0; i <= 400; i++) {
      const x = -4 + (8 * i) / 400,
        z = p.offset! + s * x,
        yy = k * k * z * z - x * x;
      if (yy >= 0 && Math.abs(z) <= 3) {
        run.push([x, z, sign * Math.sqrt(yy)]);
      } else if (run.length) {
        segments.push(run);
        run = [];
      }
    }
    if (run.length) segments.push(run);
  }
  for (const a of segments) solids.push({ type: 'line', points: a, color: colors.red });
  const planeCurves = segments.map((a) =>
      a.map(([x, _z, y]) => [x / Math.cos(angle), y] as [number, number]),
    ),
    extent = Math.max(1, ...planeCurves.flat().flat().map(Math.abs)),
    sc = 175 / extent;
  const draw =
    line(100, 240, 700, 240, colors.ink, 1, true) +
    line(400, 70, 400, 410, colors.ink, 1, true) +
    planeCurves
      .map((a) =>
        path(
          a.map(([x, y]) => [400 + x * sc, 240 - y * sc]),
          colors.red,
          3,
        ),
      )
      .join('') +
    label(40, 45, `${kind} · 切平面内正交等距坐标 · 自动缩放`);
  return obs(
    [
      m('eccentricity', '截线离心率', Math.sin(angle) / Math.cos(rad(30)), '正交截面'),
      m('discriminant', '投影二次式系数', den, ''),
      m(
        'sample_points',
        '有限锥内截线点数',
        segments.reduce((n, a) => n + a.length, 0),
        '',
      ),
    ],
    draw,
    '双锥半顶角30°，平面轴截线与水平夹角为β；β<60°椭圆，=60°抛物线，>60°双曲线。图仅绘有限锥，曲线本身可无限延伸。偏置为0时过顶点发生退化。',
    planeCurves.map((pts, i) => curve(`截线分支${i + 1}`, '平面u', '平面v', pts)),
    p.offset! === 0 ? 'boundary' : 'valid',
    solids,
  );
}
export function movingArea(w: number, h: number, s: number) {
  if (s <= w) return 0;
  if (s <= w + h) return (w * (s - w)) / 2;
  if (s <= 2 * w + h) return (w * h) / 2;
  return (w * (2 * (w + h) - s)) / 2;
}
export function movingPoint(p: Inputs) {
  const w = p.width!,
    h = p.height!,
    s = p.distance!,
    per = 2 * (w + h),
    d = Math.min(s, per);
  let x = 0,
    y = 0;
  if (d <= w) x = d;
  else if (d <= w + h) {
    x = w;
    y = d - w;
  } else if (d <= 2 * w + h) {
    x = 2 * w + h - d;
    y = h;
  } else y = per - d;
  const sc = Math.min(400 / Math.max(w, h),310/h),
    a = movingArea(w, h, d);
  return obs(
    [
      m('area', '△ABP面积', a, '平方单位'),
      m('x', 'P横坐标', x, ''),
      m('y', 'P纵坐标', y, ''),
      m('perimeter', '完整路程', per, '长度单位'),
    ],
    rect(170, 360 - h * sc, w * sc, h * sc) +
      path(
        [
          [170, 360],
          [170 + w * sc, 360],
          [170 + x * sc, 360 - y * sc],
        ],
        colors.gold,
        3,
        true,
      ) +
      circle(170 + x * sc, 360 - y * sc, 9, colors.red) +
      label(145, 390, 'A') +
      label(180 + w * sc, 390, 'B') +
      label(40, 40, 'P沿A→B→C→D→A · 面积=底×高÷2'),
    '右边上升段斜率w/2；顶部平台源于高不变。超过当前周长的路程停在A，不继续绕行。图形观察需用面积公式解释。',
    [
      curve(
        '面积—路程',
        '长度单位',
        '平方单位',
        [0, w, w + h, 2 * w + h, per].map((q) => [q, movingArea(w, h, q)]),
      ),
    ],
    s <= per ? 'valid' : 'boundary',
  );
}
export function trig(p: Inputs) {
  const t = rad(p.angle!),
    x = Math.cos(t),
    y = Math.sin(t),
    draw =
      circle(210, 240, 135, colors.ink, false) +
      line(50, 240, 365, 240) +
      line(210, 65, 210, 405) +
      arrow(210, 240, x * 135, -y * 135) +
      circle(210 + x * 135, 240 - y * 135, 8, colors.gold) +
      line(210 + x * 135, 240 - y * 135, 390, 240 - y * 135, colors.gold, 2, true) +
      path(
        sample(0, 720, 240, (a) => Math.sin(rad(a))).map(([a, v]) => [390 + a / 2, 240 - v * 135]),
        colors.teal,
        3,
      ) +
      circle(390 + (p.angle! % 720) / 2, 240 - y * 135, 8, colors.red) +
      label(40, 40, '圆周角→横轴 · 有向纵坐标→正弦');
  return obs(
    [
      m('sin', 'sin θ', y, ''),
      m('cos', 'cos θ', x, ''),
      m('identity', 'sin²θ+cos²θ', x * x + y * y, ''),
      m('radians', '弧度', t, 'rad'),
    ],
    draw,
    '角度以逆时针为正。横轴为角而非弧长时间；只有匀角速度转动时，才对应时间上的简谐信号。',
    [
      curve(
        'sin θ',
        '°',
        '',
        sample(0, 720, 181, (a) => Math.sin(rad(a))),
      ),
      curve(
        'cos θ',
        '°',
        '',
        sample(0, 720, 181, (a) => Math.cos(rad(a))),
        colors.gold,
      ),
    ],
  );
}
export function tangent(p: Inputs) {
  const f = (x: number) => (p.function! === 0 ? x * x : Math.abs(x)),
    x = p.x!,
    h = p.delta!,
    s = h ? (f(x + h) - f(x)) / h : null,
    d = p.function! === 0 ? 2 * x : x === 0 ? null : Math.sign(x),
    draw =
      path(
        sample(-3, 3, 100, f).map(([a, b]) => [400 + a * 85, 370 - b * 32]),
        colors.teal,
        3,
      ) +
      (s !== null
        ? line(
            145,
            370 - (f(x) + s * (-3 - x)) * 32,
            655,
            370 - (f(x) + s * (3 - x)) * 32,
            colors.gold,
          )
        : '') +
      circle(400 + x * 85, 370 - f(x) * 32, 7) +
      circle(400 + (x + h) * 85, 370 - f(x + h) * 32, 7, colors.gold) +
      label(35, 45, '缩短割线 · 注意左右极限');
  return obs(
    [
      m('secant', '割线斜率', s, ''),
      m('derivative', '该点导数', d, ''),
      m('error', '割线与导数差', s !== null && d !== null ? s - d : null, ''),
    ],
    draw,
    'Δx=0时差商未定义。|x|在0处左右斜率分别为−1和1，无唯一切线斜率；放大画面不能替代极限论证。',
    [curve('函数', 'x', 'y', sample(-3, 3, 100, f))],
    h === 0 ? 'invalid' : d === null ? 'boundary' : 'valid',
  );
}
export function galton(p: Inputs) {
  const n = p.rows!,
    N = p.balls!,
    prob = p.probability!,
    random = rng(p.seed!),
    bins = Array(n + 1).fill(0) as number[];
  for (let i = 0; i < N; i++) {
    let k = 0;
    for (let j = 0; j < n; j++) if (random() < prob) k++;
    bins[k]!++;
  }
  const expected = Array.from({ length: n + 1 }, (_, k) => {
    let choose = 1;
    for (let j = 1; j <= k; j++) choose *= (n - j + 1) / j;
    return choose * prob ** k * (1 - prob) ** (n - k) * N;
  });
  let draw = '';
  for (let j = 0; j < n; j++)
    for (let k = 0; k <= j; k++) draw += circle(400 + (k - j / 2) * 32, 65 + j * 17, 3, colors.ink);
  const max = Math.max(...bins, 1);
  bins.forEach(
    (v, k) =>
      (draw += rect(
        170 + (k * 460) / (n + 1),
        390 - (v / max) * 130,
        420 / (n + 1),
        (v / max) * 130,
        colors.gold,
      )),
  );
  draw += label(35, 35, '独立左右选择 · 固定种子重复试验');
  return obs(
    [
      m('mean', '样本落点均值', bins.reduce((s, v, k) => s + k * v, 0) / N, ''),
      m('theory_mean', '理论均值np', n * prob, ''),
      m('variance', '理论方差np(1−p)', n * prob * (1 - prob), ''),
      m(
        'count',
        '总球数',
        bins.reduce((a, b) => a + b, 0),
        '',
      ),
    ],
    draw,
    '二项分布模型假设每层选择独立、向右概率恒定；不是刚体钉板碰撞求解。样本直方图不必每次精确对称。',
    [
      curve(
        '抽样球数',
        '落点',
        '球',
        bins.map((v, k) => [k, v]),
      ),
      curve(
        '二项期望',
        '落点',
        '球',
        expected.map((v, k) => [k, v]),
        colors.gold,
      ),
    ],
  );
}
export function euler(p: Inputs) {
  const n = p.sides!,
    torus = p.surface! === 1,
    vertices: Vec3[] = [],
    solids: Solid[] = [];
  if (!torus) {
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < n; i++)
        vertices.push([
          Math.cos((2 * Math.PI * i) / n),
          j * 2 - 1,
          Math.sin((2 * Math.PI * i) / n),
        ]);
    for (let i = 0; i < n; i++)
      solids.push({
        type: 'polygon',
        points: [
          vertices[i]!,
          vertices[(i + 1) % n]!,
          vertices[((i + 1) % n) + n]!,
          vertices[i + n]!,
        ],
        color: i % 2 ? colors.gold : colors.teal,
        opacity: 0.5,
      });
    solids.push(
      { type: 'polygon', points: vertices.slice(0, n), color: colors.blue },
      { type: 'polygon', points: vertices.slice(n), color: colors.purple },
    );
  } else {
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const point = (u: number, v: number): Vec3 => [
          (1 + 0.35 * Math.cos(v)) * Math.cos(u),
          0.35 * Math.sin(v),
          (1 + 0.35 * Math.cos(v)) * Math.sin(u),
        ];
        solids.push({
          type: 'polygon',
          points: [
            [i, j],
            [i + 1, j],
            [i + 1, j + 1],
            [i, j + 1],
          ].map(([a, b]) => point((2 * Math.PI * a!) / n, (2 * Math.PI * b!) / n)),
          color: (i + j) % 2 ? colors.teal : colors.gold,
          opacity: 0.75,
        });
      }
  }
  const V = torus ? n * n : 2 * n,
    E = torus ? 2 * n * n : 3 * n,
    F = torus ? n * n : n + 2;
  return obs(
    [
      m('vertices', '顶点V', V, ''),
      m('edges', '棱E', E, ''),
      m('faces', '面F', F, ''),
      m('chi', 'V−E+F', V - E + F, ''),
    ],
    solids
      .map((s) =>
        path(
          s.points.map(([x, y, z]) => [400 + x * 150 + z * 50, 240 - y * 110 + z * 35]),
          s.color,
          2,
          true,
        ),
      )
      .join('') + label(40, 45, torus ? '环面周期网格：有一个洞' : '闭合凸棱柱：无洞'),
    '凸多面体欧拉示性数为2；环面为0。环面网格按周期识别顶点与棱，面是四边形曲面片，不把洞口当实体面。',
    [],
    'valid',
    solids,
  );
}
export function packing(p: Inputs) {
  const fcc = p.arrangement! === 1,
    a = fcc ? 2 * Math.sqrt(2) : 2,
    phi = fcc ? Math.PI / (3 * Math.sqrt(2)) : Math.PI / 6,
    solids: Solid[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        for (const b of fcc
          ? [
              [0, 0, 0],
              [0, 0.5, 0.5],
              [0.5, 0, 0.5],
              [0.5, 0.5, 0],
            ]
          : [[0, 0, 0]])
          solids.push({
            type: 'sphere',
            points: [[(i + b[0]! - 1) * a, (j + b[1]! - 1) * a, (k + b[2]! - 1) * a]],
            radius: 1,
            color: (i + j + k) % 2 ? colors.teal : colors.gold,
            opacity: 0.75,
          });
  return obs(
    [
      m('fraction', '无限周期体积分数', phi, ''),
      m('void', '空隙率', 1 - phi, ''),
      m('cell', '常规单胞边长/球半径', a, ''),
      m('per_cell', '单胞等效球数', fcc ? 4 : 1, ''),
    ],
    solids
      .slice(0, 36)
      .map((s) => {
        const [x, y, z] = s.points[0]!;
        return circle(390 + x * 38 + z * 20, 260 - y * 38 + z * 12, 28, s.color, false);
      })
      .join('') + label(35, 45, '周期晶格 · 三维球的遮挡不等于相交'),
    '等半径硬球；简单立方π/6，面心立方π/(3√2)。这是无限周期单胞比，不把有限容器边界和颗粒压实率混为一谈。',
    [],
    'valid',
    solids,
  );
}
export const mathModels: Model[] = [
  {
    id: 'M01',
    solve: cubeNet,
    spatial: true,
    controls: [c('net', '六连方编号', '', 0, 34, 1, 18), c('fold', '折叠角', '°', 0, 90, 1, 0)],
    time: { key: 'fold', max: 90, rate: 15 },
  },
  {
    id: 'M02',
    solve: cavalieri,
    spatial: true,
    controls: [
      c('radius', '柱半径', 'm', 0.5, 1.5, 0.1, 1),
      c('height', '柱高', 'm', 2, 4, 0.1, 3),
      c('shear', '顶部侧移', 'm', 0, 2, 0.1, 1),
      c('slice', '切片高度', 'm', 0, 4, 0.05, 1),
    ],
  },
  {
    id: 'M03',
    solve: perpendicular,
    spatial: true,
    controls: [
      c('x', '方向x', '', -2, 2, 0.1, 0),
      c('y', '方向y', '', -2, 2, 0.1, 1),
      c('z', '方向z', '', -2, 2, 0.1, 2),
    ],
  },
  {
    id: 'M04',
    solve: conics,
    spatial: true,
    controls: [
      c('angle', '平面倾角', '°', 0, 80, 1, 30),
      c('offset', '轴向截距', '', 0, 1.5, 0.1, 0.8),
    ],
  },
  {
    id: 'M05',
    solve: movingPoint,
    controls: [
      c('width', '矩形宽', '', 2, 5, 0.5, 4),
      c('height', '矩形高', '', 2, 4, 0.5, 3),
      c('distance', 'P累计路程', '', 0, 18, 0.1, 5),
    ],
    time: { key: 'distance', max: 18, rate: 1 },
    drag: { key: 'distance', axis: 'x', min: 0, max: 14 },
  },
  {
    id: 'M06',
    solve: trig,
    controls: [c('angle', '有向角', '°', 0, 720, 1, 45)],
    time: { key: 'angle', max: 720, rate: 45 },
    drag: { key: 'angle', axis: 'angle', min: 0, max: 720 },
  },
  {
    id: 'M07',
    solve: tangent,
    controls: [
      c('function', '函数', '', 0, 1, 1, 0, [
        [0, 'y=x²'],
        [1, 'y=|x|'],
      ]),
      c('x', '观察点x', '', -2, 2, 0.1, 0),
      c('delta', '割线横向间隔Δx', '', -1, 1, 0.01, 0.5),
    ],
  },
  {
    id: 'M08',
    solve: galton,
    controls: [
      c('rows', '层数', '', 4, 12, 1, 8),
      c('balls', '小球数', '', 100, 3000, 100, 500),
      c('probability', '向右概率', '', 0.1, 0.9, 0.05, 0.5),
      c('seed', '随机种子', '', 1, 999, 1, 42),
    ],
  },
  {
    id: 'M09',
    solve: euler,
    spatial: true,
    controls: [
      c('surface', '表面类型', '', 0, 1, 1, 0, [
        [0, '凸棱柱'],
        [1, '环面网格'],
      ]),
      c('sides', '边数/周期划分', '', 3, 10, 1, 6),
    ],
  },
  {
    id: 'M10',
    solve: packing,
    spatial: true,
    controls: [
      c('arrangement', '堆积方式', '', 0, 1, 1, 0, [
        [0, '简单立方'],
        [1, '面心立方'],
      ]),
    ],
  },
];
