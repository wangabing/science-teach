import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DIVIDER_DEFAULTS,solveDivider,compareDividers,dividerCSV,RC_DEFAULTS,initialRC,advanceRC,readRC,cloneRCRecord,compareRC,rcCSV,type RCMode} from '../src/lib/exploration/electricity.ts';
const near=(a:number,b:number,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('divider load obeys branch KCL, voltage drops and power conservation',()=>{
 const open=solveDivider(DIVIDER_DEFAULTS);near(open.output,3);near(open.current,.003);near(open.loadCurrent,0);
 const loaded=solveDivider({...DIVIDER_DEFAULTS,loaded:true});near(loaded.output,2);near(loaded.current,.004);near(loaded.lowerCurrent,.002);near(loaded.loadCurrent,.002);
 for(const upper of [100,500,2000])for(const lower of [100,700,2000])for(const load of [200,1000,5000]){
  const r=solveDivider({emf:12,upper,lower,load,loaded:true});near(r.current,r.lowerCurrent+r.loadCurrent);near(r.sourcePower,r.upperPower+r.lowerPower+r.loadPower);near(r.output+r.upperVoltage,12);assert.ok(r.output<r.unloaded);
 }
});
test('divider resistance scaling, unloaded ratio and disabled load invariance',()=>{
 near(solveDivider({...DIVIDER_DEFAULTS,upper:500,lower:1000}).output,4);
 near(solveDivider({...DIVIDER_DEFAULTS,upper:2000,lower:2000}).output,3);
 near(solveDivider({...DIVIDER_DEFAULTS,load:5000}).output,3);
 assert.match(compareDividers(DIVIDER_DEFAULTS,{...DIVIDER_DEFAULTS,loaded:true}),/其余条件保持相同/);
 assert.match(dividerCSV([DIVIDER_DEFAULTS]),/upper_P_W/);
});
test('RC one tau, charge and discharge match exact analytic solutions',()=>{
 const p=RC_DEFAULTS,s=advanceRC(p,initialRC(),1),r=readRC(p,s);
 near(s.voltage,6*(1-Math.exp(-1)));near(r.current,.006*Math.exp(-1));near(r.tau,1);near(r.charge,.001*s.voltage);
 const d=advanceRC(p,{...s,mode:'discharge'},1);near(d.voltage,s.voltage/Math.E);assert.ok(readRC(p,d).current<0);near(s.sourceWork,d.sourceWork);
 const almost=advanceRC(p,initialRC(),100);near(almost.voltage,6);near(readRC(p,almost).energy,.018);near(almost.heat,.018);
});
test('switching preserves voltage; ideal open hold has no current or energy loss',()=>{
 const p=RC_DEFAULTS,s=advanceRC(p,initialRC(),1),held=advanceRC(p,{...s,mode:'hold'},20);
 near(s.voltage,held.voltage);near(readRC(p,held).current,0);near(s.heat,held.heat);near(held.time,21);
 const switched={...held,mode:'discharge' as const};near(readRC(p,switched).voltage,held.voltage);assert.ok(readRC(p,switched).current<0);
});
test('RC exact stepping is frame-independent and stable at smallest/largest tau',()=>{
 for(const resistance of [500,5000])for(const capacitance of [200,2000]){
  const p={emf:9,resistance,capacitance},whole=advanceRC(p,initialRC(),4);let fine=initialRC();
  for(let i=0;i<400;i++)fine=advanceRC(p,fine,.01);
  near(whole.voltage,fine.voltage);near(whole.sourceWork,fine.sourceWork);near(whole.heat,fine.heat);
 }
});
test('arbitrary charge/hold/discharge intervals conserve cumulative energy',()=>{
 let s=initialRC();const p={emf:9,resistance:1700,capacitance:1300};
 const modes:RCMode[]=['charge','hold','discharge'];
 for(let i=0;i<1000;i++){
  const previous=s;s=advanceRC(p,{...s,mode:modes[i%3]!},(i%17)*.013);
  near(s.sourceWork,readRC(p,s).energy+s.heat,1e-9);assert.ok(s.heat>=previous.heat);assert.ok(s.voltage>=0&&s.voltage<=p.emf);
 }
});
test('larger capacitance slows voltage rise but stores more energy at equal voltage',()=>{
 const a=advanceRC(RC_DEFAULTS,initialRC(),1),p={...RC_DEFAULTS,capacitance:2000},b=advanceRC(p,initialRC(),1);
 assert.ok(b.voltage<a.voltage);near(readRC(p,b).tau,2);
 const sameFraction=advanceRC(p,initialRC(),2);near(sameFraction.voltage,a.voltage);near(readRC(p,sameFraction).energy,2*readRC(RC_DEFAULTS,a).energy);
});
test('snapshot clones and CSV retain signed current, SI capacitance and actual state',()=>{
 const a={input:{...RC_DEFAULTS},state:advanceRC(RC_DEFAULTS,initialRC(),1)},b=cloneRCRecord(a);b.state.mode='discharge';
 assert.equal(a.state.mode,'charge');const csv=rcCSV([b]);near(Number(csv.split('\r\n')[1]!.split(',')[3]),.001);assert.ok(Number(csv.split('\r\n')[1]!.split(',')[7])<0);
 assert.match(compareRC(a,b),/不能当作单变量参数对照/);
});
test('invalid physical inputs, time and unbalanced saved state are rejected',()=>{
 for(const emf of [NaN,Infinity,2,13])assert.throws(()=>solveDivider({...DIVIDER_DEFAULTS,emf}));
 for(const resistance of [0,Infinity,10000])assert.throws(()=>readRC({...RC_DEFAULTS,resistance},initialRC()));
 for(const dt of [-1,NaN,Infinity])assert.throws(()=>advanceRC(RC_DEFAULTS,initialRC(),dt));
 assert.throws(()=>readRC(RC_DEFAULTS,{...initialRC(),voltage:3}));
});
