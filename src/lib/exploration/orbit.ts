export const MU=398600.4418, EARTH_RADIUS=6371, LAUNCH_RADIUS=7871;
export interface OrbitState {x:number;y:number;vx:number;vy:number;time:number;status:'ready'|'flying'|'collision'|'escaped'}
export const circularSpeed=Math.sqrt(MU/LAUNCH_RADIUS),escapeSpeed=Math.sqrt(2*MU/LAUNCH_RADIUS);
export function launchOrbit(speed:number,angle:number):OrbitState {
  const a=angle*Math.PI/180;
  return {x:LAUNCH_RADIUS,y:0,vx:speed*Math.sin(a),vy:speed*Math.cos(a),time:0,status:'ready'};
}
export const orbitEnergy=(s:OrbitState)=>(s.vx*s.vx+s.vy*s.vy)/2-MU/Math.hypot(s.x,s.y);
export function orbitStatus(s:OrbitState):OrbitState['status'] {
  const r=Math.hypot(s.x,s.y);
  if(r<=EARTH_RADIUS)return 'collision';
  if(r>8*LAUNCH_RADIUS&&orbitEnergy(s)>=0&&s.x*s.vx+s.y*s.vy>0)return 'escaped';
  return s.time>0?'flying':'ready';
}
export function stepOrbit(s:OrbitState,dt:number):OrbitState {
  if(s.status==='collision'||s.status==='escaped')return {...s};
  const r=Math.hypot(s.x,s.y),f=-MU/r**3,ax=f*s.x,ay=f*s.y;
  const x=s.x+s.vx*dt+.5*ax*dt*dt,y=s.y+s.vy*dt+.5*ay*dt*dt,r2=Math.hypot(x,y),f2=-MU/r2**3;
  const next:OrbitState={x,y,vx:s.vx+.5*(ax+f2*x)*dt,vy:s.vy+.5*(ay+f2*y)*dt,time:s.time+dt,status:'flying'};
  next.status=orbitStatus(next);return next;
}
