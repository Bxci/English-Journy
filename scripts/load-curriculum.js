/*
  scripts/load-curriculum.js — loads the browser curriculum files into Node (same order as index.html).
  The curriculum files attach themselves to globalThis.CURRICULUM, so we reset it and require in order.
*/
const path = require("path");

const CURRICULUM_FILES = [
  "curriculum/vocabulary.js",
  "curriculum/concepts.js",
  "curriculum/pre-a1.js",
  "curriculum/a1.js",
  "curriculum/a2.js",
  "curriculum/conversations.js",
  "curriculum/course.js",
];
const ENGINE_FILES = [
  "engine/normalize.js",
  "engine/mastery.js",
  "engine/srs.js",
  "engine/unlock.js",
  "engine/mistakes.js",
  "engine/exercises.js",
];

function loadCurriculum() {
  const root = path.join(__dirname, "..");
  delete globalThis.CURRICULUM;
  CURRICULUM_FILES.forEach(f => {
    const full = path.join(root, f);
    delete require.cache[require.resolve(full)];
    require(full);
  });
  return globalThis.CURRICULUM;
}

module.exports = { loadCurriculum, CURRICULUM_FILES, ENGINE_FILES };
