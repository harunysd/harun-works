<script setup>
const route = useRoute();
const { data: surrounded } = await useAsyncData(
  `surround-project-${route.params.slug}`,
  () => queryContent('project').findSurround(route.fullPath),
);

const next = computed(() => {
  if (!surrounded.value) return null;
  return surrounded.value[1] || surrounded.value[0] || null;
});

if (process.server) {
  useHead(
    {
      link: computed(() =>
        next.value
          ? [
              { rel: 'next', href: next.value._path },
              { rel: 'prefetch', href: next.value.previewImage },
            ]
          : [],
      ),
    },
    { mode: 'server' },
  );
}
</script>

<template>
  <NuxtLink v-if="next" v-hoverable.link :href="next._path" class="project-next">
    <img
      :src="next.previewImage"
      :alt="next.title"
      class="project-next__image"
      data-scroll
      data-scroll-speed="-2"
      data-scroll-position="bottom"
    />

    <span class="project-next__title">{{ next.title }}</span>
  </NuxtLink>
</template>

<style lang="scss">
.project-next {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  z-index: 1;

  font-size: var(--step-2);
  color: currentColor;
  text-decoration: none;

  min-height: min(20rem, 40vh);

  padding: 1.5rem 2rem;
  margin-top: 1.5rem;
  margin-bottom: 0;

  background-color: #030303;
  overflow: hidden;
  cursor: pointer;

  &__title {
    position: relative;
    z-index: 2;
    text-align: center;
    font-weight: 500;
  }

  &__image {
    display: block;

    position: absolute;
    top: -20%;
    left: 0;
    z-index: 0;

    width: 100%;
    height: 140%;

    object-fit: cover;
    object-position: center center;

    opacity: 0.85;
    transition: opacity 300ms ease;
  }

  &__svg {
    width: var(--step-1);
    height: auto;

    margin-left: 0.75rem;

    transform: translateY(0);
  }

  &::before {
    content: '';

    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 90px;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      #030303 0%,
      rgba(3, 3, 3, 0.8) 50%,
      transparent 100%
    );
  }

  &::after {
    content: '';

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    pointer-events: none;

    background-color: rgba(3, 3, 3, 0.55);
    transition: background-color 300ms ease;
  }

  &:hover::after {
    background-color: rgba(3, 3, 3, 0.35);
  }
}
</style>
