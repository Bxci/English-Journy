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
- **Concept** (`curriculum/concepts.js`): grammar / functional point — `{ id, level, title, skill, prerequisites[], explanation (Hebrew), examples [[en, he]], commonMistakes[], remediation (lesson id), drill[], vary?(rng) }` — 67, all with full content.
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
| A2 | 🛠️ more grammar | adverbs of manner · object pronouns · infinitives (want/need to) · beginner gerunds (love -ing) · present perfect ever/never · present perfect already/yet |

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
- The learner can respond three ways: **tap** a choice, **say** it (if speech recognition is available), or **type her own words** in a free-text box — all three go through the same matcher (`engine/normalize.js` `pickBestMatch()`, §18), so a natural paraphrase like "Hi Tom, my name is Dana" is accepted just as well as the exact listed sentence.
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
| Automatic cross-device sync, accounts | No backend, database or auth exists here — deliberately (see §16). Manual backup exists instead: Settings → "ייצוא / ייבוא התקדמות" (§17) | A small API + DB and auth; the state object is already a single serializable document to sync |
| True natural-language conversation (understanding genuinely novel phrasing, not just keyword/phrase matching) | No LLM API key is available, and a key embedded in frontend code would leak. Free-text replies (§8) are accepted via lexical matching (`pickBestMatch`, §18) against the scenario's authored candidate sentences — real coverage for reasonable paraphrases, but not true understanding of arbitrary input | A server-side proxy holding the key, calling a model constrained to the learner's unlocked vocabulary/grammar, plus the same post-conversation review |
| Pronunciation / accent scoring | Browser speech recognition only returns text, not phoneme-level audio analysis — the UI is honest about this (§9, §18) | A pronunciation-assessment service (server-side) |
| Guaranteed speech recognition | Browser-dependent (not Firefox; Chrome needs network) | Server-side STT |
| A Playwright/E2E suite | Scoped out of this pass — real work, not started | A self-contained addition; doesn't require new infrastructure |
| Full accessibility audit (color contrast measurements, complete screen-reader walkthrough) | A targeted pass found and fixed 3 real issues (§23) rather than a systematic top-to-bottom audit — genuinely not the same thing | A full WCAG pass with a screen reader (NVDA/VoiceOver) and a contrast-ratio tool over every screen |
| Verified live PWA installation/offline behavior | Built (§20), but this development environment's browser preview blocks service worker registration entirely — needs a real-browser check after deployment | Open the deployed site in Chrome/Edge/Safari and verify via DevTools |
| Deployment | None exists in this environment | Any static host works as-is |

**Highest-value next milestone if infrastructure becomes available:** a server-side, level-constrained LLM conversation partner that reuses this curriculum's per-lesson vocabulary/grammar as its guardrails — the one thing on this list that's structurally impossible to do well without a backend.

## 15. Pre-rendered audio (real human voice instead of browser TTS)

