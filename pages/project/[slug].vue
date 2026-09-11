<script setup>
const route = useRoute();
const { $smoothScroll } = useNuxtApp();
const { gsap, ScrollTrigger } = useGsap();
const emitter = useEmitter();

const { data: project } = await useAsyncData(
  `project-${route.params.slug}`,
  () => queryContent(`project/${route.params.slug}`).findOne(),
);

provide('projectData', project);

if (process.server) {
  useHead(
    {
      htmlAttrs: { 'data-project-page': true },
      title: project.value.title,
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
    <ContentDoc />
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
</style>
