/**
 * revealOnScroll.js — IntersectionObserver reveal for [data-reveal] elements
 *
 * Elements with `data-reveal` attribute start hidden (opacity:0, translateY)
 * and get class `.is-visible` when scrolled into viewport.
 * Stagger delay is handled via CSS `--stagger-delay` custom property,
 * set per-element (e.g., gallery items).
 *
 * Also handles `.fan-message-card` and `.finale-half` elements.
 *
 * @module revealOnScroll
 */

/** Root margin: trigger slightly before element enters viewport */
const ROOT_MARGIN = '0px 0px -60px 0px';

/** Threshold: element needs to be 10% visible to trigger */
const THRESHOLD = 0.1;

/** CSS classes to observe (in addition to [data-reveal]) */
const OBSERVED_CLASSES = [
  '.gallery-item',
  '.fan-message-card',
  '.finale-half',
  '[data-reveal]',
];

/**
 * Init reveal-on-scroll for all observable elements in the document.
 * Safe to call multiple times — does not re-observe already-observed elements.
 */
export function initRevealOnScroll() {
  // Create observer (one shared instance is fine)
  const observer = createObserver();

  // Observe all matching elements that haven't been observed yet
  const selector = OBSERVED_CLASSES.join(', ');
  const elements = document.querySelectorAll(selector);

  elements.forEach((el) => {
    // Skip if already visible or already being observed
    if (el.classList.contains('is-visible') || el.dataset.observing) return;
    el.dataset.observing = 'true';
    observer.observe(el);
  });
}

/**
 * Create IntersectionObserver.
 * @returns {IntersectionObserver}
 */
function createObserver() {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop observing once revealed (no need to watch anymore)
          entry.target.dataset.observing = 'done';
        }
      });
    },
    {
      rootMargin: ROOT_MARGIN,
      threshold:  THRESHOLD,
    }
  );
}
