const INLINE_IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const VIDEO_PATTERN = /^@\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const HEADING_2_PATTERN = /^##\s+(.+)$/;
const HEADING_3_PATTERN = /^###\s+(.+)$/;

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

function parseTableRow(line) {
  let cleaned = line.trim();
  if (cleaned.startsWith('|')) cleaned = cleaned.slice(1);
  if (cleaned.endsWith('|')) cleaned = cleaned.slice(0, -1);
  return cleaned.split('|').map((cell) => cell.trim());
}

function isTableDelimiter(line) {
  if (!line || !line.includes('-')) return false;
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function parseTableAlignments(line) {
  const cells = parseTableRow(line);
  return cells.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

export function parseArticleBody(value) {
  const lines = String(value || '').split(/\r?\n/);
  const blocks = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraphLines = [];
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    const image = line.match(INLINE_IMAGE_PATTERN);
    const video = line.match(VIDEO_PATTERN);
    const h2 = line.match(HEADING_2_PATTERN);
    const h3 = line.match(HEADING_3_PATTERN);

    // Check for GFM table: line contains pipe and next line is a table delimiter
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      isTableDelimiter(lines[i + 1].trim())
    ) {
      flushParagraph();
      const headers = parseTableRow(line);
      const alignments = parseTableAlignments(lines[i + 1].trim());
      const rows = [];
      i += 2;

      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine || !rowLine.includes('|')) break;
        rows.push(parseTableRow(rowLine));
        i++;
      }

      blocks.push({
        type: 'table',
        headers,
        alignments,
        rows,
      });
      continue;
    }

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
    } else if (h2) {
      flushParagraph();
      blocks.push({ type: 'heading', level: 2, text: h2[1].trim() });
    } else if (h3) {
      flushParagraph();
      blocks.push({ type: 'heading', level: 3, text: h3[1].trim() });
    } else if (!line) {
      flushParagraph();
    } else {
      paragraphLines.push(line);
    }

    i++;
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
        !VIDEO_PATTERN.test(normalized) &&
        !isTableDelimiter(normalized) &&
        !normalized.startsWith('|') &&
        !HEADING_2_PATTERN.test(normalized) &&
        !HEADING_3_PATTERN.test(normalized)
      );
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
