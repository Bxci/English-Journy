/*
  curriculum/course.js — assembles the course (load LAST, after the other curriculum files).

  Course → Level → Unit → Lesson → Concept → Exercise
  - flattens units into CURRICULUM.lessons (in course order), setting lesson.level and lesson.unit
  - resolves lesson.prerequisites: explicit `pre`, otherwise the previous lesson in course order
  - collects, per concept, the curated exercises of the lessons that teach/practise it
    (concept.lessonExercises) so remediation can draw *different* questions on the same concept
*/
(function (root) {
  const C = root.CURRICULUM;
  C.levels = [
    { id: "pre-a1", title: "Pre-A1", he: "צעדים ראשונים" },
    { id: "a1", title: "A1", he: "מתחילה" },
    { id: "a2", title: "A2", he: "בסיסית-מתקדמת" },
  ];
  C.course = { id: "english-journey", title: "המסע לאנגלית", levels: C.levels.map(l => l.id) };

  const levelOrder = C.levels.map(l => l.id);
  C.units.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
  C.lessons = [];
  let prev = null;
  C.units.forEach(u => {
    u.lessonIds = [];
    u.lessons.forEach(l => {
      l.level = l.level || u.level;
      l.unit = u.id;
      l.concepts = l.concepts || [];
      l.practices = l.practices || [];
      l.vocab = l.vocab || [];
      l.reviewVocab = l.reviewVocab || [];
      l.exercises = l.exercises || [];
      l.prerequisites = l.pre ? l.pre.slice() : (prev ? [prev.id] : []);
      C.lessons.push(l);
      u.lessonIds.push(l.id);
      prev = l;
    });
  });

  const byId = {};
  C.concepts.forEach(c => { byId[c.id] = c; c.lessonExercises = []; });
  C.lessons.forEach(l => {
    const def = l.concepts[0] || l.practices[0] || null;
    l.exercises.forEach(ex => {
      if (ex.g) return;
      const cid = ex.c !== undefined ? ex.c : def;
      if (cid && byId[cid] && !ex.match) byId[cid].lessonExercises.push(Object.assign({}, ex, { c: cid }));
    });
  });

  if (typeof module === "object" && module.exports) module.exports = C;
})(typeof globalThis !== "undefined" ? globalThis : this);
