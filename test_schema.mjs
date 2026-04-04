import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const db = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await db.from('user_progress').select('*').limit(1);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Keys:", Object.keys(data[0]));
  } else {
    // try to insert an empty row to get schema violation which usually prints column names
    const res = await db.from('user_progress').insert({}).select();
    console.log("Empty Insert Error:", res.error);
  }
}
check();
