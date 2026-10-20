import test from 'node:test';
import assert from 'node:assert/strict';
import {modelById} from '../src/lib/discovery/registry.ts';
import {defaults,solveModel} from '../src/lib/discovery/core.ts';
import {tidalDistanceToX,tidalXToDistance,tidalWorldXToDistance} from '../src/lib/discovery/tidal.ts';
import {apparatusSignature,spatialSignature,probeResponses} from '../src/lib/discovery/experience-audit.ts';
const model=modelById('C07');
const state=(p:Record<string,number>)=>solveModel(model,{...defaults(model),...p});
const value=(o:ReturnType<typeof state>,key:string)=>o.metrics.find(m=>m.key===key)!.value!;
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=Math.max(1e-20,Math.abs(b)*1e-10),`${a} != ${b}`);
test('tidal evidence obeys inverse cube and radius/density invariants independently of UI',()=>{
 const far=state({distance:1500}),close=state({distance:750});
 near(value(close,'tidal')/value(far,'tidal'),8);near(value(close,'self'),value(far,'self'));
 near(value(far,'tidal'),2*6.6743e-11*1.98847e30*100000/(1500e6)**3);
 const dense=state({density:12}),base=state({density:3});
 near(value(dense,'self')/value(base,'self'),4);near(value(dense,'roche')/value(base,'roche'),4**(-1/3));
 near(value(dense,'tidal'),value(base,'tidal'));
 const large=state({radius:200});near(value(large,'ratio'),value(base,'ratio'));
 assert.notEqual(value(base,'roche')/value(base,'distance'),value(base,'ratio'),'Roche boundary and local force ratio are distinct');
});
test('main body and force evidence respond without relying on captions or gauges',()=>{
 const a=state({distance:1500}),b=state({distance:750}),dense=state({density:12});
 assert.notEqual(apparatusSignature(a),apparatusSignature(b));assert.notEqual(spatialSignature(a),spatialSignature(b));
 const body=(o:ReturnType<typeof state>)=>o.solids!.find(s=>s.handle==='distance')!;
 assert.ok(body(b).points[0]![0]<body(a).points[0]![0]);
 assert.notEqual(spatialSignature(state({density:3})),spatialSignature(dense));
 assert.ok(!probeResponses(model).some(p=>p.error||!p.apparatusChanged||!p.spatialChanged));
 assert.match(a.note,/不求解真实形变/);
 assert.equal(a.curves[0]!.unitX,'千km');
});
test('distance screen mapping and spatial dragging roundtrip across the supported range',()=>{
 for(const d of [100,250,750,1000,1500,2000]){
  near(tidalXToDistance(tidalDistanceToX(d)),d);
  near(tidalWorldXToDistance((tidalDistanceToX(d)-400)/70),d);
 }
});
test('screening rejects text-only and auxiliary-gauge response as primary phenomenon',()=>{
 const a=state({distance:1500});
 const fake={...a,drawing:a.drawing.replace('中心天体','不同文字')+'<g data-evidence-instrument="true"><line x1="0" y1="0" x2="10" y2="20"/></g>',solids:[...a.solids!,{type:'sphere' as const,points:[[100,100,100] as [number,number,number]],radius:2,role:'instrument' as const}]};
 assert.equal(apparatusSignature(a),apparatusSignature(fake));assert.equal(spatialSignature(a),spatialSignature(fake));
});
