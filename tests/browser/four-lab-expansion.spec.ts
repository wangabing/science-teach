import { test, expect, type Page } from '@playwright/test';
import { originalStudios as studios } from '../../src/data/discovery-studios';
import { models } from '../../src/lib/discovery/registry';
import { type Inputs } from '../../src/lib/discovery/core';
const btn = (p: Page, name: string) => p.getByRole('button', { name, exact: true });
async function set(p: Page, key: string, v: number) {
  const input = p.locator(`[data-dis-input="${key}"]`);
  await input.evaluate(e=>{const details=e.closest('details');if(details)details.open=true;});
  if (await input.evaluate((e) => e.tagName === 'SELECT'))
    await input.selectOption(String(Number(v.toFixed(10))));
  else {
    await input.fill(String(Number(v.toFixed(10))));
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
  }
}
function probes(id: string): Inputs[] {
  switch (id) {
    case 'P01':
      return [
        { mass: 1, time: 1 },
        { mass: 2, time: 1 },
      ];
    case 'P05':
      return [
        { velocity: 0.1, time: 0 },
        { velocity: 0, time: 0 },
        { velocity: -0.1, time: 0 },
      ];
    case 'M01':
      return [{ fold: 90 }];
    case 'M03':
      return [{ y: 0.5 }, { y: 0 }];
    case 'M04':
      return [{ angle: 30 }, { angle: 60 }, { angle: 75 }];
    case 'M05':
      return [{ distance: 4.5 }, { distance: 5.5 }, { distance: 7.5 }, { distance: 9 }];
    case 'M06':
      return [{ angle: 90 }, { angle: 450 }];
    case 'C03':
      return [
        { speed: 0, time: 8 },
        { speed: 0.2, time: 10 },
      ];
    case 'S07':
      return [
        { segments: 1, height: 0.5 },
        { segments: 2, height: 0.5 },
      ];
    default: {
      const s = studios.find((s) => s.id === id)!,
        m = models.find((m) => m.id === id)!,
        c = m.controls.find((c) => c.key === s.compare)!;
      const vals = c.options?.map((a) => a[0]).reverse() ?? [
        c.value + 2 * c.step <= c.max ? c.value + 2 * c.step : c.value - 2 * c.step,
        c.value,
      ];
      return vals.slice(0, 2).map((v) => ({ [s.compare]: v }));
    }
  }
}
for (const studio of studios) {
  test(`${studio.id} task, two records, CSV, reference and undo`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/labs/${studio.slug}/`);
    expect(response!.status()).toBe(200);
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('#dis-tools')).toBeEnabled();
    await btn(page, '准备独立探索').click();
    await btn(page, '核验这次观察').click();
    await expect(page.locator('#dis-task-note')).not.toHaveAttribute('data-complete', 'true');
    if (studio.id === 'M01') await page.locator('#dis-prediction').selectOption('3');
    for (const q of probes(studio.id)) {
      for (const [key, v] of Object.entries(q)) {
        const input = page.locator(`[data-dis-input="${key}"]`);
        if (Number(await input.inputValue()) === v) {
          const m = models.find((m) => m.id === studio.id)!,
            c = m.controls.find((c) => c.key === key)!;
          await set(
            page,
            key,
            c.options
              ? c.options.find((a) => a[0] !== v)![0]
              : v + c.step <= c.max
                ? v + c.step
                : v - c.step,
          );
        }
        await set(page, key, v);
      }
      await btn(page, '核验这次观察').click();
    }
    await expect(page.locator('#dis-task-note')).toHaveAttribute('data-complete', 'true');
    await btn(page, '记下这一组').click();
    const saved = await page.locator('#dis-readings').innerText();
    await btn(page, '检查这个条件').click();
    await expect(page.locator('#dis-task-note')).toHaveAttribute('data-complete', 'false');
    await btn(page, '记下这一组').click();
    await expect(page.locator('#study-records article')).toHaveCount(2);
    const pending = page.waitForEvent('download');
    await btn(page, '导出 CSV').click();
    const stream = await (await pending).createReadStream(),
      chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const csv = Buffer.concat(chunks).toString();
    expect(csv).toContain('discovery-v1');
    expect(csv).not.toContain('NaN');
    expect(csv.trim().split('\r\n')).toHaveLength(3);
    await btn(page, '恢复 A').click();
    expect(await page.locator('#dis-readings').innerText()).toBe(saved);
    await expect(page.locator('#dis-task-note')).toHaveAttribute('data-complete', 'false');
    await btn(page, '撤销').click();
    await btn(page, '重做').click();
    await page.getByText('需要时，看参考状态', { exact: true }).click();
    await btn(page, '应用参考状态').click();
    await expect(page.locator('#dis-task-note')).toContainText('不计独立完成');
    expect(errors).toEqual([]);
  });
  test(`${studio.id} 320/390 responsive, keyboard and no-script`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto(`/labs/${studio.slug}/`);
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      const control = page.locator('[data-dis-input]').first();
      await control.focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#dis-svg')).toBeAttached();
    }
    await page.locator('#dis-stage').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/expansion/screens/${studio.slug}-390.png` });
    await context.close();
    const noJS = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 320, height: 844 },
      }),
      plain = await noJS.newPage();
    await plain.goto(`/labs/${studio.slug}/`);
    await expect(plain.locator('noscript')).toBeVisible();
    await expect(plain.locator('#dis-tools')).toHaveAttribute('disabled', '');
    await expect(btn(plain, '准备独立探索')).toBeDisabled();
    await expect(plain.locator('#dis-drawing')).not.toBeEmpty();
    expect(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await noJS.close();
  });
}
test('all spatial scenes rotate and WebGL loss retains evidence', async ({ page }) => {
  test.setTimeout(180000);
  for (const s of studios.filter((s) => models.find((m) => m.id === s.id)!.spatial)) {
    await page.goto(`/labs/${s.slug}/`);
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
    await btn(page, '打开三维视图').click();
    await expect(page.locator('#dis-three canvas')).toBeVisible();
    const canvas = page.locator('#dis-three canvas');
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    await canvas.evaluate((e) =>
      e.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
    );
    await expect(page.locator('#dis-svg')).toBeVisible();
    await expect(page.locator('#dis-view-note')).toContainText('三维不可用');
    await btn(page, '记下这一组').click();
    await expect(page.locator('#study-records article')).toHaveCount(1);
  }
});
test('WebGL creation fails safely and reduced motion stays paused', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes('webgl')) return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  const page = await context.newPage();
  await page.goto('/labs/cube-nets/');
  await btn(page, '打开三维视图').click();
  await expect(page.locator('#dis-view-note')).toContainText('三维不可用');
  await btn(page, '播放').click();
  await expect(page.locator('#dis-task-note')).toContainText('减少动态');
  await btn(page, '单步').click();
  expect(Number(await page.locator('[data-dis-input="fold"]').inputValue())).toBeGreaterThan(0);
  await context.close();
});
test('catalog contains all 140 routes and 37/37/33/33 entries', async ({ page }) => {
  for (const [space, count] of [
    ['physics', 37],
    ['geometry', 37],
    ['cosmos', 33],
    ['structures', 33],
  ] as const) {
    await page.goto(`/spaces/${space}/`);
    await expect(page.locator('.experiment-card')).toHaveCount(count);
  }
  await page.goto('/experiments/');
  await expect(page.locator('.experiment-card')).toHaveCount(140);
});
for (const spec of [
  { slug: 'electric-field-probe', key: 'x', x: 470, y: 160, value: 1 },
  { slug: 'moving-point-function', key: 'distance', x: 570, y: 210, value: 5.5 },
  { slug: 'refraction-interface', key: 'angle', x: 500, y: 130, value: 45 },
  { slug: 'pulley-lift', key: 'height', x: 350, y: 265, value: 0.5 },
])
  test(`actual touch and keyboard on ${spec.slug}`, async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      }),
      page = await context.newPage();
    await page.goto(`/labs/${spec.slug}/`);
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
    await page.locator('#dis-svg').scrollIntoViewIfNeeded();
    const b = (await page.locator('#dis-svg').boundingBox())!,
      client = await context.newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: b.x + b.width * 0.5, y: b.y + b.height * 0.5 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: b.x + (b.width * spec.x) / 800, y: b.y + (b.height * spec.y) / 460 }],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(Number(await page.locator(`[data-dis-input="${spec.key}"]`).inputValue())).toBeCloseTo(
      spec.value,
      1,
    );
    await page.locator('#dis-svg').focus();
    await page.keyboard.press('ArrowRight');
    expect(
      Number(await page.locator(`[data-dis-input="${spec.key}"]`).inputValue()),
    ).toBeGreaterThan(spec.value);
    await context.close();
  });
