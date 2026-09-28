/*
  engine/normalize.js — lenient answer checking for typed / spoken answers.
  Pure functions, no DOM. Works in the browser (window.EJ.normalize) and in Node (require).

  Rules (documented in README):
   - case-insensitive, punctuation-insensitive, whitespace-collapsed
   - curly quotes/apostrophes unified
   - contractions expanded (I'm == I am) unless the exercise sets strictForm
   - digits and number words are equivalent (13 == thirteen, 21 == twenty-one)
   - one-letter spelling slip tolerated inside ONE word of 6+ letters (shorter words like these/those, wrote/write, woman/women must be exact) ("near" match, still counted correct),
     but never when the difference is a grammatical ending (-s, -es, -d, -ed, -ing): "She work" != "She works"
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.EJ = root.EJ || {};
  root.EJ.normalize = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

  function numberToWords(n) {
    n = Number(n);
    if (!Number.isInteger(n) || n < 0 || n > 100) return String(n);
    if (n === 100) return "one hundred";
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10), o = n % 10;
    return o ? TENS[t] + " " + ONES[o] : TENS[t];
  }

  const CONTRACTIONS = [
    [/\bi'm\b/g, "i am"], [/\byou're\b/g, "you are"], [/\bwe're\b/g, "we are"], [/\bthey're\b/g, "they are"],
    [/\bhe's\b/g, "he is"], [/\bshe's\b/g, "she is"], [/\bit's\b/g, "it is"], [/\bthat's\b/g, "that is"],
    [/\bthere's\b/g, "there is"], [/\bwhat's\b/g, "what is"], [/\bwhere's\b/g, "where is"], [/\bwho's\b/g, "who is"],
    [/\bisn't\b/g, "is not"], [/\baren't\b/g, "are not"], [/\bwasn't\b/g, "was not"], [/\bweren't\b/g, "were not"],
    [/\bdon't\b/g, "do not"], [/\bdoesn't\b/g, "does not"], [/\bdidn't\b/g, "did not"],
    [/\bcan't\b/g, "cannot"], [/\bcan not\b/g, "cannot"], [/\bwon't\b/g, "will not"],
    [/\bi'll\b/g, "i will"], [/\byou'll\b/g, "you will"], [/\bwe'll\b/g, "we will"], [/\bthey'll\b/g, "they will"],
    [/\bhe'll\b/g, "he will"], [/\bshe'll\b/g, "she will"], [/\bit'll\b/g, "it will"],
    [/\bi've\b/g, "i have"], [/\byou've\b/g, "you have"], [/\bwe've\b/g, "we have"], [/\bthey've\b/g, "they have"],
    [/\bhaven't\b/g, "have not"], [/\bhasn't\b/g, "has not"], [/\bshouldn't\b/g, "should not"], [/\bmustn't\b/g, "must not"],
    [/\blet's\b/g, "let us"], [/\bi'd\b/g, "i would"],
  ];

  // Contractions typed without the apostrophe ("im", "dont"). Ambiguous ones (its, were, ill, well, wed) are excluded.
  const NO_APOSTROPHE_MAP = { im: "i am", youre: "you are", theyre: "they are", shes: "she is", hes: "he is", isnt: "is not", arent: "are not",
    wasnt: "was not", werent: "were not", dont: "do not", doesnt: "does not", didnt: "did not", cant: "cannot", wont: "will not",
    ive: "i have", whats: "what is", thats: "that is", theres: "there is", shouldnt: "should not", mustnt: "must not", havent: "have not", hasnt: "has not" };
  const NO_APOSTROPHE = new RegExp("\\b(" + Object.keys(NO_APOSTROPHE_MAP).join("|") + ")\\b", "g");

  /** Basic normalization: lowercase, unify quotes, strip punctuation, collapse spaces. */
  function basic(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/[‘’ʼ`´]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[.,!?;:"()\[\]{}…]/g, " ")
      .replace(/\s*-\s*/g, " ") // twenty-one == twenty one
      .replace(/\s+/g, " ")
      .trim();
  }

  function expandContractions(s) {
    let out = s;
    CONTRACTIONS.forEach(([re, rep]) => { out = out.replace(re, rep); });
    return out;
  }

  function digitsToWords(s) {
    return s.replace(/\b\d{1,3}\b/g, m => (Number(m) <= 100 ? numberToWords(Number(m)) : m));
  }

  /** Full normalization used for comparison. opts.strictForm keeps contractions as typed. */
  function normalizeAnswer(s, opts) {
    opts = opts || {};
    let out = basic(s);
    if (!opts.strictForm) out = expandContractions(out);
    out = digitsToWords(out);
    out = out.replace(/'/g, "");
    if (!opts.strictForm) out = out.replace(NO_APOSTROPHE, m => NO_APOSTROPHE_MAP[m]);
    return out.replace(/\s+/g, " ").trim();
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /**
   * checkTyped(given, accepted, opts) -> { ok, exact, near, matched }
   * accepted: string | string[]  (any of them is a correct answer)
   * near: accepted with a 1-character typo (only when the answer is 5+ chars and opts.noTypos is not set)
   */
  function checkTyped(given, accepted, opts) {
    opts = opts || {};
    const list = Array.isArray(accepted) ? accepted : [accepted];
    const g = normalizeAnswer(given, opts);
    if (!g) return { ok: false, exact: false, near: false, matched: null };
    for (const a of list) {
      if (normalizeAnswer(a, opts) === g) return { ok: true, exact: true, near: false, matched: a };
    }
    if (!opts.noTypos) {
      for (const a of list) {
        if (isSpellingSlip(normalizeAnswer(a, opts), g)) return { ok: true, exact: false, near: true, matched: a };
      }
    }
    return { ok: false, exact: false, near: false, matched: null };
  }

  const GRAMMAR_SUFFIX = /^(s|es|d|ed|ing)$/;
  /** True when two words differ only by a grammatical ending (works/work, lived/live) — never a "typo". */
  function grammarVariant(a, b) {
    const [s, l] = a.length <= b.length ? [a, b] : [b, a];
    return l.startsWith(s) && GRAMMAR_SUFFIX.test(l.slice(s.length));
  }
  /**
   * A forgivable spelling slip: exactly one word differs, that word has 6+ letters, it is within
   * one edit of the expected word, and the difference is not a grammatical ending.
   */
  function isSpellingSlip(expected, given) {
    const ew = expected.split(" "), gw = given.split(" ");
    if (ew.length !== gw.length) return false;
    const diff = ew.map((w, i) => [w, gw[i]]).filter(([x, y]) => x !== y);
    if (diff.length !== 1) return false;
    const [x, y] = diff[0];
    return x.length >= 6 && levenshtein(x, y) <= 1 && !grammarVariant(x, y);
  }

  /**
   * matchSpeech(transcripts, expected) -> { ok, score, best, missing }
   * Speech-to-text transcripts vary (e.g. "hello how are you" vs "Hello, how are you?").
   * We only check that the intended words were produced — NOT pronunciation quality.
   * ok when an accepted phrase matches exactly (normalized) or >= 80% of its words appear in order-insensitive overlap
   * and nothing is missing except at most one short word.
   */
  function matchSpeech(transcripts, expected) {
    const ts = (Array.isArray(transcripts) ? transcripts : [transcripts]).map(t => normalizeAnswer(t));
    const exps = (Array.isArray(expected) ? expected : [expected]);
    let best = { ok: false, score: 0, best: null, missing: [] };
    for (const e of exps) {
      const ew = normalizeAnswer(e).split(" ").filter(Boolean);
      for (const t of ts) {
        if (t === ew.join(" ")) return { ok: true, score: 1, best: e, missing: [] };
        const tw = t.split(" ");
        const pool = tw.slice();
        const missing = [];
        ew.forEach(w => {
          const i = pool.indexOf(w);
          if (i >= 0) pool.splice(i, 1); else missing.push(w);
        });
        const score = ew.length ? (ew.length - missing.length) / ew.length : 0;
        if (score > best.score) best = { ok: false, score, best: e, missing };
      }
    }
    best.ok = best.score >= 0.8 && best.missing.length <= 1;
    return best;
  }

  /** Compare an ordered list of chunks (sentence builder) to accepted sentences. */
  function checkChunks(chunks, accepted) {
    return checkTyped(chunks.join(" "), accepted, { noTypos: true, strictForm: true });
  }

  return { basic, normalizeAnswer, expandContractions, numberToWords, levenshtein, isSpellingSlip, checkTyped, matchSpeech, checkChunks };
});
