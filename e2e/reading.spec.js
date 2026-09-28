// e2e/reading.spec.js — Reading section: open an article, mark it read, confirm it feeds the SRS
// (README §4's stated behavior: finishing an article schedules its vocab for review).
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

test.beforeEach(async ({ page }) => {
  await onboardFreshLearner(page);
  await page.click('[data-nav="screen-reading"]');
});

test("reading list shows articles, and opening one shows tap-to-hear sentences", async ({ page }) => {
  await expect(page.locator("#screen-reading")).toBeVisible();
  const items = page.locator("#reading-list .reading-item");
  await expect(items.first()).toBeVisible();
  const count = await items.count();
  expect(count).toBeGreaterThan(0);

  await items.first().click();
  await expect(page.locator("#screen-article")).toBeVisible();
  await expect(page.locator(".article-en").first()).toBeVisible();
  await expect(page.locator(".article-he").first()).toBeVisible();
});

test("finishing an article marks it read and schedules its vocabulary for review", async ({ page }) => {
  await page.locator("#reading-list .reading-item").first().click();
  await page.click("#btn-article-done");
  await expect(page.locator("#screen-reading")).toBeVisible();
  await expect(page.locator("#reading-list .reading-item").first()).toHaveClass(/done/);

  const srsHasVocab = await page.evaluate(() => Object.keys(window.__EJ_APP__.state.srs).some(k => k.startsWith("v:")));
  expect(srsHasVocab).toBe(true);
});
