export interface DividerInput {emf:number; upper:number; lower:number; load:number; loaded:boolean}
export const DIVIDER_DEFAULTS:DividerInput={emf:6,upper:1000,lower:1000,load:1000,loaded:false};
export function validateDivider(p:DividerInput){
  for(const [value,min,max] of [[p.emf,3,12],[p.upper,100,2000],[p.lower,100,2000],[p.load,200,5000]] as const)if(!Number.isFinite(value)||value<min||value>max)throw new RangeError('Invalid divider input');
  if(typeof p.loaded!=='boolean')throw new RangeError('Invalid load switch');
}
export function solveDivider(p:DividerInput){
  validateDivider(p);
  const effective=p.loaded?1/(1/p.lower+1/p.load):p.lower;
  const current=p.emf/(p.upper+effective),output=current*effective,upperVoltage=p.emf-output;
  const lowerCurrent=output/p.lower,loadCurrent=p.loaded?output/p.load:0;
  return {effective,current,output,upperVoltage,lowerCurrent,loadCurrent,unloaded:p.emf*p.lower/(p.upper+p.lower),upperPower:current*current*p.upper,lowerPower:lowerCurrent*lowerCurrent*p.lower,loadPower:loadCurrent*loadCurrent*p.load,sourcePower:p.emf*current};
}
export function compareDividers(a:DividerInput,b:DividerInput){
  const labels:Record<keyof DividerInput,string>={emf:'电源',upper:'上电阻',lower:'下电阻',load:'负载电阻',loaded:'负载接入'};
  const keys=(Object.keys(labels) as (keyof DividerInput)[]).filter(k=>a[k]!==b[k]);
  return `${keys.map(k=>`${labels[k]} ${a[k]}→${b[k]}`).join('；')||'条件相同'}。输出 ${solveDivider(a).output.toFixed(3)}→${solveDivider(b).output.toFixed(3)} V。${keys.length>1?'多个条件改变，不能归因于单一因素。':keys.length===1?'其余条件保持相同，可做对照。':'读数应一致。'}`;
}
export function dividerCSV(records:DividerInput[]){
  const header='model_version,emf_V,upper_R_ohm,lower_R_ohm,load_R_ohm,load_connected,output_U_V,source_I_A,lower_I_A,load_I_A,upper_P_W,lower_P_W,load_P_W,source_P_W';
  return header+'\r\n'+records.map(p=>{const r=solveDivider(p);return ['loaded-divider-v1',p.emf,p.upper,p.lower,p.load,p.loaded,r.output,r.current,r.lowerCurrent,r.loadCurrent,r.upperPower,r.lowerPower,r.loadPower,r.sourcePower].join(',');}).join('\r\n')+'\r\n';
}

export type RCMode='charge'|'hold'|'discharge';
export interface RCInput {emf:number; resistance:number; capacitance:number} // capacitance in µF
export interface RCState {time:number; voltage:number; sourceWork:number; heat:number; mode:RCMode}
export interface RCRecord {input:RCInput; state:RCState}
export const RC_DEFAULTS:RCInput={emf:6,resistance:1000,capacitance:1000};
export const RC_MODES:RCMode[]=['charge','hold','discharge'];
export const initialRC=():RCState=>({time:0,voltage:0,sourceWork:0,heat:0,mode:'charge'});
export function validateRC(p:RCInput,s?:RCState){
  for(const [value,min,max] of [[p.emf,3,9],[p.resistance,500,5000],[p.capacitance,200,2000]] as const)if(!Number.isFinite(value)||value<min||value>max)throw new RangeError('Invalid RC input');
  if(s){
    if(!RC_MODES.includes(s.mode)||[s.time,s.voltage,s.sourceWork,s.heat].some(v=>!Number.isFinite(v)||v<0)||s.voltage>p.emf+1e-9)throw new RangeError('Invalid RC state');
    const energy=.5*p.capacitance*1e-6*s.voltage*s.voltage;
    if(Math.abs(s.sourceWork-energy-s.heat)>1e-8*Math.max(1,s.sourceWork))throw new RangeError('Unbalanced RC history');
  }
}
export function readRC(p:RCInput,s:RCState){
  validateRC(p,s);const c=p.capacitance*1e-6;
  return {tau:p.resistance*c,current:s.mode==='hold'?0:((s.mode==='charge'?p.emf:0)-s.voltage)/p.resistance,charge:c*s.voltage,energy:.5*c*s.voltage*s.voltage,voltage:s.voltage};
}
export function advanceRC(p:RCInput,s:RCState,dt:number):RCState {
  validateRC(p,s);if(!Number.isFinite(dt)||dt<0||!Number.isFinite(s.time+dt))throw new RangeError('Invalid RC time step');
  if(s.mode==='hold')return {...s,time:s.time+dt};
  const c=p.capacitance*1e-6,target=s.mode==='charge'?p.emf:0;
  const dv=(target-s.voltage)*(-Math.expm1(-dt/(p.resistance*c))),voltage=s.voltage+dv;
  const deltaEnergy=.5*c*dv*(s.voltage+voltage),work=s.mode==='charge'?c*p.emf*dv:0;
  return {...s,time:s.time+dt,voltage,sourceWork:s.sourceWork+work,heat:s.heat+Math.max(0,work-deltaEnergy)};
}
export function cloneRCRecord(record:RCRecord):RCRecord{return {input:{...record.input},state:{...record.state}};}
export function compareRC(a:RCRecord,b:RCRecord){
  const labels:Record<keyof RCInput,string>={emf:'电源 V',resistance:'电阻 Ω',capacitance:'电容 µF'};
  const changes=(Object.keys(labels) as (keyof RCInput)[]).filter(k=>a.input[k]!==b.input[k]);
  return `${changes.map(k=>`${labels[k]} ${a.input[k]}→${b.input[k]}`).join('；')||'元件参数相同'}。时刻 ${a.state.time.toFixed(2)}→${b.state.time.toFixed(2)} s；挡位 ${a.state.mode}→${b.state.mode}；电压 ${a.state.voltage.toFixed(3)}→${b.state.voltage.toFixed(3)} V。${changes.length>1?'多个参数改变；':''}${a.state.time!==b.state.time||a.state.mode!==b.state.mode?'时间或挡位不同，不能当作单变量参数对照。':'同刻同挡位；仍需确认起始电压和此前切挡过程相同。'}`;
}
export function rcCSV(records:RCRecord[]){
  const header='model_version,emf_V,R_ohm,C_F,mode,time_s,capacitor_U_V,current_A,plate_charge_C,stored_energy_J,source_work_J,resistor_heat_J,tau_s';
  return header+'\r\n'+records.map(({input:p,state:s})=>{const r=readRC(p,s);return ['ideal-rc-v1',p.emf,p.resistance,p.capacitance*1e-6,s.mode,s.time,s.voltage,r.current,r.charge,r.energy,s.sourceWork,s.heat,r.tau].join(',');}).join('\r\n')+'\r\n';
}
