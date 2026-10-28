import {setupControlDiscoveries} from '../product/control-discoveries';
import { gearTrain,gearOutline } from '../../lib/exploration/gears';
import { el,text,value,bindRange,clock } from './ui';
import { bars } from './evidence';
let hasIdler=false,time=0,demoMode=false;
const animator=clock(()=>{
  time+=.1;
  if(demoMode){
    text('demo-stage',`标准演示：输入已转 ${(value('rpm')*time/60).toFixed(2)} 圈，输出转了 ${(Math.abs(gearTrain(teeth(),value('rpm')).speeds.at(-1)!)*time/60).toFixed(2)} 圈。观察减速与转向。`);
    if(value('rpm')*time/60>=3){animator.pause();demoMode=false;text('demo-stage','演示完成：输入 3 圈，输出 1 圈。现在改变齿数，看看比值怎样变化。');}
  }
},render,.1);
function teeth(){return hasIdler?[value('input-teeth'),value('idler-teeth'),value('output-teeth')]:[value('input-teeth'),value('output-teeth')];}
function render(){
  const ns=teeth(),train=gearTrain(ns,value('rpm')),radii=ns.map(n=>n*2.2),total=2*radii.reduce((s,r)=>s+r,0),fit=Math.min(1,760/total),rs=radii.map(r=>r*fit);
  let start=(900-2*rs.reduce((s,r)=>s+r,0))/2;
  const centers=rs.map(r=>{const x=start+r;start+=2*r;return x;});
  const colors=['#68a8a0',...(hasIdler?['#91a9c1']:[]),'#e4af53'];
  const names=hasIdler?['输入轮','中间轮','输出轮']:['输入轮','输出轮'];
  const phases=[0];for(let i=1;i<ns.length;i++)phases.push(180+(180/ns[i]!)-(ns[i-1]!/ns[i]!)*phases[i-1]!);
  el('gear-wheels').innerHTML=ns.map((n,i)=>{
    const angle=(train.speeds[i]!*time*6+phases[i]!)%360;
    return `<g transform="translate(${centers[i]} 190)"><circle r="${rs[i]}" fill="none" stroke="#9a958b" stroke-dasharray="3 5"/><g transform="rotate(${angle})"><polygon points="${gearOutline(n,rs[i]!)}" fill="${colors[i]}" stroke="#896b42" stroke-width="1.2"/><path d="M0 0L${rs[i]!*0.75} 0" stroke="white" stroke-width="4"/><circle cx="${rs[i]!*0.78}" cy="0" r="5" fill="white"/></g><circle r="${Math.max(10,rs[i]!*0.12)}" fill="#fff9ef" stroke="#896b42" stroke-width="2"/></g>`;
  }).join('');
  const maxRadius=Math.max(...rs),width=2*rs.reduce((s,r)=>s+r,0)+64;
  el('gear-svg').setAttribute('viewBox',`${(900-width)/2} ${190-maxRadius-24} ${width} ${2*maxRadius+48}`);
  el('gear-labels').innerHTML='';
  el('gear-captions').innerHTML=ns.map((n,i)=>`<div><strong style="color:${colors[i]}">${names[i]} · ${n} 齿</strong><span>${Math.abs(train.speeds[i]!).toFixed(2)} rpm · ${train.speeds[i]!>0?'顺时针':'逆时针'}</span></div>`).join('');
  const input=value('rpm'),output=Math.abs(train.speeds.at(-1)!),inTurns=input*time/60,outTurns=output*time/60;
  text('gear-live-formula',`${output.toFixed(2)} / ${input} = ${ns[0]} / ${ns.at(-1)} = ${train.speedRatio.toFixed(3)}（${hasIdler?'首尾同向':'首尾反向'}）`);
  text('gear-torque-formula',`${ns.at(-1)} / ${ns[0]} = ${train.torqueRatio.toFixed(3)}；1 N·m → ${train.torqueRatio.toFixed(3)} N·m`);
  bars('gear-speed-bars',[{label:'输入转速',value:input,color:'#188d83'},{label:'输出转速（大小）',value:output,color:'#b97529'}],undefined,'rpm');
  bars('gear-torque-bars',[{label:'输入扭矩（参考）',value:1,color:'#188d83'},{label:'输出理想扭矩',value:train.torqueRatio,color:'#b97529'}],undefined,'N·m');
  bars('gear-turn-bars',[{label:'输入累计转数',value:inTurns,color:'#188d83'},{label:'输出累计转数',value:outTurns,color:'#b97529'}],undefined,'圈');
  text('input-turns',inTurns.toFixed(3));text('output-turns',outTurns.toFixed(3));
  function dial(id:string,turns:number,sign:number,color:string){const angle=turns*2*Math.PI*sign,dx=Math.cos(angle)*62,dy=Math.sin(angle)*62;el(id).innerHTML=`<circle cx="90" cy="90" r="72" fill="#f4f8fa" stroke="${color}" stroke-width="3"/><path d="M90 17V28M163 90H152M90 163V152M17 90H28" stroke="#a5b8c4"/><path d="M90 90l${dx} ${dy}" stroke="${color}" stroke-width="5"/><circle cx="90" cy="90" r="6" fill="${color}"/><text x="90" y="120" text-anchor="middle" font-size="16" fill="#153b56">${turns.toFixed(2)} 圈</text>`;}
  dial('input-dial',inTurns,1,'#188d83');dial('output-dial',outTurns,hasIdler?1:-1,'#b97529');
  text('gear-turn-explain',`已观察 ${time.toFixed(1)} 秒；输入 ${inTurns.toFixed(3)} 圈，输出 ${outTurns.toFixed(3)} 圈。累计转数比也为 ${train.speedRatio.toFixed(3)}。`);
  text('gear-speed' ,`${Math.abs(train.speeds.at(-1)!).toFixed(2)} rpm`);text('gear-direction',hasIdler?'同向':'反向');text('gear-ratio',train.speedRatio.toFixed(3));text('gear-torque',`${train.torqueRatio.toFixed(3)} ×`);
  text('gear-feedback',Math.abs(train.speedRatio-1/3)<1e-8?hasIdler?'挑战完成！输出为输入的 1/3，首尾同向。改变中间轮齿数，观察这个结果是否保持。':'已达成三倍减速！再加入中间齿轮，让首尾同向。':'挑战：让输出轮慢到输入轮的 1/3，再让它与输入轮同向。试着让输出齿数是输入的三倍。');
}
function rebuild(){animator.pause();demoMode=false;time=0;text('demo-stage','装配已改变。按“开始 / 继续”，同时观察装置和下方传动比证据。');['input-teeth','idler-teeth','output-teeth'].forEach(id=>text(`${id}-value`,String(value(id))));text('rpm-value',`${value('rpm')} rpm`);render();}
function setIdler(){el('idler-field').toggleAttribute('hidden',!hasIdler);el('idler').setAttribute('aria-pressed',String(hasIdler));el('idler').textContent=hasIdler?'移除中间齿轮':'加入中间齿轮';rebuild();}
el('idler').addEventListener('click',()=>{hasIdler=!hasIdler;setIdler();});
el('reset').addEventListener('click',()=>{hasIdler=false;[['input-teeth','20'],['idler-teeth','30'],['output-teeth','40'],['rpm','12']].forEach(([id,v])=>el<HTMLInputElement>(id!).value=v!);setIdler();});
['input-teeth','idler-teeth','output-teeth','rpm'].forEach(id=>bindRange(id,rebuild));setIdler();