test('clock pause, step and hidden page', async ({ page }) => {
  await page.clock.install();
  await page.goto('/labs/galileo-incline/');
  await btn(page, '准备独立探索').click();
  await btn(page, '释放滑块').click();
  await page.clock.runFor(500);
  await btn(page, '暂停').click();
  const time = await page.locator('[data-dis-input="time"]').inputValue();
  await page.clock.runFor(1000);
  expect(await page.locator('[data-dis-input="time"]').inputValue()).toBe(time);
  await btn(page, '单步').click();
  expect(Number(await page.locator('[data-dis-input="time"]').inputValue())).toBeGreaterThan(
    Number(time),
  );
  await btn(page, '释放滑块').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await page.locator('[data-dis-input="time"]').inputValue();
  await page.clock.runFor(1000);
  expect(await page.locator('[data-dis-input="time"]').inputValue()).toBe(hidden);
});
test('independent current render budget without fake clock', async ({ page }) => {
  const timings: number[] = [];
  for (const slug of [
    'three-suns',
    'lagrange-station',
    'brownian-microscope',
    'cube-nets',
    'gravitational-chirp',
    'tensegrity',
  ]) {
    await page.goto(`/labs/${slug}/`);
    await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
    const first = page.locator('[data-dis-input]').first();
    await first.focus();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press(i % 2 ? 'ArrowLeft' : 'ArrowRight');
      timings.push(
        Number(await page.locator('[data-discovery]').getAttribute('data-last-render-ms')),
      );
    }
  }
  timings.sort((a, b) => a - b);
  const p95 = timings[Math.floor(timings.length * 0.95)]!;
  test.info().annotations.push({ type: 'local-render-p95-ms', description: p95.toFixed(2) });
  expect(p95).toBeLessThan(100);
});

test('retained page restores inputs and recreates disposed 3D without autoplay', async ({
  page,
}) => {
  await page.goto('/labs/cube-nets/');
  await expect(page.locator('[data-discovery]')).toHaveAttribute('data-ready', 'true');
  await set(page, 'net', 18);
  await set(page, 'fold', 75);
  await btn(page, '打开三维视图').click();
  await expect(page.locator('#dis-three canvas')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('#dis-three canvas')).toHaveCount(0);
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  );
  await expect(page.locator('#dis-svg')).toBeVisible();
  expect(await page.locator('[data-dis-input="fold"]').inputValue()).toBe('75');
  await btn(page, '打开三维视图').click();
  await expect(page.locator('#dis-three canvas')).toBeVisible();
  await expect(btn(page, '播放')).toBeVisible();
});
