# המסע לאנגלית 🌟📘

קורס אנגלית אינטראקטיבי בממשק עברי מלא (RTL), מ-**Pre-A1** (אפס מוחלט) ועד **A2**. שיעורים מדורגים עם הסבר קצר לפני כל תרגול, חזרה יומית חכמה, תרגול דיבור, ושיחות מובנות — הכל כאתר סטטי אחד שנפתח בכל דפדפן.

> The rest of this document is developer documentation (English).

---

## 1. Architecture — and why it is a static site

This is a **static, client-side-only** web app: `index.html` + CSS + plain JS files, **no build step, no server, no backend, no database, no accounts, no API keys**. That is a hard constraint of the environment it was built in, and the design follows from it:

| Concern | Where it lives |
|---|---|
| Curriculum (levels, units, lessons, concepts, vocabulary, conversations) | `curriculum/*.js` — plain data objects |
| Learning logic (mastery, review scheduling, unlock graph, answer checking, exercise generation) | `engine/*.js` — **pure functions**, no DOM, unit-tested in Node |
| UI (screens, renderers, audio, speech, persistence) | `script.js`, `index.html`, `style.css` |
| Motivational data (messages, gifts, badges, placement check, goals, v1 migration map) | `lessons-data.js` |
| Progress | the browser's `localStorage` (per browser, per device) |

Every `curriculum/*.js` and `engine/*.js` file works both as a browser `<script>` (attaching to `window.CURRICULUM` / `window.EJ.*`) and as a Node module (`require`), so the exact code the learner runs is the code the tests run.

## 2. How to run

