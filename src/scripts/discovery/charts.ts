import {
  format,
  type Curve,
  type Inputs,
  type Observation,
} from "../../lib/discovery/core";
const ns = "http://www.w3.org/2000/svg";
export function chartCursor(
  id: string,
  p: Inputs,
  o: Observation,
): number | undefined {
  const metric = (key: string) =>
    o.metrics.find((m) => m.key === key)?.value ?? undefined;
  const keys: Record<string, string> = {
    P01: "time",
    P03: "frequency",
    P04: "x",
    P06: "time",
    P07: "time",
    P09: "time",
    P10: "angle",
    M02: "slice",
    M05: "distance",
    M06: "angle",
    M07: "x",
    C04: "speed",
    C05: "angle",
    C07: "distance",
    C08: "distance",
    C09: "time",
    C10: "frequency",
    S03: "frequency",
    S06: "angle",
    S07: "segments",
    S08: "displacement",
    S09: "fold",
    S10: "time",
  };
  if (id === "P05") return metric("position");
  const key = keys[id];
  return key ? p[key] : undefined;
}
export function renderCharts(
  host: HTMLElement,
  curves: Curve[],
  cursor?: number,
) {
  host.replaceChildren();
  for (const c of curves) {
    const valid = c.points.filter((p) => p.every(Number.isFinite));
    if (!valid.length) continue;
    const xs = valid.map((p) => p[0]),
      ys = valid.map((p) => p[1]),
      xmin = Math.min(...xs),
      xmax = Math.max(...xs),
      ymin = Math.min(...ys),
      ymax = Math.max(...ys),
      dx = xmax - xmin || 1,
      dy = ymax - ymin || Math.max(1, Math.abs(ymin) * 0.1),
      x = (v: number) => 70 + ((v - xmin) / dx) * 590,
      y = (v: number) => 180 - ((v - ymin) / dy) * 130;
    const fig = document.createElement("figure");
    fig.className = "dis-chart";
    const caption = document.createElement("figcaption");
    caption.textContent = `${c.label} · 横轴 ${c.unitX || "无量纲"} / 纵轴 ${c.unitY || "无量纲"}`;
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 720 230");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", caption.textContent);
    const add = (
      tag: string,
      attrs: Record<string, string>,
      content?: string,
    ) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      if (content) e.textContent = content;
      svg.append(e);
    };
    add("path", {
      d: "M70 40V180H670",
      fill: "none",
      stroke: "currentColor",
      "stroke-opacity": ".3",
    });
    for (let i = 1; i < 5; i++) {
      const yy = 180 - i * 26,
        xx = 70 + i * 118;
      add("path", {
        d: `M70 ${yy}H660 M${xx} 50V180`,
        fill: "none",
        stroke: "currentColor",
        "stroke-opacity": ".08",
      });
      add("text", { x: "5", y: String(yy + 4) }, format(ymin + (dy * i) / 5));
    }
    let d = "",
      open = false;
    for (const p of c.points) {
      if (!p.every(Number.isFinite)) {
        open = false;
        continue;
      }
      d += `${open ? "L" : "M"}${x(p[0]).toFixed(2)} ${y(p[1]).toFixed(2)} `;
      open = true;
    }
    add("path", {
      d,
      fill: "none",
      stroke: c.color ?? "#168e9b",
      "stroke-width": "2.5",
      "stroke-linejoin": "round",
    });
    const probe=c.probe??cursor;
    if (probe !== undefined && probe >= xmin && probe <= xmax) {
      add("path", {
        d: `M${x(probe)} 45V180`,
        fill: "none",
        stroke: "#bc842d",
        "stroke-width": "1.5",
        "stroke-dasharray": "4 4",
        "data-current-cursor": "true",
      });
      add(
        "text",
        { x: String(Math.max(75, Math.min(565, x(probe) + 7))), y: "34" },
        `当前 ${format(probe)} ${c.unitX}`,
      );
    }
    add("text", { x: "70", y: "205" }, format(xmin));
    add("text", { x: "610", y: "205" }, format(xmax));
    add("text", { x: "5", y: "185" }, format(ymin));
    add("text", { x: "5", y: "50" }, format(ymax));
    add("text", { x: "585", y: "225" }, c.unitX || "无量纲");
    fig.append(caption, svg);
    host.append(fig);
  }
}
