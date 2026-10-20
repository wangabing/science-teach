export const TERMINALS = ['P','N','A1','B1','A2','B2'] as const;
export type Terminal = typeof TERMINALS[number];
export type Wire = [Terminal,Terminal];
export interface CircuitInput {emf:number; resistance:[number,number]; enabled:[boolean,boolean]; wires:Wire[]}
export const INTERNAL_RESISTANCE = 1;
export const CIRCUIT_VERSION = 'resistive-lamps-v1';
export const CIRCUIT_DEFAULTS:CircuitInput = {emf:6,resistance:[20,20],enabled:[true,true],wires:[['P','A1']]};
export const CIRCUIT_PRESETS:Record<'single'|'series'|'parallel',Wire[]> = {
  single:[['P','A1'],['B1','N']],
  series:[['P','A1'],['B1','A2'],['B2','N']],
  parallel:[['P','A1'],['B1','N'],['P','A2'],['B2','N']],
};
export const cloneCircuit = (p:CircuitInput):CircuitInput => ({emf:p.emf,resistance:[...p.resistance],enabled:[...p.enabled],wires:p.wires.map(w=>[...w])});
export function wireKey(w:Wire){return [...w].sort().join('–');}
export function validateCircuit(p:CircuitInput){
  if(!Number.isFinite(p.emf)||p.emf<3||p.emf>9)throw new RangeError('Invalid emf');
  if(p.resistance.length!==2||p.resistance.some(r=>!Number.isFinite(r)||r<10||r>40))throw new RangeError('Invalid resistance');
  if(p.enabled.length!==2||p.enabled.some(e=>typeof e!=='boolean'))throw new RangeError('Invalid lamp switch');
  if(!Array.isArray(p.wires)||p.wires.length>15)throw new RangeError('Invalid wires');
  const keys=new Set<string>();
  for(const w of p.wires){
    if(w.length!==2||w.some(t=>!TERMINALS.includes(t))||w[0]===w[1]||keys.has(wireKey(w)))throw new RangeError('Invalid wire');
    keys.add(wireKey(w));
  }
}
export interface LampReading {voltage:number|null; current:number; power:number; bypassed:boolean; floating:boolean}
export interface CircuitResult {
  potentials:Record<Terminal,number|null>;
  lamps:[LampReading,LampReading];
  current:number; voltage:number; sourcePower:number; internalPower:number; loadPower:number;
  shorted:boolean; open:boolean;
}

/** DC steady state: merge ideal wires, then solve the anchored resistor network. */
export function solveCircuit(p:CircuitInput):CircuitResult {
  validateCircuit(p);
  const parent=TERMINALS.map((_,i)=>i);
  const find=(i:number):number=>parent[i]===i?i:(parent[i]=find(parent[i]!));
  for(const [a,b] of p.wires)parent[find(TERMINALS.indexOf(a))]=find(TERMINALS.indexOf(b));
  const roots=TERMINALS.map((_,i)=>find(i)),nodes=[...new Set(roots)];
  const positive=roots[0]!,ground=roots[1]!,source=6;
  const edges:{a:number;b:number;r:number}[]=[{a:source,b:positive,r:INTERNAL_RESISTANCE}];
  for(let i=0;i<2;i++)if(p.enabled[i]&&roots[2+2*i]!==roots[3+2*i])edges.push({a:roots[2+2*i]!,b:roots[3+2*i]!,r:p.resistance[i]!});
  const anchored=new Set([source,ground]);
  let added=true;
  while(added){added=false;for(const {a,b} of edges)if(anchored.has(a)||anchored.has(b)){if(!anchored.has(a)||!anchored.has(b))added=true;anchored.add(a);anchored.add(b);}}
  const unknown=nodes.filter(n=>n!==ground&&anchored.has(n));
  const matrix=unknown.map(()=>Array<number>(unknown.length+1).fill(0));
  for(const {a,b,r} of edges){
    for(const [n,other] of [[a,b],[b,a]]){
      const i=unknown.indexOf(n!);if(i<0)continue;
      matrix[i]![i]!+=1/r;
      const j=unknown.indexOf(other!);
      if(j>=0)matrix[i]![j]!-=1/r;
      else if(other===source)matrix[i]![unknown.length]!+=p.emf/r;
    }
  }
  // Each included component has a fixed-potential anchor, so this matrix is nonsingular.
  for(let i=0;i<unknown.length;i++){
    let pivot=i;for(let j=i+1;j<unknown.length;j++)if(Math.abs(matrix[j]![i]!)>Math.abs(matrix[pivot]![i]!))pivot=j;
    [matrix[i],matrix[pivot]]=[matrix[pivot]!,matrix[i]!];
    const d=matrix[i]![i]!;if(Math.abs(d)<1e-12)throw new Error('Unanchored circuit matrix');
    for(let k=i;k<=unknown.length;k++)matrix[i]![k]!/=d;
    for(let j=0;j<unknown.length;j++)if(j!==i){const factor=matrix[j]![i]!;for(let k=i;k<=unknown.length;k++)matrix[j]![k]!-=factor*matrix[i]![k]!;}
  }
  const values=new Map<number,number>([[ground,0],[source,p.emf]]);
  unknown.forEach((n,i)=>values.set(n,matrix[i]![unknown.length]!));
  const clean=(v:number)=>Math.abs(v)<1e-10?0:v;
  const potentials=Object.fromEntries(TERMINALS.map((t,i)=>[t,anchored.has(roots[i]!)?clean(values.get(roots[i]!)!):null])) as Record<Terminal,number|null>;
  const lamps=[0,1].map(i=>{
    const a=potentials[TERMINALS[2+2*i]!],b=potentials[TERMINALS[3+2*i]!];
    const floating=a===null||b===null,voltage=floating?null:clean(a-b);
    const current=p.enabled[i]&&voltage!==null?clean(voltage/p.resistance[i]!):0;
    return {voltage,current,power:current*current*p.resistance[i]!,bypassed:roots[2+2*i]===roots[3+2*i],floating};
  }) as [LampReading,LampReading];
  const voltage=potentials.P!,current=clean((p.emf-voltage)/INTERNAL_RESISTANCE);
  return {potentials,lamps,current,voltage,sourcePower:p.emf*current,internalPower:current*current*INTERNAL_RESISTANCE,loadPower:lamps[0].power+lamps[1].power,shorted:positive===ground,open:current===0};
}

