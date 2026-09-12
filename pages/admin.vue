<script setup>
import { parseVideoSource } from '~/lib/article-body.js';
import { slugifyContent } from '~/lib/site-content-defaults.js';
import {
  ADMIN_IMAGE_TYPES,
  ADMIN_VIDEO_TYPES,
  readImageDimensions,
} from '~/composables/use-admin-media.js';

const {
  settings,
  blogPosts,
  projectOverrides,
  updateSettings,
  upsertBlogPost,
  removeBlogPost,
  upsertProjectOverride,
} = useSiteContent();

const { data: sourceProjects } = await useAsyncData('admin-projects', () =>
  queryContent('project').sort({ createdAt: -1 }).find(),
);

useHead({
  title: 'Yönetim | Harun Works',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const isUnlocked = ref(false);
const passwordInput = ref('');
const loginError = ref('');
const activeTab = ref('blog');
const notice = ref('');
const blogBodyInput = ref(null);
const { uploadState, uploadProgress, uploadMedia, uploadImage } =
  useAdminMedia();
const imageTypes = ADMIN_IMAGE_TYPES;
const videoTypes = ADMIN_VIDEO_TYPES;

const settingsForm = reactive({
  email: '',
  secondaryEmail: '',
  displayName: '',
  tagline: '',
  aboutText: '',
  contactText: '',
});

const blogForm = reactive({
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  category: 'Notlar',
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: '',
  body: '',
});

const projectForm = reactive({
  _path: '',
  title: '',
  slug: '',
  description: '',
  tagsText: '',
  image: '',
  bodyText: '',
  live: '',
  hidden: false,
  isNew: false,
});

const mergedProjects = computed(() => {
  const base = (sourceProjects.value || []).map((project) => {
    const override = projectOverrides.value.find(
      (item) => item._path === project._path,
    );
    return override ? { ...project, ...override } : project;
  });
  const added = projectOverrides.value.filter(
    (item) =>
      item.isNew && !base.some((project) => project._path === item._path),
  );
  return [...base, ...added];
});

const tabs = [
  { id: 'blog', label: 'Blog yazıları' },
  { id: 'projects', label: 'Çalışmalar' },
  { id: 'settings', label: 'Site metinleri' },
];

function slugify(value) {
  return slugifyContent(value);
}

function showNotice(message) {
  notice.value = message;
  window.setTimeout(() => {
    if (notice.value === message) notice.value = '';
  }, 2500);
}

function insertBlogBlock(marker, cursor) {
  const before = blogForm.body.slice(0, cursor);
  const after = blogForm.body.slice(cursor);
  const leadingBreak =
    before && !before.endsWith('\n\n')
      ? before.endsWith('\n')
        ? '\n'
        : '\n\n'
      : '';
  const trailingBreak =
    after && !after.startsWith('\n\n')
      ? after.startsWith('\n')
        ? '\n'
        : '\n\n'
      : '';
  const insertion = `${leadingBreak}${marker}${trailingBreak}`;
  blogForm.body = `${before}${insertion}${after}`;
  return cursor + insertion.length;
}

async function focusBlogCursor(cursor) {
  await nextTick();
  blogBodyInput.value?.focus();
  blogBodyInput.value?.setSelectionRange(cursor, cursor);
}

async function uploadBlogCover(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  try {
    blogForm.coverImage = await uploadImage(file, 'blog', 'cover');
    showNotice('Kapak görseli yüklendi. Yazıyı kaydetmeyi unutmayın.');
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Görsel yüklenemedi.');
  }
}

async function insertBlogImage(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const cursor = blogBodyInput.value?.selectionStart ?? blogForm.body.length;
  try {
    const url = await uploadImage(file, 'blog', 'inline');
    const alt = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    const nextCursor = insertBlogBlock(`![${alt}](${url})`, cursor);
    await focusBlogCursor(nextCursor);
    showNotice('Görsel yazı metnine eklendi.');
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Görsel yüklenemedi.');
  }
}

async function insertUploadedVideo(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const cursor = blogBodyInput.value?.selectionStart ?? blogForm.body.length;
  try {
    const url = await uploadMedia(file, {
      folder: 'blog',
      stateKey: 'video',
      allowedTypes: videoTypes,
      maxSize: 250 * 1024 * 1024,
    });
    const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    const nextCursor = insertBlogBlock(`@[${title}](${url})`, cursor);
    await focusBlogCursor(nextCursor);
    showNotice('Video yazı metnine eklendi.');
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Video yüklenemedi.');
  }
}

async function insertVideoLink() {
  const value = window.prompt(
    'YouTube veya Google Drive video bağlantısını yapıştırın:',
  );
  if (!value) return;

  const source = parseVideoSource(value.trim());
  if (!source || source.type === 'video') {
    showNotice('Geçerli bir YouTube veya Google Drive bağlantısı girin.');
    return;
  }

  const cursor = blogBodyInput.value?.selectionStart ?? blogForm.body.length;
  const nextCursor = insertBlogBlock(
    `@[${source.provider} videosu](${value.trim()})`,
    cursor,
  );
  await focusBlogCursor(nextCursor);
  showNotice(`${source.provider} videosu yazıya eklendi.`);
}

async function uploadProjectImage(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  try {
    const dimensions = await readImageDimensions(file);
    projectForm.image = await uploadImage(file, 'projects', 'project');
    const ratio = dimensions.width / dimensions.height;
    showNotice(
      Math.abs(ratio - 16 / 9) < 0.04
        ? '16:9 görsel yüklendi. Kart ve banner otomatik hazır.'
        : 'Görsel yüklendi; kart ve banner 16:9 alana ortalanarak kırpılacak.',
    );
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Görsel yüklenemedi.');
  }
}

async function unlock() {
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: passwordInput.value },
    });
    isUnlocked.value = true;
    loginError.value = '';
    passwordInput.value = '';
  } catch (error) {
    loginError.value = 'Parola doğru değil.';
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' });
  isUnlocked.value = false;
  passwordInput.value = '';
}

