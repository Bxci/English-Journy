// e2e/helpers.js — shared setup: get a fresh onboarded learner to the today screen fast, without
// re-typing the onboarding flow in every spec file.
async function onboardFreshLearner(page, name) {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.fill("#user-name", name || "בדיקה אוטומטית");
  await page.click("#btn-start");
  await page.click('.onb-option:has-text("אני כמעט לא יודעת אנגלית")');
  await page.click(".chip >> nth=0");
  await page.click('button:has-text("המשך")');
  await page.click('.onb-option:has-text("20 דקות")');
}

module.exports = { onboardFreshLearner };
