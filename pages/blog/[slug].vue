<script setup>
import {
  parseArticleBody,
  renderInlineMarkdown,
} from '~/lib/article-body.js';

const route = useRoute();
const { blogPosts, settings } = useSiteContent();

const post = computed(() =>
  blogPosts.value.find((item) => item.slug === route.params.slug),
);
const articleBlocks = computed(() => parseArticleBody(post.value?.body));

useHead(() => ({
  title: post.value?.title || 'Blog',
  meta: [
    {
      name: 'description',
      content: post.value?.excerpt || 'Harun Works blog yazısı.',
    },
  ],
}));

function formatDate(value) {
  if (!value) return 'Taslak';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
</script>

<template>
  <main v-if="post" class="article-page">
    <header class="article-header">
      <NuxtLink to="/blog" class="article-back">← Tüm yazılar</NuxtLink>
      <div class="article-meta">
        <span>{{ post.category || 'Notlar' }}</span>
        <time :datetime="post.publishedAt">{{
          formatDate(post.publishedAt)
        }}</time>
      </div>
      <h1>{{ post.title }}</h1>
      <p v-if="post.excerpt" class="article-excerpt">{{ post.excerpt }}</p>
    </header>

    <div v-if="post.coverImage" class="article-cover">
      <img :src="post.coverImage" :alt="post.title" />
    </div>

    <article class="article-body">
      <template
        v-for="(block, index) in articleBlocks"
        :key="`${block.type}-${index}`"
      >
        <figure v-if="block.type === 'image'" class="article-inline-image">
          <img
            :src="block.src"
            :alt="block.alt"
            loading="lazy"
            decoding="async"
          />
          <figcaption
            v-if="block.caption"
            :class="[
              'article-caption',
              `article-caption--${block.captionStyle || 'italic-thin'}`,
              `article-caption--${block.captionAlign || 'center'}`,
            ]"
            v-html="renderInlineMarkdown(block.caption)"
          />
        </figure>
        <figure v-else-if="block.type === 'embed'" class="article-video">
          <iframe
            :src="block.src"
            :title="`${block.provider}: ${block.title}`"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
          <figcaption v-if="block.title" class="article-caption article-caption--italic-thin">{{ block.title }}</figcaption>
        </figure>
        <figure v-else-if="block.type === 'video'" class="article-video">
          <video
            :aria-label="block.title"
            controls
            preload="metadata"
            playsinline
          >
            <source :src="block.src" />
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
          <figcaption v-if="block.title" class="article-caption article-caption--italic-thin">{{ block.title }}</figcaption>
        </figure>
        <h2
          v-else-if="block.type === 'heading' && block.level === 2"
          class="article-heading-2"
          v-html="renderInlineMarkdown(block.text)"
        />
        <h3
          v-else-if="block.type === 'heading' && block.level === 3"
          class="article-heading-3"
          v-html="renderInlineMarkdown(block.text)"
        />
        <blockquote
          v-else-if="block.type === 'blockquote'"
          class="article-blockquote"
          v-html="renderInlineMarkdown(block.text)"
        />
        <ul
          v-else-if="block.type === 'list' && !block.ordered"
          class="article-list"
        >
          <li
            v-for="(item, itemIndex) in block.items"
            :key="itemIndex"
            v-html="renderInlineMarkdown(item)"
          />
        </ul>
        <ol
          v-else-if="block.type === 'list' && block.ordered"
          class="article-list article-list--ordered"
        >
          <li
            v-for="(item, itemIndex) in block.items"
            :key="itemIndex"
            v-html="renderInlineMarkdown(item)"
          />
        </ol>
        <hr v-else-if="block.type === 'hr'" class="article-divider" />
        <div v-else-if="block.type === 'table'" class="article-table-wrapper">
          <table class="article-table">
            <thead v-if="block.headers?.length">
              <tr>
                <th
                  v-for="(header, hIndex) in block.headers"
                  :key="`th-${hIndex}`"
                  :style="{ textAlign: block.alignments?.[hIndex] || 'left' }"
                  v-html="renderInlineMarkdown(header)"
                />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIndex) in block.rows" :key="`tr-${rIndex}`">
                <td
                  v-for="(cell, cIndex) in row"
                  :key="`td-${cIndex}`"
                  :style="{ textAlign: block.alignments?.[cIndex] || 'left' }"
                  v-html="renderInlineMarkdown(cell)"
                />
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="article-p" v-html="renderInlineMarkdown(block.text)" />
      </template>
    </article>

    <footer class="article-footer">
      <a :href="`mailto:${settings.email}`">Bir şey konuşalım ↗</a>
      <NuxtLink to="/blog">Diğer yazılar</NuxtLink>
    </footer>
  </main>

  <main v-else class="article-missing">
    <p>Bu yazı bulunamadı.</p>
    <NuxtLink to="/blog">Bloga dön ↗</NuxtLink>
  </main>
</template>

<style lang="scss" scoped>
.article-page,
.article-missing {
  min-height: 100vh;
  padding: clamp(7rem, 14vw, 12rem) clamp(1.25rem, 7vw, 7rem) 5rem;
  background: var(--surface-color);
  color: var(--ff-color);
}

.article-header,
.article-body,
.article-footer {
  width: min(820px, 100%);
  margin-inline: auto;
}

