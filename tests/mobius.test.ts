import test from 'node:test';
import assert from 'node:assert/strict';
import {stripPoint,tracePoint,topology,cutBands,type HalfTwists} from '../src/lib/exploration/mobius.ts';
const close=(a:number[],b:number[])=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i]!)<1e-9));
test('paper seam reverses width only for odd half twists',()=>{
 for(const n of [0,1,2] as HalfTwists[])for(const v of [-.65,-.3,0,.3,.65])close(stripPoint(n,2*Math.PI,v),stripPoint(n,0,n%2?-v:v));
});
test('Mobius trace visits opposite local edge after one circuit and closes after two',()=>{
 close(tracePoint(1,.5,true),stripPoint(1,0,-.65));close(tracePoint(1,1,true),tracePoint(1,0,true));
 for(const n of [0,2] as HalfTwists[])close(tracePoint(n,1,true),tracePoint(n,0,true));
 assert.deepEqual([0,1,2].map(n=>topology(n as HalfTwists).boundaries),[2,1,2]);
});
test('cut components have closed seams and preserve odd strip connectedness',()=>{
 for(const n of [0,1,2] as HalfTwists[]){const bands=cutBands(n);assert.equal(bands.length,topology(n).cutComponents);for(const band of bands)for(const v of [band.min,band.max])close(stripPoint(n,band.turn,v),stripPoint(n,0,v));}
 assert.equal(topology(1).sides,1);assert.equal(topology(2).linked,true);assert.equal(topology(0).linked,false);
});
test('paper coordinates are finite and invalid topology is rejected',()=>{
 for(const n of [0,1,2] as HalfTwists[])for(let i=0;i<=100;i++)assert.ok(tracePoint(n,i/100).every(Number.isFinite));
 assert.throws(()=>topology(3 as HalfTwists));assert.throws(()=>tracePoint(1,NaN));
});
test('center-cut double-twist components are linked, ordinary ring components are unlinked',()=>{
 const sub=(a:number[],b:number[])=>a.map((x,i)=>x-b[i]!);
 const cross=(a:number[],b:number[])=>[a[1]!*b[2]!-a[2]!*b[1]!,a[2]!*b[0]!-a[0]!*b[2]!,a[0]!*b[1]!-a[1]!*b[0]!];
 // Independent numerical Gauss linking integral of the two cut-band center curves.
 for(const n of [0,2] as HalfTwists[]){let integral=0;const count=160,dt=2*Math.PI/count;
 for(let i=0;i<count;i++)for(let j=0;j<count;j++){
 const a=stripPoint(n,(i+.5)*dt,.37),b=stripPoint(n,(j+.5)*dt,-.37),r=sub(a,b);
 const da=sub(stripPoint(n,(i+1)*dt,.37),stripPoint(n,i*dt,.37)),db=sub(stripPoint(n,(j+1)*dt,-.37),stripPoint(n,j*dt,-.37)),c=cross(da,db);
 integral+=r.reduce((sum,x,k)=>sum+x*c[k]!,0)/Math.hypot(...r)**3;
 }assert.ok(Math.abs(Math.abs(integral/(4*Math.PI))-(n===2?1:0))<.01);}
});
