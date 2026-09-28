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
    {
      id: "morning-routine",
      emoji: "🌅",
      title: "שגרת בוקר בריאה",
      minutes: 3,
      level: "a1",
      vocab: ["routine", "energy", "focus", "grateful"],
      paragraphs: [
        [
          ["A good morning routine can change your day.", "שגרת בוקר טובה יכולה לשנות את היום שלך."],
          ["Wake up a little earlier than you need to.", "תתעוררי קצת יותר מוקדם ממה שאת צריכה."],
          ["Drink a glass of water first.", "שתי כוס מים קודם כל."],
        ],
        [
          ["Move your body for a few minutes.", "תזיזי את הגוף שלך כמה דקות."],
          ["A short walk or stretch gives you energy.", "הליכה קצרה או מתיחה נותנות לך אנרגיה."],
          ["Eat a real breakfast, not just coffee.", "תאכלי ארוחת בוקר אמיתית, לא רק קפה."],
        ],
        [
          ["Write down one thing you are grateful for.", "כתבי דבר אחד שאת אסירת תודה עליו."],
          ["It helps you focus on what is good.", "זה עוזר לך להתמקד במה שטוב."],
          ["Small habits make a big difference.", "הרגלים קטנים עושים הבדל גדול."],
        ],
      ],
    },
    {
      id: "handling-stress",
      emoji: "🧘",
      title: "איך מתמודדים עם לחץ",
      minutes: 3,
      level: "a2",
      vocab: ["stress", "breathe", "calm", "overwhelmed"],
      paragraphs: [
        [
          ["Everyone feels stress sometimes.", "כולם מרגישים לחץ לפעמים."],
          ["It is normal to feel overwhelmed.", "זה נורמלי להרגיש מוצפת."],
          ["The important thing is how you respond.", "הדבר החשוב הוא איך את מגיבה."],
        ],
        [
          ["When you feel stress, stop and breathe.", "כשאת מרגישה לחץ, תעצרי ותנשמי."],
          ["Take a slow, deep breath in and out.", "קחי נשימה עמוקה ואיטית פנימה והחוצה."],
          ["This helps your body feel calm again.", "זה עוזר לגוף שלך להרגיש רגוע שוב."],
        ],
        [
          ["Talk to a friend when things feel hard.", "דברי עם חברה כשדברים מרגישים קשים."],
          ["You do not have to handle everything alone.", "את לא חייבת להתמודד עם הכל לבד."],
          ["Ask for help. It is a sign of strength.", "בקשי עזרה. זה סימן לחוזק."],
        ],
      ],
    },
    {
      id: "traveling-alone",
      emoji: "🧳",
      title: "לטייל לבד — למה כדאי לנסות",
      minutes: 4,
      level: "a2",
      vocab: ["confidence", "plan", "vacation", "grateful"],
      paragraphs: [
        [
          ["Traveling alone can feel scary at first.", "לטייל לבד יכול להרגיש מפחיד בהתחלה."],
          ["But it also builds real confidence.", "אבל זה גם בונה ביטחון עצמי אמיתי."],
          ["You learn to trust your own decisions.", "את לומדת לבטוח בהחלטות שלך."],
        ],
        [
          ["Start with a simple plan.", "התחילי עם תוכנית פשוטה."],
          ["Choose one city for a short vacation.", "בחרי עיר אחת לחופשה קצרה."],
          ["You can always change the plan later.", "תמיד אפשר לשנות את התוכנית אחר כך."],
        ],
        [
          ["Talk to new people along the way.", "דברי עם אנשים חדשים בדרך."],
          ["Every trip teaches you something new.", "כל טיול מלמד אותך משהו חדש."],
          ["Be grateful for the freedom to explore.", "היי אסירת תודה על החופש לחקור."],
        ],
      ],
    },
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
