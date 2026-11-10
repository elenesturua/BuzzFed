import { requireSupabase, supabase } from './supabase';

export type AuthUser = {
  email: string;
};

const GATECH_EMAIL = /^[^\s@]+@gatech\.edu$/i;

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!GATECH_EMAIL.test(normalized)) {
    throw new Error('Please use a @gatech.edu email.');
  }
  return normalized;
}

export async function sendLoginCode(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithOtp({
    email: normalizeEmail(email),
    options: { shouldCreateUser: true },
  });

  if (error) {
    throw new Error(
      error.status === 429
        ? 'Too many requests. Please wait before requesting another code.'
        : 'Could not send login code. Please try again.',
    );
  }
}

export async function verifyLoginCode(email: string, code: string): Promise<void> {
  const token = code.trim();
  if (!/^\d{6}$/.test(token)) {
    throw new Error('Please enter a 6-digit code.');
  }

  const { data, error } = await requireSupabase().auth.verifyOtp({
    email: normalizeEmail(email),
    token,
    type: 'email',
  });

  if (error || !data.session) {
    throw new Error('Could not verify code. It may be incorrect or expired. Please try again.');
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (error || !email) return null;
  return { email };
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) {
    throw new Error('Could not sign out. Please try again.');
  }
}
