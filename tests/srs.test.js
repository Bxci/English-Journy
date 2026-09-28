const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../engine/srs.js");
const MI = require("../engine/mistakes.js");

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);

test("new card is due immediately", () => {
  const c = S.newCard("v:apple", T0);
  assert.equal(c.box, 0);
  assert.ok(S.isDue(c, T0));
});

test("correct answers push the card to later boxes with growing intervals", () => {
  let c = S.newCard("v:apple", T0), t = T0;
  const gaps = [];
  for (let i = 0; i < 6; i++) { c = S.scheduleReview(c, true, t); gaps.push(c.due - t); t = c.due; }
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] > gaps[i - 1], "interval should grow");
  assert.equal(c.box, S.MAX_BOX);
  assert.equal(gaps[0], S.INTERVAL_DAYS[1] * DAY);
});

test("box never exceeds the maximum", () => {
  let c = S.newCard("k", T0);
  for (let i = 0; i < 20; i++) c = S.scheduleReview(c, true, T0);
  assert.equal(c.box, S.MAX_BOX);
});

test("a wrong answer brings the item back within minutes", () => {
  let c = S.newCard("c:be-i-am", T0);
  c = S.scheduleReview(c, true, T0);
  c = S.scheduleReview(c, false, T0 + DAY);
  assert.equal(c.box, 0);
  assert.equal(c.due, T0 + DAY + S.RELEARN_MINUTES * 60000);
  assert.equal(c.lapses, 1);
});

test("a long-known item that slips drops to box 1, not to zero", () => {
  let c = S.newCard("k", T0);
  for (let i = 0; i < 5; i++) c = S.scheduleReview(c, true, T0);
  c = S.scheduleReview(c, false, T0);
  assert.equal(c.box, 1);
});

test("repeated lapses flag a leech", () => {
  let c = S.newCard("k", T0);
  for (let i = 0; i < S.LEECH_LAPSES; i++) c = S.scheduleReview(c, false, T0);
  assert.equal(c.leech, true);
});

test("scheduleReview is pure", () => {
  const c = S.newCard("k", T0);
  const copy = JSON.stringify(c);
  S.scheduleReview(c, true, T0);
  assert.equal(JSON.stringify(c), copy);
});

test("buildQueue returns only due cards, weakest first, limited", () => {
  const cards = {
    a: { key: "a", box: 3, due: T0 - DAY },
    b: { key: "b", box: 0, due: T0 - 1000 },
    c: { key: "c", box: 1, due: T0 + DAY },
    d: { key: "d", box: 0, due: T0 - DAY },
  };
  assert.deepEqual(S.buildQueue(cards, T0), ["d", "b", "a"]);
  assert.deepEqual(S.buildQueue(cards, T0, 2), ["d", "b"]);
  assert.equal(S.countDue(cards, T0), 3);
});

test("mistake memory: remediation after 3 mistakes on a concept within a week", () => {
  let r;
  r = MI.recordMistake(r, T0, { given: "She work" });
  r = MI.recordMistake(r, T0 + 1000, null);
  assert.equal(MI.shouldRemediate(r, T0 + 2000), false);
  r = MI.recordMistake(r, T0 + 2000, null);
  assert.equal(MI.shouldRemediate(r, T0 + 3000), true);
  assert.equal(r.last.given, "She work");
  assert.equal(MI.shouldRemediate(r, T0 + 8 * DAY), false, "old mistakes expire");
  assert.equal(MI.shouldRemediate(MI.clearAfterRemediation(r), T0 + 3000), false);
  assert.equal(MI.clearAfterRemediation(r).count, 3, "total count kept");
});

test("daily plan scales with the daily time goal and never exceeds it", () => {
  [10, 20, 30, 45].forEach(min => {
    const p = MI.planDay({ dailyMinutes: min, dueCount: 40, hasLesson: true, remediationCount: 1, conversationAvailable: true });
    const total = p.chunks.reduce((s, c) => s + c.minutes, 0);
    assert.ok(total <= min, min + " -> " + total);
    assert.ok(p.chunks.some(c => c.kind === "lesson"));
    assert.ok(p.reviewItems > 0);
  });
  const small = MI.planDay({ dailyMinutes: 10, dueCount: 40, hasLesson: true, remediationCount: 0, conversationAvailable: true });
  const big = MI.planDay({ dailyMinutes: 45, dueCount: 40, hasLesson: true, remediationCount: 0, conversationAvailable: true });
  assert.ok(big.reviewItems > small.reviewItems);
  const none = MI.planDay({ dailyMinutes: 20, dueCount: 0, hasLesson: true, remediationCount: 0, conversationAvailable: false });
  assert.deepEqual(none.chunks.map(c => c.kind), ["lesson"]);
});
