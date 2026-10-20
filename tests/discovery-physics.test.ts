import test from 'node:test';
import assert from 'node:assert/strict';
import { physicsModels } from '../src/lib/discovery/physics.ts';
import { defaults, solveModel, csv } from '../src/lib/discovery/core.ts';
const solve = (id: string, patch: Record<string, number> = {}) => {
  const model = physicsModels.find((q) => q.id === id)!;
  return solveModel(model, { ...defaults(model), ...patch });
};
const value = (id: string, key: string, p: Record<string, number> = {}) =>
  solve(id, p).metrics.find((q) => q.key === key)!.value!;
const near = (a: number, b: number, t = 1e-9) =>
  assert.ok(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);
test('incline matches analytic arrival, mass invariance, energy and static threshold', () => {
  for (const mass of [0.1, 1, 5])
    for (const theta of [10, 30, 60]) {
      const p = { mass, theta, time: 3 },
        a = 9.8 * Math.sin((theta * Math.PI) / 180);
      near(value('P01', 'arrival', p), Math.sqrt(4 / a));
      near(value('P01', 'kinetic', p), mass * 9.8 * 2 * Math.sin((theta * Math.PI) / 180));
    }
  near(value('P01', 'acceleration', { theta: 10, static: 0.4, kinetic: 0.2 }), 0);
  near(value('P01', 'distance', { theta: 0, time: 3 }), 0);
  const p = { theta: 30, static: 0.2, kinetic: 0.1, time: 3 };
  near(value('P01', 'kinetic', p) + value('P01', 'loss', p), 9.8);
});
test('collision preserves momentum for unequal masses and accounts restitution energy loss', () => {
  for (const mass1 of [0.5, 2, 5])
    for (const mass2 of [0.2, 1, 4])
      for (const restitution of [0, 0.5, 1]) {
        const p = { mass1, mass2, restitution, time: 3 };
        near(value('P02', 'momentum', p), value('P02', 'momentum_after', p));
        const loss = ((0.5 * mass1 * mass2) / (mass1 + mass2)) * (1 - restitution ** 2) * 9;
        near(value('P02', 'energy_before', p) - value('P02', 'energy_after', p), loss);
      }
  assert.equal(
    solve('P02', { v1: -2, v2: 1 }).metrics.find((q) => q.key === 'energy_after')!.value,
    null,
  );
});
test('resonance steady amplitude follows driven oscillator and undefined zero-damping resonance', () => {
  near(
    value('P03', 'amplitude', { frequency: 1, natural: 1, damping: 0.1 }),
    1 / (0.2 * (2 * Math.PI) ** 2),
  );
  near(value('P03', 'peak', { damping: 0.1 }), Math.sqrt(0.98));
  assert.equal(solve('P03', { frequency: 1, damping: 0 }).status, 'invalid');
});
test('Coulomb symmetry, potential parity and excluded singularities', () => {
  near(value('P04', 'potential', { x: 0, y: 1 }), 0);
  near(value('P04', 'ey', { x: 0, y: 1 }), 0);
  assert.ok(value('P04', 'ex', { x: 0, y: 1 }) > 0);
  const p = { q1: 2, q2: 2, x: 0, y: 1 };
  near(value('P04', 'ex', p), 0);
  assert.ok(value('P04', 'ey', p) > 0);
  assert.equal(solve('P04', { x: 2, y: 0 }).status, 'invalid');
});
test('Faraday analytic derivative, polarity, stopping, open circuit and mechanical power agree', () => {
  const p = { z: -0.08, velocity: 0.07, time: 0 },
    emf = value('P05', 'emf', p),
    dz = 1e-6;
  const derivative =
    (value('P05', 'flux_linkage', { ...p, z: p.z + dz }) -
      value('P05', 'flux_linkage', { ...p, z: p.z - dz })) /
    (2 * dz);
  near(emf, -derivative * p.velocity, 1e-8);
  near(value('P05', 'emf', { ...p, velocity: -p.velocity }), -emf);
  near(value('P05', 'emf', { ...p, polarity: -1 }), -emf);
  near(value('P05', 'emf', { ...p, velocity: 0 }), 0);
  near(value('P05', 'emf', { ...p, z: 0 }), 0);
  near(value('P05', 'heat', p), value('P05', 'external', p));
  near(value('P05', 'current', { ...p, closed: 0 }), 0);
  assert.ok(value('P05', 'emf', { ...p, closed: 0 }) !== 0);
});
test('magnetic bending scales with momentum and conserves kinetic energy', () => {
  near(value('P06', 'radius', { speed: 2000 }), 2 * value('P06', 'radius'));
  near(value('P06', 'radius', { charge: -1 }), value('P06', 'radius'));
  near(value('P06', 'energy', { time: 0 }), value('P06', 'energy', { time: 0.2 }));
  assert.equal(solve('P06', { field: 0 }).metrics.find((q) => q.key === 'radius')!.value, null);
});
test('calorimeter energy ledger and heat-loss solution obey limits and stop at boiling', () => {
  for (const loss of [0, 2, 10]) {
    const p = { loss, time: 500 };
    near(value('P07', 'input', p), value('P07', 'internal', p) + value('P07', 'dissipated', p));
  }
  near(value('P07', 'temperature', { loss: 0, time: 100 }), 20 + 4000 / (4180 * 0.5));
  assert.equal(
    solve('P07', { current: 5, resistance: 50, water: 0.1, time: 600 }).status,
    'boundary',
  );
  near(value('P07', 'temperature', { current: 5, resistance: 50, water: 0.1, time: 600 }), 100);
});
test('ideal gas processes satisfy first law and different heat capacities', () => {
  for (const process of [0, 1])
    for (const heat of [0, 500, 2000]) {
      const p = { process, heat };
      near(heat, value('P08', 'internal', p) + value('P08', 'work', p));
      near(
        value('P08', 'pressure', p) * value('P08', 'volume', p),
        8.314462618 * value('P08', 'temperature', p),
      );
    }
  const d0 = value('P08', 'temperature', { process: 0 }) - 300,
    d1 = value('P08', 'temperature', { process: 1 }) - 300;
  near(d0 / d1, 5 / 3);
});
test('Brownian fixed seed is reproducible and sample MSD approaches ensemble law across seeds', () => {
  assert.deepEqual(solve('P09'), solve('P09'));
  let average = 0;
  for (let seed = 1; seed <= 12; seed++)
    average += value('P09', 'msd', { seed, time: 10, particles: 256 });
  assert.ok(Math.abs(average / 12 - 40) / 40 < 0.06);
  near(value('P09', 'msd', { time: 0 }), 0);
  assert.notEqual(value('P09', 'msd', { seed: 1 }), value('P09', 'msd', { seed: 2 }));
});
test('Snell, Fresnel power, critical angle and reverse interface limits', () => {
  near(value('P10', 'transmitted_angle', { n1: 1, n2: 1, angle: 30 }), 30);
  near(value('P10', 'reflectance', { n1: 1, n2: 1, angle: 30 }), 0);
  near(value('P10', 'reflectance', { angle: 0 }), ((1.333 - 1) / (1.333 + 1)) ** 2);
  near(value('P10', 'critical'), (Math.asin(1 / 1.333) * 180) / Math.PI);
  near(value('P10', 'reflectance', { angle: 60 }), 1);
  assert.equal(
    solve('P10', { n1: 1, n2: 1.5 }).metrics.find((q) => q.key === 'critical')!.value,
    null,
  );
  for (const angle of [0, 30, 50, 80])
    near(value('P10', 'reflectance', { angle }) + value('P10', 'transmittance', { angle }), 1);
});
test('every physics model rejects malformed input and exports versioned units with invalid values blank', () => {
  for (const model of physicsModels) {
    assert.ok(solveModel(model, defaults(model)).drawing.length > 80);
    const key = model.controls[0]!.key;
    assert.throws(() => solveModel(model, { ...defaults(model), [key]: NaN }));
    assert.throws(() =>
      solveModel(model, { ...defaults(model), [key]: model.controls[0]!.max + 1 }),
    );
    const data = csv(model, [{ version: 'discovery-v1', id: model.id, inputs: defaults(model) }]);
    assert.ok(data.includes('discovery-v1'));
    assert.ok(!/NaN|Infinity/.test(data));
  }
});
