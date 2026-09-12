<script setup>
import { stripArticleImages } from '~/lib/article-body.js';

const { blogPosts, settings } = useSiteContent();

useHead({
  title: 'Blog',
  meta: [
    {
      name: 'description',
      content:
        "Harun Yasir Sarıdaş'ın çalışma notları, yazıları ve üretim günlüğü.",
    },
  ],
});

const sortedPosts = computed(() =>
  [...blogPosts.value].sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
  ),
);

function formatDate(value) {
  if (!value) return 'Taslak';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function excerpt(post) {
  return post.excerpt || stripArticleImages(post.body).slice(0, 180);
}
</script>

<template>
  <main class="blog-page">
    <header class="blog-hero">
      <p class="eyebrow">ÇALIŞMA NOTLARI / BLOG</p>
      <h1>Üretim günlüğü.</h1>
      <p class="blog-hero__intro">
        Şehir, afet yönetimi, mekânsal veri ve dijital sistemler üzerine notlar;
        devam eden çalışmaların arka planı ve öğrendiklerim.
      </p>
      <div class="blog-hero__meta">
        <span>{{ sortedPosts.length }} yazı</span>
        <a :href="`mailto:${settings.email}`">{{ settings.email }}</a>
      </div>
    </header>

    <section class="blog-list" aria-labelledby="blog-list-title">
      <div class="blog-list__heading">
        <h2 id="blog-list-title">Son yazılar</h2>
        <span aria-hidden="true">↘</span>
      </div>

      <div v-if="sortedPosts.length" class="blog-list__grid">
        <article v-for="post in sortedPosts" :key="post.id" class="post-card">
          <NuxtLink :to="`/blog/${post.slug}`" class="post-card__link">
            <div v-if="post.coverImage" class="post-card__image-wrap">
              <img
                :src="post.coverImage"
                :alt="post.title"
                class="post-card__image"
              />
            </div>
            <div class="post-card__body">
              <div class="post-card__meta">
                <span>{{ post.category || 'Notlar' }}</span>
                <time :datetime="post.publishedAt">{{
                  formatDate(post.publishedAt)
                }}</time>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ excerpt(post) }}</p>
              <span class="post-card__read"
                >Yazıyı oku <span aria-hidden="true">↗</span></span
              >
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-else class="blog-empty" role="status">
        <span class="blog-empty__index">01</span>
        <div>
          <h3>İlk yazı yakında burada.</h3>
          <p>
            Çalışma notları, saha gözlemleri ve yeni projeler için bu alanı
            kullanacağım.
          </p>
        </div>
      </div>
    </section>

    <footer class="blog-footer">
      <NuxtLink to="/"
        >Ana sayfaya dön <span aria-hidden="true">↗</span></NuxtLink
      >
      <span>{{ new Date().getFullYear() }} / HARUN WORKS</span>
    </footer>
  </main>
</template>

<style lang="scss" scoped>
.blog-page {
  --blog-border: rgba(247, 247, 247, 0.13);
  --blog-muted: rgba(247, 247, 247, 0.62);
  min-height: 100vh;
  padding: clamp(7rem, 14vw, 12rem) clamp(1.25rem, 7vw, 7rem) 4rem;
  color: var(--ff-color);
  background: var(--surface-color);
}

.blog-hero,
.blog-list,
.blog-footer {
  width: min(1160px, 100%);
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 1.5rem;
  color: var(--primary-color);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  font-weight: 700;
}

.blog-hero h1 {
  max-width: 9ch;
  margin: 0;
  font-size: clamp(3.5rem, 10vw, 9rem);
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.9;
}

.blog-hero__intro {
  max-width: 38rem;
  margin: clamp(2.5rem, 6vw, 5rem) 0 2rem;
  color: var(--blog-muted);
  font-size: clamp(1rem, 1.6vw, 1.4rem);
  line-height: 1.5;
}

.blog-hero__meta,
.post-card__meta,
.blog-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.blog-hero__meta {
  padding-top: 1rem;
  border-top: 1px solid var(--blog-border);
  color: var(--blog-muted);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.blog-hero__meta a {
  color: inherit;
  text-decoration: none;
}

.blog-list {
  margin-top: clamp(6rem, 14vw, 12rem);
}

.blog-list__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--blog-border);
}

.blog-list__heading h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  font-weight: 500;
}

.blog-list__heading span {
  color: var(--primary-color);
  font-size: 2rem;
}

.blog-list__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 1px;
  background: var(--blog-border);
}

.post-card {
  min-height: 22rem;
  background: var(--surface-color);
}

.post-card__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;
  transition: background-color 220ms ease;
}

.post-card__link:hover,
.post-card__link:focus-visible {
  background: rgba(255, 230, 237, 0.07);
}

.post-card__image-wrap {
  aspect-ratio: 16 / 8;
  overflow: hidden;
}

.post-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.8);
}

.post-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.post-card__meta {
  color: var(--blog-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-card h3 {
  max-width: 18ch;
  margin: 2.2rem 0 1rem;
  font-size: clamp(1.6rem, 2.8vw, 2.8rem);
  font-weight: 500;
  line-height: 1.05;
}

.post-card p {
  max-width: 42ch;
  margin: 0;
  color: var(--blog-muted);
  line-height: 1.55;
}

.post-card__read {
  margin-top: auto;
  padding-top: 2.5rem;
  color: var(--primary-color);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.blog-empty {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 2rem;
  padding: 4rem 0;
  border-bottom: 1px solid var(--blog-border);
}

.blog-empty__index {
  color: var(--primary-color);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
}

.blog-empty h3 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.7rem, 3vw, 2.8rem);
  font-weight: 500;
}

.blog-empty p {
  max-width: 36rem;
  margin: 0;
  color: var(--blog-muted);
  line-height: 1.5;
}

.blog-footer {
  margin-top: clamp(5rem, 12vw, 10rem);
  padding-top: 1rem;
  border-top: 1px solid var(--blog-border);
  color: var(--blog-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.blog-footer a {
  color: var(--ff-color);
  text-decoration: none;
}

@media (max-width: 700px) {
  .blog-page {
    padding-top: 6rem;
  }

  .blog-list__grid {
    grid-template-columns: 1fr;
  }

  .blog-empty {
    grid-template-columns: 2.5rem 1fr;
    gap: 1rem;
  }

  .blog-footer {
    flex-direction: column;
  }
}
</style>
