import { initEnvelope } from './components/envelope.js';
import { initTypewriterMultiLine as initTypewriter } from './components/typewriter.js';
import { initGallery } from './components/gallery.js';
import { initLetter } from './components/letter.js';
import { initMinigame } from './components/minigame.js';
import { initParticles } from './effects/particles.js';
import { triggerConfetti } from './effects/confetti.js';
import { initAudio } from './components/audio.js';
import { initRevealOnScroll } from './components/revealOnScroll.js';

const appState = {
  data: null,
  route: null,
  reducedMotion: false,
  finaleUnlocked: false,
};

const ROUTE_SECTION_IDS = [
  'section-typing',
  'section-countdown',
  'section-minigame',
  'section-gallery',
  'section-letter',
  'section-gift-choice',
];

async function loadData() {
  const response = await fetch('data/content.vi.json');
  if (!response.ok) throw new Error(`Load data failed: ${response.status}`);
  return response.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '';
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function onceWhenVisible({ element, threshold = 0.55, onVisible }) {
  if (!element) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        observer.disconnect();
        onVisible?.();
      }
    },
    { threshold }
  );
  observer.observe(element);
}

function initUtilityBar() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  appState.reducedMotion = mq.matches;

  const motionBtn = document.getElementById('btn-motion');
  if (motionBtn) {
    motionBtn.setAttribute('aria-pressed', String(appState.reducedMotion));
    motionBtn.addEventListener('click', () => {
      appState.reducedMotion = !appState.reducedMotion;
      motionBtn.setAttribute('aria-pressed', String(appState.reducedMotion));
      document.documentElement.classList.toggle('reduce-motion', appState.reducedMotion);
    });
  }

  const musicBtn = document.getElementById('btn-music');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const bgm = document.getElementById('bgm');
      if (!bgm) return;
      if (bgm.paused) {
        bgm.play().catch(() => {});
        musicBtn.textContent = '🔊';
        musicBtn.setAttribute('aria-pressed', 'true');
      } else {
        bgm.pause();
        musicBtn.textContent = '🔇';
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }
}

function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  const update = () => {
    const top = window.pageYOffset || document.documentElement.scrollTop;
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = total > 0 ? (top / total) * 100 : 0;
    bar.style.width = `${percent}%`;
  };

  window.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
}

function renderLanding() {
  const { landing } = appState.data;
  setText('hero-title', landing.coverTitle);
  setText('hero-subtitle', landing.coverSubtitle);
  setText('hero-tagline', landing.coverTagline);
  setText('envelope-prompt', landing.openPrompt);

  initEnvelope({
    envelopeEl: document.getElementById('envelope'),
    heroEl: document.getElementById('hero'),
    reducedMotion: appState.reducedMotion,
    onOpened: () => showChoose(),
  });

  initParticles({
    canvas: document.getElementById('particles-canvas'),
    shape: 'circle',
    count: 12,
    colors: ['#C8A97A', '#9B5E3C', '#FAF0E8'],
    reducedMotion: appState.reducedMotion,
  });
}

function showChoose() {
  show('section-choose');
  setText('choose-pretitle', 'Từ từ đã...');
  setText('choose-prompt', appState.data.landing.choosePrompt);

  const lanTheme = appState.data.themes.lan;
  const linhTheme = appState.data.themes.linh;

  setText('choose-lan-name', lanTheme.fullName);
  setText('choose-linh-name', linhTheme.fullName);
  setText('choose-lan-kana', 'にか・らん・りん');
  setText('choose-linh-kana', 'にか・りん・らん');
  setText('choose-lan-style', '');
  setText('choose-linh-style', '');

  document.getElementById('choose-pane-lan')?.addEventListener('click', () => startLinearRoute('lan'), { once: true });
  document.getElementById('choose-pane-linh')?.addEventListener('click', () => startLinearRoute('linh'), { once: true });

  initParticles({
    canvas: document.getElementById('particles-canvas'),
    shape: 'circle',
    count: 26,
    reducedMotion: appState.reducedMotion,
    bands: [
      {
        xMin: 0,
        xMax: 0.5,
        colors: ['#E8B97A', '#E3836A', '#C94040', '#F5E6D3'],
        shape: 'circle',
      },
      {
        xMin: 0.5,
        xMax: 1,
        colors: ['#E8D8F3', '#9B6EC8', '#4A2B70', '#1E2A50'],
        shape: 'circle',
      },
    ],
  });
}

function hideChooseWithTransition() {
  const chooseSection = document.getElementById('section-choose');
  if (!chooseSection || chooseSection.hidden) return Promise.resolve();

  chooseSection.classList.add('is-exiting');

  return new Promise((resolve) => {
    const timeout = appState.reducedMotion ? 70 : 340;
    window.setTimeout(() => {
      chooseSection.classList.remove('is-exiting');
      hide('section-choose');
      resolve();
    }, timeout);
  });
}

