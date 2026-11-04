import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase settings: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  );
}

export const supabase = createClient(url, anonKey);
