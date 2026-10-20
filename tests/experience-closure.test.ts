import {demonstrationValue} from '../src/lib/discovery/demonstration.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {models,modelById} from '../src/lib/discovery/registry.ts';
import {defaults,solveModel} from '../src/lib/discovery/core.ts';
import {probeResponses,responseSignature} from '../src/lib/discovery/experience-audit.ts';
import {evidenceCoordinate,responseEvidence} from '../src/lib/discovery/response-evidence.ts';
const value=(id:string,key:string,changes={})=>{const m=modelById(id);return solveModel(m,{...defaults(m),...changes}).metrics.find(m=>m.key===key)!.value!;};
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<Math.max(1e-20,Math.abs(b)*1e-10),`${a} != ${b}`);
test('all baseline response findings have visible evidence at meaningful process states',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('../doc/assets/experience-audit/report.json',import.meta.url),'utf8'));
 assert.equal(baseline.rows.flatMap((r:any)=>r.findings).length,60);
 for(const row of baseline.rows.filter((r:any)=>r.findings.length)){
  const m=modelById(row.id),probes=probeResponses(m);
  assert.ok(responseEvidence[m.id],m.id);
  assert.ok(responseSignature(solveModel(m,defaults(m))),m.id);
  for(const c of m.controls.filter(c=>c.key!==m.time?.key)){
   const checks=probes.filter(p=>p.key===c.key);
   assert.ok(checks.every(p=>!p.error),`${m.id}.${c.key} solver error`);
   assert.ok(checks.some(p=>p.apparatusChanged||p.spatialChanged||p.responseChanged||p.rateChanged||p.curvesChanged),`${m.id}.${c.key} no visible or process response`);
  }
 }
});
test('independent scientific ratios remain correct while evidence is improved',()=>{
 near(value('P07','power',{current:4})/value('P07','power',{current:2}),4);
 near(value('P28','flow',{area:.1})/value('P28','flow',{area:.05}),2);
 near(value('P26','work',{heat:2000})/value('P26','work',{heat:1000}),2);
 near(value('C09','strain',{distance:800})/value('C09','strain',{distance:400}),.5);
 near(value('C17','peak',{temperature:12000})/value('C17','peak',{temperature:6000}),.5);
 near(value('C17','luminosity',{temperature:12000})/value('C17','luminosity',{temperature:6000}),16);
 near(value('C24','hill',{orbit:2})/value('C24','hill',{orbit:1}),2);
 near(value('M28','posterior',{population:20000}),value('M28','posterior',{population:10000}));
 near(value('M28','true',{population:20000})/value('M28','true',{population:10000}),2);
 near(value('S06','velocity',{omega:2})/value('S06','velocity',{omega:1}),2);
 const t=modelById('S06').time!;near(t.rateAt!({...defaults(modelById('S06')),omega:2}),360/Math.PI);
 near(t.rateAt!({...defaults(modelById('S06')),omega:0}),0);
});
test('conditional controls respond in their valid conditions without fabricating invariants',()=>{
 near(value('P01','acceleration',{mass:1}),value('P01','acceleration',{mass:2}));
 near(value('P01','acceleration',{kinetic:.5}),value('P01','acceleration',{kinetic:0}));
 assert.ok(value('P01','acceleration',{static:.4,theta:45,kinetic:.3})<value('P01','acceleration',{static:.4,theta:45,kinetic:0}));
 near(value('C05','temperature',{emissivity:.2}),0);
 assert.ok(value('C05','temperature',{reflectivity:.5,emissivity:.2})>value('C05','temperature',{reflectivity:.5,emissivity:.8}));
});
test('evidence mapping is signed, monotonic and does not wrap or saturate',()=>{
 for(const ref of [1e-22,1,1e20]){
  near(evidenceCoordinate(0,ref),0);
  const xs=[-1e6,-10,-1,0,1,10,1e6].map(x=>evidenceCoordinate(x*ref,ref));
  assert.ok(xs.every((v,i)=>i===0||v>xs[i-1]!));
 }
 for(const m of models.filter(m=>responseEvidence[m.id])){
  const o=solveModel(m,defaults(m));
  assert.ok(o.solids?.some(s=>s.role==='instrument'),m.id);
  for(const s of o.solids!.filter(s=>s.type==='label'&&s.role==='instrument'))assert.ok(s.scale&&s.scale[0]<=3.3&&s.scale[1]<=.5,`${m.id}: evidence labels fit their column`);
  assert.ok(!o.drawing.includes('NaN')&&!o.drawing.includes('Infinity'),m.id);
 }
});

test('every shared workbench has a named process or parameter demonstration',()=>{
 for(const m of models){
  assert.ok(m.time||m.demonstration,m.id);
  if(m.demonstration){const d=m.demonstration,c=m.controls.find(c=>c.key===d.key)!;assert.ok(c,m.id);assert.ok(d.from>d.to&&d.to>=c.min&&d.from<=c.max&&d.step>0,m.id);}
 }
});

test('every parameter scan solves across its full range, including discrete polygon counts',()=>{
 for(const m of models.filter(m=>m.demonstration)){
  const d=m.demonstration!,c=m.controls.find(c=>c.key===d.key)!;
  for(let i=0;i<=20;i++){
   const v=demonstrationValue(m,d.from+(d.to-d.from)*i/20),p={...defaults(m),[d.key]:v};
   if(m.id==='M02')p.slice=Math.min(p.slice!,p.height!);
   if(m.id==='M05')p.distance=Math.min(p.distance!,2*(p.width!+p.height!));
   assert.doesNotThrow(()=>solveModel(m,p),`${m.id}.${c.key}=${v}`);
   if(c.step===1)assert.ok(Number.isInteger(v),m.id);
  }
 }
});

test('a zero default uses a readable unit reference, preserving small scientific reference values',()=>{
 const m=modelById('P01'),o=solveModel(m,{...defaults(m),static:.4,kinetic:.2});
 const marks=responseSignature(o);
 assert.ok(marks.length>0);
 // A joule-scale loss must move the pointer appreciably, rather than normalize by 1e-30.
 const circles=[...marks.matchAll(/<circle cx="([^"]+)" cy="530"/g)].map(m=>Number(m[1]));
 assert.ok(circles[2]!>650,JSON.stringify(circles));
});
test('solar sail force drawing preserves vector direction under nonlinear magnitude scaling',()=>{
 const m=modelById('C05'),o=solveModel(m,{...defaults(m),angle:35,area:100,radius:.5});
 const match=o.drawing.match(/<path d="M450 230L([^\s"]+) ([^\s"]+)"/)!;
 assert.ok(match);
 const dx=Number(match[1])-450,dy=Number(match[2])-230;
 const fx=o.metrics.find(m=>m.key==='force_x')!.value!,fy=o.metrics.find(m=>m.key==='force_y')!.value!;
 near(-dy/dx,fy/fx);assert.ok(Math.hypot(dx,dy)<=150);
});
