<script setup>
import {
  parseArticleBody,
  renderInlineMarkdown,
  parseVideoSource,
} from '~/lib/article-body.js';
import {
  slugifyContent,
  DEFAULT_MASTER_COVER_PROMPT,
} from '~/lib/site-content-defaults.js';
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

const googleClientId = ref('');
const isGoogleLoading = ref(false);
const googleButtonRendered = ref(false);
const googleError = ref('');

const recoveryMode = ref(false);
const recoveryCode = ref('');
const recoveryError = ref('');
const recoveryMessage = ref('');
const isRequestingRecovery = ref(false);
const isVerifyingRecovery = ref(false);
const maskedEmail = ref('harunysd@gmail.com');
const fallbackMockCode = ref('');

const passwordChange = reactive({
  newPassword: '',
  confirmPassword: '',
  loading: false,
  message: '',
  error: '',
});
const blogBodyInput = ref(null);
const editorTab = ref('write');
const previewBlocks = computed(() => parseArticleBody(blogForm.body));
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
  coverPrompt: '',
});

const promptModalOpen = ref(false);
const promptModalTab = ref('filled');
const promptModalContext = ref('blog');
const promptCopied = ref(false);
const promptCustomNote = ref('');
const promptRefImages = ref('');
const promptSaving = ref(false);

