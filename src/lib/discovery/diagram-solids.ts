import { type Solid, type Vec3 } from "./core.ts";
const number = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
/** Keep the actual diagram's explanations when its geometry is inspected in space. */
export function diagramLabels(svg:string):Solid[] {
  return [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].flatMap(match=>{
    const attrs=Object.fromEntries([...match[1]!.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
    const x=Number(attrs.x),y=Number(attrs.y),text=match[2]!.replace(/<[^>]*>/g,'').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&').trim();
    return Number.isFinite(x)&&Number.isFinite(y)&&text?[{type:'label' as const,points:[[(x-400)/65,(230-y)/65,.25] as Vec3],label:text,color:attrs.fill??'#234359'}]:[];
  });
}
/** Lift vector geometry into a physical diagram board; no screenshot or texture is used. */
export function diagramSolids(svg: string): Solid[] {
  const result: Solid[] = [];
  const v = (x: number, y: number, z = 0): Vec3 => [
    (x - 400) / 65,
    (230 - y) / 65,
    z,
  ];
  for (const tag of svg.matchAll(
    /<(path|circle|ellipse|rect|line|polygon)\b([^>]+)>/g,
  )) {
    const kind = tag[1]!,
      attrs = Object.fromEntries(
        [...tag[2]!.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
      ),
      get = (k: string, d = 0) => Number(attrs[k] ?? d),
      color =
        attrs.stroke && attrs.stroke !== "none"
          ? attrs.stroke
          : attrs.fill && attrs.fill !== "none"
            ? attrs.fill
            : "#16847a";
    if (color.startsWith("url")) continue;
    if (kind === "circle" && attrs.fill !== "none") {
      result.push({
        type: "sphere",
        points: [v(get("cx"), get("cy"))],
        radius: Math.max(0.018, get("r") / 65),
        color,
      });
      continue;
    }
    if (kind === "circle" || kind === "ellipse") {
      const rx = get(kind === "circle" ? "r" : "rx"),
        ry = get(kind === "circle" ? "r" : "ry");
      result.push({
        type: "line",
        points: Array.from({ length: 65 }, (_, i) =>
          v(
            get("cx") + rx * Math.cos((i * Math.PI) / 32),
            get("cy") + ry * Math.sin((i * Math.PI) / 32),
          ),
        ),
        color,
      });
      continue;
    }
    if (kind === "rect") {
      const x = get("x"),
        y = get("y"),
        w = get("width"),
        h = get("height"),
        a = [
          v(x, y, -0.14),
          v(x + w, y, -0.14),
          v(x + w, y + h, -0.14),
          v(x, y + h, -0.14),
        ];
      for (const z of [-0.14, 0.14])
        result.push({
          type: "polygon",
          points: a.map((q) => [q[0], q[1], z]),
          color,
          opacity: 0.55,
        });
      for (let i = 0; i < 4; i++)
        result.push({
          type: "polygon",
          points: [
            a[i]!,
            a[(i + 1) % 4]!,
            [a[(i + 1) % 4]![0], a[(i + 1) % 4]![1], 0.14],
            [a[i]![0], a[i]![1], 0.14],
          ],
          color,
          opacity: 0.55,
        });
      continue;
    }
    if (kind === "line") {
      result.push({
        type: "line",
        points: [v(get("x1"), get("y1")), v(get("x2"), get("y2"))],
        color,
      });
      continue;
    }
    if (kind === "polygon") {
      const ns = (attrs.points ?? "").match(number)?.map(Number) ?? [];
      result.push({
        type: "polygon",
        points: Array.from({ length: Math.floor(ns.length / 2) }, (_, i) =>
          v(ns[2 * i]!, ns[2 * i + 1]!),
        ),
        color,
        opacity: 0.5,
      });
      continue;
    }
    let points: Vec3[] = [],
      x = 0,
      y = 0,
      sx = 0,
      sy = 0;
    const flush = (closed = false) => {
      if (points.length > 1)
        result.push({
          type: closed && attrs.fill !== "none" ? "polygon" : "line",
          points: closed ? [...points, points[0]!] : points,
          color,
          opacity: 0.75,
        });
      points = [];
    };
    for (const command of (attrs.d ?? "").matchAll(
      /([MLHVQCZmlhvqcz])([^MLHVQCZmlhvqcz]*)/g,
    )) {
      const op = command[1]!,
        ns = command[2]!.match(number)?.map(Number) ?? [],
        relative = op === op.toLowerCase();
      if (op.toUpperCase() === "Z") {
        x = sx;
        y = sy;
        flush(true);
        continue;
      }
      if (op.toUpperCase() === "M") flush();
      const step =
        op.toUpperCase() === "C"
          ? 6
          : op.toUpperCase() === "Q"
            ? 4
            : ["H", "V"].includes(op.toUpperCase())
              ? 1
              : 2;
      for (let i = 0; i + step <= ns.length; i += step) {
        const kind = op.toUpperCase(),
          ox = x,
          oy = y;
        if (kind === "H") x = relative ? x + ns[i]! : ns[i]!;
        else if (kind === "V") y = relative ? y + ns[i]! : ns[i]!;
        else if (kind === "C" || kind === "Q") {
          const values = ns
            .slice(i, i + step)
            .map((n, j) => n + (relative ? (j % 2 ? oy : ox) : 0));
          for (let j = 1; j <= 12; j++) {
            const t = j / 12,
              u = 1 - t;
            if (kind === "Q")
              points.push(
                v(
                  u * u * ox + 2 * u * t * values[0]! + t * t * values[2]!,
                  u * u * oy + 2 * u * t * values[1]! + t * t * values[3]!,
                ),
              );
            else
              points.push(
                v(
                  u ** 3 * ox +
                    3 * u * u * t * values[0]! +
                    3 * u * t * t * values[2]! +
                    t ** 3 * values[4]!,
                  u ** 3 * oy +
                    3 * u * u * t * values[1]! +
                    3 * u * t * t * values[3]! +
                    t ** 3 * values[5]!,
                ),
              );
          }
          x = values[step - 2]!;
          y = values[step - 1]!;
          continue;
        } else {
          x = (relative ? x : 0) + ns[i]!;
          y = (relative ? y : 0) + ns[i + 1]!;
        }
        if (kind === "M") {
          sx = x;
          sy = y;
        }
        points.push(v(x, y));
      }
    }
    flush();
  }
  return result.filter(
    (s) => s.points.length > 0 && s.points.flat().every(Number.isFinite),
  );
}
