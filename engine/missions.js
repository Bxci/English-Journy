/*
  engine/missions.js — Real-World Missions evaluator (pure functions, no DOM).

  A mission is a communicative goal broken into a few steps (curriculum/missions.js), e.g. the
  Coffee Mission: greet, order the drink, be polite, say thanks. Unlike a lesson exercise, a
  mission step is NOT checked against one exact sentence — it's checked for whether the learner's
  own words communicated that step's intent at all, using flexible keyword-phrase groups authored
  per step (e.g. greet = "hi" OR "hello" OR "good morning"). This matches the product's stated
  philosophy: evaluate task completion / communication, not exact grammar (see README §18).

  stepMatches(text, step) -> boolean
    True when `text` (normalized) contains ANY phrase from ANY of the step's keyword groups.
    step.keywords: [[phrase, phrase, ...], ...] — each inner array is one *group* of interchangeable
    phrases; the step is satisfied if at least one phrase from at least one group appears.
    (Kept intentionally simple: substring match on normalized text, not full NLU — see README §18
    for why, and what true intent matching would need.)

  missionProgress(mission, doneStepIds) -> { total, done, complete, remaining }
*/
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("./normalize.js") : (typeof globalThis !== "undefined" ? globalThis : this).EJ.normalize);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.missions = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (N) {
  function stepMatches(text, step) {
    const norm = N.normalizeAnswer(text || "");
    if (!norm) return false;
    return (step.keywords || []).some(group => group.some(phrase => norm.includes(N.normalizeAnswer(phrase))));
  }

  function missionProgress(mission, doneStepIds) {
    const done = new Set(doneStepIds || []);
    const total = mission.steps.length;
    const doneCount = mission.steps.filter(s => done.has(s.id)).length;
    return { total, done: doneCount, complete: doneCount === total, remaining: mission.steps.filter(s => !done.has(s.id)) };
  }

  return { stepMatches, missionProgress };
});
