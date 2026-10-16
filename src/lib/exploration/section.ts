export type V3 = [number, number, number];
export const dot = (a: V3, b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross = (a: V3,b: V3): V3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const normalize = (v: V3): V3 => {const l=Math.hypot(...v);if(!l||!Number.isFinite(l))throw new RangeError('Nonzero normal required');return v.map(x=>x/l) as V3;};
export const cubeVertices: V3[] = Array.from({length:8},(_,i)=>[i&1?1:-1,i&2?1:-1,i&4?1:-1]);
export const cubeEdges: [number,number][] = cubeVertices.flatMap((_,i)=>[1,2,4].filter(bit=>!(i&bit)).map(bit=>[i,i|bit] as [number,number]));
export function sectionBasis(normal: V3) {
  const n=normalize(normal),u=normalize(cross(n,Math.abs(n[2])<.9?[0,0,1]:[0,1,0])),v=cross(n,u);
  return { n,u,v };
}
export function cubeSection(normal: V3, offset: number): V3[] {
  const {n,u,v}=sectionBasis(normal),points: V3[]=[];
  const add=(p: V3)=> {if(!points.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])<1e-7))points.push(p);};
  for(const [i,j] of cubeEdges){
    const a=cubeVertices[i]!,b=cubeVertices[j]!,da=dot(n,a)-offset,db=dot(n,b)-offset;
    if(Math.abs(da)<1e-8)add([...a]);if(Math.abs(db)<1e-8)add([...b]);
    if(da*db<0){const t=da/(da-db);add(a.map((x,k)=>x+t*(b[k]!-x)) as V3);}
  }
  if(points.length<3)return [];
  const center=points.reduce((s,p)=>s.map((x,k)=>x+p[k]!/points.length) as V3,[0,0,0] as V3);
  return points.sort((a,b)=>{const ap=a.map((x,k)=>x-center[k]!) as V3,bp=b.map((x,k)=>x-center[k]!) as V3;return Math.atan2(dot(ap,v),dot(ap,u))-Math.atan2(dot(bp,v),dot(bp,u));});
}
export function project3([x,y,z]: V3) {return {x:220+100*.866*(x-y),y:200+100*(.5*x+.5*y-z)};}
