import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Pendulum } from '../../lib/stem-lab/pendulum';

export function createPendulumScene(viewport: HTMLElement, onDrag: (angle: number, released: boolean) => void, onFailure: () => void) {
  const canvas = document.createElement('canvas');
  if (!canvas.getContext('webgl2')) throw new Error('WebGL2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  canvas.setAttribute('aria-hidden', 'true'); viewport.prepend(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 50);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false; controls.minDistance = 4.5; controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * .52; controls.target.set(0, 1.55, 0);
  const home = new THREE.Vector3(3.6, 3.25, 6.5); camera.position.copy(home);
  scene.add(new THREE.HemisphereLight(0xc8ebff, 0x172034, 2));
  const key = new THREE.DirectionalLight(0xffe3b0, 4); key.position.set(-3, 7, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -3 }); key.shadow.normalBias = .025; scene.add(key);
  const rim = new THREE.PointLight(0x63ded1, 15, 12); rim.position.set(3, 3, -2); scene.add(rim);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc6974f, metalness: .7, roughness: .3 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x435b70, metalness: .7, roughness: .3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c3049, roughness: .6, metalness: .2 });
  const bobMaterial = new THREE.MeshStandardMaterial({ color: 0x64d8ca, metalness: .55, roughness: .24, emissive: 0x1b8073, emissiveIntensity: .25 });
  const dim = new THREE.LineBasicMaterial({ color: 0x53718e });
  function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  function rod(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material, parent: THREE.Object3D = scene) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), 16), material);
    mesh.position.copy(from).add(to).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  const textures: THREE.Texture[] = [];
  function label(text: string, x: number, y: number, z: number, width = .55, color = '#91a8c2') {
    const c = document.createElement('canvas'); c.width = 256; c.height = 80;
    const ctx = c.getContext('2d')!; ctx.font = '28px "IBM Plex Mono", "Noto Sans SC Variable", sans-serif'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 128, 40);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false })); sprite.position.set(x, y, z); sprite.scale.set(width, width * 80 / 256, 1); scene.add(sprite); return sprite;
  }
  box(5.3, .15, 2.1, 0, -.08, 0, dark);
  box(.7, .1, .8, -2.13, .05, -.35, steel); box(.7, .1, .8, 2.13, .05, -.35, steel);
  for (const x of [-2.13, 2.13]) {
    rod(new THREE.Vector3(x, .1, -.35), new THREE.Vector3(x, 3.3, -.35), .045, brass);
    rod(new THREE.Vector3(x, .12, .15), new THREE.Vector3(x, .65, -.35), .028, steel);
    box(.15, .17, .18, x, 3.25, -.35, steel);
  }
  rod(new THREE.Vector3(-2.18, 3.25, -.35), new THREE.Vector3(2.18, 3.25, -.35), .065, brass);
  rod(new THREE.Vector3(0, 3.25, -.35), new THREE.Vector3(0, 3.15, .12), .035, steel);
  const pivotY = 3.1;
  const bearing = new THREE.Mesh(new THREE.TorusGeometry(.1, .028, 12, 32), brass); bearing.position.set(0, pivotY, 0); scene.add(bearing);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 16), brass); pivot.position.set(0, pivotY, .02); scene.add(pivot);
  // A physical protractor behind the suspension; ticks encode actual release angle.
  const arcPoints: THREE.Vector3[] = [];
  for (let angle = -80; angle <= 80; angle++) { const a = angle * Math.PI / 180; arcPoints.push(new THREE.Vector3(.58 * Math.sin(a), pivotY - .58 * Math.cos(a), -.15)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints), dim));
  for (let angle = -70; angle <= 70; angle += 10) {
    const a = angle * Math.PI / 180, r = angle % 20 ? .54 : .51;
    rod(new THREE.Vector3(r * Math.sin(a), pivotY - r * Math.cos(a), -.15), new THREE.Vector3(.6 * Math.sin(a), pivotY - .6 * Math.cos(a), -.15), .004, steel);
    if (angle % 20 === 0) label(`${angle}°`, .76 * Math.sin(a), pivotY - .76 * Math.cos(a), -.15, .32);
  }
  const vertical = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, pivotY, -.03), new THREE.Vector3(0, .12, -.03)]), new THREE.LineDashedMaterial({ color: 0x53718e, dashSize: .045, gapSize: .055 })); vertical.computeLineDistances(); scene.add(vertical);
  for (let x = -2; x <= 2; x += .2) rod(new THREE.Vector3(x, .012, .55), new THREE.Vector3(x, .012, .55 + (Math.round(x * 10) % 10 === 0 ? .16 : .07)), .004, brass);
  label('单摆 / PENDULUM', 0, .24, .88, 1.3, '#e7b96c');
  const zeroLabel = label('最低处 · h = 0', -.65, 1.6, .08, .95);
  const zeroLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1, 0, -.03), new THREE.Vector3(1, 0, -.03)]), new THREE.LineDashedMaterial({ color: 0x53718e, dashSize: .035, gapSize: .045 })); zeroLine.computeLineDistances(); scene.add(zeroLine);
  const moving = new THREE.Group(); moving.position.y = pivotY; scene.add(moving);
  const rope = rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0), .009, brass, moving);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(.14, 40, 32), bobMaterial); bob.castShadow = true; moving.add(bob);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.19, .006, 8, 64), new THREE.MeshBasicMaterial({ color: 0x63ded1, transparent: true, opacity: .6 })); moving.add(halo);
  const reference = new THREE.Group(); reference.position.set(0, pivotY, -.32); scene.add(reference);
  const refRope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1.5, 0)]), new THREE.LineDashedMaterial({ color: 0x91a8c2, dashSize: .035, gapSize: .025 })); refRope.computeLineDistances(); reference.add(refRope);
  const refBob = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 20), new THREE.MeshStandardMaterial({ color: 0x859cb5, transparent: true, opacity: .48, roughness: .4, depthWrite: false })); refBob.position.y = -1.5; reference.add(refBob);
  const refLabel = label('参考摆', -.85, 1.25, -.32, .75);
  const trailGeometry = new THREE.BufferGeometry(); const trailArray = new Float32Array(240 * 3);
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailArray, 3)); trailGeometry.setDrawRange(0, 0);
  const trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: 0x63ded1, transparent: true, opacity: .45 })); scene.add(trail);
  const path: THREE.Vector3[] = []; let lastSample = -1;
  const gravity = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), .5, 0xe7b96c, .12, .065);
  const tension = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), .5, 0x63ded1, .12, .065); scene.add(gravity, tension);
  for (const arrow of [gravity, tension]) {
    for (const material of [arrow.line.material, arrow.cone.material] as THREE.Material[]) { material.depthTest = false; }
    arrow.line.renderOrder = arrow.cone.renderOrder = 5;
  }
  const render = () => renderer.render(scene, camera);
  controls.addEventListener('change', render);
  let cameraFit = 1;
  const observer = new ResizeObserver(() => {
    const { width, height } = viewport.getBoundingClientRect(); camera.aspect = width / height;
    const fit = Math.max(1, 1.25 / camera.aspect);
    camera.position.sub(controls.target).multiplyScalar(fit / cameraFit).add(controls.target); cameraFit = fit;
    controls.minDistance = 4.5 * fit; controls.maxDistance = 14 * fit;
    camera.updateProjectionMatrix(); renderer.setSize(width, height); controls.update(); render();
  }); observer.observe(viewport);
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); const hit = new THREE.Vector3();
  let dragging = false, dragAngle = 0, activePointer = -1;
  function setRay(event: PointerEvent) {
    const r = canvas.getBoundingClientRect(); pointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(pointer, camera);
  }
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return;
    setRay(event); if (!raycaster.intersectObject(bob).length) return;
    if (Math.abs(raycaster.ray.direction.z) < .15) { document.querySelector('#drag-hint')!.textContent = '切换「正面观察」，更容易拉动摆球。'; return; }
    dragging = true; activePointer = event.pointerId; controls.enabled = false;
    event.stopImmediatePropagation(); canvas.setPointerCapture(activePointer);
    dragAngle = moving.rotation.z * 180 / Math.PI; onDrag(dragAngle, false); canvas.style.cursor = 'grabbing';
  };
  const move = (event: PointerEvent) => {
    if (!dragging) { setRay(event); canvas.style.cursor = raycaster.intersectObject(bob).length ? 'grab' : 'default'; return; }
    if (event.pointerId !== activePointer) return;
    event.stopImmediatePropagation(); setRay(event);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      dragAngle = THREE.MathUtils.clamp(Math.atan2(hit.x, pivotY - hit.y) * 180 / Math.PI, -70, 70); onDrag(dragAngle, false);
    }
  };
  const finish = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== activePointer) return;
    event.stopImmediatePropagation(); dragging = false; controls.enabled = true;
    if (canvas.hasPointerCapture(activePointer)) canvas.releasePointerCapture(activePointer);
    canvas.style.cursor = 'grab'; onDrag(dragAngle, event.type === 'pointerup');
  };
  canvas.addEventListener('pointerdown', down, true); canvas.addEventListener('pointermove', move, true);
  canvas.addEventListener('pointerup', finish, true); canvas.addEventListener('pointercancel', finish, true);
  const lost = (event: Event) => { event.preventDefault(); onFailure(); }; canvas.addEventListener('webglcontextlost', lost);
  const keyboard = (event: KeyboardEvent) => {
    if (!event.key.startsWith('Arrow')) return;
    event.preventDefault(); const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    spherical.theta += event.key === 'ArrowLeft' ? -.1 : event.key === 'ArrowRight' ? .1 : 0;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + (event.key === 'ArrowUp' ? -.08 : event.key === 'ArrowDown' ? .08 : 0), .2, controls.maxPolarAngle);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); render();
  }; viewport.addEventListener('keydown', keyboard);
  controls.update();
  return {
    update(main: Pendulum, ref: Pendulum, opts: { trail: boolean; forces: boolean; compare: boolean }) {
      const r = main.readings; moving.rotation.z = main.theta;
      zeroLabel.position.y = pivotY - main.params.length - .16; zeroLine.position.y = pivotY - main.params.length;
      // Rotating the downward local vector by +theta produces positive x.
      rope.scale.y = main.params.length; rope.position.y = -main.params.length / 2;
      bob.position.y = halo.position.y = -main.params.length; bob.scale.setScalar(Math.cbrt(main.params.mass));
      halo.scale.setScalar(Math.cbrt(main.params.mass));
      reference.rotation.z = ref.theta; reference.visible = refLabel.visible = opts.compare;
      if (main.time < lastSample) { path.length = 0; lastSample = -1; }
      if (main.time === 0) path.length = 0;
      if (main.time - lastSample >= .04) { path.push(new THREE.Vector3(r.x, pivotY + r.y, .025)); if (path.length > 240) path.shift(); lastSample = main.time; }
      path.forEach((point, i) => { trailArray[i * 3] = point.x; trailArray[i * 3 + 1] = point.y; trailArray[i * 3 + 2] = point.z; });
      trailGeometry.attributes.position!.needsUpdate = true; trailGeometry.setDrawRange(0, path.length); trailGeometry.computeBoundingSphere(); trail.visible = opts.trail;
      gravity.position.set(r.x - .12, pivotY + r.y, .12); tension.position.set(r.x + .12, pivotY + r.y, .12);
      const forceScale = Math.min(.035, 1.35 / Math.max(r.weight, r.tension));
      gravity.setLength(r.weight * forceScale, Math.min(.12, r.weight * forceScale * .3), .065); tension.setDirection(new THREE.Vector3(-Math.sin(main.theta), Math.cos(main.theta), 0)); tension.setLength(r.tension * forceScale, Math.min(.12, r.tension * forceScale * .3), .065);
      gravity.visible = tension.visible = opts.forces; render();
      // Screen coordinates also serve browser verification of direct interaction.
      const screen = bob.getWorldPosition(new THREE.Vector3()).project(camera);
      viewport.dataset.bobX = String((screen.x + 1) / 2 * viewport.clientWidth); viewport.dataset.bobY = String((1 - screen.y) / 2 * viewport.clientHeight);
    },
    camera(mode: string) { controls.target.set(0, 1.55, 0); camera.position.copy(mode === 'front' ? new THREE.Vector3(0, 1.65, 7.7) : home).sub(controls.target).multiplyScalar(cameraFit).add(controls.target); controls.update(); render(); },
    dispose() {
      observer.disconnect(); controls.dispose(); viewport.removeEventListener('keydown', keyboard);
      canvas.removeEventListener('pointerdown', down, true); canvas.removeEventListener('pointermove', move, true); canvas.removeEventListener('pointerup', finish, true); canvas.removeEventListener('pointercancel', finish, true); canvas.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse((o) => { if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Sprite) { if ('geometry' in o) geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m)); } });
      geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose()); renderer.dispose(); canvas.remove();
    },
  };
}
