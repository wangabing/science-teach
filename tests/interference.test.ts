import test from 'node:test';
import assert from 'node:assert/strict';
import {WAVE_DEFAULTS,waveAt,waveCSV,compareWave,type WaveInput} from '../src/lib/exploration/interference.ts';
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('equidistant sources amplify in phase and cancel out of phase for every time',()=>{
 for(const y of [-7,0,6])for(let i=0;i<=100;i++){
  const p={...WAVE_DEFAULTS,y},t=i/100,a=waveAt(p,t),b=waveAt({...p,phase:180},t);
  close(a.amplitude,2);close(a.sum,2*a.one);close(b.sum,0);close(b.amplitude,0);
 }
});
test('one zero sample does not imply quiet, and spatial path difference controls envelope',()=>{
 const p={...WAVE_DEFAULTS,x:3,y:4,phase:47};const r=waveAt(p,0);
 let max=0;for(let i=0;i<10000;i++)max=Math.max(max,Math.abs(waveAt(p,i/10000).sum));
 assert.ok(Math.abs(max-r.amplitude)<1e-6);
 const zero=waveAt({...WAVE_DEFAULTS,separation:4},0);close(zero.sum,0);close(zero.amplitude,2);
 for(const mode of ['one','two'] as const)for(const t of [0,.2,.4]){const q=waveAt({...p,mode},t);close(q.amplitude,1);close(q.sum,mode==='one'?q.one:q.two);}
});
test('records export actual conditions, units, components, and distinguish multiple edits',()=>{
 const a={input:{...WAVE_DEFAULTS},time:.2},b={input:{...WAVE_DEFAULTS,phase:180,x:2},time:.4};
 const csv=waveCSV([a,b]),rows=csv.trim().split('\r\n');assert.equal(rows.length,3);assert.match(rows[0]!,/time_s,frequency_Hz,source_amplitude_mm/);
 assert.equal(rows[2]!.split(',')[12],String(waveAt(b.input,b.time).one));assert.match(compareWave(a,b),/多个条件/);
});
test('invalid numeric ranges, modes and times cannot reach the renderer or export',()=>{
 for(const patch of [{phase:NaN},{x:13},{wavelength:0},{separation:11},{mode:'bad'}])assert.throws(()=>waveAt({...WAVE_DEFAULTS,...patch} as WaveInput,0));
 assert.throws(()=>waveAt(WAVE_DEFAULTS,-1));assert.throws(()=>waveCSV([{input:WAVE_DEFAULTS,time:Infinity}]));
});