`audio/clips/*.mp3` holds real recorded-sounding audio (generated once, offline, with [Piper TTS](https://github.com/rhasspy/piper) — MIT-licensed, the `en_US-hfc_female-medium` voice, also MIT) for the ~1,200 most-heard English strings in the app: every vocabulary word + example sentence, every concept example, every conversation line, every reading article sentence, and the alphabet. `audio/manifest.json` lists which strings have a clip (by a stable hash of the text, see below).

At runtime, `Audio.speak()` in `script.js` checks the manifest first and plays the real clip if one exists; anything not covered (ad-hoc English phrases embedded in exercise Hebrew text, typed answers, etc.) falls back to the browser's own `speechSynthesis`, same as before this feature existed — nothing regresses, coverage only ever adds quality.

**Regenerating the audio** (only needed after curriculum text changes, or never — the app works fine without doing this, just with more browser-TTS fallback):
```bash
pip install piper-tts
python -m piper.download_voices en_US-hfc_female-medium --download-dir scripts/audio-gen
node scripts/collect-audio-texts.js > scripts/audio-gen/texts.json
python scripts/generate-audio.py
```
This is safe to re-run — it skips any clip that already exists, so only new/changed text gets synthesized. The voice model (`scripts/audio-gen/*.onnx`, ~60MB) is gitignored — only the generated `audio/clips/*.mp3` + `audio/manifest.json` are committed, so nobody needs Piper installed just to run the app.

The hash (FNV-1a 32-bit) is implemented identically in `scripts/generate-audio.py` (Python) and `script.js` (`fnv1a()`) so both sides agree on filenames without shipping the text list itself to the browser.

## 16. Adaptive Engine & Mastery Map (`engine/adaptive.js`)

This is an explainability/ranking layer on top of the engines in §5–§7, **not** a replacement for them — it calls into the existing Mastery Engine and mistake memory rather than keeping a second copy of that logic.

- **`rankRemediation(candidates, now)`** — when several concepts are due for remediation (§7), decides which one to surface first. Previously this was insertion order into `state.remediation`; now it's ranked by a weighted score of *how weak* (low mastery) and *how recent* (mistakes in the last week weigh more than old ones) the concept is. Used by `dueRemediation()` in `script.js`, which the home screen's daily plan and the "נושאים לחיזוק" chips already read from — so this was a drop-in upgrade, no new UI needed.
- **`explainChunk(kind, ctx)`** — for every item in the day's plan (review / new lesson / practice / conversation), returns Hebrew reason strings ("3 טעויות שנרשמו לאחרונה", "מאסטרי נוכחי: 42%", …). **Never shown to the learner** — the existing one-line friendly `sub` text on each plan item stays as-is, deliberately, per the project's beginner-first principle (a learner with almost no English shouldn't see "mastery score" language). This exists purely for the developer inspector below.
- **`conceptMasterySnapshot(concepts, masteryOf)`** — per-concept mastery (0–100%) + a Hebrew label (בהתחלה / מתפתח / בלמידה / טוב / חזק / שלטת מצוין), reusing `computeMastery()` — no parallel scoring system.

**Mastery Map**: the Progress screen (`goProgress()`) now shows a "מפת הידע שלי" section listing concepts the learner has actually attempted (not all 67 — an untouched list would just be noise for a beginner), weakest first, each tappable to jump straight into targeted practice on that concept.

**Developer inspector**: `window.__EJ_APP__.adaptiveDebug()` in the browser console returns the current day's plan with its reasons, the full ranked remediation queue, and the full concept mastery snapshot — for answering "why did it pick this?" during development. It is not linked from any learner-facing screen.

## 17. Export / Import (local backup)

Since there's intentionally no account system, Settings has "ייצוא התקדמות לקובץ" / "ייבוא התקדמות מקובץ" for manual backup and moving progress to another device:

- **Export** serializes `{ format: "english-journey-backup", backupVersion: 1, exportedAt, state }` to a downloaded `.json` file (via `Blob` + a temporary `<a download>`, no server involved).
- **Import** reads the file with `FileReader`, `JSON.parse`s it (a parse failure shows a friendly Hebrew error, never a crash), checks the parsed value has the expected shape, runs it through the same `mergeWithDefaults()` used for `localStorage` on every boot (so an old or partial backup still loads safely), shows a preview (lessons completed / streak / minutes / export date) in the existing in-app confirm dialog, and only replaces the current state if the learner confirms. Imported data is only ever used as a plain object — it is never `eval`'d or rendered as HTML, so a malformed or hostile file can't execute anything.

## 18. Speaking Engine: structured, honest speech comparison (`engine/normalize.js`)

`matchSpeech(transcripts, expected)` returns `{ ok, score, best, matched, missing, extra }` — which expected words were heard, which weren't, and what leftover words the recognizer produced (usually filler like "uh", never counted against `ok`). The speaking exercise UI shows "שמעתי: ... / חסר: ... / מילים נוספות ששמעתי: ..." — actionable, structured feedback, not just a pass/fail. This is explicitly **word-recognition matching, not pronunciation or accent scoring** — browser speech recognition cannot provide that, and the UI never claims otherwise (see §9).

Built on top of that, `pickBestMatch(text, items, textOf)` is what the Conversation Engine (§8) uses to decide which of a node's several candidate replies the learner meant, whether she typed or spoke it. A plain word-overlap ratio is easy to satisfy by accident against a *short* candidate — "Hi, I am Dana" shares 2 of the 3 words in an unrelated "I am fine." (a coincidental 67%). `pickBestMatch()` requires a near-exact match for short (≤ 4 word) candidates, and requires the winner to clearly beat the runner-up (≥ 0.15 score gap) — an ambiguous call returns `null` so the caller can honestly say "couldn't quite understand that, try rephrasing" instead of confidently matching the wrong reply. (This exact false-positive was caught by live-testing during development — see the test suite for the reproduction.)

## 19. Real-world missions (`curriculum/missions.js`, `engine/missions.js`)

"משימות בעולם האמיתי", reachable from the שיחה screen. Unlike a lesson exercise, a mission gives a **communicative goal** broken into a few steps (e.g. the Coffee Mission: greet → order the drink → be polite → say thanks) and evaluates whether the learner's own free-typed words accomplished each step — not whether she used one exact sentence.

- Each step carries `keywords`: groups of interchangeable phrases (e.g. greet = "hi" OR "hello" OR "good morning"). `stepMatches(text, step)` (pure, tested) checks whether the normalized input contains any phrase from any group — intentionally simple substring matching, not full intent recognition, which isn't achievable offline without an LLM (see §14 for what that would take).
- A wrong/unrecognized attempt never blocks progress: it offers a hint (the step's example phrasing) and lets the learner retry as many times as she wants.
- Completing a mission awards stars and a small celebration; progress and completion are saved per mission in `state.missions`.
- 4 missions shipped (coffee, introducing yourself, asking directions, buying something in a shop) — deliberately a small, polished set rather than a long list of thin ones, per the project's "quality over quantity" content principle.
- Always reachable from the שיחה screen, **and** now surfaced inside the Daily Journey (`buildPlan()`'s "conversation" slot): on roughly one day in three, `recommendedMission()` swaps that slot for an untried mission at/below the learner's current level, instead of the usual suggested conversation. Missions have no lesson-prerequisite gating of their own, so this deliberately borrows the conversation slot's gate (only offered once a conversation is already available) to keep suggestions from appearing before she has any base vocabulary. Verified live: forced both branches (a "mission day" and a normal day) and confirmed the right one renders and launches correctly.

## 20. PWA / offline installability (`sw.js`, `manifest.webmanifest`, `icons/`)

The app was already usable offline once loaded (static site, `localStorage` persistence, no required network calls). This adds the piece that was actually missing: a way to *install* it and have it keep working with **no server running at all**.

- `manifest.webmanifest` — name/icons/theme colors (matching the app's purple palette) + `display: "standalone"`, so "Add to Home Screen" on a phone gives a real app-like window, not a browser tab. Icons (`icons/*.png`, incl. a maskable variant for Android's adaptive-icon shape) were generated to match the existing design language, not placeholders.
- `sw.js` — a service worker with two caches: the **app shell** (every script/style `index.html` loads, discovered by regex at install time rather than a hand-maintained list that could go stale) is precached so the whole app works with zero network; **audio clips** are deliberately *not* precached (there are thousands — see §15) and instead cached lazily the first time each one plays, then served from cache offline afterward. `script.js` registers it, feature-detected, non-blocking, failure-tolerant.
- **Honest limitation**: I could not verify live service-worker registration in this development environment — its browser preview tool blocks `navigator.serviceWorker.register()` entirely (confirmed with a trivial one-line worker producing the identical generic error, ruling out a bug in `sw.js`; same category of sandbox restriction as the microphone and native `confirm()` blocks noted elsewhere in this codebase). The file-discovery regex was verified directly in Node against the real `index.html` (all 20 extracted files exist on disk, nothing missing). **This needs a real-browser check after deployment** — open the deployed site in Chrome/Edge/Safari, confirm DevTools → Application → Service Workers shows it activated, then go offline and confirm the app still loads.

## 21. Weekly Progress summary

The Progress screen shows a "השבוע שלך" card — minutes studied, words reviewed, lessons completed, sentences spoken aloud, and conversations had, summed over the last 7 calendar days (today + the previous 6; verified the boundary is exact, an 8th-day-old entry is correctly excluded) — plus, when the data supports it, the concept with the biggest real mastery gain that week and one weak concept worth strengthening (tap to jump straight into practice). Hidden entirely for a learner with no activity yet, rather than showing an empty/zero card.

- **No new snapshot storage.** `state.history` (capped at the last 60 days, archived by `rollDaily()` when a new calendar day starts) holds only the same daily counters the home screen's "today" plan already tracked (`seconds`, `reviewDone`, `lessonsDone`, `convoDone`, plus a new `spokenDone` incremented whenever a dedicated speaking exercise is answered correctly). Safe for existing learners: `mergeWithDefaults()` already defaults any field a saved state doesn't have, so `history: []` and `daily.spokenDone: 0` appear automatically on next load with no explicit migration step and no data loss.
- **"Most improved" is computed, not stored.** For each concept touched in the last 7 days, mastery *right now* is compared against mastery *as of 7 days ago* — computed by re-running the same `computeMastery()` the rest of the app uses, but only over the attempts that existed at that earlier point in time. This reuses real attempt-timestamp data instead of needing a second mastery-tracking system.
- Verified live: seeded 5 days of history + timestamped concept attempts (some older than 7 days, some recent) and confirmed the card shows the correct sums, correctly identifies the improved concept with its real before/after percentages, the weak-concept link launches practice, and the card is hidden for a fresh learner.

## 22. Achievements (`lessons-data.js` BADGES, `checkBadges()`)

Extended beyond the original lesson-count/level badges (`b.lessonsRequired`, `b.level`) with real milestones that reflect what this pass actually added: first spoken sentence (`b.firstSpoken`), first conversation completed (`b.firstConversation`), 50/100 words mastered (`b.wordsRequired`), a 7-day streak (`b.streakRequired`), completing the Coffee Mission specifically (`b.missionId`), and completing 3+ missions ("Traveler", `b.missionsRequired`).

- `checkBadges()` does one full sweep of every not-yet-unlocked badge and returns whichever newly qualify — called after a lesson (existing reward-screen badge box, unchanged), after a conversation, and after a mission (both via a lightweight `announceBadges()` toast/inline note, since those flows don't have the full reward screen). Every badge is re-checked on every call rather than wiring bespoke logic per trigger point, so a badge that became true from a completely different activity (e.g. hitting a streak while finishing a mission) still gets caught.
- New lifetime counter `state.totalSpoken` (separate from the Weekly Progress card's *daily* `spokenDone`) backs the "first sentence" badge — another additive, auto-backfilled field, no migration code needed.
- Verified live: seeded streak/word/conversation/mission state to put 5 badges one real mission-completion away from unlocking, completed that mission through the actual UI, and confirmed all 5 were detected in one sweep, correctly announced, persisted without duplicates, and rendered lit up on the Progress screen afterward.

## 23. Accessibility fixes (targeted, not a full audit)

Not a systematic pass — a code review of this session's own new UI (confirm dialog, missions, weekly summary) turned up 3 concrete, real issues, fixed and verified live with actual Tab-key/focus testing (not just reading the markup):

- **The confirm dialog had no focus trap.** `aria-modal="true"` tells assistive tech the background is inert, but doesn't reliably stop physical Tab-key focus from leaving the dialog in every browser. Tab/Shift+Tab now cycle only between the dialog's two buttons while it's open, and focus returns to whatever element opened it when it closes (verified: opened from a settings button, tabbed through both dialog buttons and confirmed it never left them, closed it, confirmed focus landed back on the original button).
- **The mission text input had no accessible label** — only a placeholder, which isn't a reliable accessible name across screen readers. Added a proper (visually-hidden) `<label>`, matching the pattern the conversation free-text input already used correctly.
- **Mission feedback text (wrong-answer message, hint) updated with no `aria-live` region** — a screen-reader user would never hear it. Added `role="status" aria-live="polite"`, matching the pattern the conversation feedback banner already used correctly. Also added explicit (visually-hidden) "הושלם" / "עוד לא הושלם" status text to each mission checklist item, rather than relying on a strikethrough style + a ✅/⬜ emoji alone to convey state.
