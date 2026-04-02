import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Supabase features will not work. Add them to your .env file.'
  );
}

// persistSession: true (default) — stores the session in localStorage so it
// survives page navigations and refreshes. autoRefreshToken keeps the JWT
// alive. detectSessionInUrl: true handles OAuth/magic-link callbacks.
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
