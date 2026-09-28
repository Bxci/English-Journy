/*
  engine/exercises.js — turns authored exercise specs into runtime exercises.

  Authored (short) forms — see README "Exercise engine":
    {mc:"prompt", a:"answer", o:[distractors]}                multiple choice
    {fill:"I ___ tired.", a:"am", o:["is","are"]}             fill blank (choice); without o -> typed
    {build:"She is my sister.", he:"...", x:["are"]}          sentence builder (tap chunks)
    {tr:"אני עייפה.", a:["I am tired.","I'm tired."]}        Hebrew -> English (typed)
    {tre:"I am tired.", a:"אני עייפה.", o:[...]}              English -> Hebrew (choice)
    {err:"She are happy.", a:"She is happy.", o:[...]}        error correction (choose the fixed sentence)
    {lis:"thirteen", a:"13", o:["30","3"]}                    listen -> select (a defaults to the audio text)
    {lt:"I am from Israel.", a:[alternatives]}                listen -> type
    {say:"Nice to meet you.", a:[alternatives]}               speak (speech recognition or self-mark)
    {npc:"How are you?", a:"I'm fine, thanks.", o:[...]}      scripted conversation choice
    {emoji:"🍎", a:"apple", o:[...]}                          image(emoji) -> word
    {match:[["cat","חתול"], ...]}                             match pairs
    {g:"emoji"|"en2he"|"he2en"|"type"|"listen"|"listenType"|"say"|"match", v:"id" | ["id", ...]}
                                                              generated from vocabulary items
  Common optional keys: why (Hebrew explanation shown on a wrong answer), c (concept id),
  he (Hebrew translation shown after answering), k (instruction override), strict (keep contractions).
  Hebrew text may embed English inside {braces}; the UI renders those as LTR spans with audio.
*/
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.exercises = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  const M = (typeof module === "object" && module.exports) ? require("./mastery.js") : root.EJ.mastery;
  const W = M.EXERCISE_WEIGHTS;

  // Teaching flow: LEARN(0) SEE(1) HEAR(2) RECOGNIZE(3) CHOOSE(4) BUILD(5) WRITE(6) SPEAK(7) REVIEW(8) APPLY(9)
  const KINDS = {
    learn:      { type: "learn",        stage: 0, tier: null },
    vocabIntro: { type: "vocabIntro",   stage: 0, tier: null },
    emoji:      { type: "choice",       stage: 1, tier: "recognition", skills: ["vocabulary"], kicker: "מה רואים כאן?" },
    listen:     { type: "choice",       stage: 2, tier: "recognition", skills: ["listening"], kicker: "הקשיבי ובחרי מה שמעת" },
    lis:        { type: "choice",       stage: 2, tier: "recognition", skills: ["listening"], kicker: "הקשיבי ובחרי מה שמעת" },
    en2he:      { type: "choice",       stage: 3, tier: "recognition", skills: ["vocabulary"], kicker: "מה הפירוש?" },
    he2en:      { type: "choice",       stage: 3, tier: "recognition", skills: ["vocabulary"], kicker: "איך אומרים את זה באנגלית?" },
    tre:        { type: "choice",       stage: 3, tier: "recognition", skills: ["reading"], kicker: "מה פירוש המשפט?" },
    mc:         { type: "choice",       stage: 3, tier: "recognition", skills: null, kicker: "בחרי את התשובה הנכונה" },
    match:      { type: "match",        stage: 3, tier: "recognition", skills: ["vocabulary"], kicker: "התאימי בין המילים" },
    fillChoice: { type: "choice",       stage: 4, tier: "guided", skills: ["grammar"], kicker: "השלימי את החסר" },
    err:        { type: "choice",       stage: 4, tier: "guided", skills: ["grammar", "reading"], kicker: "יש כאן טעות — מה המשפט הנכון?" },
    build:      { type: "build",        stage: 5, tier: "guided", skills: ["grammar", "writing"], kicker: "סדרי את המילים למשפט" },
    fillType:   { type: "type",         stage: 6, tier: "production", skills: ["grammar", "writing"], kicker: "הקלידי את המילה החסרה" },
    type:       { type: "type",         stage: 6, tier: "production", skills: ["vocabulary", "writing"], kicker: "כתבי באנגלית" },
    tr:         { type: "type",         stage: 6, tier: "production", skills: ["writing"], kicker: "תרגמי לאנגלית" },
    listenType: { type: "type",         stage: 6, tier: "production", skills: ["listening", "writing"], kicker: "הקשיבי והקלידי מה שמעת" },
    lt:         { type: "type",         stage: 6, tier: "production", skills: ["listening", "writing"], kicker: "הקשיבי והקלידי מה שמעת" },
    say:        { type: "speak",        stage: 7, tier: "production", skills: ["speaking"], kicker: "אמרי בקול" },
    npc:        { type: "choice",       stage: 9, tier: "recognition", skills: ["reading"], kicker: "שיחה: מה הכי מתאים לענות?" },
  };

  function hasHebrew(s) { return /[֐-׿]/.test(String(s)); }

  /** Short notations like "{go} ← {went}" or "{six} = 6" get a plain-Hebrew lead-in. */
  function hebrewWhy(why) {
    if (!why) return "";
    if (hasHebrew(why.replace(/\{[^}]*\}/g, ""))) return why;
    if (why.includes("←")) return "הצורה הנכונה: " + why;
    if (why.includes("=")) return "הפירוש: " + why;
    if (why.includes("+")) return "המבנה: " + why;
    return "התשובה הנכונה: " + why;
  }

  function makeRng(seed) {
    if (seed == null) return Math.random;
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function uniq(arr) { return Array.from(new Set(arr)); }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function createEngine(curriculum, seed) {
    const rng = makeRng(seed);
    const vocabById = {}, conceptById = {};
    (curriculum.vocabulary || []).forEach(v => { vocabById[v.id] = v; });
    (curriculum.concepts || []).forEach(c => { conceptById[c.id] = c; });

    function kindOf(raw) {
      if (raw.g) return raw.g;
      if (raw.fill != null) return raw.o ? "fillChoice" : "fillType";
      for (const k of ["mc", "emoji", "lis", "lt", "tre", "tr", "err", "build", "say", "npc", "match"]) if (raw[k] != null) return k;
      return null;
    }

    function conceptSkills(cid) {
      const c = cid && conceptById[cid];
      return c && c.skill ? [c.skill] : ["grammar"];
    }

    function distractorsFor(v, pool, field, n) {
      const same = (pool || []).filter(x => x.id !== v.id);
      const cat = (curriculum.vocabulary || []).filter(x => x.id !== v.id && x.category === v.category);
      const any = (curriculum.vocabulary || []).filter(x => x.id !== v.id && x.level === v.level);
      const out = [];
      [shuffle(same, rng), shuffle(cat, rng), shuffle(any, rng)].forEach(list => list.forEach(x => {
        if (out.length >= n) return;
        if (field === "emoji" && !x.emoji) return;
        const val = x[field === "emoji" ? "word" : field];
        if (val && val !== v[field === "emoji" ? "word" : field] && !out.includes(val)) out.push(val);
      }));
      return out;
    }

    function vocabTags(texts, pool) {
      const ids = [];
      const hay = " " + texts.filter(Boolean).join(" ").toLowerCase() + " ";
      (pool || []).forEach(v => {
        const re = new RegExp("(^|[^a-z])" + escapeRe(v.word.toLowerCase()) + "([^a-z]|$)");
        if (re.test(hay)) ids.push(v.id);
      });
      return ids;
    }

    /** Expand one authored spec. ctx = { lesson, pool (vocab objects), conceptDefault } */
    function expandOne(raw, ctx, idx) {
      const kind = kindOf(raw);
      if (!kind || !KINDS[kind]) throw new Error("Unknown exercise spec in " + (ctx.lesson ? ctx.lesson.id : "?") + ": " + JSON.stringify(raw));
      const K = KINDS[kind];
      const base = {
        id: (ctx.lesson ? ctx.lesson.id : "x") + "#" + idx,
        kind, type: K.type, stage: raw.stage != null ? raw.stage : K.stage, tier: K.tier,
        w: W[K.tier], kicker: raw.k || K.kicker, why: hebrewWhy(raw.why), he: raw.he || "",
        strictForm: !!raw.strict, concept: null, vocab: [], raw,
      };

      // ---------- generated from vocabulary ----------
      if (raw.g) {
        if (kind === "match") {
          const items = raw.v.map(id => vocabById[id]);
          return Object.assign(base, {
            pairs: items.map(v => [v.word, v.translation]), vocab: raw.v.slice(), skills: ["vocabulary"],
            why: "כדאי לחזור על המילים: " + items.map(v => "{" + v.word + "} = " + v.translation).join(", "),
          });
        }
        const v = vocabById[raw.v];
        if (!v) throw new Error("Unknown vocab id " + raw.v);
        const defWhy = "{" + v.word + "} = " + v.translation + (v.note ? " — " + v.note : "");
        Object.assign(base, { vocab: [v.id], skills: K.skills.slice(), why: raw.why || defWhy, he: v.translation });
        const accept = [v.word].concat(v.alts || []);
        switch (kind) {
          case "emoji":
            return Object.assign(base, { prompt: v.emoji || v.word, promptLang: "emoji", answer: v.word, options: [v.word].concat(distractorsFor(v, ctx.pool, "emoji", 3)), audioOptions: true });
          case "en2he":
            return Object.assign(base, { prompt: "{" + v.word + "}", promptLang: "en", audio: v.word, answer: v.translation, options: [v.translation].concat(distractorsFor(v, ctx.pool, "translation", 3)) });
          case "he2en":
            return Object.assign(base, { prompt: v.translation, promptLang: "he", answer: v.word, options: [v.word].concat(distractorsFor(v, ctx.pool, "word", 3)), audioOptions: true });
          case "listen":
            return Object.assign(base, { prompt: "", audio: v.word, autoplay: true, answer: v.word, options: [v.word].concat(distractorsFor(v, ctx.pool, "word", 3)) });
          case "type":
            return Object.assign(base, { prompt: v.translation, promptLang: "he", answer: v.word, accept, audioAfter: v.word });
          case "listenType":
            return Object.assign(base, { prompt: "", audio: v.word, autoplay: true, answer: v.word, accept });
          case "say":
            return Object.assign(base, { prompt: "{" + v.word + "}", promptLang: "en", audio: v.word, answer: v.word, accept, he: v.translation });
        }
      }

      // ---------- curated ----------
      const concept = raw.c !== undefined ? raw.c : ctx.conceptDefault || null;
      base.concept = concept || null;
      const skills = K.skills ? K.skills.slice() : (concept ? conceptSkills(concept) : ["vocabulary"]);
      if (kind === "mc" && concept && !conceptSkills(concept).includes("grammar")) skills.splice(0, skills.length, ...conceptSkills(concept));
      if (kind === "tr" && concept) skills.push(conceptSkills(concept)[0]);
      base.skills = uniq(skills);
      const accept = [].concat(raw.a == null ? [] : raw.a);

      switch (kind) {
        case "mc":
          return Object.assign(base, { prompt: raw.mc, promptLang: hasHebrew(raw.mc) || raw.mc.includes("←") ? "he" : "en", audio: hasHebrew(raw.mc) ? raw.audio : (raw.audio || raw.mc), answer: accept[0], options: [accept[0]].concat(raw.o), audioOptions: !hasHebrew(accept[0]), vocab: vocabTags([accept[0], raw.mc], ctx.pool) });
        case "emoji":
          return Object.assign(base, { prompt: raw.emoji, promptLang: "emoji", answer: accept[0], options: [accept[0]].concat(raw.o), audioOptions: true, vocab: vocabTags([accept[0]], ctx.pool), skills: ["vocabulary"] });
        case "lis": {
          const ans = accept[0] || raw.lis;
          return Object.assign(base, { prompt: "", audio: raw.lis, autoplay: true, answer: ans, options: [ans].concat(raw.o), vocab: vocabTags([raw.lis], ctx.pool) });
        }
        case "tre":
          return Object.assign(base, { prompt: "{" + raw.tre + "}", promptLang: "en", audio: raw.tre, answer: accept[0], options: [accept[0]].concat(raw.o), vocab: vocabTags([raw.tre], ctx.pool) });
        case "err":
          return Object.assign(base, { prompt: "{" + raw.err + "}", promptLang: "en", wrongSentence: raw.err, answer: accept[0], options: [accept[0]].concat(raw.o || []), audioOptions: true, vocab: vocabTags([accept[0]], ctx.pool) });
        case "npc":
          return Object.assign(base, { prompt: "{" + raw.npc + "}", promptLang: "en", audio: raw.npc, npcHe: raw.nhe || "", answer: accept[0], options: [accept[0]].concat(raw.o), audioOptions: true, vocab: vocabTags([accept[0], raw.npc], ctx.pool) });
        case "fillChoice":
          return Object.assign(base, { prompt: raw.fill, promptLang: "en", sentence: raw.fill, answer: accept[0], options: [accept[0]].concat(raw.o), audioOptions: true, full: raw.fill.replace("___", accept[0]), vocab: vocabTags([raw.fill.replace("___", accept[0])], ctx.pool) });
        case "fillType":
          return Object.assign(base, { prompt: raw.fill, promptLang: "en", sentence: raw.fill, answer: accept[0], accept, full: raw.fill.replace("___", accept[0]), vocab: vocabTags([raw.fill.replace("___", accept[0])], ctx.pool) });
        case "build": {
          const sentence = raw.build;
          const chunks = sentence.replace(/[.?!]+$/, "").split(/\s+/);
          return Object.assign(base, { prompt: raw.he || "", promptLang: "he", answer: sentence, accept: [sentence].concat(raw.a || []), chunks: shuffle(chunks.concat(raw.x || []), rng), audioAfter: sentence, vocab: vocabTags([sentence], ctx.pool) });
        }
        case "tr":
          return Object.assign(base, { prompt: raw.tr, promptLang: "he", answer: accept[0], accept, audioAfter: accept[0], vocab: vocabTags(accept.slice(0, 1), ctx.pool) });
        case "lt": {
          const acc = accept.length ? accept : [raw.lt];
          return Object.assign(base, { prompt: "", audio: raw.lt, autoplay: true, answer: raw.lt, accept: [raw.lt].concat(acc.filter(a => a !== raw.lt)), vocab: vocabTags([raw.lt], ctx.pool) });
        }
        case "say":
          return Object.assign(base, { prompt: "{" + raw.say + "}", promptLang: "en", audio: raw.say, answer: raw.say, accept: [raw.say].concat(accept), vocab: vocabTags([raw.say], ctx.pool) });
        case "match":
          return Object.assign(base, { pairs: raw.match, vocab: vocabTags(raw.match.map(p => p[0]), ctx.pool), skills: ["vocabulary"], why: raw.why || "כדאי לחזור על הזוגות: " + raw.match.map(p => "{" + p[0] + "} = " + p[1]).join(", ") });
      }
      throw new Error("Unhandled kind " + kind);
    }

    function expandSpecs(list, ctx, startIdx) {
      const out = [];
      (list || []).forEach((raw, i) => {
        if (raw.g && Array.isArray(raw.v) && raw.g !== "match") {
          raw.v.forEach((id, j) => out.push(expandOne(Object.assign({}, raw, { v: id }), ctx, (startIdx || 0) + i + "." + j)));
        } else out.push(expandOne(raw, ctx, (startIdx || 0) + i));
      });
      return out;
    }

    function learnCard(cid) {
      const c = conceptById[cid];
      return { id: "learn:" + cid, type: "learn", stage: 0, concept: cid, title: c.title, explanation: c.explanation, examples: c.examples || [], commonMistakes: c.commonMistakes || [] };
    }

    function lessonPool(lesson) {
      return (lesson.vocab || []).concat(lesson.reviewVocab || []).map(id => vocabById[id]).filter(Boolean);
    }

    /** Full, ordered session for a lesson: learn cards, vocab intro cards, then exercises by teaching stage. */
    function expandLesson(lesson) {
      const pool = lessonPool(lesson);
      const ctx = { lesson, pool, conceptDefault: (lesson.concepts || [])[0] || (lesson.practices || [])[0] || null };
      const cards = [];
      (lesson.notes || []).forEach((n, i) => cards.push({ id: lesson.id + ":note" + i, type: "learn", stage: 0, concept: null, title: n.title, explanation: n.body, examples: n.examples || [], commonMistakes: n.mistakes || [] }));
      (lesson.concepts || []).forEach(cid => { if (conceptById[cid] && conceptById[cid].explanation) cards.push(learnCard(cid)); });
      const newWords = (lesson.vocab || []).map(id => vocabById[id]).filter(Boolean);
      for (let i = 0; i < newWords.length; i += 5) {
        cards.push({ id: lesson.id + ":words" + i, type: "vocabIntro", stage: 0, words: newWords.slice(i, i + 5) });
      }
      const ex = expandSpecs(lesson.exercises, ctx, 0);
      const ordered = lesson.keepOrder ? ex : ex.map((e, i) => [e, i]).sort((a, b) => (a[0].stage - b[0].stage) || (a[1] - b[1])).map(p => p[0]);
      return cards.concat(ordered);
    }

    /** Controlled variations for a concept (never the exact same prompt as `avoid`). */
    function variationsFor(cid, n, avoid) {
      const c = conceptById[cid];
      if (!c) return [];
      const avoidSet = new Set([].concat(avoid || []));
      const ctx = { lesson: { id: "var-" + cid }, pool: (c.vocabPool || []).map(id => vocabById[id]).filter(Boolean), conceptDefault: cid };
      const candidates = [];
      if (typeof c.vary === "function") for (let i = 0; i < n * 3; i++) candidates.push(c.vary(rng));
      shuffle((c.drill || []).concat(c.lessonExercises || []), rng).forEach(d => candidates.push(d));
      const out = [], seen = new Set();
      for (const raw of candidates) {
        if (out.length >= n) break;
        const spec = Object.assign({ c: cid }, raw);
        const e = expandOne(spec, ctx, "v" + out.length);
        const key = e.kind + "|" + (e.prompt || "") + "|" + e.answer;
        if (seen.has(key) || avoidSet.has(e.prompt) || avoidSet.has(e.sentence)) continue;
        seen.add(key); out.push(e);
      }
      return out;
    }

    /** One review exercise for an SRS key ("v:<vocabId>" or "c:<conceptId>"). box = SRS box. */
    function reviewItemFor(key, box) {
      const [kind, id] = [key.slice(0, 1), key.slice(2)];
      if (kind === "c") return variationsFor(id, 1)[0] || null;
      const v = vocabById[id];
      if (!v) return null;
      const easy = ["en2he", "he2en", "listen"].concat(v.emoji ? ["emoji"] : []);
      const hard = ["type", "listenType"];
      const g = (box || 0) >= 2 ? shuffle(hard.concat(["he2en"]), rng)[0] : shuffle(easy, rng)[0];
      const pool = (curriculum.vocabulary || []).filter(x => x.category === v.category);
      return expandOne({ g, v: id }, { lesson: { id: "review" }, pool }, key);
    }

    /** Alternative exercise for something the learner got wrong (reinforcement round). */
    function reinforcementFor(ex) {
      if (ex.concept) {
        const vs = variationsFor(ex.concept, 1, [ex.prompt, ex.sentence]);
        if (vs.length) return vs[0];
      }
      if (ex.vocab && ex.vocab.length === 1) {
        const alt = ex.kind === "type" ? "he2en" : "type";
        const v = vocabById[ex.vocab[0]];
        return expandOne({ g: alt, v: v.id }, { lesson: { id: "reinforce" }, pool: (curriculum.vocabulary || []).filter(x => x.category === v.category) }, "r");
      }
      const copy = Object.assign({}, ex, { id: ex.id + "-again" });
      if (copy.chunks) copy.chunks = shuffle(copy.chunks, rng);
      return copy;
    }

    function shuffledOptions(ex) { return shuffle(uniq(ex.options || []), rng); }

    return { KINDS, vocabById, conceptById, expandOne, expandSpecs, expandLesson, learnCard, variationsFor, reviewItemFor, reinforcementFor, shuffledOptions, shuffle: a => shuffle(a, rng), rng };
  }

  return { KINDS, createEngine, hasHebrew, hebrewWhy, makeRng };
});
