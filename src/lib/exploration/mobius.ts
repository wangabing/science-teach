export type HalfTwists=0|1|2;
export const stripWidth=.65;
export function topology(n:HalfTwists){
 if(![0,1,2].includes(n))throw new RangeError('Choose 0, 1 or 2 half twists');
 const odd=n%2===1;
 return {sides:odd?1:2,boundaries:odd?1:2,circuits:odd?2:1,cutComponents:odd?1:2,linked:n===2};
}
export function stripPoint(n:HalfTwists,t:number,v:number):[number,number,number]{
 topology(n);if(!Number.isFinite(t)||!Number.isFinite(v))throw new RangeError('Finite coordinates required');
 const radius=2+v*Math.cos(n*t/2);
 return [radius*Math.cos(t),v*Math.sin(n*t/2),radius*Math.sin(t)];
}
/** Each interval is a complete connected component, including its seam. */
export function cutBands(n:HalfTwists){
 const odd=topology(n).cutComponents===1;
 return odd?[{turn:4*Math.PI,min:.09,max:stripWidth}]:[{turn:2*Math.PI,min:.09,max:stripWidth},{turn:2*Math.PI,min:-stripWidth,max:-.09}];
}
export function tracePoint(n:HalfTwists,progress:number,edge=false){
 if(!Number.isFinite(progress))throw new RangeError('Finite progress required');
 const t=Math.max(0,Math.min(1,progress))*topology(n).circuits*2*Math.PI;
 return stripPoint(n,t,edge?stripWidth:stripWidth*.55);
}
/** Local normal follows the chosen side; for odd twists it reverses after one circuit. */
export function stripNormal(n:HalfTwists,t:number,v:number):[number,number,number]{
 topology(n);if(!Number.isFinite(t)||!Number.isFinite(v))throw new RangeError('Finite coordinates required');
 const c=Math.cos(n*t/2),s=Math.sin(n*t/2),r=2+v*c;
 const a=[-r*Math.sin(t)-v*n/2*s*Math.cos(t),v*n/2*c,r*Math.cos(t)-v*n/2*s*Math.sin(t)];
 const b=[c*Math.cos(t),s,c*Math.sin(t)];
 const cross=[a[1]!*b[2]!-a[2]!*b[1]!,a[2]!*b[0]!-a[0]!*b[2]!,a[0]!*b[1]!-a[1]!*b[0]!];const length=Math.hypot(...cross);
 return cross.map(x=>x/length) as [number,number,number];
}

/** Widen the completed slit for legibility; the rest still connects across the center. */
export function cutSegments(n:HalfTwists,progress:number){
 topology(n);if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Cut progress must be within 0..1');
 if(progress===1)return cutBands(n).map((b,component)=>({...b,start:0,end:b.turn,component}));
 const end=2*Math.PI*progress;
 return [
  ...(progress>0?[{start:0,end,min:.09,max:stripWidth,component:0,turn:end},{start:0,end,min:-stripWidth,max:-.09,component:0,turn:end}]:[]),
  {start:end,end:2*Math.PI,min:-stripWidth,max:stripWidth,component:0,turn:2*Math.PI-end},
 ];
}
/** A path belongs to one complete band, never to a color patch in a projection. */
export function paperRoute(n:HalfTwists,cut=false,component=0,edge=false,newEdge=false){
 const t=topology(n);
 if(!Number.isInteger(component)||component<0||component>=(cut?t.cutComponents:1))throw new RangeError('Unknown paper component');
 if(!cut)return {turn:t.circuits*2*Math.PI,v:edge?stripWidth:stripWidth*.55};
 const band=cutBands(n)[component]!;
 const outer=Math.abs(band.min)>Math.abs(band.max)?band.min:band.max,inner=outer===band.min?band.max:band.min;
 return {turn:band.turn,v:edge?(newEdge?inner:outer):(band.min+band.max)/2};
}
export function componentTracePoint(n:HalfTwists,progress:number,component=0,edge=false,newEdge=false){
 if(!Number.isFinite(progress))throw new RangeError('Finite progress required');
 const route=paperRoute(n,true,component,edge,newEdge);
 return stripPoint(n,Math.max(0,Math.min(1,progress))*route.turn,route.v);
}
