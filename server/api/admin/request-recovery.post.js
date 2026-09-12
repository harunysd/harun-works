import { createRecoverySession } from '../../utils/admin-auth.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const requestUrl = getRequestURL(event);
  const baseDomain = `${requestUrl.protocol}//${requestUrl.host}`;

  const result = await createRecoverySession({
    email: body?.email,
    baseDomain,
  });

  return result;
});
