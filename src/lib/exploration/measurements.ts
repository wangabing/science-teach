import { cross,type V3 } from './section.ts';
import { MU,EARTH_RADIUS,orbitEnergy,type OrbitState } from './orbit.ts';
import { threeEnergy,type Body } from './three-body.ts';
export function polygonMeasurements(points:V3[]){
  if(points.length<3)return {area:0,perimeter:0,edges:[] as number[]};
  const edges=points.map((p,i)=>Math.hypot(...p.map((x,k)=>x-points[(i+1)%points.length]![k]!)));
  const sum=points.reduce((s,p,i)=>{const c=cross(p,points[(i+1)%points.length]!);return s.map((x,k)=>x+c[k]!) as V3;},[0,0,0] as V3);
  return {area:Math.hypot(...sum)/2,perimeter:edges.reduce((s,e)=>s+e,0),edges};
}
export function orbitalElements(s:OrbitState){
  const r=Math.hypot(s.x,s.y),v2=s.vx*s.vx+s.vy*s.vy,energy=orbitEnergy(s),h=s.x*s.vy-s.y*s.vx;
  const eccentricity=Math.sqrt(Math.max(0,1+2*energy*h*h/(MU*MU)));
  const p=h*h/MU,periapsis=p/(1+eccentricity),a=energy<0?-MU/(2*energy):Infinity,apoapsis=energy<0?2*a-periapsis:Infinity;
  return {kinetic:v2/2,potential:-MU/r,energy,eccentricity,periapsis,apoapsis,period:energy<0?2*Math.PI*Math.sqrt(a**3/MU):Infinity,gravity:MU/r**2*1000,surfaceCrossing:periapsis<EARTH_RADIUS};
}
export function bodyEnergies(b:Body[]){const kinetic=b.reduce((s,p)=>s+.5*p.mass*(p.vx*p.vx+p.vy*p.vy),0);return {kinetic,potential:threeEnergy(b)-kinetic,total:threeEnergy(b)};}
