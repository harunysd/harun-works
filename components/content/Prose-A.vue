<script setup>
import ArrowLink from '~/assets/img/arrow-outer-link.svg';

const props = defineProps({
  href: { type: String, required: true, default: '' },
});

const isEmailModalOpen = useEmailModal();

function handleClick(e) {
  if (props.href.startsWith('mailto:')) {
    e.preventDefault();
    e.stopPropagation();
    isEmailModalOpen.value = true;
  }
}
</script>

<template>
  <a
    v-if="href.startsWith('mailto:') || href.startsWith('http')"
    :href="href"
    class="project-link"
    :target="href.startsWith('mailto:') ? undefined : '_blank'"
    :rel="href.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
    @click="handleClick"
  >
    <ContentSlot :use="$slots.default" :unwrap="true" />
    <ArrowLink class="project-link__arrow-svg" />
  </a>
  <NuxtLink
    v-else
    :href="href"
    class="project-link"
    @click="handleClick"
  >
    <ContentSlot :use="$slots.default" :unwrap="true" />
    <ArrowLink class="project-link__arrow-svg" />
  </NuxtLink>
</template>

<style lang="scss">
.project-link {
  --size: var(--step--1);

  display: inline-flex;
  align-items: center;

  font: inherit;
  font-size: var(--size);

  color: var(--ff-color);
  text-decoration: none;

  opacity: 0.85;
  cursor: pointer !important;
  pointer-events: all;
  padding: 0.35rem 0.65rem;
  margin: -0.15rem -0.35rem;
  border-radius: 4px;
  transition: opacity 0.2s, background-color 0.2s;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.12);
  }

  &__arrow-svg {
    width: var(--size);
    height: auto;

    margin-left: 0.4rem;
    pointer-events: none;

    transform: translateY(10%);
  }

  &[no-lowercase] {
    text-transform: none;
  }

  &[size-inherit] {
    display: inline-flex;

    font-size: inherit;

    height: min-content;

    .project-link__arrow-svg {
      transform: scale(1.125);
    }
  }
}
</style>
