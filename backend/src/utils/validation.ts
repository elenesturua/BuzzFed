import validator from 'validator';

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const email = value.trim().toLowerCase();

  if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
    return null;
  }

  const domain = email.slice(email.lastIndexOf('@') + 1);
  const isGeorgiaTech = domain === 'gatech.edu' || domain.endsWith('.gatech.edu');

  if (!isGeorgiaTech) {
    return null;
  }

  return email;
}

export function isValidCode(code: string): boolean {
  if (code.length < 6 || code.length > 10) {
    return false;
  }

  return validator.isNumeric(code, { no_symbols: true });
}

export function getBearerToken(authorization: string | undefined): string | null {
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');

  if (parts.length !== 2) {
    return null;
  }

  const [scheme = '', token = ''] = parts;

  if (scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  for (const character of token) {
    if (character.trim() === '') {
      return null;
    }
  }

  return token;
}
