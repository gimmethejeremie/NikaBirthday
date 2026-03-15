/**
 * particles.js — Floating hearts / stars background canvas
 *
 * Uses requestAnimationFrame + Canvas 2D for lightweight particle animation.
 * Reduces particle count on mobile and when reducedMotion is true.
 *
 * Shapes supported: 'heart' | 'star' | 'circle'
 *
 * @module particles
 */

/** Track canvas animation state (so we can restart on route change) */
let animationId = null;
let particles   = [];

/**
 * Init or re-init particles canvas.
 *
 * @param {object}        opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {'heart'|'star'|'circle'} [opts.shape='heart']
 * @param {string}        [opts.color='#FFB3D1']
 * @param {number}        [opts.count=15]    - desktop count
 * @param {boolean}       [opts.reducedMotion=false]
 */
export function initParticles({
  canvas,
  shape = 'heart',
  color = '#FFB3D1',
  colors = null,
  count = 15,
  reducedMotion = false,
  bands = null,
}) {
  if (!canvas) return;

  // Stop previous animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Reduced motion: clear canvas and don't animate
  if (reducedMotion) {
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Resize canvas to viewport
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Reduce count on mobile (< 600px wide)
  const isMobile     = window.innerWidth < 600;
  const actualCount  = isMobile ? Math.min(count, 8) : count;

  // Create particles
  particles = Array.from({ length: actualCount }, () => createParticle({
    canvas,
    color,
    colors,
    shape,
    bands,
  }));

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      updateParticle(p, canvas);
      drawParticle(ctx, p, shape);
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();
}

/* ─── Particle lifecycle ─────────────────────────────────────────────── */

/**
 * Create a single particle with random position/speed.
 */
function createParticle({ canvas, color, colors, shape, bands }) {
  const normalizedColors = Array.isArray(colors) && colors.length ? colors : [color];
  const band = pickBand(bands);
  const bandShape = band?.shape || shape;
  const bandColors = Array.isArray(band?.colors) && band.colors.length ? band.colors : normalizedColors;
  const xRange = band
    ? {
      min: Math.max(0, Math.min(1, band.xMin ?? 0)),
      max: Math.max(0, Math.min(1, band.xMax ?? 1)),
    }
    : { min: 0, max: 1 };

  const normalizedMin = Math.min(xRange.min, xRange.max);
  const normalizedMax = Math.max(xRange.min, xRange.max);
  const colorIndex = Math.floor(Math.random() * bandColors.length);

  return {
    x:       (normalizedMin + Math.random() * (normalizedMax - normalizedMin)) * canvas.width,
    y:       Math.random() * canvas.height,
    size:    Math.random() * 14 + 8,   // 8–22px
    speedY:  -(Math.random() * 0.6 + 0.2), // float upward
    speedX:  (Math.random() - 0.5) * 0.4,  // slight horizontal drift
    opacity: Math.random() * 0.5 + 0.2,    // 0.2–0.7
    wobble:  Math.random() * Math.PI * 2,  // phase offset for wobble
    color: bandColors[colorIndex],
    shape: bandShape,
    bandRange: { min: normalizedMin, max: normalizedMax },
  };
}

/**
 * Update particle position; reset if off-screen.
 */
function updateParticle(p, canvas) {
  p.wobble += 0.015;
  p.x      += Math.sin(p.wobble) * 0.5 + p.speedX;
  p.y      += p.speedY;

  // Reset to bottom when floated off top
  if (p.y + p.size < 0) {
    p.y = canvas.height + p.size;
    p.x = (p.bandRange.min + Math.random() * (p.bandRange.max - p.bandRange.min)) * canvas.width;
  }
}

function pickBand(bands) {
  if (!Array.isArray(bands) || !bands.length) return null;
  const index = Math.floor(Math.random() * bands.length);
  return bands[index];
}

/**
 * Draw particle on canvas.
 */
function drawParticle(ctx, p, shape) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = p.color;
  ctx.translate(p.x, p.y);

  switch (shape) {
    case 'heart':
      drawHeart(ctx, p.size);
      break;
    case 'star':
      drawStar(ctx, p.size * 0.6, p.size, 5);
      break;
    case 'circle':
    default:
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

/* ─── Shape drawers ─────────────────────────────────────────────────── */

/**
 * Draw a heart shape centered at (0, 0).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 */
function drawHeart(ctx, size) {
  const s = size * 0.05; // scale factor
  ctx.beginPath();
  ctx.moveTo(0, -s * 3);
  ctx.bezierCurveTo(-s * 7, -s * 10, -s * 14, s * 2, 0, s * 10);
  ctx.bezierCurveTo(s * 14, s * 2, s * 7, -s * 10, 0, -s * 3);
  ctx.fill();
}

/**
 * Draw a star shape centered at (0, 0).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} innerRadius
 * @param {number} outerRadius
 * @param {number} points
 */
function drawStar(ctx, innerRadius, outerRadius, points) {
  const step   = Math.PI / points;
  const start  = -Math.PI / 2;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius / 2 : innerRadius / 2;
    const angle  = start + i * step;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
