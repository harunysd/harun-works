<script setup>
const route = useRoute();
const { $smoothScroll } = useNuxtApp();
const { gsap } = useGsap();
const { base } = useRuntimeConfig().public;
const { load: loadSiteContent } = useSiteContent();

await useAsyncData('global-site-content', loadSiteContent);

const overlay = shallowRef({});

const projectSlug = computed(() => route.params.slug ?? '');
const currentURL = computed(() =>
  route.path === '/' ? base : `${base}${route.path}`,
);
const ogImageUrl = computed(() =>
  route.path.startsWith('/project/') && projectSlug.value
    ? `${base}/img/${projectSlug.value}-preview.jpg`
    : `${base}/logo.png`,
);

function setVh() {
  const windowHeight = window.innerHeight;

  gsap.set(document.documentElement, { '--vh': `${windowHeight / 100}px` });
}

useHead({
  meta: [
    { property: 'url', name: 'url', content: () => currentURL.value },
    { property: 'og:url', name: 'og:url', content: () => currentURL.value },
    { property: 'og:image', name: 'og:image', content: () => ogImageUrl.value },
  ],
  link: [{ rel: 'canonical', href: () => currentURL.value }],
});

onMounted(() => {
  setVh();

  if (route.name !== 'index') {
    $smoothScroll.disable();

    nextTick(() => {
      const pageEl = document.querySelector('div[page-content]');
      if (pageEl && overlay.value?.enterPageAnim) {
        overlay.value.enterPageAnim(pageEl, () => null);
      }
    });
  }

  const unregister = on(window, 'resize', setVh);

  setTimeout(
    () => import('~/lib/greeting').then((module) => module.logGreeting()),
    250,
  );

  onBeforeUnmount(() => {
    unregister();
  });
});
</script>

<template>
  <NuxtLink
    v-if="$route.path !== '/admin'"
    to="/admin"
    class="secret-admin-trigger"
    aria-hidden="true"
    tabindex="-1"
  />

  <VNavbar />

  <Transition
    :css="false"
    mode="out-in"
    @enter="overlay.enterPageAnim"
    @leave="overlay.leavePageAnim"
  >
    <!-- NOTE: use of $route instead of just route is really important for good animation -->
    <div page-content :key="$route.fullPath">
      <NuxtPage />
    </div>
  </Transition>

  <VPointer />
  <VLoader />
  <VOverlay ref="overlay" />
  <VEmailModal />
</template>

<style>
.secret-admin-trigger {
  position: fixed;
  top: 0;
  left: 0;
  width: 54px;
  height: 54px;
  z-index: 99;
  opacity: 0;
  pointer-events: auto;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
</style>
