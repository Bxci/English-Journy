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
      vocab: ["confidence", "deserve", "grateful", "overwhelmed", "worth-it"],
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
    {
      id: "learn-english-tips",
      emoji: "💡",
      title: "איך ללמוד אנגלית כל יום",
      minutes: 3,
      level: "a1",
      vocab: ["routine", "rest", "focus"],
      paragraphs: [
        [
          ["Learning English is a journey.", "ללמוד אנגלית זה מסע."],
          ["You do not need a lot of time.", "את לא צריכה הרבה זמן."],
          ["Ten minutes every day is better than two hours once a week.", "עשר דקות כל יום עדיפות על שעתיים פעם בשבוע."],
        ],
        [
          ["Listen and repeat out loud.", "הקשיבי וחזרי בקול."],
          ["Read short texts and learn five new words.", "קראי טקסטים קצרים ולמדי חמש מילים חדשות."],
          ["Speak with a friend, even for one minute.", "דברי עם חברה, אפילו דקה אחת."],
        ],
        [
          ["Do not be afraid of mistakes.", "אל תפחדי מטעויות."],
          ["Every mistake teaches your brain something.", "כל טעות מלמדת את המוח משהו."],
          ["Be patient and enjoy the journey.", "היי סבלנית ותהני מהמסע."],
        ],
      ],
    },
    {
      id: "weather-and-mood",
      emoji: "🌦️",
      title: "מזג האוויר והמצב רוח",
      minutes: 3,
      level: "a1",
      vocab: ["weather", "sunny", "cloudy", "windy", "storm"],
      paragraphs: [
        [
          ["The weather changes every day.", "מזג האוויר משתנה כל יום."],
          ["Today it is sunny and warm.", "היום שמשי וחם."],
          ["Yesterday it was cloudy and cold.", "אתמול היה מעונן וקר."],
        ],
        [
          ["Many people feel happy when it is sunny.", "הרבה אנשים מרגישים שמחים כשיש שמש."],
          ["On cloudy days, they feel tired.", "בימים מעוננים הם מרגישים עייפים."],
          ["During a storm, some people like to stay home.", "בזמן סערה, יש אנשים שאוהבים להישאר בבית."],
        ],
        [
          ["You can not change the weather.", "אי אפשר לשנות את מזג האוויר."],
          ["But you can change your plans.", "אבל אפשר לשנות את התוכניות."],
          ["A rainy day is a good day for a book and a warm drink.", "יום גשום הוא יום טוב לספר ולשתייה חמה."],
        ],
      ],
    },
    {
      id: "better-sleep",
      emoji: "😴",
      title: "איך לישון טוב יותר",
      minutes: 3,
      level: "a2",
      vocab: ["rest", "energy", "early", "calm"],
      paragraphs: [
        [
          ["Good sleep gives you energy for the whole day.", "שינה טובה נותנת לך אנרגיה לכל היום."],
          ["Most adults should sleep seven or eight hours.", "רוב המבוגרים צריכים לישון שבע או שמונה שעות."],
          ["When you sleep badly, it is hard to focus.", "כשישנים רע, קשה להתרכז."],
        ],
        [
          ["You should go to bed at the same time every night.", "כדאי ללכת לישון באותה שעה כל לילה."],
          ["You shouldn't drink coffee late in the evening.", "לא כדאי לשתות קפה מאוחר בערב."],
          ["The room must be dark and quiet.", "החדר צריך להיות חשוך ושקט."],
        ],
        [
          ["If you can not sleep, do not look at your phone.", "אם את לא מצליחה לישון, אל תסתכלי בטלפון."],
          ["Read a book or listen to calm music instead.", "במקום זה קראי ספר או האזיני למוזיקה רגועה."],
          ["If you sleep well tonight, tomorrow will be a better day.", "אם תישני טוב הלילה, מחר יהיה יום טוב יותר."],
        ],
      ],
    },
    {
      id: "city-or-village",
      emoji: "🏙️",
      title: "עיר או כפר?",
      minutes: 4,
      level: "a2",
      vocab: ["energy", "stress", "calm"],
      paragraphs: [
        [
          ["Some people love big cities.", "יש אנשים שאוהבים ערים גדולות."],
          ["A city is more exciting than a village.", "עיר מרגשת יותר מכפר."],
          ["There are more jobs, more restaurants and more events.", "יש יותר משרות, יותר מסעדות ויותר אירועים."],
        ],
        [
          ["But life in a city is also more expensive.", "אבל החיים בעיר גם יקרים יותר."],
          ["The streets are louder and the air is dirtier.", "הרחובות רועשים יותר והאוויר מזוהם יותר."],
          ["Many people feel more stress in the city.", "הרבה אנשים מרגישים יותר לחץ בעיר."],
        ],
        [
          ["A village is quieter and calmer.", "כפר שקט ורגוע יותר."],
          ["Neighbors know each other, and life is slower.", "השכנים מכירים זה את זה, והחיים איטיים יותר."],
          ["The best place to live is the place that feels right for you.", "המקום הכי טוב לגור בו הוא המקום שמרגיש נכון בשבילך."],
        ],
      ],
    },
    {
      id: "first-flight",
      emoji: "✈️",
      title: "הטיסה הראשונה שלי",
      minutes: 4,
      level: "a2",
      vocab: ["flight", "suitcase", "hotel", "confidence"],
      paragraphs: [
        [
          ["Last year, I took my first flight alone.", "אשתקד טסתי בפעם הראשונה לבד."],
          ["I was nervous because I had never been to an airport alone.", "הייתי עצבנית כי מעולם לא הייתי לבד בשדה תעופה."],
          ["I arrived three hours early.", "הגעתי שלוש שעות מוקדם."],
        ],
        [
          ["I checked in, and I gave my suitcase to the worker.", "עשיתי צ'ק-אין, ונתתי את המזוודה לעובדת."],
          ["While I was waiting for my flight, I read a book.", "בזמן שחיכיתי לטיסה, קראתי ספר."],
          ["Then I heard my name on the speaker!", "ואז שמעתי את השם שלי ברמקול!"],
        ],
        [
          ["It was just a small problem with my passport, and they fixed it quickly.", "זו הייתה רק בעיה קטנה עם הדרכון, והם תיקנו אותה מהר."],
          ["When we landed, I felt proud of myself.", "כשנחתנו הרגשתי גאה בעצמי."],
          ["Now I have more confidence, and I want to travel again!", "עכשיו יש לי יותר ביטחון, ואני רוצה לטוס שוב!"],
        ],
      ],
    },
    {
      id: "small-habits",
      emoji: "🌱",
      title: "הרגלים קטנים, שינוי גדול",
      minutes: 3,
      level: "a2",
      vocab: ["routine", "energy", "focus", "recharge"],
      paragraphs: [
        [
          ["Big changes often start with small habits.", "שינויים גדולים מתחילים לרוב מהרגלים קטנים."],
          ["You do not have to change your whole life today.", "את לא חייבת לשנות את כל החיים שלך היום."],
          ["Choose one small thing and do it every day.", "בחרי דבר קטן אחד ועשי אותו כל יום."],
        ],
        [
          ["If you drink a glass of water every morning, you will feel better.", "אם תשתי כוס מים כל בוקר, תרגישי טוב יותר."],
          ["If you walk for ten minutes every day, you will have more energy.", "אם תלכי עשר דקות כל יום, תהיה לך יותר אנרגיה."],
          ["If you study English for five minutes, you will improve.", "אם תלמדי אנגלית חמש דקות, תשתפרי."],
        ],
        [
          ["Some days you will forget, and that is OK.", "יהיו ימים שבהם תשכחי, וזה בסדר."],
          ["Do not stop. Start again tomorrow.", "אל תפסיקי. תתחילי שוב מחר."],
          ["Small steps every day take you very far.", "צעדים קטנים כל יום לוקחים אותך רחוק מאוד."],
        ],
      ],
    },
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
