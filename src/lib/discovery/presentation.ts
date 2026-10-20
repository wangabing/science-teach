/** Presentation only: measurements always come from Observation; no independent simulation. */
import {
  escape,
  format,
  line,
  path,
  circle,
  label,
  arrow,
  rad,
  type Inputs,
  type Observation,
} from "./core.ts";
const ink = "#29485d",
  steel = "#8198a8",
  gold = "#bc842d",
  teal = "#148879";
const ticks = (
  x: number,
  y: number,
  length: number,
  vertical = false,
  count = 10,
) =>
  Array.from({ length: count + 1 }, (_, i) =>
    vertical
      ? line(
          x,
          y + (i * length) / count,
          x + (i % 5 ? 5 : 10),
          y + (i * length) / count,
          steel,
          1,
        )
      : line(
          x + (i * length) / count,
          y,
          x + (i * length) / count,
          y + (i % 5 ? 5 : 10),
          steel,
          1,
        ),
  ).join("");
const bolt = (x: number, y: number) =>
  circle(x, y, 5, "#8093a0") + line(x - 2, y, x + 2, y, "#e9f2f5", 1);
const support = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#apparatus-metal)" stroke="#8ca0ae"/>` +
  bolt(x + 8, y + 8) +
  bolt(x + w - 8, y + 8);
const ruler = (x: number, y: number, l: number, text: string) =>
  line(x, y, x + l, y, steel, 1) +
  ticks(x, y, l) +
  label(x, y + 30, text, steel, 14);
const dim = (x: number, y: number, l: number, text: string) =>
  line(x, y, x + l, y, steel, 1) +
  line(x, y - 6, x, y + 6, steel, 1) +
  line(x + l, y - 6, x + l, y + 6, steel, 1) +
  label(x + l / 2 - 25, y - 9, text, ink, 15);
const dial = (
  x: number,
  y: number,
  value: number | null,
  title: string,
  unit: string,
  captionColor = ink,
) =>
  `<g class="dis-instrument"><circle cx="${x}" cy="${y}" r="38" fill="#f7fbfd" stroke="#829ba9" stroke-width="3"/>${Array.from(
    { length: 9 },
    (_, i) => {
      const a = ((210 + i * 15) * Math.PI) / 180;
      return line(
        x + 28 * Math.cos(a),
        y + 28 * Math.sin(a),
        x + 33 * Math.cos(a),
        y + 33 * Math.sin(a),
        steel,
        1.5,
      );
    },
  ).join(
    "",
  )}${label(x - 27, y + 5, format(value), teal, 16)}${label(x - 25, y + 23, unit, steel, 11)}${label(x - 45, y + 60, title, captionColor, 14)}</g>`;
