import { Apparatus, colors, m, graph, pi, type Inputs, type Point } from './kit.ts';
export function beltPath(ratio:number) {
  const r1=45,r2=r1*ratio,L:Point=[210,230],R:Point=[560,230],a=Math.asin((r2-r1)/(R[0]-L[0]));
  const point=(c:Point,r:number,t:number):Point=>[c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)];
  const upper=-pi/2-a,lower=pi/2+a;
  const points:Point[]=[point(L,r1,upper),point(R,r2,upper)];
  for(let i=1;i<=64;i++) points.push(point(R,r2,upper+(lower-upper)*i/64));
  points.push(point(L,r1,lower));
  for(let i=1;i<=64;i++) points.push(point(L,r1,lower+(upper+2*pi-lower)*i/64));
  return {points,r1,r2,L,R};
}
export function beltObservation(p:Inputs) {
  const {points,r1,r2,L,R}=beltPath(p.ratio!),t=p.time??0,omega=p.speed!*2*pi/60,b=new Apparatus();
  b.base().box(180,250,60,125,colors.ink,.9).box(530,250,60,125,colors.ink,.9);
  b.wheel(...L,r1,omega*t,colors.teal,.36).wheel(...R,r2,omega*t/p.ratio!,colors.blue,.36).belt(points);
  const lengths=points.slice(1).map((q,i)=>Math.hypot(q[0]-points[i]![0],q[1]-points[i]![1]));
  const total=lengths.reduce((a,v)=>a+v,0);
  for(let n=0;n<12;n++) {
    let d=(omega*r1*t+n*total/12)%total;
    for(let i=0;i<lengths.length;i++) {if(d<=lengths[i]!) {const a=points[i]!,c=points[i+1]!,f=d/lengths[i]!;b.ball(a[0]+(c[0]-a[0])*f,a[1]+(c[1]-a[1])*f,3.5,n===0?colors.red:'#f1dca7',.16);break;}d-=lengths[i]!;}
  }
  b.text(135,105,'主动轮',colors.teal).text(510,60,'从动轮',colors.blue);
  return b.finish([
    m('speed','从动转速',p.speed!/p.ratio!,'rpm'),m('torque','从动扭矩',p.torque!*p.ratio!,'N·m'),
    m('power','输入=输出功率',p.torque!*omega,'W'),m('belt_speed','皮带线速度',omega*.1,'m/s'),
    m('input_turns','主动轮累计圈数',p.speed!*t/60,'圈'),m('output_turns','从动轮累计圈数',p.speed!*t/60/p.ratio!,'圈')
  ],'无滑移开式皮带：两轮同向、轮缘线速度相同。播放按真实时间的0.15倍慢放；轮径、厚度示意，r₁=0.1 m；忽略滑移、张紧和损耗。',[
    graph('从动转速','半径比','rpm',.5,3,x=>p.speed!/x),graph('从动扭矩','半径比','N·m',.5,3,x=>p.torque!*x)
  ]);
}
