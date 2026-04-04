import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const db = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const payload = {
    user_id: "c79ffab3-5cdd-4a7b-b83c-62c64d88e6d0", // placeholder or get from users
    lesson_id: 1,
    completed: true,
    score: 10,
    last_accessed: new Date().toISOString()
  };

  // get a real user id
  const {data: users} = await db.from('users').select('id').limit(1);
  if (users && users.length > 0) payload.user_id = users[0].id;

  console.log("Attempting Insert...", payload);
  const { data, error } = await db
    .from('user_progress')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}
testUpsert();
