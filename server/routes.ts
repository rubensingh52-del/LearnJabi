import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { units, lessons, userProgress, chatMessages } from "@shared/schema";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

function seedData() {
  const existingUnits = db.select().from(units).all();
  if (existingUnits.length > 0) return;

  // Seed units
  const unitData = [
    { title: "Gurmukhi Script", titlePunjabi: "ਗੁਰਮੁਖੀ ਲਿਪੀ", description: "Master the Gurmukhi alphabet — the foundation of written Punjabi", icon: "pen-tool", order: 1, color: "amber" },
    { title: "Greetings & Basics", titlePunjabi: "ਸ਼ੁਭ ਇੱਛਾਵਾਂ", description: "Essential greetings, introductions, and everyday phrases", icon: "hand-metal", order: 2, color: "emerald" },
    { title: "Numbers & Time", titlePunjabi: "ਅੰਕ ਅਤੇ ਸਮਾਂ", description: "Count, tell time, and discuss dates in Punjabi", icon: "hash", order: 3, color: "blue" },
    { title: "Family & People", titlePunjabi: "ਪਰਿਵਾਰ", description: "Talk about family members, relationships, and describing people", icon: "users", order: 4, color: "purple" },
    { title: "Food & Dining", titlePunjabi: "ਖਾਣਾ", description: "Order food, discuss Punjabi cuisine, and cooking vocabulary", icon: "utensils", order: 5, color: "orange" },
    { title: "Travel & Directions", titlePunjabi: "ਯਾਤਰਾ", description: "Navigate places, ask for directions, and transportation vocabulary", icon: "map-pin", order: 6, color: "teal" },
  ];

  for (const u of unitData) {
    db.insert(units).values(u).run();
  }

  // Seed lessons for Unit 1 — Gurmukhi Script
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
        intro: "Gurmukhi has 35 consonants organized in rows of 5. Let's learn the first two rows.",
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
          { gurmukhi: "ੴ", romanized: "ik oankaar", english: "The sacred symbol — 'One God'", audio: "ik oankaar" },
          { gurmukhi: "ਸਤ", romanized: "sat", english: "Truth", audio: "sat" },
          { gurmukhi: "ਨਾਮ", romanized: "naam", english: "Name / Identity", audio: "naam" },
          { gurmukhi: "ਸਿੱਖ", romanized: "sikkh", english: "Sikh / Learner", audio: "sikh" },
          { gurmukhi: "ਪੰਜਾਬ", romanized: "panjaab", english: "Punjab — Land of Five Rivers", audio: "panjaab" },
        ],
        exercises: [
          { type: "choose", question: "What does ਸਤ mean?", options: ["Name","Truth","God","Land"], correct: 1 },
          { type: "choose", question: "What does ਪੰਜਾਬ mean?", options: ["Five Rivers","Holy Land","Punjab","Sacred Place"], correct: 2 },
        ]
      })
    },
  ];

  // Seed lessons for Unit 2 — Greetings
  const unit2Lessons = [
    {
      unitId: 2, title: "Basic Greetings", titlePunjabi: "ਮੁੱਢਲੀਆਂ ਸ਼ੁਭ ਇੱਛਾਵਾਂ", description: "Say hello, goodbye, and basic courtesies",
      order: 1, type: "phrases",
      content: JSON.stringify({
        intro: "Punjabi greetings reflect deep cultural respect. The most common greeting 'Sat Sri Akal' means 'God is the ultimate truth.'",
        items: [
          { gurmukhi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", romanized: "Sat Sri Akal", english: "Hello (lit. God is the ultimate truth)", audio: "greeting" },
          { gurmukhi: "ਕਿਦਾਂ?", romanized: "Kidaan?", english: "How are you? (informal)", audio: "how are you" },
          { gurmukhi: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", romanized: "Tusi kive ho?", english: "How are you? (formal)", audio: "formal how are you" },
          { gurmukhi: "ਮੈਂ ਠੀਕ ਹਾਂ", romanized: "Mai theek haan", english: "I am fine", audio: "i am fine" },
          { gurmukhi: "ਸ਼ੁਕਰੀਆ", romanized: "Shukriya", english: "Thank you", audio: "thank you" },
          { gurmukhi: "ਜੀ ਆਇਆਂ ਨੂੰ", romanized: "Ji aayian nu", english: "Welcome", audio: "welcome" },
          { gurmukhi: "ਅਲਵਿਦਾ", romanized: "Alvida", english: "Goodbye", audio: "goodbye" },
          { gurmukhi: "ਮਾਫ਼ ਕਰਨਾ", romanized: "Maaf karna", english: "Sorry / Excuse me", audio: "sorry" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Hello' in Punjabi?", options: ["ਸ਼ੁਕਰੀਆ","ਸਤ ਸ੍ਰੀ ਅਕਾਲ","ਅਲਵਿਦਾ","ਕਿਦਾਂ"], correct: 1 },
          { type: "choose", question: "What does 'ਸ਼ੁਕਰੀਆ' mean?", options: ["Hello","Sorry","Thank you","Welcome"], correct: 2 },
          { type: "match", question: "Match greetings", pairs: [["ਸ਼ੁਕਰੀਆ","Thank you"],["ਅਲਵਿਦਾ","Goodbye"],["ਕਿਦਾਂ?","How are you?"],["ਜੀ ਆਇਆਂ ਨੂੰ","Welcome"]] },
        ]
      })
    },
    {
      unitId: 2, title: "Introducing Yourself", titlePunjabi: "ਆਪਣੀ ਜਾਣ-ਪਛਾਣ", description: "Tell people your name, where you're from, and what you do",
      order: 2, type: "phrases",
      content: JSON.stringify({
        intro: "Being able to introduce yourself is essential. Punjabi has formal and informal registers — use 'ਤੁਸੀਂ' (tusi) for respect and 'ਤੂੰ' (tu) with close friends.",
        items: [
          { gurmukhi: "ਮੇਰਾ ਨਾਮ ___ ਹੈ", romanized: "Mera naam ___ hai", english: "My name is ___", audio: "my name is" },
          { gurmukhi: "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?", romanized: "Tuhaada naam ki hai?", english: "What is your name? (formal)", audio: "your name formal" },
          { gurmukhi: "ਮੈਂ ___ ਤੋਂ ਹਾਂ", romanized: "Mai ___ to haan", english: "I am from ___", audio: "i am from" },
          { gurmukhi: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ/ਰਹੀ ਹਾਂ", romanized: "Mai Punjabi sikkh riha/rahi haan", english: "I am learning Punjabi", audio: "learning punjabi" },
          { gurmukhi: "ਤੁਸੀਂ ਕੀ ਕੰਮ ਕਰਦੇ ਹੋ?", romanized: "Tusi ki kam karde ho?", english: "What do you do? (work)", audio: "what do you do" },
          { gurmukhi: "ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ", romanized: "Mil ke khushi hoyi", english: "Nice to meet you", audio: "nice to meet" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'My name is' in Punjabi?", options: ["ਤੁਹਾਡਾ ਨਾਮ","ਮੇਰਾ ਨਾਮ ___ ਹੈ","ਮੈਂ ___ ਤੋਂ ਹਾਂ","ਕਿਦਾਂ"], correct: 1 },
          { type: "choose", question: "What does 'ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ' mean?", options: ["Goodbye","Thank you","Nice to meet you","How are you"], correct: 2 },
        ]
      })
    },
    {
      unitId: 2, title: "Politeness & Respect", titlePunjabi: "ਅਦਬ ਅਤੇ ਸਤਿਕਾਰ", description: "Cultural norms around respect in Punjabi language",
      order: 3, type: "culture",
      content: JSON.stringify({
        intro: "Respect is deeply embedded in Punjabi culture. Adding 'ਜੀ' (ji) after someone's name or title shows respect. Elders are always addressed with 'ਤੁਸੀਂ' (tusi), never 'ਤੂੰ' (tu).",
        items: [
          { gurmukhi: "ਜੀ", romanized: "Ji", english: "Respectful suffix (like 'sir/ma'am')", audio: "ji" },
          { gurmukhi: "ਬੀਬੀ ਜੀ", romanized: "Bibi ji", english: "Respected woman / grandmother", audio: "bibi ji" },
          { gurmukhi: "ਭਾਈ ਸਾਹਿਬ", romanized: "Bhai Sahib", english: "Respected brother / sir", audio: "bhai sahib" },
          { gurmukhi: "ਕਿਰਪਾ ਕਰਕੇ", romanized: "Kirpa karke", english: "Please", audio: "please" },
          { gurmukhi: "ਬਹੁਤ ਧੰਨਵਾਦ", romanized: "Bahut dhannvaad", english: "Thank you very much", audio: "thanks a lot" },
          { gurmukhi: "ਕੋਈ ਗੱਲ ਨਹੀਂ", romanized: "Koi gal nahi", english: "No problem / You're welcome", audio: "no problem" },
        ],
        exercises: [
          { type: "choose", question: "What does 'ਜੀ' signify?", options: ["Anger","Respect","Farewell","Question"], correct: 1 },
          { type: "choose", question: "How do you say 'Please' in Punjabi?", options: ["ਸ਼ੁਕਰੀਆ","ਕਿਰਪਾ ਕਰਕੇ","ਅਲਵਿਦਾ","ਕੋਈ ਗੱਲ ਨਹੀਂ"], correct: 1 },
        ]
      })
    },
  ];

  // Seed lessons for Unit 3 — Numbers & Time
  const unit3Lessons = [
    {
      unitId: 3, title: "Numbers 1-20", titlePunjabi: "ਅੰਕ ੧-੨੦", description: "Learn to count from 1 to 20 in Punjabi",
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
        ],
        exercises: [
          { type: "choose", question: "What is ੫ in Punjabi?", options: ["ਤਿੰਨ","ਪੰਜ","ਸੱਤ","ਦਸ"], correct: 1 },
          { type: "match", question: "Match numbers", pairs: [["੧","ikk"],["੩","tinn"],["੫","panj"],["੭","satt"]] },
        ]
      })
    },
    {
      unitId: 3, title: "Telling Time", titlePunjabi: "ਸਮਾਂ ਦੱਸਣਾ", description: "Ask and tell the time in Punjabi",
      order: 2, type: "phrases",
      content: JSON.stringify({
        intro: "Telling time in Punjabi uses 'ਵਜੇ' (vaje) which means 'o'clock'. The word order follows the pattern: number + ਵਜੇ + ਹਨ.",
        items: [
          { gurmukhi: "ਕਿੰਨੇ ਵਜੇ ਹਨ?", romanized: "Kinne vaje han?", english: "What time is it?", audio: "what time" },
          { gurmukhi: "ਇੱਕ ਵਜਿਆ ਹੈ", romanized: "Ikk vajia hai", english: "It's 1 o'clock", audio: "one oclock" },
          { gurmukhi: "ਪੰਜ ਵਜੇ ਹਨ", romanized: "Panj vaje han", english: "It's 5 o'clock", audio: "five oclock" },
          { gurmukhi: "ਸਵੇਰੇ", romanized: "Savere", english: "In the morning", audio: "morning" },
          { gurmukhi: "ਦੁਪਹਿਰੇ", romanized: "Dupahire", english: "In the afternoon", audio: "afternoon" },
          { gurmukhi: "ਰਾਤ ਨੂੰ", romanized: "Raat nu", english: "At night", audio: "night" },
        ],
        exercises: [
          { type: "choose", question: "How do you ask 'What time is it?'", options: ["ਕਿੰਨੇ ਵਜੇ ਹਨ?","ਕਿਦਾਂ?","ਕੀ ਹਾਲ ਹੈ?","ਕਿੱਥੇ?"], correct: 0 },
        ]
      })
    },
  ];

  // Seed lessons for Unit 4 — Family
  const unit4Lessons = [
    {
      unitId: 4, title: "Family Members", titlePunjabi: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ", description: "Learn words for family members and relationships",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Family is central to Punjabi culture. Punjabi has very specific words for maternal and paternal relatives — more specific than English.",
        items: [
          { gurmukhi: "ਮਾਂ", romanized: "Maa", english: "Mother", audio: "mother" },
          { gurmukhi: "ਪਿਤਾ ਜੀ", romanized: "Pita ji", english: "Father (respectful)", audio: "father" },
          { gurmukhi: "ਭੈਣ", romanized: "Bhain", english: "Sister", audio: "sister" },
          { gurmukhi: "ਭਰਾ", romanized: "Bhra", english: "Brother", audio: "brother" },
          { gurmukhi: "ਦਾਦੀ", romanized: "Daadi", english: "Paternal grandmother", audio: "grandmother" },
          { gurmukhi: "ਦਾਦਾ", romanized: "Daada", english: "Paternal grandfather", audio: "grandfather" },
          { gurmukhi: "ਨਾਨੀ", romanized: "Naani", english: "Maternal grandmother", audio: "nani" },
          { gurmukhi: "ਨਾਨਾ", romanized: "Naana", english: "Maternal grandfather", audio: "nana" },
          { gurmukhi: "ਚਾਚਾ", romanized: "Chaacha", english: "Father's younger brother", audio: "chacha" },
          { gurmukhi: "ਮਾਮਾ", romanized: "Maama", english: "Mother's brother", audio: "mama" },
        ],
        exercises: [
          { type: "choose", question: "What is 'ਦਾਦੀ'?", options: ["Mother","Maternal grandmother","Paternal grandmother","Sister"], correct: 2 },
          { type: "match", question: "Match family members", pairs: [["ਮਾਂ","Mother"],["ਭੈਣ","Sister"],["ਭਰਾ","Brother"],["ਨਾਨੀ","Maternal grandmother"]] },
        ]
      })
    },
  ];

  // Seed lessons for Unit 5 — Food
  const unit5Lessons = [
    {
      unitId: 5, title: "Punjabi Food Vocabulary", titlePunjabi: "ਪੰਜਾਬੀ ਖਾਣਾ", description: "Essential food words and classic Punjabi dishes",
      order: 1, type: "vocabulary",
      content: JSON.stringify({
        intro: "Punjabi cuisine is world-famous. From butter chicken to sarson da saag, food is a huge part of Punjabi identity and hospitality.",
        items: [
          { gurmukhi: "ਰੋਟੀ", romanized: "Roti", english: "Flatbread (chapati)", audio: "roti" },
          { gurmukhi: "ਦਾਲ", romanized: "Daal", english: "Lentil curry", audio: "daal" },
          { gurmukhi: "ਸਬਜ਼ੀ", romanized: "Sabzi", english: "Vegetable dish", audio: "sabzi" },
          { gurmukhi: "ਚਾਹ", romanized: "Chaah", english: "Tea", audio: "tea" },
          { gurmukhi: "ਪਾਣੀ", romanized: "Paani", english: "Water", audio: "water" },
          { gurmukhi: "ਦੁੱਧ", romanized: "Duddh", english: "Milk", audio: "milk" },
          { gurmukhi: "ਮੱਖਣ", romanized: "Makkhan", english: "Butter", audio: "butter" },
          { gurmukhi: "ਲੱਸੀ", romanized: "Lassi", english: "Yogurt drink", audio: "lassi" },
          { gurmukhi: "ਸਰੋਂ ਦਾ ਸਾਗ", romanized: "Saron da saag", english: "Mustard greens", audio: "saag" },
          { gurmukhi: "ਮੱਕੀ ਦੀ ਰੋਟੀ", romanized: "Makki di roti", english: "Cornmeal flatbread", audio: "makki" },
        ],
        exercises: [
          { type: "choose", question: "What is 'ਲੱਸੀ'?", options: ["Tea","Water","Yogurt drink","Milk"], correct: 2 },
          { type: "match", question: "Match foods", pairs: [["ਰੋਟੀ","Flatbread"],["ਦਾਲ","Lentil curry"],["ਚਾਹ","Tea"],["ਪਾਣੀ","Water"]] },
        ]
      })
    },
  ];

  // Seed lessons for Unit 6 — Travel
  const unit6Lessons = [
    {
      unitId: 6, title: "Getting Around", titlePunjabi: "ਆਵਾਜਾਈ", description: "Transportation and asking for directions",
      order: 1, type: "phrases",
      content: JSON.stringify({
        intro: "Whether navigating the busy streets of Amritsar or riding through rural Punjab, these travel phrases will help you get around.",
        items: [
          { gurmukhi: "ਕਿੱਥੇ?", romanized: "Kitthe?", english: "Where?", audio: "where" },
          { gurmukhi: "___ ਕਿੱਥੇ ਹੈ?", romanized: "___ kitthe hai?", english: "Where is ___?", audio: "where is" },
          { gurmukhi: "ਸੱਜੇ", romanized: "Sajje", english: "Right", audio: "right" },
          { gurmukhi: "ਖੱਬੇ", romanized: "Khabbe", english: "Left", audio: "left" },
          { gurmukhi: "ਸਿੱਧਾ", romanized: "Siddha", english: "Straight", audio: "straight" },
          { gurmukhi: "ਨੇੜੇ", romanized: "Nere", english: "Near / Close", audio: "near" },
          { gurmukhi: "ਦੂਰ", romanized: "Door", english: "Far", audio: "far" },
          { gurmukhi: "ਬੱਸ ਅੱਡਾ", romanized: "Bass adda", english: "Bus station", audio: "bus station" },
        ],
        exercises: [
          { type: "choose", question: "How do you say 'Where?' in Punjabi?", options: ["ਕੀ?","ਕਿੱਥੇ?","ਕਦੋਂ?","ਕਿਉਂ?"], correct: 1 },
          { type: "match", question: "Match directions", pairs: [["ਸੱਜੇ","Right"],["ਖੱਬੇ","Left"],["ਸਿੱਧਾ","Straight"],["ਨੇੜੇ","Near"]] },
        ]
      })
    },
  ];

  const allLessons = [...unit1Lessons, ...unit2Lessons, ...unit3Lessons, ...unit4Lessons, ...unit5Lessons, ...unit6Lessons];
  for (const l of allLessons) {
    db.insert(lessons).values(l).run();
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  seedData();

  // Units
  app.get("/api/units", async (_req, res) => {
    const allUnits = await storage.getUnits();
    res.json(allUnits);
  });

  app.get("/api/units/:id", async (req, res) => {
    const unit = await storage.getUnit(parseInt(req.params.id));
    if (!unit) return res.status(404).json({ error: "Unit not found" });
    res.json(unit);
  });

  // Lessons
  app.get("/api/units/:unitId/lessons", async (req, res) => {
    const unitLessons = await storage.getLessonsByUnit(parseInt(req.params.unitId));
    res.json(unitLessons);
  });

  app.get("/api/lessons/:id", async (req, res) => {
    const lesson = await storage.getLesson(parseInt(req.params.id));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  });

  // Progress
  app.get("/api/progress", async (_req, res) => {
    const progress = await storage.getProgress();
    res.json(progress);
  });

  app.post("/api/progress", async (req, res) => {
    const progress = await storage.upsertProgress(req.body);
    res.json(progress);
  });

  // Chat / AI Tutor
  app.get("/api/chat", async (_req, res) => {
    const messages = await storage.getChatMessages();
    res.json(messages);
  });

  app.post("/api/chat", async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    // Save user message
    await storage.addChatMessage({
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    });

    // Get chat history for context
    const history = await storage.getChatMessages();
    const messages = history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    try {
      const response = await anthropic.messages.create({
        model: "claude_sonnet_4_6",
        max_tokens: 1024,
        system: `You are a warm, encouraging Punjabi language tutor named PunjabAI. You help learners practice Punjabi (Gurmukhi script and spoken Punjabi).

Key behaviors:
- Always include Gurmukhi script alongside romanized text and English translations
- Be encouraging and patient — celebrate small wins
- Correct mistakes gently and explain why
- Use simple vocabulary appropriate for beginners
- Share cultural context when relevant (Punjabi traditions, food, music, etc.)
- If asked about grammar, explain in simple terms with examples
- Occasionally use Punjabi phrases naturally, then translate
- Keep responses conversational and not too long
- If the user tries speaking Punjabi, always acknowledge the effort positively

Format Gurmukhi text clearly, like: ਸਤ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akal) — Hello

You are having a conversation in a learning context. The user may be at any level from absolute beginner to intermediate.`,
        messages,
      });

      const assistantContent = response.content[0].type === "text"
        ? response.content[0].text
        : "I'm sorry, I couldn't generate a response. Please try again.";

      const saved = await storage.addChatMessage({
        role: "assistant",
        content: assistantContent,
        timestamp: new Date().toISOString(),
      });

      res.json(saved);
    } catch (error: any) {
      console.error("AI tutor error:", error);
      // Fallback response if AI fails
      const fallback = await storage.addChatMessage({
        role: "assistant",
        content: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! (Sat Sri Akal!) I'm having a moment — could you try asking me again? I'm here to help you learn Punjabi! 😊",
        timestamp: new Date().toISOString(),
      });
      res.json(fallback);
    }
  });

  app.delete("/api/chat", async (_req, res) => {
    await storage.clearChatMessages();
    res.json({ success: true });
  });

  return httpServer;
}
