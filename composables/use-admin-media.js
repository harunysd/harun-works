import { slugifyContent } from '~/lib/site-content-defaults.js';

const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export const ADMIN_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/avif';
export const ADMIN_VIDEO_TYPES = 'video/mp4,video/webm';

function uploadedMediaUrl(pathname) {
  return `/api/media/${pathname
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`;
}

export function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      reject(new Error('Görsel okunamadı.'));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

export function useAdminMedia() {
  const uploadState = reactive({
    cover: false,
    inline: false,
    video: false,
    project: false,
  });
  const uploadProgress = reactive({
    cover: 0,
    inline: 0,
    video: 0,
    project: 0,
  });

  async function uploadMedia(
    file,
    { folder, stateKey, allowedTypes, maxSize },
  ) {
    if (!file || !allowedTypes.includes(file.type)) {
      throw new Error('Desteklenmeyen dosya türü.');
    }
    if (file.size > maxSize) {
      throw new Error('Dosya izin verilen boyutu aşıyor.');
    }

    const originalStem = file.name.replace(/\.[^.]+$/, '');
    const filename = `${slugifyContent(originalStem) || 'gorsel'}.${
      EXTENSION_BY_TYPE[file.type]
    }`;
    const pathname = `cms-media/${folder}/${Date.now()}-${filename}`;

    uploadState[stateKey] = true;
    uploadProgress[stateKey] = 0;
    try {
      const { upload } = await import('@vercel/blob/client');
      const blob = await upload(pathname, file, {
        access: 'private',
        handleUploadUrl: '/api/admin/media-upload',
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          uploadProgress[stateKey] = Math.round(percentage);
        },
      });
      return uploadedMediaUrl(blob.pathname);
    } finally {
      uploadState[stateKey] = false;
    }
  }

  function uploadImage(file, folder, stateKey) {
    return uploadMedia(file, {
      folder,
      stateKey,
      allowedTypes: ADMIN_IMAGE_TYPES,
      maxSize: 12 * 1024 * 1024,
    });
  }

  return { uploadState, uploadProgress, uploadMedia, uploadImage };
}
