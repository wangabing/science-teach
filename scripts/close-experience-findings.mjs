// Run with Node 24; keeps the original report immutable and refuses incomplete reruns.
import fs from 'node:fs';
import {modelById} from '../src/lib/discovery/registry.ts';
import {probeResponses} from '../src/lib/discovery/experience-audit.ts';
import {responseEvidence} from '../src/lib/discovery/response-evidence.ts';
import {studios} from '../src/data/discovery-studios.ts';
const baseline=JSON.parse(fs.readFileSync('doc/assets/experience-audit/report.json','utf8'));
const latest=JSON.parse(fs.readFileSync('test-results/experience-closure-audit/report.json','utf8'));
if(!latest.summary.complete||latest.summary.screened!==baseline.summary.catalogTotal||latest.summary.functionalFailures)throw Error('Requires complete successful browser audit');
const rows=[];
for(const row of baseline.rows.filter(r=>r.findings.length)){
 const model=modelById(row.id),probes=probeResponses(model);
 for(const finding of row.findings){
  const keys=finding.kind==='primary-picture-static'?[studios.find(s=>s.id===row.id).compare]
   :[...new Set(row.probes.filter(p=>finding.kind==='unexplained-invariant'?(!p.metricsChanged&&!p.apparatusChanged&&!p.spatialChanged&&!p.curvesChanged):(p.metricsChanged&&!p.apparatusChanged&&!p.spatialChanged)).map(p=>p.key))];
  const checks=keys.map(key=>{
   const p=probes.filter(p=>p.key===key);
   if(!p.length||p.some(p=>p.error)||!p.some(p=>p.apparatusChanged||p.spatialChanged||p.responseChanged||p.rateChanged||p.curvesChanged))throw Error(`${row.id}.${key} unresolved`);
   return {key,apparatus:p.some(p=>p.apparatusChanged||p.spatialChanged),measurementEvidence:p.some(p=>p.responseChanged),processRate:p.some(p=>p.rateChanged),phases:[...new Set(p.map(p=>p.phase))]};
  });
  const browser=latest.rows.find(r=>r.id===row.id);
  if(browser.findings.length)throw Error(`${row.id}: browser findings remain`);
  rows.push({id:row.id,name:row.name,kind:finding.kind,original:finding.detail,resolution:responseEvidence[row.id].reason,checks,browser:browser.automated,evidence:browser.evidence});
 }
}
if(rows.length!==60)throw Error(`Expected 60, got ${rows.length}`);
fs.mkdirSync('doc/assets/experience-closure',{recursive:true});
fs.writeFileSync('doc/assets/experience-closure/resolutions.json',JSON.stringify({date:new Date().toISOString(),baseline:'../experience-audit/report.json',summary:{findings:rows.length,labs:new Set(rows.map(r=>r.id)).size},rows},null,2)+'\n');
fs.copyFileSync('test-results/experience-closure-audit/report.json','doc/assets/experience-closure/report.json');
fs.copyFileSync('test-results/experience-closure-audit/report.md','doc/experiment-experience-closure-audit.md');
const lines=['# 全量体验巡检问题修复记录','','原始140项筛查报告保持不变。本表逐条对应原来的60条候选线索、49个实验。真实学生试用和教师复核转至推广后反馈，本轮以产品操作、独立科学关系和浏览器巡检验收。','','## 修复方式','','- 对确实错误的装置表达修正世界线、面积/力箭头、温度颜色、保温层和播放速度。','- 对合理的固定形状，补充受力、能量、频谱、尺度等可见测量证据，并解释不变量。测量证据单独分类，不冒充真实形变或主装置几何变化。','- 比较默认态、过程态，以及摩擦/吸收所需条件；不以文字变化证明画面响应。','- 静态工作台增加具名参数扫描，明确不是物理时间；暂停、单步、减少动态、撤销和重置保留。', '- 回归额外发现并修复C10色块数千独立网格造成的三维初始化迟缓，以及手机下拉控件被观察窗遮挡、潮汐标记线截获拖动。另限制三维测量标签列宽，避免长单位重叠。首次失败及增量复测记录保留在报告中。','','## 逐条闭环','','| 实验 | 原始线索 | 核验控件 | 处理与科学边界 | 浏览器 |','| --- | --- | --- | --- | --- |'];
for(const r of rows)lines.push(`| ${r.id} ${r.name} | ${r.original.replaceAll('|','／')} | ${r.checks.map(c=>`${c.key}：${[c.apparatus?'装置变化':'',c.measurementEvidence?'测量图形变化':'',c.processRate?'播放速率变化':''].filter(Boolean).join('、')}`).join('<br>')} | ${r.resolution} | ${r.browser} |`);
lines.push('','原始线索与过程状态见 [resolutions.json](assets/experience-closure/resolutions.json)，本次全量浏览器结果见 [report.json](assets/experience-closure/report.json)。截图保存在报告所列test-results路径；它们是本地测试产物。','');
fs.writeFileSync('doc/experiment-experience-closure.md',lines.join('\n'));
console.log(`Closed ${rows.length} baseline findings across ${new Set(rows.map(r=>r.id)).size} labs`);
