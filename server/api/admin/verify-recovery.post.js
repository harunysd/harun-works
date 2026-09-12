import {
  setAdminSession,
  verifyRecoveryCodeOrToken,
} from '../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const code = body?.code;
  const token = body?.token;

  if (!code && !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Doğrulama için 6 haneli kod veya kurtarma bağlantısı gereklidir.',
    });
  }

  const verified = await verifyRecoveryCodeOrToken({ code, token });
  setAdminSession(event);

  return {
    ok: true,
    email: verified.email,
  };
});
