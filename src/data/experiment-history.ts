import {studios} from './discovery-studios.ts';
import {experimentContexts} from './experiment-contexts.ts';
import type {experiments} from './labs';

export type ExperimentSlug = (typeof experiments)[number]['slug'];
interface HistoryStory {
  period: string;
  title: string;
  lead: string;
  background: string;
  invitation: string;
  sources: {title: string; href: string}[];
}
const biography = (name: string) => `https://mathshistory.st-andrews.ac.uk/Biographies/${name}/`;

export const experimentHistory:Record<string,HistoryStory> = {
  reflection: {
    period: '古典几何 · 海伦与反射路径',
    title: '把折线拉直，是一种解题方法。',
    lead: '与海伦联系在一起的反射路径问题，把“两段路怎样最短”转成“一条直线怎样连接”。辅助线不是多画一笔，而是把难比较的量换成容易比较的量。',
    background: '海伦是古代亚历山大的数学与机械研究者。反射与几何光学的历史跨越多位研究者；本页用现代坐标和欧氏距离解释经典最短路径，不把教学装置当作古代实验的复刻，也不把几何最短路直接说成所有介质中的最短时间。',
    invitation: '先只拖P寻找更短路线，再作B的镜像。把P限制到一小段上：原来能取到的最短点，还允许使用吗？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Heron of Alexandria',href:biography('Heron')}],
  },
  'circle-angles': {
    period: '约公元前300年 ·《几何原本》第三卷',
    title: '动过很多次以后，还需要证明吗？',
    lead: '《几何原本》第三卷系统讨论圆。命题20与21把圆心角、圆周角和同一弓形中的角联系起来，观察到的“不变”由条件和推理支撑。',
    background: '古典几何用论证处理任意满足条件的图形，动态几何让我们更容易寻找规律，却不能用有限次拖动代替证明。同一条弦两侧的角不一定相等；必须说清顶点在哪一段弧上。',
    invitation: '固定A、B，在同一侧弧上取两个P，再跨到另一侧。把观察和“同弧”条件一起写进结论。',
    sources:[{title:'Euclid’s Elements · 第三卷命题20（圆心角与圆周角）',href:'https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII20.html'},{title:'Euclid’s Elements · 第三卷命题21（同弓形中的角）',href:'https://mathcs.clarku.edu/~djoyce/elements/bookIII/propIII21.html'}],
  },
  'triangle-rigidity': {
    period: '约公元前300年 ·《几何原本》第一卷',
    title: '三条边，是怎样决定一个三角形的？',
    lead: '《几何原本》第一卷命题8讨论三组对应边分别相等的三角形。今天常写作SSS的全等判定，背后是“哪些条件足以确定形状”的问题。',
    background: '两个镜像三角形朝向不同，仍然全等。定长纸条和铰链把这种确定性变得可以触摸；不过，给定三个长度之前，还要检查它们能不能组成三角形。等号使三点共线，不是有效三角形。',
    invitation: '先让两杆动起来，再闭合第三边。翻到另一侧时，哪些量变了，哪些量没有变？',
    sources:[{title:'Euclid’s Elements · 第一卷命题8（三边全等）',href:'https://mathcs.clarku.edu/~djoyce/elements/bookI/propI8.html'},{title:'Euclid’s Elements · 第一卷命题20（三角不等式）',href:'https://mathcs.clarku.edu/~djoyce/elements/bookI/propI20.html'}],
  },
  'ellipse-string': {
    period: '古典圆锥曲线 · 阿波罗尼奥斯',
    title: '从切圆锥，到用两段绳定义曲线。',
    lead: '阿波罗尼奥斯的《圆锥曲线论》系统研究椭圆、抛物线和双曲线。今天的双钉拉线装置，用一个恒定的距离和，让椭圆定义变成手上的动作。',
    background: '圆锥曲线的研究早于阿波罗尼奥斯，也不等于双钉装置由他发明。本页采用现代焦点定义与坐标方程，讨论理想不可伸长绳的两段有效长度；历史上的圆锥切割、焦点性质和现代教学装置是相关但不同的表达。',
    invitation: '保持有效绳长，让两焦点逐渐靠近，看椭圆如何趋向圆。再把两焦点拉得太远，为什么连一条椭圆也画不出来？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Apollonius of Perga',href:biography('Apollonius')}],
  },
  resistors: {
    period: '1827 年 · 欧姆的电路研究',
    title: '电流大小，能用一个关系预测吗？',
    lead: '1827 年，欧姆出版电路研究著作，把电流、电势差与导体的阻碍作用联系起来。电路从“接上试试”，逐渐成为可以定量比较的对象。',
    background: '欧姆的研究依赖当时的电源和测量方法，现代常用的 U = IR 是其规律的简明表达。并非所有器件都保持恒定电阻；本页用两颗恒阻元件研究电压分配，不复刻历史仪器。接入负载后，要把新增的支路也纳入计算。',
    invitation: '先用两颗相等电阻把6 V对半分，再接上第三颗电阻作负载。输出为什么不再是3 V？',
    sources: [{title:'圣安德鲁斯大学 MacTutor · Georg Simon Ohm',href:biography('Ohm')}],
  },
  capacitors: {
    period: '1745—1746 年 · 莱顿瓶',
    title: '电源离开以后，电还能留下吗？',
    lead: '1745—1746 年，克莱斯特以及莱顿的研究者分别探索了储存电荷的装置，后来广为人知的莱顿瓶让电的作用可以在充电之后保留下来。',
    background: '莱顿瓶是早期电容器：导体由绝缘材料分隔，异号电荷分居两侧，能量储存在电场中。它的发展包括多位研究者，常与穆申布鲁克联系在一起。本页是低压理想RC模型，并非历史装置的复刻；真实电容有漏电，开路保持也不会永久不变。',
    invitation: '充到3 V后，先切到开路保持并推进时间，再切到经电阻放电。断开电源和释放储能，为什么是两件不同的事？',
    sources: [{title:'Encyclopaedia Britannica · Leyden jar',href:'https://www.britannica.com/technology/Leyden-jar'}],
  },
  circuits: {
    period: '1800 年 · 伏打电堆',
    title: '怎样让电流不只出现一瞬间？',
    lead: '1800 年，伏打公布了用不同金属与湿润隔层叠成的电堆。它能提供持续电流，让研究者有机会反复连接回路、比较电的作用。',
    background: '电堆把化学过程转为电能，成为后来电池的重要起点。早期电源并不完美：电源内部也会影响输出。本页把复杂电化学简化为电动势与固定内阻，让你把注意力放在外部接线、电流和功率；电阻灯也不是历史电堆的原始实验器材。',
    invitation: '先补一根返回电源的导线，让灯亮起来。再给两盏灯分别找回路，断开其中一盏，看看另一盏的通路与功率发生了什么。',
    sources:[{title:'Encyclopaedia Britannica · Alessandro Volta（1800 年电堆）',href:'https://www.britannica.com/biography/Alessandro-Volta'}],
  },
  buoyancy: {
    period: '公元前 3 世纪 · 阿基米德',
    title: '不熔掉王冠，能查出它掺了银吗？',
    lead: '后世记载中，阿基米德受托检验一顶王冠。形状不规则，不能直接量尺寸——水能替他“量”出什么？这则著名故事由维特鲁威在数百年后写下。',
    background: '王冠与浴盆是流传很广的典故，不能当作现场实录。阿基米德确实在《论浮体》中研究了浮体与液体的平衡。同样质量的不同材料可能占据不同体积；比较排水量，便有了辨别密度的线索。本页用规则物块观察排水与浮力，并不复刻王冠鉴定。',
    invitation: '把物块慢慢浸入水中，比较排水体积和测力计减少的读数：水“托住”的重量，与被排开的水有什么关系？',
    sources: [{title: '芝加哥大学古籍站 · 维特鲁威《建筑十书》第九书序言（王冠故事）',href:'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/9*.html'}, {title:'圣安德鲁斯大学 MacTutor · Archimedes（《论浮体》）',href:biography('Archimedes')}],
  },
  pendulum: {
    period: '1656 年 · 惠更斯的摆钟',
    title: '怎样让每一次“滴答”尽量一样长？',
    lead: '在精密钟表还不普及的年代，稳定计时是个难题。惠更斯在 1656 年制成摆钟，把摆的规律运动变成了计时工具。',
    background: '伽利略曾研究摆的运动，惠更斯进一步把它用于钟表，并研究怎样改善等时性。普通单摆只在小摆角时近似等时，摆得很开，周期会变长。本页没有钟表擒纵机构，而是让你单独检查摆长、质量与摆角的作用。',
    invitation: '保持摆长和释放角度，只改变摆球质量，比较两次实测周期。再把小摆角换成大摆角：“每次一样长”还准确吗？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Christiaan Huygens（摆钟与计时）',href:biography('Huygens')}],
  },
  lens: {
    period: '1611 年 · 开普勒《折光学》',
    title: '一片玻璃，为什么能把远处带到眼前？',
    lead: '望远镜让人们看见新世界，也留下了疑问：透镜到底怎样成像？1611 年，开普勒在《折光学》中研究透镜和光路，为理解光学仪器提供了方法。',
    background: '眼镜与透镜工艺早于开普勒，不能把透镜归功于单一发明者。开普勒讨论了会聚、发散及透镜组合，并提出使用两片凸透镜的望远镜方案。本页先研究其中一片理想薄凸透镜，逐步区分能投到屏上的实像与需透过透镜观看的虚像。',
    invitation: '先把物体放到焦点之外，在光屏上找清晰的像；再移到焦点以内。为什么屏上找不到，眼睛却仍能看见放大的像？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Johannes Kepler（Dioptrice）',href:biography('Kepler')}],
  },
  interference: {
    period: '1801 年 · 托马斯·杨的波动解释',
    title: '两份光相遇，为什么可能变暗？',
    lead: '托马斯·杨用波的相互叠加解释明暗变化，并在 1801 年的讲演中阐述相关思想：两个作用相加，结果不一定更强。',
    background: '这场讲演于 1802 年发表，干涉成为理解光的重要线索。水波给了我们可见的类比：波峰遇到波谷，位移可以抵消。本页显示两列理想波的有正负位移，不是杨氏光学实验的复刻；颜色也不表示光强。',
    invitation: '保持探针不动，只调两源相位，找一个整周期都安静的点。再看三条曲线：此刻位移为零，和持续相消是一回事吗？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Thomas Young（干涉与光的波动理论）',href:biography('Young_Thomas')}],
  },
  area: {
    period: '公元 3 世纪 · 赵爽的弦图',
    title: '不用量长度，搬动面积也能证明吗？',
    lead: '赵爽为《周髀算经》作注时，用“弦图”解释勾股关系。图形不只是公式的配图：把面积拆开、补上，本身就能成为推理。',
    background: '勾股关系在不同文明中都有悠久历史，不能归为某一个人的独自发现。赵爽的图解展示了用面积说明关系的思路。本页采用四块全等直角三角形的两种拼法，是面积证明的教学呈现，不是古图的逐笔复原。',
    invitation: '四块三角形只移动、旋转，不改变大小。两边外框一样大，拿走相同的四块后，剩下的黄色面积为什么也一样大？',
    sources:[{title:'中国哲学书电子化计划 ·《周髀算经》（原典阅读入口）',href:'https://ctext.org/zhou-bi-suan-jing/zh'}, {title:'圣安德鲁斯大学 MacTutor · 中国数学史概览（勾股关系与证明传统）',href:'https://mathshistory.st-andrews.ac.uk/HistTopics/Chinese_overview/'}],
  },
  sections: {
    period: '1799 年 · 蒙日《画法几何》',
    title: '还没切下去，能先画出切口吗？',
    lead: '石匠和建造者常要在动工前想清楚空间形状。蒙日在 1799 年出版《画法几何》，系统阐述了用平面图表达、研究空间对象的方法。',
    background: '空间制图与切割技艺并非始于蒙日，他的工作让投影方法成为系统的数学工具。截面的难处，是把空间中的交点组织成平面图形。本页将三维投影与正视截面并排，帮助你建立这种对应，不是整套画法几何课程。',
    invitation: '选一个截面顶点，找出它来自立方体的哪条棱。再倾斜切面：多出来的顶点，分别是与哪些棱新相遇的结果？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Gaspard Monge（Géométrie descriptive）',href:biography('Monge')}],
  },
  mobius: {
    period: '1858 年 · 莫比乌斯与利斯廷',
    title: '纸带只扭半圈，“另一面”去哪了？',
    lead: '1858 年，莫比乌斯与利斯廷各自独立发现了这种奇妙的曲面。把纸带扭半圈再接起来，看似微小的动作，却改变了面的连接方式。',
    background: '它通常以莫比乌斯命名，但发现史也包括利斯廷。沿纸带中线走一圈，你不会回到起点的同一朝向；再走一圈才会。沿边追踪也会发现，原以为的“两条边”实际连在一起。本页的理想曲面可以旋转与追踪，真实剪纸则需要你用纸带验证。',
    invitation: '先追踪面，再追踪边；预测沿中线剪开会得到几条纸带。最后拿一张纸动手，把屏幕上的判断变成实物证据。',
    sources:[{title:'圣安德鲁斯大学 MacTutor · August Ferdinand Möbius（与 Listing 独立发现）',href:biography('Mobius')}],
  },
  moon: {
    period: '1715 年 · 哈雷的日食预报',
    title: '天空还没变暗，能先知道影子会走哪里吗？',
    lead: '1715 年日食前，哈雷绘制了穿过英国的预期日食带。日食从令人惊异的天象，变成了可以计算位置、再拿观测核对的事件。',
    background: '人类预测日食的历史远早于哈雷；他的地图是运用天体运动理论进行预报的一个著名例子。理解预报，先要分清月相变化和影子遮挡。本页用日地月几何说明必要的对齐条件，是教学快照，不提供真实日期的天文预报。',
    invitation: '保持满月和真实轨道倾角，只转动交点方向，让月球进入地影。同样是满月，为什么有时发生月食，有时没有？',
    sources:[{title:'MacTutor · Edmond Halley（日食与天文学研究）',href:biography('Halley')}],
  },
  orbit: {
    period: '1728 年 · 牛顿《宇宙体系》出版',
    title: '一直在下落，为什么还能绕着地球飞？',
    lead: '牛顿设想从高山上水平发射炮弹：速度越来越大，落点越来越远，能否一直绕着地球下落？这是思想实验，并非真的用大炮发射卫星。',
    background: '这一设想出现在牛顿去世后于 1728 年出版的《宇宙体系》中，把地面抛体与天体轨道联系起来。轨道运动不是摆脱引力，而是运动方向不断被引力改变。本页忽略大气等因素，用一次初速度探索理想引力下的运动。',
    invitation: '保持发射位置和方向，逐渐提高初速度，比较坠落、绕行与逃逸。绕行时，当前速度方向和引力方向有什么不同？',
    sources:[{title:'MacTutor · Isaac Newton（引力与天体运动的历史）',href:biography('Newton')}],
  },
  'three-body': {
    period: '1889—1890 年 · 庞加莱的三体研究',
    title: '知道运动定律，就一定能轻松预测未来吗？',
    lead: '庞加莱研究三体问题的论文在 1889 年获奖。随后发现错误并修正，1890 年发表的工作揭示了天体运动可能远比直觉复杂。',
    background: '有了引力定律，并不意味着任意三体初态都有简单的通用解。庞加莱的工作成为后来动力系统研究的重要起点。不过，三体并非总是混乱，也有特殊的有序运动。本页比较有限时间的数值轨迹；轨迹分离本身不能替代严格的混沌判定，还要关注数值误差。',
    invitation: '先看八字初态，再换近遇初态，只给右边一颗星微小位置偏移。比较两套轨迹时，也检查能量误差，哪些差异能支持你的判断？',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Henri Poincaré（三体获奖论文与修正）',href:biography('Poincare')}],
  },
  bridge: {
    period: '1847 年 · 斯夸尔·惠普尔的桥梁著作',
    title: '桥搭起来之前，能算出哪根杆最吃力吗？',
    lead: '惠普尔在 1847 年出版桥梁分析著作，尝试用计算说明桥梁构件怎样受力。造桥除了经验，还需要解释：载荷究竟沿着哪里传到地面？',
    background: '桁架桥的发展汇集了许多建造者和工程师的工作。惠普尔的著作是把数学分析用于桥梁设计的重要早期成果之一。本页把桥简化成理想铰接杆系，能观察稳定与拉压；真实桥梁还必须考虑材料、屈曲、接头等，不能用这个实验验证施工安全。',
    invitation: '先给矩形框架加一根斜撑，再加载。找一根受拉杆和一根受压杆，试着解释它们怎样把力传向两侧支座。',
    sources:[{title:'Internet Archive · Squire Whipple, A Work on Bridge Building（1847 年原著检索）',href:'https://archive.org/search?query=title%3A%22A+work+on+bridge+building%22+AND+creator%3AWhipple'}],
  },
  balance: {
    period: '公元前 3 世纪 · 阿基米德与平衡',
    title: '不用搬走重物，也能改变它的平衡吗？',
    lead: '在《论平面图形的平衡》中，阿基米德研究杠杆平衡和重心。重物放在哪里，和它有多重一样，都是理解平衡的关键。',
    background: '重心把分散的重量联系成一个可用于分析的位置。古代的几何研究为理解平衡提供了方法；本页进一步用重力作用线与支撑边缘分析倾覆趋势，是现代教学模型，并非原著装置的复原。降低重心通常能增加抗倾倒的角度，但仍要结合支撑宽度和配重位置判断。',
    invitation: '先移动配重，再倾斜台面并松开夹持。观察重力线是否越过支撑边缘，比较同一倾角下，高配重和低配重的稳定余量。',
    sources:[{title:'圣安德鲁斯大学 MacTutor · Archimedes（平衡与重心）',href:biography('Archimedes')}],
  },
  gears: {
    period: '约公元前 2—1 世纪 · 安提基特拉机械',
    title: '没有电，齿轮也能“计算”天象吗？',
    lead: '从安提基特拉沉船中发现的古代装置，用青铜齿轮把不同周期联系起来，显示天文信息。齿数不只是大小：它还能把一种转动变成另一种节奏。',
    background: '这台机械通常被定年于公元前 2—1 世纪，其细节仍在研究中，不能把它当作齿轮发明的起点。复杂齿轮系可以表达周期关系。本页先用两到三颗外啮合齿轮观察最基本的传动比，同时用理想功率关系解释减速与增矩；没有模拟古代整机。',
    invitation: '让 20 齿输入轮带动 60 齿输出轮，数一数各转几圈。再加中间轮：转向和总传动比，哪些改变了？',
    sources:[{title:'Encyclopaedia Britannica · Antikythera mechanism（年代与天文齿轮装置）',href:'https://www.britannica.com/technology/Antikythera-mechanism'}],
  },
  ...Object.fromEntries(studios.map(s=>{const context=experimentContexts[s.id];return [s.slug,{period:context?.period??s.era,title:s.name+'：问题从哪里来？',lead:context?.lead??s.history,background:context?.background??`${s.history} ${s.known} ${s.transfer}`,invitation:s.task,sources:[...(context?[{title:context.source,href:context.href}]:[]),{title:s.sourceTitle,href:s.source}]}]})),
} satisfies Record<string, HistoryStory>;
