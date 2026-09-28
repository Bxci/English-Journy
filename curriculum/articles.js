/*
  curriculum/articles.js — "Reading" section: short Wikipedia-style articles, Hebrew-taught,
  on topics that resonate with everyday life (friendship, self-care, relationships, confidence...).

  Not part of the graded CURRICULUM (no unlock gating) — this is free reading practice.
  Each paragraph is a list of sentences; each sentence has { en, he } so it can be tapped for
  audio (English, via the existing Audio.speak) and read with its Hebrew translation underneath.
  `vocab` lists vocabulary ids (from curriculum/vocabulary.js) that this article reinforces —
  finishing the article gives those words a light positive touch in the spaced-repetition system,
  the same way finishing a lesson does.

  Row format for a paragraph: [en, he]
*/
(function (root) {
  root.ARTICLES = [
    {
      id: "self-care-routine",
      emoji: "🛁",
      title: "טיפוח עצמי - לא אגואיזם",
      minutes: 3,
      level: "a1",
      vocab: ["self-care", "routine", "rest", "grateful", "recharge"],
      paragraphs: [
        [
          ["Self-care is not selfish.", "טיפוח עצמי הוא לא אגואיזם."],
          ["It means taking care of your body and your mind.", "זה אומר לדאוג לגוף ולנפש שלך."],
          ["Every person needs rest.", "כל אדם צריך מנוחה."],
        ],
        [
          ["A simple routine can help.", "שגרה פשוטה יכולה לעזור."],
          ["Drink water in the morning.", "שתי מים בבוקר."],
          ["Wash your face and take care of your skin.", "שטפי את הפנים וטפלי בעור שלך."],
          ["Take five minutes to breathe.", "קחי חמש דקות לנשום."],
        ],
        [
          ["You can recharge on the weekend.", "את יכולה להיטען מחדש בסוף השבוע."],
          ["Read a book, walk outside, or rest at home.", "תקראי ספר, תטיילי בחוץ, או תנוחי בבית."],
          ["Be grateful for small moments.", "היי אסירת תודה על רגעים קטנים."],
        ],
      ],
    },
    {
      id: "true-friendship",
      emoji: "👭",
      title: "מה זו חברות אמיתית",
      minutes: 3,
      level: "a1",
      vocab: ["friendship", "support", "trust", "honest", "forgive"],
      paragraphs: [
        [
          ["Friendship is one of the best things in life.", "חברות היא אחד הדברים הכי טובים בחיים."],
          ["A true friend gives you support.", "חברה אמיתית נותנת לך תמיכה."],
          ["You can trust a true friend.", "את יכולה לבטוח בחברה אמיתית."],
        ],
        [
          ["Good friends are honest with each other.", "חברות טובות כנות אחת עם השנייה."],
          ["They tell the truth, even when it is hard.", "הן אומרות את האמת, גם כשזה קשה."],
          ["Sometimes friends make mistakes.", "לפעמים חברות טועות."],
          ["It is important to forgive.", "חשוב לסלוח."],
        ],
        [
          ["Call your friend today.", "התקשרי לחברה שלך היום."],
          ["Say: \"I am grateful for you.\"", "תגידי: \"אני אסירת תודה עלייך.\""],
        ],
      ],
    },
    {
      id: "healthy-relationship",
      emoji: "💞",
      title: "סימנים למערכת יחסים בריאה",
      minutes: 4,
      level: "a2",
      vocab: ["relationship", "honest", "comfortable", "trust", "deserve"],
      paragraphs: [
        [
          ["A healthy relationship starts with respect.", "מערכת יחסים בריאה מתחילה בכבוד."],
          ["Both people feel comfortable.", "שני האנשים מרגישים בנוח."],
          ["You can be honest about your feelings.", "את יכולה להיות כנה לגבי הרגשות שלך."],
        ],
        [
          ["Good communication is very important.", "תקשורת טובה היא חשובה מאוד."],
          ["Talk about problems, do not hide them.", "דברי על בעיות, אל תסתירי אותן."],
          ["Trust grows when people are honest.", "אמון גדל כשאנשים כנים."],
        ],
        [
          ["You deserve kindness and respect.", "מגיע לך אדיבות וכבוד."],
          ["A good partner supports your goals.", "בן/בת זוג טובים תומכים במטרות שלך."],
          ["Never forget: you deserve to be happy.", "לעולם אל תשכחי: מגיע לך להיות מאושרת."],
        ],
      ],
    },
    {
      id: "confidence-tips",
      emoji: "💪",
      title: "איך בונים ביטחון עצמי",
      minutes: 3,
      level: "a2",
      vocab: ["confidence", "deserve", "grateful", "overwhelmed", "worth it"],
      paragraphs: [
        [
          ["Confidence is a skill, not a gift.", "ביטחון עצמי הוא כישרון נרכש, לא מתנה."],
          ["You can practice it every day.", "את יכולה לתרגל אותו כל יום."],
        ],
        [
          ["Stand tall and speak clearly.", "עמדי זקוף/ה ודברי בבירור."],
          ["Say positive things to yourself.", "אמרי לעצמך דברים חיוביים."],
          ["Sometimes life feels overwhelmed.", "לפעמים החיים מרגישים מציפים."],
          ["That is okay. Take one small step.", "זה בסדר. עשי צעד קטן אחד."],
        ],
        [
          ["Remember: the effort is worth it.", "זכרי: המאמץ שווה את זה."],
          ["You deserve to feel proud of yourself.", "מגיע לך להרגיש גאווה בעצמך."],
        ],
      ],
    },
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
