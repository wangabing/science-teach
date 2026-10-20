/** Ideal thin convex lens; all lengths are in centimetres, positive object distance to the left. */
export interface LensInput { focal:number; object:number; screen:number; height:number }
export type LensRegime='reduced'|'equal'|'enlarged'|'focus'|'virtual';
export function validateLens(p:LensInput){
  for(const v of [p.focal,p.object,p.screen,p.height])if(!Number.isFinite(v)||v<=0)throw new RangeError('Lens lengths must be positive and finite');
}
export function rayHeights(p:LensInput,x:number):[number,number]{
  validateLens(p);if(!Number.isFinite(x))throw new RangeError('Ray position must be finite');
  return [p.height*(1-x/p.focal),-p.height*x/p.object];
}
export function solveLens(p:LensInput){
  validateLens(p);
  const atFocus=Math.abs(p.object-p.focal)<=1e-10*Math.max(p.object,p.focal);
  const image=atFocus?null:p.focal*p.object/(p.object-p.focal);
  const magnification=image===null?null:-image/p.object;
  const real=image!==null&&image>0;
  const regime:LensRegime=atFocus?'focus':!real?'virtual':Math.abs(p.object-2*p.focal)<1e-9?'equal':p.object>2*p.focal?'reduced':'enlarged';
  const screenHeights=rayHeights(p,p.screen),separation=Math.abs(screenHeights[0]-screenHeights[1]);
  return {image,magnification,imageHeight:magnification===null?null:magnification*p.height,real,regime,screenHeights,separation,focused:real&&separation/p.height<=.04};
}
