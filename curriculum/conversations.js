/*
  curriculum/conversations.js — SCRIPTED conversation practice (dialogue trees). Not generative AI.

  Every NPC line and every reply option is authored here, using only vocabulary/grammar from the
  lessons listed in `requires`. The scenario only unlocks after those lessons are completed, so the
  "partner" can never speak above the learner's level — by construction.

  Scenario: { id, title, icon, level, requires: [lesson ids], goals: [onboarding goal tags], intro,
              start, nodes: { id: { npc, he, choices: [ {en, next} (good) | {en, bad: true, why, concept} ] } | { npc, he, end: true } } }
  More than one good choice may exist (they can branch to different nodes).
*/
(function (root) {
  const C = root.CURRICULUM = root.CURRICULUM || { vocabulary: [], concepts: [], units: [], lessons: [], conversations: [] };
  const S = s => C.conversations.push(s);

  S({ id: "conv-meet", title: "פגישה עם מישהו חדש", icon: "🤝", level: "pre-a1", requires: ["pa-greet-2", "pa-greet-3"], goals: ["conversation", "general", "travel"],
    intro: "את במסיבה ומישהו חדש ניגש אלייך. הציגי את עצמך.",
    start: "n1", nodes: {
      n1: { npc: "Hi! My name is Tom.", he: "היי! קוראים לי טום.", choices: [
        { en: "Hi Tom! My name is Dana.", next: "n2" },
        { en: "Hello! Nice to meet you. I'm Dana.", next: "n2" },
        { en: "Good night, Tom.", bad: true, why: "{Good night} אומרים רק כשנפרדים בלילה. כשנפגשים: {Hi} / {Hello}.", concept: "greetings" },
        { en: "I am fine.", bad: true, why: "טום הציג את עצמו — מציגים בחזרה עם {My name is...}.", concept: "introductions" } ] },
      n2: { npc: "Nice to meet you, Dana. How are you?", he: "נעים מאוד, דנה. מה שלומך?", choices: [
        { en: "I'm fine, thank you. And you?", next: "n3" },
        { en: "Good, thanks!", next: "n3" },
        { en: "My name is Dana.", bad: true, why: "על {How are you?} עונים איך מרגישים: {I'm fine, thank you}.", concept: "introductions" },
        { en: "Goodbye.", bad: true, why: "{Goodbye} זו פרידה — השיחה רק התחילה.", concept: "greetings" } ] },
      n3: { npc: "I'm fine, thanks. Coffee?", he: "אני בסדר, תודה. קפה?", choices: [
        { en: "Yes, please.", next: "n4" },
        { en: "No, thank you.", next: "n4" },
        { en: "Yes, sorry.", bad: true, why: "כשמסכימים להצעה אומרים {Yes, please}. {Sorry} זו התנצלות.", concept: "polite-words" } ] },
      n4: { npc: "OK! See you later, Dana.", he: "אוקיי! נתראה אחר כך, דנה.", choices: [
        { en: "Bye, Tom! See you later.", next: "end" },
        { en: "Goodbye!", next: "end" },
        { en: "Good morning!", bad: true, why: "טום נפרד — עונים בפרידה: {Bye} / {See you later}.", concept: "greetings" } ] },
      end: { npc: "Bye!", he: "ביי!", end: true },
    } });

  S({ id: "conv-cafe", title: "בבית הקפה", icon: "☕", level: "pre-a1", requires: ["pa-drinks", "pa-greet-3", "pa-num-3", "pa-actions"], goals: ["travel", "conversation", "general"],
    intro: "נכנסת לבית קפה. הזמיני משהו לשתות ולאכול.",
    start: "n1", nodes: {
      n1: { npc: "Good morning! What would you like?", he: "בוקר טוב! מה תרצי?", choices: [
        { en: "Good morning! A coffee, please.", next: "n2" },
        { en: "Tea with milk, please.", next: "n2" },
        { en: "Coffee!", bad: true, why: "זה עובד, אבל בלי {please} זה נשמע קצר וגס. {A coffee, please}.", concept: "polite-words" },
        { en: "Good night! Coffee, sorry.", bad: true, why: "בבוקר {Good morning}, וכשמבקשים — {please}, לא {sorry}.", concept: "greetings" } ] },
      n2: { npc: "Anything to eat? We have cake and sandwiches.", he: "משהו לאכול? יש עוגה וכריכים.", choices: [
        { en: "A cheese sandwich, please.", next: "n3" },
        { en: "No, thank you.", next: "n3" },
        { en: "Yes, I am cake.", bad: true, why: "{I am cake} = \"אני עוגה\" 🙂. פשוט: {Cake, please}.", concept: "i-plus-verb" } ] },
      n3: { npc: "That's twenty-five shekels, please.", he: "זה עשרים וחמישה שקלים, בבקשה.", choices: [
        { en: "Here you are.", next: "n4" },
        { en: "Twenty-five? OK, here you are.", next: "n4" },
        { en: "Fifteen? OK.", bad: true, why: "{twenty-five} = 25, לא 15 ({fifteen}).", concept: "numbers-tens" } ] },
      n4: { npc: "Thank you! Have a nice day.", he: "תודה! יום נעים.", choices: [
        { en: "Thank you, you too!", next: "end" },
        { en: "Thanks! Bye!", next: "end" },
        { en: "Sorry!", bad: true, why: "על איחול עונים {Thank you, you too!} — אין על מה להתנצל.", concept: "polite-words" } ] },
      end: { npc: "Bye!", he: "ביי!", end: true },
    } });

  S({ id: "conv-shop", title: "בסופרמרקט", icon: "🛒", level: "a1", requires: ["a1-shopping"], goals: ["travel", "general"],
    intro: "את בחנות וצריכה לחם, חלב ופירות.",
    start: "n1", nodes: {
      n1: { npc: "Hello! Can I help you?", he: "שלום! אפשר לעזור?", choices: [
        { en: "Yes, please. Where is the bread?", next: "n2" },
        { en: "Hi! Is there any milk?", next: "n2" },
        { en: "Yes, where the bread is?", bad: true, why: "בשאלה: מילת שאלה + {is} + נושא: {Where is the bread?}", concept: "question-words" } ] },
      n2: { npc: "It's next to the milk, on the left.", he: "זה ליד החלב, משמאל.", choices: [
        { en: "Thank you! How much are the apples?", next: "n3" },
        { en: "Great, thanks. And how much is this bread?", next: "n3" },
        { en: "Thank you! How many is the bread?", bad: true, why: "מחיר שואלים עם {How much}.", concept: "question-words" } ] },
      n3: { npc: "They're ten shekels a kilo.", he: "עשרה שקלים לקילו.", choices: [
        { en: "OK, I'll take two kilos, please.", next: "n4" },
        { en: "That's cheap! Two kilos, please.", next: "n4" },
        { en: "I take two kilo.", bad: true, why: "שתיים ← רבים: {two kilos}. ובנימוס: {I'll take two kilos, please}.", concept: "plural-regular" } ] },
      n4: { npc: "Cash or card?", he: "מזומן או כרטיס?", choices: [
        { en: "Card, please.", next: "end" },
        { en: "Can I pay in cash?", next: "end" },
        { en: "Yes, please.", bad: true, why: "זו שאלת \"או\" — בוחרים אחת: {Card, please} / {Cash, please}.", concept: "question-words" } ] },
      end: { npc: "Here is your receipt. Have a nice day!", he: "הנה הקבלה. יום נעים!", end: true },
    } });

  S({ id: "conv-restaurant", title: "ארוחת ערב במסעדה", icon: "🍽️", level: "a1", requires: ["a1-restaurant"], goals: ["travel", "conversation", "general"],
    intro: "את במסעדה עם חברה. הזמיני בנימוס ובקשי את החשבון.",
    start: "n1", nodes: {
      n1: { npc: "Good evening! A table for two?", he: "ערב טוב! שולחן לשניים?", choices: [
        { en: "Yes, please.", next: "n2" },
        { en: "Good evening! Yes, for two, please.", next: "n2" },
        { en: "Good night! Yes.", bad: true, why: "כשמגיעים בערב: {Good evening}. {Good night} — רק בפרידה.", concept: "greetings" } ] },
      n2: { npc: "Here is the menu. What would you like?", he: "הנה התפריט. מה תרצי?", choices: [
        { en: "I'd like the fish, please.", next: "n3" },
        { en: "Can I have the chicken and rice, please?", next: "n3" },
        { en: "I would like to the fish.", bad: true, why: "{would like} + שם עצם, בלי {to}: {I'd like the fish}.", concept: "would-like" },
        { en: "Give me fish.", bad: true, why: "זה נשמע גס. בנימוס: {I'd like the fish, please}.", concept: "would-like" } ] },
      n3: { npc: "And to drink?", he: "ולשתות?", choices: [
        { en: "A glass of water, please.", next: "n4" },
        { en: "I'd like a glass of red wine.", next: "n4" },
        { en: "A water, please.", bad: true, why: "{water} לא נספר — {a glass of water}.", concept: "articles-a-an" } ] },
      n4: { npc: "Would you like dessert?", he: "תרצי קינוח?", choices: [
        { en: "No, thank you. Can I have the bill, please?", next: "end" },
        { en: "Yes, please! And the bill, please.", next: "end" },
        { en: "No. Bill.", bad: true, why: "קצר מדי ולא מנומס: {No, thank you. Can I have the bill, please?}", concept: "would-like" } ] },
      end: { npc: "Of course. Here you are. Thank you!", he: "כמובן. בבקשה. תודה!", end: true },
    } });

  S({ id: "conv-directions", title: "לשאול איך מגיעים", icon: "🗺️", level: "a1", requires: ["a1-directions", "a1-time"], goals: ["travel", "general"],
    intro: "את בעיר חדשה ומחפשת את תחנת הרכבת.",
    start: "n1", nodes: {
      n1: { npc: "(A woman is standing on the corner.)", he: "(אישה עומדת בפינה.)", choices: [
        { en: "Excuse me, where is the train station?", next: "n2" },
        { en: "Excuse me, how do I get to the train station?", next: "n2" },
        { en: "Sorry, where the station?", bad: true, why: "לפונים לזר אומרים {Excuse me}, ובשאלה חייבים {is}: {Where is the station?}", concept: "question-words" } ] },
      n2: { npc: "Go straight ahead and turn left at the bank.", he: "לכי ישר ופני שמאלה ליד הבנק.", choices: [
        { en: "Straight ahead and left at the bank. Is it far?", next: "n3" },
        { en: "Thank you! Is it near?", next: "n3" },
        { en: "Turn right at the bank?", bad: true, why: "היא אמרה {left} (שמאלה), לא {right} (ימינה).", concept: "imperatives-directions" } ] },
      n3: { npc: "No, it's near. Five minutes. It's opposite the park.", he: "לא, זה קרוב. חמש דקות. זה מול הפארק.", choices: [
        { en: "Great, thank you very much!", next: "end" },
        { en: "Opposite the park. Thanks!", next: "end" },
        { en: "Five hours? OK.", bad: true, why: "{minutes} = דקות, לא שעות ({hours}).", concept: "telling-time" } ] },
      end: { npc: "You're welcome!", he: "בשמחה!", end: true },
    } });

  S({ id: "conv-colleague", title: "עמיתה חדשה בעבודה", icon: "💼", level: "a1", requires: ["a1-work", "a1-ps-9"], goals: ["work", "conversation"],
    intro: "עמיתה חדשה מתחילה לעבוד איתך. תכירו.",
    start: "n1", nodes: {
      n1: { npc: "Hi, I'm Maya. I'm new here.", he: "היי, אני מאיה. אני חדשה כאן.", choices: [
        { en: "Hi Maya! Nice to meet you. I'm Dana.", next: "n2" },
        { en: "Welcome, Maya! I'm Dana.", next: "n2" },
        { en: "Hi Maya! You are new here?", bad: true, why: "זה מובן, אבל שאלה נכונה מתחילה ב-{Are}: {Are you new here?}", concept: "be-questions" } ] },
      n2: { npc: "What do you do here?", he: "מה את עושה כאן?", choices: [
        { en: "I'm a designer. I work on the new project.", next: "n3" },
        { en: "I work with the manager. I write a lot of emails.", next: "n3" },
        { en: "I am work on the project.", bad: true, why: "בהווה פשוט בלי {am}: {I work on the project}.", concept: "present-simple-meaning" } ] },
      n3: { npc: "Do you usually work on Friday?", he: "את בדרך כלל עובדת ביום שישי?", choices: [
        { en: "No, I don't. I work from Sunday to Thursday.", next: "n4" },
        { en: "Sometimes. Not every Friday.", next: "n4" },
        { en: "No, I doesn't.", bad: true, why: "עם {I} ← {don't}: {No, I don't}.", concept: "present-simple-negative" },
        { en: "No, I'm not.", bad: true, why: "על {Do you...?} עונים עם {do}: {No, I don't}.", concept: "present-simple-questions" } ] },
      n4: { npc: "Where does the manager sit?", he: "איפה המנהל יושב?", choices: [
        { en: "He sits in the big office, next to the kitchen.", next: "end" },
        { en: "His office is on the second floor.", next: "end" },
        { en: "He sit in the big office.", bad: true, why: "עם {he} מוסיפים s: {He sits}.", concept: "present-simple-he-she-it" } ] },
      end: { npc: "Thanks, Dana! See you at the meeting.", he: "תודה, דנה! נתראה בפגישה.", end: true },
    } });

  S({ id: "conv-weekend", title: "איך היה בסוף השבוע?", icon: "🏖️", level: "a1", requires: ["a1-past-6", "a1-future-1"], goals: ["conversation", "general", "movies"],
    intro: "יום ראשון בבוקר. חברה שואלת על סוף השבוע שלך.",
    start: "n1", nodes: {
      n1: { npc: "Hi! How was your weekend?", he: "היי! איך היה בסוף השבוע?", choices: [
        { en: "It was great, thanks!", next: "n2" },
        { en: "It was OK. I was a little tired.", next: "n2" },
        { en: "It is great.", bad: true, why: "סוף השבוע כבר עבר ← עבר: {It was great}.", concept: "past-be-was-were" } ] },
      n2: { npc: "What did you do?", he: "מה עשית?", choices: [
        { en: "I went to the beach with my family.", next: "n3" },
        { en: "I visited my parents and we cooked dinner.", next: "n3" },
        { en: "I goed to the beach.", bad: true, why: "{go} חריג: {went}.", concept: "past-irregular-1" },
        { en: "I go to the beach.", bad: true, why: "זה כבר קרה ← עבר: {I went}.", concept: "past-simple-regular" } ] },
      n3: { npc: "Nice! Did you see the new movie?", he: "נחמד! ראית את הסרט החדש?", choices: [
        { en: "No, I didn't. Is it good?", next: "n4" },
        { en: "Yes, I did! I liked it.", next: "n4" },
        { en: "No, I didn't saw it.", bad: true, why: "אחרי {didn't} — בסיס: {I didn't see it}.", concept: "past-simple-negative-questions" } ] },
      n4: { npc: "Yes, it's very good! You should see it.", he: "כן, הוא טוב מאוד! כדאי לך לראות אותו.", choices: [
        { en: "OK, I'll see it next weekend.", next: "end" },
        { en: "Maybe I'll go tonight!", next: "end" },
        { en: "OK, I will to see it.", bad: true, why: "{will} + בסיס, בלי {to}.", concept: "future-will" } ] },
      end: { npc: "Great! Have a good week.", he: "מעולה! שיהיה שבוע טוב.", end: true },
    } });

  S({ id: "conv-doctor", title: "עצה מחברה", icon: "🤒", level: "a2", requires: ["a2-should"], goals: ["conversation", "general"],
    intro: "את לא מרגישה טוב ומדברת עם חברה.",
    start: "n1", nodes: {
      n1: { npc: "You don't look well. Are you OK?", he: "את לא נראית טוב. את בסדר?", choices: [
        { en: "Not really. I have a headache.", next: "n2" },
        { en: "No, I'm very tired and I have a headache.", next: "n2" },
        { en: "No, I have headache very.", bad: true, why: "{a headache}, ו-{very} בא לפני התואר: {I'm very tired}.", concept: "articles-a-an" } ] },
      n2: { npc: "Oh no! You should take some medicine.", he: "אוי לא! כדאי לך לקחת תרופה.", choices: [
        { en: "I took some medicine this morning.", next: "n3" },
        { en: "Good idea. Should I go to a doctor?", next: "n3" },
        { en: "Should I to go to a doctor?", bad: true, why: "{should} + בסיס, בלי {to}.", concept: "modal-should" } ] },
      n3: { npc: "Maybe tomorrow. Today you should rest and drink a lot of water.", he: "אולי מחר. היום כדאי לך לנוח ולשתות הרבה מים.", choices: [
        { en: "You're right. I'll go to bed early.", next: "end" },
        { en: "Thanks! I shouldn't work so much.", next: "end" },
        { en: "Thanks. I should resting.", bad: true, why: "{should} + בסיס: {I should rest}.", concept: "modal-should" } ] },
      end: { npc: "Feel better soon!", he: "תרגישי טוב!", end: true },
    } });

  S({ id: "conv-plans", title: "לתכנן משהו ביחד", icon: "📅", level: "a2", requires: ["a2-inf", "a2-gerund", "a2-objpron"], goals: ["conversation", "general"],
    intro: "חברה מציעה לך לעשות משהו בסוף השבוע.",
    start: "n1", nodes: {
      n1: { npc: "Do you want to do something this weekend?", he: "את רוצה לעשות משהו בסוף השבוע?", choices: [
        { en: "Yes! I would like to go hiking.", next: "n2" },
        { en: "Sure, I love cooking together.", next: "n2" },
        { en: "Yes, I want going hiking.", bad: true, why: "{want} + {to} + פועל בסיס: {want to go}.", concept: "infinitives" } ] },
      n2: { npc: "Great! What do you enjoy doing on weekends?", he: "מעולה! ממה את נהנית לעשות בסופי שבוע?", choices: [
        { en: "I enjoy reading and relaxing.", next: "n3" },
        { en: "I love traveling to new places.", next: "n3" },
        { en: "I enjoy to read and relax.", bad: true, why: "אחרי {enjoy} ← {-ing}: {enjoy reading}.", concept: "gerunds-beginner" } ] },
      n3: { npc: "Sounds good. Should I call you tomorrow?", he: "נשמע טוב. שאתקשר אליך מחר?", choices: [
        { en: "Yes, please call me in the morning.", next: "end" },
        { en: "Sure, call me anytime.", next: "end" },
        { en: "Yes, please call I in the morning.", bad: true, why: "אחרי פועל ← כינוי מושא: {call me}.", concept: "object-pronouns" } ] },
      end: { npc: "Perfect, see you this weekend!", he: "מושלם, נתראה בסוף השבוע!", end: true },
    } });
})(typeof globalThis !== "undefined" ? globalThis : this);
