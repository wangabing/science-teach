import test from "node:test";
import assert from "node:assert/strict";
import { experiences } from "../src/data/discovery-experiences.ts";
import { studios } from "../src/data/discovery-studios.ts";
import { models } from "../src/lib/discovery/registry.ts";
import { defaults, solveModel } from "../src/lib/discovery/core.ts";
import { observationCue } from "../src/lib/discovery/observation-cues.ts";
import { apparatusDrawing } from "../src/lib/discovery/presentation.ts";
test("all forty journeys have usable controls, distinct meaningful scenes and observation guidance", () => {
  assert.equal(Object.keys(experiences).length, 120);
  for (const model of models) {
    const e = experiences[model.id]!;
    assert.ok(e);
    assert.ok(e.primary.length > 0 && e.primary.length <= 3);
    for (const key of e.primary)
      assert.ok(model.controls.some((c) => c.key === key));
    assert.notDeepEqual(e.scenes[0]!.inputs, e.scenes[1]!.inputs);
    for (const scene of e.scenes) {
      const input = { ...defaults(model), ...scene.inputs },
        o = solveModel(model, input);
      assert.notEqual(o.status, "invalid", `${model.id} ${scene.name}`);
      assert.doesNotMatch(apparatusDrawing(model.id, input, o), /NaN|Infinity/);
    }
    assert.ok(e.invitation && e.hint && e.look);
  }
});
test("scene comparisons preserve the intended fixed conditions", () => {
  for (const id of [
    "P01",
    "P02",
    "P04",
    "P07",
    "P08",
    "P09",
    "P10",
    "M02",
    "M05",
    "M06",
    "M08",
    "M09",
    "M10",
    "C01",
    "C04",
    "C05",
    "C06",
    "C07",
    "C08",
    "S01",
    "S02",
    "S03",
    "S04",
    "S05",
    "S06",
    "S08",
    "S09",
    "S10",
  ]) {
    const m = models.find((m) => m.id === id)!,
      a = { ...defaults(m), ...experiences[id]!.scenes[0]!.inputs },
      b = { ...defaults(m), ...experiences[id]!.scenes[1]!.inputs };
    assert.equal(Object.keys(a).filter((k) => a[k] !== b[k]).length, 1, id);
  }
});
test("all static apparatus drawings stay finite at every control endpoint", () => {
  for (const model of models)
    for (const c of model.controls)
      for (const n of [c.min, c.max]) {
        const p = { ...defaults(model), [c.key]: n },
          o = solveModel(model, p),
          svg = apparatusDrawing(model.id, p, o);
        assert.doesNotMatch(svg, /NaN|Infinity/, `${model.id}.${c.key}=${n}`);
        assert.ok(svg.includes(`data-apparatus-detail="${model.id}"`));
      }
});
test("Cavalieri gold slice uses exact requested height instead of nearest display layer", () => {
  const m = models.find((m) => m.id === "M02")!,
    o = solveModel(m, { ...defaults(m), slice: 1.17 });
  const slices = o.solids!.filter((s) => s.type === "polygon");
  assert.equal(slices.length, 2);
  for (const slice of slices)
    assert.ok(slice.points.every((p) => p[1] === 1.17));
});
test("primary observations exist and cube opens as a foldable valid net", () => {
  for (const studio of studios) {
    const m = models.find((m) => m.id === studio.id)!;
    assert.ok(
      m.solve(defaults(m)).metrics.some((q) => q.key === studio.metric),
    );
  }
  const m = models.find((m) => m.id === "M01")!;
  assert.equal(
    m.solve(defaults(m)).metrics.find((q) => q.key === "valid")!.value,
    1,
  );
});

test("observation feedback distinguishes zero potential, open circuit, capture and invalid model ranges", () => {
  const cue = (id: string, p = {}) => {
    const model = models.find((m) => m.id === id)!,
      input = { ...defaults(model), ...p };
    return observationCue(id, input, solveModel(model, input));
  };
  assert.match(cue("P04", { x: 0, y: 0 }), /电势抵消了，电场却没有/);
  assert.match(cue("P05", { closed: 0 }), /开路.*电流为0/);
  assert.match(cue("C06", { impact: 5 }), /被捕获/);
  assert.match(cue("C06", { impact: 6 }), /逃逸/);
  assert.match(cue("C10", { foreground: 0, noise: 0 }), /温差仍然保留/);
  const m = models.find((m) => m.id === "S02")!,
    p = { ...defaults(m), force: 100, width: 0.005, height: 0.005, length: 1 },
    o = solveModel(m, p);
  assert.equal(o.status, "boundary");
  assert.equal(observationCue("S02", p, o), o.note);
});

test("steep incline and tall narrow moving-point scenes keep model geometry inside the viewport", () => {
  for (const [id, changes] of [
    ["P01", { theta: 60, time: 3 }],
    ["M05", { width: 2, height: 4, distance: 6 }],
  ] as const) {
    const m = models.find((m) => m.id === id)!,
      o = solveModel(m, { ...defaults(m), ...changes });
    for (const match of o.drawing.replace(/<g data-response-evidence="[^"]+">[\s\S]*?<\/g>/g,'').matchAll(/<path d="([^"]+)"/g)) {
      const values = match[1]!
        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)!
        .map(Number);
      for (let i = 0; i < values.length; i += 2) {
        assert.ok(
          values[i]! >= 0 && values[i]! <= 800,
          `${id}: x=${values[i]}`,
        );
        assert.ok(
          values[i + 1]! >= 0 && values[i + 1]! <= 460,
          `${id}: y=${values[i + 1]}`,
        );
      }
    }
  }
});
