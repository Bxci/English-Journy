/*
  engine/mistakes.js — mistake memory + daily planning (pure functions).

  Mistake record per concept id: { count, times: [epoch ms of recent wrong answers], last: {...} }
  shouldRemediate(record, now): true when the learner got the same concept wrong
    >= REMEDIATION_MISTAKES times within REMEDIATION_WINDOW_DAYS. The UI then schedules a short
    targeted mini-lesson (explanation again + varied practice). It never blocks anything.

  planDay(input): splits the learner's daily minutes into review / new lesson / practice / conversation.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.mistakes = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY = 24 * 60 * 60 * 1000;
  const REMEDIATION_MISTAKES = 3;
  const REMEDIATION_WINDOW_DAYS = 7;
  const IN_SESSION_VARIATION_AFTER = 2; // wrong answers on one concept in one session -> add a variation

  function recordMistake(record, now, detail) {
    const r = record ? Object.assign({}, record) : { count: 0, times: [] };
    r.count = (r.count || 0) + 1;
    r.times = (r.times || []).concat([now]).filter(t => now - t <= REMEDIATION_WINDOW_DAYS * DAY).slice(-20);
    if (detail) r.last = detail;
    return r;
  }

  function recentMistakes(record, now) {
    if (!record) return 0;
    return (record.times || []).filter(t => now - t <= REMEDIATION_WINDOW_DAYS * DAY).length;
  }

  function shouldRemediate(record, now) {
    return recentMistakes(record, now) >= REMEDIATION_MISTAKES;
  }

  /** After a successful remediation the recent mistakes are forgiven (count history is kept). */
  function clearAfterRemediation(record) {
    if (!record) return record;
    return Object.assign({}, record, { times: [] });
  }

  /**
   * planDay({ dailyMinutes, dueCount, hasLesson, remediationCount, conversationAvailable })
   * -> { reviewItems, chunks: [{kind, minutes}] }
   * About 2 review items per minute; reviews take at most ~35% of the day's time.
   */
  function planDay(input) {
    const total = input.dailyMinutes || 20;
    const chunks = [];
    let left = total;
    let reviewItems = 0;
    if (input.dueCount > 0) {
      const minutes = Math.max(2, Math.min(Math.round(total * 0.35), Math.ceil(input.dueCount / 2)));
      reviewItems = Math.min(input.dueCount, minutes * 2);
      chunks.push({ kind: "review", minutes });
      left -= minutes;
    }
    if (input.remediationCount > 0 && left > 4) {
      const minutes = Math.min(5, Math.max(3, Math.round(total * 0.15)));
      chunks.push({ kind: "practice", minutes });
      left -= minutes;
    }
    const convo = input.conversationAvailable && total >= 20 ? Math.min(5, Math.round(total * 0.2)) : 0;
    if (input.hasLesson) {
      chunks.push({ kind: "lesson", minutes: Math.max(5, left - convo) });
      left -= Math.max(5, left - convo);
    }
    if (convo && left > 0) chunks.push({ kind: "conversation", minutes: left });
    else if (!input.hasLesson && left > 0) chunks.push({ kind: "practice", minutes: left });
    return { reviewItems, chunks };
  }

  return { REMEDIATION_MISTAKES, REMEDIATION_WINDOW_DAYS, IN_SESSION_VARIATION_AFTER, recordMistake, recentMistakes, shouldRemediate, clearAfterRemediation, planDay };
});
