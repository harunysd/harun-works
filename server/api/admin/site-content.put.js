import { requireAdmin } from '../../utils/admin-auth.js';
import { writeSiteContent } from '../../utils/site-content.js';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody(event);
  const serialized = JSON.stringify(body || {});
  if (serialized.length > 500_000) {
    throw createError({ statusCode: 413, statusMessage: 'İçerik çok büyük.' });
  }
  return writeSiteContent(body);
});
