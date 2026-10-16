import test from 'node:test';
import assert from 'node:assert/strict';
import { areaEvidence,areaSources,areaTargets,triangleVertices } from '../src/lib/exploration/area.ts';
import { cubeSection,normalize,dot,sectionBasis } from '../src/lib/exploration/section.ts';
import { launchOrbit,stepOrbit,orbitEnergy,circularSpeed,escapeSpeed,LAUNCH_RADIUS,EARTH_RADIUS,MU } from '../src/lib/exploration/orbit.ts';
import { threePreset,stepThree,threeEnergy,separation,minDistance } from '../src/lib/exploration/three-body.ts';
import { solveBridge,trussMembers,bareMembers,bridgeNodes,type Member } from '../src/lib/exploration/bridge.ts';
import { gearTrain } from '../src/lib/exploration/gears.ts';
const close=(a:number,b:number,epsilon=1e-8)=>assert.ok(Math.abs(a-b)<epsilon,`${a} differs from ${b}`);

test('triangle rearrangements conserve area and rigid leg lengths over asymmetric and equal legs',()=>{
  for(const [a,b] of [[3,4],[2,6],[5,5],[2.5,4.5]]){
    const ev=areaEvidence(a!,b!);close(ev.outer-ev.triangles,ev.a2+ev.b2);close(ev.c**2,ev.c2);
    for(const pose of [...areaSources(a!,b!),...areaTargets(a!,b!)]){
      const [p,q,r]=triangleVertices(a!,b!,pose);close(Math.hypot(p!.x-q!.x,p!.y-q!.y),a!);close(Math.hypot(p!.x-r!.x,p!.y-r!.y),b!);
      close(Math.abs((q!.x-p!.x)*(r!.y-p!.y)-(q!.y-p!.y)*(r!.x-p!.x))/2,a!*b!/2);
      for(const vertex of [p!,q!,r!])assert.ok(vertex.x>=-1e-8&&vertex.y>=-1e-8&&vertex.x<=a!+b!+1e-8&&vertex.y<=a!+b!+1e-8);
    }
  }
});
test('target arrangement covers exactly the two complementary rectangles without overlap',()=>{
  for(const [a,b] of [[2,6],[3,4],[4.5,2.5]]){
    const triangles=areaTargets(a!,b!).map(p=>triangleVertices(a!,b!,p));
    for(let ix=0;ix<31;ix++)for(let iy=0;iy<29;iy++){
      const x=(ix+.371)*(a!+b!)/31,y=(iy+.263)*(a!+b!)/29;
      const inside=triangles.filter(t=>{const cross=t.map((p,i)=>{const q=t[(i+1)%3]!;return (q.x-p.x)*(y-p.y)-(q.y-p.y)*(x-p.x);});return cross.every(v=>v>=-1e-9)||cross.every(v=>v<=1e-9);}).length;
      const rectangle=(x<a!&&y<b!)||(x>a!&&y>b!);
      assert.equal(inside,rectangle?1:0);
    }
  }
});
test('invalid triangle dimensions are rejected',()=>{assert.throws(()=>areaEvidence(0,4));assert.throws(()=>areaEvidence(NaN,4));});

test('cube sections yield square, triangle, regular hexagon and no intersection',()=>{
  assert.equal(cubeSection([0,0,1],0).length,4);assert.equal(cubeSection([1,1,1],1.25).length,3);
  const hex=cubeSection([1,1,1],0);assert.equal(hex.length,6);
  const lengths=hex.map((p,i)=>Math.hypot(...p.map((x,k)=>x-hex[(i+1)%6]![k]!)));lengths.forEach(l=>close(l,Math.SQRT2));
  assert.equal(cubeSection([1,1,1],2).length,0);assert.equal(cubeSection([1,1,1],Math.sqrt(3)).length,0);
  assert.equal(cubeSection([0,0,1],1).length,4);
});
test('oblique cube intersections lie on plane and cube edges with unique vertices',()=>{
  for(const d of [-.8,-.3,0,.4,.9]){
    const n=normalize([.3,.6,.8]),points=cubeSection(n,d);assert.ok(points.length>=3&&points.length<=6);
    for(const p of points){close(dot(n,p),d);assert.ok(p.filter(x=>Math.abs(Math.abs(x)-1)<1e-7).length>=2);assert.ok(p.every(x=>Math.abs(x)<=1+1e-7));}
    const {u,v}=sectionBasis(n);close(dot(n,u),0);close(dot(n,v),0);close(dot(u,v),0);
  }
});
test('asymmetric slicing can produce five vertices',()=>{assert.equal(cubeSection([.3,.6,.8],.4).length,5);});

test('circular satellite orbit closes and conserves energy over three periods',()=>{
  let s=launchOrbit(circularSpeed,0);const initial=orbitEnergy(s),period=2*Math.PI*Math.sqrt(LAUNCH_RADIUS**3/MU);
  for(let i=0;i<Math.floor(period);i++){s=stepOrbit(s,3);assert.equal(s.status,'flying');assert.ok(Math.abs(Math.hypot(s.x,s.y)/LAUNCH_RADIUS-1)<1e-5);}
  s=stepOrbit(s,3*period-s.time);
  assert.ok(Math.abs((orbitEnergy(s)-initial)/initial)<1e-7);assert.ok(Math.hypot(s.x-LAUNCH_RADIUS,s.y)<0.5);
});
test('slow launch collides and then stops while escaping launch reaches positive-energy threshold',()=>{
  let falling=launchOrbit(3,0);for(let i=0;i<10000&&falling.status!=='collision';i++)falling=stepOrbit(falling,3);
  assert.equal(falling.status,'collision');assert.ok(Math.hypot(falling.x,falling.y)<=EARTH_RADIUS);assert.deepEqual(stepOrbit(falling,3),falling);
  let escaping=launchOrbit(11,0);for(let i=0;i<20000&&escaping.status!=='escaped';i++)escaping=stepOrbit(escaping,3);
  assert.equal(escaping.status,'escaped');assert.ok(orbitEnergy(escaping)>0);close(escapeSpeed/circularSpeed,Math.SQRT2);
});
test('negative energy does not prevent an inward directed launch from colliding',()=>{
  let s=launchOrbit(circularSpeed,-90);assert.ok(orbitEnergy(s)<0);for(let i=0;i<5000&&s.status!=='collision';i++)s=stepOrbit(s,3);assert.equal(s.status,'collision');
});

