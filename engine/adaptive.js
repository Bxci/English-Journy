/*
  engine/adaptive.js — the Adaptive Engine: explainable scoring on top of the existing
  Mastery Engine (engine/mastery.js), SRS (engine/srs.js) and mistake memory (engine/mistakes.js).

  This module does NOT replace engine/mistakes.js's planDay() (which still owns the time-budget
  allocation across review/lesson/practice/conversation — see script.js buildPlan()). Its job is
  narrower and additive:

    1. rankRemediation(candidates, ctx) — when several concepts are due for remediation, decide
       which one to surface first. Ranked by weakness (more recent mistakes, lower mastery), not
       insertion order, so the learner is nudged toward whatever is actually hurting most.

    2. explainChunk(kind, ctx) -> Hebrew reason strings for a planDay() chunk. Never shown to the
       learner directly (see script.js's home screen, which keeps the existing friendly one-line
       "sub" text) — this exists for the developer inspector (window.__EJ_APP__.adaptiveDebug()),
       so the "why did it pick this?" question is answerable without reading source.

    3. conceptMasterySnapshot(concepts, masteryOf, now) -> per-concept mastery for the Mastery Map
       screen and the dev inspector, using the same computeMastery() the rest of the app uses (no
       parallel scoring system).

  Pure functions, no DOM/localStorage access, so they're unit-testable like the other engines.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.adaptive = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY = 24 * 60 * 60 * 1000;

  /** Hebrew mastery band label, matching the thresholds already used elsewhere (mastery.js CONFIG). */
  function masteryLabel(pct) {
    if (pct >= 95) return "שלטת מצוין";
    if (pct >= 85) return "חזק";
    if (pct >= 70) return "טוב";
    if (pct >= 50) return "בלמידה";
    if (pct >= 30) return "מתפתח";
    return "בהתחלה";
  }

  /**
   * Rank concepts due for remediation by weakness, most urgent first.
   * candidates: [{ id, masteryPct (0-100), mistakeCount, lastMistakeAt (epoch ms) }]
   * Returns the same shape, sorted, each with `score` and `reasons` (Hebrew, dev-only).
   */
  function rankRemediation(candidates, now) {
    now = now == null ? Date.now() : now;
    return candidates
      .map(c => {
        const daysSince = c.lastMistakeAt ? Math.max(0, (now - c.lastMistakeAt) / DAY) : 99;
        const recency = Math.max(0, 1 - daysSince / 7); // mistakes from the last week matter most
        const weakness = 1 - Math.max(0, Math.min(100, c.masteryPct)) / 100;
        const score = weakness * 0.6 + recency * 0.3 + Math.min(1, (c.mistakeCount || 0) / 5) * 0.1;
        const reasons = [
          c.mistakeCount + " טעויות שנרשמו לאחרונה",
          "מאסטרי נוכחי: " + Math.round(c.masteryPct) + "%",
        ];
        if (daysSince < 1) reasons.push("טעות אחרונה: היום");
        return Object.assign({}, c, { score, reasons });
      })
      .sort((a, b) => b.score - a.score);
  }

  const CHUNK_REASONS = {
    review: ctx => [
      ctx.dueCount + " פריטים ממתינים לחזרה במחזור החזרות (SRS)",
      "חזרה מונעת שכחה של מילים ומושגים שכבר נלמדו",
    ],
    lesson: ctx => [
      "השיעור הבא ברצף הקורס — כל הדרישות הקודמות הושלמו",
      ctx.lessonTitle ? 'שיעור: "' + ctx.lessonTitle + '"' : null,
    ].filter(Boolean),
    practice: ctx => (ctx.remediationConcept
      ? ["נבחר כי הוא הכי חלש כרגע מבין נושאים לחיזוק"].concat(ctx.remediationReasons || [])
      : ["אין נושא ספציפי לחיזוק — תרגול חופשי על הכי חלש"]),
    conversation: ctx => [
      ctx.matchesGoal ? "מתאים למטרה שבחרת באונבורדינג" : "שיחה מתאימה לרמה הנוכחית",
      ctx.runsBefore ? "כבר תרגלת " + ctx.runsBefore + " פעמים" : "עוד לא תרגלת שיחה זו",
    ],
  };

  /** Dev-only explanation for one planDay() chunk. Never render this text to the learner. */
  function explainChunk(kind, ctx) {
    const fn = CHUNK_REASONS[kind];
    return fn ? fn(ctx || {}) : [];
  }

  /**
   * Per-concept mastery snapshot for the Mastery Map / dev inspector.
   * concepts: array of { id, title, level }
   * masteryOf: (conceptId) => number 0..1
   * Returns concepts annotated with masteryPct (0-100) and a Hebrew label, sorted by level then title.
   */
  function conceptMasterySnapshot(concepts, masteryOf) {
    return concepts.map(c => {
      const pct = Math.round(masteryOf(c.id) * 100);
      return { id: c.id, title: c.title, level: c.level, masteryPct: pct, label: masteryLabel(pct) };
    });
  }

  return { masteryLabel, rankRemediation, explainChunk, conceptMasterySnapshot };
});
