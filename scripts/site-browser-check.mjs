import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const base = process.env.BROWSER_CHECK_URL ?? 'http://127.0.0.1:4321';
const out = 'test-results/site';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome', headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  page.on('pageerror', error => errors.push(error.message));
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-experiment-count]').innerText(), '12 个可探索实验');
  assert.equal(await page.locator('.space-card').count(), 4);
  assert.equal(await page.locator('.space-card .open').count(), 4);
  assert.equal(await page.locator('canvas').count(), 0);
  assert.ok(!requests.some(url => /three|pendulum-scene|buoyancy\./.test(url)), 'home must not load 3D runtime');
  const initial = await page.locator('#preview-period').innerText();
  await page.locator('#preview-length').fill('2.5');
  await page.locator('#preview-length').dispatchEvent('input');
  assert.ok(parseFloat(await page.locator('#preview-period').innerText()) > parseFloat(initial));
  await page.locator('#preview-toggle').click();
  const first = await page.locator('#preview-arm').getAttribute('transform');
  await page.waitForTimeout(200);
  assert.notEqual(await page.locator('#preview-arm').getAttribute('transform'), first);
  await page.locator('#preview-toggle').click();
  const stopped = await page.locator('#preview-arm').getAttribute('transform');
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#preview-arm').getAttribute('transform'), stopped);
  await page.screenshot({ path: `${out}/home-desktop.png`, fullPage: true });
  await page.locator('.space-card.blue').click();
  assert.equal(await page.locator('.experiment-card').count(), 3);
  await page.locator('.experiment-card').first().click();
  await page.waitForURL('**/stem-lab/buoyancy/');
  await page.locator('.back').click();
  await page.waitForURL(`${base}/`);
  await page.locator('.space-card.green').click();
  assert.equal(await page.locator('.experiment-card').count(), 3);
  await page.locator('.experiment-card').first().click();
  await page.waitForURL('**/labs/area/');
  await page.getByRole('link', { name: '全部实验', exact: true }).click();
  assert.equal(await page.locator('.experiment-card').count(), 12);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', '/experiments/', '/spaces/physics/', '/spaces/geometry/', '/spaces/cosmos/', '/spaces/structures/', '/about/']) {
      const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `no overflow at ${width}: ${path}`);
      if (path === '/') await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true });
    }
  }
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await reduced.locator('#preview-toggle').getAttribute('aria-pressed'), 'false');
  await reduced.locator('#preview-length').focus();
  await reduced.keyboard.press('ArrowRight');
  assert.equal(await reduced.locator('#preview-length-value').innerText(), '1.55 m');
  await reduced.close();
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(base);
  assert.equal(await noJS.locator('.space-card').count(), 4);
  assert.equal(await noJS.locator('.experiment-card').count(), 12);
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log('Site browser checks passed: preview, navigation, truthful catalog, 320/390px, reduced motion, keyboard and no-JS content.');
} finally { await browser.close(); }
