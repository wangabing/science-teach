import {setupDiscoveries} from '../product/discoveries';
import {exactObject,sameShape} from '../../lib/product/state-validation';
import type {DiscoveryState} from '../../lib/product/discoveries';
import {CIRCUIT_DEFAULTS,CIRCUIT_PRESETS,cloneCircuit,validateCircuit,solveCircuit,wireKey,independentBranches,compareCircuits,circuitsCSV,type CircuitInput,type Terminal,type Wire} from '../../lib/exploration/circuits';

const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(`circuit-${id}`) as T;
const text=(id:string,value:string)=>{get(id).textContent=value;};
const format=(n:number,unit:string)=>`${Math.abs(n).toFixed(3)} ${unit}`;
const coordinates:Record<Terminal,[number,number]>={P:[80,105],N:[80,335],A1:[300,105],B1:[600,105],A2:[300,335],B2:[600,335]};
let input=cloneCircuit(CIRCUIT_DEFAULTS),selected:Terminal|null=null;
let records:CircuitInput[]=[],wireSignature='';
let independent=false,passed=false,example=false;
let proof:{before:number;after:number}|null=null;
let challengeMessage='你会怎样接？不必先记住“串联”或“并联”的名字。';

function invalidate(kind:'wire'|'parameter'|'example'|'restore'){
  passed=false;proof=null;
  if(kind==='wire'&&independent)challengeMessage='接线改变，先让两盏灯都亮，再断开灯1检验。';
  else{independent=false;challengeMessage=kind==='example'?'正在观察示例。点“开始独立接线”，从空板自己来一次。':kind==='restore'?'已恢复观察记录；历史接法不计为独立完成。':kind==='parameter'?'电源或电阻改变，当前任务已结束。可继续探索，或重新开始独立接线。':'当前为自由接线。可点“开始独立接线”挑战。';}
}
function drawWires(){
  const signature=input.wires.map(wireKey).join('|');if(signature===wireSignature)return;wireSignature=signature;
  const group=document.getElementById('circuit-wires')!;group.replaceChildren();get('wire-list').replaceChildren();
  for(const [a,b] of input.wires){
    const [ax,ay]=coordinates[a],[bx,by]=coordinates[b];
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    const sameRow=ay===by,controlX=(ax+bx)/2+(sameRow?0:32),controlY=(ay+by)/2+(sameRow?(ay<200?-80:80):0);
    path.setAttribute('d',`M${ax} ${ay}Q${controlX} ${controlY} ${bx} ${by}`);path.setAttribute('fill','none');path.setAttribute('stroke','#b86531');path.setAttribute('stroke-width','6');path.setAttribute('stroke-linecap','round');group.append(path);
    const button=document.createElement('button');button.type='button';button.textContent=`拆线 ${a}–${b}`;button.dataset.removeWire=wireKey([a,b]);get('wire-list').append(button);
  }
  if(!input.wires.length){const note=document.createElement('p');note.textContent='还没有导线。点两个接线柱开始。';note.style.fontSize='12px';get('wire-list').append(note);}
}
function render(){
  const r=solveCircuit(input);
  text('current',format(r.current,'A'));text('voltage',format(r.voltage,'V'));text('load-power',format(r.loadPower,'W'));text('battery-label',`${input.emf} V`);
  text('power-ledger',`${r.sourcePower.toFixed(3)} = ${r.lamps[0].power.toFixed(3)} + ${r.lamps[1].power.toFixed(3)} + ${r.internalPower.toFixed(3)} W`);
  for(let i=0;i<2;i++){
    const lamp=r.lamps[i]!,id=i+1,lit=lamp.power>1e-8;
    text(`lamp-current-${id}`,format(lamp.current,'A'));text(`lamp-voltage-${id}`,lamp.voltage===null?'悬浮':format(lamp.voltage,'V'));text(`lamp-power-${id}`,format(lamp.power,'W'));
    text(`lamp-state-${id}`,!input.enabled[i]?'已断开':lamp.bypassed?'被导线绕过':lit?'有电流 · 已点亮':lamp.floating?'悬浮 · 无电流':'无电流');
    const group=document.getElementById(`circuit-lamp-${id}`)!;
    group.querySelector('.circuit-glow')!.setAttribute('opacity',String(lamp.power/(lamp.power+.6)));
    group.querySelector('.circuit-bulb')!.setAttribute('fill',lit?'#ffe0a0':input.enabled[i]?'#fff':'#e4edf2');
    group.querySelector('.circuit-filament')!.setAttribute('stroke',lit?'#a96712':'#7896ab');
    group.querySelector('.circuit-filament')!.setAttribute('opacity',input.enabled[i]?'1':'.2');
    text(`direction-${id}`,lit?(lamp.current>0?`A${id} → B${id}`:`B${id} → A${id}`):'无电流');
    const button=document.querySelector<HTMLButtonElement>(`[data-lamp-switch="${i}"]`)!;
    button.textContent=`${input.enabled[i]?'断开':'接回'}灯${id}`;button.setAttribute('aria-pressed',String(input.enabled[i]));
  }
  for(const key of ['emf','r1','r2'] as const){const value=key==='emf'?input.emf:input.resistance[key==='r1'?0:1];get<HTMLInputElement>(key).value=String(value);text(`${key}-value`,`${value} ${key==='emf'?'V':'Ω'}`);}
  for(const button of document.querySelectorAll<HTMLButtonElement>('[data-terminal]')){
    const terminal=button.dataset.terminal as Terminal;button.setAttribute('aria-pressed',String(selected===terminal));
    const potential=r.potentials[terminal];button.title=`${terminal} · 相对 N 的电势：${potential===null?'悬浮':format(potential,'V')}`;
  }
  get('diagnosis').dataset.kind=r.shorted?'short':'normal';
  text('diagnosis',r.shorted?`电源被导线短接：P、N成了同一个电节点。外端电压为0，${format(r.current,'A')} 电流的功率耗于1 Ω内阻。拆掉连通两极的导线再试。`:r.open?'断路：从电源出发，还找不到经过灯返回另一极的完整路径。找一找没有接回的灯端。':r.lamps.some((l,i)=>l.bypassed&&input.enabled[i])?'有灯被导线绕过：它的两端成了同一电节点，电压为0。其余有通路的灯仍可工作。':'回路已闭合。沿接线从 P 出发，经过灯回到 N；试着断开一盏灯，检查另一盏的电流。');
  text('first-note',example?'正在观察示例。你也可以拆掉一根线，检查它为什么不再亮。':r.shorted?'这条路绕过了灯，直接连回电源。先拆掉短接导线。':r.lamps[0].power>1e-8?'灯1亮了！完整回路已经形成。现在可以试接灯2，或保存这组接法。':'灯1还没亮：检查它的两端是否分别有路接到电源两极。');
  if(independent&&!passed&&input.enabled.every(Boolean)&&r.lamps.every(l=>l.power>1e-8))challengeMessage='两盏灯都亮了。现在亲手点“断开灯1”，看看灯2还能不能继续亮。';
  text('challenge-note',challengeMessage);
  text('challenge-evidence',proof?`灯2功率：两灯接入 ${proof.before.toFixed(3)} W → 断开灯1 ${proof.after.toFixed(3)} W。电源内阻压降减小，所以灯2略亮。`:'');
  drawWires();
}
function chooseTerminal(terminal:Terminal){
  if(selected===null){selected=terminal;text('selection',`已选 ${terminal}。再点另一接线柱接线；再点自己或按 Escape 取消。`);render();return;}
  if(selected===terminal){selected=null;text('selection','已取消。点两个不同接线柱接线。');render();return;}
  const wire:Wire=[selected,terminal];selected=null;
  if(input.wires.some(w=>wireKey(w)===wireKey(wire))){text('selection',`${wire.join('–')} 已连接，不重复加线。需要断开时点下方“拆线”。`);render();return;}
  invalidate('wire');example=false;input.wires.push(wire);text('selection',`已连接 ${wire.join('–')}。可继续接线，或拆掉下方指定导线。`);render();
}
function cancel(){selected=null;text('selection','已取消接线。点一个接线柱重新开始。');render();}
function renderRecords(){
  get('records').replaceChildren();
  records.forEach((p,i)=>{
    const row=document.createElement('article');row.className='circuit-record';
    const copy=document.createElement('p'),r=solveCircuit(p);copy.textContent=`${i?'B':'A'} · ${p.emf} V · ${p.resistance.join(' / ')} Ω · ${p.wires.length}根线 · 电流 ${r.current.toFixed(3)} A · 灯功率 ${r.lamps.map(l=>l.power.toFixed(3)).join(' / ')} W`;
    const button=document.createElement('button');button.type='button';button.textContent=`恢复 ${i?'B':'A'}`;button.dataset.restoreCircuit=String(i);row.append(copy,button);get('records').append(row);
  });
  get<HTMLButtonElement>('export').disabled=!records.length;
  text('comparison',records.length===2?compareCircuits(records[0]!,records[1]!):'');
}

