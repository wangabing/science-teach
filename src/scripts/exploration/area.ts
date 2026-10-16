import { areaEvidence, areaSources, areaTargets, type Pose } from '../../lib/exploration/area';
import { el, text, value, bindRange, svgPoint } from './ui';
import { sequence } from './demonstration';
import { bars } from './evidence';
const svg = el<SVGSVGElement>('area-svg');
const colors = ['#188d83', '#4b87c5', '#e5a338', '#ad73b1'];
let poses: Pose[] = [], placed = [false, false, false, false], selected = 0, hints = true;
let scale = 1, targetOrigin = { x: 430, y: 60 }, sourceOrigin = { x: 40, y: 60 };
let drag: { id: number; pointer: number; dx: number; dy: number } | null = null;
const demo=sequence(showDemo,7600);
function stopDemo(){demo.cancel();text('demo-stage','已切换为自己探索。点“帮我搬一块”直接体验，也可以展开精细操作。');}
function showDemo(progress:number){
  const phase=Math.min(3,Math.floor(progress*4)),local=progress===1?1:progress*4-phase;
  const sources=areaSources(value('leg-a'),value('leg-b'));
  for(let i=0;i<4;i++){
    const src=sources[i]!,from={x:src.x*scale+40,y:src.y*scale+60,angle:src.angle},to=target(i);
    const fraction=i<phase?1:i>phase?0:local;
    const t=window.matchMedia('(prefers-reduced-motion: reduce)').matches?(fraction>=1?1:0):fraction*fraction*(3-2*fraction);
    let delta=((to.angle-from.angle+540)%360)-180;
    poses[i]={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,angle:(from.angle+delta*t+360)%360};
    placed[i]=fraction===1;
  }
  selected=phase;updatePieces();
  text('demo-stage',progress===1?'演示完成：四块面积相同的三角形搬完了，剩余黄色面积仍为 c²=a²+b²。现在改变边长，再亲手试。':`正在搬第 ${phase+1} 块：只平移和旋转，形状与面积都没有改变。`);
}
const fmt = (x: number) => String(Math.round(x * 100) / 100);
function target(i: number) {
  const p = areaTargets(value('leg-a'), value('leg-b'))[i]!;
  return { x: p.x * scale + targetOrigin.x, y: p.y * scale + targetOrigin.y, angle: p.angle };
}
function points() { return `0,0 ${value('leg-a') * scale},0 0,${value('leg-b') * scale}`; }
function updatePieces() {
  poses.forEach((p, i) => {
    const shape = el<SVGPolygonElement>(`triangle-${i}`);
    shape.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.angle})`);
    shape.setAttribute('class', `area-piece${selected === i ? ' selected' : ''}${placed[i] ? ' placed' : ''}`);
    shape.setAttribute('aria-label', `${['青绿','蓝色','橙色','紫色'][i]}三角形，朝向 ${p.angle} 度${placed[i] ? '，已归位' : ''}`);
    el(`piece-${i}`).setAttribute('aria-pressed', String(selected === i));
  });
  const count = placed.filter(Boolean).length;
  const a=value('leg-a'),b=value('leg-b'),ev=areaEvidence(a,b);
  text('area-progress',`${count} / 4`);text('area-triangle-area',fmt(a*b/2));
  text('area-live-formula',`${fmt(ev.c)}² ≈ ${fmt(a)}² + ${fmt(b)}² = ${fmt(ev.c2)}`);
  text('area-live-explain',`外框 (${fmt(a)}+${fmt(b)})² = ${fmt(ev.outer)}；四块三角形共 ${fmt(ev.triangles)}。左侧 c²=${fmt(ev.c2)}，右侧 a²+b²=${fmt(ev.a2)}+${fmt(ev.b2)}，都没有变。`);
  bars('area-bars',[{label:'左侧 c²',value:ev.c2,color:'#d3b32c'},{label:'右侧 a²',value:ev.a2,color:'#188d83'},{label:'右侧 b²',value:ev.b2,color:'#4b87c5'}],ev.c2,'面积单位');
  const total=el('area-bars');total.innerHTML+=`<div class="stacked-area" aria-label="a平方与b平方的总和 ${ev.c2}"><span style="width:${ev.a2/ev.c2*100}%;background:#188d83">a²</span><span style="width:${ev.b2/ev.c2*100}%;background:#4b87c5">b²</span></div>`;
  text('area-feedback', count === 4 ? '搬家完成！没有剪开任何拼块，c² 与 a²+b² 留下的面积一样大。改变边长再试一次。' : `已归位 ${count} / 4 块。选中块朝向 ${poses[selected]!.angle}°；移动、旋转后放到右侧同色位置。`);
}
function select(i: number) { selected = i; updatePieces(); }
function rotate() { placed[selected] = false; poses[selected]!.angle = (poses[selected]!.angle + 90) % 360; updatePieces(); }
function snap(i: number, assisted = false) {
  const p = poses[i]!, t = target(i);
  if (p.angle === t.angle && (assisted || Math.hypot(p.x - t.x, p.y - t.y) < 26)) {
    poses[i] = t; placed[i] = true; updatePieces();
  } else if (assisted) {
    text('area-feedback', `朝向还没对上：当前 ${p.angle}°，目标 ${t.angle}°。旋转选中块，再试一次。`);
  }
}
function reset() {
  demo.cancel();
  drag = null;
  const a = value('leg-a'), b = value('leg-b'), s = a + b;
  scale = 290 / s;
  const mobile = window.matchMedia('(max-width: 750px)').matches;
  targetOrigin = mobile ? { x: 40, y: 450 } : { x: 430, y: 60 };
  svg.setAttribute('viewBox', mobile ? '0 0 370 790' : '0 0 760 400');
  const t = targetOrigin;
  const board = (x: number, y: number) => `<rect x="${x}" y="${y}" width="290" height="290" fill="#fff1a8" stroke="#90b7a9"/>`;
  el('area-boards').innerHTML = `${board(40, 60)}${board(t.x,t.y)}<text x="40" y="36" fill="#153b56" font-size="17">原来的家：一块 c²</text><text x="${t.x}" y="${t.y-24}" fill="#153b56" font-size="17">新的家：a² + b²</text><text x="178" y="215" fill="#766320" font-size="24">c²</text><text x="${t.x+a*scale/2-12}" y="${t.y+b*scale+a*scale/2+8}" fill="#766320" font-size="24">a²</text><text x="${t.x+a*scale+b*scale/2-12}" y="${t.y+b*scale/2+8}" fill="#766320" font-size="24">b²</text>`;
  // Keep a quiet reference arrangement when real pieces leave the source board.
  el('area-boards').innerHTML += areaSources(a,b).map((p,i)=>`<polygon points="${points()}" transform="translate(${p.x*scale+40} ${p.y*scale+60}) rotate(${p.angle})" fill="${colors[i]}" fill-opacity=".22" stroke="white" stroke-width="2"/>`).join('') + `<rect x="${t.x}" y="${t.y}" width="${a*scale}" height="${b*scale}" fill="#e8efee"/><rect x="${t.x+a*scale}" y="${t.y+b*scale}" width="${b*scale}" height="${a*scale}" fill="#e8efee"/>`;
  poses = areaSources(a,b).map(p => ({ x: p.x * scale + sourceOrigin.x, y: p.y * scale + sourceOrigin.y, angle: p.angle }));
  placed = [false,false,false,false]; selected = 0;
  el('area-pieces').innerHTML = poses.map((_,i) => `<polygon id="triangle-${i}" points="${points()}" fill="${colors[i]}" stroke="white" stroke-width="2" role="button" tabindex="0"/>`).join('');
  el('area-hints').innerHTML = hints ? poses.map((_,i)=> {const p=target(i);return `<polygon points="${points()}" transform="translate(${p.x} ${p.y}) rotate(${p.angle})" fill="${colors[i]}" fill-opacity=".12" stroke="${colors[i]}" stroke-width="2" stroke-dasharray="5 4"/>`;}).join('') : '';
  poses.forEach((_,i)=> {
    const node = el<SVGPolygonElement>(`triangle-${i}`);
    node.addEventListener('pointerdown', e => {
      stopDemo();e.preventDefault(); select(i); placed[i] = false;
      const p=svgPoint(svg,e); drag={id:i,pointer:e.pointerId,dx:p.x-poses[i]!.x,dy:p.y-poses[i]!.y};
      svg.setPointerCapture(e.pointerId); node.focus();
    });
    node.addEventListener('keydown', e => {
      stopDemo();selected=i;
      if(e.key.toLowerCase()==='r'){e.preventDefault();rotate();return;}
      if(e.key==='Enter'||e.key===' '){e.preventDefault();snap(i,true);return;}
      const moves: Record<string,[number,number]>={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};
      const m=moves[e.key];if(m){e.preventDefault();placed[i]=false;poses[i]!.x+=m[0];poses[i]!.y+=m[1];updatePieces();snap(i);}
    });
  });
  const evidence=areaEvidence(a,b);
  text('leg-a-value',fmt(a));text('leg-b-value',fmt(b));text('area-equation',`${fmt(evidence.a2)} + ${fmt(evidence.b2)} = ${fmt(evidence.c2)}`);
  text('area-subtract',`外框 ${fmt(evidence.outer)} − 四块三角形 ${fmt(evidence.triangles)} = 剩余面积 ${fmt(evidence.c2)}`);
  updatePieces();
}
svg.addEventListener('pointermove',e=>{
  if(!drag || drag.pointer!==e.pointerId)return;
  const p=svgPoint(svg,e);const pose=poses[drag.id]!;
  const box=svg.viewBox.baseVal;
  pose.x=Math.max(0,Math.min(box.width,p.x-drag.dx));pose.y=Math.max(0,Math.min(box.height,p.y-drag.dy));updatePieces();
});
function endDrag(e: PointerEvent){if(!drag||drag.pointer!==e.pointerId)return;const id=drag.id;drag=null;snap(id);if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}
svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
colors.forEach((_,i)=>el(`piece-${i}`).addEventListener('click',()=>select(i)));
el('rotate').addEventListener('click',rotate);el('place').addEventListener('click',()=>snap(selected,true));
el('hint').addEventListener('click',()=>{hints=!hints;el('hint').setAttribute('aria-pressed',String(hints));el('hint').textContent=hints?'隐藏拼图轮廓':'显示拼图轮廓'; const saved=poses.map(p=>({...p})),done=[...placed],index=selected;reset();poses=saved;placed=done;selected=index;updatePieces();});
el('reset').addEventListener('click',reset);bindRange('leg-a',reset);bindRange('leg-b',reset);
function relayout() {
  // Preserve the experiment when rotating a phone or resizing the viewport.
  const saved=poses.map(p=>({...p})),done=[...placed],index=selected,oldOrigin={...targetOrigin};
  reset();
  poses=saved.map((p,i)=>{
    if(done[i])return target(i);
    const onTargetSide=oldOrigin.y>100?p.y>=410:p.x>=390;
    return onTargetSide?{...p,x:p.x+targetOrigin.x-oldOrigin.x,y:p.y+targetOrigin.y-oldOrigin.y}:p;
  });
  placed=done;selected=index;updatePieces();
}
window.matchMedia('(max-width: 750px)').addEventListener('change',relayout);reset();

// Capture manual actions before their existing handlers; no delayed demo can overwrite them.
document.querySelector('.lab-controls')!.addEventListener('click',stopDemo,true);
document.querySelector('.lab-controls')!.addEventListener('input',stopDemo,true);
el('demo').addEventListener('click',()=>{reset();demo.start(true);});
el('demo-pause').addEventListener('click',()=>{if(demo.isRunning()){demo.pause();text('demo-stage','演示已暂停。再次点“暂停演示”可继续，也可以手动接管。');}else if(demo.progress()>0&&demo.progress()<1)demo.start();});
el('next-piece').addEventListener('click',()=>{stopDemo();const i=placed.findIndex(p=>!p);if(i<0){text('demo-stage','全部归位！改变 a、b 后，再验证一次。');return;}selected=i;poses[i]=target(i);placed[i]=true;updatePieces();text('demo-stage',`已自动旋转并放好第 ${i+1} 块。观察同色三角形，下一块该去哪里？`);});
el('hint').setAttribute('aria-pressed','true');el('hint').textContent='隐藏拼图轮廓';