const blogForm = reactive({
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  category: 'Notlar',
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: '',
  coverCaption: '',
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

  const defaultCaption = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  const captionPrompt = window.prompt(
    'Resim altı yazısı girin (isteğe bağlı - resmin altında otomatik ince yatay yazı olarak görünür):',
    defaultCaption,
  );
  const caption =
    captionPrompt !== null ? captionPrompt.trim() : defaultCaption;

  const cursor = blogBodyInput.value?.selectionStart ?? blogForm.body.length;
  try {
    const url = await uploadImage(file, 'blog', 'inline');
    const alt = caption || 'Görsel';
    const nextCursor = insertBlogBlock(`\n![${alt}](${url})\n`, cursor);
    await focusBlogCursor(nextCursor);
    showNotice('Görsel ve ince yatay resim yazısı eklendi.');
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

function insertTableTemplate() {
  const cursor = blogBodyInput.value?.selectionStart ?? blogForm.body.length;
  const sampleTable = `| Başlık 1 | Başlık 2 | Başlık 3 |\n| :--- | :---: | ---: |\n| Veri 1 | Veri 2 | Veri 3 |\n| Veri 4 | Veri 5 | Veri 6 |`;
  const nextCursor = insertBlogBlock(sampleTable, cursor);
  focusBlogCursor(nextCursor);
  showNotice('Örnek tablo eklendi. Başlık ve verileri düzenleyebilirsiniz.');
}

function applyFormat(type) {
  const textarea = blogBodyInput.value;
  if (!textarea) return;

  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const text = blogForm.body;
  const selected = text.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  switch (type) {
    case 'h2': {
      replacement = selected ? `\n## ${selected}\n` : '\n## Başlık 2\n';
      cursorOffset = replacement.length;
      break;
    }
    case 'h3': {
      replacement = selected ? `\n### ${selected}\n` : '\n### Başlık 3\n';
      cursorOffset = replacement.length;
      break;
    }
    case 'bold': {
      replacement = selected ? `**${selected}**` : '**kalın yazı**';
      cursorOffset = selected ? replacement.length : 2;
      break;
    }
    case 'italic': {
      replacement = selected ? `*${selected}*` : '*italik yazı*';
      cursorOffset = selected ? replacement.length : 1;
      break;
    }
    case 'quote': {
      replacement = selected
        ? selected
            .split('\n')
            .map((l) => `> ${l}`)
            .join('\n')
        : '> Alıntı metni buraya';
      replacement = `\n${replacement}\n`;
      cursorOffset = replacement.length;
      break;
    }
    case 'code': {
      if (selected.includes('\n')) {
        replacement = `\n\`\`\`\n${selected || 'kod buraya'}\n\`\`\`\n`;
      } else {
        replacement = selected ? `\`${selected}\`` : '`kod`';
      }
      cursorOffset = selected ? replacement.length : 1;
      break;
    }
    case 'link': {
      replacement = selected
        ? `[${selected}](https://)`
        : '[bağlantı metni](https://example.com)';
      cursorOffset = replacement.length;
      break;
    }
    case 'ul': {
      const items = selected
        ? selected
            .split('\n')
            .map((l) => (l.startsWith('- ') ? l : `- ${l}`))
            .join('\n')
        : '- Madde 1\n- Madde 2\n- Madde 3';
      replacement = `\n${items}\n`;
      cursorOffset = replacement.length;
      break;
    }
    case 'ol': {
      const items = selected
        ? selected
            .split('\n')
            .map((l, i) => (/^\d+\.\s/.test(l) ? l : `${i + 1}. ${l}`))
            .join('\n')
        : '1. Madde 1\n2. Madde 2\n3. Madde 3';
      replacement = `\n${items}\n`;
      cursorOffset = replacement.length;
      break;
    }
    case 'hr': {
      replacement = '\n\n---\n\n';
      cursorOffset = replacement.length;
      break;
    }
    case 'caption': {
      const captionText =
        selected ||
        window.prompt('Resim altı için ince yatay yazı girin:') ||
        'Resim altı açıklaması';
      replacement = `\n*${captionText}*\n`;
      cursorOffset = replacement.length;
      break;
    }
    default:
      return;
  }

  const before = text.slice(0, start);
  const after = text.slice(end);
  blogForm.body = before + replacement + after;

  const nextPos = start + (selected ? replacement.length : cursorOffset);
  focusBlogCursor(nextPos);
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

async function initGoogleAuth() {
  try {
    const config = await $fetch('/api/admin/auth-config');
    googleClientId.value = config.googleClientId || '';
    maskedEmail.value = config.maskedEmail || 'harunysd@gmail.com';
  } catch (e) {
    console.warn('Failed to load auth config:', e);
  }
}

function handleGoogleClick() {
  googleError.value = '';
  isGoogleLoading.value = true;
  window.location.href = '/api/admin/auth/google/login';
}

async function startRecovery() {
  recoveryMode.value = true;
  recoveryError.value = '';
  recoveryMessage.value = '';
  isRequestingRecovery.value = true;
  try {
    const res = await $fetch('/api/admin/request-recovery', { method: 'POST' });
    if (res.ok) {
      recoveryMessage.value = `${res.maskedEmail || 'harunysd@gmail.com'} adresinize 6 haneli giriş kodu gönderildi.`;
      if (res.mailerStatus?.code) {
        fallbackMockCode.value = res.mailerStatus.code;
        recoveryCode.value = res.mailerStatus.code;
      }
    }
  } catch (err) {
    recoveryError.value =
      err.data?.statusMessage || err.message || 'Kod gönderilemedi.';
  } finally {
    isRequestingRecovery.value = false;
  }
}

async function submitRecoveryCode() {
  if (!recoveryCode.value.trim()) {
    recoveryError.value = 'Lütfen 6 haneli kodu girin.';
    return;
  }
  isVerifyingRecovery.value = true;
  recoveryError.value = '';
  try {
    const res = await $fetch('/api/admin/verify-recovery', {
      method: 'POST',
      body: { code: recoveryCode.value.trim() },
    });
    if (res.ok) {
      isUnlocked.value = true;
      recoveryMode.value = false;
      showNotice('Giriş kodu doğrulandı. Panele hoş geldiniz!');
    }
  } catch (err) {
    recoveryError.value =
      err.data?.statusMessage || err.message || 'Kod geçersiz veya süresi dolmuş.';
  } finally {
    isVerifyingRecovery.value = false;
  }
}

async function handleUrlRecoveryToken() {
  const route = useRoute();
  const token = route.query.recovery_token;
  const urlError = route.query.error;

  if (urlError) {
    googleError.value = String(urlError);
  }

  if (token) {
    try {
      const res = await $fetch('/api/admin/verify-recovery', {
        method: 'POST',
        body: { token: String(token) },
      });
      if (res.ok) {
        isUnlocked.value = true;
        showNotice('E-posta bağlantısı doğrulandı. Panele giriş yapıldı!');
      }
    } catch (err) {
      loginError.value =
        err.data?.statusMessage ||
        'Kurtarma bağlantısı geçersiz veya süresi dolmuş.';
    }
  }
}

async function submitChangePassword() {
  if (!passwordChange.newPassword || passwordChange.newPassword.length < 6) {
    passwordChange.error = 'Yeni parola en az 6 karakter olmalıdır.';
    return;
  }
  if (passwordChange.newPassword !== passwordChange.confirmPassword) {
    passwordChange.error = 'Girdiğiniz parolalar birbiriyle eşleşmiyor.';
    return;
  }

  passwordChange.loading = true;
  passwordChange.error = '';
  passwordChange.message = '';

  try {
    const res = await $fetch('/api/admin/change-password', {
      method: 'POST',
      body: { newPassword: passwordChange.newPassword },
    });
    passwordChange.message = 'Yönetim parolanız başarıyla güncellendi!';
    passwordChange.newPassword = '';
    passwordChange.confirmPassword = '';
    showNotice('Yönetim parolası güncellendi.');
  } catch (err) {
    passwordChange.error =
      err.data?.statusMessage || 'Parola güncellenirken bir hata oluştu.';
  } finally {
    passwordChange.loading = false;
  }
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
    coverCaption: '',
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
      coverCaption: (blogForm.coverCaption || '').trim(),
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

watch(
  settings,
  (val) => {
    if (val) {
      Object.assign(settingsForm, val);
      if (!settingsForm.coverPrompt) {
        settingsForm.coverPrompt = DEFAULT_MASTER_COVER_PROMPT;
      }
    }
  },
  { immediate: true, deep: true },
);

const computedFilledPrompt = computed(() => {
  const template = settingsForm.coverPrompt || DEFAULT_MASTER_COVER_PROMPT;
  let title = '';
  let description = '';

  if (promptModalContext.value === 'blog') {
    title = blogForm.title.trim() || '[Yazı Başlığı Henüz Girilmedi]';
    description =
      blogForm.excerpt.trim() || blogForm.title.trim() || '[Açıklama / Bağlam]';
  } else if (promptModalContext.value === 'project') {
    title = projectForm.title.trim() || '[Çalışma Başlığı Henüz Girilmedi]';
    description =
      projectForm.description.trim() ||
      projectForm.title.trim() ||
      '[Açıklama / Bağlam]';
  } else {
    title =
      blogForm.title.trim() || projectForm.title.trim() || '[Başlık]';
    description =
      blogForm.excerpt.trim() ||
      projectForm.description.trim() ||
      '[Açıklama / Bağlam]';
  }

  const note =
    promptCustomNote.value.trim() || 'Standart kurallar ve seri uyumu';
  const refs =
    promptRefImages.value.trim() || 'Ekli görsel seri kapakları (Attached reference covers)';

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DESCRIPTION\}\}/g, description)
    .replace(/\{\{OPTIONAL_NOTE\}\}/g, note)
    .replace(/\{\{REFERENCE_IMAGES\}\}/g, refs);
});

function openPromptModal(context = 'blog') {
  promptModalContext.value = context;
  promptModalOpen.value = true;
  promptCopied.value = false;
  if (!settingsForm.coverPrompt) {
    settingsForm.coverPrompt =
      settings.value?.coverPrompt || DEFAULT_MASTER_COVER_PROMPT;
  }
}

function closePromptModal() {
  promptModalOpen.value = false;
}

async function copyPromptToClipboard(textToCopy) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    promptCopied.value = true;
    showNotice('Prompt panoya kopyalandı!');
    setTimeout(() => {
      promptCopied.value = false;
    }, 2500);
  } catch (err) {
    showNotice('Kopyalama başarısız oldu. Lütfen metni seçip elle kopyalayın.');
  }
}

