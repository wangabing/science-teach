import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,solveReflection,solveCircle,solveTriangle,solveEllipse,distance,cloneGeometry,geometryCSV,compareGeometry,validateGeometry} from '../src/lib/geometry/models.ts';
const close=(a:number,b:number,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);

test('reflection converts broken path to straight distance and respects segment boundary',()=>{
 const s={...defaults.reflection,p:-1},r=solveReflection(s);close(r.minimum,Math.sqrt(128));close(r.length,r.minimum);close(r.optimum,-1);close(r.pb,r.reflected);
 const limited=solveReflection({...s,limited:true,p:-2});close(limited.optimum,-2);assert.equal(limited.admissible,false);assert.ok(limited.minimum>r.minimum);
});
test('reflection optimum minimizes whole feasible domain across independent grids',()=>{
 for(const ax of [-5,-1,4])for(const bx of [-4,0,5])for(const ay of [1,3,6])for(const by of [1,4,6])for(const limited of [false,true]){
  const s={...defaults.reflection,ax,bx,ay,by,limited,p:limited?-3:0},r=solveReflection(s);
  for(let p=limited?-5:-6;p<=(limited?-2:6);p+=.1){const v=solveReflection({...s,p});assert.ok(v.length>=r.minimum-1e-10);close(v.pb,v.reflected);}
 }
});
test('circle vector angles match both intercepted arcs and diameter theorem',()=>{
 for(const alpha of [30,90,120,180])for(let theta=0;theta<360;theta+=5){
  const r=solveCircle({...defaults.circle,alpha,theta});if(!r.valid){assert.equal(r.angle,null);continue;}
  close(r.angle!,r.intercepted/2);close(distance(r.P,{x:0,y:0}),4);
 }
 close(solveCircle({...defaults.circle,theta:60}).angle!,120);close(solveCircle({...defaults.circle,theta:240}).angle!,60);
});
test('circle endpoint coincidence never produces a plausible rounded angle',()=>{
 for(const theta of [0,120,360])assert.equal(solveCircle({...defaults.circle,theta}).valid,false);
 assert.equal(solveCircle({...defaults.circle,theta:120.01}).valid,true);
});
test('SSS mirror constructions conserve all sides, area and reverse orientation',()=>{
 for(const [ab,ac,bc] of [[6,4,5],[3,4,5],[1,1,1],[10,8,3]]){
  const s={...defaults.triangle,ab:ab!,ac:ac!,bc:bc!,locked:true},r=solveTriangle(s),flipped=solveTriangle({...s,side:-1});
  assert.equal(r.status,'valid');close(distance(r.A,r.C!),ac!);close(distance(r.B,r.C!),bc!);close(r.area,flipped.area);close(r.C!.y,-flipped.C!.y);
 }
});
test('triangle hinge preserves two rods while changing the third and classifies invalid lengths',()=>{
 const a=solveTriangle({...defaults.triangle,angle:45}),b=solveTriangle({...defaults.triangle,angle:100});close(distance(a.A,a.C!),4);close(distance(b.A,b.C!),4);assert.notEqual(a.bc,b.bc);
 for(const bc of [2,10])assert.equal(solveTriangle({...defaults.triangle,locked:true,bc}).status,'degenerate');
 assert.equal(solveTriangle({...defaults.triangle,ab:1,ac:2,bc:3,locked:true}).status,'degenerate');
 assert.equal(solveTriangle({...defaults.triangle,ab:1,ac:2,bc:4,locked:true}).C,null);
});
test('ellipse satisfies independent distance definition and implicit equation at all positions',()=>{
 for(const a of [2,4,6])for(const c of [0,.5,1.5])for(let theta=0;theta<=360;theta+=7){
  const r=solveEllipse({...defaults.ellipse,a,c,theta});assert.equal(r.valid,true);close(r.sum!,2*a);close(r.P!.x*r.P!.x/(a*a)+r.P!.y*r.P!.y/(r.b*r.b),1);close(r.b*r.b,a*a-c*c);
 }
 close(solveEllipse(defaults.ellipse).b,4);
});
test('ellipse circle limit, degenerate segment and impossible focal separation are distinct',()=>{
 const circle=solveEllipse({...defaults.ellipse,c:0});close(circle.b,5);close(circle.eccentricity!,0);
 const degenerate=solveEllipse({...defaults.ellipse,a:3,c:3});assert.equal(degenerate.status,'degenerate');assert.equal(degenerate.P,null);
 const impossible=solveEllipse({...defaults.ellipse,a:2,c:3});assert.equal(impossible.status,'impossible');assert.equal(impossible.sum,null);
});
test('input cloning, comparison and versioned CSV recompute metrics and preserve undefined observations',()=>{
 const s=cloneGeometry(defaults.reflection);s.p=1;assert.equal(defaults.reflection.p,-3);
 const csv=geometryCSV([defaults.ellipse,{...defaults.ellipse,a:2,c:3}]);assert.ok(csv.includes('analytic-geometry-v1'));assert.ok(csv.includes('PF1_u'));assert.ok(csv.includes('impossible'));assert.equal(csv.trim().split('\r\n').length,3);
 assert.match(compareGeometry(defaults.reflection,{...defaults.reflection,ax:-3,p:0}),/多个条件改变/);
});
test('nonfinite and constraint-breaking inputs cannot reach model or export',()=>{
 assert.throws(()=>validateGeometry({...defaults.reflection,p:-1,limited:true}));assert.throws(()=>solveCircle({...defaults.circle,theta:NaN}));assert.throws(()=>solveTriangle({...defaults.triangle,ab:0}));assert.throws(()=>solveEllipse({...defaults.ellipse,a:Infinity}));
});
