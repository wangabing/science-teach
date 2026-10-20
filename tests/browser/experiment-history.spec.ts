import {test,expect} from '@playwright/test';
import {experiments} from '../../src/data/labs';

for (const js of [true,false]) {
  test.describe(js?'interactive pages':'reading without JavaScript',()=>{
    test.use({javaScriptEnabled:js});
    test('every experiment offers optional context, keyboard reading and mobile sources',async({page})=>{
      test.setTimeout(240000);
      await page.setViewportSize({width:390,height:844});
      for(const experiment of experiments){
        await test.step(experiment.name,async()=>{
          await page.goto(experiment.href);
          const history=page.getByRole('region').filter({has:page.getByText('问题的来处',{exact:true})});
          await expect(history).toHaveCount(1);
          await expect(history.getByRole('heading',{level:2})).toBeVisible();
          const invitation=history.getByText('现在，换你来试',{exact:true});
          await expect(invitation).toBeHidden();
          const summary=history.getByText('读一段背景，带着问题动手',{exact:true});
          await summary.focus();await page.keyboard.press('Enter');
          await expect(invitation).toBeVisible();
          await expect(history.getByRole('heading',{name:'故事出处与延伸阅读'})).toBeVisible();
          const links=history.getByRole('link');
          expect(await links.count()).toBeGreaterThan(0);
          for(const link of await links.all())await expect(link).toHaveAttribute('href',/^https:\/\//);
          const bounds=await history.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(391);
          expect(await history.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
          await summary.focus();await page.keyboard.press('Space');await expect(invitation).toBeHidden();
        });
      }
    });
  });
}

test('historical boundaries remain clear and reading does not block a live experiment',async({page})=>{
  await page.goto('/stem-lab/buoyancy/');
  await expect(page.getByText(/这则著名故事由维特鲁威在数百年后写下/)).toBeVisible();
  await page.goto('/labs/orbit/');
  await expect(page.getByText(/这是思想实验，并非真的用大炮发射卫星/)).toBeVisible();
  await page.goto('/labs/interference/');
  await page.getByText('读一段背景，带着问题动手',{exact:true}).click();
  await page.getByRole('button',{name:'准备静点任务'}).click();
  await page.locator('#wave-phase').fill('180');await page.locator('#wave-phase').dispatchEvent('input');
  await expect(page.locator('#wave-task-note')).toContainText('找到了');
  await expect(page.getByText('现在，换你来试',{exact:true})).toBeVisible();
});
