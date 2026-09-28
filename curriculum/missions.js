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
  ];
})(typeof globalThis !== "undefined" ? globalThis : this);
