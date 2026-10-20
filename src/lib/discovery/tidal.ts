import {arrow, circle, format, label, line, type Inputs, type Solid, type Vec3} from './core.ts';

/** Screen layout is logarithmic; it does not claim astronomical sizes to scale. */
export const tidalDistanceToX = (distance: number) => 275 + 370 * Math.log(distance / 100) / Math.log(20);
export const tidalXToDistance = (x: number) => 100 * 20 ** ((x - 275) / 370);
export const tidalWorldXToDistance = (x: number) => tidalXToDistance(x * 70 + 400);
const point = (x:number,y:number,z=0):Vec3 => [(x-400)/70,(230-y)/70,z];
export function tidalApparatus(p:Inputs,ratio:number,roche:number) {
 const x=tidalDistanceToX(p.distance!),y=225;
 const radius=24+12*Math.log1p(p.radius!/100);
 const tidalLength=18+Math.min(75,25*Math.log1p(ratio));
 const selfLength=18+Math.min(65,22*Math.log1p(p.density!));
 const rocheX=tidalDistanceToX(roche), gold='#ffd98a',teal='#68d8ee',violet='#c5a7ff';
 const outside=roche<100||roche>2000;
 const boundaryX=Math.max(230,Math.min(730,rocheX));
 const drawing=
  label(28,32,'拖动青色小天体，或从下方启动靠近演示',teal,17)+
  line(145,335,700,335,'#52728e',2)+
  [100,250,500,1000,2000].map(d=>line(tidalDistanceToX(d),330,tidalDistanceToX(d),342,'#92b5cc',2)+label(tidalDistanceToX(d)-18,363,String(d),'#92b5cc',13)).join('')+
  label(260,393,'中心距离 / 千km · 对数位置，天体尺寸放大', '#92b5cc',15)+
  circle(120,y,52,gold)+label(66,145,'中心天体',gold,16)+
  `<g data-tidal-handle="distance" style="cursor:ew-resize"><circle cx="${x}" cy="${y}" r="${radius}" fill="${teal}" fill-opacity=".28" stroke="${teal}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${Math.max(radius+12,70)}" fill="transparent"/></g>`+
  label(x-45,145,'小天体 ↔',teal,16)+
  arrow(x-radius,y,x>0?-tidalLength:0,0,gold)+arrow(x+radius,y,tidalLength,0,gold)+
  arrow(x-radius-selfLength,y+65,selfLength,0,violet)+arrow(x+radius+selfLength,y+65,-selfLength,0,violet)+
  label(28,430,'金箭头：相对拉伸；紫箭头：自引力约束。箭长对数缩放，不表示实际形变。','#b4c8dc',14)+
  line(boundaryX,75,boundaryX,315,'#d99b8f',2)+
  label(235,62,`流体Roche边界 ${format(roche)} 千km${outside?'（超出标尺）':''}`,'#edb3a7',15);
 const solids:Solid[]=[
  {type:'sphere',points:[point(120,y)],radius:52/70,color:gold},
  {type:'sphere',points:[point(x,y)],radius:radius/70,color:teal,handle:'distance'},
  {type:'label',points:[point(40,140)],label:'中心天体',color:gold},
  {type:'label',points:[point(x-42,140)],label:'拖动小天体 ↔',color:teal},
  {type:'line',points:[point(145,335),point(700,335)],color:'#52728e'},
  {type:'line',points:[point(boundaryX,90),point(boundaryX,315)],color:'#edb3a7'},
 ];
 const vector=(a:number,b:number,yy:number,color:string)=>{
  const sign=Math.sign(b-a);
  solids.push({type:'line',points:[point(a,yy),point(b,yy)],color});
  solids.push({type:'line',points:[point(b-sign*10,yy-6),point(b,yy),point(b-sign*10,yy+6)],color});
 };
 vector(x-radius,x-radius-tidalLength,y,gold);vector(x+radius,x+radius+tidalLength,y,gold);
 vector(x-radius-selfLength,x-radius,y+65,violet);vector(x+radius+selfLength,x+radius,y+65,violet);
 return {drawing,solids};
}
