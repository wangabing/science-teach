/** State what the extra view contributes; do not imply planar evidence gains physical dimensions. */
export function viewPurpose(id:string) {
 if(id==='C07')return '拖动青色小天体改变距离；空白处拖动旋转相机。两种视图共享条件；对数位置、放大半径和箭长只用于解释，不是碎裂仿真。';
 const prefix=id[0],n=Number(id.slice(1));
 if(prefix==='M'&&[2,3,4,9,10,21,22,23,24,25].includes(n))return '拖动旋转检查空间关系；正面、俯视可核对投影，读数按原构造计算。';
 if(prefix==='M')return '本题是平面数学构造。三维将同一构造放入空间，便于换角度看；证明仍依据二维关系。';
 if(['P04','P18','P19','P20','P25','C08','C17','C20','C28','C29','C30'].includes(id))return '三维保留同一场、波或观测证据的空间示意；图线不是额外测得的实体轨迹，数值见同步读数。';
 if(id==='S19')return '二维可拖动右轮边缘调大小；播放后比较轮辐与皮带标记。三维拖动旋转，检查轮、轴和闭合皮带。';
 return '旋转查看装置连接与相对位置。用装置旁滑块改变条件，二维、三维和读数来自同一状态；尺寸为示意。';
}
