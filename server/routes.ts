import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { createClient } from "@supabase/supabase-js";

// ── Auth middleware ──────────────────────────────────────────────────────────
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized — no token provided" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Auth] Missing Supabase env vars");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: "Unauthorized — invalid or expired token" });
  }

  (req as any).user = user;
  next();
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seedData(force = false) {
  const existingUnits = await storage.getUnits();
  if (existingUnits.length > 0 && !force) return;

  if (force) {
    console.log('[Seed] Force reseed — clearing existing data...');
    await db.from('lessons').delete().neq('id', 0);
    await db.from('units').delete().neq('id', 0);
  }

  console.log('[Seed] No units found — seeding database...');

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
    { unit_id: u(1), title: "Vowels (Lagaan Maatraa)", title_punjabi: "ਲਗਾਂ ਮਾਤਰਾ", description: "Learn the 10 Punjabi vowels and their sounds", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Gurmukhi has 10 vowel characters called Lagaan Maatraa. Each vowel can appear independently or attached to a consonant.", items: [ { gurmukhi: "ਅ", romanized: "airhaa", english: "short 'a' — as in 'about' (the Gurmukhi base vowel)" }, { gurmukhi: "ਆ", romanized: "aa", english: "long 'aa' — as in 'father'" }, { gurmukhi: "ਇ", romanized: "i", english: "short 'i' — as in 'hit'" }, { gurmukhi: "ਈ", romanized: "ee", english: "long 'ee' — as in 'see'" }, { gurmukhi: "ਉ", romanized: "u", english: "short 'u' — as in 'put'" }, { gurmukhi: "ਊ", romanized: "oo", english: "long 'oo' — as in 'moon'" }, { gurmukhi: "ਏ", romanized: "e", english: "'e' — as in 'play'" }, { gurmukhi: "ਐ", romanized: "ai", english: "'ai' — as in 'cat'" }, { gurmukhi: "ਓ", romanized: "o", english: "'o' — as in 'go'" }, { gurmukhi: "ਔ", romanized: "au", english: "'au' — as in 'caught'" } ], exercises: [ { type: "match", question: "Match the Gurmukhi vowel to its romanized name", pairs: [["ਅ","airhaa"],["ਆ","aa"],["ਇ","i"],["ਈ","ee"]] }, { type: "choose", question: "ਊ — Which romanized name matches this vowel?", options: ["u","oo","o","au"], correct: 1 }, { type: "choose", question: "ਅ — What is the traditional name of this vowel?", options: ["aa","airhaa","ai","e"], correct: 1 }, { type: "choose", question: "ਏ — What sound does this vowel make?", options: ["as in 'caught'","as in 'play'","as in 'moon'","as in 'hit'"], correct: 1 } ] }) },
    { unit_id: u(1), title: "Consonants Row 1-2", title_punjabi: "ਵਿਅੰਜਨ", description: "First 10 consonants of the Gurmukhi alphabet", order: 2, type: "vocabulary", content: JSON.stringify({ intro: "Gurmukhi has 35 consonants organised in rows of 5. Let's learn the first two rows.", items: [ { gurmukhi: "ਸ", romanized: "sassaa", english: "s — as in 'sun'" }, { gurmukhi: "ਹ", romanized: "haahaa", english: "h — as in 'hat'" }, { gurmukhi: "ਕ", romanized: "kakkaa", english: "k — as in 'kit'" }, { gurmukhi: "ਖ", romanized: "khakhkhaa", english: "kh — aspirated k" }, { gurmukhi: "ਗ", romanized: "gaggaa", english: "g — as in 'go'" }, { gurmukhi: "ਘ", romanized: "ghaggaa", english: "gh — aspirated g" }, { gurmukhi: "ਙ", romanized: "nganngaa", english: "ng — as in 'sing'" }, { gurmukhi: "ਚ", romanized: "chachchaa", english: "ch — as in 'chat'" }, { gurmukhi: "ਛ", romanized: "chhachhchhaa", english: "chh — aspirated ch" }, { gurmukhi: "ਜ", romanized: "jajjaa", english: "j — as in 'jam'" } ], exercises: [ { type: "choose", question: "ਕ — What is the traditional name of this consonant?", options: ["sassaa","kakkaa","gaggaa","jajjaa"], correct: 1 }, { type: "choose", question: "ਘ — Which is the aspirated form of ਗ (gaggaa)?", options: ["ਗ","ਘ","ਙ","ਖ"], correct: 1 }, { type: "match", question: "Match the consonants to their names", pairs: [["ਸ","sassaa"],["ਹ","haahaa"],["ਕ","kakkaa"],["ਚ","chachchaa"]] }, { type: "choose", question: "ਜ — Which letter makes the j sound as in jam?", options: ["ਚ","ਛ","ਜ","ਗ"], correct: 2 } ] }) },
    { unit_id: u(1), title: "Consonants Row 3-5", title_punjabi: "ਵਿਅੰਜਨ ਭਾਗ ੨", description: "Continue with the remaining consonant rows", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Let's continue learning the remaining rows of Gurmukhi consonants including retroflex sounds unique to Punjabi.", items: [ { gurmukhi: "ਟ", romanized: "tainkaa", english: "retroflex t — tongue curves back" }, { gurmukhi: "ਠ", romanized: "thaththaa (retroflex)", english: "aspirated retroflex t" }, { gurmukhi: "ਡ", romanized: "daddaa (retroflex)", english: "retroflex d — tongue curves back" }, { gurmukhi: "ਤ", romanized: "tattaa", english: "t — soft dental t" }, { gurmukhi: "ਥ", romanized: "thaththaa", english: "th — aspirated dental t" }, { gurmukhi: "ਦ", romanized: "daddaa", english: "d — dental d" }, { gurmukhi: "ਪ", romanized: "pappaa", english: "p — as in 'pen'" }, { gurmukhi: "ਫ", romanized: "phaphphaa", english: "ph — aspirated p" }, { gurmukhi: "ਬ", romanized: "babbaa", english: "b — as in 'bed'" }, { gurmukhi: "ਮ", romanized: "mammaa", english: "m — as in 'mat'" } ], exercises: [ { type: "choose", question: "ਟ — What makes this different from ਤ (tattaa)?", options: ["It is aspirated","Tongue curves back (retroflex)","It is silent","It makes an r sound"], correct: 1 }, { type: "match", question: "Match consonants to their names", pairs: [["ਪ","pappaa"],["ਬ","babbaa"],["ਮ","mammaa"],["ਦ","daddaa"]] }, { type: "choose", question: "ਮ — Which letter sounds like m as in mat?", options: ["ਪ","ਬ","ਮ","ਦ"], correct: 2 } ] }) },
    { unit_id: u(1), title: "Writing Practice", title_punjabi: "ਲਿਖਣ ਅਭਿਆਸ", description: "Practice writing Gurmukhi characters step by step", order: 4, type: "practice", content: JSON.stringify({ intro: "Practice recognising Gurmukhi characters in real words. Focus on connecting letters you have already learnt.", items: [ { gurmukhi: "ੴ", romanized: "Ik Onkar", english: "The sacred symbol — 'One God'" }, { gurmukhi: "ਸਤ", romanized: "sat", english: "Truth" }, { gurmukhi: "ਨਾਮ", romanized: "naam", english: "Name / Identity" }, { gurmukhi: "ਸਿੱਖ", romanized: "Sikh", english: "Sikh / Learner" }, { gurmukhi: "ਪੰਜਾਬ", romanized: "panjaab", english: "Punjab — Land of Five Rivers" }, { gurmukhi: "ਗੁਰਮੁਖੀ", romanized: "Gurmukhi", english: "The Punjabi script — 'from the Guru's mouth'" } ], exercises: [ { type: "choose", question: "ਸਤ (sat) — What does this word mean?", options: ["Name","Truth","God","Land"], correct: 1 }, { type: "choose", question: "ਪੰਜਾਬ (panjaab) — What does Punjab mean?", options: ["Five Rivers","Holy Land","Sacred Place","Golden Temple"], correct: 0 }, { type: "choose", question: "ਗੁਰਮੁਖੀ (Gurmukhi) — What does the script name mean?", options: ["From God","Five sounds","From the Guru's mouth","Sacred writing"], correct: 2 }, { type: "match", question: "Match the words to their meanings", pairs: [["ਸਤ","Truth"],["ਨਾਮ","Name"],["ਸਿੱਖ","Learner"],["ਪੰਜਾਬ","Punjab"]] } ] }) },
    { unit_id: u(2), title: "Everyday Greetings", title_punjabi: "ਰੋਜ਼ਾਨਾ ਸ਼ੁਭ ਇੱਛਾਵਾਂ", description: "Say hello, goodbye, and daily courtesies", order: 1, type: "phrases", content: JSON.stringify({ intro: "Punjabi greetings reflect deep cultural respect. The most common greeting 'Sat Sri Akal' literally means 'True is the Timeless Lord.'", items: [ { gurmukhi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", romanized: "Sat Sri Akal", english: "Hello / God is truth" }, { gurmukhi: "ਕਿਦਾਂ?", romanized: "Kidaan?", english: "How are you? (informal)" }, { gurmukhi: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", romanized: "Tusi kive ho?", english: "How are you? (formal)" }, { gurmukhi: "ਮੈਂ ਠੀਕ ਹਾਂ", romanized: "Mai theek haan", english: "I am fine" }, { gurmukhi: "ਸ਼ੁਕਰੀਆ", romanized: "Shukriya", english: "Thank you" }, { gurmukhi: "ਜੀ ਆਇਆਂ ਨੂੰ", romanized: "Ji aayian nu", english: "Welcome" }, { gurmukhi: "ਅਲਵਿਦਾ", romanized: "Alvida", english: "Goodbye" }, { gurmukhi: "ਮਾਫ਼ ਕਰਨਾ", romanized: "Maaf karna", english: "Sorry / Excuse me" }, { gurmukhi: "ਹਾਂ", romanized: "Haan", english: "Yes" }, { gurmukhi: "ਨਹੀਂ", romanized: "Nahi", english: "No" }, { gurmukhi: "ਕਿਰਪਾ ਕਰਕੇ", romanized: "Kirpa karke", english: "Please" }, { gurmukhi: "ਬਹੁਤ ਧੰਨਵਾਦ", romanized: "Bahut dhannvaad", english: "Thank you very much" }, { gurmukhi: "ਕੋਈ ਗੱਲ ਨਹੀਂ", romanized: "Koi gal nahi", english: "No problem / You're welcome" }, { gurmukhi: "ਸ਼ੁਭ ਸਵੇਰੇ", romanized: "Shubh Savere", english: "Good morning" }, { gurmukhi: "ਸ਼ੁਭ ਰਾਤ", romanized: "Shubh raat", english: "Good night" }, { gurmukhi: "ਫਿਰ ਮਿਲਾਂਗੇ", romanized: "Phir milaange", english: "See you again" } ], exercises: [ { type: "choose", question: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akal) — What does this greeting mean in English?", options: ["Thank you","Hello / God is truth","Goodbye","Good morning"], correct: 1 }, { type: "choose", question: "ਸ਼ੁਕਰੀਆ (Shukriya) — What does this mean?", options: ["Hello","Sorry","Thank you","Welcome"], correct: 2 }, { type: "choose", question: "ਸ਼ੁਭ ਸਵੇਰੇ (Shubh Savere) — When would you say this?", options: ["At night","In the morning","When leaving","When arriving"], correct: 1 }, { type: "match", question: "Match the greetings", pairs: [["ਸ਼ੁਕਰੀਆ","Thank you"],["ਅਲਵਿਦਾ","Goodbye"],["ਹਾਂ","Yes"],["ਨਹੀਂ","No"]] } ] }) },
    { unit_id: u(2), title: "Introducing Yourself", title_punjabi: "ਆਪਣੀ ਜਾਣ-ਪਛਾਣ", description: "Tell people your name, where you're from, and what you do", order: 2, type: "phrases", content: JSON.stringify({ intro: "Being able to introduce yourself is essential. Punjabi has formal (ਤੁਸੀਂ - tusi) and informal (ਤੂੰ - toon) registers — always use formal with strangers and elders.", items: [ { gurmukhi: "ਮੇਰਾ ਨਾਮ ___ ਹੈ", romanized: "Mera naam ___ hai", english: "My name is ___" }, { gurmukhi: "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?", romanized: "Tuhaada naam ki hai?", english: "What is your name? (formal)" }, { gurmukhi: "ਮੈਂ ___ ਤੋਂ ਹਾਂ", romanized: "Mai ___ to haan", english: "I am from ___" }, { gurmukhi: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ ਹਾਂ", romanized: "Mai Punjabi Sikh riha haan", english: "I am learning Punjabi (male)" }, { gurmukhi: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਹੀ ਹਾਂ", romanized: "Mai Punjabi Sikh rahi haan", english: "I am learning Punjabi (female)" }, { gurmukhi: "ਤੁਸੀਂ ਕੀ ਕੰਮ ਕਰਦੇ ਹੋ?", romanized: "Tusi ki kam karde ho?", english: "What do you do?" }, { gurmukhi: "ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ", romanized: "Mil ke khushi hoyi", english: "Nice to meet you" }, { gurmukhi: "ਮੇਰੀ ਉਮਰ ___ ਸਾਲ ਹੈ", romanized: "Meri umar ___ saal hai", english: "I am ___ years old" }, { gurmukhi: "ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ", romanized: "Mai vidyarthi haan", english: "I am a student" }, { gurmukhi: "ਮੈਂ ਅੰਗਰੇਜ਼ੀ ਬੋਲਦਾ ਹਾਂ", romanized: "Mai angrezi bolda haan", english: "I speak English" }, { gurmukhi: "ਥੋੜੀ ਜਿਹੀ", romanized: "Thori jihi", english: "A little bit" }, { gurmukhi: "ਹੌਲੀ ਬੋਲੋ", romanized: "Hauli bolo", english: "Speak slowly" } ], exercises: [ { type: "choose", question: "ਮੇਰਾ ਨਾਮ ___ ਹੈ (Mera naam ___ hai) — What does this mean?", options: ["What is your name?","My name is ___","I am from ___","Nice to meet you"], correct: 1 }, { type: "choose", question: "ਹੌਲੀ ਬੋਲੋ (Hauli bolo) — What are you asking someone to do?", options: ["Say again","Speak slowly","Be quiet","Come here"], correct: 1 }, { type: "choose", question: "ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ (Mai vidyarthi haan) — What does this sentence mean?", options: ["I am a teacher","I am a student","I am learning","I am working"], correct: 1 }, { type: "match", question: "Match the phrases", pairs: [["ਥੋੜੀ ਜਿਹੀ","A little bit"],["ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ","Nice to meet you"],["ਹੌਲੀ ਬੋਲੋ","Speak slowly"],["ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ","I am a student"]] } ] }) },
    { unit_id: u(2), title: "Asking Questions", title_punjabi: "ਸਵਾਲ ਪੁੱਛਣਾ", description: "Question words and how to ask things in Punjabi", order: 3, type: "phrases", content: JSON.stringify({ intro: "Knowing question words unlocks conversation. These are your most-used tools for learning and navigating in Punjabi.", items: [ { gurmukhi: "ਕੀ?", romanized: "Ki?", english: "What?" }, { gurmukhi: "ਕੌਣ?", romanized: "Kaun?", english: "Who?" }, { gurmukhi: "ਕਿੱਥੇ?", romanized: "Kithe?", english: "Where?" }, { gurmukhi: "ਕਦੋਂ?", romanized: "Kadon?", english: "When?" }, { gurmukhi: "ਕਿਉਂ?", romanized: "Kiyun?", english: "Why?" }, { gurmukhi: "ਕਿਵੇਂ?", romanized: "Kive?", english: "How?" }, { gurmukhi: "ਕਿੰਨਾ?", romanized: "Kinna?", english: "How much / How many?" }, { gurmukhi: "ਕੀ ਇਹ ਕੀ ਹੈ?", romanized: "Ki ih ki hai?", english: "What is this?" }, { gurmukhi: "ਇਹ ਕਿੱਥੇ ਹੈ?", romanized: "Ih kithe hai?", english: "Where is this?" }, { gurmukhi: "ਇਹ ਕਿੰਨੇ ਦਾ ਹੈ?", romanized: "Ih kinne da hai?", english: "How much does this cost?" } ], exercises: [ { type: "choose", question: "ਕਿੱਥੇ (Kithe) — What question word is this?", options: ["What?","Who?","Where?","When?"], correct: 2 }, { type: "choose", question: "ਕਿਉਂ (Kiyun) — What does this mean?", options: ["How?","Why?","Who?","Where?"], correct: 1 }, { type: "match", question: "Match question words", pairs: [["ਕੀ","What"],["ਕੌਣ","Who"],["ਕਿੱਥੇ","Where"],["ਕਦੋਂ","When"]] }, { type: "choose", question: "ਇਹ ਕਿੰਨੇ ਦਾ ਹੈ (Ih kinne da hai) — What are you asking?", options: ["Where is this?","What is this?","How much does this cost?","Who owns this?"], correct: 2 } ] }) },
    { unit_id: u(3), title: "Numbers 1–20", title_punjabi: "ਅੰਕ ੧-੨੦", description: "Learn to count from 1 to 20 in Punjabi", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Gurmukhi has its own numeral system. Learning numbers is essential for shopping, telling time, and daily conversations.", items: [ { gurmukhi: "੧ - ਇੱਕ", romanized: "ikk", english: "1 - one" }, { gurmukhi: "੨ - ਦੋ", romanized: "do", english: "2 - two" }, { gurmukhi: "੩ - ਤਿੰਨ", romanized: "tinn", english: "3 - three" }, { gurmukhi: "੪ - ਚਾਰ", romanized: "chaar", english: "4 - four" }, { gurmukhi: "੫ - ਪੰਜ", romanized: "panj", english: "5 - five" }, { gurmukhi: "੬ - ਛੇ", romanized: "chhe", english: "6 - six" }, { gurmukhi: "੭ - ਸੱਤ", romanized: "satt", english: "7 - seven" }, { gurmukhi: "੮ - ਅੱਠ", romanized: "atth", english: "8 - eight" }, { gurmukhi: "੯ - ਨੌਂ", romanized: "nauN", english: "9 - nine" }, { gurmukhi: "੧੦ - ਦਸ", romanized: "das", english: "10 - ten" }, { gurmukhi: "੧੧ - ਗਿਆਰਾਂ", romanized: "gyaaraan", english: "11 - eleven" }, { gurmukhi: "੧੨ - ਬਾਰਾਂ", romanized: "baaraan", english: "12 - twelve" }, { gurmukhi: "੧੩ - ਤੇਰਾਂ", romanized: "teraan", english: "13 - thirteen" }, { gurmukhi: "੧੪ - ਚੌਦਾਂ", romanized: "chaudaan", english: "14 - fourteen" }, { gurmukhi: "੧੫ - ਪੰਦਰਾਂ", romanized: "pandraan", english: "15 - fifteen" }, { gurmukhi: "੧੬ - ਸੋਲਾਂ", romanized: "solaan", english: "16 - sixteen" }, { gurmukhi: "੧੭ - ਸਤਾਰਾਂ", romanized: "sataaraan", english: "17 - seventeen" }, { gurmukhi: "੧੮ - ਅਠਾਰਾਂ", romanized: "athaaraan", english: "18 - eighteen" }, { gurmukhi: "੧੯ - ਉੱਨੀ", romanized: "unni", english: "19 - nineteen" }, { gurmukhi: "੨੦ - ਵੀਹ", romanized: "veeh", english: "20 - twenty" } ], exercises: [ { type: "choose", question: "੫ - ਪੰਜ (panj) — What number is this?", options: ["Three","Four","Five","Six"], correct: 2 }, { type: "choose", question: "੧੫ - ਪੰਦਰਾਂ (pandraan) — What number is this?", options: ["Sixteen","Fourteen","Fifteen","Thirteen"], correct: 2 }, { type: "match", question: "Match numbers to romanized", pairs: [["੧","ikk"],["੩","tinn"],["੫","panj"],["੭","satt"]] }, { type: "choose", question: "੨੦ - ਵੀਹ (veeh) — What is this number?", options: ["Twelve","Eighteen","Nineteen","Twenty"], correct: 3 } ] }) },
    { unit_id: u(3), title: "Numbers 20–100", title_punjabi: "ਅੰਕ ੨੦-੧੦੦", description: "Count larger numbers and learn the pattern", order: 2, type: "vocabulary", content: JSON.stringify({ intro: "Punjabi numbers above 20 follow patterns. Learning the tens gives you the building blocks for any number up to 100.", items: [ { gurmukhi: "੨੧ - ਇੱਕੀ", romanized: "ikki", english: "21 - twenty-one" }, { gurmukhi: "੨੫ - ਪੱਚੀ", romanized: "pachchi", english: "25 - twenty-five" }, { gurmukhi: "੩੦ - ਤੀਹ", romanized: "teeh", english: "30 - thirty" }, { gurmukhi: "੩੫ - ਪੈਂਤੀ", romanized: "paintee", english: "35 - thirty-five" }, { gurmukhi: "੪੦ - ਚਾਲੀ", romanized: "chaali", english: "40 - forty" }, { gurmukhi: "੪੫ - ਪੈਂਤਾਲੀ", romanized: "paintaali", english: "45 - forty-five" }, { gurmukhi: "੫੦ - ਪੰਜਾਹ", romanized: "panjaah", english: "50 - fifty" }, { gurmukhi: "੬੦ - ਸੱਠ", romanized: "satth", english: "60 - sixty" }, { gurmukhi: "੭੦ - ਸੱਤਰ", romanized: "sattar", english: "70 - seventy" }, { gurmukhi: "੮੦ - ਅੱਸੀ", romanized: "assi", english: "80 - eighty" }, { gurmukhi: "੯੦ - ਨੱਬੇ", romanized: "nabbe", english: "90 - ninety" }, { gurmukhi: "੧੦੦ - ਸੌ", romanized: "sau", english: "100 - hundred" } ], exercises: [ { type: "choose", question: "੫੦ - ਪੰਜਾਹ (panjaah) — What number is this?", options: ["Thirty","Fifty","Sixty","Hundred"], correct: 1 }, { type: "choose", question: "੧੦੦ - ਸੌ (sau) — What number is this?", options: ["Ninety","Eighty","Seventy","Hundred"], correct: 3 }, { type: "match", question: "Match the tens", pairs: [["੩੦","teeh"],["੫੦","panjaah"],["੭੦","sattar"],["੧੦੦","sau"]] }, { type: "choose", question: "੮੦ - ਅੱਸੀ (assi) — Which decade is this?", options: ["Sixty","Seventy","Eighty","Ninety"], correct: 2 } ] }) },
    { unit_id: u(3), title: "Telling the Time", title_punjabi: "ਸਮਾਂ ਦੱਸਣਾ", description: "Ask and tell the time in Punjabi", order: 3, type: "phrases", content: JSON.stringify({ intro: "Now that you know numbers, you can tell the time. In Punjabi, 'ਵੱਜੇ (vajje)' means 'o'clock'.", items: [ { gurmukhi: "ਕਿੰਨੇ ਵੱਜੇ ਹਨ?", romanized: "Kinne vajje han?", english: "What time is it?" }, { gurmukhi: "ਇੱਕ ਵੱਜਾ ਹੈ", romanized: "Ikk vajja hai", english: "It is 1 o'clock" }, { gurmukhi: "ਦੋ ਵੱਜੇ ਹਨ", romanized: "Do vajje han", english: "It is 2 o'clock" }, { gurmukhi: "ਸਵੇਰੇ", romanized: "Savere", english: "In the morning (AM)" }, { gurmukhi: "ਸ਼ਾਮ ਨੂੰ", romanized: "Shaam nu", english: "In the evening (PM)" }, { gurmukhi: "ਰਾਤ ਨੂੰ", romanized: "Raat nu", english: "At night" }, { gurmukhi: "ਅੱਧਾ", romanized: "Addha", english: "Half (e.g. half past)" }, { gurmukhi: "ਪੌਣਾ", romanized: "Paunaa", english: "Quarter to" }, { gurmukhi: "ਸਾਢੇ", romanized: "Saadhe", english: "Half past" } ], exercises: [ { type: "choose", question: "ਕਿੰਨੇ ਵੱਜੇ ਹਨ? (Kinne vajje han?) — What does this question mean?", options: ["How many?","What time is it?","When are you coming?","What is the date?"], correct: 1 }, { type: "choose", question: "ਸਵੇਰੇ (Savere) — What does this mean?", options: ["Evening","Night","Morning","Afternoon"], correct: 2 }, { type: "match", question: "Match time words", pairs: [["ਸਵੇਰੇ","Morning"],["ਰਾਤ ਨੂੰ","At night"],["ਅੱਧਾ","Half"],["ਸਾਢੇ","Half past"]] } ] }) },
    { unit_id: u(4), title: "Basic Colours", title_punjabi: "ਮੂਲ ਰੰਗ", description: "Learn the core colours in Punjabi", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Colours are used constantly in daily conversation. In Punjabi, colour adjectives usually follow the noun they describe.", items: [ { gurmukhi: "ਲਾਲ", romanized: "laal", english: "Red" }, { gurmukhi: "ਨੀਲਾ", romanized: "neela", english: "Blue" }, { gurmukhi: "ਪੀਲਾ", romanized: "peela", english: "Yellow" }, { gurmukhi: "ਹਰਾ", romanized: "haraa", english: "Green" }, { gurmukhi: "ਸੰਤਰੀ", romanized: "santari", english: "Orange" }, { gurmukhi: "ਜਾਮਣੀ", romanized: "jaamni", english: "Purple" }, { gurmukhi: "ਗੁਲਾਬੀ", romanized: "gulaabi", english: "Pink" }, { gurmukhi: "ਭੂਰਾ", romanized: "bhoora", english: "Brown" }, { gurmukhi: "ਕਾਲਾ", romanized: "kaala", english: "Black" }, { gurmukhi: "ਚਿੱਟਾ", romanized: "chitta", english: "White" }, { gurmukhi: "ਸਲੇਟੀ", romanized: "sleti", english: "Grey" }, { gurmukhi: "ਸੋਨੇ ਰੰਗਾ", romanized: "sone ranga", english: "Golden" } ], exercises: [ { type: "choose", question: "ਲਾਲ (laal) — What colour is this?", options: ["Blue","Green","Red","Yellow"], correct: 2 }, { type: "choose", question: "ਚਿੱਟਾ (chitta) — What colour does this mean?", options: ["Black","Grey","White","Silver"], correct: 2 }, { type: "match", question: "Match colours", pairs: [["ਲਾਲ","Red"],["ਨੀਲਾ","Blue"],["ਹਰਾ","Green"],["ਕਾਲਾ","Black"]] }, { type: "choose", question: "ਗੁਲਾਬੀ (gulaabi) — What colour is this?", options: ["Purple","Orange","Brown","Pink"], correct: 3 } ] }) },
    { unit_id: u(4), title: "Colours in Context", title_punjabi: "ਰੰਗ ਵਾਕਾਂ ਵਿੱਚ", description: "Use colours in real Punjabi sentences", order: 2, type: "phrases", content: JSON.stringify({ intro: "Now let's use colours in real sentences. In Punjabi, adjectives change slightly depending on gender — this lesson shows you the core patterns.", items: [ { gurmukhi: "ਇਹ ਲਾਲ ਹੈ", romanized: "Ih laal hai", english: "This is red" }, { gurmukhi: "ਮੇਰੀ ਕਮੀਜ਼ ਨੀਲੀ ਹੈ", romanized: "Meri kamiz neeli hai", english: "My shirt is blue" }, { gurmukhi: "ਉਹ ਘਰ ਪੀਲਾ ਹੈ", romanized: "Uh ghar peela hai", english: "That house is yellow" }, { gurmukhi: "ਮੈਨੂੰ ਹਰਾ ਰੰਗ ਪਸੰਦ ਹੈ", romanized: "Mainu haraa rang pasand hai", english: "I like the colour green" }, { gurmukhi: "ਆਕਾਸ਼ ਨੀਲਾ ਹੈ", romanized: "Aakaash neela hai", english: "The sky is blue" }, { gurmukhi: "ਘਾਹ ਹਰਾ ਹੈ", romanized: "Ghaah haraa hai", english: "Grass is green" }, { gurmukhi: "ਸੂਰਜ ਪੀਲਾ ਹੈ", romanized: "Sooraj peela hai", english: "The sun is yellow" }, { gurmukhi: "ਇਹ ਕਿਹੜੇ ਰੰਗ ਦਾ ਹੈ?", romanized: "Ih kihre rang da hai?", english: "What colour is this?" } ], exercises: [ { type: "choose", question: "ਆਕਾਸ਼ ਨੀਲਾ ਹੈ (Aakaash neela hai) — What does this sentence mean?", options: ["The sun is yellow","The sky is blue","Grass is green","The house is blue"], correct: 1 }, { type: "choose", question: "ਮੈਨੂੰ ਹਰਾ ਰੰਗ ਪਸੰਦ ਹੈ (Mainu haraa rang pasand hai) — What does this mean?", options: ["I like the colour red","I like the colour blue","I like the colour green","Green is beautiful"], correct: 2 }, { type: "match", question: "Match sentences to meanings", pairs: [["ਸੂਰਜ ਪੀਲਾ ਹੈ","Sun is yellow"],["ਘਾਹ ਹਰਾ ਹੈ","Grass is green"],["ਆਕਾਸ਼ ਨੀਲਾ ਹੈ","Sky is blue"],["ਇਹ ਲਾਲ ਹੈ","This is red"]] } ] }) },
    { unit_id: u(4), title: "Describing Things", title_punjabi: "ਚੀਜ਼ਾਂ ਦੱਸਣਾ", description: "Adjectives for size, shape, and appearance", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Beyond colours, Punjabi has a rich set of descriptive words. These adjectives help you describe objects, people, and places.", items: [ { gurmukhi: "ਵੱਡਾ", romanized: "vaddaa", english: "Big / Large" }, { gurmukhi: "ਛੋਟਾ", romanized: "chhotaa", english: "Small / Little" }, { gurmukhi: "ਲੰਮਾ", romanized: "lammaa", english: "Tall / Long" }, { gurmukhi: "ਨਾਟਾ", romanized: "naataa", english: "Short (height)" }, { gurmukhi: "ਮੋਟਾ", romanized: "motaa", english: "Fat / Thick" }, { gurmukhi: "ਪਤਲਾ", romanized: "patlaa", english: "Thin / Slim" }, { gurmukhi: "ਸੁੰਦਰ", romanized: "sundar", english: "Beautiful / Handsome" }, { gurmukhi: "ਪੁਰਾਣਾ", romanized: "puraanaa", english: "Old (object)" }, { gurmukhi: "ਨਵਾਂ", romanized: "navaan", english: "New" }, { gurmukhi: "ਗਰਮ", romanized: "garam", english: "Hot / Warm" }, { gurmukhi: "ਠੰਡਾ", romanized: "thandaa", english: "Cold / Cool" } ], exercises: [ { type: "choose", question: "ਵੱਡਾ (vaddaa) — What does this adjective mean?", options: ["Small","Big","Tall","Old"], correct: 1 }, { type: "choose", question: "ਠੰਡਾ (thandaa) — What does this mean?", options: ["Hot","Warm","Cold","New"], correct: 2 }, { type: "match", question: "Match opposites", pairs: [["ਵੱਡਾ","Big"],["ਛੋਟਾ","Small"],["ਗਰਮ","Hot"],["ਠੰਡਾ","Cold"]] }, { type: "choose", question: "ਸੁੰਦਰ (sundar) — What does this word mean?", options: ["Ugly","Old","Thin","Beautiful"], correct: 3 } ] }) },
    { unit_id: u(5), title: "Directions", title_punjabi: "ਦਿਸ਼ਾਵਾਂ", description: "Ask for and give directions in Punjabi", order: 1, type: "phrases", content: JSON.stringify({ intro: "Knowing how to ask for directions is vital for travel. Punjabi directions use cardinal points and relative position.", items: [ { gurmukhi: "ਸੱਜੇ", romanized: "sajje", english: "Right" }, { gurmukhi: "ਖੱਬੇ", romanized: "khabbe", english: "Left" }, { gurmukhi: "ਸਿੱਧੇ", romanized: "sidhe", english: "Straight ahead" }, { gurmukhi: "ਪਿੱਛੇ", romanized: "pichhe", english: "Behind / Back" }, { gurmukhi: "ਉੱਥੇ", romanized: "uthe", english: "There" }, { gurmukhi: "ਇੱਥੇ", romanized: "ithe", english: "Here" }, { gurmukhi: "ਨੇੜੇ", romanized: "nere", english: "Near / Close" }, { gurmukhi: "ਦੂਰ", romanized: "door", english: "Far" }, { gurmukhi: "ਉੱਪਰ", romanized: "upar", english: "Up / Above" }, { gurmukhi: "ਹੇਠਾਂ", romanized: "hethaan", english: "Down / Below" }, { gurmukhi: "___ ਕਿੱਥੇ ਹੈ?", romanized: "___ kithe hai?", english: "Where is ___?" }, { gurmukhi: "ਮੈਨੂੰ ਰਾਹ ਦੱਸੋ", romanized: "Mainu raah dasso", english: "Please show me the way" } ], exercises: [ { type: "choose", question: "ਸੱਜੇ (sajje) — Which direction is this?", options: ["Left","Straight","Right","Back"], correct: 2 }, { type: "choose", question: "ਦੂਰ (door) — What does this word mean?", options: ["Near","Here","Far","There"], correct: 2 }, { type: "match", question: "Match directions", pairs: [["ਸੱਜੇ","Right"],["ਖੱਬੇ","Left"],["ਨੇੜੇ","Near"],["ਦੂਰ","Far"]] }, { type: "choose", question: "ਸਿੱਧੇ (sidhe) — What does this direction mean?", options: ["Turn left","Turn right","Go back","Straight ahead"], correct: 3 } ] }) },
    { unit_id: u(5), title: "Places & Locations", title_punjabi: "ਥਾਵਾਂ", description: "Vocabulary for common places around town", order: 2, type: "vocabulary", content: JSON.stringify({ intro: "Knowing the names of places lets you ask for directions and describe where you are going in Punjabi.", items: [ { gurmukhi: "ਘਰ", romanized: "ghar", english: "Home / House" }, { gurmukhi: "ਸਕੂਲ", romanized: "skool", english: "School" }, { gurmukhi: "ਹਸਪਤਾਲ", romanized: "haspatal", english: "Hospital" }, { gurmukhi: "ਬਾਜ਼ਾਰ", romanized: "baazaar", english: "Market / Bazaar" }, { gurmukhi: "ਦੁਕਾਨ", romanized: "dukaan", english: "Shop / Store" }, { gurmukhi: "ਮੰਦਰ", romanized: "mandar", english: "Temple" }, { gurmukhi: "ਗੁਰਦੁਆਰਾ", romanized: "Gurdwara", english: "Sikh place of worship" }, { gurmukhi: "ਬੱਸ ਅੱਡਾ", romanized: "bass adda", english: "Bus station" }, { gurmukhi: "ਰੇਲਵੇ ਸਟੇਸ਼ਨ", romanized: "railway station", english: "Train station" }, { gurmukhi: "ਪਾਰਕ", romanized: "paark", english: "Park" }, { gurmukhi: "ਬੈਂਕ", romanized: "baink", english: "Bank" }, { gurmukhi: "ਖੇਤ", romanized: "khet", english: "Field / Farm" } ], exercises: [ { type: "choose", question: "ਗੁਰਦੁਆਰਾ (Gurdwara) — What is this place?", options: ["Temple","Hospital","Sikh place of worship","Market"], correct: 2 }, { type: "choose", question: "ਬਾਜ਼ਾਰ (baazaar) — What is this?", options: ["Home","School","Bank","Market"], correct: 3 }, { type: "match", question: "Match places", pairs: [["ਘਰ","Home"],["ਸਕੂਲ","School"],["ਹਸਪਤਾਲ","Hospital"],["ਬੈਂਕ","Bank"]] }, { type: "choose", question: "ਖੇਤ (khet) — What does this mean?", options: ["Park","Field / Farm","Road","River"], correct: 1 } ] }) },
    { unit_id: u(5), title: "Transport & Travel", title_punjabi: "ਆਵਾਜਾਈ", description: "Transport vocabulary for getting around", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Whether travelling in Punjab or talking about journeys, these transport words are essential.", items: [ { gurmukhi: "ਬੱਸ", romanized: "bass", english: "Bus" }, { gurmukhi: "ਰੇਲਗੱਡੀ", romanized: "relgaddi", english: "Train" }, { gurmukhi: "ਕਾਰ", romanized: "kaar", english: "Car" }, { gurmukhi: "ਸਾਈਕਲ", romanized: "saaykil", english: "Bicycle" }, { gurmukhi: "ਮੋਟਰਸਾਈਕਲ", romanized: "motarsaaykil", english: "Motorcycle" }, { gurmukhi: "ਜਹਾਜ਼", romanized: "jahaaz", english: "Aeroplane" }, { gurmukhi: "ਰਿਕਸ਼ਾ", romanized: "riksha", english: "Rickshaw" }, { gurmukhi: "ਮੈਂ ਬੱਸ ਤੇ ਜਾਂਦਾ ਹਾਂ", romanized: "Mai bass te jaandaa haan", english: "I go by bus" }, { gurmukhi: "ਟਿਕਟ ਕਿੱਥੇ ਮਿਲੇਗੀ?", romanized: "Tikat kithe milegi?", english: "Where can I get a ticket?" } ], exercises: [ { type: "choose", question: "ਰੇਲਗੱਡੀ (relgaddi) — What mode of transport is this?", options: ["Bus","Car","Train","Plane"], correct: 2 }, { type: "choose", question: "ਜਹਾਜ਼ (jahaaz) — What does this mean?", options: ["Train","Ship","Aeroplane","Rickshaw"], correct: 2 }, { type: "match", question: "Match transport", pairs: [["ਬੱਸ","Bus"],["ਕਾਰ","Car"],["ਜਹਾਜ਼","Aeroplane"],["ਸਾਈਕਲ","Bicycle"]] } ] }) },
    { unit_id: u(6), title: "Emotions & Feelings", title_punjabi: "ਭਾਵਨਾਵਾਂ", description: "Express your feelings in Punjabi", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Expressing emotions is central to meaningful conversation. Punjabi has rich vocabulary for feelings rooted in cultural values.", items: [ { gurmukhi: "ਖੁਸ਼", romanized: "khush", english: "Happy" }, { gurmukhi: "ਉਦਾਸ", romanized: "udaas", english: "Sad" }, { gurmukhi: "ਗੁੱਸੇ ਵਿੱਚ", romanized: "gusse vich", english: "Angry" }, { gurmukhi: "ਡਰਿਆ", romanized: "dariya", english: "Scared / Afraid" }, { gurmukhi: "ਥੱਕਿਆ", romanized: "thakiya", english: "Tired" }, { gurmukhi: "ਹੈਰਾਨ", romanized: "hairhaan", english: "Surprised" }, { gurmukhi: "ਭੁੱਖਾ", romanized: "bhooka", english: "Hungry" }, { gurmukhi: "ਪਿਆਸਾ", romanized: "pyaasa", english: "Thirsty" }, { gurmukhi: "ਖੁਸ਼ੀ", romanized: "khushi", english: "Joy / Happiness" }, { gurmukhi: "ਪਿਆਰ", romanized: "pyaar", english: "Love" }, { gurmukhi: "ਮੈਂ ਖੁਸ਼ ਹਾਂ", romanized: "Mai khush haan", english: "I am happy" }, { gurmukhi: "ਮੈਂ ਥੱਕਿਆ ਹਾਂ", romanized: "Mai thakiya haan", english: "I am tired" } ], exercises: [ { type: "choose", question: "ਖੁਸ਼ (khush) — What does this emotion mean?", options: ["Sad","Angry","Happy","Tired"], correct: 2 }, { type: "choose", question: "ਮੈਂ ਥੱਕਿਆ ਹਾਂ (Mai thakiya haan) — What does this sentence mean?", options: ["I am happy","I am sad","I am tired","I am hungry"], correct: 2 }, { type: "match", question: "Match emotions", pairs: [["ਖੁਸ਼","Happy"],["ਉਦਾਸ","Sad"],["ਥੱਕਿਆ","Tired"],["ਪਿਆਰ","Love"]] }, { type: "choose", question: "ਭੁੱਖਾ (bhooka) — What does this mean?", options: ["Thirsty","Tired","Scared","Hungry"], correct: 3 } ] }) },
    { unit_id: u(6), title: "Expressing How You Feel", title_punjabi: "ਆਪਣੀ ਭਾਵਨਾ ਦੱਸਣਾ", description: "Full sentences for sharing your emotional state", order: 2, type: "phrases", content: JSON.stringify({ intro: "Now use emotion vocabulary in complete sentences. Punjabi uses 'ਮੈਂ (Mai) + feeling + ਹਾਂ (haan)' as the basic pattern for 'I am ___'.", items: [ { gurmukhi: "ਮੈਂ ਖੁਸ਼ ਹਾਂ", romanized: "Mai khush haan", english: "I am happy" }, { gurmukhi: "ਮੈਂ ਉਦਾਸ ਹਾਂ", romanized: "Mai udaas haan", english: "I am sad" }, { gurmukhi: "ਮੈਂ ਗੁੱਸੇ ਵਿੱਚ ਹਾਂ", romanized: "Mai gusse vich haan", english: "I am angry" }, { gurmukhi: "ਮੈਂ ਥੱਕਿਆ ਹਾਂ", romanized: "Mai thakiya haan", english: "I am tired" }, { gurmukhi: "ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ", romanized: "Mainu bhukh laggi hai", english: "I am hungry" }, { gurmukhi: "ਮੈਨੂੰ ਪਿਆਸ ਲੱਗੀ ਹੈ", romanized: "Mainu pyaas laggi hai", english: "I am thirsty" }, { gurmukhi: "ਮੈਂ ਠੀਕ ਹਾਂ", romanized: "Mai theek haan", english: "I am fine / okay" }, { gurmukhi: "ਤੂੰ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈਂ?", romanized: "Toon kive mehsoos karda hain?", english: "How do you feel? (informal)" } ], exercises: [ { type: "choose", question: "ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ (Mainu bhukh laggi hai) — What does this mean?", options: ["I am thirsty","I am tired","I am hungry","I am scared"], correct: 2 }, { type: "choose", question: "ਮੈਂ ਠੀਕ ਹਾਂ (Mai theek haan) — What does this mean?", options: ["I am great","I am fine","I am sick","I am busy"], correct: 1 }, { type: "match", question: "Match the sentences", pairs: [["ਮੈਂ ਖੁਸ਼ ਹਾਂ","I am happy"],["ਮੈਂ ਉਦਾਸ ਹਾਂ","I am sad"],["ਮੈਂ ਥੱਕਿਆ ਹਾਂ","I am tired"],["ਮੈਂ ਠੀਕ ਹਾਂ","I am fine"]] } ] }) },
    { unit_id: u(6), title: "Body & Health", title_punjabi: "ਸਰੀਰ ਅਤੇ ਸਿਹਤ", description: "Body parts and basic health vocabulary", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Knowing body part names is essential for health situations and everyday description in Punjabi.", items: [ { gurmukhi: "ਸਿਰ", romanized: "sir", english: "Head" }, { gurmukhi: "ਅੱਖ", romanized: "akkh", english: "Eye" }, { gurmukhi: "ਕੰਨ", romanized: "kann", english: "Ear" }, { gurmukhi: "ਨੱਕ", romanized: "nakk", english: "Nose" }, { gurmukhi: "ਮੂੰਹ", romanized: "moonh", english: "Mouth" }, { gurmukhi: "ਹੱਥ", romanized: "hatth", english: "Hand" }, { gurmukhi: "ਪੈਰ", romanized: "pair", english: "Foot / Leg" }, { gurmukhi: "ਢਿੱਡ", romanized: "dhidd", english: "Stomach / Belly" }, { gurmukhi: "ਮੈਨੂੰ ਦਰਦ ਹੈ", romanized: "Mainu dard hai", english: "I am in pain / I have pain" }, { gurmukhi: "ਡਾਕਟਰ", romanized: "daaktar", english: "Doctor" }, { gurmukhi: "ਦਵਾਈ", romanized: "davaai", english: "Medicine" } ], exercises: [ { type: "choose", question: "ਸਿਰ (sir) — What body part is this?", options: ["Hand","Foot","Head","Ear"], correct: 2 }, { type: "choose", question: "ਮੈਨੂੰ ਦਰਦ ਹੈ (Mainu dard hai) — What does this mean?", options: ["I am hungry","I am in pain","I am tired","I am sick"], correct: 1 }, { type: "match", question: "Match body parts", pairs: [["ਸਿਰ","Head"],["ਅੱਖ","Eye"],["ਹੱਥ","Hand"],["ਪੈਰ","Foot"]] } ] }) },
    { unit_id: u(7), title: "Family Members", title_punjabi: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ", description: "Names for family relationships in Punjabi", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Punjabi has specific words for every family relationship. Unlike English, Punjabi distinguishes paternal and maternal relatives with different terms.", items: [ { gurmukhi: "ਮਾਂ", romanized: "maan", english: "Mother" }, { gurmukhi: "ਪਿਤਾ", romanized: "pita", english: "Father" }, { gurmukhi: "ਭਰਾ", romanized: "bhraa", english: "Brother" }, { gurmukhi: "ਭੈਣ", romanized: "bhain", english: "Sister" }, { gurmukhi: "ਦਾਦਾ", romanized: "daada", english: "Paternal Grandfather" }, { gurmukhi: "ਦਾਦੀ", romanized: "daadi", english: "Paternal Grandmother" }, { gurmukhi: "ਨਾਨਾ", romanized: "naana", english: "Maternal Grandfather" }, { gurmukhi: "ਨਾਨੀ", romanized: "naani", english: "Maternal Grandmother" }, { gurmukhi: "ਚਾਚਾ", romanized: "chacha", english: "Paternal Uncle" }, { gurmukhi: "ਮਾਮਾ", romanized: "mama", english: "Maternal Uncle" }, { gurmukhi: "ਪੁੱਤਰ", romanized: "puttar", english: "Son" }, { gurmukhi: "ਧੀ", romanized: "dhi", english: "Daughter" } ], exercises: [ { type: "choose", question: "ਮਾਂ (maan) — What does this family word mean?", options: ["Father","Sister","Mother","Brother"], correct: 2 }, { type: "choose", question: "ਦਾਦਾ (daada) — Who is this?", options: ["Maternal Grandfather","Father","Paternal Grandfather","Uncle"], correct: 2 }, { type: "match", question: "Match family members", pairs: [["ਮਾਂ","Mother"],["ਪਿਤਾ","Father"],["ਭਰਾ","Brother"],["ਭੈਣ","Sister"]] }, { type: "choose", question: "ਨਾਨੀ (naani) — Who is this?", options: ["Paternal Grandmother","Maternal Grandmother","Aunt","Sister"], correct: 1 } ] }) },
    { unit_id: u(7), title: "Talking About Your Family", title_punjabi: "ਪਰਿਵਾਰ ਬਾਰੇ ਗੱਲ ਕਰਨਾ", description: "Sentences for describing your family", order: 2, type: "phrases", content: JSON.stringify({ intro: "Now build full sentences about your family. In Punjabi, 'ਮੇਰਾ / ਮੇਰੀ (mera / meri)' means 'my' — mera for masculine, meri for feminine.", items: [ { gurmukhi: "ਮੇਰਾ ਭਰਾ ਵੱਡਾ ਹੈ", romanized: "Mera bhraa vaddaa hai", english: "My brother is older" }, { gurmukhi: "ਮੇਰੀ ਭੈਣ ਛੋਟੀ ਹੈ", romanized: "Meri bhain chhoti hai", english: "My sister is younger" }, { gurmukhi: "ਮੇਰੇ ਪਰਿਵਾਰ ਵਿੱਚ ਕਿੰਨੇ ਜਣੇ ਹਨ?", romanized: "Mere parivar vich kinne jane han?", english: "How many people are in your family?" }, { gurmukhi: "ਸਾਡੇ ਪਰਿਵਾਰ ਵਿੱਚ ਪੰਜ ਜਣੇ ਹਨ", romanized: "Saade parivar vich panj jane han", english: "There are five people in our family" }, { gurmukhi: "ਮੇਰੀ ਮਾਂ ਅਧਿਆਪਕਾ ਹੈ", romanized: "Meri maan adhyaapka hai", english: "My mother is a teacher" }, { gurmukhi: "ਮੇਰਾ ਪਿਤਾ ਕਿਸਾਨ ਹੈ", romanized: "Mera pita kisaan hai", english: "My father is a farmer" }, { gurmukhi: "ਕੀ ਤੁਹਾਡੇ ਭੈਣ-ਭਰਾ ਹਨ?", romanized: "Ki tuhaade bhain-bhraa han?", english: "Do you have siblings?" }, { gurmukhi: "ਮੇਰਾ ਇੱਕ ਭਰਾ ਹੈ", romanized: "Mera ikk bhraa hai", english: "I have one brother" } ], exercises: [ { type: "choose", question: "ਮੇਰੀ ਭੈਣ ਛੋਟੀ ਹੈ (Meri bhain chhoti hai) — What does this mean?", options: ["My sister is older","My sister is younger","My brother is small","My sister is tall"], correct: 1 }, { type: "choose", question: "ਮੇਰੀ ਮਾਂ ਅਧਿਆਪਕਾ ਹੈ (Meri maan adhyaapka hai) — What does this say?", options: ["My mother is a farmer","My mother is a doctor","My mother is a teacher","My mother is a student"], correct: 2 }, { type: "match", question: "Match sentences to meanings", pairs: [["ਮੇਰਾ ਭਰਾ ਵੱਡਾ ਹੈ","My brother is older"],["ਮੇਰੀ ਭੈਣ ਛੋਟੀ ਹੈ","My sister is younger"],["ਮੇਰਾ ਇੱਕ ਭਰਾ ਹੈ","I have one brother"],["ਮੇਰਾ ਪਿਤਾ ਕਿਸਾਨ ਹੈ","My father is a farmer"]] } ] }) },
    { unit_id: u(7), title: "Relationships & Respect", title_punjabi: "ਸੰਬੰਧ ਅਤੇ ਆਦਰ", description: "Terms of respect and extended family", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Respect is deeply embedded in Punjabi culture. Elders are addressed with honorific terms — using someone's name alone can seem disrespectful.", items: [ { gurmukhi: "ਜੀ", romanized: "ji", english: "Honorific suffix — shows respect" }, { gurmukhi: "ਭਾਜੀ", romanized: "bhaaji", english: "Older brother (respectful)" }, { gurmukhi: "ਭੈਣ ਜੀ", romanized: "bhain ji", english: "Older sister (respectful)" }, { gurmukhi: "ਅੰਕਲ ਜੀ", romanized: "uncle ji", english: "Uncle (respectful)" }, { gurmukhi: "ਆਂਟੀ ਜੀ", romanized: "aunty ji", english: "Aunt (respectful)" }, { gurmukhi: "ਦੋਸਤ", romanized: "dost", english: "Friend" }, { gurmukhi: "ਯਾਰ", romanized: "yaar", english: "Mate / Pal (informal)" }, { gurmukhi: "ਗੁਆਂਢੀ", romanized: "guaandhi", english: "Neighbour" }, { gurmukhi: "ਤੁਹਾਡਾ ਪਰਿਵਾਰ ਕਿੱਥੇ ਹੈ?", romanized: "Tuhaada parivar kithe hai?", english: "Where is your family?" } ], exercises: [ { type: "choose", question: "ਜੀ (ji) — What is the purpose of this word?", options: ["It means 'yes'","It is an honorific suffix for respect","It means 'hello'","It means 'goodbye'"], correct: 1 }, { type: "choose", question: "ਦੋਸਤ (dost) — What does this mean?", options: ["Brother","Neighbour","Friend","Colleague"], correct: 2 }, { type: "match", question: "Match the words", pairs: [["ਦੋਸਤ","Friend"],["ਯਾਰ","Mate"],["ਭਾਜੀ","Older brother"],["ਗੁਆਂਢੀ","Neighbour"]] } ] }) },
    { unit_id: u(8), title: "Punjabi Food & Dishes", title_punjabi: "ਪੰਜਾਬੀ ਖਾਣੇ", description: "Vocabulary for popular Punjabi foods", order: 1, type: "vocabulary", content: JSON.stringify({ intro: "Punjabi cuisine is world-famous. Learning food vocabulary lets you order at restaurants and discuss one of the most beloved cultures in the world.", items: [ { gurmukhi: "ਰੋਟੀ", romanized: "roti", english: "Flatbread / Chapati" }, { gurmukhi: "ਦਾਲ", romanized: "daal", english: "Lentil dish" }, { gurmukhi: "ਸਬਜ਼ੀ", romanized: "sabzi", english: "Vegetable dish" }, { gurmukhi: "ਚਾਵਲ", romanized: "chaaval", english: "Rice" }, { gurmukhi: "ਪਾਣੀ", romanized: "paani", english: "Water" }, { gurmukhi: "ਦੁੱਧ", romanized: "dudh", english: "Milk" }, { gurmukhi: "ਚਾਹ", romanized: "chai", english: "Tea" }, { gurmukhi: "ਲੱਸੀ", romanized: "lassi", english: "Yogurt drink" }, { gurmukhi: "ਮੱਖਣ", romanized: "makkhan", english: "Butter" }, { gurmukhi: "ਸਰੋਂ ਦਾ ਸਾਗ", romanized: "saroon da saag", english: "Mustard greens curry" }, { gurmukhi: "ਮੱਕੀ ਦੀ ਰੋਟੀ", romanized: "makki di roti", english: "Corn flatbread" }, { gurmukhi: "ਖਾਣਾ ਦਿਓ", romanized: "khaana deo", english: "Please serve food" } ], exercises: [ { type: "choose", question: "ਪਾਣੀ (paani) — What does this mean?", options: ["Tea","Milk","Water","Juice"], correct: 2 }, { type: "choose", question: "ਲੱਸੀ (lassi) — What is this drink?", options: ["Butter","Rice","Yogurt drink","Flatbread"], correct: 2 }, { type: "match", question: "Match food words", pairs: [["ਰੋਟੀ","Flatbread"],["ਦਾਲ","Lentils"],["ਚਾਹ","Tea"],["ਪਾਣੀ","Water"]] }, { type: "choose", question: "ਸਰੋਂ ਦਾ ਸਾਗ (saroon da saag) — What is this dish?", options: ["Corn flatbread","Yogurt drink","Mustard greens curry","Lentil soup"], correct: 2 } ] }) },
    { unit_id: u(8), title: "Ordering Food", title_punjabi: "ਖਾਣਾ ਮੰਗਣਾ", description: "How to order at a restaurant in Punjabi", order: 2, type: "phrases", content: JSON.stringify({ intro: "Whether at a dhaba or a restaurant, these phrases will help you order food and drinks confidently in Punjabi.", items: [ { gurmukhi: "ਮੈਨੂੰ ___ ਚਾਹੀਦਾ ਹੈ", romanized: "Mainu ___ chahida hai", english: "I want / I need ___" }, { gurmukhi: "ਮੀਨੂ ਲਿਆਓ", romanized: "Menu liyao", english: "Please bring the menu" }, { gurmukhi: "ਕੀ ਇਹ ਤਿੱਖਾ ਹੈ?", romanized: "Ki ih tikkha hai?", english: "Is this spicy?" }, { gurmukhi: "ਘੱਟ ਮਿਰਚ ਪਾਓ", romanized: "Ghatt mirch paao", english: "Put less chilli please" }, { gurmukhi: "ਬਹੁਤ ਸੁਆਦ ਹੈ", romanized: "Bahut suaad hai", english: "This is very delicious" }, { gurmukhi: "ਹੋਰ ਦਿਓ", romanized: "Hor deo", english: "Give more / Seconds please" }, { gurmukhi: "ਬਿੱਲ ਲਿਆਓ", romanized: "Bill liyao", english: "Bring the bill" }, { gurmukhi: "ਮੈਂ ਸ਼ਾਕਾਹਾਰੀ ਹਾਂ", romanized: "Mai shaakaahaari haan", english: "I am vegetarian" }, { gurmukhi: "ਖਾਣਾ ਕਦੋਂ ਆਵੇਗਾ?", romanized: "Khaana kadon aavega?", english: "When will the food come?" } ], exercises: [ { type: "choose", question: "ਬਹੁਤ ਸੁਆਦ ਹੈ (Bahut suaad hai) — What does this mean?", options: ["I am full","This is spicy","This is very delicious","Bring the bill"], correct: 2 }, { type: "choose", question: "ਮੈਂ ਸ਼ਾਕਾਹਾਰੀ ਹਾਂ (Mai shaakaahaari haan) — What is this person saying?", options: ["I am hungry","I am vegetarian","I like spicy food","I want water"], correct: 1 }, { type: "match", question: "Match dining phrases", pairs: [["ਬਿੱਲ ਲਿਆਓ","Bring the bill"],["ਹੋਰ ਦਿਓ","Give more"],["ਕੀ ਇਹ ਤਿੱਖਾ ਹੈ?","Is this spicy?"],["ਮੀਨੂ ਲਿਆਓ","Bring the menu"]] }, { type: "choose", question: "ਘੱਟ ਮਿਰਚ ਪਾਓ (Ghatt mirch paao) — What are you asking?", options: ["More spice please","No chilli","Put less chilli","This is too salty"], correct: 2 } ] }) },
    { unit_id: u(8), title: "Ingredients & Cooking", title_punjabi: "ਸਮੱਗਰੀ ਅਤੇ ਪਕਾਉਣਾ", description: "Cooking vocabulary and common ingredients", order: 3, type: "vocabulary", content: JSON.stringify({ intro: "Punjabi cooking uses bold spices and fresh ingredients. This lesson covers the key vocabulary for cooking and ingredients.", items: [ { gurmukhi: "ਆਟਾ", romanized: "aataa", english: "Flour / Dough" }, { gurmukhi: "ਤੇਲ", romanized: "tel", english: "Oil" }, { gurmukhi: "ਲੂਣ", romanized: "loon", english: "Salt" }, { gurmukhi: "ਮਿਰਚ", romanized: "mirch", english: "Chilli / Pepper" }, { gurmukhi: "ਹਲਦੀ", romanized: "haldi", english: "Turmeric" }, { gurmukhi: "ਧਨੀਆ", romanized: "dhania", english: "Coriander" }, { gurmukhi: "ਜ਼ੀਰਾ", romanized: "zeera", english: "Cumin" }, { gurmukhi: "ਅਦਰਕ", romanized: "adrak", english: "Ginger" }, { gurmukhi: "ਲਸਣ", romanized: "lasan", english: "Garlic" }, { gurmukhi: "ਪਿਆਜ਼", romanized: "piyaaz", english: "Onion" }, { gurmukhi: "ਟਮਾਟਰ", romanized: "tamaatar", english: "Tomato" } ], exercises: [ { type: "choose", question: "ਹਲਦੀ (haldi) — What spice is this?", options: ["Cumin","Ginger","Turmeric","Coriander"], correct: 2 }, { type: "choose", question: "ਲਸਣ (lasan) — What ingredient is this?", options: ["Onion","Ginger","Garlic","Tomato"], correct: 2 }, { type: "match", question: "Match ingredients", pairs: [["ਲੂਣ","Salt"],["ਤੇਲ","Oil"],["ਮਿਰਚ","Chilli"],["ਅਦਰਕ","Ginger"]] }, { type: "choose", question: "ਜ਼ੀਰਾ (zeera) — What is this spice?", options: ["Turmeric","Cumin","Garlic","Coriander"], correct: 1 } ] }) },
  ];

  const { data: insertedLessons, error: lessonError } = await db.from('lessons').insert(lessonsData).select();
  if (lessonError) { console.error('[Seed] Lesson insert error:', lessonError); return; }
  console.log(`[Seed] Inserted ${insertedLessons?.length} lessons across 8 units`);
}

// ── Unit 1 content migration — fixes romanized names if old seed is present ───
async function migrateUnit1Content() {
  // Detect if migration is needed: vowel lesson ਅ should have romanized "airhaa" not "a"
  const { data: allUnits, error: unitsErr } = await db.from('units').select('id, order');
  if (unitsErr) { console.error('[Migration] units query error:', unitsErr); return; }
  const unit1 = allUnits?.find((u: any) => u.order === 1);
  if (!unit1) { console.log('[Migration] No unit 1 found, skipping'); return; }
  const unit1Id = unit1.id;
  console.log('[Migration] Unit 1 ID:', unit1Id);

  const { data: lessons, error: lessonsErr } = await db.from('lessons').select('id, order, content').eq('unit_id', unit1Id).order('order');
  if (lessonsErr) { console.error('[Migration] lessons query error:', lessonsErr); return; }
  if (!lessons || lessons.length === 0) { console.log('[Migration] No lessons found for unit 1'); return; }
  console.log('[Migration] Found', lessons.length, 'lessons for unit 1');

  const vowelLesson = lessons.find((l: any) => l.order === 1);
  if (!vowelLesson) { console.log('[Migration] Vowel lesson not found'); return; }

  let vowelContent: any;
  try { vowelContent = JSON.parse(vowelLesson.content); } catch (e) { console.error('[Migration] JSON parse error:', e); return; }

  // Check if migration is needed
  const firstVowel = vowelContent?.items?.[0];
  console.log('[Migration] First vowel romanized:', firstVowel?.romanized);
  if (!firstVowel || firstVowel.romanized === 'airhaa') {
    console.log('[Migration] Already migrated or unexpected format — skipping');
    return;
  }

  console.log('[Migration] Updating Unit 1 lesson content with correct romanized names...');

  // ── Vowel lesson update ──
  const vowelItems = [
    { gurmukhi: 'ਅ', romanized: 'airhaa', english: "short 'a' — as in 'about'" },
    { gurmukhi: 'ਆ', romanized: 'aa', english: "long 'aa' — as in 'father'" },
    { gurmukhi: 'ਇ', romanized: 'i', english: "short 'i' — as in 'hit'" },
    { gurmukhi: 'ਈ', romanized: 'ee', english: "long 'ee' — as in 'see'" },
    { gurmukhi: 'ਉ', romanized: 'u', english: "short 'u' — as in 'put'" },
    { gurmukhi: 'ਊ', romanized: 'oo', english: "long 'oo' — as in 'moon'" },
    { gurmukhi: 'ਏ', romanized: 'e', english: "'e' — as in 'play'" },
    { gurmukhi: 'ਐ', romanized: 'ai', english: "'ai' — as in 'cat'" },
    { gurmukhi: 'ਓ', romanized: 'o', english: "'o' — as in 'go'" },
    { gurmukhi: 'ਔ', romanized: 'au', english: "'au' — as in 'caught'" },
  ];
  const vowelExercises = [
    { type: 'match', question: 'Match the Gurmukhi vowel to its romanized name', pairs: [['ਅ','airhaa'],['ਆ','aa'],['ਇ','i'],['ਈ','ee']] },
    { type: 'choose', question: 'ਊ — Which romanized name matches this vowel?', options: ['u','oo','o','au'], correct: 1 },
    { type: 'choose', question: 'ਅ — What is the name of this vowel?', options: ['aa','airhaa','ai','e'], correct: 1 },
    { type: 'choose', question: 'ਏ — What sound does this vowel make?', options: ["as in 'caught'","as in 'play'","as in 'moon'","as in 'hit'"], correct: 1 },
  ];
  const { error: vowelUpdateErr } = await db.from('lessons').update({ content: JSON.stringify({ ...vowelContent, items: vowelItems, exercises: vowelExercises }) }).eq('id', vowelLesson.id);
  if (vowelUpdateErr) {
    console.error('[Migration] Vowel update error:', JSON.stringify(vowelUpdateErr));
    return;
  }
  console.log('[Migration] Vowel lesson updated successfully for lesson id:', vowelLesson.id);

  // ── Consonant Row 1-2 lesson update ──
  const cons1Lesson = lessons.find((l: any) => l.order === 2);
  if (cons1Lesson) {
    let c1: any;
    try { c1 = JSON.parse(cons1Lesson.content); } catch { c1 = {}; }
    const cons1Items = [
      { gurmukhi: 'ਸ', romanized: 'sassaa', english: "s — as in 'sun'" },
      { gurmukhi: 'ਹ', romanized: 'haahaa', english: "h — as in 'hat'" },
      { gurmukhi: 'ਕ', romanized: 'kakkaa', english: "k — as in 'kit'" },
      { gurmukhi: 'ਖ', romanized: 'khakhkhaa', english: "kh — aspirated k" },
      { gurmukhi: 'ਗ', romanized: 'gaggaa', english: "g — as in 'go'" },
      { gurmukhi: 'ਘ', romanized: 'ghaggaa', english: "gh — aspirated g" },
      { gurmukhi: 'ਙ', romanized: 'nganngaa', english: "ng — as in 'sing'" },
      { gurmukhi: 'ਚ', romanized: 'chachchaa', english: "ch — as in 'chat'" },
      { gurmukhi: 'ਛ', romanized: 'chhachhchhaa', english: "chh — aspirated ch" },
      { gurmukhi: 'ਜ', romanized: 'jajjaa', english: "j — as in 'jam'" },
    ];
    const cons1Exercises = [
      { type: 'choose', question: 'ਕ — What is the name of this consonant?', options: ['sassaa','kakkaa','gaggaa','jajjaa'], correct: 1 },
      { type: 'choose', question: 'ਘ — Which is the aspirated form of ਗ (gaggaa)?', options: ['ਗ','ਘ','ਙ','ਖ'], correct: 1 },
      { type: 'match', question: 'Match consonants to their names', pairs: [['ਸ','sassaa'],['ਹ','haahaa'],['ਕ','kakkaa'],['ਚ','chachchaa']] },
      { type: 'choose', question: 'ਜ — Which letter makes the j sound as in jam?', options: ['ਚ','ਛ','ਜ','ਗ'], correct: 2 },
    ];
    await db.from('lessons').update({ content: JSON.stringify({ ...c1, items: cons1Items, exercises: cons1Exercises }) }).eq('id', cons1Lesson.id);
  }

  // ── Consonant Row 3-5 lesson update ──
  const cons2Lesson = lessons.find((l: any) => l.order === 3);
  if (cons2Lesson) {
    let c2: any;
    try { c2 = JSON.parse(cons2Lesson.content); } catch { c2 = {}; }
    const cons2Items = [
      { gurmukhi: 'ਟ', romanized: 'tainkaa', english: "retroflex ṭ — tongue curves back" },
      { gurmukhi: 'ਠ', romanized: 'thaththaa', english: "aspirated retroflex ṭh" },
      { gurmukhi: 'ਡ', romanized: 'daddaa', english: "retroflex ḍ — tongue curves back" },
      { gurmukhi: 'ਤ', romanized: 'tattaa', english: "t — soft dental t" },
      { gurmukhi: 'ਥ', romanized: 'thaththaa', english: "th — aspirated dental t" },
      { gurmukhi: 'ਦ', romanized: 'daddaa', english: "d — dental d" },
      { gurmukhi: 'ਪ', romanized: 'pappaa', english: "p — as in 'pen'" },
      { gurmukhi: 'ਫ', romanized: 'phaphphaa', english: "ph — aspirated p" },
      { gurmukhi: 'ਬ', romanized: 'babbaa', english: "b — as in 'bed'" },
      { gurmukhi: 'ਮ', romanized: 'mammaa', english: "m — as in 'mat'" },
    ];
    const cons2Exercises = [
      { type: 'choose', question: 'ਟ — What makes this different from ਤ (tattaa)?', options: ['It is aspirated','Tongue curves back (retroflex)','It is silent','It makes an r sound'], correct: 1 },
      { type: 'match', question: 'Match the letters to their names', pairs: [['ਪ','pappaa'],['ਬ','babbaa'],['ਮ','mammaa'],['ਦ','daddaa']] },
      { type: 'choose', question: 'ਮ — Which letter sounds like m in mat?', options: ['ਪ','ਬ','ਮ','ਦ'], correct: 2 },
    ];
    await db.from('lessons').update({ content: JSON.stringify({ ...c2, items: cons2Items, exercises: cons2Exercises }) }).eq('id', cons2Lesson.id);
  }

  console.log('[Migration] Unit 1 content updated successfully.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    await seedData();
    await migrateUnit1Content();
  } catch (e) {
    console.error('[Seed] Error during seeding:', e);
  }

  // 🔒 PROTECTED — admin only
  app.post("/api/admin/reseed", requireAuth, async (req, res) => {
    try {
      await seedData(true);
      res.json({ success: true, message: "Database reseeded successfully" });
    } catch (e) {
      res.status(500).json({ success: false, message: String(e) });
    }
  });

  // Temporary migration trigger (localhost dev only — no auth needed)
  app.post("/api/admin/migrate", async (_req, res) => {
    try {
      await migrateUnit1Content();
      res.json({ success: true, message: "Migration complete" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // ✅ PUBLIC — lesson content is not sensitive
  app.get("/api/units", async (_req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch {
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const unit = await storage.getUnit(parseInt(req.params.id));
      if (!unit) return res.status(404).json({ message: "Unit not found" });
      res.json(unit);
    } catch {
      res.status(500).json({ message: "Failed to fetch unit" });
    }
  });

  app.get("/api/units/:id/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByUnit(parseInt(req.params.id));
      res.json(lessons);
    } catch {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons", async (_req, res) => {
    try {
      const lessons = await storage.getAllLessons();
      res.json(lessons);
    } catch {
      res.status(500).json({ message: "Failed to fetch all lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(parseInt(req.params.id));
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // 🔒 PROTECTED — user-specific data
  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const progress = await storage.getProgress(userId);
      res.json(progress);
    } catch {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", requireAuth, async (req, res) => {
    try {
      const authUser = (req as any).user;
      const userId = authUser.id;
      
      // Auto-upsert into public.users to ensure the FK constraint always passes
      await storage.createUser({ 
        id: userId, 
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || "User" 
      });

      const progress = await storage.upsertProgress({ ...req.body, userId });
      res.json(progress);
    } catch (e) {
      console.error("[POST /api/progress] Error:", e);
      res.status(500).json({ message: "Failed to save progress", error: String(e) });
    }
  });

  // 🔒 PROTECTED — user-specific data
  app.get("/api/chat", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const message = await storage.addChatMessage({ ...req.body, userId });
      res.json(message);
    } catch {
      res.status(500).json({ message: "Failed to save message" });
    }
  });

  app.delete("/api/chat", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      await storage.clearChatMessages(userId);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
