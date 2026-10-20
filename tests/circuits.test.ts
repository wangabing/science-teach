import {test} from 'node:test';
import assert from 'node:assert/strict';
import {solveCircuit,cloneCircuit,CIRCUIT_DEFAULTS,CIRCUIT_PRESETS,TERMINALS,independentBranches,compareCircuits,circuitsCSV,type Wire} from '../src/lib/exploration/circuits.ts';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function preset(name:keyof typeof CIRCUIT_PRESETS){const p=cloneCircuit(CIRCUIT_DEFAULTS);p.wires=CIRCUIT_PRESETS[name].map(w=>[...w]);return p;}

test('single, series and parallel agree with analytic E/(r+R) results',()=>{
  const single=solveCircuit(preset('single'));near(single.current,6/21);near(single.lamps[0].power,36*20/441);near(single.lamps[1].power,0);assert.equal(single.lamps[1].floating,true);
  const series=solveCircuit(preset('series'));near(series.current,6/41);near(series.lamps[0].current,6/41);near(series.lamps[1].current,6/41);
  const parallel=solveCircuit(preset('parallel'));near(parallel.current,6/11);near(parallel.lamps[0].current,3/11);near(parallel.lamps[1].current,3/11);
});
test('unequal parallel lamps have equal voltage, different current and balanced power',()=>{
  const p=preset('parallel');p.resistance=[10,40];const r=solveCircuit(p);
  near(r.voltage,6*8/9);near(r.lamps[0].current/r.lamps[1].current,4);near(r.sourcePower,r.loadPower+r.internalPower);
});
test('floating and one-ended lamps carry no current; source short has finite internal loss',()=>{
  const open=solveCircuit(CIRCUIT_DEFAULTS);assert.equal(open.open,true);near(open.lamps[0].voltage!,0);assert.equal(open.potentials.A2,null);
  const p=preset('parallel');p.wires.push(['P','N']);const r=solveCircuit(p);
  assert.equal(r.shorted,true);near(r.current,6);near(r.voltage,0);near(r.loadPower,0);near(r.internalPower,36);
});
test('bypassing one series lamp is different from shorting the supply; orientation is signed',()=>{
  const p=preset('series');p.wires.push(['A1','B1']);const r=solveCircuit(p);
  assert.equal(r.shorted,false);assert.equal(r.lamps[0].bypassed,true);near(r.lamps[1].current,6/21);
  p.wires=[['P','B1'],['A1','N']];near(solveCircuit(p).lamps[0].current,-6/21);
});
test('only independent branches survive either lamp being removed, with voltage coupling',()=>{
  assert.equal(independentBranches(preset('single')),false);assert.equal(independentBranches(preset('series')),false);assert.equal(independentBranches(preset('parallel')),true);
  const p=preset('parallel'),before=solveCircuit(p);p.enabled[0]=false;const after=solveCircuit(p);
  near(after.lamps[0].current,0);near(after.lamps[1].current,6/21);assert.ok(after.lamps[1].power>before.lamps[1].power);
});
test('all 32768 wire topologies solve without singularities and conserve nonnegative power',()=>{
  const pairs:Wire[]=[];for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)pairs.push([TERMINALS[i]!,TERMINALS[j]!]);
  for(let mask=0;mask<32768;mask++){
    const p=cloneCircuit(CIRCUIT_DEFAULTS);p.wires=pairs.filter((_,i)=>mask&(1<<i));p.resistance=[13,37];p.emf=9;
    const r=solveCircuit(p);near(r.sourcePower,r.loadPower+r.internalPower);
    assert.ok(Number.isFinite(r.current)&&r.current>=0&&r.current<=9+1e-9);
    for(const lamp of r.lamps)assert.ok(Number.isFinite(lamp.power)&&lamp.power>=0);
  }
});
test('invalid physical parameters and malformed/duplicate wires are rejected',()=>{
  for(const emf of [NaN,Infinity,2,10])assert.throws(()=>solveCircuit({...cloneCircuit(CIRCUIT_DEFAULTS),emf}));
  for(const wires of [[['P','P']],[['P','A1'],['A1','P']],[['X','N']]] as Wire[][])assert.throws(()=>solveCircuit({...cloneCircuit(CIRCUIT_DEFAULTS),wires}));
});
test('snapshots are independent; CSV exports recomputed SI values and comparisons count changes',()=>{
  const a=preset('parallel'),b=cloneCircuit(a);b.resistance[0]=40;
  assert.equal(a.resistance[0],20);assert.match(compareCircuits(a,b),/灯1电阻 20→40 Ω/);assert.match(compareCircuits(a,b),/其余条件保持相同/);
  b.emf=9;assert.match(compareCircuits(a,b),/多个条件改变/);
  const csv=circuitsCSV([a,b]);assert.match(csv,/terminal_U_V/);assert.match(csv,/resistive-lamps-v1/);near(Number(csv.split('\r\n')[1]!.split(',')[8]),6/11);
});
