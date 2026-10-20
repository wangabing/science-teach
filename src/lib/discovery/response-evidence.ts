import {arrow, circle, colors, format, label, line, rect, type Observation} from './core.ts';
import {diagramLabels, diagramSolids} from './diagram-solids.ts';
/** Authored scientific evidence: fixed calibration per quantity, never a simulated deformation. */
export const responseEvidence:Record<string,{keys:string[];reason:string;kind?:'wave'|'thermal'|'force'}>={
 P01:{keys:['acceleration','kinetic','loss'],reason:'同坡度与摩擦下质量不改变加速度；μk只在滑动时起作用，且有效值不超过μs。'},
 P02:{keys:['v1_after','v2_after','energy_after'],reason:'这里展示碰后预测；尚未接触时恢复系数不改变车的位置。播放越过接触时刻再比较。'},
 P07:{keys:['temperature','input','dissipated'],reason:'温度计与能量账同步；散热改变分配，电阻与电流改变输入。',kind:'thermal'},
 P08:{keys:['temperature','pressure','work'],reason:'定容时活塞不移动；改变物质的量仍会改变温度和压强。',kind:'thermal'},
 C01:{keys:['temperature','flux'],reason:'反照率只改变吸收与平衡温度，不改变恒星轨道。',kind:'thermal'},
 C03:{keys:['outbound','return','range'],reason:'时空图自适应取景；几何相似不代表实际光年和等待年数相同。'},
 C04:{keys:['earth','ship','length'],reason:'世界线与时钟比较同一次往返；瞬时掉头是理想化。'},
 C05:{keys:['acceleration','temperature','speed_gain'],reason:'完全反射且无吸收时，改变发射率不改变温度；降低反射率再比较。速度增量不是太阳系轨迹。'},
 C08:{keys:['received','noise','snr'],reason:'波形为信号包络示意；dBW是功率对数值，不是负功率。',kind:'wave'},
 C09:{keys:['strain','arm_difference'],reason:'距离改变应变与臂长差，画面振幅放大，不是真实机械位移。',kind:'wave'},
 C10:{keys:['intensity','frequency'],reason:'频率选择黑体谱采样点；合成温度图并不是逐频前景观测图。',kind:'wave'},
 S01:{keys:['horizontal','vertical'],reason:'规定形状下改变荷载改变推力，理想推力线可保持相同形状。',kind:'force'},
 S04:{keys:['stiffness','buckling','probe_deflection'],reason:'预应力改变刚度与1N探测位移；主结构为平衡参考形状，未求解大变形。',kind:'force'},
 S05:{keys:['horizontal','vertical','tension'],reason:'固定跨径与垂度时荷载改变张力，不必改变索的参考形状。',kind:'force'},
 S06:{keys:['velocity'],reason:'同一转角姿态不变；角速度改变播放速率与滑块速度。'},
 S07:{keys:['force','input','loss'],reason:'提升高度固定时几何相同，效率改变手拉力和耗散。',kind:'force'},
 S08:{keys:['input_force','pressure'],reason:'负载改变压力与输入力；相同排量下活塞位置可以相同。',kind:'force'},
 S09:{keys:['load','deflection'],reason:'雪载改变合力；挠度只是等效平板参考，不冒充折叠壳体形变解。',kind:'force'},
 S10:{keys:['initial_flow','temperature','tau'],reason:'保温层、窗和温差改变热流与冷却时间，不表示房屋几何变形。',kind:'thermal'},
 P12:{keys:['tension','acceleration','arrival'],reason:'释放前位置不随质量改变；质量同时改变张力和释放后加速度。',kind:'force'},
 P14:{keys:['required','net'],reason:'平衡需要的力随左力变化；杆保持水平表示求解平衡条件。',kind:'force'},
 P15:{keys:['force','energy','speed'],reason:'相同压缩位置下刚度改变弹力，质量改变释放速度与播放时间尺度。',kind:'force'},
 P17:{keys:['gauge','absolute'],reason:'同一深度下液体密度改变压强；容器形状不决定该点静水压。'},
 P21:{keys:['frequency','wavelength'],reason:'弦长按窗口归一化显示；张力改变频率和播放速率，不改变给定相位的归一化波形。',kind:'wave'},
 P24:{keys:['secondary','output_current','power'],reason:'有效值电表与负载联动；线圈几何不随原边电压和负载变化。'},
 P26:{keys:['work','rejected'],reason:'热量增加使功和排热同比增大；固定热库温度时效率不变。'},
 P27:{keys:['temperature','transferred'],reason:'质量决定液面；温度决定热交换和平衡温度。',kind:'thermal'},
 P28:{keys:['flow','gradient'],reason:'固定端温的稳态温度线不随k与面积改变，热流会改变。',kind:'thermal'},
 P29:{keys:['photon','voltage'],reason:'波长改变单光子能量；过阈值后截止电压连续变化，通量只改变电子数量。',kind:'wave'},
 M28:{keys:['true','false','posterior'],reason:'样本数增加使期望人数同比增加；患病率不变时比例图与后验概率不变。'},
 C12:{keys:['escape','circular'],reason:'中心质量改变速度尺度；相同高度的示意轨道半径不变。'},
 C17:{keys:['peak','luminosity'],reason:'Bλ谱峰与恒星温度联动；图中颜色仅作温度提示，不替代真实光谱。',kind:'wave'},
 C20:{keys:['observed'],reason:'归一化波形显示拉伸比例；标尺显示实际观测波长。',kind:'wave'},
 C22:{keys:['separation'],reason:'透镜图以爱因斯坦角归一化，角秒标尺随爱因斯坦角变化。'},
 C24:{keys:['hill'],reason:'轨道图按公转半径归一化，质量固定时希尔半径比例不变，实际距离仍改变。'},
 C25:{keys:['delta'],reason:'排气速度改变速度增量，不改变给定质量比的燃料占比。'},
 C26:{keys:['kinetic','classical'],reason:'质量改变两种能量估计；相同β的洛伦兹因子保持不变。'},
 C27:{keys:['energy','tnt'],reason:'速度改变碰撞能量；不虚构尘埃烧蚀或舰体破坏过程。'},
 C29:{keys:['scale'],reason:'干涉相位图归一化；波长改变真实条纹角尺度。',kind:'wave'},
 C30:{keys:['distance','lighttime'],reason:'红移固定时cz不变；哈勃常数改变距离标定与d/c时间尺度。'},
 S16:{keys:['factor','critical'],reason:'摩擦系数改变抗滑极限；未超过静摩擦限值时物体可保持静止。',kind:'force'},
 S17:{keys:['force','input'],reason:'效率改变所需手柄力和输入功，不改变螺距确定的每圈位移。',kind:'force'},
 S19:{keys:['torque','power','belt_speed'],reason:'转速接入轮辐运动；扭矩改变传递功率，不改变无滑动几何。',kind:'force'},
 S20:{keys:['carrier'],reason:'静止初态的齿轮位置不随转速改变；播放后比较行星架运动。'},
 S22:{keys:['force'],reason:'载荷改变水平驱动力；给定角度时剪叉几何固定。',kind:'force'},
 S24:{keys:['displacement'],reason:'侧移可能超出主图显示限幅；量尺保留计算值，线性模型不能预测破坏。'},
 S25:{keys:['effective'],reason:'这里的密度是壁材本身密度；改变它不改变壁厚与蜂窝几何。'},
 S26:{keys:['deflection'],reason:'显示线性弯曲挠度估计；不模拟芯材剪切和局部屈曲。'},
 S30:{keys:['flow','pressure'],reason:'温差与开口面积改变通风量；空气流线为流动方向示意。',kind:'thermal'},
};
/** Signed logarithmic ruler: zero is fixed; monotonic, no saturation or wrapping. */
export function evidenceCoordinate(value:number,reference:number){return Math.sign(value)*Math.log10(1+Math.abs(value)/reference);}
export function addResponseEvidence(id:string,o:Observation,reference:Observation):Observation{
 const config=responseEvidence[id];if(!config)return o;
 const parts=config.keys.map((key,i)=>{
  const q=o.metrics.find(m=>m.key===key),base=reference.metrics.find(m=>m.key===key);
  if(!q)return '';
  const x=40+i*250,y=530,color=(id.startsWith('C')?['#68d8ee','#ffd98a','#cf9cff']:[colors.teal,colors.gold,colors.purple])[i]!,ink=id.startsWith('C')?'#a9c6dd':colors.ink;
  const magnitude=Math.abs(base?.value??0);
  const ref=magnitude>0?magnitude:1;
  // atan only bounds the drawing; ticks explicitly identify the nonlinear scale.
  const thermometer=config.kind==='thermal'&&(q.unit==='K'||q.unit==='°C');
  const displacement=q.value===null?0:(thermometer?30:85)*2/Math.PI*Math.atan(evidenceCoordinate(q.value,ref));
  let shape=line(x+100,y-27,x+100,y+10,ink,1)+line(x+5,y,x+195,y,ink,1);
  if(q.value!==null){
   shape+=config.kind==='force'&&/^(k?N)$/.test(q.unit)?arrow(x+100,y,displacement,0,color)
    :thermometer?rect(x+93,y-Math.max(0,displacement),14,Math.abs(displacement),color)+circle(x+100,y+5,9,color)
        :rect(x+100+Math.min(0,displacement),y-16,Math.abs(displacement),16,color);
   shape+=circle(x+100+displacement,y,4,color);
  }
  return shape+label(x,480,q.label,color,15)+label(x,505,`${format(q.value)} ${q.unit}`,color,15)+label(x,555,'0中线 · 各量独立标定',ink,12);
 }).join('');
 const drawing=`<g data-response-evidence="${id}">${parts}</g>`;
 return {...o,note:`${o.note} ${config.reason}`,drawing:o.drawing+drawing,
  solids:[...(o.solids?.length?o.solids:diagramSolids(o.drawing)),...diagramSolids(drawing).map(s=>({...s,role:'instrument' as const})),...diagramLabels(drawing).map(s=>({...s,role:'instrument' as const,scale:[Math.min(3.3,Math.max(1.1,(s.label??'').length*.14)),.45,1] as [number,number,number]}))]};
}
