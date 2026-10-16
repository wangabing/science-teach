export interface Node {x:number;y:number}
export type Member=[number,number];
export const bridgeNodes:Node[]=[{x:0,y:0},{x:2,y:0},{x:4,y:0},{x:0,y:1.6},{x:2,y:1.6},{x:4,y:1.6}];
export const bareMembers:Member[]=[[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]];
export const trussMembers:Member[]=[...bareMembers,[0,4],[2,4]];
export const AXIAL_STIFFNESS=200000; // EA, kN
export type BridgeResult={stable:false;length:number}|{stable:true;length:number;displacements:Node[];forces:number[];reactions:number[]};
function solve(matrix:number[][],rhs:number[]):number[]|null{
  const a=matrix.map((row,i)=>[...row,rhs[i]!]),n=a.length;
  const tolerance=Math.max(...matrix.flat().map(Math.abs))*1e-10;
  for(let k=0;k<n;k++){
    let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(a[i]![k]!)>Math.abs(a[pivot]![k]!))pivot=i;
    if(Math.abs(a[pivot]![k]!)<=tolerance)return null;
    [a[k],a[pivot]]=[a[pivot]!,a[k]!];
    for(let i=k+1;i<n;i++){const f=a[i]![k]!/a[k]![k]!;for(let j=k;j<=n;j++)a[i]![j]=a[i]![j]!-f*a[k]![j]!;}
  }
  const x=Array(n).fill(0) as number[];
  for(let i=n-1;i>=0;i--){let s=a[i]![n]!;for(let j=i+1;j<n;j++)s-=a[i]![j]!*x[j]!;x[i]=s/a[i]![i]!;}
  return x;
}
export function solveBridge(members:Member[],load:number,loadNode=1):BridgeResult {
  const nodes=bridgeNodes,n=nodes.length*2,k=Array.from({length:n},()=>Array(n).fill(0) as number[]),f=Array(n).fill(0) as number[];
  let total=0;
  for(const [i,j] of members){
    const a=nodes[i]!,b=nodes[j]!,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);total+=l;
    const c=dx/l,s=dy/l,v=[-c,-s,c,s],ids=[2*i,2*i+1,2*j,2*j+1];
    for(let r=0;r<4;r++)for(let col=0;col<4;col++)k[ids[r]!]![ids[col]!]+=AXIAL_STIFFNESS/l*v[r]!*v[col]!;
  }
  f[loadNode*2+1]=-load;
  const fixed=[0,1,5],free=Array.from({length:n},(_,i)=>i).filter(i=>!fixed.includes(i));
  const uFree=solve(free.map(i=>free.map(j=>k[i]![j]!)),free.map(i=>f[i]!));
  if(!uFree)return {stable:false,length:total};
  const u=Array(n).fill(0) as number[];free.forEach((i,j)=>u[i]=uFree[j]!);
  const forces=members.map(([i,j])=>{const a=nodes[i]!,b=nodes[j]!,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);return AXIAL_STIFFNESS/l*((u[2*j]!-u[2*i]!)*dx/l+(u[2*j+1]!-u[2*i+1]!)*dy/l);});
  return {stable:true,length:total,displacements:nodes.map((_,i)=>({x:u[2*i]!,y:u[2*i+1]!})),forces,reactions:k.map((row,i)=>row.reduce((s,x,j)=>s+x*u[j]!,0)-f[i]!)};
}
