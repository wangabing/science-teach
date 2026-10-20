import { addResponseEvidence } from './response-evidence.ts';
import {defaults} from './core.ts';
import {studios} from '../../data/discovery-studios.ts';
import { synchronizedEvidence } from "./synchronized-evidence.ts";
import { diagramSolids, diagramLabels } from "./diagram-solids.ts";
import { additions } from "./expansion/index.ts";
import { physicsModels } from "./physics.ts";
import { mathModels } from "./mathematics.ts";
import { cosmosModels } from "./cosmos.ts";
import { engineeringModels } from "./engineering.ts";
const baseModels = [
  ...[
    ...physicsModels,
    ...mathModels,
    ...cosmosModels,
    ...engineeringModels,
  ].map((model) => ({
    ...model,
    spatial: true,
    solve: (p: import("./core.ts").Inputs) => {
      const o = synchronizedEvidence(model.id, p, model.solve(p));
      return {
        ...o,
        // A handcrafted spatial model has its own coordinates; the diagram's
        // projected caption positions do not belong on its folded/curved surfaces.
        solids: o.solids?.length ? o.solids : [...diagramSolids(o.drawing),...diagramLabels(o.drawing)],
      };
    },
  })),
  ...additions.map((x) => x.model),
];
export const models = baseModels.map(model=>{
 const reference=model.solve(defaults(model));
 const key=studios.find(s=>s.id===model.id)!.compare;
 const primary=model.controls.find(c=>c.key===key)!;
 const c=primary.options?(model.controls.find(c=>!c.options)??primary):primary;
 return {...model,
  solve:(p:import('./core.ts').Inputs)=>addResponseEvidence(model.id,model.solve(p),reference),
  demonstration:model.demonstration??(!model.time&&c?{key:c.key,from:c.max,to:c.min,duration:10,step:c.step,title:`演示：扫描${c.label}`,caption:`从${c.max}到${c.min} ${c.unit}逐步改变${c.label}；这是条件比较，不是物理时间。暂停后可亲手调整。`}:undefined),
 };
});
export const modelById = (id: string) => models.find((m) => m.id === id)!;