async function saveMasterPrompt() {
  promptSaving.value = true;
  try {
    await updateSettings({ coverPrompt: settingsForm.coverPrompt });
    showNotice('Master görsel promptu sisteme kalıcı olarak kaydedildi!');
  } catch (err) {
    showNotice('Prompt kaydedilemedi. Lütfen tekrar deneyin.');
  } finally {
    promptSaving.value = false;
  }
}

function resetMasterPromptToDefault() {
  if (
    confirm(
      'Master promptu varsayılan fabrika ayarlarına sıfırlamak istediğinizden emin misiniz?',
    )
  ) {
    settingsForm.coverPrompt = DEFAULT_MASTER_COVER_PROMPT;
    showNotice('Prompt şablonu sıfırlandı. Kalıcı olması için kaydet butonuna basın.');
  }
}

onMounted(async () => {
  const { $smoothScroll } = useNuxtApp();
  $smoothScroll?.disable?.();
  const scrollerEl = document.getElementById('__nuxt');
  if (scrollerEl) {
    scrollerEl.style.transform = '';
    scrollerEl.style.top = '';
    scrollerEl.style.position = '';
  }
  document.documentElement.classList.remove('has-scroll-smooth');
  document.documentElement.style.overflow = '';
  document.documentElement.style.position = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  window.scrollTo(0, 0);

  const session = await $fetch('/api/admin/session');
  isUnlocked.value = session.authenticated;
  Object.assign(settingsForm, settings.value);
  resetProjectForm();

  await handleUrlRecoveryToken();
  if (!isUnlocked.value) {
    await initGoogleAuth();
  }
});

onBeforeUnmount(() => {
  const { $smoothScroll } = useNuxtApp();
  $smoothScroll?.enable?.();
  $smoothScroll?.update?.();
});
</script>

