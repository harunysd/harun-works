import { Readable } from 'node:stream';
import { get } from '@vercel/blob';

// Blob appends a case-sensitive random suffix to otherwise normalized names.
const MEDIA_PATH = /^cms-media\/(blog|projects)\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export default defineEventHandler(async (event) => {
  const pathname = decodeURIComponent(event.context.params?.path || '');
  if (!MEDIA_PATH.test(pathname)) {
    throw createError({ statusCode: 404, statusMessage: 'Görsel bulunamadı.' });
  }

  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) {
    throw createError({ statusCode: 404, statusMessage: 'Görsel bulunamadı.' });
  }

  setResponseHeader(event, 'Content-Type', result.blob.contentType);
  if (result.blob.size) {
    setResponseHeader(event, 'Content-Length', result.blob.size);
  }
  setResponseHeader(
    event,
    'Cache-Control',
    'public, max-age=31536000, immutable',
  );
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');

  const stream =
    result.stream instanceof Readable
      ? result.stream
      : Readable.fromWeb(result.stream);
  return sendStream(event, stream);
});
