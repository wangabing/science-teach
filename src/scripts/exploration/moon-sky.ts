import {add,scale,dot,occultation,MOON_RADIUS,type MoonResult} from '../../lib/exploration/moon';
/** Fixed near-side texture coordinates; north-up geocentric teaching view, no libration. */
export function createSkyPainter(moonCanvas:HTMLCanvasElement,sunCanvas:HTMLCanvasElement,ready:()=>void,failed:()=>void){
 const size=224,radius=100,ctx=moonCanvas.getContext('2d')!,sunCtx=sunCanvas.getContext('2d')!;moonCanvas.width=moonCanvas.height=size;sunCanvas.width=sunCanvas.height=size;
 let texture:ImageData|undefined,disposed=false;
 const samples:Array<{index:number;nx:number;ny:number;nz:number;tx:number;ty:number}>=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=(x+.5-size/2)/radius,ny=(size/2-y-.5)/radius,d=nx*nx+ny*ny;if(d>1)continue;const nz=Math.sqrt(1-d),u=((.5+Math.atan2(nx,nz)/(2*Math.PI))%1+1)%1,v=.5-Math.asin(ny)/Math.PI;samples.push({index:(y*size+x)*4,nx,ny,nz,tx:u,ty:v});}
 const image=new Image();image.onload=()=>{if(disposed)return;const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const g=c.getContext('2d')!;g.drawImage(image,0,0);texture=g.getImageData(0,0,c.width,c.height);ready();};image.onerror=()=>{if(!disposed)failed();};image.src='/textures/astronomy/moon-lroc.jpg';
 function moon(r:MoonResult){const pixels=ctx.createImageData(size,size),out=pixels.data;for(const s of samples){
  const normal=add(add(scale(r.right,s.nx),scale(r.up,s.ny)),scale(r.towardEarth,s.nz)),light=Math.max(0,dot(normal,r.towardSun));
  const hidden=r.lunar.type==='none'?0:occultation(add(r.moon,scale(normal,MOON_RADIUS)),[0,0,0],1).coverage;
  const lit=.018+.95*light*(1-hidden),red=hidden*light;const colors=[lit+.20*red,lit+.033*red,lit+.012*red];
  const t=texture,ti=t?(Math.min(t.height-1,Math.floor(s.ty*t.height))*t.width+Math.min(t.width-1,Math.floor(s.tx*t.width)))*4:0;
  for(let j=0;j<3;j++){const base=t?t.data[ti+j]!/255:.63;out[s.index+j]=Math.round(255*Math.pow(Math.pow(base,2.2)*colors[j]!,1/2.2));}out[s.index+3]=255;
 }ctx.clearRect(0,0,size,size);ctx.putImageData(pixels,0,0);}
 function sun(r:MoonResult){sunCtx.clearRect(0,0,size,size);const c=size/2,R=76;
  if(r.solar.type==='total'){const glow=sunCtx.createRadialGradient(c,c,R*.85,c,c,R*1.3);glow.addColorStop(0,'rgba(255,235,198,.65)');glow.addColorStop(1,'rgba(255,235,198,0)');sunCtx.fillStyle=glow;sunCtx.fillRect(0,0,size,size);}
  const glow=sunCtx.createRadialGradient(c-20,c-20,0,c,c,R);glow.addColorStop(0,'#fff3cf');glow.addColorStop(1,'#ffbe63');sunCtx.fillStyle=glow;sunCtx.beginPath();sunCtx.arc(c,c,R,0,Math.PI*2);sunCtx.fill();
  if(r.solar.coverage>0){const dx=Math.atan2(r.moon[2],r.moon[0]-1)*R/r.solar.sunRadius,dy=-Math.atan2(r.moon[1],Math.hypot(r.moon[0]-1,r.moon[2]))*R/r.solar.sunRadius,rm=r.solar.blockerRadius*R/r.solar.sunRadius;sunCtx.fillStyle='#091b30';sunCtx.beginPath();sunCtx.arc(c+dx,c+dy,rm,0,2*Math.PI);sunCtx.fill();}
 }
 return {paint(r:MoonResult){if(!disposed){moon(r);sun(r);}},dispose(){disposed=true;image.onload=image.onerror=null;texture=undefined;}};
}
