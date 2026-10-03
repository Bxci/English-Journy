/*
  engine/habits.js — pure helpers for habit-forming features (no DOM, unit-tested in Node):
  weekly XP target, "trouble words", calendar-reminder (.ics) builder, backup-due check, unit-complete check.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.habits = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DAY = 24 * 60 * 60 * 1000;

  /** XP earned over the last 7 calendar days (including today). `history` entries and `daily` carry { date: "YYYY-MM-DD", xp }. */
  function weeklyXp(history, daily, cutoffDate) {
    return (history || []).concat(daily ? [daily] : []).filter(d => d && d.date && d.date >= cutoffDate).reduce((s, d) => s + (d.xp || 0), 0);
  }

  /** Vocabulary keys ("v:...") the learner has gotten wrong at least once, weakest first. */
  function troubleKeys(items, masteryOf, limit) {
    return Object.keys(items || {})
      .filter(k => k.indexOf("v:") === 0 && (items[k].h || []).some(a => a && a.ok === false))
      .sort((a, b) => masteryOf(a) - masteryOf(b))
      .slice(0, limit || 8);
  }

  /** True when the learner has real progress but hasn't exported a backup in `days` days. */
  function backupDue(lastBackupAt, now, hasProgress, days) {
    if (!hasProgress) return false;
    if (!lastBackupAt) return true;
    return now - lastBackupAt >= (days || 7) * DAY;
  }

  /** True when every real lesson of the unit is completed (or placed out). */
  function unitComplete(unit, lessonsState) {
    if (!unit || !unit.lessonIds || !unit.lessonIds.length) return false;
    return unit.lessonIds.every(id => { const p = (lessonsState || {})[id]; return !!(p && (p.completed || p.placedOut)); });
  }

  const pad = n => String(n).padStart(2, "0");
  const foldText = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  /** A recurring daily calendar event with an alarm, as an .ics string. `time` is "HH:MM" local time. */
  function buildReminderIcs(opts) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(opts.time || "");
    const hh = m ? Math.min(23, Number(m[1])) : 20, mm = m ? Math.min(59, Number(m[2])) : 0;
    const d = opts.startDate || new Date();
    const date = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    const endM = hh * 60 + mm + 15;
    const dtStart = date + "T" + pad(hh) + pad(mm) + "00";
    const dtEnd = date + "T" + pad(Math.floor(endM / 60) % 24) + pad(endM % 60) + "00";
    const title = foldText(opts.title || "המסע לאנגלית");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//English Journey//Reminder//HE", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:english-journey-daily-reminder@bxci.github.io", "DTSTAMP:" + date + "T000000Z",
      "DTSTART:" + dtStart, "DTEND:" + dtEnd, "RRULE:FREQ=DAILY",
      "SUMMARY:" + title, "DESCRIPTION:" + foldText((opts.description || "זמן לתרגל אנגלית!") + (opts.url ? "\n" + opts.url : "")),
      opts.url ? "URL:" + opts.url : null,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + title, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n") + "\r\n";
  }

  return { weeklyXp, troubleKeys, backupDue, unitComplete, buildReminderIcs, DAY };
});
