import {checkedState} from '../../lib/product/state-validation';
import {validateRC} from '../../lib/exploration/electricity';
import {RC_DEFAULTS,initialRC,advanceRC,readRC,cloneRCRecord,compareRC,rcCSV,type RCMode,type RCRecord} from '../../lib/exploration/electricity';
import {setupNotebook} from './study-notebook';
const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(`rc-${id}`) as T;
const text=(id:string,value:string)=>{get(id).textContent=value;};
let input={...RC_DEFAULTS},state=initialRC(),running=false,frame=0,previous:number|null=null;
let points=[{time:0,voltage:0,current:readRC(input,state).current}];
let task:'charge'|'hold'|'discharge'|'done'|null='charge',heldAt:number|null=null,heldVoltage:number|null=null;
function appendPoint(){const r=readRC(input,state);points.push({time:state.time,voltage:state.voltage,current:r.current});if(points.length>400)points.shift();}
function curves(){
 const first=points[0]!.time,last=points.at(-1)!.time,span=Math.max(.001,last-first),imax=input.emf/input.resistance;
 for(const kind of ['voltage','current'] as const){
  const locations=points.map(p=>[40+560*(p.time-first)/span,kind==='voltage'?180-160*p.voltage/input.emf:100-80*p.current/imax]);
  document.getElementById(`rc-${kind}-curve`)!.setAttribute('d',locations.map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)} ${y!.toFixed(2)}`).join(' '));
  const [x,y]=locations.at(-1)!;document.getElementById(`rc-${kind}-point`)!.setAttribute('cx',String(x));document.getElementById(`rc-${kind}-point`)!.setAttribute('cy',String(y));
 }
 text('voltage-max',String(input.emf));text('current-max',(imax*1000).toFixed(1));text('current-min',`−${(imax*1000).toFixed(1)}`);
 document.querySelectorAll('.rc-trace-start').forEach(el=>el.textContent=`${first.toFixed(2)} s`);document.querySelectorAll('.rc-trace-end').forEach(el=>el.textContent=`${last.toFixed(2)} s`);
}
function render(){
 const r=readRC(input,state);
 text('clock',`${running?'正在推进':'已暂停'} · t = ${state.time.toFixed(2)} s`);text('voltage',`${state.voltage.toFixed(3)} V`);text('current',`${r.current>0?'+':r.current<0?'−':''}${Math.abs(r.current*1000).toFixed(3)} mA`);text('charge',`${(r.charge*1000).toFixed(3)} mC`);text('energy',`${(r.energy*1000).toFixed(3)} mJ`);text('tau',`${r.tau.toFixed(3)} s`);
 text('ledger',`${(state.sourceWork*1000).toFixed(3)} = ${(r.energy*1000).toFixed(3)} + ${(state.heat*1000).toFixed(3)} mJ`);
 text('source-label',`${input.emf} V`);text('resistor-label',`${input.resistance} Ω`);text('capacitor-label',`${input.capacitance} µF`);
 document.getElementById('rc-charge-symbols')!.setAttribute('opacity',String(state.voltage/input.emf));document.getElementById('rc-switch-contact')!.setAttribute('d',`M360 140L280 ${state.mode==='charge'?100:state.mode==='hold'?160:220}`);
 text('direction',r.current===0?'无电流':r.current>0?'充电 →':'← 放电');
 text('state-note',state.mode==='charge'?'充电：电源经电阻使两极板电荷分离。电压越接近电源，电流越小。':state.mode==='hold'?'保持开路：电流为0，但极板电荷和电压仍在。理想模型没有漏电，推进时间不会放空它。':'放电：电源已脱离回路，电容经电阻释放能量。电流反向，电压逐渐下降。');
 document.querySelectorAll<HTMLButtonElement>('[data-rc-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rcMode===state.mode)));
 get('play').textContent=running?'暂停':'播放';get('play').setAttribute('aria-pressed',String(running));
 for(const key of ['emf','resistance','capacitance'] as const){get<HTMLInputElement>(key).value=String(input[key]);text(`${key}-value`,`${input[key]} ${key==='emf'?'V':key==='resistance'?'Ω':'µF'}`);}
 if(task)text('task-note',task==='charge'?'先充电到至少3 V：播放或单步都可以。':task==='hold'?'电压已达到3 V。切“保持（开路）”并推进时间，检查它是否留下。':task==='discharge'?`已观察到开路保持 ${heldVoltage!.toFixed(3)} V。现在切“放电”并推进，看看电流方向。`:`观察完成：你亲手充电、验证开路保持，再看到反向放电。保持时 ${heldVoltage!.toFixed(3)} V，当前 ${state.voltage.toFixed(3)} V。`);
 curves();
}
function stop(){running=false;previous=null;cancelAnimationFrame(frame);}
function pause(){stop();render();}
function evolve(dt:number){
 const count=Math.max(1,Math.ceil(dt/.025));
 for(let i=0;i<count;i++){state=advanceRC(input,state,dt/count);appendPoint();}
 if(task==='charge'&&state.mode==='charge'&&state.voltage>=3)task='hold';
 if(task==='hold'&&state.mode==='hold'&&heldAt!==null&&state.time>heldAt)task='discharge';
 if(task==='discharge'&&state.mode==='discharge'&&heldVoltage!==null&&state.voltage<heldVoltage-1e-8)task='done';
 render();
}
function tick(now:number){
 if(!running)return;
 if(previous!==null)evolve(Math.max(0,Math.min(.1,(now-previous)/1000)));
 previous=now;frame=requestAnimationFrame(tick);
}
function reset(guided:boolean){
 stop();state=initialRC();points=[{time:0,voltage:0,current:readRC(input,state).current}];task=guided?'charge':null;heldAt=null;heldVoltage=null;
 text('trace-note','从零开始的新曲线，只含本次实际推进的采样；最多最近400点。');render();
}
try{
 render();get<HTMLFieldSetElement>('tools').disabled=false;
 get('play').addEventListener('click',()=>{if(running)pause();else{running=true;previous=null;render();frame=requestAnimationFrame(tick);}});
 for(const [id,dt] of [['step',.1],['step-second',1]] as const)get(id).addEventListener('click',()=>{pause();evolve(dt);});
 document.querySelectorAll<HTMLButtonElement>('[data-rc-mode]').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.rcMode as RCMode;if(mode===state.mode)return;
  if(task==='done'){task=null;text('task-note','挡位已改变，原完成状态已清除。可以继续探索或从零开始观察。');}
  if(task==='discharge'&&mode!=='discharge'){task='hold';heldAt=null;heldVoltage=null;}
  state={...state,mode};
  if(task==='hold'&&mode==='hold'&&state.voltage>=3){heldAt=state.time;heldVoltage=state.voltage;}
  appendPoint();render();
 }));
 get('prepare').addEventListener('click',()=>{input={...RC_DEFAULTS};reset(true);});
 for(const key of ['emf','resistance','capacitance'] as const)get<HTMLInputElement>(key).addEventListener('input',()=>{
  // Stop before changing C: the old state's energy ledger belongs to the old parameters.
  const value=Number(get<HTMLInputElement>(key).value);stop();input[key]=value;reset(false);text('task-note','参数已改变：已暂停，从零电压、零时间和零能量重新开始。已存记录保留。');
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 setupNotebook<RCRecord>({snapshot:()=>({input,state}),clone:cloneRCRecord,restore:record=>{
  pause();input=record.input;state=record.state;task=null;heldAt=null;heldVoltage=null;points=[{time:state.time,voltage:state.voltage,current:readRC(input,state).current}];text('task-note','记录已恢复并暂停；不计为独立观察完成。');text('trace-note',`只从恢复时刻 ${state.time.toFixed(2)} s 的当前点开始；此前曲线未保存，不补造历史。`);render();
 },summary:record=>`${record.input.resistance} Ω / ${record.input.capacitance} µF / ${record.input.emf} V · ${record.state.mode} · ${record.state.time.toFixed(2)} s · ${record.state.voltage.toFixed(3)} V`,compare:compareRC,csv:rcCSV,filename:'capacitor-time.csv',durable:{slug:'capacitors',validate:checkedState({input:RC_DEFAULTS,state:initialRC()},r=>validateRC(r.input,r.state)),labels:{input:'元件参数（V/Ω/µF）',state:'时刻、电压与能量账本'}}});
 document.querySelectorAll<HTMLButtonElement>('[data-rc-answer]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-rc-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const small=advanceRC(RC_DEFAULTS,initialRC(),1),large=advanceRC({...RC_DEFAULTS,capacitance:2000},initialRC(),1);
  text('transfer-note',`${button.dataset.rcAnswer==='lower'?'这个预测符合RC模型。':'再比较时间常数，而不只看“容量更大”。'}参考条件下，τ从1 s变成2 s；同样从零充电1 s，电压 ${small.voltage.toFixed(3)}→${large.voltage.toFixed(3)} V。达到相同电压需要更久，但同电压下储能更多。当前参数未被改动。`);
 }));
}catch(error){get<HTMLFieldSetElement>('tools').disabled=true;text('task-note','电容工具未能就绪，请刷新重试。下方原理仍可阅读。');console.error(error);}
