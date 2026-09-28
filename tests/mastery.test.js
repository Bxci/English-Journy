const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../engine/mastery.js");

const DAY = M.DAY;
const T0 = Date.UTC(2026, 0, 1);
const W = M.EXERCISE_WEIGHTS;
const hist = (list, start = T0, stepMin = 2) => list.map((x, i) => ({ t: start + i * stepMin * 60000, ok: x[0], w: x[1] }));
const at = (h, days = 0) => M.computeMastery(h, h[h.length - 1].t + days * DAY);

test("empty or missing history is 0", () => {
  assert.equal(M.computeMastery([], T0), 0);
  assert.equal(M.computeMastery(undefined, T0), 0);
});

test("one correct answer is NOT mastery", () => {
  assert.ok(at(hist([[true, W.production]])) < 0.5);
  assert.ok(at(hist([[true, W.recognition]])) < 0.3);
});

test("several correct production answers reach the mastery threshold", () => {
  const h = hist(Array(5).fill([true, W.production]));
  assert.ok(at(h) >= M.CONFIG.MASTERY_THRESHOLD, "got " + at(h));
});

test("recognition-only practice is capped below mastery", () => {
  const h = hist(Array(12).fill([true, W.recognition]));
  assert.ok(at(h) <= M.CONFIG.RECOGNITION_CAP + 1e-9);
  assert.ok(at(h) < M.CONFIG.MASTERY_THRESHOLD);
});

test("production answers count more than recognition answers", () => {
  const rec = hist(Array(3).fill([true, W.recognition]));
  const prod = hist(Array(3).fill([true, W.production]));
  assert.ok(at(prod) > at(rec));
});

test("recent mistakes hurt more than old mistakes", () => {
  const oldMistakes = hist([[false, 1], [false, 1], [true, 1], [true, 1], [true, 1], [true, 1]]);
  const newMistakes = hist([[true, 1], [true, 1], [true, 1], [true, 1], [false, 1], [false, 1]]);
  assert.ok(at(oldMistakes) > at(newMistakes));
});

test("last answer wrong lowers mastery", () => {
  const good = hist([[true, 1], [true, 1], [true, 1], [true, 1], [true, 1]]);
  const lastWrong = hist([[true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [false, 1]]);
  assert.ok(at(lastWrong) < at(good));
});

test("repeated mistakes lower mastery further", () => {
  const few = hist([[false, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1]]);
  const many = hist([[false, 1], [false, 1], [false, 1], [false, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1], [true, 1]]);
  assert.ok(at(many) < at(few));
});

test("mastery decays with time since last review, but never below half", () => {
  const h = hist(Array(5).fill([true, 1]));
  const now = at(h, 0), later = at(h, 30), much = at(h, 3650);
  assert.ok(later < now);
  assert.ok(much >= now * 0.5 - 1e-9);
});

test("longer correct streaks forget more slowly", () => {
  const short = hist(Array(3).fill([true, 1]));
  const long = hist(Array(8).fill([true, 1]));
  const ratio = h => at(h, 10) / at(h, 0);
  assert.ok(ratio(long) > ratio(short));
});

test("result always within [0, 1]", () => {
  for (let i = 0; i < 200; i++) {
    const h = hist(Array.from({ length: 1 + (i % 25) }, (_, j) => [((i * 7 + j * 3) % 5) > 1, [0.25, 0.5, 0.75, 1][(i + j) % 4]]));
    const m = at(h, i % 40);
    assert.ok(m >= 0 && m <= 1, "out of range: " + m);
  }
});

test("addAttempt bounds history length", () => {
  let h = [];
  for (let i = 0; i < 100; i++) h = M.addAttempt(h, { t: i, ok: true, w: 1 });
  assert.equal(h.length, M.CONFIG.HISTORY_CAP);
  assert.equal(h[h.length - 1].t, 99);
});

test("displayPercent rounds to 5% steps (no fake precision)", () => {
  assert.equal(M.displayPercent(0.873), 85);
  assert.equal(M.displayPercent(0.876), 90);
  assert.equal(M.displayPercent(1.2), 100);
  assert.equal(M.displayPercent(-1), 0);
});

test("sessionScore is weighted by exercise difficulty", () => {
  assert.equal(M.sessionScore([]), 0);
  const s = M.sessionScore([{ ok: true, w: 1 }, { ok: false, w: 0.5 }]);
  assert.ok(Math.abs(s - 2 / 3) < 1e-9);
});

test("unlock threshold is a named, configurable constant (~80%)", () => {
  assert.equal(M.CONFIG.UNLOCK_THRESHOLD, 0.8);
  const h = hist(Array(3).fill([true, 1]));
  assert.ok(M.computeMastery(h, h[2].t, { EVIDENCE_SCALE: 0.5 }) > M.computeMastery(h, h[2].t));
});
