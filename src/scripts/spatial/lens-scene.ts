import * as THREE from 'three';
import {createStage,disposeObject,labelSprite} from './stage';
import {solveLens,rayHeights,type LensInput} from '../../lib/exploration/lens';
export function createLensScene(host:HTMLElement,change:(id:string,v:number)=>void,lost:()=>void){
 const stage=createStage(host,0x102a40,lost),{scene,canvas,controls,camera}=stage;
 const unit=.18,axis=1.7;let state:LensInput={focal:10,object:30,screen:15,height:2},extent=0,view='perspective';
 const metal=new THREE.MeshStandardMaterial({color:0x507089,metalness:.6,roughness:.35});
 function box(x:number,y:number,z:number,material:THREE.Material){return new THREE.Mesh(new THREE.BoxGeometry(x,y,z),material);}
 const rail=box(1,.13,.45,metal);rail.position.set(0,.18,0);scene.add(rail);
 const object=new THREE.Group(),screen=new THREE.Group();scene.add(object,screen);
 for(const group of [object,screen]){const foot=box(.55,.15,.75,metal);foot.position.y=.32;const stem=box(.09,1,.09,metal);stem.position.y=.8;group.add(foot,stem);}
 const lampCanvas=document.createElement('canvas');lampCanvas.width=256;lampCanvas.height=256;const lampCtx=lampCanvas.getContext('2d')!;lampCtx.fillStyle='#ffd662';lampCtx.fillRect(48,0,48,256);lampCtx.fillRect(48,0,168,48);lampCtx.fillRect(48,110,130,44);
 const lampMap=new THREE.CanvasTexture(lampCanvas);const glyph=new THREE.Mesh(new THREE.PlaneGeometry(.28,.36),new THREE.MeshBasicMaterial({map:lampMap,transparent:true,side:THREE.DoubleSide}));glyph.rotation.y=Math.PI/2;glyph.position.set(0,axis+.18,0);object.add(glyph);
 const frameMaterial=new THREE.MeshStandardMaterial({color:0x486a86,metalness:.4,roughness:.4});
 for(const z of [-.42,.42]){const bar=box(.08,.9,.06,frameMaterial);bar.position.set(0,axis,z);object.add(bar);}for(const y of [-.42,.42]){const bar=box(.08,.06,.9,frameMaterial);bar.position.set(0,axis+y,0);object.add(bar);}
 const projectionCanvas=document.createElement('canvas');projectionCanvas.width=512;projectionCanvas.height=512;const ctx=projectionCanvas.getContext('2d')!;const texture=new THREE.CanvasTexture(projectionCanvas);texture.colorSpace=THREE.SRGBColorSpace;
 const paper=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));paper.rotation.y=-Math.PI/2;paper.position.y=axis;screen.add(paper);
 for(const z of [-1.23,1.23]){const bar=box(.10,2.5,.07,metal);bar.position.set(0,axis,z);screen.add(bar);}for(const y of [-1.23,1.23]){const bar=box(.10,.07,2.5,metal);bar.position.set(0,axis+y,0);screen.add(bar);}
 const lens=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshPhysicalMaterial({color:0x6cdaef,transparent:true,opacity:.27,roughness:.08,metalness:.1,side:THREE.DoubleSide,depthWrite:false}));lens.scale.set(.10,1.2,1.2);lens.position.y=axis;scene.add(lens);
 const holder=box(.10,1,.10,metal);holder.position.y=.7;scene.add(holder);
 const objLabel=labelSprite('发光物体 F','#ffdb75'),screenLabel=labelSprite('移动光屏','#9de3ff'),lensLabel=labelSprite('凸透镜');objLabel.position.y=3.25;screenLabel.position.y=3.25;lensLabel.position.set(0,3.4,0);object.add(objLabel);screen.add(screenLabel);scene.add(lensLabel);
 const overlay=new THREE.Group();scene.add(overlay);
 function line(points:number[][],color:number,dashed=false){const geo=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0]!*unit,axis+p[1]!*unit,p[2]??0)));const l=new THREE.Line(geo,dashed?new THREE.LineDashedMaterial({color,dashSize:.12,gapSize:.10}):new THREE.LineBasicMaterial({color}));if(dashed)l.computeLineDistances();overlay.add(l);}
 function update(p:LensInput,extensions:boolean){state=p;const r=solveLens(p);object.position.x=-p.object*unit;screen.position.x=p.screen*unit;
 const left=Math.max(p.object,2*p.focal)+5,right=Math.max(p.screen,2*p.focal)+5;
 rail.scale.x=(left+right)*unit;rail.position.x=(right-left)*unit/2;
 // Only refit after a material change in the apparatus span, never every animation frame.
 const span=(left+right)*unit;if(view==='screen'){stage.frame(new THREE.Vector3(p.screen*unit,axis,0),4.2);}else if(Math.abs(span-extent)>extent*.18||extent===0){extent=span;stage.frame(new THREE.Vector3((right-left)*unit/2,1.5,0),Math.max(8.5,span*.95));}
 for(const child of [...overlay.children]){overlay.remove(child);disposeObject(child);}
 for(const [i,color] of [0xffd25d,0x6ae1d1].entries()){const ys=r.screenHeights;line([[-p.object,p.height],[0,i===0?p.height:0],[p.screen,ys[i]!]],color);if(!r.real&&r.image!==null&&extensions){const end=Math.max(-left,r.image);line([[0,i===0?p.height:0],[end,rayHeights(p,end)[i]!]],0xbda5ef,true);}}
 for(const f of [-2,-1,1,2]){const dot=new THREE.Mesh(new THREE.SphereGeometry(.035),new THREE.MeshBasicMaterial({color:0xa2c3d2}));dot.position.set(p.focal*f*unit,axis,0);overlay.add(dot);const label=labelSprite(Math.abs(f)===2?'2F':'F');label.scale.multiplyScalar(.5);label.position.set(p.focal*f*unit,axis-.35,.12);overlay.add(label);}
 if(r.regime==='virtual'&&extensions&&r.image!==null&&Math.abs(r.image)<=left){line([[r.image,0],[r.image,r.imageHeight!]],0xbda5ef,true);const label=labelSprite('虚像 · 反向追溯','#cbb6f3');label.position.set(r.image*unit,axis+Math.min(1.2,r.imageHeight!*unit)+.5,0);overlay.add(label);}
 ctx.fillStyle='#edf4fa';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#c4d5e4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(256,20);ctx.lineTo(256,492);ctx.moveTo(20,256);ctx.lineTo(492,256);ctx.stroke();
 if(r.real){ctx.save();ctx.translate(256,256);ctx.scale(1,-1);/* Opposing object/screen planes reverse their horizontal UV axis. */const magnification=p.screen/p.object;const height=p.height*unit/2.4*512*magnification;ctx.filter=`brightness(.65) blur(${r.focused?0:Math.min(40,4+r.separation*12)}px)`;ctx.fillStyle='#d29418';const width=height*.28/.36;ctx.drawImage(lampCanvas,-width/2,-height,width,height);ctx.restore();}else{ctx.fillStyle='#ecd495';ctx.beginPath();ctx.ellipse(256,256,110,95,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#42586c';ctx.textAlign='center';ctx.font='22px sans-serif';ctx.fillText('无清晰投影',256,445);}
 texture.needsUpdate=true;stage.render();
 }
 const caster=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3();let dragging='',active=-1,offset=0;
 function ray(e:PointerEvent){const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);caster.setFromCamera(pointer,camera);}
 function down(e:PointerEvent){ray(e);const objHit=caster.intersectObject(object,true),scrHit=caster.intersectObject(screen,true);if(!objHit.length&&!scrHit.length)return;e.stopImmediatePropagation();e.preventDefault();dragging=objHit.length&&(!scrHit.length||objHit[0]!.distance<scrHit[0]!.distance)?'object-distance':'screen-distance';active=e.pointerId;controls.enabled=false;plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),new THREE.Vector3(dragging==='object-distance'?-state.object*unit:state.screen*unit,axis,0));if(caster.ray.intersectPlane(plane,hit))offset=hit.x-(dragging==='object-distance'?-state.object*unit:state.screen*unit);canvas.setPointerCapture(e.pointerId);canvas.focus();}
 function move(e:PointerEvent){if(!dragging||e.pointerId!==active)return;ray(e);if(caster.ray.intersectPlane(plane,hit))change(dragging,(hit.x-offset)/unit*(dragging==='object-distance'?-1:1));}
 function up(e:PointerEvent){if(e.pointerId!==active)return;dragging='';active=-1;controls.enabled=true;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
 canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 function preset(name:string){view=name;extent=0;update(state,document.getElementById('show-extensions') instanceof HTMLInputElement&&(document.getElementById('show-extensions') as HTMLInputElement).checked);stage.preset(name);}
 return {update,preset,dispose(){canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);stage.dispose();}};
}
