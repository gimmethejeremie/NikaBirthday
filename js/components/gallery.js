/**
 * gallery.js — Pinterest gallery + fan messages + lightbox
 *
 * - Renders gallery items (Polaroid cards) from data array
 * - Renders fan message cards
 * - Lightbox: uses native <dialog> for proper focus management + ESC
 * - Images: lazy loading, data-src for deferred loading
 *
 * @module gallery
 */

/** Current lightbox state */
const lightboxState = {
  items:        [],
  currentIndex: 0,
};

/**
 * Init gallery component.
 *
 * @param {object}      opts
 * @param {HTMLElement} opts.gridEl         - .gallery-grid mount
 * @param {HTMLElement} opts.messagesEl     - .fan-messages mount
 * @param {Array}       opts.galleryItems   - from data.routes[route].gallery
 * @param {Array}       opts.fanMessages    - from data.routes[route].fanMessages
 * @param {HTMLElement} opts.lightboxEl     - <dialog id="lightbox">
 * @param {HTMLElement} opts.lightboxImg    - img inside dialog
 * @param {HTMLElement} opts.lightboxDesc   - description paragraph
 * @param {HTMLElement} opts.lightboxCredit - credit paragraph
 * @param {HTMLElement} opts.prevBtn        - prev button
 * @param {HTMLElement} opts.nextBtn        - next button
 * @param {HTMLElement} opts.closeBtn       - close button
 */
export function initGallery({
  gridEl,
  messagesEl,
  galleryItems,
  fanMessages,
  lightboxEl,
  lightboxImg,
  lightboxDesc,
  lightboxCredit,
  prevBtn,
  nextBtn,
  closeBtn,
}) {
  if (!gridEl) return;

  // Store items for lightbox navigation
  lightboxState.items = galleryItems || [];

  // Render gallery grid
  renderGalleryItems(gridEl, galleryItems, {
    lightboxEl,
    lightboxImg,
    lightboxDesc,
    lightboxCredit,
  });

  // Render fan messages
  if (messagesEl && fanMessages?.length) {
    renderFanMessages(messagesEl, fanMessages);
  }

  // Init lightbox controls
  initLightbox({ lightboxEl, lightboxImg, lightboxDesc, lightboxCredit, prevBtn, nextBtn, closeBtn });
}

/* ─── Gallery Items ──────────────────────────────────────────────────── */

/**
 * Render Polaroid cards into the grid.
 * @param {HTMLElement} gridEl
 * @param {Array}       items
 * @param {object}      lightboxRefs
 */
function renderGalleryItems(gridEl, items, lightboxRefs) {
  if (!items?.length) {
    // Placeholder khi chưa có ảnh
    gridEl.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;
                  padding:3rem;color:var(--color-text-muted);font-size:0.9rem;">
        📷 Ảnh fanart sẽ xuất hiện ở đây.<br>
        <small>Thêm ảnh vào assets/images/ và cập nhật data/content.vi.json</small>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = '';

  items.forEach((item, index) => {
    const el = createGalleryItem(item, index);

    // Click → open lightbox
    el.addEventListener('click', () => {
      openLightbox(index, lightboxRefs);
    });

    // Keyboard: Enter / Space
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index, lightboxRefs);
      }
    });

    gridEl.appendChild(el);
  });
}

/**
 * Create a single Polaroid gallery item element.
 * @param {object} item   - { src, alt, description, credit }
 * @param {number} index  - used for stagger delay
 * @returns {HTMLElement}
 */
function createGalleryItem(item, index) {
  const staggerMs = Math.min(index * 80, 400); // cap at 400ms

  const article = document.createElement('article');
  article.className = 'gallery-item';
  article.style.setProperty('--stagger-delay', `${staggerMs}ms`);
  article.setAttribute('role', 'button');
  article.setAttribute('tabindex', '0');
  article.setAttribute('aria-label', `Xem ảnh: ${item.alt || 'Fanart'}`);

  const inner = document.createElement('div');
  inner.className = 'gallery-item-inner';

  // Image — lazy load; always set width+height to prevent layout shift
  // REPLACE: set actual dimensions when you have real images
  const img = document.createElement('img');
  img.className = 'gallery-item-img';
  img.alt        = item.alt || 'Fanart';
  img.loading    = 'lazy';
  img.decoding   = 'async';
  img.width      = 400;  // placeholder; REPLACE with actual dimensions
  img.height     = 300;

  // Use src directly (no data-src needed, native lazy loading handles it)
  img.src = item.src;

  // Caption
  const caption = document.createElement('p');
  caption.className = 'gallery-item-caption';
  caption.textContent = item.description || '';

  const credit = document.createElement('p');
  credit.className = 'gallery-item-credit';
  credit.textContent = item.credit || '';

  inner.appendChild(img);
  inner.appendChild(caption);
  inner.appendChild(credit);
  article.appendChild(inner);

  return article;
}

