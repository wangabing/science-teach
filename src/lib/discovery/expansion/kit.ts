import {
  control,
  metric,
  obs,
  curve,
  sample,
  line,
  path,
  circle,
  rect,
  label,
  format,
  colors,
  type Inputs,
  type Model,
  type Observation,
  type Solid,
  type Vec3,
  type Curve,
} from "../core.ts";
import type { Studio } from "../../../data/discovery-studios.ts";
import type { Experience } from "../../../data/discovery-experiences.ts";
import { experimentContexts } from "../../../data/experiment-contexts.ts";
export { control as c, metric as m, curve, sample, format, colors };
export type { Inputs, Observation, Solid, Vec3, Curve };
export type Point = [number, number];
/** A physical drawing and its spatial geometry are authored together, never rasterized. */
export class Apparatus {
  drawing = "";
  solids: Solid[] = [];
  dark: boolean;
  constructor(dark = false) {
    this.dark = dark;
  }
  v([x, y]: Point, z = 0): Vec3 {
    return [(x - 400) / 65, (230 - y) / 65, z];
  }
  line(a: Point, b: Point, color = colors.teal, z = 0) {
    this.drawing += line(...a, ...b, color);
    this.solids.push({
      type: "line",
      points: [this.v(a, z), this.v(b, z)],
      color,
    });
    return this;
  }
  arrow(a:Point,b:Point,color=colors.red,z=0) {
    this.line(a,b,color,z);
    const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),size=8;
    this.line(b,[b[0]-size*Math.cos(angle-.45),b[1]-size*Math.sin(angle-.45)],color,z)
      .line(b,[b[0]-size*Math.cos(angle+.45),b[1]-size*Math.sin(angle+.45)],color,z);
    return this;
  }
  prism(points:Point[],color=colors.teal,depth=.4) {
    this.drawing+=path(points,color,2,true);
    for(const z of [-depth/2,depth/2])this.solids.push({type:'polygon',points:points.map(p=>this.v(p,z)),color,opacity:.9});
    for(let i=0;i<points.length;i++)this.solids.push({type:'polygon',points:[this.v(points[i]!,-depth/2),this.v(points[(i+1)%points.length]!,-depth/2),this.v(points[(i+1)%points.length]!,depth/2),this.v(points[i]!,depth/2)],color,opacity:.9});
    return this;
  }
  trace(points: Point[], color = colors.teal, z = 0) {
    this.drawing += path(points, color);
    this.solids.push({
      type: "line",
      points: points.map((p) => this.v(p, z)),
      color,
    });
    return this;
  }
  plate(points: Point[], color = colors.teal, z = 0) {
    this.drawing += path(points, color, 2, true);
    this.solids.push({
      type: "polygon",
      points: points.map((p) => this.v(p, z)),
      color,
      opacity: 0.48,
    });
    return this;
  }
  box(
    x: number,
    y: number,
    w: number,
    h: number,
    color = colors.teal,
    depth = 0.35,
  ) {
    this.drawing += rect(x, y, w, h, color);
    const a: Point[] = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
    for (const z of [-depth / 2, depth / 2])
      this.solids.push({
        type: "polygon",
        points: a.map((p) => this.v(p, z)),
        color,
        opacity: color===colors.blue?0.25:0.88,
      });
    for (let i = 0; i < 4; i++)
      this.solids.push({
        type: "polygon",
        points: [
          this.v(a[i]!, -depth / 2),
          this.v(a[(i + 1) % 4]!, -depth / 2),
          this.v(a[(i + 1) % 4]!, depth / 2),
          this.v(a[i]!, depth / 2),
        ],
        color,
        opacity: color===colors.blue?0.25:0.88,
      });
    return this;
  }
  ball(x: number, y: number, r: number, color = colors.gold, z = 0) {
    this.drawing += circle(x, y, r, color);
    this.solids.push({
      type: "sphere",
      points: [this.v([x, y], z)],
      radius: r / 65,
      color,
    });
    return this;
  }
  ring(x: number, y: number, r: number, color = colors.teal, z = 0) {
    const pts = Array.from(
      { length: 97 },
      (_, i) =>
        [
          x + r * Math.cos((i * Math.PI) / 48),
          y + r * Math.sin((i * Math.PI) / 48),
        ] as Point,
    );
    return this.trace(pts, color, z);
  }
  text(
    x: number,
    y: number,
    text: string,
    color = this.dark ? "#95dae8" : colors.ink,
  ) {
    this.drawing += label(x, y, text, color, 17);
    this.solids.push({type:"label",points:[this.v([x,y],0.25)],label:text,color});
    return this;
  }
  /** Extruded wheel: the rim, faces, hub and shaft remain visible off-axis. */
  wheel(x:number,y:number,r:number,angle=0,color=colors.teal,depth=0.32) {
    this.drawing += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-width="5"/>`;
    const rim = Array.from({length:49},(_,i)=>[x+r*Math.cos(i*Math.PI/24),y+r*Math.sin(i*Math.PI/24)] as Point);
    for (const z of [-depth/2,depth/2]) this.solids.push({type:"polygon",points:rim.slice(0,-1).map(p=>this.v(p,z)),color,opacity:0.92});
    for(let i=0;i<48;i++) this.solids.push({type:"polygon",points:[this.v(rim[i]!,-depth/2),this.v(rim[i+1]!,-depth/2),this.v(rim[i+1]!,depth/2),this.v(rim[i]!,depth/2)],color,opacity:1});
    for(let i=0;i<4;i++) {
      const a=angle+i*Math.PI/2;
      this.line([x,y],[x+r*.82*Math.cos(a),y+r*.82*Math.sin(a)],i===0?colors.gold:colors.ink,depth/2+0.025);
    }
    this.solids.push({type:"tube",points:[this.v([x,y],-.65),this.v([x,y],.55)],radius:0.075,color:colors.ink});
    this.drawing += circle(x,y,6,colors.ink);
    return this;
  }
  /** A physical closed belt with width in z, not two disconnected tangents. */
  belt(points:Point[],color=colors.gold,depth=.22) {
    this.drawing += path(points,color,6);
    for(let i=0;i<points.length-1;i++) this.solids.push({type:"polygon",points:[this.v(points[i]!,-depth/2),this.v(points[i+1]!,-depth/2),this.v(points[i+1]!,depth/2),this.v(points[i]!,depth/2)],color,opacity:1});
    return this;
  }
  spring(x:number,y:number,length:number,r=18,turns=8,color=colors.teal) {
    const points=Array.from({length:turns*24+1},(_,i)=>{const t=i/(turns*24),a=t*turns*2*Math.PI;return [x+t*length,y+r*Math.cos(a)] as Point;});
    this.drawing+=path(points,color,3);
    this.solids.push({type:'tube',points:points.map((p,i)=>this.v(p, r/65*Math.sin(i/(turns*24)*turns*2*Math.PI))),radius:.025,color});
    return this;
  }
  coil(x:number,top:number,height:number,r:number,turns:number,color=colors.teal) {
    const samples=Array.from({length:turns*24+1},(_,i)=>{const t=i/(turns*24),a=t*turns*2*Math.PI;return {p:[x+r*Math.cos(a),top+height*t] as Point,z:r/65*Math.sin(a)};});
    this.drawing+=path(samples.map(s=>s.p),color,3);
    this.solids.push({type:'tube',points:samples.map(s=>this.v(s.p,s.z)),radius:.024,color});
    return this;
  }
  gear(x:number,y:number,r:number,teeth:number,angle:number,color=colors.teal) {
    this.wheel(x,y,r*.9,angle,color,.28);
    // Teeth are illustrative; pitch-circle radii, not rendered tooth tips, define the ratios.
    const points=Array.from({length:teeth*4+1},(_,i)=>{const a=angle+i*Math.PI*2/(teeth*4),rr=r*(i%4===1||i%4===2?1.03:.94);return [x+rr*Math.cos(a),y+rr*Math.sin(a)] as Point;});
    this.drawing+=path(points,color,2);
    for(const z of [-.14,.14])this.solids.push({type:'line',points:points.map(p=>this.v(p,z)),color});
    return this;
  }
  base() {
    return this.box(70, 385, 660, 14, colors.ink, 0.7);
  }
  finish(
    metrics: ReturnType<typeof metric>[],
    note: string,
    curves: Curve[] = [],
    status: Observation["status"] = "valid",
  ) {
    return obs(metrics, this.drawing, note, curves, status, this.solids);
  }
}
interface Config {
  id: string;
  slug: string;
  name: string;
  question: string;
  topic: string;
  stage?: string;
  known: string;
  proof: string;
  history: string;
  era: string;
  source: string;
  sourceTitle: string;
  controls: Model["controls"];
  compare: string;
  metric: string;
  scenes: [string, number, string, number];
  counter: Inputs;
  invitation: string;
  look: string;
  hint: string;
  legend: [string, string, string];
  transfer: string;
  solve: (p: Inputs) => Observation;
  time?: Model["time"];
  drag?: Model["drag"];
}
export interface Addition {
  model: Model;
  studio: Studio;
  experience: Experience;
}
export function define(q: Config): Addition {
  const motion:Record<string,Model['time']>={
    P11:{key:'progress',max:1,rate:.25,caption:'完整飞行过程用4秒展示；进度不是物理秒数。'},
    P13:{key:'angle',max:360,rate:30,loop:true,rateAt:p=>p.speed!/p.radius!*180/Math.PI*.2,caption:'圆周运动按真实角速度的0.2倍慢放。'},
    P21:{key:'phase',max:360,rate:30,loop:true,rateAt:p=>p.mode!*Math.sqrt(p.tension!/.01)/(2*p.length!)*360*.005,caption:'振动按真实频率的0.005倍慢放。'},
    M25:{key:'angle',max:360,rate:45,caption:'匀速扫出旋转体；构造过程，不是动力学。'},
    M29:{key:'angle',max:360,rate:35,loop:true,caption:'逐步改变乘数辐角，观察乘法的旋转。'},
    C11:{key:'phase',max:360,rate:30,loop:true,rateAt:p=>30/(1-p.eccentricity!*Math.cos(p.phase!*Math.PI/180)),caption:'平均近点角每秒推进30°；偏近点角按等面积运动推进。'},
    C13:{key:'phase',max:1,rate:.12,caption:'按偏近点角扫描位置，不是等时飞行。'},
    C14:{key:'position',max:1.5,rate:.35,caption:'沿星盘作等速位置扫描，不是实际公转周期。回到起点可看完整凌星。'},
    C15:{key:'phase',max:360,rate:30,loop:true,rateAt:p=>30/Math.pow(p.orbit!,1.5),caption:'1 AU周期压缩为12秒，其余遵守周期与半径的3/2次方关系。'},
    C21:{key:'time',max:24,rate:1,caption:'远处每小时压缩为1秒；近处固有时同步累计。'},
    S21:{key:'angle',max:360,rate:30,loop:true,caption:'匀速驱动输入杆；其余杆位置由几何约束决定。'},
  };
  if(!q.time&&motion[q.id]) q.time=motion[q.id];
  const space = (
    { P: "physics", M: "geometry", C: "cosmos", S: "structures" } as Record<
      string,
      string
    >
  )[q.id[0]!]!;
  const parameter = q.controls.find((c) => c.key === q.compare)!;
  if (!parameter) throw new Error(`Missing comparison ${q.id}`);
  return {
    model: {
      id: q.id,
      controls: q.controls,
      solve: p=>{
        const o=q.solve(p);
        const probes:Record<string,string|false>={P18:false,P19:false,P20:'time',P28:false,C15:'phase',C16:'distance',C17:false,M30:'probe',S27:false};
        const key=probes[q.id]??q.compare;
        return {...o,curves:o.curves.map(curve=>({...curve,...(q.id==='C17'?{probe:o.metrics.find(m=>m.key==='peak')!.value!}:key?{probe:p[key]}:{})}))};
      },
      time: q.time,
      drag: q.drag,
      spatial: true,
    },
    studio: {
      id: q.id,
      slug: q.slug,
      name: q.name,
      title: q.question,
      space,
      topic: q.topic,
      stage: q.stage ?? "高中定量 · 初中直观拓展",
      known: q.known,
      task: `${q.invitation} 固定其他条件，亲手将${parameter.label}分别设为${q.scenes[1]}和${q.scenes[3]}${parameter.unit}，各核验一次；${q.look}`,
      compare: q.compare,
      conditions: [q.scenes[1],q.scenes[3]],
      metric: q.metric,
      proof: q.proof,
      counter: q.counter,
      transfer: q.transfer,
      era: experimentContexts[q.id]?.period ?? q.era,
      history: experimentContexts[q.id]?.lead ?? q.history,
      source: q.source,
      sourceTitle: q.sourceTitle,
      group: q.topic.split(" · ")[0]!,
    },
    experience: {
      primary: [
        q.compare,
        ...q.controls
          .filter((c) => c.key !== q.compare)
          .slice(0, 2)
          .map((c) => c.key),
      ],
      invitation: q.invitation,
      look: q.look,
      hint: q.hint,
      legend: q.legend,
      scenes: [
        {
          name: q.scenes[0],
          detail: `${parameter.label} ${q.scenes[1]} ${parameter.unit}`,
          inputs: { [q.compare]: q.scenes[1] },
        },
        {
          name: q.scenes[2],
          detail: `只改变${parameter.label} ${q.scenes[3]} ${parameter.unit}`,
          inputs: { [q.compare]: q.scenes[3] },
        },
      ],
    },
  };
}
export const source = {
  physics: "https://openstax.org/details/books/university-physics-volume-1",
  waves: "https://openstax.org/details/books/university-physics-volume-3",
  electric: "https://openstax.org/details/books/university-physics-volume-2",
  math: "https://mathworld.wolfram.com/",
  space: "https://science.nasa.gov/",
  engineering:
    "https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Statics%3A_Open_and_Interactive_(Baker_and_Haynes)",
};
export const pi = Math.PI,
  deg = (x: number) => (x * pi) / 180;
export const graph = (
  name: string,
  xunit: string,
  yunit: string,
  min: number,
  max: number,
  f: (x: number) => number,
) => curve(name, xunit, yunit, sample(min, max, 81, f));
export function gaugeBoard(
  value: number,
  reference: number,
  title: string,
  dark = false,
) {
  const b = new Apparatus(dark);
  b.ring(400, 225, 125, colors.blue)
    .line(
      [400, 225],
      [
        400 + 110 * Math.sin((value / reference) * pi * 0.75),
        225 - 110 * Math.cos((value / reference) * pi * 0.75),
      ],
      colors.gold,
    )
    .ball(400, 225, 7)
    .text(285, 405, `${title} ${format(value)}`);
  return b;
}
