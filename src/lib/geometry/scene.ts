import {solveReflection,solveCircle,solveTriangle,solveEllipse,radians,type GeometryState,type Point} from './models';
export function projection(s:GeometryState){
 const scale=s.kind==='circle'?50:s.kind==='triangle'?Math.min(48,320/(s.ab/2+s.ac),230/s.ac):38;
 return {scale,x:(x:number)=>400+scale*x,y:(y:number)=>280-scale*y};
}
export function geometryScene(s:GeometryState,trace:Point[]=[]){
 const t=projection(s),xy=(p:Point)=>`${t.x(p.x).toFixed(3)},${t.y(p.y).toFixed(3)}`;
 const line=(a:Point,b:Point,cls='geo-known')=>`<path d="M${xy(a)}L${xy(b)}" class="${cls}"/>`;
 const path=(points:Point[],cls:string)=>`<path d="${points.map((p,i)=>`${i?'L':'M'}${xy(p)}`).join(' ')}" class="${cls}"/>`;
 const label=(p:Point,name:string,dx=14,dy=-14,cls='')=>`<text x="${t.x(p.x)+dx}" y="${t.y(p.y)+dy}" class="geo-label ${cls}">${name}</text>`;
 const dot=(p:Point,name:string,dx=14,dy=-14)=>`<circle cx="${t.x(p.x)}" cy="${t.y(p.y)}" r="6" class="geo-fixed"/>${label(p,name,dx,dy)}`;
 const circle=(p:Point,r:number,cls:string)=>`<circle cx="${t.x(p.x)}" cy="${t.y(p.y)}" r="${r*t.scale}" class="${cls}"/>`;
 const angleArc=(p:Point,a:Point,b:Point)=>{
  const start=Math.atan2(a.y-p.y,a.x-p.x),u={x:a.x-p.x,y:a.y-p.y},v={x:b.x-p.x,y:b.y-p.y};
  const delta=Math.atan2(u.x*v.y-u.y*v.x,u.x*v.x+u.y*v.y);
  return path(Array.from({length:25},(_,i)=>({x:p.x+.55*Math.cos(start+delta*i/24),y:p.y+.55*Math.sin(start+delta*i/24)})),'geo-angle');
 };
 let markup='',point:Point|null=null;
 switch(s.kind){
  case 'reflection':{
   const r=solveReflection(s);point=r.P;
   markup=line({x:-8,y:0},{x:8,y:0},'geo-baseline')+label({x:7.7,y:0},'l',0,28);
   if(s.limited)markup+=line({x:-5,y:0},{x:-2,y:0},'geo-allowed')+dot({x:-5,y:0},'−5',-16,32)+dot({x:-2,y:0},'−2',-16,32);
   if(s.helper)markup+=line(r.B,r.mirror,'geo-helper')+line(r.A,r.mirror,'geo-helper')+line(r.P,r.mirror,'geo-helper')+dot(r.mirror,'B′')+label({x:r.unrestricted,y:0},r.admissible?'AB′与l的交点':'交点在允许段外',10,52,'geo-helper-label');
   markup+=path([r.A,r.P,r.B],'geo-route')+dot(r.A,'A')+dot(r.B,'B')+label(r.P,'P',12,-18);
   break;
  }
  case 'circle':{
   const r=solveCircle(s),O={x:0,y:0};point=r.P;
   markup=circle(O,4,'geo-outline');
   if(r.valid){
    const start=r.minor?s.alpha:0,end=r.minor?360:s.alpha;
    const arc=Array.from({length:65},(_,i)=>({x:4*Math.cos(radians(start+(end-start)*i/64)),y:4*Math.sin(radians(start+(end-start)*i/64))}));
    markup+=path(arc,'geo-intercepted')+path([r.A,r.P,r.B],'geo-route')+angleArc(r.P,r.A,r.B);
   }
   markup+=line(r.A,r.B,'geo-chord');
   if(s.helper)markup+=line(O,r.A,'geo-helper')+line(O,r.B,'geo-helper')+line(O,r.P,'geo-helper');
   markup+=dot(O,'O',-22,24)+dot(r.A,'A',14,6)+dot(r.B,'B',-26,-14)+label(r.P,'P',r.P.x>0?16:-26,r.P.y>0?-18:32);
   break;
  }
  case 'triangle':{
   const r=solveTriangle(s);point=r.C;
   if(s.helper){markup+=circle(r.A,s.ac,'geo-construction');if(s.locked)markup+=circle(r.B,s.bc,'geo-construction');}
   markup+=line(r.A,r.B,'geo-rod');
   if(r.C)markup+=line(r.A,r.C,'geo-rod')+line(r.B,r.C,s.locked?'geo-rod':'geo-helper')+angleArc(r.A,r.B,r.C)+label(r.C,'C',14,s.side===1?-18:32);
   markup+=dot(r.A,'A',-24,28)+dot(r.B,'B',14,28);
   if(!r.C)markup+='<text x="400" y="200" text-anchor="middle" class="geo-error-label">两圆没有交点，无法构成三角形</text>';
   break;
  }
  case 'ellipse':{
   const r=solveEllipse(s);point=r.P;
   markup=line({x:-7,y:0},{x:7,y:0},'geo-axis')+line({x:0,y:-6},{x:0,y:6},'geo-axis')+label({x:6.8,y:0},'x',0,28)+label({x:0,y:5.7},'y',14,0)+label({x:0,y:0},'O',-22,25);
   if(r.valid&&s.helper)markup+=`<ellipse cx="400" cy="280" rx="${s.a*t.scale}" ry="${r.b*t.scale}" class="geo-construction"/>`;
   markup+=trace.map(p=>`<circle cx="${t.x(p.x)}" cy="${t.y(p.y)}" r="2.5" class="geo-pencil"/>`).join('');
   if(r.P)markup+=path([r.F1,r.P,r.F2],'geo-string')+label(r.P,'P',14,-18);
   if(r.status==='degenerate')markup+=line(r.F1,r.F2,'geo-degenerate');
   markup+=dot(r.F1,'F₁',-30,32)+dot(r.F2,'F₂',14,32);
   if(!r.valid)markup+=`<text x="400" y="180" text-anchor="middle" class="geo-error-label">${r.status==='degenerate'?'绳长等于焦点间距：只剩线段':'绳长短于焦点间距：无解'}</text>`;
   break;
  }
 }
 return {markup,point,projection:t};
}
