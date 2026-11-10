const STORAGE_KEY = 'mock-auth-user';

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
  normalizeEmail(email);
  // Fake code sending: no email is actually sent.
}

export async function verifyLoginCode(email: string, code: string): Promise<void> {
  const normalized = normalizeEmail(email);

  if (code !== '123456') {
    throw new Error('Incorrect verification code.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: normalized }));
}

// Async so Aadit's real Supabase version can keep the same function names.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as AuthUser;
    if (typeof parsed?.email !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}
