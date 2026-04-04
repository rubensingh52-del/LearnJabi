import fs from 'fs';

const FILE_PATH = 'server/routes.ts';
let code = fs.readFileSync(FILE_PATH, 'utf-8');

// The new content for Lesson 1 (Order 1) - Vowel Carriers & Matras
const newLesson1Content = JSON.stringify({
  intro: "Gurmukhi has 3 vowel carriers (ੳ, ਅ, ੲ) and 10 vowel signs (matras). Combining them creates all vowel sounds.",
  items: [
    { gurmukhi: "ੳ", romanized: "oorhaa", english: "vowel carrier (no sound on its own)" },
    { gurmukhi: "ਅ", romanized: "airhaa", english: "vowel carrier + short 'a' sound" },
    { gurmukhi: "ੲ", romanized: "eerhee", english: "vowel carrier (no sound on its own)" },
    { gurmukhi: "ਾ", romanized: "kannaa", english: "long 'aa' (matra) — as in 'father'" },
    { gurmukhi: "ਿ", romanized: "sihaaree", english: "short 'i' (matra) — as in 'it'" },
    { gurmukhi: "ੀ", romanized: "bihaaree", english: "long 'ee' (matra) — as in 'see'" },
    { gurmukhi: "ੁ", romanized: "aunkarh", english: "short 'u' (matra) — as in 'put'" },
    { gurmukhi: "ੂ", romanized: "dulainkarh", english: "long 'oo' (matra) — as in 'food'" },
    { gurmukhi: "ੇ", romanized: "laavaan", english: "'e' (matra) — as in 'cake'" },
    { gurmukhi: "ੈ", romanized: "dulaavaan", english: "'ai' (matra) — as in 'man'" },
    { gurmukhi: "ੋ", romanized: "horhaa", english: "'o' (matra) — as in 'go'" },
    { gurmukhi: "ੌ", romanized: "kanaurhaa", english: "'au' (matra) — as in 'caught'" }
  ],
  exercises: [
    { type: "match", question: "Match the matra to its romanized name", pairs: [["ਾ","kannaa"],["ਿ","sihaaree"],["ੀ","bihaaree"],["ੁ","aunkarh"]] },
    { type: "choose", question: "ੳ — What is the name of this vowel carrier?", options: ["oorhaa","airhaa","eerhee","kannaa"], correct: 0 },
    { type: "choose", question: "ੇ — Which matra is this?", options: ["horhaa","laavaan","dulaavaan","aunkarh"], correct: 1 },
    { type: "choose", question: "Which is the base vowel carrier that makes the short 'a' sound?", options: ["ੳ","ਅ","ੲ","ਾ"], correct: 1 }
  ]
});

// The new content for Lesson 4 (Order 4) - Extra Letters
const newLesson4Content = JSON.stringify({
  intro: "These 6 extra letters were added for borrowed sounds from Persian and Arabic. They are formed with a dot (pair bindī).",
  items: [
    { gurmukhi: "ਸ਼", romanized: "shashashaa", english: "sh — as in 'shop'" },
    { gurmukhi: "ਖ਼", romanized: "khhakhhkhha", english: "ḵh — guttural kh" },
    { gurmukhi: "ਗ਼", romanized: "ghagghaa", english: "ġ — voiced velar fricative" },
    { gurmukhi: "ਜ਼", romanized: "zazzaa", english: "z — as in 'zebra'" },
    { gurmukhi: "ਫ਼", romanized: "faffaa", english: "f — as in 'fan'" },
    { gurmukhi: "ਲ਼", romanized: "lallaa", english: "ḷ — retroflex l" }
  ],
  exercises: [
    { type: "match", question: "Match the extra letter to its name", pairs: [["ਸ਼","shashashaa"],["ਜ਼","zazzaa"],["ਫ਼","faffaa"],["ਲ਼","lallaa"]] },
    { type: "choose", question: "ਜ਼ — What sound does this letter make?", options: ["sh","f","z","l"], correct: 2 },
    { type: "choose", question: "ਫ਼ — What is the name of this letter?", options: ["faffaa","zazzaa","ghagghaa","khhakhhkhha"], correct: 0 },
    { type: "choose", question: "What distinguishes these extra letters from the base alphabet?", options: ["They are written upside down","They have a dot at the bottom","They are blue","They have two vertical lines"], correct: 1 }
  ]
});

// Replace the seed definition block inside const lessonsData
// Lesson 1 replacement
code = code.replace(
  /\{ unit_id: u\(1\), title: "Vowels \(Lagaan Maatraa\)".*?\}\) \},/,
  `{ unit_id: u(1), title: "Vowel Carriers & Matras", title_punjabi: "ਸਵਰ ਅਤੇ ਮਾਤਰਾਵਾਂ", description: "Learn the 3 vowel carriers and 10 vowel signs", order: 1, type: "vocabulary", content: JSON.stringify(${newLesson1Content}) },`
);

// Lesson 2 rename
code = code.replace(
  /title: "Consonants Row 1-2"/,
  `title: "Consonants (Rows 1-2)"`
);

// Lesson 3 rename
code = code.replace(
  /title: "Consonants Row 3-5"/,
  `title: "Consonants (Rows 3-5)"`
);

