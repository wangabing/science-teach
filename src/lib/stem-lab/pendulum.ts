export interface PendulumParams { length: number; mass: number; gravity: number; damping: number; angle: number }
export const DEFAULT_PENDULUM: PendulumParams = { length: 1.5, mass: 1, gravity: 9.81, damping: 0, angle: 35 };
export const STEP = 1 / 240;
const bound = (v: number, min: number, max: number, fallback: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : fallback));
export function sanitizeParams(p: PendulumParams): PendulumParams {
  return { length: bound(p.length, .6, 2.4, 1.5), mass: bound(p.mass, .2, 3, 1), gravity: bound(p.gravity, 1.62, 24.79, 9.81), damping: bound(p.damping, 0, .6, 0), angle: bound(p.angle, -70, 70, 35) };
}
export function theoreticalPeriod(p: PendulumParams) {
  // Complete elliptic integral K(sin(theta0/2)), Simpson quadrature.
  const k = Math.sin(Math.abs(p.angle) * Math.PI / 360);
  const n = 128, h = Math.PI / 2 / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const f = 1 / Math.sqrt(1 - k * k * Math.sin(i * h) ** 2);
    sum += f * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
  }
  return 4 * Math.sqrt(p.length / p.gravity) * sum * h / 3;
}
export class Pendulum {
  params: PendulumParams;
  theta = 0; omega = 0; time = 0; initialEnergy = 0;
  lastCrossing: number | null = null; measuredPeriod: number | null = null; cycles = 0;
  periodEndpoints: { start: number; end: number } | null = null;
  constructor(params: PendulumParams = DEFAULT_PENDULUM) { this.params = sanitizeParams(params); this.reset(params); }
  reset(params: PendulumParams) {
    this.params = sanitizeParams(params); this.theta = this.params.angle * Math.PI / 180;
    this.omega = 0; this.time = 0; this.lastCrossing = null; this.measuredPeriod = null; this.cycles = 0; this.periodEndpoints = null;
    this.initialEnergy = this.params.mass * this.params.gravity * this.params.length * (1 - Math.cos(this.theta));
  }
  step(dt = STEP) {
    const { gravity: g, length: l, damping: b } = this.params;
    const acceleration = (a: number, w: number) => -g / l * Math.sin(a) - b * w;
    const a = this.theta, w = this.omega;
    const k1a = w, k1w = acceleration(a, w);
    const k2a = w + k1w * dt / 2, k2w = acceleration(a + k1a * dt / 2, w + k1w * dt / 2);
    const k3a = w + k2w * dt / 2, k3w = acceleration(a + k2a * dt / 2, w + k2w * dt / 2);
    const k4a = w + k3w * dt, k4w = acceleration(a + k3a * dt, w + k3w * dt);
    this.theta += dt * (k1a + 2 * k2a + 2 * k3a + k4a) / 6;
    this.omega += dt * (k1w + 2 * k2w + 2 * k3w + k4w) / 6;
    // Interpolate same-direction zero crossings, independent of frame rate.
    if (a > 0 && this.theta <= 0) {
      const crossing = this.time + dt * a / (a - this.theta);
      if (this.lastCrossing !== null) { this.periodEndpoints = { start: this.lastCrossing, end: crossing }; this.measuredPeriod = crossing - this.lastCrossing; this.cycles++; }
      this.lastCrossing = crossing;
    }
    this.time += dt;
  }
  get readings() {
    const { mass: m, length: l, gravity: g } = this.params;
    const height = l * (1 - Math.cos(this.theta));
    const speed = Math.abs(l * this.omega);
    const potential = m * g * height, kinetic = .5 * m * speed * speed;
    return { angle: this.theta * 180 / Math.PI, height, speed, potential, kinetic,
      mechanical: potential + kinetic, dissipated: Math.max(0, this.initialEnergy - potential - kinetic),
      tension: m * g * Math.cos(this.theta) + m * speed * speed / l,
      weight: m * g, x: l * Math.sin(this.theta), y: -l * Math.cos(this.theta) };
  }
}
