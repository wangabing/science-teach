import { defaults, solveModel, type Inputs, type Model } from './core.ts';
import type { Studio } from '../../data/discovery-studios.ts';
import { foldNet, hexominoes } from './mathematics.ts';
export interface Evidence {
  inputs: Inputs;
  value: number;
}
export class Investigation {
  active = false;
  complete = false;
  evidence: Evidence[] = [];
  baseline: Inputs;
  changed = false;
  model: Model;
  studio: Studio;
  constructor(model: Model, studio: Studio) {
    this.model = model;
    this.studio = studio;
    this.baseline = defaults(model);
  }
  prepare(p: Inputs) {
    this.active = true;
    this.complete = false;
    this.evidence = [];
    this.baseline = { ...p };
    this.changed = false;
  }
  clear() {
    this.active = false;
    this.complete = false;
    this.evidence = [];
    this.changed = false;
  }
  edit(_p: Inputs, key: string) {
    if (!this.active) return;
    const allowed = [this.studio.compare, this.model.time?.key, 'magnify'];
    if (!allowed.includes(key)) {
      this.clear();
      return;
    }
    this.changed = true;
    this.complete = false;
  }
  check(p: Inputs, prediction?: number) {
    if (!this.active) return '请先准备独立探索；参考或恢复记录不计个人完成。';
    if (!this.changed) return '先亲手操作规定变量或释放装置，再核验。';
    const o = solveModel(this.model, p),
      value = o.metrics.find((q) => q.key === this.studio.metric)?.value;
    if (
      value === null ||
      value === undefined ||
      o.status === 'invalid' ||
      (o.status === 'boundary' && Number(this.model.id.slice(1)) <= 10 && !['C06', 'S01'].includes(this.model.id))
    )
      return '当前读数未定义，请回到适用范围后再核验。';
    const id = this.model.id;
    if (id === 'P01' && (value === null || p.time! < value))
      return '先释放并运行到轨道终点，再记到达时间。';
    if (id === 'C03' && p.time! < value) return '光信号还没回到地球；继续播放或步进到回信事件。';
    if (id === 'S07' && p.height! < 0.49) return '先把货物提升至少0.5m；两组保持同一提升高度。';
    if (id === 'P05' && Math.abs(p.time!) > 1e-8)
      return '为比较同一位置，请把扫描时间归零，再改变规定速度核验；播放可用于另行观察扫描。';
    if (id === 'M01') {
      if (p.fold !== 90) return '先亲手折到90°。';
      const r = foldNet(hexominoes[p.net!]!);
      if (!r.valid) return '这张网不能闭成立方体，换一张后先预测1号面的相对面，再折叠。';
      const root = r.frames.get(0)!,
        opposite = [...r.frames.entries()].find(
          ([, f]) => f.n.reduce((sum, x, i) => sum + x * root.n[i]!, 0) < -0.99,
        )?.[0];
      if (prediction !== opposite! + 1) return '相对面预测还不匹配，观察面法向，重新准备再试。';
    }
    this.evidence.push({ inputs: { ...p }, value });
    this.changed = false;
    // Keep only distinct probes; elapsed time does not create a new comparison condition.
    this.evidence = this.evidence.filter(
      (e, i, a) =>
        a.findIndex((q) => q.inputs[this.studio.compare] === e.inputs[this.studio.compare]) === i,
    );
    let done = this.evidence.length >= 2;
    if(this.studio.conditions)done=this.studio.conditions.every(value=>this.evidence.some(e=>Math.abs(e.inputs[this.studio.compare]!-value)<1e-8));
    if (id === 'M01') done = true;
    if (id === 'M03') done = done && p.x === 0 && p.y === 0 && p.z !== 0;
    if (id === 'M04')
      done = [30, 60, 75].every((v) => this.evidence.some((e) => e.inputs.angle === v));
    if (id === 'M06')
      done = [90, 450].every((v) => this.evidence.some((e) => e.inputs.angle === v));
    if (id === 'P05')
      done =
        this.evidence.some((e) => e.inputs.velocity === 0) &&
        this.evidence.some(
          (a) =>
            a.inputs.velocity! > 0 &&
            this.evidence.some(
              (b) =>
                Math.abs(b.inputs.velocity! + a.inputs.velocity!) < 1e-8 &&
                Math.abs(a.value + b.value) < 1e-8,
            ),
        );
    if (id === 'C03')
      done = [0, 0.2].every((v) =>
        this.evidence.some(
          (e) => e.inputs.speed === v && e.inputs.distance === 4 && e.inputs.wait === 0,
        ),
      );
    if (id === 'S07')
      done =
        [1, 2].every((v) => this.evidence.some((e) => e.inputs.segments === v)) &&
        Math.abs(this.evidence[0]!.inputs.height! - p.height!) < 1e-8;
    if (id === 'M05') {
      const w = p.width!,
        h = p.height!,
        a = this.evidence.map((e) => e.inputs.distance!);
      const pair = (lo: number, hi: number, gap: number) =>
        a.some(
          (x) =>
            x > lo && x < hi && a.some((y) => y > lo && y < hi && Math.abs(x - y) >= gap - 1e-8),
        );
      done = pair(w, w + h, h / 3) && pair(w + h, 2 * w + h, w / 3);
    }
    this.complete = done;
    return done
      ? '独立观察已核验。数值证据支持本次比较；一般结论仍需解释适用条件与推导。'
      : `已核验${this.evidence.length}个不同条件，继续按任务要求改变${this.model.controls.find((c) => c.key === this.studio.compare)?.label}；其余题设保持不变。`;
  }
}