// We must insert Lesson 4 (Extra Letters) before Writing Practice
// "Writing Practice" is unit 1 order 4, it should become order 5 now.
code = code.replace(
  /\{ unit_id: u\(1\), title: "Writing Practice", title_punjabi: "ਲਿਖਣ ਅਭਿਆਸ".*?order: 4.*?\},/,
  `{ unit_id: u(1), title: "Extra Letters", title_punjabi: "ਹੋਰ ਅੱਖਰ", description: "Learn the 6 extra borrowed letters", order: 4, type: "vocabulary", content: JSON.stringify(${newLesson4Content}) },\n    { unit_id: u(1), title: "Writing Practice", title_punjabi: "ਲਿਖਣ ਅਭਿਆਸ", description: "Practice writing Gurmukhi characters step by step", order: 5, type: "practice", content: JSON.stringify({ intro: "Practice recognising Gurmukhi characters in real words. Focus on connecting letters you have already learnt.", items: [ { gurmukhi: "ੴ", romanized: "Ik Onkar", english: "The sacred symbol — 'One God'" }, { gurmukhi: "ਸਤ", romanized: "sat", english: "Truth" }, { gurmukhi: "ਨਾਮ", romanized: "naam", english: "Name / Identity" }, { gurmukhi: "ਸਿੱਖ", romanized: "Sikh", english: "Sikh / Learner" }, { gurmukhi: "ਪੰਜਾਬ", romanized: "panjaab", english: "Punjab — Land of Five Rivers" }, { gurmukhi: "ਗੁਰਮੁਖੀ", romanized: "Gurmukhi", english: "The Punjabi script — 'from the Guru\\'s mouth'" } ], exercises: [ { type: "choose", question: "ਸਤ (sat) — What does this word mean?", options: ["Name","Truth","God","Land"], correct: 1 }, { type: "choose", question: "ਪੰਜਾਬ (panjaab) — What does Punjab mean?", options: ["Five Rivers","Holy Land","Sacred Place","Golden Temple"], correct: 0 }, { type: "choose", question: "ਗੁਰਮੁਖੀ (Gurmukhi) — What does the script name mean?", options: ["From God","Five sounds","From the Guru\\'s mouth","Sacred writing"], correct: 2 }, { type: "match", question: "Match the words to their meanings", pairs: [["ਸਤ","Truth"],["ਨਾਮ","Name"],["ਸਿੱਖ","Learner"],["ਪੰਜਾਬ","Punjab"]] } ] }) },`
);

// Rewrite the migrate function dynamically
const migrateRegex = /\/\/ ── Unit 1 content migration[\s\S]*?(?=\n\/\/ ── )/;
const newMigrate = `// ── Unit 1 content migration — restructures units based on new pedagogical map ───
async function migrateUnit1Content() {
  const { data: allUnits } = await db.from('units').select('id, order');
  const unit1 = allUnits?.find(u => u.order === 1);
  if (!unit1) return;

  const { data: lessons } = await db.from('lessons').select('*').eq('unitId', unit1.id);
  if (!lessons || lessons.length === 0) return;

  // Update Vowel Lesson (Order 1)
  const lesson1 = lessons.find(l => l.order === 1);
  if (lesson1 && lesson1.title !== "Vowel Carriers & Matras") {
    await db.from('lessons').update({
      title: "Vowel Carriers & Matras",
      titlePunjabi: "ਸਵਰ ਅਤੇ ਮਾਤਰਾਵਾਂ",
      description: "Learn the 3 vowel carriers and 10 vowel signs",
      content: JSON.stringify(${newLesson1Content})
    }).eq('id', lesson1.id);
  }

  // Update Consonant Lesson 2 (Order 2)
  const lesson2 = lessons.find(l => l.order === 2);
  if (lesson2 && lesson2.title === "Consonants Row 1-2") {
    await db.from('lessons').update({ title: "Consonants (Rows 1-2)" }).eq('id', lesson2.id);
  }

  // Update Consonant Lesson 3 (Order 3)
  const lesson3 = lessons.find(l => l.order === 3);
  if (lesson3 && lesson3.title === "Consonants Row 3-5") {
    await db.from('lessons').update({ title: "Consonants (Rows 3-5)" }).eq('id', lesson3.id);
  }

  // Check for Extra Letters (Order 4)
  const lesson4 = lessons.find(l => l.title === "Extra Letters");
  if (!lesson4) {
    // Determine the ID of the writing practice lesson to bump it
    const writingPractice = lessons.find(l => l.title === "Writing Practice" || l.order === 4);
    if (writingPractice) {
      await db.from('lessons').update({ order: 5 }).eq('id', writingPractice.id);
    }
    
    // Insert Extra Letters at Order 4
    await db.from('lessons').insert({
      unitId: unit1.id,
      title: "Extra Letters",
      titlePunjabi: "ਹੋਰ ਅੱਖਰ",
      description: "Learn the 6 extra borrowed letters",
      order: 4,
      type: "vocabulary",
      content: JSON.stringify(${newLesson4Content})
    });
  }
}
`;

code = code.replace(migrateRegex, newMigrate);

fs.writeFileSync(FILE_PATH, code);
console.log("SUCCESS");
