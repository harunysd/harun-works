import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '../../utils/admin-auth.js';

const ALLOWED_PATH = /^cms-media\/(blog|projects)\/[a-z0-9][a-z0-9._-]*$/;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
];

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    return await handleUpload({
      body,
      request: event.node.req,
      onBeforeGenerateToken: async (pathname) => {
        requireAdmin(event);

        if (!ALLOWED_PATH.test(pathname)) {
          throw new Error('Geçersiz medya dosyası yolu.');
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: 250 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      onUploadCompleted: async () => {},
    });
  } catch (error) {
    throw createError({
      statusCode: error?.statusCode || 400,
      statusMessage:
        error instanceof Error ? error.message : 'Yükleme başarısız.',
    });
  }
});
