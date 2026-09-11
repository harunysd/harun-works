<script setup>
const loader = ref(null);

const { gsap } = useGsap();
const emitter = useEmitter();

emitter.on('shader:running', () => {
  gsap.to(loader.value, {
    autoAlpha: 0,
    pointerEvents: 'none',
    onComplete: () => emitter.emit('loader:end'),
  });
});
</script>

<template>
  <div ref="loader" class="loader">
    <svg
      class="loader__svg"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="hys-loader-mask">
          <rect width="512" height="512" fill="white" />
          <text
            x="256"
            y="295"
            text-anchor="middle"
            fill="black"
            font-family="'e-Ukraine', system-ui, -apple-system, sans-serif"
            font-weight="800"
            font-size="120"
            letter-spacing="4"
          >HYS</text>
        </mask>
      </defs>
      <rect
        width="512"
        height="512"
        fill="var(--surface-color)"
        mask="url(#hys-loader-mask)"
      />
    </svg>
  </div>
</template>

<style lang="scss">
.loader {
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  pointer-events: all;

  &::after {
    --circle-size: 32%;

    content: '';

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;

    background: radial-gradient(
      circle at center,
      transparent var(--circle-size),
      var(--surface-color) calc(var(--circle-size) + 0.25%)
    );
    background-size: 100% 100%;
    background-position: 50% 50%;
  }

  &__svg {
    height: 100%;
    width: 100%;

    max-width: 100%;
    max-height: 100%;
  }

  &__text {
    position: absolute;
    top: 50%;
    left: 50%;

    margin: 0;

    transform: translate(-50%, -50%);

    &--primary {
      font-size: var(--step-5);

      color: transparent;
      -webkit-text-stroke: 1px white;
    }
  }
}
</style>
