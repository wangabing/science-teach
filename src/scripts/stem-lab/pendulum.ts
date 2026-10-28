import {setupControlDiscoveries} from '../product/control-discoveries';
import { Pendulum, DEFAULT_PENDULUM, theoreticalPeriod, STEP, type PendulumParams } from '../../lib/stem-lab/pendulum';
import { comparePendulum, type PendulumRecord } from '../../lib/stem-lab/pendulum-records';
import { createPendulumScene } from './pendulum-scene';

const node = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => node<HTMLInputElement>(id);
const viewport = node('apparatus');
const main = new Pendulum(), reference = new Pendulum();
let scene: ReturnType<typeof createPendulumScene> | undefined;
let running = false, raf = 0, lastTime = 0, accumulator = 0, disposed = false;
let history: { time: number; potential: number; kinetic: number; mechanical: number; x: number; y: number }[] = [];
let sampleTime = -1, lastUI = 0;
const records: PendulumRecord[] = [];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
node('motion-note').hidden = !motion.matches;
const opts = () => ({ trail: input('trail').checked, forces: input('forces').checked, compare: input('compare').checked });
function params(): PendulumParams {
  return { length: Number(input('length').value), mass: Number(input('mass').value), angle: Number(input('angle').value), gravity: Number(node<HTMLSelectElement>('gravity').value), damping: Number(input('damping').value) };
}
function stop() {
  running = false; cancelAnimationFrame(raf); raf = 0; accumulator = 0;
  node('toggle').textContent = main.time ? '继续' : '开始'; node('toggle').setAttribute('aria-pressed', 'false');
  node<HTMLButtonElement>('step').disabled = false; document.body.classList.remove('running');
  node('status').textContent = main.time ? '已暂停' : '待释放';
}
function start() {
  if (disposed || running) return;
  running = true; node('toggle').textContent = '暂停'; node('toggle').setAttribute('aria-pressed', 'true');
  node<HTMLButtonElement>('step').disabled = true; document.body.classList.add('running'); node('status').textContent = '摆动中';
  lastTime = performance.now(); raf = requestAnimationFrame(tick);
}
function resetExperiment() {
  stop(); main.reset(params()); reference.reset(DEFAULT_PENDULUM); history = []; sampleTime = -1; accumulator = 0; update(true);
}
function release() { resetExperiment(); start(); }
function simulate(seconds: number) {
  accumulator += seconds;
  while (accumulator >= STEP) { main.step(); reference.step(); accumulator -= STEP; sample(); }
}
function sample() {
  if (main.time - sampleTime >= .04) {
    history.push({ time: main.time, ...main.readings }); if (history.length > 305) history.shift(); sampleTime = main.time;
  }
}
function tick(time: number) {
  if (!running || disposed) return;
  simulate(Math.min(.05, (time - lastTime) / 1000) * (input('slow').checked ? .25 : 1)); lastTime = time;
  update(time - lastUI >= 50); if (time - lastUI >= 50) lastUI = time;
  raf = requestAnimationFrame(tick);
}
function update(full = true) {
  const r = main.readings, p = main.params;
  scene?.update(main, reference, opts());
  {
    const scale = 102, x = 330 + r.x * scale, y = 100 - r.y * scale;
    node('fallback-rope').setAttribute('x2', String(x)); node('fallback-rope').setAttribute('y2', String(y));
    node('fallback-bob').setAttribute('cx', String(x)); node('fallback-bob').setAttribute('cy', String(y)); node('fallback-bob').setAttribute('r', String(18 * Math.cbrt(p.mass)));
    node('fallback-reference').setAttribute('visibility', opts().compare ? 'visible' : 'hidden');
    const rr = reference.readings;
    node('fallback-reference-rope').setAttribute('d', `M330 100L${330 + rr.x * scale} ${100 - rr.y * scale}`);
    node('fallback-reference-bob').setAttribute('cx', String(330 + rr.x * scale)); node('fallback-reference-bob').setAttribute('cy', String(100 - rr.y * scale));
    const forceScale = Math.min(4, 110 / Math.max(r.weight, r.tension));
    node('fallback-gravity')?.setAttribute('d', `M${x - 12} ${y}v${r.weight * forceScale}`);
    node('fallback-tension')?.setAttribute('d', `M${x + 12} ${y}l${-Math.sin(main.theta) * r.tension * forceScale} ${-Math.cos(main.theta) * r.tension * forceScale}`);
    node('fallback-forces')?.setAttribute('visibility', opts().forces ? 'visible' : 'hidden');
    node('fallback-trail')?.setAttribute('d', history.slice(-200).map((v, i) => `${i ? 'L' : 'M'}${330 + v.x * scale} ${100 - v.y * scale}`).join(' '));
    node('fallback-trail')?.setAttribute('visibility', opts().trail ? 'visible' : 'hidden');
    // Reference arc follows the current string length instead of a fixed illustration.
    node('fallback-arc').setAttribute('d', Array.from({ length: 71 }, (_, i) => {
      const a = (-70 + i * 2) * Math.PI / 180;
      return `${i ? 'L' : 'M'}${330 + p.length * Math.sin(a) * scale} ${100 + p.length * Math.cos(a) * scale}`;
    }).join(' '));
  }
  viewport.dataset.time = String(main.time); viewport.dataset.angle = String(r.angle);
  if (!full) return;
  document.querySelectorAll<HTMLElement>('[data-value]').forEach((el) => {
    const key = el.dataset.value!; const value = key === 'time' ? main.time : r[key as keyof typeof r]; el.textContent = value.toFixed(2);
  });
  for (const key of ['potential', 'kinetic', 'dissipated'] as const) node(`${key}-bar`).style.width = `${main.initialEnergy ? Math.min(100, r[key] / main.initialEnergy * 100) : 0}%`;
  node('length-output').textContent = `${p.length.toFixed(2)} m`; node('angle-output').textContent = `${p.angle.toFixed(0)}°`;
  node('mass-output').textContent = `${p.mass.toFixed(1)} kg`; node('damping-output').textContent = `${p.damping.toFixed(2)} s⁻¹`;
  node('theory-period').textContent = `${theoreticalPeriod(p).toFixed(2)} s`; node('small-period').textContent = `${(2 * Math.PI * Math.sqrt(p.length / p.gravity)).toFixed(2)} s`;
  node('measured-period').textContent = main.measuredPeriod?.toFixed(2) ?? '—';
  node('period-note').textContent = main.measuredPeriod ? `已测 ${main.cycles} 个完整周期${p.damping ? ' · 理论值为无阻尼参考' : ' · 同向过零计时'}` : '释放后，经过两次同向过零自动测量。';
  const endpoints=main.periodEndpoints;
  node('period-endpoints').textContent=endpoints?`同向过零：t₁=${endpoints.start.toFixed(3)} s → t₂=${endpoints.end.toFixed(3)} s；T=${(endpoints.end-endpoints.start).toFixed(3)} s。方向：正角 → 负角。`:main.lastCrossing!==null?`起点 t₁=${main.lastCrossing.toFixed(3)} s，等待下一次正角 → 负角过零；反向经过不结束计时。`:'等待起点：释放后，摆球从正角向负角经过最低处开始计时。';
  node('cycle-start').classList.toggle('reached',main.lastCrossing!==null);
  node('cycle-end').classList.toggle('reached',endpoints!==null);
  node<HTMLButtonElement>('save-period').disabled=!endpoints;
  node('energy-state').textContent = p.damping ? '有阻尼 · 机械能转化为内能' : '无阻尼 · 总量不变';
  node('potential-formula').textContent = `${p.mass.toFixed(1)} × ${p.gravity} × ${r.height.toFixed(3)} = ${r.potential.toFixed(2)} J`;
  node('kinetic-formula').textContent = `½ × ${p.mass.toFixed(1)} × ${r.speed.toFixed(2)}² = ${r.kinetic.toFixed(2)} J`;
  node('tension-formula').textContent = `${r.tension.toFixed(2)} N`;
  const atBottom = Math.abs(r.angle) < 7;
  const atTop = main.initialEnergy > 0 && r.kinetic / Math.max(r.mechanical, .00001) < .08;
  if (main.time === 0) {
    node('phase').textContent = '静止 · 等待释放'; node('insight-title').textContent = '高度储存了能量。';
    node('insight-copy').textContent = p.angle === 0 ? '摆球在最低处静止。给它一个非零角度，释放后才能开始摆动。' : '摆球静止在高处，能量以重力势能储存。松手后，重力的切向分量让它沿圆弧加速。';
  } else if (atBottom) {
    node('phase').textContent = '经过最低处 · 速率最大'; node('insight-title').textContent = '高度变成了速度。';
    node('insight-copy').textContent = '最低处势能最小、动能最大。绳子还要提供转弯所需的向心加速度，因此张力大于重力；它不是简单的「拉力 = 重力」。';
  } else if (atTop) {
    node('phase').textContent = '接近端点 · 准备折返'; node('insight-title').textContent = '速度又变回了高度。';
    node('insight-copy').textContent = '摆球接近最高处，速率接近零，能量主要以势能存在。重力的切向分量会让它再次返回最低处。';
  } else {
    const down = main.theta * main.omega < 0;
    node('phase').textContent = down ? '向下摆动 · 加速' : '向上摆动 · 减速'; node('insight-title').textContent = down ? '势能正在交给动能。' : '动能正在交还势能。';
    node('insight-copy').textContent = p.damping ? '两种能量仍在交换，但阻尼持续把机械能转化为内能。注意灰色总能量曲线下降，下一次最高点也会更低。' : '观察两条能量曲线：一条上升，另一条下降，而灰色机械能线保持水平。这是能量守恒在运动中的样子。';
  }
  node('reference-label').hidden = node('reference-note').hidden = !opts().compare;
  node('force-key').hidden = !opts().forces;
  sample(); drawChart();
}
function drawChart() {
  const max = Math.max(main.initialEnergy, .01), start = Math.max(0, main.time - 12), end = start + 12;
  const x = (time: number) => 42 + (time - start) / 12 * 644;
  const y = (energy: number) => 156 - energy / max * 130;
  const points = history.filter((v) => v.time >= start);
  for (const [key, id] of [['potential', 'potential-path'], ['kinetic', 'kinetic-path'], ['mechanical', 'total-path']] as const) {
    node(id).setAttribute('d', points.map((v, i) => `${i ? 'L' : 'M'}${x(v.time).toFixed(2)} ${y(v[key]).toFixed(2)}`).join(' '));
  }
  const last = points.at(-1);
  if (last) {
    node('kinetic-area').setAttribute('d', `${node('kinetic-path').getAttribute('d')} L${x(last.time)} 156 L${x(points[0]!.time)} 156 Z`);
    node('chart-cursor').setAttribute('cx', String(x(last.time))); node('chart-cursor').setAttribute('cy', String(y(last.kinetic)));
  }
  node('chart-max').textContent = `${max.toFixed(2)} J`; node('chart-start').textContent = `${start.toFixed(1)} s`; node('chart-end').textContent = `${end.toFixed(1)} s`;
}
function useFallback(message: string) {
  stop(); scene?.dispose(); scene = undefined; viewport.querySelector('canvas')?.remove();
  if (!document.getElementById('fallback-forces')) {
    const svg = document.getElementById('fallback-svg')!;
    const element = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value)); return el;
    };
    const defs = element('defs', {});
    for (const [key, color] of [['gravity', '#e7b96c'], ['tension', '#63ded1']]) {
      const marker = element('marker', { id: `arrow-${key}`, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto' });
      marker.append(element('path', { d: 'M0 0L10 5L0 10Z', fill: color! })); defs.append(marker);
    }
    const group = element('g', { id: 'fallback-forces' });
    for (const [key, color] of [['gravity', '#e7b96c'], ['tension', '#63ded1']]) group.append(element('path', { id: `fallback-${key}`, fill: 'none', stroke: color!, 'stroke-width': '3', 'marker-end': `url(#arrow-${key})` }));
    svg.append(defs, element('path', { id: 'fallback-trail', fill: 'none', stroke: '#63ded1', 'stroke-width': '2', opacity: '.5' }), group);
  }
  node('pendulum-fallback').hidden = false; node('fallback-message').textContent = message;
  node('drag-hint').textContent = '二维示意实时联动 · 用角度滑杆调整，再释放摆球';
  document.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach((b) => b.disabled = true);
  viewport.dataset.ready = 'fallback'; update(true);
}
try {
  scene = createPendulumScene(viewport, (angle, released) => {
    input('angle').value = String(Math.round(angle)); resetExperiment();
    node('status').textContent = released ? '摆动中' : '拉动摆球';
    if (released) start();
  }, () => useFallback('三维显示中断，已切换实时二维示意。实验读数和操作仍可继续。'));
  node('pendulum-fallback').hidden = true; viewport.dataset.ready = 'true';
} catch { useFallback('当前设备不支持三维显示，已切换实时二维示意。可继续释放、测量与对照实验。'); }
for (const id of ['length', 'mass', 'angle', 'damping']) input(id).addEventListener('input', resetExperiment);
node('gravity').addEventListener('change', resetExperiment);
for (const id of ['trail', 'forces', 'compare']) input(id).addEventListener('change', () => update(true));
node('release').addEventListener('click', release);
node('toggle').addEventListener('click', () => { if (running) { stop(); update(true); } else start(); });
node('step').addEventListener('click', () => { stop(); simulate(.025); update(true); });
node('reset').addEventListener('click', () => {
  for (const [key, value] of Object.entries(DEFAULT_PENDULUM)) (node(key) as HTMLInputElement | HTMLSelectElement).value = String(value);
  input('slow').checked = input('forces').checked = input('compare').checked = false; input('trail').checked = true;
  document.querySelectorAll('[data-mission]').forEach((el) => el.setAttribute('aria-pressed', 'false'));
  displayMission('mass', false);
  setCamera('perspective'); resetExperiment();
});
function setCamera(mode: string) {
  scene?.camera(mode); document.querySelectorAll<HTMLElement>('[data-camera]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.camera === mode))); update(true);
}
document.querySelectorAll<HTMLElement>('[data-camera]').forEach((b) => b.addEventListener('click', () => setCamera(b.dataset.camera!)));
viewport.addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target === viewport) { e.preventDefault(); if (running) { stop(); update(true); } else start(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); update(true); } });
motion.addEventListener('change', () => { node('motion-note').hidden = !motion.matches; if (motion.matches) { stop(); update(true); } });

