import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Supabase features will not work. Add them to your .env file.'
  );
}

// Use persistSession: false so the session is kept in memory rather than
// localStorage — localStorage is blocked in sandboxed/iframe environments
// (e.g. Render static deployments). The JS client still holds the session
// for the full lifetime of the browser tab via onAuthStateChange.
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
