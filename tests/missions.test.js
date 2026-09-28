const test = require("node:test");
const assert = require("node:assert/strict");
const MS = require("../engine/missions.js");

const step = {
  id: "order",
  label: "בקשי קפה",
  keywords: [["coffee"], ["tea"]],
};

test("stepMatches: any phrase from any keyword group, as a substring of the normalized text", () => {
  assert.ok(MS.stepMatches("I would like a coffee, please", step));
  assert.ok(MS.stepMatches("Can I have tea?", step));
  assert.ok(MS.stepMatches("COFFEE", step), "case-insensitive");
  assert.equal(MS.stepMatches("I would like some water", step), false);
});

test("stepMatches: empty/missing text never matches", () => {
  assert.equal(MS.stepMatches("", step), false);
  assert.equal(MS.stepMatches(null, step), false);
  assert.equal(MS.stepMatches(undefined, step), false);
});

test("stepMatches: multi-word phrases must appear together, not just as separate words", () => {
  const greet = { id: "greet", label: "x", keywords: [["good morning"]] };
  assert.ok(MS.stepMatches("Good morning!", greet));
  assert.equal(MS.stepMatches("It is a good, sunny morning", greet), false, "words present but not as the phrase 'good morning'");
});

test("missionProgress: tracks completion and the remaining steps in order", () => {
  const mission = { steps: [{ id: "a" }, { id: "b" }, { id: "c" }] };
  const p0 = MS.missionProgress(mission, []);
  assert.equal(p0.done, 0);
  assert.equal(p0.complete, false);
  assert.deepEqual(p0.remaining.map(s => s.id), ["a", "b", "c"]);

  const p1 = MS.missionProgress(mission, ["a"]);
  assert.equal(p1.done, 1);
  assert.deepEqual(p1.remaining.map(s => s.id), ["b", "c"]);

  const p2 = MS.missionProgress(mission, ["a", "b", "c"]);
  assert.equal(p2.complete, true);
  assert.deepEqual(p2.remaining, []);
});

test("missionProgress ignores unknown done-step ids (e.g. stale data from a curriculum edit)", () => {
  const mission = { steps: [{ id: "a" }, { id: "b" }] };
  const p = MS.missionProgress(mission, ["a", "ghost-step"]);
  assert.equal(p.done, 1);
  assert.deepEqual(p.remaining.map(s => s.id), ["b"]);
});
