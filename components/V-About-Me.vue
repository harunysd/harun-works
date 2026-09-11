<script setup>
import SplitType from 'split-type';

const { data: aboutMeText } = await useAsyncData('about-me-text', () =>
  queryContent('about-me').findOne(),
);

const { $smoothScrollBreakPoint } = useNuxtApp();
const { gsap } = useGsap();

const aboutMeContent = ref(null);

const skillGroups = [
  {
    title: 'CBS & Planlama',
    items: ['ArcGIS', 'Netcad', 'QGIS', 'AutoCAD'],
  },
  {
    title: '3D & Görselleştirme',
    items: ['SketchUp', 'Lumion', 'Twinmotion'],
  },
  {
    title: 'Tasarım & Medya',
    items: [
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe After Effects',
    ],
  },
  {
    title: 'Veri & Dijital Sistemler',
    items: [
      'Veri & API Entegrasyonları',
      'Otomasyon',
      'AI / LLM',
      'Web & Uygulama Geliştirme',
    ],
  },
];

onMounted(() => {
  const paragraphs = aboutMeContent.value.$el.querySelectorAll('p');
  const target =
    paragraphs.length > 0 ? paragraphs : aboutMeContent.value.$el.firstChild;

  const text = new SplitType(target, {
    types: 'lines',
    lineClass: 'about-me__content__line',
  });

  const revealAnimation = gsap.fromTo(
    text.lines,
    { '--overlay-offset': '0%' },
    {
      '--overlay-offset': '100%',
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutMeContent.value.$el,
        start: 'top 80%',
        end: 'bottom 85%',
        scrub: window.innerWidth >= $smoothScrollBreakPoint ? true : 0.5,
      },
    },
  );

  onBeforeUnmount(() => {
    revealAnimation.scrollTrigger.kill();
  });
});
</script>

<template>
  <section class="about-me" data-scroll-section>
    <VH2 class="about-me__title">Hakkımda</VH2>

    <ContentRenderer
      ref="aboutMeContent"
      :value="aboutMeText"
      class="about-me__content"
    />

    <div class="skills-grid">
      <div
        v-for="(group, idx) in skillGroups"
        :key="idx"
        class="skills-grid__column"
      >
        <h3 class="skills-grid__group-title">{{ group.title }}</h3>
        <ul class="skills-grid__list">
          <li
            v-for="(item, itemIdx) in group.items"
            :key="itemIdx"
            class="skills-grid__item"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.about-me {
  color: var(--ff-color);

  padding: 4rem clamp(1rem, 7vw, 5rem) 4rem;
  margin-top: -2px;

  background-color: var(--surface-color);

  pointer-events: all;
  transition: color 400ms;

  &__title {
    opacity: 0.85;

    margin-top: 1rem;
    margin-bottom: 6rem;
  }

  &__content {
    position: relative;

    font-size: calc(var(--step-2) + 0.125rem);
    line-height: 1.35;
    color: darken($color: #ffffff, $amount: 25);
    text-align: left;

    width: fit-content;
    max-width: 38ch;

    margin: 0 auto;

    overflow: hidden;

    p:not(:last-child) {
      margin-bottom: 2.25rem;
    }

    &__line {
      width: fit-content !important;

      position: relative;

      &::after {
        content: '';

        position: absolute;
        inset: 0;

        background-color: var(--surface-color);
        opacity: 0.825;

        transform: translateX(var(--overlay-offset, 0%));
      }
    }

    @media (prefers-color-scheme: light) {
      color: lighten($color: #000000, $amount: 25);
    }
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem 2rem;

    max-width: 1000px;
    margin: 7rem auto 2rem;
    padding-top: 3rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    @media (prefers-color-scheme: light) {
      border-top-color: rgba(0, 0, 0, 0.08);
    }

    &__column {
      display: flex;
      flex-direction: column;
    }

    &__group-title {
      font-size: clamp(0.72rem, 0.8vw, 0.82rem);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ff-color);
      opacity: 0.8;
      margin: 0 0 1rem 0;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      @media (prefers-color-scheme: light) {
        border-bottom-color: rgba(0, 0, 0, 0.08);
      }
    }

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    &__item {
      font-size: clamp(0.75rem, 0.85vw, 0.88rem);
      color: var(--ff-color);
      opacity: 0.6;
      font-weight: 400;
      line-height: 1.35;
      transition: opacity 200ms ease;

      &:hover {
        opacity: 0.95;
      }
    }
  }
}
</style>
