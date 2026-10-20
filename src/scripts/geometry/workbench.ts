import {geometryStudio} from '../../data/geometry-studios';
import {defaults,cloneGeometry,solveReflection,solveCircle,solveTriangle,solveEllipse,geometrySummary,compareGeometry,geometryCSV,normalize,clamp,degrees,type GeometryKind,type GeometryState,type Point} from '../../lib/geometry/models';
import {geometryScene,projection} from '../../lib/geometry/scene';
import {setupNotebook} from '../exploration/study-notebook';
const root=document.querySelector<HTMLElement>('[data-geometry-kind]')!;
const kind=root.dataset.geometryKind as GeometryKind,studio=geometryStudio(kind);
const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(`geo-${id}`) as T;
const text=(id:string,value:string)=>{get(id).textContent=value;};
const svg=document.getElementById('geo-svg') as unknown as SVGSVGElement;
const handle=document.getElementById('geo-handle') as unknown as SVGGElement;
let state:GeometryState=cloneGeometry(defaults[kind]);
let past:GeometryState[]=[],future:GeometryState[]=[],trace:Point[]=[];
let task=false,success=false,manual=false,hingeMoved=false,lockedAfterMove=false,flippedAfterLock=false;
let samples:number[]=[];
let dragStart:GeometryState|null=null,dragPointer:number|null=null;
const numeric=(n:number|null,unit='u',places=3)=>n===null?'未定义':`${n.toFixed(places)} ${unit}`;
function clearTask(message:string){task=false;success=false;manual=false;hingeMoved=false;lockedAfterMove=false;flippedAfterLock=false;samples=[];text('task-note',message);}
function saveUndo(){past.push(cloneGeometry(state));if(past.length>80)past.shift();future=[];}
function canMove(){return !(state.kind==='triangle'&&state.locked)&&!(state.kind==='ellipse'&&!solveEllipse(state).valid);}
function hitSize(){const width=svg.getBoundingClientRect().width;document.getElementById('geo-hit')!.setAttribute('r',String(Math.max(24,24*800/Math.max(1,width))));}
function render(){
 const drawing=geometryScene(state,trace),values:string[]=[];
 document.getElementById('geo-drawing')!.innerHTML=drawing.markup;
 handle.style.display=drawing.point?'':'none';
 if(drawing.point)handle.setAttribute('transform',`translate(${drawing.projection.x(drawing.point.x)} ${drawing.projection.y(drawing.point.y)})`);
 const movable=canMove();handle.setAttribute('tabindex',movable?'0':'-1');handle.setAttribute('aria-disabled',String(!movable));
 handle.classList.toggle('geo-point-locked',!movable);
 let note='';
 switch(state.kind){
  case 'reflection':{
   const r=solveReflection(state);values.push(numeric(r.ap),numeric(r.pb),numeric(r.length),numeric(r.excess));
   note=`PB与PB′始终相等。当前允许${state.limited?'线段[−5,−2]':'直线上的点'}，最短参考 ${numeric(r.minimum)}。${r.admissible?'把两段反射路径拉直，可找到取等号的位置。':'直线最优交点在允许线段外，本题最优点应改为靠近它的端点。'}`;
   get<HTMLInputElement>('position').min=String(state.limited?-5:-6);get<HTMLInputElement>('position').max=String(state.limited?-2:6);
   get('limit').textContent=state.limited?'解除线段限制':'限制P在线段[−5,−2]';get('limit').setAttribute('aria-pressed',String(state.limited));break;
  }
  case 'circle':{
   const r=solveCircle(state);values.push(numeric(r.angle,'°',2),r.valid?numeric(r.intercepted,'°',1):'未定义',numeric(r.central,'°',1),r.valid?(r.minor?'短弧AB':'长弧AB'):'弦的端点');
   note=r.valid?`P在${r.minor?'短弧':'长弧'}AB上；紫色弧不含P。∠APB = ${r.intercepted.toFixed(1)}° ÷ 2 = ${r.angle!.toFixed(2)}°。较小中心角α不一定是当前截弧的角度。`:'P与A或B重合，一条角边长度为零，圆周角未定义。请把P移开端点。';break;
  }
  case 'triangle':{
   const r=solveTriangle(state);values.push(numeric(r.bc),numeric(r.C?r.angle:null,'°',2),numeric(r.C?r.area:null,'u²'),r.status==='impossible'?'不能构成':r.status==='degenerate'?'退化共线':state.locked?'三边锁定':'两杆可动');
   note=`当前AB=${state.ab}、AC=${state.ac}；非退化要求 ${r.low.toFixed(3)} < BC < ${r.high.toFixed(3)}。${r.status==='impossible'?'第三边超出范围，两圆无交点。':r.status==='degenerate'?'等号或零夹角使三点共线，不能称为有效三角形。':state.locked?'角度由三边确定；翻面只改变朝向。':'只固定两边，改变夹角会改变第三边和面积。'}`;
   get('lock').textContent=state.locked?'解锁第三边':'锁定当前第三边';get('lock').setAttribute('aria-pressed',String(state.locked));get<HTMLInputElement>('bc').disabled=!state.locked;
   get('flip').setAttribute('aria-label',`翻到基线${state.side===1?'下':'上'}侧`);break;
  }
  case 'ellipse':{
   const r=solveEllipse(state);values.push(numeric(r.d1),numeric(r.d2),numeric(r.sum),r.eccentricity===null?'未定义':r.eccentricity.toFixed(3));
   note=r.valid?`长轴2a=${2*state.a} u，短轴2b=${(2*r.b).toFixed(3)} u；${r.equation}。橙色记录${trace.length}个实际到过的点，最多保留240点；虚线仅为解析参考。`:`${r.status==='degenerate'?'a=c，距离和等于焦点间距，仅能落在焦点间线段；它不是非退化椭圆。':'a<c，任何点的距离和至少为2c，无法满足2a；当前没有椭圆。'}请减小c或增大a。`;
   break;
  }
 }
 values.forEach((value,i)=>text(`reading-${i}`,value));text('state-note',`${note} 读数为近似值，长度使用统一单位u。`);
 const record=state as unknown as Record<string,number|boolean|string>,position=get<HTMLInputElement>('position');
 position.value=String(record[studio.position.key]);position.disabled=!movable;
 text('position-value',`${Number(record[studio.position.key]).toFixed(kind==='reflection'?2:1)} ${studio.position.unit}`);
 handle.setAttribute('aria-valuemin',position.min);handle.setAttribute('aria-valuemax',position.max);handle.setAttribute('aria-valuenow',position.value);handle.setAttribute('aria-valuetext',geometrySummary(state));
 for(const control of studio.controls){get<HTMLInputElement>(control.key).value=String(record[control.key]);text(`${control.key}-value`,`${Number(record[control.key]).toFixed(control.key==='bc'?3:1)} ${control.unit}`);}
 get('helper').setAttribute('aria-pressed',String(state.helper));
 get<HTMLButtonElement>('undo').disabled=!past.length;get<HTMLButtonElement>('redo').disabled=!future.length;
 hitSize();
}
function replace(next:GeometryState,message:string){saveUndo();state=cloneGeometry(next);trace=[];clearTask(message);render();}
function commit(next:GeometryState,key:string,record=true){
 if(JSON.stringify(next)===JSON.stringify(state))return;
 if(record)saveUndo();
 const positionChange=key===studio.position.key;
 if(key!=='helper'){
  if(!positionChange)clearTask('已知条件改变，原任务状态已清除。可以继续探索或重新准备。');
  else if(task){
   if(success){success=false;samples=[];text('task-note','位置已改变，原完成状态已清除，请重新核验。');}
   manual=true;if(kind==='triangle')hingeMoved=true;
  }
 }
 if(state.kind==='ellipse'&&next.kind==='ellipse'&&(state.a!==next.a||state.c!==next.c))trace=[];
 state=cloneGeometry(next);
 if(state.kind==='ellipse'&&positionChange){const p=solveEllipse(state).P;if(p){trace.push(p);if(trace.length>240)trace.shift();}}
 render();
}
function moveTo(value:number,record=true){
 if(!canMove())return;
 if(state.kind==='reflection')commit({...state,p:clamp(value,state.limited?-5:-6,state.limited?-2:6)},'p',record);
 else if(state.kind==='triangle')commit({...state,angle:clamp(value,0,180)},'angle',record);
 else commit({...state,theta:clamp(value,0,360)},'theta',record);
}
function prepare(){
 replace(cloneGeometry(defaults[kind]),studio.task);task=true;manual=false;samples=[];
 get('position').focus();
}
function check(){
 if(!task){text('task-note','先准备独立探索，再亲手移动。参考、恢复与撤销不计独立观察。');return;}
 if(state.kind==='triangle'){
  if(hingeMoved&&lockedAfterMove&&flippedAfterLock&&solveTriangle(state).valid){success=true;text('task-note','独立观察已完成：你改变两杆夹角、锁定第三边，再翻到另一侧；三条边保持不变。请用SSS解释，而不只看读数。');}
  else text('task-note','还需要依次完成：亲手改变铰链角 → 锁定当前第三边 → 翻到另一侧 → 核验。');
  return;
 }
 if(!manual){text('task-note','本次还没有新的手动位置。先移动绿色点，再核验。');return;}
 if(state.kind==='reflection'){
  const r=solveReflection(state);success=r.excess<=.001;
  text('task-note',success?'独立寻找已完成：路程与当前最短值相差不超过0.001 u。用镜像保距和三角不等式解释，才能推广到其他两点。':`还可缩短 ${r.excess.toFixed(3)} u。试着让反射后的两段路接近一条直线。`);return;
 }
 const theta=state.theta;
 if(state.kind==='circle'){
  const r=solveCircle(state);
  if(!r.valid||r.minor){success=false;text('task-note',!r.valid?'P在端点，角未定义，不能算一次有效观察。':'这次任务固定在长弧AB上，请把P移到长弧再核验。另一侧弧留给反例任务。');return;}
 }else if(!solveEllipse(state).valid){text('task-note','当前不是非退化椭圆，请重新准备任务。');return;}
 if(!samples.length){samples.push(theta);manual=false;text('task-note',`已核验第一位置 θ=${theta.toFixed(1)}°。再亲手移动至少${kind==='circle'?30:40}°，核验第二位置。`);return;}
 const gap=Math.min(Math.abs(theta-samples[0]!),360-Math.abs(theta-samples[0]!));
 if(gap<(kind==='circle'?30:40)){text('task-note','两个位置太接近，请再移动一些，避免把同一点重复算作证据。');return;}
 success=true;manual=false;text('task-note',kind==='circle'?'独立观察已完成：长弧上两个不同位置，∠APB都为60°。这支持猜想；一般关系还需要辅助半径与等腰三角形论证。':'独立观察已完成：同一椭圆上两个不同位置，PF₁+PF₂都为10 u。请从距离定义解释，再查看它如何变成方程。');
}
function example(){
 let next:GeometryState=cloneGeometry(defaults[kind]);
 if(next.kind==='reflection')next={...next,p:solveReflection(next).optimum,helper:true};
 else if(next.kind==='triangle')next={...next,locked:true,helper:true};else next={...next,helper:true};
 replace(next,'正在观察参考状态，不计为独立完成。可重新准备后亲手验证。');
}
function counterexample(){
 let next:GeometryState=cloneGeometry(defaults[kind]);
 switch(next.kind){
  case 'reflection':next={...next,limited:true,p:-2,helper:true};break;
  case 'circle':next={...next,theta:60,helper:true};break;
  case 'triangle':next={...next,ab:1,ac:2,bc:3,locked:true,helper:true};break;
  case 'ellipse':next={...next,a:3,c:3,helper:true};break;
 }
 replace(next,'已应用反例条件，原独立任务已清除。检查范围与成立条件，随后可继续改变已知条件。');
 text('transfer-note',studio.feedback);
}
function dragValue(e:PointerEvent){
 const matrix=svg.getScreenCTM();if(!matrix)return;
 const local=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()),t=projection(state),world={x:(local.x-400)/t.scale,y:(280-local.y)/t.scale};
 let value:number;
 if(state.kind==='reflection')value=Math.round(world.x*100)/100;
 else if(state.kind==='triangle'){const r=solveTriangle(state);value=degrees(Math.atan2(Math.abs(world.y),world.x-r.A.x));}
 else if(state.kind==='ellipse'){const r=solveEllipse(state);if(!r.valid)return;value=normalize(degrees(Math.atan2(world.y/r.b,world.x/state.a)));}
 else value=normalize(degrees(Math.atan2(world.y,world.x)));
 moveTo(Math.round(value*100)/100,false);
}
try{
 render();get<HTMLFieldSetElement>('tools').disabled=false;
 get('prepare').addEventListener('click',prepare);get('check').addEventListener('click',check);get('example').addEventListener('click',example);get('counterexample').addEventListener('click',counterexample);
 get('reset').addEventListener('click',()=>replace(cloneGeometry(defaults[kind]),'已重置到初始条件。已存两组记录保留；任务状态已清除。'));
 get('helper').addEventListener('click',()=>commit({...state,helper:!state.helper},'helper'));
 get('position').addEventListener('input',()=>moveTo(Number(get<HTMLInputElement>('position').value)));
 for(const control of studio.controls)get<HTMLInputElement>(control.key).addEventListener('input',()=>commit({...state,[control.key]:Number(get<HTMLInputElement>(control.key).value)} as GeometryState,control.key));
 get('undo').addEventListener('click',()=>{const previous=past.pop();if(!previous)return;future.push(cloneGeometry(state));state=previous;trace=[];clearTask('已撤销，条件重新计算；任务与历史笔迹未恢复。');render();});
 get('redo').addEventListener('click',()=>{const next=future.pop();if(!next)return;past.push(cloneGeometry(state));state=next;trace=[];clearTask('已重做，任务完成状态未恢复。');render();});
 if(kind==='reflection')get('limit').addEventListener('click',()=>{if(state.kind!=='reflection')return;const limited=!state.limited;commit({...state,limited,p:limited?clamp(state.p,-5,-2):state.p},'limited');});
 if(kind==='triangle'){
  get('lock').addEventListener('click',()=>{
   if(state.kind!=='triangle')return;
   const r=solveTriangle(state);
   if(!state.locked&&r.bc<.5){text('task-note','当前第三边短于0.5 u，请先增大铰链角，再锁定第三边。');return;}
   saveUndo();state={...state,locked:!state.locked,bc:r.bc,angle:r.angle};
   if(task){success=false;if(state.locked&&hingeMoved){lockedAfterMove=true;flippedAfterLock=false;text('task-note','第三边已锁定。翻到基线另一侧，比较三条边，再核验。');}else{lockedAfterMove=false;flippedAfterLock=false;text('task-note','第三边已解锁或尚未手动改变夹角，请改变夹角后重新锁定、翻面并核验。');}}
   render();
  });
  get('flip').addEventListener('click',()=>{if(state.kind!=='triangle')return;saveUndo();state={...state,side:state.side===1?-1:1};if(task&&lockedAfterMove&&state.locked){flippedAfterLock=true;text('task-note','已翻到基线另一侧。比较三条边，再核验观察。');}success=false;render();});
 }
 document.querySelectorAll<HTMLButtonElement>('[data-geo-answer]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-geo-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  text('transfer-note',`${button.dataset.geoAnswer==='1'?'这个判断保留了必要条件。':'请再检查结论的适用条件。'}${studio.feedback}当前图形未改变。`);
 }));
 handle.addEventListener('keydown',e=>{
  const direction=['ArrowRight','ArrowUp'].includes(e.key)?1:['ArrowLeft','ArrowDown'].includes(e.key)?-1:0;
  if(!direction&&e.key!=='Home'&&e.key!=='End')return;if(!canMove())return;e.preventDefault();
  const position=get<HTMLInputElement>('position'),step=studio.position.step*(e.shiftKey?10:1);
  moveTo(e.key==='Home'?Number(position.min):e.key==='End'?Number(position.max):Number(position.value)+direction*step);
 });
 handle.addEventListener('pointerdown',e=>{if(!canMove()||e.button!==0||dragPointer!==null)return;e.preventDefault();handle.focus({preventScroll:true});dragStart=cloneGeometry(state);dragPointer=e.pointerId;saveUndo();handle.setPointerCapture(e.pointerId);});
 handle.addEventListener('pointermove',e=>{if(e.pointerId===dragPointer)dragValue(e);});
 const finish=(e:PointerEvent,cancel=false)=>{
  if(e.pointerId!==dragPointer)return;
  if(cancel&&dragStart){state=dragStart;trace=[];clearTask('拖动已取消，回到拖动前的位置。');}
  if(dragStart&&JSON.stringify(state)===JSON.stringify(dragStart))past.pop();
  dragPointer=null;dragStart=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);render();
 };
 handle.addEventListener('pointerup',e=>finish(e));handle.addEventListener('pointercancel',e=>finish(e,true));
 new ResizeObserver(hitSize).observe(svg);
 setupNotebook<GeometryState>({snapshot:()=>state,clone:cloneGeometry,restore:s=>replace(s,'记录已恢复并重算。任务完成与过去笔迹未恢复，可重新准备独立探索。'),summary:geometrySummary,compare:compareGeometry,csv:geometryCSV,filename:`${studio.slug}-evidence.csv`});
}catch(error){get<HTMLFieldSetElement>('tools').disabled=true;handle.setAttribute('tabindex','-1');handle.setAttribute('aria-disabled','true');text('task-note','实验工具暂未就绪，请刷新。下方静态说明与证明仍可阅读。');console.error(error);}
