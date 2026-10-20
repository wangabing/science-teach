export type WaveMode = 'both' | 'one' | 'two';
export interface WaveInput { wavelength:number; separation:number; phase:number; x:number; y:number; mode:WaveMode }
export const WAVE_DEFAULTS:WaveInput={wavelength:4,separation:6,phase:0,x:0,y:0,mode:'both'};
export const WAVE_FREQUENCY=1, WAVE_AMPLITUDE=1;
export function validateWave(p:WaveInput,time=0){
 const limits:[keyof Omit<WaveInput,'mode'>,number,number][]=[['wavelength',2,6],['separation',2,10],['phase',0,360],['x',-12,12],['y',-8,8]];
 for(const [key,min,max] of limits)if(!Number.isFinite(p[key])||p[key]<min||p[key]>max)throw new RangeError(`Invalid ${key}`);
 if(!['both','one','two'].includes(p.mode)||!Number.isFinite(time)||time<0)throw new RangeError('Invalid mode or time');
}
export function wavePhases(p:WaveInput){
 validateWave(p);
 const r1=Math.hypot(p.x+p.separation/2,p.y),r2=Math.hypot(p.x-p.separation/2,p.y);
 return {r1,r2,a:2*Math.PI*r1/p.wavelength,b:2*Math.PI*r2/p.wavelength+p.phase*Math.PI/180};
}
export function waveAt(p:WaveInput,time:number){
 validateWave(p,time);const {r1,r2,a,b}=wavePhases(p),t=2*Math.PI*WAVE_FREQUENCY*time;
 const one=p.mode==='two'?0:WAVE_AMPLITUDE*Math.sin(a-t),two=p.mode==='one'?0:WAVE_AMPLITUDE*Math.sin(b-t);
 return {r1,r2,pathDifference:r2-r1,one,two,sum:one+two,amplitude:p.mode==='both'?2*WAVE_AMPLITUDE*Math.abs(Math.cos((b-a)/2)):WAVE_AMPLITUDE};
}
export interface WaveRecord { input:WaveInput; time:number }
export function waveCSV(records:WaveRecord[]){
 const header='model_version,mode,wavelength_cm,separation_cm,phase_deg,probe_x_cm,probe_y_cm,time_s,frequency_Hz,source_amplitude_mm,r1_cm,r2_cm,u1_mm,u2_mm,sum_mm,amplitude_mm';
 return header+'\r\n'+records.map(({input:p,time})=>{const r=waveAt(p,time);return ['equal-amplitude-v1',p.mode,p.wavelength,p.separation,p.phase,p.x,p.y,time,WAVE_FREQUENCY,WAVE_AMPLITUDE,r.r1,r.r2,r.one,r.two,r.sum,r.amplitude].join(',');}).join('\r\n')+'\r\n';
}
export function compareWave(a:WaveRecord,b:WaveRecord){
 const labels:Record<keyof WaveInput,string>={mode:'波源模式',wavelength:'波长',separation:'源距',phase:'相位',x:'探针x',y:'探针y'};
 const changed=(Object.keys(labels) as (keyof WaveInput)[]).filter(k=>a.input[k]!==b.input[k]);
 return `条件改变：${changed.map(k=>`${labels[k]} ${a.input[k]}→${b.input[k]}`).join('、')||'无'}；时间 ${a.time.toFixed(2)}→${b.time.toFixed(2)} s。整周期振幅 ${waveAt(a.input,a.time).amplitude.toFixed(3)}→${waveAt(b.input,b.time).amplitude.toFixed(3)} mm。${changed.length>1?'多个条件改变，不能归因于单一因素。':changed.length===1?'只有一个条件改变，可据此对照。':'条件相同，可区分时间变化与振幅不变。'}`;
}
