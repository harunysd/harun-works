import {
  requireAdmin,
  setStoredAdminPassword,
} from '../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const body = await readBody(event);
  const newPassword = body?.newPassword;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Yeni parola en az 6 karakter uzunluğunda olmalıdır.',
    });
  }

  await setStoredAdminPassword(newPassword);

  return {
    ok: true,
    message: 'Yönetim parolası başarıyla güncellendi.',
  };
});
