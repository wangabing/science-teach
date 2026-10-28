import {studios} from './discovery-studios.ts';
import {experienceById} from './discovery-experiences.ts';
import {modelById} from '../lib/discovery/registry.ts';
import {defaults,solveModel} from '../lib/discovery/core.ts';
import {viewPurpose} from '../lib/discovery/view-purpose.ts';
import {experimentHistory} from './experiment-history.ts';
import {geometryStudios} from './geometry-studios.ts';
import type {Curation,Goal} from './curation.ts';
// Reuse each experiment's authored problem and model; this is not external review.
export function sharedLearningGuides():Record<string,Curation>{
 return Object.fromEntries(studios.map(studio=>{
  const model=modelById(studio.id),experience=experienceById(studio.id),initial=solveModel(model,defaults(model));
  const control=model.controls.find(c=>c.key===studio.compare)!,metric=initial.metrics.find(m=>m.key===studio.metric)!;
  return [studio.slug,{goal:'compare',synonyms:[studio.topic,...model.controls.map(c=>c.label),...initial.metrics.map(m=>m.label),...experience.legend],suitable:studio.title,
   first:`先调整${control.label}，${experience.look}`,target:'#dis-direct-input',
   prerequisite:`先认识${studio.topic}涉及的量与单位：${model.controls.map(c=>`${c.label}（${c.unit||'无量纲'}）`).join('、')}。${studio.stage}为内容层次提示，未核对具体教材。`,
   intuitive:experience.invitation,quantitative:`保持其他条件，比较${control.label}与${metric.label}（${metric.unit||'无量纲'}），再对照下方关系。`,
   prediction:experience.look,transfer:studio.transfer,views:viewPurpose(studio.id),
   model:{relation:studio.proof,check:experience.scenes.map(s=>`${s.name}：${s.detail}`).join('；')+`。按这些题设自己操作并比较${metric.label}，不把参考情景当个人完成。`,limits:initial.note,source:studio.source,location:`${studio.sourceTitle}（延伸阅读；链接和公式适用性尚需逐项外部复核）`,checkKind:'authored-comparison'}}] satisfies [string,Curation];
 }));
}
type LegacyRow=[slug:string,goal:Goal,terms:string[],first:string,target:string,prerequisite:string,prediction:string,transfer:string,relation:string,check:string,limits:string,views:string];
const legacyRows:LegacyRow[]=[
 ['buoyancy','concept',['排水量','阿基米德','测力计'],'移动浸入深度，比较排水体积与测力计读数','#immersion','认识重力、体积和密度；定量层使用F=ρgV。','完全浸没后，再往下放，浮力还会增加吗？','保持深度不变，把水换成盐水；是哪一个量改变了浮力？','F浮=ρ液gV排；T=mg−F浮，力用N、体积换成m³。','水中排水1000cm³，本台g=10m/s²时浮力10N；完全浸没后排水量不再增加。','刚性铝块、静水，忽略表面张力与容器底部接触。','三维看浸入与液面；二维和读数核对排水体积与力。'],
 ['pendulum','compare',['摆长','摆球质量','周期'],'改变摆长，再亲手释放摆球','#length','认识长度、角度与时间；定量层需要平方根。','摆球质量加倍，小角度周期会改变吗？','保持小角度与重力，把摆长变为4倍；比较真实测量周期与理论周期。','小角度T≈2π√(L/g)，机械能E=mgL(1−cosθ)+mv²/2。','L=1m、g=9.8m/s²时小角度周期约2.007s；摆长4倍周期约2倍。','理想摆线与质点；大角度偏离小角度公式，阻尼会耗散能量。','三维看摆动、受力和参考摆；二维看角度、能量曲线与测量端点。'],
 ['interference','concept',['相消干涉','水波','静点'],'准备静点任务，只改变第二源相位','#wave-prepare','认识振幅、相位、波长；定量层使用正弦叠加。','某一时刻位移为0，能说明这里始终静止吗？','固定中心探针，比较相位0°与180°的整周期合成振幅。','u=u₁+u₂；等振幅合成B=2A|cos(Δφ/2)|。','中心等路程差，相位0°合振幅2mm、180°为0；单时刻零位移不是持续相消。','小振幅、同频线性波；改变波长而频率固定时波速也改变。','二维波场与探针曲线负责测量；空间台面同步同一平面波场，不新增维度证据。'],
 ['circuits','construct',['串联','并联','灯泡','接线柱'],'从空板开始，自己连接两盏灯','#circuit-prepare','认识闭合回路、电压、电流和电阻。','断开一盏灯，另一盏还亮的接法有什么共同点？','接成并联后只断开灯1，比较灯2功率；考虑电源还有内阻。','节点电流守恒、欧姆定律U=IR；E·I=P₁+P₂+I²r。','E=6V、r=1Ω、单灯20Ω时I=6/21A；两灯串联为6/41A。','直流稳态、理想导线、固定电阻灯；亮度不是照度或温度模型。','二维亲手接线与测量；三维同步端子、导线与灯位置，交叉不自动连接。'],
 ['resistors','compare',['电阻分压','输出电压','负载效应'],'只调上臂电阻，观察输出电压','#divider-upper','认识串并联与欧姆定律；定量层使用等效电阻。','空载调到3V，接上负载后还会是3V吗？','固定6V和两臂阻值，只切换负载，解释输出电压为何改变。','空载U出=E R下/(R上+R下)；带载以下臂与负载并联代入。','6V、上下各1000Ω空载输出3V；接1000Ω负载后输出2V。','理想直流电阻和电压源；忽略温度、接触电阻与元件额定功率限制。','二维看分流与功率账本；三维看连接位置，数值仍来自同一电路。'],
 ['capacitors','compare',['RC电路','时间常数','充电','放电'],'改变电阻后开始充电，观察电压曲线','#rc-resistance','认识电压、电流、电容；定量层涉及指数与单位换算。','断开电源后，电容电压会立即归零吗？','保存同一电压下的开路与放电状态，比较后续曲线，说明电流通路的作用。','τ=RC；充电V=E+(V₀−E)e^(−t/RC)，储能W=CV²/2。','零初值充电到t=τ时V≈0.632E；理想开路保持电压。','理想RC与开关；忽略漏电、寄生参数；保存当前状态不保存过去曲线。','二维看开关与V/I曲线；三维看电阻电容接线，同步当前状态。'],
 ['area','construct',['勾股定理','拼图','面积守恒'],'选一块三角形，旋转后放入对应位置','#piece-0','认识直角三角形、全等和正方形面积。','改变两条直角边，搬走同样四块后面积关系还成立吗？','把a、b先设成相等再设得不同，重新拼图，解释扣掉相同面积的理由。','c²=a²+b²；外框(a+b)²减去4×ab/2。','a=3、b=4得到c²=25；a=b时c²=2a²。','只适用于直角三角形；拼块保持全等，显示允许吸附。','二维亲手搬动和旋转拼块；三维同步平面拼块，厚度为显示示意。'],
 ['mobius','construct',['单面曲面','纸带','中线剪切','拓扑'],'先手动沿纸面走，再预测中线剪切','#paper-progress','认识纸环、边界与连续追踪；不依赖高等拓扑。','一圈回到相同位置，局部正反面标记也回去了吗？','比较0、1、2次半扭转，分别记录剪后带的条数与连接关系。','奇数半扭转纸带不可定向；莫比乌斯带一条边，沿中线剪开后仍一条更长的双面带。','不扭纸环中线剪后两条；一次半扭转剪后仍一条；两次半扭转剪后两条套连。','教学参数曲面；切缝放大，不模拟真实纸张拉伸与接触。','三维追踪接缝和剪后连接；二维展开示意辅助读进度，不替代空间拓扑。'],
 ['orbit','compare',['卫星发射','圆轨道','逃逸速度'],'只改变发射速度，然后发射','#speed','认识速度方向与引力；定量层需要能量与平方根。','同一高度把速度提高，卫星一定更快落地吗？','比较同一方向下圆轨道速度和逃逸速度，结合能量解释结果。','v圆=√(μ/r)，v逃=√(2μ/r)；ε=v²/2−μ/r。','同一半径v逃/v圆=√2；切向圆速应近似保持半径。','二体牛顿引力；忽略大气阻力与地球非球形；仅保存发射条件，恢复重新发射。','二维轨迹与能量负责计算证据；三维检查地球和轨道位置。'],
 ['three-body','compare',['初值敏感','八字轨道','混沌'],'先调整微小偏移，再运行两组宇宙','#perturbation','认识位置、速度、引力；定量层理解数值步长与误差。','初态差一点，是否总会立刻大幅分离？','固定同一初态与质量，比较δ=0与非零δ的分离；同时检查能量误差。','三体按牛顿万有引力数值积分；分离量比较相同模拟时刻的位置。','δ=0且其他条件相同应保持零分离；能量误差或过近相遇超界必须暂停。','有限精度与固定步长；不保证任意初态长期可靠。保存初态参数，不保存运行轨迹。','二维看两组位置与分离曲线；三维呈现同一平面初态，不能据此推断额外空间运动。'],
 ['balance','construct',['重心','配重','翻倒','稳定余量'],'调整配重高度，再松开夹持','#balance-load-y','认识重力线、支撑范围与力矩。','同样倾角下，把配重放低会怎样改变稳定余量？','保持底宽、质量和倾角，只改变配重高度，比较释放前余量与释放后结果。','合重心为质量加权平均；重力线越过支撑边时绕边的重力矩促使翻倒。','对称平放时重力线通过支撑中部；固定横向偏置与倾角，降低重心可增大余量。','刚体与理想支点；忽略滑动、材料弹性与冲击，不能当真实运输认证。','三维看夹持释放和转动；二维看支撑边、重力线与稳定余量。'],
 ['gears','construct',['齿数','齿轮传动','减速','惰轮'],'改变输出齿数，比较转速与扭矩','#output-teeth','认识转速、方向与齿数比例。','加入中间轮，会改变首尾转速比吗？','固定输入输出齿数，只改变中间轮齿数，比较转向和比值。','啮合n₁z₁=−n₂z₂；理想功率不变，扭矩比与转速比互倒。','20齿驱动60齿：转速为1/3，理想扭矩为3倍；单个中间轮改变首尾转向。','理想无滑动齿轮，不模拟齿形强度、间隙和摩擦损耗。恢复参数后累计转数归零。','二维组装看啮合标记与累计圈数；三维检查齿轮轴位置，读数共享。'],
];
export function legacyLearningGuides():Record<string,Curation>{
 return Object.fromEntries(legacyRows.map(([slug,goal,synonyms,first,target,prerequisite,prediction,transfer,relation,check,limits,views])=>{
  const source=experimentHistory[slug as keyof typeof experimentHistory].sources[0]!;
  return [slug,{goal,synonyms,suitable:prediction,first,target,prerequisite,intuitive:first,quantitative:relation,prediction,transfer,views,model:{relation,check,limits,source:source.href,location:`${source.title}（历史/延伸阅读；解析关系见本卡，尚未获外部审阅）`,checkKind:'analytic'}}] satisfies [string,Curation];
 }));
}

export function geometryLearningGuides():Record<string,Curation>{
 return Object.fromEntries(geometryStudios.map(s=>{
  const source=experimentHistory[s.slug as keyof typeof experimentHistory].sources[0]!;
  return [s.slug,{goal:'construct',synonyms:[s.topic,...s.readings,...s.controls.map(c=>c.label)],suitable:s.question,first:s.invitation,target:'#geo-position',prerequisite:`先认识${s.topic}中的图形与量；长度使用统一单位u。${s.known}`,intuitive:s.invitation,quantitative:s.proof.join(' '),prediction:s.question,transfer:s.transfer,views:'二维拖动受约束的点并检查辅助线和读数；三维空间台同步同一平面构造，图形证明仍依据二维关系。',model:{relation:s.proof.join(' '),check:s.fallback,limits:s.boundary,source:source.href,location:`${source.title}（延伸阅读；本卡解析基准尚未获外部审阅）`,checkKind:'analytic'}}] satisfies [string,Curation];
 }));
}
