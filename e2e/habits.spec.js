// e2e/habits.spec.js — habit-forming features: weekly goal, easy day, backup nudge, reminder (.ics),
// listening practice, trouble words.
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

test.beforeEach(async ({ page }) => { await onboardFreshLearner(page); });

test("weekly goal card shows XP progress and easy day lowers today's goal to 5 minutes", async ({ page }) => {
  await expect(page.locator("#week-goal")).toBeVisible();
  await expect(page.locator("#week-goal-num")).toContainText("0 / 50 XP");
  await expect(page.locator("#today-minutes")).toContainText("/ 20");
  await page.click("#btn-easy-day");
  await expect(page.locator("#today-minutes")).toContainText("/ 5");
  await expect(page.locator("#btn-easy-day")).toHaveAttribute("aria-pressed", "true");
  await page.click("#btn-easy-day");
  await expect(page.locator("#today-minutes")).toContainText("/ 20");
});

test("backup nudge appears once there is progress, and can be snoozed", async ({ page }) => {
  await expect(page.locator("#home-banners .banner", { hasText: "גבות" })).toHaveCount(0);
  await page.evaluate(() => {
    const app = window.__EJ_APP__;
    app.state.lessons["pa-intro"] = { completed: true, completedAt: Date.now(), bestScore: 1 };
    app.goHome();
  });
  const banner = page.locator("#home-banners .banner", { hasText: "גבות" });
  await expect(banner).toBeVisible();
  await banner.locator('[data-act="later"]').click();
  await expect(page.locator("#home-banners .banner", { hasText: "גבות" })).toHaveCount(0);
});

test("settings can download a daily calendar reminder (.ics)", async ({ page }) => {
  await page.click('[data-nav="screen-progress"]');
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#set-remind")]);
  expect(download.suggestedFilename()).toBe("english-journey-reminder.ics");
});

test("trouble words card lists words answered wrong and starts a practice session", async ({ page }) => {
  await page.evaluate(() => {
    const app = window.__EJ_APP__;
    const word = window.CURRICULUM.vocabulary[0];
    app.state.items["v:" + word.id] = { h: [{ t: Date.now(), ok: false, w: 1 }] };
    app.goProgress();
  });
  await expect(page.locator(".trouble-card")).toBeVisible();
  await page.click("#trouble-start");
  await expect(page.locator("#screen-lesson")).toBeVisible();
});

test("listening: hear, answer every question, earn XP once", async ({ page }) => {
  await page.click('[data-nav="screen-reading"]');
  await page.click('.seg [data-seg="screen-listen"]');
  await expect(page.locator("#screen-listen")).toBeVisible();
  await page.locator("#listen-list .reading-item").first().click();
  await expect(page.locator("#screen-listen-play")).toBeVisible();
  await page.click("#btn-listen-main"); // to the questions
  const questions = await page.evaluate(() => window.LISTENING[0].questions.map(q => q.a));
  for (let i = 0; i < questions.length; i++) {
    await page.locator('#listen-body .option[data-v="' + questions[i] + '"]').click();
    await page.click("#btn-listen-main"); // check
    await page.click("#btn-listen-main"); // next / finish
  }
  await expect(page.locator("#listen-body")).toContainText(questions.length + " מתוך " + questions.length);
  const st = await page.evaluate(() => ({ listened: window.__EJ_APP__.state.listened, stars: window.__EJ_APP__.state.stars }));
  expect(Object.keys(st.listened)).toHaveLength(1);
  expect(st.stars).toBeGreaterThan(0);
});
