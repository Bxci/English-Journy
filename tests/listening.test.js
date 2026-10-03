const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../curriculum/listening.js");

test("every listening passage is well-formed with answerable questions", () => {
  assert.ok(L.length >= 6);
  const ids = new Set();
  L.forEach(p => {
    assert.ok(!ids.has(p.id), "duplicate id " + p.id); ids.add(p.id);
    assert.ok(["pre-a1", "a1", "a2"].includes(p.level), p.id + " level");
    assert.ok(p.lines.length >= 4 && p.lines.every(l => l.length === 2 && l[0] && l[1]), p.id + " lines [en, he]");
    assert.ok(p.questions.length >= 3, p.id + " needs >=3 questions");
    p.questions.forEach(q => {
      assert.ok(q.q && q.a, p.id + " question/answer");
      assert.ok(q.o.length >= 2, p.id + " needs >=2 distractors");
      assert.ok(!q.o.includes(q.a), p.id + " answer repeated among distractors");
      assert.equal(new Set(q.o).size, q.o.length, p.id + " duplicate distractors");
    });
  });
});
