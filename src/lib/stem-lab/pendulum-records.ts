import type { PendulumParams } from './pendulum';
export interface PendulumRecord { params: PendulumParams; start: number; end: number; period: number }
const fields: [keyof PendulumParams,string,string][]=[['length','摆长','m'],['mass','质量','kg'],['gravity','重力加速度','m/s²'],['angle','释放角','°'],['damping','阻尼','s⁻¹']];
export function comparePendulum(a:PendulumRecord,b:PendulumRecord){
 const changed=fields.filter(([k])=>a.params[k]!==b.params[k]);
 const fixed=fields.filter(([k])=>a.params[k]===b.params[k]);
 return `固定：${fixed.map(([k,n,u])=>`${n} ${a.params[k]} ${u}`).join('、')||'无'}。改变：${changed.map(([k,n,u])=>`${n} ${a.params[k]}→${b.params[k]} ${u}`).join('、')||'无'}。周期 ${a.period.toFixed(3)}→${b.period.toFixed(3)} s。${changed.length===1?'只改变一个量，可在这些条件下比较。':changed.length>1?'同时改变多个量，不能归因于单一变量。':'条件相同，可检验重复测量。'}`;
}
