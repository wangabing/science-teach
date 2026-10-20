import test from "node:test";
import assert from "node:assert/strict";
import { surfaceTriangles } from "../src/lib/discovery/triangulation.ts";
import type { Vec3 } from "../src/lib/discovery/core.ts";
const area = (points: Vec3[]) =>
  surfaceTriangles(points).reduce((sum, t) => {
    const [a, b, c] = t.map((i) => points[i]!) as [Vec3, Vec3, Vec3];
    const u = b.map((v, i) => v - a[i]!),
      v = c.map((n, i) => n - a[i]!);
    return (
      sum +
      Math.hypot(
        u[1]! * v[2]! - u[2]! * v[1]!,
        u[2]! * v[0]! - u[0]! * v[2]!,
        u[0]! * v[1]! - u[1]! * v[0]!,
      ) /
        2
    );
  }, 0);
test("concave apparatus keeps the missing corner instead of filling a triangle fan", () => {
  const p: Vec3[] = [
    [0, 0, 0],
    [3, 0, 0],
    [3, 1, 0],
    [1, 1, 0],
    [1, 3, 0],
    [0, 3, 0],
  ];
  assert.equal(area(p), 5);
  assert.equal(area([...p].reverse()), 5);
});
test("vertical and oblique instrument faces preserve area and closure", () => {
  const p: Vec3[] = [
    [0, 0, 0],
    [0, 3, 0],
    [0, 3, 1],
    [0, 1, 1],
    [0, 1, 3],
    [0, 0, 3],
    [0, 0, 0],
  ];
  assert.equal(area(p), 5);
  const q = p.map(
    ([x, y, z]) => [x + y / Math.sqrt(2), y / Math.sqrt(2), z] as Vec3,
  );
  assert.ok(Math.abs(area(q) - 5) < 1e-10);
});
test("zero swept faces stay empty while the separate construction remains available", () => {
  assert.deepEqual(
    surfaceTriangles([
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
    ]),
    [],
  );
  assert.deepEqual(surfaceTriangles([]), []);
});
