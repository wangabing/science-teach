import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buoyancyState } from '../../lib/stem-lab/buoyancy';

const viewport = document.querySelector<HTMLElement>('#lab-viewport')!;
const depth = document.querySelector<HTMLInputElement>('#immersion')!;
const liquid = document.querySelector<HTMLSelectElement>('#liquid')!;
const play = document.querySelector<HTMLButtonElement>('#play')!;
const fallback = document.querySelector<HTMLElement>('#scene-fallback')!;
const stageButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-stage]')];
let playing = false;
let frame = 0;
let lastTime = 0;
let animationDepth = 0;
let disposed = false;
let renderScene: (() => void) | undefined;
let updateScene: ((state: ReturnType<typeof buoyancyState>) => void) | undefined;
let resetCamera: (() => void) | undefined;
let disposeScene: (() => void) | undefined;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector<HTMLElement>('#motion-note')!.hidden = !reducedMotion.matches;

function update() {
  const state = buoyancyState(Number(depth.value), Number(liquid.value));
  const decimals: Record<string, number> = { tensionN: 1, buoyancyN: 1, riseCm: 2, displacedCm3: 0, bottomPressurePa: 0 };
  document.querySelectorAll<HTMLElement>('[data-reading]').forEach((node) => {
    const key = node.dataset.reading as keyof typeof state;
    node.textContent = state[key].toFixed(decimals[key] ?? 1);
  });
  document.querySelector<HTMLOutputElement>('#depth-value')!.value = `${state.immersionCm.toFixed(1)} cm`;
  depth.setAttribute('aria-valuetext', `浸入 ${state.immersionCm.toFixed(1)} 厘米`);
  const phase = state.immersionCm === 0 ? '刚接触液面' : state.immersionCm === 10 ? '完全浸没' : '部分浸入';
  document.querySelector('#phase')!.textContent = phase;
  stageButtons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.stage) === state.immersionCm)));
  document.querySelector('#derivation')!.textContent =
    `浸入 ${state.immersionCm.toFixed(1)} cm：V排 = 100 × ${state.immersionCm.toFixed(1)} = ${state.displacedCm3.toFixed(0)} cm³；F浮 = ${state.liquidDensity} × 10 × ${(state.displacedCm3 / 1e6).toFixed(6)} = ${state.buoyancyN.toFixed(1)} N；T = 27 − ${state.buoyancyN.toFixed(1)} = ${state.tensionN.toFixed(1)} N。`;
  updateScene?.(state);
  renderScene?.();
}
function stop() {
  playing = false;
  cancelAnimationFrame(frame);
  frame = 0;
  play.textContent = '播放入水过程';
  play.setAttribute('aria-pressed', 'false');
}
function tick(time: number) {
  if (!playing || disposed) return;
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;
  animationDepth = Math.min(10, animationDepth + dt * 1.4);
  depth.value = String(animationDepth);
  update();
  if (animationDepth >= 10) stop();
  else frame = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (playing) return stop();
  depth.value = '0';
  animationDepth = 0;
  update();
  playing = true;
  lastTime = performance.now();
  play.textContent = '暂停演示';
  play.setAttribute('aria-pressed', 'true');
  frame = requestAnimationFrame(tick);
});
depth.addEventListener('input', () => { stop(); update(); });
liquid.addEventListener('change', () => { stop(); update(); });
stageButtons.forEach((button) => button.addEventListener('click', () => {
  stop(); depth.value = button.dataset.stage!; update();
}));
document.querySelector('#reset')!.addEventListener('click', () => {
  stop(); depth.value = '5'; liquid.value = '1000'; resetCamera?.(); update();
});
document.querySelector('#camera-reset')!.addEventListener('click', () => resetCamera?.());
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
reducedMotion.addEventListener('change', () => {
  document.querySelector<HTMLElement>('#motion-note')!.hidden = !reducedMotion.matches;
  if (reducedMotion.matches) stop();
});

