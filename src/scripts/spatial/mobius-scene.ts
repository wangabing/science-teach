import * as THREE from 'three';
import {stripPoint,stripNormal,stripWidth,cutSegments,paperRoute,type HalfTwists} from '../../lib/exploration/mobius';
import {createStage,disposeObject} from './stage';
export interface PaperState{twists:HalfTwists;progress:number;edge:boolean;cut:boolean;cutProgress:number;component:number;newEdge:boolean}
export function createMobiusScene(host:HTMLElement,lost:()=>void){
 const stage=createStage(host,0xeaf5f3,lost),paper=new THREE.Group(),trace=new THREE.Group();stage.scene.add(paper,trace);stage.frame(new THREE.Vector3(0,0,0),6.5);
 let signature='';
 const marker=new THREE.Mesh(new THREE.SphereGeometry(.10,20,16),new THREE.MeshStandardMaterial({color:0xf5b52f,emissive:0x7b4b00,roughness:.3}));stage.scene.add(marker);
 const cutter=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),new THREE.MeshBasicMaterial({color:0xc94e30}));stage.scene.add(cutter);
 const start=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshBasicMaterial({color:0x233c50}));stage.scene.add(start);
 function line(points:THREE.Vector3[],color:number,group:THREE.Group){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color}));group.add(line);}
 function points(n:HalfTwists,v:number,turn:number,start=0){return Array.from({length:241},(_,i)=>new THREE.Vector3(...stripPoint(n,start+i/240*turn,v)));}
 function band(n:HalfTwists,min:number,max:number,turn:number,color:number,start=0){
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[],steps=240,widthSteps=12;
  for(let i=0;i<=steps;i++)for(let j=0;j<=widthSteps;j++){positions.push(...stripPoint(n,start+i/steps*turn,min+(max-min)*j/widthSteps));uvs.push(i/steps,j/widthSteps);}
  for(let i=0;i<steps;i++)for(let j=0;j<widthSteps;j++){const a=i*(widthSteps+1)+j,b=a+widthSteps+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.68,metalness:.05}));paper.add(mesh);
  line(points(n,min,turn,start),0x294f60,paper);line(points(n,max,turn,start),0x294f60,paper);
 }
 function update(s:PaperState){const key=`${s.twists}:${s.cutProgress}`;
  if(key!==signature){signature=key;for(const child of [...paper.children]){paper.remove(child);disposeObject(child);}
   cutSegments(s.twists,s.cutProgress).forEach(b=>band(s.twists,b.min,b.max,b.turn,s.cut&&b.component===1?0x88a5de:0x63bdab,b.start));
   if(!s.cut){const seam=Array.from({length:20},(_,i)=>new THREE.Vector3(...stripPoint(s.twists,0,-stripWidth+i/19*stripWidth*2)));line(seam,0xffffff,paper);}
   if(s.cutProgress>0){line(points(s.twists,0,2*Math.PI*s.cutProgress),0xc94e30,paper);}
  }
  for(const child of [...trace.children]){trace.remove(child);disposeObject(child);}
  const {v,turn}=paperRoute(s.twists,s.cut,s.component,s.edge,s.newEdge);
  const lifted=(t:number,offset:number)=>new THREE.Vector3(...stripPoint(s.twists,t,v)).addScaledVector(new THREE.Vector3(...stripNormal(s.twists,t,v)),offset);
  const samples=Math.max(1,Math.ceil(s.progress*480));line(Array.from({length:samples+1},(_,i)=>lifted(s.progress*i/samples*turn,.015)),0xe79d19,trace);
  marker.position.copy(lifted(s.progress*turn,.07));start.position.copy(lifted(0,.04));
  marker.visible=start.visible=s.cutProgress===0||s.cut;cutter.visible=s.cutProgress>0&&!s.cut;cutter.position.set(...stripPoint(s.twists,2*Math.PI*s.cutProgress,0));stage.render();
 }
 return {update,preset:stage.preset,dispose:stage.dispose};
}