<template>
  <main class="admin-page">
    <section
      v-if="!isUnlocked"
      class="login-panel"
      aria-labelledby="login-title"
    >
      <VHeaderBackground class="login-panel__canvas" />
      <div class="login-panel__overlay" aria-hidden="true"></div>
      <div class="login-panel__content">
        <NuxtLink to="/" class="admin-back">← Siteye dön</NuxtLink>
        <p class="admin-eyebrow">HARUN WORKS / YÖNETİM</p>
        <h1 id="login-title">İçerik yönetimi</h1>
        <p class="login-panel__intro">
          Blog yazılarını, ana sayfadaki çalışmaları ve iletişim metinlerini
          düzenlemek için giriş yapın.
        </p>
        <!-- Google Sign-In Primary Action -->
        <div class="google-auth-box">
          <button
            type="button"
            class="google-auth-button"
            :disabled="isGoogleLoading"
            @click="handleGoogleClick"
          >
            <div class="google-auth-button__inner">
              <svg class="google-icon" viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span class="google-auth-button__text">
                {{ isGoogleLoading ? 'Google\'a yönlendiriliyor...' : 'Google ile Giriş Yap' }}
              </span>
            </div>
            <span class="google-auth-button__arrow" aria-hidden="true">→</span>
          </button>

          <p v-if="googleError" class="form-error" role="alert">
            {{ googleError }}
          </p>
        </div>
      </div>
    </section>

    <template v-else>
      <header class="admin-header">
        <div>
          <p class="admin-eyebrow">HARUN WORKS / YÖNETİM</p>
          <h1>İçerik masası</h1>
        </div>
        <div class="admin-header__actions">
          <button
            type="button"
            class="admin-header__prompt-btn"
            title="Master Görsel & Kapak Prompt Yöneticisini Aç"
            @click="openPromptModal('general')"
          >
            ✨ Görsel Promptu
          </button>
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
            <label class="field">
              <span>Kapak görseli alt yazısı (isteğe bağlı)</span>
              <input
                v-model="blogForm.coverCaption"
                placeholder="Örn: Philips Ambilight TV ve Mi Stick ile çalışan akıllı TV ortamı"
              />
            </label>
            <label class="field field--wide">
              <span>Kısa açıklama</span>
              <textarea v-model="blogForm.excerpt" rows="3" />
            </label>
            <div class="field field--wide github-editor">
              <div class="github-editor__header">
                <div class="github-editor__tabs">
                  <button
                    type="button"
                    class="github-editor__tab"
                    :class="{ 'is-active': editorTab === 'write' }"
                    @click="editorTab = 'write'"
                  >
                    ✏️ Yaz
                  </button>
                  <button
                    type="button"
                    class="github-editor__tab"
                    :class="{ 'is-active': editorTab === 'preview' }"
                    @click="editorTab = 'preview'"
                  >
                    👁️ Canlı Önizleme
                  </button>
                </div>
                <span class="github-editor__hint">Markdown · Tablo · İnce Resim Yazısı Destekli</span>
              </div>

              <!-- Toolbar (shown in write mode) -->
              <div v-show="editorTab === 'write'" class="github-toolbar">
                <div class="github-toolbar__group">
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Büyük Başlık (H2)"
                    @click="applyFormat('h2')"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Alt Başlık (H3)"
                    @click="applyFormat('h3')"
                  >
                    H3
                  </button>
                </div>
                <div class="github-toolbar__divider" />
                <div class="github-toolbar__group">
                  <button
                    type="button"
                    class="toolbar-btn toolbar-btn--bold"
                    title="Kalın"
                    @click="applyFormat('bold')"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn toolbar-btn--italic"
                    title="İtalik"
                    @click="applyFormat('italic')"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Alıntı"
                    @click="applyFormat('quote')"
                  >
                    ❝
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Kod"
                    @click="applyFormat('code')"
                  >
                    &lt;&gt;
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Bağlantı"
                    @click="applyFormat('link')"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Maddeli Liste"
                    @click="applyFormat('ul')"
                  >
                    ☰
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Numaralı Liste"
                    @click="applyFormat('ol')"
                  >
                    1.
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn"
                    title="Yatay Çizgi / Ayraç"
                    @click="applyFormat('hr')"
                  >
                    —
                  </button>
                </div>
                <div class="github-toolbar__divider" />
                <div class="github-toolbar__group">
                  <button
                    type="button"
                    class="toolbar-btn toolbar-btn--action"
                    title="Tablo Şablonu Ekle"
                    @click="insertTableTemplate"
                  >
                    📊 + Tablo
                  </button>
                  <input
                    id="blog-inline-file"
                    class="visually-hidden"
                    type="file"
                    :accept="imageTypes"
                    :disabled="uploadState.inline"
                    @change="insertBlogImage"
                  />
                  <label
                    class="toolbar-btn toolbar-btn--action"
                    for="blog-inline-file"
                    title="Görsel Yükle ve İnce Yatay Resim Yazısı Ekle"
                  >
                    {{
                      uploadState.inline
                        ? `Yükleniyor · %${uploadProgress.inline}`
                        : '📷 + Görsel Ekle'
                    }}
                  </label>
                  <button
                    type="button"
                    class="toolbar-btn toolbar-btn--action"
                    title="Resim Yazısı Ekle (İnce Yatay)"
                    @click="applyFormat('caption')"
                  >
                    ✍️ Resim Yazısı
                  </button>
                  <button
                    type="button"
                    class="toolbar-btn toolbar-btn--action"
                    title="YouTube veya Google Drive videosu ekle"
                    @click="insertVideoLink"
                  >
                    🎥 + Video Linki
                  </button>
                  <input
                    id="blog-video-file"
                    class="visually-hidden"
                    type="file"
                    :accept="videoTypes"
                    :disabled="uploadState.video"
                    @change="insertUploadedVideo"
                  />
                  <label
                    class="toolbar-btn toolbar-btn--action"
                    for="blog-video-file"
                    title="Doğrudan Video Dosyası Yükle"
                  >
                    {{
                      uploadState.video
                        ? `Yükleniyor · %${uploadProgress.video}`
                        : '📁 + Video Dosyası'
                    }}
                  </label>
                </div>
              </div>

              <!-- Write Area -->
              <div v-show="editorTab === 'write'" class="github-editor__write">
                <textarea
                  id="blog-body"
                  ref="blogBodyInput"
                  v-model="blogForm.body"
                  rows="16"
                  placeholder="Yazınızı buraya yazın. Markdown, tablolar, başlıklar (## Başlık), görseller ve listeler desteklenir..."
                  required
                />
              </div>

              <!-- Preview Area -->
              <div v-show="editorTab === 'preview'" class="github-editor__preview">
                <div v-if="!blogForm.body.trim()" class="preview-empty">
                  Henüz bir metin girmediniz. [Yaz] sekmesine geçip yazınızı yazabilirsiniz.
                </div>
                <div v-else class="article-preview-content">
                  <template
                    v-for="(block, index) in previewBlocks"
                    :key="`${block.type}-${index}`"
                  >
                    <figure v-if="block.type === 'image'" class="article-inline-image">
                      <img
                        :src="block.src"
                        :alt="block.alt"
                        loading="lazy"
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
                        allowfullscreen
                      />
                      <figcaption v-if="block.title" class="article-caption article-caption--italic-thin">{{ block.title }}</figcaption>
                    </figure>
                    <figure v-else-if="block.type === 'video'" class="article-video">
                      <video controls preload="metadata">
                        <source :src="block.src" />
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
                              :style="block.alignments?.[hIndex] ? { textAlign: block.alignments[hIndex] } : null"
                              v-html="renderInlineMarkdown(header)"
                            />
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, rIndex) in block.rows"
                            :key="`row-${rIndex}`"
                          >
                            <td
                              v-for="(cell, cIndex) in row"
                              :key="`cell-${cIndex}`"
                              :style="block.alignments?.[cIndex] ? { textAlign: block.alignments[cIndex] } : null"
                              v-html="renderInlineMarkdown(cell)"
                            />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p
                      v-else
                      class="article-paragraph"
                      v-html="renderInlineMarkdown(block.text)"
                    />
                  </template>
                </div>
              </div>
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

      <div v-else class="settings-wrapper">
        <section class="settings-card">
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

        <section class="settings-card" style="margin-top: 2rem;">
          <div class="editor-card__heading">
            <div>
              <p class="admin-eyebrow">YAPAY ZEKA & GÖRSEL DİLİ</p>
              <h2>Master Görsel / Kapak Promptu</h2>
            </div>
          </div>
          <p class="settings-card__desc">
            Yazı ve proje kapakları üretirken kullanılan master görsel sistem promptu. Buradan yapacağınız değişiklikler kalıcı olarak saklanır ve editördeki hızlı prompt üreticide kullanılır.
          </p>
          <div class="field-grid">
            <label class="field field--wide">
              <span>Master Sistem Promptu (Şablon)</span>
              <textarea
                v-model="settingsForm.coverPrompt"
                rows="12"
                class="prompt-code-box prompt-code-box--editable"
                placeholder="Master prompt şablonu..."
              />
            </label>
            <div class="prompt-actions-row field--wide">
              <button
                class="primary-button"
                type="button"
                :disabled="promptSaving"
                @click="saveMasterPrompt"
              >
                {{ promptSaving ? 'Kaydediliyor...' : 'Promptu Sisteme Kaydet' }}
              </button>
              <button
                class="secondary-button btn-danger-soft"
                type="button"
                @click="resetMasterPromptToDefault"
              >
                ↺ Varsayılana Sıfırla
              </button>
            </div>
          </div>
        </section>

        <section class="settings-card admin-password-card" style="margin-top: 2rem;">
          <div class="editor-card__heading">
            <div>
              <p class="admin-eyebrow">GÜVENLİK</p>
              <h2>Yönetim parolası</h2>
            </div>
          </div>
          <p class="settings-card__desc">
            Yönetim paneline şifreyle girişte kullanacağınız parolayı buradan güncelleyebilirsiniz. Yeni parolanız güvenli şekilde şifrelenerek saklanır.
          </p>
          <form class="field-grid" @submit.prevent="submitChangePassword">
            <label class="field">
              <span>Yeni Parola</span>
              <input
                v-model="passwordChange.newPassword"
                type="password"
                placeholder="En az 6 karakter"
                required
              />
            </label>
            <label class="field">
              <span>Yeni Parola Tekrar</span>
              <input
                v-model="passwordChange.confirmPassword"
                type="password"
                placeholder="Parolayı tekrar girin"
                required
              />
            </label>
            <p v-if="passwordChange.error" class="form-error field--wide" role="alert">
              {{ passwordChange.error }}
            </p>
            <p v-if="passwordChange.message" class="form-success field--wide" role="status">
              {{ passwordChange.message }}
            </p>
            <button
              class="primary-button"
              type="submit"
              :disabled="passwordChange.loading"
            >
              {{ passwordChange.loading ? 'Kaydediliyor...' : 'Parolayı Güncelle' }}
            </button>
          </form>
        </section>
      </div>

      <div v-if="notice" class="notice" role="status">{{ notice }}</div>

      <!-- Master Cover Prompt Modal -->
      <div
        v-if="promptModalOpen"
        class="prompt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
      >
        <div class="prompt-modal__backdrop" @click="closePromptModal"></div>
        <div class="prompt-modal__card">
          <header class="prompt-modal__header">
            <div class="prompt-modal__title-group">
              <span class="prompt-modal__badge">MASTER PROMPT</span>
              <h2 id="prompt-modal-title">16:9 Görsel & Kapak Prompt Üretici</h2>
            </div>
            <button
              type="button"
              class="prompt-modal__close-btn"
              title="Kapat"
              @click="closePromptModal"
            >
              ✕
            </button>
          </header>

          <div class="prompt-modal__tabs">
            <button
              type="button"
              class="prompt-modal__tab"
              :class="{ 'is-active': promptModalTab === 'filled' }"
              @click="promptModalTab = 'filled'"
            >
              ✨ Hazır Prompt (Doldurulmuş)
            </button>
            <button
              type="button"
              class="prompt-modal__tab"
              :class="{ 'is-active': promptModalTab === 'template' }"
              @click="promptModalTab = 'template'"
            >
              ⚙️ Şablonu Düzenle & Sisteme Kaydet
            </button>
          </div>

          <div class="prompt-modal__body">
            <!-- Filled Prompt Tab -->
            <div v-show="promptModalTab === 'filled'" class="prompt-view-filled">
              <div class="prompt-context-banner">
                <div class="prompt-context-banner__info">
                  <span class="prompt-context-pill">
                    {{ promptModalContext === 'blog' ? 'Blog Yazısı' : promptModalContext === 'project' ? 'Çalışma / Proje' : 'Genel' }}
                  </span>
                  <strong>{{ promptModalContext === 'blog' ? (blogForm.title || 'Başlık Girilmedi') : promptModalContext === 'project' ? (projectForm.title || 'Başlık Girilmedi') : 'Özel İçerik' }}</strong>
                </div>
                <small>Başlık ve açıklama mevcut formdan otomatik aktarılmıştır.</small>
              </div>

              <div class="prompt-inputs-grid">
                <label class="field">
                  <span>İsteğe bağlı ek yönerge / odak noktası</span>
                  <input
                    v-model="promptCustomNote"
                    placeholder="Örn: TV ekranındaki arayüzü ve arkadaki yumuşak ışığı vurgula..."
                  />
                </label>
                <label class="field">
                  <span>Referans görsel notu</span>
                  <input
                    v-model="promptRefImages"
                    placeholder="Örn: Ekli seri kapakları veya /img/blog/oem-tv-launcher/cover.png"
                  />
                </label>
              </div>

              <div class="prompt-preview-wrap">
                <div class="prompt-preview-header">
                  <span>Üretilen Tam Prompt (Kullanıma Hazır)</span>
                  <button
                    type="button"
                    class="prompt-copy-inline-btn"
                    :class="{ 'is-copied': promptCopied }"
                    @click="copyPromptToClipboard(computedFilledPrompt)"
                  >
                    {{ promptCopied ? '✅ Kopyalandı!' : '📋 Kopyala' }}
                  </button>
                </div>
                <textarea
                  class="prompt-code-box"
                  :value="computedFilledPrompt"
                  readonly
                  rows="14"
                />
              </div>
            </div>

            <!-- Master Template Tab -->
            <div v-show="promptModalTab === 'template'" class="prompt-view-template">
              <div class="prompt-template-info">
                <p>
                  Bu metin sisteminizde kalıcı olarak saklanan <strong>Master Görsel / Kapak Üretim Promptu</strong>dur.
                  Değişiklik yaptığınızda <code v-pre>{{TITLE}}</code>, <code v-pre>{{DESCRIPTION}}</code>, <code v-pre>{{OPTIONAL_NOTE}}</code> ve <code v-pre>{{REFERENCE_IMAGES}}</code> değişkenleri korunmalıdır.
                </p>
              </div>

              <label class="field field--wide">
                <span>Master Prompt Şablonu</span>
                <textarea
                  v-model="settingsForm.coverPrompt"
                  class="prompt-code-box prompt-code-box--editable"
                  rows="16"
                  placeholder="Master prompt şablonu..."
                />
              </label>
            </div>
          </div>

          <footer class="prompt-modal__footer">
            <template v-if="promptModalTab === 'filled'">
              <div class="prompt-modal__footer-left">
                <button
                  type="button"
                  class="secondary-button"
                  @click="promptModalTab = 'template'"
                >
                  ⚙️ Şablonu Düzenle
                </button>
              </div>
              <div class="prompt-modal__footer-right">
                <button
                  type="button"
                  class="text-button"
                  @click="closePromptModal"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  class="primary-button"
                  :class="{ 'btn-success': promptCopied }"
                  @click="copyPromptToClipboard(computedFilledPrompt)"
                >
                  {{ promptCopied ? '✅ Panoya Kopyalandı!' : '📋 Promptu Kopyala' }}
                </button>
              </div>
            </template>

            <template v-else>
              <div class="prompt-modal__footer-left">
                <button
                  type="button"
                  class="secondary-button btn-danger-soft"
                  @click="resetMasterPromptToDefault"
                >
                  ↺ Varsayılana Sıfırla
                </button>
              </div>
              <div class="prompt-modal__footer-right">
                <button
                  type="button"
                  class="text-button"
                  @click="closePromptModal"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  class="primary-button"
                  :disabled="promptSaving"
                  @click="saveMasterPrompt"
                >
                  {{ promptSaving ? 'Kaydediliyor...' : '💾 Değişiklikleri Sisteme Kaydet' }}
                </button>
              </div>
            </template>
          </footer>
        </div>
      </div>
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
.settings-card {
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
  outline-offset: 0;
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

.github-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  background: var(--panel-2);
  margin-top: 0.5rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem 0;
    border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.02);
  }

  &__tabs {
    display: flex;
    gap: 0.35rem;
  }

  &__tab {
    padding: 0.55rem 0.95rem;
    border: 1px solid transparent;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    background: transparent;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      color: var(--ff-color);
      background: rgba(255, 255, 255, 0.03);
    }

    &.is-active {
      color: var(--ff-color);
      background: var(--panel);
      border-color: var(--border);
      border-bottom: 1px solid var(--panel);
      margin-bottom: -1px;
    }
  }

  &__hint {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .github-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.015);

    &__group {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    &__divider {
      width: 1px;
      height: 1.4rem;
      margin: 0 0.35rem;
      background: rgba(255, 255, 255, 0.12);
    }

    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0 0.55rem;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--ff-color);
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: rgba(255, 230, 237, 0.12);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      &--bold {
        font-weight: 800;
      }

      &--italic {
        font-style: italic;
      }

      &--action {
        font-size: 0.72rem;
        background: rgba(255, 230, 237, 0.06);
        border-color: rgba(255, 230, 237, 0.25);
        color: var(--primary-color);

        &:hover {
          background: rgba(255, 230, 237, 0.18);
        }
      }
    }
  }

  &__write {
    textarea {
      width: 100%;
      border: 0;
      border-radius: 0;
      background: var(--panel);
      padding: 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--ff-color);
      min-height: 380px;

      &:focus {
        outline: none;
      }
    }
  }

  &__preview {
    min-height: 380px;
    max-height: 75vh;
    overflow-y: auto;
    padding: 1.5rem 2rem;
    background: #030303;
    border-top: 1px solid var(--border);

    .preview-empty {
      padding: 3rem 1rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.9rem;
      font-style: italic;
    }

    .article-preview-content {
      max-width: 800px;
      margin: 0 auto;

      .article-paragraph {
        margin: 0 0 1.5rem;
        font-size: 1.05rem;
        line-height: 1.8;
        color: rgba(247, 247, 247, 0.92);
      }

      .article-heading-2 {
        margin: 2.5rem 0 1rem;
        font-size: 1.7rem;
        font-weight: 600;
        color: var(--ff-color);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.4rem;
      }

      .article-heading-3 {
        margin: 2rem 0 0.8rem;
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--ff-color);
      }

      .article-blockquote {
        margin: 2rem 0;
        padding: 1rem 1.5rem;
        border-left: 3px solid var(--primary-color);
        background: rgba(255, 230, 237, 0.04);
        color: rgba(247, 247, 247, 0.88);
        font-style: italic;
        font-weight: 300;
        line-height: 1.6;
      }

      .article-list {
        margin: 0 0 1.5rem;
        padding-left: 1.5rem;
        font-size: 1rem;
        line-height: 1.8;
        color: rgba(247, 247, 247, 0.92);

        li {
          margin-bottom: 0.4rem;
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
        margin: 2.5rem auto;
        width: 60%;
      }

      .article-inline-image {
        margin: 2rem auto;
        text-align: center;

        img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 0 auto;
          border-radius: 4px;
        }
      }

      .article-caption {
        display: block;
        width: 100%;
        margin-top: 0.75rem;
        color: rgba(247, 247, 247, 0.65);
        font-size: 0.88rem;
        line-height: 1.5;
        letter-spacing: 0.02em;
        text-align: center;
        font-style: italic;
        font-weight: 300;

        &--italic-thin {
          font-style: italic;
          font-weight: 300;
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

      .article-table-wrapper {
        margin: 2rem 0;
        overflow-x: auto;
        border: 1px solid rgba(247, 247, 247, 0.14);
        background: rgba(255, 255, 255, 0.02);
      }

      .article-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
        line-height: 1.5;

        th,
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(247, 247, 247, 0.08);
        }

        th {
          font-weight: 600;
          color: var(--ff-color);
          background: rgba(255, 255, 255, 0.04);
        }

        td {
          color: rgba(247, 247, 247, 0.88);
        }

        tr:nth-child(even) td {
          background: rgba(255, 255, 255, 0.015);
        }
      }

      .article-video {
        margin: 2rem 0;
        iframe, video {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 0;
        }
      }
    }
  }
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
  margin: 4vh auto 0;
  padding: clamp(2.2rem, 5vw, 3.5rem);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #08080a;
  box-shadow:
    0 32px 80px -20px rgba(0, 0, 0, 0.85),
    0 0 50px rgba(255, 255, 255, 0.03);
}