/* ─── Fan Messages ───────────────────────────────────────────────────── */

/**
 * Render fan message cards.
 * @param {HTMLElement} messagesEl
 * @param {Array}       messages - [{ author, message, emoji }]
 */
function renderFanMessages(messagesEl, messages) {
  messagesEl.innerHTML = '';

  messages.forEach((msg, index) => {
    const staggerMs = Math.min(index * 100, 500);

    const card = document.createElement('article');
    card.className = 'fan-message-card';
    card.style.setProperty('--stagger-delay', `${staggerMs}ms`);

    // Emoji icon
    const emojiEl = document.createElement('div');
    emojiEl.className   = 'fan-message-emoji';
    emojiEl.textContent = msg.emoji || '💬';
    emojiEl.setAttribute('aria-hidden', 'true');

    // Message text
    const textEl = document.createElement('p');
    textEl.className   = 'fan-message-text';
    textEl.textContent = msg.message || '';

    // Author
    const authorEl = document.createElement('p');
    authorEl.className   = 'fan-message-author';
    authorEl.textContent = msg.author || '';

    card.appendChild(emojiEl);
    card.appendChild(textEl);
    card.appendChild(authorEl);
    messagesEl.appendChild(card);
  });
}

/* ─── Lightbox ───────────────────────────────────────────────────────── */

/**
 * Init lightbox controls (close, prev, next, keyboard).
 */
function initLightbox({ lightboxEl, lightboxImg, lightboxDesc, lightboxCredit, prevBtn, nextBtn, closeBtn }) {
  if (!lightboxEl) return;

  // Close button
  closeBtn?.addEventListener('click', () => closeLightbox(lightboxEl));

  // Prev button
  prevBtn?.addEventListener('click', () => {
    const newIndex = (lightboxState.currentIndex - 1 + lightboxState.items.length)
                     % lightboxState.items.length;
    updateLightboxContent(newIndex, { lightboxImg, lightboxDesc, lightboxCredit });
  });

  // Next button
  nextBtn?.addEventListener('click', () => {
    const newIndex = (lightboxState.currentIndex + 1) % lightboxState.items.length;
    updateLightboxContent(newIndex, { lightboxImg, lightboxDesc, lightboxCredit });
  });

  // Click outside dialog content → close (click on ::backdrop)
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) {
      closeLightbox(lightboxEl);
    }
  });

  // Keyboard navigation inside dialog
  lightboxEl.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        prevBtn?.click();
        break;
      case 'ArrowRight':
        nextBtn?.click();
        break;
      // ESC is handled natively by <dialog>
    }
  });
}

/**
 * Open lightbox at given index.
 * @param {number} index
 * @param {object} refs - { lightboxEl, lightboxImg, lightboxDesc, lightboxCredit }
 */
function openLightbox(index, { lightboxEl, lightboxImg, lightboxDesc, lightboxCredit }) {
  if (!lightboxEl) return;

  updateLightboxContent(index, { lightboxImg, lightboxDesc, lightboxCredit });

  // Hide prev/next if only 1 item
  const hasManyItems = lightboxState.items.length > 1;
  document.getElementById('lightbox-prev')?.toggleAttribute('hidden', !hasManyItems);
  document.getElementById('lightbox-next')?.toggleAttribute('hidden', !hasManyItems);

  // Native <dialog> showModal() — handles focus trap + ESC automatically
  if (lightboxEl.showModal) {
    lightboxEl.showModal();
  } else {
    // Fallback for old browsers
    lightboxEl.setAttribute('open', '');
  }
}

/**
 * Update lightbox image and text for given index.
 */
function updateLightboxContent(index, { lightboxImg, lightboxDesc, lightboxCredit }) {
  lightboxState.currentIndex = index;
  const item = lightboxState.items[index];
  if (!item) return;

  if (lightboxImg) {
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || '';
  }
  if (lightboxDesc)   lightboxDesc.textContent   = item.description || '';
  if (lightboxCredit) lightboxCredit.textContent = item.credit || '';
}

/**
 * Close lightbox.
 * @param {HTMLDialogElement} lightboxEl
 */
function closeLightbox(lightboxEl) {
  if (lightboxEl?.close) {
    lightboxEl.close();
  } else {
    lightboxEl?.removeAttribute('open');
  }
}
