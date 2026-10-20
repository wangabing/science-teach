import { originalStudios } from "../src/data/discovery-studios.ts";
import { experienceById } from "../src/data/discovery-experiences.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { additions } from "../src/lib/discovery/expansion/index.ts";
import { models, modelById } from "../src/lib/discovery/registry.ts";
import { defaults, solveModel, validate } from "../src/lib/discovery/core.ts";
import { Investigation } from "../src/lib/discovery/task.ts";
const values = (id: string, p: Record<string, number> = {}) => {
  const model = modelById(id);
  return Object.fromEntries(
    solveModel(model, { ...defaults(model), ...p }).metrics.map((m) => [
      m.key,
      m.value,
    ]),
  );
};
const near = (a: number | null | undefined, b: number, t = 1e-8) =>
  assert.ok(
    a !== null &&
      a !== undefined &&
      Math.abs(a - b) <= t * Math.max(1, Math.abs(b)),
    `${a} != ${b}`,
  );
test("four collections each add exactly twenty coherent, dual-view experiments", () => {
  assert.equal(additions.length, 80);
  for (const prefix of "PMCS") {
    assert.equal(additions.filter((a) => a.model.id[0] === prefix).length, 20);
  }
  assert.equal(new Set(additions.map((x) => x.studio.slug)).size, 80);
  assert.equal(models.length, 120);
});
for (const { model, studio, experience } of additions) {
  test(`${model.id} validated states, meaningful scenes, dual geometry and independent evidence`, () => {
    const d = defaults(model),
      a = { ...d, ...experience.scenes[0]!.inputs },
      b = { ...d, ...experience.scenes[1]!.inputs };
    assert.equal(model.spatial, true);
    assert.equal(experience.scenes.length, 2);
    assert.equal(Object.keys(a).filter((k) => a[k] !== b[k]).length, 1);
    assert.ok(studio.proof.length > 20 && studio.history.length > 20);
    assert.ok(studio.source.startsWith("https://"));
    for (const p of [
      d,
      a,
      b,
      { ...d, ...studio.counter },
      ...model.controls.flatMap((c) =>
        [c.min, c.max].map((v) => ({ ...d, [c.key]: v })),
      ),
    ]) {
      validate(model, p);
      const o = solveModel(model, p);
      assert.ok(o.drawing.length > 50);
      assert.ok(o.solids && o.solids.length > 0, model.id);
      assert.ok(
        o.solids!.flatMap((s) => s.points.flat()).every(Number.isFinite),
      );
      assert.ok(!o.drawing.includes("NaN") && !o.drawing.includes("Infinity"));
      for (const curve of o.curves)
        assert.ok(curve.points.flat().every(Number.isFinite), model.id);
    }
    const oa = model.solve(a),
      ob = model.solve(b);
    assert.notEqual(
      JSON.stringify(oa.solids),
      JSON.stringify(ob.solids),
      model.id + " live geometry",
    );
    assert.ok(
      JSON.stringify(oa.metrics) !== JSON.stringify(ob.metrics) ||
        oa.drawing !== ob.drawing,
      model.id + " scene must visibly or measurably respond",
    );
    const task = new Investigation(model, studio);
    task.prepare(d);
    task.edit(a, studio.compare);
    task.check(a);
    task.edit(b, studio.compare);
    const msg = task.check(b);
    assert.ok(task.complete, msg);
    task.clear();
    assert.equal(task.complete, false);
    assert.equal(task.evidence.length, 0);
  });
}
test("physics analytic anchors and energy/geometry laws", () => {
  near(values("P11", { angle: 45, speed: 14 }).range, 20);
  near(values("P11", { angle: 30 }).range, values("P11", { angle: 60 }).range!);
  near(values("P12", { mass1: 1, mass2: 3 }).acceleration, 4.9);
  near(
    values("P13", { speed: 4 }).force,
    4 * values("P13", { speed: 2 }).force!,
  );
  near(values("P14", { arm: 1.2 }).required, 10);
  near(
    values("P15", { compression: 0.2 }).energy,
    4 * values("P15", { compression: 0.1 }).energy!,
  );
  near(values("P16", { diameter: 4 }).drop, 0);
  near(values("P17", { depth: 2, density: 1000 }).gauge, 19.6);
  near(
    values("P18", { separation: 0.4 }).spacing,
    0.5 * values("P18", { separation: 0.2 }).spacing!,
  );
  near(
    values("P19", { width: 0.1 }).central,
    2 * values("P19", { width: 0.2 }).central!,
  );
  near(values("P20", { difference: 0 }).beat, 0);
  near(
    values("P21", { mode: 3 }).frequency,
    3 * values("P21", { mode: 1 }).frequency!,
  );
  near(values("P22", { speed: 0 }).observed, 500);
  near(values("P23", { angle: 0 }).force, 0);
  near(values("P24", { ratio: 2 }).secondary, 24);
  near(
    values("P25", { frequency: 100 }).power,
    values("P25", { frequency: 100 }).current! ** 2 * 20,
  );
  near(values("P26").work! + values("P26").rejected!, 1000);
  near(values("P27").temperature, 50);
  near(
    values("P28", { thickness: 10 }).flow,
    0.5 * values("P28", { thickness: 5 }).flow!,
  );
  near(values("P29", { wavelength: 700 }).emission, 0);
  assert.ok(
    values("P30", { impact: 20 }).angle! >
      values("P30", { impact: 100 }).angle!,
  );
});
test("mathematical identities, distances, degeneracy and sampling", () => {
  near(values("M11").residual, 0);
  near(values("M12").ratio, 2);
  near(values("M13", { sun: 25 }).inferred, 6);
  near(values("M14").diameter, 4);
  near(values("M15", { angle: 90 }).third, Math.sqrt(13));
  near(values("M16").residual, 0);
  near(values("M17").difference, 0);
  near(values("M18").difference, 2);
  near(values("M19", { distance: 0.5 }).image, 2);
  near(values("M20", { shear: -2 }).area, 4.5);
  near(values("M21").dot, 0);
  near(values("M22", { angle: 0 }).distance, 1);
  near(values("M23", { distance: 0 }).area, 4 * Math.PI);
  near(values("M24", { width: 1, depth: 2, height: 2 }).diagonal, 3);
  near(
    values("M25", { angle: 180 }).volume,
    0.5 * values("M25", { angle: 360 }).volume!,
  );
  assert.ok(
    values("M26", { count: 60 }).error! > values("M26", { count: 5 }).error!,
  );
  const estimate = values("M27", { count: 2000 }).estimate!;
  assert.ok(Math.abs(estimate - Math.PI) < 0.15);
  near(values("M28", { prevalence: 10 }).posterior, (100 * 900) / (900 + 450));
  near(values("M29", { angle: 90 }).real, -1);
  near(values("M30", { constant: 1 }).roots, 1);
  assert.equal(values("M23", { distance: 3, radius: 1 }).area, null);
});
test("cosmic physical scaling and reference benchmarks", () => {
  near(values("C11", { phase: 0 }).areal, values("C11", { phase: 180 }).areal!);
  near(values("C12").ratio, Math.SQRT2);
  assert.ok(
    values("C13", { target: 35000 }).delta! >
      values("C13", { target: 14000 }).delta!,
  );
  near(values("C14", { radius: 0.1 }).maximum, 1);
  near(values("C14", { position: 1.5 }).depth, 0);
  near(values("C15", { inclination: 0 }).amplitude, 0);
  near(values("C16", { luminosity: 1, distance: 1 }).flux, 1);
  near(values("C17", { temperature: 6000 }).peak, 482.9619925);
  near(values("C18", { mass: 1 }).lifetime, 10);
  assert.equal(values("C19", { radius: 4, mass: 3 }).redshift, null);
  near(values("C20", { redshift: 2, wavelength: 500 }).observed, 1500);
  near(values("C21", { radius: 4 / 3 }).ratio, 0.5);
  assert.equal(values("C22", { offset: 0 }).magnification, null);
  assert.ok(
    Math.abs(
      values("C23", { axis: 0.387, eccentricity: 0.2056 }).century! - 43,
    ) < 1,
  );
  near(values("C24", { mass: 8 }).hill, 2 * values("C24", { mass: 1 }).hill!);
  near(values("C25", { ratio: 1 }).delta, 0);
  near(values("C26", { beta: 0.6 }).gamma, 1.25);
  near(
    values("C27", { radius: 20 }).energy,
    8 * values("C27", { radius: 10 }).energy!,
  );
  near(
    values("C28", { diameter: 4 }).resolution,
    0.25 * values("C28", { diameter: 1 }).resolution!,
  );
  near(
    values("C29", { baseline: 8000 }).scale,
    0.125 * values("C29", { baseline: 1000 }).scale!,
  );
  near(
    values("C30", { redshift: 0.04 }).distance,
    2 * values("C30", { redshift: 0.02 }).distance!,
  );
});
test("engineering conservation, stiffness and geometric constraints", () => {
  assert.ok(
    values("S11", { height: 0.5 }).compression! >
      values("S11", { height: 2 }).compression!,
  );
  near(values("S12", { position: 0 }).moment, 0);
  near(values("S12").left! + values("S12").right!, 10);
  near(
    values("S13", { length: 2 }).critical,
    0.25 * values("S13", { length: 1 }).critical!,
  );
  near(values("S14", { eccentricity: 0 }).minimum, 10);
  near(
    values("S15", { width: 2 }).factor,
    4 * values("S15", { width: 1 }).factor!,
  );
  near(values("S16", { angle: 45, friction: 1 }).factor, 1);
  near(
    values("S17", { pitch: 2 }).force,
    0.25 * values("S17", { pitch: 8 }).force!,
  );
  near(values("S18").input, (values("S18").rise! / 100) * 1000);
  near(values("S19").speed! * values("S19").torque!, 120 * 3);
  near(values("S20", { ring: 60 }).ratio, 4);
  near(values("S21", { angle: 270 }).residual, 0);
  near(values("S22", { angle: 45 }).force, 4);
  near(values("S23", { radius: 4, height: 4 }).area, 32 * Math.PI);
  assert.ok(
    values("S24", { brace: 1 }).displacement! <
      values("S24", { brace: 0 }).displacement!,
  );
  near(
    values("S25", { thickness: 0.06 }).relative,
    2 * values("S25", { thickness: 0.03 }).relative!,
  );
  assert.ok(
    values("S26", { core: 25 }).deflection! <
      values("S26", { core: 5 }).deflection!,
  );
  near(
    values("S27", { absorption: 0.3 }).reverberation,
    values("S27", { absorption: 0.1 }).reverberation! / 3,
  );
  near(values("S28", { depth: 0 }).shaded, 0);
  near(values("S29").stored! + values("S29").overflow!, values("S29").inflow!);
  near(
    values("S30", { height: 8 }).flow,
    2 * values("S30", { height: 2 }).flow!,
  );
  near(values("S30", { difference: 0 }).flow, 0);
});

