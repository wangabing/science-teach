import type {DiscoveryState} from './discoveries.ts';
export function exactObject(value:unknown,keys:string[]):value is DiscoveryState {
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
}
export function sameShape(template:unknown,value:unknown):boolean {
 if(typeof template==='number')return typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=1e12;
 if(typeof template==='boolean')return typeof value==='boolean';
 if(typeof template==='string')return typeof value==='string'&&value.length<=64;
 if(Array.isArray(template))return Array.isArray(value)&&value.length===template.length&&template.every((v,i)=>sameShape(v,value[i]));
 if(template&&typeof template==='object')return exactObject(value,Object.keys(template))&&Object.entries(template).every(([key,v])=>sameShape(v,value[key]));
 return template===value;
}
export function checkedState<T extends object>(template:T,check:(value:T)=>unknown){
 return (value:unknown):value is T&DiscoveryState=>{try{if(!sameShape(template,value))return false;check(value as T);return true;}catch{return false;}};
}
