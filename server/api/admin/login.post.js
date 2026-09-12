import {
  setAdminSession,
  validateAdminPassword,
} from '../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!(await validateAdminPassword(body?.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Parola doğru değil.',
    });
  }
  setAdminSession(event);
  return { ok: true };
});
