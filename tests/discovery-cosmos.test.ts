import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cosmosModels,
  lightEvents,
  sailForce,
  restrictedAcceleration,
  jacobi,
  blackholeRay,
  chirpValues,
  planck,
} from '../src/lib/discovery/cosmos.ts';
import { defaults, solveModel } from '../src/lib/discovery/core.ts';
const near = (a: number, b: number, e = 1e-8) => assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);
const model = (id: string) => cosmosModels.find((m) => m.id === id)!;
const values = (id: string, p = {}) =>
  Object.fromEntries(
    solveModel(model(id), { ...defaults(model(id)), ...p }).metrics.map((m) => [m.key, m.value!]),
  );
test('three star velocity-Verlet energy budget away from collision', () => {
  assert.ok(Math.abs(values('C01', { time: 0.2 }).energy_error) < 1e-5);
  assert.ok(values('C01', { planet: 4 }).flux < values('C01', { planet: 3 }).flux);
});
test('restricted rotating equations have L4 equilibrium and Jacobi drift below 1e-7', () => {
  const mu = 0.01,
    a = restrictedAcceleration(mu, 0.5 - mu, Math.sqrt(3) / 2, 0, 0);
  near(a[0]!, 0);
  near(a[1]!, 0);
  assert.ok(Math.abs(values('C02', { time: 10 }).drift) < 1e-7);
  assert.equal(values('C02', { ratio: 0.1 }).stable, 0);
  near(jacobi(mu, [0.5 - mu, Math.sqrt(3) / 2, 0, 0]), 3 - mu + mu * mu);
});
test('light cone independent interception and return events', () => {
  assert.deepEqual(lightEvents(4, 0), { arrival: 4, reply: 4, return: 8, x: 4 });
  near(lightEvents(4, 0.2).return, 10);
  near(lightEvents(4, -0.2).arrival, 10 / 3);
  near(lightEvents(4, 0.2, 1).return, 11.2);
});
test('0.8c clock contract and velocity bounds', () => {
  near(values('C04').gamma, 5 / 3);
  near(values('C04').earth, 10);
  near(values('C04').ship, 6);
  assert.throws(() => solveModel(model('C04'), { speed: 1, distance: 4 }));
});
test('sail photon momentum, absorption and independent radial gravity', () => {
  const a = sailForce(1361, 10, 1, 1, 0);
  near(a.x, 9.0796146712937e-5, 1e-16);
  near(a.absorbed, 0);
  near(sailForce(1361, 10, 1, 0, 0).x, a.x / 2, 1e-15);
  const b = sailForce(1361, 10, 1, 1, 45);
  near(b.y, b.x, 1e-15);
  assert.ok(values('C05').radial_net < 0);
  assert.ok(values('C05', { mode: 1, days: 1 }).velocity < 0);
  near(values('C05', { area: 20 }).force_x, 2 * values('C05').force_x);
});
test('Schwarzschild null ray capture threshold independent 3sqrt(3)', () => {
  assert.equal(blackholeRay(5).captured, true);
  assert.equal(blackholeRay(5.3).escaped, true);
  assert.equal(blackholeRay(6).captured, false);
  assert.equal(blackholeRay(6).escaped, true);
  near(values('C06').critical, 3 * Math.sqrt(3));
});
test('tidal inverse cube distance, density self gravity and Roche scaling', () => {
  near(values('C07', { distance: 2000 }).tidal * 8, values('C07', { distance: 1000 }).tidal);
  near(values('C07', { density: 6 }).self, 2 * values('C07', { density: 3 }).self);
});
test('radio independent inverse square dB and kTB bandwidth', () => {
  near(
    values('C08', { distance: 8 }).received - values('C08', { distance: 4 }).received,
    -20 * Math.log10(2),
  );
  near(values('C08', { bandwidth: 100 }).noise - values('C08', { bandwidth: 10 }).noise, 10);
});
test('inspiral chirp mass, frequency exponents and ISCO cutoff', () => {
  const a = chirpValues(30, 30, 20),
    b = chirpValues(30, 30, 40);
  near(a.mc / 1.98847e30, 30 / 2 ** 0.2);
  near(b.fdot / a.fdot, 2 ** (11 / 3));
  near(b.remaining / a.remaining, 2 ** (-8 / 3));
  assert.equal(
    solveModel(model('C09'), { ...defaults(model('C09')), frequency: 200 }).status,
    'boundary',
  );
});
test('Planck spectrum SI reference and seeded synthetic sky', () => {
  near(planck(160e9, 2.725), 3.836650221755702e-18, 1e-24);
  assert.deepEqual(values('C10'), values('C10'));
  assert.notEqual(values('C10', { seed: 43 }).rms, values('C10', { seed: 42 }).rms);
});
test('all cosmos control extremes finite and invalid inputs rejected', () => {
  for (const m of cosmosModels) {
    assert.throws(() => solveModel(m, { ...defaults(m), [m.controls[0]!.key]: NaN }));
    for (const c of m.controls)
      for (const v of c.options?.map((o) => o[0]) ?? [c.min, c.max]) {
        const o = solveModel(m, { ...defaults(m), [c.key]: v });
        assert.ok(!/NaN|Infinity/.test(o.drawing), `${m.id}.${c.key}`);
      }
  }
});

test('chirp playback uses current frequency consistently for rate, amplitude and shrinking separation', () => {
  const a = values('C09', { time: 0 }),
    b = values('C09', { time: 0.1 });
  assert.ok(b.current_frequency > a.current_frequency);
  near(
    b.frequency_rate / a.frequency_rate,
    (b.current_frequency / a.current_frequency) ** (11 / 3),
  );
  near(b.strain / a.strain, (b.current_frequency / a.current_frequency) ** (2 / 3));
  near(a.remaining - b.remaining, 0.1);
});
