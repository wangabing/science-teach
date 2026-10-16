import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buoyancyState } from '../src/lib/stem-lab/buoyancy.ts';

test('Archimedes principle and force balance at immersion boundaries', () => {
  for (const [depth, volume, force, tension, rise] of [[0, 0, 0, 27, 0], [5, 500, 5, 22, 1.25], [10, 1000, 10, 17, 2.5]]) {
    const state = buoyancyState(depth!, 1000);
    assert.equal(state.displacedCm3, volume);
    assert.equal(state.buoyancyN, force);
    assert.equal(state.tensionN, tension);
    assert.equal(state.riseCm, rise);
    assert.equal(state.buoyancyN + state.tensionN, state.weightN);
    assert.equal(state.levelCm - state.cubeBottomCm, depth);
  }
});

test('liquid density changes buoyancy and pressure but not displaced volume', () => {
  const oil = buoyancyState(10, 800);
  const dense = buoyancyState(10, 1200);
  assert.equal(oil.buoyancyN, 8);
  assert.equal(dense.buoyancyN, 12);
  assert.equal(oil.displacedCm3, dense.displacedCm3);
  assert.equal(dense.bottomPressurePa, 2100);
  assert.ok(dense.tensionN > 0);
});

test('invalid values cannot put the cube below the tank or produce NaN', () => {
  assert.equal(buoyancyState(-5, 1000).immersionCm, 0);
  assert.equal(buoyancyState(50, 1000).immersionCm, 10);
  assert.equal(buoyancyState(NaN, NaN).buoyancyN, 0);
});