const missions = {
  mass: { question: '保持摆长、重力与释放角度相同，把主摆质量增加到 3 kg。它与 1 kg 参考摆相比，会怎样？', tip: '已开启对照摆。先选答案，再释放；两球的位置会给你证据。', answers: ['主摆更快', '周期相同', '主摆更慢'], correct: 1, explanation: '质量同时增大重力和惯性，在运动方程中抵消。两摆同步，但主摆的势能与动能都是参考摆的 3 倍。', params: { ...DEFAULT_PENDULUM, mass: 3 } },
  length: { question: '主摆摆长改为 2.40 m，参考摆保持 1.50 m，其他条件相同。主摆的周期会怎样？', tip: '释放两个摆，观察它们逐渐错开；主摆周期约为参考摆的 √(2.4/1.5) ≈ 1.26 倍。', answers: ['变短', '不变', '变长'], correct: 2, explanation: '周期与摆长的平方根成正比。更长的摆需要更长时间完成一次往返，不是质量让它变慢。', params: { ...DEFAULT_PENDULUM, length: 2.4 } },
  energy: { question: '无阻尼释放后，摆球经过最低处。此时绳子张力 T 与重力 mg 相比，谁更大？', tip: '已开启受力箭头与慢动作。经过最低处时暂停，对照实时张力公式和两个箭头。', answers: ['T < mg', 'T = mg', 'T > mg'], correct: 2, explanation: '最低处，张力还要提供向上的向心合力：T − mg = mv²/L，因此只要摆球在运动，T 就大于 mg。', params: { ...DEFAULT_PENDULUM, angle: 55 } },
};
function displayMission(key: keyof typeof missions, prepare: boolean) {
  const m = missions[key];
  node('mission-question').textContent = m.question; node('mission-tip').textContent = prepare ? m.tip : '点击上方问题自动准备条件，或手动把质量调到 3 kg 并开启对照摆。';
  node('answer-feedback').textContent = '选一个预测，看看你的直觉。';
  node('answers').replaceChildren(...m.answers.map((answer, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = answer; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      node('answers').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      node('answer-feedback').textContent = `${index === m.correct ? '预测正确。' : '再想一想。'}${m.explanation}`;
      node('answer-feedback').dataset.correct = String(index === m.correct);
    }); return button;
  }));
  if (prepare) {
    for (const [id, value] of Object.entries(m.params)) (node(id) as HTMLInputElement | HTMLSelectElement).value = String(value);
    input('compare').checked = key !== 'energy'; input('forces').checked = input('slow').checked = key === 'energy';
    resetExperiment(); setCamera('front');
  }
}
document.querySelectorAll<HTMLElement>('[data-mission]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-mission]').forEach((other) => other.setAttribute('aria-pressed', String(b === other)));
  displayMission(b.dataset.mission as keyof typeof missions, true);
}));
displayMission('mass', false); stop(); update(true);
window.addEventListener('pagehide', (event) => { stop(); if (!event.persisted) { disposed = true; scene?.dispose(); } });