try {
  // Force initial line rendering even when the server-rendered default is unchanged.
  wireSignature='uninitialized';render();get<HTMLFieldSetElement>('tools').disabled=false;
  document.querySelectorAll<HTMLButtonElement>('[data-terminal]').forEach(button=>button.addEventListener('click',()=>chooseTerminal(button.dataset.terminal as Terminal)));
  get('cancel').addEventListener('click',cancel);
  get('tools').addEventListener('keydown',e=>{if(e.key==='Escape')cancel();});
  get('clear').addEventListener('click',()=>{input.wires=[];selected=null;invalidate('wire');example=false;text('selection','已拆掉全部导线。接线柱和灯仍在，可以重新接线。');render();});
  get('wire-list').addEventListener('click',e=>{
    const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-remove-wire]');if(!button)return;
    input.wires=input.wires.filter(w=>wireKey(w)!==button.dataset.removeWire);selected=null;invalidate('wire');example=false;text('selection',`已${button.textContent}。`);render();
    (get('wire-list').querySelector<HTMLButtonElement>('button')??get<HTMLButtonElement>('clear')).focus();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-lamp-switch]').forEach(button=>button.addEventListener('click',()=>{
    const i=Number(button.dataset.lampSwitch),before=cloneCircuit(input),beforeReading=solveCircuit(before);
    input.enabled[i]=!input.enabled[i];passed=false;proof=null;
    if(independent&&i===0&&!input.enabled[0]){
      const after=solveCircuit(input);
      if(independentBranches(before)&&after.lamps[1].power>1e-8){passed=true;proof={before:beforeReading.lamps[1].power,after:after.lamps[1].power};challengeMessage='独立接线验证完成：你让两灯都亮，并亲手断开灯1，灯2仍亮。模型也检查了反向断灯2时灯1仍有通路。';}
      else challengeMessage='还没有形成两条独立通路。接回灯1，再调整接线：灯2需要自己连到电源两极，不能借道灯1。';
    }else if(independent)challengeMessage='灯的接入状态改变，原验证已清除。先接回两盏灯，再断开灯1检验。';
    else challengeMessage='已改变灯的接入状态。可以保存前后读数，或从空板开始独立接线。';
    render();
  }));
  for(const key of ['emf','r1','r2'] as const)get<HTMLInputElement>(key).addEventListener('input',()=>{
    const value=Number(get<HTMLInputElement>(key).value);if(key==='emf')input.emf=value;else input.resistance[key==='r1'?0:1]=value;
    invalidate('parameter');example=false;render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-circuit-preset]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.circuitPreset as keyof typeof CIRCUIT_PRESETS;input=cloneCircuit(CIRCUIT_DEFAULTS);input.wires=CIRCUIT_PRESETS[name].map(w=>[...w]);selected=null;invalidate('example');example=true;text('selection',`已载入${button.textContent}。可拆线或断灯继续观察。`);render();
  }));
  get('prepare').addEventListener('click',()=>{
    input=cloneCircuit(CIRCUIT_DEFAULTS);input.wires=[];selected=null;independent=true;passed=false;proof=null;example=false;
    challengeMessage='空板已准备好：6 V，两灯各20 Ω。自己接线，让两灯都亮，再断开灯1。';text('selection','从空板开始。每次点两个接线柱接一根导线。');render();
    document.querySelector<HTMLButtonElement>('[data-terminal="P"]')!.focus();
  });
  get('save').addEventListener('click',()=>{records.push(cloneCircuit(input));if(records.length>2)records.shift();renderRecords();text('record-note',`已保存 ${records.length} 组。仅当前页保留；可继续改变一个条件。`);});
  get('records').addEventListener('click',e=>{
    const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-restore-circuit]');if(!button)return;
    input=cloneCircuit(records[Number(button.dataset.restoreCircuit)]!);selected=null;invalidate('restore');example=false;text('selection','已恢复记录并重新计算。没有恢复独立挑战状态。');render();text('record-note',`已${button.textContent}，读数已重新计算。`);
  });
  get('export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob(['\uFEFF'+circuitsCSV(records)],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='circuit-observations.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-circuit-answer]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-circuit-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const p=cloneCircuit(CIRCUIT_DEFAULTS);p.wires=CIRCUIT_PRESETS.parallel.map(w=>[...w]);const before=solveCircuit(p);p.enabled[0]=false;const after=solveCircuit(p);
    text('transfer-note',`${button.dataset.circuitAnswer==='brighter'?'这个预测符合当前恒阻模型。':'再检查电源内阻，而不只看“并联”这个名字。'}参考条件6 V、两灯20 Ω时，断灯1后端电压 ${before.voltage.toFixed(3)}→${after.voltage.toFixed(3)} V，灯2功率 ${before.lamps[1].power.toFixed(3)}→${after.lamps[1].power.toFixed(3)} W。总电流减小，内阻压降也减小；若是理想零内阻电源，才会保持不变。这是参考计算，当前接线没有被改动。`);
  }));
}catch(error){
  get<HTMLFieldSetElement>('tools').disabled=true;text('diagnosis','接线工具未能就绪，请刷新后重试。下方原理和历史说明仍可阅读。');console.error(error);
}