.login-panel__canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.92;
}

.login-panel__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(9, 9, 11, 0.65) 0%,
    rgba(9, 9, 11, 0.82) 50%,
    rgba(9, 9, 11, 0.94) 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
  border-radius: inherit;
}

.login-panel__content {
  position: relative;
  z-index: 2;
}

.login-panel .admin-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 3.5rem;
  color: var(--muted, rgba(247, 247, 247, 0.6));
  font-size: 0.88rem;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: #ffffff;
    transform: translateX(-3px);
  }
}

.login-panel h1 {
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.login-panel .admin-eyebrow {
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  font-weight: 600;
}

.login-panel__intro {
  margin: 1.25rem 0 2.25rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.98rem;
  line-height: 1.6;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.login-form {
  display: grid;
  gap: 0.75rem;
  overflow: hidden;
  position: relative;

  input {
    width: 100%;
    resize: none;
    overflow: hidden !important;
    overflow-x: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    box-sizing: border-box !important;

    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  }

  iframe,
  div[class*='bitwarden'],
  div[class*='password'],
  div[id*='bitwarden'] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
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

.google-auth-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 420px;
  margin-top: 0.5rem;
}

.google-auth-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 54px;
  padding: 0 1.35rem;
  background: rgba(18, 18, 22, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  color: #f7f7f7;
  font-family: inherit;
  font-size: 0.96rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &__inner {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  &__text {
    color: #ffffff;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  &__arrow {
    color: var(--muted, #8a8a8e);
    font-size: 1.15rem;
    line-height: 1;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  &:hover:not(:disabled) {
    background: rgba(28, 28, 34, 0.95);
    border-color: rgba(255, 255, 255, 0.45);
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5);

    .google-auth-button__arrow {
      color: #ffffff;
      transform: translateX(3px);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    background: #111113;
  }

  &:disabled {
    opacity: 0.65;
    cursor: wait;
    transform: none;
  }
}

.google-icon {
  flex-shrink: 0;
  display: block;
}



.text-link-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.3rem 0;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #ffffff;
  }
}

.form-success {
  margin: 0;
  color: #8effaa;
  font-size: 0.82rem;
}

/* Prompt Modal & Trigger Styles */
.toolbar-btn--prompt {
  background: rgba(255, 120, 80, 0.12) !important;
  border-color: rgba(255, 120, 80, 0.3) !important;
  color: #ffaa88 !important;
  font-weight: 500;

  &:hover {
    background: rgba(255, 120, 80, 0.22) !important;
    border-color: rgba(255, 120, 80, 0.5) !important;
    color: #ffffff !important;
  }
}

.btn-prompt-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 120, 80, 0.12);
    border-color: rgba(255, 120, 80, 0.35);
    color: #ffaa88;
  }
}

