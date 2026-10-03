const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../engine/habits.js");

test("weeklyXp sums only entries on/after the cutoff, including today", () => {
  const hist = [{ date: "2026-10-01", xp: 5 }, { date: "2026-10-03", xp: 4 }, { date: "2026-10-04" }];
  assert.equal(H.weeklyXp(hist, { date: "2026-10-05", xp: 3 }, "2026-10-02"), 7);
  assert.equal(H.weeklyXp([], null, "2026-10-02"), 0);
});

test("troubleKeys picks only vocab with a wrong answer, weakest first, limited", () => {
  const items = {
    "v:a": { h: [{ ok: true }, { ok: false }] }, "v:b": { h: [{ ok: false }] }, "v:c": { h: [{ ok: true }] },
    "c:grammar": { h: [{ ok: false }] },
  };
  const m = { "v:a": 0.6, "v:b": 0.2 };
  assert.deepEqual(H.troubleKeys(items, k => m[k] ?? 1, 8), ["v:b", "v:a"]);
  assert.deepEqual(H.troubleKeys(items, k => m[k] ?? 1, 1), ["v:b"]);
});

test("backupDue: never without progress, always if never backed up, otherwise after 7 days", () => {
  const now = 100 * H.DAY;
  assert.equal(H.backupDue(null, now, false), false);
  assert.equal(H.backupDue(null, now, true), true);
  assert.equal(H.backupDue(now - 2 * H.DAY, now, true), false);
  assert.equal(H.backupDue(now - 8 * H.DAY, now, true), true);
});

test("unitComplete needs every lesson completed or placed out", () => {
  const u = { lessonIds: ["a", "b"] };
  assert.equal(H.unitComplete(u, { a: { completed: true }, b: { placedOut: true } }), true);
  assert.equal(H.unitComplete(u, { a: { completed: true } }), false);
  assert.equal(H.unitComplete({ lessonIds: [] }, {}), false);
});

test("buildReminderIcs yields a valid daily-recurring event with an alarm at the chosen time", () => {
  const ics = H.buildReminderIcs({ time: "20:30", url: "https://example.com/", startDate: new Date(2026, 9, 5) });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20261005T203000/);
  assert.match(ics, /DTEND:20261005T204500/);
  assert.match(ics, /RRULE:FREQ=DAILY/);
  assert.match(ics, /BEGIN:VALARM/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});
