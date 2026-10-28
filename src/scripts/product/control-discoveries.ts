import {setupDiscoveries,type DiscoveryAdapter} from './discoveries';
import {numericState,type DiscoveryState,type NumericRule} from '../../lib/product/discoveries';
// Explicit per-experiment allowlist; never collect unrelated page controls.
export function setupControlDiscoveries(slug:string,ids:string[],restore:(conditions:DiscoveryState)=>void,describe:(conditions:DiscoveryState)=>string,extra?:{read:()=>DiscoveryState;rules:Record<string,NumericRule>;labels?:Record<string,string>;check?:(value:DiscoveryState)=>boolean}){
 const controls=ids.map(id=>{const el=document.getElementById(id) as HTMLInputElement|HTMLSelectElement;const label=el.labels?.[0]?.textContent?.replace(/\s+/g,' ').trim()??id;return {id,el,label};});
 const rules=Object.fromEntries(controls.map(({id,el})=>[id,el instanceof HTMLSelectElement?{min:Math.min(...[...el.options].map(o=>Number(o.value))),max:Math.max(...[...el.options].map(o=>Number(o.value))),options:[...el.options].map(o=>Number(o.value))}:{min:Number(el.min),max:Number(el.max)}]));
 const adapter:DiscoveryAdapter={slug,snapshot:()=>({...Object.fromEntries(controls.map(({id,el})=>[id,Number(el.value)])),...extra?.read()}),validate:(value):value is DiscoveryState=>numericState({...rules,...extra?.rules},value)&&(!extra?.check||extra.check(value)),labels:{...Object.fromEntries(controls.map(c=>[c.id,c.label])),...extra?.labels},describe,
 restore:conditions=>{for(const {id,el} of controls)el.value=String(conditions[id]);restore(conditions);}};
 setupDiscoveries(adapter);
}
