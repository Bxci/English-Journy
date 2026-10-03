/*
  curriculum/missions.js — "משימות בעולם האמיתי" (Real-World Missions).

  Not part of the graded CURRICULUM (no unlock gating, no exercise engine) — a small set of
  genuinely polished communicative-goal missions, evaluated on task completion (engine/missions.js
  stepMatches), not exact wording. Quality over quantity: 4 missions, not 20 half-built ones.

  Each step's `keywords` is a list of interchangeable phrase-groups: the step counts as done if
  the learner's own typed/spoken words contain ANY phrase from ANY group.
*/
(function (root) {
  root.MISSIONS = [
    {
      id: "mission-coffee",
      emoji: "☕",
      title: "להזמין קפה",
      level: "a1",
      intro: "את נכנסת לבית קפה באנגליה. המטרה שלך: להזמין קפה בעצמך, במילים שלך.",
      steps: [
        { id: "greet", label: "תגידי שלום", hint: "למשל: Hi / Hello / Good morning", keywords: [["hi"], ["hello"], ["good morning"], ["good afternoon"]] },
        { id: "order", label: "בקשי קפה (או תה)", hint: "למשל: coffee / tea", keywords: [["coffee"], ["tea"], ["cappuccino"], ["latte"]] },
        { id: "polite", label: "תבקשי בנימוס", hint: "למשל: please / can I have / I would like", keywords: [["please"], ["can i"], ["could i"], ["i would like"], ["i'd like"]] },
        { id: "thanks", label: "תגידי תודה", hint: "למשל: thank you / thanks", keywords: [["thank you"], ["thanks"]] },
      ],
    },
    {
      id: "mission-intro",
      emoji: "🙋",
      title: "להציג את עצמך",
      level: "pre-a1",
      intro: "פגשת מישהו חדש במסיבה. המטרה שלך: להציג את עצמך.",
      steps: [
        { id: "greet", label: "תגידי שלום", hint: "למשל: Hi / Hello", keywords: [["hi"], ["hello"]] },
        { id: "name", label: "תגידי איך קוראים לך", hint: "למשל: My name is... / I'm...", keywords: [["my name is"], ["i am"], ["i'm"]] },
        { id: "ask", label: "תשאלי איך קוראים לו/לה", hint: "למשל: What's your name?", keywords: [["what is your name"], ["what's your name"], ["and you"]] },
        { id: "nice", label: "תגידי שנעים להכיר", hint: "למשל: Nice to meet you", keywords: [["nice to meet you"], ["pleased to meet you"]] },
      ],
    },
    {
      id: "mission-directions",
      emoji: "🗺️",
      title: "לשאול איך מגיעים",
      level: "a1",
      intro: "את ברחוב וצריכה למצוא את התחנה הקרובה. המטרה שלך: לבקש כיוונים.",
      steps: [
        { id: "excuse", label: "תפני בנימוס", hint: "למשל: Excuse me", keywords: [["excuse me"], ["sorry"]] },
        { id: "ask", label: "תשאלי איפה זה", hint: "למשל: Where is the station?", keywords: [["where is"], ["where's"], ["how do i get to"], ["how can i get to"]] },
        { id: "thanks", label: "תגידי תודה על העזרה", hint: "למשל: Thank you", keywords: [["thank you"], ["thanks"]] },
      ],
    },
    {
      id: "mission-shopping",
      emoji: "🛍️",
      title: "לקנות משהו בחנות",
      level: "a1",
      intro: "את בחנות ורואה חולצה שאת אוהבת. המטרה שלך: לשאול עליה ולקנות אותה.",
      steps: [
        { id: "greet", label: "תגידי שלום", hint: "למשל: Hi / Hello", keywords: [["hi"], ["hello"]] },
        { id: "price", label: "תשאלי כמה זה עולה", hint: "למשל: How much is this?", keywords: [["how much"]] },
        { id: "buy", label: "תגידי שאת רוצה לקנות", hint: "למשל: I'll take it / I want this", keywords: [["i'll take it"], ["i will take it"], ["i want this"], ["i want it"], ["i'll buy it"]] },
        { id: "thanks", label: "תגידי תודה", hint: "למשל: Thank you", keywords: [["thank you"], ["thanks"]] },
      ],
    },
    {
      id: "mission-restaurant",
      emoji: "🍝",
      title: "להזמין ארוחה במסעדה",
      level: "a1",
      intro: "את במסעדה והמלצר מגיע לשולחן. המטרה שלך: להזמין אוכל ושתייה ולבקש את החשבון.",
      steps: [
        { id: "greet", label: "תגידי שלום", hint: "למשל: Hello / Good evening", keywords: [["hi"], ["hello"], ["good evening"], ["good afternoon"]] },
        { id: "food", label: "תזמיני משהו לאכול", hint: "למשל: I would like a pizza / I'll have the soup", keywords: [["i would like"], ["i'd like"], ["i will have"], ["i'll have"], ["can i have"], ["could i have"], ["pizza"], ["pasta"], ["salad"], ["soup"], ["sandwich"], ["chicken"]] },
        { id: "drink", label: "תזמיני משהו לשתות", hint: "למשל: And water, please", keywords: [["water"], ["juice"], ["coffee"], ["tea"], ["cola"], ["wine"], ["beer"]] },
        { id: "bill", label: "תבקשי את החשבון", hint: "למשל: Could I have the bill, please?", keywords: [["the bill"], ["the check"], ["how much"]] },
      ],
    },
    {
      id: "mission-hotel",
      emoji: "🏨",
      title: "צ'ק-אין במלון",
      level: "a2",
      intro: "הגעת למלון. המטרה שלך: לעשות צ'ק-אין, לשאול על ארוחת הבוקר ולבקש משהו לחדר.",
      steps: [
        { id: "reservation", label: "תגידי שיש לך הזמנה", hint: "למשל: I have a reservation", keywords: [["i have a reservation"], ["i have a booking"], ["check in"], ["check-in"], ["reservation"], ["booking"]] },
        { id: "breakfast", label: "תשאלי על ארוחת הבוקר", hint: "למשל: What time is breakfast?", keywords: [["breakfast"]] },
        { id: "request", label: "תבקשי משהו מנומס", hint: "למשל: Could you help me with my suitcase?", keywords: [["could you"], ["can you"], ["could i"], ["can i"], ["would it be possible"]] },
        { id: "thanks", label: "תגידי תודה", hint: "למשל: Thank you very much", keywords: [["thank you"], ["thanks"]] },
      ],
    },
    {
      id: "mission-appointment",
      emoji: "📅",
      title: "לקבוע תור בטלפון",
      level: "a2",
      intro: "את מתקשרת למרפאה. המטרה שלך: לקבוע תור ליום ושעה שמתאימים לך.",
      steps: [
        { id: "greet", label: "תגידי שלום ותציגי את עצמך", hint: "למשל: Hello, this is Dana", keywords: [["hello"], ["hi"], ["good morning"], ["this is"], ["my name is"]] },
        { id: "ask", label: "תבקשי לקבוע תור", hint: "למשל: Could I make an appointment?", keywords: [["appointment"], ["i would like to see"], ["i'd like to see"]] },
        { id: "time", label: "תגידי באיזה יום או שעה מתאים לך", hint: "למשל: Tuesday at ten / Monday morning", keywords: [["monday"], ["tuesday"], ["wednesday"], ["thursday"], ["friday"], ["sunday"], ["tomorrow"], ["next week"], ["o'clock"], ["morning"], ["afternoon"]] },
        { id: "thanks", label: "תגידי תודה", hint: "למשל: Thank you very much", keywords: [["thank you"], ["thanks"]] },
      ],
    },
    {
      id: "mission-lost",
      emoji: "🆘",
      title: "לבקש עזרה כשמשהו אבד",
      level: "a2",
      intro: "השארת את התיק שלך בתחנת הרכבת. המטרה שלך: לפנות לעובד ולבקש עזרה.",
      steps: [
        { id: "excuse", label: "תפני בנימוס", hint: "למשל: Excuse me", keywords: [["excuse me"], ["sorry"]] },
        { id: "problem", label: "תסבירי מה קרה", hint: "למשל: I lost my bag / I left my bag on the train", keywords: [["lost my"], ["lost a"], ["left my"], ["forgot my"], ["my bag"], ["my phone"]] },
        { id: "help", label: "תבקשי עזרה", hint: "למשל: Could you help me, please?", keywords: [["could you help"], ["can you help"], ["help me"], ["can i ask"], ["could i ask"]] },
        { id: "thanks", label: "תגידי תודה", hint: "למשל: Thank you", keywords: [["thank you"], ["thanks"]] },
      ],
    },
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
