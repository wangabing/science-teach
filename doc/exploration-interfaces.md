# 六个探索实验：接口

没有 HTTP API 或后台。本文描述实验模型和页面之间的 TypeScript 接口；最终类型以 src/lib/exploration/ 为准。

| 模块 | 接口 | 输入/输出与单位 |
|---|---|---|
| area.ts | areaEvidence(a,b)、triangleVertices(a,b,pose)、areaTargets(a,b) | 正边长，三角形刚性位姿 x/y/angle；面积与四个目标位置 |
| section.ts | cubeSection(normal,offset)、sectionBasis(normal)、project3(point) | 三维单位法向量，偏移 d；排序后的交点与投影，不相交返回空数组 |
| orbit.ts | launchOrbit(speed,angle)、stepOrbit(state,dt)、orbitEnergy(state)、orbitStatus(state) | km、km/s、s、方向角度；纯函数返回新状态；状态 ready/flying/collision/escaped |
| three-body.ts | threePreset(name)、stepThree(bodies,dt)、threeEnergy(bodies)、separation(a,b) | 无量纲位置/速度/质量，等质量初态；返回新数组，保持调用方状态不变 |
| bridge.ts | solveBridge(members,load,node) | 固定节点表，成员节点索引对，kN；stable/unsteady，m 位移、kN 杆力和支座反力、m 材料长度 |
| gears.ts | gearTrain(teeth,inputRPM) | 齿数数组、rpm；带符号各轮转速、输出/输入速度大小比和扭矩大小比 |
| ui.ts | clock(step,render)、svgPoint(svg,event)、bindRange(id,callback) | 动画生命周期与 SVG 触屏坐标；不保存业务模型或用户数据 |

## 状态和事件约定

- range 的 input 即更新读数与装置；模拟参数修改会暂停并重置轨迹。
- start 切换运行/暂停；step 暂停后推进一步；reset 恢复该页默认参数与初态。
- 动态读数不设持续 aria-live，以免屏幕阅读器被帧更新打断；完成、碰撞、失稳等关键反馈使用 role=status。
- 图像装置提供可读标题；面积拼块、桥梁节点/杆件提供按钮语义和键盘 Enter/Space，拖动使用指针捕获。
- 动态数据不出站，不使用浏览器学习记录或账号存储。
