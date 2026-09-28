const test = require("node:test");
const assert = require("node:assert/strict");
const N = require("../engine/normalize.js");

test("case, punctuation and whitespace are ignored", () => {
  assert.ok(N.checkTyped("  i am  TIRED ", "I am tired.").ok);
  assert.ok(N.checkTyped("where is the bank", "Where is the bank?").ok);
  assert.ok(N.checkTyped("Hello,   Tom!!", "Hello, Tom!").ok);
});

test("curly apostrophes and contractions are equivalent", () => {
  assert.ok(N.checkTyped("I’m tired", "I am tired.").ok);
  assert.ok(N.checkTyped("she isn't here", "She is not here.").ok);
  assert.ok(N.checkTyped("I don't eat meat", "I do not eat meat.").ok);
  assert.ok(N.checkTyped("Im tired", "I'm tired").ok, "missing apostrophe tolerated");
});

test("strictForm keeps contractions distinct (contractions lesson)", () => {
  assert.equal(N.checkTyped("I am", "I'm", { strictForm: true, noTypos: true }).ok, false);
  assert.ok(N.checkTyped("I’m", "I'm", { strictForm: true }).ok);
});

test("digits and number words are equivalent", () => {
  assert.ok(N.checkTyped("13", "thirteen").ok);
  assert.ok(N.checkTyped("twenty one", "twenty-one").ok);
  assert.ok(N.checkTyped("21", "twenty-one").ok);
  assert.ok(N.checkTyped("I get up at 7", "I get up at seven.").ok);
  assert.equal(N.numberToWords(45), "forty five");
  assert.equal(N.numberToWords(100), "one hundred");
});

test("any accepted alternative counts", () => {
  const r = N.checkTyped("I'm hungry", ["I am hungry.", "I'm hungry."]);
  assert.ok(r.ok && r.exact);
});

test("one-letter typo on longer answers is accepted as 'near'", () => {
  const r = N.checkTyped("becuase", "because");
  assert.equal(r.ok, false, "transposition is 2 edits");
  const r2 = N.checkTyped("sandwic", "sandwich");
  assert.ok(r2.ok && r2.near);
  assert.equal(N.checkTyped("cat", "car").ok, false, "short words need exact spelling");
  assert.equal(N.checkTyped("sandwic", "sandwich", { noTypos: true }).ok, false);
});

test("spelling slips are forgiven inside a sentence, grammar endings are not", () => {
  assert.ok(N.checkTyped("I want a sandwic", "I want a sandwich.").near);
  assert.equal(N.checkTyped("She work in a bank", "She works in a bank.").ok, false, "-s is the lesson, not a typo");
  assert.equal(N.checkTyped("He studie English", "He studies English.").ok, false, "dropping the -s is grammar");
  assert.ok(N.checkTyped("He is an enginer", "He is an engineer.").near);
  assert.equal(N.checkTyped("Those are my shoes", "These are my shoes.").ok, false, "short confusable words must be exact");
  assert.equal(N.checkTyped("I write an email", "I wrote an email.").ok, false);
  assert.equal(N.checkTyped("two woman", "two women").ok, false);
  assert.equal(N.checkTyped("I work yesterday", "I worked yesterday.").ok, false, "-ed missing is grammar");
  assert.equal(N.checkTyped("We walked to the restaurent", "We walked to the restaurant.").ok, true);
  assert.equal(N.checkTyped("We walkd to the restaurent", "We walked to the restaurant.").ok, false, "two words differ");
});

test("wrong or empty answers are rejected", () => {
  assert.equal(N.checkTyped("", "hello").ok, false);
  assert.equal(N.checkTyped("They is late", "They are late.").ok, false);
});

test("sentence builder compares chunks exactly (no typo tolerance)", () => {
  assert.ok(N.checkChunks(["She", "is", "my", "sister"], ["She is my sister."]).ok);
  assert.equal(N.checkChunks(["She", "my", "is", "sister"], ["She is my sister."]).ok, false);
});

test("speech matching checks the intended words, tolerant to STT formatting", () => {
  assert.ok(N.matchSpeech(["hello my name is Dana"], ["Hello, my name is Dana."]).ok);
  assert.ok(N.matchSpeech(["I'm fine thank you"], ["I am fine, thank you."]).ok);
  assert.ok(N.matchSpeech(["uh I'm thirty"], ["I am thirty"]).ok, "extra filler words are fine");
  const miss = N.matchSpeech(["my name"], ["My name is Dana."]);
  assert.equal(miss.ok, false);
  assert.deepEqual(miss.missing, ["is", "dana"]);
  assert.ok(N.matchSpeech(["nothing", "my name is Dana"], "My name is Dana").ok, "any alternative transcript may match");
});

test("matchSpeech returns matched/extra alongside missing, for structured speaking feedback", () => {
  const exact = N.matchSpeech(["my name is dana"], ["My name is Dana."]);
  assert.deepEqual(exact.matched, ["my", "name", "is", "dana"]);
  assert.deepEqual(exact.extra, []);

  const filler = N.matchSpeech(["uh I'm thirty"], ["I am thirty"]);
  assert.deepEqual(filler.matched, ["i", "am", "thirty"]);
  assert.deepEqual(filler.extra, ["uh"]);
  assert.ok(filler.ok, "extra words never fail the check, only missing ones do");

  const partial = N.matchSpeech(["my name"], ["My name is Dana."]);
  assert.deepEqual(partial.matched, ["my", "name"]);
  assert.deepEqual(partial.missing, ["is", "dana"]);
  assert.deepEqual(partial.extra, []);
});

test("pickBestMatch (Conversation Engine free-text/speech reply matching)", () => {
  const choices = [
    { en: "Hi Tom! My name is Dana.", kind: "good1" },
    { en: "Hello! Nice to meet you. I'm Dana.", kind: "good2" },
    { en: "Good night, Tom.", bad: true, kind: "badGreeting" },
    { en: "I am fine.", bad: true, kind: "badFine" },
  ];

  assert.equal(N.pickBestMatch("Hi Tom, my name is Dana", choices).kind, "good1", "close paraphrase of a real choice matches");
  assert.equal(N.pickBestMatch("Good night, Tom", choices).kind, "badGreeting", "a clear match to a bad choice is still returned (caller shows why)");
  assert.equal(
    N.pickBestMatch("Hi, I am Dana", choices),
    null,
    "short bad choice 'I am fine.' would accidentally word-overlap on 'i'/'am' — must NOT be confidently picked over an unrelated intro sentence"
  );
  assert.equal(N.pickBestMatch("asdkj qwoeiu nonsense", choices), null, "no reasonable match at all -> null");
});

test("pickBestMatch: an exact short answer still matches (no false negative from the short-sentence safeguard)", () => {
  const choices = [{ en: "I am fine.", kind: "fine" }, { en: "Not so good.", kind: "notgood" }];
  assert.equal(N.pickBestMatch("I am fine", choices).kind, "fine");
  assert.equal(N.pickBestMatch("I'm fine", choices).kind, "fine", "contraction still normalizes to an exact match");
});

test("pickBestMatch supports a custom textOf accessor", () => {
  const items = [{ id: 1, label: "Coffee, please." }, { id: 2, label: "Tea, please." }];
  const got = N.pickBestMatch("Coffee, please", items, x => x.label);
  assert.equal(got.id, 1);
});
