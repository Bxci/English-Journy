/* ============================================================
   המסע לאנגלית — מנוע הקורס
   ============================================================ */

const STORAGE_KEY = "english-journey-state-v1";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    userName: "",
    streak: 0,
    lastPlayedDate: null,
    stars: 0,
    giftsOpened: 0,
    badgesUnlocked: [],
    units: COURSE_UNITS.reduce((acc, u) => {
      acc[u.id] = { completed: false, bestAccuracy: 0 };
      return acc;
    }, {}),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // מיזוג בטוח למקרה שנוספו יחידות חדשות מאז השמירה האחרונה
    const base = defaultState();
    base.units = { ...base.units, ...(parsed.units || {}) };
    return { ...base, ...parsed, units: base.units };
  } catch (e) {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* אחסון לא זמין - ממשיכים בלי לשמור */ }
}

let state = loadState() || defaultState();

/* ---------------- ניגון קול (Text To Speech) ---------------- */
function speakEnglish(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  } catch (e) { /* אין תמיכה בדפדפן - מתעלמים בשקט */ }
}

/* ---------------- עזרי אקראיות ---------------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sample(arr, n) { return shuffle(arr).slice(0, n); }

/* ---------------- בניית תרגילים ליחידה ---------------- */
function buildExercisesForUnit(unit) {
  const vocab = unit.vocab;
  const exercises = [];

  vocab.forEach((item, idx) => {
    const distractors = sample(vocab.filter(v => v.en !== item.en), Math.min(3, vocab.length - 1));

    // 1) בחירה: מציגים אנגלית, בוחרים תרגום עברי נכון
    exercises.push({
      type: "choice",
      kicker: "בחר/י את התרגום הנכון",
      prompt: item.en,
      correct: item.he,
      options: shuffle([item.he, ...distractors.map(d => d.he)]),
      isPromptEnglish: true,
    });

    // 2) בחירה הפוכה: מציגים עברית, בוחרים את המילה באנגלית + כפתור האזנה
    exercises.push({
      type: "choice",
      kicker: "איך אומרים את זה באנגלית?",
      prompt: item.he,
      correct: item.en,
      options: shuffle([item.en, ...distractors.map(d => d.en)]),
      isPromptEnglish: false,
      audioWord: item.en,
    });
  });

  // 3) תרגיל התאמה אחד ליחידה (4 זוגות אקראיים)
  const matchPairs = sample(vocab, Math.min(4, vocab.length));
  exercises.push({
    type: "match",
    kicker: "התאימו בין המילים",
    pairs: matchPairs,
  });

  // 4) תרגילי הקלדה - כמה מילים אקראיות מהיחידה
  sample(vocab, Math.min(3, vocab.length)).forEach(item => {
    exercises.push({
      type: "type",
      kicker: "השלימו: איך כותבים את זה באנגלית?",
      prompt: item.he,
      correct: item.en,
      audioWord: item.en,
    });
  });

  return shuffle(exercises).sort(() => 0); // סדר מעורב אך נשמור match לא ראשון תמיד
}

/* ============================================================
   ניהול מסכים
   ============================================================ */
const screens = {};
document.querySelectorAll(".screen").forEach(s => screens[s.id] = s);

function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[id].classList.add("active");
  window.scrollTo(0, 0);
}

/* ============================================================
   מסך פתיחה
   ============================================================ */
const nameEntryEl = document.getElementById("name-entry");
const returningUserEl = document.getElementById("returning-user");
const userNameInput = document.getElementById("user-name");
const returningNameLabel = document.getElementById("returning-name");

function initWelcomeScreen() {
  if (state.userName) {
    nameEntryEl.classList.add("hidden");
    returningUserEl.classList.remove("hidden");
    returningNameLabel.textContent = state.userName;
  } else {
    nameEntryEl.classList.remove("hidden");
    returningUserEl.classList.add("hidden");
  }
}

document.getElementById("btn-start").addEventListener("click", () => {
  const name = userNameInput.value.trim();
  if (!name) {
    userNameInput.style.borderColor = "var(--bad)";
    userNameInput.placeholder = "צריך להקליד שם כדי להתחיל :)";
    return;
  }
  state.userName = name;
  saveState();
  goToMap();
});

document.getElementById("btn-continue").addEventListener("click", goToMap);

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("לאפס את כל ההתקדמות ולהתחיל קורס חדש?")) {
    state = defaultState();
    saveState();
    initWelcomeScreen();
  }
});

/* ============================================================
   מסך מפה
   ============================================================ */
const unitsListEl = document.getElementById("units-list");
const mapUsernameLabel = document.getElementById("map-username-label");

function applyStreakOnEnter() {
  const today = todayStr();
  if (state.lastPlayedDate === today) return; // כבר עודכן היום
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  if (state.lastPlayedDate === yesterday) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.lastPlayedDate = today;
  saveState();
}

