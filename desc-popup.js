/**
 * PEEKEY — Coin-Flip Spec Popup  (v4 · Event Delegation)
 * Desktop : click product image
 * Mobile  : long-press product image (600ms)
 */
(function () {
  'use strict';

  const ADMIN_EMAIL = 'peekeymetalsulikkal@gmail.com';
  const SK          = 'peekey_products_v2';

  /* ───────────────────────────── STYLES ───────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #pk-desc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);
      -webkit-backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;
      justify-content:center;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;padding:20px}
    #pk-desc-overlay.active{opacity:1;visibility:visible}
    #pk-desc-popup{position:relative;width:min(92vw,360px);max-height:90vh;perspective:900px}
    #pk-desc-close{position:absolute;top:-14px;right:-14px;width:34px;height:34px;border-radius:50%;
      background:#c8102e;border:none;color:#fff;font-size:1rem;cursor:pointer;z-index:10;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(200,16,46,.4);transition:transform .2s,background .2s}
    #pk-desc-close:hover{background:#a00d24;transform:scale(1.15) rotate(90deg)}
    .pk-coin{width:100%;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,.2,.2,1);
      border-radius:22px;position:relative}
    .pk-coin.flipped{transform:rotateY(180deg)}
    .pk-coin-face{width:100%;border-radius:22px;backface-visibility:hidden;
      -webkit-backface-visibility:hidden;overflow:hidden;background:#fff;
      box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .pk-coin-front{position:relative}
    .pk-coin-back{position:absolute;top:0;left:0;transform:rotateY(180deg);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
    .pk-coin-face img{width:100%;display:block;object-fit:contain;max-height:70vh;background:#f8f8f8}
    .pk-face-label{background:linear-gradient(135deg,#0f1a14,#1a3020);color:#fff;text-align:center;
      padding:10px 16px;font-family:'Outfit',sans-serif;font-size:.88rem;font-weight:700;
      letter-spacing:.5px;display:flex;align-items:center;justify-content:center;gap:8px}
    .pk-face-label.red-bar{background:linear-gradient(135deg,#c8102e,#a00d24)}
    .pk-flip-hint{position:absolute;bottom:48px;left:50%;transform:translateX(-50%);
      background:rgba(200,16,46,.88);color:#fff;padding:5px 16px;border-radius:20px;
      font-size:.75rem;font-weight:700;font-family:'Outfit',sans-serif;white-space:nowrap;
      pointer-events:none;animation:pkHintFade 1.8s ease .5s forwards;z-index:5}
    @keyframes pkHintFade{0%{opacity:1;transform:translateX(-50%) translateY(0)}
      80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-10px)}}
    .pk-shimmer{width:100%;height:260px;
      background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
      background-size:200% 100%;animation:pkShimmer 1.2s infinite}
    @keyframes pkShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes pkPopIn{from{transform:scale(.75) rotateY(-15deg);opacity:0}
      to{transform:scale(1) rotateY(0);opacity:1}}
    #pk-desc-popup.entering{animation:pkPopIn .45s cubic-bezier(.34,1.56,.64,1) forwards}
    .pk-press-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:64px;height:64px;pointer-events:none;z-index:20;opacity:0;transition:opacity .15s}
    .pk-press-ring.active{opacity:1}
    .pk-press-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
    .pk-press-ring circle{fill:none;stroke:#c8102e;stroke-width:4;stroke-dasharray:163;
      stroke-dashoffset:163;stroke-linecap:round;transition:stroke-dashoffset .6s linear}
    .pk-press-ring.active circle{stroke-dashoffset:0}
    /* Admin controls */
    .pk-coin-admin-bar{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:10px;z-index:30}
    .pk-admin-btn{flex:1;padding:6px 12px;font-size:.75rem;font-weight:700;border:none;
      border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;
      gap:6px;font-family:'Outfit',sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.25);
      transition:all .2s;color:#fff}
    .pk-admin-btn.edit{background:#f59e0b}.pk-admin-btn.edit:hover{background:#d97706}
    .pk-admin-btn.del{background:#ef4444}.pk-admin-btn.del:hover{background:#dc2626}
  `;
  document.head.appendChild(style);

  /* ───────────────────────────── HTML ─────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'pk-desc-overlay';
  overlay.innerHTML = `
    <div id="pk-desc-popup">
      <button id="pk-desc-close" title="Close"><i class="fas fa-times"></i></button>
      <div class="pk-coin" id="pk-coin">
        <div class="pk-coin-face pk-coin-front">
          <img id="pk-front-img" src="" alt="Product">
          <div class="pk-face-label"><i class="fas fa-box-open"></i><span id="pk-product-name">Product</span></div>
          <div class="pk-flip-hint"><i class="fas fa-sync-alt"></i> Tap card to flip</div>
        </div>
        <div class="pk-coin-face pk-coin-back">
          <div class="pk-shimmer" id="pk-shimmer"></div>
          <img id="pk-back-img" src="" alt="Spec" style="display:none">
          <div class="pk-coin-admin-bar" id="pk-admin-bar" style="display:none">
            <button class="pk-admin-btn edit" id="pk-edit-btn"><i class="fas fa-edit"></i> Edit Spec</button>
            <button class="pk-admin-btn del"  id="pk-del-btn"><i class="fas fa-trash-alt"></i> Remove Spec</button>
          </div>
          <div class="pk-face-label red-bar"><i class="fas fa-info-circle"></i><span>Product Specifications</span></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ───────────────────────────── REFS ─────────────────────────── */
  const popup    = document.getElementById('pk-desc-popup');
  const coin     = document.getElementById('pk-coin');
  const frontImg = document.getElementById('pk-front-img');
  const backImg  = document.getElementById('pk-back-img');
  const shimmer  = document.getElementById('pk-shimmer');
  const nameEl   = document.getElementById('pk-product-name');
  const closeBtn = document.getElementById('pk-desc-close');
  const adminBar = document.getElementById('pk-admin-bar');
  const editBtn  = document.getElementById('pk-edit-btn');
  const delBtn   = document.getElementById('pk-del-btn');

  let isOpen = false, flipTimeout = null;

  /* ───────────────────────────── HELPERS ──────────────────────── */
  function adminLoggedIn() {
    return sessionStorage.getItem('pk_user_email') === ADMIN_EMAIL;
  }

  function getDescUrl(name, imgSrc) {
    try {
      const products = JSON.parse(localStorage.getItem(SK) || '[]');

      // ── Try match by image filename (case-insensitive) ──
      const rawFile = imgSrc ? decodeURIComponent(imgSrc).split('?')[0].split('/').pop().toLowerCase() : '';
      if (rawFile) {
        const byUrl = products.find(p => p.url &&
          p.url.split('/').pop().toLowerCase() === rawFile);
        if (byUrl && byUrl.descUrl) return byUrl.descUrl;
      }

      // ── Try match by product name (case-insensitive, partial) ──
      if (name) {
        const nameLc = name.toLowerCase().trim();
        // Exact name match
        const exact = products.find(p => p.name && p.name.toLowerCase().trim() === nameLc);
        if (exact && exact.descUrl) return exact.descUrl;
        // Partial: stored catalog name is contained in the card title (e.g. "Mixer Grinder" ⊂ "Preethi Zodiac Mixer Grinder 750W")
        const partial = products.find(p => p.name && nameLc.includes(p.name.toLowerCase().trim()));
        if (partial && partial.descUrl) return partial.descUrl;
      }
    } catch(e) {}
    return null;
  }

  // Returns {name, src, descImg} for any product/shelf/best-seller image, or null
  function getInfo(img) {
    // ── Catalog shelf item ──
    const shelf = img.closest('.shelf-item');
    if (shelf) {
      const name = shelf.getAttribute('data-name') ||
                   shelf.querySelector('.item-name')?.textContent?.trim() || '';
      const src  = img.src || '';
      return { name, src, descImg: getDescUrl(name, src) };
    }

    // ── Best Sellers / static product card ──
    const card = img.closest('.product-card-exact');
    if (card) {
      const name = card.querySelector('.product-title-exact')?.textContent?.trim() || '';
      const src  = img.src || '';
      return { name, src, descImg: getDescUrl(name, src) };
    }

    // ── Shop By Category card ──
    const catCard = img.closest('.cat-card-exact');
    if (catCard) {
      const name = catCard.querySelector('h3')?.textContent?.replace(/\s+/g,' ').trim() || img.alt || '';
      const src  = img.src || '';
      return { name, src, descImg: getDescUrl(name, src) };
    }

    // ── Any element with data-product-name attribute (future-proof) ──
    const named = img.closest('[data-product-name]');
    if (named) {
      const name = named.getAttribute('data-product-name');
      const src  = img.src || '';
      return { name, src, descImg: getDescUrl(name, src) };
    }

    return null; // Not a product image — ignore
  }



  /* ───────────────────────────── OPEN / CLOSE ─────────────────── */
  // Friendly back-face for products with no spec image yet
  const NO_SPEC_HTML = `
    <div id="pk-no-spec" style="width:100%;padding:40px 24px;text-align:center;
      background:linear-gradient(135deg,#f8fafc,#f1f5f9);font-family:'Outfit',sans-serif;">
      <div style="font-size:3rem;margin-bottom:12px;">📋</div>
      <p style="font-size:1rem;font-weight:700;color:#1a2035;margin:0 0 6px">
        Specification Coming Soon
      </p>
      <p style="font-size:.82rem;color:#64748b;margin:0">
        Product details will be added shortly.<br>
        Contact us on WhatsApp for more info.
      </p>
    </div>`;

  function openPopup(src, name, descImg) {
    if (isOpen) return;
    isOpen = true;

    coin.classList.remove('flipped');
    popup.classList.remove('entering');
    backImg.style.display = 'none';
    shimmer.style.display = 'none';

    frontImg.src = src;
    nameEl.textContent = name || 'Product';
    popup.dataset.currentName   = name || '';
    popup.dataset.currentImgSrc = src  || '';

    adminBar.style.display = adminLoggedIn() ? 'flex' : 'none';

    // Remove any old no-spec card
    const old = document.getElementById('pk-no-spec');
    if (old) old.remove();

    if (descImg) {
      // Load real spec image
      shimmer.style.display = 'block';
      const tmp = new Image();
      tmp.onload  = () => { backImg.src = tmp.src; backImg.style.display = 'block'; shimmer.style.display = 'none'; };
      tmp.onerror = () => { backImg.src = src;     backImg.style.display = 'block'; shimmer.style.display = 'none'; };
      tmp.src = descImg;
    } else {
      // No spec — admin sees SVG placeholder, users see friendly card
      if (adminLoggedIn()) {
        shimmer.style.display = 'block';
        setTimeout(() => shimmer.style.display = 'none', 300); // quick hide
        backImg.src = src; backImg.style.display = 'block';
      } else {
        // Insert friendly message above the red-bar label
        const redBar = document.querySelector('.pk-coin-back .pk-face-label.red-bar');
        if (redBar) redBar.insertAdjacentHTML('beforebegin', NO_SPEC_HTML);
      }
    }

    overlay.classList.add('active');
    void popup.offsetWidth;
    popup.classList.add('entering');

    clearTimeout(flipTimeout);
    flipTimeout = setTimeout(() => coin.classList.add('flipped'), 1100);
  }

  function closePopup() {
    if (!isOpen) return;
    isOpen = false;
    clearTimeout(flipTimeout);
    overlay.classList.remove('active');
    coin.classList.remove('flipped');
  }

  /* ───────────────────────────── COIN INTERACTIONS ────────────── */
  coin.addEventListener('click', e => {
    if (e.target.closest('#pk-admin-bar')) return;
    coin.classList.toggle('flipped');
  });

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  /* ───────────────────────────── ADMIN EDIT SPEC ──────────────── */
  editBtn.addEventListener('click', async e => {
    e.stopPropagation();
    const key = localStorage.getItem('pk_imgbb_key') || '';
    if (!key) { alert('⚠ Set your imgbb API key in Admin Panel (Ctrl+Shift+A) first!'); return; }

    const file = await pickFile('image/*');
    if (!file) return;

    const origHtml = editBtn.innerHTML;
    editBtn.disabled = true;
    editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading…';

    try {
      const b64 = await toBase64(file);
      const fd = new FormData();
      fd.append('key', key);
      fd.append('image', b64.split(',')[1]);
      fd.append('name', 'desc-' + popup.dataset.currentName.replace(/\s+/g, '-'));

      const res  = await fetch('https://api.imgbb.com/1/upload', { method:'POST', body:fd });
      const data = await res.json();

      if (data.success && data.data?.url) {
        const url = data.data.display_url || data.data.url;
        saveDescUrl(popup.dataset.currentName, popup.dataset.currentImgSrc, url);
        backImg.src = url;
        dispatchRefresh();
        showToast('✅ Spec image updated!');
      } else {
        alert('Upload failed: ' + (data.error?.message || 'Unknown'));
      }
    } catch(err) { alert('Error: ' + err.message); }
    finally { editBtn.disabled = false; editBtn.innerHTML = origHtml; }
  });

  /* ───────────────────────────── ADMIN REMOVE SPEC ────────────── */
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!confirm('Remove specification image for this product?')) return;
    const products = JSON.parse(localStorage.getItem(SK) || '[]');
    const p = products.find(x => x.name &&
      x.name.toLowerCase().trim() === popup.dataset.currentName.toLowerCase().trim());
    if (p) {
      p.descUrl = '';
      localStorage.setItem(SK, JSON.stringify(products));
      dispatchRefresh();
      showToast('Spec image removed');
      closePopup();
    } else {
      alert('Product not found in catalog.');
    }
  });

  /* ───────────────────────────── EVENT DELEGATION ─────────────── */
  // ── Desktop click (capture phase) — fires before any onclick on parent ──
  document.addEventListener('click', function(e) {
    if (e.target.tagName !== 'IMG') return;
    const info = getInfo(e.target);
    if (!info) return;                       // not a product image – ignore
    e.stopPropagation();
    e.preventDefault();
    openPopup(info.src, info.name, info.descImg);
  }, true);

  // ── Mobile long-press (600ms hold) ──
  let touchTimer = null, touchMoved = false, touchRing = null;

  document.addEventListener('touchstart', function(e) {
    const img = e.target.tagName === 'IMG' ? e.target : null;
    if (!img) return;
    const info = getInfo(img);
    if (!info) return;

    touchMoved = false;
    const parent = img.closest('.shelf-item, .product-card-exact') || img.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      if (!parent.querySelector('.pk-press-ring')) {
        parent.insertAdjacentHTML('beforeend',
          '<div class="pk-press-ring"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="26"/></svg></div>');
      }
      touchRing = parent.querySelector('.pk-press-ring');
      if (touchRing) touchRing.classList.add('active');
    }

    touchTimer = setTimeout(() => {
      if (!touchMoved) {
        e.preventDefault();
        openPopup(info.src, info.name, info.descImg);
      }
      if (touchRing) touchRing.classList.remove('active');
    }, 600);
  }, { passive: false });

  document.addEventListener('touchmove',   () => { touchMoved = true; clearTimeout(touchTimer); if (touchRing) touchRing.classList.remove('active'); });
  document.addEventListener('touchend',    () => { clearTimeout(touchTimer); if (touchRing) touchRing.classList.remove('active'); });
  document.addEventListener('touchcancel', () => { clearTimeout(touchTimer); if (touchRing) touchRing.classList.remove('active'); });

  /* ───────────────────────────── UTILS ───────────────────────── */
  function toBase64(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function pickFile(accept) {
    return new Promise(resolve => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = accept; inp.style.display = 'none';
      inp.onchange = () => resolve(inp.files[0] || null);
      inp.oncancel  = () => resolve(null);
      document.body.appendChild(inp);
      inp.click();
      setTimeout(() => inp.remove(), 30000);
    });
  }

  function saveDescUrl(name, imgSrc, url) {
    const products = JSON.parse(localStorage.getItem(SK) || '[]');
    let p = products.find(x => x.name &&
      x.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (!p) {
      p = { id: 'static-' + Date.now(), name, category: 'Home Appliances', url: imgSrc, at: Date.now() };
      products.push(p);
    }
    p.descUrl = url;
    localStorage.setItem(SK, JSON.stringify(products));
  }

  function dispatchRefresh() {
    window.dispatchEvent(new CustomEvent('pk_products_updated'));
    window.dispatchEvent(new StorageEvent('storage', { key: SK }));
  }

  function showToast(msg) {
    if (window.apToast) { window.apToast(msg, 'ok'); return; }
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:#1a3020;color:#fff;padding:10px 22px;border-radius:50px;font-family:"Outfit",sans-serif;' +
      'font-size:.9rem;font-weight:700;z-index:999999;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

})();
