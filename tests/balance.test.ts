import test from 'node:test';import assert from 'node:assert/strict';
import {solveBalance,startTipping,stepTipping,tippingEnergy,bodyPoint,platformPoint,type BalanceInput} from '../src/lib/exploration/balance.ts';
const p=(patch:Partial<BalanceInput>={}):BalanceInput=>({width:.6,tilt:12,loadX:0,loadY:.65,loadMass:2,bodyMass:2,...patch});
const close=(a:number,b:number,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('mass-weighted center and lowering a load increase critical angle and support margin',()=>{
 const high=solveBalance(p({loadMass:4,loadY:1.05})),low=solveBalance(p({loadMass:4,loadY:.15}));close(high.cx,0);close(high.cy,.9);close(low.cy,.3);assert.ok(low.criticalRight>high.criticalRight);assert.ok(low.margin>high.margin);close(low.criticalRight,45);
});
test('critical left/right poses have zero margin and reflected configurations match',()=>{
 const input=p({loadX:.18}),r=solveBalance(input);assert.equal(solveBalance({...input,tilt:r.criticalRight}).status,'critical');assert.equal(solveBalance({...input,tilt:-r.criticalLeft}).status,'critical');
 const mirrored=solveBalance({...input,loadX:-input.loadX,tilt:-input.tilt});close(r.projection,-mirrored.projection);close(r.margin,mirrored.margin);close(r.criticalRight,mirrored.criticalLeft);
 assert.equal(solveBalance({...input,tilt:r.criticalRight+.01}).status,'unstable');
});
test('uniform mass scaling leaves stability unchanged and scales restoring moment',()=>{
 const a=solveBalance(p()),b=solveBalance(p({bodyMass:8,loadMass:8}));for(const key of ['cx','cy','projection','margin','criticalRight'] as const)close(a[key],b[key]);close(b.moment,4*a.moment);
});
test('gravity projection and restoring torque agree with independent world geometry',()=>{
 for(const tilt of [-45,-12,0,20,45]){const input=p({tilt,loadX:.1}),r=solveBalance(input),[xg,yg]=platformPoint(r.cx,r.cy,tilt),[xp,yp]=platformPoint(r.projection,0,tilt);close(xg,xp);assert.ok(yg>yp);const [xe]=platformPoint(r.edge,0,tilt);close(r.moment,r.mass*9.81*(r.edge>0?xe-xg:xg-xe));}
});
test('stable and critical poses do not fall; mirrored releases tip about opposite edges and stop at contact',()=>{
 assert.equal(startTipping(p()),null);assert.equal(startTipping(p({tilt:solveBalance(p()).criticalRight})),null);
 const right=p({tilt:35}),left=p({tilt:-35});let a=startTipping(right)!,b=startTipping(left)!;
 for(let i=0;i<1000&&!a.landed;i++){a=stepTipping(right,a,1/240);b=stepTipping(left,b,1/240);close(a.phi,-b.phi);close(a.omega,-b.omega);}
 assert.ok(a.landed&&b.landed);close(a.phi,Math.PI/2);close(a.omega,0);const [,height]=bodyPoint(right.width/2,1.2,a.phi,a.edge);close(height,0);assert.deepEqual(stepTipping(right,a,.1),a);
});
test('torque-driven release conserves energy before first contact and is invariant to uniform mass scaling',()=>{
 const input=p({tilt:35,loadX:.12}),scaled={...input,bodyMass:8,loadMass:8};let a=startTipping(input)!,b=startTipping(scaled)!;const energy=tippingEnergy(input,a);
 for(let i=0;i<120;i++){a=stepTipping(input,a,1/480);b=stepTipping(scaled,b,1/480);assert.ok(!a.landed);close(tippingEnergy(input,a),energy,.0001);close(a.phi,b.phi);close(a.omega,b.omega);}
});
test('invalid body, load, angle and time inputs are rejected',()=>{
 for(const patch of [{width:0},{loadX:2},{loadY:-.1},{loadY:1.3},{loadMass:-1},{bodyMass:0},{tilt:90},{tilt:NaN}])assert.throws(()=>solveBalance(p(patch)));
 const input=p({tilt:40}),s=startTipping(input)!;assert.throws(()=>stepTipping(input,s,0));assert.throws(()=>stepTipping(input,s,NaN));
});
