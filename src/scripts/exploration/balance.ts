import {setupDiscoveries} from '../product/discoveries';
import {checkedState} from '../../lib/product/state-validation';
import {solveBalance,startTipping,stepTipping,bodyPoint,platformPoint,bodyHeight,type BalanceInput,type TippingState} from '../../lib/exploration/balance';
import {el,text,value,svgPoint} from './ui';import {sequence} from './demonstration';
type Mode='idle'|'demo'|'demo-paused'|'fall'|'fall-paused';
let mode:Mode='idle',fall:TippingState|null=null,held=true,prediction='',challenge=false,view2d=false,demoKind:'tip'|'low'='tip',frame=0,last=0;
let spatial:ReturnType<typeof import('../spatial/balance-scene').createBalanceScene>|undefined;
const fmt=(v:number,d=1)=>v.toFixed(d).replace(/^-0\.0+$/,'0.'+'0'.repeat(d));
const input=():BalanceInput=>({width:value('balance-width'),tilt:value('balance-tilt'),loadX:value('balance-load-x'),loadY:value('balance-load-y'),loadMass:value('balance-mass'),bodyMass:2});
let reference:BalanceInput|null=null,transfer:BalanceInput|null=null,transferPrediction='';
const fixedControls=['balance-tilt','balance-width','balance-load-x','balance-mass'];
const demo=sequence(showDemo,12000);
function set(id:string,v:number){const n=el<HTMLInputElement>(id),step=Number(n.step);n.value=String(Math.max(Number(n.min),Math.min(Number(n.max),Math.round(v/step)*step)));}
function widthBounds(){const max=Math.floor((value('balance-width')/2-.06)*100+1e-7)/100,n=el<HTMLInputElement>('balance-load-x'),old=Number(n.value);n.min=String(-max);n.max=String(max);set('balance-load-x',old);}
function buttons(){const paused=mode.endsWith('paused');text('balance-pause',paused?'继续':'暂停');el<HTMLButtonElement>('balance-pause').disabled=mode==='idle';el('balance-pause').setAttribute('aria-pressed',String(paused));el<HTMLButtonElement>('balance-release').disabled=!!fall;}
function cancel(){demo.cancel();cancelAnimationFrame(frame);mode='idle';fall=null;held=true;buttons();}
function manual(){invalidateTransfer();cancel();text('balance-demo-note','条件已改变，装置已扶正并重新夹持。一次改变一个条件，再松开检验。');text('balance-release-note','当前只预览条件，尚未释放。');if(challenge)text('balance-challenge-note','方案已改变。保留 20° 倾角，调整到至少 3 cm 余量后检验。');}
function drawing(p:BalanceInput){const r=solveBalance(p),phi=fall?.phi??0,edge=fall?.edge??0,scale=160;
 const plot=(x:number,y:number,body=false)=>{const b=body?bodyPoint(x,y,phi,edge):[x,y],w=platformPoint(b[0]!,b[1]!,p.tilt);return [400+w[0]*scale,330-w[1]*scale];};
 const path=(pts:number[][])=>pts.map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)} ${y!.toFixed(2)}`).join(' ');
 const bounds=[[-p.width/2,0],[p.width/2,0],[p.width/2,bodyHeight],[-p.width/2,bodyHeight],[-p.width/2,0]].map(([x,y])=>plot(x!,y!,true));
 const c=bodyPoint(r.cx,r.cy,phi,edge),q=c[0]+c[1]*Math.tan(p.tilt*Math.PI/180),g=plot(r.cx,r.cy,true),foot=plot(q,0),load=plot(p.loadX,p.loadY,true);
 const graphics=el('balance-drawing');
 graphics.innerHTML=`<rect width="800" height="480" fill="#edf5fa"/><path d="${path([plot(-1,0),plot(1,0)])}" stroke="#bdd0df" stroke-width="12"/><path d="${path([plot(-p.width/2,0),plot(p.width/2,0)])}" stroke="#ce721e" stroke-width="7"/><path d="${path(bounds)}" fill="#a4cce3" fill-opacity=".28" stroke="#426b86" stroke-width="2.5"/><path d="${path([g,foot])}" stroke="#b78315" stroke-width="2.5" stroke-dasharray="6 5"/><circle cx="${foot[0]}" cy="${foot[1]}" r="7" fill="${r.status==='unstable'?'#da6a37':'#edb832'}"/><text x="24" y="36" fill="#426b86" font-size="16">${held?'夹持预览：松开后检验':'释放检验：原支撑范围以橙线标出'}</text>`;
 el('balance-load').innerHTML=`<rect x="${load[0]!-17}" y="${load[1]!-17}" width="34" height="34" rx="4" fill="#297cbd" stroke="white" stroke-width="2"/><rect x="${load[0]!-28}" y="${load[1]!-28}" width="56" height="56" fill="transparent"/><text x="${load[0]!+23}" y="${load[1]!+5}" fill="#297cbd" font-size="15">配重</text>`;
 el('balance-center-marker').innerHTML=`<circle cx="${g[0]}" cy="${g[1]}" r="8" fill="#edb832" stroke="white" stroke-width="2"/><text x="${g[0]!-22}" y="${g[1]!+5}" text-anchor="end" fill="#906414" font-size="16">G · 重心</text>`;
 el('balance-load').setAttribute('aria-valuenow',fmt(p.loadY*100,0));el('balance-load').setAttribute('aria-valuetext',`横向 ${fmt(p.loadX*100,0)} 厘米，高度 ${fmt(p.loadY*100,0)} 厘米`);
 // The HTML fallback's static children are replaced once, while the operable group retains focus/listeners.
}
function supportMarkup(p:BalanceInput){const r=solveBalance(p),scale=200/p.width,x=170+r.projection*scale,outside=Math.abs(x-170)>137,visible=Math.max(30,Math.min(310,x));return `<rect x="70" y="47" width="200" height="22" rx="4" fill="#dff0e9"/><path d="M70 35V85M270 35V85" stroke="#ce721e" stroke-width="3"/><path d="M170 44V72" stroke="#9db8c8"/><circle cx="${visible}" cy="58" r="7" fill="${r.status==='unstable'?'#da6a37':'#edb832'}"/>${outside?`<text x="${visible}" y="28" text-anchor="middle" fill="#ad582e" font-size="12">超出图尺</text>`:''}<text x="70" y="109" text-anchor="middle" fill="#627b8c" font-size="12">−${fmt(p.width*50,0)} cm</text><text x="270" y="109" text-anchor="middle" fill="#627b8c" font-size="12">+${fmt(p.width*50,0)} cm</text>`;}
function support(p:BalanceInput){const r=solveBalance(p);el('balance-support').innerHTML=supportMarkup(p);el('balance-support').setAttribute('aria-label',`原姿态重力线落点 ${fmt(r.projection*100)} 厘米，稳定余量 ${fmt(r.margin*100)} 厘米`);}
function invalidateTransfer(){transfer=null;transferPrediction='';el('balance-transfer').hidden=true;el('balance-transfer-evidence').hidden=true;document.querySelectorAll('[data-balance-transfer]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function compareCard(p:BalanceInput,label:string){const r=solveBalance(p);return `<article><h3>${label}</h3><p>架 ${fmt(p.bodyMass)} kg · 配重 ${fmt(p.loadMass)} kg · 高度 ${fmt(p.loadY*100,0)} cm</p><svg viewBox="0 0 340 130" role="img" aria-label="${label}，落点 ${fmt(r.projection*100,2)} 厘米，余量 ${fmt(r.margin*100,2)} 厘米">${supportMarkup(p)}</svg><dl><div><dt>重力线落点</dt><dd>${fmt(r.projection*100,2)} cm</dd></div><div><dt>稳定余量</dt><dd>${fmt(r.margin*100,2)} cm</dd></div><div><dt>向右临界角</dt><dd>${fmt(r.criticalRight,2)}°</dd></div><div><dt>恢复力矩</dt><dd>${fmt(r.moment,2)} N·m</dd></div></dl></article>`;}
function comparison(){if(!reference)return;const p=input(),a=solveBalance(reference),b=solveBalance(p);
 text('balance-fixed-conditions',`固定：倾角 ${fmt(p.tilt)}° · 支撑宽度 ${fmt(p.width*100,0)} cm · 架 ${fmt(p.bodyMass)} kg · 配重 ${fmt(p.loadMass)} kg · 横向 ${fmt(p.loadX*100,0)} cm。`);
 el<HTMLInputElement>('balance-b-height').value=String(p.loadY);text('balance-b-height-value',`${fmt(p.loadY*100,0)} cm`);
 el('balance-pair').innerHTML=compareCard(reference,'A · 保留的姿态')+compareCard(p,'B · 当前姿态');
 text('balance-compare-conclusion',Math.abs(p.loadY-reference.loadY)<1e-8?'A 与 B 的条件相同。只改高度，看看落点如何变化。':`只改变高度：整体重心从 ${fmt(a.cy*100,2)} → ${fmt(b.cy*100,2)} cm；稳定余量从 ${fmt(a.margin*100,2)} → ${fmt(b.margin*100,2)} cm。${Math.abs(p.tilt)<1e-8?'台面水平时落点不随高度改变；临界倾角仍会改变。':'对照看的是释放前的姿态；松开后的翻倒过程另行验证。'}`);
}
function endComparison(message='已结束对照，恢复自由探索。'){reference=null;for(const id of fixedControls)el<HTMLInputElement>(id).disabled=false;document.querySelectorAll<HTMLButtonElement>('[data-balance-step]').forEach(b=>b.disabled=false);el<HTMLButtonElement>('balance-compare-exit').disabled=true;el('balance-compare-panel').hidden=true;text('balance-compare-note',message);}
el('balance-keep-a').addEventListener('click',()=>{manual();reference={...input()};for(const id of fixedControls)el<HTMLInputElement>(id).disabled=true;document.querySelectorAll<HTMLButtonElement>('[data-balance-step]').forEach(b=>b.disabled=!b.dataset.balanceStep!.startsWith('balance-load-y:'));el<HTMLButtonElement>('balance-compare-exit').disabled=false;el('balance-compare-panel').hidden=false;text('balance-compare-note','A 已保留。质量、倾角、底座和横向位置已固定；现在只改变 B 的高度。选择预设或演示会结束对照。');render();});
el('balance-compare-exit').addEventListener('click',()=>endComparison());
el('balance-b-height').addEventListener('input',()=>{if(!reference)return;manual();set('balance-load-y',value('balance-b-height'));render();});
el('balance-transfer-check').addEventListener('click',()=>{if(!transfer)return;if(!transferPrediction){text('balance-transfer-note','先选临界角会怎样，再把所有质量加倍。');return;}
 const doubled={...transfer,bodyMass:transfer.bodyMass*2,loadMass:transfer.loadMass*2};el('balance-transfer-evidence').innerHTML=compareCard(transfer,'原方案')+compareCard(doubled,'所有质量 ×2');el('balance-transfer-evidence').hidden=false;
 text('balance-transfer-note',`${transferPrediction==='same'?'预测得到支持':'结果与你的预测不同'}：临界角和余量不变，恢复力矩加倍。两种质量同比增加，重心公式的分子、分母同时乘二，质量比例不变；不是只加配重。`);
});
document.querySelectorAll<HTMLButtonElement>('[data-balance-transfer]').forEach(b=>b.addEventListener('click',()=>{if(!transfer)return;transferPrediction=b.dataset.balanceTransfer!;document.querySelectorAll('[data-balance-transfer]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));el('balance-transfer-evidence').hidden=true;text('balance-transfer-note','预测已记下。点“把所有质量加倍，检验”，比较临界角、余量与力矩。');}));

function render(){const p=input(),r=solveBalance(p);
 for(const [id,n,unit,d] of [['balance-tilt',p.tilt,'°',1],['balance-width',p.width*100,' cm',0],['balance-load-y',p.loadY*100,' cm',0],['balance-load-x',p.loadX*100,' cm',0],['balance-mass',p.loadMass,' kg',1]] as const)text(id+'-value',fmt(n,d)+unit);
 text('balance-held',held?'夹持预览':fall?.landed?'首次接触，已停止':'已松开夹持');text('balance-gauge-heading',held?'重力线落在哪里？':'释放前的重力线落点');
 text('balance-status',r.status==='stable'?'松开后能站住':r.status==='critical'?'恰在边缘：临界平衡':`松开后向${r.edge>0?'右':'左'}翻倒`);text('balance-margin',`${fmt(r.margin*100,2)} cm`);text('balance-critical',`${fmt(r.criticalRight,2)}°`);
 text('balance-center',`${fmt(r.cx*100)} / ${fmt(r.cy*100)} cm`);text('balance-projection',`${fmt(r.projection*100)} cm`);text('balance-moment',`${fmt(r.moment,2)} N·m`);text('balance-both-critical',`${fmt(r.criticalLeft)}° / ${fmt(r.criticalRight)}°`);
 text('balance-center-formula',`M=2 kg，m=${fmt(p.loadMass)} kg；xG=${fmt(r.cx,3)} m，yG=(2×0.6+${fmt(p.loadMass)}×${fmt(p.loadY,2)})/${fmt(r.mass)}=${fmt(r.cy,3)} m`);
 text('balance-support-formula',`q=${fmt(r.cx,3)}+${fmt(r.cy,3)}×tan(${fmt(p.tilt)}°)=${fmt(r.projection,3)} m；d=${fmt(p.width/2,2)}−|${fmt(r.projection,3)}|=${fmt(r.margin,3)} m`);
 text('balance-moment-formula',`τ=${fmt(r.mass)}×9.81×cos(${fmt(p.tilt)}°)×${fmt(r.margin,3)}=${fmt(r.moment,2)} N·m。${r.moment<0?'负值表示翻倒方向。':'正值为恢复方向，零为临界。'}`);
 text('balance-conclusion',r.status==='stable'?'原姿态的重力线落在支撑面内。降低重心、加宽支撑或让配重居中，都可能增加稳定余量。':r.status==='critical'?'重力线恰过边缘，恢复力矩为零。真实装置的微小扰动可能让它翻倒。':'原姿态的重力线越过支撑边缘。夹持器仍可保持它，但松开后会绕越过的边缘翻倒。');
 text('balance-time',`${fmt(fall?.time??0,2)} s`);text('balance-angle',`${fmt((fall?.phi??0)*180/Math.PI)}°`);text('balance-speed',`${fmt((fall?.omega??0)*180/Math.PI)}°/s`);
 text('balance-motion-note',fall?.landed?'首次侧面接触台面，展示已停止。不模拟撞击反弹；下方仍是释放前的静态判据。':fall?'相对转角由重力矩和转动惯量计算；原支撑面仅作参考，静态判据不代表落地后的接触。':held?'松开后才开始运动。下方静态判据对应释放前的条件。':'重力线在支撑范围内，松开后保持站立；这不是凭重量大小判定。');
 drawing(p);support(p);comparison();spatial?.update(p,fall);buttons();
}
function release(){demo.cancel();cancelAnimationFrame(frame);mode='idle';fall=startTipping(input());held=false;if(!fall){const r=solveBalance(input());text('balance-release-note',r.status==='critical'?'处在临界平衡，理想模型没有扰动，因此不会凭空翻倒。再多倾斜一点检验。':'松开后站住了。保持其它条件，尝试把配重放高或把底座收窄。');render();return;}
 text('balance-release-note',`已松开，正绕${fall.edge>0?'右':'左'}边缘翻倒。`);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){for(let i=0;i<5000&&!fall.landed;i++)fall=stepTipping(input(),fall,1/240);text('balance-release-note','减少动态模式：直接显示首次落地结果；时间来自重力转动模型。');render();return;}
 mode='fall';last=performance.now();render();frame=requestAnimationFrame(tick);
}
function tick(now:number){if(mode!=='fall'||!fall)return;const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now;fall=stepTipping(input(),fall,dt);if(fall.landed){mode='idle';text('balance-release-note','侧面首次接触台面，运动已停止。点“扶正”继续比较。');}render();if(mode==='fall')frame=requestAnimationFrame(tick);}
function showDemo(progress:number){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?Math.floor(progress*4)/4:progress;
 set('balance-width',.6);widthBounds();set('balance-mass',4);set('balance-load-x',0);
 if(demoKind==='tip'){set('balance-load-y',1.05);const critical=solveBalance({...input(),tilt:0}).criticalRight;set('balance-tilt',(critical+5)*t);text('balance-demo-note',`倾角 ${fmt(value('balance-tilt'))}°，临界约 ${fmt(critical)}°。夹持器保持姿态，演示结束自动松开。`);}else{set('balance-tilt',25);set('balance-load-y',1.05-.9*t);text('balance-demo-note','固定 25° 倾角与 4 kg 配重，只降低配重。看重心变低、落点回到支撑面内，临界角增大。');}
 render();if(progress===1){mode='idle';if(demoKind==='tip')release();else{text('balance-demo-note','对照完成：同样重，放低后稳定了。现在松开夹持，或换一个位置验证。');predictionFeedback();buttons();}}
}
function startDemo(kind:'tip'|'low'){if(reference)endComparison('已结束高度对照，开始标准演示。');invalidateTransfer();cancel();challenge=false;demoKind=kind;mode='demo';text('balance-challenge-note','观看标准演示后，再准备运输挑战。');text('balance-release-note','演示中由夹持器保持姿态。');demo.start(true);buttons();}
function predictionFeedback(){if(prediction)text('balance-prediction-note',prediction==='low'?'预测得到支持：同样重，放低后重心降低，临界角与稳定余量增大。':'结果与你的预测不同：质量没有改变，降低配重仍提高了稳定性。比较临界角和余量解释原因。');}
function preset(kind:string){if(reference)endComparison('已结束高度对照，切换到自由探索情景。');manual();set('balance-width',kind==='wide'?.95:.6);widthBounds();set('balance-mass',kind==='default'?2:4);set('balance-load-x',kind==='side'?.22:0);set('balance-load-y',kind==='low'?.15:kind==='high'?1.05:.65);set('balance-tilt',kind==='default'?12:25);render();}
['balance-tilt','balance-width','balance-load-y','balance-load-x','balance-mass'].forEach(id=>el(id).addEventListener('input',()=>{manual();if(reference){set('balance-tilt',reference.tilt);set('balance-width',reference.width);set('balance-load-x',reference.loadX);set('balance-mass',reference.loadMass);}if(id==='balance-width')widthBounds();render();}));
document.querySelectorAll<HTMLButtonElement>('[data-balance-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.balancePreset!)));
document.querySelectorAll<HTMLButtonElement>('[data-balance-step]').forEach(b=>b.addEventListener('click',()=>{manual();const [id,step]=b.dataset.balanceStep!.split(':');set(id!,value(id!)+Number(step));render();}));
el('balance-release').addEventListener('click',release);el('balance-upright').addEventListener('click',()=>{manual();render();});
el('balance-demo-tip').addEventListener('click',()=>startDemo('tip'));el('balance-demo-low').addEventListener('click',()=>startDemo('low'));
el('balance-pause').addEventListener('click',()=>{if(mode==='demo'){demo.pause();mode='demo-paused';}else if(mode==='demo-paused'){mode='demo';demo.start();}else if(mode==='fall'){cancelAnimationFrame(frame);mode='fall-paused';}else if(mode==='fall-paused'){mode='fall';last=performance.now();frame=requestAnimationFrame(tick);}buttons();});
document.querySelectorAll<HTMLButtonElement>('[data-balance-prediction]').forEach(b=>b.addEventListener('click',()=>{prediction=b.dataset.balancePrediction!;document.querySelectorAll('[data-balance-prediction]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));text('balance-prediction-note','预测已记下。观看“把配重放低”演示，再用数据检验。');}));
el('balance-challenge-start').addEventListener('click',()=>{endComparison();invalidateTransfer();cancel();challenge=true;set('balance-width',.4);widthBounds();set('balance-mass',4);set('balance-load-x',0);set('balance-load-y',1);set('balance-tilt',20);text('balance-challenge-note','任务开始：20° 斜坡、至少 3 cm 余量。展品由夹持器保持，先调整，再检验。');text('balance-release-note','运输挑战：调整后再松开夹持检验。');render();});
el('balance-challenge-check').addEventListener('click',()=>{invalidateTransfer();if(!challenge){text('balance-challenge-note','先点“准备运输挑战”，再调整你的方案。');return;}const p=input(),r=solveBalance(p),passed=Math.abs(p.tilt-20)<=.05&&r.margin>=.03-1e-9;
 text('balance-challenge-note',Math.abs(p.tilt-20)>.05?'还差一步：斜坡必须保持 20°，不能靠降低倾角完成任务。':passed?'方案通过！20° 倾角下余量至少 3 cm。松开夹持验证，再预测所有质量加倍会怎样。':`还差一步：当前余量 ${fmt(r.margin*100)} cm，需要至少 3 cm。试试降低配重、让它居中或加宽支撑。`);
 if(passed){transfer={...p};el('balance-transfer').hidden=false;text('balance-transfer-note','先选一个预测，再用两组证据检验。主装置保持原方案。');}
});
el('balance-reset').addEventListener('click',()=>{endComparison();invalidateTransfer();cancel();prediction='';challenge=false;set('balance-width',.6);widthBounds();set('balance-mass',2);set('balance-load-x',0);set('balance-load-y',.65);set('balance-tilt',12);document.querySelectorAll('[data-balance-prediction]').forEach(b=>b.setAttribute('aria-pressed','false'));text('balance-prediction-note','选一个想法，再点“把配重放低”演示，用临界角和余量检验。');text('balance-challenge-note','准备后会给你一件容易翻倒的展品。试着只改变一个条件。');text('balance-demo-note','先把台面慢慢倾斜，看看金色落点何时走出支撑面。');text('balance-release-note','当前只预览条件，尚未释放。');spatial?.preset('perspective');render();});
function background(){if(mode==='demo'){demo.pause();mode='demo-paused';}else if(mode==='fall'){cancelAnimationFrame(frame);mode='fall-paused';}buttons();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
// Retain only the interactive load group from the static fallback before rendering.
const svg=el<SVGSVGElement>('balance-2d'),loadNode=el<SVGGElement>('balance-load');svg.replaceChildren(loadNode);const drawingGroup=document.createElementNS('http://www.w3.org/2000/svg','g');drawingGroup.id='balance-drawing';svg.prepend(drawingGroup);const centerGroup=document.createElementNS('http://www.w3.org/2000/svg','g');centerGroup.id='balance-center-marker';centerGroup.setAttribute('pointer-events','none');svg.append(centerGroup);
let drag:{pointer:number;x:number;y:number}|null=null;
function loadMove(x:number,y:number){manual();set('balance-load-x',reference?reference.loadX:x);set('balance-load-y',y);render();}
function local(e:PointerEvent){const pt=svgPoint(svg,e),worldX=(pt.x-400)/160,worldY=(330-pt.y)/160,a=value('balance-tilt')*Math.PI/180;return {x:worldX*Math.cos(a)-worldY*Math.sin(a),y:worldX*Math.sin(a)+worldY*Math.cos(a)};}
loadNode.addEventListener('pointerdown',e=>{manual();render();e.preventDefault();const p=local(e);drag={pointer:e.pointerId,x:p.x-value('balance-load-x'),y:p.y-value('balance-load-y')};svg.setPointerCapture(e.pointerId);loadNode.focus();});
svg.addEventListener('pointermove',e=>{if(drag?.pointer!==e.pointerId)return;const p=local(e);loadMove(p.x-drag.x,p.y-drag.y);});
function end(e:PointerEvent){if(drag?.pointer!==e.pointerId)return;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
loadNode.addEventListener('keydown',e=>{const k:Record<string,[number,number]>={ArrowUp:[0,.01],ArrowDown:[0,-.01],ArrowRight:[.01,0],ArrowLeft:[-.01,0]};if(k[e.key]){e.preventDefault();loadMove(value('balance-load-x')+k[e.key]![0],value('balance-load-y')+k[e.key]![1]);}});
const host=el('balance-spatial');function setView(){host.hidden=view2d||!spatial;svg.toggleAttribute('hidden',!view2d&&!!spatial);text('balance-view-toggle',view2d?'切换三维装置':'切换二维示意');el('balance-view-toggle').setAttribute('aria-pressed',String(view2d));if(spatial&&!view2d)spatial.update(input(),fall);}
function fallback(){spatial?.dispose();spatial=undefined;view2d=true;setView();el('balance-cameras').hidden=true;el('balance-view-toggle').hidden=true;text('balance-view-note','当前使用二维示意。配重拖动、夹持释放、演示和数据仍可操作。');}
let departed=false;async function init(){try{const {createBalanceScene}=await import('../spatial/balance-scene');if(departed)return;host.hidden=false;spatial=createBalanceScene(host,loadMove,fallback);el('balance-cameras').hidden=false;el('balance-view-toggle').hidden=false;setView();}catch{fallback();}}
el('balance-view-toggle').addEventListener('click',()=>{view2d=!view2d;setView();});document.querySelectorAll<HTMLButtonElement>('[data-balance-camera]').forEach(b=>b.addEventListener('click',()=>{view2d=false;setView();spatial?.preset(b.dataset.balanceCamera!);}));
window.addEventListener('pagehide',()=>{background();departed=true;spatial?.dispose();spatial=undefined;});window.addEventListener('pageshow',e=>{if(e.persisted){departed=false;void init();}});
render();void init();

const savedBalanceValid=checkedState(input(),p=>{
 solveBalance(p);
 const xMax=Math.floor((p.width/2-.06)*100+1e-7)/100;
 if(p.bodyMass!==2||p.width<.3||p.width>1||Math.abs(p.tilt)>60||p.loadY<.12||p.loadY>1.08||p.loadMass<.5||p.loadMass>5||Math.abs(p.loadX)>xMax+1e-9)throw new RangeError('Outside control bounds');
});
setupDiscoveries({slug:'balance',snapshot:()=>({...input()}),validate:savedBalanceValid,labels:{width:'支撑宽度 m',tilt:'倾角 °',loadX:'配重横向 m',loadY:'配重高度 m',loadMass:'配重 kg',bodyMass:'架质量 kg'},
 describe:s=>{const p=s as unknown as BalanceInput;return `支撑 ${p.width} m；倾角 ${p.tilt}°；配重 (${p.loadX},${p.loadY}) m、${p.loadMass} kg；稳定余量 ${(solveBalance(p).margin*100).toFixed(2)} cm。恢复夹持姿态。`;},
 restore:s=>{challenge=false;prediction='';endComparison();manual();el<HTMLInputElement>('balance-width').value=String(s.width);widthBounds();for(const [id,key] of [['balance-tilt','tilt'],['balance-load-x','loadX'],['balance-load-y','loadY'],['balance-mass','loadMass']])el<HTMLInputElement>(id!).value=String(s[key!]);document.querySelectorAll('[data-balance-predict]').forEach(b=>b.setAttribute('aria-pressed','false'));text('balance-challenge-note','恢复记录不计独立挑战；可重新准备挑战。');text('balance-prediction-note','请重新预测并释放检验。');render();}});
