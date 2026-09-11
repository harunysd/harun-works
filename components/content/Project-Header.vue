<script setup>
const route = useRoute();

const injectedProject = inject('projectData', null);

const project = computed(() => injectedProject?.value || {});
const imageUrl = computed(
  () => project.value?.image || project.value?.previewImage || '',
);
</script>

<template>
  <header class="project-header" data-scroll-section>
    <div v-if="imageUrl" class="project-header__bg">
      <img
        :src="imageUrl"
        :alt="project?.title || ''"
        class="project-header__bg__image"
      />
      <div class="project-header__bg__overlay" />
    </div>

    <div class="project-header__content">
      <slot class="project-header__title" />
    </div>
  </header>
</template>

<style lang="scss">
.project-header {
  position: relative;
  min-height: clamp(320px, 46vh, 500px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  padding: clamp(5rem, 9vh, 7rem) clamp(1rem, 7vw, 10rem) clamp(1.5rem, 3vh, 2.25rem);
  margin-bottom: 3.5rem;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      transform: scale(1.02);
    }

    &__overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      // Koyu şeffaf ton: başlığın okunabilirliğini maksimuma çıkarır ve alttaki sayfaya yumuşakça bağlanır
      background: linear-gradient(
        180deg,
        rgba(3, 3, 3, 0.45) 0%,
        rgba(3, 3, 3, 0.68) 50%,
        rgba(3, 3, 3, 0.95) 100%
      );
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
  }

}
</style>
