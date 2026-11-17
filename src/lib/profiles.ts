import { requireSupabase } from './supabase';

/** Make sure the signed-in user has a profiles row (needed for posts + photos). */
export async function ensureProfile(): Promise<{ id: string; email: string }> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user?.email) {
    throw new Error('Sign in to continue.');
  }

  const { data: existing, error: readError } = await client
    .from('profiles')
    .select('id, email')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) {
    throw new Error('Could not load your profile. Please try again.');
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await client
    .from('profiles')
    .insert({ id: user.id, email: user.email })
    .select('id, email')
    .single();

  if (insertError) {
    // Race with the auth trigger or another tab.
    if (insertError.code === '23505') {
      return { id: user.id, email: user.email };
    }
    throw new Error('Could not set up your profile. Please sign out and back in.');
  }

  return created;
}
