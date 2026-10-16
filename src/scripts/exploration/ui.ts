export function el<T extends Element = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing experiment element: ${id}`);
  return node as unknown as T;
}
export function text(id: string, value: string) { const node=el(id);if(node.textContent!==value)node.textContent=value; }
export function bindRange(id: string, update: () => void) { el<HTMLInputElement>(id).addEventListener('input', update); }
export function value(id: string) { return Number(el<HTMLInputElement>(id).value); }
export function svgPoint(svg: SVGSVGElement, e: PointerEvent) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
}
export function clock(step: () => void, render: () => void, interval = 1 / 30, onPause?: () => void) {
  let running = false, frame = 0, last = 0, accumulator = 0;
  const button = el<HTMLButtonElement>('run');
  function pause() {
    running = false; cancelAnimationFrame(frame); accumulator = 0;
    button.textContent = '开始 / 继续'; button.setAttribute('aria-pressed', 'false'); onPause?.();
  }
  function loop(now: number) {
    if (!running) return;
    accumulator += Math.min((now - last) / 1000, .1); last = now;
    while (accumulator >= interval && running) { step(); accumulator -= interval; }
    render(); if (running) frame = requestAnimationFrame(loop);
  }
  function start() {
    if(running || button.disabled)return;
    running = true; last = performance.now(); accumulator = 0;
    button.textContent = '暂停'; button.setAttribute('aria-pressed', 'true'); frame = requestAnimationFrame(loop);
  }
  button.addEventListener('click', () => { if(running)pause();else start(); });
  el('step').addEventListener('click', () => { pause(); step(); render(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', pause);
  return { pause, start, isRunning: () => running };
}
export function activate(node: Element, action: () => void) {
  node.addEventListener('click', action);
  node.addEventListener('keydown', event => {
    const e = event as KeyboardEvent;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
  });
}
