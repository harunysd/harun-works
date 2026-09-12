// import ASScroll from "@ashthornton/asscroll";
import { gsap } from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const LOCOMOTIVE_SCROLL_BREAK_POINT = 1024;
const SCROLL_TO_DURATION_IN_SECONDS = 1.5;

// NOTE: replace with lenis scroll,
// will need to completely rework scroll related animation
// NOTE: reinitializing smooth scroll after each route transition
// could result in better ux (locomotive scroll only?)
function isSmoothRoute(route) {
  const name = route?.name;
  return name === 'index' || name === 'project-slug';
}

function disableLocomotiveHelper(locomotiveScroll, scrollerEl) {
  try {
    locomotiveScroll.stop();
  } catch (e) {}

  if (scrollerEl) {
    scrollerEl.style.transform = '';
    scrollerEl.style.top = '';
    scrollerEl.style.position = '';
  }

  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('has-scroll-smooth');
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
  }
}

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    // not server rendered stuff means error, since wea are prerendering everything
    const hasError = !nuxtApp.payload.serverRendered;

    const $ScrollTrigger = nuxtApp.$ScrollTrigger;

    const scrollerEl = document.getElementById('__nuxt');

    const locomotiveScroll = new LocomotiveScroll({
      el: scrollerEl,
      smooth: !hasError,
    });

    const initialRoute = nuxtApp.$router?.currentRoute?.value;
    if (!isSmoothRoute(initialRoute)) {
      disableLocomotiveHelper(locomotiveScroll, scrollerEl);
    }

    nuxtApp.$router?.afterEach((to) => {
      if (!isSmoothRoute(to)) {
        disableLocomotiveHelper(locomotiveScroll, scrollerEl);
      } else if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
        nextTick(() => {
          document.documentElement.classList.add('has-scroll-smooth');
          locomotiveScroll.start();
          locomotiveScroll.update();
          $ScrollTrigger?.refresh?.();
        });
      }
    });

    locomotiveScroll.on('scroll', $ScrollTrigger.update);

    $ScrollTrigger.scrollerProxy(locomotiveScroll.el, {
      scrollTop(value) {
        const currentRoute = nuxtApp.$router?.currentRoute?.value;
        if (!isSmoothRoute(currentRoute)) {
          return arguments.length ? window.scrollTo(0, value) : window.scrollY;
        }
        return arguments.length
          ? locomotiveScroll.scrollTo(value, { disableLerp: true, duration: 0 })
          : locomotiveScroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: locomotiveScroll.el.style.transform ? 'transform' : 'fixed',
    });

    $ScrollTrigger.addEventListener('refresh', () => {
      const currentRoute = nuxtApp.$router?.currentRoute?.value;
      if (isSmoothRoute(currentRoute)) {
        locomotiveScroll.update();
      }
    });

    if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT && isSmoothRoute(initialRoute))
      $ScrollTrigger.defaults({ scroller: locomotiveScroll.el });

    return {
      provide: {
        smoothScroll: makeLocomotiveScrollAdaptor(
          locomotiveScroll,
          scrollerEl,
          nuxtApp,
        ),
      },
    };
  },
});

function makeLocomotiveScrollAdaptor(locomotiveScroll, scrollerEl, nuxtApp) {
  const scroll = { x: 0, y: 0 };

  locomotiveScroll.on('scroll', ({ scroll: { x, y } }) => {
    scroll.x = x;
    scroll.y = y;
  });

  function isSmoothActive() {
    const route = nuxtApp.$router?.currentRoute?.value;
    return isSmoothRoute(route);
  }

  function disableLocomotive() {
    disableLocomotiveHelper(locomotiveScroll, scrollerEl);
  }

  return {
    on: (evName, evCallback) =>
      locomotiveScroll.on(evName, evCallback.bind(null, { scroll })),
    scrollY: () => {
      if (isSmoothActive() && window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
        return scroll.y;
      }
      return window.scrollY;
    },
    update: () => {
      if (isSmoothActive()) {
        locomotiveScroll.update();
      }
    },
    reset: () => {
      if (isSmoothActive() && window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
        if (locomotiveScroll.scroll?.instance) {
          locomotiveScroll.scroll.instance.scroll.y = 0;
          locomotiveScroll.scroll.instance.scroll.x = 0;
          locomotiveScroll.scroll.instance.delta.y = 0;
          locomotiveScroll.scroll.instance.delta.x = 0;
        }
        locomotiveScroll.scrollTo(0, { duration: 0, disableLerp: true });
        if (locomotiveScroll.el) {
          locomotiveScroll.el.style.transform = '';
        }
      } else {
        disableLocomotive();
        window.scrollTo(0, 0);
      }
    },
    enable: () => {
      if (!isSmoothActive()) {
        disableLocomotive();
        return;
      }
      if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
        document.documentElement.classList.add('has-scroll-smooth');
        locomotiveScroll.start();
      } else {
        enable();
      }
    },
    disable: () => {
      disableLocomotive();
      enable();
    },
    scrollTo: (
      selectorOrNumber,
      durationInSeconds = SCROLL_TO_DURATION_IN_SECONDS,
    ) => {
      if (isSmoothActive() && window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
        locomotiveScroll.scrollTo(selectorOrNumber, {
          duration: durationInSeconds * 1000,
          easing: [0.645, 0.045, 0.355, 1.0],
          disableLerp: durationInSeconds * 1000 <= 100,
        });
        if (selectorOrNumber === 0 && durationInSeconds === 0) {
          if (locomotiveScroll.scroll?.instance) {
            locomotiveScroll.scroll.instance.scroll.y = 0;
            locomotiveScroll.scroll.instance.delta.y = 0;
          }
          if (locomotiveScroll.el) {
            locomotiveScroll.el.style.transform = '';
          }
        }
      } else {
        const targetElement =
          typeof selectorOrNumber === 'string'
            ? document.querySelector(selectorOrNumber)
            : null;
        let targetY = 0;

        if (typeof selectorOrNumber === 'number') {
          targetY = selectorOrNumber;
        } else if (targetElement) {
          targetY = targetElement.getBoundingClientRect().top + window.scrollY;
        }

        window.scrollTo({
          top: targetY,
          behavior: durationInSeconds > 0 ? 'smooth' : 'auto',
        });
      }
    },
  };
}

function preventDefault(e) {
  e.preventDefault();
}

const wheelOpt = { passive: false };
let wheelEvent = 'wheel';

if (typeof window !== 'undefined') {
  wheelEvent =
    'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
}

function disable() {
  window.addEventListener(wheelEvent, preventDefault, wheelOpt);
  window.addEventListener('touchmove', preventDefault, wheelOpt);
}

function enable() {
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
}
