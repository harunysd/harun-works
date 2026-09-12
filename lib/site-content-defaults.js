export const defaultSiteContent = {
  settings: {
    email: 'harunysd@gmail.com',
    secondaryEmail: 'iletisim@harun.works',
    displayName: 'Harun Yasir SARIDAŞ',
    tagline: 'Şehir Planlama · Afet Yönetimi · CBS · Dijital Sistemler',
    aboutText: `Şehir planlama, afet yönetimi, coğrafi bilgi sistemleri (CBS) ve dijital ürün geliştirme ekseninde çalışıyorum. Mekânsal veriyi; saha operasyonları, karar destek süreçleri ve kullanıcı odaklı yazılım çözümleriyle bir araya getiriyorum.

İBB AKOM’da afet ve kriz yönetimi operasyonlarında görev alıyor; olay verilerinin doğrulanması, operasyonel raporlama, mekânsal veri altyapıları ve karar destek sistemlerinin geliştirilmesi süreçlerine katkı sunuyorum. Bunun yanı sıra tarihsel arşivleri dijitalleştiriyor, kapalı devre yapay zekâ ve otomasyon araçları ile bağımsız web uygulamaları geliştiriyorum.

Mimar Sinan Güzel Sanatlar Üniversitesi Şehir ve Bölge Planlama Bölümü mezunuyum. Yıldız Teknik Üniversitesi’nde Kentsel Dönüşüm ve Planlama yüksek lisans eğitimimi sürdürüyorum. 2025 yılında ABD Dışişleri Bakanlığı’nın IVLP programı kapsamında afet yönetimi ve kentsel arama-kurtarma sistemlerini yerinde inceleyerek farklı kurumsal uygulamaları değerlendirdim.`,
    contactText: 'Bana bir e-posta gönderin',
  },
  blogPosts: [],
  projectOverrides: [],
};

function text(value, fallback = '', maxLength = 10_000) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().slice(0, maxLength);
  return normalized || fallback;
}

function date(value, fallback = '') {
  const normalized = text(value, fallback, 40);
  return Number.isNaN(Date.parse(normalized)) ? fallback : normalized;
}

function assetUrl(value, fallback = '') {
  const normalized = text(value, fallback, 2_000);
  if (!normalized || /^\/(?!\/)/.test(normalized)) return normalized;

  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol) ? normalized : fallback;
  } catch {
    return fallback;
  }
}

function externalUrl(value) {
  const normalized = assetUrl(value);
  return /^https?:\/\//.test(normalized) ? normalized : '';
}

export function slugifyContent(value) {
  return text(value, '', 160)
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function normalizeSettings(value) {
  const defaults = defaultSiteContent.settings;
  const email = text(value?.email, defaults.email, 254);
  const secondaryEmail = text(
    value?.secondaryEmail,
    defaults.secondaryEmail,
    254,
  );

  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : defaults.email,
    secondaryEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(secondaryEmail)
      ? secondaryEmail
      : defaults.secondaryEmail,
    displayName: text(value?.displayName, defaults.displayName, 120),
    tagline: text(value?.tagline, defaults.tagline, 240),
    aboutText: text(value?.aboutText, defaults.aboutText, 30_000),
    contactText: text(value?.contactText, defaults.contactText, 240),
  };
}

function normalizeBlogPost(value) {
  if (!value || typeof value !== 'object') return null;

  const title = text(value.title, '', 240);
  const body = text(value.body, '', 200_000);
  const slug = slugifyContent(value.slug || title);
  if (!title || !body || !slug) return null;

  return {
    id: text(value.id, `post-${slug}`, 160),
    title,
    slug,
    excerpt: text(value.excerpt, '', 2_000),
    category: text(value.category, 'Notlar', 120),
    publishedAt: date(value.publishedAt),
    coverImage: assetUrl(value.coverImage),
    body,
  };
}

function normalizeProject(value) {
  if (!value || typeof value !== 'object') return null;

  const title = text(value.title, '', 240);
  const pathSlug = String(value._path || '')
    .split('/')
    .filter(Boolean)
    .pop();
  const slug = slugifyContent(pathSlug || value.slug || title);
  if (!title || !slug) return null;

  const description = text(value.description, '', 5_000);
  const tags = Array.isArray(value.tags)
    ? value.tags
        .map((tag) => text(tag, '', 80))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return {
    _path: `/project/${slug}`,
    title,
    description,
    tags,
    previewImage: assetUrl(value.previewImage, '/logo.png'),
    image: assetUrl(value.image, assetUrl(value.previewImage, '/logo.png')),
    bodyText: text(value.bodyText, description, 100_000),
    live: externalUrl(value.live),
    hidden: value.hidden === true,
    isNew: value.isNew === true,
    createdAt: date(value.createdAt, new Date(0).toISOString()),
  };
}

function uniqueNormalized(values, normalizer, key) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .slice(0, 500)
    .map(normalizer)
    .filter((item) => {
      if (!item || seen.has(item[key])) return false;
      seen.add(item[key]);
      return true;
    });
}

export function normalizeSiteContent(value) {
  return {
    settings: normalizeSettings(value?.settings),
    blogPosts: uniqueNormalized(value?.blogPosts, normalizeBlogPost, 'slug'),
    projectOverrides: uniqueNormalized(
      value?.projectOverrides,
      normalizeProject,
      '_path',
    ),
  };
}
