import {solveLens, type LensInput} from './lens.ts';
export type LensRecord = LensInput & {extensions: boolean};
export const LENS_STORAGE_KEY = 'science-teach:lens-notebook:v1';
const ranges = {object: [5,80,.1], screen: [5,100,.1], focal: [6,16,.5]} as const;
export function decodeRecords(raw: string): LensRecord[] {
 const data: unknown = JSON.parse(raw);
 if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('records' in data) || !Array.isArray(data.records) || data.records.length > 6) throw new Error('Invalid notebook');
 return data.records.map((row: unknown) => {
  if (!row || typeof row !== 'object') throw new Error('Invalid record');
  const record = row as Record<string,unknown>;
  for (const key of ['object','screen','focal'] as const) {
   const n = record[key], [min,max,step] = ranges[key];
   if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max || Math.abs(n/step-Math.round(n/step)) > 1e-7) throw new Error('Invalid condition');
  }
  if (record.height !== 2 || typeof record.extensions !== 'boolean') throw new Error('Invalid record');
  return {object: record.object as number, screen: record.screen as number, focal: record.focal as number, height: 2, extensions: record.extensions};
 });
}
export function compareRecords(a: LensRecord, b: LensRecord): string {
 const labels = {focal:'焦距',object:'物距',screen:'屏距'};
 const keys = ['focal','object','screen'] as const;
 const fixed = keys.filter(k => a[k] === b[k]).map(k => `${labels[k]} ${a[k].toFixed(1)} cm`);
 const changed = keys.filter(k => a[k] !== b[k]).map(k => `${labels[k]} ${a[k].toFixed(1)} → ${b[k].toFixed(1)} cm`);
 const conditions = `固定：${fixed.join('、') || '没有相同的距离条件'}。变化：${changed.join('、') || '距离条件相同'}。`;
 const x = solveLens(a), y = solveLens(b);
 if (a.focal !== b.focal) return conditions + '先固定焦距，再改变物距比较；这两组不能单独说明物距的作用。';
 if (a.object === b.object) return conditions + (a.screen !== b.screen ? '只移动光屏，理论像距不变；比较两组的对焦状态。' : '试着保留这组，再改变物距并重新调焦。');
 if (!(x.focused && y.focused)) return conditions + '先让两组都接到清晰实像，再比较物距和像距；虚像和焦点情景可单独观察。';
 return conditions + `这两组中，物距${b.object > a.object ? '增大' : '减小'}，理论像距从 ${x.image!.toFixed(2)} → ${y.image!.toFixed(2)} cm。屏距为重新调焦而调整；两组证据还不足以代表所有情况。`;
}
export function challengeHint(p: LensInput, challenge: string): string {
 const r = solveLens(p);
 if (challenge === 'upright') return '让物距小于焦距，观察正立放大的虚像；它不能投到光屏。';
 if (r.regime === 'virtual') return '当前是虚像，光屏接不到清晰图案。先把物体移到焦点外。';
 if (r.regime === 'focus') return '物体恰在焦点，出射光平行。先把物体移离焦点、增大物距。';
 if (r.image! > 100) return '像面超出光屏 100 cm 行程。先增大物距，让像面回到行程内。';
 if (r.regime !== (challenge === 'small' ? 'reduced' : 'enlarged')) return challenge === 'small' ? '先让物距大于两倍焦距，得到缩小实像，再调焦。' : '先让物距在一倍与两倍焦距之间，得到放大实像，再调焦。';
 return `像的性质符合要求，光屏尚未对焦。把光屏${p.screen < r.image! ? '移远' : '移近'}，让两条光线靠拢。`;
}
