# Supabase Setup for LearnJabi

## Step 1 — Create the tables

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/ujqlpkngsgchjbikkhiv/sql)
2. Paste the contents of `supabase/schema.sql` and click **Run**
3. All 5 tables will be created: `users`, `units`, `lessons`, `user_progress`, `chat_messages`

## Step 2 — Add env vars to your hosting platform

If deployed on Render/Railway/Vercel etc, add these environment variables:

```
VITE_SUPABASE_URL=https://ujqlpkngsgchjbikkhiv.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<your service role key — for server-side use only>
```

The service role key is in: Supabase Dashboard → Project Settings → API → `service_role` (secret)

## Current Status

- ✅ Frontend Supabase client: `client/src/lib/supabase.ts`
- ✅ Server currently uses SQLite (local `data.db`) — works fine for development
- ✅ Supabase tables ready to use once schema is run
- ⬜ Optional: Switch server storage from SQLite → Supabase (when ready)

## Notes

- The app currently stores data in a local SQLite file (`data.db`) — this is fine for development but won't persist on most cloud hosts
- When you're ready to go fully cloud, the server can be updated to use Supabase instead of SQLite
- The frontend Supabase client (`client/src/lib/supabase.ts`) is already wired up and ready to use
