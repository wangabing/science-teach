import { launchOrbit,stepOrbit,orbitEnergy,EARTH_RADIUS,LAUNCH_RADIUS,circularSpeed,escapeSpeed,type OrbitState } from '../../lib/exploration/orbit';
import { el,text,value,bindRange,clock } from './ui';
import { orbitalElements } from '../../lib/exploration/measurements';
import { bars,history,sample,type Sample } from './evidence';
let state: OrbitState=launchOrbit(value('speed'),value('angle')),trail:[number,number][]=[];
let completed=false,demoMode=false;let readings:Sample[]=[];
const animator=clock(step,render);
function tick(){
  if(completed){animator.pause();return;}
  for(let i=0;i<5;i++) {state=stepOrbit(state,3);if(state.status==='collision'||state.status==='escaped'){completed=true;animator.pause();break;}}
  sample(readings,state.time/60,[Math.hypot(state.x,state.y)]);
  trail.push([state.x,state.y]);if(trail.length>1800)trail.shift();
  if(completed)text('orbit-feedback',state.status==='collision'?'撞到地球表面，观察已停止。试着增加切向速度，或改变发射方向。':'卫星已向外飞出观察范围，能量非负，具备逃逸条件。重置后试试更小的速度。');
  else if(state.time>=7200&&orbitEnergy(state)<0)text('orbit-feedback','已观察超过 2 小时，卫星仍在飞行且能量为负。继续看看它能否绕回出发位置。');
}
function step(){
  const frames=animator.isRunning()?Number(el<HTMLSelectElement>('time-rate').value):1;
  for(let k=0;k<frames&&!completed;k++)tick();
  if(demoMode){
    const ideal=orbitalElements(launchOrbit(value('speed'),value('angle')));
    text('demo-stage',`标准演示：已运行 ${(state.time/60).toFixed(1)} 分钟。${ideal.eccentricity<.01?'观察：圆轨道的半径和速率近乎不变。':'观察：向远地点移动时速度减小，动能下降、势能上升。'}`);
    if(state.time>=ideal.period){animator.pause();demoMode=false;text('demo-stage','一圈演示完成，已暂停。对照半径曲线，再切换另一种轨道。');}
  }
}
function render(){
  el<HTMLButtonElement>('run').disabled=completed;el<HTMLButtonElement>('step').disabled=completed;
  const radius=Math.hypot(state.x,state.y),extent=Math.max(20000,radius*1.25),scale=260/extent;
  const p=(x:number,y:number)=>({x:340+x*scale,y:280-y*scale});
  const sat=p(state.x,state.y);
  el('earth').setAttribute('r',String(EARTH_RADIUS*scale));el('earth-land').setAttribute('transform',`translate(340 280) scale(${EARTH_RADIUS*scale/89}) translate(-340 -280)`);
  el('launch-circle').setAttribute('r',String(LAUNCH_RADIUS*scale));
  el('orbit-grid').innerHTML=[.25,.5,.75,1].map(f=>`<circle cx="340" cy="280" r="${260*f}" fill="none" stroke="#d1dfef" stroke-width="1"/>`).join('')+'<path d="M20 280H660M340 20V540" stroke="#d1dfef"/>';
  el('satellite').setAttribute('cx',String(sat.x));el('satellite').setAttribute('cy',String(sat.y));
  el('orbit-trail').setAttribute('d',trail.map(([x,y],i)=>{const q=p(x,y);return `${i?'L':'M'}${q.x.toFixed(2)},${q.y.toFixed(2)}`;}).join(' '));
  const launch=p(LAUNCH_RADIUS,0),a=value('angle')*Math.PI/180,len=value('speed')*6;
  const arrow=el('velocity-arrow');arrow.setAttribute('x1',String(launch.x));arrow.setAttribute('y1',String(launch.y));arrow.setAttribute('x2',String(launch.x+len*Math.sin(a)));arrow.setAttribute('y2',String(launch.y-len*Math.cos(a)));arrow.setAttribute('opacity',state.time===0?'1':'.3');
  const v=Math.hypot(state.vx,state.vy),vx=state.vx/(v||1),vy=state.vy/(v||1);
  const vector=(dx:number,dy:number,length:number,color:string)=>{const tx=sat.x+dx*length,ty=sat.y-dy*length;return `<path d="M${sat.x} ${sat.y}L${tx} ${ty}l${-dx*9-dy*5} ${dy*9-dx*5}M${tx} ${ty}l${-dx*9+dy*5} ${dy*9+dx*5}" fill="none" stroke="${color}" stroke-width="2.5"/>`;};
  el('orbit-vectors').innerHTML=vector(vx,vy,Math.min(85,v*7),'#188d83')+vector(-state.x/radius,-state.y/radius,50,'#cd6543');
  const analysis=orbitalElements(state);
  text('orbit-live-formula',`${v.toFixed(2)}²/2 − 398600.44/${radius.toFixed(0)} = ${analysis.kinetic.toFixed(2)} + (${analysis.potential.toFixed(2)}) = ${analysis.energy.toFixed(2)} km²/s²`);
  bars('orbit-energy-bars',[{label:'动能 / 质量（正）',value:analysis.kinetic,color:'#188d83'},{label:'势能 / 质量（负）',value:analysis.potential,color:'#b97529'},{label:'总能量 / 质量',value:analysis.energy,color:'#6757ad'}],undefined,'km²/s²');
  history('orbit-history',readings,['距地心'],'km');text('orbit-eccentricity',analysis.eccentricity.toFixed(3));text('orbit-gravity',`${analysis.gravity.toFixed(2)} m/s²`);
  text('orbit-apsides',`近地点 / 远地点高度：${(analysis.periapsis-EARTH_RADIUS).toFixed(0)} / ${Number.isFinite(analysis.apoapsis)?(analysis.apoapsis-EARTH_RADIUS).toFixed(0):'无穷远'} km`);
  text('orbit-period',Number.isFinite(analysis.period)?`二体理想周期：${(analysis.period/60).toFixed(1)} min`:'当前是开放轨道，没有完整绕行周期。');
  text('orbit-analysis',analysis.surfaceCrossing?'理想轨道会穿过地球表面：即使总能量为负，也不意味着安全绕行。':analysis.energy>=0?'总能量非负，具备逃逸条件。观察轨迹是否持续远离。':analysis.eccentricity<.01?'接近圆轨道：动能、势能和距地心几乎不变。':'椭圆轨道：远离地球时变慢，靠近时变快。总能量仍近似守恒。');
  text('orbit-scale' ,`VIEW ±${Math.round(extent)} km`);text('orbit-time',`${(state.time/60).toFixed(1)} min`);text('orbit-radius',`${radius.toFixed(0)} km`);text('orbit-speed',`${Math.hypot(state.vx,state.vy).toFixed(2)} km/s`);text('orbit-energy',`${orbitEnergy(state).toFixed(2)} km²/s²`);
}
function reset(){animator.pause();demoMode=false;completed=false;state=launchOrbit(value('speed'),value('angle'));trail=[[state.x,state.y]];readings=[{time:0,values:[LAUNCH_RADIUS]}];text('demo-stage','已准备好发射。手动修改后按“开始 / 继续”，或选择标准演示。');text('speed-value',`${value('speed').toFixed(2)} km/s`);text('angle-value',`${value('angle')}°`);text('orbit-feedback','准备好了。先预测，再发射；修改参数会清除上次轨迹。');render();}
function preset(speed:number){el<HTMLInputElement>('speed').value=speed.toFixed(2);el<HTMLInputElement>('angle').value='0';reset();}
el('fall').addEventListener('click',()=>preset(3));el('circular').addEventListener('click',()=>preset(circularSpeed));el('escape').addEventListener('click',()=>preset(11));
el('elliptical').addEventListener('click',()=>preset(8));
el('reset').addEventListener('click',()=>{el<HTMLSelectElement>('time-rate').value='1';preset(circularSpeed);});bindRange('speed',reset);bindRange('angle',reset);
text('orbit-reference',`圆轨道参考 ${circularSpeed.toFixed(2)} km/s · 逃逸参考 ${escapeSpeed.toFixed(2)} km/s`);reset();

function demonstrate(speed:number){preset(speed);el<HTMLSelectElement>('time-rate').value='4';demoMode=true;text('demo-stage','标准演示已开始：观察卫星旁的速度和引力，再看下方半径曲线。');animator.start();}
el('demo').addEventListener('click',()=>demonstrate(circularSpeed));el('demo-ellipse').addEventListener('click',()=>demonstrate(8));
el('demo-pause').addEventListener('click',()=>{animator.pause();text('demo-stage','已暂停，可以读公式与图表；“开始 / 继续”从此刻继续。');});
el('time-rate').addEventListener('change',()=>{demoMode=false;text('demo-stage','观察速度已改变，积分步长仍为 3 秒。');});
