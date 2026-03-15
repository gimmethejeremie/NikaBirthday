/**
 * envelope.js — Envelope open animation + overlay exit
 *
 * Flow:
 *   1. User clicks/presses Enter on envelope
 *   2. Envelope gets class .is-opened (flap rotates, letter slides up)
 *   3. After 800ms: hero overlay gets .is-closing (slide up + fade out)
 *   4. After transition: call onOpened() callback
 *
 * prefers-reduced-motion: skip rotateX, just fade out quickly
 *
 * @module envelope
 */

/**
 * Init envelope component.
 *
 * @param {object}      opts
 * @param {HTMLElement} opts.envelopeEl    - .envelope div
 * @param {HTMLElement} opts.heroEl        - #hero section
 * @param {Function}    opts.onOpened      - callback khi overlay đã ẩn xong
 * @param {boolean}     [opts.reducedMotion=false]
 */
export function initEnvelope({ envelopeEl, heroEl, onOpened, reducedMotion = false }) {
  if (!envelopeEl || !heroEl) return;

  // Prevent opening twice
  let hasOpened = false;

  /**
   * Handle the open sequence
   */
  function handleOpen() {
    if (hasOpened) return;
    hasOpened = true;

    // Update ARIA state
    envelopeEl.setAttribute('aria-pressed', 'true');
    envelopeEl.setAttribute('aria-label', 'Đang mở phong bì...');

    // Add opened class → CSS animates flap + letter
    envelopeEl.classList.add('is-opened');
    heroEl.classList.add('is-opened');

    // How long the envelope animation plays before overlay exits
    const envelopeAnimDuration = reducedMotion ? 50 : 800;

    setTimeout(() => {
      // Overlay slides up + fades out
      heroEl.classList.add('is-closing');

      // Wait for CSS transition to finish before calling callback
      const cssDuration = reducedMotion ? 50 : 1000;

      setTimeout(() => {
        // Hide hero from accessibility tree
        heroEl.setAttribute('aria-hidden', 'true');
        heroEl.hidden = true;

        // Call app.js callback to move to CHOOSE state
        onOpened?.();
      }, cssDuration);

    }, envelopeAnimDuration);
  }

  // Click handler
  envelopeEl.addEventListener('click', handleOpen);

  // Keyboard handler (Enter / Space — role="button")
  envelopeEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  });
}
