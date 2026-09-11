<script setup>
const isEmailModalOpen = useEmailModal();
const { gsap } = useGsap();

const modalBackdrop = ref(null);
const modalCard = ref(null);
const copiedField = ref(null);

const emails = [
  { label: 'Kişisel E-posta', value: 'harunysd@gmail.com' },
  { label: 'Kurumsal / Web', value: 'iletisim@harun.works' },
];

function closeModal() {
  if (!modalBackdrop.value || !modalCard.value) {
    isEmailModalOpen.value = false;
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      isEmailModalOpen.value = false;
    },
  });

  tl.to(modalCard.value, {
    scale: 0.92,
    y: 15,
    opacity: 0,
    duration: 0.22,
    ease: 'power2.in',
  });
  tl.to(
    modalBackdrop.value,
    {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    },
    0.05,
  );
}

function openAnimation() {
  nextTick(() => {
    if (!modalBackdrop.value || !modalCard.value) return;

    gsap.fromTo(
      modalBackdrop.value,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' },
    );

    gsap.fromTo(
      modalCard.value,
      { scale: 0.86, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' },
    );
  });
}

async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    copiedField.value = email;
    setTimeout(() => {
      if (copiedField.value === email) {
        copiedField.value = null;
      }
    }, 2000);
  } catch (err) {
    // fallback if needed
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isEmailModalOpen.value) {
    closeModal();
  }
}

watch(isEmailModalOpen, (isOpen) => {
  if (isOpen) {
    openAnimation();
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isEmailModalOpen"
      ref="modalBackdrop"
      class="email-modal__backdrop"
      @click.self="closeModal"
    >
      <div
        ref="modalCard"
        class="email-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div class="email-modal__header">
          <div class="email-modal__title-wrap">
            <svg
              class="email-modal__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <h3 id="modalTitle" class="email-modal__title">İletişim</h3>
          </div>
          <button
            class="email-modal__close-btn"
            aria-label="Kapat"
            @click="closeModal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="email-modal__body">
          <div
            v-for="(item, idx) in emails"
            :key="idx"
            class="email-modal__item"
          >
            <span class="email-modal__item-label">{{ item.label }}</span>
            <div class="email-modal__item-row">
              <span class="email-modal__item-value">{{ item.value }}</span>
              <button
                class="email-modal__copy-btn"
                :class="{ 'email-modal__copy-btn--copied': copiedField === item.value }"
                @click="copyEmail(item.value)"
              >
                <template v-if="copiedField === item.value">
                  Kopyalandı ✓
                </template>
                <template v-else>
                  Kopyala
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.email-modal {
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 99999;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    padding: 1.5rem;
    pointer-events: all;
  }

  &__card {
    position: relative;
    width: 100%;
    max-width: 420px;

    background: rgba(18, 18, 18, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;

    box-shadow:
      0 24px 48px -12px rgba(0, 0, 0, 0.75),
      0 0 0 1px rgba(255, 255, 255, 0.05);

    padding: 1.5rem 1.6rem 1.6rem;
    color: #f7f7f7;

    will-change: transform, opacity;

    @media (prefers-color-scheme: light) {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow:
        0 24px 48px -12px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      color: #111111;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 1rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    @media (prefers-color-scheme: light) {
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__icon {
    color: #ffffff;
    opacity: 0.85;

    @media (prefers-color-scheme: light) {
      color: #111111;
    }
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    margin: 0;
    color: inherit;
  }

  &__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #cccccc;

    cursor: pointer;
    transition: all 180ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: scale(1.05);
    }

    @media (prefers-color-scheme: light) {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.08);
      color: #555555;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #000000;
      }
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;

    @media (prefers-color-scheme: light) {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.06);
    }
  }

  &__item-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #888888;
    font-weight: 500;
  }

  &__item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  &__item-value {
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.2px;
    user-select: all;
    word-break: break-all;
    color: #f0f0f0;

    @media (prefers-color-scheme: light) {
      color: #1a1a1a;
    }
  }

  &__copy-btn {
    flex-shrink: 0;
    padding: 0.35rem 0.85rem;
    font-size: 0.8rem;
    font-weight: 500;

    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    color: #ffffff;

    cursor: pointer;
    transition: all 160ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }

    &--copied {
      background: #10b981 !important;
      border-color: #10b981 !important;
      color: #ffffff !important;
    }

    @media (prefers-color-scheme: light) {
      background: #030303;
      border-color: #030303;
      color: #ffffff;

      &:hover {
        background: #252525;
      }
    }
  }
}
</style>