export function apparatusDrawing(id: string, p: Inputs, o: Observation) {
  const value = (k: string) =>
    o.metrics.find((m) => m.key === k)?.value ?? null;
  let behind = "",
    front = "",
    drawing = o.drawing;
  const stars = Array.from({ length: 54 }, (_, i) =>
    circle(
      20 + ((i * 137) % 760),
      12 + ((i * 83) % 438),
      i % 7 === 0 ? 1.5 : 0.7,
      i % 3 ? "#c5dcf5" : "#ffe0aa",
    ),
  ).join("");
  switch (id) {
    case "P01": {
      const a = rad(p.theta!),
        span = Math.min(500, 260 / Math.max(0.01, Math.sin(a))),
        ex = 110 + span * Math.cos(a),
        ey = 140 + span * Math.sin(a),
        s = value("distance") ?? 0,
        x = 110 + ((span * s) / p.length!) * Math.cos(a),
        y = 130 + ((span * s) / p.length!) * Math.sin(a);
      behind =
        path(
          [
            [110, 140],
            [ex, ey],
            [ex, 420],
            [110, 420],
          ],
          "#c5d4df",
          2,
          true,
        ) +
        support(82, 420, Math.min(650, ex - 55), 16) +
        ticks(110, 425, Math.min(600, ex - 110));
      front =
        `<g transform="translate(${x} ${y - 18}) rotate(${p.theta})"><rect x="-23" y="-18" width="46" height="27" rx="5" fill="url(#apparatus-teal)" stroke="#13695f" stroke-width="2"/>${line(-15, -12, 14, -12, "#c0f0e6", 2)}</g>` +
        label(85, 390, `θ = ${p.theta}°`, ink, 17) +
        dim(145, 65, 160, `L = ${p.length} m`);
      break;
    }
    case "P02": {
      behind =
        support(45, 308, 710, 22) + ruler(70, 355, 660, "直线导轨 · 向右为正");
      for (const match of drawing.matchAll(/<rect x="([^"]+)" y="255"/g)) {
        const x = Number(match[1]);
        front +=
          circle(x + 10, 307, 7, ink) +
          circle(x + 40, 307, 7, ink) +
          line(x + 5, 265, x + 44, 265, "#b7e5e1", 3);
      }
      front += label(
        80,
        420,
        `碰前动能 ${format(value("energy_before"))} J → 碰后 ${format(value("energy_after"))} J`,
        ink,
        17,
      );
      break;
    }
    case "P03":
      behind =
        support(55, 290, 650, 22) +
        ruler(180, 365, 360, "位移示意 · 并非真实比例");
      front = dial(680, 180, value("amplitude"), "稳态振幅", "m");
      break;
    case "P04":
      behind =
        line(400, 90, 400, 385, steel, 1, true) +
        line(95, 230, 705, 230, steel, 1, true);
      front = label(
        95,
        415,
        `P处电势 ${format(value("potential"))} V`,
        ink,
        18,
      );
      break;
    case "P05": {
      const x = 400 + (value("position") ?? p.z!) * 1150 - 50,
        left = p.polarity! > 0 ? "#4a90bc" : "#c95e4b",
        right = p.polarity! > 0 ? "#c95e4b" : "#4a90bc";
      behind = support(280, 340, 240, 20) + line(400, 300, 400, 340, steel, 5);
      front =
        `<rect x="${x}" y="210" width="50" height="50" rx="3" fill="${left}"/><rect x="${x + 50}" y="210" width="50" height="50" rx="3" fill="${right}"/>` +
        label(x + 18, 241, p.polarity! > 0 ? "S" : "N", "#ffffff", 20) +
        label(x + 68, 241, p.polarity! > 0 ? "N" : "S", "#ffffff", 20);
      front +=
        path(
          [
            [440, 145],
            [560, 145],
          ],
          gold,
          3,
        ) +
        line(560, 145, 595, p.closed ? 145 : 120, gold, 3) +
        path(
          [
            [595, 145],
            [595, 75],
            [650, 75],
          ],
          gold,
          3,
        ) +
        path(
          [
            [440, 315],
            [650, 315],
            [650, 165],
          ],
          gold,
          3,
        ) +
        ruler(115, 370, 520, "磁铁沿轴线运动 · 位置单位 m");
      break;
    }
    case "P06":
      behind =
        `<rect x="45" y="72" width="710" height="310" rx="18" fill="#e4f0fa" stroke="#b2c9d9"/>` +
        support(45, 194, 30, 90);
      front = label(90, 375, `速率 ${format(value("speed"))} m/s`, ink, 16);
      break;
    case "P07":
      behind =
        support(200, 380, 350, 18) +
        ticks(480, 125, 235, true) +
        line(500, 95, 500, 360, steel, 3);
      front =
        circle(500, 360, 9, "#c85b46") +
        dial(655, 120, value("input"), "输入电能", "J");
      break;
    case "P08":
      behind = support(210, 390, 350, 18) + ticks(220, 100, 270, true);
      front =
        label(55, 395, `输入 ${format(p.heat!)} J`, ink, 17) +
        label(555, 330, `做功 ${format(value("work"))} J`, gold, 17);
      break;
    case "P09":
      behind = `<rect x="72" y="43" width="656" height="374" rx="24" fill="#d9e6ea" stroke="#91a9b6" stroke-width="3"/>`;
      front =
        line(560, 380, 660, 380, ink, 4) +
        label(565, 405, "统计样本视野", ink, 14);
      break;
    case "P10":
      front =
        path(
          Array.from({ length: 37 }, (_, i) => {
            const a = (i * Math.PI) / 36;
            return [400 + 80 * Math.cos(a), 230 - 80 * Math.sin(a)] as [
              number,
              number,
            ];
          }),
          steel,
          1,
        ) + line(400, 135, 400, 325, steel, 1, true);
      break;
    case "M01":
      behind = line(395, 75, 395, 410, "#c1d9cf", 1, true);
      front = label(425, 420, `折角 ${p.fold}° · 面号可对应`, ink, 16);
      break;
    case "M02":
      behind = ruler(68, 95, 0, "");
      front =
        ticks(78, 90, 280, true) +
        label(60, 400, `切片高度 ${format(value("slice_height"))} m`, gold, 16);
      break;
    case "M03":
      front =
        path(
          [
            [390, 257],
            [390, 245],
            [402, 248],
          ],
          gold,
          2,
        ) +
        label(
          70,
          410,
          `两方向点积：${format(value("dot_x"))} / ${format(value("dot_y"))}`,
          ink,
          18,
        );
      break;
    case "M04":
      behind =
        line(400, 80, 400, 395, steel, 1, true) +
        line(100, 240, 700, 240, steel, 1, true);
      front = label(510, 405, `倾角 ${p.angle}°`, ink, 17);
      break;
    case "M05":
      front = label(655, 405, `s=${format(p.distance!)}`, ink, 16);
      break;
    case "M06":
      behind = ticks(330, 240, 410) + line(210, 98, 210, 382, steel, 1, true);
      front = label(390, 405, `sin θ = ${format(value("sin"))}`, teal, 18);
      break;
    case "M07":
      behind =
        line(400, 80, 400, 390, steel, 1, true) +
        line(80, 300, 720, 300, steel, 1, true);
      front = label(
        55,
        415,
        `Δx = ${format(p.delta!)} · 左右都试一试`,
        ink,
        17,
      );
      break;
    case "M08":
      behind = path(
        [
          [85, 70],
          [715, 70],
          [715, 410],
          [85, 410],
        ],
        "#b8cec4",
        2,
        true,
      );
      front = label(520, 440, `样本数 ${p.balls}`, ink, 16);
      break;
    case "M09":
      front = label(80, 415, `V − E + F = ${format(value("chi"))}`, ink, 20);
      break;
    case "M10":
      behind = path(
        [
          [115, 330],
          [390, 410],
          [690, 250],
          [415, 170],
        ],
        "#c3d4cd",
        2,
        true,
      );
      front = label(65, 410, `单胞占比 ${format(value("fraction"))}`, ink, 18);
      break;
    case "C01":
      behind = stars;
      front = label(45, 415, `固定探针 · ${p.planet} AU`, "#92c3d5", 17);
      break;
    case "C02":
      behind = stars;
      front = label(
        45,
        415,
        `${p.frame ? "惯性系" : "共转系"} · ${["L4", "L1", "L2"][p.point!]}`,
        "#92c3d5",
        17,
      );
      break;
    case "C03":
      behind = stars;
      front =
        circle(170, 400, 12, "#266ba1") +
        label(55, 435, "地球收发站", "#92c3d5", 16);
      break;
    case "C04":
      behind = stars;
      front =
        dial(70, 185, value("earth"), "地球钟", "年", "#92c3d5") +
        dial(710, 185, value("ship"), "飞船钟", "年", "#92c3d5");
      break;
    case "C05":
      behind = stars;
      front = label(
        50,
        410,
        `反射比例 ${format(p.reflectivity!)} · 转角 ${p.angle}°`,
        "#92c3d5",
        17,
      );
      break;
    case "C06":
      behind = stars;
      front = label(520, 430, `b = ${format(p.impact!)} M`, "#92c3d5", 18);
      break;
    case "C07":
      behind = stars;
      front = label(45, 410, `中心距 ${format(p.distance!)} 千km`, "#92c3d5", 17);
      break;
    case "C08":
      behind = stars;
      front =
        path(
          [
            [130, 330],
            [105, 410],
            [155, 410],
            [130, 330],
          ],
          "#ffd98a",
          2,
        ) +
        path(
          [
            [670, 330],
            [645, 410],
            [695, 410],
            [670, 330],
          ],
          "#68d8ee",
          2,
        );
      break;
    case "C09":
      behind = stars;
      front = label(
        500,
        60,
        `f = ${format(value("current_frequency"))} Hz`,
        "#ffd98a",
        18,
      );
      break;
    case "C10":
      behind = stars;
      front =
        label(65, 440, "低温差", "#68d8ee", 14) +
        `<rect x="165" y="428" width="180" height="10" fill="url(#apparatus-heat)"/>` +
        label(365, 440, "高温差 · 颜色放大", "#ffd98a", 14);
      break;
    case "S01":
      behind = support(70, 350, 660, 22) + ticks(100, 375, 600);
      front = dim(100, 410, 600, `跨度 ${p.span} m`);
      break;
    case "S02":
      behind =
        support(40, 115, 40, 260) +
        Array.from({ length: 14 }, (_, i) =>
          line(40, 120 + i * 18, 25, 135 + i * 18, steel, 2),
        ).join("");
      front = dim(80, 325, 600, `跨度 ${p.length} m`);
      break;
    case "S03":
      behind =
        support(200, 370, 400, 26) + ruler(235, 415, 330, "台面激励方向");
      front = arrow(115, 390, 60, 0, gold);
      break;
    case "S04":
      behind = path(
        [
          [100, 355],
          [400, 435],
          [700, 295],
          [400, 215],
        ],
        "#cbd7df",
        2,
        true,
      );
      front = label(45, 420, `索预张力 ${p.tension} N`, ink, 17);
      break;
    case "S05":
      behind = support(110, 350, 45, 65) + support(645, 350, 45, 65);
      front = dim(150, 430, 500, `跨度 ${p.span} m`);
      break;
    case "S06":
      behind = support(95, 295, 610, 18) + line(360, 260, 710, 260, steel, 7);
      front =
        bolt(180, 250) +
        label(65, 420, `转角 ${p.angle}° · ω=${p.omega} rad/s`, ink, 17);
      break;
    case "S07":
      behind =
        support(88, 63, 624, 18) +
        Array.from({ length: 17 }, (_, i) =>
          line(100 + i * 35, 65, 110 + i * 35, 50, steel, 2),
        ).join("");
      front = ticks(720, 130, 200, true);
      break;
    case "S08":
      behind = support(120, 390, 580, 18);
      front =
        ticks(150, 170, 170, true) +
        ticks(650, 110, 230, true) +
        label(
          80,
          430,
          `排液体积 ${format(p.small! * p.displacement!)} cm³`,
          ink,
          17,
        );
      break;
    case "S09":
      behind = path(
        [
          [100, 360],
          [400, 435],
          [700, 290],
          [400, 215],
        ],
        "#cbd7df",
        2,
        true,
      );
      front = label(45, 420, `折角 ${p.fold}° · 雪载 ${p.snow} Pa`, ink, 17);
      break;
    case "S10":
      behind = support(160, 390, 480, 20);
      front =
        line(270, 230, 270, 308, "#a8d9f5", 3) +
        line(275, 265, 390 + p.window! * 3, 265, "#a8d9f5", 3) +
        label(640, 155, `${p.outdoor}°C`, steel, 18);
      break;
  }
  const defs = `<defs><linearGradient id="apparatus-metal" x2="0" y2="1"><stop stop-color="#edf5f9"/><stop offset=".5" stop-color="#b5c7d3"/><stop offset="1" stop-color="#90a6b5"/></linearGradient><linearGradient id="apparatus-teal" x2=".4" y2="1"><stop stop-color="#5ebcad"/><stop offset="1" stop-color="#147a70"/></linearGradient><linearGradient id="apparatus-heat"><stop stop-color="#5bb6d6"/><stop offset=".5" stop-color="#e8dba5"/><stop offset="1" stop-color="#d76b42"/></linearGradient></defs>`;
  // Paint only block apparatus; field arrows, mathematical polygons and water stay translucent.
  if (["P01", "P02", "P03", "S06"].includes(id))
    drawing = drawing.replace(/fill-opacity=".17"/g, 'fill-opacity=".8"');
  return `${defs}<g data-apparatus-detail="${escape(id)}" class="dis-apparatus-context">${behind}</g><g class="dis-model-geometry">${drawing}</g><g class="dis-apparatus-detail">${front}</g>`;
}
