import { surfaceTriangles } from "../../lib/discovery/triangulation";
import * as THREE from "three";
import { createStage, disposeObject, labelSprite } from "../spatial/stage";
import {
  blackholeSky,
  starField,
  stellarMaterial,
  glow,
} from "./cosmic-visuals";
import type { Observation, Vec3 } from "../../lib/discovery/core";
export interface SceneManipulation {begin:()=>void;move:(point:Vec3)=>void;end:()=>void}
export function createDiscoveryScene(
  host: HTMLElement,
  dark: boolean,
  id: string,
  lost: () => void,
  manipulation?: SceneManipulation,
) {
  const stage = createStage(host, dark ? 0x081426 : 0xf0f6f8, lost),
    group = new THREE.Group();
  stage.scene.add(group);
  if (id === "C01")
    stage.scene.traverse((node) => {
      if (node instanceof THREE.Light) node.intensity = 0.05;
    });
  if (dark && id !== "C06") stage.scene.add(starField());
  const sky = id === "C06" ? blackholeSky() : undefined;
  if (sky) stage.scene.add(sky.mesh);
  function publishHandles(){
    host.dataset.handles=JSON.stringify(group.children.filter(c=>c.userData.handle).map(c=>{
      const q=c.position.clone().project(stage.camera);
      return {key:c.userData.handle,x:(q.x+1)/2,y:(1-q.y)/2};
    }));
  }
  let probe = 6;
  const skyRender = () => {
    publishHandles();
    if (sky) {
      sky.update(
        stage.camera,
        host.clientWidth / Math.max(1, host.clientHeight),
        probe,
      );
      stage.render();
    }
  };
  stage.controls.addEventListener("change", skyRender);
  const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(),hit=new THREE.Vector3(),dragOffset=new THREE.Vector3();
  let activePointer:number|null=null;
  function ray(event:PointerEvent){
    const b=stage.canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX-b.left)/b.width*2-1,1-(event.clientY-b.top)/b.height*2),stage.camera);
  }
  function dragStart(event:PointerEvent){
    if(!manipulation||event.button!==0)return;
    ray(event);
    const candidates=group.children.filter(object=>object.userData.handle);
    const b=stage.canvas.getBoundingClientRect();
    const selected=raycaster.intersectObjects(candidates,false)[0]?.object??candidates.find(object=>{
      const q=object.position.clone().project(stage.camera);
      return Math.hypot(event.clientX-b.left-(q.x+1)*b.width/2,event.clientY-b.top-(1-q.y)*b.height/2)<=22;
    });
    if(!selected)return;
    // A 44px target stays usable on phones; retain the grab offset to prevent jumps.
    plane.setFromNormalAndCoplanarPoint(stage.camera.getWorldDirection(new THREE.Vector3()),selected.position);
    if(!raycaster.ray.intersectPlane(plane,hit))return;
    dragOffset.copy(hit).sub(selected.position);
    event.preventDefault();event.stopImmediatePropagation();
    activePointer=event.pointerId;stage.controls.enabled=false;stage.canvas.setPointerCapture(event.pointerId);stage.canvas.style.cursor='grabbing';
    manipulation.begin();
  }
  function dragMove(event:PointerEvent){
    if(activePointer!==event.pointerId)return;
    event.preventDefault();event.stopImmediatePropagation();ray(event);
    if(raycaster.ray.intersectPlane(plane,hit))manipulation?.move(hit.sub(dragOffset).toArray() as Vec3);
  }
  function dragEnd(event:PointerEvent){
    if(activePointer!==event.pointerId)return;
    event.stopImmediatePropagation();activePointer=null;stage.controls.enabled=true;stage.canvas.style.cursor='';
    if(stage.canvas.hasPointerCapture(event.pointerId))stage.canvas.releasePointerCapture(event.pointerId);
    manipulation?.end();
  }
  stage.canvas.addEventListener('pointerdown',dragStart,true);
  stage.canvas.addEventListener('pointermove',dragMove,true);
  stage.canvas.addEventListener('pointerup',dragEnd,true);
  stage.canvas.addEventListener('pointercancel',dragEnd,true);
  if(manipulation)stage.canvas.setAttribute('aria-label','三维潮汐实验：拖动青色小天体改变距离；空白处拖动或方向键旋转；下方距离滑块可用键盘操作');
  let fitted = false;
  let fittedBounds: THREE.Box3 | undefined;
  const context = new THREE.Group();
  stage.scene.add(context);
  const labels = new Map<string, THREE.Sprite>();
  const liveReadings = document.createElement('div');
  liveReadings.className='dis-spatial-readings';
  liveReadings.setAttribute('aria-label','三维同步测量');
  host.append(liveReadings);
  function persistentLabel(key: string, text: string, color: string) {
    let tag = labels.get(key);
    if (!tag) {
      tag = labelSprite(text, color);
      labels.set(key, tag);
      context.add(tag);
    }
    return tag;
  }
  const cylinder = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    color: string,
  ) => {
    const delta = b.clone().sub(a),
      length = delta.length();
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, Math.max(length, 1e-6), 12),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.18,
      }),
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return mesh;
  };
  function update(o: Observation) {
    liveReadings.replaceChildren(...o.metrics.slice(0,4).map(m=>{const item=document.createElement('span');item.textContent=`${m.label} ${m.value===null?'未定义':Number(m.value.toPrecision(5))} ${m.unit}`;return item;}));
    const geometry = JSON.stringify(o.solids ?? []);
    let hash = 2166136261;
    for (const char of geometry)
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    host.dataset.geometryHash = (hash >>> 0).toString(16);
    host.dataset.geometryCount = String(o.solids?.length ?? 0);
    host.dataset.measurements = JSON.stringify(o.metrics);
    host.dataset.revision = String(Number(host.dataset.revision ?? 0) + 1);

    disposeObject(group);
    group.clear();
    const shapes = o.solids ?? [];
    const usedLabels=new Set<string>();
    const surfaces=new Map<string,{positions:number[];edges:number[];colors:number[];color:string;opacity:number}>();
    for (const [index, s] of shapes.entries()) {
      const points = s.points.map((p) => new THREE.Vector3(...p)),
        color = s.color ?? "#16847a";
      if(s.type==='label') {
        const key=`caption-${index}-${s.label}`;
        usedLabels.add(key);
        const tag=persistentLabel(key,s.label??'',dark?'#e4f0ff':color);
        tag.position.copy(points[0]!);
        const len=[...(s.label??'')].length;
        if(s.scale)tag.scale.set(...s.scale);else tag.scale.set(Math.min(12,Math.max(1.8,len*.30)),.65,1);
        tag.position.x+=tag.scale.x/2;
        continue;
      }
      if(s.type==='tube') {
        if(points.length>2) {
          const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
          group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,Math.min(400,points.length*2),s.radius??.025,8,false),new THREE.MeshStandardMaterial({color,roughness:.55})));
        } else if(points.length===2) group.add(cylinder(points[0]!,points[1]!,s.radius??.025,color));
        continue;
      }
      if (s.type === "sphere") {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(
            s.radius ?? 0.1,
            (s.radius ?? 0.1) < 0.04 ? 8 : 24,
            (s.radius ?? 0.1) < 0.04 ? 6 : 16,
          ),
          (id === "C01" && index < 3) ||
            (dark && Number(id.slice(1)) > 10 && color === "#c38b28")
            ? stellarMaterial(color)
            : dark &&
                Number(id.slice(1)) <= 10 && id !== 'C07' &&
                !(id === "C01" && index === 3)
              ? new THREE.MeshBasicMaterial({ color })
              : new THREE.MeshStandardMaterial({
                  color,
                  transparent: (s.opacity ?? 1) < 1,
                  opacity: s.opacity ?? 1,
                  depthWrite: (s.opacity ?? 1) >= 1,
                  roughness: 0.4,
                  metalness: 0.1,
                }),
        );
        sphere.position.copy(points[0]!);
        if(s.scale)sphere.scale.set(...s.scale);
        if(s.handle)sphere.userData.handle=s.handle;
        group.add(sphere);
        if (id === "C01" && index < 3) {
          const halo = glow(color, s.radius ?? 0.1);
          halo.position.copy(sphere.position);
          group.add(halo);
        }
        if (id === "C01" && index < 3) {
          const light = new THREE.PointLight(
            color,
            10 * ((s.radius ?? 0.12) / 0.12) ** 3.5,
            20,
            2,
          );
          light.position.copy(points[0]!);
          group.add(light);
        }
      } else if (s.type === "line") {
        if(id==='legacy-bridge'||id==='legacy-gears') {
          for(let i=1;i<points.length;i++)group.add(cylinder(points[i-1]!,points[i]!,id==='legacy-bridge'?.035:.015,color));
          continue;
        }
        if (
          points.length === 2 &&
          (id === "S04" || id === "M03" || Number(id.slice(1)) > 10)
        ) {
          const radius =
            id === "S04" ? (color === "#16847a" ? 0.035 : 0.009) :
            ['S11','S21','S22','S24'].includes(id)&&['#16847a','#c38b28','#438cbc'].includes(color)?0.055:0.018;
          group.add(cylinder(points[0]!, points[1]!, radius, color));
          if (id === "M03" && color === "#c38b28") {
            const direction = points[1]!.clone().sub(points[0]!);
            if (direction.length() > 1e-5) {
              const tip = new THREE.Mesh(
                new THREE.ConeGeometry(0.075, 0.2, 16),
                new THREE.MeshStandardMaterial({ color }),
              );
              tip.position.copy(points[1]!);
              tip.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.normalize(),
              );
              group.add(tip);
            }
          }
          continue;
        }
        const trace = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: s.opacity ?? 1,
            depthTest: color !== "#c85b46",
          }),
        );
        // Draw the mathematical section over the transparent construction surfaces.
        if (id === "M04" && color === "#c85b46") trace.renderOrder = 3;
        group.add(trace);
      } else {
        if(Number(id.slice(1))>10||id==='C10') {
          const opacity=id==='C10'?1:(s.opacity??.65),key=id==='C10'?'cmb-pixels':`${color}:${opacity}`;
          let batch=surfaces.get(key);
          if(!batch){batch={positions:[],edges:[],colors:[],color,opacity};surfaces.set(key,batch);}
          const vertexColor=id==='C10'?new THREE.Color(color):undefined;
          for(const triangle of surfaceTriangles(s.points))for(const j of triangle){batch.positions.push(...s.points[j]!);if(vertexColor)batch.colors.push(vertexColor.r,vertexColor.g,vertexColor.b);}
          if(id.startsWith('M')||s.points.length>5)for(let j=0;j<s.points.length;j++)batch.edges.push(...s.points[j]!,...s.points[(j+1)%s.points.length]!);
          continue;
        }
        const data: number[] = [];
        // Keep the narrowing of concave apparatus, such as the Venturi throat.
        for (const triangle of surfaceTriangles(s.points))
          for (const index of triangle) data.push(...points[index]!.toArray());
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(data, 3),
        );
        geometry.computeVertexNormals();
        group.add(
          new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
              color,
              side: THREE.DoubleSide,
              transparent: true,
              opacity:
                id === "M01" ? 0.8 : id === "S09" ? 0.9 : (s.opacity ?? 0.65),
              roughness: 0.55,
              metalness: id === "S09" ? 0.12 : 0,
              depthWrite: false,
            }),
          ),
        );
        group.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([...points, points[0]!]),
            new THREE.LineBasicMaterial({ color }),
          ),
        );
        if (id === "M01") {
          const tag = persistentLabel(
            `face-${index}`,
            s.label ?? String(index + 1),
            "#203c50",
          );
          const center = points
            .reduce((a, b) => a.add(b), new THREE.Vector3())
            .multiplyScalar(1 / points.length);
          tag.position.copy(center);
          tag.scale.set(0.5, 0.2, 1);
        }
      }
    }
    host.dataset.surfaceBatches=String(surfaces.size);
    for(const batch of surfaces.values()) {
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(batch.positions,3));geometry.computeVertexNormals();
      if(batch.colors.length)geometry.setAttribute('color',new THREE.Float32BufferAttribute(batch.colors,3));
      const material=batch.colors.length?new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:batch.color,side:THREE.DoubleSide,transparent:batch.opacity<1,opacity:batch.opacity,depthWrite:batch.opacity>=.85,roughness:.48,metalness:.12});
      group.add(new THREE.Mesh(geometry,material));
      if(batch.edges.length)group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(batch.edges,3)),new THREE.LineBasicMaterial({color:batch.color,transparent:true,opacity:.65})));
    }
    for(const [key,tag] of labels) if(key.startsWith('caption-')&&!usedLabels.has(key)) {context.remove(tag);disposeObject(tag);labels.delete(key);}
    if (id === "C01" || id === "C02") {
      const count = id === "C01" ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const solid = shapes[i];
        if (!solid) continue;
        const tag = persistentLabel(
          `body-${i}`,
          id === "C01"
            ? i === 3
              ? "固定测光探针"
              : `${i + 1}号恒星`
            : i === 0
              ? "主星"
              : "伴星",
          "#cde4f3",
        );
        tag.position.set(...solid.points[0]!);
        tag.position.y += 0.3;
        tag.scale.set(0.7, 0.13, 1);
      }
    }
    if (id === "M02") {
      // Close only the transparent side surfaces between the actual top/bottom circles.
      for (let side = 0; side < 2; side++) {
        const bottom = shapes[side]!.points,
          top = shapes[24 + side]!.points;
        const positions: number[] = [];
        for (let i = 0; i < 48; i++)
          for (const point of [
            bottom[i]!,
            top[i]!,
            top[i + 1]!,
            bottom[i]!,
            top[i + 1]!,
            bottom[i + 1]!,
          ])
            positions.push(...point);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.computeVertexNormals();
        group.add(
          new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
              color: "#64aa9c",
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.12,
              depthWrite: false,
            }),
          ),
        );
      }
    }
    if (id === "C09") {
      for (const solid of shapes.filter((s) => s.type === "sphere")) {
        const point = new THREE.Vector3(...solid.points[0]!),
          r = point.length();
        const pts = Array.from(
          { length: 97 },
          (_, i) =>
            new THREE.Vector3(
              r * Math.cos((i * Math.PI) / 48),
              0,
              r * Math.sin((i * Math.PI) / 48),
            ),
        );
        group.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({
              color: solid.color,
              transparent: true,
              opacity: 0.25,
            }),
          ),
        );
      }
    }
    if (id === "M04") {
      // Adjacent generators define the same finite cone, giving it a readable surface.
      for (let side = 0; side < 2; side++)
        for (let i = 0; i < 24; i++) {
          const a = shapes[side * 24 + i]?.points[1],
            b = shapes[side * 24 + ((i + 1) % 24)]?.points[1];
          if (!a || !b) continue;
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute([0, 0, 0, ...a, ...b], 3),
          );
          geometry.computeVertexNormals();
          group.add(
            new THREE.Mesh(
              geometry,
              new THREE.MeshStandardMaterial({
                color: "#51a598",
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.14,
                depthWrite: false,
                roughness: 0.65,
              }),
            ),
          );
        }
    }
    if (id === "M10") {
      const a = o.metrics.find((m) => m.key === "cell")!.value!;
      const corners = Array.from(
        { length: 8 },
        (_, i) =>
          new THREE.Vector3(i & 1 ? a : 0, i & 2 ? a : 0, i & 4 ? a : 0),
      );
      for (let i = 0; i < 8; i++)
        for (let bit = 1; bit <= 4; bit *= 2)
          if (!(i & bit))
            group.add(
              cylinder(corners[i]!, corners[i | bit]!, 0.025, "#234359"),
            );
      const tag = persistentLabel("cell", "一个常规单胞", "#234359");
      tag.position.set(a / 2, 1.5 * a + 1.5, a / 2);
    }
    const currentBounds = shapes.length
      ? new THREE.Box3().setFromObject(group)
      : undefined;
    const grew =
      currentBounds && fittedBounds && !fittedBounds.containsBox(currentBounds);
    if ((!fitted || id === "M01" || grew) && shapes.length) {
      const box = currentBounds!,
        center = box.getCenter(new THREE.Vector3()),
        size = box.getSize(new THREE.Vector3()).length();
      stage.frame(
        id === "C06" ? new THREE.Vector3() : center,
        id === "C06" ? 26 : Math.max(4, Math.min(160, size * (["M21", "C14", "C16"].includes(id) ? 1.8 : 1.5))),
      );
      if (id === "M04") stage.preset("conic");
      if (!fitted && !dark && id !== "M03" && id !== "M04") {
        const extent = box.getSize(new THREE.Vector3()),
          side = Math.max(extent.x, extent.z, 3) * 1.4;
        const grid = new THREE.GridHelper(side, 12, 0x9aafb9, 0xd0dde2);
        grid.position.set(center.x, box.min.y - 0.04, center.z);
        context.add(grid);
      }
      fittedBounds = box.clone().expandByScalar(Math.max(0.3, size * 0.12));
      fitted = true;
    }
    if (sky) {
      probe = o.metrics.find((m) => m.key === "impact")?.value ?? probe;
      sky.update(
        stage.camera,
        host.clientWidth / Math.max(1, host.clientHeight),
        probe,
      );
    }
    stage.render();
    publishHandles();
    if (currentBounds && !currentBounds.isEmpty()) {
      const projected = Array.from({ length: 8 }, (_, i) =>
        new THREE.Vector3(
          i & 1 ? currentBounds.max.x : currentBounds.min.x,
          i & 2 ? currentBounds.max.y : currentBounds.min.y,
          i & 4 ? currentBounds.max.z : currentBounds.min.z,
        ).project(stage.camera),
      );
      host.dataset.projectedBounds = JSON.stringify([
        Math.min(...projected.map((v) => v.x)),
        Math.min(...projected.map((v) => v.y)),
        Math.max(...projected.map((v) => v.x)),
        Math.max(...projected.map((v) => v.y)),
      ]);
    }
  }
  return {
    update,
    setView(name: string) {
      stage.preset(name);
      skyRender();
    },
    dispose() {
      stage.canvas.removeEventListener('pointerdown',dragStart,true);
      stage.canvas.removeEventListener('pointermove',dragMove,true);
      stage.canvas.removeEventListener('pointerup',dragEnd,true);
      stage.canvas.removeEventListener('pointercancel',dragEnd,true);
      stage.controls.removeEventListener("change", skyRender);
      sky?.dispose();
      liveReadings.remove();
      stage.dispose();
    },
  };
}
