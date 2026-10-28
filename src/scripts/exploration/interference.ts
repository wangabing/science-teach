import {setupDiscoveries} from '../product/discoveries';
import {checkedState} from '../../lib/product/state-validation';
import {WAVE_DEFAULTS,validateWave,waveAt,wavePhases,waveCSV,compareWave,type WaveInput,type WaveRecord,type WaveMode} from '../../lib/exploration/interference';

const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const control=(id:string)=>el<HTMLInputElement>(`wave-${id}`);
const text=(id:string,value:string)=>{const node=el(`wave-${id}`);if(node.textContent!==value)node.textContent=value;};
const map=document.getElementById('wave-map') as unknown as SVGSVGElement;
let p:WaveInput={...WAVE_DEFAULTS},time=0,running=false,frame=0,last=0,lastPaint=0,departed=false;
let task=false,phaseAdjusted=false;
const records:WaveRecord[]=[];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=el<HTMLCanvasElement>('wave-canvas');
let ctx:CanvasRenderingContext2D|null=null;
try{ctx=canvas.getContext('2d');}catch{ /* Readable SVG evidence stays available. */ }
const width=300,height=200;
canvas.width=width;canvas.height=height;
const pixels=ctx?.createImageData(width,height);
const sinA=new Float32Array(width*height),cosA=new Float32Array(width*height),sinB=new Float32Array(width*height),cosB=new Float32Array(width*height);
function cache(){
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x,{a,b}=wavePhases({...p,x:-12+(x+.5)/width*24,y:8-(y+.5)/height*16});
  sinA[i]=Math.sin(a);cosA[i]=Math.cos(a);sinB[i]=Math.sin(b);cosB[i]=Math.cos(b);
 }
}
function paintField(){
 if(!ctx||!pixels)return;
 const s=Math.sin(2*Math.PI*time),c=Math.cos(2*Math.PI*time),one=p.mode!=='two',two=p.mode!=='one';
 const zero=[37,69,93],crest=[114,213,240],trough=[233,167,121];
 for(let i=0;i<width*height;i++){
  const value=(one?sinA[i]!*c-cosA[i]!*s:0)+(two?sinB[i]!*c-cosB[i]!*s:0);
  const shade=Math.min(1,Math.abs(value)/2),target=value>=0?crest:trough;
  for(let channel=0;channel<3;channel++)pixels.data[i*4+channel]=zero[channel]!+(target[channel]!-zero[channel]!)*shade;
  pixels.data[i*4+3]=255;
 }
 try{ctx.putImageData(pixels,0,0);}catch{ctx=null;text('render-note','位移场暂不可显示。波源、探针、曲线与读数仍可操作。');}
}
const xy=(x:number,y:number)=>[360+x*30,240-y*30];
function render(){
 map.dataset.waveState=JSON.stringify({p,time});
 const r=waveAt(p,time);paintField();
 text('motion',`${running?'波纹播放中':'静止观察'} · t = ${time.toFixed(2)} s`);
 text('amplitude',r.amplitude.toFixed(3));
 text('amplitude-note',r.amplitude<=.1?'合成振幅接近零：整个周期都很安静。':Math.abs(r.sum)<.02?'这一刻位移接近零，但整周期仍会起伏。':'观察一个周期：瞬时位移会变，振幅保持当前值。');
 text('distances',`${r.r1.toFixed(3)} / ${r.r2.toFixed(3)} cm`);
 text('path-difference',`${r.pathDifference.toFixed(3)} cm`);
 text('displacements',`${r.one.toFixed(3)} + (${r.two.toFixed(3)}) = ${r.sum.toFixed(3)} mm`);
 text('point-note',`探针 (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) cm；${p.mode==='both'?'两个波源各振幅1 mm，合成振幅取决于此处的相位差。':'此刻只开启一个源，探针整周期振幅为1 mm。'}`);
 for(const key of ['phase','wavelength','separation','x','y'] as const)text(`${key}-value`,`${p[key].toFixed(key==='phase'?0:1)} ${key==='phase'?'°':'cm'}`);
 const [x,y]=xy(p.x,p.y),[s1x,s1y]=xy(-p.separation/2,0),[s2x,s2y]=xy(p.separation/2,0);
 const probe=el('wave-probe');probe.setAttribute('transform',`translate(${x} ${y})`);probe.setAttribute('aria-label',`探针 x ${p.x.toFixed(1)}，y ${p.y.toFixed(1)} 厘米；方向键移动0.2厘米`);
 el('wave-sources').innerHTML=[[s1x,s1y,p.mode!=='two','#72d5f0'],[s2x,s2y,p.mode!=='one','#e9a779']].map(([sx,sy,on,color],i)=>`<g opacity="${on?1:.3}"><circle cx="${sx}" cy="${sy}" r="9" fill="${color}" stroke="#122f47" stroke-width="2"/><text x="${Number(sx)-20}" y="${Number(sy)-20}" fill="${color}" font-size="14">源 ${i+1}</text></g>`).join('');
 el('wave-distance-lines').innerHTML=`<path d="M${s1x} ${s1y}L${x} ${y}M${s2x} ${s2y}L${x} ${y}" fill="none"/>`;
 const curves={one:[],two:[],sum:[]} as Record<'one'|'two'|'sum',string[]>;
 for(let i=0;i<=120;i++){const q=waveAt(p,time+i/120);for(const key of ['one','two','sum'] as const)curves[key].push(`${i?'L':'M'}${45+i/120*535} ${115-q[key]*40}`);}
 for(const key of ['one','two','sum'] as const)el(`wave-curve-${key}`).setAttribute('d',curves[key].join(' '));
 el('wave-traces').setAttribute('aria-label',`探针处未来一个周期：合成振幅 ${r.amplitude.toFixed(3)} 毫米，当前合成位移 ${r.sum.toFixed(3)} 毫米；短虚线源1，长虚线源2，实线为合成。`);
 text('play',running?'暂停波纹':'播放波纹');el('wave-play').setAttribute('aria-pressed',String(running));
 el<HTMLButtonElement>('wave-step').disabled=running;
}
function stop(){running=false;cancelAnimationFrame(frame);frame=0;render();}
function tick(now:number){
 if(!running||departed)return;
 time+=Math.min(.05,(now-last)/1000);last=now;
 if(now-lastPaint>=50){render();lastPaint=now;}
 frame=requestAnimationFrame(tick);
}
function start(){if(running||departed)return;running=true;last=performance.now();lastPaint=0;render();frame=requestAnimationFrame(tick);}
function taskFeedback(){
 if(!task)return;
 const r=waveAt(p,time);
 text('task-note',phaseAdjusted&&r.amplitude<=.1?'你找到了持续安静的点！不是只在这一刻归零。保留这组，再改变相位或探针位置，比较整周期曲线。':`只转相位，其他条件先不动。当前整周期振幅 ${r.amplitude.toFixed(3)} mm；目标不超过0.100 mm。`);
}
function change(key:keyof WaveInput,value:number|WaveMode){
 if(task&&key!=='phase'){task=false;phaseAdjusted=false;text('task-note','已进入自由探索：固定条件改变了。需要独立验证时，重新准备静点任务。');}
 p={...p,[key]:value};
 if(task&&key==='phase')phaseAdjusted=true;
 if(['phase','wavelength','separation'].includes(key))cache();
 render();taskFeedback();
}
function sync(){for(const key of ['phase','wavelength','separation','x','y','mode'] as const)control(key).value=String(p[key]);}
for(const key of ['phase','wavelength','separation','x','y'] as const)control(key).addEventListener('input',()=>change(key,Number(control(key).value)));
control('mode').addEventListener('change',()=>change('mode',control('mode').value as WaveMode));
el('wave-play').addEventListener('click',()=>running?stop():start());
el('wave-step').addEventListener('click',()=>{stop();time+=.05;render();});
el('wave-prepare').addEventListener('click',()=>{stop();p={...WAVE_DEFAULTS};time=0;task=true;phaseAdjusted=false;sync();cache();render();taskFeedback();control('phase').focus({preventScroll:true});el('wave-field').scrollIntoView({block:'start',behavior:'instant'});});
el('wave-reset').addEventListener('click',()=>{stop();p={...WAVE_DEFAULTS};time=0;task=false;phaseAdjusted=false;sync();cache();render();text('task-note','条件已重置。可重新准备任务，也可自由探索。');document.querySelectorAll('[data-wave-answer]').forEach(b=>b.setAttribute('aria-pressed','false'));text('transfer-note','选好后，用振幅和三条曲线检查你的理由。');});

