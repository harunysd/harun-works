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
      <h1 class="blog-hero__title">Çalışma Notları / Blog</h1>
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

      <div
        v-if="sortedPosts.length"
        class="blog-list__grid"
        :class="{ 'blog-list__grid--single': sortedPosts.length === 1 }"
      >
        <article
          v-for="post in sortedPosts"
          :key="post.id"
          class="post-card"
          :class="{ 'post-card--featured': sortedPosts.length === 1 }"
        >
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

.blog-hero__title {
  margin: 0 0 2.2rem;
  font-size: clamp(2.4rem, 6vw, 5.2rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #ffffff;
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
  margin-top: clamp(3.5rem, 8vw, 6.5rem);
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
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin-top: 2rem;
  background: transparent;

  &--single {
    grid-template-columns: 1fr;
  }
}

.post-card {
  min-height: 22rem;
  border: 1px solid var(--blog-border);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.015);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.035);
  }

  &--featured {
    .post-card__link {
      @media (min-width: 800px) {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        align-items: stretch;
      }
    }

    .post-card__image-wrap {
      aspect-ratio: 16 / 10;
      height: 100%;

      @media (min-width: 800px) {
        border-right: 1px solid var(--blog-border);
      }
    }

    .post-card__body {
      padding: clamp(1.75rem, 3.5vw, 3rem);
      justify-content: center;
    }

    h3 {
      max-width: 26ch;
      margin: 1.5rem 0 1rem;
      font-size: clamp(1.5rem, 2.2vw, 2.2rem);
      font-weight: 600;
      line-height: 1.22;
    }

    p {
      max-width: 44ch;
      font-size: 1.02rem;
      line-height: 1.6;
    }

    .post-card__read {
      margin-top: 2rem;
      padding-top: 0;
    }
  }
}

.post-card__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.post-card__image-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #0d0d0d;
}

.post-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-card:hover .post-card__image {
  transform: scale(1.025);
}

.post-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: clamp(1.25rem, 2.5vw, 2rem);
}

.post-card__meta {
  color: var(--blog-muted);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-card h3 {
  margin: 1.25rem 0 0.85rem;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 600;
  line-height: 1.25;
  color: #ffffff;
}

.post-card p {
  margin: 0;
  color: var(--blog-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.post-card__read {
  margin-top: auto;
  padding-top: 1.75rem;
  color: var(--primary-color);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: gap 0.2s ease;
}

.post-card:hover .post-card__read {
  gap: 0.55rem;
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
