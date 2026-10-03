/*
  curriculum/vocabulary.js — first-class vocabulary items.
  Each item: { id, word, translation, partOfSpeech, level, category, emoji, exampleSentence, alts?, note? }
  Row format for add(): [word, hebrew, emoji, exampleSentence, extra?]  (extra may set id / alts / note / partOfSpeech)
*/
(function (root) {
  const C = root.CURRICULUM = root.CURRICULUM || { vocabulary: [], concepts: [], units: [], lessons: [], conversations: [] };
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function add(category, level, pos, rows) {
    rows.forEach(r => {
      const [word, translation, emoji, exampleSentence, extra] = r;
      C.vocabulary.push(Object.assign({ id: slug(word), word, translation, partOfSpeech: pos, level, category, emoji: emoji || "", exampleSentence }, extra || {}));
    });
  }

  /* ======================= PRE-A1 ======================= */
  add("greetings", "pre-a1", "phrase", [
    ["hello", "שלום", "👋", "Hello, Dana!"],
    ["hi", "היי", "🙋", "Hi, Tom!"],
    ["goodbye", "להתראות", "👋", "Goodbye, see you tomorrow."],
    ["bye", "ביי", "", "Bye! See you later."],
    ["good morning", "בוקר טוב", "🌅", "Good morning, Anna."],
    ["good evening", "ערב טוב", "🌆", "Good evening, everyone."],
    ["good night", "לילה טוב", "🌙", "Good night, Mom."],
    ["please", "בבקשה (כשמבקשים)", "🙏", "Water, please."],
    ["thank you", "תודה", "", "Thank you very much!", { alts: ["thanks"] }],
    ["sorry", "סליחה / מצטערת", "", "Sorry, I am late."],
    ["excuse me", "סליחה (כשפונים למישהו)", "", "Excuse me, where is the bank?"],
    ["yes", "כן", "👍", "Yes, I am ready."],
    ["no", "לא", "👎", "No, thank you."],
    ["how are you", "מה שלומך?", "", "Hi Dana, how are you?"],
    ["i am fine", "אני בסדר", "🙂", "I am fine, thank you.", { alts: ["i'm fine"] }],
    ["my name is", "קוראים לי / השם שלי", "", "My name is Dana."],
    ["nice to meet you", "נעים מאוד (להכיר)", "🤝", "Nice to meet you, Tom."],
    ["see you later", "נתראה אחר כך", "", "Bye, see you later!"],
  ]);

  add("numbers", "pre-a1", "number", [
    ["zero", "אפס", "0️⃣", "Zero is 0."], ["one", "אחת / אחד", "1️⃣", "I have one brother."],
    ["two", "שתיים / שניים", "2️⃣", "I have two cats."], ["three", "שלוש / שלושה", "3️⃣", "Three coffees, please."],
    ["four", "ארבע / ארבעה", "4️⃣", "We are four people."], ["five", "חמש / חמישה", "5️⃣", "I work five days."],
    ["six", "שש / שישה", "6️⃣", "I get up at six."], ["seven", "שבע / שבעה", "7️⃣", "Seven days in a week."],
    ["eight", "שמונה", "8️⃣", "I sleep eight hours."], ["nine", "תשע / תשעה", "9️⃣", "The shop opens at nine."],
    ["ten", "עשר / עשרה", "🔟", "Ten shekels, please."], ["eleven", "אחת-עשרה", "", "Room eleven."],
    ["twelve", "שתים-עשרה", "", "Twelve eggs."], ["thirteen", "שלוש-עשרה", "", "She is thirteen."],
    ["fourteen", "ארבע-עשרה", "", "Bus fourteen."], ["fifteen", "חמש-עשרה", "", "Fifteen minutes."],
    ["sixteen", "שש-עשרה", "", "He is sixteen."], ["seventeen", "שבע-עשרה", "", "Seventeen shekels."],
    ["eighteen", "שמונה-עשרה", "", "I am eighteen."], ["nineteen", "תשע-עשרה", "", "Nineteen people."],
    ["twenty", "עשרים", "", "Twenty minutes."], ["thirty", "שלושים", "", "Thirty shekels."],
    ["forty", "ארבעים", "", "She is forty."], ["fifty", "חמישים", "", "Fifty people."],
    ["sixty", "שישים", "", "Sixty minutes is an hour."], ["seventy", "שבעים", "", "Seventy shekels."],
    ["eighty", "שמונים", "", "He is eighty."], ["ninety", "תשעים", "", "Ninety minutes."],
    ["one hundred", "מאה", "💯", "One hundred shekels.", { alts: ["a hundred", "hundred"] }],
  ]);

  add("people", "pre-a1", "noun", [
    ["man", "גבר", "👨", "The man is tall."], ["woman", "אישה", "👩", "The woman is a doctor."],
    ["boy", "ילד", "👦", "The boy is happy."], ["girl", "ילדה", "👧", "The girl is ten."],
    ["baby", "תינוק / תינוקת", "👶", "The baby is sleeping."], ["friend", "חבר / חברה", "🧑‍🤝‍🧑", "She is my friend."],
    ["teacher", "מורה", "🧑‍🏫", "My teacher is nice."], ["student", "סטודנט / סטודנטית, תלמיד/ה", "🧑‍🎓", "I am a student."],
    ["doctor", "רופא / רופאה", "🧑‍⚕️", "The doctor is here."], ["person", "אדם", "🧍", "She is a good person."],
    ["people", "אנשים", "👥", "Many people are here.", { note: "רבים של person" }],
  ]);

  add("family", "pre-a1", "noun", [
    ["mother", "אמא", "👩‍👧", "My mother is a teacher.", { alts: ["mom", "mum"] }],
    ["father", "אבא", "👨‍👦", "My father is a doctor.", { alts: ["dad"] }],
    ["parents", "הורים", "👫", "My parents live in Haifa."],
    ["sister", "אחות (במשפחה)", "👭", "I have one sister."], ["brother", "אח", "👬", "My brother is tall."],
    ["son", "בן", "👦", "Her son is five."], ["daughter", "בת", "👧", "My daughter is a student."],
    ["husband", "בעל", "🤵", "Her husband is a chef."], ["wife", "אישה (רעיה)", "👰", "His wife is a nurse."],
    ["grandmother", "סבתא", "👵", "My grandmother is eighty."], ["grandfather", "סבא", "👴", "My grandfather is old."],
    ["family", "משפחה", "👪", "I love my family."], ["children", "ילדים", "🧒", "They have two children.", { note: "רבים של child" }],
  ]);

  add("home", "pre-a1", "noun", [
    ["house", "בית (בניין)", "🏠", "The house is big."], ["room", "חדר", "🚪", "My room is small."],
    ["kitchen", "מטבח", "🍳", "The kitchen is clean."], ["bedroom", "חדר שינה", "🛏️", "The bedroom is quiet."],
    ["bathroom", "חדר רחצה / שירותים", "🛁", "Where is the bathroom?"], ["door", "דלת", "🚪", "Close the door, please."],
    ["window", "חלון", "🪟", "Open the window, please."], ["table", "שולחן", "🍽️", "The keys are on the table."],
    ["chair", "כיסא", "🪑", "Sit on the chair."], ["bed", "מיטה", "🛏️", "The bed is comfortable."],
    ["sofa", "ספה", "🛋️", "The cat is on the sofa."],
  ]);

  add("food", "pre-a1", "noun", [
    ["bread", "לחם", "🍞", "I want bread and cheese."], ["egg", "ביצה", "🥚", "I eat an egg every morning."],
    ["cheese", "גבינה", "🧀", "The cheese is good."], ["apple", "תפוח", "🍎", "An apple a day."],
    ["banana", "בננה", "🍌", "The banana is yellow."], ["rice", "אורז", "🍚", "Rice and chicken, please."],
    ["chicken", "עוף", "🍗", "I like chicken."], ["fish", "דג", "🐟", "The fish is fresh."],
    ["salad", "סלט", "🥗", "A big salad, please."], ["soup", "מרק", "🍲", "The soup is hot."],
    ["cake", "עוגה", "🍰", "The cake is sweet."], ["sandwich", "כריך / סנדוויץ'", "🥪", "A cheese sandwich, please."],
    ["tomato", "עגבנייה", "🍅", "The tomato is red."], ["pizza", "פיצה", "🍕", "We eat pizza on Friday."],
  ]);

  add("drinks", "pre-a1", "noun", [
    ["water", "מים", "💧", "A glass of water, please."], ["coffee", "קפה", "☕", "I drink coffee in the morning."],
    ["tea", "תה", "🍵", "Tea with milk, please."], ["milk", "חלב", "🥛", "The milk is cold."],
    ["juice", "מיץ", "🧃", "Orange juice, please."], ["wine", "יין", "🍷", "A glass of red wine."],
  ]);

  add("objects", "pre-a1", "noun", [
    ["phone", "טלפון", "📱", "My phone is in my bag."], ["book", "ספר", "📖", "This book is good."],
    ["bag", "תיק", "👜", "My bag is black."], ["key", "מפתח", "🔑", "Where is my key?"],
    ["pen", "עט", "🖊️", "Can I have a pen?"], ["cup", "כוס (ספל)", "☕", "A cup of tea."],
    ["computer", "מחשב", "💻", "My computer is new."], ["watch", "שעון (יד)", "⌚", "My watch is old."],
    ["glasses", "משקפיים", "👓", "Where are my glasses?"], ["umbrella", "מטרייה", "☂️", "Take an umbrella."],
    ["money", "כסף", "💵", "I have no money."],
  ]);

  add("places", "pre-a1", "noun", [
    ["home", "בית (המקום שלי)", "🏡", "I am at home."], ["city", "עיר", "🏙️", "Tel Aviv is a big city."],
    ["street", "רחוב", "🛣️", "The shop is on this street."], ["shop", "חנות", "🏪", "The shop is open."],
    ["supermarket", "סופרמרקט", "🛒", "I go to the supermarket."], ["school", "בית ספר", "🏫", "The school is near here."],
    ["work", "עבודה (מקום העבודה)", "💼", "I am at work."], ["office", "משרד", "🏢", "The office is on the second floor."],
    ["hospital", "בית חולים", "🏥", "The hospital is big."], ["park", "פארק", "🌳", "We walk in the park."],
    ["restaurant", "מסעדה", "🍽️", "The restaurant is full."], ["bank", "בנק", "🏦", "Where is the bank?"],
    ["beach", "חוף ים", "🏖️", "The beach is beautiful."],
  ]);

  add("colors", "pre-a1", "adjective", [
    ["red", "אדום", "🔴", "The apple is red."], ["blue", "כחול", "🔵", "The sky is blue."],
    ["green", "ירוק", "🟢", "The park is green."], ["yellow", "צהוב", "🟡", "The banana is yellow."],
    ["black", "שחור", "⚫", "My bag is black."], ["white", "לבן", "⚪", "The milk is white."],
    ["orange", "כתום", "🟠", "The juice is orange."], ["purple", "סגול", "🟣", "Her dress is purple."],
    ["brown", "חום", "🟤", "The table is brown."], ["pink", "ורוד", "🩷", "The cake is pink."],
    ["gray", "אפור", "🩶", "The sky is gray.", { alts: ["grey"] }],
  ]);

  add("actions", "pre-a1", "verb", [
    ["eat", "לאכול", "🍽️", "I eat bread."], ["drink", "לשתות", "🥤", "I drink water."],
    ["go", "ללכת / לנסוע", "🚶", "I go home."], ["come", "לבוא", "👋", "Come here, please."],
    ["sleep", "לישון", "😴", "I sleep at night."], ["work", "לעבוד", "💼", "I work in an office.", { id: "work-v" }],
    ["read", "לקרוא", "📖", "I read a book."], ["write", "לכתוב", "✍️", "I write an email."],
    ["speak", "לדבר", "🗣️", "I speak Hebrew."], ["listen", "להקשיב", "👂", "Listen to me, please."],
    ["see", "לראות", "👀", "I see the sea."], ["like", "לאהוב / לחבב", "❤️", "I like coffee."],
    ["want", "לרצות", "🙋", "I want tea."], ["have", "שיש לי (להחזיק)", "🤲", "I have a car."],
    ["live", "לגור", "🏡", "I live in Tel Aviv."], ["open", "לפתוח", "📂", "Open the door."],
    ["close", "לסגור", "🔒", "Close the window."], ["cook", "לבשל", "🍳", "I cook dinner."],
    ["walk", "ללכת ברגל", "🚶", "We walk in the park."],
  ]);

  /* ======================= A1 ======================= */
  add("pronouns", "a1", "pronoun", [
    ["I", "אני", "🙋", "I am Dana.", { id: "i" }], ["you", "אתה / את / אתם", "👉", "You are nice."],
    ["he", "הוא", "👨", "He is my brother."], ["she", "היא", "👩", "She is my sister."],
    ["it", "זה / זו (לדבר או לחיה)", "📦", "It is a book."], ["we", "אנחנו", "👫", "We are friends."],
    ["they", "הם / הן", "👥", "They are at home."],
  ]);

  add("adjectives", "a1", "adjective", [
    ["happy", "שמח / שמחה", "😊", "I am happy today."], ["sad", "עצוב / עצובה", "😢", "He is sad."],
    ["tired", "עייף / עייפה", "😴", "I am tired."], ["hungry", "רעב / רעבה", "🍽️", "Are you hungry?"],
    ["thirsty", "צמא / צמאה", "🥤", "I am thirsty."], ["busy", "עסוק / עסוקה", "📅", "She is busy."],
    ["ready", "מוכן / מוכנה", "✅", "Are you ready?"], ["late", "מאחר / מאחרת", "⏰", "Sorry, I am late."],
    ["cold", "קר", "🥶", "The water is cold."], ["hot", "חם", "🥵", "The coffee is hot."],
    ["big", "גדול", "🐘", "The house is big."], ["small", "קטן", "🐭", "The room is small."],
    ["new", "חדש", "✨", "My phone is new."], ["old", "ישן / זקן", "🧓", "The car is old."],
    ["good", "טוב", "👍", "The food is good."], ["bad", "רע", "👎", "The weather is bad."],
    ["nice", "נחמד", "🙂", "Your friend is nice."], ["beautiful", "יפה", "🌸", "The city is beautiful."],
    ["tall", "גבוה", "🦒", "My brother is tall."], ["young", "צעיר", "🧒", "She is young."],
    ["married", "נשוי / נשואה", "💍", "Are you married?"], ["sick", "חולה", "🤒", "I am sick today."],
    ["from", "מ- (מאיפה)", "🌍", "I am from Israel.", { partOfSpeech: "preposition" }],
    ["Israel", "ישראל", "🇮🇱", "I live in Israel.", { id: "israel", partOfSpeech: "noun" }],
  ]);

  add("jobs", "a1", "noun", [
    ["nurse", "אח / אחות (בבית חולים)", "🧑‍⚕️", "She is a nurse."], ["engineer", "מהנדס / מהנדסת", "👷", "He is an engineer."],
    ["chef", "שף / טבח", "🧑‍🍳", "My husband is a chef."], ["driver", "נהג / נהגת", "🚖", "The driver is nice."],
    ["lawyer", "עורך / עורכת דין", "⚖️", "She is a lawyer."], ["manager", "מנהל / מנהלת", "📋", "My manager is busy."],
    ["waiter", "מלצר / מלצרית", "🧑‍🍳", "The waiter is here."], ["programmer", "מתכנת / מתכנתת", "👩‍💻", "I am a programmer."],
    ["accountant", "רואה / רואת חשבון", "🧮", "He is an accountant."], ["designer", "מעצב / מעצבת", "🎨", "She is a designer."],
  ]);

  add("questions", "a1", "adverb", [
    ["what", "מה", "❓", "What is your name?"], ["where", "איפה", "📍", "Where is the bank?"],
    ["who", "מי", "🧑", "Who is she?"], ["when", "מתי", "📅", "When is the meeting?"],
    ["why", "למה", "🤔", "Why are you sad?"], ["how", "איך", "🛠️", "How are you?"],
    ["how much", "כמה (כסף / כמות)", "💰", "How much is it?"], ["how many", "כמה (מספר דברים)", "🔢", "How many children do you have?"],
  ]);

  add("abilities", "a1", "verb", [
    ["swim", "לשחות", "🏊", "I can swim."], ["drive", "לנהוג", "🚗", "She can drive."],
    ["sing", "לשיר", "🎤", "He can sing."], ["dance", "לרקוד", "💃", "We can dance."],
    ["play", "לשחק / לנגן", "🎸", "I can play the guitar."], ["help", "לעזור", "🤝", "Can you help me?"],
    ["understand", "להבין", "💡", "I understand."], ["cook well", "לבשל טוב", "👩‍🍳", "My mother can cook well."],
  ]);

  add("routine", "a1", "verb", [
    ["wake up", "להתעורר", "⏰", "I wake up at seven."], ["get up", "לקום (מהמיטה)", "🛏️", "I get up at seven."],
    ["take a shower", "להתקלח", "🚿", "I take a shower every morning."], ["have breakfast", "לאכול ארוחת בוקר", "🥐", "We have breakfast at eight."],
    ["start", "להתחיל", "▶️", "Work starts at nine."], ["finish", "לסיים", "🏁", "I finish work at five."],
    ["watch", "לצפות", "📺", "I watch TV in the evening.", { id: "watch-v" }], ["study", "ללמוד", "📚", "I study English."],
    ["go to bed", "ללכת לישון", "🌙", "I go to bed at eleven."], ["clean", "לנקות", "🧽", "I clean the house on Friday."],
    ["visit", "לבקר", "🧳", "We visit my parents."], ["call", "להתקשר", "📞", "I call my mother every day."],
    ["love", "לאהוב", "❤️", "I love my family."], ["need", "צריך / צריכה", "🙏", "I need help."],
    ["know", "לדעת / להכיר", "🧠", "I know the answer."], ["buy", "לקנות", "🛍️", "I buy bread."],
    ["pay", "לשלם", "💳", "I pay by card."], ["take", "לקחת", "✋", "I take the bus."],
    ["teach", "ללמד", "🧑‍🏫", "She teaches English."], ["do", "לעשות", "🛠️", "I do my homework."],
  ]);

  add("frequency", "a1", "adverb", [
    ["always", "תמיד", "🔁", "I always drink coffee."], ["usually", "בדרך כלל", "📆", "I usually walk to work."],
    ["often", "לעיתים קרובות", "🔂", "We often eat pizza."], ["sometimes", "לפעמים", "🎲", "She sometimes cooks."],
    ["rarely", "לעיתים רחוקות", "🐢", "He rarely drinks wine."], ["never", "אף פעם (לא)", "🚫", "I never eat meat."],
    ["every day", "כל יום", "📅", "I study every day."],
  ]);

  add("home2", "a1", "noun", [
    ["apartment", "דירה", "🏢", "My apartment is small."], ["living room", "סלון", "🛋️", "The TV is in the living room."],
    ["fridge", "מקרר", "🧊", "The milk is in the fridge."], ["shower", "מקלחת", "🚿", "The shower is hot."],
    ["garden", "גינה", "🌷", "We have a small garden."], ["stairs", "מדרגות", "🪜", "Take the stairs."],
    ["lamp", "מנורה", "💡", "The lamp is on the table."], ["closet", "ארון", "🚪", "My clothes are in the closet."],
    ["floor", "קומה / רצפה", "🏢", "I live on the third floor."],
  ]);

  add("shopping", "a1", "noun", [
    ["price", "מחיר", "🏷️", "What is the price?"], ["cheap", "זול", "🪙", "This shirt is cheap.", { partOfSpeech: "adjective" }],
    ["expensive", "יקר", "💎", "The watch is expensive.", { partOfSpeech: "adjective" }],
    ["vegetables", "ירקות", "🥦", "I buy vegetables."], ["fruit", "פירות", "🍇", "Fruit is healthy."],
    ["meat", "בשר", "🥩", "I don't eat meat."], ["sugar", "סוכר", "🍬", "No sugar, please."],
    ["salt", "מלח", "🧂", "Pass the salt, please."], ["bottle", "בקבוק", "🍾", "A bottle of water."],
    ["card", "כרטיס אשראי", "💳", "Can I pay by card?"], ["cash", "מזומן", "💵", "I pay in cash."],
    ["receipt", "קבלה", "🧾", "Here is your receipt."], ["shirt", "חולצה", "👕", "I like this shirt."],
    ["shoes", "נעליים", "👟", "These shoes are new."],
  ]);

  add("restaurant", "a1", "noun", [
    ["menu", "תפריט", "📜", "Can I see the menu, please?"], ["bill", "חשבון (במסעדה)", "🧾", "The bill, please."],
    ["breakfast", "ארוחת בוקר", "🥐", "Breakfast is at eight."], ["lunch", "ארוחת צהריים", "🥪", "Let's have lunch."],
    ["dinner", "ארוחת ערב", "🍝", "Dinner is ready."], ["dessert", "קינוח", "🍨", "Do you want dessert?"],
    ["order", "להזמין", "📝", "Can I order, please?", { partOfSpeech: "verb" }],
    ["i would like", "הייתי רוצה / אפשר לקבל", "🙋", "I would like a coffee, please.", { alts: ["i'd like"], partOfSpeech: "phrase" }],
    ["glass", "כוס (זכוכית)", "🥛", "A glass of water, please."],
  ]);

  add("work", "a1", "noun", [
    ["meeting", "פגישה", "📅", "The meeting is at ten."], ["boss", "בוס / מנהל", "🧑‍💼", "My boss is nice."],
    ["colleague", "עמית / עמיתה לעבודה", "🧑‍🤝‍🧑", "She is my colleague."], ["email", "אימייל", "📧", "I write an email."],
    ["job", "משרה / עבודה", "💼", "I like my job."], ["salary", "משכורת", "💰", "The salary is good."],
    ["project", "פרויקט", "📊", "This project is big."], ["company", "חברה (עסק)", "🏢", "I work for a big company."],
  ]);

  add("transport", "a1", "noun", [
    ["bus", "אוטובוס", "🚌", "I take the bus to work."], ["train", "רכבת", "🚆", "The train is fast."],
    ["taxi", "מונית", "🚕", "Let's take a taxi."], ["car", "מכונית", "🚗", "My car is red."],
    ["bike", "אופניים", "🚲", "I ride my bike."], ["plane", "מטוס", "✈️", "The plane is late."],
    ["station", "תחנה", "🚉", "Where is the train station?"], ["airport", "שדה תעופה", "🛫", "The airport is far."],
    ["ticket", "כרטיס (נסיעה)", "🎫", "One ticket, please."], ["bus stop", "תחנת אוטובוס", "🚏", "The bus stop is near here."],
  ]);

  add("directions", "a1", "adverb", [
    ["left", "שמאלה / שמאל", "⬅️", "Turn left."], ["right", "ימינה / ימין", "➡️", "Turn right."],
    ["straight ahead", "ישר", "⬆️", "Go straight ahead."], ["near", "קרוב", "📍", "The bank is near here."],
    ["far", "רחוק", "🗺️", "The airport is far."], ["next to", "ליד", "↔️", "The bank is next to the park."],
    ["turn", "לפנות", "↪️", "Turn left at the corner.", { partOfSpeech: "verb" }], ["corner", "פינה", "📐", "The shop is on the corner.", { partOfSpeech: "noun" }],
    ["opposite", "מול", "🔄", "The bank is opposite the park."],
  ]);

  add("time", "a1", "noun", [
    ["o'clock", "(שעה) בדיוק", "🕒", "It is three o'clock.", { id: "oclock" }], ["half past", "וחצי", "🕧", "It is half past two."],
    ["quarter past", "ורבע", "🕒", "It is quarter past six."], ["quarter to", "רבע ל-", "🕘", "It is quarter to nine."],
    ["minute", "דקה", "⏱️", "Wait a minute."], ["hour", "שעה", "⌛", "One hour, please."],
    ["morning", "בוקר", "🌅", "I study in the morning."], ["afternoon", "אחר הצהריים", "🌤️", "See you in the afternoon."],
    ["evening", "ערב", "🌆", "I watch TV in the evening."], ["night", "לילה", "🌙", "I sleep at night."],
    ["today", "היום", "📅", "Today is Monday."], ["tomorrow", "מחר", "➡️", "See you tomorrow."],
    ["yesterday", "אתמול", "⬅️", "Yesterday was Sunday."], ["now", "עכשיו", "⏳", "I am busy now."],
  ]);

  add("calendar", "a1", "noun", [
    ["Monday", "יום שני", "", "Today is Monday.", { id: "monday" }], ["Tuesday", "יום שלישי", "", "The meeting is on Tuesday.", { id: "tuesday" }],
    ["Wednesday", "יום רביעי", "", "I swim on Wednesday.", { id: "wednesday" }], ["Thursday", "יום חמישי", "", "See you on Thursday.", { id: "thursday" }],
    ["Friday", "יום שישי", "", "On Friday we cook.", { id: "friday" }], ["Saturday", "שבת", "", "On Saturday I rest.", { id: "saturday" }],
    ["Sunday", "יום ראשון", "", "Sunday is a work day in Israel.", { id: "sunday" }],
    ["January", "ינואר", "", "January is cold.", { id: "january" }], ["February", "פברואר", "", "My birthday is in February.", { id: "february" }],
    ["March", "מרץ", "", "In March it is nice.", { id: "march" }], ["April", "אפריל", "", "April is spring.", { id: "april" }],
    ["May", "מאי", "", "In May it is warm.", { id: "may" }], ["June", "יוני", "", "June is hot.", { id: "june" }],
    ["July", "יולי", "", "In July we travel.", { id: "july" }], ["August", "אוגוסט", "", "August is very hot.", { id: "august" }],
    ["September", "ספטמבר", "", "School starts in September.", { id: "september" }], ["October", "אוקטובר", "", "October is nice.", { id: "october" }],
    ["November", "נובמבר", "", "It rains in November.", { id: "november" }], ["December", "דצמבר", "", "December is cold.", { id: "december" }],
    ["week", "שבוע", "🗓️", "I work five days a week."], ["month", "חודש", "📆", "One month is thirty days."],
    ["year", "שנה", "🎆", "Happy new year!"], ["weekend", "סוף שבוע", "🏖️", "Have a nice weekend!"],
    ["birthday", "יום הולדת", "🎂", "Happy birthday!"],
  ]);

  add("continuous", "a1", "phrase", [
    ["at the moment", "כרגע", "⏳", "She is busy at the moment."], ["look", "תראי! / להסתכל", "👀", "Look! It is raining.", { partOfSpeech: "verb" }],
    ["rain", "לרדת גשם / גשם", "🌧️", "It is raining now.", { partOfSpeech: "verb" }], ["wait", "לחכות", "⏳", "I am waiting for the bus.", { partOfSpeech: "verb" }],
    ["wear", "ללבוש", "👗", "She is wearing a red dress.", { partOfSpeech: "verb" }], ["talk", "לשוחח / לדבר", "💬", "They are talking.", { partOfSpeech: "verb" }],
  ]);

  add("past-regular", "a1", "verb", [
    ["worked", "עבד / עבדתי (עבר)", "💼", "I worked yesterday."], ["played", "שיחק / שיחקתי", "🎮", "We played cards."],
    ["watched", "צפה / צפיתי", "📺", "I watched a movie."], ["cooked", "בישל / בישלתי", "🍳", "She cooked dinner."],
    ["cleaned", "ניקה / ניקיתי", "🧽", "I cleaned the kitchen."], ["visited", "ביקר / ביקרתי", "🧳", "We visited Rome."],
    ["called", "התקשר / התקשרתי", "📞", "I called my mother."], ["studied", "למד / למדתי", "📚", "I studied English."],
    ["lived", "גר / גרתי", "🏡", "I lived in Haifa."], ["wanted", "רצה / רציתי", "🙋", "I wanted coffee."],
    ["started", "התחיל / התחלתי", "▶️", "The movie started at eight."], ["finished", "סיים / סיימתי", "🏁", "I finished work."],
    ["walked", "הלך ברגל / הלכתי", "🚶", "We walked to the beach."], ["liked", "אהב / אהבתי", "❤️", "I liked the food."],
  ]);

  add("past-irregular", "a1", "verb", [
    ["went", "הלך / הלכתי (עבר של go)", "🚶", "I went to the beach."], ["had", "היה לי (עבר של have)", "🤲", "I had a good day."],
    ["ate", "אכל / אכלתי (עבר של eat)", "🍽️", "We ate pizza."], ["drank", "שתה / שתיתי (עבר של drink)", "🥤", "She drank tea."],
    ["saw", "ראה / ראיתי (עבר של see)", "👀", "I saw a good movie."],
    ["came", "בא / באתי (עבר של come)", "👋", "He came late."], ["did", "עשה / עשיתי (עבר של do)", "🛠️", "I did my homework."],
    ["got", "קיבל / הגיע (עבר של get)", "📦", "I got an email."], ["made", "הכין / הכנתי (עבר של make)", "🥞", "She made a cake."],
    ["took", "לקח / לקחתי (עבר של take)", "✋", "We took a taxi."],
    ["bought", "קנה / קניתי (עבר של buy)", "🛍️", "I bought bread."], ["said", "אמר / אמרתי (עבר של say)", "💬", "He said hello."],
    ["wrote", "כתב / כתבתי (עבר של write)", "✍️", "I wrote an email."], ["met", "פגש / פגשתי (עבר של meet)", "🤝", "I met a friend."],
    ["slept", "ישן / ישנתי (עבר של sleep)", "😴", "I slept well."],
  ]);

  add("past-time", "a1", "phrase", [
    ["last night", "אתמול בלילה", "🌙", "I slept well last night."], ["last week", "בשבוע שעבר", "📅", "I was sick last week."],
    ["ago", "לפני (זמן)", "⏪", "I met him two years ago."], ["was", "היה / הייתי", "", "I was at home.", { partOfSpeech: "verb" }],
    ["were", "היו / היית / היינו", "", "They were happy.", { partOfSpeech: "verb" }],
  ]);

  add("future", "a1", "phrase", [
    ["next week", "בשבוע הבא", "➡️", "I will call you next week."], ["next year", "בשנה הבאה", "🎆", "Next year I am going to travel."],
    ["soon", "בקרוב", "⏳", "See you soon."], ["later", "מאוחר יותר / אחר כך", "🕓", "I will do it later."],
    ["plan", "תוכנית", "🗒️", "What is your plan?", { partOfSpeech: "noun" }], ["vacation", "חופשה", "🏝️", "We are going to take a vacation.", { partOfSpeech: "noun" }],
    ["maybe", "אולי", "🤷", "Maybe I will come."], ["travel", "לטייל / לנסוע", "🧳", "I am going to travel.", { partOfSpeech: "verb" }],
    ["tonight", "הערב / הלילה", "🌃", "I am going to cook tonight."],
  ]);

  /* ======================= A2 ======================= */
  add("adjectives2", "a2", "adjective", [
    ["fast", "מהיר", "🏎️", "The train is fast."], ["slow", "איטי", "🐌", "The bus is slow."],
    ["easy", "קל", "🙂", "English is easy!"], ["difficult", "קשה", "🧗", "This test is difficult."],
    ["long", "ארוך", "📏", "The movie is long."], ["short", "קצר", "✂️", "The meeting is short."],
    ["interesting", "מעניין", "🤔", "The book is interesting."], ["warm", "חמים", "☀️", "Today is warm."],
    ["better", "טוב יותר", "📈", "This is better."], ["best", "הכי טוב", "🏆", "This is the best cafe."],
    ["worse", "גרוע יותר", "📉", "The weather is worse today."], ["worst", "הכי גרוע", "💀", "It was the worst day."],
  ]);

  add("uncountable", "a2", "noun", [
    ["information", "מידע", "ℹ️", "I need some information."], ["advice", "עצה / עצות", "💬", "Can you give me some advice?"],
    ["furniture", "רהיטים", "🛋️", "We need new furniture."], ["time", "זמן", "⏰", "I don't have much time."],
    ["homework", "שיעורי בית", "📝", "I have a lot of homework."], ["oil", "שמן", "🫒", "Is there any oil?"],
    ["butter", "חמאה", "🧈", "There is some butter in the fridge."], ["flour", "קמח", "🌾", "We need some flour."],
  ]);

  add("health", "a2", "noun", [
    ["rest", "לנוח", "🛌", "You should rest.", { partOfSpeech: "verb" }], ["medicine", "תרופה", "💊", "Take this medicine."],
    ["headache", "כאב ראש", "🤕", "I have a headache."], ["exercise", "להתעמל", "🏃", "You should exercise.", { partOfSpeech: "verb" }],
    ["seatbelt", "חגורת בטיחות", "🚗", "You must wear a seatbelt."], ["passport", "דרכון", "🛂", "You must show your passport."],
    ["rule", "חוק / כלל", "📏", "This is a rule."], ["early", "מוקדם", "🌄", "You should go to bed early.", { partOfSpeech: "adverb" }],
    ["smoke", "לעשן", "🚭", "You must not smoke here.", { partOfSpeech: "verb" }], ["dentist", "רופא / רופאת שיניים", "🦷", "I have to go to the dentist."],
  ]);

  /* ======================= READING (vocabulary that appears in the Reading articles) ======================= */
  add("reading", "a1", "noun", [
    ["friendship", "חברות", "👭", "Friendship is important to me."],
    ["confidence", "ביטחון עצמי", "💪", "She speaks with confidence."],
    ["routine", "שגרה", "🗓️", "I have a morning routine."],
    ["self-care", "טיפוח עצמי", "🛁", "Self-care is not selfish."],
    ["relationship", "מערכת יחסים", "💞", "We have a good relationship."],
    ["support", "תמיכה", "🤝", "My friends give me support.", { partOfSpeech: "noun" }],
    ["skin", "עור", "🧴", "I take care of my skin."],
  ]);
  add("reading", "a2", "adjective", [
    ["grateful", "אסירת תודה", "🙏", "I am grateful for my friends."],
    ["honest", "כנה / כן", "💬", "Be honest with yourself."],
    ["comfortable", "נוח", "😌", "These shoes are comfortable."],
    ["worth it", "שווה את זה", "✨", "It is worth it."],
    ["overwhelmed", "מוצפת", "😵", "Sometimes I feel overwhelmed."],
  ]);
  add("reading", "a2", "verb", [
    ["deserve", "מגיע ל / ראויה ל", "🌟", "You deserve to be happy."],
    ["trust", "לבטוח", "🤞", "I trust my best friend."],
    ["forgive", "לסלוח", "🕊️", "It is hard to forgive."],
    ["recharge", "להיטען מחדש", "🔋", "I recharge on the weekend."],
    ["breathe", "לנשום", "🌬️", "Take a moment to breathe."],
  ]);
  add("reading", "a2", "noun", [
    ["stress", "לחץ / מתח", "😣", "I feel a lot of stress at work."],
    ["energy", "אנרגיה", "⚡", "I have a lot of energy in the morning."],
    ["focus", "ריכוז", "🎯", "It is hard to focus today."],
  ]);
  add("reading", "a2", "adjective", [
    ["calm", "רגועה", "🧘", "Take a deep breath and stay calm."],
  ]);
  /* ======================= A2: weather, travel, requests ======================= */
  add("weather", "a2", "noun", [
    ["weather", "מזג אוויר", "🌦️", "The weather is nice today."],
    ["storm", "סערה", "⛈️", "There was a big storm last night."],
  ]);
  add("weather", "a2", "adjective", [
    ["sunny", "שמשי", "☀️", "It is sunny and warm today."],
    ["cloudy", "מעונן", "☁️", "It was cloudy all morning."],
    ["windy", "עם הרבה רוח", "🌬️", "It is very windy at the beach."],
    ["wet", "רטוב", "💧", "My shoes are wet."],
  ]);
  add("travel2", "a2", "noun", [
    ["hotel", "מלון", "🏨", "We stayed in a small hotel."],
    ["flight", "טיסה", "✈️", "My flight leaves at ten."],
    ["suitcase", "מזוודה", "🧳", "My suitcase is very heavy."],
    ["appointment", "תור / פגישה", "📅", "I have an appointment at three."],
    ["message", "הודעה", "💬", "I sent you a message."],
  ]);
  add("adjectives3", "a2", "adjective", [
    ["heavy", "כבד", "🏋️", "This bag is heavy."],
    ["loud", "חזק / רועש", "🔊", "The music is loud."],
  ]);
  add("actions3", "a2", "verb", [
    ["cancel", "לבטל", "❌", "I want to cancel my appointment."],
    ["answer", "לענות", "📞", "Please answer the phone."],
  ]);
})(typeof globalThis !== "undefined" ? globalThis : this);
