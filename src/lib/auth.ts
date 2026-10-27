
const STORAGE_KEY = "mock-auth-user";

export type AuthUser = {
  email: string;
};

export async function sendLoginCode(
  email: string
): Promise<void> {
  if (!/^[^\s@]+@gatech\.edu$/i.test(email.trim())) {
    throw new Error("Please use a @gatech.edu email.");
  }

  // Fake code sending: no email is actually sent.
  return;
}

export async function verifyLoginCode(
  email: string,
  code: string
): Promise<void> {
  if (!/^[^\s@]+@gatech\.edu$/i.test(email.trim())) {
    throw new Error("Invalid email.");
  }

  if (code !== "123456") {
    throw new Error("Incorrect verification code.");
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ email: email.trim() })
  );
}

export function getCurrentUser(): AuthUser | null {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return null;

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    return null;
  }
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}
