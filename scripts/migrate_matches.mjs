import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const db = createClient(supabaseUrl, supabaseKey);

async function migrateMatches() {
  const { data: lessons, error } = await db.from('lessons').select('*');
  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  for (const lesson of lessons) {
    // Skip Unit 1 (unit_id: 1, 2, 3 might map differently, let's just check title or type)
    // Actually, Unit 1 lessons are 'script' type or we can check title.
    try {
      const content = JSON.parse(lesson.content);
      let updated = false;

      // We only want to touch those that are heavily romanized on the right side, but NOT Unit 1.
      // Unit 1 usually teaches letters, like short 'a', 'b'.
      // If we map to english, we need to look up the item.
      if (lesson.type === 'vocabulary' || lesson.type === 'phrases') {
        const itemMap = new Map();
        content.items.forEach(item => {
          // Map romanized -> english
          // e.g. "ikk" -> "1 - one", "tinn" -> "3 - three"
          if (item.romanized) {
            // let's grab just the english word or phrase. 
            // e.g. "1 - one" -> "one" or keep it as "1 - one"
            itemMap.set(item.romanized.toLowerCase().trim(), item.english);
          }
        });

        content.exercises.forEach(ex => {
          if (ex.type === 'match') {
            ex.pairs.forEach(pair => {
              const rightSide = pair[1].toLowerCase().trim();
              if (itemMap.has(rightSide)) {
                // The right side IS a romanized string! Let's swap to English meaning!
                const eng = itemMap.get(rightSide);
                console.log(`[Unit: ${lesson.title}] Changing match from '${pair[1]}' -> '${eng}'`);
                pair[1] = eng;
                updated = true;
              }
            });
          }
        });
      }

      if (updated) {
        console.log(`Updating lesson ${lesson.id}...`);
        await db.from('lessons').update({ content: JSON.stringify(content) }).eq('id', lesson.id);
      }
    } catch (e) {
      console.log("Error processing", lesson.title, e);
    }
  }
  console.log("Migration complete!");
}

migrateMatches();
