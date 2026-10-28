import {setupDiscoveries} from '../product/discoveries';
import {numericState,type DiscoveryState} from '../../lib/product/discoveries';
import { cubeVertices,cubeEdges,cubeSectionEvidence,project3,sectionBasis,dot,type V3 } from '../../lib/exploration/section';
import { el,text,value,bindRange } from './ui';
import { sequence } from './demonstration';
import { bars } from './evidence';
import { polygonMeasurements } from '../../lib/exploration/measurements';
let selectedVertex=-1,selectedEdge=-1;
let currentEvidence:ReturnType<typeof cubeSectionEvidence>;
const demo=sequence(progress=>{
  const part=progress*3;
  if(part<1){setParameters(45,90,0);text('demo-stage','① 水平切：四条棱留下四个交点，截面是正方形。');}
  else if(part<2){setParameters(45,35.264,0);text('demo-stage','② 斜切中心：六条棱留下六个交点，截面成为六边形。');}
  else{setParameters(45,35.264,Math.min(1.25,(part-2)*1.25));text('demo-stage',progress===1?'演示完成：靠近顶角时只剩三个交点，得到三角形。试着自己平移，寻找中间变化。':'③ 方向不变，向顶角平移：观察交点先后消失、面积逐渐减小。');}
},10000);
function setParameters(az:number,tilt:number,offset:number){el<HTMLInputElement>('azimuth').value=String(az);el<HTMLInputElement>('tilt').value=String(tilt);el<HTMLInputElement>('offset').value=String(offset);render();}
function render(clearSelection=true){
  if(clearSelection){selectedVertex=-1;selectedEdge=-1;}
  const az=value('azimuth')*Math.PI/180,tilt=value('tilt')*Math.PI/180,d=value('offset');
  const normal: V3=[Math.cos(tilt)*Math.cos(az),Math.cos(tilt)*Math.sin(az),Math.sin(tilt)];
  const {n,u,v}=sectionBasis(normal),evidence=cubeSectionEvidence(normal,d),points=evidence.kind==='polygon'?evidence.vertices.map(v=>v.point):[];
  currentEvidence=evidence;
  el("cube-view").dataset.sectionState=JSON.stringify({vertices:cubeVertices,edges:cubeEdges,points,plane:n,offset:d});
  const active=(i:number)=>i===selectedVertex||(selectedEdge>=0&&evidence.vertices[i]!.edges.includes(selectedEdge));
  const edgeActive=(i:number)=>i===selectedEdge||(selectedVertex>=0&&evidence.vertices[selectedVertex]?.edges.includes(i));
  const poly=(ps: V3[])=>ps.map(p=>{const q=project3(p);return `${q.x},${q.y}`;}).join(' ');
  el('cube-lines').innerHTML=cubeEdges.map(([a,b],i)=>{const p=project3(cubeVertices[a]!),q=project3(cubeVertices[b]!);return `<line data-section-edge="${i}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${edgeActive(i)?'#bc6419':'#779d95'}" stroke-width="${edgeActive(i)?6:2}"/><line data-section-edge="${i}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="transparent" stroke-width="18"/>`;}).join('');
  const plane=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>n.map((x,k)=>x*d+1.45*(a!*u[k]!+b!*v[k]!)) as V3);
  el('cut-plane').innerHTML=`<polygon points="${poly(plane)}" fill="#73c9c4" fill-opacity=".12" stroke="#73c9c4" stroke-dasharray="5 5"/>`;
  el('cube-section').innerHTML=points.length?`<polygon points="${poly(points)}" fill="#188d83" fill-opacity=".25" stroke="#188d83" stroke-width="3"/>${points.map((p,i)=>{const q=project3(p);return `<circle data-section-vertex="${i}" cx="${q.x}" cy="${q.y}" r="${active(i)?10:7}" fill="${active(i)?'#bc6419':'#188d83'}" stroke="#fff" stroke-width="2"/><text x="${q.x+13}" y="${q.y-10}" fill="#153b56" font-size="15">${i+1}</text>`;}).join('')}`:'';
  el('flat-section').innerHTML=points.length?`<polygon points="${points.map(p=>`${220+90*dot(p,u)},${200-90*dot(p,v)}`).join(' ')}" fill="#188d83" fill-opacity=".18" stroke="#188d83" stroke-width="3"/>${points.map((p,i)=>`<circle data-section-vertex="${i}" cx="${220+90*dot(p,u)}" cy="${200-90*dot(p,v)}" r="${active(i)?10:7}" fill="${active(i)?'#bc6419':'#188d83'}" stroke="#fff" stroke-width="2"/><text x="${220+102*dot(p,u)}" y="${205-102*dot(p,v)}" text-anchor="middle" font-size="13" fill="#153b56">${i+1}</text>`).join('')}`:'';
  el('section-points').innerHTML=points.map((_,i)=>`<button type="button" data-section-vertex="${i}" aria-pressed="${active(i)}">顶点 ${i+1}</button>`).join('');
  const matched=evidence.vertices.flatMap((p,i)=>active(i)?[`顶点 ${i+1} ← 原棱 ${p.edges.map(e=>e+1).join('、')}`]:[]);
  text('section-source',matched.length?matched.join('；')+'。加粗原棱与两图圈出的顶点对应。':'先选一个顶点，找到它从哪条棱上诞生。也可点击左图原棱反查顶点。');
  text('section-degenerate',evidence.kind==='point'?'平面只碰到一个原顶点，没有多边形面积。':evidence.kind==='line'?'平面只相切成线，没有多边形面积。':evidence.kind==='none'?'平面未与立方体相交。':evidence.coplanarEdges.length?`原棱 ${evidence.coplanarEdges.map(i=>i+1).join('、')} 整条在平面内，其端点可能同时属于多条原棱。`:'每个顶点是平面与原棱的真实交点。');
  const names: Record<number,string>={3:'三角形',4:'四边形',5:'五边形',6:'六边形'};
  const measure=polygonMeasurements(points);
  text('section-vertices',String(points.length));text('section-area',measure.area.toFixed(3));text('section-perimeter',measure.perimeter.toFixed(3));
  text('section-formula',`${n[0].toFixed(3)}x + ${n[1].toFixed(3)}y + ${n[2].toFixed(3)}z = ${d.toFixed(2)}`);
  bars('section-bars',measure.edges.map((edge,i)=>({label:`边 ${i+1}`,value:edge})),3.5,'单位');
  text('section-observation',points.length?`当前 ${names[points.length]}：面积 ${measure.area.toFixed(3)}，周长 ${measure.perimeter.toFixed(3)}。同为四边形也不一定是正方形，比较各边长度再判断。`:'没有多边形，面积和周长记为 0。');
  text('shape-label',points.length?`${names[points.length]} · ${points.length} 个顶点`:'没有多边形截面');
  text('section-feedback',points.length===5?'找到五边形了！现在轻轻改变偏移，观察哪条棱上的交点先消失。':points.length?`当前截面有 ${points.length} 个顶点。移动切平面，看看顶点如何出现或消失。`:'平面没有切出多边形：可能在立方体外，或只相切成点/线。把偏移调回中心试试。');
  text('azimuth-value',`${value('azimuth').toFixed(0)}°`);text('tilt-value',`${value('tilt').toFixed(1)}°`);text('offset-value',d.toFixed(2));
}
function preset(tilt:number,offset:number){demo.cancel();text('demo-stage','已选择示例。移动切面，观察交点和面积怎么变。');el<HTMLInputElement>('azimuth').value='45';el<HTMLInputElement>('tilt').value=String(tilt);el<HTMLInputElement>('offset').value=String(offset);render();}
el('square').addEventListener('click',()=>preset(90,0));el('triangle').addEventListener('click',()=>preset(35.264,1.25));el('hexagon').addEventListener('click',()=>preset(35.264,0));el('reset').addEventListener('click',()=>preset(90,0));
['azimuth','tilt','offset'].forEach(id=>bindRange(id,()=>{demo.cancel();text('demo-stage','你正在自己剖切：每一个顶点都来自平面与棱的真实交点。');render();}));
el('demo').addEventListener('click',()=>demo.start(true));
el('demo-pause').addEventListener('click',()=>{if(demo.isRunning()){demo.pause();text('demo-stage','演示已暂停；再次点击“暂停演示”可继续。');}else if(demo.progress()>0&&demo.progress()<1)demo.start();});render();

