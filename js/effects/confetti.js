/**
 * confetti.js — Confetti burst effect
 *
 * Creates colored confetti pieces (div elements) that fall from the top.
 * Auto-cleans up after animation completes.
 *
 * Features:
 * - Multiple shapes: 'heart', 'star', 'circle', 'diamond'
 * - Theme-aware: caller passes colors array from data.themes[route].confetti
 * - Reduced particle count on mobile
 * - No animation when reducedMotion (checks OS preference)
 *
 * @module confetti
 */

/** How long to wait before removing confetti pieces from DOM (ms) */
const CLEANUP_DELAY = 4000;

/**
 * Trigger a confetti burst.
 *
 * @param {object}    opts
 * @param {string[]}  opts.colors  - hex color array
 * @param {number}    [opts.count=80]
 * @param {string[]}  [opts.shapes=['circle']]
 * @param {boolean}   [opts.burst=false] - true = larger, faster burst for finale
 */
export function triggerConfetti({ colors, count = 80, shapes = ['circle'], burst = false }) {
  // Respect OS reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile    = window.innerWidth < 600;
  const actualCount = isMobile ? Math.floor(count * 0.5) : count;

  // Inject CSS keyframes if not already in head
  injectConfettiStyles();

  const container = document.body;

  for (let i = 0; i < actualCount; i++) {
    const piece = createConfettiPiece({ colors, shapes, burst, index: i, total: actualCount });
    container.appendChild(piece);

    // Remove from DOM after animation ends
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }

  // Safety cleanup (in case animationend doesn't fire)
  setTimeout(() => {
    document.querySelectorAll('.confetti-piece').forEach(p => p.remove());
  }, CLEANUP_DELAY + 1000);
}

/**
 * Create a single confetti piece element.
 * @param {object} opts
 * @returns {HTMLElement}
 */
function createConfettiPiece({ colors, shapes, burst, index, total }) {
  const el = document.createElement('div');
  el.className = 'confetti-piece';
  el.setAttribute('aria-hidden', 'true');

  // Random properties
  const color    = colors[Math.floor(Math.random() * colors.length)];
  const shape    = shapes[Math.floor(Math.random() * shapes.length)];
  const size     = Math.random() * 8 + 6;   // 6–14px
  const startX   = Math.random() * 100;       // % from left
  const delay    = Math.random() * (burst ? 0.3 : 0.8);
  const duration = Math.random() * 1.5 + (burst ? 1.5 : 2.5); // seconds
  const rotation = Math.random() * 720 - 360;
  const driftX   = (Math.random() - 0.5) * 200; // px horizontal drift

  el.style.cssText = `
    position: fixed;
    top: -${size * 2}px;
    left: ${startX}%;
    width:  ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: ${shapeRadius(shape, size)};
    animation: confetti-fall ${duration}s ${delay}s ease-in forwards;
    --drift-x: ${driftX}px;
    --rotation: ${rotation}deg;
    pointer-events: none;
    z-index: var(--z-toast, 200);
    opacity: 1;
  `;

  // Heart/star shapes use pseudo-elements (inline style can't do ::before)
  // So we keep it simple with border-radius for circle/diamond shapes
  if (shape === 'heart') {
    el.style.borderRadius = '50% 50% 0 0 / 50% 50% 0 0';
    el.style.transform    = 'rotate(-45deg)';
  } else if (shape === 'diamond') {
    el.style.transform = 'rotate(45deg)';
  }

  return el;
}

/**
 * Return border-radius value for shape.
 * @param {string} shape
 * @param {number} size
 * @returns {string}
 */
function shapeRadius(shape, size) {
  switch (shape) {
    case 'circle':  return '50%';
    case 'star':    return '2px';
    case 'diamond': return '2px';
    case 'heart':   return '50%';
    default:        return '2px';
  }
}

/**
 * Inject confetti keyframe CSS into document head (once only).
 */
function injectConfettiStyles() {
  if (document.getElementById('confetti-styles')) return;

  const style = document.createElement('style');
  style.id = 'confetti-styles';
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 1;
      }
      80% {
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) translateX(var(--drift-x, 0px)) rotate(var(--rotation, 360deg));
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .confetti-piece {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Remove all active confetti pieces (useful for cleanup on route change).
 */
export function clearConfetti() {
  document.querySelectorAll('.confetti-piece').forEach(p => p.remove());
}

/**
 * Re-export initConfetti (alias used in app.js import)
 * app.js imports { initConfetti, triggerConfetti } — initConfetti is a no-op init
 * because this module is self-contained (no setup needed)
 */
export function initConfetti() {
  // No setup needed; triggerConfetti() works standalone
}
