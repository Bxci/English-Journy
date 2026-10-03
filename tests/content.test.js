// tests/content.test.js — structural checks for the reading articles and real-world missions.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadCurriculum } = require("../scripts/load-curriculum.js");
const MS = require("../engine/missions.js");

const C = loadCurriculum();
delete globalThis.ARTICLES; delete globalThis.MISSIONS;
require("../curriculum/articles.js");
require("../curriculum/missions.js");
const HEB = /[֐-׿]/;
const vocab = new Set(C.vocabulary.map(v => v.id));

test("articles are well-formed: unique ids, [en, he] sentences, known vocabulary", () => {
  const ids = new Set();
  assert.ok(globalThis.ARTICLES.length >= 13);
  globalThis.ARTICLES.forEach(a => {
    assert.ok(!ids.has(a.id), "duplicate article " + a.id); ids.add(a.id);
    assert.ok(["pre-a1", "a1", "a2"].includes(a.level), a.id + " level");
    assert.ok(HEB.test(a.title), a.id + " Hebrew title");
    a.vocab.forEach(v => assert.ok(vocab.has(v), a.id + " unknown vocab " + v));
    assert.ok(a.paragraphs.length >= 2);
    a.paragraphs.forEach(p => p.forEach(([en, he]) => { assert.ok(en && /[A-Za-z]/.test(en), a.id + " English"); assert.ok(he && HEB.test(he), a.id + " Hebrew: " + en); }));
  });
});

test("missions are well-formed and every step can be completed by its own first keyword", () => {
  const ids = new Set();
  assert.ok(globalThis.MISSIONS.length >= 8);
  globalThis.MISSIONS.forEach(m => {
    assert.ok(!ids.has(m.id), "duplicate mission " + m.id); ids.add(m.id);
    assert.ok(HEB.test(m.title) && HEB.test(m.intro), m.id + " Hebrew text");
    const stepIds = new Set();
    m.steps.forEach(st => {
      assert.ok(!stepIds.has(st.id), m.id + " duplicate step " + st.id); stepIds.add(st.id);
      assert.ok(HEB.test(st.label) && st.hint && st.keywords.length, m.id + "/" + st.id + " incomplete");
      assert.ok(MS.stepMatches(st.keywords[0][0], st), m.id + "/" + st.id + " keyword does not match its own step");
    });
  });
});

test("every conversation requires only lessons that exist", () => {
  const lessons = new Set(C.lessons.map(l => l.id));
  C.conversations.forEach(c => c.requires.forEach(r => assert.ok(lessons.has(r), c.id + " requires missing lesson " + r)));
});
