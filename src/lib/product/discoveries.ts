export type DiscoveryState=Record<string,unknown>;
export interface PersonalDiscovery {conditions:DiscoveryState;prediction:string;explanation:string}
export const DISCOVERY_SCHEMA=1,DISCOVERY_MODEL=1;
export const discoveryKey=(slug:string)=>`science-teach:discoveries:${slug}:v1`;
export function decodeDiscoveries(raw:string,slug:string,validate:(value:unknown)=>value is DiscoveryState):PersonalDiscovery[]{
 if(raw.length>50000)throw new Error('记录过大');
 const data:unknown=JSON.parse(raw);
 if(!data||typeof data!=='object')throw new Error('记录格式无效');
 const value=data as Record<string,unknown>;
 if(value.schemaVersion!==DISCOVERY_SCHEMA||value.modelVersion!==DISCOVERY_MODEL||value.slug!==slug||!Array.isArray(value.records)||value.records.length>2)throw new Error('版本或实验不匹配');
 return value.records.map((record:unknown)=>{
  if(!record||typeof record!=='object')throw new Error('记录无效');
  const r=record as Record<string,unknown>;
  if(!validate(r.conditions)||typeof r.prediction!=='string'||r.prediction.length>1000||typeof r.explanation!=='string'||r.explanation.length>2000)throw new Error('条件或文字无效');
  return {conditions:structuredClone(r.conditions),prediction:r.prediction,explanation:r.explanation};
 });
}
export function encodeDiscoveries(slug:string,records:PersonalDiscovery[]){return JSON.stringify({schemaVersion:DISCOVERY_SCHEMA,modelVersion:DISCOVERY_MODEL,slug,records});}
export interface NumericRule {min:number;max:number;step?:number;options?:number[]}
export function numericState(rules:Record<string,NumericRule>,value:unknown):value is DiscoveryState {
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const state=value as Record<string,unknown>;
 return Object.keys(state).length===Object.keys(rules).length&&Object.entries(rules).every(([key,r])=>{
  const n=state[key];return typeof n==='number'&&Number.isFinite(n)&&n>=r.min&&n<=r.max&&(!r.options||r.options.includes(n))&&(!r.step||Math.abs((n-r.min)/r.step-Math.round((n-r.min)/r.step))<1e-5);
 });
}
export function compareConditions(a:DiscoveryState,b:DiscoveryState,labels:Record<string,string>={}){
 const changed=Object.keys(a).filter(key=>JSON.stringify(a[key])!==JSON.stringify(b[key]));
 const fixed=Object.keys(a).filter(key=>!changed.includes(key));
 const show=(value:unknown)=>value&&typeof value==='object'?JSON.stringify(value):String(value);
 return `固定：${fixed.map(k=>labels[k]??k).join('、')||'无'}。变化：${changed.map(k=>`${labels[k]??k} ${show(a[k])} → ${show(b[k])}`).join('；')||'条件相同'}。${changed.length>1?'多个条件不同，不能只归因于一个变量。':'这些是本次条件的比较，一般结论仍需说明边界。'}`;
}