.article-back,
.article-footer a,
.article-missing a {
  color: var(--primary-color);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 5rem;
  padding: 1rem 0;
  border-block: 1px solid rgba(247, 247, 247, 0.13);
  color: rgba(247, 247, 247, 0.62);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-header h1 {
  margin: 2rem 0 1.5rem;
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.article-excerpt {
  max-width: 44rem;
  margin: 0;
  color: rgba(247, 247, 247, 0.68);
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  line-height: 1.5;
}

.article-cover {
  width: min(1160px, 100%);
  margin: clamp(4rem, 10vw, 8rem) auto;
}

.article-cover img {
  display: block;
  width: 100%;
  max-height: 55vh;
  object-fit: cover;
}

.article-body {
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.75;
}

.article-body p {
  margin: 0 0 2rem;
}

.article-inline-image {
  width: min(1040px, calc(100vw - 2.5rem));
  margin: clamp(3rem, 7vw, 5rem) 50%;
  transform: translateX(-50%);
}

.article-inline-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 75vh;
  object-fit: contain;
}

.article-caption {
  display: block;
  width: 100%;
  margin-top: 0.9rem;
  color: rgba(247, 247, 247, 0.65);
  font-size: clamp(0.84rem, 1.15vw, 0.96rem);
  line-height: 1.55;
  letter-spacing: 0.02em;
  text-align: center;

  /* "Yatay ince" (italic + light weight 300) */
  font-style: italic;
  font-weight: 300;

  &--italic-thin {
    font-style: italic;
    font-weight: 300;
  }

  &--normal-thin {
    font-style: normal;
    font-weight: 300;
  }

  &--italic-regular {
    font-style: italic;
    font-weight: 400;
  }

  &--bold {
    font-style: normal;
    font-weight: 600;
    color: var(--primary-color);
  }

  &--left {
    text-align: left;
  }

  &--right {
    text-align: right;
  }

  &--center {
    text-align: center;
  }
}

.article-p {
  margin: 0 0 2rem;
  font-size: clamp(1.05rem, 1.7vw, 1.32rem);
  line-height: 1.8;
  color: rgba(247, 247, 247, 0.92);
}

.article-link {
  color: var(--primary-color);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.inline-code {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-color);
  font-size: 0.88em;
  font-family: monospace;
}

.article-blockquote {
  margin: 2.75rem 0;
  padding: 1.25rem 2rem;
  border-left: 3px solid var(--primary-color);
  background: rgba(255, 230, 237, 0.035);
  color: rgba(247, 247, 247, 0.88);
  font-size: clamp(1.15rem, 1.9vw, 1.45rem);
  font-style: italic;
  font-weight: 300;
  line-height: 1.65;
}

.article-list {
  margin: 0 0 2rem;
  padding-left: 1.75rem;
  font-size: clamp(1.05rem, 1.7vw, 1.32rem);
  line-height: 1.8;
  color: rgba(247, 247, 247, 0.92);

  li {
    margin-bottom: 0.6rem;

    &::marker {
      color: var(--primary-color);
    }
  }

  &--ordered {
    list-style-type: decimal;
  }
}

.article-divider {
  border: 0;
  height: 1px;
  background: rgba(247, 247, 247, 0.12);
  margin: 3.5rem auto;
  width: 60%;
}

.article-video {
  width: min(1040px, calc(100vw - 2.5rem));
  margin: clamp(3rem, 7vw, 5rem) 50%;
  transform: translateX(-50%);
}

.article-video iframe,
.article-video video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  background: #000000;
}

.article-video figcaption {
  margin-top: 0.75rem;
  color: rgba(247, 247, 247, 0.55);
  font-size: 0.78rem;
}

.article-heading-2 {
  margin: 3.5rem 0 1.25rem;
  font-size: clamp(1.6rem, 3.5vw, 2.5rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--ff-color);
}

.article-heading-3 {
  margin: 2.5rem 0 1rem;
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--ff-color);
}

.article-table-wrapper {
  width: min(1040px, calc(100vw - 2.5rem));
  margin: clamp(2.5rem, 6vw, 4.5rem) 50%;
  transform: translateX(-50%);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid rgba(247, 247, 247, 0.14);
  background: rgba(255, 255, 255, 0.02);
}

.article-table {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  font-size: clamp(0.85rem, 1.2vw, 1.05rem);
  line-height: 1.5;

  th,
  td {
    padding: 0.9rem 1.25rem;
    border-bottom: 1px solid rgba(247, 247, 247, 0.08);
  }

  th {
    background: #101010;
    color: var(--primary-color);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-bottom: 2px solid rgba(255, 230, 237, 0.25);
  }

  tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.015);
  }

  tbody tr:hover {
    background: rgba(255, 230, 237, 0.04);
  }
}

.article-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(247, 247, 247, 0.13);
}

.article-footer a:last-child {
  color: rgba(247, 247, 247, 0.62);
}

.article-missing {
  display: grid;
  place-content: center;
  gap: 1rem;
  text-align: center;
}

.article-missing p {
  margin: 0;
  font-size: 2rem;
}

@media (max-width: 700px) {
  .article-page,
  .article-missing {
    padding-top: 6rem;
  }

  .article-meta,
  .article-footer {
    flex-direction: column;
  }
}
</style>
