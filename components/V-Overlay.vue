<script setup>
const { $smoothScroll, ssrContext } = useNuxtApp();
const { gsap, ScrollTrigger } = useGsap();
const emitter = useEmitter();

const routeChanging = ref(false);

const numberOfLoadingPoints = 3;

defineExpose({ leavePageAnim, enterPageAnim });

function leavePageAnim(pageEl, done) {
  routeChanging.value = true;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
  });

  tl.to(pageEl, { y: -150, duration: 0.35, ease: 'power2.in' }, 0);
  tl.fromTo(
    '.page-overlay__slide',
    {
      opacity: 1,
      yPercent: 75,
      scaleY: 0.5,
    },
    {
      yPercent: 0,
      scaleY: 1,
      stagger: { each: 0.04 },
      duration: 0.35,
      onComplete: () => {
        $smoothScroll.scrollTo(0, 0);
        $smoothScroll.reset?.();
        $smoothScroll.disable();
        done();
      },
    },
    0,
  );
}

function waitForPageContent(pageEl) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const maxWait = 250;

    const check = () => {
      const hasPageContent =
        pageEl?.firstElementChild ||
        pageEl?.querySelector(
          '.blog-page, .article-page, .admin-page, .project-header, .projects-page, .smooth-scroll-fix, [data-error-page]',
        );

      if (hasPageContent || performance.now() - startedAt >= maxWait) {
        resolve();
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

async function enterPageAnim(pageEl, done) {
  routeChanging.value = true;

  // Keep the outgoing page covered while async page data/components mount.
  // Vue calls the enter hook as soon as the transition wrapper exists, which
  // can be a few frames before Nuxt has rendered the actual page content.
  await waitForPageContent(pageEl);

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onStart: () => {
      routeChanging.value = false;
      emitter.emit('pointer:inactive');
    },
    onComplete: () => {
      done();
      gsap.to('.nav', { autoAlpha: 1 });
    },
  });

  tl.from(
    pageEl,
    { y: 150, duration: 0.45, ease: 'power3.out', clearProps: true },
    0.05,
  );

  tl.fromTo(
    '.page-overlay__slide',
    {
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
    },
    {
      yPercent: -75,
      scaleY: 0.5,
      stagger: { each: 0.04, from: 'end' },
      duration: 0.35,
    },
    0.05,
  );

  tl.add(() => emitter.emit('overlay:hiding'), 0.1);
  tl.add(() => {
    $smoothScroll.enable();
    $smoothScroll.update();
    ScrollTrigger.refresh();
  }, 0.25);
}
</script>

<template>
  <div class="page-overlay">
    <div class="page-overlay__slide"></div>
    <div class="page-overlay__slide">
      <div
        :class="{
          'page-overlay__slide__loading': true,
          'page-overlay__slide__loading--animate': routeChanging,
        }"
      >
        <svg
          v-for="key in numberOfLoadingPoints"
          :key="key"
          width="17"
          height="16"
          viewBox="0 0 17 16"
          :class="{
            'page-overlay__slide__loading__circle': true,
            'page-overlay__slide__loading__circle--animate': routeChanging,
          }"
          :style="{ '--circle-animation-offset': `${key * 0.1}s` }"
        >
          <circle cx="8" cy="8" r="8" fill="currentColor" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:math';

.page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  pointer-events: none;

  &__slide {
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    &:nth-of-type(1) {
      z-index: 1;

      background: #332e2f;
      background: linear-gradient(0deg, #332e2f 0%, #665c5f 50%, #332e2f 100%);

      @media (prefers-color-scheme: light) {
        background-color: var(--primary-color);

        background: #ffe6ed;
        background: linear-gradient(
          0deg,
          #ffe6ed 0%,
          #fff6f8 50%,
          #ffe6ed 100%
        );
      }
    }

    &:nth-of-type(2) {
      z-index: 2;

      background-color: var(--surface-color);
    }

    &__text {
      display: inline-block;

      font-size: var(--step-1);

      margin: 0;

      opacity: 0.8;

      &__wrapper {
        position: relative;

        overflow: hidden;

        max-width: 60vw;
      }
    }

    &__loading {
      --circle-size: clamp(0.5rem, calc(var(--step--2) - 0.5rem), 0.95rem);
      --initial-delay: 2.25s;
      --circles-number: 3;

      display: grid;
      grid-template-columns: repeat(1fr, var(--circles-number));
      grid-auto-flow: column;
      gap: calc(var(--circle-size) * 1.1);

      position: absolute;
      top: calc(50% + 1.5rem);
      left: 50%;

      opacity: 0;

      transition: opacity 0.2s;
      transform: translateX(-50%);

      &--animate {
        opacity: 0.65;
        transition: opacity 0.4s;
      }

      &__circle {
        display: block;

        color: var(--ff-color);

        width: var(--circle-size);
        height: var(--circle-size);

        opacity: 0;

        @for $i from 1 to 4 {
          &--animate:nth-of-type(#{$i}) {
            animation: infinite
              2.5s
              fade-in-out-#{$i}
              calc(
                var(--initial-delay) + calc(var(--circle-animation-offset, 0s))
              );
          }
        }
      }
    }
  }
}

@for $i from 0 to 3 {
  @keyframes fade-in-out-#{$i + 1} {
    0%,
    #{100 - math.pow($i, 3) + '%'},
    100% {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }
  }
}
</style>