async function startLinearRoute(route) {
  appState.route = route;
  appState.finaleUnlocked = false;

  await hideChooseWithTransition();
  document.body.setAttribute('data-route', route);
  hide('section-finale');

  const routeData = appState.data.routes[route];
  const theme = appState.data.themes[route];

  ROUTE_SECTION_IDS.forEach(show);

  initAudio({
    bgmEl: document.getElementById('bgm'),
    src: appState.data.assets.audio.bgm,
    volume: appState.data.assets.audio.volume,
  });

  initParticles({
    canvas: document.getElementById('particles-canvas'),
    shape: theme.particles.shape,
    count: theme.particles.count,
    color: theme.particles.color,
    reducedMotion: appState.reducedMotion,
  });

  renderRouteContent(routeData, theme);
  initRouteInteractions(routeData, theme);

  window.scrollTo({ top: 0, behavior: appState.reducedMotion ? 'auto' : 'smooth' });
}

function renderRouteContent(routeData, theme) {
  setText('countdown-message', routeData.countdown.message);
  setText('minigame-instruction', routeData.miniGame.instructionText);
  setText('candle-remaining', String(routeData.miniGame.candleCount));
  setText('minigame-completed-text', routeData.miniGame.completedText);
  setText('gift-choice-hint', '');

  document.getElementById('minigame-completed')?.classList.remove('is-visible');

  renderLetter(routeData.letter, theme.emoji);
  renderFinale();
}

