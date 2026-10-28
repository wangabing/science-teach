import {setupDiscoveries} from '../product/discoveries';
import type {DiscoveryState} from '../../lib/product/discoveries';
export function setupNotebook<T>(options:{snapshot:()=>T;clone:(p:T)=>T;restore:(p:T)=>void;summary:(p:T)=>string;compare:(a:T,b:T)=>string;csv:(p:T[])=>string;filename:string;onRecordsChange?:(records:T[])=>void;durable?:{slug:string;validate:(value:unknown)=>value is T&DiscoveryState;labels?:Record<string,string>}}){
  const get=(id:string)=>document.getElementById(`study-${id}`)!;
  const records:T[]=[];
  function render(){
    get('records').replaceChildren();
    records.forEach((record,i)=>{
      const row=document.createElement('article');row.className='study-record';const copy=document.createElement('p');copy.textContent=`${i?'B':'A'} · ${options.summary(record)}`;
      const button=document.createElement('button');button.type='button';button.textContent=`恢复 ${i?'B':'A'}`;button.dataset.restoreStudy=String(i);row.append(copy,button);get('records').append(row);
    });
    options.onRecordsChange?.(records.map(options.clone));
    (get('export') as HTMLButtonElement).disabled=!records.length;get('comparison').textContent=records.length===2?options.compare(records[0]!,records[1]!):'';
  }
  get('save').addEventListener('click',()=>{records.push(options.clone(options.snapshot()));if(records.length>2)records.shift();render();get('record-note').textContent=`已记下 ${records.length} 组，刷新后清除。`;});
  get('records').addEventListener('click',e=>{
    const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-restore-study]');if(!button)return;
    options.restore(options.clone(records[Number(button.dataset.restoreStudy)]!));get('record-note').textContent=`已${button.textContent}，读数重新计算，任务完成状态未恢复。`;
  });
  get('export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob(['\uFEFF'+options.csv(records)],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=options.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if(options.durable)setupDiscoveries({slug:options.durable.slug,snapshot:()=>options.clone(options.snapshot()) as unknown as DiscoveryState,validate:options.durable.validate,restore:value=>options.restore(options.clone(value as T)),describe:value=>options.summary(value as T),labels:options.durable.labels??{}});

}
