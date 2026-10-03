/*
  curriculum/concepts.js — grammar / functional concepts as first-class objects.

  { id, level, title (Hebrew), skill (mastery dimension; default "grammar"), prerequisites: [concept ids],
    explanation (short, plain Hebrew; English inside {braces}), examples: [[en, he], ...],
    commonMistakes: [Hebrew strings], remediation: lesson id to revisit,
    drill: [extra exercise specs used for variations], vary?: rng => exercise spec (template generator) }

  Variations for remediation come from: vary() templates + drill + every curated exercise in the
  lessons that teach the concept (collected in course.js).
*/
(function (root) {
  const C = root.CURRICULUM = root.CURRICULUM || { vocabulary: [], concepts: [], units: [], lessons: [], conversations: [] };
  const pick = (rng, a) => a[Math.floor(rng() * a.length)];
  const def = c => C.concepts.push(c);

  /* ---------- shared template data ---------- */
  const BE = [["I", "am"], ["You", "are"], ["We", "are"], ["They", "are"], ["He", "is"], ["She", "is"], ["It", "is"], ["My mother", "is"], ["The kids", "are"], ["Dana and Tom", "are"]];
  const ADJ = ["tired", "happy", "hungry", "busy", "ready", "late", "cold", "sick"];
  const BE_WHY = { am: "עם {I} תמיד משתמשים ב-{am}.", is: "עם הוא / היא / זה (ושם של אדם אחד) משתמשים ב-{is}.", are: "עם {you}, {we}, {they} (ויותר מאדם אחד) משתמשים ב-{are}." };
  const PS_VERBS = [["work", "works", "in an office"], ["live", "lives", "in Haifa"], ["drink", "drinks", "coffee"], ["read", "reads", "books"], ["cook", "cooks", "dinner"], ["like", "likes", "tea"], ["speak", "speaks", "Hebrew"], ["eat", "eats", "salad"], ["watch", "watches", "TV"], ["study", "studies", "English"], ["go", "goes", "to work"]];
  const THIRD = ["He", "She", "My sister", "Tom", "My boss"];
  const PLURAL_SUBJ = ["I", "You", "We", "They", "My parents"];

  /* ======================= PRE-A1 ======================= */
  def({ id: "text-direction", level: "pre-a1", skill: "reading", title: "כיוון הכתיבה באנגלית", prerequisites: [],
    explanation: "בעברית קוראים מימין לשמאל. באנגלית קוראים וכותבים **משמאל לימין**, כמו מספרים. באנגלית יש אותיות גדולות (בתחילת משפט ובשמות) ואותיות קטנות.",
    examples: [["Hello", "שלום — קוראים מ-H ועד o, משמאל לימין"], ["Dana", "שם תמיד מתחיל באות גדולה"]],
    commonMistakes: ["לקרוא מילה מהסוף להתחלה — באנגלית מתחילים משמאל.", "לכתוב שם באות קטנה: {dana} ← {Dana}."],
    remediation: "pa-intro",
    drill: [
      { mc: "מאיפה מתחילים לקרוא את {Hello}?", a: "משמאל (מהאות H)", o: ["מימין (מהאות o)"], why: "באנגלית קוראים משמאל לימין." },
      { mc: "איזו מילה כתובה נכון כשם של אדם?", a: "Dana", o: ["dana", "dANA"], why: "שמות של אנשים מתחילים באות גדולה." },
      { mc: "איזה משפט מתחיל נכון?", a: "My name is Tom.", o: ["my name is Tom."], why: "משפט באנגלית מתחיל באות גדולה." },
    ] });

  def({ id: "alphabet-letters", level: "pre-a1", skill: "reading", title: "האלף-בית האנגלי", prerequisites: ["text-direction"],
    explanation: "באנגלית יש 26 אותיות. לכל אות יש צורה גדולה וצורה קטנה: {A a}, {B b}, {C c}. לכל אות יש גם **שם** (איך קוראים לה) — למשל לאות {B} קוראים \"בִּי\".",
    examples: [["A a", "אֵיי"], ["B b", "בִּי"], ["C c", "סִי"], ["D d", "דִּי"]],
    commonMistakes: ["לבלבל בין {b} ל-{d} — הבטן של {b} פונה ימינה.", "לבלבל בין {p} ל-{q}."],
    remediation: "pa-abc-1",
    drill: [
      { mc: "מה האות הקטנה של {G}?", a: "g", o: ["q", "j"], why: "{G} גדולה ← {g} קטנה." },
      { mc: "מה האות הגדולה של {e}?", a: "E", o: ["F", "B"], why: "{e} קטנה ← {E} גדולה." },
      { mc: "מה האות הקטנה של {D}?", a: "d", o: ["b", "p"], why: "{D} ← {d}. הבטן של {d} פונה שמאלה." },
      { mc: "מה האות הגדולה של {r}?", a: "R", o: ["P", "K"], why: "{r} ← {R}." },
      { lis: "M", a: "M", o: ["N", "W"], why: "שמעת את השם של האות {M} (\"אֶם\")." },
    ] });

  def({ id: "letter-sounds", level: "pre-a1", skill: "listening", title: "אותיות וצלילים", prerequisites: ["alphabet-letters"],
    explanation: "לאות יש שם, אבל בתוך מילה היא נשמעת כ**צליל**. למשל לאות {B} קוראים \"בִּי\", אבל ב-{bag} שומעים רק \"בּ\". זה עוזר לנחש איך לקרוא מילה חדשה.",
    examples: [["B — bag", "בּ כמו בתיק"], ["M — milk", "מ כמו בחלב"], ["S — sun", "ס כמו בשמש"], ["T — tea", "ט כמו בתה"]],
    commonMistakes: ["לקרוא את שם האות במקום הצליל: {bag} זה לא \"בִּי-אֵיי-גִ'י\".", "{c} יכולה להישמע כמו ק ({cat}) או כמו ס ({city})."],
    remediation: "pa-abc-2",
    drill: [
      { mc: "באיזו אות מתחילה המילה {milk}?", a: "M", o: ["N", "W"], why: "{milk} מתחילה בצליל \"מ\" — האות {M}." },
      { mc: "באיזו אות מתחילה המילה {tea}?", a: "T", o: ["D", "P"], why: "{tea} מתחילה בצליל \"ט\" — האות {T}." },
      { mc: "באיזו אות מתחילה המילה {sun}?", a: "S", o: ["Z", "C"], why: "{sun} מתחילה ב-{S}." },
      { mc: "באיזו אות מתחילה המילה {fish}?", a: "F", o: ["V", "P"], why: "{fish} מתחילה בצליל \"פ\" רכה — האות {F}." },
    ] });

  def({ id: "spelling", level: "pre-a1", skill: "writing", title: "איות מילים", prerequisites: ["letter-sounds"],
    explanation: "לאיית = להגיד את האותיות של מילה אחת אחרי השנייה. שואלים: {How do you spell it?} (איך מאייתים את זה?). עונים עם שמות האותיות: {D-A-N-A}.",
    examples: [["How do you spell your name?", "איך מאייתים את השם שלך?"], ["D-A-N-A", "דָּנָה באותיות"], ["C-A-T", "cat — חתול"]],
    commonMistakes: ["לשכוח אות שקטה: {name} נגמרת ב-{e} למרות שלא שומעים אותה.", "לכתוב {kat} במקום {cat}."],
    remediation: "pa-abc-4",
    drill: [
      { mc: "איך מאייתים {bag}?", a: "B-A-G", o: ["B-E-G", "B-A-K"], why: "{bag} = {B-A-G}." },
      { mc: "איך מאייתים {pen}?", a: "P-E-N", o: ["P-A-N", "B-E-N"], why: "{pen} = {P-E-N}." },
      { lt: "cat", why: "{cat} = {C-A-T}." },
      { lt: "sun", why: "{sun} = {S-U-N}." },
    ] });

  def({ id: "greetings", level: "pre-a1", skill: "vocabulary", title: "ברכות: שלום ולהתראות", prerequisites: [],
    explanation: "{Hello} הוא \"שלום\" רגיל, ו-{Hi} יותר חברי. בבוקר אומרים {Good morning}, בערב {Good evening}, וכשהולכים לישון {Good night}. כשנפרדים: {Goodbye} או {Bye}.",
    examples: [["Hello, Tom!", "שלום, טום!"], ["Good morning!", "בוקר טוב!"], ["Bye, see you later!", "ביי, נתראה אחר כך!"]],
    commonMistakes: ["{Good night} זה רק כשנפרדים בלילה — לא כשנפגשים בערב. כשנפגשים בערב: {Good evening}."],
    remediation: "pa-greet-1",
    drill: [
      { npc: "Good morning!", a: "Good morning!", o: ["Good night!", "Goodbye!"], why: "עונים לברכה באותה ברכה: {Good morning}." },
      { mc: "נפגשים עם מישהו בשמונה בערב. מה אומרים?", a: "Good evening", o: ["Good night", "Good morning"], why: "{Good night} זה רק לפרידה. כשנפגשים בערב: {Good evening}." },
      { mc: "איך נפרדים?", a: "Goodbye", o: ["Hello", "Hi"], why: "{Goodbye} = להתראות." },
    ] });

  def({ id: "introductions", level: "pre-a1", skill: "vocabulary", title: "להציג את עצמי", prerequisites: ["greetings"],
    explanation: "כדי להציג את עצמך אומרים {My name is ...} (קוראים לי...). כשפוגשים מישהו חדש אומרים {Nice to meet you} (נעים להכיר). כדי לשאול מה שלום מישהו: {How are you?} והתשובה הנפוצה: {I am fine, thank you}.",
    examples: [["My name is Dana.", "קוראים לי דנה."], ["Nice to meet you.", "נעים להכיר."], ["How are you? — I am fine, thanks.", "מה שלומך? — אני בסדר, תודה."]],
    commonMistakes: ["לומר {My name Dana} בלי {is}. תמיד: {My name is Dana}.", "לענות על {How are you?} עם השם שלך."],
    remediation: "pa-greet-2",
    drill: [
      { npc: "How are you?", a: "I am fine, thank you.", o: ["My name is Dana.", "Good night."], why: "על {How are you?} עונים איך מרגישים: {I am fine}." },
      { npc: "Hi, I'm Tom.", a: "Nice to meet you, Tom.", o: ["Goodbye, Tom.", "I am fine."], why: "כשמישהו מציג את עצמו אומרים {Nice to meet you}." },
      { build: "My name is Dana.", he: "קוראים לי דנה.", why: "הסדר: {My name is} + שם." },
      { fill: "My name ___ Tom.", a: "is", o: ["am", "are"], why: "אומרים תמיד {My name is}." },
    ] });

  def({ id: "polite-words", level: "pre-a1", skill: "vocabulary", title: "מילות נימוס", prerequisites: ["greetings"],
    explanation: "{Please} = בבקשה (כשמבקשים משהו). {Thank you} = תודה. {Sorry} = סליחה, כשמתנצלים. {Excuse me} = סליחה, כשפונים לאדם זר או רוצים לעבור.",
    examples: [["Water, please.", "מים, בבקשה."], ["Thank you very much!", "תודה רבה!"], ["Excuse me, where is the bank?", "סליחה, איפה הבנק?"], ["Sorry, I am late.", "סליחה, איחרתי."]],
    commonMistakes: ["לומר {Sorry} כשפונים לאדם ברחוב — עדיף {Excuse me}.", "בעברית \"בבקשה\" גם כשנותנים משהו; באנגלית כשנותנים אומרים {Here you are}."],
    remediation: "pa-greet-3",
    drill: [
      { mc: "רוצה לשאול אדם זר ברחוב שאלה. מה אומרים קודם?", a: "Excuse me", o: ["Sorry", "Thank you"], why: "לפנייה לאדם זר: {Excuse me}." },
      { mc: "דרכת למישהו על הרגל. מה אומרים?", a: "Sorry!", o: ["Please!", "Excuse me, where is it?"], why: "כשמתנצלים: {Sorry}." },
      { npc: "Here is your coffee.", a: "Thank you!", o: ["Sorry!", "Goodbye!"], why: "כשמקבלים משהו אומרים {Thank you}." },
    ] });

  def({ id: "numbers-0-10", level: "pre-a1", skill: "vocabulary", title: "מספרים 0–10", prerequisites: ["alphabet-letters"],
    explanation: "המספרים באנגלית לא משתנים לפי זכר ונקבה (בעברית \"שתיים/שניים\" — באנגלית תמיד {two}). {zero}=0, {one}=1 ... {ten}=10.",
    examples: [["one, two, three", "אחת, שתיים, שלוש"], ["I have two cats.", "יש לי שני חתולים."]],
    commonMistakes: ["לבלבל בין {two} (2) ל-{too} (גם) — נשמעים אותו דבר, אבל נכתבים אחרת."],
    remediation: "pa-num-1",
    drill: [
      { lis: "seven", a: "7", o: ["6", "11"], why: "{seven} = 7." },
      { lis: "three", a: "3", o: ["8", "13"], why: "{three} = 3." },
      { mc: "{five} + {four} = ?", a: "nine", o: ["eight", "ten"], why: "5+4=9 = {nine}.", audio: "five plus four" },
      { lt: "eight", why: "8 = {eight} (ה-gh לא נשמעת)." },
    ] });

  def({ id: "numbers-11-20", level: "pre-a1", skill: "vocabulary", title: "מספרים 11–20 (teen)", prerequisites: ["numbers-0-10"],
    explanation: "{eleven} ו-{twelve} מיוחדים. מ-13 עד 19 מוסיפים {-teen}: {thirteen}, {fourteen}... הדגש בסוף: thir-**TEEN**. אל תבלבלי עם העשרות: {thirty} (30) — הדגש בהתחלה: **THIR**-ty.",
    examples: [["thirteen — 13", "שלוש-עשרה"], ["thirty — 30", "שלושים"], ["fifteen — 15", "חמש-עשרה"]],
    commonMistakes: ["לבלבל {fifteen} (15) עם {fifty} (50).", "לכתוב {fiveteen} — הנכון {fifteen}."],
    remediation: "pa-num-2",
    drill: [
      { lis: "fourteen", a: "14", o: ["40", "4"], why: "{-teen} בסוף = 13–19. {fourteen}=14." },
      { lis: "sixteen", a: "16", o: ["60", "6"], why: "{sixteen}=16. {sixty}=60." },
      { mc: "איך כותבים 15?", a: "fifteen", o: ["fiveteen", "fifty"], why: "15 = {fifteen}, לא {fiveteen}." },
      { lt: "twelve", why: "12 = {twelve}." },
    ] });

  def({ id: "numbers-tens", level: "pre-a1", skill: "vocabulary", title: "עשרות ומספרים עד 100", prerequisites: ["numbers-11-20"],
    explanation: "העשרות נגמרות ב-{-ty}: {twenty} (20), {thirty} (30) ... {ninety} (90). מספר כמו 45 = עשרות + יחידות עם מקף: {forty-five}. 100 = {one hundred}.",
    examples: [["twenty-one — 21", "עשרים ואחת"], ["forty-five — 45", "ארבעים וחמש"], ["one hundred — 100", "מאה"]],
    commonMistakes: ["לכתוב {fourty} — הנכון {forty} (בלי u).", "לומר {twenty and one} — באנגלית פשוט {twenty-one}."],
    remediation: "pa-num-3",
    vary: rng => { const t = pick(rng, [[2, "twenty"], [3, "thirty"], [4, "forty"], [5, "fifty"], [6, "sixty"], [7, "seventy"], [8, "eighty"], [9, "ninety"]]); const o = pick(rng, [[1, "one"], [2, "two"], [3, "three"], [4, "four"], [5, "five"], [6, "six"], [7, "seven"], [8, "eight"], [9, "nine"]]); const n = t[0] * 10 + o[0]; return { lis: t[1] + "-" + o[1], a: String(n), o: [String(o[0] * 10 + t[0]), String(t[0] * 10)], why: "{" + t[1] + "-" + o[1] + "} = " + n + ": קודם העשרות ({" + t[1] + "}) ואז היחידות ({" + o[1] + "})." }; },
    drill: [
      { mc: "איך כותבים 40?", a: "forty", o: ["fourty", "fourteen"], why: "40 = {forty} — בלי u." },
      { lt: "fifty-five", a: ["55"], why: "55 = {fifty-five}." },
    ] });

  def({ id: "colors-before-nouns", level: "pre-a1", title: "צבע לפני שם העצם", prerequisites: ["alphabet-letters"],
    explanation: "בעברית אומרים \"תיק שחור\" — קודם הדבר ואז הצבע. באנגלית **הפוך**: קודם הצבע ואז הדבר: {a black bag}. וגם: הצבע לא משתנה ברבים — {black bags}, לא {blacks bags}.",
    examples: [["a red car", "מכונית אדומה"], ["a black bag", "תיק שחור"], ["green apples", "תפוחים ירוקים"]],
    commonMistakes: ["לומר {a car red} בסדר של עברית. הנכון: {a red car}.", "להוסיף s לצבע: {reds apples} ← {red apples}."],
    remediation: "pa-colors",
    drill: [
      { build: "a blue car", he: "מכונית כחולה", why: "באנגלית הצבע בא לפני הדבר: {a blue car}." },
      { err: "I have a bag black.", a: "I have a black bag.", o: ["I have black a bag."], why: "הצבע לפני שם העצם: {a black bag}." },
      { fill: "I like ___ apples.", a: "green", o: ["greens"], why: "צבע לא מקבל s ברבים." },
      { build: "a white cup", he: "כוס לבנה", why: "הצבע לפני הדבר." },
    ] });

  def({ id: "i-plus-verb", level: "pre-a1", title: "אני + פועל", prerequisites: ["introductions"],
    explanation: "כדי לספר מה את עושה, שמים {I} (אני) ואחריו פועל: {I eat}, {I drink}, {I work}. הפועל לא משתנה לפי זכר ונקבה — {I work} זה גם \"אני עובד\" וגם \"אני עובדת\".",
    examples: [["I drink coffee.", "אני שותה קפה."], ["I live in Tel Aviv.", "אני גרה בתל אביב."], ["I like tea.", "אני אוהבת תה."]],
    commonMistakes: ["להוסיף {am}: {I am eat} — לא צריך. פשוט {I eat}.", "לכתוב {i} באות קטנה — {I} תמיד גדולה."],
    remediation: "pa-actions",
    drill: [
      { err: "I am drink water.", a: "I drink water.", o: ["I drinking water."], why: "עם פועל רגיל לא צריך {am}: {I drink}." },
      { build: "I eat bread.", he: "אני אוכלת לחם.", why: "{I} + פועל + מה." },
      { build: "I live in Haifa.", he: "אני גרה בחיפה.", why: "{I} + {live} + {in} + מקום." },
    ] });

  /* ======================= A1 ======================= */
  def({ id: "subject-pronouns", level: "a1", title: "כינויי גוף: I, you, he, she, it, we, they", prerequisites: ["introductions"],
    explanation: "{I}=אני, {you}=אתה/את/אתם/אתן (אותה מילה לכולם!), {he}=הוא, {she}=היא, {it}=זה/זו — לדבר או לחיה, {we}=אנחנו, {they}=הם/הן. באנגלית {I} תמיד באות גדולה.",
    examples: [["She is my sister.", "היא אחותי."], ["It is a book.", "זה ספר."], ["They are my friends.", "הם החברים שלי."]],
    commonMistakes: ["להשתמש ב-{he}/{she} לדבר — לחפץ אומרים {it}: {The table? It is big}.", "לחשוב ש-{you} זה רק יחיד — זה גם רבים."],
    remediation: "a1-pron",
    drill: [
      { mc: "{Dana} ← ?", a: "she", o: ["he", "it"], why: "דנה היא אישה ← {she}." },
      { mc: "{Tom and I} ← ?", a: "we", o: ["they", "you"], why: "אני + עוד מישהו = אנחנו ← {we}." },
      { mc: "{the phone} ← ?", a: "it", o: ["he", "she"], why: "לחפץ אומרים {it}." },
      { mc: "{my parents} ← ?", a: "they", o: ["we", "he"], why: "הם ← {they}." },
    ] });

  def({ id: "be-i-am", level: "a1", title: "I am — אני (הוא / נמצא)", prerequisites: ["subject-pronouns"],
    explanation: "בעברית אומרים \"אני עייפה\" בלי פועל. באנגלית חייבים מילה שמחברת: {I am tired}. {am} הולך **רק** עם {I}. משתמשים בו לשם, גיל, רגש, מקצוע ומקום: {I am Dana}, {I am 30}, {I am at home}.",
    examples: [["I am tired.", "אני עייפה."], ["I am a teacher.", "אני מורה."], ["I am at home.", "אני בבית."], ["I am thirty.", "אני בת שלושים."]],
    commonMistakes: ["לדלג על {am}: {I tired} ← {I am tired}.", "לשים {is} עם {I}: {I is} ← {I am}."],
    remediation: "a1-be-1",
    vary: rng => { const adj = pick(rng, ADJ); return { fill: "I ___ " + adj + ".", a: "am", o: ["is", "are"], why: BE_WHY.am }; },
    drill: [
      { err: "I tired.", a: "I am tired.", o: ["I is tired."], why: "באנגלית חייבים {am}: {I am tired}." },
      { tr: "אני רעבה.", a: ["I am hungry.", "I'm hungry."], why: "\"אני רעבה\" = {I am hungry}." },
    ] });

  def({ id: "be-you-we-they-are", level: "a1", title: "you / we / they are — עם are", prerequisites: ["be-i-am"],
    explanation: "עם {you}, {we}, {they} משתמשים ב-{are}: {You are nice}, {We are friends}, {They are at work}. גם כשמדברים על כמה אנשים בשם: {Dana and Tom are here}.",
    examples: [["You are late.", "את מאחרת."], ["We are friends.", "אנחנו חברות."], ["They are at work.", "הם בעבודה."]],
    commonMistakes: ["{We is} ← {We are}.", "{They am} ← {They are}."],
    remediation: "a1-be-2",
    vary: rng => { const s = pick(rng, [["You", "are"], ["We", "are"], ["They", "are"], ["Dana and Tom", "are"]]); const adj = pick(rng, ADJ); return { fill: s[0] + " ___ " + adj + ".", a: "are", o: ["is", "am"], why: BE_WHY.are }; },
    drill: [
      { err: "We is friends.", a: "We are friends.", o: ["We am friends."], why: BE_WHY.are },
      { tr: "הם בבית.", a: ["They are at home.", "They're at home."], why: "הם = {they} + {are}; בבית = {at home}." },
    ] });

  def({ id: "be-he-she-it-is", level: "a1", title: "he / she / it is — כל הטבלה של to be", prerequisites: ["be-you-we-they-are"],
    explanation: "עם {he}, {she}, {it} (ואדם אחד או דבר אחד) משתמשים ב-{is}. הטבלה המלאה: {I am} · {you are} · {he / she / it is} · {we are} · {they are}.",
    examples: [["She is a doctor.", "היא רופאה."], ["He is from Israel.", "הוא מישראל."], ["It is cold.", "קר. (מילולית: זה קר)"], ["My mother is at home.", "אמא שלי בבית."]],
    commonMistakes: ["{She are} ← {She is}.", "לשכוח את {It} במזג אוויר: {Is cold} ← {It is cold}."],
    remediation: "a1-be-3",
    vary: rng => { const s = pick(rng, BE); const adj = pick(rng, ADJ); return { fill: s[0] + " ___ " + adj + ".", a: s[1], o: ["am", "is", "are"].filter(x => x !== s[1]), why: BE_WHY[s[1]] }; },
    drill: [
      { err: "She are a nurse.", a: "She is a nurse.", o: ["She am a nurse."], why: BE_WHY.is },
      { tr: "הוא עייף.", a: ["He is tired.", "He's tired."], why: "הוא = {he} + {is}." },
      { err: "Is cold today.", a: "It is cold today.", o: ["It cold today."], why: "במזג אוויר מתחילים ב-{It is}." },
    ] });

  def({ id: "be-contractions", level: "a1", title: "קיצורים: I'm, you're, she's", prerequisites: ["be-he-she-it-is"],
    explanation: "בדיבור מקצרים: {I am} ← {I'm}, {you are} ← {you're}, {he is} ← {he's}, {she is} ← {she's}, {it is} ← {it's}, {we are} ← {we're}, {they are} ← {they're}. הגרש (') מחליף את האות שנעלמה. שתי הצורות נכונות.",
    examples: [["I'm fine.", "אני בסדר."], ["She's my friend.", "היא חברה שלי."], ["They're late.", "הם מאחרים."]],
    commonMistakes: ["לכתוב {Im} בלי גרש.", "לבלבל {it's} (זה) עם {its} (שלו, של חפץ)."],
    remediation: "a1-be-4",
    vary: rng => { const p = pick(rng, [["I am", "I'm"], ["You are", "You're"], ["He is", "He's"], ["She is", "She's"], ["It is", "It's"], ["We are", "We're"], ["They are", "They're"]]); const others = ["I'm", "You're", "He's", "She's", "We're", "They're", "It's"].filter(x => x !== p[1]); return { mc: "מה הקיצור של {" + p[0] + "}?", a: p[1], o: [pick(rng, others), p[0].split(" ")[0] + "s"].filter(x => x !== p[1]), why: "{" + p[0] + "} ← {" + p[1] + "}.", strict: true }; },
    drill: [
      { fill: "___ tired. (I am)", a: "I'm", o: ["Im", "I's"], why: "{I am} ← {I'm} עם גרש.", strict: true },
    ] });

  def({ id: "be-negative", level: "a1", title: "שלילה: I am not, she isn't", prerequisites: ["be-contractions"],
    explanation: "כדי לשלול מוסיפים {not} **אחרי** {am/is/are}: {I am not tired}. בקיצור: {is not} ← {isn't}, {are not} ← {aren't}. עם {I} אומרים {I'm not} (אין {amn't}).",
    examples: [["I am not hungry.", "אני לא רעבה."], ["He isn't at home.", "הוא לא בבית."], ["We aren't late.", "אנחנו לא מאחרים."]],
    commonMistakes: ["לשים {not} לפני הפועל: {I not am} ← {I am not}.", "{She don't happy} ← {She isn't happy}. ({don't} לא הולך עם {to be})."],
    remediation: "a1-be-5",
    vary: rng => { const s = pick(rng, BE.slice(1)); const adj = pick(rng, ADJ); const neg = s[1] === "is" ? "isn't" : "aren't"; return { fill: s[0] + " ___ " + adj + ".", a: neg, o: ["don't", s[1] === "is" ? "aren't" : "isn't"], why: "שלילה של {" + s[1] + "} היא {" + neg + "} (" + s[1] + " not). {don't} לא הולך עם {to be}." }; },
    drill: [
      { err: "I not am busy.", a: "I am not busy.", o: ["I amn't busy."], why: "{not} בא אחרי {am}: {I am not}." },
      { tr: "היא לא בבית.", a: ["She is not at home.", "She isn't at home.", "She's not at home."], why: "{She is not} / {She isn't} + {at home}." },
    ] });

  def({ id: "be-questions", level: "a1", title: "שאלות: Are you...? Is she...?", prerequisites: ["be-negative"],
    explanation: "בשאלה מחליפים סדר: {am/is/are} עובר **לפני** הנושא. {You are tired} ← {Are you tired?}. תשובה קצרה: {Yes, I am.} / {No, I'm not.}",
    examples: [["Are you ready?", "את מוכנה?"], ["Is he a doctor?", "הוא רופא?"], ["Yes, he is. / No, he isn't.", "כן. / לא."]],
    commonMistakes: ["לשאול רק עם טון: {You are ready?} — בכתיבה ובשאלה נכונה: {Are you ready?}", "בתשובה קצרה חיובית לא מקצרים: {Yes, I'm} ← {Yes, I am}."],
    remediation: "a1-be-6",
    vary: rng => { const s = pick(rng, [["you", "Are"], ["he", "Is"], ["she", "Is"], ["they", "Are"], ["it", "Is"], ["we", "Are"]]); const adj = pick(rng, ADJ); return { build: s[1] + " " + s[0] + " " + adj + "?", why: "בשאלה {" + s[1].toLowerCase() + "} עובר לפני הנושא." }; },
    drill: [
      { err: "You are ready?", a: "Are you ready?", o: ["Ready you are?"], why: "בשאלה {Are} בא ראשון." },
      { npc: "Are you from Israel?", a: "Yes, I am.", o: ["Yes, I'm.", "Yes, I is."], why: "תשובה קצרה: {Yes, I am} — בלי קיצור בסוף." },
    ] });

  def({ id: "word-order-svo", level: "a1", title: "סדר המילים: מי + עושה + מה", prerequisites: ["i-plus-verb", "subject-pronouns"],
    explanation: "משפט באנגלית בנוי כמעט תמיד כך: **נושא** (מי) + **פועל** (עושה) + **מושא** (מה). {I drink coffee}. בעברית אפשר לשחק עם הסדר (\"קפה אני שותה\"), באנגלית לא. מקום וזמן באים בסוף: {I drink coffee at home}.",
    examples: [["We eat pizza.", "אנחנו אוכלים פיצה."], ["They speak Hebrew.", "הם מדברים עברית."], ["I read a book at night.", "אני קוראת ספר בלילה."]],
    commonMistakes: ["{Coffee I drink} ← {I drink coffee}.", "לשכוח את הנושא: {Drink coffee} ← {I drink coffee}."],
    remediation: "a1-svo",
    vary: rng => { const s = pick(rng, PLURAL_SUBJ); const v = pick(rng, PS_VERBS.slice(0, 9)); return { build: s + " " + v[0] + " " + v[2] + ".", why: "הסדר: נושא ({" + s + "}) + פועל ({" + v[0] + "}) + השאר." }; },
    drill: [
      { err: "Coffee I drink.", a: "I drink coffee.", o: ["I coffee drink."], why: "נושא + פועל + מושא." },
    ] });

  def({ id: "articles-a-an", level: "a1", title: "a / an — \"אחד\" לפני שם עצם", prerequisites: ["be-he-she-it-is"],
    explanation: "לפני דבר אחד (שאפשר לספור) שמים {a} או {an}. {a} לפני צליל עיצור: {a book}, {a car}. {an} לפני צליל תנועה (a, e, i, o, u): {an apple}, {an engineer}. גם במקצועות: {She is a doctor} — בעברית אין מילה כזו, באנגלית חייבים.",
    examples: [["a book", "ספר"], ["an apple", "תפוח"], ["She is an engineer.", "היא מהנדסת."], ["He is a nurse.", "הוא אח."]],
    commonMistakes: ["לשכוח את {a} במקצוע: {I am teacher} ← {I am a teacher}.", "{a apple} ← {an apple}.", "לשים {a} לפני רבים: {a books} ← {books}."],
    remediation: "a1-art-1",
    vary: rng => { const w = pick(rng, [["apple", "an"], ["egg", "an"], ["engineer", "an"], ["umbrella", "an"], ["office", "an"], ["book", "a"], ["car", "a"], ["doctor", "a"], ["phone", "a"], ["banana", "a"], ["key", "a"]]); return { fill: "It is ___ " + w[0] + ".", a: w[1], o: [w[1] === "a" ? "an" : "a"], why: w[1] === "an" ? "{" + w[0] + "} מתחילה בצליל תנועה ← {an}." : "{" + w[0] + "} מתחילה בצליל עיצור ← {a}." }; },
    drill: [
      { err: "I am teacher.", a: "I am a teacher.", o: ["I am an teacher."], why: "לפני מקצוע ביחיד שמים {a}/{an}." },
      { tr: "היא רופאה.", a: ["She is a doctor.", "She's a doctor."], why: "מקצוע ביחיד: {a doctor}." },
    ] });

  def({ id: "article-the", level: "a1", title: "the — ה׳ הידיעה", prerequisites: ["articles-a-an"],
    explanation: "{the} = ה׳ הידיעה. משתמשים כשברור על איזה דבר מדברים: {I have a car. The car is red.} (בפעם הראשונה {a}, אחר כך {the}). גם לדברים שיש רק אחד: {the sun}. {the} לא משתנה ביחיד וברבים.",
    examples: [["The door is open.", "הדלת פתוחה."], ["I have a cat. The cat is black.", "יש לי חתול. החתול שחור."], ["Close the window, please.", "סגרי את החלון, בבקשה."]],
    commonMistakes: ["לשים {the} לפני שם של אדם או עיר: {the Tel Aviv} ← {Tel Aviv}.", "לשים {the} בדיבור כללי: {I like the coffee} (אוהבת קפה באופן כללי) ← {I like coffee}."],
    remediation: "a1-art-2",
    drill: [
      { fill: "I have a dog. ___ dog is big.", a: "The", o: ["A", "An"], why: "בפעם השנייה כבר ברור על איזה כלב מדובר ← {The}." },
      { err: "I live in the Haifa.", a: "I live in Haifa.", o: ["I live in a Haifa."], why: "לפני שם של עיר לא שמים {the}." },
      { fill: "Open ___ door, please.", a: "the", o: ["a", "an"], why: "ברור על איזו דלת מדובר ← {the}." },
      { err: "I like the coffee in general.", a: "I like coffee in general.", o: ["I like a coffee in general."], why: "כשמדברים באופן כללי לא שמים {the}." },
    ] });

  def({ id: "plural-regular", level: "a1", title: "רבים: book → books", prerequisites: ["articles-a-an"],
    explanation: "לרוב מוסיפים {s}: {book} ← {books}. אחרי {s, sh, ch, x} מוסיפים {es}: {glass} ← {glasses}, {watch} ← {watches}. עיצור + {y} ← {ies}: {baby} ← {babies}. וברבים לא שמים {a}.",
    examples: [["two books", "שני ספרים"], ["three watches", "שלושה שעונים"], ["two babies", "שני תינוקות"]],
    commonMistakes: ["{two book} ← {two books}.", "{watchs} ← {watches}.", "{babys} ← {babies}."],
    remediation: "a1-plural-1",
    vary: rng => { const w = pick(rng, [["book", "books"], ["car", "cars"], ["key", "keys"], ["watch", "watches"], ["bus", "buses"], ["box", "boxes"], ["baby", "babies"], ["city", "cities"], ["glass", "glasses"], ["apple", "apples"]]); const n = pick(rng, ["two", "three", "five"]); return { fill: n + " ___", a: w[1], o: [w[0], w[0].replace(/y$/, "") + "ys", w[0] + "es"].filter(x => x !== w[1]).slice(0, 2), why: "רבים של {" + w[0] + "} הוא {" + w[1] + "}." }; },
    drill: [
      { tr: "שלושה ספרים", a: ["three books", "3 books"], why: "רבים: {book} ← {books}." },
    ] });

  def({ id: "plural-irregular", level: "a1", title: "רבים מיוחדים: man → men", prerequisites: ["plural-regular"],
    explanation: "כמה מילים חשובות משנות צורה ברבים — צריך פשוט לזכור אותן: {man} ← {men}, {woman} ← {women}, {child} ← {children}, {person} ← {people}, {foot} ← {feet}, {tooth} ← {teeth}.",
    examples: [["two women", "שתי נשים"], ["three children", "שלושה ילדים"], ["many people", "הרבה אנשים"]],
    commonMistakes: ["{childs} ← {children}.", "{peoples} ← {people}.", "{womans} ← {women}."],
    remediation: "a1-plural-2",
    vary: rng => { const w = pick(rng, [["man", "men", "mans"], ["woman", "women", "womans"], ["child", "children", "childs"], ["person", "people", "persons"], ["foot", "feet", "foots"], ["tooth", "teeth", "tooths"]]); return { fill: "two ___ (" + w[0] + ")", a: w[1], o: [w[2]], why: "{" + w[0] + "} ← {" + w[1] + "} (רבים מיוחד)." }; },
    drill: [
      { err: "I have two childs.", a: "I have two children.", o: ["I have two child."], why: "רבים של {child} הוא {children}." },
    ] });

  def({ id: "possessive-adjectives", level: "a1", title: "שלי, שלך: my, your, his, her", prerequisites: ["be-he-she-it-is"],
    explanation: "בעברית \"הספר שלי\" — באנגלית המילה באה **לפני** הדבר: {my book}. {my}=שלי, {your}=שלך/שלכם, {his}=שלו, {her}=שלה, {its}=שלו/שלה (של חפץ/חיה), {our}=שלנו, {their}=שלהם.",
    examples: [["my phone", "הטלפון שלי"], ["her brother", "אח שלה"], ["our house", "הבית שלנו"], ["What is your name?", "מה השם שלך?"]],
    commonMistakes: ["{the phone my} ← {my phone}.", "לבלבל {his} (שלו) ו-{her} (שלה).", "{he brother} ← {his brother}."],
    remediation: "a1-poss-1",
    vary: rng => { const p = pick(rng, [["Dana", "her"], ["Tom", "his"], ["we", "our"], ["they", "their"], ["I", "my"], ["you", "your"]]); const n = pick(rng, ["bag", "phone", "car", "house", "friend"]); return { mc: "{" + p[0] + "} ← ___ " + n, a: p[1], o: ["his", "her", "our", "their", "my"].filter(x => x !== p[1]).slice(0, 2), why: "{" + p[0] + "} ← {" + p[1] + "}." }; },
    drill: [
      { err: "This is the car my.", a: "This is my car.", o: ["This is car my."], why: "{my} בא לפני הדבר." },
    ] });

  def({ id: "possessive-s", level: "a1", title: "השייכות 's: Dana's car", prerequisites: ["possessive-adjectives"],
    explanation: "כדי להגיד של מי משהו, מוסיפים לשם {'s}: {Dana's car} = המכונית של דנה. הסדר: קודם הבעלים, ואז הדבר. ברבים שנגמר ב-s מוסיפים רק גרש: {my parents' house}.",
    examples: [["Dana's phone", "הטלפון של דנה"], ["my sister's husband", "הבעל של אחותי"], ["Tom's office", "המשרד של טום"]],
    commonMistakes: ["{the car of Dana} (בסדר של עברית) ← {Dana's car}.", "לשכוח את הגרש: {Danas car} ← {Dana's car}."],
    remediation: "a1-poss-2",
    drill: [
      { tr: "הבית של אמא שלי", a: ["my mother's house", "my mom's house"], why: "{my mother's} + {house}." },
      { err: "This is the book of Tom.", a: "This is Tom's book.", o: ["This is Toms book."], why: "באנגלית: {Tom's book}." },
    ] });

  def({ id: "demonstratives", level: "a1", title: "זה והוא: this / that / these / those", prerequisites: ["plural-regular", "be-questions"],
    explanation: "{this}=זה/זאת (קרוב, יחיד). {that}=ההוא/ההיא (רחוק, יחיד). {these}=אלה (קרוב, רבים). {those}=ההם (רחוק, רבים). הפועל מתאים: {This is}, {These are}.",
    examples: [["This is my phone.", "זה הטלפון שלי."], ["That is my car.", "ההיא המכונית שלי (שם, רחוק)."], ["These are my keys.", "אלה המפתחות שלי."], ["Those are my shoes.", "ההן הנעליים שלי."]],
    commonMistakes: ["{This are my keys} ← {These are my keys}.", "{These is} ← {These are}."],
    remediation: "a1-this",
    vary: rng => { const x = pick(rng, [["book", "This", "near"], ["books", "These", "near"], ["car", "That", "far"], ["cars", "Those", "far"]]); return { fill: "___ " + (x[0].endsWith("s") ? "are" : "is") + " my " + x[0] + ". (" + (x[2] === "near" ? "קרוב" : "רחוק") + ")", a: x[1], o: ["This", "These", "That", "Those"].filter(y => y !== x[1]).slice(0, 2), why: "{" + x[1] + "}: " + (x[2] === "near" ? "קרוב" : "רחוק") + ", " + (x[0].endsWith("s") ? "רבים" : "יחיד") + "." }; },
    drill: [
      { err: "This are my keys.", a: "These are my keys.", o: ["This is my keys."], why: "רבים וקרוב ← {These are}." },
    ] });

  def({ id: "there-is-are", level: "a1", title: "יש: there is / there are", prerequisites: ["plural-regular", "be-questions"],
    explanation: "כדי להגיד ש\"יש\" משהו במקום: {There is} + יחיד, {There are} + רבים. {There is a bank near here}. {There are two rooms}. שאלה: {Is there...?} / {Are there...?}. (ל\"יש לי\" משתמשים ב-{I have}, לא ב-{there is}.)",
    examples: [["There is a park near here.", "יש פארק קרוב לכאן."], ["There are three bedrooms.", "יש שלושה חדרי שינה."], ["Is there a bank here?", "יש פה בנק?"]],
    commonMistakes: ["{There is two rooms} ← {There are two rooms}.", "{There is to me a car} (בסגנון עברי) ← {I have a car}.", "{Have a bank here?} ← {Is there a bank here?}"],
    remediation: "a1-there",
    vary: rng => { const x = pick(rng, [["a bank", "is"], ["two parks", "are"], ["a cafe", "is"], ["three rooms", "are"], ["a problem", "is"], ["many people", "are"]]); return { fill: "There ___ " + x[0] + " here.", a: x[1], o: [x[1] === "is" ? "are" : "is"], why: x[1] === "is" ? "יחיד ← {There is}." : "רבים ← {There are}." }; },
    drill: [
      { err: "There is two bedrooms.", a: "There are two bedrooms.", o: ["There two bedrooms."], why: "רבים ← {There are}." },
      { tr: "יש בנק ליד הפארק.", a: ["There is a bank next to the park.", "There's a bank next to the park.", "There is a bank near the park."], why: "יש + יחיד ← {There is a}..." },
    ] });

  def({ id: "question-words", level: "a1", title: "מילות שאלה: what, where, who...", prerequisites: ["be-questions"],
    explanation: "מילת השאלה באה **ראשונה**, ואחריה {is/are} והנושא: {Where is the bank?} {What is your name?} {Who is she?} {When} = מתי, {Why} = למה, {How} = איך, {How much} = כמה (כסף).",
    examples: [["Where are you from?", "מאיפה את?"], ["Who is that?", "מי זה?"], ["How much is it?", "כמה זה עולה?"], ["When is the meeting?", "מתי הפגישה?"]],
    commonMistakes: ["{Where the bank is?} ← {Where is the bank?}", "לבלבל {Where} (איפה) עם {When} (מתי)."],
    remediation: "a1-qwords",
    vary: rng => { const x = pick(rng, [["___ is the bank? — Next to the park.", "Where"], ["___ is your name? — Dana.", "What"], ["___ is she? — My sister.", "Who"], ["___ is the meeting? — At ten.", "When"], ["___ are you? — Fine, thanks.", "How"], ["___ is it? — Ten shekels.", "How much"]]); return { fill: x[0], a: x[1], o: ["Where", "What", "Who", "When", "How"].filter(y => y !== x[1]).slice(0, 3), why: "התשובה מראה מה שאלו: {" + x[1] + "}." }; },
    drill: [
      { err: "Where the station is?", a: "Where is the station?", o: ["Where station is?"], why: "מילת שאלה + {is} + נושא." },
    ] });

  def({ id: "can-ability", level: "a1", title: "can / can't — יכולה / לא יכולה", prerequisites: ["word-order-svo"],
    explanation: "{can} + פועל בסיס: {I can swim}. {can} לא משתנה: {She can drive} (בלי s!). שלילה: {can't} (= {cannot}). שאלה: {Can you help me?} — {Yes, I can.} / {No, I can't.}",
    examples: [["I can swim.", "אני יודעת לשחות."], ["He can't drive.", "הוא לא יודע לנהוג."], ["Can you help me?", "את יכולה לעזור לי?"]],
    commonMistakes: ["{She cans} ← {She can}.", "{I can to swim} ← {I can swim} (בלי {to}).", "{He can drives} ← {He can drive}."],
    remediation: "a1-can",
    vary: rng => { const s = pick(rng, THIRD); const v = pick(rng, ["swim", "drive", "sing", "dance", "cook"]); return { err: s + " can " + v + "s.", a: s + " can " + v + ".", o: [s + " cans " + v + "."], why: "אחרי {can} הפועל בלי s: {can " + v + "}." }; },
    drill: [
      { err: "I can to drive.", a: "I can drive.", o: ["I cans drive."], why: "אחרי {can} אין {to}." },
      { build: "Can you help me?", he: "את יכולה לעזור לי?", why: "שאלה: {Can} + נושא + פועל." },
    ] });

  /* ---------- present simple module ---------- */
  def({ id: "present-simple-meaning", level: "a1", title: "הווה פשוט: מה זה ומתי", prerequisites: ["word-order-svo"],
    explanation: "Present Simple מתאר **הרגלים, עובדות ודברים שקורים באופן קבוע**: {I drink coffee every morning} (הרגל), {Water is wet} (עובדה). הוא **לא** מתאר מה קורה ממש עכשיו — לזה יש זמן אחר שנלמד בהמשך.",
    examples: [["I work in Tel Aviv.", "אני עובדת בתל אביב (באופן קבוע)."], ["We eat dinner at seven.", "אנחנו אוכלים ארוחת ערב בשבע (כל יום)."]],
    commonMistakes: ["להשתמש ב-{am/is/are} עם פועל רגיל: {I am work} ← {I work}."],
    remediation: "a1-ps-1",
    drill: [
      { mc: "איזה משפט מתאר הרגל?", a: "I drink tea every morning.", o: ["I am tired now."], why: "{every morning} = הרגל ← Present Simple." },
      { err: "I am work in an office.", a: "I work in an office.", o: ["I working in an office."], why: "בהווה פשוט אין {am}: {I work}." },
      { mc: "{I live in Haifa} — מה זה אומר?", a: "זה המקום הקבוע שבו אני גרה", o: ["אני בחיפה רק היום"], why: "הווה פשוט = מצב קבוע." },
    ] });

  def({ id: "present-simple-i-you-we-they", level: "a1", title: "הווה פשוט: I / you / we / they", prerequisites: ["present-simple-meaning", "be-you-we-they-are"],
    explanation: "עם {I, you, we, they} הפועל נשאר בצורת הבסיס — בדיוק כמו במילון: {I work}, {You work}, {We work}, {They work}.",
    examples: [["They live in Haifa.", "הם גרים בחיפה."], ["We speak English.", "אנחנו מדברים אנגלית."], ["You work a lot.", "את עובדת הרבה."]],
    commonMistakes: ["להוסיף s: {They works} ← {They work}."],
    remediation: "a1-ps-2",
    vary: rng => { const s = pick(rng, PLURAL_SUBJ); const v = pick(rng, PS_VERBS); return { fill: s + " ___ " + v[2] + ".", a: v[0], o: [v[1]], why: "עם {" + s + "} הפועל בלי s: {" + v[0] + "}." }; },
    drill: [
      { err: "We works in an office.", a: "We work in an office.", o: ["We are work in an office."], why: "עם {we} — בלי s." },
    ] });

  def({ id: "present-simple-he-she-it", level: "a1", title: "הווה פשוט: he / she / it + s", prerequisites: ["present-simple-i-you-we-they", "be-he-she-it-is"],
    explanation: "הכלל הכי חשוב של הווה פשוט: עם {he}, {she}, {it} (או אדם אחד בשם) מוסיפים **s** לפועל: {I work} ← {She works}. {They live} ← {He lives}.",
    examples: [["She works in a bank.", "היא עובדת בבנק."], ["He lives in Eilat.", "הוא גר באילת."], ["My mother likes tea.", "אמא שלי אוהבת תה."]],
    commonMistakes: ["לשכוח את ה-s: {She work} ← {She works}.", "להוסיף s גם ל-{I}: {I works} ← {I work}."],
    remediation: "a1-ps-3",
    vary: rng => { const s = pick(rng, THIRD); const v = pick(rng, PS_VERBS.slice(0, 8)); return { fill: s + " ___ " + v[2] + ".", a: v[1], o: [v[0]], why: "עם הוא/היא מוסיפים s: {" + v[1] + "}." }; },
    drill: [
      { err: "She work in a hospital.", a: "She works in a hospital.", o: ["She working in a hospital."], why: "עם {she} מוסיפים s: {works}." },
    ] });

  def({ id: "present-simple-third-person-s", level: "a1", title: "איות ה-s: goes, watches, studies", prerequisites: ["present-simple-he-she-it"],
    explanation: "איך מוסיפים את ה-s? רוב הפעלים: {+s} ({works}). אחרי {s, sh, ch, x, o}: {+es} ({watches}, {goes}, {does}). עיצור + {y}: {y} ← {ies} ({study} ← {studies}). ויוצא דופן אחד: {have} ← {has}.",
    examples: [["He goes to work by bus.", "הוא נוסע לעבודה באוטובוס."], ["She watches TV.", "היא צופה בטלוויזיה."], ["He studies English.", "הוא לומד אנגלית."], ["She has two kids.", "יש לה שני ילדים."]],
    commonMistakes: ["{gos} ← {goes}.", "{studys} ← {studies}.", "{haves} ← {has}.", "{watchs} ← {watches}."],
    remediation: "a1-ps-4",
    vary: rng => { const v = pick(rng, [["go", "goes", "to work"], ["watch", "watches", "TV"], ["study", "studies", "English"], ["have", "has", "a car"], ["do", "does", "yoga"], ["wash", "washes", "the dishes"], ["fly", "flies", "to Rome"], ["finish", "finishes", "at five"]]); const s = pick(rng, THIRD); const wrong = v[0] === "have" ? "haves" : v[0] + "s"; return { fill: s + " ___ " + v[2] + ".", a: v[1], o: [wrong, v[0]].filter(x => x !== v[1]), why: "{" + v[0] + "} ← {" + v[1] + "}" + (v[0] === "have" ? " (יוצא דופן)" : v[0].endsWith("y") ? " (עיצור + y ← ies)" : " (מוסיפים es)") + "." }; },
    drill: [
      { tr: "היא הולכת לעבודה.", a: ["She goes to work."], why: "{go} ← {goes}." },
    ] });

  def({ id: "present-simple-negative", level: "a1", title: "שלילה: don't / doesn't", prerequisites: ["present-simple-third-person-s"],
    explanation: "שלילה בהווה פשוט: {don't} + פועל בסיס (עם I/you/we/they), {doesn't} + פועל בסיס (עם he/she/it). ה-s \"עוברת\" ל-{does}, ולכן הפועל חוזר לבסיס: {She works} ← {She doesn't work}.",
    examples: [["I don't eat meat.", "אני לא אוכלת בשר."], ["He doesn't drive.", "הוא לא נוהג."], ["They don't live here.", "הם לא גרים כאן."]],
    commonMistakes: ["{She doesn't works} ← {She doesn't work} (רק s אחת!).", "{He don't} ← {He doesn't}.", "{I not like} ← {I don't like}."],
    remediation: "a1-ps-5",
    vary: rng => { const third = rng() < 0.5; const s = third ? pick(rng, THIRD) : pick(rng, PLURAL_SUBJ); const v = pick(rng, PS_VERBS.slice(0, 8)); const neg = third ? "doesn't" : "don't"; return { fill: s + " ___ " + v[0] + " " + v[2] + ".", a: neg, o: [third ? "don't" : "doesn't", third ? "isn't" : "aren't"], why: third ? "עם הוא/היא: {doesn't} + פועל בסיס." : "עם {" + s + "}: {don't} + פועל בסיס." }; },
    drill: [
      { err: "She doesn't likes coffee.", a: "She doesn't like coffee.", o: ["She don't like coffee."], why: "אחרי {doesn't} הפועל בלי s." },
      { tr: "אני לא אוכלת בשר.", a: ["I don't eat meat.", "I do not eat meat."], why: "{I don't} + {eat}." },
    ] });

  def({ id: "present-simple-questions", level: "a1", title: "שאלות: Do you...? Does she...?", prerequisites: ["present-simple-negative", "be-questions"],
    explanation: "שאלה בהווה פשוט מתחילה ב-{Do} (I/you/we/they) או {Does} (he/she/it), ואז נושא + פועל בסיס: {Do you like tea?} {Does he work here?} תשובה קצרה: {Yes, I do.} / {No, she doesn't.}",
    examples: [["Do you speak English?", "את מדברת אנגלית?"], ["Does she live here?", "היא גרה כאן?"], ["Where do you work?", "איפה את עובדת?"]],
    commonMistakes: ["{Does she works?} ← {Does she work?}", "{You like tea?} ← {Do you like tea?}", "{Are you like tea?} ← {Do you like tea?}"],
    remediation: "a1-ps-6",
    vary: rng => { const third = rng() < 0.5; const s = third ? pick(rng, ["he", "she", "Tom", "your sister"]) : pick(rng, ["you", "they", "we"]); const v = pick(rng, PS_VERBS.slice(0, 8)); const aux = third ? "Does" : "Do"; return { build: aux + " " + s + " " + v[0] + " " + v[2] + "?", x: [v[1]], why: "{" + aux + "} + נושא + פועל בסיס (בלי s)." }; },
    drill: [
      { err: "Does he works here?", a: "Does he work here?", o: ["Do he work here?"], why: "אחרי {Does} הפועל בלי s." },
      { npc: "Do you like coffee?", a: "Yes, I do.", o: ["Yes, I like.", "Yes, I am."], why: "תשובה קצרה: {Yes, I do}." },
    ] });

  def({ id: "frequency-adverbs", level: "a1", title: "כמה פעמים: always, usually, sometimes, never", prerequisites: ["present-simple-negative"],
    explanation: "מילות תדירות אומרות כמה פעמים עושים משהו: {always} (תמיד) > {usually} > {often} > {sometimes} > {rarely} > {never} (אף פעם). מקומן **לפני** הפועל הרגיל: {I always drink coffee}, אבל **אחרי** {am/is/are}: {She is always late}.",
    examples: [["I usually walk to work.", "בדרך כלל אני הולכת ברגל לעבודה."], ["He is never late.", "הוא אף פעם לא מאחר."], ["We sometimes eat out.", "לפעמים אנחנו אוכלים בחוץ."]],
    commonMistakes: ["{I drink always coffee} ← {I always drink coffee}.", "{never} כבר שלילי: {I don't never} ← {I never}.", "{She always is late} ← {She is always late}."],
    remediation: "a1-ps-7",
    vary: rng => { const a = pick(rng, ["always", "usually", "often", "sometimes", "never"]); const x = pick(rng, [["I", "drink coffee"], ["We", "eat pizza"], ["They", "walk to work"], ["She", "cooks dinner"]]); return { build: x[0] + " " + a + " " + x[1] + ".", why: "מילת תדירות באה לפני הפועל הרגיל." }; },
    drill: [
      { err: "She is late always.", a: "She is always late.", o: ["She always is late."], why: "עם {is} — מילת התדירות אחרי {is}." },
      { err: "I don't never eat meat.", a: "I never eat meat.", o: ["I no never eat meat."], why: "{never} כבר מכיל שלילה." },
    ] });

  def({ id: "daily-routines", level: "a1", skill: "vocabulary", title: "לתאר יום רגיל", prerequisites: ["frequency-adverbs", "telling-time"],
    explanation: "כדי לתאר יום רגיל משתמשים בהווה פשוט + שעה: {I get up at seven}. מילים שעוזרות לסדר: {first} (קודם), {then} (אחר כך), {after that} (אחרי זה). שימי לב: {at seven} (בשעה), {in the morning} (בבוקר), {at night} (בלילה).",
    examples: [["I get up at seven.", "אני קמה בשבע."], ["Then I take a shower.", "אחר כך אני מתקלחת."], ["I go to bed at eleven.", "אני הולכת לישון באחת-עשרה."]],
    commonMistakes: ["{in seven} ← {at seven}.", "{I go to sleep in the night} ← {I go to bed at night}."],
    remediation: "a1-ps-8",
    drill: [
      { fill: "I get up ___ seven.", a: "at", o: ["in", "on"], why: "לפני שעה: {at}." },
      { fill: "I study English ___ the evening.", a: "in", o: ["at", "on"], why: "{in the morning / afternoon / evening}; אבל {at night}." },
      { build: "She takes a shower every morning.", he: "היא מתקלחת כל בוקר.", why: "הווה פשוט עם {she} ← {takes}." },
    ] });

  def({ id: "telling-time", level: "a1", skill: "vocabulary", title: "מה השעה?", prerequisites: ["numbers-tens", "be-he-she-it-is"],
    explanation: "שואלים {What time is it?} ועונים {It is ...}. שעה עגולה: {It's three o'clock}. וחצי: {half past three} (3:30). ורבע: {quarter past three} (3:15). רבע ל-: {quarter to four} (3:45). אפשר גם פשוט להגיד את המספרים: {three thirty}.",
    examples: [["It's seven o'clock.", "השעה שבע."], ["It's half past two.", "השעה שתיים וחצי."], ["It's quarter to nine.", "השעה רבע לתשע."], ["It's ten fifteen.", "השעה עשר ורבע."]],
    commonMistakes: ["{half past three} זה 3:30 — לא 2:30 כמו \"חצי שלוש\" בגרמנית.", "לשכוח את {It is}: {Seven o'clock} בתשובה מלאה ← {It's seven o'clock}."],
    remediation: "a1-time",
    vary: rng => { const h = pick(rng, [["two", 2], ["three", 3], ["five", 5], ["seven", 7], ["nine", 9], ["ten", 10]]); const t = pick(rng, [["half past", ":30", 0], ["quarter past", ":15", 0], ["quarter to", ":45", -1]]); const hour = t[2] ? h[1] - 1 : h[1]; return { lis: "It's " + t[0] + " " + h[0] + ".", a: hour + t[1], o: [(h[1]) + (t[1] === ":30" ? ":15" : ":30"), (t[2] ? h[1] : h[1] - 1) + t[1]], why: "{" + t[0] + " " + h[0] + "} = " + hour + t[1] + "." }; },
    drill: [
      { mc: "{It's quarter past six.} = ?", a: "6:15", o: ["5:45", "6:45"], why: "{quarter past} = ורבע." },
    ] });

  def({ id: "prepositions-time", level: "a1", title: "at / on / in עם זמנים", prerequisites: ["telling-time"],
    explanation: "{at} + שעה: {at 7}. {on} + יום: {on Monday}, {on my birthday}. {in} + חודש / שנה / חלק מהיום: {in May}, {in 2024}, {in the morning}. יוצאי דופן שכדאי לזכור: {at night}, {at the weekend}.",
    examples: [["The meeting is at ten.", "הפגישה בעשר."], ["I swim on Tuesday.", "אני שוחה ביום שלישי."], ["My birthday is in May.", "יום ההולדת שלי במאי."]],
    commonMistakes: ["{in Monday} ← {on Monday}.", "{on May} ← {in May}.", "{in 7 o'clock} ← {at 7 o'clock}."],
    remediation: "a1-calendar",
    vary: rng => { const x = pick(rng, [["Monday", "on"], ["Friday", "on"], ["May", "in"], ["July", "in"], ["seven o'clock", "at"], ["night", "at"], ["the morning", "in"], ["2025", "in"]]); return { fill: "I see her ___ " + x[0] + ".", a: x[1], o: ["at", "on", "in"].filter(y => y !== x[1]), why: "{" + x[1] + "} + " + (x[1] === "on" ? "יום" : x[1] === "at" ? "שעה / {night}" : "חודש, שנה או חלק מהיום") + "." }; },
    drill: [] });

  def({ id: "prepositions-place", level: "a1", title: "איפה? in / on / under / next to", prerequisites: ["article-the", "be-he-she-it-is"],
    explanation: "{in} = בתוך ({in the kitchen}), {on} = על ({on the table}), {under} = מתחת ({under the bed}), {next to} = ליד, {between} = בין. בעברית \"ב\" אחת לכל דבר; באנגלית בוחרים לפי המקום המדויק.",
    examples: [["The keys are on the table.", "המפתחות על השולחן."], ["The milk is in the fridge.", "החלב במקרר."], ["The cat is under the bed.", "החתול מתחת למיטה."]],
    commonMistakes: ["{The keys are in the table} (כשהם עליו) ← {on the table}.", "{next the door} ← {next to the door}."],
    remediation: "a1-home",
    vary: rng => { const x = pick(rng, [["The milk is ___ the fridge.", "in"], ["The book is ___ the table.", "on"], ["The cat is ___ the bed.", "under"], ["The lamp is ___ to the sofa.", "next"], ["My clothes are ___ the closet.", "in"], ["The phone is ___ the chair.", "on"]]); return { fill: x[0], a: x[1], o: ["in", "on", "under", "next"].filter(y => y !== x[1]).slice(0, 2), why: "{in}=בתוך, {on}=על, {under}=מתחת, {next to}=ליד." }; },
    drill: [] });

  def({ id: "would-like", level: "a1", skill: "vocabulary", title: "בקשה מנומסת: I would like / Can I have", prerequisites: ["can-ability", "articles-a-an"],
    explanation: "במסעדה או בחנות אומרים בנימוס {I would like...} (בקיצור {I'd like}) או {Can I have..., please?} זה הרבה יותר מנומס מ-{I want}.",
    examples: [["I'd like a coffee, please.", "אשמח לקפה, בבקשה."], ["Can I have the bill, please?", "אפשר את החשבון, בבקשה?"], ["I would like the fish.", "אני אקח את הדג."]],
    commonMistakes: ["{I would like to a coffee} ← {I would like a coffee}.", "{Give me coffee} נשמע גס — עדיף {Can I have a coffee, please?}"],
    remediation: "a1-restaurant",
    drill: [
      { npc: "What would you like?", a: "I'd like a salad, please.", o: ["Give me salad.", "I like salad every day."], why: "בקשה מנומסת: {I'd like ..., please}." },
      { build: "Can I have the menu, please?", he: "אפשר את התפריט, בבקשה?", why: "{Can I have} + דבר + {please}." },
      { err: "I would like to a tea.", a: "I would like a tea.", o: ["I would to like a tea."], why: "אחרי {would like} בא שם עצם ישר ({a tea})." },
    ] });

  def({ id: "imperatives-directions", level: "a1", skill: "vocabulary", title: "הוראות דרך: Turn left, Go straight", prerequisites: ["prepositions-place", "question-words"],
    explanation: "כשנותנים הוראות משתמשים בפועל בלי נושא: {Turn left}, {Go straight ahead}, {Take the first street on the right}. כדי לשאול: {Excuse me, where is the station?} או {How do I get to the station?}",
    examples: [["Go straight ahead.", "סעי / לכי ישר."], ["Turn right at the corner.", "פני ימינה בפינה."], ["It's next to the bank.", "זה ליד הבנק."]],
    commonMistakes: ["לבלבל {left} (שמאל) ו-{right} (ימין).", "{You turn left} נשמע פחות טבעי בהוראות ← {Turn left}."],
    remediation: "a1-directions",
    drill: [
      { mc: "➡️ = ?", a: "Turn right.", o: ["Turn left.", "Go straight ahead."], why: "➡️ = ימינה = {right}." },
      { mc: "⬅️ = ?", a: "Turn left.", o: ["Turn right.", "Go back."], why: "⬅️ = שמאלה = {left}." },
      { build: "Excuse me, where is the station?", he: "סליחה, איפה התחנה?", why: "{Excuse me} + שאלה עם {Where is}." },
    ] });

  def({ id: "present-continuous-form", level: "a1", title: "הווה ממושך: I am working", prerequisites: ["present-simple-questions", "be-questions"],
    explanation: "Present Continuous מתאר מה קורה **עכשיו, ממש ברגע זה**. בונים: {am/is/are} + פועל עם {-ing}: {I am reading}, {She is cooking}. איות: {make} ← {making} (ה-e נופלת), {swim} ← {swimming} (הכפלה).",
    examples: [["I am reading a book now.", "אני קוראת ספר עכשיו."], ["She is cooking dinner.", "היא מבשלת ארוחת ערב (כרגע)."], ["They aren't working today.", "הם לא עובדים היום."], ["Are you listening?", "את מקשיבה?"]],
    commonMistakes: ["לשכוח את {am/is/are}: {I reading} ← {I am reading}.", "{She is cook} ← {She is cooking}.", "{makeing} ← {making}."],
    remediation: "a1-pc-1",
    vary: rng => { const s = pick(rng, BE); const v = pick(rng, [["read", "reading"], ["cook", "cooking"], ["work", "working"], ["sleep", "sleeping"], ["eat", "eating"], ["drink", "drinking"], ["wait", "waiting"]]); return { fill: s[0] + " ___ " + v[1] + " now.", a: s[1], o: ["am", "is", "are"].filter(x => x !== s[1]), why: "הווה ממושך: " + BE_WHY[s[1]] }; },
    drill: [
      { err: "I reading now.", a: "I am reading now.", o: ["I am read now."], why: "צריך {am} + {-ing}." },
      { tr: "היא מבשלת עכשיו.", a: ["She is cooking now.", "She's cooking now."], why: "{She is} + {cooking} + {now}." },
    ] });

  def({ id: "present-continuous-vs-simple", level: "a1", title: "עכשיו או תמיד? הווה פשוט מול הווה ממושך", prerequisites: ["present-continuous-form"],
    explanation: "**הרגל / קבוע** ← Present Simple: {I work in a bank} (זה המקצוע שלי). **עכשיו / זמני** ← Present Continuous: {I am working from home today}. מילים שעוזרות: {every day, usually, always} ← פשוט. {now, at the moment, today, Look!} ← ממושך.",
    examples: [["I usually drink tea, but now I am drinking coffee.", "בדרך כלל אני שותה תה, אבל עכשיו אני שותה קפה."], ["She works in a hospital.", "היא עובדת בבית חולים (קבוע)."], ["Look! It is raining.", "תראי! יורד גשם (עכשיו)."]],
    commonMistakes: ["{I am working every day} ← {I work every day}.", "{Look! It rains.} ← {Look! It is raining.}", "פעלים של מצב ({like, know, want}) כמעט לא באים ב-{-ing}: {I am knowing} ← {I know}."],
    remediation: "a1-pc-2",
    vary: rng => { const x = pick(rng, [["She ___ TV every evening.", "watches", "is watching", "every evening"], ["Look! She ___ TV.", "is watching", "watches", "Look!"], ["I ___ to work every day.", "walk", "am walking", "every day"], ["I ___ to the shop now.", "am walking", "walk", "now"], ["They usually ___ at home.", "eat", "are eating", "usually"], ["They ___ lunch at the moment.", "are eating", "eat", "at the moment"]]); return { fill: x[0], a: x[1], o: [x[2]], why: "{" + x[3] + "} " + (/every|usually/.test(x[3]) ? "מראה הרגל ← הווה פשוט." : "מראה שזה קורה עכשיו ← הווה ממושך.") }; },
    drill: [
      { err: "I am knowing the answer.", a: "I know the answer.", o: ["I knowing the answer."], why: "{know} הוא פועל מצב — לא בא ב-{-ing}." },
    ] });

  def({ id: "past-be-was-were", level: "a1", title: "עבר של to be: was / were", prerequisites: ["be-questions", "prepositions-time"],
    explanation: "העבר של {am/is} הוא {was}, והעבר של {are} הוא {were}. {I was tired}, {She was at home}, {We were happy}, {They were late}. שלילה: {wasn't / weren't}. שאלה: {Were you at home?}",
    examples: [["I was at home yesterday.", "הייתי בבית אתמול."], ["They were happy.", "הם היו שמחים."], ["It wasn't cold.", "לא היה קר."], ["Were you tired?", "היית עייפה?"]],
    commonMistakes: ["{They was} ← {They were}.", "{I were} ← {I was}.", "{You was} ← {You were}."],
    remediation: "a1-past-1",
    vary: rng => { const s = pick(rng, [["I", "was"], ["He", "was"], ["She", "was"], ["It", "was"], ["You", "were"], ["We", "were"], ["They", "were"]]); const p = pick(rng, ["at home yesterday", "tired last night", "late last week", "happy yesterday"]); return { fill: s[0] + " ___ " + p + ".", a: s[1], o: [s[1] === "was" ? "were" : "was", s[1] === "was" ? "is" : "are"], why: s[1] === "was" ? "{I / he / she / it} ← {was}." : "{you / we / they} ← {were}." }; },
    drill: [
      { err: "They was at work.", a: "They were at work.", o: ["They are at work yesterday."], why: "{they} ← {were}." },
      { tr: "הייתי עייפה אתמול.", a: ["I was tired yesterday.", "Yesterday I was tired."], why: "{I was} + {tired} + {yesterday}." },
    ] });

  def({ id: "past-simple-regular", level: "a1", title: "עבר פשוט: פעלים רגילים + ed", prerequisites: ["past-be-was-were", "present-simple-he-she-it"],
    explanation: "בעבר הפשוט מוסיפים לפועל {-ed}: {work} ← {worked}. והצורה **זהה לכל הגופים**: {I worked}, {she worked}, {they worked} — בלי s! איות: {live} ← {lived} (רק d), {study} ← {studied}, {stop} ← {stopped}.",
    examples: [["I worked yesterday.", "עבדתי אתמול."], ["She cooked dinner last night.", "היא בישלה ארוחת ערב אתמול בלילה."], ["We visited my parents.", "ביקרנו את ההורים שלי."]],
    commonMistakes: ["{She workeds} ← {She worked}.", "{studyed} ← {studied}.", "לשכוח את {-ed}: {Yesterday I work} ← {Yesterday I worked}."],
    remediation: "a1-past-2",
    vary: rng => { const s = pick(rng, ["I", "She", "We", "They", "My brother"]); const v = pick(rng, [["work", "worked"], ["cook", "cooked"], ["watch", "watched", "a movie"], ["visit", "visited", "my parents"], ["call", "called", "my mother"], ["study", "studied", "English"], ["clean", "cleaned", "the kitchen"], ["play", "played", "cards"]]); return { fill: "Yesterday " + s.replace(/^My/, "my") + " ___ " + (v[2] || "") + ".", a: v[1], o: [v[0], v[0] + "s"], why: "{yesterday} ← עבר: {" + v[0] + "} ← {" + v[1] + "}." }; },
    drill: [
      { err: "Yesterday I work at home.", a: "Yesterday I worked at home.", o: ["Yesterday I works at home."], why: "{yesterday} ← עבר עם {-ed}." },
    ] });

  const irr = (id, title, pre, verbs, rem) => def({ id, level: "a1", title, prerequisites: pre,
    explanation: "חלק מהפעלים לא מקבלים {-ed} אלא משנים צורה בעבר. לומדים אותם במנות קטנות. המנה הזאת: " + verbs.map(v => "{" + v[0] + "} ← {" + v[1] + "}").join(", ") + ". גם כאן — אותה צורה לכל הגופים.",
    examples: verbs.map(v => [v[2], v[3]]),
    commonMistakes: ["להוסיף {-ed} לפועל חריג: {" + verbs[0][0] + "ed} ← {" + verbs[0][1] + "}.", "להשתמש בצורת ההווה בעבר: {Yesterday I " + verbs[1][0] + "} ← {Yesterday I " + verbs[1][1] + "}."],
    remediation: rem,
    vary: rng => { const v = pick(rng, verbs); const s = pick(rng, ["I", "We", "She", "They"]); return { fill: s + " ___ " + v[4] + " yesterday.", a: v[1], o: [v[0] + "ed", v[0]], why: "{" + v[0] + "} הוא פועל חריג: בעבר {" + v[1] + "}." }; },
    drill: verbs.map(v => ({ mc: "מה העבר של {" + v[0] + "}?", a: v[1], o: [v[0] + "ed", v[0] + "s"], why: "{" + v[0] + "} ← {" + v[1] + "}." })) });
  irr("past-irregular-1", "פעלים חריגים בעבר — מנה 1", ["past-simple-regular"], [
    ["go", "went", "I went to the beach.", "הלכתי לחוף.", "to the park"], ["have", "had", "We had a good time.", "היה לנו כיף.", "a salad"],
    ["eat", "ate", "She ate pizza.", "היא אכלה פיצה.", "pizza"], ["drink", "drank", "They drank coffee.", "הם שתו קפה.", "tea"],
    ["see", "saw", "I saw a movie.", "ראיתי סרט.", "a movie"]], "a1-past-3");
  irr("past-irregular-2", "פעלים חריגים בעבר — מנה 2", ["past-irregular-1"], [
    ["come", "came", "He came home late.", "הוא חזר הביתה מאוחר.", "home late"], ["do", "did", "I did my homework.", "עשיתי את שיעורי הבית.", "the dishes"],
    ["get", "got", "I got an email.", "קיבלתי אימייל.", "a message"], ["make", "made", "She made a cake.", "היא הכינה עוגה.", "a cake"],
    ["take", "took", "We took a taxi.", "לקחנו מונית.", "a taxi"]], "a1-past-4");
  irr("past-irregular-3", "פעלים חריגים בעבר — מנה 3", ["past-irregular-2"], [
    ["buy", "bought", "I bought bread.", "קניתי לחם.", "bread"], ["say", "said", "He said hello.", "הוא אמר שלום.", "goodbye"],
    ["write", "wrote", "I wrote an email.", "כתבתי אימייל.", "an email"], ["meet", "met", "I met a friend.", "פגשתי חברה.", "a friend"],
    ["sleep", "slept", "I slept well.", "ישנתי טוב.", "well"]], "a1-past-5");

  def({ id: "past-simple-negative-questions", level: "a1", title: "עבר: didn't ושאלות עם Did", prerequisites: ["past-irregular-1", "present-simple-questions"],
    explanation: "כמו {do/does} בהווה — בעבר משתמשים ב-{did} לכל הגופים. שלילה: {didn't} + פועל **בסיס**: {I didn't go} (לא {didn't went}). שאלה: {Did you go?} — {Yes, I did.} / {No, I didn't.} ה-{did} כבר מסמן עבר, לכן הפועל חוזר לבסיס.",
    examples: [["I didn't see him.", "לא ראיתי אותו."], ["Did you eat?", "אכלת?"], ["Where did you go?", "לאן הלכת?"]],
    commonMistakes: ["{I didn't went} ← {I didn't go}.", "{Did you saw?} ← {Did you see?}", "{You went?} ← {Did you go?}"],
    remediation: "a1-past-6",
    vary: rng => { const v = pick(rng, [["go", "went", "to work"], ["eat", "ate", "breakfast"], ["see", "saw", "the movie"], ["buy", "bought", "milk"], ["call", "called", "your mother"], ["sleep", "slept", "well"]]); return rng() < 0.5 ? { fill: "I didn't ___ " + v[2] + ".", a: v[0], o: [v[1]], why: "אחרי {didn't} הפועל בבסיס: {" + v[0] + "}." } : { build: "Did you " + v[0] + " " + v[2] + "?", x: [v[1]], why: "{Did} + נושא + פועל בסיס." }; },
    drill: [
      { err: "I didn't went to work.", a: "I didn't go to work.", o: ["I not went to work."], why: "{didn't} + פועל בסיס." },
    ] });

  def({ id: "future-will", level: "a1", title: "עתיד: will", prerequisites: ["present-simple-negative"],
    explanation: "{will} + פועל בסיס = עתיד, בעיקר להחלטות של הרגע, הבטחות וניחושים: {I will call you} (אתקשר אלייך). {will} זהה לכל הגופים. קיצור: {I'll}. שלילה: {won't} (= will not).",
    examples: [["I'll help you.", "אני אעזור לך."], ["It will rain tomorrow.", "מחר ירד גשם."], ["I won't be late.", "אני לא אאחר."]],
    commonMistakes: ["{I will to go} ← {I will go}.", "{She wills} ← {She will}.", "{I will going} ← {I will go}."],
    remediation: "a1-future-1",
    vary: rng => { const s = pick(rng, ["I", "She", "We", "They", "He"]); const v = pick(rng, ["call you", "help you", "be late", "come tomorrow", "pay"]); return { err: s + " will to " + v + ".", a: s + " will " + v + ".", o: [s + " wills " + v + "."], why: "{will} + פועל בסיס, בלי {to} ובלי s." }; },
    drill: [
      { npc: "The phone is ringing!", a: "I'll answer it.", o: ["I answer it yesterday.", "I will to answer it."], why: "החלטה של הרגע ← {I'll}." },
    ] });

  def({ id: "future-going-to", level: "a1", title: "עתיד: going to — תוכניות", prerequisites: ["present-continuous-form", "future-will"],
    explanation: "{am/is/are going to} + פועל בסיס = **תוכנית** שכבר החלטנו עליה: {I am going to visit my parents on Friday}. גם כשרואים שמשהו עומד לקרות: {Look at the clouds! It's going to rain.}",
    examples: [["I'm going to travel next year.", "אני הולכת לטייל בשנה הבאה."], ["She is going to cook tonight.", "היא הולכת לבשל הערב."], ["Are you going to come?", "את מתכוונת לבוא?"]],
    commonMistakes: ["לשכוח את {am/is/are}: {I going to} ← {I am going to}.", "{I am going to cooking} ← {I am going to cook}."],
    remediation: "a1-future-2",
    vary: rng => { const s = pick(rng, BE); const v = pick(rng, ["travel next year", "cook tonight", "visit my parents", "buy a car"]); return { fill: s[0] + " ___ going to " + v + ".", a: s[1], o: ["am", "is", "are"].filter(x => x !== s[1]), why: "{going to} צריך {am/is/are} לפניו. " + BE_WHY[s[1]] }; },
    drill: [
      { err: "I going to travel.", a: "I am going to travel.", o: ["I am going to traveling."], why: "{am} + {going to} + פועל בסיס." },
    ] });

  def({ id: "future-will-vs-going-to", level: "a1", title: "will או going to?", prerequisites: ["future-going-to"],
    explanation: "**תוכנית** שכבר החלטת עליה ← {going to}: {I'm going to see a doctor tomorrow} (קבעתי תור). **החלטה עכשיו / הבטחה / הצעה** ← {will}: {I'm cold. — I'll close the window.} בדיבור יומיומי שתיהן מובנות — אל תפחדי לטעות.",
    examples: [["We're going to move in June.", "אנחנו עוברים דירה ביוני (מתוכנן)."], ["It's hot. — I'll open the window.", "חם. — אני אפתח את החלון (החלטתי עכשיו)."]],
    commonMistakes: ["להשתמש ב-{will} לתוכנית ארוכה שכבר נקבעה — עדיף {going to}.", "{I'm going to open} כתגובה מיידית נשמע קצת מוזר — עדיף {I'll open}."],
    remediation: "a1-future-3",
    drill: [
      { npc: "I'm thirsty.", a: "I'll get you some water.", o: ["I'm going to get you water next week."], why: "תגובה מיידית ← {will}." },
      { fill: "I bought tickets. I ___ fly to Rome in May.", a: "am going to", o: ["will"], why: "כבר קנית כרטיסים = תוכנית ← {going to}." },
      { fill: "The bags are heavy! — I ___ help you.", a: "will", o: ["am going to"], why: "הצעה של הרגע ← {will}." },
    ] });

  /* ======================= A2 ======================= */
  def({ id: "comparatives", level: "a2", title: "השוואה: bigger, more expensive", prerequisites: ["be-he-she-it-is", "colors-before-nouns"],
    explanation: "כדי להשוות שני דברים: שם תואר קצר + {-er} + {than}: {Tel Aviv is bigger than Haifa}. שם תואר ארוך (2+ הברות): {more} + תואר + {than}: {more expensive than}. יוצאי דופן: {good} ← {better}, {bad} ← {worse}. איות: {big} ← {bigger}, {easy} ← {easier}.",
    examples: [["The train is faster than the bus.", "הרכבת מהירה יותר מהאוטובוס."], ["This book is more interesting.", "הספר הזה מעניין יותר."], ["Today is better than yesterday.", "היום טוב יותר מאתמול."]],
    commonMistakes: ["{more bigger} ← {bigger}.", "{gooder} ← {better}.", "{bigger that} ← {bigger than}.", "{expensiver} ← {more expensive}."],
    remediation: "a2-comp",
    vary: rng => { const x = pick(rng, [["fast", "faster", "more fast"], ["cheap", "cheaper", "more cheap"], ["big", "bigger", "biger"], ["easy", "easier", "easyer"], ["good", "better", "gooder"], ["bad", "worse", "badder"], ["expensive", "more expensive", "expensiver"], ["interesting", "more interesting", "interestinger"]]); return { fill: "The train is ___ than the bus. (" + x[0] + ")", a: x[1], o: [x[2]], why: "{" + x[0] + "} ← {" + x[1] + "}." }; },
    drill: [
      { err: "My car is more bigger than your car.", a: "My car is bigger than your car.", o: ["My car is biger than your car."], why: "תואר קצר: רק {-er}, בלי {more}." },
      { tr: "הרכבת מהירה יותר מהאוטובוס.", a: ["The train is faster than the bus."], why: "{faster than}." },
    ] });

  def({ id: "superlatives", level: "a2", title: "הכי: the biggest, the most expensive", prerequisites: ["comparatives", "article-the"],
    explanation: "\"הכי\" = {the} + תואר קצר + {-est}: {the biggest}. תואר ארוך: {the most} + תואר: {the most expensive}. יוצאי דופן: {good} ← {the best}, {bad} ← {the worst}. אחרי זה בדרך כלל {in}: {the best cafe in town}.",
    examples: [["This is the best cafe in Tel Aviv.", "זה בית הקפה הכי טוב בתל אביב."], ["She is the youngest in the family.", "היא הצעירה במשפחה."], ["It's the most expensive hotel.", "זה המלון הכי יקר."]],
    commonMistakes: ["לשכוח את {the}: {She is youngest} ← {She is the youngest}.", "{the most biggest} ← {the biggest}.", "{the goodest} ← {the best}."],
    remediation: "a2-super",
    vary: rng => { const x = pick(rng, [["cheap", "cheapest", "most cheap"], ["fast", "fastest", "most fast"], ["big", "biggest", "bigest"], ["good", "best", "goodest"], ["bad", "worst", "baddest"], ["interesting", "most interesting", "interestingest"], ["expensive", "most expensive", "expensivest"]]); return { fill: "It's the ___ restaurant in town. (" + x[0] + ")", a: x[1], o: [x[2]], why: "{" + x[0] + "} ← {the " + x[1] + "}." }; },
    drill: [
      { err: "She is youngest in my family.", a: "She is the youngest in my family.", o: ["She is the most young in my family."], why: "עם \"הכי\" צריך {the}." },
    ] });

  def({ id: "countable-uncountable", level: "a2", title: "נספר / לא נספר", prerequisites: ["plural-irregular", "articles-a-an"],
    explanation: "שמות עצם **נספרים** אפשר לספור: {an apple, two apples}. **לא נספרים** אי אפשר לספור ישירות, ואין להם רבים או {a}: {water, milk, rice, money, bread, information, advice}. כדי לספור אותם משתמשים ביחידה: {a bottle of water}, {a piece of bread}.",
    examples: [["two apples", "שני תפוחים (נספר)"], ["some water", "קצת מים (לא נספר)"], ["a bottle of water", "בקבוק מים"], ["I need some advice.", "אני צריכה עצה."]],
    commonMistakes: ["{a water} ← {some water} / {a bottle of water}.", "{informations} ← {information}.", "{two breads} ← {two pieces of bread}."],
    remediation: "a2-count",
    vary: rng => { const x = pick(rng, [["water", "U"], ["apple", "C"], ["rice", "U"], ["money", "U"], ["egg", "C"], ["advice", "U"], ["chair", "C"], ["milk", "U"], ["information", "U"], ["banana", "C"]]); return { mc: "{" + x[0] + "} — נספר או לא נספר?", a: x[1] === "C" ? "נספר (a / two ...)" : "לא נספר (בלי a, בלי s)", o: [x[1] === "C" ? "לא נספר (בלי a, בלי s)" : "נספר (a / two ...)"], why: "{" + x[0] + "} " + (x[1] === "C" ? "אפשר לספור: {two " + x[0] + "s}." : "אי אפשר לספור ישירות — אין {a " + x[0] + "}.") }; },
    drill: [
      { err: "Can I have a water?", a: "Can I have a glass of water?", o: ["Can I have waters?"], why: "{water} לא נספר ← {a glass of water}." },
      { err: "I need some informations.", a: "I need some information.", o: ["I need an information."], why: "{information} לא נספר — בלי s." },
    ] });

  def({ id: "some-any", level: "a2", title: "קצת / בכלל: some / any", prerequisites: ["countable-uncountable", "there-is-are", "present-simple-questions"],
    explanation: "{some} = קצת / כמה — במשפט **חיובי**: {There is some milk}. {any} — ב**שלילה ושאלה**: {There isn't any milk}. {Is there any milk?} שניהם עם רבים ועם לא נספרים. (בבקשה ובהצעה אומרים {some}: {Would you like some tea?})",
    examples: [["I have some apples.", "יש לי כמה תפוחים."], ["We don't have any bread.", "אין לנו לחם בכלל."], ["Are there any eggs?", "יש ביצים?"], ["Would you like some coffee?", "תרצי קפה?"]],
    commonMistakes: ["{I don't have some money} ← {I don't have any money}.", "{There is any milk} ← {There is some milk}."],
    remediation: "a2-some",
    vary: rng => { const x = pick(rng, [["There is ___ milk in the fridge.", "some", "חיובי"], ["There isn't ___ milk.", "any", "שלילה"], ["Is there ___ bread?", "any", "שאלה"], ["I have ___ friends in London.", "some", "חיובי"], ["We don't have ___ eggs.", "any", "שלילה"], ["Do you have ___ questions?", "any", "שאלה"], ["Would you like ___ tea?", "some", "הצעה"]]); return { fill: x[0], a: x[1], o: [x[1] === "some" ? "any" : "some"], why: x[2] === "הצעה" ? "בהצעה אומרים {some}." : "משפט " + x[2] + " ← {" + x[1] + "}." }; },
    drill: [] });

  def({ id: "much-many-a-lot", level: "a2", title: "הרבה: much / many / a lot of", prerequisites: ["some-any"],
    explanation: "{many} + נספרים ברבים: {many friends}. {much} + לא נספרים: {much time}, ובעיקר בשלילה ושאלה: {I don't have much time}. {a lot of} מתאים לשניהם, בעיקר במשפט חיובי: {a lot of friends}, {a lot of money}. שאלות: {How many...?} / {How much...?}",
    examples: [["How many children do you have?", "כמה ילדים יש לך?"], ["I don't have much time.", "אין לי הרבה זמן."], ["She has a lot of friends.", "יש לה הרבה חברים."]],
    commonMistakes: ["{How much people?} ← {How many people?}", "{many money} ← {much money / a lot of money}."],
    remediation: "a2-much",
    vary: rng => { const x = pick(rng, [["How ___ people are there?", "many", "people נספר"], ["How ___ money do you have?", "much", "money לא נספר"], ["I don't have ___ time.", "much", "time לא נספר"], ["There aren't ___ cars here.", "many", "cars נספר"], ["How ___ sugar do you want?", "much", "sugar לא נספר"], ["How ___ rooms are there?", "many", "rooms נספר"]]); return { fill: x[0], a: x[1], o: [x[1] === "much" ? "many" : "much"], why: "{" + x[2].split(" ")[0] + "} " + x[2].split(" ").slice(1).join(" ") + " ← {" + x[1] + "}." }; },
    drill: [
      { err: "How much people live here?", a: "How many people live here?", o: ["How many people lives here?"], why: "{people} נספר ← {many}." },
    ] });

  def({ id: "modal-should", level: "a2", title: "should — כדאי (עצה)", prerequisites: ["can-ability", "present-simple-negative"],
    explanation: "{should} + פועל בסיס = עצה, \"כדאי ל...\": {You should rest}. כמו {can} — לא משתנה ({She should}), בלי {to}. שלילה: {shouldn't} = לא כדאי. שאלה: {Should I call him?}",
    examples: [["You should see a doctor.", "כדאי לך ללכת לרופא."], ["You shouldn't eat so much sugar.", "לא כדאי לך לאכול כל כך הרבה סוכר."], ["What should I do?", "מה כדאי לי לעשות?"]],
    commonMistakes: ["{You should to rest} ← {You should rest}.", "{She shoulds} ← {She should}.", "{You should resting} ← {You should rest}."],
    remediation: "a2-should",
    vary: rng => { const x = pick(rng, [["I have a headache.", "You should take some medicine.", "You should to take medicine."], ["I'm tired.", "You should go to bed early.", "You should going to bed."], ["I'm hungry.", "You should eat something.", "You shoulds eat something."], ["I'm sick.", "You should see a doctor.", "You should seeing a doctor."]]); return { npc: x[0], a: x[1], o: [x[2]], why: "{should} + פועל בסיס — בלי {to}, בלי s, בלי {-ing}." }; },
    drill: [
      { err: "You should to rest.", a: "You should rest.", o: ["You shoulds rest."], why: "אחרי {should} אין {to}." },
    ] });

  def({ id: "modal-must-have-to", level: "a2", title: "must / have to — חייבים", prerequisites: ["modal-should", "present-simple-third-person-s"],
    explanation: "{must} + פועל = חובה חזקה, הרבה פעמים חוק או כלל: {You must wear a seatbelt}. {have to} = צריך/חייב בגלל הנסיבות: {I have to work tomorrow}. עם he/she: {has to}. **זהירות**: {mustn't} = אסור! ({You mustn't smoke here}), אבל {don't have to} = לא חייבים (אפשר, אבל לא צריך).",
    examples: [["You must show your passport.", "חובה להציג דרכון."], ["She has to go to the dentist.", "היא צריכה ללכת לרופא שיניים."], ["You mustn't smoke here.", "אסור לעשן כאן."], ["You don't have to pay. It's free.", "לא צריך לשלם. זה חינם."]],
    commonMistakes: ["{She have to} ← {She has to}.", "{I must to go} ← {I must go}.", "לבלבל {mustn't} (אסור) עם {don't have to} (לא חייבים)."],
    remediation: "a2-must",
    vary: rng => { const x = pick(rng, [["It's free. You ___ pay.", "don't have to", "mustn't", "חינם = לא חייבים, אבל מותר"], ["It's dangerous. You ___ smoke here.", "mustn't", "don't have to", "מסוכן = אסור"], ["She ___ work on Sunday.", "has to", "have to", "עם {she} ← {has to}"], ["I ___ go to the bank today.", "have to", "has to", "עם {I} ← {have to}"]]); return { fill: x[0], a: x[1], o: [x[2]], why: x[3] + "." }; },
    drill: [
      { err: "He have to work today.", a: "He has to work today.", o: ["He must to work today."], why: "עם {he} ← {has to}." },
    ] });

  def({ id: "adverbs-manner", level: "a2", title: "תארי פועל: quickly, slowly, well", prerequisites: ["present-simple-he-she-it", "comparatives"],
    explanation: "תואר הפועל מתאר **איך** עושים משהו. לרוב מוסיפים {-ly} לשם התואר: {slow} ← {slowly}. אם שם התואר נגמר ב-{y}, הופכים ל-{i} ומוסיפים {-ly}: {easy} ← {easily}. יוצא דופן חשוב: {good} ← {well} (לא {goodly}!). {She drives slowly}. {He speaks English well}.",
    examples: [["She drives slowly.", "היא נוהגת לאט."], ["He speaks English well.", "הוא מדבר אנגלית טוב."], ["They work quickly.", "הם עובדים מהר."]],
    commonMistakes: ["{She drives slow} ← {She drives slowly}.", "{He speaks English good} ← {He speaks English well}.", "לשכוח {-ly}: {He runs quick} ← {He runs quickly}."],
    remediation: "a2-adverbs",
    vary: rng => { const x = pick(rng, [["quiet", "quietly"], ["careful", "carefully"], ["happy", "happily"], ["easy", "easily"], ["quick", "quickly"], ["slow", "slowly"]]); return { fill: "She speaks very ___. (" + x[0] + ")", a: x[1], o: [x[0]], why: "תואר הפועל: {" + x[0] + "} ← {" + x[1] + "}." }; },
    drill: [
      { err: "He speaks English good.", a: "He speaks English well.", o: ["He speaks English goodly."], why: "{good} ← {well}, לא {goodly}." },
    ] });

  def({ id: "object-pronouns", level: "a2", title: "כינויי מושא: me, him, her, us, them", prerequisites: ["subject-pronouns", "word-order-svo"],
    explanation: "אחרי פועל או מילת יחס ({to}, {for}, {with}...) משתמשים בכינוי מושא, לא בכינוי גוף: {I} ← {me}, {he} ← {him}, {she} ← {her}, {we} ← {us}, {they} ← {them}. {it} ו-{you} נשארים אותו דבר. {Call me}. {I love them}. {Give it to her}.",
    examples: [["Call me later.", "תתקשרי אליי אחר כך."], ["I love them.", "אני אוהבת אותם."], ["Give it to her.", "תני לה את זה."]],
    commonMistakes: ["{Call I} ← {Call me}.", "{I love they} ← {I love them}.", "{Give it to she} ← {Give it to her}."],
    remediation: "a2-objpron",
    vary: rng => { const x = pick(rng, [["I", "me", "Call ___ tomorrow."], ["he", "him", "I saw ___ yesterday."], ["she", "her", "Give the book to ___."], ["we", "us", "Come with ___."], ["they", "them", "I sent ___ an email."]]); return { fill: x[2], a: x[1], o: [x[0]], why: "אחרי פועל / מילת יחס: {" + x[0] + "} ← {" + x[1] + "}." }; },
    drill: [
      { err: "Call I tomorrow.", a: "Call me tomorrow.", o: ["Call my tomorrow."], why: "אחרי פועל ← כינוי מושא: {me}." },
    ] });

  def({ id: "infinitives", level: "a2", title: "רוצה ל...: want to / need to / would like to", prerequisites: ["would-like", "present-simple-questions"],
    explanation: "אחרי פעלים כמו {want}, {need}, {would like}, {decide}, {hope} בא {to} + פועל בסיס (בלי s, בלי ing): {I want to travel}. {She needs to rest}. עם he/she הפועל הראשון מקבל s, אבל הפועל שאחרי {to} נשאר בסיס: {She needs to rest}, לא {She needs to rests}.",
    examples: [["I want to travel.", "אני רוצה לטייל."], ["She needs to rest.", "היא צריכה לנוח."], ["We would like to order.", "היינו רוצים להזמין."]],
    commonMistakes: ["{I want travel} ← {I want to travel}.", "{She need to rest} ← {She needs to rest}.", "{I want traveling} ← {I want to travel}."],
    remediation: "a2-inf",
    vary: rng => { const x = pick(rng, [["I", "want", "travel"], ["She", "needs", "rest"], ["We", "need", "go home"], ["He", "wants", "learn English"], ["They", "would like", "order now"]]); return { build: x[0] + " " + x[1] + " to " + x[2] + ".", he: "", why: "{" + x[1] + "} + {to} + פועל בסיס: {to " + x[2] + "}." }; },
    drill: [
      { err: "I want travel to Italy.", a: "I want to travel to Italy.", o: ["I want traveling to Italy."], why: "{want} + {to} + פועל בסיס." },
    ] });

  def({ id: "gerunds-beginner", level: "a2", title: "אוהבת לעשות: like / love / hate + ing", prerequisites: ["present-continuous-form", "infinitives"],
    explanation: "אחרי {like}, {love}, {hate}, {enjoy} אפשר להוסיף פועל עם {-ing} (לא {to} + פועל): {I love cooking}. {She enjoys swimming}. שימו לב לכתיב: לפעמים מכפילים עיצור ({swim} ← {swimming}) או מורידים {e} ({dance} ← {dancing}).",
    examples: [["I love cooking.", "אני אוהבת לבשל."], ["She enjoys swimming.", "היא נהנית לשחות."], ["He hates waiting.", "הוא שונא לחכות."]],
    commonMistakes: ["{I love cook} ← {I love cooking}.", "{She enjoys to swim} ← {She enjoys swimming}.", "כתיב: {swiming} ← {swimming} (הכפלת עיצור)."],
    remediation: "a2-gerund",
    vary: rng => { const x = pick(rng, [["I", "love", "cook", "cooking"], ["She", "enjoys", "dance", "dancing"], ["He", "hates", "wait", "waiting"], ["We", "like", "travel", "traveling"], ["They", "love", "read", "reading"]]); return { fill: x[0] + " " + x[1] + " ___. (" + x[2] + ")", a: x[3], o: [x[2]], why: "אחרי {" + x[1] + "} ← {-ing}: {" + x[3] + "}." }; },
    drill: [
      { err: "I love to cook every day.", a: "I love cooking every day.", o: ["I love cook every day."], why: "אחרי {love} אפשר {-ing}: {cooking}." },
    ] });

  def({ id: "present-perfect-ever-never", level: "a2", title: "ניסיון בחיים: ever / never", prerequisites: ["past-irregular-3", "past-simple-negative-questions"],
    explanation: "{have/has} + צורת פועל שלישית (Past Participle) מתארת ניסיון בחיים, בלי זמן מדויק: {Have you ever been to London?} — {No, I've never been there.} {ever} בשאלות = \"אי פעם\", {never} = \"אף פעם לא\". עם he/she: {has}.",
    examples: [["Have you ever been to London?", "היית פעם בלונדון?"], ["I have never tried sushi.", "מעולם לא ניסיתי סושי."], ["She has visited Paris twice.", "היא ביקרה בפריז פעמיים."]],
    commonMistakes: ["{I have never went} ← {I have never been}.", "{Did you ever go there?} ← {Have you ever been there?} (בהקשר של ניסיון כללי).", "לשכוח {have/has}: {I never been there} ← {I have never been there}."],
    remediation: "a2-pp-1",
    vary: rng => { const x = pick(rng, [["you", "eaten sushi", "Have ___ ever eaten sushi?"], ["she", "been to Paris", "Has ___ ever been to Paris?"], ["they", "tried surfing", "Have ___ ever tried surfing?"]]); return { fill: x[2].replace("___", "___"), a: x[0], o: [x[0] === "she" ? "her" : x[0] + "s"], why: "שאלה עם {ever}: {Have/Has} + נושא + {ever} + פועל שלישי." }; },
    drill: [
      { err: "I never been to London.", a: "I have never been to London.", o: ["I never was to London."], why: "צריך {have}: {I have never been}." },
    ] });

  def({ id: "present-perfect-already-yet", level: "a2", title: "כבר ועדיין: already / yet", prerequisites: ["present-perfect-ever-never"],
    explanation: "{already} = כבר, במשפט חיובי, בדרך כלל לפני הפועל השלישי: {I've already eaten}. {yet} = עדיין / כבר, בשלילה ובשאלה, בסוף המשפט: {Have you finished yet?} {I haven't finished yet}. אי אפשר לערבב ביניהם באותו משפט.",
    examples: [["I've already eaten.", "כבר אכלתי."], ["Have you finished yet?", "סיימת כבר?"], ["I haven't finished yet.", "עדיין לא סיימתי."]],
    commonMistakes: ["{I have finished already yet} ← לבחור אחד בלבד.", "{already} בסוף שאלה שלילית — לרוב {yet} מתאים שם יותר.", "לשכוח ' ב-{I've} ({I have})."],
    remediation: "a2-pp-2",
    vary: rng => { const x = pick(rng, [["eaten", "I've already ___.", "already"], ["called her", "I've already ___.", "already"], ["finished", "Have you ___ yet?", "yet"]]); return { fill: x[1].replace("___", x[0]), a: x[2], o: [x[2] === "already" ? "yet" : "already"], why: "{already} = חיובי, {yet} = שלילה/שאלה." }; },
    drill: [
      { err: "I have finished already yet.", a: "I have already finished.", o: ["I have finished yet already."], why: "רק אחד: {already} או {yet}, לא שניהם." },
    ] });
  def({ id: "past-continuous", level: "a2", title: "מה עשית כש...: was / were + ing", prerequisites: ["past-be-was-were", "present-continuous-form"],
    explanation: "{was / were} + פועל עם {-ing} מתאר פעולה שהייתה **באמצע** בזמן מסוים בעבר: {I was watching TV at 8 o'clock}. עם {I / he / she / it} ← {was}, עם {you / we / they} ← {were}. משתמשים בו עם {when} (פעולה קצרה שקטעה) ו-{while} (שתי פעולות ארוכות שקרו יחד): {I was cooking when the phone rang}. {She was reading while he was cooking}.",
    examples: [["I was watching TV at eight.", "ראיתי טלוויזיה בשמונה."], ["She was sleeping when I called.", "היא ישנה כשהתקשרתי."], ["They were playing while we were cooking.", "הם שיחקו בזמן שאנחנו בישלנו."]],
    commonMistakes: ["{She were reading} ← {She was reading}.", "{We was walking} ← {We were walking}.", "{I was watch} ← {I was watching} (חייבים {-ing})."],
    remediation: "a2-past-cont",
    vary: rng => { const x = pick(rng, [["I", "was", "cook", "cooking"], ["She", "was", "sleep", "sleeping"], ["They", "were", "play", "playing"], ["We", "were", "walk", "walking"], ["He", "was", "read", "reading"]]); return { fill: x[0] + " ___ when you called. (" + x[2] + ")", a: x[1] + " " + x[3], o: [(x[1] === "was" ? "were " : "was ") + x[3], x[1] + " " + x[2]], why: "{" + x[1] + "} + {-ing}: {" + x[1] + " " + x[3] + "}." }; },
    drill: [
      { err: "She were reading a book.", a: "She was reading a book.", o: ["She was read a book."], why: "עם {she} ← {was}, ואחריו {-ing}." },
      { err: "We was walking home.", a: "We were walking home.", o: ["We were walk home."], why: "עם {we} ← {were}." },
    ] });

  def({ id: "too-enough", level: "a2", title: "יותר מדי / מספיק: too, enough", prerequisites: ["comparatives"],
    explanation: "{too} + תואר = **יותר מדי** (בעיה): {It's too hot}. {תואר + enough} = **מספיק**: {He's tall enough}. עם שם עצם, {enough} בא **לפניו**: {We have enough time}. שימו לב: {too} לפני התואר, אבל {enough} **אחריו**: {hot enough}, לא {enough hot}.",
    examples: [["This bag is too heavy.", "התיק הזה כבד מדי."], ["I'm not tall enough.", "אני לא גבוהה מספיק."], ["We have enough time.", "יש לנו מספיק זמן."]],
    commonMistakes: ["{enough hot} ← {hot enough}.", "{too much expensive} ← {too expensive}.", "{I have too money} ← {I have too much money}."],
    remediation: "a2-too-enough",
    vary: rng => { const x = pick(rng, [["The tea is ___ hot. I can't drink it.", "too", "enough", "בעיה: יותר מדי חם"], ["I'm not tall ___ to reach it.", "enough", "too", "מספיק אחרי התואר: {tall enough}"], ["The room is big ___ for six people.", "enough", "too", "מספיק אחרי התואר: {big enough}"], ["It's ___ late to call her now.", "too", "enough", "יותר מדי מאוחר = בעיה: {too late}"]]); return { fill: x[0], a: x[1], o: [x[2]], why: x[3] + "." }; },
    drill: [
      { err: "The tea is enough hot.", a: "The tea is hot enough.", o: ["The tea is too enough hot."], why: "{enough} בא אחרי התואר: {hot enough}." },
      { err: "It is too much expensive.", a: "It is too expensive.", o: ["It is enough expensive."], why: "לפני תואר ← {too}, בלי {much}." },
    ] });

  def({ id: "requests-offers", level: "a2", title: "בקשות והצעות: Could you...? Would you like...?", prerequisites: ["would-like", "can-ability"],
    explanation: "לבקש בנימוס: {Can I...?} ו-{Could I...?} (אפשר ל...) ו-{Could you...?} / {Can you...?} (תוכלי...). {Could} מנומס יותר. אחריהם פועל בבסיס, בלי {to}: {Could you help me?} להציע: {Would you like...?} ({Would you like some tea?}) וגם {Can I help you?}. תשובות מנומסות: {Sure}, {Of course}, {Yes, please}, {No, thank you}.",
    examples: [["Could you help me, please?", "תוכלי לעזור לי, בבקשה?"], ["Can I have the bill, please?", "אפשר לקבל את החשבון, בבקשה?"], ["Would you like some water?", "תרצי קצת מים?"]],
    commonMistakes: ["{Could you to help me?} ← {Could you help me?}.", "{Can you opening the door?} ← {Can you open the door?}.", "{Do you want some tea?} נשמע ישיר; {Would you like...?} מנומס יותר."],
    remediation: "a2-requests",
    vary: rng => { const x = pick(rng, [["Could", "help", "me"], ["Can", "open", "the door"], ["Could", "send", "me a message"], ["Can", "wait", "a minute"]]); return { build: x[0] + " you " + x[1] + " " + x[2] + ", please?", he: "", why: "{" + x[0] + " you} + פועל בבסיס: {" + x[1] + "}." }; },
    drill: [
      { err: "Could you to help me?", a: "Could you help me?", o: ["Could you helping me?"], why: "אחרי {Could you} ← פועל בבסיס, בלי {to}." },
      { err: "Can you opening the door?", a: "Can you open the door?", o: ["Can you opens the door?"], why: "אחרי {Can you} ← פועל בבסיס." },
    ] });

  def({ id: "first-conditional", level: "a2", title: "אם... אז...: If + הווה, will", prerequisites: ["future-will"],
    explanation: "כדי לדבר על דבר שעשוי לקרות בעתיד ומה תהיה התוצאה: {If} + **הווה פשוט**, {will} + פועל. {If it rains, I will stay home}. **אל תשימו {will} אחרי {if}**: {If it rains}, לא {If it will rain}. אפשר גם להפוך את הסדר, בלי פסיק: {I will stay home if it rains}.",
    examples: [["If it rains, I will stay home.", "אם ירד גשם, אשאר בבית."], ["If you study, you will pass.", "אם תלמדי, תעברי."], ["I will call you if I have time.", "אתקשר אלייך אם יהיה לי זמן."]],
    commonMistakes: ["{If it will rain} ← {If it rains}.", "{If I will see him} ← {If I see him}.", "{If it rain} ← {If it rains} (עם it ← {rains})."],
    remediation: "a2-if",
    vary: rng => { const x = pick(rng, [["If it ___ tomorrow, we will stay home.", "rains", "will rain"], ["If you ___ hard, you will pass the test.", "study", "will study"], ["If she ___ me, I will answer.", "calls", "will call"], ["If he ___ late, we will start without him.", "is", "will be"]]); return { fill: x[0], a: x[1], o: [x[2]], why: "אחרי {if} ← הווה פשוט, בלי {will}." }; },
    drill: [
      { err: "If it will rain, I will take an umbrella.", a: "If it rains, I will take an umbrella.", o: ["If it rain, I will take an umbrella."], why: "אחרי {if} ← הווה פשוט: {rains}." },
      { err: "If I will see him, I will tell him.", a: "If I see him, I will tell him.", o: ["If I saw him, I will tell him."], why: "אחרי {if} ← {see}, בלי {will}." },
    ] });
})(typeof globalThis !== "undefined" ? globalThis : this);
