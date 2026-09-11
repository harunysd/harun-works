<script setup>
const { $smoothScrollBreakPoint } = useNuxtApp();
const { gsap } = useGsap();
const isEmailModalOpen = useEmailModal();

const rowsCount = 3;
const textCount = 4;

const contact = ref(null);
const contactEmailRow = ref(null);

function openEmailModal() {
  isEmailModalOpen.value = true;
}

onMounted(() => {
  const animations = [];

  const scrollTriggerFactory = (trigger) => ({
    trigger,
    scrub: window.innerWidth >= $smoothScrollBreakPoint ? true : 0.5,
  });

  contactEmailRow.value.forEach((item) => {
    const scrollTrigger = scrollTriggerFactory(item);

    const sumWidth =
      item.offsetWidth + window.innerWidth / (window.innerWidth < 700 ? 2 : 4);

    animations.push(
      gsap.fromTo(
        item,
        { x: window.innerWidth },
        { x: -sumWidth, scrollTrigger },
      ),
    );
  });

  onBeforeUnmount(() => {
    animations.forEach((animation) => animation.scrollTrigger.kill());
  });
});
</script>

<template>
  <section ref="contact" class="contact" data-scroll-section>
    <button
      ref="contactEmail"
      v-hoverable.mail
      type="button"
      aria-label="E-posta iletişim penceresini aç"
      class="contact__email"
      @click="openEmailModal"
      @keypress.enter.space.prevent="openEmailModal"
    >
      <span
        v-for="row in rowsCount"
        :key="row"
        ref="contactEmailRow"
        aria-hidden="true"
        class="contact__email__row"
      >
        <span
          v-for="textKey in textCount"
          :key="textKey"
          aria-hidden="true"
          class="contact__email__row__text"
        >
          Bana bir <span class="serif">e-posta</span> gönderin<span v-if="textKey !== textCount">&nbsp; - &nbsp;</span>
        </span>
      </span>
    </button>
  </section>
</template>

<style lang="scss">
.contact {
  width: 100%;

  padding: 5rem 0 8rem;
  margin-top: -3px;

  border-radius: 0 0 2rem 2rem;
  background-color: var(--surface-color);

  overflow: hidden;
  pointer-events: all;

  box-shadow: 0 2rem 1.125rem -1.125rem rgba($color: #ebebeb, $alpha: 0.0875);

  &__email {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    padding: 0;

    position: relative;

    color: darken($color: white, $amount: 40);
    line-height: 1;
    text-decoration: none;

    cursor: none;

    &__row {
      display: block;

      font-size: var(--step-5);
      margin: 0;

      white-space: nowrap;
      will-change: transform;

      @supports (-webkit-text-stroke: 1px white) {
        color: transparent;
        -webkit-text-stroke: 1px darken($color: white, $amount: 40);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      cursor: pointer;
    }
  }

  @media (prefers-color-scheme: light) {
    box-shadow: 0 2rem 0.75rem -1rem rgba($color: #030303, $alpha: 0.025);
  }
}
</style>
