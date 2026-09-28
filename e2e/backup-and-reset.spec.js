// e2e/backup-and-reset.spec.js — export/import local backup, reset progress (both use the in-app
// confirm dialog, not native confirm()), and reload persistence.
const { test, expect } = require("@playwright/test");
const { onboardFreshLearner } = require("./helpers");

test.beforeEach(async ({ page }) => {
  await onboardFreshLearner(page);
  await page.click('[data-nav="screen-progress"]');
});

test("export downloads a valid backup file containing the real current state", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.click("#set-export");
  const download = await downloadPromise;
  const streamPath = await download.path();
  const fs = require("fs");
  const content = JSON.parse(fs.readFileSync(streamPath, "utf8"));
  expect(content.format).toBe("english-journey-backup");
  expect(content.state.userName).toBeTruthy();
});

test("import rejects a malformed file safely, with no crash", async ({ page }) => {
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const badFile = path.join(os.tmpdir(), "bad-backup.json");
  fs.writeFileSync(badFile, "not valid json {{{");

  // setInputFiles targets the hidden <input type=file> directly — the standard Playwright way to
  // test file inputs, no OS-level file-picker dialog involved (that dialog is native chrome that
  // isn't part of the page and can't be driven this way anyway).
  await page.setInputFiles("#set-import-file", badFile);
  await expect(page.locator("#toast")).toContainText("לא תקין");
});

test("import replaces state after confirmation, with a real preview of what's being restored", async ({ page }) => {
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const backup = await page.evaluate(() => {
    const app = window.__EJ_APP__;
    const state = JSON.parse(JSON.stringify(app.state));
    state.streak = 42;
    state.userName = "יובא מגיבוי";
    return { format: "english-journey-backup", backupVersion: 1, exportedAt: new Date().toISOString(), state };
  });
  const file = path.join(os.tmpdir(), "good-backup.json");
  fs.writeFileSync(file, JSON.stringify(backup));

  await page.setInputFiles("#set-import-file", file);
  await expect(page.locator("#confirm-message")).toContainText("42");
  await page.click("#confirm-yes");
  await expect(page.locator("#toast")).toContainText("יובאה בהצלחה");

  const streak = await page.evaluate(() => window.__EJ_APP__.state.streak);
  expect(streak).toBe(42);
});

test("reset progress uses the in-app confirm dialog and actually clears state", async ({ page }) => {
  await page.click("#set-reset");
  await expect(page.locator("#confirm-message")).toContainText("לאפס");
  await page.click("#confirm-no"); // cancel first — must NOT reset
  const nameStillThere = await page.evaluate(() => window.__EJ_APP__.state.userName);
  expect(nameStillThere).toBeTruthy();

  await page.click("#set-reset");
  await page.click("#confirm-yes");
  await expect(page.locator("#screen-welcome")).toBeVisible();
  const nameAfterReset = await page.evaluate(() => JSON.parse(localStorage.getItem("english-journey-state-v2")).userName);
  expect(nameAfterReset).toBe("");
});

test("progress survives a full page reload (real localStorage persistence via a genuine UI action, not a direct write)", async ({ page }) => {
  // Toggle a real setting through the real UI — its change handler calls saveState() itself,
  // exactly like any lesson/review/conversation action would, so this proves the whole
  // load->mutate->save->reload->reload pipeline, not just that localStorage itself works.
  const slowAudio = page.locator("#set-slow");
  const wasChecked = await slowAudio.isChecked();
  await slowAudio.setChecked(!wasChecked);

  await page.reload();
  await page.click("#btn-continue");
  await page.click('[data-nav="screen-progress"]');
  await expect(page.locator("#set-slow")).toBeChecked({ checked: !wasChecked });

  const onboardingStillDone = await page.evaluate(() => window.__EJ_APP__.state.onboarding.done);
  expect(onboardingStillDone).toBe(true);
});
