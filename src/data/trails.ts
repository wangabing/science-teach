import {experiments} from './labs';
export const trails=[
 {id:'light',space:'physics',title:'从一束光，到一幅像',question:'放大镜和照相机，为什么能用同一片透镜解释？',steps:[{slug:'lens',observe:'先看跨越焦点，再独立移动光屏。分清理论像的位置与光屏清晰度。'},{slug:'pendulum',observe:'换一种守恒与测量：保持其他条件不变，用参考摆比较一个变量。'}]},
 {id:'shape',space:'geometry',title:'形状变了，什么没有变？',question:'搬动平面图形、观察立体，再追踪一张纸的连接。',steps:[{slug:'area',observe:'改变边长并搬完四块三角形。解释为什么剩余面积始终相等。'},{slug:'sections',observe:'固定切面方向，只改变偏移。顶点数和面积会一起变化吗？'},{slug:'mobius',observe:'先沿纸边走到起点，再预测中心剪开。比较零、一、两次半扭转的连接关系。'}]},
 {id:'build',space:'structures',title:'把力传出去，把结构立起来',question:'机器怎样传动，桥梁怎样分担载荷，展品怎样站稳？',steps:[{slug:'gears',observe:'输入转三圈时，输出转几圈？加入中间轮，哪些关系不变？'},{slug:'bridge',observe:'先加两根斜撑，再逐步加载。用反力和杆力解释载荷传到哪里。'},{slug:'balance',observe:'固定倾角只降低配重，再改变支撑宽度。用重力线落点解释站稳与翻倒。'}]},
 {id:'future',space:'cosmos',title:'轨道能预测，未来呢？',question:'从两体的规律，走向三体对初态的敏感。',steps:[{slug:'moon',observe:'看完一轮月相，再保持满月只改变交点。区分受光面、观察方向和地球阴影。'},{slug:'orbit',observe:'对照圆与椭圆轨道，观察半径、速率和总能量。'},{slug:'three-body',observe:'固定质量与速度，先令扰动为零，再只改变扰动。用分离曲线比较。'}]},
];
export function trailExperiment(slug:string){const experiment=experiments.find(e=>e.slug===slug);if(!experiment)throw new Error(`Unknown trail experiment: ${slug}`);return experiment;}
