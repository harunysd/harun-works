import { get, list, put } from '@vercel/blob';
import {
  defaultSiteContent,
  normalizeSiteContent,
} from '../../lib/site-content-defaults.js';

const CONTENT_PATH = 'cms/site-content.json';
const CONTENT_PREFIX = 'cms/site-content-';

function cloneDefaults() {
  return structuredClone(defaultSiteContent);
}

export async function readSiteContent() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return cloneDefaults();

  let result = await get(CONTENT_PATH, {
    access: 'private',
    useCache: false,
  });

  if (!result) {
    const { blobs } = await list({ prefix: CONTENT_PREFIX });
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt),
    )[0];

    if (!latest) return cloneDefaults();
    result = await get(latest.url, { access: 'private', useCache: false });
  }

  if (!result || result.statusCode !== 200) return cloneDefaults();

  const value = await new Response(result.stream).json();
  const normalized = normalizeSiteContent(value);

  const defaultPost = defaultSiteContent.blogPosts[0];
  const existingPost = normalized.blogPosts?.find(
    (p) => p.slug === defaultPost.slug,
  );
  if (!existingPost || existingPost.body !== defaultPost.body) {
    const otherPosts = (normalized.blogPosts || []).filter(
      (p) => p.slug !== defaultPost.slug,
    );
    const updated = {
      ...normalized,
      blogPosts: [defaultPost, ...otherPosts],
    };
    try {
      await writeSiteContent(updated);
      return normalizeSiteContent(updated);
    } catch (e) {
      console.error('Failed to auto-sync blog posts to blob:', e);
      return updated;
    }
  }

  return normalized;
}

export async function writeSiteContent(value) {
  const normalized = normalizeSiteContent(value);
  await put(CONTENT_PATH, JSON.stringify(normalized), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return normalized;
}
