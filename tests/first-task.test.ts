import test from 'node:test';
import assert from 'node:assert/strict';
import { Pendulum, DEFAULT_PENDULUM } from '../src/lib/stem-lab/pendulum.ts';
import { comparePendulum, type PendulumRecord } from '../src/lib/stem-lab/pendulum-records.ts';
import { cubeSectionEvidence, cubeEdges, cubeVertices, dot, normalize } from '../src/lib/exploration/section.ts';
import { MoonNodeTask } from '../src/lib/exploration/moon-task.ts';

test('period endpoints wait for two same-direction crossings, reset and zero amplitude',()=>{
 const p=new Pendulum();
 while(p.lastCrossing===null)p.step();
 const first=p.lastCrossing;
 while(p.theta<0)p.step(); // The reverse crossing is not a complete period.
 assert.equal(p.periodEndpoints,null);
 while(!p.periodEndpoints)p.step();
 const endpoints=p.periodEndpoints as unknown as {start:number;end:number};
 assert.equal(endpoints.start,first);
 assert.equal(endpoints.end-endpoints.start,p.measuredPeriod);
 p.reset({...DEFAULT_PENDULUM,angle:0});
 for(let i=0;i<2400;i++)p.step();
 assert.equal(p.periodEndpoints,null);assert.equal(p.lastCrossing,null);
});
test('comparison identifies every changed variable instead of attributing multiple edits to one',()=>{
 const a:PendulumRecord={params:{...DEFAULT_PENDULUM},start:1,end:3.5,period:2.5};
 for(const patch of [{mass:2},{length:2},{mass:2,length:2}]){
  const result=comparePendulum(a,{...a,params:{...a.params,...patch}});
  assert.match(result,/固定/);
  assert.match(result,Object.keys(patch).length===1?/只改变一个量/:/不能归因/);
 }
});
test('section source edges contain their ordered intersection, including degenerate contact',()=>{
 const az=63*Math.PI/180,tilt=50*Math.PI/180,n=normalize([Math.cos(tilt)*Math.cos(az),Math.cos(tilt)*Math.sin(az),Math.sin(tilt)]);
 const pent=cubeSectionEvidence(n,.4);assert.equal(pent.vertices.length,5);
 for(const {point,edges} of pent.vertices){
  assert.ok(Math.abs(dot(n,point)-.4)<1e-8);
  for(const edge of edges){const [i,j]=cubeEdges[edge]!;const a=cubeVertices[i]!,b=cubeVertices[j]!;
   for(let k=0;k<3;k++)if(a[k]===b[k])assert.ok(Math.abs(point[k]!-a[k]!)<1e-8);
  }
 }
 const corner=cubeSectionEvidence([1,1,1],Math.sqrt(3));assert.equal(corner.kind,'point');assert.equal(corner.vertices[0]!.edges.length,3);
 const line=cubeSectionEvidence([1,1,0],Math.SQRT2);assert.equal(line.kind,'line');assert.equal(line.coplanarEdges.length,1);
 const face=cubeSectionEvidence([0,0,1],1);assert.equal(face.kind,'polygon');assert.equal(face.vertices.length,4);assert.equal(face.coplanarEdges.length,4);
});
test('moon task requires manual node adjustment with fixed conditions and rejects example credit',()=>{
 const p={phase:180,node:90,inclination:5.145,distance:60.27},t=new MoonNodeTask();t.prepare();
 assert.doesNotMatch(t.feedback(p),/通过/);
 const aligned={...p,node:0};t.change(aligned,'moon-node');assert.match(t.feedback(aligned),/通过/);
 t.example();assert.doesNotMatch(t.feedback(aligned),/通过/);
 t.prepare();t.change({...p,inclination:0},'moon-inclination');t.change(aligned,'moon-node');assert.match(t.feedback(aligned),/重新准备/);
 t.prepare();t.change({...p,node:180},'moon-node');assert.match(t.feedback({...p,node:180}),/通过/);
});
