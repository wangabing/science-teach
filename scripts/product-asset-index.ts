import {mkdirSync,writeFileSync} from 'node:fs';
import {experiments} from '../src/data/labs.ts';
import {curation,pilotSlugs} from '../src/data/curation.ts';
import {studios} from '../src/data/discovery-studios.ts';
import {modelById} from '../src/lib/discovery/registry.ts';
const independent:Record<string,{fields:string[];boundary:string}>={
 buoyancy:{fields:['immersion','liquid'],boundary:'暂停并重算排水、浮力和测力计'},
 pendulum:{fields:['length','mass','angle','gravity','damping'],boundary:'恢复释放初态，清轨迹与测量曲线'},
 lens:{fields:['focal','object','screen','extensions'],boundary:'保留既有六记录；本机发现清独立调焦资格'},
 interference:{fields:['wavelength','separation','phase','x','y','mode'],boundary:'暂停，t=0，清静点任务与迁移答案'},
 circuits:{fields:['emf','resistance','enabled','wires'],boundary:'校验端点/唯一无向边，重算，清独立接线资格'},
 resistors:{fields:['emf','upper','lower','load','loaded'],boundary:'重算，清独立调阻资格'},
 capacitors:{fields:['input','state'],boundary:'能量账本校验；暂停，仅当前曲线点，不补过去轨迹'},
 area:{fields:['a','b','selected','hints','pieces'],boundary:'按所属拼板归一化坐标跨尺寸恢复，重新判定归位'},
 sections:{fields:['tilt','azimuth','offset'],boundary:'重算截面，清任务'},
 mobius:{fields:['twists','progress','edge','cut','cutProgress','component','newEdge'],boundary:'校验剪切/分量兼容，暂停，清预测'},
 reflection:{fields:['kind','ax','ay','bx','by','p','limited','helper'],boundary:'校验kind/范围，重算，清任务/笔迹'},
 'circle-angles':{fields:['kind','alpha','theta','helper'],boundary:'校验kind/范围，重算，清任务/笔迹'},
 'triangle-rigidity':{fields:['kind','ab','ac','bc','angle','side','locked','helper'],boundary:'保留不可构造反例，重算，清任务/笔迹'},
 'ellipse-string':{fields:['kind','a','c','theta','helper'],boundary:'保留退化反例，重算，清任务/笔迹'},
 moon:{fields:['phase','inclination','node','distance'],boundary:'暂停，重算受光/阴影，清交点任务资格'},
 orbit:{fields:['speed','angle'],boundary:'恢复发射初态，清轨迹'},
 'three-body':{fields:['perturbation','star-mass','velocity-scale','preset'],boundary:'恢复两组初态，清轨迹'},
 bridge:{fields:['members','load','loadNode'],boundary:'校验杆集合，重算，不计独立搭建'},
 balance:{fields:['width','tilt','loadX','loadY','loadMass','bodyMass'],boundary:'动态横向边界，恢复夹持姿态，结束任务/高度对照/迁移'},
 gears:{fields:['input-teeth','idler-teeth','output-teeth','rpm','idler'],boundary:'整数齿数，暂停，累计圈数归零'},
};
const records=experiments.map(e=>{
 const guide=curation[e.slug]!,studio=studios.find(s=>s.slug===e.slug),pilot=pilotSlugs.includes(e.slug);
 return {slug:e.slug,name:e.name,space:e.space,href:e.href,goal:guide.goal,firstTarget:guide.target,
 automated:{status:'refer-to-current-validation',source:'doc/assets/product-coverage/validation.json',browserCase:`${e.slug}: mobile guidance and durable conditions roundtrip`},
 editorial:{status:pilot?'reviewed-for-pilot':'source-derived-guidance',note:guide.suitable},
 scientific:{status:guide.model.checkKind==='authored-comparison'?'authored-scenario-comparison':'analytic-reference-specified',check:guide.model.check,externalReview:'not-verified'},
 source:{href:guide.model.source,role:guide.model.location,linkReachability:'not-rechecked-in-this-change',formulaApplicability:'not-externally-reviewed'},
 curriculum:{status:'not-verified'},externalFeedback:{status:'deferred',todo:'doc/product-followup-todo.md'},recommendation:guide.featured?'starting-point':'catalog',
 persistence:studio?{adapter:'shared-workbench',fields:modelById(studio.id).controls.map(c=>c.key),boundary:'暂停、白名单/范围/枚举校验、重算、清独立资格；连续量不强制步长'}:{adapter:'independent',...independent[e.slug]},
 currentValidation:'doc/assets/product-coverage/validation.json'};
});
if(records.length!==140||Object.keys(curation).length!==140||new Set(records.map(r=>r.slug)).size!==140||records.some(r=>!r.persistence.fields))throw new Error('Catalog coverage mismatch');
mkdirSync('doc/assets/product-coverage',{recursive:true});
writeFileSync('doc/assets/product-coverage/asset-index.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'Guidance and local engineering coverage. Source availability, formula applicability, external scientific/curriculum review and learner validation are separate states.',records},null,2)+'\n');
console.log(`Indexed ${records.length} experiments`);
