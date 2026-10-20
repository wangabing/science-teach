import { test, expect } from "@playwright/test";
import { originalStudios as studios } from "../../src/data/discovery-studios";
import { experienceById } from "../../src/data/discovery-experiences";
import { modelById } from "../../src/lib/discovery/registry";
import { defaults, format, solveModel } from "../../src/lib/discovery/core";
const images = "/tmp/science-teach-polish";
for (const studio of studios)
  test(`${studio.id} authored scenes, disclosure, live preview and visual review`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const model = modelById(studio.id),
      experience = experienceById(studio.id);
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.goto(`/labs/${studio.slug}/`);
    await expect(page.locator("[data-discovery]")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByText(experience.invitation, { exact: true }).first(),
    ).toBeVisible();
    const advanced = page.locator("#dis-advanced");
    if (await advanced.count()) {
      await expect(advanced).not.toHaveAttribute("open", "");
      const hidden = advanced.locator("[data-dis-input]").first();
      await expect(hidden).toBeHidden();
      await advanced.locator("summary").click();
      await expect(hidden).toBeVisible();
      await advanced.locator("summary").click();
    }
    await page
      .getByRole("button", { name: "准备独立探索", exact: true })
      .click();
    for (let i = 0; i < experience.scenes.length; i++) {
      const scene = experience.scenes[i]!,
        button = page.locator(`[data-dis-scene="${i}"]`);
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      const input = { ...defaults(model), ...scene.inputs };
      for (const [key, value] of Object.entries(scene.inputs))
        expect(
          Number(await page.locator(`[data-dis-input="${key}"]`).inputValue()),
        ).toBeCloseTo(value, 8);
      const observation = solveModel(model, input).metrics.find(
        (q) => q.key === studio.metric,
      )!;
      await expect(page.locator("#dis-spotlight-value")).toHaveText(
        `${format(observation.value)} ${observation.unit}`.trim(),
      );
      await page
        .getByRole("button", { name: "记下这一组", exact: true })
        .click();
      await expect(page.locator("#dis-record-gallery article")).toHaveCount(
        i + 1,
      );
      await page
        .getByRole("button", { name: "核验这次观察", exact: true })
        .click();
      await expect(page.locator("#dis-task-note")).toContainText("请先准备");
    }
    await page.getByRole("button", { name: "撤销", exact: true }).click();
    for (const [key, value] of Object.entries(experience.scenes[0]!.inputs))
      expect(
        Number(await page.locator(`[data-dis-input="${key}"]`).inputValue()),
      ).toBeCloseTo(value, 8);
    await page.locator('[data-dis-scene="1"]').click();
    await expect(
      page.locator("[data-apparatus-detail]").first(),
    ).toHaveAttribute("data-apparatus-detail", studio.id);
    await page
      .locator("#dis-stage")
      .screenshot({ path: `${images}/${studio.id}-stage.png` });
    if (["P05", "M01", "C06", "S07"].includes(studio.id))
      await page.screenshot({
        path: `${images}/${studio.id}-desktop.png`,
        fullPage: true,
      });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const first = page.locator(`[data-dis-input="${experience.primary[0]}"]`);
      await first.scrollIntoViewIfNeeded();
      await first.focus();
      await expect(page.locator(".dis-preview")).toBeVisible();
      await page.keyboard.press("ArrowRight");
      expect(await page.locator("#dis-preview-value").innerText()).toContain(
        (await page.locator("#dis-spotlight-value").innerText()).trim(),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const b = await first.boundingBox(),
        preview = await page.locator(".dis-preview").boundingBox();
      expect(b!.y).toBeGreaterThanOrEqual(preview!.y + preview!.height - 1);
    }
    await page.screenshot({ path: `${images}/${studio.id}-tools-390.png` });
    await page.locator("#dis-stage").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${images}/${studio.id}-390.png` });
    expect(errors).toEqual([]);
  });
test("chart cursor follows the actual measured horizontal coordinate and camera presets remain usable", async ({
  page,
}) => {
  await page.goto("/labs/faraday-coil/");
  await expect(page.locator("[data-discovery]")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.locator('[data-dis-scene="0"]').click();
  await expect(page.locator("[data-current-cursor]")).toHaveCount(2);
  await page.goto("/labs/conic-sections/");
  await page.getByRole("button", { name: "打开三维视图", exact: true }).click();
  await expect(page.locator("#dis-three canvas")).toBeVisible();
  for (const name of ["正面", "俯视", "立体"])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("#dis-three canvas")).toBeVisible();
});
