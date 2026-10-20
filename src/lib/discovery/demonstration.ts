import {clamp, type Model} from './core.ts';
/** Discrete apparatus (e.g. regular polygons) must never receive fractional counts. */
export function demonstrationValue(model:Model,value:number){
 const demo=model.demonstration;if(!demo)throw new Error('Missing demonstration');
 const c=model.controls.find(c=>c.key===demo.key)!;
 if(c.options)return c.options.reduce((closest,option)=>Math.abs(option[0]-value)<Math.abs(closest-value)?option[0]:closest,c.options[0]![0]);
 if(model.id==='C07')return clamp(value,c.min,c.max);
 return clamp(Number((c.min+Math.round((value-c.min)/c.step)*c.step).toPrecision(12)),c.min,c.max);
}
