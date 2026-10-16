import test from 'node:test';
import assert from 'node:assert/strict';
import { polygonMeasurements,orbitalElements,bodyEnergies } from '../src/lib/exploration/measurements.ts';
import { cubeSection } from '../src/lib/exploration/section.ts';
import { launchOrbit,circularSpeed,LAUNCH_RADIUS,MU } from '../src/lib/exploration/orbit.ts';
import { threePreset,threeAccelerations,threeEnergy,stepThree } from '../src/lib/exploration/three-body.ts';
const close=(a:number,b:number,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
test('section readouts measure actual square and hexagon geometry, empty cuts have zero area',()=>{
 const square=polygonMeasurements(cubeSection([0,0,1],0));close(square.area,4);close(square.perimeter,8);
 const hex=polygonMeasurements(cubeSection([1,1,1],0));close(hex.area,3*Math.sqrt(3));close(hex.perimeter,6*Math.SQRT2);
 assert.deepEqual(polygonMeasurements([]),{area:0,perimeter:0,edges:[]});
});
test('orbital readouts satisfy circular and elliptical energy/apsis relations',()=>{
 const circle=orbitalElements(launchOrbit(circularSpeed,0));close(circle.eccentricity,0,2e-8);close(circle.periapsis,LAUNCH_RADIUS,.001);close(circle.apoapsis,LAUNCH_RADIUS,.001);
 close(circle.period,2*Math.PI*Math.sqrt(LAUNCH_RADIUS**3/MU));
 const ellipse=orbitalElements(launchOrbit(8,0));assert.ok(ellipse.eccentricity>0&&ellipse.eccentricity<1);close(ellipse.periapsis,LAUNCH_RADIUS);close(ellipse.energy,-MU/(ellipse.periapsis+ellipse.apoapsis));close(ellipse.kinetic+ellipse.potential,ellipse.energy);
 assert.equal(orbitalElements(launchOrbit(11,0)).apoapsis,Infinity);
});
test('radial and stationary launches have finite bound apsides and flag surface crossing',()=>{
 for(const speed of [0,3]){const e=orbitalElements(launchOrbit(speed,-90));assert.ok(Number.isFinite(e.apoapsis));assert.ok(e.surfaceCrossing);close(e.periapsis,0);}
 close(orbitalElements(launchOrbit(0,0)).apoapsis,LAUNCH_RADIUS);
});
test('unequal-mass acceleration matches negative potential gradient and conserves momentum',()=>{
 let b=threePreset('eight');b[0]!.mass=1.5;const forces=threeAccelerations(b),e=bodyEnergies(b);close(e.kinetic+e.potential,e.total);
 for(let i=0;i<b.length;i++){
  const plus=structuredClone(b),minus=structuredClone(b),h=1e-6;plus[i]!.x+=h;minus[i]!.x-=h;
  close(-(threeEnergy(plus)-threeEnergy(minus))/(2*h),b[i]!.mass*forces[i]!.x,1e-7);
 }
 close(b.reduce((s,p,i)=>s+p.mass*forces[i]!.x,0),0);close(b.reduce((s,p,i)=>s+p.mass*forces[i]!.y,0),0);
 const momentum=b.reduce((s,p)=>s+p.mass*p.vx,0);for(let i=0;i<2000;i++)b=stepThree(b,.0005);close(b.reduce((s,p)=>s+p.mass*p.vx,0),momentum,1e-10);
});
