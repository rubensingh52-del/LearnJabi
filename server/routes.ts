import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";

async function seedData() {
  // Check if data already seeded
  const existingUnits = await storage.getUnits();
  if (existingUnits.length > 0) return;

  console.log('[Seed] No units found — seeding database...');

  // Seed units
  const unitData = [
    { title: "Gurmukhi Script", title_punjabi: "ਗੁਰਮੁਖੀ ਲਿਪੀ", description: "Master the Gurmukhi alphabet — the foundation of written Punjabi", icon: "pen-tool", order: 1, color: "amber" },
    { title: "Common Phrases & Greetings", title_punjabi: "ਆਮ ਵਾਕਾਂਸ਼", description: "Essential greetings, introductions, and everyday phrases with 15+ expressions", icon: "hand-metal", order: 2, color: "emerald" },
    { title: "Numbers 1–100", title_punjabi: "ਅੰਕ ੧-੧੦੦", description: "Count from 1 to 100, tell time, and discuss dates in Punjabi", icon: "hash", order: 3, color: "blue" },
    { title: "Colours", title_punjabi: "ਰੰਗ", description: "Learn all the colours in Punjabi with vocabulary and quizzes", icon: "palette", order: 4, color: "purple" },
    { title: "Directions & Places", title_punjabi: "ਦਿਸ਼ਾਵਾਂ ਅਤੇ ਥਾਵਾਂ", description: "Navigate places, ask for directions, and transportation vocabulary", icon: "map-pin", order: 5, color: "teal" },
    { title: "Emotions & Feelings", title_punjabi: "ਭਾਵਨਾਵਾਂ", description: "Express how you feel in Punjabi — emotions, moods, and states of mind", icon: "heart", order: 6, color: "orange" },
    { title: "Family & People", title_punjabi: "ਪਰਿਵਾਰ", description: "Talk about family members, relationships, and describing people", icon: "users", order: 7, color: "amber" },
    { title: "Food & Dining", title_punjabi: "ਖਾਣਾ", description: "Order food, discuss Punjabi cuisine, and cooking vocabulary", icon: "utensils", order: 8, color: "orange" },
  ];

  const { data: insertedUnits, error: unitError } = await db.from('units').insert(unitData).select();
  if (unitError) { console.error('[Seed] Unit insert error:', unitError); return; }
  console.log(`[Seed] Inserted ${insertedUnits?.length} units`);

  const u = (order: number) => insertedUnits?.find((u: any) => u.order === order)?.id ?? order;

  const lessonsData = [
    // ── UNIT 1: Gurmukhi Script ──
    {
      unit_id: u(1), title: "Vowels (Lagaan Maatraa)", title_punjabi: "ਲਗਾਂ ਮਾਤਰਾ", description: "Learn the 10 Punjabi vowels and their sounds",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Gurmukhi has 10 vowel characters called Lagaan Maatraa. Each vowel can appear independently or attached to a consonant.",
        items: [
          { gurmukhi: "ਅ", romanized: "a", english: "as in 'about'", audio: "short a" },
          { gurmukhi: "ਆ", romanized: "aa", english: "as in 'father'", audio: "long a" },
          { gurmukhi: "ਇ", romanized: "i", english: "as in 'hit'", audio: "short i" },
          { gurmukhi: "ਈ", romanized: "ee", english: "as in 'see'", audio: "long i" },
          { gurmukhi: "ਉ", romanized: "u", english: "as in 'put'", audio: "short u" },
          { gurmukhi: "ਊ", romanized: "oo", english: "as in 'moon'", audio: "long u" },
          { gurmukhi: "ਏ", romanized: "e", english: "as in 'play'", audio: "e sound" },
          { gurmukhi: "ਐ", romanized: "ai", english: "as in 'cat'", audio: "ai sound" },
          { gurmukhi: "ਓ", romanized: "o", english: "as in 'go'", audio: "o sound" },
          { gurmukhi: "ਔ", romanized: "au", english: "as in 'caught'", audio: "au sound" },
        ],
        exercises: [
          { type: "match", question: "Match the Gurmukhi vowel to its sound", pairs: [["ਅ","a"],["ਆ","aa"],["ਇ","i"],["ਈ","ee"]] },
          { type: "choose", question: "Which letter makes the 'oo' sound?", options: ["ਉ","ਊ","ਓ","ਔ"], correct: 1 },
          { type: "choose", question: "Which letter sounds like 'a' in 'about'?", options: ["ਆ","ਅ","ਐ","ਏ"], correct: 1 },
        ]
      })
    },
    {
      unit_id: u(1), title: "Consonants Row 1-2", title_punjabi: "ਵਿਅੰਜਨ", description: "First 10 consonants of the Gurmukhi alphabet",
      order: 2, type: "vocabulary",
      content: JSON.stringify({
        intro: "Gurmukhi has 35 consonants organised in rows of 5. Let's learn the first two rows.",
        items: [
          { gurmukhi: "ਸ", romanized: "sa", english: "s as in 'sun'", audio: "sa" },
          { gurmukhi: "ਹ", romanized: "ha", english: "h as in 'hat'", audio: "ha" },
          { gurmukhi: "ਕ", romanized: "ka", english: "k as in 'kit'", audio: "ka" },
          { gurmukhi: "ਖ", romanized: "kha", english: "kh aspirated k", audio: "kha" },
          { gurmukhi: "ਗ", romanized: "ga", english: "g as in 'go'", audio: "ga" },
          { gurmukhi: "ਘ", romanized: "gha", english: "gh aspirated g", audio: "gha" },
          { gurmukhi: "ਙ", romanized: "nga", english: "ng as in 'sing'", audio: "nga" },
          { gurmukhi: "ਚ", romanized: "cha", english: "ch as in 'chat'", audio: "cha" },
          { gurmukhi: "ਛ", romanized: "chha", english: "chh aspirated ch", audio: "chha" },
          { gurmukhi: "ਜ", romanized: "ja", english: "j as in 'jam'", audio: "ja" },
        ],
        exercises: [
          { type: "choose", question: "Which letter makes the 'ka' sound?", options: ["ਸ","ਕ","ਗ","ਚ"], correct: 1 },
          { type: "choose", question: "Which is the aspirated form of 'g'?", options: ["ਗ","ਘ","ਙ","ਖ"], correct: 1 },
          { type: "match", question: "Match consonants to sounds", pairs: [["ਸ","sa"],["ਹ","ha"],["ਕ","ka"],["ਚ","cha"]] },
        ]
      })
    },
    {
      unit_id: u(1), title: "Consonants Row 3-5", title_punjabi: "ਵਿਅੰਜਨ ਭਾਗ ੨", description: "Continue with the remaining consonant rows",
      order: 3, type: "vocabulary",
      content: JSON.stringify({
        intro: "Let's continue learning the remaining rows of Gurmukhi consonants.",
        items: [
          { gurmukhi: "ਟ", romanized: "ṭa", english: "retroflex t", audio: "ta (retroflex)" },
          { gurmukhi: "ਠ", romanized: "ṭha", english: "aspirated retroflex t", audio: "tha (retroflex)" },
          { gurmukhi: "ਡ", romanized: "ḍa", english: "retroflex d", audio: "da (retroflex)" },
          { gurmukhi: "ਤ", romanized: "ta", english: "t as in 'top'", audio: "ta" },
          { gurmukhi: "ਥ", romanized: "tha", english: "aspirated t", audio: "tha" },
          { gurmukhi: "ਦ", romanized: "da", english: "d as in 'day'", audio: "da" },
          { gurmukhi: "ਪ", romanized: "pa", english: "p as in 'pen'", audio: "pa" },
          { gurmukhi: "ਫ", romanized: "pha", english: "aspirated p", audio: "pha" },
          { gurmukhi: "ਬ", romanized: "ba", english: "b as in 'bed'", audio: "ba" },
          { gurmukhi: "ਮ", romanized: "ma", english: "m as in 'mat'", audio: "ma" },
        ],
        exercises: [
          { type: "choose", question: "Which is the retroflex 't'?", options: ["ਤ","ਟ","ਥ","ਠ"], correct: 1 },
          { type: "match", question: "Match the letters", pairs: [["ਪ","pa"],["ਬ","ba"],["ਮ","ma"],["ਦ","da"]] },
        ]
      })
    },
    {
      unit_id: u(1), title: "Writing Practice", title_punjabi: "ਲਿਖਣ ਅਭਿਆਸ", description: "Practice writing Gurmukhi characters step by step",
      order: 4, type: "practice",
      content: JSON.stringify({
        intro: "Practice tracing and writing Gurmukhi characters. Focus on stroke order and proportions.",
        items: [
          { gurmukhi: "ੴ", romanized: "Ik Onkar", english: "The sacred symbol — 'One God'", audio: "Ik Onkar" },
          { gurmukhi: "ਸਤ", romanized: "sat", english: "Truth", audio: "sat" },
          { gurmukhi: "ਨਾਮ", romanized: "naam", english: "Name / Identity", audio: "naam" },
          { gurmukhi: "ਸਿੱਖ", romanized: "Sikh", english: "Sikh / Learner", audio: "Sikh" },
          { gurmukhi: "ਪੰਜਾਬ", romanized: "panjaab", english: "Punjab — Land of Five Rivers", audio: "panjaab" },
        ],
        exercises: [
          { type: "choose", question: "What does ਸਤ mean?", options: ["Name","Truth","God","Land"], correct: 1 },
          { type: "choose", question: "What does ਪੰਜਾਬ mean?", options: ["Five Rivers","Holy Land","Punjab","Sacred Place"], correct: 2 },
        ]
      })
    },
    // ── UNIT 2: Common Phrases & Greetings ──
    {
      unit_id: u(2), title: "Everyday Greetings", title_punjabi: "ਰੋਜ਼ਾਨਾ ਸ਼ੁਭ ਇੱਛਾਵਾਂ", description: "Say hello, goodbye, and daily courtesies",
      order: 1, type: "phrases",
      content: JSON.stringify({
        intro: "Punjabi greetings reflect deep cultural respect. The most common greeting 'Sat Sri Akal' literally means 'True is the Timeless Lord.'",
        items: [
          { gurmukhi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", romanized: "Sat Sri Akal", english: "Hello / God is truth", audio: "sat sri akal" },
          { gurmukhi: "ਕਿਦਾਂ?", romanized: "Kidaan?", english: "How are you? (informal)", audio: "kidaan" },
          { gurmukhi: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", romanized: "Tusi kive ho?", english: "How are you? (formal)", audio: "tusi kive ho" },
          { gurmukhi: "ਮੈਂ ਠੀਕ ਹਾਂ", romanized: "Mai theek haan", english: "I am fine", audio: "mai theek haan" },
          { gurmukhi: "ਸ਼ੁਕਰੀਆ", romanized: "Shukriya", english: "Thank you", audio: "shukriya" },
          { gurmukhi: "ਜੀ ਆਇਆਂ ਨੂੰ", romanized: "Ji aayian nu", english: "Welcome", audio: "ji aayian nu" },
          { gurmukhi: "ਅਲਵਿਦਾ", romanized: "Alvida", english: "Goodbye", audio: "alvida" },
          { gurmukhi: "ਮਾਫ਼ ਕਰਨਾ", romanized: "Maaf karna", english: "Sorry / Excuse me", audio: "maaf karna" },
          { gurmukhi: "ਹਾਂ", romanized: "Haan", english: "Yes", audio: "haan" },
          { gurmukhi: "ਨਹੀਂ", romanized: "Nahi", english: "No", audio: "nahi" },
          { gurmukhi: "ਕਿਰਪਾ ਕਰਕੇ", romanized: "Kirpa karke", english: "Please", audio: "kirpa karke" },
          { gurmukhi: "ਬਹੁਤ ਧੰਨਵਾਦ", romanized: "Bahut dhannvaad", english: "Thank you very much", audio: "bahut dhannvaad" },
          { gurmukhi: "ਕੋਈ ਗੱਲ ਨਹੀਂ", romanized: "Koi gal nahi", english: "No problem / You're welcome", audio: "koi gal nahi" },
          { gurmukhi: "ਸ਼ੁਭ ਸਵੇਰੇ", romanized: "Shubh Savere", english: "Good morning", audio: "shubh savere" },
          { gurmukhi: "ਸ਼ੁਭ ਰਾਤ", romanized: "Shubh raat", english: "Good night", audio: "shubh raat" },
          { gurmukhi: "ਫਿਰ ਮਿਲਾਂਗੇ", romanized: "Phir milaange", english: "See you again", audio: "phir milaange" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Hello' in Punjabi?", options: ["ਸ਼ੁਕਰੀਆ","ਸਤ ਸ੍ਰੀ ਅਕਾਲ","ਅਲਵਿਦਾ","ਕਿਦਾਂ"], correct: 1 },
          { type: "choose", question: "What does 'ਸ਼ੁਕਰੀਆ' mean?", options: ["Hello","Sorry","Thank you","Welcome"], correct: 2 },
          { type: "choose", question: "How do you say 'Good morning'?", options: ["ਸ਼ੁਭ ਰਾਤ","ਅਲਵਿਦਾ","ਸ਼ੁਭ ਸਵੇਰੇ","ਕਿਦਾਂ"], correct: 2 },
          { type: "match", question: "Match greetings", pairs: [["ਸ਼ੁਕਰੀਆ","Thank you"],["ਅਲਵਿਦਾ","Goodbye"],["ਹਾਂ","Yes"],["ਨਹੀਂ","No"]] },
        ]
      })
    },
    {
      unit_id: u(2), title: "Introducing Yourself", title_punjabi: "ਆਪਣੀ ਜਾਣ-ਪਛਾਣ", description: "Tell people your name, where you're from, and what you do",
      order: 2, type: "phrases",
      content: JSON.stringify({
        intro: "Being able to introduce yourself is essential. Punjabi has formal ('ਤੁਸੀਂ') and informal ('ਤੂੰ') registers — always use formal with strangers and elders.",
        items: [
          { gurmukhi: "ਮੇਰਾ ਨਾਮ ___ ਹੈ", romanized: "Mera naam ___ hai", english: "My name is ___", audio: "mera naam hai" },
          { gurmukhi: "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?", romanized: "Tuhaada naam ki hai?", english: "What is your name? (formal)", audio: "tuhaada naam" },
          { gurmukhi: "ਮੈਂ ___ ਤੋਂ ਹਾਂ", romanized: "Mai ___ to haan", english: "I am from ___", audio: "mai to haan" },
          { gurmukhi: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ ਹਾਂ", romanized: "Mai Punjabi Sikh riha haan", english: "I am learning Punjabi (male)", audio: "Sikh riha" },
          { gurmukhi: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਹੀ ਹਾਂ", romanized: "Mai Punjabi Sikh rahi haan", english: "I am learning Punjabi (female)", audio: "Sikh rahi" },
          { gurmukhi: "ਤੁਸੀਂ ਕੀ ਕੰਮ ਕਰਦੇ ਹੋ?", romanized: "Tusi ki kam karde ho?", english: "What do you do?", audio: "ki kam" },
          { gurmukhi: "ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ", romanized: "Mil ke khushi hoyi", english: "Nice to meet you", audio: "mil ke khushi" },
          { gurmukhi: "ਮੇਰੀ ਉਮਰ ___ ਸਾਲ ਹੈ", romanized: "Meri umar ___ saal hai", english: "I am ___ years old", audio: "meri umar" },
          { gurmukhi: "ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ", romanized: "Mai vidyarthi haan", english: "I am a student", audio: "vidyarthi" },
          { gurmukhi: "ਮੈਂ ਅੰਗਰੇਜ਼ੀ ਬੋਲਦਾ ਹਾਂ", romanized: "Mai angrezi bolda haan", english: "I speak English", audio: "angrezi bolda" },
          { gurmukhi: "ਕੀ ਤੁਸੀਂ ਪੰਜਾਬੀ ਬੋਲਦੇ ਹੋ?", romanized: "Ki tusi Punjabi bolde ho?", english: "Do you speak Punjabi?", audio: "bolde ho" },
          { gurmukhi: "ਥੋੜੀ ਜਿਹੀ", romanized: "Thori jihi", english: "A little bit", audio: "thori jihi" },
          { gurmukhi: "ਮੈਨੂੰ ਸਮਝ ਆਈ", romanized: "Mainu samajh aayi", english: "I understood", audio: "samajh aayi" },
          { gurmukhi: "ਦੁਬਾਰਾ ਕਹੋ", romanized: "Dubaara kaho", english: "Please say again", audio: "dubaara kaho" },
          { gurmukhi: "ਹੌਲੀ ਬੋਲੋ", romanized: "Hauli bolo", english: "Speak slowly", audio: "hauli bolo" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'My name is' in Punjabi?", options: ["ਤੁਹਾਡਾ ਨਾਮ","ਮੇਰਾ ਨਾਮ ___ ਹੈ","ਮੈਂ ___ ਤੋਂ ਹਾਂ","ਕਿਦਾਂ"], correct: 1 },
          { type: "choose", question: "What does 'ਹੌਲੀ ਬੋਲੋ' mean?", options: ["Say again","Speak slowly","I understood","A little bit"], correct: 1 },
          { type: "match", question: "Match the phrases", pairs: [["ਹਾਂ","Yes"],["ਨਹੀਂ","No"],["ਥੋੜੀ ਜਿਹੀ","A little bit"],["ਦੁਬਾਰਾ ਕਹੋ","Say again"]] },
        ]
      })
    },
    // ── UNIT 3: Numbers ──
    {
      unit_id: u(3), title: "Numbers 1–20", title_punjabi: "ਅੰਕ ੧-੨੦", description: "Learn to count from 1 to 20 in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Gurmukhi has its own numeral system. Learning numbers is essential for shopping, telling time, and daily conversations.",
        items: [
          { gurmukhi: "੧ - ਇੱਕ", romanized: "ikk", english: "1 - one", audio: "one" },
          { gurmukhi: "੨ - ਦੋ", romanized: "do", english: "2 - two", audio: "two" },
          { gurmukhi: "੩ - ਤਿੰਨ", romanized: "tinn", english: "3 - three", audio: "three" },
          { gurmukhi: "੪ - ਚਾਰ", romanized: "chaar", english: "4 - four", audio: "four" },
          { gurmukhi: "੫ - ਪੰਜ", romanized: "panj", english: "5 - five", audio: "five" },
          { gurmukhi: "੬ - ਛੇ", romanized: "chhe", english: "6 - six", audio: "six" },
          { gurmukhi: "੭ - ਸੱਤ", romanized: "satt", english: "7 - seven", audio: "seven" },
          { gurmukhi: "੮ - ਅੱਠ", romanized: "atth", english: "8 - eight", audio: "eight" },
          { gurmukhi: "੯ - ਨੌਂ", romanized: "nauN", english: "9 - nine", audio: "nine" },
          { gurmukhi: "੧੦ - ਦਸ", romanized: "das", english: "10 - ten", audio: "ten" },
          { gurmukhi: "੧੧ - ਗਿਆਰਾਂ", romanized: "gyaaraan", english: "11 - eleven", audio: "eleven" },
          { gurmukhi: "੧੨ - ਬਾਰਾਂ", romanized: "baaraan", english: "12 - twelve", audio: "twelve" },
          { gurmukhi: "੧੩ - ਤੇਰਾਂ", romanized: "teraan", english: "13 - thirteen", audio: "thirteen" },
          { gurmukhi: "੧੪ - ਚੌਦਾਂ", romanized: "chaudaan", english: "14 - fourteen", audio: "fourteen" },
          { gurmukhi: "੧੫ - ਪੰਦਰਾਂ", romanized: "pandraan", english: "15 - fifteen", audio: "fifteen" },
          { gurmukhi: "੧੬ - ਸੋਲਾਂ", romanized: "solaan", english: "16 - sixteen", audio: "sixteen" },
          { gurmukhi: "੧੭ - ਸਤਾਰਾਂ", romanized: "sataaraan", english: "17 - seventeen", audio: "seventeen" },
          { gurmukhi: "੧੮ - ਅਠਾਰਾਂ", romanized: "athaaraan", english: "18 - eighteen", audio: "eighteen" },
          { gurmukhi: "੧੯ - ਉੱਨੀ", romanized: "unni", english: "19 - nineteen", audio: "nineteen" },
          { gurmukhi: "੨੦ - ਵੀਹ", romanized: "veeh", english: "20 - twenty", audio: "twenty" },
        ],
        exercises: [
          { type: "choose", question: "What is ੫ in Punjabi?", options: ["ਤਿੰਨ","ਪੰਜ","ਸੱਤ","ਦਸ"], correct: 1 },
          { type: "choose", question: "What is ੧੫ in Punjabi?", options: ["ਸੋਲਾਂ","ਚੌਦਾਂ","ਪੰਦਰਾਂ","ਤੇਰਾਂ"], correct: 2 },
          { type: "match", question: "Match numbers", pairs: [["੧","ikk"],["੩","tinn"],["੫","panj"],["੭","satt"]] },
        ]
      })
    },
    {
      unit_id: u(3), title: "Numbers 20–100", title_punjabi: "ਅੰਕ ੨੦-੧੦੦", description: "Count larger numbers and learn the pattern",
      order: 2, type: "vocabulary",
      content: JSON.stringify({
        intro: "Punjabi numbers above 20 follow patterns. Learning the tens gives you the building blocks for any number up to 100.",
        items: [
          { gurmukhi: "੨੧ - ਇੱਕੀ", romanized: "ikki", english: "21 - twenty-one", audio: "twenty-one" },
          { gurmukhi: "੨੫ - ਪੱਚੀ", romanized: "pachchi", english: "25 - twenty-five", audio: "twenty-five" },
          { gurmukhi: "੩੦ - ਤੀਹ", romanized: "teeh", english: "30 - thirty", audio: "thirty" },
          { gurmukhi: "੩੫ - ਪੈਂਤੀ", romanized: "paintee", english: "35 - thirty-five", audio: "thirty-five" },
          { gurmukhi: "੪੦ - ਚਾਲੀ", romanized: "chaali", english: "40 - forty", audio: "forty" },
          { gurmukhi: "੪੫ - ਪੈਂਤਾਲੀ", romanized: "paintaali", english: "45 - forty-five", audio: "forty-five" },
          { gurmukhi: "੫੦ - ਪੰਜਾਹ", romanized: "panjaah", english: "50 - fifty", audio: "fifty" },
          { gurmukhi: "੬੦ - ਸੱਠ", romanized: "satth", english: "60 - sixty", audio: "sixty" },
          { gurmukhi: "੭੦ - ਸੱਤਰ", romanized: "sattar", english: "70 - seventy", audio: "seventy" },
          { gurmukhi: "੮੦ - ਅੱਸੀ", romanized: "assi", english: "80 - eighty", audio: "eighty" },
          { gurmukhi: "੯੦ - ਨੱਬੇ", romanized: "nabbe", english: "90 - ninety", audio: "ninety" },
          { gurmukhi: "੧੦੦ - ਸੌ", romanized: "sau", english: "100 - hundred", audio: "hundred" },
        ],
        exercises: [
          { type: "choose", question: "What is ੫੦ in Punjabi?", options: ["ਤੀਹ","ਪੰਜਾਹ","ਸੱਠ","ਸੌ"], correct: 1 },
          { type: "choose", question: "What is ੧੦੦ in Punjabi?", options: ["ਨੱਬੇ","ਅੱਸੀ","ਸੱਤਰ","ਸੌ"], correct: 3 },
          { type: "match", question: "Match the numbers", pairs: [["੩੦","teeh"],["੫੦","panjaah"],["੭੦","sattar"],["੧੦੦","sau"]] },
        ]
      })
    },
    // ── UNIT 4: Colours ──
    {
      unit_id: u(4), title: "Basic Colours", title_punjabi: "ਮੂਲ ਰੰਗ", description: "Learn the core colours in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Colours are used constantly in daily conversation. In Punjabi, colour adjectives usually follow the noun they describe.",
        items: [
          { gurmukhi: "ਲਾਲ", romanized: "laal", english: "Red", audio: "laal" },
          { gurmukhi: "ਨੀਲਾ", romanized: "neela", english: "Blue", audio: "neela" },
          { gurmukhi: "ਪੀਲਾ", romanized: "peela", english: "Yellow", audio: "peela" },
          { gurmukhi: "ਹਰਾ", romanized: "haraa", english: "Green", audio: "haraa" },
          { gurmukhi: "ਸੰਤਰੀ", romanized: "santari", english: "Orange", audio: "santari" },
          { gurmukhi: "ਜਾਮਣੀ", romanized: "jaamni", english: "Purple", audio: "jaamni" },
          { gurmukhi: "ਗੁਲਾਬੀ", romanized: "gulaabi", english: "Pink", audio: "gulaabi" },
          { gurmukhi: "ਭੂਰਾ", romanized: "bhoora", english: "Brown", audio: "bhoora" },
          { gurmukhi: "ਕਾਲਾ", romanized: "kaala", english: "Black", audio: "kaala" },
          { gurmukhi: "ਚਿੱਟਾ", romanized: "chitta", english: "White", audio: "chitta" },
          { gurmukhi: "ਸਲੇਟੀ", romanized: "sleti", english: "Grey", audio: "sleti" },
          { gurmukhi: "ਸੋਨੇ ਰੰਗਾ", romanized: "sone ranga", english: "Golden", audio: "sone ranga" },
        ],
        exercises: [
          { type: "choose", question: "What colour is ਲਾਲ?", options: ["Blue","Green","Red","Yellow"], correct: 2 },
          { type: "choose", question: "How do you say 'White' in Punjabi?", options: ["ਕਾਲਾ","ਚਿੱਟਾ","ਸਲੇਟੀ","ਭੂਰਾ"], correct: 1 },
          { type: "match", question: "Match colours", pairs: [["ਲਾਲ","Red"],["ਨੀਲਾ","Blue"],["ਹਰਾ","Green"],["ਕਾਲਾ","Black"]] },
        ]
      })
    },
    // ── UNIT 5: Directions & Places ──
    {
      unit_id: u(5), title: "Directions", title_punjabi: "ਦਿਸ਼ਾਵਾਂ", description: "Ask for and give directions in Punjabi",
      order: 1, type: "phrases",
      content: JSON.stringify({
        intro: "Knowing how to ask for directions is vital for travel. Punjabi directions use cardinal points and relative position.",
        items: [
          { gurmukhi: "ਸੱਜੇ", romanized: "sajje", english: "Right", audio: "sajje" },
          { gurmukhi: "ਖੱਬੇ", romanized: "khabbe", english: "Left", audio: "khabbe" },
          { gurmukhi: "ਸਿੱਧੇ", romanized: "sidhe", english: "Straight ahead", audio: "sidhe" },
          { gurmukhi: "ਪਿੱਛੇ", romanized: "pichhe", english: "Behind / Back", audio: "pichhe" },
          { gurmukhi: "ਉੱਥੇ", romanized: "uthe", english: "There", audio: "uthe" },
          { gurmukhi: "ਇੱਥੇ", romanized: "ithe", english: "Here", audio: "ithe" },
          { gurmukhi: "ਨੇੜੇ", romanized: "nere", english: "Near / Close", audio: "nere" },
          { gurmukhi: "ਦੂਰ", romanized: "door", english: "Far", audio: "door" },
          { gurmukhi: "ਉੱਪਰ", romanized: "upar", english: "Up / Above", audio: "upar" },
          { gurmukhi: "ਹੇਠਾਂ", romanized: "hethaan", english: "Down / Below", audio: "hethaan" },
          { gurmukhi: "___ ਕਿੱਥੇ ਹੈ?", romanized: "___ kithe hai?", english: "Where is ___?", audio: "kithe hai" },
          { gurmukhi: "ਮੈਨੂੰ ਰਾਹ ਦੱਸੋ", romanized: "Mainu raah dasso", english: "Please show me the way", audio: "raah dasso" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Right' in Punjabi?", options: ["ਖੱਬੇ","ਸਿੱਧੇ","ਸੱਜੇ","ਪਿੱਛੇ"], correct: 2 },
          { type: "choose", question: "What does 'ਦੂਰ' mean?", options: ["Near","Here","Far","There"], correct: 2 },
          { type: "match", question: "Match directions", pairs: [["ਸੱਜੇ","Right"],["ਖੱਬੇ","Left"],["ਨੇੜੇ","Near"],["ਦੂਰ","Far"]] },
        ]
      })
    },
    // ── UNIT 6: Emotions ──
    {
      unit_id: u(6), title: "Emotions & Feelings", title_punjabi: "ਭਾਵਨਾਵਾਂ", description: "Express your feelings in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Expressing emotions is central to meaningful conversation. Punjabi has rich vocabulary for feelings rooted in cultural values.",
        items: [
          { gurmukhi: "ਖੁਸ਼", romanized: "khush", english: "Happy", audio: "khush" },
          { gurmukhi: "ਉਦਾਸ", romanized: "udaas", english: "Sad", audio: "udaas" },
          { gurmukhi: "ਗੁੱਸੇ ਵਿੱਚ", romanized: "gusse vich", english: "Angry", audio: "gusse vich" },
          { gurmukhi: "ਡਰਿਆ", romanized: "dariya", english: "Scared / Afraid", audio: "dariya" },
          { gurmukhi: "ਥੱਕਿਆ", romanized: "thakiya", english: "Tired", audio: "thakiya" },
          { gurmukhi: "ਹੈਰਾਨ", romanized: "hairan", english: "Surprised", audio: "hairan" },
          { gurmukhi: "ਭੁੱਖਾ", romanized: "bhooka", english: "Hungry", audio: "bhooka" },
          { gurmukhi: "ਪਿਆਸਾ", romanized: "pyaasa", english: "Thirsty", audio: "pyaasa" },
          { gurmukhi: "ਖੁਸ਼ੀ", romanized: "khushi", english: "Joy / Happiness", audio: "khushi" },
          { gurmukhi: "ਪਿਆਰ", romanized: "pyaar", english: "Love", audio: "pyaar" },
          { gurmukhi: "ਮੈਂ ਖੁਸ਼ ਹਾਂ", romanized: "Mai khush haan", english: "I am happy", audio: "mai khush haan" },
          { gurmukhi: "ਮੈਂ ਥੱਕਿਆ ਹਾਂ", romanized: "Mai thakiya haan", english: "I am tired", audio: "mai thakiya haan" },
        ],
        exercises: [
          { type: "choose", question: "What does ਖੁਸ਼ mean?", options: ["Sad","Angry","Happy","Tired"], correct: 2 },
          { type: "choose", question: "How do you say 'I am tired'?", options: ["ਮੈਂ ਖੁਸ਼ ਹਾਂ","ਮੈਂ ਉਦਾਸ ਹਾਂ","ਮੈਂ ਥੱਕਿਆ ਹਾਂ","ਮੈਂ ਡਰਿਆ ਹਾਂ"], correct: 2 },
          { type: "match", question: "Match emotions", pairs: [["ਖੁਸ਼","Happy"],["ਉਦਾਸ","Sad"],["ਥੱਕਿਆ","Tired"],["ਪਿਆਰ","Love"]] },
        ]
      })
    },
    // ── UNIT 7: Family ──
    {
      unit_id: u(7), title: "Family Members", title_punjabi: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ", description: "Names for family relationships in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Punjabi has specific words for every family relationship. Unlike English, Punjabi distinguishes paternal and maternal relatives with different terms.",
        items: [
          { gurmukhi: "ਮਾਂ", romanized: "maan", english: "Mother", audio: "maan" },
          { gurmukhi: "ਪਿਤਾ", romanized: "pita", english: "Father", audio: "pita" },
          { gurmukhi: "ਭਰਾ", romanized: "bhraa", english: "Brother", audio: "bhraa" },
          { gurmukhi: "ਭੈਣ", romanized: "bhain", english: "Sister", audio: "bhain" },
          { gurmukhi: "ਦਾਦਾ", romanized: "daada", english: "Paternal Grandfather", audio: "daada" },
          { gurmukhi: "ਦਾਦੀ", romanized: "daadi", english: "Paternal Grandmother", audio: "daadi" },
          { gurmukhi: "ਨਾਨਾ", romanized: "naana", english: "Maternal Grandfather", audio: "naana" },
          { gurmukhi: "ਨਾਨੀ", romanized: "naani", english: "Maternal Grandmother", audio: "naani" },
          { gurmukhi: "ਚਾਚਾ", romanized: "chacha", english: "Paternal Uncle", audio: "chacha" },
          { gurmukhi: "ਮਾਮਾ", romanized: "mama", english: "Maternal Uncle", audio: "mama" },
          { gurmukhi: "ਪੁੱਤਰ", romanized: "puttar", english: "Son", audio: "puttar" },
          { gurmukhi: "ਧੀ", romanized: "dhi", english: "Daughter", audio: "dhi" },
        ],
        exercises: [
          { type: "choose", question: "What is 'ਮਾਂ' in English?", options: ["Father","Sister","Mother","Brother"], correct: 2 },
          { type: "choose", question: "What does 'ਦਾਦਾ' mean?", options: ["Maternal Grandfather","Father","Paternal Grandfather","Uncle"], correct: 2 },
          { type: "match", question: "Match family members", pairs: [["ਮਾਂ","Mother"],["ਪਿਤਾ","Father"],["ਭਰਾ","Brother"],["ਭੈਣ","Sister"]] },
        ]
      })
    },
    // ── UNIT 8: Food ──
    {
      unit_id: u(8), title: "Punjabi Food & Dishes", title_punjabi: "ਪੰਜਾਬੀ ਖਾਣੇ", description: "Vocabulary for popular Punjabi foods",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Punjabi cuisine is world-famous. Learning food vocabulary lets you order at restaurants and discuss one of the most beloved cultures in the world.",
        items: [
          { gurmukhi: "ਰੋਟੀ", romanized: "roti", english: "Flatbread / Chapati", audio: "roti" },
          { gurmukhi: "ਦਾਲ", romanized: "daal", english: "Lentil dish", audio: "daal" },
          { gurmukhi: "ਸਬਜ਼ੀ", romanized: "sabzi", english: "Vegetable dish", audio: "sabzi" },
          { gurmukhi: "ਚਾਵਲ", romanized: "chaaval", english: "Rice", audio: "chaaval" },
          { gurmukhi: "ਪਾਣੀ", romanized: "paani", english: "Water", audio: "paani" },
          { gurmukhi: "ਦੁੱਧ", romanized: "dudh", english: "Milk", audio: "dudh" },
          { gurmukhi: "ਚਾਹ", romanized: "chai", english: "Tea", audio: "chai" },
          { gurmukhi: "ਲੱਸੀ", romanized: "lassi", english: "Yogurt drink", audio: "lassi" },
          { gurmukhi: "ਮੱਖਣ", romanized: "makkhan", english: "Butter", audio: "makkhan" },
          { gurmukhi: "ਸਰੋਂ ਦਾ ਸਾਗ", romanized: "saroon da saag", english: "Mustard greens curry", audio: "saroon da saag" },
          { gurmukhi: "ਮੱਕੀ ਦੀ ਰੋਟੀ", romanized: "makki di roti", english: "Corn flatbread", audio: "makki di roti" },
          { gurmukhi: "ਖਾਣਾ ਦਿਓ", romanized: "khaana deo", english: "Please give food / Serve food", audio: "khaana deo" },
        ],
        exercises: [
          { type: "choose", question: "What is 'ਪਾਣੀ'?", options: ["Tea","Milk","Water","Juice"], correct: 2 },
          { type: "choose", question: "What does 'ਲੱਸੀ' mean?", options: ["Butter","Rice","Yogurt drink","Flatbread"], correct: 2 },
          { type: "match", question: "Match food words", pairs: [["ਰੋਟੀ","Flatbread"],["ਦਾਲ","Lentils"],["ਚਾਹ","Tea"],["ਪਾਣੀ","Water"]] },
        ]
      })
    },
  ];

  const { data: insertedLessons, error: lessonError } = await db.from('lessons').insert(lessonsData).select();
  if (lessonError) { console.error('[Seed] Lesson insert error:', lessonError); return; }
  console.log(`[Seed] Inserted ${insertedLessons?.length} lessons`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed data on startup
  try {
    await seedData();
  } catch (e) {
    console.error('[Seed] Error during seeding:', e);
  }

  // Units
  app.get("/api/units", async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const unit = await storage.getUnit(parseInt(req.params.id));
      if (!unit) return res.status(404).json({ message: "Unit not found" });
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unit" });
    }
  });

  // Lessons
  app.get("/api/units/:id/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByUnit(parseInt(req.params.id));
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(parseInt(req.params.id));
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Progress
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progress = await storage.upsertProgress(req.body);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  // Chat
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const message = await storage.addChatMessage(req.body);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to save message" });
    }
  });

  app.delete("/api/chat", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
