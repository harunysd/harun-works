import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'harun_admin_session';
const SESSION_LENGTH_SECONDS = 60 * 60 * 24 * 7;

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(value) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return '';
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function validateAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(
    typeof password === 'string' && expected && safeEqual(password, expected),
  );
}

export function setAdminSession(event) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_LENGTH_SECONDS;
  const value = `${expiresAt}.${sign(String(expiresAt))}`;
  setCookie(event, COOKIE_NAME, value, {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_LENGTH_SECONDS,
  });
}

export function clearAdminSession(event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' });
}

export function isAdmin(event) {
  const value = getCookie(event, COOKIE_NAME);
  const [expiresAt, signature] = (value || '').split('.');
  if (!expiresAt || !signature || Number(expiresAt) < Date.now() / 1000)
    return false;
  return safeEqual(signature, sign(expiresAt));
}

export function requireAdmin(event) {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
}
