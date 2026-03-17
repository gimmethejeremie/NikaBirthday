/**
 * minigame.js — Mini game thổi nến sinh nhật
 *
 * Render bánh sinh nhật với N ngọn nến (CSS art).
 * User click từng nến để "thổi tắt" (add class .is-blown).
 * Khi tắt hết tất cả → hiện completed state + fire callback onComplete.
 *
 * @module minigame
 */

/**
 * Init mini game nến.
 *
 * @param {object}      opts
 * @param {HTMLElement} opts.mountEl          - mount point cho bánh + nến
 * @param {HTMLElement} opts.remainingEl      - span hiển thị số nến còn lại
 * @param {HTMLElement} opts.completedEl      - div completed state
 * @param {HTMLElement} opts.completedTextEl  - p completed text
 * @param {number}      opts.candleCount      - số nến (từ data)
 * @param {string}      opts.completedText    - text khi xong
 * @param {string}      opts.themeEmoji       - emoji của route (🍰 / ✨)
 * @param {Function}    opts.onComplete       - callback khi tắt hết nến
 */
export function initMinigame({
  mountEl,
  remainingEl,
  completedEl,
  completedTextEl,
  candleCount,
  completedText,
  themeEmoji,
  onComplete,
}) {
  if (!mountEl) return;

  const count = Math.max(1, Math.min(candleCount || 5, 10)); // clamp 1-10
  let blownCount = 0;

  // Build cake HTML
  mountEl.innerHTML = buildCakeHTML(count);

  // Update remaining display
  updateRemaining(remainingEl, count - blownCount, count);

  // Attach click handlers to each candle
  const candles = mountEl.querySelectorAll('.candle');
  candles.forEach((candle) => {
    const handleBlow = () => {
      if (candle.classList.contains('is-blown')) return;
      candle.classList.add('is-blown');
      candle.setAttribute('aria-pressed', 'true');
      candle.setAttribute('aria-disabled', 'true');
      candle.setAttribute('tabindex', '-1');
      blownCount++;

      updateRemaining(remainingEl, count - blownCount, count);

      // Little smoke effect on blow
      spawnSmoke(candle);

      if (blownCount === count) {
        // All candles blown!
        showCompleted({ completedEl, completedTextEl, completedText, themeEmoji });
        onComplete?.();
      }
    };

    candle.addEventListener('click', handleBlow);
    candle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBlow();
      }
    });
  });
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/**
 * Build cake HTML string (CSS art).
 * @param {number} n - number of candles
 * @returns {string}
 */
function buildCakeHTML(n) {
  const candlesHTML = Array.from({ length: n }, (_, i) =>
    `<div class="candle"
          role="button"
          tabindex="0"
          aria-label="Nến ${i + 1}: click để thổi tắt"
          aria-pressed="false">
       <div class="candle-flame" aria-hidden="true"></div>
       <div class="candle-body" aria-hidden="true">
         <div class="candle-wick"></div>
         <div class="candle-drip"></div>
       </div>
     </div>`
  ).join('');

  return `
    <div class="candles-row" aria-label="Hàng nến trên bánh">
      ${candlesHTML}
    </div>
    <div class="cake-body" aria-hidden="true">
      <div class="cake-tier cake-tier--top"></div>
      <div class="cake-tier cake-tier--bottom"></div>
      <div class="cake-plate"></div>
    </div>
  `;
}

/**
 * Update candle remaining counter.
 */
function updateRemaining(el, remaining, total) {
  if (!el) return;
  el.textContent = remaining;
  // Update aria-label on parent for accessibility
  el.closest('[aria-label]')?.setAttribute(
    'aria-label',
    `Bánh sinh nhật: còn ${remaining}/${total} ngọn nến chưa tắt`
  );
}

/**
 * Show completed state.
 */
function showCompleted({ completedEl, completedTextEl, completedText, themeEmoji }) {
  if (completedTextEl) completedTextEl.textContent = completedText || 'Ước nguyện đã thành! 🎉';
  if (completedEl) completedEl.classList.add('is-visible');
}

/**
 * Spawn a tiny smoke puff at the candle position (CSS animation).
 * Uses a temporary element that removes itself after animation.
 * @param {HTMLElement} candleEl
 */
function spawnSmoke(candleEl) {
  const smoke = document.createElement('div');
  smoke.setAttribute('aria-hidden', 'true');
  smoke.style.cssText = `
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(200, 200, 200, 0.7);
    pointer-events: none;
    animation: smoke-rise 0.8s ease-out forwards;
    z-index: 10;
  `;

  // Inject one-shot keyframe animation if not already in head
  injectSmokeAnimation();

  // Position near flame
  const rect = candleEl.getBoundingClientRect();
  const parentRect = candleEl.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
  smoke.style.top  = `${rect.top - parentRect.top - 10}px`;
  smoke.style.left = `${rect.left - parentRect.left + 4}px`;

  candleEl.offsetParent?.appendChild(smoke);

  smoke.addEventListener('animationend', () => smoke.remove(), { once: true });
}

/** Inject smoke keyframe animation into document (once) */
function injectSmokeAnimation() {
  if (document.getElementById('smoke-keyframe')) return;
  const style = document.createElement('style');
  style.id = 'smoke-keyframe';
  style.textContent = `
    @keyframes smoke-rise {
      0%   { transform: translateY(0) scale(1);   opacity: 0.7; }
      100% { transform: translateY(-30px) scale(2); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes smoke-rise {
        0%, 100% { opacity: 0; }
      }
    }
  `;
  document.head.appendChild(style);
}
