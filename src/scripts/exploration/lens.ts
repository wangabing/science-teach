import {solveLens,rayHeights,type LensInput,type LensRegime} from '../../lib/exploration/lens';
import {el,text,value,svgPoint} from './ui';
import {decodeRecords,compareRecords,challengeHint,LENS_STORAGE_KEY,type LensRecord} from '../../lib/exploration/lens-notebook';
import {sequence} from './demonstration';
type SpatialLens=ReturnType<typeof import('../spatial/lens-scene').createLensScene>;
let spatial:SpatialLens|undefined;let view2d=false;
const input=():LensInput=>({focal:value('focal-length'),object:value('object-distance'),screen:value('screen-distance'),height:2});
const names:Record<LensRegime,string>={reduced:'倒立 · 缩小 · 实像',equal:'倒立 · 等大 · 实像',enlarged:'倒立 · 放大 · 实像',focus:'没有有限距离的像',virtual:'正立 · 放大 · 虚像'};
const explanations:Record<LensRegime,string>={reduced:'物体在 2f 外，形成倒立、缩小的实像。照相机常用这种关系。',equal:'物体在 2f 处，像也在另一侧 2f 处，倒立且等大。',enlarged:'物体在 f 与 2f 之间，形成倒立、放大的实像。投影仪利用这种关系。',focus:'物体恰在焦点：出射光平行，没有有限距离的像。移动光屏也无法对焦。',virtual:'物体在焦点内，光线向后延长才相交，得到正立、放大的虚像，不能投到光屏上。'};
const presets:Record<string,number>={far:3,equal:2,near:1.5,focus:1,magnifier:.6};
const fmt=(x:number,d=2)=>x.toFixed(d).replace('-0.00','0.00');
let prediction='',challenge='',records:LensRecord[]=[];
let firstFocus=false;
let storageStatus='';
let demoKind:'cross'|'screen'='cross',demoState:'idle'|'running'|'paused'='idle';
let transform={origin:450,scale:12};
const demo=sequence(showDemo,15000);
function demoButtons(){const b=el<HTMLButtonElement>('lens-pause');b.disabled=demoState==='idle';b.textContent=demoState==='paused'?'继续演示':'暂停演示';b.setAttribute('aria-pressed',String(demoState==='paused'));}
function cancelDemo(){demo.cancel();demoState='idle';demoButtons();}
function manual(){cancelDemo();text('lens-stage','现在由你探索：一次改变一个条件，比较光路、像的位置和光屏清晰度。');text('challenge-feedback',challenge?'条件已改变。调好后点“检验我的设计”。':'选择一个挑战，自己调一调；按钮只准备条件，不会替你完成调焦。');}
function set(id:string,v:number){const node=el<HTMLInputElement>(id);node.value=String(Math.max(Number(node.min),Math.min(Number(node.max),Math.round(v*10)/10)));}
function predictionResult(){if(!prediction)return;text('prediction-feedback',prediction==='virtual'?'你的预测得到了支持：焦点内出现正立放大的虚像。注意：虚线不是实际传播的光。':'观察与预测不同：焦点内并非没有像，而是正立放大的虚像。它可以被眼睛看到，却不能投到光屏。');}
function preset(kind:string){leaveFirstFocus();manual();const f=value('focal-length');set('object-distance',f*presets[kind]!);const s=solveLens(input());if(s.real)set('screen-distance',s.image!);render();if(kind==='magnifier')predictionResult();text('lens-stage',explanations[s.regime]);}
function render(manualFocus=false){
 if(!solveLens(input()).focused)el('first-focus-actions').hidden=true;
 const p=input(),r=solveLens(p),inRange=r.image!==null&&Math.abs(r.image)<=Math.max(100,4*p.focal);
 text('object-distance-value',`${fmt(p.object,1)} cm`);text('screen-distance-value',`${fmt(p.screen,1)} cm`);text('focal-length-value',`${fmt(p.focal,1)} cm`);
 text('image-distance',r.image===null?'无有限像距':`${fmt(r.image)} cm`);text('lens-magnification',r.magnification===null?'—':`${fmt(r.magnification)} ×`);text('image-nature',names[r.regime]);text('ray-separation',`${fmt(r.separation,3)} cm`);text('lens-conclusion',explanations[r.regime]);
 text('lens-substitution',r.image===null?`1/${fmt(p.focal,1)} = 1/${fmt(p.object,1)} + 0；1/v = 0，没有有限像距。`:`1/${fmt(p.focal,1)} = 1/${fmt(p.object,1)} + 1/(${fmt(r.image)}) ≈ ${fmt(1/p.focal,4)} cm⁻¹`);
 text('magnification-substitution',r.image===null?'焦点处没有有限的像，放大率不显示数值。':`−(${fmt(r.image)}) / ${fmt(p.object,1)} = ${fmt(r.magnification!)}；${r.real?'负号表示倒立。':'正号表示正立。'}`);
 text('lens-comparison',r.imageHeight===null?'无有限像高。注意平行光线，不要把它当成“像消失在透镜上”。':`物高 2.00 cm，理论像高 ${fmt(r.imageHeight)} cm。${r.real?'负像高在主轴下方。':'正像高在主轴上方，虚像在物体同侧。'}`);
 const max=Math.max(2,Math.abs(r.imageHeight??0));
 el('lens-height-bars').innerHTML=[['物体高度',2,'#c58b16'],['理论像高度（绝对值）',Math.abs(r.imageHeight??0),'#7560ad']].map(([label,v,c])=>`<div class="height-bar"><div><span>${label}</span><strong>${r.imageHeight===null&&label!=='物体高度'?'—':fmt(Number(v))+' cm'}</strong></div><div class="height-track"><span style="width:${Number(v)/max*100}%;background:${c}"></span></div></div>`).join('');
 document.querySelectorAll<HTMLButtonElement>('[data-lens-preset]').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(p.object/p.focal-presets[b.dataset.lensPreset!]!)<.001)));
 const left=Math.max(p.object+4,2.3*p.focal,r.image!==null&&r.image<0&&inRange?Math.abs(r.image)+4:0),right=Math.max(p.screen+4,2.3*p.focal,r.image!==null&&r.image>0&&inRange?r.image+4:0);
 const scale=820/(left+right),origin=40+left*scale,axis=190;
 transform={origin,scale};const x=(v:number)=>origin+v*scale,y=(v:number)=>axis-v*scale;
 const path=(points:[number,number][])=>points.map(([a,b],i)=>`${i?'L':'M'}${fmt(x(a))} ${fmt(y(b))}`).join(' ');
 const ticks=[];for(let d=-Math.floor(left/10)*10;d<=right;d+=10)ticks.push(`<path d="M${x(d)} 355v7" stroke="#9db5c7"/><text x="${x(d)}" y="378" text-anchor="middle" font-size="11" fill="#5b7588">${d}</text>`);
 el('lens-axis').innerHTML=`<path d="M25 ${axis}H875M25 355H875" stroke="#9db5c7"/>${ticks.join('')}<text x="875" y="395" text-anchor="end" font-size="11" fill="#5b7588">相对透镜位置 / cm · 等比例坐标</text>`+[-2,-1,1,2].map(n=>`<circle cx="${x(n*p.focal)}" cy="${axis}" r="4" fill="#85a8bb"/><text x="${x(n*p.focal)}" y="${axis+22}" text-anchor="middle" font-size="12" fill="#5b7588">${Math.abs(n)===2?'2F':'F'}</text>`).join('');
 const ys=r.screenHeights;
 el('lens-rays').innerHTML=`<path d="${path([[-p.object,p.height],[0,p.height],[p.screen,ys[0]]])}" stroke="#c58b16" stroke-width="2.5" fill="none"/><path d="${path([[-p.object,p.height],[0,0],[p.screen,ys[1]]])}" stroke="#188d83" stroke-width="2.5" fill="none"/>`;
 if(r.regime==='virtual'&&el<HTMLInputElement>('show-extensions').checked){const end=Math.max(r.image!,-left);const back=rayHeights(p,end);el('lens-rays').innerHTML+=`<g stroke="#7560ad" stroke-width="1.7" stroke-dasharray="6 5" fill="none"><path d="${path([[0,p.height],[end,back[0]]])}"/><path d="${path([[0,0],[end,back[1]]])}"/></g>`;}
 const imVisible=r.imageHeight!==null&&inRange&&Math.abs(r.imageHeight*scale)<135;
 el('lens-image').innerHTML=imVisible?`<path d="M${x(r.image!)} ${axis}V${y(r.imageHeight!)}m-7 ${r.imageHeight!>0?10:-10}l7 ${r.imageHeight!>0?-10:10} 7 ${r.imageHeight!>0?10:-10}" stroke="#7560ad" stroke-width="3" stroke-dasharray="5 4" fill="none"/><text x="${x(r.image!)+9}" y="${y(r.imageHeight!)+(r.imageHeight!>0?-10:18)}" font-size="12" fill="#7560ad">${r.real?'理论实像':'虚像'}</text>`:'';
 el('lens-glass').innerHTML=`<path d="M${origin} 65Q${origin-22} ${axis} ${origin} 315Q${origin+22} ${axis} ${origin} 65Z" fill="#b9e7ef" fill-opacity=".6" stroke="#66a6bb" stroke-width="2"/><text x="${origin}" y="40" text-anchor="middle" font-size="13" fill="#153b56">凸透镜</text>`;
 el('lens-object').innerHTML=`<rect x="${x(-p.object)-18}" y="${y(p.height)-20}" width="36" height="${p.height*scale+50}" fill="transparent"/><path d="M${x(-p.object)} ${axis}V${y(p.height)}m-8 12l8 -12 8 12" stroke="#c58b16" stroke-width="6" fill="none"/><text x="${x(-p.object)}" y="310" text-anchor="middle" font-size="13" fill="#936409">物体</text>`;
 el('lens-screen').innerHTML=`<rect x="${x(p.screen)-10}" y="65" width="20" height="250" rx="4" fill="#dcebf6" fill-opacity=".6" stroke="#4187b6" stroke-width="2"/><text x="${x(p.screen)}" y="340" text-anchor="middle" font-size="13" fill="#153b56">光屏</text>`;
 for(const [id,n] of [['lens-object',p.object],['lens-screen',p.screen]] as const){el(id).setAttribute('aria-valuenow',fmt(n,1));el(id).setAttribute('aria-valuetext',`${fmt(n,1)} 厘米`);}
 text('lens-view-note',r.image===null?'焦点处出射光平行。图中没有有限的理论像，光屏无法对焦。':!imVisible?`理论像在 ${fmt(r.image)} cm，像高 ${fmt(r.imageHeight!)} cm，超出当前图示范围；没有消失。${r.real&&r.image!>100?'也超出光屏 100 cm 行程。':''}`:`轮廓箭头为理论${r.real?'实':'虚'}像；实线在不透明光屏处停止。${r.real&&p.screen<r.image!?'当前光屏挡在理论像前，向右移动光屏继续寻找。':'可拖动物体和光屏，也可使用下方滑块。'}`);
 text('screen-badge',r.focused?'接近清晰':r.regime==='virtual'?'虚像不可投屏':r.regime==='focus'?'无法对焦':'尚未对焦');
 el('screen-blur-value').setAttribute('stdDeviation',String(r.focused?0:Math.min(14,2+r.separation*5)));
 const projectionHeight=Math.max(-65,Math.min(65,-2*p.screen/p.object*24));
 el('screen-projection').innerHTML=r.real?`<g filter="url(#screen-blur)"><g transform="translate(120 92) rotate(180) scale(${Math.abs(projectionHeight)/48})"><path d="M-14 0V-48H16M-14 -26H10" stroke="#c58b16" stroke-width="8" fill="none"/></g></g>`:`<ellipse cx="120" cy="95" rx="${Math.min(70,25+r.separation*8)}" ry="${Math.min(55,20+r.separation*6)}" fill="#e3b74e" opacity=".25" filter="url(#screen-blur)"/>`;
 text('screen-explain',r.focused?`光屏接近理论像面，得到${names[r.regime]}。${Math.abs(r.imageHeight!)>65/24?'观察窗按范围截取示意，完整像高请看下方数据。':''}`:!r.real?'光屏仍能接到光，但没有清晰图案。虚像需从透镜另一侧用眼睛观察；焦点处则没有有限像距。':`理论像距为 ${fmt(r.image!)} cm，当前屏距 ${fmt(p.screen,1)} cm。${r.image!>100?'像面超出光屏行程，先将物体移离焦点。':'移动光屏，让两条光线在屏上靠拢。'}`);
 el('screen-preview').setAttribute('aria-label',`光屏示意：${el('screen-badge').textContent}，两代表光线分离 ${fmt(r.separation,3)} 厘米`);
 spatial?.update(p,el<HTMLInputElement>('show-extensions').checked);
 el('magnifier-observer').hidden=r.regime!=='virtual';el('virtual-eye-link').hidden=r.regime!=='virtual';
 if(r.regime==='virtual'){el<HTMLElement>('magnifier-glyph').style.fontSize=`${Math.min(82,24*r.magnification!)}px`;el('magnifier-glyph').setAttribute('aria-label',`正立虚像，放大率 ${fmt(r.magnification!)} 倍；观察窗按范围缩放`);}
 el('pocket-projection').innerHTML=el('screen-projection').innerHTML.replaceAll('screen-blur','pocket-blur');
 el('pocket-blur-value').setAttribute('stdDeviation',el('screen-blur-value').getAttribute('stdDeviation')!);
 el('pocket-preview').setAttribute('aria-label',el('screen-preview').getAttribute('aria-label')!);
 text('pocket-state',el('screen-badge').textContent!);
 text('pocket-distances',`屏距 ${fmt(p.screen,1)} cm · 像距 ${r.image===null?'无有限值':fmt(r.image)+' cm'}`);
 if(firstFocus&&manualFocus){
  if(r.focused){el('first-focus-actions').hidden=false;firstFocus=false;text('first-focus-feedback','你调清晰了！光屏来到了光线会合处。记下这一刻，再改变物距、重新调焦，比较两组证据。');}
  else text('first-focus-feedback',challengeHint(p,'small'));
 }
 demoButtons();
}
function showDemo(progress:number){
 if(demoKind==='screen'){
  set('focal-length',10);set('object-distance',30);set('screen-distance',8+7*progress);
  text('lens-stage',progress===1?'调焦演示完成：屏距 15 cm 等于像距，两条光线在屏上会合。移动屏不会改变理论像。':`只移动光屏：屏距 ${fmt(value('screen-distance'),1)} cm，理论像距始终 15 cm。观察右侧图案逐渐清晰。`);
 }else{
  const ratios=[3,2,1.5,1,.6],labels=['远处风景：缩小的实像','2f：等大实像','投影特写：放大的实像','焦点：出射光平行','放大镜：正立放大的虚像'];
  const part=Math.min(4,Math.floor(progress*5)),local=progress===1?1:progress*5-part;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=reduced||local<.7||part===4?0:(local-.7)/.3;
  const ratio=ratios[part]!+(ratios[Math.min(4,part+1)]!-ratios[part]!)*t;
  set('focal-length',10);set('object-distance',10*ratio);const r=solveLens(input());set('screen-distance',r.real?r.image!:25);
  text('lens-stage',progress===1?'演示完成：跨过焦点后，实像变成虚像。现在试着不换透镜，自己做出照相机和放大镜。':`${part+1}/5 · ${labels[part]}。${part===4?'虚线是反向追溯，光线没有在虚像位置真正会合。':'留意像的大小、方向，以及光屏是否在像面。'}`);
 }
 if(progress===1){demoState='idle';if(demoKind==='cross')predictionResult();}
 render();
}
function startDemo(kind:'cross'|'screen'){leaveFirstFocus();cancelDemo();challenge='';text('challenge-feedback','正在观看标准演示。结束后选择一个挑战，自己设计并检验。');document.querySelectorAll('[data-challenge]').forEach(b=>b.setAttribute('aria-pressed','false'));demoKind=kind;demoState='running';demo.start(true);demoButtons();}
el('lens-demo').addEventListener('click',()=>startDemo('cross'));el('lens-focus-demo').addEventListener('click',()=>startDemo('screen'));
el('lens-pause').addEventListener('click',()=>{if(demoState==='running'){demo.pause();demoState='paused';text('lens-stage','演示已暂停，光路和数据保持不变。点“继续演示”，或手动接管。');}else if(demoState==='paused'){demoState='running';demo.start();}demoButtons();});
function backgroundPause(){if(demoState==='running'){demo.pause();demoState='paused';text('lens-stage','离开页面时已暂停。回来后点“继续演示”再观察。');demoButtons();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();});window.addEventListener('pagehide',backgroundPause);
['object-distance','screen-distance','focal-length'].forEach(id=>el(id).addEventListener('input',()=>{manual();render(true);}));el('show-extensions').addEventListener('change',()=>{manual();render();});
document.querySelectorAll<HTMLButtonElement>('[data-lens-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.lensPreset!)));
document.querySelectorAll<HTMLButtonElement>('[data-prediction]').forEach(b=>b.addEventListener('click',()=>{prediction=b.dataset.prediction!;document.querySelectorAll('[data-prediction]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));if(solveLens(input()).regime==='virtual')predictionResult();else text('prediction-feedback','预测已记下。选择“放大镜”或观看“跨越焦点”，用光路检验你的想法。');}));
document.querySelectorAll<HTMLButtonElement>('[data-challenge]').forEach(b=>b.addEventListener('click',()=>{leaveFirstFocus();manual();challenge=b.dataset.challenge!;set('focal-length',10);set('object-distance',challenge==='small'?30:challenge==='large'?15:20);set('screen-distance',8);document.querySelectorAll('[data-challenge]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));text('challenge-feedback',challenge==='upright'?'任务：将物体移入焦点内，找到正立放大的虚像。光屏不能接到它。':'物体已准备好。移动光屏，接到符合任务要求的清晰实像。');render();}));
el('check-challenge').addEventListener('click',()=>{const r=solveLens(input());if(!challenge){text('challenge-feedback','先选择一个设计任务，再用光路和读数检验。');return;}const passed=challenge==='upright'?r.regime==='virtual':r.focused&&r.regime===(challenge==='small'?'reduced':'enlarged');text('challenge-feedback',passed?`设计成功！${explanations[r.regime]}${r.real?'光屏也已经对焦。':'它不能投到光屏，正是虚像的特点。'}`:`还差一步：${challengeHint(input(),challenge)}`);});
function saveRecords(){
 try{if(records.length)localStorage.setItem(LENS_STORAGE_KEY,JSON.stringify({version:1,records}));else localStorage.removeItem(LENS_STORAGE_KEY);storageStatus='已保存在此浏览器，不上传，不跨设备同步。';}
 catch{storageStatus='本机保存不可用，这些记录仅保留在当前页面。';}
}
function showRecords(){
 el('lens-records').innerHTML=records.length?records.map((p,i)=>{const r=solveLens(p);return `<tr><td>${fmt(p.object,1)}</td><td>${fmt(p.focal,1)}</td><td>${fmt(p.screen,1)}</td><td>${r.image===null?'无有限值':fmt(r.image)}</td><td>${r.magnification===null?'—':fmt(r.magnification)}</td><td>${names[r.regime]}${r.real?(r.focused?' / 已对焦':' / 未对焦'):''}</td><td><button type="button" data-restore-lens="${i}" aria-label="恢复第 ${i+1} 组条件">恢复 ${i+1}</button></td></tr>`;}).join(''):'<tr><td colspan="7">还没有记录。改变一个条件，记下你的第一个发现。</td></tr>';
 text('lens-record-comparison',records.length>1?`最近两组（${records.length-1} 与 ${records.length}）：${compareRecords(records.at(-2)!,records.at(-1)!)}`:'保留两组观察后，在这里比较固定条件和变化。');
}
function loadRecords(){
 try{const raw=localStorage.getItem(LENS_STORAGE_KEY);if(raw!==null){records=decodeRecords(raw);text('record-feedback',`已找回 ${records.length}/6 组本机观察。点“恢复”重现条件，不会自动改动装置。`);}}
 catch{records=[];text('record-feedback','未能读取本机记录，可能不可用或格式已失效。仍可继续实验并记录。');}
 showRecords();
}
function recordCurrent(){
 if(records.length>=6){text('record-feedback','已记录六组。先比较这些证据，或清空后重新观察。');}
 else{records.push({...input(),extensions:el<HTMLInputElement>('show-extensions').checked});saveRecords();showRecords();text('record-feedback',`已记录 ${records.length}/6 组。${storageStatus}`);}
 text('first-record-feedback',el('record-feedback').textContent!);
}
el('record-lens').addEventListener('click',recordCurrent);
el('record-first-focus').addEventListener('click',recordCurrent);
el('lens-refocus').addEventListener('click',()=>{el('first-focus-actions').hidden=true;text('first-focus-feedback','保留焦距，自己改变物距，再移动光屏调清晰，留下第二组。');el<HTMLInputElement>('object-distance').focus();el('object-distance').scrollIntoView({block:'center',behavior:'instant'});});
el('lens-records').addEventListener('click',event=>{
 const button=(event.target as Element).closest<HTMLButtonElement>('[data-restore-lens]');if(!button)return;
 const i=Number(button.dataset.restoreLens),p=records[i];if(!p)return;
 leaveFirstFocus();manual();challenge='';document.querySelectorAll('[data-challenge]').forEach(n=>n.setAttribute('aria-pressed','false'));
 set('object-distance',p.object);set('screen-distance',p.screen);set('focal-length',p.focal);el<HTMLInputElement>('show-extensions').checked=p.extensions;render();
 text('record-feedback',`已恢复第 ${i+1} 组条件，光路和数据已重新计算。`);text('lens-stage','已恢复观察条件。保留同样焦距，改变物距并重新调焦，再记一组。');
});
el('clear-lens-records').addEventListener('click',()=>{records=[];saveRecords();showRecords();text('record-feedback',`已清空记录。${storageStatus}`);});
function leaveFirstFocus(){el('first-focus-actions').hidden=true;if(firstFocus)text('first-focus-feedback','已进入自由探索。随时可以重新开始第一次调焦。');firstFocus=false;}
el('start-first-focus').addEventListener('click',()=>{
 manual();challenge='';document.querySelectorAll('[data-challenge]').forEach(n=>n.setAttribute('aria-pressed','false'));
 el('first-focus-actions').hidden=true;set('focal-length',10);set('object-distance',30);set('screen-distance',8);firstFocus=true;
 el<HTMLDetailsElement>('lens-advanced').open=false;
 text('first-focus-feedback','只移动蓝色光屏，试着让模糊的 F 变清晰。物体和透镜先保持不动。');render();
 el('screen-distance').focus({preventScroll:true});document.querySelector(matchMedia('(max-width:700px)').matches?'.lens-control-deck':'.lens-apparatus')?.scrollIntoView({block:'start',behavior:'instant'});
});
el('lens-free').addEventListener('click',()=>{leaveFirstFocus();el<HTMLDetailsElement>('lens-advanced').open=true;text('first-focus-feedback','现在自由探索：拖动装置、选择情景，或带着挑战试一试。');});
loadRecords();
el('lens-reset').addEventListener('click',()=>{leaveFirstFocus();cancelDemo();set('focal-length',10);set('object-distance',30);set('screen-distance',15);el<HTMLInputElement>('show-extensions').checked=true;records=[];saveRecords();prediction='';challenge='';document.querySelectorAll('[data-prediction],[data-challenge]').forEach(n=>n.setAttribute('aria-pressed','false'));showRecords();text('record-feedback',`已清空记录。${storageStatus}`);text('first-focus-feedback','不用先懂公式。把模糊的 F 调清晰，再看看光线在哪里相遇。');text('prediction-feedback','先选一个想法，再用下方“放大镜”情景检验。');text('challenge-feedback','选择一个挑战，自己调一调；按钮只准备条件，不会替你完成调焦。');text('lens-stage','从“远处风景”开始：物体在 2f 外，光屏上能接到缩小、倒立的像。');render();});
const svg=el<SVGSVGElement>('lens-bench');let drag:{pointer:number;id:string;origin:number;scale:number}|null=null;
for(const [id,control,sign] of [['lens-object','object-distance',-1],['lens-screen','screen-distance',1]] as const){
 const node=el<SVGGElement>(id);
 node.addEventListener('pointerdown',e=>{manual();e.preventDefault();drag={pointer:e.pointerId,id:control,...transform};svg.setPointerCapture(e.pointerId);node.focus();});
 node.addEventListener('keydown',e=>{const keys:Record<string,number>={ArrowRight:sign,ArrowUp:1,ArrowLeft:-sign,ArrowDown:-1};if(e.key in keys){manual();e.preventDefault();set(control,value(control)+keys[e.key]!*.5);render(true);}else if(e.key==='Home'||e.key==='End'){manual();e.preventDefault();set(control,e.key==='Home'?5:control==='screen-distance'?100:80);render(true);}});
}
svg.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const point=svgPoint(svg,e),v=(point.x-drag.origin)/drag.scale;set(drag.id,drag.id==='object-distance'?-v:v);render(true);});
function endDrag(e:PointerEvent){if(drag?.pointer!==e.pointerId)return;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);render();

const spatialHost=el('lens-spatial');
function setView(){spatialHost.hidden=view2d||!spatial;el('lens-2d').hidden=!view2d&&!!spatial;el('lens-view-toggle').textContent=view2d?'切换三维装置':'切换二维光路';el('lens-view-toggle').setAttribute('aria-pressed',String(view2d));document.querySelector('.lens-apparatus')?.classList.toggle('spatial-active',!view2d&&!!spatial);if(spatial&&!view2d)spatial.update(input(),el<HTMLInputElement>('show-extensions').checked);}
function fallback(){spatial?.dispose();spatial=undefined;view2d=true;setView();el('lens-spatial-toolbar').hidden=true;text('lens-spatial-note','当前使用二维光路，物体、光屏、演示和数据仍可操作。');}
let departed=false;
async function initSpatial(){try{const {createLensScene}=await import('../spatial/lens-scene');if(departed)return;spatialHost.hidden=false;spatial=createLensScene(spatialHost,(id,v)=>{manual();set(id,v);render(true);},fallback);el('lens-spatial-toolbar').hidden=false;setView();text('lens-spatial-note','拖动金色物体或蓝色光屏；拖动空白转动视角。想精确调焦，用下方滑块或 0.1 cm 微调。');}catch{fallback();}}
el('lens-view-toggle').addEventListener('click',()=>{view2d=!view2d;setView();});
document.querySelectorAll<HTMLButtonElement>('[data-lens-camera]').forEach(b=>b.addEventListener('click',()=>{view2d=false;setView();spatial?.preset(b.dataset.lensCamera!);}));
document.querySelectorAll<HTMLButtonElement>('[data-lens-step]').forEach(b=>b.addEventListener('click',()=>{const [id,step]=b.dataset.lensStep!.split(':');manual();set(id!,value(id!)+Number(step));render(true);}));
window.addEventListener('pagehide',()=>{departed=true;spatial?.dispose();spatial=undefined;});window.addEventListener('pageshow',e=>{if(e.persisted){departed=false;void initSpatial();}});
void initSpatial();
