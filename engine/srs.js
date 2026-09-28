/*
  engine/srs.js — review scheduler ("חזרה יומית" in the UI).

  A Leitner-box scheduler with a short "relearn" step:
    card = { key, box: 0..6, due: epoch ms, reps, lapses, last }
    - new card: box 0, due now
    - correct answer: box + 1, due = now + INTERVAL_DAYS[box]
    - wrong answer:   box drops to 0 (or 1 for long-known items), lapses + 1, due = now + RELEARN_MINUTES
    - leech: lapses >= LEECH_LAPSES -> item is flagged so the UI can send it to targeted practice

  Struggling items therefore come back within minutes / the next day, while known items
  come back after 1, 3, 7, 14, 30, 60 days.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.srs = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY = 24 * 60 * 60 * 1000;
  const MIN = 60 * 1000;
  const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60];
  const MAX_BOX = INTERVAL_DAYS.length - 1;
  const RELEARN_MINUTES = 10;
  const LEECH_LAPSES = 4;

  function newCard(key, now) {
    return { key, box: 0, due: now, reps: 0, lapses: 0, last: null };
  }

  /** Pure: returns the updated card. */
  function scheduleReview(card, correct, now) {
    const c = Object.assign({}, card);
    c.reps = (c.reps || 0) + 1;
    c.last = now;
    if (correct) {
      c.box = Math.min(MAX_BOX, (c.box || 0) + 1);
      c.due = now + INTERVAL_DAYS[c.box] * DAY;
    } else {
      c.lapses = (c.lapses || 0) + 1;
      c.box = (c.box || 0) >= 4 ? 1 : 0;
      c.due = now + RELEARN_MINUTES * MIN;
    }
    c.leech = c.lapses >= LEECH_LAPSES;
    return c;
  }

  function isDue(card, now) { return card.due <= now; }

  /**
   * buildQueue(cards, now, limit) -> keys ordered for today's review.
   * Only due cards; lower box (weaker) first, then most overdue first.
   */
  function buildQueue(cards, now, limit) {
    return Object.values(cards || {})
      .filter(c => isDue(c, now))
      .sort((a, b) => (a.box - b.box) || (a.due - b.due))
      .slice(0, limit == null ? Infinity : limit)
      .map(c => c.key);
  }

  function countDue(cards, now) {
    return Object.values(cards || {}).filter(c => isDue(c, now)).length;
  }

  return { INTERVAL_DAYS, MAX_BOX, RELEARN_MINUTES, LEECH_LAPSES, newCard, scheduleReview, isDue, buildQueue, countDue };
});
