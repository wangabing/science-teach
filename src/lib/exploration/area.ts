export interface Pose { x: number; y: number; angle: number }
export function areaEvidence(a: number, b: number) {
  if (!(a > 0 && b > 0 && Number.isFinite(a + b))) throw new RangeError('Positive finite legs required');
  return { a2: a * a, b2: b * b, c: Math.hypot(a, b), c2: a * a + b * b, outer: (a + b) ** 2, triangles: 2 * a * b };
}
export function triangleVertices(a: number, b: number, pose: Pose) {
  const angle = pose.angle * Math.PI / 180;
  return [[0, 0], [a, 0], [0, b]].map(([x, y]) => ({ x: pose.x + x! * Math.cos(angle) - y! * Math.sin(angle), y: pose.y + x! * Math.sin(angle) + y! * Math.cos(angle) }));
}
export function areaTargets(a: number, b: number): Pose[] {
  return [{ x: 0, y: 0, angle: 0 }, { x: a, y: b, angle: 180 }, { x: a + b, y: b, angle: 90 }, { x: a, y: a + b, angle: 270 }];
}
export function areaSources(a: number, b: number): Pose[] {
  const s = a + b;
  return [{ x: 0, y: 0, angle: 0 }, { x: s, y: 0, angle: 90 }, { x: s, y: s, angle: 180 }, { x: 0, y: s, angle: 270 }];
}
