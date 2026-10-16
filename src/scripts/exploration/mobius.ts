import {stripPoint,stripWidth,topology,cutBands,tracePoint,type HalfTwists} from '../../lib/exploration/mobius';
import {el,text,value} from './ui';
import {sequence} from './demonstration';
import type {PaperState} from '../spatial/mobius-scene';
let state:PaperState={twists:1,progress:0,edge:false,cut:false},prediction=0,paused=false,view2d=false;
let spatial:ReturnType<typeof import('../spatial/mobius-scene').createMobiusScene>|undefined;
const demo=sequence(progress=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;state.progress=reduce?Math.floor(progress*4)/4:progress;el<HTMLInputElement>('paper-progress').value=String(Math.round(state.progress*100));render();if(progress===1){paused=false;buttons(true);}},12000);
function buttons(done=false){el<HTMLButtonElement>('paper-pause').disabled=done||(!demo.isRunning()&&!paused);text('paper-pause',paused?'继续追踪':'暂停追踪');}
function stop(){demo.cancel();paused=false;buttons();}
function fallbackDrawing(){
 const project=(p:number[])=>[400+p[0]!*95,225-p[1]!*105+p[2]!*37];
 const point=(t:number,v:number)=>project(stripPoint(state.twists,t,v));
 const path=(points:number[][])=>points.map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)},${y!.toFixed(2)}`).join(' ');
 const bands=state.cut?cutBands(state.twists):[{turn:2*Math.PI,min:-stripWidth,max:stripWidth}];
 const quads:{z:number;html:string}[]=[];
 for(const [index,b] of bands.entries())for(let i=0;i<160;i++){const t0=i/160*b.turn,t1=(i+1)/160*b.turn;quads.push({z:stripPoint(state.twists,(t0+t1)/2,(b.min+b.max)/2)[2],html:`<path d="${path([point(t0,b.min),point(t1,b.min),point(t1,b.max),point(t0,b.max)])}Z" fill="${index===0?'#63bdab':'#88a5de'}" stroke="${index===0?'#63bdab':'#88a5de'}" stroke-width=".7"/>`});}
 quads.sort((a,b)=>a.z-b.z);
 const turn=topology(state.twists).circuits*2*Math.PI,v=state.edge?stripWidth:stripWidth*.55;
 const route=Array.from({length:161},(_,i)=>point(i/160*state.progress*turn,v)),marker=project(tracePoint(state.twists,state.progress,state.edge));
 el('paper-fallback').innerHTML=`<rect width="800" height="440" fill="#eaf5f3"/>${quads.map(q=>q.html).join('')}<path d="${path(route)}" fill="none" stroke="#de9416" stroke-width="4"/><path d="${path([point(0,-stripWidth),point(0,stripWidth)])}" stroke="white" stroke-width="3"/><circle cx="${marker[0]}" cy="${marker[1]}" r="8" fill="#f5b52f" stroke="#8c651a"/><text x="24" y="408" fill="#3b6373" font-size="15">空间投影 · 重叠处请结合纸条验证</text>`;
 el('paper-fallback').setAttribute('aria-label',`${state.twists} 次半扭转${state.cut?'中心剪开':'纸带'}，追踪 ${Math.round(state.progress*100)}%`);
}
function render(){const t=topology(state.twists),circuits=state.progress*t.circuits;
 text('paper-progress-value',`${Math.round(state.progress*100)}%`);text('paper-twists-value',String(state.twists));text('paper-sides',String(state.cut?2:t.sides));text('paper-boundaries',String(state.cut?t.cutComponents*2:t.boundaries));text('paper-circuits',`${circuits.toFixed(2)} 圈`);
 text('paper-sides-label',state.cut?'每条带的面数':'纸面数');text('paper-boundaries-label',state.cut?'总边界条数':'边界条数');
 text('paper-seam',state.twists===1?'n 为奇数：接缝把局部宽度坐标 v 接到 −v，因此走一圈换到另一侧，两圈回到原处。':'n 为偶数：接缝保持宽度坐标 v，走一圈回到原处；两条边界彼此独立。');
 text('paper-conclusion',state.cut?`${t.cutComponents} 条双面纸带${t.linked?'，相互套连':''}。观察连接处，数完整的带，而不是颜色。`:state.twists===1?'一次半扭转：纸面连续，边界也连续。沿着走，比凭颜色判断更可靠。':`这条纸带有两面、两条边。${state.twists===2?'完整扭转没有让它变成单面。':'不跨过纸边，不能从一面走到另一面。'}`);
 const info=state.progress===1?'回到出发位置。':state.twists===1&&state.progress>=.5?'已过一圈，走到起点的另一侧；再走一圈才返回。':'正在沿连续路径行走，没有跨过纸边。';
 text('paper-trace-note',`${state.edge?'沿纸边':'沿纸面'} · ${circuits.toFixed(2)} / ${t.circuits} 圈。${info}${state.cut?'剪后金线仍追踪原来的外缘／偏中线，用于核对连接。':''}`);
 el<HTMLButtonElement>('paper-restore').disabled=!state.cut;el<HTMLButtonElement>('paper-cut').disabled=state.cut;
 if(state.cut)text('paper-cut-result',`${t.cutComponents===1?'仍是一条更长的双面带。':'得到两条双面带。'}${t.linked?'两条带相互套连，不能直接分开。':''}上方计数已经切换为剪后面数与总边界条数。`);
 document.querySelectorAll<HTMLButtonElement>('[data-paper-twists]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.paperTwists)===state.twists)));
 el('paper-surface').setAttribute('aria-pressed',String(!state.edge));el('paper-edge').setAttribute('aria-pressed',String(state.edge));
 fallbackDrawing();spatial?.update(state);buttons();
}
function predictionFeedback(){const count=topology(state.twists).cutComponents;text('paper-prediction-note',prediction?`${prediction===count?'预测得到支持':'结果与你的预测不同'}：剪后是 ${count} 条带。试着换另一种纸带对照。`:'你还没有选预测。观察剪后结果，再与另一种纸带比较。');}
document.querySelectorAll<HTMLButtonElement>('[data-paper-twists]').forEach(b=>b.addEventListener('click',()=>{stop();state.twists=Number(b.dataset.paperTwists) as HalfTwists;state.cut=false;state.progress=0;prediction=0;el<HTMLInputElement>('paper-progress').value='0';document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed','false'));text('paper-prediction-note','已重新接一条纸带。选择预测，再剪开。');text('paper-cut-result','结果会显示在上方工作台；你仍可以转动纸带，看清连接处。');render();}));
for(const [id,edge] of [['paper-surface',false],['paper-edge',true]] as const)el(id).addEventListener('click',()=>{stop();state.edge=edge;state.progress=0;el<HTMLInputElement>('paper-progress').value='0';render();});
el('paper-progress').addEventListener('input',()=>{stop();state.progress=value('paper-progress')/100;render();});
el('paper-demo').addEventListener('click',()=>{stop();demo.start(true);buttons();});
el('paper-pause').addEventListener('click',()=>{if(demo.isRunning()){demo.pause();paused=true;}else if(paused){paused=false;demo.start();}buttons();});
document.querySelectorAll<HTMLButtonElement>('[data-paper-predict]').forEach(b=>b.addEventListener('click',()=>{prediction=Number(b.dataset.paperPredict);document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));if(state.cut)predictionFeedback();else text('paper-prediction-note',`预测已记下：${prediction} 条。沿中线剪开检验。`);}));
el('paper-cut').addEventListener('click',()=>{stop();state.cut=true;render();predictionFeedback();document.querySelector('.paper-workshop')?.scrollIntoView({behavior:'instant',block:'start'});});
el('paper-restore').addEventListener('click',()=>{stop();state.cut=false;text('paper-cut-result','已恢复未剪纸带，可以沿面或沿边重新验证。');render();});
el('paper-reset').addEventListener('click',()=>{stop();state={twists:1,progress:0,edge:false,cut:false};prediction=0;el<HTMLInputElement>('paper-progress').value='0';document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed','false'));text('paper-prediction-note','选择预测，再点“沿中线剪开”。');text('paper-cut-result','结果会显示在上方工作台；你仍可以转动纸带，看清连接处。');spatial?.preset('perspective');render();});
function background(){if(!el<HTMLButtonElement>('paper-pause').disabled&&!paused){demo.pause();paused=true;buttons();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
const host=el('paper-spatial');
function setView(){host.hidden=view2d||!spatial;el('paper-fallback').toggleAttribute('hidden',!view2d&&!!spatial);text('paper-view-toggle',view2d?'切换三维纸带':'切换二维示意');el('paper-view-toggle').setAttribute('aria-pressed',String(view2d));if(spatial&&!view2d)spatial.update(state);}
function fallback(){spatial?.dispose();spatial=undefined;view2d=true;setView();el('paper-camera-controls').hidden=true;el('paper-view-toggle').hidden=true;text('paper-view-note','当前使用空间投影。追踪、剪开和计数仍可操作；重叠处可结合真实纸条验证。');}
let departed=false;
async function init(){try{const {createMobiusScene}=await import('../spatial/mobius-scene');if(departed)return;host.hidden=false;spatial=createMobiusScene(host,fallback);el('paper-camera-controls').hidden=false;el('paper-view-toggle').hidden=false;setView();}catch{fallback();}}
el('paper-view-toggle').addEventListener('click',()=>{view2d=!view2d;setView();});
document.querySelectorAll<HTMLButtonElement>('[data-paper-camera]').forEach(b=>b.addEventListener('click',()=>{view2d=false;setView();spatial?.preset(b.dataset.paperCamera!);}));
window.addEventListener('pagehide',()=>{background();departed=true;spatial?.dispose();spatial=undefined;});window.addEventListener('pageshow',e=>{if(e.persisted){departed=false;void init();}});
render();void init();
