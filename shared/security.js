const crypto = require('crypto');

const SESSION_COOKIE = 'session_token';
const SESSION_DURATION_DAYS = 7;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash || '').split(':');

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(actualHash, 'hex'));
}

function createSessionToken() {
  return crypto.randomUUID();
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, pair) => {
      const [name, ...valueParts] = pair.split('=');

      if (!name) {
        return cookies;
      }

      cookies[name] = decodeURIComponent(valueParts.join('=') || '');
      return cookies;
    }, {});
}

function sessionExpiryIso() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
  return expiresAt.toISOString();
}

function buildSessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_DAYS * 24 * 60 * 60}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

module.exports = {
  SESSION_COOKIE,
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  parseCookies,
  sessionExpiryIso,
  verifyPassword
};