function initScene() {
  // Probe support before constructing Three's renderer so failure remains quiet.
  const canvas = document.createElement('canvas');
  if (!canvas.getContext('webgl2')) throw new Error('WebGL2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  canvas.setAttribute('aria-hidden', 'true');
  viewport.prepend(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  const home = new THREE.Vector3(6.3, 4.7, 7.5);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 2, 0);
  controls.minDistance = 6;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.enablePan = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8da6bb, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 3.5);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const materials = {
    metal: new THREE.MeshStandardMaterial({ color: 0x8094a5, metalness: 0.6, roughness: 0.3 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x25455d, metalness: 0.35, roughness: 0.45 }),
    cube: new THREE.MeshStandardMaterial({ color: 0xc0ccd6, metalness: 0.5, roughness: 0.28 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.4 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xb4d6eb, transparent: true, opacity: 0.13, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    water: new THREE.MeshBasicMaterial({ color: 0x3ca5d9, transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false }),
  };
  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = material !== materials.glass && material !== materials.water;
    mesh.receiveShadow = material !== materials.glass && material !== materials.water;
    parent.add(mesh); return mesh;
  }
  function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material, parent: THREE.Object3D = scene) {
    const delta = b.clone().sub(a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 16), material);
    mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  const textures: THREE.Texture[] = [];
  function label(text: string, x: number, y: number, z: number, color = '#18334c', width = 1.4) {
    const c = document.createElement('canvas'); c.width = width <= 0.5 ? 128 : 512; c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,.90)'; ctx.beginPath(); ctx.roundRect(4, 6, c.width - 8, 116, 18); ctx.fill();
    ctx.font = '500 46px "Noto Sans SC Variable", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, c.width / 2, 64);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.position.set(x, y, z); sprite.scale.set(width, width * c.height / c.width, 1); sprite.renderOrder = 10; scene.add(sprite); return sprite;
  }
  box(5.4, 0.16, 3.4, materials.white, -0.35, -0.12, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.21; floor.receiveShadow = true; scene.add(floor);
  box(1, 0.12, 0.85, materials.dark, -1.65, 0.04, -0.5);
  rod(new THREE.Vector3(-1.65, 0.1, -0.5), new THREE.Vector3(-1.65, 4.5, -0.5), 0.055, materials.metal);
  rod(new THREE.Vector3(-1.65, 4.45, -0.5), new THREE.Vector3(0, 4.45, 0), 0.055, materials.metal);
  box(0.25, 0.15, 0.22, materials.dark, -1.65, 4.45, -0.5);
  box(2.12, 0.08, 2.12, materials.white, 0, 0.04, 0);
  // Separate planes avoid sorting opaque back and front surfaces as one glass mesh.
  box(2.04, 2.7, 0.025, materials.glass, 0, 1.43, -1.02);
  box(0.025, 2.7, 2.04, materials.glass, -1.02, 1.43, 0);
  box(0.025, 2.7, 2.04, materials.glass, 1.02, 1.43, 0);
  box(2.04, 2.7, 0.025, materials.glass, 0, 1.43, 1.02);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.06, 2.7, 2.06)), new THREE.LineBasicMaterial({ color: 0x8ab4cd, transparent: true, opacity: 0.65 }));
  edges.position.set(0, 1.43, 0); scene.add(edges);
  const water = box(2, 1, 2, materials.water, 0, 0.6, 0);
  water.renderOrder = 2;
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0x59b7e1, transparent: true, opacity: 0.27, side: THREE.DoubleSide, depthWrite: false }));
  surface.rotation.x = -Math.PI / 2; surface.renderOrder = 3; scene.add(surface);
  const cube = box(1, 1, 1, materials.cube, 0, 1.625, 0);
  const cubeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: 0x667e90 })); cube.add(cubeEdges);
  const lifting = new THREE.Group(); scene.add(lifting);
  box(0.3, 0.78, 0.2, materials.white, 0, 0, 0, lifting);
  box(0.19, 0.64, 0.018, materials.dark, 0, 0, 0.11, lifting);
  for (let i = 0; i <= 6; i++) box(i % 2 === 0 ? 0.08 : 0.045, 0.01, 0.02, materials.white, 0.04, -0.28 + i * 0.09, 0.13, lifting);
  const pointer = box(0.16, 0.018, 0.025, new THREE.MeshBasicMaterial({ color: 0xd46c32 }), 0, 0, 0.14, lifting);
  const coilPoints = Array.from({ length: 180 }, (_, i) => {
    const t = i / 179; return new THREE.Vector3(Math.cos(t * 12 * Math.PI) * 0.043 - 0.08, 0.25 - t * 0.5, Math.sin(t * 12 * Math.PI) * 0.04 + 0.13);
  });
  lifting.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(coilPoints), new THREE.LineBasicMaterial({ color: 0x9cb4c5 })));
  const rope = rod(new THREE.Vector3(0, -0.39, 0), new THREE.Vector3(0, -0.8, 0), 0.014, materials.dark, lifting);
  const suspension = rod(new THREE.Vector3(0, 4.45, 0), new THREE.Vector3(0, 3.6, 0), 0.016, materials.dark);
  const gaugeLabel = label('弹簧测力计', 0.75, 3.05, 0, '#18334c', 1.25);
  const cubeLabel = label('铝块 · 10 cm', -0.75, 2, 0.65, '#18334c', 1.2);
  const liquidLabel = label('水 · ρ = 1000', 0, 0.45, 1.18, '#167db5', 1.45);
  for (let i = 0; i <= 25; i++) {
    rod(new THREE.Vector3(1.035, 0.08 + i / 10, 1.04), new THREE.Vector3(1.035 - (i % 5 === 0 ? 0.15 : 0.07), 0.08 + i / 10, 1.04), 0.006, materials.dark);
  }
  const initialLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 1.58, 1.045), new THREE.Vector3(1, 1.58, 1.045)]), new THREE.LineDashedMaterial({ color: 0x839eb1, dashSize: 0.06, gapSize: 0.035 })); initialLine.computeLineDistances(); scene.add(initialLine);
  const buoyant = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.5, 0x167db5, 0.14, 0.09);
  const weight = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 1.35, 0xd46c32, 0.16, 0.1);
  const tension = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 1.1, 0x437f63, 0.14, 0.09);
  scene.add(buoyant, weight, tension);
  for (const arrow of [buoyant, weight, tension]) {
    arrow.line.renderOrder = 8; arrow.cone.renderOrder = 8;
    for (const material of [arrow.line.material, arrow.cone.material] as THREE.Material[]) {
      material.depthTest = false; material.depthWrite = false; material.transparent = true;
    }
  }
  const floatLabel = label('F浮', 0.7, 2, 0.8, '#167db5', 0.5);
  const weightLabel = label('G', -0.7, 0.8, 0.8, '#d46c32', 0.4);
  const tensionLabel = label('T', -0.7, 2.8, 0.8, '#437f63', 0.4);
  renderScene = () => { if (!disposed) renderer.render(scene, camera); };
  controls.addEventListener('change', renderScene);
  resetCamera = () => { camera.position.copy(home); controls.target.set(0, 2, 0); controls.update(); renderScene?.(); };
  updateScene = (state) => {
    const level = state.levelCm / 10 + 0.08;
    cube.position.y = state.cubeBottomCm / 10 + 0.58;
    water.scale.y = state.levelCm / 10; water.position.y = state.levelCm / 20 + 0.08;
    surface.position.y = level;
    lifting.position.y = cube.position.y + 1.3;
    rope.position.y = -0.595;
    pointer.position.y = 0.28 - state.tensionN / 30 * 0.56;
    const lineBottom = lifting.position.y + 0.39;
    suspension.scale.y = (4.45 - lineBottom) / 0.85;
    suspension.position.y = (4.45 + lineBottom) / 2;
    gaugeLabel.position.y = lifting.position.y;
    cubeLabel.position.y = cube.position.y + 0.55;
    buoyant.position.set(0.64, cube.position.y, 0.65); buoyant.visible = state.buoyancyN > 0;
    buoyant.setLength(Math.max(0.01, state.buoyancyN * 0.05), Math.min(0.14, state.buoyancyN * 0.02), 0.09);
    weight.position.set(-0.65, cube.position.y, 0.65);
    tension.position.set(-0.65, cube.position.y, 0.65); tension.setLength(state.tensionN * 0.05, 0.14, 0.09);
    floatLabel.position.y = cube.position.y + state.buoyancyN * 0.05 + 0.15; floatLabel.visible = buoyant.visible;
    weightLabel.position.y = cube.position.y - 1.48;
    tensionLabel.position.y = cube.position.y + state.tensionN * 0.05 + 0.15;
    const hue = state.liquidDensity === 800 ? 0xa8b45a : state.liquidDensity === 1200 ? 0x5f96c7 : 0x3ca5d9;
    materials.water.color.setHex(hue);
    liquidLabel.visible = state.liquidDensity === 1000;
  };
  const observer = new ResizeObserver(() => {
    const { width, height } = viewport.getBoundingClientRect();
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); renderScene?.();
  });
  observer.observe(viewport);
  const onKey = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + (event.key === 'ArrowUp' ? -0.08 : event.key === 'ArrowDown' ? 0.08 : 0), 0.12, controls.maxPolarAngle);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); renderScene?.();
  };
  viewport.addEventListener('keydown', onKey);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); stop(); fallback.hidden = false;
    document.querySelector('#scene-message')!.textContent = '三维显示已中断，可继续操作数值实验；刷新页面重新加载装置。';
    renderScene = undefined;
  });
  disposeScene = () => {
    observer.disconnect(); controls.dispose(); viewport.removeEventListener('keydown', onKey);
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
        if ('geometry' in object) object.geometry.dispose();
        const mats = Array.isArray(object.material) ? object.material : [object.material]; mats.forEach((m) => m.dispose());
      }
    });
    textures.forEach((t) => t.dispose()); renderer.dispose(); canvas.remove();
  };
  controls.update(); fallback.hidden = true;
  viewport.dataset.ready = 'true';
}
try { initScene(); }
catch {
  disposeScene?.();
  viewport.querySelector('canvas')?.remove();
  renderScene = undefined; updateScene = undefined;
  document.querySelector('#scene-message')!.textContent = '当前设备暂不能显示三维装置。你仍可调整深度，观察数值与公式。';
  document.querySelector('#scene-hint')!.textContent = '静态示意 · 右侧控件与计算仍可使用';
  fallback.hidden = false; viewport.dataset.ready = 'fallback';
  document.querySelector<HTMLButtonElement>('#camera-reset')!.disabled = true;
}
update();
window.addEventListener('pagehide', (event) => {
  stop();
  if (!event.persisted) { disposed = true; disposeScene?.(); }
});
