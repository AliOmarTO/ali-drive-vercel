import { createClient } from '@supabase/supabase-js';

// The browser client will use environment variables that are available on the client side
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
