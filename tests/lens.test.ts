import test from 'node:test';
import assert from 'node:assert/strict';
import { solveLens,rayHeights,type LensInput } from '../src/lib/exploration/lens.ts';
import {decodeRecords, compareRecords, challengeHint} from '../src/lib/exploration/lens-notebook.ts';
const p=(object:number,screen=15,focal=10):LensInput=>({object,screen,focal,height:2});
const close=(a:number,b:number,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
test('five thin-lens regimes distinguish real inverted and virtual upright images',()=>{
 for(const [u,v,m,regime] of [[30,15,-.5,'reduced'],[20,20,-1,'equal'],[15,30,-2,'enlarged'],[6,-15,2.5,'virtual']] as const){const a=solveLens(p(u));assert.equal(a.regime,regime);close(a.image!,v);close(a.magnification!,m);close(1/10,1/u+1/a.image!);assert.equal(a.real,v>0);}
 const focus=solveLens(p(10));assert.equal(focus.regime,'focus');assert.equal(focus.image,null);assert.equal(focus.magnification,null);assert.equal(focus.focused,false);
});
test('representative rays meet at signed analytic image, parallel at focus',()=>{
 for(const f of [6,10,16])for(const ratio of [.6,.9,1.01,1.5,2,4]){const input=p(f*ratio,15,f),a=solveLens(input),ys=rayHeights(input,a.image!);close(ys[0],ys[1],1e-7);close(ys[1],a.imageHeight!,1e-7);}
 const a=rayHeights(p(10),5),b=rayHeights(p(10),25);close(b[0]-a[0],b[1]-a[1]);
});
test('screen focus is independent from image geometry; virtual images never project clearly',()=>{
 const good=solveLens(p(30,15)),bad=solveLens(p(30,30));assert.ok(good.focused);close(good.separation,0);assert.ok(!bad.focused);assert.equal(good.image,bad.image);assert.equal(good.magnification,bad.magnification);
 for(const screen of [5,15,30,100])assert.ok(!solveLens(p(6,screen)).focused);
});
test('near focus retains signed finite distant images, scaling preserves magnification',()=>{
 const a=solveLens(p(10.001)),b=solveLens(p(9.999));assert.ok(a.image!>10000);assert.ok(b.image!< -10000);
 const c=solveLens(p(30)),d=solveLens({focal:20,object:60,screen:30,height:4});close(d.image!,2*c.image!);close(d.magnification!,c.magnification!);close(d.separation,2*c.separation);
});
test('invalid lens inputs are rejected',()=>{
 for(const key of ['focal','object','screen','height'] as const)for(const value of [0,-1,NaN,Infinity])assert.throws(()=>solveLens({...p(30),[key]:value}),RangeError);
 assert.throws(()=>rayHeights(p(30),NaN),RangeError);
});

test('saved evidence validates schema, ranges, step and never trusts derived markup',()=>{
 const row={...p(30),extensions:false};
 assert.deepEqual(decodeRecords(JSON.stringify({version:1,records:[{...row,html:'<script>'}]})),[row]);
 for(const data of [{version:2,records:[]},{version:1,records:Array(7).fill(row)},{version:1,records:[{...row,object:81}]},{version:1,records:[{...row,focal:10.1}]},{version:1,records:[{...row,extensions:'true'}]},{version:1,records:[{...row,screen:'<img>'}]}])assert.throws(()=>decodeRecords(JSON.stringify(data)));
 assert.throws(()=>decodeRecords('{'));
});
test('comparison distinguishes focus adjustment, controlled evidence and confounding',()=>{
 const row=(object:number,screen=15,focal=10)=>({...p(object,screen,focal),extensions:true});
 assert.match(compareRecords(row(30),row(15,30)),/15.00 → 30.00/);
 assert.match(compareRecords(row(30),row(30,20)),/理论像距不变/);
 assert.match(compareRecords(row(30),row(15,30,12)),/不能单独说明/);
 assert.match(compareRecords(row(30),row(15,8)),/先让两组/);
});
test('challenge diagnosis follows the actual optical failure',()=>{
 assert.match(challengeHint(p(6),'small'),/虚像/);
 assert.match(challengeHint(p(10),'large'),/平行/);
 assert.match(challengeHint(p(10.1),'large'),/100 cm/);
 assert.match(challengeHint(p(30,8),'small'),/移远/);
 assert.match(challengeHint(p(30,25),'small'),/移近/);
 assert.match(challengeHint(p(15,30),'small'),/两倍焦距/);
});
