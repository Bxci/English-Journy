/*
  curriculum/listening.js — "האזנה" (listening comprehension).

  Short passages the learner first HEARS without seeing the text, then answers comprehension
  questions about. The text and Hebrew translation can be revealed afterwards.
  Not part of the graded CURRICULUM (no unlock gating).

  Passage: { id, emoji, title, level, minutes, lines: [[en, he], ...], questions: [{ q, a, o: [wrong...] }] }
  Questions are in Hebrew; answers are short (Hebrew, a number, or a single English word) so the
  learner is tested on understanding, not on reading English options.
*/
(function (root) {
  root.LISTENING = [
    {
      id: "listen-new-friend", emoji: "🤝", title: "חברה חדשה", level: "pre-a1", minutes: 2,
      lines: [
        ["Hi! My name is Maya.", "היי! קוראים לי מאיה."],
        ["I am from Israel.", "אני מישראל."],
        ["I am twenty-five years old.", "אני בת עשרים וחמש."],
        ["I have a brother and a sister.", "יש לי אח ואחות."],
        ["I like coffee and music.", "אני אוהבת קפה ומוזיקה."],
      ],
      questions: [
        { q: "איך קוראים לדוברת?", a: "מאיה", o: ["דנה", "נועה"] },
        { q: "בת כמה היא?", a: "25", o: ["15", "35"] },
        { q: "כמה אחים ואחיות יש לה?", a: "אח אחד ואחות אחת", o: ["שני אחים", "אין לה אחים"] },
      ],
    },
    {
      id: "listen-morning", emoji: "☀️", title: "הבוקר של דן", level: "a1", minutes: 2,
      lines: [
        ["Dan wakes up at seven o'clock.", "דן מתעורר בשבע."],
        ["He drinks a cup of coffee.", "הוא שותה כוס קפה."],
        ["Then he takes a shower.", "אחר כך הוא מתקלח."],
        ["He goes to work by bus.", "הוא נוסע לעבודה באוטובוס."],
        ["He starts work at nine.", "הוא מתחיל לעבוד בתשע."],
      ],
      questions: [
        { q: "באיזו שעה דן מתעורר?", a: "7:00", o: ["8:00", "9:00"] },
        { q: "מה דן שותה בבוקר?", a: "קפה", o: ["תה", "מים"] },
        { q: "איך הוא מגיע לעבודה?", a: "באוטובוס", o: ["ברכבת", "ברגל"] },
        { q: "באיזו שעה הוא מתחיל לעבוד?", a: "9:00", o: ["7:00", "10:00"] },
      ],
    },
    {
      id: "listen-restaurant", emoji: "🍽️", title: "במסעדה", level: "a1", minutes: 2,
      lines: [
        ["Waiter: Good evening. What would you like?", "מלצר: ערב טוב. מה תרצי?"],
        ["Anna: I would like a chicken salad, please.", "אנה: אני רוצה סלט עוף, בבקשה."],
        ["Waiter: And to drink?", "מלצר: ומה לשתות?"],
        ["Anna: Just water, thank you.", "אנה: רק מים, תודה."],
        ["Waiter: That is twenty-five shekels.", "מלצר: זה עשרים וחמישה שקלים."],
      ],
      questions: [
        { q: "מה אנה מזמינה לאכול?", a: "סלט עוף", o: ["פיצה", "מרק"] },
        { q: "מה היא שותה?", a: "מים", o: ["קולה", "מיץ"] },
        { q: "כמה היא צריכה לשלם?", a: "25 שקלים", o: ["15 שקלים", "52 שקלים"] },
      ],
    },
    {
      id: "listen-weekend", emoji: "🏖️", title: "סוף שבוע", level: "a1", minutes: 2,
      lines: [
        ["Last weekend, I went to the beach.", "בסוף השבוע שעבר הלכתי לים."],
        ["The weather was hot and sunny.", "מזג האוויר היה חם ושמשי."],
        ["I met my friends there.", "פגשתי שם את החברים שלי."],
        ["We swam, ate ice cream and talked.", "שחינו, אכלנו גלידה ודיברנו."],
        ["It was a great day.", "זה היה יום נהדר."],
      ],
      questions: [
        { q: "לאן הדוברת הלכה?", a: "לים", o: ["לקניון", "לעבודה"] },
        { q: "איך היה מזג האוויר?", a: "חם ושמשי", o: ["קר וגשום", "מעונן"] },
        { q: "מה הם אכלו?", a: "גלידה", o: ["פיצה", "כריכים"] },
        { q: "איך היה היום?", a: "נהדר", o: ["משעמם", "גרוע"] },
      ],
    },
    {
      id: "listen-doctor", emoji: "🩺", title: "אצל הרופא", level: "a2", minutes: 3,
      lines: [
        ["Doctor: What is the problem?", "רופא: מה הבעיה?"],
        ["Tom: I have a headache and a sore throat.", "טום: יש לי כאב ראש וכאב גרון."],
        ["Doctor: How long have you felt like this?", "רופא: כמה זמן אתה מרגיש ככה?"],
        ["Tom: Since Monday. I feel very tired.", "טום: מאז יום שני. אני מרגיש עייף מאוד."],
        ["Doctor: You should rest and drink a lot of water.", "רופא: כדאי שתנוח ותשתה הרבה מים."],
        ["Doctor: Take this medicine twice a day.", "רופא: קח את התרופה הזו פעמיים ביום."],
      ],
      questions: [
        { q: "מה כואב לטום?", a: "הראש והגרון", o: ["הבטן והגב", "הרגל והיד"] },
        { q: "מאז מתי הוא מרגיש ככה?", a: "מיום שני", o: ["מאתמול", "מיום שישי"] },
        { q: "מה הרופא ממליץ?", a: "לנוח ולשתות הרבה מים", o: ["ללכת לעבודה", "לאכול הרבה ממתקים"] },
        { q: "כמה פעמים ביום לקחת את התרופה?", a: "פעמיים", o: ["פעם אחת", "שלוש פעמים"] },
      ],
    },
    {
      id: "listen-travel-plan", emoji: "✈️", title: "תוכנית לטיול", level: "a2", minutes: 3,
      lines: [
        ["Next month, I am going to travel to Italy.", "בחודש הבא אני נוסעת לאיטליה."],
        ["I am going to visit Rome and Florence.", "אני הולכת לבקר ברומא ובפירנצה."],
        ["I have never been there before.", "מעולם לא הייתי שם."],
        ["I have already bought my plane ticket.", "כבר קניתי כרטיס טיסה."],
        ["I haven't booked a hotel yet.", "עדיין לא הזמנתי מלון."],
        ["I want to try real Italian pizza!", "אני רוצה לטעום פיצה איטלקית אמיתית!"],
      ],
      questions: [
        { q: "לאן הדוברת נוסעת?", a: "לאיטליה", o: ["לצרפת", "לספרד"] },
        { q: "האם היא כבר הייתה שם?", a: "לא, אף פעם", o: ["כן, פעמיים", "כן, פעם אחת"] },
        { q: "מה היא כבר עשתה?", a: "קנתה כרטיס טיסה", o: ["הזמינה מלון", "ארזה מזוודה"] },
        { q: "מה היא עדיין לא עשתה?", a: "לא הזמינה מלון", o: ["לא קנתה כרטיס", "לא סיימה לעבוד"] },
        { q: "מה היא רוצה לטעום?", a: "פיצה", o: ["גלידה", "פסטה"] },
      ],
    },
  ];
  if (typeof module === "object" && module.exports) module.exports = root.LISTENING;
})(typeof globalThis !== "undefined" ? globalThis : this);
