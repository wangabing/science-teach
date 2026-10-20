import {demonstrationValue} from '../../lib/discovery/demonstration';
import { experienceById } from "../../data/discovery-experiences";
import { observationCue } from "../../lib/discovery/observation-cues";
import { apparatusDrawing } from "../../lib/discovery/presentation";
import { studioById } from "../../data/discovery-studios";
import {
  defaults,
  solveModel,
  format,
  csv,
  clamp,
  type Inputs,
  type Snapshot,
  type Observation,
} from "../../lib/discovery/core";
import { Investigation } from "../../lib/discovery/task";
import { setupNotebook } from "../exploration/study-notebook";
import { renderCharts, chartCursor } from "./charts";
import {tidalXToDistance,tidalWorldXToDistance} from '../../lib/discovery/tidal';
const root = document.querySelector<HTMLElement>("[data-discovery]");
if (root) void boot(root).catch((error)=>{
  root.dataset.ready='error';
  root.dataset.loadError=error instanceof Error?error.message:String(error);
  const notice=document.createElement('p'),retry=document.createElement('button');
  notice.className='dis-noscript';notice.setAttribute('role','alert');notice.textContent='实验暂时没有加载成功。历史与默认图仍可阅读，请重试后再操作。';
  retry.type='button';retry.textContent='重新加载实验';retry.addEventListener('click',()=>location.reload());notice.append(' ',retry);
  root.querySelector('#dis-tools')?.before(notice);
});
async function boot(root: HTMLElement) {
  const id = root.dataset.discovery!,
    studio = studioById(id),
    experience = experienceById(id),
    get = (key: string) => root.querySelector<HTMLElement>(`#dis-${key}`)!;
  const { modelById } = await import("../../lib/discovery/registry");
  const model = modelById(id),
    task = new Investigation(model, studio);
  const primaryMetric=(o:Observation,inputs:Inputs)=>o.metrics.find(m=>m.key===(id==='C05'&&inputs.mode===1?'acceleration':studio.metric))??o.metrics[0]!;
  const restoredInputs=(inputs:Inputs)=>({...defaults(model),...inputs});
  let p = defaults(model),
    current: Observation,
    undo: Inputs[] = [],
    redo: Inputs[] = [],
    running = false,
    raf = 0,
    last = 0,
    acc = 0,
    drag = -1,
    dragBefore: Inputs | null = null,
    scene:
      | ReturnType<(typeof import("./scene"))["createDiscoveryScene"]>
      | undefined,
    sceneVisible = false,
    disposed = false;
  let demoStarted=false, demoRunning=false, demoRaf=0, demoLast=0, demoDistance=0, demoBefore:Inputs|null=null;
  const clone = (v: Inputs) => ({ ...v }),
    same = (a: Inputs, b: Inputs) => JSON.stringify(a) === JSON.stringify(b),
    push = (v: Inputs) => {
      if (!same(v, p)) {
        undo.push(v);
        if (undo.length > 40) undo.shift();
        redo = [];
      }
    };
  // Keep the active parameter below the sticky live view on narrow screens.
  function revealParameter(event: {target: EventTarget | null}) {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) ||
      !target.matches("[data-dis-input]") ||
      !matchMedia("(max-width: 760px)").matches
    )
      return;
    const preview = root.querySelector<HTMLElement>(".dis-preview");
    if (!preview) return;
    const top = target.getBoundingClientRect().top;
    const bottom = preview.getBoundingClientRect().bottom;
    if (top < bottom + 12)
      window.scrollBy({ top: top - bottom - 12, behavior: "instant" });
  }
  root.addEventListener("focusin", revealParameter);
  root.addEventListener("input", revealParameter);
  function status(text: string) {
    get("task-note").textContent = text;
    get("task-note").dataset.complete = String(task.complete);
  }
  function clear(message = "条件已改变，独立任务已清除；记录仍保留。") {
    task.clear();
    root
      .querySelectorAll("[data-dis-scene]")
      .forEach((button) => button.setAttribute("aria-pressed", "false"));
    status(message);
  }
  function pause() {
    demoRunning=false;cancelAnimationFrame(demoRaf);
    if(model.demonstration){
      get('demo').setAttribute('aria-pressed','false');get('demo').textContent=model.demonstration.title;
      get('demo-state').textContent=`已暂停 / 可操作 · ${model.controls.find(c=>c.key===model.demonstration!.key)!.label} ${format(p[model.demonstration.key]!)} ${model.controls.find(c=>c.key===model.demonstration!.key)!.unit} · 演示不计独立任务`;
      if(demoBefore)push(demoBefore);demoBefore=null;
    }
    running = false;
    cancelAnimationFrame(raf);
    if (model.time) get("play").setAttribute("aria-pressed", "false");
    if (model.time)
      get("play").textContent =
        id === "C03" ? "发送光信号" : id === "P01" ? "释放滑块" : "播放";
  }
  function render() {
    const started = performance.now();
    current = solveModel(model, p);
    const illustration = apparatusDrawing(id, p, current);
    get("drawing").innerHTML = illustration;
    get("preview-drawing").innerHTML = illustration.replaceAll(
      "apparatus-",
      "preview-apparatus-",
    );
    const spotlight = primaryMetric(current,p);
    get('spotlight-label').textContent=`看这里 · ${spotlight.label}`;
    get("spotlight-value").textContent =
      `${format(spotlight.value)} ${spotlight.unit}`;
    get("observe").textContent = observationCue(id, p, current);
    get("preview-value").textContent =
      `${spotlight.label} ${format(spotlight.value)} ${spotlight.unit}`;
    for (const c of model.controls) {
      const input = get(`input-${c.key}`) as HTMLInputElement;
      if (id === "M02" && c.key === "slice") input.max = String(p.height);
      if (id === "M05" && c.key === "distance")
        input.max = String(2 * (p.width! + p.height!));
      // The clock is continuous. Native range stepping otherwise silently rounds its
      // value while the apparatus and measurements retain a different instant.
      if(model.time?.key===c.key) input.step='any';
      input.value = String(p[c.key]);
      get(`value-${c.key}`).textContent = `${format(p[c.key]!)} ${c.unit}`;
    }
    const direct=get('direct-input') as HTMLInputElement,original=get(`input-${studio.compare}`) as HTMLInputElement;
    if(original.type==='range'){direct.min=original.min;direct.max=original.max;direct.step=original.step;}
    direct.value=String(p[studio.compare]);
    get('direct-value').textContent=`${format(p[studio.compare]!)} ${model.controls.find(c=>c.key===studio.compare)!.unit}`;
    // Research modes may have a different set of observables (e.g. a local sail force versus flight).
    get('readings').replaceChildren(...current.metrics.map(q=>{
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd'),unit=document.createElement('small');
      row.dataset.reading=q.key;row.classList.toggle('dis-key-reading',q.key===studio.metric);
      dt.textContent=q.label;dd.textContent=format(q.value)+' ';unit.textContent=q.unit;dd.append(unit);row.append(dt,dd);return row;
    }));
    if (id === "M01")
      (get("prediction") as HTMLSelectElement).disabled = p.fold! > 0;
    get("model-note").textContent = current.note;
    get("model-note").dataset.status = current.status;
    renderCharts(get("charts"), current.curves, chartCursor(id, p, current));
    get("empty-chart").hidden = !!current.curves.length;
    (get("undo") as HTMLButtonElement).disabled = !undo.length;
    (get("redo") as HTMLButtonElement).disabled = !redo.length;
    if (model.time)
      get("clock").textContent =
        `${format(p[model.time.key]!)} ${model.controls.find((c) => c.key === model.time!.key)?.unit}`;
    if(model.demonstration) get('demo-state').textContent=`${demoRunning?'正在扫描':'已暂停 / 可操作'} · ${model.controls.find(c=>c.key===model.demonstration!.key)!.label} ${format(p[model.demonstration.key]!)} ${model.controls.find(c=>c.key===model.demonstration!.key)!.unit} · 演示不计独立任务`;
    if (scene && sceneVisible) scene.update(current);
    root.dataset.ready = "true";
    root.dataset.lastRenderMs = String(performance.now() - started);
    // A changed reading can wrap onto another line and grow the sticky preview.
    // Measure after the new content is laid out, not only before the input handler.
    revealParameter({target: document.activeElement});
  }
  function edit(key: string, value: number) {
    if (!Number.isFinite(value)) return;
    const c = model.controls.find((c) => c.key === key)!;
    value = clamp(
      Math.round((value - c.min) / c.step) * c.step + c.min,
      c.min,
      c.max,
    );
    if (value === p[key]) return;
    p[key] = Number(value.toFixed(10));
    root
      .querySelectorAll("[data-dis-scene]")
      .forEach((button) => button.setAttribute("aria-pressed", "false"));
    if (id === "M02") p.slice = Math.min(p.slice!, p.height!);
    if (id === "M05")
      p.distance = Math.min(p.distance!, 2 * (p.width! + p.height!));
    task.edit(p, key);
    if (!task.active) status("题设改变，任务比较已清除。重新准备后继续。");
    else status("已操作；观察读数后核验这一组。");
    render();
  }
  // Store one undo step per slider gesture, including native keyboard changes.
  const pending = new Map<string, Inputs>();
  const direct=get('direct-input') as HTMLInputElement;
  direct.addEventListener('input',()=>{pause();if(!pending.has('direct'))pending.set('direct',clone(p));edit(studio.compare,Number(direct.value));});
  direct.addEventListener('change',()=>{push(pending.get('direct')??clone(p));pending.delete('direct');render();});
  root
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-dis-input]")
    .forEach((input) => {
      if(input.dataset.disInput===model.time?.key)input.addEventListener('keydown',event=>{
        if(!(event instanceof KeyboardEvent))return;
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
        event.preventDefault();pause();const key=input.dataset.disInput!,control=model.controls.find(c=>c.key===key)!;
        push(clone(p));edit(key,p[key]!+(['ArrowRight','ArrowUp'].includes(event.key)?control.step:-control.step));
      });
      input.addEventListener("input", () => {
        pause();
        const key = input.dataset.disInput!;
        if (!pending.has(key)) pending.set(key, clone(p));
        edit(key, Number(input.value));
      });
      input.addEventListener("change", () => {
        const key = input.dataset.disInput!,
          before = pending.get(key) ?? clone(p);
        push(before);
        pending.delete(key);
        render();
      });
    });
  root
    .querySelectorAll<HTMLButtonElement>("[data-dis-scene]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        pause();
        const before = clone(p),
          preset = experience.scenes[Number(button.dataset.disScene)]!;
        p = { ...defaults(model), ...preset.inputs };
        push(before);
        clear(
          `正在观察「${preset.name}」。情景不计独立完成；可撤销或重新准备。`,
        );
        root
          .querySelectorAll("[data-dis-scene]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        get("observe").textContent = preset.detail + "。" + experience.look;
        render();
      });
    });
  get("reset").addEventListener("click", () => {
    pause();
    const before = clone(p);
    p = defaults(model);
    demoStarted=false;
    push(before);
    clear("已重置。可以自由探索，或准备独立任务。");
    render();
  });
  for (const action of ["reference", "counter"])
    get(action).addEventListener("click", () => {
      pause();
      const before = clone(p);
      p = {
        ...defaults(model),
        ...(action === "counter" ? studio.counter : {}),
      };
      push(before);
      clear(
        action === "counter"
          ? "已应用迁移条件。观察模型边界，并用推导解释。"
          : "已应用参考，不计独立完成。重新准备后亲手探索。",
      );
      render();
    });
  get("prepare").addEventListener("click", () => {
    pause();
    const before = clone(p);
    p = defaults(model);
    if (id === "P01" || id === "C03" || id === "S07") p[model.time!.key] = 0;
    if (id === "S07") p.segments = 1;
    if (id === "M01") {
      p.net = 18;
      p.fold = 0;
      (get("prediction") as HTMLSelectElement).value = "0";
    }
    push(before);
    get("observe").textContent = experience.look;
    root
      .querySelectorAll("[data-dis-scene]")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    root
      .querySelectorAll<HTMLDetailsElement>(".dis-task-brief")
      .forEach((d) => (d.open = true));
    task.prepare(p);
    status("任务已准备。" + studio.task);
    render();
  });
  get("check").addEventListener("click", () =>
    status(
      task.check(
        p,
        id === "M01"
          ? Number((get("prediction") as HTMLSelectElement).value)
          : undefined,
      ),
    ),
  );
  get("undo").addEventListener("click", () => {
    pause();
    const old = undo.pop();
    if (!old) return;
    redo.push(clone(p));
    p = old;
    clear("已撤销并重新计算；独立任务已清除。");
    render();
  });
  get("redo").addEventListener("click", () => {
    pause();
    const next = redo.pop();
    if (!next) return;
    undo.push(clone(p));
    p = next;
    clear("已重做并重新计算；独立任务已清除。");
    render();
  });
  function limit() {
    let end = model.time!.max;
    if (id === "P01") {
      const q = current.metrics.find((m) => m.key === "arrival")?.value;
      if (q) end = Math.min(end, q);
    }
    if(id==='P12') end=Math.min(end,current.metrics.find(m=>m.key==='arrival')!.value??end);
    if (id === "M05") end = Math.min(end, 2 * (p.width! + p.height!));
    if (id === "C03")
      end = Math.min(
        end,
        current.metrics.find((m) => m.key === "return")!.value!,
      );
    return end;
  }
  function advance(amount: number) {
    const key = model.time!.key;
    const start=model.controls.find(c=>c.key===key)!.min;
    p[key] = model.time!.loop ? start+(p[key]! + amount-start) % (limit()-start) : Math.min(limit(), p[key]! + amount);
    task.edit(p, key);
    render();
    if (p[key]! >= limit() || current.status === "invalid") pause();
  }
  function frame(now: number) {
    if (!running || disposed) return;
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    if (acc >= 1 / 30) {
      const n = Math.floor(acc * 30);
      acc -= n / 30;
      advance((n / 30) * (model.time!.rateAt?.(p)??model.time!.rate));
    }
    if (running) raf = requestAnimationFrame(frame);
  }
  if (model.time) {
    get("play").addEventListener("click", () => {
      if (running) {
        pause();
        return;
      }
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        status("已启用减少动态，请用单步或时间滑块查看各时刻。");
        return;
      }
      const before = clone(p);
      if (p[model.time!.key]! >= limit()) p[model.time!.key] = model.controls.find(c=>c.key===model.time!.key)!.min;
      push(before);
      running = true;
      get("play").setAttribute("aria-pressed", "true");
      get("play").textContent = "暂停";
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    });
    get("step").addEventListener("click", () => {
      pause();
      const before = clone(p);
      advance((model.time!.rateAt?.(p)??model.time!.rate) / 10);
      push(before);
      render();
    });
    get("rewind").addEventListener("click", () => {
      pause();
      const before = clone(p);
      edit(model.time!.key, model.controls.find(c=>c.key===model.time!.key)!.min);
      push(before);
      render();
    });
  }
  const visibility = () => {
    if (document.hidden) pause();
  };
  document.addEventListener("visibilitychange", visibility);
  if(model.demonstration){
    const demo=model.demonstration;
    const begin=()=>{demoBefore=clone(p);clear('演示用于观察，不计独立任务；暂停后重新准备可独立探索。');};
    const demoFrame=(now:number)=>{
      if(!demoRunning||disposed)return;
      demoDistance=Math.max(demo.to,demoDistance-Math.min(.1,(now-demoLast)/1000)*(demo.from-demo.to)/demo.duration);demoLast=now;
      edit(demo.key,demonstrationValue(model,demoDistance));
      if(demoDistance<=demo.to){pause();render();return;}
      demoRaf=requestAnimationFrame(demoFrame);
    };
    get('demo').addEventListener('click',()=>{
      if(demoRunning){pause();render();return;}
      pause();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){get('demo-state').textContent='已启用减少动态，请用单步按钮或参数滑块观察。';return;}
      begin();
      if(!demoStarted||p[demo.key]!<=demo.to||p[demo.key]!>demo.from)edit(demo.key,demo.from);
      demoStarted=true;
      demoDistance=p[demo.key]!;demoRunning=true;demoLast=performance.now();
      get('demo').setAttribute('aria-pressed','true');get('demo').textContent='暂停演示';render();
      demoRaf=requestAnimationFrame(demoFrame);
    });
    get('demo-step').addEventListener('click',()=>{pause();const before=clone(p);clear('参数扫描不计独立任务；可重新准备。');edit(demo.key,p[demo.key]!<=demo.to?demo.from:Math.max(demo.to,p[demo.key]!-demo.step));push(before);render();});
  }
  const svg = get("svg") as unknown as SVGSVGElement;
  if (model.drag || ["S07", "C05"].includes(id)) {
    svg.dataset.draggable = "true";
    svg.setAttribute("role", "group");
    svg.setAttribute("tabindex", "0");
    svg.setAttribute(
      "aria-label",
      `${studio.name}可拖动装置，也可用带标签的参数控件和方向键操作`,
    );
    const key = model.drag?.key ?? (id === "S07" ? "height" : "angle");
    const control = model.controls.find((c) => c.key === key)!;
    function move(e: PointerEvent) {
      if (drag !== e.pointerId) return;
      const b = svg.getBoundingClientRect(),
        x = ((e.clientX - b.left) / b.width) * 800,
        y = ((e.clientY - b.top) / b.height) * 460;
      let value = (x / 800) * (control.max - control.min) + control.min;
      if (id === "P04") value = (x - 400) / 70;
      if (id === "S19") value = Math.hypot(x-560,y-230)/45;
      if (id === "C07") value = tidalXToDistance(x);
      if (id === "M05") {
        const w = p.width!,
          h = p.height!,
          s = Math.min(400 / Math.max(w, h), 310 / h),
          xx = clamp((x - 170) / s, 0, w),
          yy = clamp((360 - y) / s, 0, h),
          candidates = [
            [Math.abs(yy), xx],
            [Math.abs(xx - w), w + yy],
            [Math.abs(yy - h), w + h + w - xx],
            [Math.abs(xx), 2 * w + h + h - yy],
          ].sort((a, b) => a[0]! - b[0]!);
        value = candidates[0]![1]!;
      }
      if (id === "P10")
        value =
          (Math.atan2(Math.abs(x - 400), Math.max(1, 230 - y)) * 180) / Math.PI;
      if (id === "S06")
        value = ((Math.atan2(250 - y, x - 180) * 180) / Math.PI + 360) % 360;
      if (id === "M06")
        value = ((Math.atan2(240 - y, x - 210) * 180) / Math.PI + 360) % 360;
      if (id === "S07") value = clamp((330 - y) / 130, 0, 1);
      if (id === "C05") value = clamp((x - 300) / 4, 0, 90);
      edit(key, value);
    }
    svg.addEventListener("pointerdown", (e) => {
      if(id==='C07'&&!(e.target instanceof Element&&e.target.closest('[data-tidal-handle]')))return;
      pause();
      e.preventDefault();
      drag = e.pointerId;
      dragBefore = clone(p);
      svg.setPointerCapture(drag);
      svg.focus();
      move(e);
    });
    svg.addEventListener("pointermove", move);
    const end = (e: PointerEvent) => {
      if (drag !== e.pointerId) return;
      drag = -1;
      if (dragBefore) push(dragBefore);
      dragBefore = null;
      render();
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("keydown", (e) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      pause();
      const before = clone(p);
      edit(
        key,
        e.key === "Home"
          ? control.min
          : e.key === "End"
            ? control.max
            : p[key]! +
              control.step *
                (e.shiftKey ? 10 : 1) *
                (["ArrowLeft", "ArrowDown"].includes(e.key) ? -1 : 1),
      );
      push(before);
      render();
    });
  }
  setupNotebook<Snapshot>({
    snapshot: () => ({ version: "discovery-v1", id, inputs: clone(p) }),
    clone: (s) => ({ ...s, inputs: clone(s.inputs) }),
    restore: (s) => {
      pause();
      const before = clone(p);
      solveModel(model, restoredInputs(s.inputs));
      p = restoredInputs(s.inputs);
      push(before);
      clear("已恢复输入并重新计算；任务资格清除。");
      render();
    },
    summary: (s) => {
      const q = primaryMetric(solveModel(model,restoredInputs(s.inputs)),restoredInputs(s.inputs));
      return `${model.controls.find((c) => c.key === studio.compare)!.label}=${format(s.inputs[studio.compare]!)}；${q.label}=${format(q.value)} ${q.unit}`;
    },
    compare: (a, b) => {
      const changed = model.controls.filter(
        (c) => a.inputs[c.key] !== b.inputs[c.key],
      );
      return `${changed.length === 1 ? "单变量比较" : "注意：" + changed.length + "个变量不同"}：${changed.map((c) => c.label).join("、") || "条件相同"}。${studio.proof}`;
    },
    csv: (states) => csv(model, states),
    filename: `${studio.slug}-observations.csv`,
    onRecordsChange(records) {
      get("record-views").hidden = !records.length;
      get("record-gallery").replaceChildren();
      records.forEach((record, index) => {
        const observation = solveModel(model, restoredInputs(record.inputs)),
          metric = primaryMetric(observation,record.inputs),
          tag = index ? "B" : "A";
        const card = document.createElement("article"),
          title = document.createElement("h3"),
          caption = document.createElement("p");
        title.textContent = `${tag} · ${metric.label} ${format(metric.value)} ${metric.unit}`;
        const image = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        image.setAttribute("viewBox", "0 0 800 460");
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", `${tag}组装置快照`);
        image.innerHTML = apparatusDrawing(
          id,
          restoredInputs(record.inputs),
          observation,
        ).replaceAll("apparatus-", `record-${tag}-apparatus-`);
        caption.textContent = experience.primary
          .map((key) => {
            const c = model.controls.find((c) => c.key === key)!;
            return `${c.label} ${format(record.inputs[key]!)} ${c.unit}`;
          })
          .join(" · ");
        card.append(title, image, caption);
        get("record-gallery").append(card);
      });
    },
  });
  if (model.spatial) {
    root
      .querySelectorAll<HTMLButtonElement>("[data-dis-camera]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          scene?.setView(button.dataset.disCamera!),
        ),
      );
    get("view").addEventListener("click", async () => {
      pause();
      sceneVisible = !sceneVisible;
      get("three").hidden = !sceneVisible;
      get("camera-controls").hidden = !sceneVisible;
      svg.toggleAttribute("hidden", sceneVisible);
      get("view").setAttribute("aria-pressed", String(sceneVisible));
      get("view").textContent = sceneVisible ? "回到二维证据" : "打开三维视图";
      if (!sceneVisible) return;
      const fallback = () => {
        sceneVisible = false;
        scene?.dispose();
        scene = undefined;
        get("three").hidden = true;
        get("camera-controls").hidden = true;
        svg.removeAttribute("hidden");
        get("view").setAttribute("aria-pressed", "false");
        get("view").textContent = "重试三维视图";
        get("view-note").textContent =
          "三维不可用，已切回二维证据；参数、读数、任务和记录均可继续。";
      };
      const viewButton = get("view") as HTMLButtonElement;
      viewButton.disabled = true;
      try {
        if (!scene) {
          const adapter = await import("./scene");
          if (disposed) return;
          scene = adapter.createDiscoveryScene(
            get("three"),
            studio.space === "cosmos",
            id,
            fallback,
            id==='C07'?{
              begin:()=>{pause();dragBefore=clone(p);},
              move:(point)=>edit('distance',tidalWorldXToDistance(point[0])),
              end:()=>{if(dragBefore)push(dragBefore);dragBefore=null;render();},
            }:undefined,
          );
        }
        scene.update(current);
        if (id === "C06")
          get("view-note").textContent =
            "观测天空为原创合成背景，按Schwarzschild光轨道映射弯折，非EHT实测。青圈标出所选冲量参数；二维图追踪同一束光。三维相机可旋转背景方向。";
      } catch(error) {
        root.dataset.spatialError=error instanceof Error?error.message:String(error);
        fallback();
      } finally {
        viewButton.disabled = false;
      }
    });
  }
  render();
  (get("tools") as HTMLFieldSetElement).disabled = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    pause();
    scene?.dispose();
    scene = undefined;
    document.removeEventListener("visibilitychange", visibility);
  };
  const returned = (event: PageTransitionEvent) => {
    if (!event.persisted || !disposed) return;
    disposed = false;
    document.addEventListener("visibilitychange", visibility);
    if (model.spatial) {
      sceneVisible = false;
      get("three").hidden = true;
      get("camera-controls").hidden = true;
      svg.removeAttribute("hidden");
      get("view").setAttribute("aria-pressed", "false");
      get("view").textContent = "打开三维视图";
      get("view-note").textContent =
        "已返回实验，播放保持暂停；可重新打开三维。";
    }
    render();
  };
  window.addEventListener("pagehide", dispose);
  window.addEventListener("pageshow", returned);
  document.addEventListener(
    "astro:before-swap",
    () => {
      dispose();
      window.removeEventListener("pagehide", dispose);
      window.removeEventListener("pageshow", returned);
    },
    { once: true },
  );
}