function initRouteInteractions(routeData, theme) {
  const typingSection = document.getElementById('section-typing');
  const countdownSection = document.getElementById('section-countdown');
  const typingOutput = document.getElementById('typing-output');

  onceWhenVisible({
    element: typingSection,
    threshold: 0.5,
    onVisible: () => {
      initTypewriter({
        outputEl: typingOutput,
        lines: routeData.typingLines,
        speedMs: routeData.typingSpeedMs,
        pauseBetweenMs: routeData.pauseBetweenLinesMs,
        reducedMotion: appState.reducedMotion,
      });
    },
  });

  onceWhenVisible({
    element: countdownSection,
    threshold: 0.6,
    onVisible: () => {
      runCountdown(routeData.countdown.from, theme);
    },
  });

  initMinigame({
    mountEl: document.getElementById('minigame-mount'),
    remainingEl: document.getElementById('candle-remaining'),
    completedEl: document.getElementById('minigame-completed'),
    completedTextEl: document.getElementById('minigame-completed-text'),
    candleCount: routeData.miniGame.candleCount,
    completedText: routeData.miniGame.completedText,
    themeEmoji: theme.emoji,
    onComplete: () => {
      triggerConfetti({
        colors: theme.confetti.colors,
        count: appState.reducedMotion ? 28 : 100,
        shapes: theme.confetti.shapes,
      });
    },
  });

  initGallery({
    gridEl: document.getElementById('gallery-grid'),
    messagesEl: document.getElementById('fan-messages'),
    galleryItems: routeData.gallery,
    fanMessages: routeData.fanMessages,
    lightboxEl: document.getElementById('lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxDesc: document.getElementById('lightbox-desc'),
    lightboxCredit: document.getElementById('lightbox-credit'),
    prevBtn: document.getElementById('lightbox-prev'),
    nextBtn: document.getElementById('lightbox-next'),
    closeBtn: document.getElementById('lightbox-close'),
  });

  initLetter({
    letterEl: document.getElementById('letter-card'),
    openBtnEl: document.getElementById('letter-open-btn'),
    reducedMotion: appState.reducedMotion,
    onOpened: () => {
      triggerConfetti({
        colors: theme.confetti.colors,
        count: appState.reducedMotion ? 20 : 70,
        shapes: theme.confetti.shapes,
      });
    },
  });

  initGiftChoice(theme);
  initRevealOnScroll();
  bindFinalButtons();
}

function runCountdown(startFrom, theme) {
  const numberEl = document.getElementById('countdown-number');
  if (!numberEl) return;

  let value = Math.max(1, Number(startFrom) || 3);
  const tickMs = appState.reducedMotion ? 220 : 900;

  const tick = () => {
    if (value > 0) {
      numberEl.textContent = String(value);
      restartAnimation(numberEl);
      value -= 1;
      setTimeout(tick, tickMs);
      return;
    }

    numberEl.textContent = '🎉';
    restartAnimation(numberEl);
    triggerConfetti({
      colors: theme.confetti.colors,
      count: appState.reducedMotion ? 24 : 90,
      shapes: theme.confetti.shapes,
    });
  };

  tick();
}

function restartAnimation(el) {
  if (!el) return;
  el.style.animation = 'none';
  // Force reflow to restart keyframe animation.
  void el.offsetWidth;
  el.style.animation = '';
}

function initGiftChoice(theme) {
  const yesBtn = document.getElementById('btn-yes');
  const noBtn = document.getElementById('btn-no');
  const hintEl = document.getElementById('gift-choice-hint');
  const actions = document.getElementById('gift-choice-actions');

  if (!yesBtn || !noBtn || !actions || !hintEl) return;

  let noHits = 0;

  yesBtn.disabled = false;
  noBtn.disabled = false;
  noBtn.hidden = false;
  noBtn.classList.remove('is-escaping');
  noBtn.style.left = '';
  noBtn.style.top = '';
  noBtn.style.transform = '';

  const moveNoButton = () => {
    if (noHits >= 5 || noBtn.hidden) return;

    const maxX = Math.max(12, actions.clientWidth - noBtn.offsetWidth - 12);
    const maxY = Math.max(8, actions.clientHeight - noBtn.offsetHeight - 8);
    const nextX = Math.floor(Math.random() * maxX);
    const nextY = Math.floor(Math.random() * maxY);

    noBtn.classList.add('is-escaping');
    noBtn.style.left = `${nextX}px`;
    noBtn.style.top = `${nextY}px`;
  };

  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('touchstart', moveNoButton, { passive: true });

  noBtn.addEventListener('click', (event) => {
    event.preventDefault();
    noHits += 1;

    const nextScale = Math.max(0.2, 1 - noHits * 0.16);
    noBtn.style.transform = `scale(${nextScale})`;

    if (noHits >= 5) {
      noBtn.hidden = true;
      hintEl.textContent = 'Nút Không đã chịu thua rồi, giờ chỉ còn Có thôi.';
      return;
    }

    hintEl.textContent = `Bắt được Không ${noHits}/5 lần, nhưng nó vẫn đang chạy trốn...`;
    moveNoButton();
  });

  yesBtn.addEventListener('click', () => {
    if (appState.finaleUnlocked) return;

    appState.finaleUnlocked = true;
    yesBtn.disabled = true;
    noBtn.disabled = true;
    hintEl.textContent = 'Tớ biết mà. Chuẩn bị đến phần cuối nhé.';

    revealFinale(theme);
  });
}

function revealFinale(theme) {
  const finale = document.getElementById('section-finale');
  const overlay = document.getElementById('finale-transition');

  if (!finale || !overlay) return;

  show('section-finale');
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    overlay.classList.add('is-active');
  });

  setTimeout(() => {
    overlay.classList.add('is-closing');
    finale.scrollIntoView({ behavior: appState.reducedMotion ? 'auto' : 'smooth', block: 'start' });

    triggerConfetti({
      colors: theme.confetti.colors,
      count: appState.reducedMotion ? 30 : 130,
      shapes: theme.confetti.shapes,
    });
  }, appState.reducedMotion ? 80 : 650);

  setTimeout(() => {
    overlay.classList.remove('is-active', 'is-closing');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
  }, appState.reducedMotion ? 180 : 1700);
}

function renderLetter(letter, emoji) {
  setText('letter-salutation', letter.salutation);
  setText('letter-closing', letter.closing);
  setText('letter-signature', letter.signature);
  setText('letter-seal-icon', emoji);

  const body = document.getElementById('letter-body');
  if (!body) return;
  body.innerHTML = '';

  letter.body.forEach((line) => {
    const p = document.createElement('p');
    p.textContent = line;
    body.appendChild(p);
  });
}

function renderFinale() {
  setText('finale-title', appState.data.finale.title);
  setText('finale-subtitle', appState.data.finale.subtitle);
}

function bindFinalButtons() {
  const replay = document.getElementById('btn-replay');
  const share = document.getElementById('btn-share');

  replay?.addEventListener('click', () => window.location.reload());

  share?.addEventListener('click', async () => {
    const payload = {
      title: appState.data.site.title,
      text: appState.data.finale.shareText,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // Fallback below.
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Da copy link!');
    } catch {
      alert(window.location.href);
    }
  });
}

async function boot() {
  try {
    appState.data = await loadData();
    initUtilityBar();
    initProgressBar();
    renderLanding();

    const loading = document.getElementById('loading-overlay');
    if (loading) {
      loading.classList.add('is-hidden');
      loading.addEventListener('transitionend', () => loading.remove(), { once: true });
    }
  } catch (error) {
    console.error(error);
    const loading = document.getElementById('loading-overlay');
    if (loading) {
      loading.innerHTML = '<p style="padding:24px">Khong the tai du lieu.</p>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
