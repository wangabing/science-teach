import type {GeometryKind} from '../lib/geometry/models';
interface Control {key:string;label:string;min:number;max:number;step:number;unit:string}
export interface GeometryStudio {
 kind:GeometryKind;slug:string;name:string;stage:string;topic:string;title:string;accent:string;
 lead:string;invitation:string;known:string;question:string;position:Control;controls:Control[];
 task:string;helper:string;readings:string[];fallback:string;proofTitle:string;proof:string[];boundary:string;
 transfer:string;answers:[string,string];feedback:string;counterLabel:string;paper:string;next:string;
}
export const geometryStudios:GeometryStudio[]=[
 {
  kind:'reflection',slug:'reflection',name:'镜像寻路',stage:'初中几何',topic:'轴对称 · 最短路径',title:'先到墙边，怎样走最短？',accent:'把折线，拉成直线。',
  lead:'A到B，途中必须碰一下直线l。接触点P选在哪里？先靠自己的判断，再借一面“数学镜子”。',invitation:'拖动绿色的P，或用滑块寻找更短的路线。',known:'A、B在直线l同侧；P在l上。距离使用统一的长度单位u。',question:'找出PA + PB的最小值，并说明为什么。',
  position:{key:'p',label:'P在直线上的横坐标',min:-6,max:6,step:.1,unit:'u'},controls:[{key:'ax',label:'A横坐标',min:-5,max:5,step:.5,unit:'u'},{key:'ay',label:'A到直线的高度',min:1,max:6,step:.5,unit:'u'},{key:'bx',label:'B横坐标',min:-5,max:5,step:.5,unit:'u'},{key:'by',label:'B到直线的高度',min:1,max:6,step:.5,unit:'u'}],
  task:'固定A(−4,3)、B(4,5)，亲手移动P，核验是否已找到最短路线。判定允许路程多出不超过0.001 u；这只是数值核验。',helper:'显示镜像B′与辅助线AB′',readings:['PA','PB = PB′','总路程','比当前最短多出'],
  fallback:'A(−4,3)、B(4,5)时，直线上最短点是P(−1,0)，最短路程√128≈11.314 u。若P限制在[−5,−2]，最短点改为右端点−2。',
  proofTitle:'为什么辅助线要画到镜子另一边？',proof:['作B关于直线l的对称点B′。因为P在对称轴上，所以PB = PB′；于是原路程PA + PB变成PA + PB′。','由三角不等式，PA + PB′ ≥ AB′；只有A、P、B′共线且P在两点之间时取等号。A、B在l同侧，保证线段AB′穿过l。','如果P只能在线段内活动，先检查交点是否在允许区间。交点在外时，距离和沿区间向交点方向减小，最小值出现在靠近交点的端点。不能直接把直线上的答案搬到线段上。'],
  boundary:'只研究平面欧氏距离，不模拟墙体厚度、障碍物或旅行速度。A、B保持在l同侧，坐标控制没有放开到另一侧。辅助线是证明工具，显示它不等于自动完成个人寻找。',
  transfer:'如果只允许P在线段[−5,−2]内活动，原来P=−1的答案还能用吗？',answers:['还能，最短点不会变','不能，要检查允许范围'],feedback:'P=−1不在[−5,−2]内。默认条件下，受限最短点是右端点P=−2；最短路程比√128大。结论必须带上P的活动范围。',counterLabel:'试试：把P限制在线段内',paper:'在纸上画同侧两点A、B和直线l，折纸找B的镜像，用尺连接A与B′；再把可接触范围缩成一小段。',next:'circle-angles',
 },
 {
  kind:'circle',slug:'circle-angles',name:'圆周角观测台',stage:'初中几何',topic:'圆周角 · 分类讨论',title:'顶点在走，角为什么不变？',accent:'固定一条弦，追踪一个角。',
  lead:'A和B留在圆上，P沿圆周移动。三角形不断变形，∠APB却可能保持不变。它到底依赖什么？',invitation:'拖动P，留意它在哪一段弧上。',known:'O为圆心，半径4 u；A固定，∠AOB=α；P在圆上且不与A、B重合。',question:'同一条弦所对的圆周角，是否总相等？',
  position:{key:'theta',label:'P沿圆周的位置 θ',min:0,max:360,step:1,unit:'°'},controls:[{key:'alpha',label:'较小中心角 α',min:30,max:180,step:1,unit:'°'}],
  task:'固定α=120°，在长弧AB上手动选两个相距至少30°的位置，各核验一次，比较圆周角。数值相同是证据，还需要一般论证。',helper:'连接OA、OB、OP三条辅助半径',readings:['圆周角 ∠APB','不含P的弧AB','较小中心角 α','P所在弧'],
  fallback:'α=120°时，P在长弧AB上，圆周角为60°；P换到短弧AB上，圆周角为120°。两角互补；P与A或B重合时圆周角未定义。',
  proofTitle:'圆心在角内、边上或角外，怎样统一解释？',proof:['连接OA、OB、OP，得到等腰三角形OAP与OBP。半径相等，使每个三角形的两个底角相等。','先从圆心在圆周角一边的情形入手：利用等腰三角形底角与外角关系，得到同弧的圆心角是圆周角的两倍。圆心在角内时把两个角相加，在角外时作差。','统一结论：圆周角等于它所截、不含顶点P的弧所对圆心角的一半。P在不同侧弧时，截弧分别为α和360°−α，因此两角互补；α=180°时都为90°。'],
  boundary:'α表示较小中心角，范围30°到180°，不总是当前圆周角的两倍。P到达弦端点时，一条角边长度为零，不能继续测角。图形数值不能替代上述分情况的论证。',
  transfer:'把P移到弦的另一侧，原来“角不变”的结论会怎样？',answers:['仍然始终相等','一般会变为互补角'],feedback:'固定α=120°，长弧上的圆周角60°，短弧上120°，相加180°。只有弦为直径时两边才同为90°；要说“同弧”，不能只说“同一条弦”。',counterLabel:'试试：把P移到另一侧弧',paper:'用圆规画圆，固定A、B，分别在两侧弧上取P和Q。用量角器比较，再连接圆心，试着分情况写出理由。',next:'triangle-rigidity',
 },
 {
  kind:'triangle',slug:'triangle-rigidity',name:'三角形锁形工坊',stage:'初中几何',topic:'全等 · 三角形存在条件',title:'三根杆，能锁住一个形状吗？',accent:'从能动，到不能随意变。',
  lead:'先把两根杆铰在A点，C可以转动。再接上第三根固定长度的杆：剩下的自由度去哪了？',invitation:'先移动C改变铰链角，再锁上第三边。',known:'AB、AC为两根定长杆；锁定后BC也成为定长约束。构型在同一平面内。',question:'三边确定后，翻到另一侧是一个不全等的新三角形吗？',
  position:{key:'angle',label:'两杆的铰链角 ∠A',min:0,max:180,step:1,unit:'°'},controls:[{key:'ab',label:'杆长 AB',min:.5,max:10,step:.5,unit:'u'},{key:'ac',label:'杆长 AC',min:.5,max:10,step:.5,unit:'u'},{key:'bc',label:'锁定的第三边 BC',min:.5,max:20,step:.001,unit:'u'}],
  task:'亲手改变铰链角，再锁定当前第三边，最后翻到基线另一侧并核验：三条边有没有改变？',helper:'显示AC轨迹圆；锁边后显示两构造圆',readings:['第三边 BC','∠A','面积','约束状态'],
  fallback:'AB=6 u、AC=4 u时，第三边必须满足2<BC<10才构成非退化三角形。固定三边后，两侧镜像构型全等。1、2、3只能排成一条线。',
  proofTitle:'为什么三边锁定后只剩镜像构型？',proof:['固定AB后，满足AC为定长的点C在以A为圆心的圆上。若BC也固定，C还必须在以B为圆心的圆上。','严格满足|AB−AC|<BC<AB+AC时，两圆有两个交点，关于直线AB对称。两种构型的三组对应边相等，可由SSS判定全等。翻面改变朝向，不改变形状大小。','等号成立时两圆相切，三点共线、面积为零；超过范围时无交点。三边给定还要先检查能否构成三角形，不能只背“SSS”。'],
  boundary:'这是理想刚性杆的平面几何模型，不模拟真实关节、材料弹性或碰撞。锁定后角度由三边确定，铰链控制不可继续改变；解锁后沿当前角度继续探索。',
  transfer:'三条杆长分别1、2、3，也能锁成一个三角形吗？',answers:['能，三边确定就行','不能，三角不等式不严格'],feedback:'1+2=3，三点只能共线，面积为0。三角形要求任意两边和大于第三边；等号对应退化情况，不是有效三角形。',counterLabel:'试试：把杆长改为1、2、3',paper:'用三根不同长度纸条或吸管连接，比较能动的两杆与闭合的三杆。选择边长时先用三角不等式判断，不需要尖锐图钉。',next:'ellipse-string',
 },
 {
  kind:'ellipse',slug:'ellipse-string',name:'双钉拉线实验',stage:'高中几何',topic:'椭圆定义 · 数形结合',title:'一根绳，怎样画出椭圆？',accent:'两段距离，分享一个总长度。',
  lead:'把绳的两端固定在两个焦点，笔尖把绳拉紧。笔可以走很远，两段绳加起来却不能变长。',invitation:'拖动笔尖P，或用位置滑块沿曲线移动。',known:'F₁(−c,0)、F₂(c,0)，有效两段绳长为2a；非退化椭圆要求a>c≥0。',question:'PF₁+PF₂为什么恒定？焦点靠近时，椭圆会变成什么？',
  position:{key:'theta',label:'沿椭圆的位置参数 θ',min:0,max:360,step:1,unit:'°'},controls:[{key:'a',label:'有效绳长的一半 a',min:2,max:6,step:.5,unit:'u'},{key:'c',label:'半焦距 c',min:0,max:6,step:.5,unit:'u'}],
  task:'固定a=5、c=3，亲手移动笔尖，在相距至少40°的两个参数位置各核验一次，比较PF₁+PF₂。',helper:'显示整条解析曲线作参考',readings:['PF₁','PF₂','两段距离之和','离心率 e'],
  fallback:'a=5、c=3时，b=4，方程x²/25+y²/16=1，任意曲线上点到两焦点距离和为10 u。c=0时是圆；c=a退化；c>a不能拉出椭圆。',
  proofTitle:'从拉线的定义，走到标准方程',proof:['设P(x,y)，两焦点为(−c,0)、(c,0)。距离定义给出√((x+c)²+y²)+√((x−c)²+y²)=2a。','由两距离平方之差为4cx，以及距离和为2a，得到两距离分别为a+cx/a与a−cx/a。代入距离公式并整理，得x²/a²+y²/(a²−c²)=1。','令b²=a²−c²。当a>c时b>0，得到椭圆；c=0时两个焦点重合，变为半径a的圆。a=c时距离和等于焦点间距，只有焦点间线段；a<c违反三角不等式，不存在轨迹。'],
  boundary:'长度指笔尖到两固定点的两段有效绳长，不含绕钉的额外固定段；忽略伸长与摩擦。θ是参数角，不是从某个焦点测得的极角。橙色点是你实际到过的位置，虚线整椭圆是解析参考，不是操作历史。',
  transfer:'保持绳长不变，把两个焦点拉得比绳长还远，会出现更扁的椭圆吗？',answers:['会，只是越来越扁','不会，距离条件无法满足'],feedback:'总距离至少等于两焦点间距2c。a=c时只剩线段，a<c时任何点都无法满足距离和2a。不能用“更扁”描述不存在的椭圆。',counterLabel:'试试：让焦点间距等于绳长',paper:'把绳两端固定在纸板的两点，用笔拉紧绳移动。用尺量两段长度之和；若用闭合绳绕两钉，须扣除固定的焦点间那一段再对照本页。',next:'reflection',
 },
];
export const geometryStudio=(kind:GeometryKind)=>geometryStudios.find(s=>s.kind===kind)!;