function goToMap() {
  applyStreakOnEnter();
  renderMap();
  showScreen("screen-map");
}

function renderMap() {
  mapUsernameLabel.textContent = state.userName;
  document.getElementById("stat-streak").textContent = state.streak;
  document.getElementById("stat-stars").textContent = state.stars;
  document.getElementById("stat-gifts").textContent = state.giftsOpened;

  const total = COURSE_UNITS.length;
  const completedCount = COURSE_UNITS.filter(u => state.units[u.id].completed).length;
  const pct = Math.round((completedCount / total) * 100);
  document.getElementById("overall-progress-pct").textContent = pct + "%";
  document.getElementById("overall-progress-bar").style.width = pct + "%";

  unitsListEl.innerHTML = "";
  COURSE_UNITS.forEach((unit, index) => {
    const prevCompleted = index === 0 || state.units[COURSE_UNITS[index - 1].id].completed;
    const unitState = state.units[unit.id];
    const unlocked = prevCompleted;

    const card = document.createElement("div");
    card.className = "unit-card" + (unlocked ? " unlocked" : "") + (unitState.completed ? " completed" : "");

    card.innerHTML = `
      <div class="unit-icon">${unit.icon}</div>
      <div class="unit-info">
        <div class="unit-title">${unit.title}</div>
        <div class="unit-sub">${unit.subtitle}</div>
        ${unitState.completed ? `<div class="unit-mini-progress"><div class="unit-mini-progress-inner" style="width:100%"></div></div>` : ""}
      </div>
      ${unitState.completed ? '<div class="unit-check">✔️</div>' : (unlocked ? '' : '<div class="unit-lock">🔒</div>')}
    `;

    if (unlocked) {
      card.addEventListener("click", () => startLesson(unit));
    }
    unitsListEl.appendChild(card);
  });

  if (completedCount === total) {
    setTimeout(() => showCertificate(), 300);
  }
}

document.getElementById("btn-map-home").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   מנוע השיעור
   ============================================================ */
let currentUnit = null;
let currentExercises = [];
let currentIndex = 0;
let hearts = 3;
let correctCount = 0;
let answered = false;

const lessonBodyEl = document.getElementById("lesson-body");
const lessonProgressBar = document.getElementById("lesson-progress-bar");
const lessonHeartsEl = document.getElementById("lesson-hearts");
const btnLessonAction = document.getElementById("btn-lesson-action");
const feedbackBanner = document.getElementById("feedback-banner");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackSub = document.getElementById("feedback-sub");

let pendingCheck = null; // פונקציה שתיבדק בלחיצה על "בדיקה"

function startLesson(unit) {
  currentUnit = unit;
  currentExercises = buildExercisesForUnit(unit);
  currentIndex = 0;
  hearts = 3;
  correctCount = 0;
  answered = false;
  updateHeartsUI();
  showScreen("screen-lesson");
  renderExercise();
}

function updateHeartsUI() {
  lessonHeartsEl.textContent = "❤️".repeat(hearts) + "🤍".repeat(3 - hearts);
}

function updateLessonProgress() {
  const pct = Math.max(4, Math.round((currentIndex / currentExercises.length) * 100));
  lessonProgressBar.style.width = pct + "%";
}

document.getElementById("btn-lesson-exit").addEventListener("click", () => {
  if (confirm("לצאת מהשיעור? ההתקדמות בשיעור הזה לא תישמר.")) {
    goToMap();
  }
});

function renderExercise() {
  answered = false;
  feedbackBanner.classList.add("hidden");
  updateLessonProgress();

  const ex = currentExercises[currentIndex];
  lessonBodyEl.innerHTML = "";

  if (ex.type === "choice") renderChoiceExercise(ex);
  else if (ex.type === "match") renderMatchExercise(ex);
  else if (ex.type === "type") renderTypeExercise(ex);

  btnLessonAction.textContent = "בדיקה";
  btnLessonAction.disabled = true;
}