.admin-header__prompt-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 120, 80, 0.12);
  border: 1px solid rgba(255, 120, 80, 0.3) !important;
  border-radius: 4px;
  color: #ffaa88 !important;
  font-size: 0.72rem !important;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 120, 80, 0.22);
    border-color: rgba(255, 120, 80, 0.5) !important;
    color: #ffffff !important;
  }
}

.prompt-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(6, 6, 8, 0.82);
    backdrop-filter: blur(8px);
  }

  &__card {
    position: relative;
    z-index: 1;
    width: min(940px, 100%);
    max-height: 88vh;
    background: #131315;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8);
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);

    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 500;
      letter-spacing: -0.01em;
    }
  }

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: rgba(255, 120, 80, 0.15);
    color: #ffaa88;
    border: 1px solid rgba(255, 120, 80, 0.3);
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  &__close-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    line-height: 1;
    transition: all 0.2s;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &__tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__tab {
    background: none;
    border: 1px solid transparent;
    color: var(--muted);
    font-size: 0.8rem;
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &.is-active {
      background: rgba(255, 255, 255, 0.09);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.16);
      font-weight: 500;
    }

    &:hover:not(.is-active) {
      color: #e0e0e0;
    }
  }

  &__body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);

    &-left,
    &-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
  }
}

