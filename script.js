/* ============================================================
   המסע לאנגלית — ממשק האפליקציה (static, client-side only)
   Pure learning logic lives in engine/*.js (unit-tested); this file wires it to the DOM.
   ============================================================ */
(function () {
  "use strict";
  const C = window.CURRICULUM;
  const ARTICLES = window.ARTICLES || [];
  const articleById = {}; ARTICLES.forEach(a => { articleById[a.id] = a; });
  const vocabById = {}; (C.vocabulary || []).forEach(v => { vocabById[v.id] = v; });
  const EJ = window.EJ;
  const M = EJ.mastery, SRS = EJ.srs, UN = EJ.unlock, MI = EJ.mistakes, N = EJ.normalize;
  const CFG = M.CONFIG;
  const engine = EJ.exercises.createEngine(C);
  const index = UN.buildIndex(C);
  const lessonById = index.lessonsById, conceptById = index.conceptsById;
  const LEVEL_NAME = { "pre-a1": "Pre-A1", a1: "A1", a2: "A2" };
  const SKILL_NAME = { grammar: "דקדוק", vocabulary: "אוצר מילים", reading: "קריאה", listening: "הבנת הנשמע", writing: "כתיבה", speaking: "דיבור" };

  /* ============================================================
     Persistence (localStorage) — schema v2, merged with defaults
     ============================================================ */
  const STORAGE_KEY = "english-journey-state-v2";
  const LEGACY_KEY = "english-journey-state-v1";

  function todayStr(d) {
    const x = d || new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }

  function defaultState() {
    return {
      schemaVersion: 2,
      userName: "",
      createdAt: Date.now(),
      onboarding: { done: false, selfLevel: null, placement: null, goals: [], dailyMinutes: 20 },
      streak: 0, lastPlayedDate: null, stars: 0, giftsOpened: 0, badgesUnlocked: [],
      lessons: {},        // lessonId -> { completed, completedAt, bestScore, attempts, weak, placedOut }
      items: {},          // "c:<concept>" | "v:<vocab>" -> { h: [{t, ok, w}] }
      skills: {},         // skill -> { h: [{t, ok, w}] }
      srs: {},            // key -> Leitner card
      mistakes: {},       // conceptId -> { count, times, last }
      remediation: {},    // conceptId -> { due, created }
      conversations: {},  // scenarioId -> { runs, lastAt, lastMistakes, history: [] }
      articlesRead: {},   // articleId -> { at }
      certificates: {},   // level -> date
      daily: { date: null, seconds: 0, reviewDone: 0, lessonsDone: 0, practiceDone: 0, convoDone: 0 },
      time: { totalSeconds: 0 },
      settings: { slowAudio: false },
      legacy: null,
    };
  }

  const isObj = x => x && typeof x === "object" && !Array.isArray(x);
  /** Merge saved state over defaults: unknown keys kept, nested objects merged one level deep. */
  function mergeWithDefaults(saved) {
    const base = defaultState();
    if (!isObj(saved)) return base;
    const out = Object.assign({}, base, saved);
    Object.keys(base).forEach(k => {
      if (isObj(base[k])) out[k] = Object.assign({}, base[k], isObj(saved[k]) ? saved[k] : {});
      else if (Array.isArray(base[k]) && !Array.isArray(saved[k])) out[k] = base[k];
    });
    out.schemaVersion = 2;
    return out;
  }

  /** v1 (10 vocab units) -> v2. Keeps name, streak, stars, gifts, badges; old completed units count as placed-out lessons. */
  function migrateV1(old) {
    const s = defaultState();
    ["userName", "streak", "lastPlayedDate", "stars", "giftsOpened"].forEach(k => { if (old[k] != null) s[k] = old[k]; });
    if (Array.isArray(old.badgesUnlocked)) s.badgesUnlocked = old.badgesUnlocked.slice();
    Object.entries(old.units || {}).forEach(([uid, u]) => {
      if (!u || !u.completed) return;
      (LEGACY_UNIT_MAP[uid] || []).forEach(lid => { if (lessonById[lid]) s.lessons[lid] = { placedOut: "legacy" }; });
    });
    s.legacy = { migratedAt: Date.now(), units: old.units || {} };
    return s;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return mergeWithDefaults(JSON.parse(raw));
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) return migrateV1(JSON.parse(legacy)); // the v1 key is left untouched as a backup
    } catch (e) { /* corrupt storage -> fresh state */ }
    return defaultState();
  }

  let saveFailedWarned = false;
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (!saveFailedWarned) {
        saveFailedWarned = true;
        toast("⚠️ לא הצלחנו לשמור את ההתקדמות (אין מקום אחסון פנוי או שהדפדפן חוסם שמירה). נסי לפנות מקום או לצאת ממצב גלישה פרטית.", 6000);
      }
    }
  }

  let state = loadState();

  function rollDaily() {
    const t = todayStr();
    if (state.daily.date !== t) state.daily = { date: t, seconds: 0, reviewDone: 0, lessonsDone: 0, practiceDone: 0, convoDone: 0 };
  }

  function markStudiedToday() {
    const t = todayStr();
    if (state.lastPlayedDate === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    state.streak = state.lastPlayedDate === todayStr(y) ? state.streak + 1 : 1;
    state.lastPlayedDate = t;
  }

  /* ============================================================
     Helpers: escaping, bidi-aware rich text, audio
     ============================================================ */
  const $ = id => document.getElementById(id);
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const hasHebrew = s => /[֐-׿]/.test(String(s));

  /** Hebrew text with {English} segments -> HTML. English is wrapped in LTR <bdi>; tappable for audio unless noAudio. */
  function rich(text, opts) {
    opts = opts || {};
    text = String(text == null ? "" : text);
    // bare English runs in Hebrew titles ("you / we / they are — ...") get isolated as LTR too
    if (!text.includes("{") && hasHebrew(text)) text = text.replace(/[A-Za-z][A-Za-z0-9'’ /.,?!+-]*[A-Za-z0-9?!.'’]|[A-Za-z]/g, m => "{" + m.trim() + "}");
    let h = esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/\{([^}]+)\}/g, (m, en) => opts.noAudio
      ? '<bdi class="en" dir="ltr" lang="en">' + en + "</bdi>"
      : '<button type="button" class="en en-say" dir="ltr" lang="en" data-say="' + en + '" aria-label="השמעה: ' + en + '">' + en + "</button>");
    return h;
  }
  /** A plain English string as an LTR span. */
  function enSpan(text) { return '<bdi class="en" dir="ltr" lang="en">' + esc(text) + "</bdi>"; }
  function sayButtons(text, big) {
    const t = esc(text);
    return '<span class="say-group' + (big ? " big" : "") + '">' +
      '<button type="button" class="say-btn" data-say="' + t + '" aria-label="השמעה: ' + t + '">🔊</button>' +
      '<button type="button" class="say-btn slow" data-say="' + t + '" data-slow="1" aria-label="השמעה איטית: ' + t + '">🐢</button></span>';
  }
  function plainOf(text) { return String(text || "").replace(/\*\*/g, "").replace(/[{}]/g, ""); }

  const Audio = {
    voice: null,
    supported: "speechSynthesis" in window,
    init() {
      if (!this.supported) return;
      const choose = () => {
        const vs = window.speechSynthesis.getVoices();
        this.voice = vs.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Microsoft/i.test(v.name)) || vs.find(v => /^en[-_]/i.test(v.lang)) || null;
      };
      choose();
      window.speechSynthesis.onvoiceschanged = choose;
    },
    speak(text, slow) {
      if (!this.supported || !text) return;
      if (!this.voice) {
        const vs = window.speechSynthesis.getVoices();
        if (vs.length) this.voice = vs.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Microsoft/i.test(v.name)) || vs.find(v => /^en[-_]/i.test(v.lang)) || null;
      }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        if (this.voice) u.voice = this.voice;
        u.rate = slow || state.settings.slowAudio ? 0.6 : 0.9;
        window.speechSynthesis.speak(u);
      } catch (e) { /* ignore */ }
    },
  };
  Audio.init();

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-say]");
    if (!b) return;
    e.stopPropagation();
    Audio.speak(b.dataset.say, b.dataset.slow === "1");
  });

  /** Speech recognition wrapper (feature-detected). Only checks WHICH words were said, never pronunciation. */
  const STT = {
    Ctor: window.SpeechRecognition || window.webkitSpeechRecognition || null,
    get supported() { return !!this.Ctor; },
    listen(handlers) {
      let done = false;
      const finish = fn => { if (done) return; done = true; clearTimeout(timer); fn(); };
      let rec;
      try {
        rec = new this.Ctor();
        rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
      } catch (e) { handlers.onError("unsupported"); return { stop() {} }; }
      const timer = setTimeout(() => { try { rec.stop(); } catch (e) { /* */ } finish(() => handlers.onError("timeout")); }, 9000);
      rec.onresult = ev => {
        const alts = [];
        for (let i = 0; i < ev.results.length; i++) for (let j = 0; j < ev.results[i].length; j++) alts.push(ev.results[i][j].transcript);
        finish(() => handlers.onResult(alts));
      };
      rec.onerror = ev => finish(() => handlers.onError(ev.error || "error"));
      rec.onend = () => finish(() => handlers.onError("no-speech"));
      try { rec.start(); } catch (e) { finish(() => handlers.onError("error")); }
      return { stop() { try { rec.stop(); } catch (e) { /* */ } } };
    },
  };
  const STT_ERRORS = {
    "not-allowed": "אין גישה למיקרופון. אפשר לאשר גישה בהגדרות הדפדפן, או לסמן ידנית.",
    "service-not-allowed": "הדפדפן לא מאפשר זיהוי דיבור כאן. אפשר לסמן ידנית.",
    "no-speech": "לא שמעתי כלום. נסי שוב, קרוב יותר למיקרופון.",
    timeout: "לא שמעתי תשובה. נסי שוב.",
    network: "זיהוי הדיבור צריך חיבור לאינטרנט. אפשר לסמן ידנית.",
    unsupported: "הדפדפן הזה לא תומך בזיהוי דיבור.",
  };

  let toastTimer = null;
  function toast(html, ms) {
    const t = $("toast");
    t.innerHTML = html;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), ms || 3500);
  }

  /* ============================================================
     Screens + navigation
     ============================================================ */
  const screens = {};
  document.querySelectorAll(".screen").forEach(s => { screens[s.id] = s; });
  const NAV_SCREENS = ["screen-home", "screen-map", "screen-reading", "screen-convos", "screen-progress"];

  function showScreen(id) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[id].classList.add("active");
    const nav = $("bottom-nav");
    nav.classList.toggle("hidden", !NAV_SCREENS.includes(id));
    nav.querySelectorAll("button").forEach(b => {
      const on = b.dataset.nav === id;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    const h = screens[id].querySelector("h1, h2, .topbar-title");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { /* */ } }
  }
  $("bottom-nav").addEventListener("click", e => {
    const b = e.target.closest("[data-nav]");
    if (!b) return;
    ({ "screen-home": goHome, "screen-map": goMap, "screen-reading": goReading, "screen-convos": goConvos, "screen-progress": goProgress })[b.dataset.nav]();
  });

  /* ============================================================
     Learning model glue
     ============================================================ */
  const now = () => Date.now();
  const histOf = key => (state.items[key] && state.items[key].h) || [];
  const masteryOf = key => M.computeMastery(histOf(key), now());

  function lessonKeys(l) {
    const keys = l.concepts.map(c => "c:" + c).concat(l.vocab.map(v => "v:" + v));
    return keys.length ? keys : l.practices.map(c => "c:" + c);
  }
  function lessonMastery(lid) {
    const l = lessonById[lid];
    if (!l) return 0;
    const keys = lessonKeys(l);
    return keys.length ? keys.reduce((s, k) => s + masteryOf(k), 0) / keys.length : 0;
  }
  const lessonStatus = l => UN.lessonStatus(l, state, index, lessonMastery, CFG.MASTERY_THRESHOLD);
  const nextLesson = () => UN.nextLesson(C, state, index);
  const realLessons = C.lessons.filter(l => l.status !== "planned");

  function currentLevel() {
    const n = nextLesson();
    if (n) return n.level;
    const last = realLessons.slice().reverse().find(l => UN.isSatisfied(l.id, state));
    return last ? last.level : "pre-a1";
  }

  function recordAttempt(ex, ok, opts) {
    opts = opts || {};
    const t = now();
    const w = opts.w != null ? opts.w : ex.w;
    const keys = [];
    if (ex.concept) keys.push("c:" + ex.concept);
    (ex.vocab || []).forEach(v => keys.push("v:" + v));
    keys.forEach(k => {
      state.items[k] = { h: M.addAttempt(histOf(k), { t, ok, w }) };
      if (session) session.touched[k] = (session.touched[k] === undefined ? true : session.touched[k]) && ok;
    });
    (ex.skills || []).forEach(s => {
      state.skills[s] = { h: M.addAttempt((state.skills[s] || {}).h, { t, ok, w }, 60) };
    });
    if (!ok && ex.concept) {
      state.mistakes[ex.concept] = MI.recordMistake(state.mistakes[ex.concept], t, { prompt: plainOf(ex.sentence || ex.prompt || ex.wrongSentence || ""), given: opts.given || "", expected: ex.answer });
      if (MI.shouldRemediate(state.mistakes[ex.concept], t) && !state.remediation[ex.concept] && conceptById[ex.concept] && !conceptById[ex.concept].planned) {
        state.remediation[ex.concept] = { due: t, created: t };
      }
    }
    saveState();
  }

  function applySessionToSrs() {
    if (!session) return;
    const t = now();
    Object.entries(session.touched).forEach(([k, ok]) => {
      const card = state.srs[k] || SRS.newCard(k, t);
      state.srs[k] = SRS.scheduleReview(card, ok, t);
    });
    session.touched = {};
  }

  function addStudyTime(seconds) {
    const s = Math.max(0, Math.min(seconds, 60 * 60));
    rollDaily();
    state.daily.seconds += s;
    state.time.totalSeconds += s;
  }

  /* ============================================================
     Welcome + onboarding
     ============================================================ */
  function initWelcomeScreen() {
    if (state.userName) {
      $("name-entry").classList.add("hidden");
      $("returning-user").classList.remove("hidden");
      $("returning-name").textContent = state.userName;
    } else {
      $("name-entry").classList.remove("hidden");
      $("returning-user").classList.add("hidden");
    }
  }
  $("btn-start").addEventListener("click", () => {
    const input = $("user-name");
    const name = input.value.trim();
    if (!name) { input.classList.add("invalid"); input.placeholder = "צריך להקליד שם כדי להתחיל :)"; input.focus(); return; }
    state.userName = name;
    saveState();
    startOnboarding();
  });
  $("user-name").addEventListener("keydown", e => { if (e.key === "Enter") $("btn-start").click(); });
  $("btn-continue").addEventListener("click", () => (state.onboarding.done ? goHome() : startOnboarding()));
  $("btn-reset").addEventListener("click", () => {
    if (confirm("לאפס את כל ההתקדמות ולהתחיל מחדש? אי אפשר לבטל את זה.")) {
      state = defaultState(); saveState(); initWelcomeScreen();
    }
  });

  const SELF_LEVELS = [
    { id: "none", label: "אני כמעט לא יודעת אנגלית", sub: "מתחילות מההתחלה — בלי שום מבחן", start: "pre-a1", offerTest: false },
    { id: "words", label: "אני מכירה כמה מילים", sub: "מתחילות ב-Pre-A1, ואפשר לעשות בדיקה קצרה", start: "pre-a1", offerTest: true },
    { id: "sentences", label: "אני מבינה משפטים פשוטים", sub: "כנראה A1 — בדיקה קצרה תעזור לדייק", start: "a1", offerTest: true },
    { id: "conversation", label: "אני מסתדרת בשיחה בסיסית", sub: "כנראה A1–A2 — בדיקה קצרה תעזור לדייק", start: "a1", offerTest: true },
  ];

  function startOnboarding() { onbStepLevel(); showScreen("screen-onboarding"); }

  function onbStepLevel() {
    $("onb-body").innerHTML = '<div class="onb-step">שלב 1 מתוך 3</div><h2>מה רמת האנגלית שלך?</h2><p class="onb-sub">אין פה תשובה לא נכונה. תמיד אפשר לחזור לשיעורים קודמים.</p>' +
      '<div class="onb-options">' + SELF_LEVELS.map(o => '<button class="onb-option" data-id="' + o.id + '"><b>' + o.label + "</b><span>" + o.sub + "</span></button>").join("") + "</div>";
    $("onb-body").querySelectorAll(".onb-option").forEach(b => b.addEventListener("click", () => {
      const o = SELF_LEVELS.find(x => x.id === b.dataset.id);
      state.onboarding.selfLevel = o.id;
      saveState();
      if (!o.offerTest) { onbStepGoals(); return; }
      onbOfferTest(o);
    }));
  }

  function onbOfferTest(o) {
    $("onb-body").innerHTML = '<div class="onb-step">בדיקת רמה קצרה (לא חובה)</div><h2>רוצה לעשות בדיקה של 2 דקות?</h2>' +
      '<p class="onb-sub">11 שאלות קצרות. לפי התוצאה נדלג על מה שאת כבר יודעת. אפשר גם לדלג על הבדיקה — ' +
      (o.start === "pre-a1" ? "ואז מתחילות מההתחלה." : "ואז נתחיל מ-" + LEVEL_NAME[o.start] + ", ותמיד אפשר לחזור ל-Pre-A1 מהמפה.") + "</p>" +
      '<button class="btn btn-primary" id="onb-test">לבדיקה הקצרה</button><button class="btn btn-ghost" id="onb-skip">לדלג</button>';
    $("onb-test").addEventListener("click", () => runPlacement(0, []));
    $("onb-skip").addEventListener("click", () => { placeAt(o.start, "self"); onbStepGoals(); });
  }

  function runPlacement(i, answers) {
    if (i >= PLACEMENT_TEST.length) { finishPlacement(answers); return; }
    const q = PLACEMENT_TEST[i];
    const opts = engine.shuffle([q.a].concat(q.o));
    $("onb-body").innerHTML = '<div class="onb-step">שאלה ' + (i + 1) + " מתוך " + PLACEMENT_TEST.length + '</div><div class="q-title">' + (hasHebrew(q.q) ? rich(q.q, { noAudio: true }) : enSpan(q.q)) + "</div>" +
      '<div class="options-grid">' + opts.map(o => '<button class="option" data-v="' + esc(o) + '">' + (hasHebrew(o) ? "<span>" + esc(o) + "</span>" : '<span class="opt-en">' + esc(o) + "</span>") + "</button>").join("") + "</div>" +
      '<button class="btn btn-ghost" id="onb-idk">לא יודעת — הלאה</button>';
    $("onb-body").querySelectorAll(".option").forEach(b => b.addEventListener("click", () => runPlacement(i + 1, answers.concat([{ level: q.level, ok: b.dataset.v === q.a }]))));
    $("onb-idk").addEventListener("click", () => runPlacement(i + 1, answers.concat([{ level: q.level, ok: false }])));
  }

  function finishPlacement(answers) {
    const score = lv => { const a = answers.filter(x => x.level === lv); return a.length ? a.filter(x => x.ok).length / a.length : 0; };
    let level = "pre-a1";
    if (score("pre-a1") >= 0.75) level = "a1";
    if (level === "a1" && score("a1") >= 0.75) level = "a2";
    state.onboarding.placement = { takenAt: now(), level, scores: { "pre-a1": score("pre-a1"), a1: score("a1"), a2: score("a2") } };
    placeAt(level, "placement");
    $("onb-body").innerHTML = '<div class="onb-step">תוצאה</div><h2>נתחיל מ-' + LEVEL_NAME[level] + " 🎯</h2>" +
      '<p class="onb-sub">' + (level === "pre-a1" ? "מתחילות מהיסודות — בסיס חזק זה הדבר הכי חשוב." : "דילגנו על מה שכבר ידעת. השיעורים הקודמים פתוחים במפה אם תרצי לחזור אליהם.") + "</p>" +
      '<button class="btn btn-primary" id="onb-next">המשך</button>';
    $("onb-next").addEventListener("click", onbStepGoals);
  }

  /** Mark every real lesson below `level` as placed-out (satisfies prerequisites, never counts as mastered). */
  function placeAt(level, reason) {
    const order = ["pre-a1", "a1", "a2"];
    realLessons.forEach(l => {
      if (order.indexOf(l.level) < order.indexOf(level)) {
        const p = state.lessons[l.id] || {};
        if (!p.completed) state.lessons[l.id] = Object.assign(p, { placedOut: reason });
      }
    });
    saveState();
  }

  function onbStepGoals() {
    const sel = new Set(state.onboarding.goals || []);
    $("onb-body").innerHTML = '<div class="onb-step">שלב 2 מתוך 3</div><h2>בשביל מה את לומדת?</h2><p class="onb-sub">אפשר לבחור כמה. זה רק כדי להתאים דוגמאות ושיחות — סדר השיעורים לא משתנה.</p>' +
      '<div class="chips">' + LEARNING_GOALS.map(g => '<button class="chip' + (sel.has(g.id) ? " on" : "") + '" aria-pressed="' + sel.has(g.id) + '" data-id="' + g.id + '"><span aria-hidden="true">' + g.icon + "</span> " + g.label + "</button>").join("") + "</div>" +
      '<button class="btn btn-primary" id="onb-next">המשך</button>';
    $("onb-body").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
      if (sel.has(b.dataset.id)) sel.delete(b.dataset.id); else sel.add(b.dataset.id);
      b.classList.toggle("on"); b.setAttribute("aria-pressed", sel.has(b.dataset.id));
    }));
    $("onb-next").addEventListener("click", () => { state.onboarding.goals = Array.from(sel); saveState(); onbStepMinutes(); });
  }

  function onbStepMinutes() {
    const cur = state.onboarding.dailyMinutes || 20;
    $("onb-body").innerHTML = '<div class="onb-step">שלב 3 מתוך 3</div><h2>כמה זמן ביום מתאים לך?</h2><p class="onb-sub">לפי זה נבנה את התוכנית היומית. אפשר לשנות בכל זמן.</p>' +
      '<div class="onb-options minutes">' + [10, 20, 30, 45].map(m => '<button class="onb-option' + (m === cur ? " on" : "") + '" data-m="' + m + '"><b>' + m + " דקות</b><span>" + ({ 10: "קליל", 20: "מומלץ", 30: "רציני", 45: "אינטנסיבי" })[m] + "</span></button>").join("") + "</div>";
    $("onb-body").querySelectorAll(".onb-option").forEach(b => b.addEventListener("click", () => {
      state.onboarding.dailyMinutes = Number(b.dataset.m);
      state.onboarding.done = true;
      saveState();
      goHome();
    }));
  }

  /* ============================================================
     Today (home)
     ============================================================ */
  function dueKeys(limit) { return SRS.buildQueue(state.srs, now(), limit); }
  function dueRemediation() { return Object.keys(state.remediation).filter(c => state.remediation[c].due <= now() && conceptById[c]); }
  function availableConvos() { return C.conversations.filter(s => s.requires.every(r => UN.isSatisfied(r, state))); }
  function goalFlavor() {
    const g = LEARNING_GOALS.filter(x => (state.onboarding.goals || []).includes(x.id));
    return g.length ? g[new Date().getDate() % g.length] : null;
  }
  function recommendedConvo() {
    const list = availableConvos();
    const goals = state.onboarding.goals || [];
    return list.slice().sort((a, b) => {
      const ga = a.goals.some(g => goals.includes(g)) ? 0 : 1, gb = b.goals.some(g => goals.includes(g)) ? 0 : 1;
      const ra = (state.conversations[a.id] || {}).runs || 0, rb = (state.conversations[b.id] || {}).runs || 0;
      return (ra - rb) || (ga - gb);
    })[0] || null;
  }

  function buildPlan() {
    rollDaily();
    const due = SRS.countDue(state.srs, now());
    const rem = dueRemediation();
    const next = nextLesson();
    const convo = recommendedConvo();
    const plan = MI.planDay({ dailyMinutes: state.onboarding.dailyMinutes, dueCount: due, hasLesson: !!next, remediationCount: rem.length, conversationAvailable: !!convo });
    const d = state.daily;
    return plan.chunks.map(ch => {
      if (ch.kind === "review") return Object.assign(ch, { icon: "🔁", title: "חזרה יומית", sub: Math.min(due, plan.reviewItems) + " פריטים שכדאי לרענן", done: d.reviewDone > 0 && SRS.countDue(state.srs, now()) === 0, run: () => startReview(plan.reviewItems) });
      if (ch.kind === "lesson") return Object.assign(ch, { icon: "📘", title: "שיעור חדש", sub: next.title + " · " + LEVEL_NAME[next.level], done: false, run: () => startLesson(next) });
      if (ch.kind === "practice") {
        if (rem.length) return Object.assign(ch, { icon: "🎯", title: "חיזוק ממוקד", sub: plainOf(conceptById[rem[0]].title), done: false, run: () => startRemediation(rem[0]) });
        return Object.assign(ch, { icon: "💪", title: "תרגול חופשי", sub: "תרגול של מה שהכי חלש כרגע", done: d.practiceDone > 0, run: startFreePractice });
      }
      return Object.assign(ch, { icon: "💬", title: "תרגול שיחה", sub: convo.title, done: d.convoDone > 0, run: () => startConversation(convo) });
    });
  }

  function goHome() {
    rollDaily();
    const hour = new Date().getHours();
    const hello = hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";
    $("home-greeting").textContent = hello + ", " + state.userName + " 👋";
    $("stat-streak").textContent = state.streak;
    $("stat-stars").textContent = state.stars;
    const f = goalFlavor();
    $("home-flavor").textContent = f ? f.icon + " " + f.flavor : "";
    const plan = buildPlan();
    const goal = state.onboarding.dailyMinutes;
    const doneMin = Math.round(state.daily.seconds / 60);
    $("today-minutes").textContent = doneMin + " / " + goal + " דק׳";
    $("today-bar").style.width = Math.min(100, Math.round((doneMin / goal) * 100)) + "%";
    const list = $("plan-list");
    list.innerHTML = "";
    plan.forEach(ch => {
      const li = document.createElement("li");
      li.innerHTML = '<button class="plan-item' + (ch.done ? " done" : "") + '"><span class="plan-icon" aria-hidden="true">' + (ch.done ? "✅" : ch.icon) + '</span><span class="plan-text"><b>' + esc(ch.title) + "</b><span>" + esc(ch.sub) + '</span></span><span class="plan-min">' + ch.minutes + " דק׳</span></button>";
      li.firstChild.addEventListener("click", ch.run);
      list.appendChild(li);
    });
    if (!plan.length) list.innerHTML = '<li class="plan-empty">סיימת את כל מה שיש כרגע! אפשר לחזור על שיעורים מהמפה 🌟</li>';
    const main = $("btn-home-main");
    const studiedToday = state.daily.seconds > 0;
    main.textContent = studiedToday ? "המשך ללמוד" : "התחילי ללמוד";
    const first = plan.find(ch => !ch.done);
    main.onclick = first ? first.run : startFreePractice;
    const lv = currentLevel();
    const lvLessons = realLessons.filter(l => l.level === lv);
    $("home-level").innerHTML = "רמה נוכחית: <b>" + LEVEL_NAME[lv] + "</b> · " + lvLessons.filter(l => UN.isSatisfied(l.id, state)).length + " מתוך " + lvLessons.length + " שיעורים";
    showScreen("screen-home");
  }

  /* ============================================================
     Course map (skill tree)
     ============================================================ */
  const STATUS_UI = {
    mastered: { icon: "✓", label: "שלטת" }, completed: { icon: "◐", label: "הושלם — כדאי לחזור" },
    current: { icon: "●", label: "הבא בתור" }, available: { icon: "○", label: "פתוח" },
    placedOut: { icon: "○", label: "דילגת (פתוח לתרגול)" }, locked: { icon: "🔒", label: "נעול" }, planned: { icon: "⏳", label: "בהכנה" },
  };

  function goMap() {
    const next = nextLesson();
    const body = $("map-body");
    body.innerHTML = "";
    C.levels.forEach(lv => {
      const sec = document.createElement("section");
      sec.className = "map-level";
      const ls = realLessons.filter(l => l.level === lv.id);
      sec.innerHTML = '<h2 class="map-level-title"><span dir="ltr">' + lv.title + "</span> · " + lv.he + ' <small>' + ls.filter(l => UN.isSatisfied(l.id, state)).length + "/" + ls.length + "</small></h2>";
      C.units.filter(u => u.level === lv.id).forEach(u => {
        const card = document.createElement("div");
        card.className = "unit-card unlocked";
        card.innerHTML = '<div class="unit-head"><div class="unit-icon" aria-hidden="true">' + u.icon + '</div><div class="unit-title">' + esc(u.title) + "</div></div>";
        const ul = document.createElement("ul");
        ul.className = "lesson-rows";
        u.lessonIds.forEach(lid => {
          const l = lessonById[lid];
          let st = lessonStatus(l);
          if (next && l.id === next.id) st = "current";
          const m = (st === "completed" || st === "mastered") ? M.displayPercent(lessonMastery(l.id)) : null;
          const li = document.createElement("li");
          li.innerHTML = '<button class="lesson-row st-' + st + '" aria-label="' + esc(plainOf(l.title)) + " — " + STATUS_UI[st].label + '"><span class="lesson-state" aria-hidden="true">' + STATUS_UI[st].icon + '</span><span class="lesson-text"><b>' + rich(l.title, { noAudio: true }) + "</b><span>" + rich(l.objective, { noAudio: true }) + "</span>" +
            (m != null ? '<span class="mini-bar" aria-hidden="true"><span style="width:' + m + '%"></span></span>' : "") + "</span></button>";
          li.firstChild.addEventListener("click", () => onLessonTap(l, st));
          ul.appendChild(li);
        });
        card.appendChild(ul);
        sec.appendChild(card);
      });
      body.appendChild(sec);
    });
    showScreen("screen-map");
    const cur = body.querySelector(".st-current");
    if (cur) cur.scrollIntoView({ block: "center" });
  }

  function onLessonTap(l, st) {
    if (st === "planned") { toast("השיעור הזה עוד בהכנה ⏳ — הוא יופיע כאן כשהתוכן יהיה מוכן."); return; }
    if (st === "locked") {
      const miss = UN.missingPrerequisites(l, state, index).map(id => lessonById[id] ? "«" + plainOf(lessonById[id].title) + "»" : id);
      toast("🔒 כדי לפתוח את השיעור צריך קודם: " + esc(miss.join(", ")), 5000);
      return;
    }
    startLesson(l);
  }

  /* ============================================================
     Session player (lessons, reviews, remediation, practice)
     ============================================================ */
  let session = null;
  let current = null; // { ex, check: () => result | null, answered }

  const lessonBody = $("lesson-body");
  const actionBtn = $("btn-lesson-action");
  const feedback = $("feedback-banner");

  function newSession(kind, queue, extra) {
    session = Object.assign({ kind, queue, index: 0, first: {}, reinforceAttempts: [], wrongs: [], conceptWrong: {}, variedConcepts: {}, hearts: 3, start: now(), touched: {}, round: "main", answeredCount: 0 }, extra || {});
    updateHearts();
    showScreen("screen-lesson");
    renderItem();
  }

  function startLesson(l) {
    const p = state.lessons[l.id] || {};
    state.lessons[l.id] = Object.assign(p, { attempts: (p.attempts || 0) + 1 });
    saveState();
    newSession("lesson", engine.expandLesson(l), { lesson: l });
  }

  function startReview(limit) {
    const keys = dueKeys(limit || 10);
    if (!keys.length) { toast("אין כרגע פריטים לחזרה — כל הכבוד! 🌟"); return; }
    const items = keys.map(k => engine.reviewItemFor(k, (state.srs[k] || {}).box)).filter(Boolean);
    if (!items.length) { toast("אין כרגע פריטים לחזרה — כל הכבוד! 🌟"); return; }
    newSession("review", engine.shuffle(items), { title: "חזרה יומית" });
  }

  function startRemediation(cid) {
    const c = conceptById[cid];
    const items = [engine.learnCard(cid)].concat(engine.variationsFor(cid, 5, []));
    newSession("remediation", items, { conceptId: cid, title: "חיזוק ממוקד: " + plainOf(c.title) });
  }

  function startFreePractice() {
    const keys = Object.keys(state.items).filter(k => histOf(k).length).sort((a, b) => masteryOf(a) - masteryOf(b)).slice(0, 8);
    if (!keys.length) { const n = nextLesson(); if (n) startLesson(n); else toast("עוד אין מה לתרגל — התחילי שיעור מהמפה."); return; }
    const items = keys.map(k => engine.reviewItemFor(k, 2)).filter(Boolean);
    if (!items.length) { toast("עוד אין מה לתרגל — התחילי שיעור מהמפה."); return; }
    newSession("practice", engine.shuffle(items), { title: "תרגול חופשי" });
  }

  function updateHearts() {
    const h = session ? session.hearts : 3;
    const el = $("lesson-hearts");
    el.textContent = "❤️".repeat(Math.max(0, h)) + "🤍".repeat(Math.max(0, 3 - h));
    el.setAttribute("aria-label", h + " לבבות מתוך 3");
  }

  function gradedCount(list) { return list.filter(x => x.type !== "learn" && x.type !== "vocabIntro").length; }

  function updateProgress() {
    const pct = Math.max(4, Math.round((session.index / session.queue.length) * 100));
    $("lesson-progress-bar").style.width = pct + "%";
    $("lesson-progress").setAttribute("aria-valuenow", pct);
  }

  function setAction(label, enabled, mode) {
    actionBtn.textContent = label;
    actionBtn.disabled = !enabled;
    actionBtn.dataset.mode = mode;
  }

  function renderItem() {
    feedback.classList.add("hidden");
    updateProgress();
    const ex = session.queue[session.index];
    current = { ex, check: null, answered: false };
    lessonBody.innerHTML = "";
    lessonBody.scrollTop = 0;
    const r = RENDERERS[ex.type];
    r(ex);
    const h = lessonBody.querySelector(".q-kicker, h2");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { /* */ } }
  }

  actionBtn.addEventListener("click", () => {
    const mode = actionBtn.dataset.mode;
    if (mode === "next") { goNext(); return; }
    if (mode === "check" && current && current.check) {
      const res = current.check();
      if (res) resolve(res);
    }
  });

  /** Called once per graded exercise with { ok, given, near, selfMarked, skipped }. */
  function resolve(res) {
    if (!current || current.answered) return;
    current.answered = true;
    const ex = current.ex;
    if (res.skipped) { goNext(); return; }
    const w = res.selfMarked ? M.EXERCISE_WEIGHTS.selfMarked : ex.w;
    recordAttempt(ex, res.ok, { w, given: res.given });
    session.answeredCount++;
    if (session.round === "main") { if (!(ex.id in session.first)) session.first[ex.id] = { ok: res.ok, w, type: ex.type }; }
    else session.reinforceAttempts.push({ ok: res.ok, w });
    if (!res.ok) {
      session.wrongs.push(ex);
      maybeInsertVariation(ex);
      session.hearts--;
      updateHearts();
      if (session.hearts <= 0) {
        const cid = ex.concept && conceptById[ex.concept] && conceptById[ex.concept].explanation ? ex.concept : null;
        const card = cid ? Object.assign(engine.learnCard(cid), { id: "relearn:" + cid + ":" + session.index, refill: true })
          : { id: "breath:" + session.index, type: "learn", title: "רגע של נשימה 🌿", explanation: "טעויות הן חלק מהלמידה — ככה המוח לומד. הלבבות מתמלאים מחדש, ממשיכים בקצב שלך.", examples: [], commonMistakes: [], refill: true };
        session.queue.splice(session.index + 1, 0, card);
      }
    }
    showFeedback(ex, res);
    setAction("המשך", true, "next");
    actionBtn.focus();
  }

  function maybeInsertVariation(ex) {
    const c = ex.concept;
    if (!c) return;
    session.conceptWrong[c] = (session.conceptWrong[c] || 0) + 1;
    if (session.conceptWrong[c] >= MI.IN_SESSION_VARIATION_AFTER && !session.variedConcepts[c]) {
      const v = engine.variationsFor(c, 1, [ex.prompt, ex.sentence])[0];
      if (v) {
        session.variedConcepts[c] = true;
        v.id = "var:" + c + ":" + session.index;
        session.queue.splice(Math.min(session.queue.length, session.index + 3), 0, v);
      }
    }
  }

  function showFeedback(ex, res) {
    feedback.classList.remove("hidden", "good", "bad");
    feedback.classList.add(res.ok ? "good" : "bad");
    $("feedback-icon").textContent = res.ok ? "✅" : "💡";
    const answerLine = ex.type === "match" ? "" : (hasHebrew(ex.answer) ? esc(ex.answer) : enSpan(ex.answer) + sayButtons(ex.kind === "lis" || ex.kind === "listen" ? ex.audio : (ex.full || ex.audioAfter || ex.answer)));
    if (res.ok) {
      $("feedback-title").textContent = res.selfMarked ? "סימנת שאמרת — מעולה!" : res.near ? "כמעט מושלם! 👌" : pick(["כל הכבוד!", "מעולה!", "בדיוק!", "יפה מאוד!"]);
      let sub = "";
      if (res.near) sub = "שימי לב לאיות: " + answerLine;
      else if (ex.full) sub = enSpan(ex.full) + sayButtons(ex.full);
      else if (ex.type === "build" || ex.kind === "tr") sub = sayButtons(ex.answer);
      if (ex.he && ex.type !== "choice") sub += (sub ? " · " : "") + esc(ex.he);
      $("feedback-sub").innerHTML = sub;
      if (ex.audioAfter && ex.type !== "choice") Audio.speak(ex.audioAfter);
    } else {
      $("feedback-title").textContent = "לא בדיוק — וזה בסדר";
      $("feedback-sub").innerHTML = (answerLine ? "התשובה הנכונה: " + answerLine + "<br>" : "") + (ex.why ? "<b>למה?</b> " + rich(ex.why) : "");
    }
  }

  function goNext() {
    const ex = session.queue[session.index];
    if (ex && ex.refill) { session.hearts = 3; updateHearts(); }
    session.index++;
    if (session.index < session.queue.length) { renderItem(); return; }
    endOfQueue();
  }

  function endOfQueue() {
    applySessionToSrs();
    addStudyTime((now() - session.start) / 1000);
    session.start = now();
    if (session.answeredCount > 0) markStudiedToday();
    saveState();
    if (session.kind === "lesson") return lessonEnd();
    return practiceEnd();
  }

  function lessonScore() { return M.sessionScore(Object.values(session.first)); }

  function lessonEnd() {
    const l = session.lesson;
    // coverage ignores speaking items (they can always be skipped, e.g. no microphone)
    const total = engine.expandLesson(l).filter(x => x.type !== "learn" && x.type !== "vocabIntro" && x.type !== "speak").length;
    const coverage = Object.entries(session.first).filter(([id, a]) => !id.startsWith("var:") && a.type !== "speak").length / Math.max(1, total);
    const score = lessonScore();
    const passedMain = score >= CFG.UNLOCK_THRESHOLD && coverage >= 0.9;
    if (session.round === "main") {
      if (passedMain) return completeLesson(l, score, false);
      return offerReinforcement(l, score);
    }
    const rScore = M.sessionScore(session.reinforceAttempts);
    if (rScore >= CFG.UNLOCK_THRESHOLD) return completeLesson(l, Math.max(score, rScore), false);
    return offerAfterReinforcement(l, score, rScore);
  }

  function reinforcementQueue() {
    const seen = new Set();
    const wrongs = session.wrongs.filter(w => { if (seen.has(w.id)) return false; seen.add(w.id); return true; });
    const base = wrongs.length ? wrongs : session.queue.filter(x => x.type !== "learn" && x.type !== "vocabIntro").slice(-4);
    const items = base.slice(0, 6).map(ex => Object.assign(engine.reinforcementFor(ex), { id: "re:" + ex.id + ":" + now() }));
    const concepts = Array.from(new Set(base.map(x => x.concept).filter(c => c && conceptById[c] && conceptById[c].explanation))).slice(0, 1);
    return concepts.map(c => engine.learnCard(c)).concat(items);
  }

  function interstitial(html, buttons) {
    $("inter-card").innerHTML = html + '<div class="inter-buttons">' + buttons.map((b, i) => '<button class="btn ' + (i === 0 ? "btn-primary" : "btn-ghost") + '" data-i="' + i + '">' + b.label + "</button>").join("") + "</div>";
    $("inter-card").querySelectorAll("button[data-i]").forEach(el => el.addEventListener("click", () => buttons[Number(el.dataset.i)].run()));
    showScreen("screen-interstitial");
  }

  function offerReinforcement(l, score) {
    interstitial('<div class="reward-burst" aria-hidden="true">💪</div><h2>כמעט שם!</h2><p class="reward-message">הדיוק בשיעור: <b>' + M.displayPercent(score) + "%</b>. כדי לסיים שיעור צריך בערך " + Math.round(CFG.UNLOCK_THRESHOLD * 100) + "%. בואי נעשה סבב חיזוק קצר על מה שהיה קשה — עם שאלות קצת אחרות.</p>", [
      { label: "לסבב חיזוק קצר", run: () => { session.round = "reinforce"; session.reinforceAttempts = []; const q = reinforcementQueue(); session.wrongs = []; session.queue = q; session.index = 0; session.hearts = 3; updateHearts(); showScreen("screen-lesson"); renderItem(); } },
      { label: "לחזור למפה (השיעור יישאר פתוח)", run: () => { session = null; goMap(); } },
    ]);
  }

  function offerAfterReinforcement(l, score, rScore) {
    interstitial('<div class="reward-burst" aria-hidden="true">🌱</div><h2>עבודה טובה</h2><p class="reward-message">בסבב החיזוק: <b>' + M.displayPercent(rScore) + "%</b>. אפשר לעשות עוד סבב קצר, או להמשיך הלאה — הנושאים הקשים יחזרו אלייך בחזרה היומית, בקצב שלך.</p>", [
      { label: "עוד סבב קצר", run: () => { session.reinforceAttempts = []; const q = reinforcementQueue(); session.wrongs = []; session.queue = q; session.index = 0; session.hearts = 3; updateHearts(); showScreen("screen-lesson"); renderItem(); } },
      { label: "להמשיך הלאה", run: () => completeLesson(l, Math.max(score, rScore), true) },
    ]);
  }

  function completeLesson(l, score, weak) {
    const p = state.lessons[l.id] || {};
    const first = !p.completed;
    state.lessons[l.id] = Object.assign(p, { completed: true, completedAt: p.completedAt || now(), bestScore: Math.max(p.bestScore || 0, score), weak: weak && !(p.completed && !p.weak) });
    rollDaily();
    state.daily.lessonsDone++;
    const starsEarned = Math.max(1, Math.round(score * 5));
    state.stars += starsEarned;
    state.giftsOpened += 1;
    saveState();

    $("reward-title").textContent = first ? "סיימת: " + plainOf(l.title) + " 🎉" : "תרגלת שוב: " + plainOf(l.title) + " 💪";
    $("reward-message").textContent = pick(ENCOURAGEMENT_MESSAGES);
    $("reward-stars-earned").textContent = "+" + starsEarned;
    $("reward-accuracy").textContent = M.displayPercent(score) + "%";
    $("reward-streak").textContent = state.streak;
    $("reward-note").textContent = weak ? "השיעור נפתח קדימה, והנושאים שהיו קשים יחזרו בחזרה היומית." : "";
    const gift = $("reward-gift-box");
    gift.textContent = "🎁"; gift.dataset.opened = "false";

    const badge = checkBadges();
    if (badge) {
      $("badge-unlock").classList.remove("hidden");
      $("badge-icon").textContent = badge.icon;
      $("badge-name").textContent = badge.name;
    } else $("badge-unlock").classList.add("hidden");
    pendingCertificate = checkCertificate();
    session = null;
    showScreen("screen-reward");
  }

  function checkBadges() {
    const done = realLessons.filter(l => (state.lessons[l.id] || {}).completed).length;
    let got = null;
    BADGES.forEach(b => {
      if (state.badgesUnlocked.includes(b.id)) return;
      const ok = b.lessonsRequired ? done >= b.lessonsRequired : realLessons.filter(l => l.level === b.level).every(l => (state.lessons[l.id] || {}).completed);
      if (ok) { state.badgesUnlocked.push(b.id); got = got || b; }
    });
    saveState();
    return got;
  }

  let pendingCertificate = null;
  function checkCertificate() {
    for (const lv of C.levels) {
      if (state.certificates[lv.id]) continue;
      const ls = realLessons.filter(l => l.level === lv.id);
      if (ls.length && ls.every(l => (state.lessons[l.id] || {}).completed)) { state.certificates[lv.id] = todayStr(); saveState(); return lv.id; }
    }
    return null;
  }

  function showCertificate(level) {
    $("cert-name").textContent = state.userName;
    $("cert-body").innerHTML = 'על השלמת כל שיעורי רמה <b dir="ltr">' + LEVEL_NAME[level] + '</b> בקורס "המסע לאנגלית", ועל ההתמדה, האומץ והרצון האמיתי ללמוד שפה חדשה.';
    showScreen("screen-certificate");
  }
  $("btn-cert-close").addEventListener("click", goHome);

  $("reward-gift-box").addEventListener("click", function () {
    if (this.dataset.opened === "true") return;
    this.dataset.opened = "true";
    this.textContent = pick(GIFTS);
    this.classList.add("opened");
    setTimeout(() => this.classList.remove("opened"), 400);
  });
  $("btn-reward-continue").addEventListener("click", () => {
    if (pendingCertificate) { const lv = pendingCertificate; pendingCertificate = null; showCertificate(lv); return; }
    goHome();
  });

  function practiceEnd() {
    const attempts = Object.values(session.first);
    const score = M.sessionScore(attempts);
    rollDaily();
    let extra = "";
    if (session.kind === "review") state.daily.reviewDone += attempts.length;
    else state.daily.practiceDone += attempts.length;
    if (session.kind === "remediation") {
      const cid = session.conceptId;
      if (score >= CFG.UNLOCK_THRESHOLD) {
        delete state.remediation[cid];
        state.mistakes[cid] = MI.clearAfterRemediation(state.mistakes[cid]);
        extra = "הנושא «" + esc(plainOf(conceptById[cid].title)) + "» הרבה יותר יציב עכשיו. 🎯";
      } else {
        state.remediation[cid] = { due: now() + 20 * 60 * 60 * 1000, created: (state.remediation[cid] || {}).created || now() };
        extra = "נחזור לנושא הזה מחר עם דוגמאות חדשות — בלי לחץ.";
      }
    }
    saveState();
    const kindTitle = { review: "סיימת את החזרה היומית! 🔁", remediation: "סיימת חיזוק ממוקד 🎯", practice: "סיימת תרגול 💪" }[session.kind];
    session = null;
    interstitial('<div class="reward-burst" aria-hidden="true">🌟</div><h2>' + kindTitle + '</h2><p class="reward-message">דיוק: <b>' + M.displayPercent(score) + "%</b> · " + attempts.length + " תרגילים</p>" + (extra ? '<p class="reward-message">' + extra + "</p>" : "") +
      '<p class="reward-note">מה שהיה קשה יחזור מוקדם יותר, ומה שכבר ידוע — יחזור בעוד כמה ימים.</p>', [{ label: "חזרה להיום", run: goHome }]);
  }

  $("btn-lesson-exit").addEventListener("click", () => {
    if (!confirm("לצאת עכשיו? מה שתרגלת נשמר, אבל השיעור לא יסומן כהושלם.")) return;
    if (session) {
      applySessionToSrs();
      addStudyTime((now() - session.start) / 1000);
      if (session.answeredCount > 0) markStudiedToday();
      saveState();
    }
    session = null;
    goHome();
  });

  /* ============================================================
     Exercise renderers
     ============================================================ */
  function header(ex, titleHtml) {
    return '<div class="q-kicker">' + esc(ex.kicker || "") + "</div>" + (titleHtml ? '<div class="q-title">' + titleHtml + "</div>" : "");
  }

  function promptBlock(ex) {
    if (ex.promptLang === "emoji") return '<div class="q-emoji" role="img" aria-label="תמונה">' + esc(ex.prompt) + "</div>";
    if (ex.promptLang === "en") return '<div class="q-word-en" dir="ltr" lang="en">' + esc(plainOf(ex.prompt)) + "</div>" + '<div class="q-audio-row">' + sayButtons(ex.audio || plainOf(ex.prompt), true) + "</div>";
    if (ex.promptLang === "he") return '<div class="q-word-he">' + rich(ex.prompt) + "</div>" + (ex.audio ? '<div class="q-audio-row">' + sayButtons(ex.audio, true) + "</div>" : "");
    return "";
  }

  function listenBlock(ex) {
    if (ex.autoplay) setTimeout(() => Audio.speak(ex.audio), 350);
    return '<div class="listen-box">' + sayButtons(ex.audio, true) + '<div class="hint-line">' + (Audio.supported ? "לחצי 🔊 לשמוע שוב, או 🐢 לשמוע לאט" : "הדפדפן הזה לא תומך בהשמעת קול — נסי דפדפן אחר (Chrome / Safari / Edge).") + "</div></div>";
  }

  const RENDERERS = {
    learn(ex) {
      lessonBody.innerHTML = '<div class="learn-card"><div class="q-kicker">' + (ex.refill ? "רגע, נזכיר את הכלל" : "לומדים") + "</div><h2>" + rich(ex.title, { noAudio: true }) + '</h2><div class="learn-expl">' + rich(ex.explanation) + "</div>" +
        (ex.examples.length ? '<h3>דוגמאות</h3><ul class="examples">' + ex.examples.map(e => "<li>" + '<span class="ex-en" dir="ltr" lang="en">' + esc(e[0]) + "</span>" + sayButtons(e[0].replace(" — ", ", ")) + '<span class="ex-he">' + esc(e[1]) + "</span></li>").join("") + "</ul>" : "") +
        (ex.commonMistakes.length ? '<h3>⚠️ טעויות נפוצות</h3><ul class="mistakes">' + ex.commonMistakes.map(m => "<li>" + rich(m) + "</li>").join("") + "</ul>" : "") + "</div>";
      setAction(ex.refill ? "הבנתי, ממשיכים (הלבבות מתמלאים) ❤️" : "הבנתי, בואי נתרגל", true, "next");
    },

    vocabIntro(ex) {
      lessonBody.innerHTML = '<div class="learn-card"><div class="q-kicker">מילים חדשות</div><h2>לפני שמתרגלים — מכירות</h2><ul class="word-list">' + ex.words.map(v =>
        '<li><span class="w-emoji" aria-hidden="true">' + (v.emoji || "•") + '</span><span class="w-main"><span class="w-en" dir="ltr" lang="en">' + esc(v.word) + "</span>" + sayButtons(v.word) + '<span class="w-he">' + esc(v.translation) + '</span><span class="w-ex"><bdi dir="ltr" lang="en">' + esc(v.exampleSentence) + "</bdi> " + sayButtons(v.exampleSentence) + "</span></span></li>").join("") + "</ul></div>";
      setAction("המשך", true, "next");
    },

    choice(ex) {
      const opts = engine.shuffledOptions(ex);
      let top = header(ex);
      if (ex.kind === "listen" || ex.kind === "lis") top += listenBlock(ex);
      else if (ex.kind === "npc") top += '<div class="npc-bubble"><span class="npc-avatar" aria-hidden="true">🧑</span><span dir="ltr" lang="en">' + esc(plainOf(ex.prompt)) + "</span>" + sayButtons(ex.audio) + "</div>" + (ex.npcHe ? '<div class="hint-line">' + esc(ex.npcHe) + "</div>" : "");
      else if (ex.kind === "fillChoice") top += '<div class="q-sentence" dir="ltr" lang="en">' + esc(ex.sentence).replace("___", '<span class="blank">____</span>') + "</div>" + (ex.he ? '<div class="hint-line">' + esc(ex.he) + "</div>" : "");
      else if (ex.kind === "err") top += '<div class="q-sentence wrong-sentence" dir="ltr" lang="en">' + esc(ex.wrongSentence) + "</div>";
      else top += promptBlock(ex);
      lessonBody.innerHTML = top + '<div class="options-grid" role="radiogroup" aria-label="אפשרויות"></div>';
      const grid = lessonBody.querySelector(".options-grid");
      let selected = null;
      opts.forEach(o => {
        const b = document.createElement("button");
        b.className = "option";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", "false");
        const en = !hasHebrew(o);
        b.innerHTML = en ? '<span class="opt-en" dir="ltr" lang="en">' + esc(o) + "</span>" : "<span>" + rich(o, { noAudio: true }) + "</span>";
        b.dataset.value = o;
        b.addEventListener("click", () => {
          if (current.answered) return;
          grid.querySelectorAll(".option").forEach(x => { x.classList.remove("selected"); x.setAttribute("aria-checked", "false"); });
          b.classList.add("selected"); b.setAttribute("aria-checked", "true");
          selected = o;
          setAction("בדיקה", true, "check");
          if (en && ex.audioOptions !== false && ex.kind !== "listen" && ex.kind !== "lis") Audio.speak(o);
        });
        grid.appendChild(b);
      });
      setAction("בדיקה", false, "check");
      current.check = () => {
        if (selected == null) return null;
        const ok = selected === ex.answer;
        grid.querySelectorAll(".option").forEach(x => {
          if (x.dataset.value === ex.answer) x.classList.add("correct");
          else if (x.dataset.value === selected) x.classList.add("wrong");
          x.disabled = true;
        });
        return { ok, given: selected };
      };
    },

    type(ex) {
      let top = header(ex);
      if (ex.kind === "listenType" || ex.kind === "lt") top += listenBlock(ex);
      else if (ex.kind === "fillType") top += '<div class="q-sentence" dir="ltr" lang="en">' + esc(ex.sentence).replace("___", '<span class="blank">____</span>') + "</div>" + (ex.he ? '<div class="hint-line">' + esc(ex.he) + "</div>" : "");
      else top += promptBlock(ex);
      lessonBody.innerHTML = top + '<label class="sr-only" for="type-input">התשובה שלך באנגלית</label><input id="type-input" class="type-answer-input" type="text" dir="ltr" lang="en" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="type here..."><div class="hint-line" id="type-hint">לא צריך אותיות גדולות או סימני פיסוק — רק המילים.</div>';
      const input = $("type-input");
      input.addEventListener("input", () => setAction("בדיקה", input.value.trim().length > 0, "check"));
      input.addEventListener("keydown", e => { if (e.key === "Enter" && input.value.trim()) { e.preventDefault(); actionBtn.click(); } });
      setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { /* */ } }, 120);
      setAction("בדיקה", false, "check");
      current.check = () => {
        const r = N.checkTyped(input.value, ex.accept, { strictForm: ex.strictForm });
        input.disabled = true;
        input.classList.add(r.ok ? "is-good" : "is-bad");
        return { ok: r.ok, near: r.near, given: input.value };
      };
    },

    build(ex) {
      lessonBody.innerHTML = header(ex) + (ex.prompt ? '<div class="q-word-he">' + esc(ex.prompt) + "</div>" : "") +
        '<div class="build-answer" dir="ltr" lang="en" aria-label="המשפט שלך" aria-live="polite"></div><div class="build-bank" dir="ltr" lang="en" aria-label="מילים לבחירה"></div><div class="hint-line">הקישי על מילה כדי להוסיף אותה. הקשה על מילה במשפט מחזירה אותה.</div>';
      const ans = lessonBody.querySelector(".build-answer"), bank = lessonBody.querySelector(".build-bank");
      const placed = [];
      ex.chunks.forEach((ch, i) => {
        const b = document.createElement("button");
        b.className = "chunk"; b.textContent = ch; b.dataset.i = i;
        b.setAttribute("aria-label", "הוספה: " + ch);
        b.addEventListener("click", () => {
          if (current.answered) return;
          if (b.parentNode === bank) { ans.appendChild(b); placed.push(b); b.setAttribute("aria-label", "הסרה: " + ch); Audio.speak(ch); }
          else { bank.appendChild(b); placed.splice(placed.indexOf(b), 1); b.setAttribute("aria-label", "הוספה: " + ch); }
          setAction("בדיקה", placed.length > 0, "check");
        });
        bank.appendChild(b);
      });
      setAction("בדיקה", false, "check");
      current.check = () => {
        const words = placed.map(b => b.textContent);
        const r = N.checkChunks(words, ex.accept);
        ans.classList.add(r.ok ? "is-good" : "is-bad");
        lessonBody.querySelectorAll(".chunk").forEach(b => { b.disabled = true; });
        return { ok: r.ok, given: words.join(" ") };
      };
    },

    match(ex) {
      lessonBody.innerHTML = header(ex, "הקישי על מילה באנגלית ואז על התרגום שלה") + '<div class="match-grid"></div>';
      const grid = lessonBody.querySelector(".match-grid");
      const en = engine.shuffle(ex.pairs.map(p => ({ text: p[0], key: p[0], type: "en" })));
      const he = engine.shuffle(ex.pairs.map(p => ({ text: p[1], key: p[0], type: "he" })));
      let selEn = null, matched = 0, mistakes = 0;
      const cell = item => {
        const b = document.createElement("button");
        b.className = "match-item" + (item.type === "en" ? " en" : "");
        if (item.type === "en") { b.dir = "ltr"; b.lang = "en"; }
        b.textContent = item.text;
        b.dataset.key = item.key;
        b.addEventListener("click", () => {
          if (b.classList.contains("matched") || current.answered) return;
          if (item.type === "en") {
            grid.querySelectorAll(".match-item.en").forEach(c => c.classList.remove("selected"));
            b.classList.add("selected"); selEn = b; Audio.speak(item.text);
            return;
          }
          if (!selEn) { toast("קודם בוחרים מילה באנגלית 🙂", 1800); return; }
          if (selEn.dataset.key === b.dataset.key) {
            selEn.classList.add("matched"); b.classList.add("matched"); selEn.classList.remove("selected"); selEn = null; matched++;
            if (matched === ex.pairs.length) { current.answered = false; const r = { ok: mistakes <= 1 }; resolve(r); }
          } else {
            mistakes++;
            b.classList.add("wrong-flash"); setTimeout(() => b.classList.remove("wrong-flash"), 500);
          }
        });
        return b;
      };
      for (let i = 0; i < ex.pairs.length; i++) { grid.appendChild(cell(he[i])); grid.appendChild(cell(en[i])); }
      setAction("התאימי את כל הזוגות", false, "check");
      current.check = () => null;
    },

    speak(ex) {
      lessonBody.innerHTML = header(ex) + '<div class="q-word-en" dir="ltr" lang="en">' + esc(plainOf(ex.prompt)) + '</div><div class="q-audio-row">' + sayButtons(ex.audio, true) + "</div>" + (ex.he ? '<div class="hint-line">' + esc(ex.he) + "</div>" : "") +
        '<div class="speak-box">' + (STT.supported ? '<button class="mic-btn" id="mic-btn" aria-label="לחצי ודברי">🎙️</button><div class="speak-status" id="speak-status" aria-live="polite">הקשיבי, ואז לחצי על המיקרופון ואמרי את המשפט.</div>'
          : '<div class="speak-status">הדפדפן הזה לא תומך בזיהוי דיבור (עובד בדרך כלל ב-Chrome וב-Edge). אמרי את המשפט בקול ולחצי «אמרתי».</div>') +
        '<div class="speak-actions"><button class="btn btn-ghost small" id="self-mark">אמרתי את זה ✔</button><button class="btn btn-ghost small" id="skip-speak">דלגי הפעם</button></div>' +
        '<p class="speak-note">הבדיקה בודקת רק אם המילים הנכונות נאמרו — לא מדרגת מבטא.</p></div>';
      setAction("אפשר גם לדלג", true, "check");
      current.check = () => ({ skipped: true });
      $("self-mark").addEventListener("click", () => resolve({ ok: true, selfMarked: true }));
      $("skip-speak").addEventListener("click", () => resolve({ skipped: true }));
      if (!STT.supported) return;
      let tries = 0, listening = null;
      const status = $("speak-status"), mic = $("mic-btn");
      mic.addEventListener("click", () => {
        if (listening) { listening.stop(); return; }
        window.speechSynthesis && window.speechSynthesis.cancel();
        mic.classList.add("listening"); status.textContent = "מקשיבה... 👂";
        listening = STT.listen({
          onResult: alts => {
            listening = null; mic.classList.remove("listening"); tries++;
            const r = N.matchSpeech(alts, ex.accept);
            if (r.ok) { status.innerHTML = "שמעתי: " + enSpan(alts[0]) + " ✅"; resolve({ ok: true, given: alts[0] }); return; }
            status.innerHTML = "שמעתי: " + enSpan(alts[0] || "…") + (r.missing.length ? "<br>חסר: " + enSpan(r.missing.join(", ")) : "") + "<br>נסי שוב" + (tries >= 2 ? " — או סמני ידנית אם אמרת נכון (זיהוי דיבור לא תמיד מדויק)." : ".");
          },
          onError: code => { listening = null; mic.classList.remove("listening"); status.textContent = STT_ERRORS[code] || "משהו השתבש. נסי שוב או סמני ידנית."; },
        });
      });
    },
  };

  /* ============================================================
     Reading — free articles with tap-to-hear sentences
     ============================================================ */
  function goReading() {
    const list = $("reading-list");
    list.innerHTML = "";
    ARTICLES.forEach(a => {
      const read = state.articlesRead[a.id];
      const b = document.createElement("button");
      b.className = "reading-item" + (read ? " done" : "");
      b.innerHTML = '<span class="reading-icon" aria-hidden="true">' + a.emoji + '</span><span class="plan-text"><b>' + esc(a.title) + "</b><span>" +
        LEVEL_NAME[a.level] + " · כ-" + a.minutes + ' דקות' + (read ? " · נקרא ✓" : "") + "</span></span>";
      b.addEventListener("click", () => openArticle(a));
      list.appendChild(b);
    });
    showScreen("screen-reading");
  }

  let article = null;
  function openArticle(a) {
    article = { a, start: now() };
    $("article-title").textContent = a.emoji + " " + a.title;
    const body = $("article-body");
    body.innerHTML = a.paragraphs.map(p =>
      '<p class="article-para">' + p.map(([en, he]) =>
        '<span class="article-sentence"><button type="button" class="en en-say article-en" dir="ltr" lang="en" data-say="' + esc(en) + '" aria-label="השמעה: ' + esc(en) + '">' + esc(en) + '</button><span class="article-he">' + esc(he) + "</span></span>"
      ).join(" ") + "</p>"
    ).join("");
    showScreen("screen-article");
  }

  function finishArticle() {
    if (!article) return;
    const a = article.a;
    const already = !!state.articlesRead[a.id];
    state.articlesRead[a.id] = { at: now() };
    addStudyTime((now() - article.start) / 1000);
    markStudiedToday();
    const t = now();
    (a.vocab || []).forEach(vid => {
      if (!vocabById[vid]) return;
      const key = "v:" + vid;
      const card = state.srs[key] || SRS.newCard(key, t);
      state.srs[key] = SRS.scheduleReview(card, true, t);
    });
    saveState();
    article = null;
    toast(already ? "מעולה, עוד סיבוב קריאה! 📖" : "כל הכבוד! המילים החדשות נכנסו לחזרות שלך 🌟", 3500);
    goReading();
  }
  $("btn-article-done").addEventListener("click", finishArticle);
  $("btn-article-exit").addEventListener("click", () => { article = null; goReading(); });

  /* ============================================================
     Scripted conversations
     ============================================================ */
  function goConvos() {
    const list = $("convo-list");
    list.innerHTML = "";
    const goals = state.onboarding.goals || [];
    C.conversations.slice().sort((a, b) => {
      const ua = a.requires.every(r => UN.isSatisfied(r, state)) ? 0 : 1, ub = b.requires.every(r => UN.isSatisfied(r, state)) ? 0 : 1;
      return ua - ub;
    }).forEach(s => {
      const open = s.requires.every(r => UN.isSatisfied(r, state));
      const h = state.conversations[s.id] || {};
      const b = document.createElement("button");
      b.className = "convo-item" + (open ? "" : " locked");
      const forYou = open && s.goals.some(g => goals.includes(g));
      b.innerHTML = '<span class="convo-icon" aria-hidden="true">' + s.icon + '</span><span class="plan-text"><b>' + esc(s.title) + (forYou ? ' <span class="tag">מתאים למטרות שלך</span>' : "") + "</b><span>" +
        (open ? (h.runs ? "תרגלת " + h.runs + " פעמים" : "חדש · רמה " + LEVEL_NAME[s.level]) : "🔒 נפתח אחרי: " + esc(s.requires.filter(r => !UN.isSatisfied(r, state)).map(r => plainOf(lessonById[r].title)).join(", "))) + "</span></span>";
      b.addEventListener("click", () => (open ? startConversation(s) : toast("🔒 השיחה הזו משתמשת בחומר משיעורים שעוד לא סיימת — כך היא אף פעם לא מעל הרמה שלך.", 4500)));
      list.appendChild(b);
    });
    showScreen("screen-convos");
  }

  let chat = null;
  function startConversation(s) {
    chat = { s, node: s.start, mistakes: [], start: now(), answered: 0 };
    session = { touched: {} };
    $("chat-title").textContent = s.icon + " " + s.title;
    $("chat-intro").innerHTML = esc(s.intro) + ' <span class="tag">תרגול מובנה · את בתפקיד דנה</span>';
    $("chat-log").innerHTML = "";
    $("chat-feedback").classList.add("hidden");
    showScreen("screen-chat");
    chatNode();
  }

  function chatBubble(who, en, he) {
    const d = document.createElement("div");
    d.className = "bubble " + who;
    d.innerHTML = '<span dir="ltr" lang="en">' + esc(en) + "</span>" + sayButtons(en) + (he ? '<details class="bubble-he"><summary>תרגום</summary>' + esc(he) + "</details>" : "");
    $("chat-log").appendChild(d);
    d.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function chatNode() {
    const n = chat.s.nodes[chat.node];
    chatBubble("npc", n.npc, n.he);
    if (!/^\(/.test(n.npc)) Audio.speak(n.npc);
    const box = $("chat-choices");
    box.innerHTML = "";
    if (n.end) { setTimeout(endConversation, 900); return; }
    engine.shuffle(n.choices).forEach(c => {
      const b = document.createElement("button");
      b.className = "option";
      b.innerHTML = '<span class="opt-en" dir="ltr" lang="en">' + esc(c.en) + "</span>";
      b.addEventListener("click", () => chooseReply(c, b, n));
      box.appendChild(b);
    });
    if (STT.supported) {
      const mic = document.createElement("button");
      mic.className = "btn btn-ghost small"; mic.textContent = "🎙️ או אמרי את התשובה בקול";
      mic.addEventListener("click", () => {
        mic.textContent = "מקשיבה... 👂";
        STT.listen({
          onResult: alts => {
            let best = null, bestScore = 0;
            n.choices.forEach(c => { const r = N.matchSpeech(alts, [c.en]); if (r.score > bestScore) { best = c; bestScore = r.score; } });
            if (best && bestScore >= 0.6) { const btn = Array.from(box.querySelectorAll(".option")).find(x => x.textContent === best.en); chooseReply(best, btn, n); }
            else { mic.textContent = "🎙️ לא זיהיתי — נסי שוב או בחרי"; }
          },
          onError: code => { mic.textContent = "🎙️ " + (STT_ERRORS[code] || "נסי שוב"); },
        });
      });
      box.appendChild(mic);
    }
  }

  function chooseReply(c, btn, n) {
    const fb = $("chat-feedback");
    const concept = c.bad ? c.concept : (n.choices.find(x => x.bad) || {}).concept;
    const ex = { concept: concept || null, vocab: [], skills: ["reading"], w: M.EXERCISE_WEIGHTS.recognition, answer: (n.choices.find(x => !x.bad) || {}).en, prompt: n.npc };
    chat.answered++;
    if (c.bad) {
      if (btn) { btn.classList.add("wrong"); btn.disabled = true; }
      const better = n.choices.find(x => !x.bad);
      chat.mistakes.push({ npc: n.npc, picked: c.en, better: better.en, why: c.why, concept: c.concept });
      recordAttempt(ex, false, { given: c.en });
      fb.className = "feedback-banner bad";
      fb.innerHTML = '<div class="feedback-icon" aria-hidden="true">💡</div><div class="feedback-text"><div class="feedback-title">כמעט — נסי תשובה אחרת</div><div class="feedback-sub">' + rich(c.why) + "</div></div>";
      return;
    }
    recordAttempt(ex, true);
    fb.className = "feedback-banner hidden";
    chatBubble("me", c.en);
    $("chat-choices").innerHTML = "";
    chat.node = c.next;
    setTimeout(chatNode, 700);
  }

  function endConversation() {
    const s = chat.s;
    applySessionToSrs();
    session = null;
    addStudyTime((now() - chat.start) / 1000);
    markStudiedToday();
    rollDaily();
    state.daily.convoDone++;
    const h = state.conversations[s.id] || { runs: 0, history: [] };
    h.runs++; h.lastAt = now(); h.lastMistakes = chat.mistakes.length;
    h.history = (h.history || []).concat([{ at: now(), mistakes: chat.mistakes }]).slice(-5);
    state.conversations[s.id] = h;
    saveState();
    const review = chat.mistakes.length
      ? '<h3>מה אפשר לשפר</h3><ul class="convo-review">' + chat.mistakes.map(m =>
        "<li><div><b>מה בחרת:</b> " + enSpan(m.picked) + "</div><div><b>בחירה טובה יותר:</b> " + enSpan(m.better) + sayButtons(m.better) + "</div><div><b>למה:</b> " + rich(m.why) + (conceptById[m.concept] ? '<div class="concept-link">נושא: ' + rich(conceptById[m.concept].title, { noAudio: true }) + "</div>" : "") + "</li>").join("") + "</ul>"
      : '<p class="reward-message">בלי אף טעות! 🌟</p>';
    const weak = Array.from(new Set(chat.mistakes.map(m => m.concept))).find(c => conceptById[c]);
    const buttons = [{ label: "חזרה לשיחות", run: goConvos }, { label: "לשיחה שוב", run: () => startConversation(s) }];
    if (weak) buttons.unshift({ label: "לתרגל את «" + plainOf(conceptById[weak].title) + "»", run: () => startRemediation(weak) });
    interstitial('<div class="reward-burst" aria-hidden="true">💬</div><h2>השיחה הסתיימה!</h2>' + review, buttons);
  }

  $("btn-chat-exit").addEventListener("click", () => {
    if (!confirm("לצאת מהשיחה?")) return;
    applySessionToSrs();
    session = null;
    if (chat) {
      addStudyTime((now() - chat.start) / 1000);
      markStudiedToday();
    }
    saveState();
    goConvos();
  });

  /* ============================================================
     Progress
     ============================================================ */
  function skillWord(p) { return p >= 80 ? "חזקה" : p >= 50 ? "מתקדמת" : p >= 20 ? "בדרך" : "בהתחלה"; }

  function goProgress() {
    const lv = currentLevel();
    const skills = M.SKILLS.map(s => ({ s, p: M.displayPercent(M.computeMastery((state.skills[s] || {}).h, now())), n: ((state.skills[s] || {}).h || []).length }));
    const words = C.vocabulary.filter(v => masteryOf("v:" + v.id) >= CFG.LEARNED_THRESHOLD).length;
    const seenWords = C.vocabulary.filter(v => histOf("v:" + v.id).length).length;
    const mins = Math.round(state.time.totalSeconds / 60);
    const timeStr = mins < 60 ? mins + " דקות" : (Math.round(mins / 6) / 10) + " שעות";
    const certs = Object.keys(state.certificates);
    const levelRows = C.levels.map(l => { const ls = realLessons.filter(x => x.level === l.id); const done = ls.filter(x => (state.lessons[x.id] || {}).completed).length; const skipped = ls.filter(x => !(state.lessons[x.id] || {}).completed && (state.lessons[x.id] || {}).placedOut).length;
      return '<div class="lvl-row"><span dir="ltr">' + l.title + '</span><span class="progress-bar-outer"><span class="progress-bar-inner" style="width:' + (ls.length ? Math.round((done / ls.length) * 100) : 0) + '%"></span></span><span>' + done + "/" + ls.length + (skipped ? " · דילגת על " + skipped : "") + "</span></div>"; }).join("");
    $("progress-body").innerHTML =
      '<div class="cefr-card"><div class="cefr-label">הרמה שלך עכשיו</div><div class="cefr-level" dir="ltr">' + LEVEL_NAME[lv] + "</div>" + levelRows + "</div>" +
      '<div class="stats-grid"><div><b>' + state.streak + "</b><span>ימי רצף 🔥</span></div><div><b>" + timeStr + "</b><span>זמן למידה ⏱️</span></div><div><b>" + words + "</b><span>מילים שלמדת 📚</span></div><div><b>" + Object.values(state.conversations).reduce((s, c) => s + (c.runs || 0), 0) + "</b><span>שיחות 💬</span></div></div>" +
      '<p class="hint-line">«מילים שלמדת» = מילים שענית עליהן נכון כמה פעמים, גם בכתיבה (מתוך ' + seenWords + " שפגשת).</p>" +
      '<h2 class="sec-title">מיומנויות</h2><div class="skills">' + skills.map(k => '<div class="skill-row"><span class="skill-name">' + SKILL_NAME[k.s] + '</span><span class="progress-bar-outer" role="img" aria-label="' + SKILL_NAME[k.s] + " " + k.p + '%"><span class="progress-bar-inner" style="width:' + k.p + '%"></span></span><span class="skill-val">' + (k.n ? k.p + "% · " + skillWord(k.p) : "עוד לא תרגלת") + "</span></div>").join("") + "</div>" +
      '<p class="hint-line">כל מיומנות נמדדת בנפרד: תשובות אחרונות שוקלות יותר, כתיבה ודיבור שוקלים יותר מבחירה מרשימה, ומה שלא חזרת עליו מזמן יורד קצת.</p>' +
      (Object.keys(state.remediation).length ? '<h2 class="sec-title">נושאים לחיזוק</h2><div class="rem-list">' + Object.keys(state.remediation).filter(c => conceptById[c]).map(c => '<button class="chip" data-rem="' + c + '">🎯 ' + rich(conceptById[c].title, { noAudio: true }) + "</button>").join("") + "</div>" : "") +
      (certs.length ? '<h2 class="sec-title">תעודות</h2><div class="rem-list">' + certs.map(c => '<button class="chip" data-cert="' + c + '">🏆 ' + LEVEL_NAME[c] + "</button>").join("") + "</div>" : "") +
      '<h2 class="sec-title">עיטורים</h2><div class="badges">' + BADGES.map(b => '<span class="badge' + (state.badgesUnlocked.includes(b.id) ? " on" : "") + '" title="' + esc(b.name) + '"><span aria-hidden="true">' + b.icon + "</span>" + esc(b.name) + "</span>").join("") + "</div>" +
      '<h2 class="sec-title">הגדרות</h2><div class="settings">' +
      '<label class="set-row"><span>השמעה איטית כברירת מחדל 🐢</span><input type="checkbox" id="set-slow"' + (state.settings.slowAudio ? " checked" : "") + "></label>" +
      '<label class="set-row"><span>זמן יומי</span><select id="set-min">' + [10, 20, 30, 45].map(m => '<option value="' + m + '"' + (m === state.onboarding.dailyMinutes ? " selected" : "") + ">" + m + " דקות</option>").join("") + "</select></label>" +
      '<button class="btn btn-ghost" id="set-onb">לעדכן רמה / מטרות</button>' +
      '<button class="btn btn-ghost danger" id="set-reset">איפוס כל ההתקדמות</button>' +
      '<p class="hint-line">ההתקדמות נשמרת רק בדפדפן הזה (אין חשבון או שרת), ולכן לא עוברת בין מכשירים.</p></div>';
    $("set-slow").addEventListener("change", e => { state.settings.slowAudio = e.target.checked; saveState(); });
    $("set-min").addEventListener("change", e => { state.onboarding.dailyMinutes = Number(e.target.value); saveState(); });
    $("set-onb").addEventListener("click", startOnboarding);
    $("set-reset").addEventListener("click", () => { if (confirm("לאפס את כל ההתקדמות? אי אפשר לבטל.")) { state = defaultState(); saveState(); initWelcomeScreen(); showScreen("screen-welcome"); } });
    $("progress-body").querySelectorAll("[data-rem]").forEach(b => b.addEventListener("click", () => startRemediation(b.dataset.rem)));
    $("progress-body").querySelectorAll("[data-cert]").forEach(b => b.addEventListener("click", () => showCertificate(b.dataset.cert)));
    showScreen("screen-progress");
  }

  /* ============================================================
     Boot
     ============================================================ */
  initWelcomeScreen();
  showScreen("screen-welcome");
  // debugging aid (inspect from the browser console)
  window.__EJ_APP__ = { get state() { return state; }, get current() { return current; }, get session() { return session; }, lessonMastery, nextLesson, goHome, goMap, goProgress, goConvos, startLesson, startReview, startConversation };
})();
