import test from 'node:test';
import assert from 'node:assert/strict';
import { mathModels, hexominoes, foldNet, movingArea } from '../src/lib/discovery/mathematics.ts';
import {
  engineeringModels,
  archProfile,
  tensegrityState,
  towerResponse,
} from '../src/lib/discovery/engineering.ts';
import { defaults, solveModel } from '../src/lib/discovery/core.ts';
const near = (a: number, b: number, e = 1e-8) => assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);
const model = (id: string) => [...mathModels, ...engineeringModels].find((m) => m.id === id)!;
const values = (id: string, p = {}) =>
  Object.fromEntries(
    solveModel(model(id), { ...defaults(model(id)), ...p }).metrics.map((m) => [m.key, m.value!]),
  );
test('35 free hexominoes and 11 cube nets; independent cross and strip fixtures', () => {
  assert.equal(hexominoes.length, 35);
  assert.equal(hexominoes.filter((x) => foldNet(x).valid).length, 11);
  assert.equal(
    foldNet([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [1, 1],
      [1, -1],
    ]).valid,
    true,
  );
  assert.equal(
    foldNet([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ]).valid,
    false,
  );
  assert.equal(
    foldNet([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]).valid,
    false,
  );
  for (const a of hexominoes) {
    const f = foldNet(a, 0.6);
    for (const s of f.frames.values()) near(Math.hypot(...s.u), 1);
  }
});
test('Cavalieri shear invariance and spatial normal requires both dot products', () => {
  near(values('M02', { shear: 0 }).volume, values('M02', { shear: 2 }).volume);
  assert.equal(values('M03', { x: 0, y: 1, z: 2 }).perpendicular, 0);
  assert.equal(values('M03', { x: 0, y: 0, z: 2 }).perpendicular, 1);
  assert.equal(solveModel(model('M03'), { x: 0, y: 0, z: 0 }).status, 'invalid');
});
test('cone sections ellipse/parabola/hyperbola eccentricity', () => {
  near(values('M04', { angle: 0 }).eccentricity, 0);
  near(values('M04', { angle: 60 }).eccentricity, 1);
  assert.ok(values('M04', { angle: 75 }).eccentricity > 1);
});
test('moving-point exact breakpoints and continuity at each corner', () => {
  assert.deepEqual(
    [0, 4, 7, 11, 14].map((s) => movingArea(4, 3, s)),
    [0, 0, 6, 6, 0],
  );
  for (const x of [4, 7, 11]) near(movingArea(4, 3, x - 1e-10), movingArea(4, 3, x + 1e-10));
  near(movingArea(4, 3, 6) - movingArea(4, 3, 5), 2);
  near(movingArea(4, 3, 10) - movingArea(4, 3, 8), 0);
});
test('unit circle, differentiability and biased binomial samples', () => {
  near(values('M06', { angle: 90 }).sin, 1);
  near(values('M06', { angle: 360 }).identity, 1);
  near(values('M07', { x: 1, delta: 0.1 }).secant, 2.1);
  assert.equal(values('M07', { function: 1, x: 0 }).derivative, null);
  const a = values('M08', { probability: 0.8, balls: 3000 });
  near(a.theory_mean, 6.4);
  assert.ok(Math.abs(a.mean - 6.4) < 0.12);
  near(a.count, 3000);
});
test('Euler topology and independent unit-cell sphere packing formula', () => {
  near(values('M09').chi, 2);
  near(values('M09', { surface: 1 }).chi, 0);
  near(values('M10').fraction, Math.PI / 6);
  near(values('M10', { arrangement: 1 }).fraction, Math.PI / (3 * Math.sqrt(2)));
});
test('arch thrust equilibrium with independently calculated parabolic reactions', () => {
  const p = archProfile(6, 1.5, 100, 1);
  near(p.H, 300);
  near(p.V, 300);
  near(p.y(-3), 0);
  near(p.y(0), 1.5);
  const q = archProfile(6, 1.5, 100, 0);
  near(q.y(3), 0);
  near((q.H / 100) * (Math.cosh(3 / (q.H / 100)) - 1), 1.5);
});
test('cantilever cubic length, rotation and visual multiplier independence', () => {
  near(values('S02').deflection, 0.390625);
  near(values('S02', { rotated: 1 }).deflection / values('S02').deflection, 4);
  near(values('S02', { length: 1 }).deflection / values('S02').deflection, 8);
  near(values('S02', { magnify: 1 }).deflection, values('S02', { magnify: 200 }).deflection);
  near(values('S02', { force: 0 }).deflection, 0);
  assert.equal(
    solveModel(model('S02'), { ...defaults(model('S02')), force: 100, width: 0.005, height: 0.005 })
      .status,
    'boundary',
  );
});
test('TMD tuned response vs bare and zero mass exact reduction', () => {
  const p = defaults(model('S03'));
  assert.ok(Math.hypot(...towerResponse(p).tower) < Math.hypot(...towerResponse(p).bare));
  const r = towerResponse({ ...p, damper: 0 });
  assert.deepEqual(r.tower, r.bare);
});
test('tensegrity equilibrium, prestress stiffness and Euler buckling', () => {
  for (const t of [10, 100, 500]) {
    const s = tensegrityState(1, 1.5, t, 200);
    assert.ok(s.residual < 1e-9);
    assert.ok(s.minimum > 0);
    near(s.buckling, (Math.PI ** 2 * 200) / (2.25 + 2 + Math.sqrt(3)));
  }
  assert.ok(Math.abs(tensegrityState(1, 1.5, 0, 200).minimum) < 1e-7);
  assert.equal(
    solveModel(model('S04'), { ...defaults(model('S04')), tension: 1000, rigidity: 10 }).status,
    'boundary',
  );
});
test('suspension, crank constraint and pulley/hydraulic energy budgets', () => {
  near(values('S05', { sag: 2.5 }).horizontal / values('S05', { sag: 5 }).horizontal, 2);
  for (const angle of [0, 45, 90, 180, 270]) near(values('S06', { angle }).rod_error, 0);
  assert.equal(
    solveModel(model('S06'), { ...defaults(model('S06')), rod: 0.5, angle: 90 }).status,
    'invalid',
  );
  for (const segments of [1, 2, 4]) {
    const v = values('S07', { segments, efficiency: 0.8 });
    near(v.input, v.useful + v.loss);
    near(v.rope, segments * 0.5);
  }
  const v = values('S08');
  near(v.input_work, v.output_work);
  near(v.input_force, 50);
  near(v.output_displacement, 0.25);
});
test('Miura panel distances preserved across fold; heat network monotonic', () => {
  for (const fold of [0, 30, 80]) {
    const o = solveModel(model('S09'), { ...defaults(model('S09')), fold }),
      pts = o.solids![0]!.points;
    for (let i = 0; i < 4; i++)
      near(Math.hypot(...pts[i]!.map((v, k) => v - pts[(i + 1) % 4]![k]!)), 0.5);
  }
  assert.ok(
    values('S10', { insulation: 0.2 }).conductance < values('S10', { insulation: 0.1 }).conductance,
  );
  near(values('S10', { indoor: 20, outdoor: 20 }).initial_flow, 0);
});
test('all mathematical/engineering models reject invalid input and emit finite geometry', () => {
  for (const m of [...mathModels, ...engineeringModels]) {
    assert.throws(() => solveModel(m, { ...defaults(m), [m.controls[0]!.key]: NaN }), RangeError);
    for (const c of m.controls)
      for (const value of c.options?.map((o) => o[0]) ?? [c.min, c.max]) {
        const o = solveModel(m, { ...defaults(m), [c.key]: value });
        assert.ok(!/NaN|Infinity/.test(o.drawing), `${m.id}.${c.key}=${value}`);
        for (const solid of o.solids ?? []) assert.ok(solid.points.flat().every(Number.isFinite));
      }
  }
});
