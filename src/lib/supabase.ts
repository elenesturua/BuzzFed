import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function envValue(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string | null {
  const value = import.meta.env[name]?.trim();
  if (!value || value === 'example_key') return null;
  return value;
}

const url = envValue('VITE_SUPABASE_URL');
const anonKey = envValue('VITE_SUPABASE_ANON_KEY');

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Missing Supabase settings: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    );
  }
  return supabase;
}
