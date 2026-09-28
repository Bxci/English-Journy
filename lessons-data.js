/*
  lessons-data.js — motivational content and app-level data (not the curriculum itself).
  The curriculum lives in curriculum/*.js. This file keeps: encouragement messages, gifts, badges,
  the optional short placement check, onboarding goal flavor texts, and the mapping of the old
  (v1) 10-unit course onto the new lessons, used to migrate existing learners' progress.
*/

// הודעות עידוד שיוצגו אחרי כל שיעור, באקראי
var ENCOURAGEMENT_MESSAGES = [
  "כל מילה שאת לומדת היא צעד קדימה. את מדהימה! 💪",
  "אין דבר כזה 'אני לא מסוגלת' — יש רק 'עוד לא'. תמשיכי כך!",
  "היום את קצת יותר קרובה לדבר אנגלית בביטחון. גאה בך!",
  "ההתמדה שלך היא הכוח האמיתי. כל הכבוד על השיעור הזה!",
  "השפה נלמדת שלב אחר שלב — ואת בדיוק בקצב הנכון.",
  "את של לפני שבוע הייתה גאה בך היום.",
  "עוד שיעור, עוד ניצחון קטן. תמשיכי לצבור אותם!",
  "את בונה כאן משהו ששווה המון — תמשיכי להאמין בעצמך.",
  "כל טעות היא רק חלק מהדרך להצלחה. יופי של עבודה!",
  "יש לך את זה. פשוט תמשיכי לפתוח את השיעור הבא.",
];

// מתנות (אמוג'י) שנפתחות בסיום שיעור
var GIFTS = ["🌸", "🍫", "🎈", "🧸", "🍭", "🌈", "💐", "🎀", "🍩", "⭐", "🎵", "☕", "🦄", "🍓", "🎨"];

// עיטורים (badges) — לפי מספר שיעורים שהושלמו באמת (לא דילוג), ולפי סיום רמה
var BADGES = [
  { id: "b1", lessonsRequired: 1, icon: "🥉", name: "צעד ראשון" },
  { id: "b2", lessonsRequired: 5, icon: "🥈", name: "מתחילה בביטחון" },
  { id: "b3", lessonsRequired: 15, icon: "🥇", name: "חצי דרך ל-A1" },
  { id: "b4", lessonsRequired: 30, icon: "💎", name: "לומדת מתמידה" },
  { id: "b5", lessonsRequired: 50, icon: "👑", name: "אלופת האנגלית" },
  { id: "lvl-pre-a1", level: "pre-a1", icon: "🌱", name: "סיימתי Pre-A1" },
  { id: "lvl-a1", level: "a1", icon: "🌳", name: "סיימתי A1" },
  { id: "lvl-a2", level: "a2", icon: "🏔️", name: "סיימתי את שיעורי A2" },
];

// מטרות למידה — משמשות רק לטקסט מעודד ולסדר הצעת השיחות. לא משנות את סדר הקורס!
var LEARNING_GOALS = [
  { id: "conversation", label: "שיחות יומיומיות", icon: "💬", flavor: "כל מה שלומדים היום — ישר לשיחה אמיתית." },
  { id: "travel", label: "טיולים", icon: "✈️", flavor: "עוד כמה מילים, והטיול הבא נהיה הרבה יותר קל." },
  { id: "work", label: "עבודה", icon: "💼", flavor: "צעד קטן היום — ביטחון גדול בפגישה הבאה." },
  { id: "movies", label: "סרטים וסדרות", icon: "🎬", flavor: "עוד קצת, ותתחילי לתפוס משפטים שלמים בסדרות." },
  { id: "study", label: "לימודים", icon: "🎓", flavor: "בסיס חזק היום = קריאה קלה יותר מחר." },
  { id: "general", label: "סתם כי בא לי", icon: "🌟", flavor: "לומדים בשביל עצמנו — וזה הכי טוב." },
];

// בדיקת רמה קצרה ואופציונלית (אפשר לדלג). level = הרמה שהשאלה בודקת.
var PLACEMENT_TEST = [
  { level: "pre-a1", q: "מה הפירוש של {Thank you}?", a: "תודה", o: ["בבקשה", "סליחה"] },
  { level: "pre-a1", q: "איך כותבים 15?", a: "fifteen", o: ["fifty", "five"] },
  { level: "pre-a1", q: "{a red car} — מה זה?", a: "מכונית אדומה", o: ["מכונית כחולה", "אוטובוס אדום"] },
  { level: "pre-a1", q: "מה עונים ל-{How are you?}", a: "I'm fine, thanks.", o: ["My name is Dana.", "Goodbye."] },
  { level: "a1", q: "She ___ a doctor.", a: "is", o: ["are", "am"] },
  { level: "a1", q: "He ___ in Haifa.", a: "lives", o: ["live", "living"] },
  { level: "a1", q: "___ you like coffee?", a: "Do", o: ["Are", "Does"] },
  { level: "a1", q: "Yesterday I ___ to the beach.", a: "went", o: ["go", "goed"] },
  { level: "a2", q: "The train is ___ than the bus.", a: "faster", o: ["more fast", "fastest"] },
  { level: "a2", q: "There isn't ___ milk.", a: "any", o: ["some", "many"] },
  { level: "a2", q: "You ___ smoke here. It's dangerous.", a: "mustn't", o: ["don't have to", "should to"] },
];

// מיפוי הקורס הישן (v1, 10 יחידות אוצר מילים) לשיעורים החדשים — לשמירת התקדמות קיימת
var LEGACY_UNIT_MAP = {
  u1: ["pa-greet-1", "pa-greet-2", "pa-greet-3"],
  u2: ["pa-num-1"],
  u3: ["pa-family"],
  u4: ["pa-food", "pa-drinks"],
  u5: ["pa-colors"],
  u7: ["pa-home"],
  u9: ["pa-actions"],
};
