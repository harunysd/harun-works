/**
 * @param {import('vue').Ref<HTMLElement | null>} refEl
 * @param { () => any } callback
 */
export function useImagesLoaded(refEl, callback) {
  const stop = watch(
    () => unref(refEl),
    (el) => {
      if (!el) return;

      stop();

      waitForImages(el).then(callback);
    },
    { immediate: true },
  );
}

/**
 * @param {HTMLElement} wrapper
 * @return {Promise<void>}
 */
function waitForImages(wrapper) {
  const images = wrapper.querySelectorAll('img');

  return new Promise((resolve) => {
    if (!images || images.length === 0) {
      resolve();
      return;
    }

    let numberOfLoadedImages = 0;
    const totalImages = images.length;
    let resolved = false;

    const done = () => {
      if (resolved) return;
      if (++numberOfLoadedImages >= totalImages) {
        resolved = true;
        resolve();
      }
    };

    images.forEach((image) => {
      if (image.complete) {
        done();
      } else {
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
      }
    });

    // Safety timeout: never hang on a black transition screen for more than 400ms
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 400);
  });
}