- **Easiest:** open `index.html` in a browser (double-click).
- **Recommended** (speech recognition and some browsers' storage behave better on `http://` than `file://`):
  ```bash
  python3 -m http.server 8000   # then open http://localhost:8000
  ```
- It can be hosted on **any static host** (GitHub Pages, Netlify, S3, ...). **No deployment exists** — nothing in this repo deploys anywhere.

```
index.html          screens + script tags (load order matters: course.js last among curriculum files)
style.css           design system (RTL, dark mode, mobile-first)
script.js           UI: onboarding, today, map, lesson player, reviews, conversations, progress
lessons-data.js     encouragement, gifts, badges, placement check, goals, legacy map
curriculum/         vocabulary.js concepts.js pre-a1.js a1.js a2.js conversations.js course.js
engine/             normalize.js mastery.js srs.js unlock.js mistakes.js exercises.js
scripts/            validate-curriculum.js load-curriculum.js check-syntax.js
tests/              node:test suites (+ optional jsdom DOM smoke test)
```

## 3. Curriculum

### 3.1 Hierarchy

**Course → Level (Pre-A1, A1, A2) → Unit → Lesson → Concept → Exercise**

- **Vocabulary item** (`curriculum/vocabulary.js`): `{ id, word, translation, partOfSpeech, level, category, emoji, exampleSentence, alts?, note? }` — 416 items.
- **Concept** (`curriculum/concepts.js`): grammar / functional point — `{ id, level, title, skill, prerequisites[], explanation (Hebrew), examples [[en, he]], commonMistakes[], remediation (lesson id), drill[], vary?(rng) }` — 61 with full content + 6 planned (A2).
- **Lesson** (`curriculum/pre-a1.js`, `a1.js`, `a2.js`): `{ id, title, objective, pre (prerequisite lesson ids), concepts (taught), practices (reviewed), vocab (new words), reviewVocab, notes, exercises[], status? }`. `course.js` flattens units into `CURRICULUM.lessons`, sets `level`/`unit`, and resolves `prerequisites` (explicit `pre`, otherwise the previous lesson in course order).
- **Conversation scenario** (`curriculum/conversations.js`): scripted dialogue tree (see §8).

### 3.2 What is actually implemented

| | Units | Lessons with content | Planned skeletons |
|---|---|---|---|
| Pre-A1 | 5 | 21 | – |
| A1 | 7 | 48 | – |
| A2 | 4 | 7 | 6 |
| **Total** | **16** | **76** (1,152 exercises) | **6** |

| Level | Unit | Lessons |
|---|---|---|
| Pre-A1 | 🧭 צעדים ראשונים | reading direction, upper/lower case |
| Pre-A1 | 🔤 האלף-בית | A–G · H–N (letter vs sound) · O–U · V–Z + spelling |
| Pre-A1 | 👋 ברכות והיכרות | hello/goodbye (times of day) · introducing yourself · please/thank you/sorry/excuse me |
| Pre-A1 | 🔢 מספרים | 0–10 · 11–20 (teen vs ty) · tens to 100 |
| Pre-A1 | 🧺 מילים חיוניות | people · family · home · food · drinks · objects · places · colors (color before noun) · basic actions (I + verb) · Pre-A1 review |
| A1 | 🧍 to be | subject pronouns · I am · you/we/they are · he/she/it is (full paradigm) · contractions · negative · questions + short answers |
| A1 | 🧱 sentences | S+V+O word order · a/an · the · regular plurals · irregular plurals · my/your/his/her · 's · this/that/these/those · there is/are · question words · can/can't |
| A1 | 🔁 Present Simple (9 lessons) | meaning · I/you/we/they · he/she/it · -s spelling (goes/watches/studies/has) · don't/doesn't · do/does questions · frequency adverbs · daily routine · mastery review |
| A1 | 🏙️ everyday | telling time · calendar + at/on/in · family & jobs · home + prepositions of place · food & shopping · restaurant (I'd like) · work · transportation · directions |
| A1 | ⏳ now | present continuous · present simple vs continuous contrast |
| A1 | ⏪ past | was/were · regular -ed · irregular batch 1 (went, had, ate, drank, saw) · batch 2 (came, did, got, made, took) · batch 3 (bought, said, wrote, met, slept) · didn't / Did...? |
| A1 | 🔮 future | will · going to · will vs going to · A1 review |
| A2 | ⚖️ comparison | comparatives · superlatives |
| A2 | 🧮 quantity | countable/uncountable · some/any · much/many/a lot of |
| A2 | 🧭 advice & obligation | should · must / have to (mustn't vs don't have to) |
| A2 | 🛠️ planned | adverbs of manner · object pronouns · infinitives · beginner gerunds · present perfect ever/never · already/yet — **ids, prerequisites, objectives and concept explanations only; no exercises yet; shown as "בהכנה" and never unlockable** |

### 3.3 Adding content

**A vocabulary item** — add a row to the right `add(category, level, partOfSpeech, rows)` block in `curriculum/vocabulary.js`:
```js
["umbrella", "מטרייה", "☂️", "Take an umbrella."],            // id = "umbrella"
["work", "לעבוד", "💼", "I work in an office.", { id: "work-v" }] // explicit id when the word repeats
```

**A grammar concept** — `def({...})` in `curriculum/concepts.js`. Hebrew explanation (short, natural), English inside `{braces}` (rendered LTR and tappable for audio), `**bold**` allowed. Give `examples`, `commonMistakes`, a `remediation` lesson id, and either a few `drill` exercises or a `vary(rng)` template generator so remediation can produce *different* questions.

**A lesson** — add an object to a unit in `curriculum/<level>.js`:
```js
{ id: "a1-xyz", title: "...", objective: "...", pre: ["a1-ps-3"],
  concepts: ["new-concept"], vocab: ["word-id", ...],
  exercises: [
    { g: "emoji", v: ["word-id", "other-id"] },                          // generated from vocabulary
    { fill: "She ___ tea. (drink)", a: "drinks", o: ["drink"], why: "..." },
    { build: "She drinks tea.", he: "היא שותה תה.", why: "..." },
    { tr: "היא שותה תה.", a: ["She drinks tea."], why: "..." },
    { say: "She drinks tea." },
  ] }
```
Then run `npm run validate` — it tells you exactly what is missing or out of order.

**A conversation** — see §8.

### 3.4 Exercise spec syntax (authoring)

| Spec | Type | Tier |
|---|---|---|
| `{mc, a, o}` | multiple choice (Hebrew or English prompt) | recognition |
| `{emoji, a, o}` / `{g:"emoji", v}` | image (emoji) → word | recognition |
| `{lis, a?, o}` / `{g:"listen", v}` | listen → select | recognition |
| `{tre, a, o}` / `{g:"en2he", v}` | English → Hebrew | recognition |
| `{g:"he2en", v}` | Hebrew → English (choice) | recognition |
| `{match:[[en,he]...]}` / `{g:"match", v:[...]}` | match pairs | recognition |
| `{npc, a, o}` | scripted conversation choice | recognition (APPLY stage) |
| `{fill, a, o}` | fill-in-the-blank, choose | guided |
| `{err, a, o}` | error correction (pick the fixed sentence) | guided |
| `{build, he, x?}` | sentence builder (tap-to-place chunks; `x` = distractor chunks) | guided |
| `{fill, a}` (no `o`) | fill-in-the-blank, typed | production |
| `{tr, a:[...]}` / `{g:"type", v}` | Hebrew → English, typed | production |
| `{lt, a?}` / `{g:"listenType", v}` | listen → type | production |
| `{say, a?}` / `{g:"say", v}` | speak (speech recognition or self-mark) | production |

Common keys: `why` (Hebrew explanation shown on a wrong answer — required by the validator), `c` (concept id; defaults to the lesson's first concept), `he` (translation shown after answering), `k` (instruction override), `strict: true` (don't expand contractions — used in the contractions lesson).

## 4. Teaching flow & exercise engine

`engine/exercises.js` expands a lesson into an ordered session:

1. **LEARN** — note cards and one card per concept (explanation, examples with 🔊/🐢, common mistakes), then **vocabulary intro** cards (emoji, word, translation, example, audio).
2. Exercises are **stably sorted by teaching stage**: SEE (emoji) → HEAR (listening) → RECOGNIZE (meaning/choice/match) → CHOOSE (fill-choice, error fix) → BUILD (sentence builder) → WRITE (typing, translation, listen-type) → SPEAK → APPLY (conversation turns). The test suite asserts stages never go backwards in any lesson.
3. **REVIEW** happens through the daily review queue (§6).

Every exercise has a **Hebrew "why"** shown on wrong answers (authored, or a generated fallback such as "הפירוש: {apple} = תפוח").

**Adding an exercise type:** add an entry to `KINDS` in `engine/exercises.js` (runtime `type`, `stage`, `tier`, `skills`, Hebrew kicker), handle it in `expandOneRaw`, and — if it needs a new UI — add a renderer to `RENDERERS` in `script.js` that sets `current.check = () => ({ ok, given })` (or calls `resolve(...)` itself). Scoring, feedback, mastery, mistakes and review scheduling are handled generically by `resolve()`.

Renderers: `learn`, `vocabIntro`, `choice` (covers mc / emoji / listen / en↔he / fill-choice / error / npc), `type` (typed fill / translation / listen-type), `build` (tap-to-place, tap again to remove — no drag & drop needed on touch), `match` (tap English then Hebrew), `speak`.

### Answer checking (`engine/normalize.js`)
Typed answers are compared leniently: case, punctuation, extra whitespace and curly quotes are ignored; contractions are expanded (`I'm` = `I am`, also `Im`/`dont` without apostrophe) unless `strict`; digits equal number words (`13` = `thirteen`, `21` = `twenty-one`); any listed alternative is accepted. A **one-letter spelling slip** is forgiven ("כמעט מושלם") only inside **one word of 6+ letters** and **never** when the difference is a grammatical ending (`-s/-es/-d/-ed/-ing`), so `She work` is still wrong for `She works`, and short confusables (`these/those`, `write/wrote`, `woman/women`) must be exact.

## 5. Mastery model (`engine/mastery.js`)

`computeMastery(history, now) → 0..1`, where `history = [{ t, ok, w }]` and `w` is the exercise tier weight: recognition **0.5**, guided **0.75**, production **1.0**, self-marked speaking **0.25**.

```
recent     = last 12 attempts (WINDOW)
accuracy   = Σ(ok·w·0.8^age) / Σ(w·0.8^age)            recency- and difficulty-weighted
confidence = 1 − exp(−Σ(correct w) / 2)                 evidence: 1 lucky click ≠ mastery
forgetting = 0.5 + 0.5·exp(−daysSinceLast / stability)   stability = 3·2^(correctStreak−1) days, max 120
pressure   = (last answer wrong ? 0.85 : 1) · max(0.6, 1 − 0.04·max(0, wrongsInWindow − 2))
mastery    = accuracy · confidence · forgetting · pressure
if no correct guided/production answer in the window → capped at 0.7 (RECOGNITION_CAP)
```

Consequences (all unit-tested): one correct answer < 0.5; ~5 correct production answers ≥ 0.8; recognition-only practice can never reach "mastered"; recent mistakes hurt more than old ones; repeated mistakes lower it; an item not reviewed for weeks decays (never below half).

Mastery is tracked per **item** (`c:<conceptId>`, `v:<vocabId>`) and per **skill dimension** — grammar, vocabulary, reading, listening, writing, speaking — each exercise type feeding specific skills. There is **no single global percentage**. Displayed values are rounded to 5% (`displayPercent`), with words ("בדרך", "מתקדמת", "חזקה").

Named constants in `CONFIG`: `UNLOCK_THRESHOLD = 0.8` (lesson score needed to complete a lesson), `MASTERY_THRESHOLD = 0.8` (✓ on the map), `LEARNED_THRESHOLD = 0.6` ("words learned"), plus all the formula parameters.

## 6. Review scheduler — "חזרה יומית" (`engine/srs.js`)

A Leitner-box scheduler (the UI never calls it "spaced repetition"):
- card = `{ key, box 0..6, due, reps, lapses, leech }`, intervals `[0, 1, 3, 7, 14, 30, 60]` days;
- correct → next box, due after that box's interval;
- wrong → back to box 0 (box 1 for long-known items), due again in **10 minutes**, `lapses+1`; 4 lapses flags a leech;
- `buildQueue(cards, now, limit)` returns due cards, **weakest box first**, then most overdue.

Each item touched in a session is scheduled once at session end (correct only if every attempt in the session was correct). Review items are generated fresh each time: vocabulary as emoji/meaning/listening (boxes 0–1) or typing/listen-typing (box ≥ 2); concepts as a new variation.

## 7. Mistake memory, variations, remediation, lesson completion

- **Mistake log** (`engine/mistakes.js`): per concept id (e.g. `present-simple-third-person-s`): count, recent timestamps, last wrong answer.
- **In-session variation:** the 2nd wrong answer on the same concept inserts a *different* question on that concept a few items later (template `vary()` generators with other subjects/verbs, the concept's `drill`, or other curated exercises of lessons teaching it — never the exact question that was failed).
- **Remediation:** 3 mistakes on a concept within 7 days schedules a short targeted mini-lesson (explanation card + 5 variations). It appears in the day plan and on the progress screen; it **never blocks** anything. Passing it clears the recent mistakes; otherwise it returns the next day.
- **Hearts:** running out doesn't end the lesson — it shows the concept's explanation again, refills hearts, and continues.
- **Lesson completion** requires answering ≥ 90% of the lesson's exercises (speaking excluded, since it can be skipped when there's no mic) **and** a difficulty-weighted score ≥ `UNLOCK_THRESHOLD`. Otherwise a **reinforcement round** (varied versions of what went wrong + the explanation) is offered. If that round also falls short, the learner may do another round or **continue anyway** — the lesson is marked complete with `weak: true` and its items are already due soon in review. Leaving a lesson early never completes it.

## 8. Conversation mode — scripted, not generative AI

There is **no LLM and no API key** in this project, so conversation practice is a **deterministic dialogue-tree engine** over authored scenarios (`curriculum/conversations.js`): meeting someone, café, supermarket, restaurant, asking directions, a new colleague, weekend chat (past), advice from a friend (A2 should).

- Each node has an NPC line (English + Hebrew translation on demand + audio) and several replies: one or more good ones (which may branch) and wrong ones with a Hebrew `why` and a concept id.
- A scenario unlocks only after the lessons in `requires`; the validator checks that every feedback concept is taught within those lessons. So the "partner" never goes above the learner's level **by construction** — the content is written for that level, not generated.
- Wrong choices are recorded as mistakes on their concept (feeding mastery/remediation). The end screen lists **what you picked / a better choice / why**, and offers targeted practice on the weakest concept.
- If speech recognition is available, the learner can say the reply instead of tapping it (matched against the offered replies).
- The UI labels it clearly: "שיחות מובנות, לא צ'אט חופשי ... זו לא שיחה עם בינה מלאכותית".

## 9. Audio and speech — and real browser limits

- **Text-to-speech** uses `window.speechSynthesis` (prefers an `en-US` voice). Every English word, example and prompt has 🔊 (normal, rate 0.9) and 🐢 (slow, rate 0.6); inline English in Hebrew explanations is tappable. A "slow audio by default" setting exists. Voice quality depends on the OS/browser; some browsers have no English voice installed.
- **Speech recognition** uses `SpeechRecognition` / `webkitSpeechRecognition` when present (Chrome, Edge, Safari; not Firefox). Chrome sends audio to Google's service and needs a network connection. It is feature-detected: without it, the learner sees an explanation and can **self-mark "אמרתי את זה"** (low mastery weight 0.25) or skip — never a spinner or dead end. Microphone denial, silence and timeouts show a Hebrew message and the same fallback.
- Matching is lenient (normalized, filler words ignored, ≥ 80% of expected words with at most one missing, alternatives allowed). **It only checks that the intended words were recognized. It does not and cannot score pronunciation or accent** — the UI says so.

## 10. Onboarding & daily plan

- Name → **"מה רמת האנגלית שלך?"** with 4 options. "אני כמעט לא יודעת אנגלית" goes straight to Pre-A1 with **no test**. The other options offer an **optional 11-question check** ("בדיקת רמה קצרה", skippable). Result/choice "places out" lower-level lessons (`placedOut`): they satisfy prerequisites, remain open for practice, and never count as mastered. Placement never skips *inside* a level.
- **Goals** (conversation / travel / work / movies / study / general) only change flavor text and which conversation is suggested — never the lesson order or prerequisites.
- **Daily time** 10/20/30/45 min (default 20) sizes the plan: `planDay()` splits it into review (≤ ~35%, ~2 items/min), targeted practice (if remediation is due), new lesson, and conversation (goals ≥ 20 min) — never exceeding the goal. The home screen shows this plan with one primary button ("התחילי ללמוד" / "המשך ללמוד") that runs the next unfinished chunk.

## 11. Screens, RTL, mobile, accessibility

Screens: welcome → onboarding → **today** (home) · **course map** (levels → units → lessons with ✓ mastered / ◐ completed / ● next / ○ open / 🔒 locked (tap shows what's missing) / ⏳ planned) · **conversations** · **progress** (CEFR level, per-level completion, 6 skill bars, streak, study time, words learned, conversations, remediation topics, certificates, badges, settings) · lesson player · reward (gift box, stars, badges — kept from v1) · per-level certificate.

- Hebrew UI is RTL; every English string is isolated LTR (`dir="ltr"` / `<bdi>`), including English inside Hebrew sentences and bare English in titles.
- Mobile-first, designed for ~360px phones (reviewed in the CSS, not on a physical device): no horizontal overflow (`overflow-wrap`, flexible grids), tap targets ≥ 44px, sticky action footer, bottom navigation with safe-area padding, zoom not disabled.
- Accessibility: labelled icon buttons and audio buttons (`aria-label="השמעה: …"`), visible `:focus-visible` outlines, focus moves to each new screen/question heading, `aria-live` feedback, radio semantics for options, `prefers-reduced-motion` respected, dark mode via `prefers-color-scheme`.

## 12. Persistence (localStorage) — schema v2

Key `english-journey-state-v2`:

```js
{
  schemaVersion: 2, userName, createdAt,
  onboarding: { done, selfLevel, placement: { takenAt, level, scores } | null, goals: [], dailyMinutes },
  streak, lastPlayedDate, stars, giftsOpened, badgesUnlocked: [],
  lessons:  { [lessonId]: { completed, completedAt, bestScore, attempts, weak, placedOut } },
  items:    { ["c:<concept>" | "v:<vocab>"]: { h: [{ t, ok, w }] } },   // mastery histories (≤ 30)
  skills:   { [skill]: { h: [{ t, ok, w }] } },                           // ≤ 60
  srs:      { [itemKey]: { key, box, due, reps, lapses, last, leech } },
  mistakes: { [conceptId]: { count, times: [], last: { prompt, given, expected } } },
  remediation: { [conceptId]: { due, created } },
  conversations: { [scenarioId]: { runs, lastAt, lastMistakes, history: [{ at, mistakes }] } },
  certificates: { [level]: "YYYY-MM-DD" },
  daily: { date, seconds, reviewDone, lessonsDone, practiceDone, convoDone },
  time: { totalSeconds }, settings: { slowAudio }, legacy: { migratedAt, units } | null
}
```

- **Schema-upgrade safety net kept:** saved state is merged over `defaultState()` (unknown keys kept, nested objects merged), so new fields never break old saves; corrupt JSON falls back to a fresh state.
- **v1 migration:** if only the old `english-journey-state-v1` key exists, name, streak, stars, gifts and badges are kept, and completed old vocabulary units are mapped to the equivalent new Pre-A1 lessons as `placedOut: "legacy"` (greetings, numbers 0–10, family, food, drinks, colors, home, actions). The old key is left untouched as a backup. Old units with no clean equivalent (time/days, adjectives, phrases) are not credited, and v1 accuracy is not converted into mastery (v1 never recorded per-item answers). The migrated learner goes through the new onboarding once.

## 13. Testing & validation

```bash
npm test            # node --test tests   (Node 18+; no dependencies)
npm run validate    # node scripts/validate-curriculum.js
npm run check       # node --check on every JS file
```

- `tests/mastery.test.js` — mastery properties (evidence, recognition cap, recency, decay, bounds, rounding, threshold constant).
- `tests/srs.test.js` — Leitner intervals, relearning, leeches, purity, queue ordering; mistake memory; daily plan sizing.
- `tests/unlock.test.js` — prerequisite and **concept-prerequisite** enforcement, placement, planned lessons, statuses, topo sort, reachability, real-course checks.
- `tests/normalize.test.js` — typing leniency, contractions, numbers, typo vs grammar, sentence builder, speech matching.
- `tests/curriculum.test.js` — validator passes, hierarchy, required topics, small irregular batches, LEARN-first + stage escalation, explanations, variations, review generation.
- `tests/dom-smoke.test.js` — **optional** (skipped unless `jsdom` is resolvable, e.g. `npm install --no-save jsdom`): loads the real `index.html` and scripts and plays onboarding, **every lesson** through the DOM, the failing → reinforcement → continue path, daily review, remediation, all 8 conversations, placement, v1 migration and corrupt storage.

The validator checks unique ids; valid level/title/objective; prerequisites and referenced vocab/concepts exist; ≥ 8 exercises, ≥ 3 exercise types and a production exercise per lesson; every exercise has a correct answer that is among its options; Hebrew explanations; concepts never used before they are taught (prerequisite closure); no cycles (topological sort); every lesson reachable from the start; ≥ 3 distinct remediation variations per taught concept; conversations well-formed and within level; `index.html` loads every file.

## 14. What is NOT implemented, and why

| Not implemented | Why | What it would take |
|---|---|---|
| Cross-device sync, accounts, backup | No backend, database or auth exists here; progress is `localStorage` in one browser and is lost if site data is cleared | A small API + DB (e.g. a `users` + `progress` document per user) and auth; the v2 state object is already a single serializable document to sync |
| Real AI conversation / free-text chat | No LLM API key is available, and a key embedded in frontend code would leak | A server-side proxy holding the key, calling a model with a system prompt constrained to the learner's unlocked vocabulary/grammar (which this curriculum already encodes per lesson), plus the same post-conversation review |
| Pronunciation / accent scoring | Browser speech recognition only returns text | A pronunciation-assessment service (server-side) |
| Guaranteed speech recognition | Browser-dependent (not Firefox; Chrome needs network) | Server-side STT |
| Deployment | None exists in this environment | Any static host works as-is |
| A2 lessons beyond the first 7 | Six A2 lessons are skeletons (ids, prerequisites, objectives, concept explanations) | Author exercises in `curriculum/a2.js`, remove `status: "planned"`, run `npm run validate` |
| Audio recordings by native speakers | Only browser TTS | Recorded audio files per vocabulary item/example |

**Highest-value next milestone if infrastructure becomes available:** a tiny backend with auth + a synced progress document (so the learner can't lose progress and can switch devices), then a server-side, level-constrained LLM conversation partner that reuses this curriculum's per-lesson vocabulary/grammar as its guardrails.
