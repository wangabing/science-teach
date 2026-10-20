import test from 'node:test';
import assert from 'node:assert/strict';
import {additions} from '../src/lib/discovery/expansion/index.ts';
import {modelById} from '../src/lib/discovery/registry.ts';
import {defaults,solveModel,csv} from '../src/lib/discovery/core.ts';
import {beltPath} from '../src/lib/discovery/expansion/belt.ts';
import {experimentContexts} from '../src/data/experiment-contexts.ts';
import {studios} from '../src/data/discovery-studios.ts';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const state=(id:string,p:Record<string,number>)=>{const model=modelById(id),o=solveModel(model,{...defaults(model),...p});return {o,values:Object.fromEntries(o.metrics.map(m=>[m.key,m.value!]))};};
test('all eighty have authored historical situations and explanations distinct from derivations',()=>{
 assert.equal(Object.keys(experimentContexts).length,80);
 for(const {studio} of additions){const h=experimentContexts[studio.id]!;assert.ok(h.lead.includes('。'),studio.id);assert.ok(h.background.includes('。'),studio.id);assert.notEqual(h.background,studio.proof);assert.ok(h.href.startsWith('https://'));}
});
test('all control defaults can be represented exactly by their native slider steps',()=>{
 for(const studio of studios)for(const c of modelById(studio.id).controls)if(!c.options){
  const steps=(c.value-c.min)/c.step;
  assert.ok(Math.abs(steps-Math.round(steps))<1e-7,`${studio.id} ${c.key}: range would silently change the initial condition`);
 }
});
test('belt is a closed path with tangent contacts and no-slip equal rim speeds',()=>{
 for(const ratio of [.5,1,2,3]){
  const {points,L,R}=beltPath(ratio);near(points[0]![0],points.at(-1)![0]);near(points[0]![1],points.at(-1)![1]);
  const a=points[0]!,b=points[1]!,tangent=[b[0]-a[0],b[1]-a[1]];
  near((a[0]-L[0])*tangent[0]!+(a[1]-L[1])*tangent[1]!,0);
  near((b[0]-R[0])*tangent[0]!+(b[1]-R[1])*tangent[1]!,0);
  const {o,values:v}=state('S19',{ratio,speed:120,torque:3,time:.37});
  near(120*.1,v.speed*.1*ratio);near(v.torque*v.speed,3*120);near(v.output_turns*ratio,v.input_turns);near(v.belt_speed,120*2*Math.PI*.1/60);
  assert.ok(o.solids!.some(s=>s.type==='polygon'&&new Set(s.points.map(p=>p[2])).size>1),'belt and wheel have actual depth');
  assert.notDeepEqual(o.solids,state('S19',{ratio,time:.41}).o.solids);
 }
});
test('Atwood release follows the acceleration and continuous rope constraint before contact',()=>{
 for(const mass2 of [.5,1,2,5]){const {values:v}=state('P12',{mass1:1,mass2,position:0,time:.1});const a=(mass2-1)*9.8/(mass2+1);near(v.acceleration,a);near(v.position,.5*a*.1**2);near(v.speed,a*.1);}
});
test('spring release transfers energy without creating it and respects mass-dependent speed',()=>{
 for(const release of [0,.2,.5,.8,1]){const {values:v}=state('P15',{compression:.2,stiffness:100,mass:.5,release});near(v.elastic+v.kinetic,2);near(v.kinetic,2*Math.sin(release*Math.PI/2)**2);}
 near(state('P15',{release:1}).values.elastic,0);
});
test('circular motion and string playback rate follow their physical conditions',()=>{
 for(const id of ['P13','P21']){const model=modelById(id),p=defaults(model),rate=model.time!.rateAt!(p);if(id==='P13')near(model.time!.rateAt!({...p,speed:p.speed!*2}),rate*2);else near(model.time!.rateAt!({...p,tension:p.tension!*4}),rate*2);}
});
test('Kepler animation uses equal mean-anomaly time rather than uniform eccentric anomaly',()=>{
 const model=modelById('C11'),p=defaults(model);const peri=model.time!.rateAt!({...p,phase:0}),apo=model.time!.rateAt!({...p,phase:180});near(peri*(1-p.eccentricity!),apo*(1+p.eccentricity!));
});
test('gravitational clocks show distinct elapsed readings and hand geometry',()=>{
 const a=state('C21',{radius:1.5,time:1}),b=state('C21',{radius:1.5,time:2});near(b.values.proper,2*a.values.proper);assert.notDeepEqual(a.o.solids,b.o.solids);
});
test('mixed-mode observations export the union of actual scientific quantities',()=>{
 const model=modelById('C05'),local=defaults(model),flight={...local,mode:1};
 const text=csv(model,[{id:'C05',version:'discovery-v1',inputs:local},{id:'C05',version:'discovery-v1',inputs:flight}]);
 const header=text.split('\r\n')[0]!;assert.ok(header.includes('force_x (N)'));assert.ok(header.includes('velocity (m/s)'));assert.ok(header.includes('radius (AU)'));
});
test('screw and wedge conserve work and show the displacement caused by operating them',()=>{
 for(const pitch of [1,4,10]){
  const a=state('S17',{pitch,turn:0}),b=state('S17',{pitch,turn:5,load:10,efficiency:.5});
  near(b.values.rise,pitch*.5);
  near(b.values.force*2*Math.PI*.2*5*.5,10000*b.values.rise/100);
  assert.notDeepEqual(a.o.solids,b.o.solids,'turning must raise the actual apparatus');
 }
 for(const angle of [5,15,40]){
  const a=state('S18',{angle,stroke:1,load:1000}),b=state('S18',{angle,stroke:20,load:1000});
  near(b.values.input,1000*b.values.rise/100);
  assert.notDeepEqual(a.o.solids,b.o.solids,'advancing the wedge must move the apparatus');
 }
});
test('structural load changes reach the actual force glyphs and boundary indicators',()=>{
 for(const id of ['S11','S12','S13','S14'])assert.notDeepEqual(state(id,{load:10}).o.solids,state(id,{load:20}).o.solids,id);
 const below=state('S16',{angle:20,friction:.6}),above=state('S16',{angle:40,friction:.2});
 assert.equal(below.o.status,'valid');assert.equal(above.o.status,'boundary');
});
test('spatial linkage rods keep their physical length throughout the construction',()=>{
 const length=(points:number[][])=>Math.hypot(...points[1]!.map((x,i)=>x-points[0]![i]!));
 for(const branch of [1,2])for(let angle=0;angle<=360;angle+=15){
  const rods=state('S21',{angle,branch}).o.solids!.filter(s=>s.type==='line').slice(0,4);
  const unit=length(rods[1]!.points);
  [4,1,3,2.5].forEach((ratio,i)=>near(length(rods[i]!.points)/unit,ratio));
 }
 const sizes=[5,30,75].map(angle=>length(state('S22',{angle}).o.solids!.find(s=>s.type==='line')!.points));
 sizes.forEach(size=>near(size,sizes[0]!));
});
