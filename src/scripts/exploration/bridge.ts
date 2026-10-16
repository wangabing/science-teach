import { bridgeNodes,bareMembers,trussMembers,solveBridge,type Member } from '../../lib/exploration/bridge';
import { el,text,value,bindRange,activate } from './ui';
import { sequence } from './demonstration';
import { bars } from './evidence';
let members:Member[]=bareMembers.map(m=>[...m]),selected:number|null=null;
let inspected:Member|null=null;
const names=['A','B','C','D','E','F'];
const project=(x:number,y:number)=>({x:80+130*x,y:300-130*y});
function choose(i:number){demo.cancel();
  if(selected===null){selected=i;text('node-feedback',`已选 ${names[i]}，再选一个节点。`);}
  else if(selected===i){selected=null;text('node-feedback','已取消。选择第一个节点。');}
  else {const pair:Member=[Math.min(selected,i),Math.max(selected,i)],found=members.findIndex(([a,b])=>a===pair[0]&&b===pair[1]);if(found>=0){members.splice(found,1);text('node-feedback',`已删除 ${names[pair[0]]}–${names[pair[1]]}。`);}else {members.push(pair);text('node-feedback',`已添加 ${names[pair[0]]}–${names[pair[1]]}。`);}selected=null;}
  render();
}
const demo=sequence(progress=>{
  members=bareMembers.map(m=>[...m]);
  if(progress>=.2)members.push([0,4]);if(progress>=.4)members.push([2,4]);
  const load=progress<.5?5:Math.min(80,5+Math.round((progress-.5)/.5*15)*5);
  el<HTMLInputElement>('load').value=String(load);selected=null;inspected=null;render();
  text('demo-stage',progress<.2?'① 裸框：没有斜撑，矩形可以侧移。注意“不稳定”不是材料断裂。':progress<.4?'② 连接 A–E：左边变成三角形，右侧还没有锁住。':progress<.5?'③ 再连 C–E：两侧都形成三角形，现在结构稳定。':progress<1?`④ 逐渐加载到 ${load} kN：观察杆力、支座反力和放大的位移同步增加。`:'演示完成：80 kN 中央载荷由两侧各承担 40 kN。选一根杆看看，或拆除它检验结构。');
},11000);
function manualGuide(){
  const has=(i:number,j:number)=>members.some(m=>m[0]===i&&m[1]===j);
  text('demo-stage',!has(0,4)?'第 1 步：点 A，再点 E，连接左侧斜撑。也可以点“帮我做下一步”。':!has(2,4)?'第 2 步：点 C，再点 E，连接右侧斜撑。只有一侧有斜撑仍可能不稳定。':'第 3 步：调节载荷观察变形，再点一根杆查看拉压。试试拆掉斜撑，结构还稳吗？');
}
function render(){
  const load=value('load'),loadNode=Number(el<HTMLSelectElement>('load-node').value),result=solveBridge(members,load,loadNode);
  el('bridge-members').innerHTML=members.map(([i,j],index)=>{
    const a=project(bridgeNodes[i]!.x,bridgeNodes[i]!.y),b=project(bridgeNodes[j]!.x,bridgeNodes[j]!.y),force=result.stable?result.forces[index]!:0;
    const color=!result.stable?'#738da1':Math.abs(force)<.001?'#a2aeba':force>0?'#217ab5':'#cd6543';
    const label=`${names[i]}到${names[j]}，${result.stable?`${Math.abs(force).toFixed(2)} kN ${Math.abs(force)<.001?'接近零力':force>0?'拉力':'压力'}`:'结构不稳定'}，点击查看`;const isSelected=inspected?.[0]===i&&inspected?.[1]===j;
    return `<line id="member-${index}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="8" stroke-linecap="round" role="button" tabindex="0" aria-pressed="${isSelected}" aria-label="${label}"><title>${label}</title></line>`;
  }).join('');
  members.forEach((_,i)=>activate(el(`member-${i}`),()=>{demo.cancel();inspected=[...members[i]!];render();}));
  el('bridge-nodes').innerHTML=bridgeNodes.map((node,i)=>{const p=project(node.x,node.y);return `<g id="bridge-node-${i}" role="button" tabindex="0" aria-label="选择节点${names[i]}" aria-pressed="${selected===i}"><circle cx="${p.x}" cy="${p.y}" r="17" fill="${selected===i?'#b97529':'white'}" stroke="#59758b" stroke-width="2"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="13" fill="${selected===i?'white':'#153b56'}">${names[i]}</text></g>`;}).join('');
  bridgeNodes.forEach((_,i)=>{activate(el(`bridge-node-${i}`),()=>choose(i));el(`node-${i}`).setAttribute('aria-pressed',String(selected===i));});
  const lp=project(bridgeNodes[loadNode]!.x,bridgeNodes[loadNode]!.y);
  el('bridge-load').innerHTML=`<path d="M${lp.x} ${lp.y-65}V${lp.y-22}m-7 -10l7 10 7 -10" fill="none" stroke="#b97529" stroke-width="3"/><text x="${lp.x+12}" y="${lp.y-48}" font-size="14" fill="#b97529">${load} kN</text>`;
  if(result.stable){
    el('bridge-deformed').innerHTML=members.map(([i,j])=>{const a=project(bridgeNodes[i]!.x+result.displacements[i]!.x*100,bridgeNodes[i]!.y+result.displacements[i]!.y*100),b=project(bridgeNodes[j]!.x+result.displacements[j]!.x*100,bridgeNodes[j]!.y+result.displacements[j]!.y*100);return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#b97529" stroke-width="2" stroke-dasharray="5 4" pointer-events="none"/>`;}).join('');
    const max=Math.max(...result.displacements.map(p=>Math.hypot(p.x,p.y)));
    text('bridge-displacement',`${(max*1000).toFixed(2)} mm`);text('bridge-reactions',`${result.reactions[1]!.toFixed(1)} / ${result.reactions[5]!.toFixed(1)} kN`);
    text('bridge-feedback',max>.02?'结构可求解，但位移较大，小变形假设可能不适用。尝试补充斜撑。':result.length<=18?'挑战完成：总杆长不超过 18 m，当前简化模型稳定。尝试拆掉一根杆，再看看。':'当前简化模型稳定。试着减少材料，保持稳定并让总杆长不超过 18 m。');
  }else{el('bridge-deformed').innerHTML='';text('bridge-displacement','不可求解');text('bridge-reactions','不可求解');text('bridge-feedback','当前桁架不稳定：有节点可以在不拉伸杆件时移动。加斜撑或检查孤立节点；不稳定时不能给出可信的受力或位移。');}
  const selectedIndex=inspected?members.findIndex(m=>m[0]===inspected![0]&&m[1]===inspected![1]):-1;
  el<HTMLButtonElement>('remove-member').disabled=selectedIndex<0;
  el('bridge-force-table').innerHTML=members.map(([i,j],index)=>{
    const length=Math.hypot(bridgeNodes[i]!.x-bridgeNodes[j]!.x,bridgeNodes[i]!.y-bridgeNodes[j]!.y),force=result.stable?result.forces[index]!:NaN;
    const state=!result.stable?'待稳定':Math.abs(force)<.001?'接近零力':force>0?'拉伸':'压缩';
    if(index===selectedIndex){
      text('bridge-inspection',`${names[i]}–${names[j]}，长度 ${length.toFixed(2)} m。${result.stable?`当前 ${state}，轴向力 ${force.toFixed(2)} kN。`:'结构不稳定，暂时不能确定受力。'}点下面的按钮才会拆除。`);
      text('bridge-member-formula',result.stable?`${force.toFixed(2)} × ${length.toFixed(2)} / 200000 × 1000 = ${(force*length/200000*1000).toFixed(3)} mm（${state}）`:'结构不稳定，不能计算这根杆的伸缩。');
    }
    return `<tr><td>${names[i]}–${names[j]}</td><td>${length.toFixed(2)}</td><td>${state}</td><td>${Number.isFinite(force)?force.toFixed(2):'—'}</td></tr>`;
  }).join('');
  if(selectedIndex<0){text('bridge-inspection','点图上的一根杆，查看受力和作用。选杆不会拆除它。');text('bridge-member-formula','选中杆件后，代入当前受力与长度。');}
  if(result.stable){
    text('bridge-live-formula',`${result.reactions[1]!.toFixed(2)} + ${result.reactions[5]!.toFixed(2)} = ${load.toFixed(2)} kN`);
    bars('bridge-reaction-bars',[{label:'左支座竖向反力',value:result.reactions[1]!,color:'#217ab5'},{label:'右支座竖向反力',value:result.reactions[5]!,color:'#b97529'},{label:'施加的向下载荷',value:load,color:'#6757ad'}],Math.max(load,Math.abs(result.reactions[1]!),Math.abs(result.reactions[5]!)),'kN');
    text('bridge-load-explain',loadNode===1||loadNode===4?'中央加载：左右对称，两侧反力相等。把载荷加倍，检查位移与杆力是否也加倍。':'偏心加载：靠近载荷的一侧承担更多。两边反力之和仍等于向下载荷。');
  }else{el('bridge-reaction-bars').innerHTML='<p>结构不稳定，先完成两根斜撑再查看反力。</p>';text('bridge-live-formula','结构不稳定：当前模型不能提供可信的反力与变形。');text('bridge-load-explain','下一步：将 A–E 和 C–E 两根斜撑连接好。');}
  if(!demo.isRunning())manualGuide();
  text('bridge-status' ,result.stable?'模型稳定':'不稳定');text('bridge-length',`${result.length.toFixed(2)} m`);text('load-value',`${load} kN`);
}
function preset(truss:boolean){demo.cancel();inspected=null;members=(truss?trussMembers:bareMembers).map(m=>[...m]);selected=null;text('node-feedback','选择第一个节点。');text('member-feedback','点击杆件可查看受力并删除；也可用右侧节点选择按钮添加或删除。');render();}
names.forEach((_,i)=>el(`node-${i}`).addEventListener('click',()=>choose(i)));el('bare').addEventListener('click',()=>preset(false));el('truss').addEventListener('click',()=>preset(true));el('reset').addEventListener('click',()=>{el<HTMLInputElement>('load').value='40';el<HTMLSelectElement>('load-node').value='1';preset(false);});bindRange('load',render);el('load-node').addEventListener('change',render);render();

el('demo').addEventListener('click',()=>{el<HTMLSelectElement>('load-node').value='1';demo.start(true);});
el('demo-pause').addEventListener('click',()=>{if(demo.isRunning()){demo.pause();text('demo-stage','演示已暂停，当前载荷与结构保持不变。再次点击“暂停演示”可继续。');}else if(demo.progress()>0&&demo.progress()<1)demo.start();});
el('guide-next').addEventListener('click',()=>{demo.cancel();const has=(a:number,b:number)=>members.some(m=>m[0]===a&&m[1]===b);if(!has(0,4))members.push([0,4]);else if(!has(2,4))members.push([2,4]);else el<HTMLInputElement>('load').value=String(Math.min(100,value('load')+20));render();});
el('remove-member').addEventListener('click',()=>{demo.cancel();if(!inspected)return;members=members.filter(m=>m[0]!==inspected![0]||m[1]!==inspected![1]);inspected=null;render();});
el('load').addEventListener('input',()=>demo.cancel(),true);el('load-node').addEventListener('change',()=>demo.cancel(),true);
