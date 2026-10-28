import {setupControlDiscoveries} from '../product/control-discoveries';
import { threePreset,stepThree,threeEnergy,separation,minDistance,threeAccelerations,type Body } from '../../lib/exploration/three-body';
import { el,text,value,bindRange,clock } from './ui';
import { bodyEnergies } from '../../lib/exploration/measurements';
import { bars,history,sample,type Sample } from './evidence';
let preset:'eight'|'sensitive'='eight',a:Body[]=[],b:Body[]=[],eA=0,eB=0,time=0,blocked=false;
let trailsA:[number,number][][]=[[],[],[]],trailsB:[number,number][][]=[[],[],[]];
let readings:Sample[]=[],demoMode=false;
const colors=['#188d83','#d18f25','#8c69bf'];
const animator=clock(step,render);
const relative=(bodies:Body[],initial:number)=>Math.abs((threeEnergy(bodies)-initial)/Math.max(Math.abs(initial),1e-12));
function tick(){
  if(blocked){animator.pause();return;}
  for(let i=0;i<20;i++){
    a=stepThree(a,.0005);b=stepThree(b,.0005);time+=.0005;
    if(Math.min(minDistance(a),minDistance(b))<.04||Math.max(relative(a,eA),relative(b,eB))>.02){blocked=true;animator.pause();text('three-feedback','出现过近相遇或能量误差过大，已自动暂停。当前固定步长不足以可靠继续；请重置或换一个初态。');break;}
  }
  sample(readings,time,[separation(a,b)]);
  [a,b].forEach((bodies,j)=>bodies.forEach((body,i)=>{const trail=(j?trailsB:trailsA)[i]!;trail.push([body.x,body.y]);if(trail.length>1400)trail.shift();}));
}
function step(){
  const rate=animator.isRunning()?Number(el<HTMLSelectElement>('time-rate').value):1;
  for(let i=0;i<rate&&!blocked;i++)tick();
  if(demoMode&&!blocked){
    text('demo-stage',`标准演示 · t=${time.toFixed(2)}：${preset==='eight'?'跟随三颗不同颜色的星，观察路径与引力方向。':'两边初态只差一点。位置差曲线记录分离，能量偏差帮助检查数值精度。'}`);
    if(time>=12){animator.pause();demoMode=false;text('demo-stage','标准观察时段结束，已暂停。比较分离曲线，改变一个条件后再运行。');}
  }
}
function render(){
  el<HTMLButtonElement>('run').disabled=blocked;el<HTMLButtonElement>('step').disabled=blocked;
  const extent=Math.max(2,...[...a,...b].map(p=>Math.max(Math.abs(p.x),Math.abs(p.y))*1.2)),scale=175/extent;
  const coord=(x:number,y:number)=>`${(220+x*scale).toFixed(2)},${(200-y*scale).toFixed(2)}`;
  [a,b].forEach((bodies,j)=>{
    const name=j?'b':'a',trails=j?trailsB:trailsA;
    el(`trails-${name}`).innerHTML=trails.map((trail,i)=>`<path d="${trail.map(([x,y],k)=>`${k?'L':'M'}${coord(x,y)}`).join(' ')}" fill="none" stroke="${colors[i]}" stroke-width="1.5" opacity=".7"/>`).join('');
    const forces=threeAccelerations(bodies);
    el(`forces-${name}`).innerHTML=el<HTMLInputElement>('show-forces').checked?bodies.map((p,i)=>{const f=forces[i]!,l=Math.hypot(f.x,f.y)||1,dx=f.x/l*32,dy=-f.y/l*32,x=220+p.x*scale,y=200-p.y*scale;return `<path d="M${x} ${y}l${dx} ${dy}m${-dx*.25-dy*.15} ${-dy*.25+dx*.15}l${dx*.25+dy*.15} ${dy*.25-dx*.15}l${-dx*.25+dy*.15} ${-dy*.25-dx*.15}" fill="none" stroke="${colors[i]}" stroke-width="2" opacity=".7"/>`;}).join(''):'';
    el(`bodies-${name}`).innerHTML=bodies.map((p,i)=>`<circle cx="${220+p.x*scale}" cy="${200-p.y*scale}" r="${8*Math.sqrt(p.mass)}" fill="${colors[i]}"/><text x="${233+p.x*scale}" y="${205-p.y*scale}" fill="#153b56" font-size="12">${i+1}</text>`).join('');
  });
  const energies=bodyEnergies(a),forces=threeAccelerations(a);
  history('three-history',readings,['位置差 RMS'],'位置单位');
  bars('three-energy-bars',[{label:'A 动能（正）',value:energies.kinetic,color:'#188d83'},{label:'A 势能（负）',value:energies.potential,color:'#b97529'},{label:'A 总能量',value:energies.total,color:'#6757ad'}],undefined,'无量纲');
  text('three-live-formula',`G=1，ε=0.01；m₁=${a[0]!.mass.toFixed(2)}；初速度倍率=${value('velocity-scale').toFixed(2)}；δ=${value('perturbation').toFixed(3)}`);
  const initialDistance=value('perturbation')/Math.sqrt(3);
  text('three-growth',initialDistance===0?'δ=0，两边初态完全相同；位置差应为 0。':`初始 RMS=${initialDistance.toFixed(6)}，当前=${separation(a,b).toFixed(6)}，相当于初始的 ${(separation(a,b)/initialDistance).toFixed(2)} 倍。`);
  text('three-energy-explain',`A：${energies.kinetic.toFixed(4)} + (${energies.potential.toFixed(4)}) = ${energies.total.toFixed(4)}。总能量相对初态的偏差见上方读数。`);
  el('three-body-table').innerHTML=a.map((p,i)=>`<tr><td>星 ${i+1}</td><td>${p.mass.toFixed(2)}</td><td>${Math.hypot(p.vx,p.vy).toFixed(3)}</td><td>${Math.hypot(forces[i]!.x,forces[i]!.y).toFixed(3)}</td></tr>`).join('');
  text('three-scale' ,`SAME SCALE · ±${extent.toFixed(2)}`);text('three-time',time.toFixed(2));text('three-distance',separation(a,b).toFixed(6));text('energy-a',`${(relative(a,eA)*100).toFixed(4)}%`);text('energy-b',`${(relative(b,eB)*100).toFixed(4)}%`);
}
function reset(){
  animator.pause();demoMode=false;a=threePreset(preset).map((p,i)=>({...p,mass:i===0?value('star-mass'):1,vx:p.vx*value('velocity-scale'),vy:p.vy*value('velocity-scale')}));b=a.map(p=>({...p}));b[0]!.x+=value('perturbation');eA=threeEnergy(a);eB=threeEnergy(b);time=0;blocked=false;readings=[{time:0,values:[separation(a,b)]}];text('star-mass-value',value('star-mass').toFixed(2));text('velocity-scale-value',`${value('velocity-scale').toFixed(2)} ×`);text('demo-stage','初态已重置。先预测质量、速度或位置的变化会如何影响轨迹。');
  trailsA=a.map(p=>[[p.x,p.y]]);trailsB=b.map(p=>[[p.x,p.y]]);
  text('perturbation-value',value('perturbation').toFixed(3));text('three-feedback',value('perturbation')===0?'δ=0：两套系统完全相同。开始后，位置差应始终为 0。':'只有第一颗星向右移动了一点。两边独立计算；比较同一时刻的位置差和能量误差。');
  el('eight').setAttribute('aria-pressed',String(preset==='eight'));el('sensitive').setAttribute('aria-pressed',String(preset==='sensitive'));render();
}
el('eight').addEventListener('click',()=>{preset='eight';reset();});el('sensitive').addEventListener('click',()=>{preset='sensitive';reset();});el('reset').addEventListener('click',()=>{preset='eight';el<HTMLInputElement>('perturbation').value='.001';el<HTMLInputElement>('star-mass').value='1';el<HTMLInputElement>('velocity-scale').value='1';el<HTMLSelectElement>('time-rate').value='1';reset();});bindRange('perturbation',reset);reset();

