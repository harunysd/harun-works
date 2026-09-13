import {
  createHmac,
  timingSafeEqual,
  scryptSync,
  randomBytes,
} from 'node:crypto';
import { get, put, del } from '@vercel/blob';
import { sendAdminRecoveryEmail } from './mailer.js';

const COOKIE_NAME = 'harun_admin_session';
const SESSION_LENGTH_SECONDS = 60 * 60 * 24 * 7;
const CREDENTIALS_PATH = 'admin/credentials.json';
const RECOVERY_PATH = 'admin/recovery.json';

const DEFAULT_ADMIN_EMAIL = 'harunysd@gmail.com';
const ALLOWED_ADMIN_EMAILS = [
  'harunysd@gmail.com',
  'iletisim@harun.works',
  (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
].filter(Boolean);

let memCredentials = null;
let memRecovery = null;

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(value) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-harun';
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function isAllowedAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function maskEmail(email) {
  if (!email || !email.includes('@')) return 'e-posta';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

async function getStoredCredentials() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return memCredentials;
  try {
    const result = await get(CREDENTIALS_PATH, {
      access: 'private',
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return null;
    return await new Response(result.stream).json();
  } catch (err) {
    return memCredentials;
  }
}

function verifyPasswordHash(password, stored) {
  if (!stored?.salt || !stored?.hash) return false;
  try {
    const derived = scryptSync(password, stored.salt, 64).toString('hex');
    return safeEqual(derived, stored.hash);
  } catch {
    return false;
  }
}

export async function validateAdminPassword(password) {
  if (typeof password !== 'string' || !password) return false;

  const stored = await getStoredCredentials();
  if (stored && verifyPasswordHash(password, stored)) {
    return true;
  }

  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && safeEqual(password, expected));
}

export async function setStoredAdminPassword(newPassword) {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parola en az 6 karakterden oluşmalıdır.',
    });
  }

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(newPassword, salt, 64).toString('hex');
  const record = {
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };

  memCredentials = record;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(CREDENTIALS_PATH, JSON.stringify(record), {
      access: 'private',
      allowOverwrite: true,
      contentType: 'application/json',
    });
  }

  return true;
}

export async function createRecoverySession({ email, baseDomain }) {
  const targetEmail = (email || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

  if (!isAllowedAdminEmail(targetEmail)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bu e-posta adresi yönetim paneline kayıtlı değil.',
    });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const token = randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000;

  const recoveryRecord = {
    code,
    token,
    email: targetEmail,
    expiresAt,
  };

  memRecovery = recoveryRecord;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(RECOVERY_PATH, JSON.stringify(recoveryRecord), {
        access: 'private',
        allowOverwrite: true,
        contentType: 'application/json',
      });
    } catch (e) {
      console.error('Failed to save recovery session to blob:', e);
    }
  }

  const link = `${baseDomain || 'https://harun.works'}/admin?recovery_token=${token}`;
  const mailerStatus = await sendAdminRecoveryEmail({
    to: targetEmail,
    code,
    link,
  });

  return {
    ok: true,
    maskedEmail: maskEmail(targetEmail),
    mailerStatus,
    expiresInMinutes: 15,
  };
}

async function getStoredRecoveryRecord() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return memRecovery;
  try {
    const result = await get(RECOVERY_PATH, {
      access: 'private',
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return memRecovery;
    return await new Response(result.stream).json();
  } catch {
    return memRecovery;
  }
}

async function clearRecoveryRecord() {
  memRecovery = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(RECOVERY_PATH);
    } catch {}
  }
}

export async function verifyRecoveryCodeOrToken({ code, token }) {
  const record = await getStoredRecoveryRecord();

  if (!record || !record.expiresAt || Date.now() > record.expiresAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Giriş kodunun veya bağlantısının süresi dolmuş. Lütfen yeni bir kod isteyin.',
    });
  }

  const matchesCode =
    Boolean(code) && safeEqual(String(code).trim(), String(record.code));
  const matchesToken =
    Boolean(token) && safeEqual(String(token).trim(), String(record.token));

  if (!matchesCode && !matchesToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Girilen 6 haneli kod veya kurtarma bağlantısı geçersiz.',
    });
  }

  await clearRecoveryRecord();
  return { ok: true, email: record.email };
}

export async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Geçerli bir Google kimlik belirteci (token) sağlanmadı.',
    });
  }

  let data;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!res.ok) {
      throw new Error(`Google tokeninfo status: ${res.status}`);
    }
    data = await res.json();
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Google kimliği doğrulanamadı. Lütfen tekrar deneyin.',
    });
  }

  const isVerified =
    data.email_verified === 'true' || data.email_verified === true;
  if (!isVerified || !data.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Google hesabı e-posta adresi doğrulanmamış.',
    });
  }

  const email = data.email.trim().toLowerCase();
  if (!isAllowedAdminEmail(email)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Bu Google hesabı (${email}) yönetim paneline erişim yetkisine sahip değil. Yalnızca yetkili hesap (${DEFAULT_ADMIN_EMAIL}) ile giriş yapılabilir.`,
    });
  }

  if (process.env.GOOGLE_CLIENT_ID) {
    const expectedAud = process.env.GOOGLE_CLIENT_ID.trim();
    if (data.aud !== expectedAud) {
      console.warn('Google token aud mismatch:', {
        received: data.aud,
        expected: expectedAud,
      });
    }
  }

  return {
    ok: true,
    email,
    name: data.name || 'Harun Yasir Sarıdaş',
  };
}

export function setAdminSession(event) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_LENGTH_SECONDS;
  const value = `${expiresAt}.${sign(String(expiresAt))}`;
  const reqUrl = getRequestURL(event);
  const isHttps =
    reqUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';
  setCookie(event, COOKIE_NAME, value, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
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
