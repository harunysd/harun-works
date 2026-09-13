const { get, put } = require('@vercel/blob');

const BLOB_TOKEN = 'vercel_blob_rw_rjkZrm9hF47ZpPW7_AGhln0SvSOMorYDfliGY7SSunjRMoJ';
const CONTENT_PATH = 'cms/site-content.json';

const HARUN_WORKS_IMG = 'https://rjkzrm9hf47zppw7.private.blob.vercel-storage.com/cms-media/blog/harun-works-home.png';
const EURASIA_IMG = 'https://rjkzrm9hf47zppw7.private.blob.vercel-storage.com/cms-media/blog/eurasia-home.png';

const newPosts = [
  {
    id: 'post-harun-works-nasil-oldu',
    slug: 'harun-works-nasil-oldu',
    title: 'Kendi Sitem: harun.works Nasıl Oldu',
    excerpt: 'Kendi kişisel sitemimi nasıl yaptım — bir GitHub projesi, AI yardımı ve birkaç gece.',
    category: 'Notlar',
    publishedAt: '2026-09-13',
    coverImage: HARUN_WORKS_IMG,
    coverCaption: 'harun.works ana sayfası',
    body: `Uzun süredir kişisel bir siteye ihtiyacım olduğunu biliyordum ama hiç kolları sıvayıp başlamamıştım. Geçen hafta sonunda oldu.

## Başlangıç: Doğru Temeli Bulmak

ChatGPT ile portfolyo siteleri tararken Ukrayna'lı bir developer olan **Bogdan Kostyuk**'un portfolyosuna denk geldim. OGL (WebGL) tabanlı o arka plan animasyonu, sadeliği ve hissiyle tam aradığım şeydi. Üstelik repo açık kaynak ve Nuxt 3 ile yazılmıştı.

Planım basitti: siteyi klonla, sahibini değiştir, yayınla. Ama biraz daha uzadı tabii.

## İçerik: Google Drive ve LinkedIn

Projelerimi uzun yıllardır Google Drive'da dağınık dosyalar halinde tutuyordum. **Codex** bu klasörleri tarayıp eski çalışmalarımı inceleyerek proje içeriklerini derledi. About sayfası için de LinkedIn profilimi kullandık — zaten orada olan bir biyografiyi yeniden yazmak yerine oradan çektik.

## Teknik Taraf

Site Nuxt 3 ile çalışıyor. Ana sayfadaki WebGL animasyonu Bogdan'ın orijinal OGL implementasyonu — bunu değiştirmedik, sadece HARUN / WORKS kompozisyonuna uyarladık.

Benim eklediğim asıl parça: **Google ile giriş** ve üzerine kurulu bir admin paneli. Artık kod yazmadan yeni yazılar ekleyebiliyorum, site içeriğini güncelleyebiliyorum. Oturum yönetimi, Vercel Blob depolama, her şey yerli yerinde.

## Deploy

Site **Vercel**'de çalışıyor, domain **Spaceship**'ten alındı. DNS ayarları da **Antigravity** tarafından otomatik yapıldı.

Sonuç olarak: açık kaynak bir proje + AI yardımı + birkaç gece = [harun.works](https://harun.works).`,
  },
  {
    id: 'post-eurasia-business-gateway',
    slug: 'eurasia-business-gateway',
    title: 'Bir Arkadaş İçin: Eurasia Business Gateway',
    excerpt: 'Bir arkadaşım iş geliştirme platformu için site istedi. Üç dil, admin panel, ChatGPT tasarımlı logo.',
    category: 'Projeler',
    publishedAt: '2026-09-13',
    coverImage: EURASIA_IMG,
    coverCaption: 'Eurasia Business Gateway ana sayfası',
    body: `Bir arkadaşım Türkiye, Rusya ve İngiltere pazarlarına yönelik bir iş geliştirme platformu için site yaptırmak istedi: **Eurasia Business Gateway**.

## Ne İstediler?

İstek basitti: kurumsal ama modern görünsün, birden fazla dilde çalışsın, içerikleri kendileri güncelleyebilsin.

## Ne Yaptık?

- **3 dil desteği:** Türkçe, İngilizce ve Rusça. Ziyaretçi dil seçebiliyor, içerikler tam lokalize.
- **Admin paneli:** Sayfalar, içerikler ve duyurular admin üzerinden yönetiliyor, kod gerektirmiyor.
- **Logo:** ChatGPT ile üretildi. Birkaç iterasyonla markayla uyumlu, temiz bir kimliğe ulaştık.

Teknik altyapı Vercel üzerinde, modern bir JS framework ile kurulu.

## Süreç

Proje kapsamı net ve sınırlıydı, bu yüzden hızlı ilerledi. AI destekli geliştirme araçları bu tür odaklı projeleri gerçekten hızlandırıyor — altyapıyı kurmak, çeviriyi düzenlemek, paneli bağlamak; bunların hepsi çok daha az zaman aldı.

Canlıya alındı, çalışıyor.`,
  },
];

process.env.BLOB_READ_WRITE_TOKEN = BLOB_TOKEN;

(async () => {
  // Read current content
  let current;
  try {
    const result = await get(CONTENT_PATH, { access: 'private', useCache: false });
    if (result && result.statusCode === 200) {
      current = await new Response(result.stream).json();
      console.log('Loaded current content. Blog posts:', current.blogPosts?.length);
    }
  } catch(e) {
    console.error('Read failed:', e.message);
  }

  if (!current) {
    const fallback = await fetch('https://harun.works/api/site-content').then(r => r.json());
    current = fallback;
    console.log('Used API fallback. Blog posts:', current.blogPosts?.length);
  }

  // Add new posts (prepend, most recent first)
  const existingIds = new Set((current.blogPosts || []).map(p => p.id));
  const postsToAdd = newPosts.filter(p => !existingIds.has(p.id));
  
  if (postsToAdd.length === 0) {
    console.log('Posts already exist, nothing to add.');
    return;
  }

  const updated = {
    ...current,
    blogPosts: [...postsToAdd, ...(current.blogPosts || [])],
  };

  // Write back to blob
  await put(CONTENT_PATH, JSON.stringify(updated), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    token: BLOB_TOKEN,
  });

  console.log('SUCCESS! Added posts:', postsToAdd.map(p => p.slug).join(', '));
  console.log('Total blog posts now:', updated.blogPosts.length);
})();
