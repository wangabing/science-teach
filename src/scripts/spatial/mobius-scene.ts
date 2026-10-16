import * as THREE from 'three';
import {stripPoint,stripNormal,stripWidth,topology,cutBands,type HalfTwists} from '../../lib/exploration/mobius';
import {createStage,disposeObject,labelSprite} from './stage';
export interface PaperState{twists:HalfTwists;progress:number;edge:boolean;cut:boolean}
export function createMobiusScene(host:HTMLElement,lost:()=>void){
 const stage=createStage(host,0xeaf5f3,lost),paper=new THREE.Group(),trace=new THREE.Group();stage.scene.add(paper,trace);stage.frame(new THREE.Vector3(0,0,0),6.5);
 let signature='';
 const marker=new THREE.Mesh(new THREE.SphereGeometry(.10,20,16),new THREE.MeshStandardMaterial({color:0xf5b52f,emissive:0x7b4b00,roughness:.3}));stage.scene.add(marker);
 const start=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshBasicMaterial({color:0x233c50}));stage.scene.add(start);
 function line(points:THREE.Vector3[],color:number,group:THREE.Group){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color}));group.add(line);}
 function points(n:HalfTwists,v:number,turn:number){return Array.from({length:241},(_,i)=>new THREE.Vector3(...stripPoint(n,i/240*turn,v)));}
 function band(n:HalfTwists,min:number,max:number,turn:number,color:number){
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[],steps=240,widthSteps=12;
  for(let i=0;i<=steps;i++)for(let j=0;j<=widthSteps;j++){positions.push(...stripPoint(n,i/steps*turn,min+(max-min)*j/widthSteps));uvs.push(i/steps,j/widthSteps);}
  for(let i=0;i<steps;i++)for(let j=0;j<widthSteps;j++){const a=i*(widthSteps+1)+j,b=a+widthSteps+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.68,metalness:.05}));paper.add(mesh);
  line(points(n,min,turn),0x294f60,paper);line(points(n,max,turn),0x294f60,paper);
 }
 function update(s:PaperState){const key=`${s.twists}:${s.cut}`;
  if(key!==signature){signature=key;for(const child of [...paper.children]){paper.remove(child);disposeObject(child);}if(s.cut){cutBands(s.twists).forEach((b,i)=>band(s.twists,b.min,b.max,b.turn,i===0?0x56bca9:0x88a5de));}else{band(s.twists,-stripWidth,stripWidth,2*Math.PI,0x63bdab);const seam=Array.from({length:20},(_,i)=>new THREE.Vector3(...stripPoint(s.twists,0,-stripWidth+i/19*stripWidth*2)));line(seam,0xffffff,paper);const label=labelSprite('接缝','#335667');label.scale.multiplyScalar(.6);label.position.set(3,.35,0);paper.add(label);}}
  for(const child of [...trace.children]){trace.remove(child);disposeObject(child);}
  const v=s.edge?stripWidth:stripWidth*.55,turn=topology(s.twists).circuits*2*Math.PI;
  const lifted=(t:number,offset:number)=>new THREE.Vector3(...stripPoint(s.twists,t,v)).addScaledVector(new THREE.Vector3(...stripNormal(s.twists,t,v)),offset);
  const samples=Math.max(1,Math.ceil(s.progress*480));line(Array.from({length:samples+1},(_,i)=>lifted(s.progress*i/samples*turn,.015)),0xe79d19,trace);
  marker.position.copy(lifted(s.progress*turn,.07));start.position.copy(lifted(0,.04));stage.render();
 }
 return {update,preset:stage.preset,dispose:stage.dispose};
}
