import test from 'node:test';import assert from 'node:assert/strict';
import {solveMoon,moonPosition,phaseFromPlan,diskOverlap,occultation,lunarShadow,length,MOON_RADIUS,SUN_RADIUS,SUN_DISTANCE,type MoonInput} from '../src/lib/exploration/moon.ts';
const p:MoonInput={phase:90,inclination:5.145,node:0,distance:60.27};const near=(a:number,b:number,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
test('cardinal phases, sunlight orientation and physical angular radii',()=>{
 const phase=(x:number)=>solveMoon({...p,phase:x,inclination:0});near(phase(0).fraction,0);near(phase(180).fraction,1);near(phase(90).fraction,.5,.002);near(phase(270).fraction,.5,.002);
 assert.ok(phase(90).up[1]>.99,'projected north remains up');assert.ok(phase(90).towardSun[0]*phase(90).right[0]>0,'waxing right-lit');assert.ok(phase(270).towardSun[0]*phase(270).right[0]<0,'waning left-lit');
 near(phase(0).solar.sunRadius,Math.asin(SUN_RADIUS/(SUN_DISTANCE-1)));near(phase(0).solar.blockerRadius,Math.asin(MOON_RADIUS/(p.distance-1)));
});
test('inclined orbit conserves distance, nodes lie on plane and drag inverse recovers phase',()=>{
 for(const node of [0,43,90,185])for(const phase of [0,12,90,180,270,359]){const q={...p,node,phase},m=moonPosition(q);near(length(m),p.distance);const recovered=phaseFromPlan(m[0],m[2],q);near(Math.min(Math.abs(recovered-phase),360-Math.abs(recovered-phase)),0,1e-8);}
 near(moonPosition({...p,phase:43,node:43})[1],0);near(moonPosition({...p,phase:223,node:43})[1],0);assert.ok(Math.abs(moonPosition({...p,node:90,phase:180})[1])>5);
});
test('disk overlap obeys containment, symmetry, external tangency and independent equal-circle case',()=>{
 near(diskOverlap(1,1,1),2*Math.PI/3-Math.sqrt(3)/2);near(diskOverlap(2,1,.5),Math.PI);near(diskOverlap(1,1,2),0);near(diskOverlap(1,1,0),Math.PI);
 for(const d of [0,.2,1,2,3])near(diskOverlap(1,2,d),diskOverlap(2,1,d));assert.equal(diskOverlap(0,1,0),0);
});
test('solar totality and annularity change with physical lunar distance, off-node new moon misses',()=>{
 assert.equal(solveMoon({...p,phase:0,distance:56}).solar.type,'total');assert.equal(solveMoon({...p,phase:0,distance:64}).solar.type,'annular');
 assert.equal(solveMoon({...p,phase:0,node:90}).solar.type,'none');assert.equal(solveMoon({...p,phase:180}).solar.type,'none');
 const partial=solveMoon({...p,phase:.3,distance:56});assert.equal(partial.solar.type,'partial');assert.ok(partial.solar.coverage>0&&partial.solar.coverage<1);
});
test('full Moon needs node alignment: total, partial, penumbral and missed Earth shadows',()=>{
 const full=solveMoon({...p,phase:180});assert.equal(full.lunar.type,'total');near(full.lunar.umbralFraction,1);
 const missed=solveMoon({...p,phase:180,node:90});assert.equal(missed.lunar.type,'none');assert.ok(missed.fraction>.997);
 assert.equal(lunarShadow([-60,.9,0]).type,'partial');assert.equal(lunarShadow([-60,1.4,0]).type,'penumbral');assert.equal(lunarShadow([-60,2,0]).type,'none');
 assert.equal(lunarShadow([60,0,0]).type,'none');near(lunarShadow([-60,.9,0]).umbralFraction,lunarShadow([-60,-.9,0]).umbralFraction);
});
test('finite source shading blocks light only in real eclipse geometry',()=>{
 const full=moonPosition({...p,phase:180}),newMoon=moonPosition({...p,phase:0});near(occultation(full,[0,0,0],1).coverage,1);near(occultation(newMoon,[0,0,0],1).coverage,0);
 assert.equal(occultation([1,0,0],[SUN_DISTANCE+10,0,0],1).coverage,0);
 const r=solveMoon({...p,phase:180,node:90});near(occultation(r.moon,[0,0,0],1).coverage,0);
});
test('invalid lunar parameters and invalid overlaps are rejected without nonfinite results',()=>{
 for(const q of [{...p,distance:0},{...p,inclination:11},{...p,node:NaN},{...p,phase:Infinity}])assert.throws(()=>solveMoon(q),RangeError);
 assert.throws(()=>diskOverlap(-1,1,1),RangeError);assert.throws(()=>diskOverlap(1,1,NaN),RangeError);
 for(let phase=0;phase<360;phase+=3){const r=solveMoon({...p,phase,node:27});assert.ok(Number.isFinite(r.fraction)&&r.fraction>=0&&r.fraction<=1);assert.ok(r.solar.coverage>=0&&r.solar.coverage<=1);}
});
