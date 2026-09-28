// e2e/mission.spec.js — real-world mission: complete every step through the actual UI (typing
// each step's own hint keyword, read from the real mission data — not hardcoded per mission), and
// confirm the celebration + star reward.
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

test.beforeEach(async ({ page }) => {
  await onboardFreshLearner(page);
  await page.click('[data-nav="screen-convos"]');
});

test("missions list is shown, and a wrong/unrecognized attempt never blocks progress", async ({ page }) => {
  const items = page.locator("#mission-list .convo-item");
  await expect(items.first()).toBeVisible();
  await items.first().click();
  await expect(page.locator("#screen-mission")).toBeVisible();
  await expect(page.locator(".mission-checklist li")).toHaveCount(await page.evaluate(() => window.MISSIONS[0].steps.length));

  await page.fill("#mission-input", "completely unrelated nonsense text");
  await page.click("#mission-check");
  await expect(page.locator("#mission-feedback")).toContainText("לא הצלחתי");

  await page.click("#mission-hint");
  await expect(page.locator("#mission-feedback")).toContainText("💡");
});

test("completing every step finishes the mission and awards stars", async ({ page }) => {
  const starsBefore = await page.evaluate(() => window.__EJ_APP__.state.stars);
  await page.locator("#mission-list .convo-item").first().click();

  const stepCount = await page.evaluate(() => window.MISSIONS[0].steps.length);
  for (let i = 0; i < stepCount; i++) {
    const keyword = await page.evaluate(() => {
      const app = window.__EJ_APP__;
      const m = window.MISSIONS[0];
      const done = (app.state.missions[m.id] || {}).stepsDone || [];
      const step = m.steps.find(s => !done.includes(s.id));
      return step.keywords[0][0];
    });
    await page.fill("#mission-input", keyword);
    await page.click("#mission-check");
    await page.waitForTimeout(150);
  }

  await expect(page.locator("#inter-card")).toContainText("השלמת את המשימה");
  const starsAfter = await page.evaluate(() => window.__EJ_APP__.state.stars);
  expect(starsAfter).toBeGreaterThan(starsBefore);

  await page.click("#inter-card .btn");
  await expect(page.locator("#screen-convos")).toBeVisible();
  await expect(page.locator("#mission-list .convo-item").first()).toContainText("הושלמה");
});

test("exiting mid-mission shows the confirm dialog and preserves partial progress", async ({ page }) => {
  await page.locator("#mission-list .convo-item").first().click();
  const keyword = await page.evaluate(() => window.MISSIONS[0].steps[0].keywords[0][0]);
  await page.fill("#mission-input", keyword);
  await page.click("#mission-check");
  await page.waitForTimeout(150);

  await page.click("#btn-mission-exit");
  await expect(page.locator("#confirm-message")).toContainText("לצאת מהמשימה");
  await page.click("#confirm-yes");
  await expect(page.locator("#screen-convos")).toBeVisible();

  const stepsDone = await page.evaluate(() => (window.__EJ_APP__.state.missions[window.MISSIONS[0].id] || {}).stepsDone || []);
  expect(stepsDone.length).toBeGreaterThan(0);
});
