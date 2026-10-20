import { waveAt, type WaveInput } from "../../lib/exploration/interference";
import type { Observation, Solid, Vec3 } from "../../lib/discovery/core";
const root = document.querySelector<HTMLElement>("[data-legacy-spatial]");
if (root) {
  const slug = root.dataset.legacySpatial!,
    selectors: Record<string, string> = {
      area: "#area-svg",
      sections: "#cube-view",
      orbit: "#orbit-svg",
      "three-body": "#three-a",
      bridge: "#bridge-svg",
      gears: "#gear-svg",
      interference: "#wave-map",
      circuits: "#circuit-svg",
      resistors: "#divider-svg",
      capacitors: "#rc-svg",
      reflection: "#geo-svg",
      "circle-angles": "#geo-svg",
      "triangle-rigidity": "#geo-svg",
      "ellipse-string": "#geo-svg",
    },
    svg = document.querySelector<SVGSVGElement>(selectors[slug]!)!,
    host = root.querySelector<HTMLElement>("[data-legacy-host]")!,
    button = root.querySelector<HTMLButtonElement>("[data-legacy-open]")!,
    note = root.querySelector<HTMLElement>("[data-legacy-note]")!,
    summary = root.querySelector<HTMLElement>("[data-legacy-summary]")!,
    camera = root.querySelector<HTMLElement>(".legacy-camera")!;
  let scene:
      | ReturnType<typeof import("../discovery/scene").createDiscoveryScene>
      | undefined,
    opening = false,
    departed = false,
    frame = 0,
    revision = 0;
  function observation(): Observation {
    const solids: Solid[] = [],
      vb = svg.viewBox.baseVal,
      scale = 8 / Math.max(vb.width, vb.height),
      base = svg.getCTM();
    if (!base)
      return {
        metrics: [],
        drawing: "",
        note: "二维几何尚未就绪",
        status: "valid",
        curves: [],
        solids,
      };
    let panelOffset = 0;
    const project = (x: number, y: number, transform: DOMMatrix): Vec3 => {
      const p = new DOMPoint(x, y).matrixTransform(transform);
      return [
        (p.x - vb.x - vb.width / 2) * scale + panelOffset,
        (vb.y + vb.height / 2 - p.y) * scale,
        0,
      ];
    };
    const signature: string[] = [];
    const panels =
      slug === "three-body"
        ? [svg, document.querySelector<SVGSVGElement>("#three-b")!]
        : [svg];
    for (const [index, panel] of panels.entries()) {
      panelOffset = panels.length === 2 ? (index === 0 ? -4.5 : 4.5) : 0;
      const panelBase = panel.getCTM();
      if (!panelBase) continue;
      for(const text of panel.querySelectorAll<SVGTextElement>('text')) {
        const matrix=text.getCTM(),label=text.textContent?.trim();
        if(!matrix||!label||getComputedStyle(text).display==='none'||text.closest('[hidden],[visibility="hidden"],defs'))continue;
        const x=text.x.baseVal.numberOfItems?text.x.baseVal.getItem(0).value:0;
        const y=text.y.baseVal.numberOfItems?text.y.baseVal.getItem(0).value:0;
        signature.push(text.outerHTML,matrix.toString());
        solids.push({type:'label',points:[project(x,y,panelBase.inverse().multiply(matrix))],label,color:'#234359'});
      }
      for (const shape of panel.querySelectorAll<SVGGeometryElement>(
        "path,circle,ellipse,rect,line,polyline,polygon",
      )) {
        if (
          shape.closest("defs,marker,clipPath") ||
          getComputedStyle(shape).display === "none" ||
          shape.getAttribute("visibility") === "hidden" ||
          shape.closest('[visibility="hidden"]')
        )
          continue;
        const matrix = shape.getCTM();
        if (!matrix) continue;
        const transform = panelBase.inverse().multiply(matrix),
          style = getComputedStyle(shape),
          color =
            style.stroke !== "none"
              ? style.stroke
              : style.fill !== "none"
                ? style.fill
                : "#16847a";
        signature.push(shape.outerHTML, transform.toString());
        if (
          shape.tagName === "circle" &&
          style.fill !== "none" &&
          Number(shape.getAttribute("r")) > 2
        ) {
          const q = shape as SVGCircleElement;
          solids.push({
            type: "sphere",
            points: [
              project(q.cx.baseVal.value, q.cy.baseVal.value, transform),
            ],
            radius: Math.max(0.025, q.r.baseVal.value * scale),
            color,
          });
          continue;
        }
        let length = 0;
        try {
          length = shape.getTotalLength();
        } catch {
          continue;
        }
        if (length < 0.001) continue;
        const count = Math.min(160, Math.max(2, Math.ceil(length / 8))),
          points: Vec3[] = Array.from({ length: count + 1 }, (_, i) => {
            const p = shape.getPointAtLength((length * i) / count);
            return project(p.x, p.y, transform);
          });
        solids.push({ type: "line", points, color });
        if (
          ["rect", "polygon"].includes(shape.tagName) &&
          style.fill !== "none" &&
          points.length > 3
        )
          solids.push({
            type: "polygon",
            points: points.map((p) => [p[0], p[1], -0.06]),
            color,
            opacity: 0.4,
          });
      }
    }
    if (slug === "sections" && svg.dataset.sectionState) {
      const data = JSON.parse(svg.dataset.sectionState) as {
        vertices: Vec3[];
        edges: [number, number][];
        points: Vec3[];
      };
      signature.push(svg.dataset.sectionState);
      solids.length = 0;
      for (const [i, j] of data.edges)
        solids.push({
          type: "line",
          points: [data.vertices[i]!, data.vertices[j]!],
          color: "#408ec8",
        });
      if (data.points.length > 2)
        solids.push({
          type: "polygon",
          points: data.points,
          color: "#16847a",
          opacity: 0.65,
        });
    }
    if (slug === "interference" && svg.dataset.waveState) {
      const data = JSON.parse(svg.dataset.waveState) as {
        p: WaveInput;
        time: number;
      };
      signature.push(svg.dataset.waveState);
      solids.length = 0;
      for (let j = 0; j <= 18; j++) {
        const y = -8 + (16 * j) / 18;
        solids.push({
          type: "line",
          points: Array.from({ length: 33 }, (_, i) => {
            const x = -12 + (24 * i) / 32;
            return [
              x / 3,
              waveAt({ ...data.p, x, y }, data.time).sum * 0.3,
              y / 3,
            ] as Vec3;
          }),
          color: j % 2 ? "#408ec8" : "#16847a",
        });
      }
      solids.push({
        type: "sphere",
        points: [
          [data.p.x / 3, waveAt(data.p, data.time).sum * 0.3, data.p.y / 3],
        ],
        radius: 0.08,
        color: "#c38b28",
      });
    }
    if (slug === "resistors" || slug === "capacitors" || slug === "circuits") {
      const target = document.querySelector(
          slug === "resistors"
            ? "#divider-output-label"
            : slug === "circuits"
              ? "#circuit-voltage"
              : "#rc-voltage",
        ),
        voltage = parseFloat(target?.textContent ?? "0");
      signature.push(target?.textContent ?? "");
      if (Number.isFinite(voltage))
        solids.push({
          type: "line",
          points: [
            [3, -2, 0],
            [3, -2 + voltage * 0.4, 0],
          ],
          color: "#c38b28",
        });
    }
    let hash = 2166136261;
    for (const char of signature.join(""))
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    root!.dataset.geometryHash = (hash >>> 0).toString(16);
    root!.dataset.geometryCount = String(solids.length);
    const readings = [
      ...document.querySelectorAll<HTMLElement>(
        ".readouts dd,.study-live dd,.geo-readings dd,.electric-readings dd,[data-circuit-reading],.wave-readings dd",
      ),
    ]
      .slice(0, 8)
      .map((x) => x.innerText.trim());
    summary.textContent = readings.length
      ? `同步读数：${readings.join(" · ")}`
      : "几何与上方实时构造同步；测量值请对照原实验仪表。";
    return {
      metrics: [],
      drawing: "",
      note: "同源二维几何重建的空间装置",
      status: "valid",
      curves: [],
      solids,
    };
  }
  function paint() {
    frame = 0;
    if (!scene || departed || document.hidden) return;
    scene.update(observation());
    root!.dataset.revision = String(++revision);
  }
  const observer = new MutationObserver(() => {
    if (scene && !frame) frame = requestAnimationFrame(paint);
  });
  function watch() {
    if (svg)
      observer.observe(svg, {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true,
      });
    if (slug === "three-body")
      observer.observe(document.querySelector("#three-b")!, {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true,
      });
    if (svg && ["capacitors", "resistors"].includes(slug))
      observer.observe(document.querySelector(".study-live") ?? svg, {
        subtree: true,
        childList: true,
        characterData: true,
      });
  }
  function close() {
    scene?.dispose();
    scene = undefined;
    host.hidden = true;
    camera.hidden = true;
    button.textContent = "打开三维视图";
    button.setAttribute("aria-expanded", "false");
  }
  async function open() {
    if (opening || departed || !svg) return;
    opening = true;
    host.hidden = false;
    try {
      const { createDiscoveryScene } = await import("../discovery/scene");
      if (departed) {
        host.hidden = true;
        return;
      }
      scene = createDiscoveryScene(
        host,
        ["orbit", "three-body"].includes(slug),
        `legacy-${slug}`,
        () => {
          close();
          note.textContent = "WebGL不可用，已保留上方二维实验与测量。";
        },
      );
      scene.update(observation());
      root!.dataset.revision = String(++revision);
      camera.hidden = false;
      button.textContent = "收起三维视图";
      button.setAttribute("aria-expanded", "true");
      note.textContent =
        slug === "three-body"
          ? "三维已同步两套宇宙：左侧A原始初态，右侧B扰动初态；相同时间、相同比例，可旋转对照轨迹。"
          : "三维已同步：平面对象保留其几何平面；可旋转检查位置与连接，仪器厚度为示意。";
    } catch {
      close();
      note.textContent = "三维暂不可用，请继续使用上方二维实验和测量。";
    } finally {
      opening = false;
    }
  }
  button.disabled = !svg;
  root.dataset.ready = svg ? "true" : "missing";
  button.addEventListener("click", () => (scene ? close() : void open()));
  root
    .querySelectorAll<HTMLButtonElement>("[data-legacy-camera]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        scene?.setView(b.dataset.legacyCamera!),
      ),
    );
  document.addEventListener("input", () => {
    if (scene && !frame) frame = requestAnimationFrame(paint);
  });
  document.addEventListener("change", () => {
    if (scene && !frame) frame = requestAnimationFrame(paint);
  });
  watch();
  window.addEventListener("pagehide", () => {
    departed = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    close();
  });
  window.addEventListener("pageshow", () => {
    departed = false;
    watch();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && scene) paint();
  });
}
