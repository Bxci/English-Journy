#!/usr/bin/env node
/*
  scripts/validate-curriculum.js — structural validation of the whole course. No dependencies.
  Usage: node scripts/validate-curriculum.js   (exit code 1 when any error is found)

  Checks: unique ids; valid level/title/objective; prerequisites exist; referenced vocab/concepts exist;
  minimum exercises per lesson; every exercise has a correct answer (and it is among its options);
  Hebrew explanations present; concepts never used before they are taught (prerequisite closure);
  no circular prerequisites (topological sort); whole unlock graph reachable from the start;
  conversations well-formed; index.html loads every curriculum/engine file.
*/
const fs = require("fs");
const path = require("path");
const { loadCurriculum, CURRICULUM_FILES, ENGINE_FILES } = require("./load-curriculum.js");
const U = require("../engine/unlock.js");
const X = require("../engine/exercises.js");

const MIN_EXERCISES = 8;
const MIN_VARIATIONS = 3;
const LEVELS = ["pre-a1", "a1", "a2"];
const HEB = /[֐-׿]/;
const NEEDS_WHY = ["mc", "fillChoice", "fillType", "err", "build", "tr", "npc", "tre", "lis", "emoji"];

function validate(C) {
  const errors = [], warnings = [];
  const err = m => errors.push(m), warn = m => warnings.push(m);

  // ---------- unique ids ----------
  const dup = (list, what) => {
    const seen = new Set();
    list.forEach(x => { if (!x.id) err(what + " without id: " + JSON.stringify(x).slice(0, 80)); else if (seen.has(x.id)) err("Duplicate " + what + " id: " + x.id); seen.add(x.id); });
  };
  dup(C.lessons, "lesson"); dup(C.concepts, "concept"); dup(C.vocabulary, "vocab"); dup(C.units, "unit"); dup(C.conversations, "conversation");
  const allIds = new Map();
  [["lesson", C.lessons], ["concept", C.concepts]].forEach(([k, list]) => list.forEach(x => {
    if (allIds.has(x.id)) err("Id used by both " + allIds.get(x.id) + " and " + k + ": " + x.id); allIds.set(x.id, k);
  }));

  const L = {}, CO = {}, V = {};
  C.lessons.forEach(l => { L[l.id] = l; });
  C.concepts.forEach(c => { CO[c.id] = c; });
  C.vocabulary.forEach(v => { V[v.id] = v; });

  // ---------- vocabulary ----------
  C.vocabulary.forEach(v => {
    ["word", "translation", "partOfSpeech", "category", "exampleSentence"].forEach(f => { if (!v[f]) err("Vocab " + v.id + " missing " + f); });
    if (!LEVELS.includes(v.level)) err("Vocab " + v.id + " invalid level " + v.level);
    if (v.translation && !HEB.test(v.translation)) err("Vocab " + v.id + " translation is not Hebrew");
  });

  // ---------- lessons: fields and references ----------
  C.lessons.forEach(l => {
    if (!LEVELS.includes(l.level)) err("Lesson " + l.id + " invalid level " + l.level);
    if (!l.title || !HEB.test(l.title)) err("Lesson " + l.id + " missing Hebrew title");
    if (!l.objective || !HEB.test(l.objective)) err("Lesson " + l.id + " missing Hebrew objective");
    l.prerequisites.forEach(p => { if (!L[p]) err("Lesson " + l.id + " prerequisite does not exist: " + p); });
    l.concepts.concat(l.practices).forEach(c => { if (!CO[c]) err("Lesson " + l.id + " references unknown concept " + c); });
    l.vocab.concat(l.reviewVocab).forEach(v => { if (!V[v]) err("Lesson " + l.id + " references unknown vocab " + v); });
    if (l.status !== "planned" && !l.concepts.length && !l.practices.length && !l.vocab.length) err("Lesson " + l.id + " teaches nothing (no concepts/practices/vocab)");
    l.prerequisites.forEach(p => { if (L[p] && L[p].status === "planned" && l.status !== "planned") err("Real lesson " + l.id + " depends on planned lesson " + p); });
  });

  // ---------- concepts ----------
  C.concepts.forEach(c => {
    if (!LEVELS.includes(c.level)) err("Concept " + c.id + " invalid level");
    if (!c.title || !HEB.test(c.title)) err("Concept " + c.id + " missing Hebrew title");
    if (!c.explanation || !HEB.test(c.explanation)) err("Concept " + c.id + " missing Hebrew explanation");
    (c.prerequisites || []).forEach(p => { if (!CO[p]) err("Concept " + c.id + " prerequisite does not exist: " + p); });
    if (!c.planned) {
      if (!c.examples || !c.examples.length) err("Concept " + c.id + " has no examples");
      (c.examples || []).forEach(e => { if (!Array.isArray(e) || !e[0] || !e[1]) err("Concept " + c.id + " example must be [english, hebrew]"); });
      if (!c.commonMistakes || !c.commonMistakes.length) err("Concept " + c.id + " has no commonMistakes");
      if (!c.remediation) err("Concept " + c.id + " has no remediation lesson");
    }
    if (c.remediation && !L[c.remediation]) err("Concept " + c.id + " remediation lesson does not exist: " + c.remediation);
  });

  // ---------- cycles ----------
  const lt = U.topoSort(C.lessons.map(l => l.id), id => L[id].prerequisites);
  if (lt.cyclic.length) err("Circular lesson prerequisites among: " + lt.cyclic.join(", "));
  const ct = U.topoSort(C.concepts.map(c => c.id), id => CO[id].prerequisites || []);
  if (ct.cyclic.length) err("Circular concept prerequisites among: " + ct.cyclic.join(", "));

  // ---------- concept order: nothing used before it is taught ----------
  const index = U.buildIndex(C);
  const closureCache = {};
  const closure = id => {
    if (closureCache[id]) return closureCache[id];
    const out = new Set(); const stack = [...(L[id] ? L[id].prerequisites : [])];
    while (stack.length) { const x = stack.pop(); if (out.has(x) || !L[x]) continue; out.add(x); stack.push(...L[x].prerequisites); }
    return (closureCache[id] = out);
  };
  const taughtBefore = (lesson, cid) => {
    const t = index.conceptTaughtBy[cid];
    return t && (t === lesson.id || closure(lesson.id).has(t));
  };
  C.lessons.forEach(l => {
    if (lt.cyclic.length) return;
    l.concepts.forEach(cid => (CO[cid] && CO[cid].prerequisites || []).forEach(p => {
      if (!taughtBefore(l, p)) err("Lesson " + l.id + " introduces " + cid + " before its prerequisite concept " + p + " is taught (" + (index.conceptTaughtBy[p] || "nowhere") + ")");
    }));
    if (l.status === "planned") return;
    l.practices.forEach(cid => { if (!taughtBefore(l, cid)) err("Lesson " + l.id + " practises " + cid + " before it is taught"); });
    l.exercises.forEach((e, i) => { if (e.c && CO[e.c] && !taughtBefore(l, e.c)) err("Lesson " + l.id + " exercise #" + i + " uses concept " + e.c + " before it is taught"); });
  });

  // ---------- reachability ----------
  if (!lt.cyclic.length) {
    const unreachable = U.unreachableLessons(C);
    if (unreachable.length) err("Unreachable lessons (can never unlock): " + unreachable.join(", "));
    if (!C.lessons.some(l => l.prerequisites.length === 0)) err("No start lesson (every lesson has prerequisites)");
  }

  // ---------- exercises ----------
  const engine = X.createEngine(C, 42);
  C.lessons.forEach(l => {
    if (l.status === "planned") { if (l.exercises.length) warn("Planned lesson " + l.id + " has exercises"); return; }
    let items;
    try { items = engine.expandLesson(l); } catch (e) { err("Lesson " + l.id + ": " + e.message); return; }
    const graded = items.filter(x => x.type !== "learn" && x.type !== "vocabIntro");
    if (graded.length < MIN_EXERCISES) err("Lesson " + l.id + " has only " + graded.length + " exercises (min " + MIN_EXERCISES + ")");
    const kinds = new Set(graded.map(g => g.kind));
    if (kinds.size < 3) err("Lesson " + l.id + " uses fewer than 3 exercise types");
    if (!graded.some(g => g.tier === "production")) err("Lesson " + l.id + " has no production exercise (typing/translation/speaking)");
    if (l.concepts.some(c => !CO[c].planned) && !items.some(x => x.type === "learn")) err("Lesson " + l.id + " has no LEARN card before testing");
    graded.forEach(g => {
      const where = "Lesson " + l.id + " exercise " + g.id + " (" + g.kind + ")";
      if (g.type === "match") { if (!g.pairs || g.pairs.length < 2) err(where + " needs >= 2 pairs"); return; }
      if (!g.answer || !String(g.answer).trim()) err(where + " has no correct answer");
      if (g.type === "choice") {
        const opts = g.options || [];
        if (opts.length < 2) err(where + " needs >= 2 options");
        if (!opts.includes(g.answer)) err(where + " answer is not among the options");
        if (new Set(opts).size !== opts.length) err(where + " has duplicate options: " + opts.join(" | "));
      }
      if (g.type === "type" && (!g.accept || !g.accept.length)) err(where + " has no accepted answers");
      if (g.type === "build" && (!g.chunks || g.chunks.length < 2)) err(where + " sentence builder needs >= 2 chunks");
      if (g.kind === "fillChoice" || g.kind === "fillType") { if (!/___/.test(g.sentence)) err(where + " has no ___ blank"); }
      if (!g.raw.g && NEEDS_WHY.includes(g.kind) && (!g.why || !HEB.test(g.why))) err(where + " has no Hebrew explanation (why)");
      if (g.concept && !CO[g.concept]) err(where + " references unknown concept " + g.concept);
    });
  });

  // ---------- variations available for remediation ----------
  C.concepts.forEach(c => {
    if (c.planned || !index.conceptTaughtBy[c.id]) return;
    const n = engine.variationsFor(c.id, 20).length;
    if (n < MIN_VARIATIONS) err("Concept " + c.id + " has only " + n + " distinct variations (min " + MIN_VARIATIONS + ")");
  });
  C.concepts.forEach(c => { if (!index.conceptTaughtBy[c.id]) err("Concept " + c.id + " is not taught by any lesson"); });

  // ---------- conversations ----------
  C.conversations.forEach(s => {
    const w = "Conversation " + s.id;
    if (!LEVELS.includes(s.level)) err(w + " invalid level");
    (s.requires || []).forEach(r => { if (!L[r]) err(w + " requires unknown lesson " + r); else if (L[r].status === "planned") err(w + " requires planned lesson " + r); });
    if (!s.requires || !s.requires.length) err(w + " must require at least one lesson (level gate)");
    if (!s.nodes[s.start]) err(w + " start node missing");
    let hasEnd = false;
    Object.entries(s.nodes).forEach(([id, n]) => {
      if (!n.npc || !n.he) err(w + " node " + id + " needs npc + he");
      if (n.end) { hasEnd = true; return; }
      const good = (n.choices || []).filter(c => !c.bad), bad = (n.choices || []).filter(c => c.bad);
      if (!good.length) err(w + " node " + id + " has no good reply");
      if (!bad.length) err(w + " node " + id + " has no wrong reply to learn from");
      good.forEach(c => { if (!s.nodes[c.next]) err(w + " node " + id + " -> missing node " + c.next); });
      bad.forEach(c => {
        if (!c.why || !HEB.test(c.why)) err(w + " node " + id + " wrong reply without Hebrew why");
        if (!CO[c.concept]) err(w + " node " + id + " wrong reply maps to unknown concept " + c.concept);
        else if (!(s.requires || []).some(r => L[r] && taughtBefore(L[r], c.concept))) err(w + " node " + id + " feedback concept " + c.concept + " is above the scenario's level");
      });
    });
    if (!hasEnd) err(w + " has no end node");
  });

  // ---------- index.html loads everything ----------
  try {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    CURRICULUM_FILES.concat(ENGINE_FILES).forEach(f => { if (!html.includes('src="' + f + '"')) err("index.html does not load " + f); });
    const pos = f => html.indexOf('src="' + f + '"');
    if (pos("curriculum/course.js") < pos("curriculum/conversations.js")) err("index.html must load curriculum/course.js last");
  } catch (e) { err("Cannot read index.html: " + e.message); }

  const real = C.lessons.filter(l => l.status !== "planned");
  const stats = {
    levels: C.levels.length, units: C.units.length, lessons: C.lessons.length, realLessons: real.length,
    plannedLessons: C.lessons.length - real.length, concepts: C.concepts.length, vocabulary: C.vocabulary.length,
    conversations: C.conversations.length,
    exercises: real.reduce((s, l) => s + (errors.length ? 0 : engine.expandLesson(l).filter(x => x.type !== "learn" && x.type !== "vocabIntro").length), 0),
    perLevel: C.levels.map(lv => lv.id + ": " + real.filter(l => l.level === lv.id).length + " lessons").join(", "),
  };
  return { errors, warnings, stats };
}

if (require.main === module) {
  const C = loadCurriculum();
  const { errors, warnings, stats } = validate(C);
  warnings.forEach(w => console.log("WARN  " + w));
  errors.forEach(e => console.log("ERROR " + e));
  console.log("\nCurriculum: " + stats.levels + " levels, " + stats.units + " units, " + stats.lessons + " lessons (" + stats.realLessons + " with content, " + stats.plannedLessons + " planned), " +
    stats.concepts + " concepts, " + stats.vocabulary + " vocabulary items, " + stats.conversations + " scripted conversations, " + stats.exercises + " exercises.");
  console.log("Per level: " + stats.perLevel);
  if (errors.length) { console.log("\nFAILED: " + errors.length + " error(s)."); process.exit(1); }
  console.log("\nOK: curriculum is valid.");
}

module.exports = { validate, MIN_EXERCISES };
