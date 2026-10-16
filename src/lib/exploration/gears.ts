export function gearTrain(teeth:number[],inputRPM:number){
  if(teeth.length<2||teeth.some(n=>!Number.isInteger(n)||n<4)||!Number.isFinite(inputRPM))throw new RangeError('At least two gears with integer teeth required');
  const speeds=[inputRPM];for(let i=1;i<teeth.length;i++)speeds.push(-speeds[i-1]!*teeth[i-1]!/teeth[i]!);
  return {speeds,speedRatio:teeth[0]!/teeth.at(-1)!,torqueRatio:teeth.at(-1)!/teeth[0]!};
}
export function gearOutline(teeth:number,radius:number){
  const points:string[]=[];
  for(let i=0;i<teeth;i++)for(const [fraction,depth] of [[0,.94],[.2,1.055],[.55,1.055],[.75,.94]] as const){const a=2*Math.PI*(i+fraction)/teeth;points.push(`${(Math.cos(a)*radius*depth).toFixed(3)},${(Math.sin(a)*radius*depth).toFixed(3)}`);}
  return points.join(' ');
}