node('save-period').addEventListener('click',()=>{
 const pair=main.periodEndpoints;if(!pair||main.measuredPeriod===null)return;
 const replaced=records.length===2;if(replaced)records.shift();
 records.push({params:{...main.params},...pair,period:main.measuredPeriod});
 const list=node('period-records');list.replaceChildren(...records.map((r,i)=>{
   const p=document.createElement('p');p.textContent=`${i===0?'A':'B'}：L=${r.params.length} m，m=${r.params.mass} kg，g=${r.params.gravity} m/s²，θ₀=${r.params.angle}°，b=${r.params.damping} s⁻¹；t₁=${r.start.toFixed(3)} s，t₂=${r.end.toFixed(3)} s，T=${r.period.toFixed(3)} s。`;return p;
 }));
 node('period-comparison').textContent=records.length===2?comparePendulum(records[0]!,records[1]!):'已保留 A。只改变一个条件，再释放并保存 B。';
 node('period-save-note').textContent=replaced?'已替换最早一组，保留最近两组。仅当前页有效。':`已保存 ${records.length}/2 组，仅当前页有效。${records.length===2?'再次保存会替换最早一组。':''}`;
});

const dimensionalSwitch=document.createElement('button'); dimensionalSwitch.type='button';dimensionalSwitch.textContent='查看二维实验';dimensionalSwitch.style.cssText='min-height:44px;margin:10px;padding:10px 16px';
let flatView=false; dimensionalSwitch.addEventListener('click',()=>{flatView=!flatView;node('pendulum-fallback').hidden=!flatView&&Boolean(scene);const canvas=document.querySelector<HTMLCanvasElement>('#apparatus canvas');if(canvas)canvas.hidden=flatView;dimensionalSwitch.textContent=flatView?'返回三维实验':'查看二维实验';dimensionalSwitch.setAttribute('aria-pressed',String(flatView));update(true);});viewport.after(dimensionalSwitch);

setupControlDiscoveries('pendulum',['length','mass','angle','gravity','damping'],()=>{resetExperiment();document.querySelectorAll('[data-mission],#answers button').forEach(n=>n.setAttribute('aria-pressed','false'));node('answer-feedback').textContent='已恢复释放条件；请重新预测并释放检验。';delete node('answer-feedback').dataset.correct;},s=>`摆长 ${s.length} m；质量 ${s.mass} kg；初角 ${s.angle}°；重力 ${s.gravity} m/s²；阻尼 ${s.damping}。恢复初始释放条件，不补造轨迹。`);
