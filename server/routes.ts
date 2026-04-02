import type { Express } from "express";
import { type Server } from "http";
import { storage, db } from "./storage";
import { units, lessons, userProgress, chatMessages } from "@shared/schema";

function seedData() {
  const existingUnits = db.select().from(units).all();
  if (existingUnits.length > 0) return;

  // Seed units
  const unitData = [
    { title: "Gurmukhi Script", titlePunjabi: "ਗੁਰਮੁਖੀ ਲਿਪੀ", description: "Master the Gurmukhi alphabet — the foundation of written Punjabi", icon: "pen-tool", order: 1, color: "amber" },
    { title: "Common Phrases & Greetings", titlePunjabi: "ਆਮ ਵਾਕਾਂਸ਼", description: "Essential greetings, introductions, and everyday phrases with 15+ expressions", icon: "hand-metal", order: 2, color: "emerald" },
    { title: "Numbers 1–100", titlePunjabi: "ਅੰਕ ੧-੧੦੦", description: "Count from 1 to 100, tell time, and discuss dates in Punjabi", icon: "hash", order: 3, color: "blue" },
    { title: "Colours", titlePunjabi: "ਰੰਗ", description: "Learn all the colours in Punjabi with vocabulary and quizzes", icon: "palette", order: 4, color: "purple" },
    { title: "Directions & Places", titlePunjabi: "ਦਿਸ਼ਾਵਾਂ ਅਤੇ ਥਾਵਾਂ", description: "Navigate places, ask for directions, and transportation vocabulary", icon: "map-pin", order: 5, color: "teal" },
    { title: "Emotions & Feelings", titlePunjabi: "ਭਾਵਨਾਵਾਂ", description: "Express how you feel in Punjabi — emotions, moods, and states of mind", icon: "heart", order: 6, color: "orange" },
    { title: "Family & People", titlePunjabi: "ਪਰਿਵਾਰ", description: "Talk about family members, relationships, and describing people", icon: "users", order: 7, color: "amber" },
    { title: "Food & Dining", titlePunjabi: "ਖਾਣਾ", description: "Order food, discuss Punjabi cuisine, and cooking vocabulary", icon: "utensils", order: 8, color: "orange" },
  ];

  for (const u of unitData) {
    db.insert(units).values(u).run();
  }

  // ── UNIT 1: Gurmukhi Script ──────────────────────────────────────────────
  const unit1Lessons = [
    {
      unitId: 1, title: "Vowels (Lagaan Maatraa)", titlePunjabi: "ਲਗਾਂ ਮਾਤਰਾ", description: "Learn the 10 Punjabi vowels and their sounds",
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
      unitId: 1, title: "Consonants Row 1-2", titlePunjabi: "ਵਿਅੰਜਨ", description: "First 10 consonants of the Gurmukhi alphabet",
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
      unitId: 1, title: "Consonants Row 3-5", titlePunjabi: "ਵਿਅੰਜਨ ਭਾਗ ੨", description: "Continue with the remaining consonant rows",
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
      unitId: 1, title: "Writing Practice", titlePunjabi: "ਲਿਖਣ ਅਭਿਆਸ", description: "Practice writing Gurmukhi characters step by step",
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
  ];

  // ── UNIT 2: Common Phrases & Greetings (15+ words each lesson) ────────────
  const unit2Lessons = [
    {
      unitId: 2, title: "Everyday Greetings", titlePunjabi: "ਰੋਜ਼ਾਨਾ ਸ਼ੁਭ ਇੱਛਾਵਾਂ", description: "Say hello, goodbye, and daily courtesies",
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
      unitId: 2, title: "Introducing Yourself", titlePunjabi: "ਆਪਣੀ ਜਾਣ-ਪਛਾਣ", description: "Tell people your name, where you're from, and what you do",
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
  ];

  // ── UNIT 3: Numbers 1–100 ─────────────────────────────────────────────────
  const unit3Lessons = [
    {
      unitId: 3, title: "Numbers 1–20", titlePunjabi: "ਅੰਕ ੧-੨੦", description: "Learn to count from 1 to 20 in Punjabi",
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
      unitId: 3, title: "Numbers 20–100", titlePunjabi: "ਅੰਕ ੨੦-੧੦੦", description: "Count larger numbers and learn the pattern",
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
    {
      unitId: 3, title: "Telling Time", titlePunjabi: "ਸਮਾਂ ਦੱਸਣਾ", description: "Ask and tell the time in Punjabi",
      order: 3, type: "phrases",
      content: JSON.stringify({
        intro: "Telling time in Punjabi uses 'ਵਜੇ' (vaje) meaning 'o'clock'. The pattern is: number + ਵਜੇ + ਹਨ.",
        items: [
          { gurmukhi: "ਕਿੰਨੇ ਵਜੇ ਹਨ?", romanized: "Kinne vaje han?", english: "What time is it?", audio: "what time" },
          { gurmukhi: "ਇੱਕ ਵਜਿਆ ਹੈ", romanized: "Ikk vajia hai", english: "It's 1 o'clock", audio: "one oclock" },
          { gurmukhi: "ਪੰਜ ਵਜੇ ਹਨ", romanized: "Panj vaje han", english: "It's 5 o'clock", audio: "five oclock" },
          { gurmukhi: "ਸਵੇਰੇ", romanized: "Savere", english: "In the morning", audio: "morning" },
          { gurmukhi: "ਦੁਪਹਿਰੇ", romanized: "Dupahire", english: "In the afternoon", audio: "afternoon" },
          { gurmukhi: "ਸ਼ਾਮ ਨੂੰ", romanized: "Shaam nu", english: "In the evening", audio: "evening" },
          { gurmukhi: "ਰਾਤ ਨੂੰ", romanized: "Raat nu", english: "At night", audio: "night" },
        ],
        exercises: [
          { type: "choose", question: "How do you ask 'What time is it?'", options: ["ਕਿੰਨੇ ਵਜੇ ਹਨ?","ਕਿਦਾਂ?","ਕੀ ਹਾਲ ਹੈ?","ਕਿੱਥੇ?"], correct: 0 },
          { type: "match", question: "Match time words", pairs: [["ਸਵੇਰੇ","Morning"],["ਦੁਪਹਿਰੇ","Afternoon"],["ਸ਼ਾਮ ਨੂੰ","Evening"],["ਰਾਤ ਨੂੰ","Night"]] },
        ]
      })
    },
  ];

  // ── UNIT 4: Colours ───────────────────────────────────────────────────────
  const unit4Lessons = [
    {
      unitId: 4, title: "Basic Colours", titlePunjabi: "ਮੁੱਖ ਰੰਗ", description: "Learn the core colours in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Colours (ਰੰਗ — rang) are used in everyday speech, describing clothes, food, and surroundings. In Punjabi, colour adjectives agree with the gender of the noun.",
        items: [
          { gurmukhi: "ਲਾਲ", romanized: "laal", english: "Red", audio: "laal" },
          { gurmukhi: "ਨੀਲਾ", romanized: "neela", english: "Blue", audio: "neela" },
          { gurmukhi: "ਪੀਲਾ", romanized: "peela", english: "Yellow", audio: "peela" },
          { gurmukhi: "ਹਰਾ", romanized: "hara", english: "Green", audio: "hara" },
          { gurmukhi: "ਸੰਤਰੀ", romanized: "santri", english: "Orange", audio: "santri" },
          { gurmukhi: "ਜਾਮਣੀ", romanized: "jaamni", english: "Purple", audio: "jaamni" },
          { gurmukhi: "ਗੁਲਾਬੀ", romanized: "gulaabi", english: "Pink", audio: "gulaabi" },
          { gurmukhi: "ਭੂਰਾ", romanized: "bhoora", english: "Brown", audio: "bhoora" },
          { gurmukhi: "ਚਿੱਟਾ", romanized: "chitta", english: "White", audio: "chitta" },
          { gurmukhi: "ਕਾਲਾ", romanized: "kaala", english: "Black", audio: "kaala" },
          { gurmukhi: "ਸਲੇਟੀ", romanized: "sleti", english: "Grey", audio: "sleti" },
          { gurmukhi: "ਸੋਨੇ ਰੰਗਾ", romanized: "sone ranga", english: "Golden", audio: "sone ranga" },
          { gurmukhi: "ਚਾਂਦੀ ਰੰਗਾ", romanized: "chaandi ranga", english: "Silver", audio: "chaandi ranga" },
          { gurmukhi: "ਅਸਮਾਨੀ", romanized: "asmaani", english: "Sky blue", audio: "asmaani" },
          { gurmukhi: "ਗੂੜ੍ਹਾ ਨੀਲਾ", romanized: "goorha neela", english: "Dark blue / Navy", audio: "goorha neela" },
          { gurmukhi: "ਹਲਕਾ ਹਰਾ", romanized: "halka hara", english: "Light green", audio: "halka hara" },
        ],
        exercises: [
          { type: "choose", question: "What colour is 'ਲਾਲ'?", options: ["Blue","Green","Red","Yellow"], correct: 2 },
          { type: "choose", question: "How do you say 'Black' in Punjabi?", options: ["ਚਿੱਟਾ","ਕਾਲਾ","ਸਲੇਟੀ","ਭੂਰਾ"], correct: 1 },
          { type: "choose", question: "What does 'ਗੁਲਾਬੀ' mean?", options: ["Purple","Orange","Pink","Brown"], correct: 2 },
          { type: "match", question: "Match colours", pairs: [["ਲਾਲ","Red"],["ਨੀਲਾ","Blue"],["ਹਰਾ","Green"],["ਪੀਲਾ","Yellow"]] },
        ]
      })
    },
    {
      unitId: 4, title: "Colours in Context", titlePunjabi: "ਰੰਗਾਂ ਦੀ ਵਰਤੋਂ", description: "Use colours to describe clothes and objects",
      order: 2, type: "phrases",
      content: JSON.stringify({
        intro: "Now let's use colours in sentences. Remember: colour adjectives change ending based on the noun's gender (ਨੀਲਾ ਕਮੀਜ਼ for male noun, ਨੀਲੀ ਕੁੜਤੀ for female noun).",
        items: [
          { gurmukhi: "ਮੇਰਾ ਕਮਰਾ ਨੀਲਾ ਹੈ", romanized: "Mera kamra neela hai", english: "My room is blue", audio: "neela kamra" },
          { gurmukhi: "ਇਹ ਕੀ ਰੰਗ ਹੈ?", romanized: "Ih ki rang hai?", english: "What colour is this?", audio: "ki rang hai" },
          { gurmukhi: "ਮੈਨੂੰ ਲਾਲ ਰੰਗ ਪਸੰਦ ਹੈ", romanized: "Mainu laal rang pasand hai", english: "I like the colour red", audio: "laal pasand" },
          { gurmukhi: "ਤੇਰਾ ਮਨਪਸੰਦ ਰੰਗ ਕੀ ਹੈ?", romanized: "Tera manpasand rang ki hai?", english: "What is your favourite colour?", audio: "manpasand rang" },
          { gurmukhi: "ਇਹ ਕਮੀਜ਼ ਹਰੀ ਹੈ", romanized: "Ih kamiz hari hai", english: "This shirt is green", audio: "hari kamiz" },
          { gurmukhi: "ਗੂੜ੍ਹਾ ਰੰਗ", romanized: "Goorha rang", english: "Dark colour", audio: "goorha rang" },
          { gurmukhi: "ਹਲਕਾ ਰੰਗ", romanized: "Halka rang", english: "Light colour", audio: "halka rang" },
        ],
        exercises: [
          { type: "choose", question: "How do you ask 'What colour is this?'", options: ["ਇਹ ਕੀ ਰੰਗ ਹੈ?","ਮੈਨੂੰ ਰੰਗ ਪਸੰਦ ਹੈ","ਤੇਰਾ ਰੰਗ ਕੀ ਹੈ?","ਇਹ ਕਮੀਜ਼ ਹੈ"], correct: 0 },
          { type: "match", question: "Match colour phrases", pairs: [["ਗੂੜ੍ਹਾ ਰੰਗ","Dark colour"],["ਹਲਕਾ ਰੰਗ","Light colour"],["ਲਾਲ ਰੰਗ","Red colour"],["ਹਰਾ ਰੰਗ","Green colour"]] },
        ]
      })
    },
  ];

  // ── UNIT 5: Directions & Places ───────────────────────────────────────────
  const unit5Lessons = [
    {
      unitId: 5, title: "Directions", titlePunjabi: "ਦਿਸ਼ਾਵਾਂ", description: "Ask for and give directions in Punjabi",
      order: 1, type: "phrases",
      content: JSON.stringify({
        intro: "Whether navigating the busy streets of Amritsar or your local area, these direction phrases will help you get around confidently.",
        items: [
          { gurmukhi: "ਕਿੱਥੇ?", romanized: "Kitthe?", english: "Where?", audio: "kitthe" },
          { gurmukhi: "___ ਕਿੱਥੇ ਹੈ?", romanized: "___ kitthe hai?", english: "Where is ___?", audio: "kitthe hai" },
          { gurmukhi: "ਸੱਜੇ", romanized: "Sajje", english: "Right", audio: "sajje" },
          { gurmukhi: "ਖੱਬੇ", romanized: "Khabbe", english: "Left", audio: "khabbe" },
          { gurmukhi: "ਸਿੱਧਾ", romanized: "Siddha", english: "Straight ahead", audio: "siddha" },
          { gurmukhi: "ਪਿੱਛੇ", romanized: "Pichhe", english: "Behind / Back", audio: "pichhe" },
          { gurmukhi: "ਅੱਗੇ", romanized: "Agge", english: "Forward / Ahead", audio: "agge" },
          { gurmukhi: "ਨੇੜੇ", romanized: "Nere", english: "Near / Close", audio: "nere" },
          { gurmukhi: "ਦੂਰ", romanized: "Door", english: "Far", audio: "door" },
          { gurmukhi: "ਉੱਪਰ", romanized: "Upar", english: "Up / Above", audio: "upar" },
          { gurmukhi: "ਹੇਠਾਂ", romanized: "Hethaan", english: "Down / Below", audio: "hethaan" },
          { gurmukhi: "ਮੁੜੋ", romanized: "Muro", english: "Turn", audio: "muro" },
          { gurmukhi: "ਰੁਕੋ", romanized: "Ruko", english: "Stop", audio: "ruko" },
          { gurmukhi: "ਕਿੰਨੀ ਦੂਰ ਹੈ?", romanized: "Kinni door hai?", english: "How far is it?", audio: "kinni door" },
          { gurmukhi: "ਬਹੁਤ ਨੇੜੇ ਹੈ", romanized: "Bahut nere hai", english: "It's very close", audio: "bahut nere" },
          { gurmukhi: "ਬੱਸ ਅੱਡਾ", romanized: "Bass adda", english: "Bus station", audio: "bass adda" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Where?' in Punjabi?", options: ["ਕੀ?","ਕਿੱਥੇ?","ਕਦੋਂ?","ਕਿਉਂ?"], correct: 1 },
          { type: "choose", question: "What does 'ਸਿੱਧਾ' mean?", options: ["Left","Right","Straight ahead","Behind"], correct: 2 },
          { type: "choose", question: "How do you say 'How far is it?'", options: ["ਕਿੱਥੇ ਹੈ?","ਕਿੰਨੀ ਦੂਰ ਹੈ?","ਨੇੜੇ ਹੈ?","ਦੂਰ ਹੈ?"], correct: 1 },
          { type: "match", question: "Match directions", pairs: [["ਸੱਜੇ","Right"],["ਖੱਬੇ","Left"],["ਅੱਗੇ","Forward"],["ਨੇੜੇ","Near"]] },
        ]
      })
    },
    {
      unitId: 5, title: "Places & Landmarks", titlePunjabi: "ਥਾਵਾਂ", description: "Important places and buildings",
      order: 2, type: "vocabulary",
      content: JSON.stringify({
        intro: "Whether visiting Punjab or navigating a Punjabi neighbourhood, knowing place names is essential for getting around.",
        items: [
          { gurmukhi: "ਗੁਰਦੁਆਰਾ", romanized: "Gurdwara", english: "Sikh temple", audio: "gurdwara" },
          { gurmukhi: "ਬਜ਼ਾਰ", romanized: "Bazaar", english: "Market", audio: "bazaar" },
          { gurmukhi: "ਹਸਪਤਾਲ", romanized: "Haspataal", english: "Hospital", audio: "haspataal" },
          { gurmukhi: "ਸਕੂਲ", romanized: "Skool", english: "School", audio: "skool" },
          { gurmukhi: "ਕਾਲਜ", romanized: "Kaallaj", english: "College", audio: "kaallaj" },
          { gurmukhi: "ਘਰ", romanized: "Ghar", english: "Home / House", audio: "ghar" },
          { gurmukhi: "ਰੇਲਵੇ ਸਟੇਸ਼ਨ", romanized: "Railway station", english: "Railway station", audio: "railway station" },
          { gurmukhi: "ਹਵਾਈ ਅੱਡਾ", romanized: "Havai adda", english: "Airport", audio: "havai adda" },
          { gurmukhi: "ਦੁਕਾਨ", romanized: "Dukaan", english: "Shop", audio: "dukaan" },
          { gurmukhi: "ਬੈਂਕ", romanized: "Bank", english: "Bank", audio: "bank" },
          { gurmukhi: "ਮਸਜਿਦ", romanized: "Masjid", english: "Mosque", audio: "masjid" },
          { gurmukhi: "ਪਾਰਕ", romanized: "Paark", english: "Park", audio: "paark" },
          { gurmukhi: "ਰੈਸਟੋਰੈਂਟ", romanized: "Restaurant", english: "Restaurant", audio: "restaurant" },
          { gurmukhi: "ਪੁਲਿਸ ਸਟੇਸ਼ਨ", romanized: "Police station", english: "Police station", audio: "police station" },
          { gurmukhi: "ਪੋਸਟ ਆਫਿਸ", romanized: "Post office", english: "Post office", audio: "post office" },
        ],
        exercises: [
          { type: "choose", question: "What is 'ਗੁਰਦੁਆਰਾ'?", options: ["Market","School","Sikh temple","Hospital"], correct: 2 },
          { type: "choose", question: "How do you say 'Airport' in Punjabi?", options: ["ਰੇਲਵੇ ਸਟੇਸ਼ਨ","ਹਵਾਈ ਅੱਡਾ","ਬੱਸ ਅੱਡਾ","ਘਰ"], correct: 1 },
          { type: "match", question: "Match places", pairs: [["ਬਜ਼ਾਰ","Market"],["ਘਰ","Home"],["ਹਵਾਈ ਅੱਡਾ","Airport"],["ਦੁਕਾਨ","Shop"]] },
        ]
      })
    },
    {
      unitId: 5, title: "Emergency Phrases", titlePunjabi: "ਐਮਰਜੈਂਸੀ", description: "Essential phrases for urgent situations",
      order: 3, type: "phrases",
      content: JSON.stringify({
        intro: "These phrases could be crucial when travelling. Knowing how to ask for help in Punjabi can make all the difference.",
        items: [
          { gurmukhi: "ਮਦਦ ਕਰੋ!", romanized: "Madad karo!", english: "Help!", audio: "madad karo" },
          { gurmukhi: "ਮੈਨੂੰ ਡਾਕਟਰ ਚਾਹੀਦਾ ਹੈ", romanized: "Mainu doctor chaahida hai", english: "I need a doctor", audio: "doctor chaahida" },
          { gurmukhi: "ਪੁਲਿਸ ਨੂੰ ਬੁਲਾਓ", romanized: "Police nu bulaao", english: "Call the police", audio: "police bulaao" },
          { gurmukhi: "ਮੈਂ ਗੁਆਚ ਗਿਆ ਹਾਂ", romanized: "Mai guaach gya haan", english: "I am lost (male)", audio: "guaach gya" },
          { gurmukhi: "ਹਸਪਤਾਲ ਕਿੱਥੇ ਹੈ?", romanized: "Haspataal kitthe hai?", english: "Where is the hospital?", audio: "haspataal kitthe" },
          { gurmukhi: "ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਈ", romanized: "Mainu samajh nahi aayi", english: "I don't understand", audio: "samajh nahi" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Help!'?", options: ["ਰੁਕੋ!","ਮਦਦ ਕਰੋ!","ਚੱਲੋ!","ਸੁਣੋ!"], correct: 1 },
          { type: "match", question: "Match emergency phrases", pairs: [["ਮਦਦ ਕਰੋ!","Help!"],["ਮੈਂ ਗੁਆਚ ਗਿਆ ਹਾਂ","I am lost"],["ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਈ","I don't understand"],["ਪੁਲਿਸ ਨੂੰ ਬੁਲਾਓ","Call the police"]] },
        ]
      })
    },
  ];

  // ── UNIT 6: Emotions & Feelings ──────────────────────────────────────────
  const unit6Lessons = [
    {
      unitId: 6, title: "Core Emotions", titlePunjabi: "ਮੁੱਖ ਭਾਵਨਾਵਾਂ", description: "Express basic feelings and emotions in Punjabi",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Expressing emotions (ਭਾਵਨਾਵਾਂ — bhavnaavaan) makes conversations much richer. In Punjabi, 'ਮੈਨੂੰ ___ ਹੈ' (mainu ___ hai) means 'I feel ___'.",
        items: [
          { gurmukhi: "ਖੁਸ਼", romanized: "khush", english: "Happy", audio: "khush" },
          { gurmukhi: "ਉਦਾਸ", romanized: "udaas", english: "Sad", audio: "udaas" },
          { gurmukhi: "ਗੁੱਸਾ", romanized: "gussa", english: "Angry", audio: "gussa" },
          { gurmukhi: "ਡਰ", romanized: "dar", english: "Fear / Scared", audio: "dar" },
          { gurmukhi: "ਪਿਆਰ", romanized: "pyaar", english: "Love", audio: "pyaar" },
          { gurmukhi: "ਨਫ਼ਰਤ", romanized: "nafrat", english: "Hate", audio: "nafrat" },
          { gurmukhi: "ਹੈਰਾਨੀ", romanized: "hairani", english: "Surprise / Amazement", audio: "hairani" },
          { gurmukhi: "ਸ਼ਰਮ", romanized: "sharam", english: "Shame / Embarrassment", audio: "sharam" },
          { gurmukhi: "ਚਿੰਤਾ", romanized: "chinta", english: "Worry / Anxiety", audio: "chinta" },
          { gurmukhi: "ਉਮੀਦ", romanized: "umeed", english: "Hope", audio: "umeed" },
          { gurmukhi: "ਥਕਾਵਟ", romanized: "thakaavat", english: "Tiredness / Fatigue", audio: "thakaavat" },
          { gurmukhi: "ਖੁਸ਼ੀ", romanized: "khushi", english: "Joy / Happiness", audio: "khushi" },
          { gurmukhi: "ਦੁੱਖ", romanized: "dukh", english: "Sorrow / Pain", audio: "dukh" },
          { gurmukhi: "ਈਰਖਾ", romanized: "eerkha", english: "Jealousy / Envy", audio: "eerkha" },
          { gurmukhi: "ਭੁੱਖ", romanized: "bhukh", english: "Hunger", audio: "bhukh" },
          { gurmukhi: "ਪਿਆਸ", romanized: "pyaas", english: "Thirst", audio: "pyaas" },
        ],
        exercises: [
          { type: "choose", question: "What does 'ਖੁਸ਼' mean?", options: ["Sad","Angry","Happy","Tired"], correct: 2 },
          { type: "choose", question: "How do you say 'Worry' in Punjabi?", options: ["ਡਰ","ਚਿੰਤਾ","ਉਦਾਸ","ਸ਼ਰਮ"], correct: 1 },
          { type: "choose", question: "What does 'ਪਿਆਰ' mean?", options: ["Hate","Fear","Hope","Love"], correct: 3 },
          { type: "match", question: "Match emotions", pairs: [["ਖੁਸ਼","Happy"],["ਉਦਾਸ","Sad"],["ਗੁੱਸਾ","Angry"],["ਡਰ","Fear"]] },
        ]
      })
    },
    {
      unitId: 6, title: "Expressing Feelings", titlePunjabi: "ਭਾਵਨਾਵਾਂ ਪ੍ਰਗਟ ਕਰਨਾ", description: "Put emotions into sentences",
      order: 2, type: "phrases",
      content: JSON.stringify({
        intro: "Now let's use emotion words in real sentences. The key structure is 'ਮੈਨੂੰ ___ ਹੈ' (I have/feel ___) or 'ਮੈਂ ___ ਹਾਂ' (I am ___).",
        items: [
          { gurmukhi: "ਮੈਂ ਖੁਸ਼ ਹਾਂ", romanized: "Mai khush haan", english: "I am happy", audio: "mai khush haan" },
          { gurmukhi: "ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ", romanized: "Mainu bhukh laggi hai", english: "I am hungry", audio: "bhukh laggi" },
          { gurmukhi: "ਮੈਨੂੰ ਪਿਆਸ ਲੱਗੀ ਹੈ", romanized: "Mainu pyaas laggi hai", english: "I am thirsty", audio: "pyaas laggi" },
          { gurmukhi: "ਮੈਂ ਥੱਕਿਆ ਹਾਂ", romanized: "Mai thakkya haan", english: "I am tired (male)", audio: "thakkya haan" },
          { gurmukhi: "ਮੈਨੂੰ ਚਿੰਤਾ ਹੈ", romanized: "Mainu chinta hai", english: "I am worried", audio: "chinta hai" },
          { gurmukhi: "ਮੈਂ ਉਦਾਸ ਹਾਂ", romanized: "Mai udaas haan", english: "I am sad", audio: "udaas haan" },
          { gurmukhi: "ਮੈਨੂੰ ਖੁਸ਼ੀ ਹੈ", romanized: "Mainu khushi hai", english: "I am joyful", audio: "khushi hai" },
          { gurmukhi: "ਮੈਂ ਡਰਿਆ ਹਾਂ", romanized: "Mai darya haan", english: "I am scared (male)", audio: "darya haan" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'I am happy'?", options: ["ਮੈਂ ਉਦਾਸ ਹਾਂ","ਮੈਂ ਖੁਸ਼ ਹਾਂ","ਮੈਨੂੰ ਚਿੰਤਾ ਹੈ","ਮੈਂ ਥੱਕਿਆ ਹਾਂ"], correct: 1 },
          { type: "choose", question: "What does 'ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ' mean?", options: ["I am thirsty","I am tired","I am hungry","I am scared"], correct: 2 },
          { type: "match", question: "Match feeling sentences", pairs: [["ਮੈਂ ਖੁਸ਼ ਹਾਂ","I am happy"],["ਮੈਂ ਉਦਾਸ ਹਾਂ","I am sad"],["ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ","I am hungry"],["ਮੈਂ ਥੱਕਿਆ ਹਾਂ","I am tired"]] },
        ]
      })
    },
  ];

  // Insert all lessons
  const allLessons = [...unit1Lessons, ...unit2Lessons, ...unit3Lessons, ...unit4Lessons, ...unit5Lessons, ...unit6Lessons];
  for (const lesson of allLessons) {
    db.insert(lessons).values(lesson).run();
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  seedData();

  app.get("/api/units", async (req, res) => {
    try {
      const allUnits = db.select().from(units).all();
      res.json(allUnits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:unitId/lessons", async (req, res) => {
    try {
      const unitId = parseInt(req.params.unitId);
      const unitLessons = db.select().from(lessons).all().filter(l => l.unitId === unitId);
      res.json(unitLessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const lesson = db.select().from(lessons).all().find(l => l.id === lessonId);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = db.select().from(userProgress).all().filter(p => p.userId === userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const { userId, lessonId, completed, score } = req.body;
      const existing = db.select().from(userProgress).all().find(
        p => p.userId === userId && p.lessonId === lessonId
      );
      if (existing) {
        db.update(userProgress)
          .set({ completed, score, completedAt: new Date().toISOString() })
          .run();
      } else {
        db.insert(userProgress).values({
          userId, lessonId, completed, score,
          completedAt: new Date().toISOString()
        }).run();
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });
}
