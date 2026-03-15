/**
 * audio.js — Background music controller
 *
 * Rules:
 * - Audio ONLY plays after a user gesture (browser autoplay policy).
 *   initAudio() is called from inside a click handler in app.js — that's correct.
 * - Graceful: if audio fails (file missing, format unsupported), silently skip.
 * - Volume is clamped 0–1.
 *
 * @module audio
 */

/**
 * Init background music. Call this inside a user gesture handler.
 *
 * @param {object}      opts
 * @param {HTMLElement} opts.bgmEl    - <audio id="bgm">
 * @param {string}      opts.src      - audio file path
 * @param {number}      [opts.volume=0.5] - 0.0 to 1.0
 */
export function initAudio({ bgmEl, src, volume = 0.5 }) {
  if (!bgmEl) return;

  // Set src if not already set (or if different)
  if (src && !src.includes('__TODO__')) {
    bgmEl.src = src;
  }

  // Clamp volume
  bgmEl.volume = Math.max(0, Math.min(1, volume));

  // Attempt to play — returns a Promise; ignore rejection (user may have muted)
  bgmEl.play().catch(() => {
    // Silently fail: common on mobile where audio requires interaction
    // User can use the music toggle button in the utility bar
  });

  // Update music button state
  updateMusicBtn(true);
}

/**
 * Update the music toggle button's aria/icon state.
 * @param {boolean} isPlaying
 */
function updateMusicBtn(isPlaying) {
  const btn = document.getElementById('btn-music');
  if (!btn) return;
  btn.textContent = isPlaying ? '🔊' : '🔇';
  btn.setAttribute('aria-label',   isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  btn.setAttribute('aria-pressed', String(isPlaying));
}
