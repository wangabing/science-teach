import { test, expect, type Page } from "@playwright/test";
import { additions } from "../../src/lib/discovery/expansion";
import { originalStudios } from "../../src/data/discovery-studios";
import { modelById } from "../../src/lib/discovery/registry";
import { defaults, solveModel, format } from "../../src/lib/discovery/core";
import { experienceById } from "../../src/data/discovery-experiences";
const out = process.env.EIGHTY_SCREENSHOT_DIR ?? "/tmp/science-teach-eighty";
async function set(page: Page, key: string, value: number) {
  const e = page.locator(`[data-dis-input="${key}"]`);
  await e.evaluate((el, value) => {
    (el as HTMLInputElement).value = String(value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function measurements(
  page: Page,
  expected: ReturnType<typeof solveModel>["metrics"],
) {
  await expect
    .poll(async () => {
      const actual = JSON.parse(
        (await page.locator("#dis-three").getAttribute("data-measurements")) ??
          "[]",
      );
      return (
        actual.length === expected.length &&
        expected.every((m, i) => {
          const a = actual[i];
          return (
            a.key === m.key &&
            a.unit === m.unit &&
            (m.value === null
              ? a.value === null
              : typeof a.value === "number" &&
                Math.abs(a.value - m.value) <=
                  Math.max(
                    1e-300,
                    1e-10 * Math.abs(m.value),
                    /residual|drift/.test(m.key) ? 1e-12 : 0,
                  ))
          );
        })
      );
    })
    .toBe(true);
}
for (const { model, studio, experience } of additions) {
  test(`${studio.id} live 2D+3D, independent evidence, scenes and mobile`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`/labs/${studio.slug}/`);
    await expect(page.locator("[data-discovery]")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page.evaluate(() => document.fonts.ready);
    await page
      .getByRole("button", { name: "打开三维视图", exact: true })
      .click();
    await expect(page.locator("#dis-three canvas")).toBeVisible();
    const states: string[] = [];
    for (let i = 0; i < 2; i++) {
      await page.locator(`[data-dis-scene="${i}"]`).click();
      const p = { ...defaults(model), ...experience.scenes[i]!.inputs },
        o = solveModel(model, p);
      await measurements(page, o.metrics);
      states.push(
        (await page.locator("#dis-three").getAttribute("data-geometry-hash"))!,
      );
      const liveMetrics = JSON.parse(
        (await page.locator("#dis-three").getAttribute("data-measurements"))!,
      );
      const liveMetric = liveMetrics.find(
        (m: { key: string }) => m.key === studio.metric,
      );
      await expect(page.locator("#dis-spotlight-value")).toHaveText(
        `${format(liveMetric.value)} ${liveMetric.unit}`.trim(),
      );
      await page
        .getByRole("button", { name: "记下这一组", exact: true })
        .click();
      await page
        .getByRole("button", { name: "核验这次观察", exact: true })
        .click();
      await expect(page.locator("#dis-task-note")).toContainText("请先准备");
    }
    expect(states[0]).not.toBe(states[1]);
    {
      const bounds = JSON.parse(
        (await page
          .locator("#dis-three")
          .getAttribute("data-projected-bounds"))!,
      );
      expect(bounds).toHaveLength(4);
      for (const value of bounds) expect(Math.abs(value)).toBeLessThan(1);
    }

    await expect(page.locator("#dis-record-gallery article")).toHaveCount(2);
    await page
      .locator("#dis-three")
      .screenshot({ path: `${out}/${studio.id}-3d.png` });
    await page.getByRole("button", { name: "正面", exact: true }).click();
    await page.locator("#dis-three canvas").focus();
    await page.keyboard.press("ArrowRight");
    await page
      .locator("#dis-three canvas")
      .evaluate((e) =>
        e.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await expect(page.locator("#dis-svg")).toBeVisible();
    await page
      .locator("#dis-stage")
      .screenshot({ path: `${out}/${studio.id}-2d.png` });
    await page
      .getByRole("button", { name: "准备独立探索", exact: true })
      .click();
    for (const scene of experience.scenes) {
      const target = scene.inputs[studio.compare]!;
      if (
        Number(
          await page
            .locator(`[data-dis-input="${studio.compare}"]`)
            .inputValue(),
        ) === target
      )
        await set(
          page,
          studio.compare,
          experience.scenes.find((s) => s.inputs[studio.compare] !== target)!
            .inputs[studio.compare]!,
        );
      await set(page, studio.compare, scene.inputs[studio.compare]!);
      await page
        .getByRole("button", { name: "核验这次观察", exact: true })
        .click();
    }
    await expect(page.locator("#dis-task-note")).toContainText(
      "独立观察已核验",
    );
    const val = Number(
      await page.locator(`[data-dis-input="${studio.compare}"]`).inputValue(),
    );
    await page.getByRole("button", { name: "撤销", exact: true }).click();
    expect(
      Number(
        await page.locator(`[data-dis-input="${studio.compare}"]`).inputValue(),
      ),
    ).not.toBe(val);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "导出 CSV", exact: true }).click();
    expect((await download).suggestedFilename()).toMatch(/csv$/);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const e = page.locator(`[data-dis-input="${studio.compare}"]`);
      await e.scrollIntoViewIfNeeded();
      await e.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".dis-preview")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const a = await e.boundingBox(),
        b = await page.locator(".dis-preview").boundingBox();
      expect(a!.y).toBeGreaterThanOrEqual(b!.y + b!.height - 1);
    }
    await page.screenshot({ path: `${out}/${studio.id}-mobile.png` });
    expect(errors).toEqual([]);
  });
}
for (const studio of originalStudios) {
  test(`${studio.id} retained synchronized 2D and 3D`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`/labs/${studio.slug}/`);
    await expect(page.locator("[data-discovery]")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page
      .getByRole("button", { name: "打开三维视图", exact: true })
      .click();
    await expect(page.locator("#dis-three canvas")).toBeVisible();
    const e = experienceById(studio.id),
      model = modelById(studio.id);
    const hashes: string[] = [];
    for (let i = 0; i < 2; i++) {
      await page.locator(`[data-dis-scene="${i}"]`).click();
      hashes.push(
        (await page.locator("#dis-three").getAttribute("data-geometry-hash"))!,
      );
      await measurements(
        page,
        solveModel(model, { ...defaults(model), ...e.scenes[i]!.inputs })
          .metrics,
      );
      expect(
        Number(
          await page.locator("#dis-three").getAttribute("data-geometry-count"),
        ),
      ).toBeGreaterThan(0);
    }
    expect(hashes[0]).not.toBe(hashes[1]);
    await page
      .locator("#dis-three")
      .screenshot({ path: `${out}/${studio.id}-3d.png` });
    await page
      .locator("#dis-three canvas")
      .evaluate((e) =>
        e.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await expect(page.locator("#dis-svg")).toBeVisible();
  });
}
const legacy = [
  ["area", "#leg-a"],
  ["sections", "#offset"],
  ["orbit", "#speed"],
  ["three-body", "#perturbation"],
  ["bridge", "#load"],
  ["gears", "#input-teeth"],
  ["interference", "#wave-phase"],
  ["circuits", "#circuit-emf"],
  ["resistors", "#divider-upper"],
  ["capacitors", "#rc-resistance"],
  ["reflection", "#geo-point"],
  ["circle-angles", "#geo-angle"],
  ["triangle-rigidity", "#geo-angle"],
  ["ellipse-string", "#geo-angle"],
] as const;
for (const [slug, control] of legacy)
  test(`legacy ${slug} synchronized spatial workbench`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`/labs/${slug}/`);
    if (slug === "bridge") await page.locator("#truss").click();
    if (slug === "capacitors") await page.locator("#rc-step-second").click();
    const root = page.locator("[data-legacy-spatial]");
    await expect(root).toHaveAttribute("data-ready", "true");
    await root
      .getByRole("button", { name: "打开三维视图", exact: true })
      .click();
    await expect(root.locator("canvas")).toBeVisible();
    expect(
      Number(await root.getAttribute("data-geometry-count")),
    ).toBeGreaterThan(0);
    const before = await root.getAttribute("data-revision");
    const beforeGeometry = await root.getAttribute("data-geometry-hash");
    const input = page.locator(control);
    if (
      (await input.count()) &&
      (await input.evaluate((el) => el instanceof HTMLInputElement))
    ) {
      await input.evaluate((el) => {
        const e = el as HTMLInputElement;
        e.value = String(
          Math.min(
            Number(e.max) || 100,
            Number(e.value) + (Number(e.step) || 1),
          ),
        );
        e.dispatchEvent(new Event("input", { bubbles: true }));
        e.dispatchEvent(new Event("change", { bubbles: true }));
      });
    } else {
      const e = page.locator('input[type="range"]').first();
      await e.evaluate((el) => {
        const e = el as HTMLInputElement;
        e.value = String(Number(e.value) + (Number(e.step) || 1));
        e.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    if (slug === "capacitors") await page.locator("#rc-step-second").click();
    await expect
      .poll(() => root.getAttribute("data-revision"))
      .not.toBe(before);
    await expect
      .poll(() => root.getAttribute("data-geometry-hash"))
      .not.toBe(beforeGeometry);
    await root
      .locator("[data-legacy-host]")
      .screenshot({ path: `${out}/legacy-${slug}-3d.png` });
    await root.locator("canvas").focus();
    await page.keyboard.press("ArrowRight");
    await root
      .locator("canvas")
      .evaluate((e) =>
        e.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await expect(root.locator("canvas")).toHaveCount(0);
    await expect(page.locator("svg").first()).toBeVisible();
    await page.setViewportSize({ width: 320, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
for (const [slug, path, selector] of [
  ["buoyancy", "/stem-lab/buoyancy/", "#buoyancy-2d"],
  ["pendulum", "/stem-lab/pendulum/", "#fallback-svg"],
] as const)
  test(`native ${slug} explicit live two-dimensional view`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("canvas").first()).toBeVisible();
    await page
      .getByRole("button", { name: "查看二维实验", exact: true })
      .click();
    await expect(page.locator(selector)).toBeVisible();
    const before = await page.locator(selector).innerHTML();
    const e = page
      .locator(slug === "buoyancy" ? "#immersion" : 'input[type="range"]')
      .first();
    await e.evaluate((el) => {
      const e = el as HTMLInputElement;
      e.value = String(Number(e.value) + (Number(e.step) || 1));
      e.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect
      .poll(() => page.locator(selector).innerHTML())
      .not.toBe(before);
    await page
      .getByRole("button", { name: "返回三维实验", exact: true })
      .click();
    await expect(page.locator("canvas").first()).toBeVisible();
  });
test("eighty additions retain no-script diagrams and disabled native controls", async ({
  browser,
}) => {
  test.setTimeout(180000);
  const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 844 },
    }),
    page = await context.newPage();
  for (const { studio } of additions) {
    await page.goto(`/labs/${studio.slug}/`);
    expect(await page.locator("#dis-drawing > *").count()).toBeGreaterThan(0);
    await expect(page.locator("#dis-tools")).toHaveAttribute("disabled", "");
    await expect(page.locator("noscript")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await context.close();
});
