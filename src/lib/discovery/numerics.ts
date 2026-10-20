/** Pivoted Gaussian elimination; returns null for a singular system. */
export function linearSolve(A: number[][], b: number[], eps = 1e-12): number[] | null {
  const n = b.length,
    a = A.map((r, i) => [...r, b[i]!]),
    scale = Math.max(1, ...A.flat().map(Math.abs));
  for (let j = 0; j < n; j++) {
    let row = j;
    for (let i = j + 1; i < n; i++) if (Math.abs(a[i]![j]!) > Math.abs(a[row]![j]!)) row = i;
    if (Math.abs(a[row]![j]!) < eps * scale) return null;
    [a[j], a[row]] = [a[row]!, a[j]!];
    const pivot = a[j]![j]!;
    for (let k = j; k <= n; k++) a[j]![k]! /= pivot;
    for (let i = 0; i < n; i++)
      if (i !== j) {
        const f = a[i]![j]!;
        for (let k = j; k <= n; k++) a[i]![k]! -= f * a[j]![k]!;
      }
  }
  return a.map((r) => r[n]!);
}
export function eigenvaluesSymmetric(A: number[][]) {
  const a = A.map((r) => [...r]),
    n = a.length;
  for (let iter = 0; iter < 100 * n * n; iter++) {
    let p = 0,
      q = 1,
      max = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (Math.abs(a[i]![j]!) > max) {
          p = i;
          q = j;
          max = Math.abs(a[i]![j]!);
        }
    if (max < 1e-8) break;
    const angle = 0.5 * Math.atan2(2 * a[p]![q]!, a[q]![q]! - a[p]![p]!),
      c = Math.cos(angle),
      s = Math.sin(angle),
      ap = a[p]![p]!,
      aq = a[q]![q]!,
      off = a[p]![q]!;
    for (let k = 0; k < n; k++)
      if (k !== p && k !== q) {
        const x = a[k]![p]!,
          y = a[k]![q]!;
        a[k]![p] = a[p]![k] = c * x - s * y;
        a[k]![q] = a[q]![k] = s * x + c * y;
      }
    a[p]![p] = c * c * ap - 2 * s * c * off + s * s * aq;
    a[q]![q] = s * s * ap + 2 * s * c * off + c * c * aq;
    a[p]![q] = a[q]![p] = 0;
  }
  return a.map((r, i) => r[i]!).sort((a, b) => a - b);
}
export const bisect = (f: (x: number) => number, a: number, b: number, iterations = 70) => {
  let fa = f(a);
  if (fa * f(b) > 0) throw new RangeError('Root not bracketed');
  for (let i = 0; i < iterations; i++) {
    const mid = (a + b) / 2,
      fm = f(mid);
    if (fa * fm <= 0) b = mid;
    else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
};
export type Complex = [number, number];
export const add = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]];
export const mul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
];
export const div = (a: Complex, b: Complex): Complex => {
  const d = b[0] ** 2 + b[1] ** 2;
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
