// import ASScroll from "@ashthornton/asscroll";
import { gsap } from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const LOCOMOTIVE_SCROLL_BREAK_POINT = 1024;
const SCROLL_TO_DURATION_IN_SECONDS = 1.5;

// NOTE: replace with lenis scroll,
// will need to completely rework scroll related animation
// NOTE: reinitializing smooth scroll after each route transition
// could result in better ux (locomotive scroll only?)
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

    locomotiveScroll.on('scroll', $ScrollTrigger.update);

    $ScrollTrigger.scrollerProxy(locomotiveScroll.el, {
      scrollTop(value) {
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

    $ScrollTrigger.addEventListener('refresh', () => locomotiveScroll.update());

    if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT)
      $ScrollTrigger.defaults({ scroller: locomotiveScroll.el });

    return {
      provide: { smoothScroll: makeLocomotiveScrollAdaptor(locomotiveScroll) },
    };
  },
});

function makeLocomotiveScrollAdaptor(locomotiveScroll) {
  const scroll = { x: 0, y: 0 };

  locomotiveScroll.on('scroll', ({ scroll: { x, y } }) => {
    scroll.x = x;
    scroll.y = y;
  });

  return {
    on: (evName, evCallback) =>
      locomotiveScroll.on(evName, evCallback.bind(null, { scroll })),
    scrollY: () =>
      window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT
        ? scroll.y
        : window.scrollY,
    update: () => locomotiveScroll.update(),
    reset: () => {
      if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
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
        window.scrollTo(0, 0);
      }
    },
    enable: () =>
      window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT
        ? locomotiveScroll.start()
        : enable(),
    disable: () =>
      window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT
        ? locomotiveScroll.stop()
        : disable(),
    scrollTo: (
      selectorOrNumber,
      durationInSeconds = SCROLL_TO_DURATION_IN_SECONDS,
    ) => {
      if (window.innerWidth >= LOCOMOTIVE_SCROLL_BREAK_POINT) {
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

/** @param {import('@ashthornton/asscroll').default} asscroll */
// eslint-disable-next-line
function makeASScrollAdaptor(asscroll) {
  return {
    scrollY: () =>
      asscroll.isScrollJacking ? asscroll.currentPos : window.scrollY,
    update: () => asscroll.update(),
    enable: () =>
      asscroll.isScrollJacking
        ? asscroll.enable()
        : (document.body.style.overflow = 'auto'),
    disable: () =>
      asscroll.isScrollJacking
        ? asscroll.disable()
        : (document.body.style.overflow = 'hidden'),
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
