const test = require("node:test");
const assert = require("node:assert/strict");
const AD = require("../engine/adaptive.js");

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 10);

test("masteryLabel bands match the documented thresholds", () => {
  assert.equal(AD.masteryLabel(0), "בהתחלה");
  assert.equal(AD.masteryLabel(29), "בהתחלה");
  assert.equal(AD.masteryLabel(30), "מתפתח");
  assert.equal(AD.masteryLabel(49), "מתפתח");
  assert.equal(AD.masteryLabel(50), "בלמידה");
  assert.equal(AD.masteryLabel(70), "טוב");
  assert.equal(AD.masteryLabel(85), "חזק");
  assert.equal(AD.masteryLabel(95), "שלטת מצוין");
  assert.equal(AD.masteryLabel(100), "שלטת מצוין");
});

test("rankRemediation puts the weakest / most recently-missed concept first", () => {
  const candidates = [
    { id: "strong-but-recent", masteryPct: 80, mistakeCount: 1, lastMistakeAt: T0 },
    { id: "weak-and-recent", masteryPct: 20, mistakeCount: 4, lastMistakeAt: T0 },
    { id: "weak-but-old", masteryPct: 20, mistakeCount: 4, lastMistakeAt: T0 - 30 * DAY },
  ];
  const ranked = AD.rankRemediation(candidates, T0);
  assert.equal(ranked[0].id, "weak-and-recent");
  assert.ok(ranked[0].score > ranked.find(r => r.id === "strong-but-recent").score);
  assert.ok(ranked.find(r => r.id === "weak-and-recent").score > ranked.find(r => r.id === "weak-but-old").score);
});

test("rankRemediation is deterministic and total (every candidate returned, none dropped)", () => {
  const candidates = [
    { id: "a", masteryPct: 50, mistakeCount: 2, lastMistakeAt: T0 },
    { id: "b", masteryPct: 10, mistakeCount: 5, lastMistakeAt: T0 },
    { id: "c", masteryPct: 90, mistakeCount: 1, lastMistakeAt: T0 - 5 * DAY },
  ];
  const r1 = AD.rankRemediation(candidates, T0);
  const r2 = AD.rankRemediation(candidates, T0);
  assert.deepEqual(r1.map(r => r.id), r2.map(r => r.id));
  assert.equal(r1.length, candidates.length);
});

test("rankRemediation gives every candidate Hebrew reasons, not just the top one", () => {
  const candidates = [
    { id: "a", masteryPct: 40, mistakeCount: 3, lastMistakeAt: T0 },
    { id: "b", masteryPct: 60, mistakeCount: 1, lastMistakeAt: T0 - 2 * DAY },
  ];
  AD.rankRemediation(candidates, T0).forEach(r => {
    assert.ok(Array.isArray(r.reasons) && r.reasons.length > 0, r.id);
    assert.ok(r.reasons.every(x => typeof x === "string" && x.length > 0));
  });
});

test("explainChunk returns reasons for every planDay() chunk kind, and [] for an unknown kind", () => {
  ["review", "lesson", "practice", "conversation"].forEach(kind => {
    const reasons = AD.explainChunk(kind, { dueCount: 5, lessonTitle: "שיעור לדוגמה", remediationConcept: "x", remediationReasons: ["סיבה"], matchesGoal: true, runsBefore: 2 });
    assert.ok(Array.isArray(reasons) && reasons.length > 0, kind);
  });
  assert.deepEqual(AD.explainChunk("nonsense", {}), []);
});

test("explainChunk('practice') distinguishes a targeted weak-concept pick from free practice", () => {
  const targeted = AD.explainChunk("practice", { remediationConcept: "do-does", remediationReasons: ["2 טעויות"] });
  const free = AD.explainChunk("practice", { remediationConcept: null });
  assert.notDeepEqual(targeted, free);
  assert.ok(targeted.some(r => r.includes("טעויות") || r.includes("חלש")));
});

test("conceptMasterySnapshot uses the same computeMastery the rest of the app uses (via the injected fn), not a parallel score", () => {
  const concepts = [{ id: "c1", title: "Concept One", level: "a1" }, { id: "c2", title: "Concept Two", level: "a1" }];
  const masteryOf = id => (id === "c1" ? 0.42 : 0.9);
  const rows = AD.conceptMasterySnapshot(concepts, masteryOf);
  assert.equal(rows.find(r => r.id === "c1").masteryPct, 42);
  assert.equal(rows.find(r => r.id === "c2").masteryPct, 90);
  assert.equal(rows.find(r => r.id === "c2").label, AD.masteryLabel(90));
});
