import {stripPoint,stripWidth,topology,cutSegments,paperRoute,type HalfTwists} from '../../lib/exploration/mobius';
import {el,text,value} from './ui';
import {sequence} from './demonstration';
import type {PaperState} from '../spatial/mobius-scene';
const initial=():PaperState=>({twists:1,progress:0,edge:false,cut:false,cutProgress:0,component:0,newEdge:false});
let state=initial(),prediction=0,paused=false,view2d=false;
let cutMode:'idle'|'running'|'paused'='idle',cutOrigin=0;
let spatial:ReturnType<typeof import('../spatial/mobius-scene').createMobiusScene>|undefined;
const demo=sequence(progress=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;state.progress=reduce?Math.floor(progress*4)/4:progress;el<HTMLInputElement>('paper-progress').value=String(Math.round(state.progress*100));render();if(progress===1){paused=false;buttons(true);}},12000);
const cutting=sequence(progress=>{const percent=Math.round((cutOrigin+(1-cutOrigin)*progress)*100);if(percent!==Math.round(state.cutProgress*100))updateCut(percent);if(progress===1){cutMode='idle';render();}},8000);
function buttons(done=false){
 el<HTMLButtonElement>('paper-pause').disabled=done||(!demo.isRunning()&&!paused);text('paper-pause',paused?'继续追踪':'暂停追踪');
 el<HTMLButtonElement>('paper-cut-pause').disabled=cutMode==='idle';text('paper-cut-pause',cutMode==='paused'?'继续剪切':'暂停剪切');
 el('paper-cut-pause').setAttribute('aria-pressed',String(cutMode==='paused'));
}
function stop(){demo.cancel();cutting.cancel();paused=false;cutMode='idle';buttons();}
function fallbackDrawing(){
 const project=(p:number[])=>[400+p[0]!*95,225-p[1]!*105+p[2]!*37];
 const point=(t:number,v:number)=>project(stripPoint(state.twists,t,v));
 const path=(points:number[][])=>points.map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)},${y!.toFixed(2)}`).join(' ');
 const quads:{z:number;html:string}[]=[];
 for(const b of cutSegments(state.twists,state.cutProgress))for(let i=0;i<160;i++){
  const t0=b.start+i/160*b.turn,t1=b.start+(i+1)/160*b.turn,color=state.cut&&b.component===1?'#88a5de':'#63bdab';
  quads.push({z:stripPoint(state.twists,(t0+t1)/2,(b.min+b.max)/2)[2],html:`<path d="${path([point(t0,b.min),point(t1,b.min),point(t1,b.max),point(t0,b.max)])}Z" fill="${color}" stroke="${color}" stroke-width=".7"/>`});
 }
 quads.sort((a,b)=>a.z-b.z);
 const route=paperRoute(state.twists,state.cut,state.component,state.edge,state.newEdge),marker=point(state.progress*route.turn,route.v);
 const trace=state.cutProgress===0||state.cut?`<path d="${path(Array.from({length:161},(_,i)=>point(i/160*state.progress*route.turn,route.v)))}" fill="none" stroke="#de9416" stroke-width="4"/><circle id="paper-trace-marker" data-component="${state.component}" cx="${marker[0]}" cy="${marker[1]}" r="8" fill="#f5b52f" stroke="#8c651a"/>`:'';
 const cutter=point(2*Math.PI*state.cutProgress,0),slit=state.cutProgress>0?`<path d="${path(Array.from({length:161},(_,i)=>point(i/160*2*Math.PI*state.cutProgress,0)))}" fill="none" stroke="#c94e30" stroke-width="2"/>${!state.cut?`<circle id="paper-cut-marker" cx="${cutter[0]}" cy="${cutter[1]}" r="8" fill="#c94e30"/>`:''}`:'';
 el('paper-fallback').innerHTML=`<rect width="800" height="440" fill="#eaf5f3"/>${quads.map(q=>q.html).join('')}${slit}${trace}<path d="${path([point(0,-stripWidth),point(0,stripWidth)])}" stroke="white" stroke-width="3"/><text x="24" y="408" fill="#3b6373" font-size="15">空间投影 · 重叠处请结合纸条验证</text>`;
 el('paper-fallback').setAttribute('aria-label',`${state.twists} 次半扭转，剪切 ${Math.round(state.cutProgress*100)}%，${state.cut?'第 '+(state.component+1)+' 条带，':''}追踪 ${Math.round(state.progress*100)}%`);
}
function render(){
 const t=topology(state.twists),route=paperRoute(state.twists,state.cut,state.component,state.edge,state.newEdge),turns=route.turn/(2*Math.PI),circuits=state.progress*turns,partial=state.cutProgress>0&&!state.cut;
 text('paper-progress-value',`${Math.round(state.progress*100)}%`);text('paper-twists-value',String(state.twists));text('paper-sides',String(state.cut?2:t.sides));text('paper-boundaries',String(state.cut?t.cutComponents*2:t.boundaries));text('paper-circuits',`${circuits.toFixed(2)} 圈`);
 text('paper-sides-label',state.cut?'每条带的面数':partial?'未剪纸带的面数':'纸面数');text('paper-boundaries-label',state.cut?'总边界条数':partial?'未剪纸带的边界':'边界条数');
 text('paper-seam',state.cut?`正在追踪第 ${state.component+1} 条完整纸带，需要绕中心 ${turns} 圈返回起点。新切边与原纸边是这条双面带的两条不同边界。`:state.twists===1?'n 为奇数：接缝把局部宽度坐标 v 接到 −v，因此走一圈换到另一侧，两圈回到原处。':'n 为偶数：接缝保持宽度坐标 v，走一圈回到原处；两条边界彼此独立。');
 text('paper-conclusion',partial?'切缝正在推进，尚有未剪部分连接。剪完之前，不用颜色块数判断最终条数。':state.cut?`${t.cutComponents} 条双面纸带${t.linked?'，相互套连':''}。选一条完整的带，沿着走回自己的起点。`:state.twists===1?'一次半扭转：纸面连续，边界也连续。沿着走，比凭颜色判断更可靠。':`这条纸带有两面、两条边。${state.twists===2?'完整扭转没有让它变成单面。':'不跨过纸边，不能从一面走到另一面。'}`);
 const info=state.progress===1?'回到出发位置。':turns===2&&state.progress>=.5?(state.cut?'已过一圈，尚未返回起点；再走一圈。':'已过一圈，走到起点的另一侧；再走一圈才返回。'):'正在沿连续路径行走，没有跨过纸边。';
 text('paper-trace-note',partial?'先观察剪切过程，剪完后再选择完整纸带追踪。':`${state.cut?'第 '+(state.component+1)+' 条带 · ':''}${state.edge?(state.newEdge?'沿新切边':'沿原纸边'):'沿纸面'} · ${circuits.toFixed(2)} / ${turns} 圈。${info}`);
 text('paper-cut-progress-value',`${Math.round(state.cutProgress*100)}%`);el<HTMLInputElement>('paper-cut-progress').value=String(Math.round(state.cutProgress*100));
 text('paper-cut-stage-note',state.cut?'已剪完。选择一条带，沿纸面、原纸边或新切边走回起点。':state.cutProgress>0?`已剪 ${Math.round(state.cutProgress*100)}%：红点是剪切位置，剩余部分仍连接。继续推进，或拖回去仔细看。`:'还没有剪开。先预测，再推进切缝；也可直接手动观察。');
 el<HTMLButtonElement>('paper-restore').disabled=state.cutProgress===0&&cutMode==='idle';el<HTMLButtonElement>('paper-cut').disabled=state.cut||cutMode==='running';
 text('paper-cut',state.cutProgress>0&&!state.cut?'继续自动剪切':'沿中线剪开');
 if(state.cut)text('paper-cut-result',`${t.cutComponents===1?'仍是一条更长的双面带。':'得到两条双面带。'}${t.linked?'两条带相互套连，不能直接分开。':''}计数已切换为剪后面数与总边界条数。选择每条带追踪，验证连接。`);
 else if(partial)text('paper-cut-result','还没剪完，尚有未剪部分连接。先观察切缝，再判断最终有几条带。');
 document.querySelectorAll<HTMLButtonElement>('[data-paper-twists]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.paperTwists)===state.twists)));
 document.querySelectorAll<HTMLButtonElement>('[data-paper-component]').forEach(b=>{b.hidden=Number(b.dataset.paperComponent)>=t.cutComponents;b.setAttribute('aria-pressed',String(Number(b.dataset.paperComponent)===state.component));});
 el('paper-components').hidden=!state.cut;el('paper-new-edge').hidden=!state.cut;
 el('paper-surface').setAttribute('aria-pressed',String(!state.edge));el('paper-edge').setAttribute('aria-pressed',String(state.edge&&!state.newEdge));el('paper-new-edge').setAttribute('aria-pressed',String(state.edge&&state.newEdge));
 for(const id of ['paper-surface','paper-edge','paper-new-edge','paper-demo','paper-progress'])el<HTMLInputElement>(id).disabled=partial||cutMode==='running';
 fallbackDrawing();spatial?.update(state);buttons();
}
function predictionFeedback(){const count=topology(state.twists).cutComponents;text('paper-prediction-note',prediction?`${prediction===count?'预测得到支持':'结果与你的预测不同'}：剪后是 ${count} 条带。选完整纸带，沿着追踪检验。`:'你还没有选预测。观察剪后结果，再与另一种纸带比较。');}
function updateCut(percent:number){
 state.cutProgress=percent/100;state.cut=percent===100;state.progress=0;state.component=0;state.newEdge=false;el<HTMLInputElement>('paper-progress').value='0';
 if(state.cut){cutMode='idle';predictionFeedback();}else text('paper-prediction-note',prediction?`预测已记下：${prediction} 条。剪完后再检验。`:'先选一个预测，剪完后再检验。');
 if(percent===0)text('paper-cut-result','尚未剪开，可以沿面或沿边重新验证。');render();
}
function resetTrace(){state.progress=0;el<HTMLInputElement>('paper-progress').value='0';}
document.querySelectorAll<HTMLButtonElement>('[data-paper-twists]').forEach(b=>b.addEventListener('click',()=>{stop();state={...initial(),twists:Number(b.dataset.paperTwists) as HalfTwists};prediction=0;resetTrace();document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed','false'));text('paper-prediction-note','已重新接一条纸带。选择预测，再剪开。');text('paper-cut-result','结果会显示在上方工作台；你仍可以转动纸带，看清连接处。');render();}));
for(const [id,edge,fresh] of [['paper-surface',false,false],['paper-edge',true,false],['paper-new-edge',true,true]] as const)el(id).addEventListener('click',()=>{stop();state.edge=edge;state.newEdge=fresh;resetTrace();render();});
document.querySelectorAll<HTMLButtonElement>('[data-paper-component]').forEach(b=>b.addEventListener('click',()=>{if(!state.cut)return;stop();state.component=Number(b.dataset.paperComponent);resetTrace();render();}));
el('paper-progress').addEventListener('input',()=>{stop();state.progress=value('paper-progress')/100;render();});
el('paper-demo').addEventListener('click',()=>{stop();demo.start(true);buttons();});
el('paper-pause').addEventListener('click',()=>{if(demo.isRunning()){demo.pause();paused=true;}else if(paused){paused=false;demo.start();}buttons();});
document.querySelectorAll<HTMLButtonElement>('[data-paper-predict]').forEach(b=>b.addEventListener('click',()=>{prediction=Number(b.dataset.paperPredict);document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));if(state.cut)predictionFeedback();else text('paper-prediction-note',`预测已记下：${prediction} 条。沿中线剪开检验。`);}));
el('paper-cut').addEventListener('click',()=>{
 stop();resetTrace();state.component=0;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){text('paper-cut-result','减少动态模式：拖动工作台下的剪切进度，逐段观察。');render();}
 else{cutOrigin=state.cutProgress;cutMode='running';cutting.start(true);render();}
 document.querySelector('.paper-workshop')?.scrollIntoView({behavior:'instant',block:'start'});
});
el('paper-cut-progress').addEventListener('input',()=>{stop();updateCut(value('paper-cut-progress'));});
el('paper-cut-pause').addEventListener('click',()=>{if(cutMode==='running'){cutting.pause();cutMode='paused';}else if(cutMode==='paused'){cutMode='running';cutting.start();}buttons();});
el('paper-restore').addEventListener('click',()=>{stop();updateCut(0);text('paper-cut-result','已恢复未剪纸带，可以沿面或沿边重新验证。');});
el('paper-reset').addEventListener('click',()=>{stop();state=initial();prediction=0;resetTrace();document.querySelectorAll('[data-paper-predict]').forEach(n=>n.setAttribute('aria-pressed','false'));text('paper-prediction-note','选择预测，再点“沿中线剪开”。');text('paper-cut-result','结果会显示在上方工作台；你仍可以转动纸带，看清连接处。');spatial?.preset('perspective');render();});
function background(){if(!el<HTMLButtonElement>('paper-pause').disabled&&!paused){demo.pause();paused=true;}if(cutMode==='running'){cutting.pause();cutMode='paused';}buttons();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
const host=el('paper-spatial');
function setView(){host.hidden=view2d||!spatial;el('paper-fallback').toggleAttribute('hidden',!view2d&&!!spatial);text('paper-view-toggle',view2d?'切换三维纸带':'切换二维示意');el('paper-view-toggle').setAttribute('aria-pressed',String(view2d));if(spatial&&!view2d)spatial.update(state);}
function fallback(){spatial?.dispose();spatial=undefined;view2d=true;setView();el('paper-camera-controls').hidden=true;el('paper-view-toggle').hidden=true;text('paper-view-note','当前使用空间投影。追踪、逐段剪切和计数仍可操作；重叠处可结合真实纸条验证。');}
let departed=false;
async function init(){try{const {createMobiusScene}=await import('../spatial/mobius-scene');if(departed)return;host.hidden=false;spatial=createMobiusScene(host,fallback);el('paper-camera-controls').hidden=false;el('paper-view-toggle').hidden=false;setView();}catch{fallback();}}
el('paper-view-toggle').addEventListener('click',()=>{view2d=!view2d;setView();});
document.querySelectorAll<HTMLButtonElement>('[data-paper-camera]').forEach(b=>b.addEventListener('click',()=>{view2d=false;setView();spatial?.preset(b.dataset.paperCamera!);}));
window.addEventListener('pagehide',()=>{background();departed=true;spatial?.dispose();spatial=undefined;});window.addEventListener('pageshow',e=>{if(e.persisted){departed=false;void init();}});
render();void init();