function renderChoiceExercise(ex) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="q-kicker">${ex.kicker}</div>
    <div class="q-title">${ex.isPromptEnglish ? "מה המשמעות של המילה הזו?" : "בחר/י את המילה הנכונה באנגלית"}</div>
    <div class="q-word-en" style="${ex.isPromptEnglish ? "direction:ltr" : "direction:rtl; color:var(--ink); font-size:24px;"}">${ex.prompt}</div>
  `;
  if (ex.audioWord) {
    const audioBtn = document.createElement("button");
    audioBtn.className = "q-audio-btn";
    audioBtn.textContent = "🔊";
    audioBtn.addEventListener("click", () => speakEnglish(ex.audioWord));
    wrap.appendChild(audioBtn);
  }

  const grid = document.createElement("div");
  grid.className = "options-grid";
  let selectedBtn = null;

  ex.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    const isEnglish = /[A-Za-z]/.test(opt);
    btn.innerHTML = isEnglish ? `<span class="opt-en">${opt}</span>` : `<span>${opt}</span>`;
    btn.addEventListener("click", () => {
      if (answered) return;
      grid.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
      btn.classList.add("selected");
      selectedBtn = btn;
      btnLessonAction.disabled = false;
      if (isEnglish) speakEnglish(opt);
    });
    grid.appendChild(btn);
  });

  wrap.appendChild(grid);
  lessonBodyEl.appendChild(wrap);

  pendingCheck = () => {
    const isCorrect = selectedBtn.textContent.trim() === ex.correct.trim();
    grid.querySelectorAll(".option").forEach(o => {
      const txt = o.textContent.trim();
      if (txt === ex.correct.trim()) o.classList.add("correct");
      else if (o === selectedBtn) o.classList.add("wrong");
      o.disabled = true;
    });
    return isCorrect;
  };
}

function renderMatchExercise(ex) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="q-kicker">${ex.kicker}</div><div class="q-title">לחצו על מילה באנגלית ואז על התרגום המתאים לה בעברית</div>`;

  const enItems = shuffle(ex.pairs.map(p => ({ text: p.en, key: p.en, type: "en" })));
  const heItems = shuffle(ex.pairs.map(p => ({ text: p.he, key: p.en, type: "he" })));

  const grid = document.createElement("div");
  grid.className = "match-grid";

  let selectedEn = null;
  let matchedCount = 0;

  function makeCell(item) {
    const cell = document.createElement("div");
    cell.className = "match-item" + (item.type === "en" ? " en" : "");
    cell.textContent = item.text;
    cell.dataset.key = item.key;
    cell.dataset.type = item.type;

    cell.addEventListener("click", () => {
      if (cell.classList.contains("matched")) return;

      if (item.type === "en") {
        grid.querySelectorAll(".match-item.en").forEach(c => c.classList.remove("selected"));
        cell.classList.add("selected");
        selectedEn = cell;
        speakEnglish(item.text);
      } else {
        if (!selectedEn) return;
        if (selectedEn.dataset.key === cell.dataset.key) {
          selectedEn.classList.add("matched");
          cell.classList.add("matched");
          selectedEn.classList.remove("selected");
          selectedEn = null;
          matchedCount++;
          if (matchedCount === ex.pairs.length) {
            btnLessonAction.disabled = false;
          }
        } else {
          cell.classList.add("wrong-flash");
          setTimeout(() => cell.classList.remove("wrong-flash"), 500);
        }
      }
    });
    return cell;
  }

  // מציגים בשתי עמודות: ימין = עברית, שמאל = אנגלית (סדר תצוגה RTL)
  const colEn = document.createElement("div");
  const colHe = document.createElement("div");
  enItems.forEach(i => colEn.appendChild(makeCell(i)));
  heItems.forEach(i => colHe.appendChild(makeCell(i)));
  // סידור לרשת: נשלב לפי שורות
  grid.style.display = "grid";
  for (let i = 0; i < ex.pairs.length; i++) {
    grid.appendChild(colHe.children[0]);
    grid.appendChild(colEn.children[0]);
  }

  wrap.appendChild(grid);
  lessonBodyEl.appendChild(wrap);

  pendingCheck = () => matchedCount === ex.pairs.length;
}

