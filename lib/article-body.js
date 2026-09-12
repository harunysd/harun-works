const INLINE_IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const VIDEO_PATTERN = /^@\[([^\]]*)\]\(([^)\s]+)\)\s*$/;

export function isSafeAssetUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  if (/^\/(?!\/)/.test(value)) return true;

  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function parseVideoSource(value, title = 'Video') {
  if (!isSafeAssetUrl(value)) return null;

  try {
    const url = new URL(value, 'https://harun.works');
    const hostname = url.hostname.replace(/^www\./, '');

    if (
      hostname === 'youtu.be' ||
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com')
    ) {
      const segments = url.pathname.split('/').filter(Boolean);
      const id =
        hostname === 'youtu.be'
          ? segments[0]
          : url.searchParams.get('v') ||
            (['embed', 'shorts'].includes(segments[0]) ? segments[1] : '');
      if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id || '')) return null;
      return {
        type: 'embed',
        provider: 'YouTube',
        title,
        src: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    }

    if (hostname === 'drive.google.com') {
      const id =
        url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ||
        url.searchParams.get('id');
      if (!/^[a-zA-Z0-9_-]{10,}$/.test(id || '')) return null;
      return {
        type: 'embed',
        provider: 'Google Drive',
        title,
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
    }
  } catch {
    return null;
  }

  return { type: 'video', title, src: value };
}

export function parseArticleBody(value) {
  const blocks = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraphLines = [];
  };

  for (const rawLine of String(value || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    const image = line.match(INLINE_IMAGE_PATTERN);
    const video = line.match(VIDEO_PATTERN);

    if (image && isSafeAssetUrl(image[2])) {
      flushParagraph();
      blocks.push({ type: 'image', alt: image[1].trim(), src: image[2] });
    } else if (video) {
      const videoBlock = parseVideoSource(video[2], video[1].trim() || 'Video');
      if (videoBlock) {
        flushParagraph();
        blocks.push(videoBlock);
      } else {
        paragraphLines.push(line);
      }
    } else if (!line) {
      flushParagraph();
    } else {
      paragraphLines.push(line);
    }
  }

  flushParagraph();
  return blocks;
}

export function stripArticleImages(value) {
  return String(value || '')
    .split(/\r?\n/)
    .filter((line) => {
      const normalized = line.trim();
      return (
        !INLINE_IMAGE_PATTERN.test(normalized) &&
        !VIDEO_PATTERN.test(normalized)
      );
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
