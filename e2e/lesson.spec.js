// e2e/lesson.spec.js — starting a lesson, answering real exercises (reading the actual correct
// answer from the app's own session state via the debug hook, then performing it through real
// DOM interaction — not hardcoding which button index is "correct"), and the exit-lesson confirm
// dialog (a real bug fixed earlier in this project: native confirm() was silently broken here).
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

/** Reads the current exercise from the real session state and answers it correctly through the UI. */
async function answerCurrentExercise(page) {
  const ex = await page.evaluate(() => {
    const s = window.__EJ_APP__.session;
    return s && s.queue[s.index] ? { type: s.queue[s.index].type, answer: s.queue[s.index].answer, accept: s.queue[s.index].accept, chunks: s.queue[s.index].chunks } : null;
  });
  if (!ex) return false;

  if (ex.type === "learn" || ex.type === "vocabIntro") {
    await page.click("#btn-lesson-action");
    return true;
  }
  if (ex.type === "choice") {
    const opt = page.locator(".option", { hasText: ex.answer }).first();
    if (await opt.count()) await opt.click();
    else await page.locator(".option").first().click(); // fallback: any option, may be wrong (feedback path still exercised)
  } else if (ex.type === "type") {
    await page.fill("#type-input", (ex.accept && ex.accept[0]) || ex.answer);
  } else if (ex.type === "build") {
    for (const word of ex.answer.replace(/[.?!]+$/, "").split(/\s+/)) {
      await page.locator(".chunk-bank .chunk", { hasText: word }).first().click();
    }
  } else if (ex.type === "match") {
    // Match exercises auto-resolve as pairs are clicked; handled by the caller's loop.
    return "match";
  } else if (ex.type === "speak") {
    await page.click("#self-mark");
    return true; // self-mark resolves immediately, no separate "check" tap
  }
  await page.click("#btn-lesson-action"); // בדיקה
  await page.click("#btn-lesson-action"); // continue past feedback
  return true;
}

test.beforeEach(async ({ page }) => {
  await onboardFreshLearner(page);
});

test("starting a lesson shows the learn card, hearts, and progress bar", async ({ page }) => {
  await page.click("#btn-home-main");
  await expect(page.locator("#screen-lesson")).toBeVisible();
  await expect(page.locator("#lesson-hearts")).toBeVisible();
  await expect(page.locator("#lesson-progress")).toBeVisible();
  await expect(page.locator("#lesson-body")).not.toBeEmpty();
});

test("answering real exercises advances the lesson and updates the progress bar", async ({ page }) => {
  await page.click("#btn-home-main");
  const barBefore = await page.locator("#lesson-progress-bar").evaluate(el => el.style.width);
  for (let i = 0; i < 6; i++) {
    const result = await answerCurrentExercise(page);
    if (result === "match") break; // stop before the harder-to-automate match/pairs UI
    await page.waitForTimeout(150);
  }
  const barAfter = await page.locator("#lesson-progress-bar").evaluate(el => el.style.width);
  expect(barAfter).not.toBe(barBefore);
});

test("exiting a lesson shows the in-app confirm dialog and actually exits on confirm", async ({ page }) => {
  await page.click("#btn-home-main");
  await expect(page.locator("#screen-lesson")).toBeVisible();

  await page.click("#btn-lesson-exit");
  await expect(page.locator("#confirm-overlay")).toBeVisible();
  await expect(page.locator("#confirm-message")).toContainText("לצאת");

  // Cancel first: must stay on the lesson (this exact flow was broken before — native confirm()
  // was silently unusable in some embedded browser contexts, see README).
  await page.click("#confirm-no");
  await expect(page.locator("#confirm-overlay")).toBeHidden();
  await expect(page.locator("#screen-lesson")).toBeVisible();

  // Now actually confirm exit.
  await page.click("#btn-lesson-exit");
  await page.click("#confirm-yes");
  await expect(page.locator("#screen-home")).toBeVisible();
});
