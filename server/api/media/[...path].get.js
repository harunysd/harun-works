import { get } from '@vercel/blob';

const MEDIA_PATH = /^cms-media\/(blog|projects)\/[a-z0-9][a-z0-9._-]*$/;

export default defineEventHandler(async (event) => {
  const pathname = decodeURIComponent(event.context.params?.path || '');
  if (!MEDIA_PATH.test(pathname)) {
    throw createError({ statusCode: 404, statusMessage: 'Görsel bulunamadı.' });
  }

  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) {
    throw createError({ statusCode: 404, statusMessage: 'Görsel bulunamadı.' });
  }

  return new Response(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
