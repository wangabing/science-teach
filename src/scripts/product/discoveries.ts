import {decodeDiscoveries,discoveryKey,encodeDiscoveries,compareConditions,type DiscoveryState,type PersonalDiscovery} from '../../lib/product/discoveries';
export interface DiscoveryAdapter {
 slug:string;snapshot:()=>DiscoveryState;validate:(value:unknown)=>value is DiscoveryState;
 restore:(state:DiscoveryState)=>void;describe:(state:DiscoveryState)=>string;labels:Record<string,string>;
}
export function setupDiscoveries(adapter:DiscoveryAdapter){
 const root=document.querySelector<HTMLElement>('[data-personal-discoveries]');if(!root||root.dataset.slug!==adapter.slug)return;
 const get=<T extends HTMLElement=HTMLElement>(name:string)=>root.querySelector<T>(`[data-discovery-${name}]`)!;
 const prediction=get<HTMLTextAreaElement>('prediction'),explanation=get<HTMLTextAreaElement>('explanation');
 let records:PersonalDiscovery[]=[];
 const status=(message:string)=>get('status').textContent=message;
 function save(){
  try{if(records.length)localStorage.setItem(discoveryKey(adapter.slug),encodeDiscoveries(adapter.slug,records));else localStorage.removeItem(discoveryKey(adapter.slug));return true;}
  catch{return false;}
 }
 function render(){
  get('records').replaceChildren();
  records.forEach((record,index)=>{
   const card=document.createElement('article'),heading=document.createElement('h3'),conditions=document.createElement('p'),words=document.createElement('p'),button=document.createElement('button');
   heading.textContent=`${index?'B':'A'} · 我的发现`;conditions.textContent=adapter.describe(record.conditions);
   words.textContent=`我的预测：${record.prediction||'未填写'}\n我的解释：${record.explanation||'未填写'}`;
   button.type='button';button.textContent=`恢复发现 ${index?'B':'A'}`;
   button.addEventListener('click',()=>{
    if(!adapter.validate(record.conditions)){status('条件已不兼容，未恢复。请清除后重新记录。');return;}
    adapter.restore(structuredClone(record.conditions));prediction.value=record.prediction;explanation.value=record.explanation;
    status('已恢复条件并重算；运动已暂停，不恢复独立任务资格或未保存的轨迹。');
   });card.append(heading,conditions,words,button);get('records').append(card);
  });
  get('comparison').textContent=records.length===2?compareConditions(records[0]!.conditions,records[1]!.conditions,adapter.labels):'留两组不同条件，再比较改变了什么。';
 }
 try{const raw=localStorage.getItem(discoveryKey(adapter.slug));if(raw!==null){records=decodeDiscoveries(raw,adapter.slug,adapter.validate);status(`已找回 ${records.length} 组本机发现；恢复后才会改变装置。`);}}
 catch{status('本机记录无法读取或版本/条件不兼容，未恢复。可清除记录后重新保存。');}
 get<HTMLButtonElement>('save').disabled=false;
 get('save').addEventListener('click',()=>{
  const conditions=adapter.snapshot();if(!adapter.validate(conditions)){status('当前条件无法保存，请回到有效参数范围。');return;}
  records.push({conditions:structuredClone(conditions),prediction:prediction.value.slice(0,1000),explanation:explanation.value.slice(0,2000)});if(records.length>2)records.shift();
  const saved=save();render();status(saved?`已保存在此浏览器，共 ${records.length} 组；不上传、不跨设备同步。`:'本机保存不可用，这些发现仅保留在当前页面；请复制文字后再离开。');
 });
 get('clear').addEventListener('click',()=>{
  records=[];const saved=save();prediction.value='';explanation.value='';render();status(saved?'本机发现已清除；原实验记录不受影响。':'当前页已清空，但本机存储不可访问，无法确认旧记录已删除。');
 });
 render();root.dataset.ready='true';
}