setupDiscoveries({slug:'circuits',snapshot:()=>cloneCircuit(input) as unknown as DiscoveryState,
 validate:(s):s is DiscoveryState=>{try{if(!exactObject(s,['emf','resistance','enabled','wires'])||!sameShape(CIRCUIT_DEFAULTS.emf,s.emf)||!sameShape(CIRCUIT_DEFAULTS.resistance,s.resistance)||!sameShape(CIRCUIT_DEFAULTS.enabled,s.enabled)||!Array.isArray(s.wires)||!s.wires.every(w=>Array.isArray(w)&&w.length===2))return false;validateCircuit(s as unknown as CircuitInput);return true;}catch{return false;}},
 labels:{emf:'电动势 V',resistance:'灯电阻 Ω',enabled:'接入状态',wires:'接线拓扑'},
 describe:s=>{const p=s as unknown as CircuitInput,r=solveCircuit(p);return `${p.emf} V；电阻 ${p.resistance.join('/')} Ω；接入 ${p.enabled.join('/')}；导线 ${p.wires.map(w=>w.join('—')).join('、')||'无'}；总电流 ${r.current.toFixed(3)} A。`;},
 restore:s=>{input=cloneCircuit(s as unknown as CircuitInput);selected=null;invalidate('restore');example=false;document.querySelectorAll('[data-circuit-answer]').forEach(b=>b.setAttribute('aria-pressed','false'));text('transfer-note','请重新预测，再检验。');text('selection','已恢复接线并重算，不计独立挑战。');render();}});