function demonstrate(idler:boolean){hasIdler=idler;el<HTMLInputElement>('input-teeth').value='20';el<HTMLInputElement>('output-teeth').value='60';el<HTMLInputElement>('idler-teeth').value='30';el<HTMLInputElement>('rpm').value='12';setIdler();demoMode=true;animator.start();}
el('demo').addEventListener('click',()=>demonstrate(false));el('demo-idler').addEventListener('click',()=>demonstrate(true));el('demo-pause').addEventListener('click',()=>{animator.pause();text('demo-stage','已暂停：比较输入、输出累计圈数与扭矩。按“开始 / 继续”继续。');});

setupControlDiscoveries('gears',['input-teeth','idler-teeth','output-teeth','rpm'],s=>{hasIdler=s.idler===1;setIdler();},s=>`主动/中间/从动齿数 ${s['input-teeth']}/${s['idler-teeth']}/${s['output-teeth']}；主动 ${s.rpm} rpm；${s.idler?'含':'无'}中间轮。恢复暂停初态。`,{read:()=>({idler:hasIdler?1:0}),rules:{idler:{min:0,max:1,options:[0,1]}},labels:{idler:'中间轮'},check:s=>['input-teeth','idler-teeth','output-teeth'].every(k=>Number.isInteger(s[k]))});
