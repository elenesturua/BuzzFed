import type { Request, Response } from 'express';
import { createClient, type User } from '@supabase/supabase-js';
import { getBearerToken, isValidCode, normalizeEmail } from '../utils/validation.js';

function isAllowedUser(user: User | null): user is User {
  if (!user) {
    return false;
  }

  if (!user.email_confirmed_at) {
    return false;
  }

  const validEmail = normalizeEmail(user.email);

  if (!validEmail) {
    return false;
  }

  return true;
}

export async function requestCode(req: Request, res: Response) {
  const email = normalizeEmail(req.body?.email);

  if (!email) {
    res.status(400).json({ error: 'Provide a valid gatech.edu email address.' });

    return;
  }

  // Keep Auth clients local to each request so users never share session state.
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    res
      .status(500)
      .json({ error: 'Unable to send a code. Try again later.' });

    return;
  }

  res.status(202).json({ message: 'Check your email for a login code.' });
}

export async function verifyCode(req: Request, res: Response) {
  const email = normalizeEmail(req.body?.email);
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';

  if (!email || !isValidCode(token)) {
    res
      .status(400)
      .json({ error: 'Provide a valid gatech.edu email and numeric verification code.' });

    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error || !data.session || !isAllowedUser(data.user)) {
    res.status(error?.status === 429 ? 429 : 401).json({ error: 'Invalid or expired code.' });

    return;
  }

  res.json({ session: data.session, user: data.user });
}

export async function refreshSession(req: Request, res: Response) {
  const refreshToken = req.body?.refresh_token;

  if (typeof refreshToken !== 'string' || !refreshToken.trim() || refreshToken.length > 4096) {
    res.status(400).json({ error: 'Provide a refresh_token.' });

    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session || !isAllowedUser(data.user)) {
    res.status(error?.status === 429 ? 429 : 401).json({ error: 'Invalid or expired session.' });

    return;
  }

  res.json({ session: data.session, user: data.user });
}

export async function getCurrentUser(req: Request, res: Response) {
  // Read the access token and ask Supabase to verify it before returning the user.
  const accessToken = getBearerToken(req.headers.authorization);

  if (!accessToken) {
    res.status(401).json({ error: 'Provide a Bearer access token.' });

    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !isAllowedUser(data.user)) {
    res.status(401).json({ error: 'Invalid or expired session.' });

    return;
  }

  res.json({ user: data.user });
}
