/** All physical values are SI unless the control explicitly labels a normalized unit. */
export type Inputs = Record<string, number>;
export type Vec3 = [number, number, number];
export interface Control {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  options?: [number, string][];
}
export interface Metric {
  key: string;
  label: string;
  value: number | null;
  unit: string;
}
export interface Curve {
  label: string;
  unitX: string;
  unitY: string;
  points: [number, number][];
  color?: string;
  probe?: number;
}
export interface Solid {
  type: 'sphere' | 'line' | 'polygon' | 'label' | 'tube';
  points: Vec3[];
  radius?: number;
  color?: string;
  opacity?: number;
  label?: string;
  scale?: Vec3;
  handle?: string;
  role?: 'apparatus' | 'instrument';
}
export interface Observation {
  metrics: Metric[];
  status: 'valid' | 'boundary' | 'invalid';
  note: string;
  curves: Curve[];
  drawing: string;
  solids?: Solid[];
}
export interface Model {
  id: string;
  controls: Control[];
  solve: (p: Inputs) => Observation;
  time?: { key: string; max: number; rate: number; loop?: boolean; rateAt?: (p: Inputs) => number; caption?: string };
  spatial?: boolean;
  drag?: { key: string; axis: 'x' | 'angle'; min: number; max: number };
  demonstration?: { key: string; from: number; to: number; duration: number; step: number; title: string; caption: string };
}
export const control = (
  key: string,
  label: string,
  unit: string,
  min: number,
  max: number,
  step: number,
  value: number,
  options?: [number, string][],
): Control => ({ key, label, unit, min, max, step, value, options });
export const metric = (key: string, label: string, value: number | null, unit = ''): Metric => ({
  key,
  label,
  value: Number.isFinite(value) ? value : null,
  unit,
});
export const defaults = (m: Model): Inputs =>
  Object.fromEntries(m.controls.map((c) => [c.key, c.value]));
export function validate(m: Model, p: Inputs) {
  for (const key of Object.keys(p))
    if (!m.controls.some((c) => c.key === key)) throw new RangeError(`Unknown ${m.id}.${key}`);
  for (const c of m.controls) {
    const v = p[c.key];
    if (
      !Number.isFinite(v) ||
      v < c.min - 1e-9 ||
      v > c.max + 1e-9 ||
      (c.options && !c.options.some((o) => o[0] === v))
    )
      throw new RangeError(`Invalid ${m.id}.${c.key}`);
  }
}
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rad = (v: number) => (v * Math.PI) / 180;
export const sample = (
  a: number,
  b: number,
  n: number,
  f: (x: number) => number,
): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const x = a + ((b - a) * i) / (n - 1);
    return [x, f(x)];
  });
export const curve = (
  label: string,
  unitX: string,
  unitY: string,
  points: [number, number][],
  color?: string,
): Curve => ({ label, unitX, unitY, points, color });
export const escape = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export const colors = {
  ink: '#234359',
  teal: '#16847a',
  gold: '#c38b28',
  purple: '#8666b3',
  red: '#c85b46',
  blue: '#408ec8',
};
export const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = colors.ink,
  width = 3,
  dash = false,
) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="7 6"' : ''}/>`;
export const path = (pts: [number, number][], color = colors.teal, width = 3, closed = false) =>
  `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')}${closed ? 'Z' : ''}" fill="${closed ? color : 'none'}" ${closed ? 'fill-opacity=".14"' : ''} stroke="${color}" stroke-width="${width}"/>`;
export const circle = (x: number, y: number, r: number, color = colors.teal, fill = true) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill ? color : 'none'}" stroke="${color}" stroke-width="2"/>`;
export const rect = (x: number, y: number, w: number, h: number, color = colors.teal) =>
  `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="4" fill="${color}" fill-opacity=".17" stroke="${color}" stroke-width="2"/>`;
export const label = (x: number, y: number, text: string, color = colors.ink, size = 18) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" class="dis-diagram-label">${escape(text)}</text>`;
export const arrow = (x: number, y: number, dx: number, dy: number, color = colors.gold) => {
  const a = Math.atan2(dy, dx),
    end = [x + dx, y + dy];
  return (
    line(x, y, end[0]!, end[1]!, color, 3) +
    path(
      [
        [end[0]! - 12 * Math.cos(a - 0.45), end[1]! - 12 * Math.sin(a - 0.45)],
        [end[0]!, end[1]!],
        [end[0]! - 12 * Math.cos(a + 0.45), end[1]! - 12 * Math.sin(a + 0.45)],
      ],
      color,
      3,
    )
  );
};
export const obs = (
  metrics: Metric[],
  drawing: string,
  note: string,
  curves: Curve[] = [],
  status: Observation['status'] = 'valid',
  solids?: Solid[],
): Observation => ({ metrics, drawing, note, curves, status, solids });
export function rng(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return (x + 0.5) / 4294967296;
  };
}
export const gaussian = (random: () => number) =>
  Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
export function solveModel(m: Model, p: Inputs) {
  validate(m, p);
  const o = m.solve(p);
  for (const q of o.metrics)
    if (q.value !== null && !Number.isFinite(q.value))
      throw new Error(`Nonfinite ${m.id}.${q.key}`);
  return o;
}
export const format = (n: number | null) =>
  n === null
    ? '未定义'
    : n === 0
      ? '0'
      : Math.abs(n) >= 1e5 || Math.abs(n) < 0.001
        ? n.toExponential(3)
        : Number(n.toFixed(4)).toString();
export interface Snapshot {
  version: 'discovery-v1';
  id: string;
  inputs: Inputs;
}
export function csv(m: Model, states: Snapshot[]) {
  const observations=states.map(s=>{
    if(s.id!==m.id||s.version!=='discovery-v1')throw new Error('Incompatible snapshot');
    return solveModel(m,{...defaults(m),...s.inputs});
  });
  const keys = m.controls.map((c) => c.key),
    metrics = [...new Map([...m.solve(defaults(m)).metrics,...observations.flatMap(o=>o.metrics)].map(q=>[q.key,q])).values()];
  return [
    [
      'model',
      'experiment',
      ...m.controls.map((c) => `${c.key} (${c.unit || '1'})`),
      ...metrics.map((q) => `${q.key} (${q.unit || '1'})`),
      'status',
      'model_note',
    ].join(','),
    ...states.map((s,i) => {
      const o = observations[i]!;
      return [
        s.version,
        s.id,
        ...keys.map((k) => s.inputs[k]??defaults(m)[k]),
        ...metrics.map((q) => o.metrics.find((r) => r.key === q.key)?.value ?? ''),
        o.status,
        `"${o.note.replaceAll('"', '""')}"`,
      ].join(',');
    }),
  ].join('\r\n');
}