test("hydrostatic width is independent and magnetic force obeys the cross-product orientation", () => {
  near(
    values("P17", { width: 300, depth: 2 }).gauge,
    values("P17", { width: 600, depth: 2 }).gauge!,
  );
  const model = modelById("P23"),
    p = { ...defaults(model), angle: 90, current: 2 };
  const forward = solveModel(model, p),
    back = solveModel(model, { ...p, current: -2 });
  near(forward.metrics[0]!.value, -back.metrics[0]!.value!);
  const forceLine = (o: ReturnType<typeof solveModel>) => o.solids!.at(-1)!;
  assert.ok(
    forceLine(forward).points[1]![2] < forceLine(forward).points[0]![2],
  );
  assert.ok(forceLine(back).points[1]![2] > forceLine(back).points[0]![2]);
});
test("all forty retained workbenches change spatial evidence with their comparison conditions", () => {
  for (const studio of originalStudios) {
    const model = modelById(studio.id);
    const states = experienceById(studio.id).scenes.map((scene) =>
      solveModel(model, { ...defaults(model), ...scene.inputs }),
    );
    for (const state of states) assert.ok(state.solids?.length, studio.id);
    assert.notDeepEqual(states[0]!.solids, states[1]!.solids, studio.id);
    if (studio.id === "P01")
      assert.equal(
        states[0]!.metrics[0]!.value,
        states[1]!.metrics[0]!.value,
        "mass changes weight while acceleration stays invariant",
      );
  }
});