function renderTypeExercise(ex) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="q-kicker">${ex.kicker}</div>
    <div class="q-title">איך אומרים באנגלית:</div>
    <div class="q-word-en" style="direction:rtl; color:var(--ink); font-size:24px;">${ex.prompt}</div>
  `;
  const audioBtn = document.createElement("button");
  audioBtn.className = "q-audio-btn";
  audioBtn.textContent = "🔊";
  audioBtn.addEventListener("click", () => speakEnglish(ex.audioWord));
  wrap.appendChild(audioBtn);

  const input = document.createElement("input");
  input.className = "type-answer-input";
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.placeholder = "type here...";
  input.addEventListener("input", () => {
    btnLessonAction.disabled = input.value.trim().length === 0;
  });
  wrap.appendChild(input);

  const hint = document.createElement("div");
  hint.className = "hint-line";
  hint.textContent = "טיפ: אין צורך ברישיות - כותבים איך שנשמע נכון";
  wrap.appendChild(hint);

  lessonBodyEl.appendChild(wrap);
  setTimeout(() => input.focus(), 100);

  pendingCheck = () => {
    const given = input.value.trim().toLowerCase().replace(/[.,!?']/g, "");
    const correct = ex.correct.trim().toLowerCase().replace(/[.,!?']/g, "");
    const isCorrect = given === correct;
    input.disabled = true;
    input.style.borderColor = isCorrect ? "var(--good)" : "var(--bad)";
    if (!isCorrect) {
      hint.textContent = "התשובה הנכונה: " + ex.correct;
      hint.style.color = "var(--bad)";
      hint.style.fontWeight = "700";
    }
    return isCorrect;
  };
}

btnLessonAction.addEventListener("click", () => {
  if (!answered) {
    const isCorrect = pendingCheck ? pendingCheck() : false;
    answered = true;
    showFeedback(isCorrect);
    if (isCorrect) {
      correctCount++;
    } else {
      hearts--;
      updateHeartsUI();
    }
    btnLessonAction.textContent = "המשך";
    btnLessonAction.disabled = false;
  } else {
    goNext();
  }
});

function showFeedback(isCorrect) {
  feedbackBanner.classList.remove("hidden", "good", "bad");
  feedbackBanner.classList.add(isCorrect ? "good" : "bad");
  feedbackIcon.textContent = isCorrect ? "✅" : "❌";
  feedbackTitle.textContent = isCorrect ? pick(["כל הכבוד!", "מעולה!", "בדיוק!", "יפה מאוד!"]) : "לא נורא, ממשיכים";
  feedbackSub.textContent = isCorrect ? "" : "טעויות הן חלק מהלמידה - תראי איך זה נכון ותמשיכי.";
}

function goNext() {
  if (hearts <= 0) {
    failLesson();
    return;
  }
  currentIndex++;
  if (currentIndex >= currentExercises.length) {
    finishLesson();
  } else {
    renderExercise();
  }
}

function failLesson() {
  alert("נגמרו הלבבות בשיעור הזה 💔\nזה בסדר גמור - כל שיעור אפשר לנסות שוב. בואי ננסה את היחידה הזאת מהתחלה.");
  goToMap();
}

/* ============================================================
   מסך תגמול (מתנה)
   ============================================================ */
function finishLesson() {
  const total = currentExercises.length;
  const accuracy = Math.round((correctCount / total) * 100);
  const starsEarned = Math.max(1, Math.round((accuracy / 100) * 5));

  const unitState = state.units[currentUnit.id];
  const firstTimeCompleting = !unitState.completed;
  unitState.completed = true;
  unitState.bestAccuracy = Math.max(unitState.bestAccuracy, accuracy);

  state.stars += starsEarned;
  state.giftsOpened += 1;
  saveState();

  document.getElementById("reward-title").textContent = firstTimeCompleting
    ? `סיימת את "${currentUnit.title}"! 🎉`
    : `תרגלת שוב את "${currentUnit.title}"! 💪`;
  document.getElementById("reward-message").textContent = pick(ENCOURAGEMENT_MESSAGES);
  document.getElementById("reward-stars-earned").textContent = "+" + starsEarned;
  document.getElementById("reward-accuracy").textContent = accuracy + "%";
  document.getElementById("reward-streak").textContent = state.streak;

  const giftBox = document.getElementById("reward-gift-box");
  giftBox.textContent = "🎁";
  giftBox.dataset.opened = "false";

  // בדיקת עיטור חדש
  const completedCount = COURSE_UNITS.filter(u => state.units[u.id].completed).length;
  const badgeUnlockEl = document.getElementById("badge-unlock");
  const newlyUnlocked = BADGES.find(b => b.unitsRequired === completedCount && !state.badgesUnlocked.includes(b.id));

  if (newlyUnlocked) {
    state.badgesUnlocked.push(newlyUnlocked.id);
    saveState();
    badgeUnlockEl.classList.remove("hidden");
    document.getElementById("badge-icon").textContent = newlyUnlocked.icon;
    document.getElementById("badge-name").textContent = newlyUnlocked.name;
  } else {
    badgeUnlockEl.classList.add("hidden");
  }

  showScreen("screen-reward");
}

document.getElementById("reward-gift-box").addEventListener("click", function () {
  if (this.dataset.opened === "true") return;
  this.dataset.opened = "true";
  this.textContent = pick(GIFTS);
  this.style.transform = "scale(1.3) rotate(10deg)";
  setTimeout(() => { this.style.transform = ""; }, 300);
});

document.getElementById("btn-reward-continue").addEventListener("click", () => {
  goToMap();
});

/* ============================================================
   תעודת סיום
   ============================================================ */
function showCertificate() {
  document.getElementById("cert-name").textContent = state.userName;
  showScreen("screen-certificate");
}
document.getElementById("btn-cert-close").addEventListener("click", () => {
  showScreen("screen-map");
});

/* ============================================================
   אתחול
   ============================================================ */
initWelcomeScreen();
showScreen("screen-welcome");