function moveProbe(x:number,y:number){
 const bound=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Math.round(v*5)/5));
 change('x',bound(x,-12,12));change('y',bound(y,-8,8));sync();
}
let pointer=-1;
function drag(event:PointerEvent){
 if(event.pointerId!==pointer)return;
 const matrix=map.getScreenCTM();if(!matrix)return;
 const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());moveProbe((point.x-360)/30,(240-point.y)/30);
}
map.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();pointer=event.pointerId;map.setPointerCapture(pointer);el('wave-probe').focus({preventScroll:true});drag(event);});
map.addEventListener('pointermove',drag);
for(const name of ['pointerup','pointercancel'] as const)map.addEventListener(name,event=>{if(event.pointerId!==pointer)return;pointer=-1;if(map.hasPointerCapture(event.pointerId))map.releasePointerCapture(event.pointerId);});
el('wave-probe').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();moveProbe(p.x+(event.key==='ArrowLeft'?-.2:event.key==='ArrowRight'?.2:0),p.y+(event.key==='ArrowDown'?-.2:event.key==='ArrowUp'?.2:0));});
document.querySelectorAll<HTMLButtonElement>('[data-wave-answer]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-wave-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 text('transfer-note',`${button.dataset.waveAnswer==='no'?'这个判断有依据。':'一次归零还不够。'}看整周期振幅与合成实线：振幅大于0时，过零后还会起伏。把中心探针的相位改回0°，再改成180°，比较两组；持续相消时整条合成曲线贴着零线。`);
}));
function showRecords(){
 el('wave-records').replaceChildren(...records.map((record,i)=>{
  const card=document.createElement('div');card.className='wave-record';const paragraph=document.createElement('p'),button=document.createElement('button'),r=waveAt(record.input,record.time),q=record.input;
  paragraph.textContent=`${i===0?'A':'B'} · ${q.mode==='both'?'双源':q.mode==='one'?'源1':'源2'}，λ=${q.wavelength} cm，源距=${q.separation} cm，相位=${q.phase}°，探针(${q.x}, ${q.y}) cm，t=${record.time.toFixed(2)} s；位移=${r.sum.toFixed(3)} mm，振幅=${r.amplitude.toFixed(3)} mm。`;
  button.type='button';button.textContent=`恢复 ${i===0?'A':'B'}`;button.addEventListener('click',()=>{stop();p={...record.input};time=record.time;task=false;phaseAdjusted=false;sync();cache();render();text('task-note','已恢复观察条件并暂停。恢复不计独立任务完成。');text('record-note',`已恢复 ${i===0?'A':'B'}，读数由条件与时间重新计算。`);});card.append(paragraph,button);return card;
 }));
 el<HTMLButtonElement>('wave-export').disabled=records.length===0;
 text('record-comparison',records.length===2?compareWave(records[0]!,records[1]!):'再保存一组，在这里比较改变了哪些条件。');
}
el('wave-save').addEventListener('click',()=>{const replaced=records.length===2;if(replaced)records.shift();records.push({input:{...p},time});showRecords();text('record-note',replaced?'已替换最早一组，保留最近两组。':'已记下条件与读数，仅保留在当前页。');});
el('wave-export').addEventListener('click',()=>{if(!records.length)return;const url=URL.createObjectURL(new Blob(['\uFEFF'+waveCSV(records)],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='wave-interference-observations.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);text('record-note','已导出 CSV，包含条件、时间、单位、位移分量与振幅。');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
window.addEventListener('pagehide',()=>{stop();departed=true;});window.addEventListener('pageshow',()=>{departed=false;});
cache();render();showRecords();
if(!ctx)text('render-note','位移场暂不可显示。波源、探针、曲线与读数仍可操作。');

setupDiscoveries({slug:'interference',snapshot:()=>({...p}),validate:checkedState(WAVE_DEFAULTS,validateWave),labels:{wavelength:'波长 cm',separation:'源距 cm',phase:'相位 °',x:'探针 x cm',y:'探针 y cm',mode:'波源'},
 describe:s=>{const q=s as unknown as WaveInput;return `波长 ${q.wavelength} cm；源距 ${q.separation} cm；相位 ${q.phase}°；探针 (${q.x}, ${q.y}) cm；${q.mode}；振幅 ${waveAt(q,0).amplitude.toFixed(3)} mm。恢复 t=0。`;},
 restore:s=>{stop();p={...s} as unknown as WaveInput;time=0;task=false;phaseAdjusted=false;pointer=-1;sync();cache();render();text('task-note','已恢复条件并暂停；不计独立静点任务。');document.querySelectorAll('[data-wave-answer]').forEach(b=>b.setAttribute('aria-pressed','false'));text('transfer-note','请重新作出判断，并用整周期曲线检查。');}});
