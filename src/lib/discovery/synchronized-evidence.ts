import {
  circle,
  line,
  path,
  label,
  format,
  type Inputs,
  type Observation,
} from "./core.ts";
import { diagramSolids } from "./diagram-solids.ts";
/** Instrument geometry uses the same solved measurements in both views. */
export function synchronizedEvidence(
  id: string,
  p: Inputs,
  o: Observation,
): Observation {
  const v = (key: string) => o.metrics.find((m) => m.key === key)?.value ?? 0;
  const gold = "#c38b28",
    blue = "#408ec8";
  let drawing = "";
  const gauge = (
    x: number,
    y: number,
    value: number,
    caption: string,
    color: string,
  ) => {
    const angle = (value * Math.PI) / 6;
    return (
      circle(x, y, 30, color, false) +
      line(x, y, x + 25 * Math.sin(angle), y - 25 * Math.cos(angle), color, 3) +
      label(x - 65, y + 55, caption, color, 14)
    );
  };
  switch (id) {
    case "P01": {
      const length = 20 + 55 * Math.log1p(v("acceleration"));
      drawing =
        line(620, 300, 620 + length, 300, gold, 4) +
        circle(620 + length, 300, 5, gold) +
        label(
          530,
          345,
          `加速度矢量示意 ${format(v("acceleration"))} m/s²`,
          gold,
          14,
        );
      // Equal acceleration for different masses is itself evidence; show the independent weight.
      drawing +=
        line(650, 160, 650, 160 + Math.min(110, p.mass! * 9.8 * 2), blue, 4) +
        label(535, 145, `重力 ${format(p.mass! * 9.8)} N · 长度示意`, blue, 14);
      break;
    }
    case "P07": {
      const h = Math.max(0, Math.min(240, (v("temperature") - 20) * 3));
      drawing =
        line(500, 360, 500, 360 - h, "#c85b46", 8) +
        circle(500, 360, 10, "#c85b46") +
        label(540, 345, `${format(v("temperature"))} °C`, "#c85b46", 16);
      break;
    }
    case 'P08': {
      const h=Math.max(0,Math.min(240,(v('temperature')-250)/3));
      drawing=line(620,370,620,370-h,'#c85b46',8)+circle(620,370,9,'#c85b46')+label(545,410,`气体 ${format(v('temperature'))} K`,'#c85b46',15);
      break;
    }
    case "C04":
      drawing =
        gauge(80, 170, v("earth"), `地球 ${format(v("earth"))}年`, blue) +
        gauge(710, 170, v("ship"), `船钟 ${format(v("ship"))}年`, gold) +
        label(270, 435, "表盘每圈12年；数值含完整圈数", blue, 15);
      break;
    case "C08": {
      const amplitude = 8 + 50 / (1 + Math.exp(-v("snr") / 20));
      drawing =
        path(
          Array.from({ length: 121 }, (_, i) => [
            270 + 2 * i,
            235 + amplitude * Math.sin((i * Math.PI) / 10),
          ]),
          blue,
          3,
        ) + label(240, 375, `SNR ${format(v("snr"))} dB · 包络示意`, blue, 15);
      break;
    }
    case "C09": {
      const f = v("current_frequency");
      drawing =
        path(
          Array.from({ length: 201 }, (_, i) => [
            100 + 3 * i,
            340 - 25 * Math.sin(((2 * Math.PI * f * i) / 200) * 0.2),
          ]),
          gold,
          3,
        ) +
        label(100, 410, "0.2秒波形窗 · 振幅放大，不是空间位移比例", gold, 14);
      break;
    }
    case "S04": {
      const displacement = o.metrics.find(
        (m) => m.key === "probe_deflection",
      )?.value;
      const end =
        displacement === null || displacement === undefined
          ? 0
          : 100 * Math.tanh(displacement / 5);
      drawing =
        line(620, 90, 620 + end, 90, gold, 4) +
        circle(620 + end, 90, 7, gold) +
        label(
          430,
          60,
          displacement === null
            ? "探测位移：失稳时不定义"
            : `1N探测位移 ${format(displacement ?? null)} mm · 放大示意`,
          gold,
          14,
        );
      break;
    }
    case "S10": {
      const power = v("initial_flow"),
        length = 35 + 55 * Math.log1p(Math.abs(power) / 100);
      drawing =
        line(540, 240, 540 + Math.min(190, length), 240, "#c85b46", 5) +
        circle(540 + Math.min(190, length), 240, 6, "#c85b46") +
        label(
          470,
          305,
          `热流 ${format(power)} W · 对数长度示意`,
          "#c85b46",
          14,
        );
      const h=Math.max(0,Math.min(180,(v('temperature')+20)*3));
      drawing+=line(120,370,120,370-h,blue,8)+circle(120,370,9,blue)+label(60,430,`室温 ${format(v('temperature'))} °C`,blue,15);
      break;
    }
  }
  return drawing
    ? {
        ...o,
        drawing: o.drawing + `<g data-evidence-instrument="true">${drawing}</g>`,
        solids: [
          ...(o.solids?.length ? o.solids : diagramSolids(o.drawing)),
          ...diagramSolids(drawing).map(s=>({...s,role:'instrument' as const})),
        ],
      }
    : o;
}
