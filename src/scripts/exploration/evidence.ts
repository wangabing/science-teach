import {el} from './ui';
export interface Bar {label:string;value:number;color?:string}
export function bars(id:string,items:Bar[],maximum?:number,unit=''){
  const max=maximum??Math.max(1,...items.map(i=>Math.abs(i.value)));
  el(id).innerHTML=items.map(i=>`<div class="comparison-row"><div><span>${i.label}</span><strong>${Number.isFinite(i.value)?i.value.toFixed(2):'—'} ${unit}</strong></div><div class="comparison-track"><span style="width:${Math.min(100,Math.abs(i.value)/max*100)}%;background:${i.color??'var(--accent)'}"></span></div></div>`).join('');
}
export type Sample={time:number;values:number[]};
export function sample(history:Sample[],time:number,values:number[]){history.push({time,values});if(history.length>500)history.shift();}
export function history(id:string,data:Sample[],labels:string[],unit:string){
  const colors=['#188d83','#b97529','#6757ad'];
  const values=data.flatMap(s=>s.values).filter(Number.isFinite),min=Math.min(0,...values),max=Math.max(1e-8,...values),span=max-min||1;
  const first=data[0]?.time??0,last=data.at(-1)?.time??1,timeSpan=last-first||1;
  const paths=labels.map((_,j)=>`<path d="${data.map((s,i)=>`${i?'L':'M'}${(55+(s.time-first)/timeSpan*480).toFixed(2)},${(185-(s.values[j]!-min)/span*145).toFixed(2)}`).join(' ')}" fill="none" stroke="${colors[j]}" stroke-width="2.5"/>`).join('');
  el(id).innerHTML=`<svg viewBox="0 0 560 240" role="img" aria-label="${labels.join('、')} 随模拟时间变化，纵轴 ${unit}"><path d="M55 30V185H535" fill="none" stroke="#9cb4c4"/><path d="M55 112H535M55 40H535" stroke="#e0eaf0" stroke-dasharray="4 4"/>${paths}<text x="50" y="30" text-anchor="end" font-size="11" fill="#5b7588">${max.toPrecision(3)}</text><text x="50" y="188" text-anchor="end" font-size="11" fill="#5b7588">${min.toPrecision(2)}</text><text x="55" y="205" font-size="11" fill="#5b7588">${first.toFixed(1)}</text><text x="535" y="205" text-anchor="end" font-size="11" fill="#5b7588">${last.toFixed(1)}</text><text x="295" y="228" text-anchor="middle" font-size="12" fill="#5b7588">模拟时间 · ${unit==='km'?'分钟':'无量纲'}</text></svg><div class="chart-legend">${labels.map((label,i)=>`<span style="color:${colors[i]}">● ${label}</span>`).join('')}<span>纵轴：${unit} · 自动范围</span></div>`;
}
