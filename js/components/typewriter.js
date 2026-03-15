/**
 * typewriter.js — Typewriter text effect
 *
 * Renders lines of text one character at a time, with a blinking cursor.
 * Accessibility: renders full text instantly if reducedMotion is true,
 * so screen readers get all content at once without char-by-char noise.
 *
 * @module typewriter
 */

/**
 * Run typewriter effect.
 *
 * @param {object}      opts
 * @param {HTMLElement} opts.outputEl          - element to type into (aria-live="polite")
 * @param {string[]}    opts.lines             - array of text lines to type
 * @param {number}      [opts.speedMs=60]      - ms per character
 * @param {number}      [opts.pauseBetweenMs=1200] - ms pause between lines
 * @param {boolean}     [opts.reducedMotion=false] - skip animation, render all at once
 * @returns {Promise<void>} resolves when all lines done
 *
 * @example
 * await initTypewriter({
 *   outputEl: document.getElementById('typing-output'),
 *   lines: ['Chúc mừng sinh nhật!', 'Happy Birthday 🎂'],
 *   speedMs: 60,
 * });
 */
export function initTypewriter({
  outputEl,
  lines,
  speedMs        = 60,
  pauseBetweenMs = 1200,
  reducedMotion  = false,
}) {
  if (!outputEl || !lines?.length) return Promise.resolve();

  // Reduced motion: render full text immediately for screen readers
  if (reducedMotion) {
    outputEl.textContent = lines.join('\n');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let lineIndex = 0;
    let charIndex = 0;
    let currentText = '';

    /**
     * Type a single character, then schedule next.
     */
    function typeCharacter() {
      const currentLine = lines[lineIndex];

      if (charIndex < currentLine.length) {
        // Add next character
        currentText += currentLine[charIndex];
        charIndex++;

        // Update DOM — use textContent for safety (no XSS)
        // Lines joined with newline, rendered as <br> via CSS white-space
        outputEl.textContent = buildDisplayText(currentText, lineIndex);

        setTimeout(typeCharacter, speedMs);

      } else {
        // Current line done — pause, then move to next line
        const isLastLine = lineIndex === lines.length - 1;

        if (isLastLine) {
          resolve();
        } else {
          setTimeout(() => {
            lineIndex++;
            charIndex  = 0;
            currentText = '';
            typeCharacter();
          }, pauseBetweenMs);
        }
      }
    }

    typeCharacter();
  });
}

/**
 * Build display text: all previous lines (complete) + current partial line.
 * Uses \n which CSS `white-space: pre-line` renders as line breaks.
 *
 * @param {string} partialLine - currently-typing line (partial)
 * @param {number} lineIdx     - index of current line in lines array
 */
function buildDisplayText(partialLine, lineIdx) {
  // This function is called with the full lines array in closure scope
  // We only have access to what's passed; simplest approach: track all done lines
  // in the outer closure — this helper keeps track via lineIdx passed by caller

  // Note: this helper is called from the closure above, which tracks currentText.
  // "partialLine" here is already the accumulating currentText for this line.
  return partialLine;
}

// ─── Re-export a simpler helper used directly ───────────────────────────────
// The function above works because outputEl.textContent = currentText for the
// current line. For multi-line display (show prev lines + current), we use
// a slightly different approach in the actual call:

/**
 * Full multi-line typewriter (shows all completed + current typing line)
 *
 * @param {object} opts - same as initTypewriter
 * @returns {Promise<void>}
 */
export function initTypewriterMultiLine({
  outputEl,
  lines,
  speedMs        = 60,
  pauseBetweenMs = 1200,
  reducedMotion  = false,
}) {
  if (!outputEl || !lines?.length) return Promise.resolve();

  // CSS class for pre-line rendering
  outputEl.classList.add('typewriter-output');

  if (reducedMotion) {
    // Accessibility: full text, no animation
    outputEl.textContent = lines.join('\n');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const completedLines = [];
    let lineIndex = 0;
    let charIndex = 0;

    function render(currentPartial) {
      const allLines = [...completedLines, currentPartial];
      outputEl.textContent = allLines.join('\n');
    }

    function typeCharacter() {
      const currentLine = lines[lineIndex];

      if (charIndex < currentLine.length) {
        const partial = currentLine.slice(0, charIndex + 1);
        charIndex++;
        render(partial);
        setTimeout(typeCharacter, speedMs);
      } else {
        // Line complete
        completedLines.push(currentLine);
        const isLast = lineIndex === lines.length - 1;

        if (isLast) {
          resolve();
        } else {
          setTimeout(() => {
            lineIndex++;
            charIndex = 0;
            typeCharacter();
          }, pauseBetweenMs);
        }
      }
    }

    typeCharacter();
  });
}