test('softened three-body figure eight conserves momentum, center of mass and energy',()=>{
  let b=threePreset('eight');const initial=threeEnergy(b);
  for(let i=0;i<16000;i++)b=stepThree(b,.0005);
  close(b.reduce((s,p)=>s+p.mass*p.vx,0),0,1e-10);close(b.reduce((s,p)=>s+p.mass*p.vy,0),0,1e-10);
  close(b.reduce((s,p)=>s+p.mass*p.x,0),0,1e-10);close(b.reduce((s,p)=>s+p.mass*p.y,0),0,1e-10);
  assert.ok(Math.abs((threeEnergy(b)-initial)/initial)<1e-5);assert.ok(minDistance(b)>.04);
});
test('zero perturbation is identical, nonzero perturbation is separately evolved and input state is immutable',()=>{
  const initial=threePreset('eight'),snapshot=structuredClone(initial);let a=initial,b=structuredClone(initial),c=structuredClone(initial);c[0]!.x+=.001;
  close(separation(a,c),.001/Math.sqrt(3));
  for(let i=0;i<2000;i++){a=stepThree(a,.0005);b=stepThree(b,.0005);c=stepThree(c,.0005);}
  assert.deepEqual(initial,snapshot);assert.equal(separation(a,b),0);assert.ok(separation(a,c)>0);
});

test('bare bridge is a mechanism and adding triangulation yields stable equilibrium',()=>{
  assert.equal(solveBridge(bareMembers,40).stable,false);
  const result=solveBridge(trussMembers,40);assert.ok(result.stable);if(!result.stable)return;
  close(result.reactions[1]!,20);close(result.reactions[5]!,20);close(result.reactions[0]!,0);
  close(result.displacements[0]!.x,0);close(result.displacements[0]!.y,0);close(result.displacements[2]!.y,0);
  for(let i=0;i<bridgeNodes.length;i++){
    const f={x:0,y:i===1?-40:0};
    trussMembers.forEach(([a,b],k)=>{if(i!==a&&i!==b)return;const other=bridgeNodes[i===a?b:a]!,node=bridgeNodes[i]!,l=Math.hypot(other.x-node.x,other.y-node.y);f.x+=result.forces[k]!*(other.x-node.x)/l;f.y+=result.forces[k]!*(other.y-node.y)/l;});
    close(f.x+result.reactions[i*2]!,0,1e-7);close(f.y+result.reactions[i*2+1]!,0,1e-7);
  }
});
test('bridge response is linear in load and reactions satisfy moment balance at off-center load',()=>{
  const a=solveBridge(trussMembers,30,3),b=solveBridge(trussMembers,60,3);assert.ok(a.stable&&b.stable);if(!a.stable||!b.stable)return;
  a.forces.forEach((f,i)=>close(b.forces[i]!,2*f));a.displacements.forEach((d,i)=>{close(b.displacements[i]!.x,2*d.x);close(b.displacements[i]!.y,2*d.y);});
  close(a.reactions[1]!,30);close(a.reactions[5]!,0);assert.ok(a.length<=18);
});
test('isolated node and deleted essential diagonal remain explicitly unstable',()=>{
  assert.equal(solveBridge(trussMembers.slice(0,-1),40).stable,false);
  const withoutF=trussMembers.filter(m=>!m.includes(5)) as Member[];assert.equal(solveBridge(withoutF,40).stable,false);
});

test('gears preserve tooth speed, ideal power and reverse at each mesh',()=>{
  const t=gearTrain([20,40],12);assert.deepEqual(t.speeds,[12,-6]);close(t.speedRatio,.5);close(t.torqueRatio,2);close(t.speedRatio*t.torqueRatio,1);
  for(const idler of [12,23,60]){const r=gearTrain([20,idler,60],12);close(r.speeds.at(-1)!,4);close(r.speedRatio,1/3);close(r.torqueRatio,3);r.speeds.slice(1).forEach((v,i)=>close(v*[idler,60][i]!,-r.speeds[i]!*[20,idler][i]!));}
});
test('gear input constraints reject noninteger or insufficient teeth',()=>{assert.throws(()=>gearTrain([2,40],12));assert.throws(()=>gearTrain([20,40.5],12));assert.throws(()=>gearTrain([20],12));});

test('sensitive comparison preset shows growing separation without unresolved close encounters over 20 time units',()=>{
  let a=threePreset('sensitive'),b=structuredClone(a);b[0]!.x+=.001;const ea=threeEnergy(a),eb=threeEnergy(b);
  for(let i=0;i<40000;i++){a=stepThree(a,.0005);b=stepThree(b,.0005);assert.ok(Math.min(minDistance(a),minDistance(b))>.04);}
  assert.ok(separation(a,b)>.1);assert.ok(Math.abs(threeEnergy(a)/ea-1)<.02);assert.ok(Math.abs(threeEnergy(b)/eb-1)<.02);
});
