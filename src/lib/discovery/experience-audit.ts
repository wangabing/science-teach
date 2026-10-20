import {defaults, solveModel, type Inputs, type Model, type Observation} from './core.ts';
import {responseEvidence} from './response-evidence.ts';
export function responseSignature(o:Observation){return o.drawing.match(/<g data-response-evidence="[^"]+">([\s\S]*?)<\/g>/)?.[1]?.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,'')??'';}
export function apparatusSignature(o:Observation) {
 return o.drawing
  .replace(/<g data-evidence-instrument="true">[\s\S]*?<\/g>/g,'')
  .replace(/<g data-response-evidence="[^"]+">[\s\S]*?<\/g>/g,'')
  .replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,'')
  .replace(/\s+/g,' ').trim();
}
export const spatialSignature=(o:Observation)=>JSON.stringify((o.solids??[]).filter(s=>s.type!=='label'&&s.role!=='instrument'));
export interface ResponseProbe {key:string;value:number;phase:string;metricsChanged:boolean;apparatusChanged:boolean;spatialChanged:boolean;responseChanged:boolean;rateChanged:boolean;curvesChanged:boolean;status:string;explanation?:string;error?:string}
export function probeResponses(model:Model):ResponseProbe[]{
 const initial=defaults(model);
 const states:{phase:string;p:Inputs}[]=[{phase:'initial',p:initial}];
 if(model.time){const c=model.controls.find(c=>c.key===model.time!.key)!;states.push({phase:'process',p:{...initial,[c.key]:c.min+(c.max-c.min)*.37}});}
 // Explicit contexts expose the two conditionally inactive controls, rather than waive them.
 if(model.id==='P01')states.push({phase:'sliding-friction',p:{...initial,static:.4,theta:45}});
 if(model.id==='C05')states.push({phase:'absorbing-sail',p:{...initial,reflectivity:.5}});
 const metrics=(o:Observation)=>JSON.stringify(o.metrics.map(m=>[m.key,m.value,m.unit]));
 return states.flatMap(({phase,p:base})=>model.controls.filter(c=>c.key!==model.time?.key).flatMap(c=>[c.min,c.max].filter(value=>value!==base[c.key]).map(value=>{
  const p:Inputs={...base,[c.key]:value};
  if(model.id==='M02')p.slice=Math.min(p.slice!,p.height!);
  if(model.id==='M05')p.distance=Math.min(p.distance!,2*(p.width!+p.height!));
  try{
   const before=solveModel(model,base),after=solveModel(model,p);
   return {key:c.key,value,phase,metricsChanged:metrics(before)!==metrics(after),apparatusChanged:apparatusSignature(before)!==apparatusSignature(after),spatialChanged:spatialSignature(before)!==spatialSignature(after),responseChanged:responseSignature(before)!==responseSignature(after),rateChanged:!!model.time?.rateAt&&model.time.rateAt(base)!==model.time.rateAt(p),curvesChanged:JSON.stringify(before.curves)!==JSON.stringify(after.curves),status:after.status,explanation:responseEvidence[model.id]?.reason};
  }catch(error){return {key:c.key,value,phase,metricsChanged:false,apparatusChanged:false,spatialChanged:false,responseChanged:false,rateChanged:false,curvesChanged:false,status:'error',error:String(error)};}
 })));
}
