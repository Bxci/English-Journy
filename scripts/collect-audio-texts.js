#!/usr/bin/env node
/*
  scripts/collect-audio-texts.js — collects every English string the app can hand to Audio.speak(),
  so we can pre-render real human audio for it with Piper TTS instead of falling back to the
  browser's (often male, on some devices) speechSynthesis.

  Walks the same exercise-expansion engine the app uses at runtime (engine/exercises.js), not just
  the raw curriculum, so this stays accurate even as exercises get shuffled/generated/varied —
  covering: vocabulary words + example sentences, every expanded exercise's audio/answer/options/
  full/audioAfter fields, {English} tokens embedded in every Hebrew "why"/explanation string (via
  the same auto-wrap regex script.js's rich() uses), concept examples (incl. alphabet notes),
  conversation lines (npc + choices + their "why" explanations), and reading articles.

  Usage: node scripts/collect-audio-texts.js > scripts/audio-gen/texts.json
*/
const path = require("path");
const { loadCurriculum } = require("./load-curriculum.js");
const X = require("../engine/exercises.js");

const C = loadCurriculum();
const engine = X.createEngine(C, 42);
const texts = new Set();
const HEB = /[֐-׿]/;
/** Some exercise answers embed a trailing Hebrew hint, e.g. "He doesn't eat meat. (לא)" — never speak that part. */
const stripAside = t => String(t).replace(/\s*\([^)]*[֐-׿][^)]*\)\s*$/, "").trim();
const add = t => {
  if (!t || typeof t !== "string") return;
  const cleaned = stripAside(t);
  if (cleaned) texts.add(cleaned);
};

/** Mirrors script.js's rich(): auto-wraps bare English runs in Hebrew text, then extracts every {token}. */
function richTokens(text) {
  if (typeof text !== "string") return [];
  let t = text;
  if (!t.includes("{") && HEB.test(t)) {
    t = t.replace(/[A-Za-z][A-Za-z0-9'’ /.,?!+-]*[A-Za-z0-9?!.'’]|[A-Za-z]/g, m => "{" + m.trim() + "}");
  }
  const out = [];
  t.replace(/\{([^}]+)\}/g, (m, en) => { out.push(en); return m; });
  return out;
}

// Vocabulary: word + its example sentence (exactly as script.js speaks them, unmodified)
C.vocabulary.forEach(v => { add(v.word); add(v.exampleSentence); });

// Concept examples (mirrors script.js's `sayButtons(e[2] || e[0].replace(" — ", ", "))`),
// explanation + commonMistakes (rendered through rich() in the learn card -> may embed {tokens})
C.concepts.forEach(c => {
  (c.examples || []).forEach(e => add(e[2] || String(e[0]).replace(" — ", ", ")));
  richTokens(c.explanation).forEach(add);
  (c.commonMistakes || []).forEach(m => richTokens(m).forEach(add));
});

// Every real lesson, fully expanded through the actual runtime engine (learn cards + all exercises)
C.lessons.filter(l => l.status !== "planned").forEach(l => {
  let items;
  try { items = engine.expandLesson(l); } catch (e) { return; }
  items.forEach(it => {
    if (it.type === "learn") {
      (it.examples || []).forEach(e => add(e[2] || String(e[0]).replace(" — ", ", ")));
      richTokens(it.explanation).forEach(add);
      (it.commonMistakes || []).forEach(m => richTokens(m).forEach(add));
      return;
    }
    if (it.type === "vocabIntro") return; // vocab already covered above
    add(it.audio);
    if (it.answer && !HEB.test(it.answer)) add(it.answer);
    (it.options || []).forEach(o => { if (o && !HEB.test(o)) add(o); });
    add(it.full);
    add(it.audioAfter);
    richTokens(it.why).forEach(add);
  });
});

// A broad spread of concept-review/remediation variations (not all appear in a lesson's own exercise list)
C.concepts.forEach(c => {
  if (c.planned) return;
  try {
    engine.variationsFor(c.id, 25).forEach(it => {
      add(it.audio);
      if (it.answer && !HEB.test(it.answer)) add(it.answer);
      (it.options || []).forEach(o => { if (o && !HEB.test(o)) add(o); });
      add(it.full);
      add(it.audioAfter);
      richTokens(it.why).forEach(add);
    });
  } catch (e) { /* skip */ }
});

// Conversations: NPC lines (skip stage directions), every choice's English reply, and their Hebrew "why" tokens
C.conversations.forEach(s => {
  Object.values(s.nodes).forEach(n => {
    if (n.npc && !/^\(/.test(n.npc)) add(n.npc);
    (n.choices || []).forEach(c => {
      if (c.en) add(c.en);
      richTokens(c.why).forEach(add);
    });
  });
});

// Reading articles
delete require.cache[require.resolve(path.join(__dirname, "..", "curriculum", "articles.js"))];
global.ARTICLES = undefined;
require(path.join(__dirname, "..", "curriculum", "articles.js"));
(global.ARTICLES || []).forEach(a => {
  a.paragraphs.forEach(p => p.forEach(([en]) => add(en)));
});

process.stdout.write(JSON.stringify(Array.from(texts).sort(), null, 0));
process.stderr.write("Collected " + texts.size + " unique strings.\n");
