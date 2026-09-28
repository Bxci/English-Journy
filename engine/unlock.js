/*
  engine/unlock.js — prerequisite graph + unlock rules (pure functions).

  A lesson is UNLOCKED when:
    1. every lesson in lesson.prerequisites is satisfied (completed, or placed-out at onboarding), AND
    2. for every concept the lesson teaches, every prerequisite concept of that concept is already
       taught by a satisfied lesson (or is taught earlier inside the same lesson).
  Rule 2 is what enforces "never introduce a concept before its prerequisites" at runtime,
  independently of how the content happens to be ordered.
  Lessons with status "planned" (A2 skeletons without content yet) are never unlockable.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.unlock = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {

  function buildIndex(curriculum) {
    const lessonsById = {}, conceptsById = {}, conceptTaughtBy = {};
    (curriculum.lessons || []).forEach(l => { lessonsById[l.id] = l; });
    (curriculum.concepts || []).forEach(c => { conceptsById[c.id] = c; });
    (curriculum.lessons || []).forEach(l => {
      (l.concepts || []).forEach(cid => { if (!conceptTaughtBy[cid]) conceptTaughtBy[cid] = l.id; });
    });
    return { lessonsById, conceptsById, conceptTaughtBy, order: (curriculum.lessons || []).map(l => l.id) };
  }

  function isSatisfied(lessonId, progress) {
    const p = progress && progress.lessons && progress.lessons[lessonId];
    return !!(p && (p.completed || p.placedOut));
  }

  /** Lesson ids that must be satisfied before `lesson` opens (empty => unlocked). */
  function missingPrerequisites(lesson, progress, index) {
    const missing = new Set();
    (lesson.prerequisites || []).forEach(pid => { if (!isSatisfied(pid, progress)) missing.add(pid); });
    const taughtHere = [];
    (lesson.concepts || []).forEach(cid => {
      const c = index.conceptsById[cid];
      (c && c.prerequisites || []).forEach(pc => {
        if (taughtHere.includes(pc)) return;
        const teacher = index.conceptTaughtBy[pc];
        if (!teacher) { missing.add("concept:" + pc); return; }
        if (teacher === lesson.id) return;
        if (!isSatisfied(teacher, progress)) missing.add(teacher);
      });
      taughtHere.push(cid);
    });
    return Array.from(missing);
  }

  function isUnlocked(lesson, progress, index) {
    if (lesson.status === "planned") return false;
    return missingPrerequisites(lesson, progress, index).length === 0;
  }

  /**
   * status: planned | locked | available | completed | mastered | placedOut
   * masteryOf(lessonId) -> 0..1 (optional)
   */
  function lessonStatus(lesson, progress, index, masteryOf, threshold) {
    if (lesson.status === "planned") return "planned";
    const p = (progress.lessons || {})[lesson.id] || {};
    if (p.completed) {
      const m = masteryOf ? masteryOf(lesson.id) : 0;
      return m >= (threshold == null ? 0.8 : threshold) ? "mastered" : "completed";
    }
    if (!isUnlocked(lesson, progress, index)) return "locked";
    if (p.placedOut) return "placedOut";
    return "available";
  }

  /** First lesson in course order that is unlocked and not yet completed/placed-out. */
  function nextLesson(curriculum, progress, index) {
    return (curriculum.lessons || []).find(l =>
      l.status !== "planned" && !isSatisfied(l.id, progress) && isUnlocked(l, progress, index)) || null;
  }

  /** Kahn topological sort. nodes: ids, edges(id) -> ids it depends on. Returns {order, cyclic: ids} */
  function topoSort(nodes, depsOf) {
    const indeg = {}, users = {};
    nodes.forEach(n => { indeg[n] = 0; users[n] = []; });
    nodes.forEach(n => (depsOf(n) || []).forEach(d => {
      if (!(d in indeg)) return;
      indeg[n]++; users[d].push(n);
    }));
    const queue = nodes.filter(n => indeg[n] === 0);
    const order = [];
    while (queue.length) {
      const n = queue.shift();
      order.push(n);
      users[n].forEach(u => { if (--indeg[u] === 0) queue.push(u); });
    }
    const cyclic = nodes.filter(n => !order.includes(n));
    return { order, cyclic };
  }

  /**
   * Simulate a learner completing every unlockable lesson until nothing new opens.
   * Returns ids of non-planned lessons that can never be reached.
   */
  function unreachableLessons(curriculum) {
    const index = buildIndex(curriculum);
    const progress = { lessons: {} };
    let changed = true;
    while (changed) {
      changed = false;
      curriculum.lessons.forEach(l => {
        if (l.status === "planned" || isSatisfied(l.id, progress)) return;
        if (isUnlocked(l, progress, index)) { progress.lessons[l.id] = { completed: true }; changed = true; }
      });
    }
    return curriculum.lessons.filter(l => l.status !== "planned" && !isSatisfied(l.id, progress)).map(l => l.id);
  }

  return { buildIndex, isSatisfied, missingPrerequisites, isUnlocked, lessonStatus, nextLesson, topoSort, unreachableLessons };
});
