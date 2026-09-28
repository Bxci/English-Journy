const test = require("node:test");
const assert = require("node:assert/strict");
const U = require("../engine/unlock.js");
const { loadCurriculum } = require("../scripts/load-curriculum.js");

// tiny synthetic course
const mini = () => ({
  concepts: [
    { id: "a", prerequisites: [] },
    { id: "b", prerequisites: ["a"] },
    { id: "c", prerequisites: ["b"] },
  ],
  lessons: [
    { id: "L1", prerequisites: [], concepts: ["a"] },
    { id: "L2", prerequisites: ["L1"], concepts: ["b"] },
    { id: "L3", prerequisites: ["L1"], concepts: ["c"] }, // content order says L1 is enough, but concept c needs b (L2)
    { id: "L4", prerequisites: [], concepts: ["x"], status: "planned" },
  ],
});

test("first lesson is unlocked, dependents are locked", () => {
  const C = mini(), idx = U.buildIndex(C), p = { lessons: {} };
  assert.equal(U.isUnlocked(C.lessons[0], p, idx), true);
  assert.equal(U.isUnlocked(C.lessons[1], p, idx), false);
  assert.deepEqual(U.missingPrerequisites(C.lessons[1], p, idx), ["L1"]);
});

test("concept prerequisites are enforced even when lesson prerequisites are met", () => {
  const C = mini(), idx = U.buildIndex(C);
  const p = { lessons: { L1: { completed: true } } };
  assert.equal(U.isUnlocked(C.lessons[2], p, idx), false, "L3 needs concept b taught in L2");
  assert.deepEqual(U.missingPrerequisites(C.lessons[2], p, idx), ["L2"]);
  p.lessons.L2 = { completed: true };
  assert.equal(U.isUnlocked(C.lessons[2], p, idx), true);
});

test("placed-out lessons satisfy prerequisites", () => {
  const C = mini(), idx = U.buildIndex(C);
  const p = { lessons: { L1: { placedOut: "placement" } } };
  assert.equal(U.isUnlocked(C.lessons[1], p, idx), true);
});

test("planned lessons never unlock", () => {
  const C = mini(), idx = U.buildIndex(C);
  assert.equal(U.isUnlocked(C.lessons[3], { lessons: {} }, idx), false);
  assert.equal(U.lessonStatus(C.lessons[3], { lessons: {} }, idx), "planned");
});

test("lessonStatus distinguishes completed vs mastered by mastery threshold", () => {
  const C = mini(), idx = U.buildIndex(C);
  const p = { lessons: { L1: { completed: true } } };
  assert.equal(U.lessonStatus(C.lessons[0], p, idx, () => 0.5, 0.8), "completed");
  assert.equal(U.lessonStatus(C.lessons[0], p, idx, () => 0.9, 0.8), "mastered");
  assert.equal(U.lessonStatus(C.lessons[1], p, idx), "available");
  assert.equal(U.lessonStatus(C.lessons[2], p, idx), "locked");
});

test("nextLesson follows course order over unlocked lessons", () => {
  const C = mini(), idx = U.buildIndex(C);
  assert.equal(U.nextLesson(C, { lessons: {} }, idx).id, "L1");
  assert.equal(U.nextLesson(C, { lessons: { L1: { completed: true } } }, idx).id, "L2");
  assert.equal(U.nextLesson(C, { lessons: { L1: { completed: true }, L2: { completed: true }, L3: { completed: true } } }, idx), null);
});

test("topoSort detects cycles", () => {
  const ok = U.topoSort(["a", "b", "c"], id => ({ a: [], b: ["a"], c: ["b"] })[id]);
  assert.deepEqual(ok.order, ["a", "b", "c"]);
  assert.deepEqual(ok.cyclic, []);
  const bad = U.topoSort(["a", "b", "c"], id => ({ a: ["c"], b: ["a"], c: ["b"] })[id]);
  assert.deepEqual(bad.cyclic.sort(), ["a", "b", "c"]);
});

test("unreachableLessons finds lessons that can never open", () => {
  const C = mini();
  C.lessons.push({ id: "L5", prerequisites: ["NOPE"], concepts: [] });
  assert.deepEqual(U.unreachableLessons(C), ["L5"]);
});

test("real course: start lesson open, everything reachable, strict progression", () => {
  const C = loadCurriculum(), idx = U.buildIndex(C);
  const empty = { lessons: {} };
  assert.equal(U.nextLesson(C, empty, idx).id, "pa-intro");
  assert.deepEqual(U.unreachableLessons(C), []);
  const presentSimple3rd = idx.lessonsById["a1-ps-3"];
  assert.equal(U.isUnlocked(presentSimple3rd, empty, idx), false);
  // placing out Pre-A1 opens A1 but not the middle of A1
  const placed = { lessons: {} };
  C.lessons.filter(l => l.level === "pre-a1").forEach(l => { placed.lessons[l.id] = { placedOut: "placement" }; });
  assert.equal(U.nextLesson(C, placed, idx).id, "a1-pron");
  assert.equal(U.isUnlocked(presentSimple3rd, placed, idx), false);
});
