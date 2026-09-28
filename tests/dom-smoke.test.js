/*
  tests/dom-smoke.test.js — OPTIONAL end-to-end test of the real UI (index.html + all scripts) in jsdom.
  Plays onboarding, EVERY lesson through the DOM, the failing/reinforcement path, daily review, remediation,
  every scripted conversation, placement, v1 migration and corrupt-storage recovery.
  jsdom is not a dependency of this project; the test is skipped unless it can be resolved:
    npm install --no-save jsdom   (or run with NODE_PATH pointing at a jsdom install)
*/
const test = require("node:test");
const fs = require("fs");
const path = require("path");
let JSDOM = null;
try { ({ JSDOM } = require("jsdom")); } catch (e) { /* optional */ }
const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const bare = html.replace(/<script src="[^"]+"><\/script>/g, "");

function boot(storage) {
  const dom = new JSDOM(bare, { url: "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  if (storage) Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
  const errors = [];
  w.addEventListener("error", e => errors.push(e.message));
  w.confirm = () => true;
  w.alert = () => {};
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.scrollTo = () => {};
  scripts.forEach(s => w.eval(fs.readFileSync(path.join(ROOT, s), "utf8") + "\n//# sourceURL=" + s));
  return { w, d: w.document, errors };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error("ASSERT: " + m); }
const active = d => d.querySelector(".screen.active").id;

function answerCurrent(w, d, correct) {
  const app = w.__EJ_APP__;
  const ex = app.current.ex;
  const act = d.getElementById("btn-lesson-action");
  if (ex.type === "learn" || ex.type === "vocabIntro") { act.click(); return "card"; }
  if (ex.type === "choice") {
    const opts = [...d.querySelectorAll(".options-grid .option")];
    const target = opts.find(o => (o.dataset.value === ex.answer) === correct);
    assert(target, "choice option missing for " + ex.id + " opts=" + opts.map(o => o.dataset.value + (o.disabled ? "(dis)" : "")).join(",") + " answered=" + w.__EJ_APP__.current.answered + " html=" + d.getElementById("lesson-body").innerHTML.slice(0, 300));
    target.click(); act.click();
  } else if (ex.type === "type") {
    const inp = d.getElementById("type-input");
    inp.value = correct ? ex.accept[0] : "zzz wrong";
    inp.dispatchEvent(new w.Event("input")); act.click();
  } else if (ex.type === "build") {
    const words = ex.accept[0].replace(/[.?!]+$/, "").split(/\s+/);
    const chunks = () => [...d.querySelectorAll(".build-bank .chunk")];
    if (correct) words.forEach(wd => { const c = chunks().find(x => x.textContent === wd); assert(c, "chunk " + wd + " missing in " + ex.id); c.click(); });
    else chunks().reverse().forEach(c => c.click());
    act.click();
  } else if (ex.type === "match") {
    const items = [...d.querySelectorAll(".match-item")];
    if (!correct) { const en0 = items.find(i => i.classList.contains("en")); en0.click(); const wrongHe = items.find(i => !i.classList.contains("en") && i.dataset.key !== en0.dataset.key); wrongHe.click(); en0.click(); const wrongHe2 = items.find(i => !i.classList.contains("en") && i.dataset.key !== en0.dataset.key && i !== wrongHe) || wrongHe; wrongHe2.click(); }
    ex.pairs.forEach(p => { items.find(i => i.classList.contains("en") && i.dataset.key === p[0]).click(); items.find(i => !i.classList.contains("en") && i.dataset.key === p[0]).click(); });
  } else if (ex.type === "speak") {
    if (correct) d.getElementById("self-mark").click(); else d.getElementById("skip-speak").click();
    if (active(d) !== "screen-lesson" || app.current.ex !== ex) return "speak";
  } else throw new Error("unknown type " + ex.type);
  assert(act.dataset.mode === "next", "after answering " + ex.id + " (" + ex.kind + ") action should be next, is " + act.dataset.mode);
  const fb = d.getElementById("feedback-banner");
  assert(!fb.classList.contains("hidden"), "feedback shown for " + ex.id);
  if (!correct && ex.type !== "match") assert(/למה|התשובה הנכונה/.test(fb.textContent), "wrong answer shows explanation for " + ex.id);
  act.click();
  return ex.type;
}

async function playLesson(w, d, correctFn) {
  let guard = 0;
  while (active(d) === "screen-lesson" && guard++ < 400) answerCurrent(w, d, correctFn());
  assert(guard < 400, "lesson loop");
}


test("DOM smoke: full learner journey through the real UI", { skip: JSDOM ? false : "jsdom not installed (optional)", timeout: 600000 }, async () => {
  // ---------- fresh learner ----------
  let { w, d, errors } = boot();
  const app = () => w.__EJ_APP__;
  assert(active(d) === "screen-welcome", "starts at welcome");
  d.getElementById("user-name").value = "Rivka";
  d.getElementById("btn-start").click();
  assert(active(d) === "screen-onboarding", "onboarding");
  d.querySelector('.onb-option[data-id="none"]').click();
  d.querySelector('.chip[data-id="travel"]').click();
  d.getElementById("onb-next").click();
  d.querySelector('.onb-option[data-m="20"]').click();
  assert(active(d) === "screen-home", "home after onboarding");
  assert(d.getElementById("btn-home-main").textContent === "התחילי ללמוד", "CTA says start");
  assert(d.querySelectorAll(".plan-item").length >= 1, "plan has items");
  d.getElementById("btn-home-main").click();
  assert(active(d) === "screen-lesson", "lesson opened");
  assert(app().session.lesson.id === "pa-intro", "first lesson is pa-intro");
  await playLesson(w, d, () => true);
  assert(active(d) === "screen-reward", "reward after perfect lesson, got " + active(d));
  assert(app().state.lessons["pa-intro"].completed, "pa-intro completed");
  d.getElementById("reward-gift-box").click();
  d.getElementById("btn-reward-continue").click();
  assert(active(d) === "screen-home", "back home");

  // ---------- failing path: reinforcement, never trapped ----------
  app().startLesson(app().nextLesson());
  const lid = app().session.lesson.id;
  await playLesson(w, d, () => false);
  assert(active(d) === "screen-interstitial", "reinforcement offered after failing");
  assert(!app().state.lessons[lid].completed, "failing lesson NOT completed by clicking through");
  d.querySelector('#inter-card button[data-i="0"]').click();
  assert(active(d) === "screen-lesson" && app().session.round === "reinforce", "reinforcement round runs");
  await playLesson(w, d, () => false);
  assert(active(d) === "screen-interstitial", "offer after weak reinforcement");
  d.querySelector('#inter-card button[data-i="1"]').click(); // continue anyway
  assert(active(d) === "screen-reward", "can move on after genuine attempts");
  assert(app().state.lessons[lid].completed && app().state.lessons[lid].weak, "weak completion recorded");
  assert(Object.keys(app().state.mistakes).length > 0, "mistakes recorded");
  assert(Object.keys(app().state.remediation).length > 0, "remediation scheduled after repeated mistakes");
  d.getElementById("btn-reward-continue").click();

  // ---------- play every remaining lesson with correct answers ----------
  let count = 0, types = {};
  for (;;) {
    const n = app().nextLesson();
    if (!n) break;
    app().startLesson(n);
    let guard = 0;
    while (active(d) === "screen-lesson" && guard++ < 400) { const t = answerCurrent(w, d, true); types[t] = (types[t] || 0) + 1; }
    if (active(d) === "screen-interstitial") throw new Error("perfect lesson " + n.id + " asked for reinforcement");
    assert(active(d) === "screen-reward", "reward for " + n.id);
    assert(app().state.lessons[n.id].completed, n.id + " completed");
    d.getElementById("btn-reward-continue").click();
    if (active(d) === "screen-certificate") { d.getElementById("btn-cert-close").click(); }
    count++;
  }
  const real = w.CURRICULUM.lessons.filter(l => l.status !== "planned");
  assert(count + 2 === real.length, "played every real lesson through the DOM (" + (count + 2) + "/" + real.length + ")");
  ["card", "choice", "type", "build", "match", "speak"].forEach(t => assert(types[t] > 0, "renderer exercised: " + t));
  assert(real.every(l => app().state.lessons[l.id] && app().state.lessons[l.id].completed), "all real lessons completed");
  assert(Object.keys(app().state.certificates).length === 3, "certificates for 3 levels");

  // ---------- screens ----------
  app().goMap();
  assert(d.querySelectorAll(".lesson-row").length === w.CURRICULUM.lessons.length, "map shows all lessons");
  assert(d.querySelectorAll(".st-planned").length === 6, "planned lessons shown");
  app().goProgress();
  assert(d.querySelectorAll(".skill-row").length === 6, "6 skill bars");
  assert(!/\d+\.\d+%/.test(d.getElementById("progress-body").textContent), "no fake precision");
  app().goHome();

  // ---------- review ----------
  const st = app().state;
  Object.values(st.srs).forEach(c => { c.due = Date.now() - 1000; });
  app().startReview(10);
  assert(active(d) === "screen-lesson" && app().session.kind === "review", "review session");
  await playLesson(w, d, () => true);
  assert(active(d) === "screen-interstitial", "review summary");
  d.querySelector('#inter-card button[data-i="0"]').click();

  // ---------- remediation from progress ----------
  st.remediation["be-i-am"] = { due: Date.now() - 1, created: Date.now() };
  app().goProgress();
  const remBtn = d.querySelector('[data-rem="be-i-am"]');
  assert(remBtn, "remediation chip");
  remBtn.click();
  assert(app().session.kind === "remediation", "remediation session");
  await playLesson(w, d, () => true);
  assert(!app().state.remediation["be-i-am"], "remediation cleared after success");
  d.querySelector('#inter-card button[data-i="0"]').click();

  // ---------- every conversation ----------
  for (const s of w.CURRICULUM.conversations) {
    app().startConversation(s);
    assert(active(d) === "screen-chat", "chat " + s.id);
    let guard = 0, pickedBad = false;
    while (active(d) === "screen-chat" && guard++ < 50) {
      const opts = [...d.querySelectorAll("#chat-choices .option:not([disabled])")];
      if (!opts.length) { await sleep(1000); continue; }
      const all = Object.values(s.nodes).flatMap(n => n.choices || []);
      const bad = opts.find(o => (all.find(c => c.en === o.textContent) || {}).bad);
      if (!pickedBad && bad) { bad.click(); pickedBad = true; assert(!d.getElementById("chat-feedback").classList.contains("hidden"), "feedback on bad reply"); continue; }
      const good = opts.find(o => !(all.find(c => c.en === o.textContent) || {}).bad);
      good.click();
      await sleep(800);
    }
    assert(active(d) === "screen-interstitial", "conversation review for " + s.id + " got " + active(d));
    assert(d.querySelector(".convo-review"), "review lists mistakes for " + s.id);
    assert(/מה בחרת/.test(d.getElementById("inter-card").textContent) && /בחירה טובה יותר/.test(d.getElementById("inter-card").textContent), "picked/better/why pattern");
  }
  assert(errors.length === 0, "no runtime errors: " + errors.join(" | "));

  // ---------- v1 migration ----------
  const v1 = { userName: "Old", streak: 4, lastPlayedDate: "2026-01-01", stars: 30, giftsOpened: 6, badgesUnlocked: ["b1", "b2"], units: { u1: { completed: true, bestAccuracy: 90 }, u2: { completed: true, bestAccuracy: 80 }, u3: { completed: false } } };
  ({ w, d, errors } = boot({ "english-journey-state-v1": JSON.stringify(v1) }));
  const s2 = w.__EJ_APP__.state;
  assert(s2.userName === "Old" && s2.stars === 30 && s2.streak === 4 && s2.badgesUnlocked.includes("b2"), "v1 fields kept");
  assert(s2.lessons["pa-greet-2"].placedOut === "legacy" && s2.lessons["pa-num-1"].placedOut === "legacy" && !s2.lessons["pa-family"], "v1 units mapped");
  assert(!d.getElementById("returning-user").classList.contains("hidden"), "returning user greeted");
  d.getElementById("btn-continue").click();
  assert(active(d) === "screen-onboarding", "migrated user goes through onboarding once");
  // ---------- partial / old v2 state merges with defaults ----------
  ({ w, d, errors } = boot({ "english-journey-state-v2": JSON.stringify({ userName: "X", onboarding: { done: true }, lessons: { "pa-intro": { completed: true } } }) }));
  const s3 = w.__EJ_APP__.state;
  assert(s3.onboarding.dailyMinutes === 20 && s3.settings && s3.daily && s3.srs, "defaults merged");
  d.getElementById("btn-continue").click();
  assert(active(d) === "screen-home", "home with partial state");
  assert(errors.length === 0, "no runtime errors after migration: " + errors.join(" | "));
  // ---------- corrupt storage ----------
  ({ w, d, errors } = boot({ "english-journey-state-v2": "{not json" }));
  assert(active(d) === "screen-welcome" && !w.__EJ_APP__.state.userName, "corrupt storage -> fresh state");
  // ---------- placement test path ----------
  ({ w, d, errors } = boot());
  d.getElementById("user-name").value = "P"; d.getElementById("btn-start").click();
  d.querySelector('.onb-option[data-id="sentences"]').click();
  d.getElementById("onb-test").click();
  for (const q of w.PLACEMENT_TEST) { const b = [...d.querySelectorAll("#onb-body .option")].find(o => o.dataset.v === q.a); b.click(); }
  assert(/A2/.test(d.getElementById("onb-body").textContent), "placement result A2");
  d.getElementById("onb-next").click(); d.getElementById("onb-next").click(); d.querySelector('.onb-option[data-m="10"]').click();
  assert(w.__EJ_APP__.nextLesson().id === "a2-comp", "placed learner starts at A2, got " + w.__EJ_APP__.nextLesson().id);
  assert(w.__EJ_APP__.state.lessons["pa-intro"].placedOut === "placement" && !w.__EJ_APP__.state.lessons["pa-intro"].completed, "placed-out, not completed");
  // skip path for 'sentences' -> A1
  ({ w, d, errors } = boot());
  d.getElementById("user-name").value = "Q"; d.getElementById("btn-start").click();
  d.querySelector('.onb-option[data-id="sentences"]').click();
  d.getElementById("onb-skip").click(); d.getElementById("onb-next").click(); d.querySelector('.onb-option[data-m="45"]').click();
  assert(w.__EJ_APP__.nextLesson().id === "a1-pron", "skip -> A1 start, got " + w.__EJ_APP__.nextLesson().id);
  // locked lesson toast
  w.__EJ_APP__.goMap();
  d.querySelector(".st-locked").click();
  assert(/צריך קודם/.test(d.getElementById("toast").textContent), "locked lesson explains prerequisites");
  assert(errors.length === 0, "no runtime errors in placement: " + errors.join(" | "));
  
});
