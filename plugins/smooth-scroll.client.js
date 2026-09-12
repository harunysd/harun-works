export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    const $ScrollTrigger = nuxtApp.$ScrollTrigger;

    // Clean any leftover Locomotive classes or styles immediately
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('has-scroll-smooth');
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      const scrollerEl = document.getElementById('__nuxt');
      if (scrollerEl) {
        scrollerEl.style.transform = '';
        scrollerEl.style.top = '';
        scrollerEl.style.position = '';
      }
    }

    function getTargetY(target) {
      if (typeof target === 'number') return target;
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top + (window.scrollY || 0);
        }
      }
      return 0;
    }

    const smoothScroll = {
      scrollY: () =>
        typeof window !== 'undefined'
          ? window.scrollY || document.documentElement.scrollTop || 0
          : 0,
      update: () => {
        $ScrollTrigger?.refresh?.();
      },
      reset: () => {
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0);
          const scrollerEl = document.getElementById('__nuxt');
          if (scrollerEl) {
            scrollerEl.style.transform = '';
            scrollerEl.style.top = '';
            scrollerEl.style.position = '';
          }
        }
      },
      enable: () => {
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
      },
      disable: () => {
        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'hidden';
        }
      },
      scrollTo: (selectorOrNumber, durationInSeconds = 0.8) => {
        if (typeof window === 'undefined') return;
        const targetY = getTargetY(selectorOrNumber);
        window.scrollTo({
          top: targetY,
          behavior: durationInSeconds === 0 ? 'auto' : 'smooth',
        });
      },
      on: (evName, evCallback) => {
        if (typeof window === 'undefined') return;
        if (evName === 'scroll') {
          const handler = () => {
            evCallback({
              scroll: {
                x: window.scrollX || 0,
                y: window.scrollY || 0,
              },
            });
          };
          window.addEventListener('scroll', handler, { passive: true });
        }
      },
    };

    nuxtApp.$router?.afterEach(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        const scrollerEl = document.getElementById('__nuxt');
        if (scrollerEl) {
          scrollerEl.style.transform = '';
          scrollerEl.style.top = '';
          scrollerEl.style.position = '';
        }
        smoothScroll.enable();
        nextTick(() => {
          $ScrollTrigger?.refresh?.();
        });
      }
    });

    return {
      provide: {
        smoothScroll,
        smoothScrollBreakPoint: 1024,
      },
    };
  },
});
