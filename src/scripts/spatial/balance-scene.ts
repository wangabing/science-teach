import * as THREE from 'three';
import {createStage,labelSprite} from './stage';
import {solveBalance,bodyHeight,bodyDepth,bodyPoint,platformPoint,type BalanceInput,type TippingState} from '../../lib/exploration/balance';
function apparatusLabel(text:string,color:string){const sprite=labelSprite(text,color);sprite.material.toneMapped=false;sprite.renderOrder=6;return sprite;}
export function createBalanceScene(host:HTMLElement,move:(x:number,y:number)=>void,lost:()=>void){
 const stage=createStage(host,0xedf5fa,lost),{scene,canvas,camera,controls}=stage;
 stage.frame(new THREE.Vector3(0,.48,0),3.8);
 const platform=new THREE.Group(),pivot=new THREE.Group(),body=new THREE.Group();scene.add(platform);platform.add(pivot);pivot.add(body);
 const metal=new THREE.MeshStandardMaterial({color:0x58758a,metalness:.25,roughness:.6});
 const bench=new THREE.Mesh(new THREE.BoxGeometry(3.6,.06,1.3),new THREE.MeshStandardMaterial({color:0xc9d9e4,roughness:.7}));bench.position.y=-.055;platform.add(bench);
 const axis=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.6,-.02,0),new THREE.Vector3(1.6,-.02,0)]),new THREE.LineBasicMaterial({color:0x6a8394}));platform.add(axis);
 const shell=new THREE.Mesh(new THREE.BoxGeometry(1,bodyHeight,bodyDepth),new THREE.MeshStandardMaterial({color:0x79afce,transparent:true,opacity:.16,depthWrite:false,roughness:.5}));shell.position.y=bodyHeight/2;body.add(shell);
 const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,bodyHeight,bodyDepth)),new THREE.LineBasicMaterial({color:0x426b86}));frame.position.y=bodyHeight/2;body.add(frame);
 const footing=new THREE.Mesh(new THREE.BoxGeometry(1,.012,bodyDepth),metal);footing.position.y=-.007;body.add(footing);
 const load=new THREE.Group();body.add(load);const weight=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.14),new THREE.MeshStandardMaterial({color:0x297cbd,metalness:.25,roughness:.28}));load.add(weight);
 const grip=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));load.add(grip);
 const weightLabel=apparatusLabel('配重','#296789');weightLabel.scale.set(1,.24,1);weightLabel.position.set(.22,.12,0);load.add(weightLabel);
 const center=new THREE.Mesh(new THREE.SphereGeometry(.032,24,16),new THREE.MeshBasicMaterial({color:0xedb832,depthTest:false}));center.renderOrder=5;body.add(center);const gLabel=apparatusLabel('G · 重心','#926109');gLabel.scale.set(1.1,.24,1);gLabel.position.set(-.28,.11,0);center.add(gLabel);
 const footprint=new THREE.Mesh(new THREE.PlaneGeometry(1,bodyDepth),new THREE.MeshBasicMaterial({color:0x5aa993,transparent:true,opacity:.4,side:THREE.DoubleSide}));footprint.rotation.x=-Math.PI/2;footprint.position.y=.004;platform.add(footprint);
 const outline=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xce721e}));platform.add(outline);
 const shadowPoint=new THREE.Mesh(new THREE.SphereGeometry(.035,20,12),new THREE.MeshBasicMaterial({color:0xedb832}));platform.add(shadowPoint);
 const gravityLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xc38b0e,dashSize:.03,gapSize:.02}));scene.add(gravityLine);
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(),.3,0xb58314,.065,.035);scene.add(arrow);
 const edgeLabel=apparatusLabel('橙线内：原支撑面','#966027');edgeLabel.scale.set(1.4,.24,1);edgeLabel.position.set(0,-.16,.55);platform.add(edgeLabel);
 let current:BalanceInput={width:.6,tilt:12,loadX:0,loadY:.65,loadMass:2,bodyMass:2},released=false;
 function update(p:BalanceInput,fall:TippingState|null){current=p;released=!!fall;const r=solveBalance(p);platform.rotation.z=-p.tilt*Math.PI/180;
  const edge=fall?.edge??0;body.position.x=-edge;pivot.position.x=edge;pivot.rotation.z=-(fall?.phi??0);
  shell.scale.x=frame.scale.x=footing.scale.x=footprint.scale.x=p.width;
  load.position.set(p.loadX,p.loadY,0);center.position.set(r.cx,r.cy,0);
  const corners=[[-p.width/2,-bodyDepth/2],[p.width/2,-bodyDepth/2],[p.width/2,bodyDepth/2],[-p.width/2,bodyDepth/2],[-p.width/2,-bodyDepth/2]];
  outline.geometry.dispose();outline.geometry=new THREE.BufferGeometry().setFromPoints(corners.map(([x,z])=>new THREE.Vector3(x,.012,z)));
  const [cx,cy]=bodyPoint(r.cx,r.cy,fall?.phi??0,edge),q=cx+cy*Math.tan(p.tilt*Math.PI/180),[wx,wy]=platformPoint(cx,cy,p.tilt),[px,py]=platformPoint(q,0,p.tilt);
  shadowPoint.position.set(q,.014,0);(shadowPoint.material as THREE.MeshBasicMaterial).color.set(r.status==='unstable'?0xda6a37:0xedb832);
  gravityLine.geometry.dispose();gravityLine.geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(wx,wy,.002),new THREE.Vector3(px,py,.002)]);gravityLine.computeLineDistances();arrow.position.set(wx,wy,.01);arrow.setLength(Math.max(.1,Math.min(.45,(wy-py)*.7)),.06,.03);stage.render();
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),point=new THREE.Vector3();let active=-1,offsetX=0,offsetY=0;
 function ray(e:PointerEvent){const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);raycaster.setFromCamera(pointer,camera);}
 function local(){const a=current.tilt*Math.PI/180;return {x:point.x*Math.cos(a)-point.y*Math.sin(a),y:point.x*Math.sin(a)+point.y*Math.cos(a)};}
 function down(e:PointerEvent){ray(e);if(!raycaster.intersectObject(load,true).length)return;e.stopImmediatePropagation();e.preventDefault();if(released)move(current.loadX,current.loadY);if(!raycaster.ray.intersectPlane(plane,point))return;const p=local();offsetX=p.x-current.loadX;offsetY=p.y-current.loadY;active=e.pointerId;controls.enabled=false;canvas.setPointerCapture(active);canvas.focus();}
 function drag(e:PointerEvent){if(active!==e.pointerId)return;ray(e);if(raycaster.ray.intersectPlane(plane,point)){const p=local();move(p.x-offsetX,p.y-offsetY);}}
 function end(e:PointerEvent){if(active!==e.pointerId)return;controls.enabled=true;active=-1;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
 canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',drag);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 return {update,preset:stage.preset,dispose(){canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointermove',drag);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);stage.dispose();}};
}