function resetBlogForm() {
  Object.assign(blogForm, {
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    category: 'Notlar',
    publishedAt: new Date().toISOString().slice(0, 10),
    coverImage: '',
    body: '',
  });
}

function editBlogPost(post) {
  Object.assign(blogForm, post);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveBlogPost() {
  const slug = slugify(blogForm.slug || blogForm.title);
  if (!blogForm.title.trim() || !slug || !blogForm.body.trim()) {
    showNotice('Başlık ve yazı metni zorunlu.');
    return;
  }

  const hasSlugConflict = blogPosts.value.some(
    (post) => post.id !== blogForm.id && post.slug === slug,
  );
  if (hasSlugConflict) {
    showNotice('Bu yazı adresi başka bir yazıda kullanılıyor.');
    return;
  }

  try {
    await upsertBlogPost({
      ...blogForm,
      id: blogForm.id || `post-${Date.now()}`,
      slug,
      title: blogForm.title.trim(),
      excerpt: blogForm.excerpt.trim(),
      body: blogForm.body.trim(),
    });
    resetBlogForm();
    showNotice('Blog yazısı kaydedildi.');
  } catch (error) {
    showNotice('Yazı kaydedilemedi. Lütfen yeniden deneyin.');
  }
}

async function deleteBlogPost(id) {
  if (!window.confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;
  try {
    await removeBlogPost(id);
    if (blogForm.id === id) resetBlogForm();
    showNotice('Yazı silindi.');
  } catch (error) {
    showNotice('Yazı silinemedi. Lütfen yeniden deneyin.');
  }
}

function resetProjectForm() {
  Object.assign(projectForm, {
    _path: '',
    title: '',
    slug: '',
    description: '',
    tagsText: '',
    image: '',
    bodyText: '',
    live: '',
    hidden: false,
    isNew: true,
  });
}

function editProject(project) {
  Object.assign(projectForm, {
    _path: project._path,
    title: project.title || '',
    slug: project._path?.split('/').pop() || '',
    description: project.description || '',
    tagsText: (project.tags || []).join(', '),
    image: project.image || project.previewImage || '',
    bodyText: project.bodyText || project.description || '',
    live: project.live || '',
    hidden: Boolean(project.hidden),
    isNew: Boolean(project.isNew),
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveProject() {
  const slug = slugify(projectForm.slug || projectForm.title);
  if (!projectForm.title.trim() || !slug) {
    showNotice('Çalışma başlığı zorunlu.');
    return;
  }

  const path = projectForm._path || `/project/${slug}`;
  try {
    await upsertProjectOverride({
      _path: path,
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      tags: projectForm.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      previewImage: projectForm.image.trim() || '/logo.png',
      image: projectForm.image.trim() || '/logo.png',
      bodyText: projectForm.bodyText.trim() || projectForm.description.trim(),
      live: projectForm.live.trim(),
      hidden: projectForm.hidden,
      isNew: projectForm.isNew || !projectForm._path,
      createdAt: new Date().toISOString(),
    });
    resetProjectForm();
    showNotice('Çalışma kaydedildi.');
  } catch (error) {
    showNotice('Çalışma kaydedilemedi. Lütfen yeniden deneyin.');
  }
}

async function saveSettings() {
  try {
    await updateSettings({ ...settingsForm });
    showNotice('Site metinleri kaydedildi.');
  } catch (error) {
    showNotice('Ayarlar kaydedilemedi. Lütfen yeniden deneyin.');
  }
}

onMounted(async () => {
  const session = await $fetch('/api/admin/session');
  isUnlocked.value = session.authenticated;
  Object.assign(settingsForm, settings.value);
  resetProjectForm();
});
</script>

<template>
  <main class="admin-page">
    <section
      v-if="!isUnlocked"
      class="login-panel"
      aria-labelledby="login-title"
    >
      <NuxtLink to="/" class="admin-back">← Siteye dön</NuxtLink>
      <p class="admin-eyebrow">HARUN WORKS / YÖNETİM</p>
      <h1 id="login-title">İçerik yönetimi</h1>
      <p class="login-panel__intro">
        Blog yazılarını, ana sayfadaki çalışmaları ve iletişim metinlerini
        düzenlemek için giriş yapın.
      </p>
      <form class="login-form" @submit.prevent="unlock">
        <label for="admin-password">Parola</label>
        <input
          id="admin-password"
          v-model="passwordInput"
          type="password"
          autocomplete="current-password"
          autofocus
        />
        <p v-if="loginError" class="form-error" role="alert">
          {{ loginError }}
        </p>
        <button type="submit">Panele gir</button>
      </form>
    </section>

    <template v-else>
      <header class="admin-header">
        <div>
          <p class="admin-eyebrow">HARUN WORKS / YÖNETİM</p>
          <h1>İçerik masası</h1>
        </div>
        <div class="admin-header__actions">
          <NuxtLink to="/blog">Blogu görüntüle ↗</NuxtLink>
          <button type="button" @click="logout">Çıkış</button>
        </div>
      </header>

      <div class="storage-note" role="note">
        Kaydettiğiniz içerikler özel depoda saklanır ve canlı sitede tüm
        ziyaretçilere yayınlanır.
      </div>

      <nav class="admin-tabs" aria-label="Yönetim bölümleri">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section v-if="activeTab === 'blog'" class="admin-workspace">
        <form class="editor-card" @submit.prevent="saveBlogPost">
          <div class="editor-card__heading">
            <div>
              <p class="admin-eyebrow">YAZI EDİTÖRÜ</p>
              <h2>{{ blogForm.id ? 'Yazıyı düzenle' : 'Yeni yazı' }}</h2>
            </div>
            <button
              v-if="blogForm.id"
              type="button"
              class="text-button"
              @click="resetBlogForm"
            >
              Yeni yazı aç
            </button>
          </div>

          <div class="field-grid">
            <label class="field field--wide">
              <span>Başlık</span>
              <input
                v-model="blogForm.title"
                required
                @blur="
                  !blogForm.slug && (blogForm.slug = slugify(blogForm.title))
                "
              />
            </label>
            <label class="field">
              <span>Adres</span>
              <input v-model="blogForm.slug" placeholder="yazi-adresi" />
            </label>
            <label class="field">
              <span>Kategori</span>
              <input v-model="blogForm.category" />
            </label>
            <label class="field">
              <span>Yayın tarihi</span>
              <input v-model="blogForm.publishedAt" type="date" />
            </label>
            <div class="field">
              <label for="blog-cover-url">Kapak görseli</label>
              <div
                v-if="blogForm.coverImage"
                class="upload-preview upload-preview--cover"
              >
                <img
                  :src="blogForm.coverImage"
                  alt="Seçili blog kapak görseli"
                />
              </div>
              <input
                id="blog-cover-url"
                v-model="blogForm.coverImage"
                placeholder="Görsel yükleyin veya adres girin"
              />
              <input
                id="blog-cover-file"
                class="visually-hidden"
                type="file"
                :accept="imageTypes"
                :disabled="uploadState.cover"
                @change="uploadBlogCover"
              />
              <label class="upload-button" for="blog-cover-file">
                {{
                  uploadState.cover
                    ? `Yükleniyor · %${uploadProgress.cover}`
                    : 'Kapak görseli yükle'
                }}
              </label>
              <small
                >Önerilen: 1600 × 900 px (16:9), tercihen WebP veya JPG.</small
              >
            </div>
            <label class="field field--wide">
              <span>Kısa açıklama</span>
              <textarea v-model="blogForm.excerpt" rows="3" />
            </label>
            <div class="field field--wide">
              <label for="blog-body">Yazı metni</label>
              <div class="field-toolbar">
                <input
                  id="blog-inline-file"
                  class="visually-hidden"
                  type="file"
                  :accept="imageTypes"
                  :disabled="uploadState.inline"
                  @change="insertBlogImage"
                />
                <label
                  class="upload-button upload-button--compact"
                  for="blog-inline-file"
                >
                  {{
                    uploadState.inline
                      ? `Yükleniyor · %${uploadProgress.inline}`
                      : '+ İmlecin olduğu yere görsel ekle'
                  }}
                </label>
                <input
                  id="blog-video-file"
                  class="visually-hidden"
                  type="file"
                  :accept="videoTypes"
                  :disabled="uploadState.video"
                  @change="insertUploadedVideo"
                />
                <label
                  class="upload-button upload-button--compact"
                  for="blog-video-file"
                >
                  {{
                    uploadState.video
                      ? `Yükleniyor · %${uploadProgress.video}`
                      : '+ Video yükle'
                  }}
                </label>
                <button
                  type="button"
                  class="upload-button upload-button--compact"
                  @click="insertVideoLink"
                >
                  + YouTube / Drive
                </button>
                <small>
                  Önce metinde eklemek istediğiniz yere tıklayın. Büyük videolar
                  için YouTube veya Drive kullanın.
                </small>
              </div>
              <textarea
                id="blog-body"
                ref="blogBodyInput"
                v-model="blogForm.body"
                rows="14"
                required
              />
            </div>
          </div>

          <button class="primary-button" type="submit">Yazıyı kaydet</button>
        </form>

        <aside class="content-list">
          <div class="content-list__heading">
            <h2>Yazılar</h2>
            <span>{{ blogPosts.length }}</span>
          </div>
          <p v-if="!blogPosts.length" class="empty-copy">
            Henüz yazı eklenmedi.
          </p>
          <article v-for="post in blogPosts" :key="post.id" class="content-row">
            <div>
              <p>{{ post.category || 'Notlar' }}</p>
              <h3>{{ post.title }}</h3>
            </div>
            <div class="content-row__actions">
              <button type="button" @click="editBlogPost(post)">Düzenle</button>
              <button
                type="button"
                class="danger"
                @click="deleteBlogPost(post.id)"
              >
                Sil
              </button>
            </div>
          </article>
        </aside>
      </section>

      <section v-else-if="activeTab === 'projects'" class="admin-workspace">
        <form class="editor-card" @submit.prevent="saveProject">
          <div class="editor-card__heading">
            <div>
              <p class="admin-eyebrow">ÇALIŞMA EDİTÖRÜ</p>
              <h2>
                {{ projectForm._path ? 'Çalışmayı düzenle' : 'Yeni çalışma' }}
              </h2>
            </div>
            <button type="button" class="text-button" @click="resetProjectForm">
              Yeni çalışma aç
            </button>
          </div>

          <div class="field-grid">
            <label class="field field--wide">
              <span>Çalışma başlığı</span>
              <input
                v-model="projectForm.title"
                required
                @blur="
                  !projectForm.slug &&
                    (projectForm.slug = slugify(projectForm.title))
                "
              />
            </label>
            <label class="field">
              <span>Adres</span>
              <input
                v-model="projectForm.slug"
                :disabled="Boolean(projectForm._path)"
              />
            </label>
            <label class="field">
              <span>Etiketler</span>
              <input
                v-model="projectForm.tagsText"
                placeholder="CBS, Planlama, Afet"
              />
            </label>
            <div class="field field--wide">
              <label for="project-image-url">Çalışma görseli</label>
              <div v-if="projectForm.image" class="upload-preview">
                <img :src="projectForm.image" alt="Seçili çalışma görseli" />
              </div>
              <input
                id="project-image-url"
                v-model="projectForm.image"
                placeholder="Görsel yükleyin veya adres girin"
              />
              <input
                id="project-image-file"
                class="visually-hidden"
                type="file"
                :accept="imageTypes"
                :disabled="uploadState.project"
                @change="uploadProjectImage"
              />
              <label class="upload-button" for="project-image-file">
                {{
                  uploadState.project
                    ? `Yükleniyor · %${uploadProgress.project}`
                    : 'Tek görsel yükle'
                }}
              </label>
              <small>
                1600 × 900 px (16:9) önerilir. Aynı görsel kartta ve detay
                banner’ında otomatik kullanılır.
              </small>
            </div>
            <label class="field field--wide">
              <span>Kısa açıklama</span>
              <textarea v-model="projectForm.description" rows="4" />
            </label>
            <label class="field field--wide">
              <span>Detay metni</span>
              <textarea v-model="projectForm.bodyText" rows="10" />
            </label>
            <label class="field field--wide">
              <span>Proje bağlantısı</span>
              <input v-model="projectForm.live" placeholder="https://..." />
            </label>
            <label class="check-field">
              <input v-model="projectForm.hidden" type="checkbox" />
              <span>Ana sayfada gizle</span>
            </label>
          </div>
          <button class="primary-button" type="submit">Çalışmayı kaydet</button>
        </form>

        <aside class="content-list">
          <div class="content-list__heading">
            <h2>Çalışmalar</h2>
            <span>{{ mergedProjects.length }}</span>
          </div>
          <article
            v-for="project in mergedProjects"
            :key="project._path"
            class="content-row"
          >
            <div>
              <p>{{ project.hidden ? 'Gizli' : 'Ana sayfada' }}</p>
              <h3>{{ project.title }}</h3>
            </div>
            <button type="button" @click="editProject(project)">Düzenle</button>
          </article>
        </aside>
      </section>

      <section v-else class="settings-card">
        <div class="editor-card__heading">
          <div>
            <p class="admin-eyebrow">GENEL AYARLAR</p>
            <h2>Site metinleri</h2>
          </div>
        </div>
        <form class="field-grid" @submit.prevent="saveSettings">
          <label class="field">
            <span>Ad soyad</span>
            <input v-model="settingsForm.displayName" required />
          </label>
          <label class="field">
            <span>Kişisel e-posta</span>
            <input v-model="settingsForm.email" type="email" required />
          </label>
          <label class="field">
            <span>Kurumsal e-posta</span>
            <input
              v-model="settingsForm.secondaryEmail"
              type="email"
              required
            />
          </label>
          <label class="field field--wide">
            <span>Ana sayfa alt başlığı</span>
            <input v-model="settingsForm.tagline" required />
          </label>
          <label class="field field--wide">
            <span>Hakkımda metni</span>
            <textarea v-model="settingsForm.aboutText" rows="10" required />
          </label>
          <label class="field field--wide">
            <span>İletişim çağrısı</span>
            <input v-model="settingsForm.contactText" required />
          </label>
          <button class="primary-button" type="submit">Ayarları kaydet</button>
        </form>
      </section>

      <div v-if="notice" class="notice" role="status">{{ notice }}</div>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.admin-page {
  --panel: #111111;
  --panel-2: #181818;
  --border: rgba(247, 247, 247, 0.12);
  --muted: rgba(247, 247, 247, 0.58);
  min-height: 100vh;
  padding: clamp(6rem, 10vw, 8rem) clamp(1rem, 4vw, 4rem) 5rem;
  color: var(--ff-color);
  background: #090909;
}

.admin-header,
.admin-tabs,
.admin-workspace,
.settings-card,
.storage-note {
  width: min(1280px, 100%);
  margin-inline: auto;
}

.admin-eyebrow {
  margin: 0 0 0.75rem;
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.admin-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.admin-header h1,
.login-panel h1 {
  margin: 0;
  font-size: clamp(2.7rem, 6vw, 5.5rem);
  font-weight: 500;
  letter-spacing: -0.05em;
}

.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-header__actions a,
.admin-header__actions button,
.admin-back {
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.admin-header__actions button {
  padding: 0;
  border: 0;
  background: none;
}

.storage-note {
  margin-top: 2.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 230, 237, 0.22);
  color: var(--muted);
  background: rgba(255, 230, 237, 0.04);
  font-size: 0.82rem;
  line-height: 1.5;
}

.admin-tabs {
  display: flex;
  gap: 0;
  margin-top: 2rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
}

.admin-tabs button {
  position: relative;
  flex: 0 0 auto;
  padding: 1rem 1.4rem;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 0.8rem;
}

.admin-tabs button.is-active {
  color: var(--ff-color);
}

.admin-tabs button.is-active::after {
  content: '';
  position: absolute;
  right: 1.4rem;
  bottom: -1px;
  left: 1.4rem;
  height: 2px;
  background: var(--primary-color);
}

.admin-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.75fr);
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.editor-card,
.content-list,
.settings-card,
.login-panel {
  border: 1px solid var(--border);
  background: var(--panel);
}

.editor-card,
.settings-card {
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.editor-card__heading,
.content-list__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.editor-card__heading h2,
.content-list__heading h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 500;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field,
.check-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field--wide,
.check-field,
.primary-button {
  grid-column: 1 / -1;
}

.field span,
.field > label,
.check-field span {
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.field small {
  color: var(--muted);
  font-size: 0.72rem;
  line-height: 1.5;
}

.field input,
.field textarea,
.login-form input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 0;
  padding: 0.8rem 0.9rem;
  color: var(--ff-color);
  background: var(--panel-2);
  font: inherit;
  line-height: 1.5;
}

.field input,
.login-form input {
  resize: none;
  overflow: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.login-form input:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
}

.field input:disabled {
  opacity: 0.5;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.upload-preview {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--panel-2);
}

.upload-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-preview--cover {
  max-width: 22rem;
}

.upload-button {
  display: inline-flex;
  width: fit-content;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.95rem;
  border: 1px solid rgba(255, 230, 237, 0.42);
  color: var(--ff-color) !important;
  background: rgba(255, 230, 237, 0.07);
  cursor: pointer;
  font-size: 0.72rem !important;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.upload-button:hover {
  background: rgba(255, 230, 237, 0.13);
}

.visually-hidden:focus-visible + .upload-button {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.upload-button--compact {
  min-height: 2.35rem;
  padding: 0.55rem 0.75rem;
}

.field-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem 1rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.025);
}

.check-field {
  flex-direction: row;
  align-items: center;
}

.check-field input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
}

.primary-button,
.login-form button {
  margin-top: 0.5rem;
  padding: 0.9rem 1.15rem;
  border: 1px solid var(--primary-color);
  color: #111111;
  background: var(--primary-color);
  font-weight: 700;
}

.text-button,
.content-row button {
  padding: 0;
  border: 0;
  color: var(--primary-color);
  background: transparent;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.content-list {
  align-self: start;
  max-height: 75vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.content-list__heading {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.content-list__heading span,
.empty-copy {
  color: var(--muted);
}

.content-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.content-row p {
  margin: 0 0 0.35rem;
  color: var(--muted);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.content-row h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.35;
}

.content-row__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.content-row button.danger {
  color: #ff8e8e;
}

.login-panel {
  width: min(560px, 100%);
  margin: 6vh auto 0;
  padding: clamp(1.5rem, 5vw, 3rem);
}

.login-panel .admin-back {
  display: inline-block;
  margin-bottom: 4rem;
}

.login-panel__intro {
  margin: 1.5rem 0 2.5rem;
  color: var(--muted);
  line-height: 1.6;
}

.login-form {
  display: grid;
  gap: 0.75rem;

  input {
    resize: none;
    overflow: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }
}

.login-form label {
  color: var(--muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-error {
  margin: 0;
  color: #ff9c9c;
  font-size: 0.82rem;
}

.notice {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 20;
  padding: 0.9rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #111111;
  background: var(--primary-color);
  font-size: 0.82rem;
  font-weight: 700;
}

@media (max-width: 860px) {
  .admin-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-workspace {
    grid-template-columns: 1fr;
  }

  .content-list {
    max-height: none;
  }
}

@media (max-width: 620px) {
  .admin-page {
    padding-top: 5.5rem;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field,
  .primary-button {
    grid-column: 1;
  }

  .admin-header__actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
