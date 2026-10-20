import test from 'node:test';
import assert from 'node:assert/strict';
import { originalStudios as studios } from '../src/data/discovery-studios.ts';
import { models } from '../src/lib/discovery/registry.ts';
import { defaults, validate, csv, type Inputs } from '../src/lib/discovery/core.ts';
import { Investigation } from '../src/lib/discovery/task.ts';
import { foldNet, hexominoes } from '../src/lib/discovery/mathematics.ts';
export function probes(id: string): Inputs[] {
  switch (id) {
    case 'P01':
      return [
        { mass: 1, time: 1 },
        { mass: 2, time: 1 },
      ];
    case 'P05':
      return [
        { velocity: 0.05, time: 0 },
        { velocity: 0, time: 0 },
        { velocity: -0.05, time: 0 },
      ];
    case 'M01':
      return [{ net: 18, fold: 90 }];
    case 'M03':
      return [{ y: 0.5 }, { y: 0 }];
    case 'M04':
      return [{ angle: 30 }, { angle: 60 }, { angle: 75 }];
    case 'M05':
      return [{ distance: 4.5 }, { distance: 5.5 }, { distance: 7.5 }, { distance: 9 }];
    case 'M06':
      return [{ angle: 90 }, { angle: 450 }];
    case 'C03':
      return [
        { speed: 0, time: 8 },
        { speed: 0.2, time: 10 },
      ];
    case 'S07':
      return [
        { segments: 1, height: 0.5 },
        { segments: 2, height: 0.5 },
      ];
    default: {
      const s = studios.find((s) => s.id === id)!,
        m = models.find((m) => m.id === id)!,
        c = m.controls.find((c) => c.key === s.compare)!;
      const vals = c.options?.map((a) => a[0]) ?? [
        c.value,
        c.value + c.step * 2 <= c.max ? c.value + c.step * 2 : c.value - c.step * 2,
      ];
      return vals.slice(0, 2).map((v) => ({ [s.compare]: v }));
    }
  }
}
test('40 coherent briefs with valid migration conditions and 60-entry target cardinality', () => {
  assert.equal(studios.length, 40);
  assert.equal(new Set(studios.map((s) => s.slug)).size, 40);
  for (const s of studios) {
    const m = models.find((m) => m.id === s.id)!;
    assert.ok(m);
    validate(m, { ...defaults(m), ...s.counter });
    assert.ok(m.controls.some((c) => c.key === s.compare));
    assert.ok(m.solve(defaults(m)).metrics.some((q) => q.key === s.metric));
    assert.match(s.source, /^https:/);
  }
});
for (const s of studios)
  test(`${s.id} independent task can complete and restore/reference clears qualification`, () => {
    const m = models.find((m) => m.id === s.id)!,
      t = new Investigation(m, s),
      initial = defaults(m);
    if (s.id === 'M01') initial.net = 18;
    t.prepare(initial);
    assert.match(t.check(initial), /先亲手/);
    let p = { ...initial };
    for (const q of probes(s.id)) {
      p = { ...p, ...q };
      for (const key of Object.keys(q)) t.edit(p, key);
      t.changed = true;
      let pred: number | undefined;
      if (s.id === 'M01') {
        const r = foldNet(hexominoes[p.net!]!),
          root = r.frames.get(0)!;
        pred =
          [...r.frames].find(
            ([, f]) => f.n.reduce((n, x, i) => n + x * root.n[i]!, 0) < -0.99,
          )![0] + 1;
      }
      t.check(p, pred);
    }
    assert.ok(t.complete, `${s.id}: ${JSON.stringify(t.evidence)}`);
    assert.ok(csv(m, [{ version: 'discovery-v1', id: s.id, inputs: p }]).includes('discovery-v1'));
    t.clear();
    assert.equal(t.complete, false);
    assert.match(t.check(p), /请先准备/);
  });
test('counterexample citation, altered conditions and insufficient movement cannot satisfy tasks', () => {
  const m = models.find((m) => m.id === 'M05')!,
    s = studios.find((s) => s.id === 'M05')!,
    t = new Investigation(m, s);
  t.prepare(defaults(m));
  for (const distance of [4.1, 4.2, 7.1, 7.2]) {
    const p = { ...defaults(m), distance };
    t.edit(p, 'distance');
    t.check(p);
  }
  assert.equal(t.complete, false);
  t.edit({ ...defaults(m), width: 5 }, 'width');
  assert.equal(t.active, false);
});

test('snapshot rejects unknown conditions rather than silently dropping them', () => {
  const m = models[0]!;
  assert.throws(() => validate(m, { ...defaults(m), unmodeled: 1 }), RangeError);
  assert.ok(
    csv(m, [{ version: 'discovery-v1', id: m.id, inputs: defaults(m) }]).includes('model_note'),
  );
});
