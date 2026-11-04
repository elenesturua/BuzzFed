import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  // This regex checks if the email is a valid GT email
  if (/^[^\s@]+@gatech\.edu$/.test(normalized) == false) {
    throw new Error('Please use a @gatech.edu email.');
  }

  return normalized;
}

export async function sendLoginCode(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email: normalizeEmail(email) });
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

  // This checks if the code is valid in terms of format
  if (!/^\d{6}$/.test(token)) {
    throw new Error('Please enter a 6-digit code.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token,
    type: 'email',
  });

  if (error || !data.session) {
    throw new Error('Could not verify code. It may be incorrect or expired. Please try again.');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Could not restore your session. Please try again.');
  }

  if (!data.session) {
    return null;
  }

  return data.session.user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('Could not sign out. Please try again.');
  }
}
