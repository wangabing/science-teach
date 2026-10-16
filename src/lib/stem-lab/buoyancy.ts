export const APPARATUS = {
  cubeSideCm: 10,
  cubeDensity: 2700,
  gravity: 10,
  tankAreaCm2: 400,
  initialLevelCm: 15,
} as const;

export function buoyancyState(depthCm: number, density: number) {
  const immersionCm = Math.min(10, Math.max(0, Number.isFinite(depthCm) ? depthCm : 0));
  const liquidDensity = Math.min(1200, Math.max(800, Number.isFinite(density) ? density : 1000));
  const displacedCm3 = APPARATUS.cubeSideCm ** 2 * immersionCm;
  const buoyancyN = liquidDensity * APPARATUS.gravity * displacedCm3 / 1e6;
  const weightN = APPARATUS.cubeDensity * APPARATUS.gravity * APPARATUS.cubeSideCm ** 3 / 1e6;
  const riseCm = displacedCm3 / APPARATUS.tankAreaCm2;
  const levelCm = APPARATUS.initialLevelCm + riseCm;
  return {
    immersionCm, liquidDensity, displacedCm3, buoyancyN, weightN,
    tensionN: weightN - buoyancyN, riseCm, levelCm,
    cubeBottomCm: levelCm - immersionCm,
    bottomPressurePa: liquidDensity * APPARATUS.gravity * levelCm / 100,
  };
}
