export interface Body {x:number;y:number;vx:number;vy:number;mass:number}
export const SOFTENING=.01;
export function threePreset(name:'eight'|'sensitive'):Body[]{
  if(name==='eight')return [
    {x:-.97000436,y:.24308753,vx:.466203685,vy:.43236573,mass:1},
    {x:.97000436,y:-.24308753,vx:.466203685,vy:.43236573,mass:1},
    {x:0,y:0,vx:-.93240737,vy:-.86473146,mass:1}];
  return [{x:-1,y:0,vx:.3545,vy:.7751,mass:1},{x:1,y:0,vx:-.2758,vy:.2635,mass:1},{x:-.0265,y:.6486,vx:-.0787,vy:-1.0386,mass:1}];
}
export function threeAccelerations(bodies:Body[]){
  return bodies.map((a,i)=>bodies.reduce((force,b,j)=>{
    if(i===j)return force;const dx=b.x-a.x,dy=b.y-a.y,f=b.mass/(dx*dx+dy*dy+SOFTENING**2)**1.5;
    return {x:force.x+f*dx,y:force.y+f*dy};
  },{x:0,y:0}));
}
export function stepThree(bodies:Body[],dt:number):Body[]{
  const a=threeAccelerations(bodies),next=bodies.map((b,i)=>({...b,x:b.x+b.vx*dt+.5*a[i]!.x*dt*dt,y:b.y+b.vy*dt+.5*a[i]!.y*dt*dt})),an=threeAccelerations(next);
  return next.map((b,i)=>({...b,vx:b.vx+.5*(a[i]!.x+an[i]!.x)*dt,vy:b.vy+.5*(a[i]!.y+an[i]!.y)*dt}));
}
export function threeEnergy(b:Body[]){
  let e=b.reduce((s,p)=>s+.5*p.mass*(p.vx*p.vx+p.vy*p.vy),0);
  for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)e-=b[i]!.mass*b[j]!.mass/Math.sqrt((b[i]!.x-b[j]!.x)**2+(b[i]!.y-b[j]!.y)**2+SOFTENING**2);
  return e;
}
export function separation(a:Body[],b:Body[]){return Math.sqrt(a.reduce((s,p,i)=>s+(p.x-b[i]!.x)**2+(p.y-b[i]!.y)**2,0)/a.length);}
export function minDistance(b:Body[]){let min=Infinity;for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)min=Math.min(min,Math.hypot(b[i]!.x-b[j]!.x,b[i]!.y-b[j]!.y));return min;}
