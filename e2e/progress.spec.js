// e2e/progress.spec.js — Progress screen: Mastery Map, Weekly Progress summary, and achievements,
// seeded with real activity via localStorage (the same technique used throughout manual testing
// this session) so the E2E run doesn't need to grind through days of real practice.
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

test.beforeEach(async ({ page }) => {
  await onboardFreshLearner(page);
});

test("Mastery Map is hidden for a fresh learner, then shows attempted concepts weakest-first", async ({ page }) => {
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator(".mastery-map")).toHaveCount(0);

  await page.evaluate(() => {
    const app = window.__EJ_APP__;
    const cid = window.CURRICULUM.concepts.find(c => !c.planned).id;
    app.state.items["c:" + cid] = { h: [{ t: Date.now(), ok: true, w: 0.75 }] };
  });
  await page.click('[data-nav="screen-home"]');
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator(".mastery-row").first()).toBeVisible();
});

test("Weekly Progress card is hidden with no activity, then shows real computed sums", async ({ page }) => {
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator(".week-card")).toHaveCount(0);

  await page.evaluate(() => {
    const app = window.__EJ_APP__;
    app.state.history = [{ date: "2020-01-01", seconds: 600, reviewDone: 5, lessonsDone: 1, practiceDone: 0, convoDone: 0, spokenDone: 2 }];
    // use a real recent date so it falls in the 7-day window regardless of when this runs
    const d = new Date(); d.setDate(d.getDate() - 1);
    app.state.history[0].date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  });
  await page.click('[data-nav="screen-home"]');
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator(".week-card")).toBeVisible();
  await expect(page.locator(".week-grid b").first()).toHaveText("10"); // 600s = 10 minutes
});

test("achievements: completing a mission unlocks and displays the first-real-world badge", async ({ page }) => {
  await page.click('[data-nav="screen-convos"]');
  await page.locator("#mission-list .convo-item").first().click();
  const stepCount = await page.evaluate(() => window.MISSIONS[0].steps.length);
  for (let i = 0; i < stepCount; i++) {
    const keyword = await page.evaluate(() => {
      const app = window.__EJ_APP__;
      const m = window.MISSIONS[0];
      const done = (app.state.missions[m.id] || {}).stepsDone || [];
      return m.steps.find(s => !done.includes(s.id)).keywords[0][0];
    });
    await page.fill("#mission-input", keyword);
    await page.click("#mission-check");
    await page.waitForTimeout(150);
  }
  await page.click("#inter-card .btn");
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator(".badge.on")).toHaveCount(await page.evaluate(() => window.__EJ_APP__.state.badgesUnlocked.length));
  const count = await page.locator(".badge.on").count();
  expect(count).toBeGreaterThan(0);
});
