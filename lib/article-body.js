const INLINE_IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const VIDEO_PATTERN = /^@\[([^\]]*)\]\(([^)\s]+)\)\s*$/;
const HEADING_2_PATTERN = /^##\s+(.+)$/;
const HEADING_3_PATTERN = /^###\s+(.+)$/;
const BLOCKQUOTE_PATTERN = /^>\s*(.+)$/;
const UNORDERED_LIST_PATTERN = /^[-*]\s+(.+)$/;
const ORDERED_LIST_PATTERN = /^(\d+)\.\s+(.+)$/;
const HR_PATTERN = /^(\*{3,}|-{3,}|_{3,})$/;

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

function parseImageMeta(rawAlt) {
  if (!rawAlt || typeof rawAlt !== 'string') {
    return { alt: 'Görsel', caption: '', style: 'italic-thin', align: 'center' };
  }

  const parts = rawAlt.split('|').map((p) => p.trim()).filter(Boolean);
  const caption = parts[0] || '';
  let style = 'italic-thin'; // default: "yatay ince" (italic + light weight)
  let align = 'center';

  for (let i = 1; i < parts.length; i++) {
    const flag = parts[i].toLowerCase();
    if (flag.includes('duz') || flag.includes('düz') || flag === 'normal') {
      style = 'normal-thin';
    } else if (flag.includes('kalin') || flag.includes('kalın') || flag === 'bold') {
      style = 'bold';
    } else if (flag.includes('yatay') || flag.includes('yatik') || flag.includes('yatık') || flag.includes('italic')) {
      style = 'italic-thin';
    }

    if (flag.includes('sol') || flag === 'left') {
      align = 'left';
    } else if (flag.includes('sag') || flag.includes('sağ') || flag === 'right') {
      align = 'right';
    } else if (flag.includes('orta') || flag.includes('merkez') || flag === 'center') {
      align = 'center';
    }
  }

  return { alt: caption || 'Görsel', caption, style, align };
}

export function renderInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  html = html.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="article-link">$1</a>',
  );

  return html;
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
    const blockquote = line.match(BLOCKQUOTE_PATTERN);
    const unordered = line.match(UNORDERED_LIST_PATTERN);
    const ordered = line.match(ORDERED_LIST_PATTERN);
    const isHr = HR_PATTERN.test(line);

    // GFM Table
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

    // Image with caption
    if (image && isSafeAssetUrl(image[2])) {
      flushParagraph();
      const meta = parseImageMeta(image[1]);
      let caption = meta.caption;
      let style = meta.style;
      let align = meta.align;

      // Check if immediately following line is a dedicated caption: *caption* or _caption_
      if (!caption && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextItalic =
          nextLine.match(/^\*([^*]+)\*$/) || nextLine.match(/^_([^_]+)_$/);
        if (nextItalic) {
          caption = nextItalic[1].trim();
          i++; // consume caption line
        }
      }

      blocks.push({
        type: 'image',
        alt: meta.alt,
        src: image[2],
        caption,
        captionStyle: style,
        captionAlign: align,
      });
      i++;
      continue;
    }

    // Embed / Video
    if (video) {
      const videoBlock = parseVideoSource(video[2], video[1].trim() || 'Video');
      if (videoBlock) {
        flushParagraph();
        blocks.push(videoBlock);
      } else {
        paragraphLines.push(line);
      }
      i++;
      continue;
    }

    // Headings
    if (h2) {
      flushParagraph();
      blocks.push({ type: 'heading', level: 2, text: h2[1].trim() });
      i++;
      continue;
    }

    if (h3) {
      flushParagraph();
      blocks.push({ type: 'heading', level: 3, text: h3[1].trim() });
      i++;
      continue;
    }

    // Blockquote
    if (blockquote) {
      flushParagraph();
      const quoteLines = [blockquote[1].trim()];
      i++;
      while (i < lines.length) {
        const nextQ = lines[i].trim().match(BLOCKQUOTE_PATTERN);
        if (!nextQ) break;
        quoteLines.push(nextQ[1].trim());
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    // Unordered List
    if (unordered) {
      flushParagraph();
      const items = [unordered[1].trim()];
      i++;
      while (i < lines.length) {
        const nextItem = lines[i].trim().match(UNORDERED_LIST_PATTERN);
        if (!nextItem) break;
        items.push(nextItem[1].trim());
        i++;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered List
    if (ordered) {
      flushParagraph();
      const items = [ordered[2].trim()];
      i++;
      while (i < lines.length) {
        const nextItem = lines[i].trim().match(ORDERED_LIST_PATTERN);
        if (!nextItem) break;
        items.push(nextItem[2].trim());
        i++;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Divider
    if (isHr) {
      flushParagraph();
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (!line) {
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
        !HEADING_3_PATTERN.test(normalized) &&
        !HR_PATTERN.test(normalized)
      );
    })
    .map((line) => line.replace(/^[>*\-#\d.]+\s+/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
