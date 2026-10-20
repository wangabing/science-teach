import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {experiments} from '../../src/data/labs';
import {studios} from '../../src/data/discovery-studios';
import {modelById} from '../../src/lib/discovery/registry';
import {probeResponses} from '../../src/lib/discovery/experience-audit';
import {experienceById} from '../../src/data/discovery-experiences';
const directory=process.env.EXPERIENCE_AUDIT_DIR??'test-results/experience-audit';
type Finding={level:'P0'|'P1'|'P2'|'P3';kind:string;detail:string;confirmed:boolean};
type Row={slug:string;name:string;href:string;id?:string;task:string;firstAction:string;automated:string;studentTask:string;teachingReview:string;findings:Finding[];probes:ReturnType<typeof probeResponses>;evidence:string[];spatialOperation:string;demonstration:string;verifiedBaseURL?:string;previousFindings?:Finding[];recheckedAt?:string};
const legacyTasks:Record<string,string>={buoyancy:'调密度与浸入深度，比较排水体积、浮力与测力计。',pendulum:'释放摆球，比较摆长/质量对周期和能量的影响。',lens:'调物距与光屏，找到实像并解释虚像边界。',interference:'移动探针和改相位，比较分波与合成振幅。',circuits:'连接串并联电路，断开一盏灯观察另一盏。',resistors:'把6V分压至3V，再接负载比较输出。',capacitors:'充放电并比较电阻对时间常数的影响。',area:'剪拼图形，核对面积不变。',sections:'移动截平面，解释截面形状变化。',mobius:'追踪边界并预测沿中线切开结果。',reflection:'移动折点，解释镜像最短路径。','circle-angles':'移动顶点，对比同弧角与跨弧反例。','triangle-rigidity':'转杆再锁第三边，解释全等与退化。','ellipse-string':'改焦距和绳长，核对距离和不变。',moon:'改变轨道倾角，比较月相与食。',orbit:'改变发射速度，比较落地、绕行和逃逸。','three-body':'运行两个近似初态，比较分离和数值误差。',bridge:'连杆并加载，检查稳定性与受力。',balance:'移动配重后倾斜释放，判断翻倒边界。',gears:'组合齿轮，核对转向、速比与扭矩。'};
async function save(rows:Row[],complete:boolean){
 const risks=rows.flatMap(r=>r.findings);
 const summary={catalogTotal:experiments.length,screened:rows.length,complete,functionalFailures:rows.filter(r=>r.automated==='失败').length,candidateFindings:risks.filter(f=>!f.confirmed).length,confirmedFindings:risks.filter(f=>f.confirmed).length,studentTasksDeferred:rows.length,teachingReviewsDeferred:rows.length};
 await fs.writeFile(path.join(directory,'report.json'),JSON.stringify({date:new Date().toISOString(),baseURL:process.env.BROWSER_CHECK_URL,summary,limitations:['技术筛查通过不等于教学体验合格','几何变化不证明科学现象正确','专用20项仍须运行各自完整任务','未执行师生课堂或教师评审'],rows},null,2));
 const esc=(v:string)=>v.replaceAll('|','／').replaceAll('\n',' ');
 const lines=['# 全站实验体验风险筛查','',`已筛查 ${rows.length}/${experiments.length} 项；${complete?'本次运行完成':'运行中，结果不完整'}。功能失败 ${summary.functionalFailures} 项，候选问题 ${summary.candidateFindings} 条，已确认问题 ${summary.confirmedFindings} 条。`,'','真实学生任务与教学复核移至推广后反馈，不阻塞产品修复验收；本报告不声称教学复核通过。见同目录report.json中的逐控件探测和证据路径。','','| 实验 | 学习任务 | 自动巡检 | 现象风险 | 三维对象操作 | 演示 | 任务/教学审阅 |','| --- | --- | --- | --- | --- | --- | --- |'];
 for(const r of rows)lines.push(`| ${r.id??r.slug} ${esc(r.name)} | ${esc(r.task)} | ${r.automated} | ${r.findings.map(f=>`${f.level} ${f.confirmed?'确认':'候选'}：${esc(f.detail)}`).join('<br>')||'本次未检出产品风险'} | ${r.spatialOperation} | ${r.demonstration} | 推广后反馈 / 推广后反馈 |`);
 await fs.writeFile(path.join(directory,'report.md'),lines.join('\n')+'\n');
}
test('screen all experiments for observable response and task review risks',async({browser})=>{
 await fs.mkdir(directory,{recursive:true});
 const selected=process.env.EXPERIENCE_AUDIT_IDS?.split(',');
 const previous=selected?JSON.parse(await fs.readFile(path.join(directory,'report.json'),'utf8')):undefined;
 if(selected)expect(previous.summary.complete,'增量复测必须建立在完整巡检之后').toBe(true);
 const rows:Row[]=previous?previous.rows.map((r:Row)=>({...r,verifiedBaseURL:r.verifiedBaseURL??previous.baseURL})):[];
 for(const experiment of experiments.filter(e=>!selected||selected.includes(studios.find(s=>s.slug===e.slug)?.id??e.slug))){
  const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage();
  const studio=studios.find(s=>s.slug===experiment.slug),model=studio?modelById(studio.id):undefined;
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const row:Row={verifiedBaseURL:process.env.BROWSER_CHECK_URL,slug:experiment.slug,name:experiment.name,href:experiment.href,id:studio?.id,task:studio?.task??legacyTasks[experiment.slug]??experiment.description,firstAction:studio?experienceById(studio.id).invitation:experiment.description,automated:'未运行',studentTask:'推广后反馈',teachingReview:'推广后反馈',findings:[],probes:[],evidence:[],spatialOperation:'专用实验，待任务复核',demonstration:'专用流程，待任务复核'};
  const finding=(level:Finding['level'],kind:string,detail:string,confirmed=false)=>row.findings.push({level,kind,detail,confirmed});
  try{
   const response=await page.goto(experiment.href);expect(response?.status()).toBe(200);
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('[data-experiment-history]')).toBeVisible();
   if(studio&&model){
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready','true');
    row.probes=probeResponses(model);
    for(const probe of row.probes)if(probe.error)finding('P0','model-error',`${probe.key}=${probe.value}求解失败：${probe.error}`,true);
    const quiet=[...new Set(row.probes.filter(p=>p.metricsChanged&&!p.apparatusChanged&&!p.spatialChanged&&!p.responseChanged&&!p.rateChanged).map(p=>p.key))];
    if(quiet.length)finding('P1','measurement-without-apparatus',`${quiet.join('、')}改变数值但主图及空间几何不变；审阅不变量与证据用途`);
    const inert=[...new Set(model.controls.filter(c=>c.key!==model.time?.key&&!row.probes.some(p=>p.key===c.key&&(p.metricsChanged||p.apparatusChanged||p.spatialChanged||p.responseChanged||p.rateChanged||p.curvesChanged))).map(c=>c.key))];
    if(inert.length)finding('P2','unexplained-invariant',`${inert.join('、')}端点未产生变化；需解释不变量或修正控件`);
    row.demonstration=model.demonstration?'具名参数扫描':model.time?'播放/单步':'无连续演示，需判断实验是否需要过程';
    row.spatialOperation=studio.id==='C07'?'声明可拖动小天体；另有完整任务回归':'空间相机 + 装置旁参数控件；无需退出3D即可操作';
    const primary=page.getByRole('slider',{name:`装置旁直接调整${model.controls.find(c=>c.key===studio.compare)!.label}`,exact:true});
    const visual=async()=>page.locator('#dis-drawing').evaluate(el=>{const clone=el.cloneNode(true) as Element;clone.querySelectorAll('text,[data-evidence-instrument],[data-response-evidence],.dis-apparatus-context,.dis-apparatus-detail').forEach(n=>n.remove());return clone.innerHTML;});
    const evidence=async()=>page.locator('[data-response-evidence]').evaluateAll(els=>els.map(el=>{const clone=el.cloneNode(true) as Element;clone.querySelectorAll('text').forEach(n=>n.remove());return clone.innerHTML;}).join(''));
    const original=await visual(),originalEvidence=await evidence();
    const shot=path.join(directory,`${studio.id}-before.png`);await page.locator('#dis-stage').screenshot({path:shot});row.evidence.push(shot);
    const endpoint=await primary.inputValue()===await primary.getAttribute('max')?'Home':'End';
    const target=await primary.getAttribute(endpoint==='Home'?'min':'max');await primary.press(endpoint);await expect(page.locator(`#dis-input-${studio.compare}`)).toHaveValue(target!);
    if(original===await visual()&&originalEvidence===await evidence())finding('P1','primary-picture-static',`主变量${studio.compare}实际操作后主图未变；排除了文字和附属仪表`);
    await page.getByRole('button',{name:'打开三维视图',exact:true}).click();
    await expect(page.locator('#dis-three canvas')).toBeVisible();
    await expect(page.locator('.dis-spatial-readings')).toBeVisible();
    const spatial=path.join(directory,`${studio.id}-after-3d.png`);await page.locator('#dis-stage').screenshot({path:spatial});row.evidence.push(spatial);
    await page.getByRole('button',{name:'回到二维证据',exact:true}).click();
    if(model.demonstration)await expect(page.getByRole('button',{name:model.demonstration.title,exact:true})).toBeVisible();
   }else{
    const open=page.getByRole('button',{name:'打开三维视图',exact:true});
    if(await open.count()){await open.click();await expect(page.locator('[data-legacy-host] canvas')).toBeVisible();}
    else await expect(page.locator('canvas').first()).toBeVisible();
   }
   await page.setViewportSize({width:320,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   expect(errors).toEqual([]);
   row.automated='产品自动巡检通过';
  }catch(error){row.automated='失败';finding('P0','browser-flow',String(error).slice(0,600),true);await page.screenshot({path:path.join(directory,`${experiment.slug}-failure.png`)}).catch(()=>{});}
  finally{await context.close();}
  const index=rows.findIndex(r=>r.slug===row.slug);
  if(index>=0){row.previousFindings=rows[index]!.previousFindings??rows[index]!.findings;row.recheckedAt=new Date().toISOString();rows[index]=row;}else rows.push(row);
  await save(rows,false);console.log(`${rows.length}/${experiments.length} ${studio?.id??experiment.slug} ${row.automated} 风险${row.findings.length}`);
 }
 await save(rows,true);
 expect(rows.flatMap(r=>r.findings),'本轮产品巡检问题必须全部处理，详见report.json').toEqual([]);
 expect(rows.filter(r=>r.automated==='失败').map(r=>r.slug),'功能失败见report.json；风险和待审项不因本断言通过而关闭').toEqual([]);
});
