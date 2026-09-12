<script setup>
const route = useRoute();
const { $smoothScroll } = useNuxtApp();
const { gsap, ScrollTrigger } = useGsap();
const emitter = useEmitter();
const { projectOverrides, settings } = useSiteContent();

const { data: project } = await useAsyncData(
  `project-${route.params.slug}`,
  () =>
    queryContent(`project/${route.params.slug}`)
      .findOne()
      .catch(() => null),
);

const managedProject = computed(() =>
  projectOverrides.value.find(
    (item) => item._path === `/project/${route.params.slug}`,
  ),
);
const pageProject = computed(() =>
  managedProject.value
    ? { ...(project.value || {}), ...managedProject.value }
    : project.value,
);

provide('projectData', pageProject);

if (process.server) {
  useHead(
    {
      htmlAttrs: { 'data-project-page': true },
      title: pageProject.value?.title || 'Çalışma',
    },
    { mode: 'server' },
  );
}

const projectPage = ref(null);

let backButtonShown = false;
const showBackButton = () => {
  if (backButtonShown) return;
  backButtonShown = true;
  gsap.fromTo(
    '.nav__back-link',
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.4 },
  );
};

const updateScroll = () => {
  nextTick(() => {
    $smoothScroll?.update?.();
    ScrollTrigger?.refresh?.();
  });
};

useImagesLoaded(projectPage, () => {
  emitter.emit('images:loaded');
  updateScroll();
});

emitter.once('overlay:hiding', showBackButton);

onMounted(() => {
  updateScroll();
  setTimeout(updateScroll, 250);
  setTimeout(showBackButton, 350);
});
</script>

<template>
  <div ref="projectPage" class="projects-page">
    <article v-if="managedProject" class="managed-project">
      <header class="managed-project__header">
        <p>ÇALIŞMA / {{ managedProject.tags?.join(' · ') }}</p>
        <h1>{{ managedProject.title }}</h1>
        <div class="managed-project__meta">
          <span>{{ managedProject.description }}</span>
          <a
            v-if="managedProject.live"
            :href="managedProject.live"
            target="_blank"
            rel="noreferrer"
          >
            Projeyi aç ↗
          </a>
        </div>
      </header>
      <img
        v-if="managedProject.image"
        :src="managedProject.image"
        :alt="managedProject.title"
        class="managed-project__image"
      />
      <div class="managed-project__body">
        <p
          v-for="(paragraph, index) in (
            managedProject.bodyText ||
            managedProject.description ||
            ''
          ).split(/\n+/)"
          :key="index"
        >
          {{ paragraph }}
        </p>
        <a :href="`mailto:${settings.email}`">İletişime geç ↗</a>
      </div>
    </article>
    <ContentDoc v-else />
  </div>
</template>

<style lang="scss">
[data-project-page] .loader {
  opacity: 0;
  pointer-events: none;
}

.projects-page {
  min-height: 100vh;
}

.managed-project {
  min-height: 100vh;
  padding: clamp(7rem, 14vw, 12rem) clamp(1.25rem, 7vw, 7rem) 6rem;
  color: var(--ff-color);
  background: var(--surface-color);

  &__header,
  &__body {
    width: min(920px, 100%);
    margin-inline: auto;
  }

  &__header > p {
    margin: 0 0 1.5rem;
    color: var(--primary-color);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  &__header h1 {
    margin: 0;
    font-size: clamp(3rem, 8vw, 7.5rem);
    font-weight: 500;
    letter-spacing: -0.06em;
    line-height: 0.95;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(247, 247, 247, 0.13);
    color: rgba(247, 247, 247, 0.65);
    line-height: 1.5;
  }

  &__meta span {
    max-width: 42rem;
  }

  &__meta a,
  &__body a {
    flex: 0 0 auto;
    color: var(--primary-color);
    text-decoration: none;
  }

  &__image {
    display: block;
    width: min(1200px, 100%);
    max-height: 70vh;
    margin: clamp(4rem, 10vw, 8rem) auto;
    object-fit: cover;
  }

  &__body {
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    line-height: 1.7;
  }

  &__body p {
    margin: 0 0 2rem;
  }

  @media (max-width: 700px) {
    &__meta {
      flex-direction: column;
    }
  }
}
</style>
