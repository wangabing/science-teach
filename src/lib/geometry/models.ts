export interface Point { x: number; y: number }
export interface ReflectionState { kind:'reflection'; ax:number; ay:number; bx:number; by:number; p:number; limited:boolean; helper:boolean }
export interface CircleState { kind:'circle'; alpha:number; theta:number; helper:boolean }
export interface TriangleState { kind:'triangle'; ab:number; ac:number; bc:number; angle:number; side:1|-1; locked:boolean; helper:boolean }
export interface EllipseState { kind:'ellipse'; a:number; c:number; theta:number; helper:boolean }
export type GeometryState=ReflectionState|CircleState|TriangleState|EllipseState;
export type GeometryKind=GeometryState['kind'];
export const defaults={
 reflection:{kind:'reflection',ax:-4,ay:3,bx:4,by:5,p:-3,limited:false,helper:false},
 circle:{kind:'circle',alpha:120,theta:240,helper:false},
 triangle:{kind:'triangle',ab:6,ac:4,bc:5,angle:60,side:1,locked:false,helper:false},
 ellipse:{kind:'ellipse',a:5,c:3,theta:45,helper:false},
} satisfies Record<GeometryKind,GeometryState>;
export const radians=(degrees:number)=>degrees*Math.PI/180;
export const degrees=(angle:number)=>angle*180/Math.PI;
export const normalize=(theta:number)=>((theta%360)+360)%360;
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const polar=(radius:number,theta:number):Point=>({x:radius*Math.cos(radians(theta)),y:radius*Math.sin(radians(theta))});
function range(value:number,min:number,max:number){if(!Number.isFinite(value)||value<min||value>max)throw new RangeError('Geometry input out of range');}
export function validateGeometry(s:GeometryState){
 if(!s||!['reflection','circle','triangle','ellipse'].includes(s.kind)||typeof s.helper!=='boolean')throw new RangeError('Invalid geometry state');
 switch(s.kind){
  case 'reflection':
   range(s.ax,-5,5);range(s.bx,-5,5);range(s.ay,1,6);range(s.by,1,6);range(s.p,s.limited?-5:-6,s.limited?-2:6);
   if(typeof s.limited!=='boolean')throw new RangeError('Invalid interval');break;
  case 'circle':range(s.alpha,30,180);range(s.theta,0,360);break;
  case 'triangle':
   for(const v of [s.ab,s.ac])range(v,.5,10);range(s.bc,.5,20);
   range(s.angle,0,180);if(![1,-1].includes(s.side)||typeof s.locked!=='boolean')throw new RangeError('Invalid triangle mode');break;
  case 'ellipse':range(s.a,2,6);range(s.c,0,6);range(s.theta,0,360);break;
 }
}
export function cloneGeometry<T extends GeometryState>(s:T):T {validateGeometry(s);return {...s};}
export function solveReflection(s:ReflectionState){
 validateGeometry(s);
 const A={x:s.ax,y:s.ay},B={x:s.bx,y:s.by},mirror={x:s.bx,y:-s.by},P={x:s.p,y:0};
 const unrestricted=(s.ax*s.by+s.bx*s.ay)/(s.ay+s.by);
 const optimum=s.limited?clamp(unrestricted,-5,-2):unrestricted;
 const at={x:optimum,y:0},ap=distance(A,P),pb=distance(P,B),reflected=distance(P,mirror),length=ap+pb;
 const minimum=distance(A,at)+distance(at,B);
 return {A,B,mirror,P,ap,pb,reflected,length,unrestricted,optimum,minimum,excess:Math.max(0,length-minimum),admissible:!s.limited||(unrestricted>=-5&&unrestricted<=-2)};
}
export function solveCircle(s:CircleState){
 validateGeometry(s);
 const A=polar(4,0),B=polar(4,s.alpha),P=polar(4,s.theta),theta=normalize(s.theta);
 // Chord endpoint coincidence is geometric; angle rounding never decides validity.
 const valid=distance(P,A)>1e-8&&distance(P,B)>1e-8;
 const minor=theta>0&&theta<s.alpha;
 const u={x:A.x-P.x,y:A.y-P.y},v={x:B.x-P.x,y:B.y-P.y};
 const angle=valid?degrees(Math.atan2(Math.abs(u.x*v.y-u.y*v.x),u.x*v.x+u.y*v.y)):null;
 return {A,B,P,valid,minor,angle,intercepted:minor?360-s.alpha:s.alpha,central:s.alpha};
}
export function solveTriangle(s:TriangleState){
 validateGeometry(s);
 const A={x:-s.ab/2,y:0},B={x:s.ab/2,y:0};
 const eps=1e-10*Math.max(s.ab,s.ac,s.bc),low=Math.abs(s.ab-s.ac),high=s.ab+s.ac;
 let status:'valid'|'degenerate'|'impossible'='valid';
 let angle=s.angle,C:Point|null;
 if(s.locked){
  if(s.bc<low-eps||s.bc>high+eps){status='impossible';C=null;}
  else{
   const x=(s.ab*s.ab+s.ac*s.ac-s.bc*s.bc)/(2*s.ab),h2=s.ac*s.ac-x*x;
   if(Math.abs(s.bc-low)<=eps||Math.abs(s.bc-high)<=eps)status='degenerate';
   C={x:A.x+x,y:status==='degenerate'?0:s.side*Math.sqrt(Math.max(0,h2))};angle=degrees(Math.acos(clamp(x/s.ac,-1,1)));
  }
 }else{C={x:A.x+s.ac*Math.cos(radians(angle)),y:s.side*s.ac*Math.sin(radians(angle))};if(angle===0||angle===180)status='degenerate';}
 const bc=C?distance(B,C):s.bc,area=C?.y?Math.abs(s.ab*C.y)/2:0;
 return {A,B,C,bc,angle,area,status,low,high,valid:status==='valid'};
}
export function solveEllipse(s:EllipseState){
 validateGeometry(s);
 const status=s.a>s.c?'valid':s.a===s.c?'degenerate':'impossible';
 const valid=status==='valid',b=valid?Math.sqrt((s.a-s.c)*(s.a+s.c)):0;
 const F1={x:-s.c,y:0},F2={x:s.c,y:0},P=valid?{x:s.a*Math.cos(radians(s.theta)),y:b*Math.sin(radians(s.theta))}:null;
 const d1=P?distance(P,F1):null,d2=P?distance(P,F2):null;
 return {valid,status,b,F1,F2,P,d1,d2,sum:d1!==null&&d2!==null?d1+d2:null,eccentricity:valid?s.c/s.a:null,equation:valid?`x²/${(s.a*s.a).toFixed(2)} + y²/${(b*b).toFixed(2)} = 1`:'当前没有非退化椭圆方程'};
}
export function geometryMetrics(s:GeometryState):Record<string,number|null>{
 switch(s.kind){
  case 'reflection':{const r=solveReflection(s);return {PA_u:r.ap,PB_u:r.pb,PB_reflected_u:r.reflected,path_u:r.length,minimum_u:r.minimum,optimal_x_u:r.optimum,excess_u:r.excess};}
  case 'circle':{const r=solveCircle(s);return {angle_APB_deg:r.angle,intercepted_arc_deg:r.intercepted,central_minor_deg:r.central};}
  case 'triangle':{const r=solveTriangle(s);return {actual_BC_u:r.bc,angle_A_deg:r.C?r.angle:null,area_u2:r.C?r.area:null};}
  case 'ellipse':{const r=solveEllipse(s);return {PF1_u:r.d1,PF2_u:r.d2,distance_sum_u:r.sum,semiminor_u:r.valid?r.b:null,eccentricity:r.eccentricity};}
 }
}
export function geometrySummary(s:GeometryState){
 switch(s.kind){
  case 'reflection':{const r=solveReflection(s);return `P横坐标 ${s.p.toFixed(2)} · ${s.limited?'受限线段':'直线'} · 路程 ${r.length.toFixed(3)}`;}
  case 'circle':{const r=solveCircle(s);return `α ${s.alpha}° · P位置 ${s.theta.toFixed(1)}° · 圆周角 ${r.angle===null?'未定义':r.angle.toFixed(2)+'°'}`;}
  case 'triangle':{const r=solveTriangle(s);return `AB ${s.ab} / AC ${s.ac} / BC ${r.bc.toFixed(3)} · ${s.locked?'三边锁定':'两杆铰接'} · ${s.side===1?'上侧':'下侧'} · ${r.status==='valid'?'有效':r.status==='degenerate'?'退化':'不可构成'}`;}
  case 'ellipse':{const r=solveEllipse(s);return `a ${s.a} / c ${s.c} · P位置 ${s.theta.toFixed(1)}° · 距离和 ${r.sum===null?'未定义':r.sum.toFixed(3)}`;}
 }
}
export function compareGeometry(a:GeometryState,b:GeometryState){
 if(a.kind!==b.kind)return '不同实验不能作为同条件对照。';
 const av=a as unknown as Record<string,unknown>,bv=b as unknown as Record<string,unknown>;
 const labels:Record<string,string>={ax:'A横坐标',ay:'A高度',bx:'B横坐标',by:'B高度',p:'P横坐标',limited:'线段限制',alpha:'中心角α',theta:'P位置参数θ',ab:'AB',ac:'AC',bc:'第三边BC输入',angle:'铰链角输入',side:'上下构型',locked:'第三边锁定',a:'长半轴a',c:'半焦距c',helper:'辅助线'};
 const changes=Object.keys(av).filter(k=>k!=='kind'&&av[k]!==bv[k]);
 return `${changes.map(k=>`${labels[k]??k} ${av[k]}→${bv[k]}`).join('；')||'输入条件相同'}。${changes.filter(k=>k!=='helper').length>1?'多个条件改变，不能归因于一个因素。':'其余输入保持不变。'}数值观察提供线索，一般结论仍需论证。`;
}
const inputUnits:Record<string,string>={ax:'ax_u',ay:'ay_u',bx:'bx_u',by:'by_u',p:'p_x_u',alpha:'alpha_deg',theta:'theta_parameter_deg',ab:'AB_u',ac:'AC_u',bc:'BC_constraint_u',angle:'hinge_input_deg',side:'orientation',a:'semimajor_a_u',c:'semifocal_c_u'};
export function geometryCSV(records:GeometryState[]){
 if(!records.length)return '';
 const kind=records[0]!.kind;if(records.some(s=>s.kind!==kind))throw new RangeError('Mixed geometry records');
 records.forEach(validateGeometry);
 const fields=Object.keys(records[0]!).filter(k=>k!=='kind');
 const metrics=Object.keys(geometryMetrics(records[0]!));
 const header=['model_version','experiment',...fields.map(k=>inputUnits[k]??k),...metrics,'result_status'];
 const lines=records.map(s=>{
  const metric=geometryMetrics(s);
  const status=s.kind==='triangle'?solveTriangle(s).status:s.kind==='ellipse'?solveEllipse(s).status:Object.values(metric).every(v=>v!==null)?'defined':'undefined_or_degenerate';
  return ['analytic-geometry-v1',kind,...fields.map(k=>(s as unknown as Record<string,unknown>)[k]),...metrics.map(k=>metric[k]??''),status].join(',');
 });
 return [header.join(','),...lines].join('\r\n')+'\r\n';
}
