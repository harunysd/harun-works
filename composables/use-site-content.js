import { toRaw } from 'vue';
import {
  defaultSiteContent,
  normalizeSiteContent,
} from '~/lib/site-content-defaults.js';

export function useSiteContent() {
  const siteContent = useState('site-content', () =>
    structuredClone(defaultSiteContent),
  );
  const isLoaded = useState('site-content-loaded', () => false);

  async function load() {
    if (isLoaded.value) return siteContent.value;
    try {
      siteContent.value = normalizeSiteContent(
        await $fetch('/api/site-content'),
      );
    } catch (error) {
      console.warn('Site content could not be loaded.', error);
    } finally {
      isLoaded.value = true;
    }
    return siteContent.value;
  }

  function safeClone(obj) {
    return JSON.parse(JSON.stringify(toRaw(obj) || obj));
  }

  async function persist() {
    const payload = safeClone(siteContent.value);
    const value = await $fetch('/api/admin/site-content', {
      method: 'PUT',
      body: payload,
    });
    siteContent.value = normalizeSiteContent(value);
  }

  async function mutateAndPersist(mutator) {
    const previous = safeClone(siteContent.value);
    mutator();
    try {
      await persist();
    } catch (error) {
      siteContent.value = previous;
      throw error;
    }
  }

  async function updateSettings(settings) {
    await mutateAndPersist(() => {
      siteContent.value.settings = {
        ...siteContent.value.settings,
        ...settings,
      };
    });
  }

  async function upsertBlogPost(post) {
    await mutateAndPersist(() => {
      const index = siteContent.value.blogPosts.findIndex(
        (item) => item.id === post.id,
      );
      if (index === -1) siteContent.value.blogPosts.unshift(post);
      else siteContent.value.blogPosts.splice(index, 1, post);
    });
  }

  async function removeBlogPost(id) {
    await mutateAndPersist(() => {
      siteContent.value.blogPosts = siteContent.value.blogPosts.filter(
        (post) => post.id !== id,
      );
    });
  }

  async function upsertProjectOverride(project) {
    await mutateAndPersist(() => {
      const index = siteContent.value.projectOverrides.findIndex(
        (item) => item._path === project._path,
      );
      if (index === -1) siteContent.value.projectOverrides.push(project);
      else siteContent.value.projectOverrides.splice(index, 1, project);
    });
  }

  return {
    content: siteContent,
    settings: computed(() => siteContent.value.settings),
    blogPosts: computed(() => siteContent.value.blogPosts),
    projectOverrides: computed(() => siteContent.value.projectOverrides),
    load,
    updateSettings,
    upsertBlogPost,
    removeBlogPost,
    upsertProjectOverride,
  };
}
