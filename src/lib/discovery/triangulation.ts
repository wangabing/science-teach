import { ShapeUtils, Vector2, Vector3 } from "three";
import type { Vec3 } from "./core.ts";
/** Triangulate an apparatus face on its dominant plane, including concave outlines. */
export function surfaceTriangles(vertices: Vec3[]): number[][] {
  if (vertices.length < 3) return [];
  const points = vertices.map((p) => new Vector3(...p));
  const normal = new Vector3();
  for (let i = 1; i < points.length - 1 && normal.lengthSq() < 1e-12; i++)
    normal.crossVectors(
      points[i]!.clone().sub(points[0]!),
      points[i + 1]!.clone().sub(points[0]!),
    );
  if (normal.lengthSq() < 1e-12) return [];
  const axis =
    Math.abs(normal.x) > Math.abs(normal.y)
      ? Math.abs(normal.x) > Math.abs(normal.z)
        ? 0
        : 2
      : Math.abs(normal.y) > Math.abs(normal.z)
        ? 1
        : 2;
  const contour = points.map((p) =>
    axis === 0
      ? new Vector2(p.y, p.z)
      : axis === 1
        ? new Vector2(p.x, p.z)
        : new Vector2(p.x, p.y),
  );
  return ShapeUtils.triangulateShape(contour, []);
}