export function independentBranches(p:CircuitInput){
  const both=solveCircuit(p);
  if(!p.enabled.every(Boolean)||both.lamps.some(l=>l.power<1e-8))return false;
  return [0,1].every(i=>{const trial=cloneCircuit(p);trial.enabled[i]=false;return solveCircuit(trial).lamps[1-i]!.power>1e-8;});
}

export function compareCircuits(a:CircuitInput,b:CircuitInput){
  const changes:string[]=[];
  if(a.emf!==b.emf)changes.push(`电动势 ${a.emf}→${b.emf} V`);
  for(let i=0;i<2;i++){
    if(a.resistance[i]!==b.resistance[i])changes.push(`灯${i+1}电阻 ${a.resistance[i]}→${b.resistance[i]} Ω`);
    if(a.enabled[i]!==b.enabled[i])changes.push(`灯${i+1}接入状态改变`);
  }
  if(a.wires.map(wireKey).sort().join('|')!==b.wires.map(wireKey).sort().join('|'))changes.push('接线拓扑改变');
  const ra=solveCircuit(a),rb=solveCircuit(b);
  return `${changes.length?changes.join('；'):'条件相同'}。电源电流 ${ra.current.toFixed(3)}→${rb.current.toFixed(3)} A。${changes.length>1?'多个条件改变，不能归因于单一因素。':changes.length===1?'其余条件保持相同，可做对照。':'可检查读数是否一致。'}`;
}
export function circuitsCSV(records:CircuitInput[]){
  const header='model_version,wires,emf_V,internal_resistance_ohm,lamp1_R_ohm,lamp2_R_ohm,lamp1_connected,lamp2_connected,source_I_A,terminal_U_V,lamp1_I_A,lamp2_I_A,lamp1_U_V,lamp2_U_V,lamp1_P_W,lamp2_P_W,source_P_W,internal_P_W';
  return header+'\r\n'+records.map(p=>{
    const r=solveCircuit(p);
    return [CIRCUIT_VERSION,p.wires.map(wireKey).sort().join('|'),p.emf,INTERNAL_RESISTANCE,...p.resistance,...p.enabled,r.current,r.voltage,r.lamps[0].current,r.lamps[1].current,r.lamps[0].voltage??'floating',r.lamps[1].voltage??'floating',r.lamps[0].power,r.lamps[1].power,r.sourcePower,r.internalPower].join(',');
  }).join('\r\n')+'\r\n';
}
