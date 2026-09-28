/*
  engine/mastery.js — the mastery model.

  computeMastery(history, now) -> number in [0, 1]

  history: array of attempts { t: epoch ms, ok: boolean, w: difficulty weight 0..1 }
    w comes from the exercise type (see EXERCISE_WEIGHTS):
      recognition (multiple choice, emoji, match, listen-select)  ~0.5
      guided (fill-with-options, sentence builder, error fix)       ~0.75
      production (typing, translation, listen-type, verified speech) 1.0
      self-marked speaking (no speech recognition available)       0.25

  The score is the product of four factors (all explained in README):
    1. recency-weighted accuracy over the last WINDOW attempts
       (each older attempt counts RECENCY_DECAY times less than the next one, and harder
        exercises count more)
    2. evidence/confidence: 1 - exp(-E / EVIDENCE_SCALE), where E = sum of weights of correct
       answers. One lucky multiple-choice answer is weak evidence; several correct productions are strong.
    3. forgetting: retention = exp(-daysSinceLast / stability), stability grows with the number
       of consecutive correct answers at the end of the history. Mastery drifts down (to at most half)
       when an item has not been reviewed for a long time.
    4. mistake pressure: if the last attempt was wrong, x LAST_WRONG_FACTOR; repeated mistakes
       beyond REPEAT_MISTAKE_FREE reduce the score further.
  Plus a recognition cap: without at least one correct guided/production answer the score is
  capped at RECOGNITION_CAP (you cannot "master" a word only by picking it from a list).
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.mastery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY = 24 * 60 * 60 * 1000;

  const CONFIG = {
    UNLOCK_THRESHOLD: 0.8,     // lesson score needed to complete a lesson (and unlock what depends on it)
    MASTERY_THRESHOLD: 0.8,    // item/lesson mastery shown as "mastered"
    LEARNED_THRESHOLD: 0.6,    // a vocabulary item counts as "learned" in stats
    WINDOW: 12,
    RECENCY_DECAY: 0.8,
    EVIDENCE_SCALE: 2,
    RECOGNITION_CAP: 0.7,
    PRODUCTION_MIN_WEIGHT: 0.75,
    BASE_STABILITY_DAYS: 3,
    MAX_STABILITY_DAYS: 120,
    LAST_WRONG_FACTOR: 0.85,
    REPEAT_MISTAKE_FREE: 2,
    REPEAT_MISTAKE_PENALTY: 0.04,
    HISTORY_CAP: 30,
  };

  const EXERCISE_WEIGHTS = {
    recognition: 0.5,
    guided: 0.75,
    production: 1,
    selfMarked: 0.25,
  };

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function computeMastery(history, now, cfg) {
    const C = Object.assign({}, CONFIG, cfg || {});
    if (!Array.isArray(history) || history.length === 0) return 0;
    now = now == null ? Date.now() : now;
    const h = history.slice().sort((a, b) => a.t - b.t);
    const recent = h.slice(-C.WINDOW);
    const n = recent.length;

    // 1. recency-weighted accuracy
    let num = 0, den = 0;
    recent.forEach((a, i) => {
      const w = (a.w == null ? 0.5 : a.w) * Math.pow(C.RECENCY_DECAY, n - 1 - i);
      den += w;
      if (a.ok) num += w;
    });
    const accuracy = den > 0 ? num / den : 0;

    // 2. evidence
    const evidence = recent.reduce((s, a) => s + (a.ok ? (a.w == null ? 0.5 : a.w) : 0), 0);
    const confidence = 1 - Math.exp(-evidence / C.EVIDENCE_SCALE);

    // 3. forgetting curve
    let streak = 0;
    for (let i = h.length - 1; i >= 0 && h[i].ok; i--) streak++;
    const stability = Math.min(C.MAX_STABILITY_DAYS, C.BASE_STABILITY_DAYS * Math.pow(2, Math.max(0, streak - 1)));
    const days = Math.max(0, (now - h[h.length - 1].t) / DAY);
    const retention = Math.exp(-days / stability);
    const forgetting = 0.5 + 0.5 * retention;

    // 4. mistake pressure
    let pressure = 1;
    if (!h[h.length - 1].ok) pressure *= C.LAST_WRONG_FACTOR;
    const wrongs = recent.filter(a => !a.ok).length;
    pressure *= Math.max(0.6, 1 - C.REPEAT_MISTAKE_PENALTY * Math.max(0, wrongs - C.REPEAT_MISTAKE_FREE));

    let m = accuracy * confidence * forgetting * pressure;
    const hasProduction = recent.some(a => a.ok && (a.w == null ? 0.5 : a.w) >= C.PRODUCTION_MIN_WEIGHT);
    if (!hasProduction) m = Math.min(m, C.RECOGNITION_CAP);
    return clamp01(m);
  }

  /** Append an attempt, keeping the history bounded. Returns a new array. */
  function addAttempt(history, attempt, cap) {
    const out = (history || []).concat([{ t: attempt.t, ok: !!attempt.ok, w: attempt.w }]);
    const max = cap || CONFIG.HISTORY_CAP;
    return out.length > max ? out.slice(out.length - max) : out;
  }

  /** Mean mastery of several item histories (unseen items count as 0). */
  function averageMastery(histories, now) {
    if (!histories.length) return 0;
    return histories.reduce((s, h) => s + computeMastery(h, now), 0) / histories.length;
  }

  /** Round for display without fake precision: nearest 5%. */
  function displayPercent(x) {
    return Math.round(clamp01(x) * 20) * 5;
  }

  /** Weighted session score from a list of first attempts {ok, w}. */
  function sessionScore(attempts) {
    let num = 0, den = 0;
    attempts.forEach(a => { const w = a.w == null ? 0.5 : a.w; den += w; if (a.ok) num += w; });
    return den ? num / den : 0;
  }

  const SKILLS = ["grammar", "vocabulary", "reading", "listening", "writing", "speaking"];

  return { CONFIG, EXERCISE_WEIGHTS, SKILLS, computeMastery, addAttempt, averageMastery, displayPercent, sessionScore, DAY };
});