['star-mass','velocity-scale'].forEach(id=>bindRange(id,reset));el('show-forces').addEventListener('change',render);
function demonstrate(kind:'eight'|'sensitive'|'mass'){
  preset=kind==='sensitive'?'sensitive':'eight';el<HTMLInputElement>('star-mass').value=kind==='mass'?'1.5':'1';el<HTMLInputElement>('velocity-scale').value='1';el<HTMLInputElement>('perturbation').value=kind==='sensitive'?'.001':'0';
  reset();el<HTMLSelectElement>('time-rate').value='10';demoMode=true;animator.start();
}
el('demo').addEventListener('click',()=>demonstrate('eight'));el('demo-sensitive').addEventListener('click',()=>demonstrate('sensitive'));el('demo-mass').addEventListener('click',()=>demonstrate('mass'));
el('demo-pause').addEventListener('click',()=>{animator.pause();text('demo-stage','已暂停：可以逐星读速率与合加速度，再继续观察。');});el('time-rate').addEventListener('change',()=>{demoMode=false;});

setupControlDiscoveries('three-body',['perturbation','star-mass','velocity-scale'],s=>{preset=s.preset===0?'eight':'sensitive';reset();},s=>`${s.preset===0?'八字':'敏感'}初态；位置扰动 ${s.perturbation}；第一星质量 ${s['star-mass']}；速度倍率 ${s['velocity-scale']}。恢复初态，不补造轨迹。`,{read:()=>({preset:preset==='eight'?0:1}),rules:{preset:{min:0,max:1,options:[0,1]}},labels:{preset:'初态'}});
