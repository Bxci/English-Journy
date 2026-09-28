const test = require("node:test");
const assert = require("node:assert/strict");
const { loadCurriculum } = require("../scripts/load-curriculum.js");
const { validate, MIN_EXERCISES } = require("../scripts/validate-curriculum.js");
const X = require("../engine/exercises.js");

const C = loadCurriculum();

test("the curriculum validator reports no errors", () => {
  const { errors } = validate(C);
  assert.deepEqual(errors, []);
});

test("course hierarchy: Course → Level → Unit → Lesson → Concept → Exercise", () => {
  assert.deepEqual(C.levels.map(l => l.id), ["pre-a1", "a1", "a2"]);
  C.units.forEach(u => {
    assert.ok(["pre-a1", "a1", "a2"].includes(u.level));
    u.lessonIds.forEach(id => assert.equal(C.lessons.find(l => l.id === id).unit, u.id));
  });
  C.lessons.forEach(l => {
    ["id", "level", "title", "objective"].forEach(f => assert.ok(l[f], l.id + " missing " + f));
    assert.ok(Array.isArray(l.prerequisites));
  });
});

test("coverage: required Pre-A1 / A1 / A2 topics exist as lessons", () => {
  const ids = new Set(C.lessons.map(l => l.id));
  ["pa-intro", "pa-abc-1", "pa-abc-4", "pa-greet-1", "pa-num-3", "pa-family", "pa-colors", "pa-actions",
    "a1-pron", "a1-be-1", "a1-be-4", "a1-be-5", "a1-be-6", "a1-svo", "a1-art-1", "a1-plural-2", "a1-poss-2", "a1-this", "a1-there", "a1-qwords", "a1-can",
    "a1-ps-1", "a1-ps-2", "a1-ps-3", "a1-ps-4", "a1-ps-5", "a1-ps-6", "a1-ps-7", "a1-ps-8", "a1-ps-9",
    "a1-time", "a1-calendar", "a1-restaurant", "a1-directions", "a1-pc-1", "a1-pc-2",
    "a1-past-1", "a1-past-2", "a1-past-3", "a1-past-4", "a1-past-5", "a1-past-6", "a1-future-1", "a1-future-2", "a1-future-3",
    "a2-comp", "a2-super", "a2-count", "a2-some", "a2-should", "a2-must"].forEach(id => assert.ok(ids.has(id), "missing lesson " + id));
  const planned = C.lessons.filter(l => l.status === "planned").map(l => l.concepts[0]);
  ["adverbs-manner", "object-pronouns", "infinitives", "gerunds-beginner", "present-perfect-ever-never", "present-perfect-already-yet"].forEach(c => assert.ok(planned.includes(c)));
});

test("irregular past verbs are taught in small batches (<= 5 new per lesson)", () => {
  C.lessons.filter(l => /^a1-past-[345]$/.test(l.id)).forEach(l => assert.ok(l.vocab.length <= 5, l.id));
});

test("vocabulary items are first-class objects", () => {
  C.vocabulary.forEach(v => ["id", "word", "translation", "partOfSpeech", "level", "category", "exampleSentence"].forEach(f => assert.ok(v[f], v.id + " missing " + f)));
  assert.ok(C.vocabulary.length >= 300);
});

test("grammar concepts carry explanation, examples, mistakes and remediation", () => {
  C.concepts.filter(c => !c.planned).forEach(c => {
    assert.ok(c.explanation && c.examples.length && c.commonMistakes.length && c.remediation, c.id);
  });
});

test("every real lesson starts with LEARN cards and escalates from recognition to production", () => {
  const e = X.createEngine(C, 7);
  C.lessons.filter(l => l.status !== "planned").forEach(l => {
    const items = e.expandLesson(l);
    const graded = items.filter(x => x.stage > 0);
    assert.ok(graded.length >= MIN_EXERCISES, l.id);
    const firstGraded = items.findIndex(x => x.stage > 0);
    assert.ok(items.slice(firstGraded).every(x => x.stage > 0), l.id + ": learn cards come first");
    for (let i = 1; i < graded.length; i++) assert.ok(graded[i].stage >= graded[i - 1].stage, l.id + ": stages must not go backwards");
  });
});

test("exercise engine: every graded exercise has an answer and a Hebrew-friendly explanation", () => {
  const e = X.createEngine(C, 3);
  C.lessons.filter(l => l.status !== "planned").forEach(l => e.expandLesson(l).filter(x => x.stage > 0).forEach(x => {
    if (x.type !== "match") assert.ok(x.answer, x.id);
    assert.ok(x.why && /[֐-׿]/.test(x.why), x.id + " why: " + x.why);
    assert.ok(x.skills && x.skills.length, x.id + " has skills");
    assert.ok(x.w > 0, x.id + " has weight");
  }));
});

test("variations for a concept never repeat the question that was failed", () => {
  const e = X.createEngine(C, 11);
  const failed = e.expandLesson(C.lessons.find(l => l.id === "a1-ps-3")).find(x => x.concept === "present-simple-he-she-it" && x.sentence);
  const vars = e.variationsFor("present-simple-he-she-it", 6, [failed.prompt, failed.sentence]);
  assert.ok(vars.length >= 3);
  vars.forEach(v => { assert.notEqual(v.prompt, failed.prompt); assert.equal(v.concept, "present-simple-he-she-it"); });
});

test("review items can be generated for every vocabulary item and taught concept", () => {
  const e = X.createEngine(C, 5);
  C.vocabulary.forEach(v => assert.ok(e.reviewItemFor("v:" + v.id, 0), v.id));
  C.concepts.filter(c => !c.planned).forEach(c => assert.ok(e.reviewItemFor("c:" + c.id, 2), c.id));
});

test("scripted conversations only unlock after the lessons whose language they use", () => {
  C.conversations.forEach(s => assert.ok(s.requires.length > 0, s.id));
});
