import {
  setAdminSession,
  verifyGoogleIdToken,
} from '../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const credential = body?.credential || body?.idToken;

  if (!credential) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Google kimlik belirteci (credential) bulunamadı.',
    });
  }

  const verified = await verifyGoogleIdToken(credential);
  setAdminSession(event);

  return {
    ok: true,
    email: verified.email,
    name: verified.name,
  };
});
