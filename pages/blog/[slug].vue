<script setup>
import {
  parseArticleBody,
  renderInlineMarkdown,
} from '~/lib/article-body.js';

const route = useRoute();
const { blogPosts, settings } = useSiteContent();

const post = computed(() =>
  blogPosts.value.find(
    (item) =>
      item.slug === route.params.slug ||
      (route.params.slug ===
        'yapay-zeka-ile-eski-tv-mi-yenilikci-bir-akilli-tv-sistemine-donusturdum' &&
        item.slug ===
          'yapay-zeka-ile-eski-tv-mi-akilli-bir-tv-sistemine-donusturdum') ||
      (route.params.slug ===
        'yapay-zeka-ile-eski-tv-mi-akilli-bir-tv-sistemine-donusturdum' &&
        item.slug ===
          'yapay-zeka-ile-eski-tv-mi-yenilikci-bir-akilli-tv-sistemine-donusturdum'),
  ),
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

    <figure v-if="post.coverImage" class="article-hero-cover">
      <div class="article-hero-cover__frame">
        <img :src="post.coverImage" :alt="post.title" />
      </div>
      <figcaption
        v-if="post.coverCaption"
        class="article-caption article-caption--italic-thin article-caption--center"
      >
        {{ post.coverCaption }}
      </figcaption>
    </figure>

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
          v-else-if="block.type === 'heading' && (block.level === 1 || block.level === 2)"
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
  padding: clamp(6rem, 10vw, 9rem) clamp(1.25rem, 5vw, 4rem) 5rem;
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
  display: inline-flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.article-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.5rem;
  padding: 0.75rem 0;
  border-block: 1px solid rgba(247, 247, 247, 0.12);
  color: rgba(247, 247, 247, 0.58);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-header h1 {
  margin: 1.75rem 0 1.25rem;
  font-size: clamp(2rem, 3.8vw, 2.85rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.25;
  color: #ffffff;
}

.article-excerpt {
  max-width: 44rem;
  margin: 0;
  color: rgba(247, 247, 247, 0.72);
  font-size: clamp(1.05rem, 1.35vw, 1.22rem);
  line-height: 1.65;
}

.article-hero-cover {
  width: min(920px, 100%);
  margin: 2.5rem auto 3.5rem;

  &__frame {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    background: #0d0d0d;

    img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 70vh;
      object-fit: contain;
    }
  }
}

.article-body {
  font-size: clamp(1.02rem, 1.15vw, 1.12rem);
  line-height: 1.82;
  color: rgba(247, 247, 247, 0.88);
}

.article-inline-image {
  width: 100%;
  max-width: 820px;
  margin: 2.75rem auto;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 65vh;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d0d0d;
  }
}

.article-caption {
  display: block;
  width: 100%;
  margin-top: 0.85rem;
  color: rgba(247, 247, 247, 0.65);
  font-size: 0.88rem;
  line-height: 1.55;
  letter-spacing: 0.02em;
  text-align: center;
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
  margin: 0 0 1.65rem;
  font-size: clamp(1.02rem, 1.15vw, 1.12rem);
  line-height: 1.82;
  color: rgba(247, 247, 247, 0.88);
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
  margin: 2rem 0;
  padding: 1rem 1.6rem;
  border-left: 3px solid var(--primary-color);
  background: rgba(255, 230, 237, 0.035);
  color: rgba(247, 247, 247, 0.88);
  font-size: 1.05rem;
  font-style: italic;
  font-weight: 300;
  line-height: 1.7;
}

.article-list {
  margin: 0 0 1.75rem;
  padding-left: 1.5rem;
  font-size: clamp(1.02rem, 1.15vw, 1.12rem);
  line-height: 1.82;
  color: rgba(247, 247, 247, 0.88);

  li {
    margin-bottom: 0.5rem;

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
  background: rgba(255, 255, 255, 0.12);
  margin: 3rem auto;
  width: 60%;
}

.article-video {
  width: 100%;
  max-width: 820px;
  margin: 2.75rem auto;

  iframe,
  video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
    border-radius: 6px;
    background: #000000;
  }

  figcaption {
    margin-top: 0.75rem;
    color: rgba(247, 247, 247, 0.55);
    font-size: 0.78rem;
  }
}

.article-heading-2 {
  margin: 3.25rem 0 1.15rem;
  font-size: clamp(1.4rem, 2.2vw, 1.85rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;
}

.article-heading-3 {
  margin: 2.25rem 0 0.85rem;
  font-size: clamp(1.15rem, 1.6vw, 1.35rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.35;
  color: #ffffff;
}

.article-table-wrapper {
  width: 100%;
  margin: 2.25rem 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.article-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  line-height: 1.6;

  th,
  td {
    padding: 0.85rem 1.15rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  th {
    background: rgba(255, 255, 255, 0.04);
    color: var(--primary-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-bottom: 2px solid rgba(255, 230, 237, 0.25);
  }

  td {
    color: rgba(247, 247, 247, 0.88);
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.015);
  }

  tbody tr:hover {
    background: rgba(255, 230, 237, 0.035);
  }

  tr:last-child td {
    border-bottom: 0;
  }
}

.article-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 5rem;
  padding-top: 1.5rem;
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