for(const id of ['cube-view','flat-view','section-points'])el(id).addEventListener('click',event=>{
 const target=(event.target as Element).closest<SVGElement|HTMLElement>('[data-section-vertex],[data-section-edge]');if(!target)return;
 const focus=(target as HTMLElement).tagName==='BUTTON';
 if(target.dataset.sectionVertex!==undefined){selectedVertex=Number(target.dataset.sectionVertex);selectedEdge=-1;}
 else{const edge=Number(target.dataset.sectionEdge);if(!currentEvidence.vertices.some(p=>p.edges.includes(edge))){text('section-source',`原棱 ${edge+1} 当前没有截面顶点。试着平移切平面。`);return;}selectedEdge=edge;selectedVertex=-1;}
 render(false);if(focus)document.querySelector<HTMLButtonElement>(`#section-points [data-section-vertex="${selectedVertex}"]`)?.focus({preventScroll:true});
});

setupDiscoveries({slug:'sections',snapshot:()=>({azimuth:value('azimuth'),tilt:value('tilt'),offset:value('offset')}),
 validate:(v):v is DiscoveryState=>numericState({azimuth:{min:0,max:180,step:1},tilt:{min:0,max:90,step:.001},offset:{min:-1.8,max:1.8,step:.01}},v),labels:{azimuth:'方位角/°',tilt:'切面方向/°',offset:'偏移/单位'},
 describe:p=>{const az=(p.azimuth as number)*Math.PI/180,t=(p.tilt as number)*Math.PI/180,e=cubeSectionEvidence([Math.cos(t)*Math.cos(az),Math.cos(t)*Math.sin(az),Math.sin(t)],p.offset as number);return `方位${p.azimuth}°，方向${p.tilt}°，偏移${p.offset}；${e.vertices.length}个交点。`;},
 restore:p=>{demo.cancel();setParameters(p.azimuth as number,p.tilt as number,p.offset as number);text('demo-stage','已恢复切面条件；未恢复演示与顶点选择，不计独立操作。');}
});
