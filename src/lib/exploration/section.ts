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
export interface SectionVertex { point: V3; edges: number[] }
export function cubeSectionEvidence(normal: V3, offset: number) {
  const {n,u,v}=sectionBasis(normal),vertices: SectionVertex[]=[],coplanarEdges: number[]=[];
  const add=(point: V3,edge: number)=>{
    const old=vertices.find(q=>Math.hypot(...point.map((x,k)=>x-q.point[k]!))<1e-7);
    if(old){if(!old.edges.includes(edge))old.edges.push(edge);}else vertices.push({point,edges:[edge]});
  };
  cubeEdges.forEach(([i,j],edge)=>{
    const a=cubeVertices[i]!,b=cubeVertices[j]!,da=dot(n,a)-offset,db=dot(n,b)-offset;
    const onA=Math.abs(da)<1e-8,onB=Math.abs(db)<1e-8;
    if(onA)add([...a],edge);if(onB)add([...b],edge);
    if(onA&&onB)coplanarEdges.push(edge);
    if(!onA&&!onB&&da*db<0){const t=da/(da-db);add(a.map((x,k)=>x+t*(b[k]!-x)) as V3,edge);}
  });
  const kind=vertices.length===0?'none':vertices.length===1?'point':vertices.length===2?'line':'polygon';
  if(kind==='polygon'){
    const center=vertices.reduce((s,p)=>s.map((x,k)=>x+p.point[k]!/vertices.length) as V3,[0,0,0] as V3);
    const angle=(p:V3)=>{const q=p.map((x,k)=>x-center[k]!) as V3;return Math.atan2(dot(q,v),dot(q,u));};
    vertices.sort((a,b)=>angle(a.point)-angle(b.point));
  }
  return {vertices,coplanarEdges,kind};
}
export function cubeSection(normal: V3, offset: number): V3[] {
  const r=cubeSectionEvidence(normal,offset);
  return r.kind==='polygon'?r.vertices.map(v=>v.point):[];
}
export function project3([x,y,z]: V3) {return {x:220+100*.866*(x-y),y:200+100*(.5*x+.5*y-z)};}
