import test from 'node:test';
import assert from 'node:assert/strict';
import { Pendulum, DEFAULT_PENDULUM, theoreticalPeriod, STEP } from '../src/lib/stem-lab/pendulum.ts';

test('undamped nonlinear pendulum conserves energy over 60 simulated seconds', () => {
  const p = new Pendulum({ ...DEFAULT_PENDULUM, angle: 70 });
  for (let i = 0; i < 60 / STEP; i++) p.step();
  assert.ok(Math.abs(p.readings.mechanical / p.initialEnergy - 1) < 1e-7);
  assert.ok(Math.abs(p.measuredPeriod! - theoreticalPeriod(p.params)) < .0001);
});
test('mass scales energy without changing motion; longer length increases period', () => {
  const a = new Pendulum(), b = new Pendulum({ ...DEFAULT_PENDULUM, mass: 3 });
  for (let i = 0; i < 1000; i++) { a.step(); b.step(); }
  assert.equal(a.theta, b.theta); assert.equal(a.measuredPeriod, b.measuredPeriod);
  assert.ok(Math.abs(b.readings.mechanical / a.readings.mechanical - 3) < 1e-10);
  assert.ok(Math.abs(theoreticalPeriod({ ...DEFAULT_PENDULUM, length: 2.4 }) / theoreticalPeriod(DEFAULT_PENDULUM) - Math.sqrt(2.4 / 1.5)) < 1e-10);
});
test('damping dissipates energy and energy accounting balances', () => {
  const p = new Pendulum({ ...DEFAULT_PENDULUM, damping: .3 });
  let previous = p.initialEnergy;
  for (let i = 0; i < 3000; i++) {
    p.step(); assert.ok(p.readings.mechanical <= previous + 1e-10); previous = p.readings.mechanical;
  }
  assert.ok(previous < p.initialEnergy * .1);
  assert.ok(Math.abs(p.readings.mechanical + p.readings.dissipated - p.initialEnergy) < 1e-10);
});
test('small-angle limit, amplitude correction, reset and invalid parameter bounds', () => {
  const p = new Pendulum({ length: NaN, mass: -9, gravity: Infinity, damping: 9, angle: 999 });
  assert.equal(p.params.length, 1.5); assert.equal(p.params.mass, .2); assert.equal(p.params.angle, 70);
  assert.ok(theoreticalPeriod({ ...DEFAULT_PENDULUM, angle: 70 }) > theoreticalPeriod(DEFAULT_PENDULUM));
  assert.ok(Math.abs(theoreticalPeriod({ ...DEFAULT_PENDULUM, angle: 0 }) - 2 * Math.PI * Math.sqrt(1.5 / 9.81)) < 1e-10);
  p.step(); p.reset(DEFAULT_PENDULUM); assert.equal(p.time, 0); assert.equal(p.omega, 0); assert.equal(p.measuredPeriod, null);
});
