import {solveMoon, type MoonInput} from './moon.ts';
export class MoonNodeTask {
 active=false; adjusted=false; reason='先准备独立交点任务，再检验。';
 prepare(){this.active=true;this.adjusted=false;this.reason='满月仍在：只转交点方向，找到地球影子。';}
 example(){this.active=false;this.adjusted=false;this.reason='这是示例，不计独立观察。重新准备交点任务后自己调整。';}
 change(p:MoonInput,field:string){
  if(!this.active)return;
  if(Math.abs(p.phase-180)>.0001||Math.abs(p.inclination-5.145)>.0001||Math.abs(p.distance-60.27)>.0001){this.active=false;this.adjusted=false;this.reason='固定条件已改变：满月位置需为180°、倾角5.145°、距离60.27 R⊕。请重新准备任务。';return;}
  if(field==='moon-node')this.adjusted=true;
 }
 feedback(p:MoonInput){
  if(!this.active)return this.reason;
  const r=solveMoon(p);
  return this.adjusted&&r.lunar.type==='total'?'通过！你只转动交点，就让满月进入本影。受光比例仍近100%，本影覆盖改变；解释为什么满月并非每次都有月食。':`满月保持不变，本影覆盖 ${(r.lunar.umbralFraction*100).toFixed(1)}%。只转交点方向，让月盘靠近影轴。`;
 }
}
