/**
 * letter.js — Letter "unfold" animation
 *
 * Trạng thái ban đầu (CSS): transform: rotateX(90deg), opacity: 0
 * Khi trigger: thêm class .is-open → CSS transition unfolds the letter.
 *
 * Trigger modes:
 *   - Click nút "Mở thư" (btn)
 *   - Hoặc khi scroll vào viewport (IntersectionObserver)
 *
 * prefers-reduced-motion: chỉ fade (tokens.css đã set duration=0ms)
 *
 * @module letter
 */

/**
 * Init letter unfold component.
 *
 * @param {object}        opts
 * @param {HTMLElement}   opts.letterEl       - #letter-card article
 * @param {HTMLElement}   opts.openBtnEl      - button "Mở thư"
 * @param {boolean}       [opts.reducedMotion=false]
 * @param {Function}      [opts.onOpened]     - callback sau khi thư mở xong
 */
export function initLetter({ letterEl, openBtnEl, reducedMotion = false, onOpened }) {
  if (!letterEl) return;

  let hasOpened = false;

  /**
   * Trigger the unfold animation.
   */
  function openLetter() {
    if (hasOpened) return;
    hasOpened = true;

    // Update aria state
    openBtnEl?.setAttribute('aria-expanded', 'true');

    // Hide the "Mở thư" button
    if (openBtnEl) {
      openBtnEl.classList.add('is-hidden');
      openBtnEl.setAttribute('aria-hidden', 'true');
    }

    // Add .is-open → CSS unfolds (rotateX: 90deg → 0deg, opacity: 0 → 1)
    letterEl.classList.add('is-open');

    // Call onOpened after CSS transition completes
    const duration = reducedMotion ? 50 : 1000;
    setTimeout(() => {
      onOpened?.();
    }, duration);
  }

  // ── Trigger: click button ──────────────────────────────────────────────
  if (openBtnEl) {
    openBtnEl.addEventListener('click', openLetter);
  }

  // ── Trigger: scroll into view (fallback / auto-open option) ───────────
  // Uncomment below if you want auto-open on scroll instead of click:
  /*
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        openLetter();
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(letterEl);
  */
}