.prompt-view-filled,
.prompt-view-template {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.prompt-context-banner {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;

  &__info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.88rem;
  }

  small {
    color: var(--muted);
    font-size: 0.75rem;
  }
}

.prompt-context-pill {
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.prompt-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.prompt-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--muted);
}

.prompt-copy-inline-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 4px;
  padding: 0.25rem 0.65rem;
  font-size: 0.74rem;
  cursor: pointer;
  transition: all 0.2s;

  &.is-copied {
    background: #1b4d2e;
    border-color: #2ea043;
    color: #8effaa;
  }

  &:hover:not(.is-copied) {
    background: rgba(255, 255, 255, 0.15);
  }
}

.prompt-code-box {
  width: 100%;
  padding: 1rem;
  background: #0a0a0c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #d8d8d8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.55;
  resize: vertical;
  white-space: pre-wrap;
  word-break: break-word;

  &:focus {
    outline: none;
    border-color: rgba(255, 120, 80, 0.45);
  }

  &--editable {
    background: #0e0e11;
  }
}

.prompt-template-info {
  padding: 0.85rem 1.1rem;
  background: rgba(255, 180, 80, 0.06);
  border: 1px solid rgba(255, 180, 80, 0.18);
  border-radius: 6px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #ddd;

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    color: #ffaa88;
    font-size: 0.8rem;
  }
}

.btn-danger-soft {
  background: rgba(255, 70, 70, 0.1) !important;
  border: 1px solid rgba(255, 70, 70, 0.25) !important;
  color: #ff8888 !important;

  &:hover {
    background: rgba(255, 70, 70, 0.2) !important;
    border-color: rgba(255, 70, 70, 0.4) !important;
  }
}

.btn-success {
  background: #238636 !important;
  border-color: #2ea043 !important;
  color: #ffffff !important;
}

.prompt-actions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
</style>
