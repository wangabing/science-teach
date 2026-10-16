/** Rigid rectangular body and attached point load; SI units, no sliding. */
export const bodyHeight=1.2,bodyDepth=.5,gravity=9.81;
export interface BalanceInput {width:number;tilt:number;loadX:number;loadY:number;loadMass:number;bodyMass:number}
export interface TippingState {phi:number;omega:number;time:number;edge:number;landed:boolean}
export function validateBalance(p:BalanceInput){
 for(const v of Object.values(p))if(!Number.isFinite(v))throw new RangeError('Finite balance parameters required');
 if(p.width<=0||p.bodyMass<=0||p.loadMass<=0||Math.abs(p.tilt)>=85||Math.abs(p.loadX)>p.width/2+1e-10||p.loadY<0||p.loadY>bodyHeight)throw new RangeError('Invalid body, load or tilt');
}
export function solveBalance(p:BalanceInput){
 validateBalance(p);const mass=p.bodyMass+p.loadMass,cx=p.loadMass*p.loadX/mass,cy=(p.bodyMass*bodyHeight/2+p.loadMass*p.loadY)/mass;
 const theta=p.tilt*Math.PI/180,projection=cx+cy*Math.tan(theta),margin=p.width/2-Math.abs(projection);
 const status=margin>1e-9?'stable':margin< -1e-9?'unstable':'critical';
 const edge=projection>=0?p.width/2:-p.width/2;
 return {mass,cx,cy,projection,margin,status,edge,normal:mass*gravity*Math.cos(theta),moment:mass*gravity*Math.cos(theta)*margin,criticalRight:Math.atan2(p.width/2-cx,cy)*180/Math.PI,criticalLeft:Math.atan2(p.width/2+cx,cy)*180/Math.PI};
}
export function startTipping(p:BalanceInput):TippingState|null{const s=solveBalance(p);return s.status==='unstable'?{phi:0,omega:0,time:0,edge:s.edge,landed:false}:null;}
export function tippingInertia(p:BalanceInput,edge:number){validateBalance(p);if(!Number.isFinite(edge))throw new RangeError('Finite pivot required');return p.bodyMass*((p.width*p.width+bodyHeight*bodyHeight)/12+edge*edge+(bodyHeight/2)**2)+p.loadMass*((p.loadX-edge)**2+p.loadY*p.loadY);}
export function tippingEnergy(p:BalanceInput,s:TippingState){const r=solveBalance(p),a=p.tilt*Math.PI/180+s.phi;return .5*tippingInertia(p,s.edge)*s.omega*s.omega+r.mass*gravity*(-(r.cx-s.edge)*Math.sin(a)+r.cy*Math.cos(a));}
export function stepTipping(p:BalanceInput,s:TippingState,dt:number):TippingState{
 validateBalance(p);if(!Number.isFinite(dt)||dt<=0||![s.phi,s.omega,s.time,s.edge].every(Number.isFinite)||Math.abs(s.edge)!==p.width/2)throw new RangeError('Invalid tipping step');
 if(s.landed)return {...s};const r=solveBalance(p),inertia=tippingInertia(p,s.edge),theta=p.tilt*Math.PI/180;
 const acceleration=(phi:number)=>r.mass*gravity*((r.cx-s.edge)*Math.cos(theta+phi)+r.cy*Math.sin(theta+phi))/inertia;
 const count=Math.ceil(dt/(1/480)),h=dt/count;let {phi,omega,time}=s;
 for(let i=0;i<count;i++){const a=acceleration(phi),next=phi+omega*h+.5*a*h*h;const nextOmega=omega+.5*(a+acceleration(next))*h;
  if(Math.abs(next)>=Math.PI/2){const fraction=(Math.PI/2-Math.abs(phi))/(Math.abs(next)-Math.abs(phi));return {phi:Math.sign(next)*Math.PI/2,omega:0,time:time+h*fraction,edge:s.edge,landed:true};}
  phi=next;omega=nextOmega;time+=h;
 }
 return {phi,omega,time,edge:s.edge,landed:false};
}
/** Coordinates in the platform plane; clockwise relative rotation about a support edge. */
export function bodyPoint(x:number,y:number,phi=0,edge=0):[number,number]{return [edge+(x-edge)*Math.cos(phi)+y*Math.sin(phi),-(x-edge)*Math.sin(phi)+y*Math.cos(phi)];}
export function platformPoint(x:number,y:number,tilt:number):[number,number]{const a=tilt*Math.PI/180;return [x*Math.cos(a)+y*Math.sin(a),-x*Math.sin(a)+y*Math.cos(a)];}
