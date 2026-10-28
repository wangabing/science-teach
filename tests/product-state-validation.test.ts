import test from 'node:test';
import assert from 'node:assert/strict';
import {checkedState,sameShape} from '../src/lib/product/state-validation.ts';
import {numericState} from '../src/lib/product/discoveries.ts';
import {DIVIDER_DEFAULTS,validateDivider,RC_DEFAULTS,initialRC,advanceRC,validateRC} from '../src/lib/exploration/electricity.ts';
import {defaults,validateGeometry} from '../src/lib/geometry/models.ts';
import {WAVE_DEFAULTS,validateWave} from '../src/lib/exploration/interference.ts';
import {CIRCUIT_DEFAULTS,validateCircuit} from '../src/lib/exploration/circuits.ts';
import {APPARATUS,buoyancyState} from '../src/lib/stem-lab/buoyancy.ts';
test('compound whitelist rejects arrays, missing/unknown nested fields and wrong primitive types',()=>{
 const template={input:RC_DEFAULTS,state:initialRC()},valid=checkedState(template,r=>validateRC(r.input,r.state));
 const charged={input:RC_DEFAULTS,state:advanceRC(RC_DEFAULTS,initialRC(),1)};assert.ok(valid(charged));
 for(const bad of [null,[],{...charged,unknown:1},{...charged,input:{...RC_DEFAULTS,unknown:1}},{...charged,state:{...charged.state,heat:99}},{...charged,state:{...charged.state,mode:'invalid'}},{...charged,input:{...RC_DEFAULTS,emf:'6'}}])assert.equal(valid(bad),false);
});
test('continuous numeric drags survive while enum, nonfinite and domain violations fail',()=>{
 assert.ok(numericState({x:{min:0,max:1}},{x:.123456}));
 const divider=checkedState(DIVIDER_DEFAULTS,validateDivider);assert.ok(divider({...DIVIDER_DEFAULTS,upper:1000.123}));assert.equal(divider({...DIVIDER_DEFAULTS,loaded:1}),false);
 const wave=checkedState(WAVE_DEFAULTS,validateWave);assert.ok(wave({...WAVE_DEFAULTS,phase:123.456}));for(const mode of ['invalid',1,null])assert.equal(wave({...WAVE_DEFAULTS,mode}),false);
 assert.equal(wave({...WAVE_DEFAULTS,x:Infinity}),false);
});
test('geometry structure and kind must agree before model evaluation',()=>{
 const valid=checkedState(defaults.reflection,p=>{if(p.kind!=='reflection')throw new Error('kind');validateGeometry(p);});
 assert.ok(valid(defaults.reflection));assert.equal(valid(defaults.circle),false);assert.equal(valid({...defaults.reflection,kind:'ellipse'}),false);assert.equal(valid({...defaults.reflection,limited:true,p:0}),false);
 assert.equal(sameShape([true,true],[true]),false);assert.equal(sameShape([1,2],['1',2]),false);
});
test('circuit model rejects unknown terminals, self wires, duplicate edges and excess topology',()=>{
 for(const wires of [[['P','X']],[['P','P']],[['P','N'],['N','P']],Array.from({length:16},()=>['P','N'])])assert.throws(()=>validateCircuit({...CIRCUIT_DEFAULTS,wires} as never));
 validateCircuit({...CIRCUIT_DEFAULTS,wires:[]});
});
test('buoyancy authored reference matches the actual apparatus gravity and saturated volume',()=>{
 assert.equal(APPARATUS.gravity,10);assert.equal(buoyancyState(10,1000).buoyancyN,10);assert.equal(buoyancyState(20,1000).buoyancyN,10);
});
