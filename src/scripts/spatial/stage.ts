import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function disposeObject(object:THREE.Object3D){
 object.traverse(node=>{const mesh=node as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const material of materials){const map=(material as THREE.MeshBasicMaterial).map;map?.dispose();material.dispose();}}});
}
export function createStage(host:HTMLElement,background:number,onLost:()=>void){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','三维实验装置，方向键转动视角；下方滑块可操作实验');host.append(canvas);
 const scene=new THREE.Scene();scene.background=new THREE.Color(background);
 const camera=new THREE.PerspectiveCamera(38,1,.02,200);camera.position.set(7,6,9);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=3;controls.maxDistance=40;
 scene.add(new THREE.HemisphereLight(0xffffff,0x8594a7,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,8,5);scene.add(light);
 let disposed=false,distance=10,view:THREE.Vector3=new THREE.Vector3(1,.8,1.2).normalize();
 const render=()=>{if(!disposed&&host.clientWidth&&host.clientHeight)renderer.render(scene,camera);};controls.addEventListener('change',render);
 function fit(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h||disposed)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);camera.position.copy(controls.target).addScaledVector(view,distance*Math.max(1,1.4/camera.aspect));controls.update();render();}
 function frame(center:THREE.Vector3,size:number){controls.target.copy(center);distance=size;controls.minDistance=size*.4;controls.maxDistance=size*3;fit();}
 function preset(name:string){view=(name==='astronomy-top'?new THREE.Vector3(0,1,.001):name==='astronomy'?new THREE.Vector3(0,1,1.1):name==='top'?new THREE.Vector3(.001,1,.001):name==='front'?new THREE.Vector3(0,.12,1):name==='screen'?new THREE.Vector3(1,.16,.2):new THREE.Vector3(1,.8,1.2)).normalize();fit();}
 function key(e:KeyboardEvent){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);s.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0),.08,Math.PI-.08);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));view.copy(camera.position).sub(controls.target).normalize();controls.update();render();}
 canvas.addEventListener('keydown',key);
 controls.addEventListener('end',()=>view.copy(camera.position).sub(controls.target).normalize());
 const observer=new ResizeObserver(fit);observer.observe(host);
 function lost(e:Event){e.preventDefault();onLost();}
 canvas.addEventListener('webglcontextlost',lost);
 function dispose(){if(disposed)return;disposed=true;observer.disconnect();controls.dispose();canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost);disposeObject(scene);renderer.dispose();canvas.remove();}
 return {scene,camera,controls,renderer,canvas,render,frame,preset,dispose};
}
export function labelSprite(text:string,color='#dbeafa'){
 const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.font='48px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,60);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:false,toneMapped:false}));sprite.scale.set(2.4,.45,1);return sprite;
}
