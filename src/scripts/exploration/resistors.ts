import {DIVIDER_DEFAULTS,solveDivider,compareDividers,dividerCSV,type DividerInput} from '../../lib/exploration/electricity';
import {setupNotebook} from './study-notebook';
const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(`divider-${id}`) as T;
const text=(id:string,value:string)=>{get(id).textContent=value;};
let input={...DIVIDER_DEFAULTS},task=false;
function render(){
 const r=solveDivider(input),out=`${r.output.toFixed(3)} V`;
 for(const id of ['output','output-mini','output-label'])text(id,out);
 text('source-label',`${input.emf} V`);text('upper-voltage',`${r.upperVoltage.toFixed(3)} V`);text('current',`${(r.current*1000).toFixed(3)} mA`);text('lower-current',`${(r.lowerCurrent*1000).toFixed(3)} mA`);text('load-current',`${(r.loadCurrent*1000).toFixed(3)} mA`);text('reference',`${r.unloaded.toFixed(3)} V`);
 for(const key of ['emf','upper','lower','load'] as const){get<HTMLInputElement>(key).value=String(input[key]);text(`${key}-value`,`${input[key]} ${key==='emf'?'V':'Ω'}`);if(key!=='emf')text(`${key}-label`,`${input[key]} Ω`);}
 get('upper-slice').style.width=`${100*r.upperVoltage/input.emf}%`;get('lower-slice').style.width=`${100*r.output/input.emf}%`;
 get('load-toggle').textContent=input.loaded?'断开负载':'接上负载';get('load-toggle').setAttribute('aria-pressed',String(input.loaded));document.getElementById('divider-load-branch')!.setAttribute('opacity',input.loaded?'1':'.3');document.getElementById('divider-load-contact')!.setAttribute('d',input.loaded?'M410 235H460':'M410 235L450 215');
 text('explain',input.loaded?`负载接入：下电阻与负载并联后等效为 ${r.effective.toFixed(1)} Ω。电源电流在节点处分为 ${(r.lowerCurrent*1000).toFixed(3)} + ${(r.loadCurrent*1000).toFixed(3)} mA；输出低于同参数空载参考。`:'负载断开：上下电阻串联，电流相同；改变电阻比例，电压份额随之改变。');
 text('ledger',`${(r.sourcePower*1000).toFixed(3)} = ${(r.upperPower*1000).toFixed(3)} + ${(r.lowerPower*1000).toFixed(3)} + ${(r.loadPower*1000).toFixed(3)} mW`);
 text('formula',`U出 = E × ${input.loaded?'(R下 ∥ R负载) / (R上 + R下 ∥ R负载)':'R下 / (R上 + R下)'} = ${out}`);
 if(task)text('task-note',Math.abs(r.output-3)<=.05?'独立调阻完成：你把6 V分出了约3 V。先保存这组，再接负载检查它是否仍成立。':`只调上电阻：当前输出 ${out}，目标3.000 V（允许±0.05 V）。`);
}
function invalidate(message:string){task=false;text('task-note',message);}
try{
 render();get<HTMLFieldSetElement>('tools').disabled=false;
 for(const key of ['emf','upper','lower','load'] as const)get<HTMLInputElement>(key).addEventListener('input',()=>{input[key]=Number(get<HTMLInputElement>(key).value);if(key!=='upper')invalidate('其他条件改变，原任务已结束。可继续探索或重新准备。');render();});
 get('load-toggle').addEventListener('click',()=>{input.loaded=!input.loaded;invalidate('负载接入状态改变，原任务完成状态已清除。比较当前与空载参考电压。');render();});
 get('prepare').addEventListener('click',()=>{input={...DIVIDER_DEFAULTS,upper:500};task=true;render();get('upper').focus();});
 get('example').addEventListener('click',()=>{input={...DIVIDER_DEFAULTS};invalidate('正在观察示例，未计为独立调阻。');render();});
 document.querySelectorAll<HTMLButtonElement>('[data-divider-answer]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-divider-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  text('transfer-note',`${button.dataset.dividerAnswer==='lower'?'这个预测符合模型。':'再看并联后的等效电阻。'}参考条件下，1000 Ω与1000 Ω并联得到500 Ω，输出6×500/(1000+500)=2 V。分压器会受负载影响。这是参考计算，当前条件没有改变。`);
 }));
 setupNotebook<DividerInput>({snapshot:()=>input,clone:p=>({...p}),restore:p=>{input=p;invalidate('记录已恢复并重算，不计为独立调阻。');render();},summary:p=>`${p.emf} V · ${p.upper}/${p.lower} Ω · ${p.loaded?'接入':'断开'}${p.load} Ω负载 · 输出${solveDivider(p).output.toFixed(3)} V`,compare:compareDividers,csv:dividerCSV,filename:'resistor-divider.csv'});
}catch(error){get<HTMLFieldSetElement>('tools').disabled=true;text('task-note','分压工具未能就绪，请刷新重试。下方原理仍可阅读。');console.error(error);}
