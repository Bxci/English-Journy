// e2e/onboarding.spec.js — fresh learner: welcome -> name -> level -> skip placement -> goals ->
// minutes -> today screen with a real Daily Journey item, matching README §10's documented flow.
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("fresh learner reaches the today screen with a Daily Journey plan", async ({ page }) => {
  await expect(page.locator("#screen-welcome")).toBeVisible();
  await page.fill("#user-name", "בדיקה אוטומטית");
  await page.click("#btn-start");

  await expect(page.locator("#screen-onboarding")).toBeVisible();
  // Step 1: level self-assessment — pick "almost no English" (skips the placement test entirely)
  await page.click('.onb-option:has-text("אני כמעט לא יודעת אנגלית")');

  // Step 2: goals (multi-select chips) -> continue
  await expect(page.locator(".chips")).toBeVisible();
  await page.click(".chip >> nth=0");
  await page.click('button:has-text("המשך")');

  // Step 3: daily minutes
  await expect(page.locator(".onb-options.minutes")).toBeVisible();
  await page.click('.onb-option:has-text("20 דקות")');

  // Lands on the home/today screen with the Daily Journey plan rendered
  await expect(page.locator("#screen-home")).toBeVisible();
  await expect(page.locator("#plan-list .plan-item").first()).toBeVisible();
  await expect(page.locator("#bottom-nav")).toBeVisible();
});

test("returning learner is greeted by name and skips straight to today (not re-onboarded)", async ({ page }) => {
  await page.fill("#user-name", "בדיקה 2");
  await page.click("#btn-start");
  await page.click('.onb-option:has-text("אני כמעט לא יודעת אנגלית")');
  await page.click(".chip >> nth=0");
  await page.click('button:has-text("המשך")');
  await page.click('.onb-option:has-text("20 דקות")');
  await expect(page.locator("#screen-home")).toBeVisible();

  await page.reload();
  // Every fresh load shows the welcome screen first (by design — a personalized "welcome back"
  // greeting), but a returning learner sees her name and a one-tap continue, never the
  // name/level/goals onboarding steps again.
  await expect(page.locator("#screen-welcome")).toBeVisible();
  await expect(page.locator("#returning-user")).toBeVisible();
  await expect(page.locator("#returning-name")).toHaveText("בדיקה 2");
  await expect(page.locator("#name-entry")).toBeHidden();

  await page.click("#btn-continue");
  await expect(page.locator("#screen-home")).toBeVisible();
  await expect(page.locator("#screen-onboarding")).toBeHidden();
});
