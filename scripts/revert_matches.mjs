import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const db = createClient(supabaseUrl, supabaseKey);

async function revertScriptMatches() {
  const { data: lessons } = await db.from('lessons').select('*').in('id', [14, 15, 16]);
  
  for (const lesson of lessons) {
    const content = JSON.parse(lesson.content);
    let updated = false;
    
    // We want to map english BACk to romanized for script units
    const revMap = new Map();
    content.items.forEach(item => {
      revMap.set(item.english, item.romanized);
    });

    content.exercises.forEach(ex => {
      if (ex.type === 'match') {
        ex.pairs.forEach(pair => {
          if (revMap.has(pair[1])) {
            console.log(`Reverting '${pair[1]}' -> '${revMap.get(pair[1])}'`);
            pair[1] = revMap.get(pair[1]);
            updated = true;
          }
        });
      }
    });

    if (updated) {
      await db.from('lessons').update({ content: JSON.stringify(content) }).eq('id', lesson.id);
      console.log(`Reverted lesson ${lesson.id}`);
    }
  }
}

revertScriptMatches();
