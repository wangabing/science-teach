import {studios} from './discovery-studios';
const legacyExperiments = [
  { slug: 'buoyancy', title: '水托住的，究竟有多重？', name: '浮力实验台', space: 'physics', topic: '阿基米德原理', description: '把铝块慢慢放进水中，观察排水体积、浮力与测力计读数的关系。', tags: ['浮力', '控制变量', '三维互动'], href: '/stem-lab/buoyancy/' },
  { slug: 'pendulum', title: '更重的摆球，会摆得更快吗？', name: '单摆与能量', space: 'physics', topic: '周期与能量守恒', description: '亲手释放摆球，测量周期，用参考摆对照，让能量的来回交换看得见。', tags: ['单摆', '能量', '对照实验'], href: '/stem-lab/pendulum/' },
  { slug: 'lens', title: '同一片透镜，怎样拍照又放大？', name: '透镜成像', space: 'physics', topic: '光路与凸透镜成像', description: '移动物体与光屏，从照相机到放大镜，用光路、公式和测量亲手寻找清晰的像。', tags: ['光学', '调焦', '实像与虚像'], href: '/labs/lens/' },
  { slug: 'interference', title: '两个波，能让这里安静吗？', name: '双源波纹', space: 'physics', topic: '波的叠加与相干', description: '调节两列波的相位，用十字探针寻找静点，比较位移分量与整周期振幅。', tags: ['波纹', '相消', '探针测量'], href: '/labs/interference/' },
  { slug: 'circuits', title: '少一盏灯，另一盏还亮吗？', name: '电路接线工坊', space: 'physics', topic: '闭合回路、串并联与功率', description: '亲手连接六个接线柱，让两盏灯各有通路，用断灯和实时仪表检验你的设计。', tags: ['自由接线', '串并联', '测量与对照'], href: '/labs/circuits/' },
  { slug: 'resistors', title: '6 V 怎样分出3 V？', name: '电阻分压台', space: 'physics', topic: '电阻、分压与负载', description: '调节电阻比例分配电压，再接上负载，用分流与功率账本检验分压器。', tags: ['分压', '负载', '对照记录'], href: '/labs/resistors/' },
  { slug: 'capacitors', title: '电源断开，电压还在吗？', name: '电容时间台', space: 'physics', topic: 'RC充放电与储能', description: '充一点、留一会儿、再放掉，用电压电流曲线发现时间常数与能量去向。', tags: ['充放电', '时间常数', '能量'], href: '/labs/capacitors/' },
  { slug: 'area', title: '面积搬了家，总量会改变吗？', name: '面积搬家', space: 'geometry', topic: '勾股定理与面积守恒', description: '移动、旋转四块全等三角形，让两种拼法为勾股定理提供证据。', tags: ['拼图', '面积', '动手证明'], href: '/labs/area/' },
  { slug: 'sections', title: '切开立方体，会遇见六边形吗？', name: '切开立方体', space: 'geometry', topic: '平面截面与空间想象', description: '转动切平面，让立方体的三维投影和二维截面同步变化。', tags: ['截面', '空间想象', '几何探索'], href: '/labs/sections/' },
  { slug: 'mobius', title: '一张纸的另一面，去哪了？', name: '莫比乌斯带', space: 'geometry', topic: '曲面、边界与拓扑', description: '转动一条纸带，沿面与沿边追踪，预测剪开结果，再用一张纸亲手验证。', tags: ['三维纸带', '追踪', '拓扑'], href: '/labs/mobius/' },
  { slug: 'reflection', title: '先到墙边，怎样走最短？', name: '镜像寻路', space: 'geometry', topic: '轴对称与最短路径', description: '把折线映到镜子另一边，亲手寻找最短路线，再用线段限制检验结论。', tags: ['初中几何', '辅助线', '最短路径'], href: '/labs/reflection/' },
  { slug: 'circle-angles', title: '顶点在走，角为什么不变？', name: '圆周角观测台', space: 'geometry', topic: '圆周角与分类讨论', description: '固定一条弦，让顶点沿圆周走，从同弧角到跨弧反例，观察后解释。', tags: ['初中几何', '圆', '分类讨论'], href: '/labs/circle-angles/' },
  { slug: 'triangle-rigidity', title: '三根杆，能锁住一个形状吗？', name: '三角形锁形工坊', space: 'geometry', topic: 'SSS全等与三角不等式', description: '转动两杆铰链，再锁上第三边；翻面与退化反例让全等条件看得见。', tags: ['初中几何', '全等', '约束构造'], href: '/labs/triangle-rigidity/' },
  { slug: 'ellipse-string', title: '一根绳，怎样画出椭圆？', name: '双钉拉线实验', space: 'geometry', topic: '椭圆焦点定义与标准方程', description: '沿拉紧的绳移动笔尖，留下真实笔迹，从恒定距离和走到椭圆方程。', tags: ['高中几何', '圆锥曲线', '经典实验'], href: '/labs/ellipse-string/' },
  { slug: 'moon', title: '月亮变了形，还是视角变了？', name: '月相与日月食', space: 'cosmos', topic: '月相、轨道交点与阴影', description: '移动月球，对照空间位置与地球所见，寻找日全食、日环食与红色月全食的对齐条件。', tags: ['三维观测', '日月食', '月相'], href: '/labs/moon/' },
  { slug: 'orbit', title: '你能把卫星送进一条轨道吗？', name: '发射一颗卫星', space: 'cosmos', topic: '引力与轨道', description: '只给卫星一次初速度，看看它会坠落、绕行，还是逃离地球。', tags: ['发射', '轨道', '引力'], href: '/labs/orbit/' },
  { slug: 'three-body', title: '起点只差一点，未来会差多少？', name: '三体：两种未来', space: 'cosmos', topic: '初始条件与数值模拟', description: '并排运行两个微有差异的宇宙，观察位置差和能量误差。', tags: ['三体', '对照', '初态敏感性'], href: '/labs/three-body/' },
  { slug: 'bridge', title: '你会怎样搭一座桥？', name: '桥梁挑战', space: 'structures', topic: '桁架与结构稳定', description: '连接节点，施加载荷，观察拉压、变形，以及三角形斜撑的作用。', tags: ['搭建', '结构', '受力'], href: '/labs/bridge/' },
  { slug: 'balance', title: '重物放低，为什么站得更稳？', name: '重心与稳定', space: 'structures', topic: '重心、支撑与翻倒', description: '移动配重、倾斜台面，再松开夹持，用重力线、稳定余量与力矩检验你的设计。', tags: ['三维操作', '重心', '稳定挑战'], href: '/labs/balance/' },
  { slug: 'gears', title: '转得慢一点，能换来更大的力吗？', name: '齿轮工坊', space: 'structures', topic: '传动比与功率', description: '自由组合两到三颗齿轮，从齿数发现转速、方向与理想扭矩的联系。', tags: ['组装', '传动', '机械'], href: '/labs/gears/' },
] as const;
export const experiments = [...legacyExperiments,...studios.map(s=>({slug:s.slug,title:s.title,name:s.name,space:s.space,topic:s.topic,description:s.task,tags:[s.stage,s.topic,'测量与对照'],href:`/labs/${s.slug}/`}))];
export const spaces = [
  { slug: 'physics', name: '物理实验室', english: 'PHYSICS', question: '看不见的力，如何改变世界？', description: '从一次入水、一次摆动到一束光、一条回路，把力、能量、成像、波动与电流变成可以观察、测量的现象。', color: 'blue', symbol: 'pendulum' },
  { slug: 'geometry', name: '数学与几何实验室', english: 'MATHEMATICS', question: '换一个角度，形状会告诉你什么？', description: '从镜像寻路、圆周角、三角形锁形到拉线椭圆，在操作、反例与论证中连接初高中几何；也可以探索面积、截面与纸带。', color: 'green', symbol: 'geometry' },
  { slug: 'cosmos', name: '宇宙与三体实验室', english: 'COSMOS', question: '三颗星，能否拥有可预测的未来？', description: '从月相与轨道走向三日照明、光锥通信、光帆、黑洞与宇宙观测。用可核验的物理解释硬科幻，分清理论、近似、工程设想与小说假设。', color: 'purple', symbol: 'orbit' },
  { slug: 'structures', name: '工程与建造实验室', english: 'ENGINEERING', question: '轻巧的结构，为什么能承受重量？', description: '从承重与稳定、机构与传动到部署与环境：给定材料、支座与载荷，用测量优化设计，让形状经得起约束检验。', color: 'orange', symbol: 'structure' },
];
export const inSpace = (slug: string) => experiments.filter(experiment => experiment.space === slug);
