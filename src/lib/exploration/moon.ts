/** Teaching snapshots, not an ephemeris. Distances/radii in mean Earth radii. */
export type Vec3 = readonly [number, number, number];
export interface MoonInput {phase:number; inclination:number; node:number; distance:number}
export const EARTH_RADIUS=1, MOON_RADIUS=.2727, SUN_RADIUS=109.1, SUN_DISTANCE=23455, SYNODIC_DAYS=29.53059;
export const SUN:Vec3=[SUN_DISTANCE,0,0], OBSERVER:Vec3=[1,0,0];
export const radians=(x:number)=>x*Math.PI/180;
export const degrees=(x:number)=>x*180/Math.PI;
export const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const wrap=(x:number)=>((x%360)+360)%360;
export const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const scale=(a:Vec3,s:number):Vec3=>[a[0]*s,a[1]*s,a[2]*s];
export const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const length=(a:Vec3)=>Math.hypot(...a);
export const normalize=(a:Vec3):Vec3=>scale(a,1/length(a));
export const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const angle=(a:Vec3,b:Vec3)=>Math.atan2(length(cross(a,b)),dot(a,b));
export function validateMoon(p:MoonInput){if(!Object.values(p).every(Number.isFinite)||p.inclination<0||p.inclination>10||p.distance<56||p.distance>64)throw new RangeError('Invalid lunar orbit');}
export function moonPosition(p:MoonInput):Vec3{
 validateMoon(p);const u=radians(p.phase-p.node),n=radians(p.node),i=radians(p.inclination);
 return scale([Math.cos(n)*Math.cos(u)-Math.sin(n)*Math.sin(u)*Math.cos(i),Math.sin(u)*Math.sin(i),-Math.sin(n)*Math.cos(u)-Math.cos(n)*Math.sin(u)*Math.cos(i)],p.distance);
}
/** Inverse projected angle for dragging; at permitted inclinations it is single-valued. */
export function phaseFromPlan(x:number,z:number,p:MoonInput){const n=radians(p.node),ci=Math.cos(radians(p.inclination));const a=x*Math.cos(n)-z*Math.sin(n),b=(-x*Math.sin(n)-z*Math.cos(n))/ci;return wrap(degrees(Math.atan2(b,a))+p.node);}
export function diskOverlap(r:number,R:number,d:number){
 if(![r,R,d].every(Number.isFinite)||r<0||R<0||d<0)throw new RangeError('Invalid disks');
 if(r===0||R===0||d>=r+R)return 0;
 if(d<=Math.abs(r-R))return Math.PI*Math.min(r,R)**2;
 const a=Math.acos(clamp((d*d+r*r-R*R)/(2*d*r),-1,1)),b=Math.acos(clamp((d*d+R*R-r*r)/(2*d*R),-1,1));
 return r*r*a+R*R*b-.5*Math.sqrt(Math.max(0,(-d+r+R)*(d+r-R)*(d-r+R)*(d+r+R)));
}
/** Uniform-brightness small-angle angular disk overlap (fraction of Sun hidden). */
export function occultation(point:Vec3,blocker:Vec3,radius:number){
 const s=sub(SUN,point),o=sub(blocker,point),ds=length(s),d=length(o);
 const sunRadius=Math.asin(SUN_RADIUS/ds),blockerRadius=Math.asin(clamp(radius/d)),separation=angle(s,o);
 const coverage=d>=ds||dot(s,o)<=0?0:clamp(diskOverlap(sunRadius,blockerRadius,separation)/(Math.PI*sunRadius**2));
 return {coverage,sunRadius,blockerRadius,separation};
}
export function lunarShadow(moon:Vec3){
 const axial=-moon[0],offset=Math.hypot(moon[1],moon[2]);
 const umbra=Math.max(0,1-axial*(SUN_RADIUS-1)/SUN_DISTANCE),penumbra=1+axial*(SUN_RADIUS+1)/SUN_DISTANCE;
 const umbralFraction=axial>0?clamp(diskOverlap(MOON_RADIUS,umbra,offset)/(Math.PI*MOON_RADIUS**2)):0;
 const penumbralFraction=axial>0?clamp(diskOverlap(MOON_RADIUS,penumbra,offset)/(Math.PI*MOON_RADIUS**2)):0;
 const type=axial<=0||penumbralFraction<=1e-12?'none':umbralFraction>=1-1e-10?'total':umbralFraction>1e-12?'partial':'penumbral';
 return {type,umbra,penumbra,offset,umbralFraction,penumbralFraction} as const;
}
export function solveMoon(p:MoonInput){
 const moon=moonPosition(p),towardSun=normalize(sub(SUN,moon)),towardEarth=normalize(scale(moon,-1));
 const fraction=clamp((1+dot(towardSun,towardEarth))/2),phaseAngle=degrees(angle(towardSun,towardEarth));
 const solar=occultation(OBSERVER,moon,MOON_RADIUS);
 const solarType:'none'|'total'|'annular'|'partial'=solar.coverage<=1e-10?'none':solar.coverage>=1-1e-9?'total':solar.separation+solar.blockerRadius<=solar.sunRadius?'annular':'partial';
 const longitude=wrap(degrees(Math.atan2(-moon[2],moon[0]))),latitude=degrees(Math.asin(moon[1]/p.distance));
 const name=longitude<12||longitude>=348?'新月':longitude<78?'娥眉月':longitude<=102?'上弦月':longitude<168?'盈凸月':longitude<=192?'满月':longitude<258?'亏凸月':longitude<=282?'下弦月':'残月';
 const elongation=degrees(angle(sub(moon,OBSERVER),sub(SUN,OBSERVER)));
 const right=normalize(cross(normalize(moon),[0,1,0])),up=normalize(cross(towardEarth,right));
 return {moon,towardSun,towardEarth,right,up,fraction,phaseAngle,longitude,latitude,name,elongation,day:wrap(p.phase)/360*SYNODIC_DAYS,solar:{...solar,type:solarType},lunar:lunarShadow(moon)};
}
export type MoonResult=ReturnType<typeof solveMoon>;
export const solarNames={none:'观测点没有日食',partial:'观测点：日偏食',total:'观测点：日全食',annular:'观测点：日环食'};
export const lunarNames={none:'没有月食',penumbral:'半影月食',partial:'月偏食',total:'月全食'};
