const lengthInput = document.querySelector<HTMLInputElement>('#preview-length')!;
const toggle = document.querySelector<HTMLButtonElement>('#preview-toggle')!;
const arm = document.querySelector<SVGGElement>('#preview-arm')!;
let running = false, raf = 0, previous = 0, phase = 0;
const period = () => 2 * Math.PI * Math.sqrt(Number(lengthInput.value) / 9.81);
function render() {
  const length = 115 + Number(lengthInput.value) * 55;
  const angle = -30 * Math.cos(phase);
  arm.setAttribute('transform', `rotate(${angle} 260 45)`);
  document.querySelector('#preview-rope')!.setAttribute('d', `M260 45V${45 + length}`);
  document.querySelector('#preview-bob')!.setAttribute('cy', String(45 + length));
  document.querySelector('#preview-glint')!.setAttribute('cy', String(38 + length));
  const x = Math.sin(Math.PI / 6) * length;
  const y = 45 + Math.cos(Math.PI / 6) * length;
  document.querySelector('#preview-arc')!.setAttribute('d', `M${260 - x} ${y}A${length} ${length} 0 0 0 ${260 + x} ${y}`);
}
function stop() {
  running = false; cancelAnimationFrame(raf);
  toggle.textContent = '试着摆动 ↗'; toggle.setAttribute('aria-pressed', 'false');
}
function tick(time: number) {
  if (!running) return;
  phase += Math.min((time - previous) / 1000, .05) * 2 * Math.PI / period();
  previous = time; render(); raf = requestAnimationFrame(tick);
}
lengthInput.addEventListener('input', () => {
  document.querySelector('#preview-length-value')!.textContent = `${Number(lengthInput.value).toFixed(2)} m`;
  document.querySelector('#preview-period')!.textContent = `${period().toFixed(2)} s`;
  render();
});
toggle.addEventListener('click', () => {
  if (running) { stop(); return; }
  running = true; previous = performance.now();
  toggle.textContent = '暂停摆动'; toggle.setAttribute('aria-pressed', 'true'); raf = requestAnimationFrame(tick);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
window.addEventListener('pagehide', stop);
render();
