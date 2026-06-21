/**
 * PEEKEY — Amazon-Style Product Detail Modal (v6)
 * Replaces the coin-flip spec popup and direct WhatsApp redirection on product clicks.
 * Features a multi-image/video gallery, tabbed details, wishlist/cart toggle,
 * and direct inline upload/edit tools for admin.
 */
(function () {
  'use strict';

  const ADMIN_EMAIL = 'peekeymetalsulikkal@gmail.com';
  const SK          = 'peekey_products_v2';

  /* ───────────────────────────── STYLES ───────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #pk-detail-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s;
      padding: 20px;
      font-family: 'Outfit', sans-serif;
    }
    #pk-detail-modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .pk-detail-box {
      position: relative;
      background: #ffffff;
      width: min(95vw, 860px);
      max-height: 90vh;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: pkModalSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes pkModalSlide {
      from { transform: translateY(30px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .pk-detail-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 1.2rem;
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .pk-detail-close-btn:hover {
      background: #ad1f35;
      color: #ffffff;
      border-color: #ad1f35;
      transform: scale(1.08) rotate(90deg);
    }
    .pk-detail-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 32px;
      padding: 32px;
      overflow-y: auto;
    }
    @media (max-width: 768px) {
      #pk-detail-modal-overlay {
        padding: 10px;
      }
      .pk-detail-box {
        width: 100%;
        height: 100%;
        max-height: 96vh;
        border-radius: 20px;
      }
      .pk-detail-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
      }
    }
    /* Gallery Styles */
    .pk-detail-gallery {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pk-detail-main-display {
      width: 100%;
      aspect-ratio: 1.1;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .pk-detail-main-display img, .pk-detail-main-display video {
      max-width: 92%;
      max-height: 92%;
      object-fit: contain;
      border-radius: 8px;
    }
    .pk-detail-thumbnails {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .pk-thumb-slot {
      aspect-ratio: 1;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pk-thumb-slot:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }
    .pk-thumb-slot.active {
      border-color: #ad1f35;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(173, 31, 53, 0.15);
    }
    .pk-thumb-slot img {
      max-width: 85%;
      max-height: 85%;
      object-fit: contain;
    }
    .pk-thumb-slot.placeholder-icon::before {
      content: "\\f03e";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      color: #94a3b8;
      font-size: 1.3rem;
    }
    .pk-thumb-slot[data-slot="video"]::before {
      content: "\\f03d";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      color: #94a3b8;
      font-size: 1.3rem;
      z-index: 1;
    }
    .pk-thumb-slot[data-slot="video"].has-video::before {
      display: none;
    }
    .pk-thumb-slot .video-thumb-play {
      display: none;
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      color: #ffffff;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      z-index: 2;
    }
    .pk-thumb-slot.has-video .video-thumb-play {
      display: flex;
    }
    .pk-thumb-admin-upload {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      z-index: 5;
    }
    .pk-thumb-slot:hover .pk-thumb-admin-upload {
      opacity: 1;
    }
    /* Info Panel Styles */
    .pk-detail-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pk-detail-header-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pk-detail-cat {
      align-self: flex-start;
      font-size: 0.72rem;
      font-weight: 800;
      color: #ad1f35;
      background: #fff1f2;
      padding: 4px 12px;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .pk-detail-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pk-detail-price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .pk-detail-price-current {
      font-size: 1.95rem;
      font-weight: 800;
      color: #ad1f35;
    }
    .pk-detail-price-old {
      font-size: 1.15rem;
      color: #64748b;
      text-decoration: line-through;
    }
    .pk-detail-price-discount {
      font-size: 0.95rem;
      font-weight: 800;
      color: #16a34a;
    }
    .pk-detail-actions {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }
    .pk-detail-actions button {
      flex: 1;
      padding: 12px 20px;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    .pk-detail-add-to-cart-btn {
      background: #ad1f35;
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(173, 31, 53, 0.25);
    }
    .pk-detail-add-to-cart-btn:hover {
      background: #8e182a;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(173, 31, 53, 0.35);
    }
    .pk-detail-add-to-wishlist-btn {
      background: #ffffff;
      color: #ad1f35;
      border: 2px solid #ad1f35;
    }
    .pk-detail-add-to-wishlist-btn:hover {
      background: #fff1f2;
      transform: translateY(-2px);
    }
    /* Tabs System */
    .pk-detail-tabs {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .pk-tab-header {
      display: flex;
      gap: 24px;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 16px;
    }
    .pk-tab-btn {
      background: none;
      border: none;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      color: #64748b;
      padding-bottom: 10px;
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
    }
    .pk-tab-btn:hover {
      color: #0f172a;
    }
    .pk-tab-btn.active {
      color: #ad1f35;
    }
    .pk-tab-btn.active::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #ad1f35;
    }
    .pk-tab-content {
      display: none;
      font-size: 0.88rem;
      color: #475569;
      line-height: 1.6;
      flex: 1;
    }
    .pk-tab-content.active {
      display: block;
    }
    .pk-specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .pk-specs-table tr {
      border-bottom: 1px solid #f8fafc;
    }
    .pk-specs-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .pk-specs-table td {
      padding: 8px 12px;
    }
    .pk-specs-table td:first-child {
      font-weight: 700;
      color: #475569;
      width: 38%;
    }
    .pk-specs-table td:last-child {
      color: #0f172a;
    }
    .pk-desc-text {
      margin: 0 0 12px 0;
      white-space: pre-wrap;
    }
    /* Admin Controls styling */
    .pk-admin-edit-btn {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .pk-admin-edit-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }
    
    .pk-admin-edit-inline-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      padding: 6px 10px;
      margin-left: 6px;
      border-radius: 8px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }
    .pk-admin-edit-inline-btn:hover {
      background: #f1f5f9;
      color: #ad1f35;
      transform: scale(1.08);
    }
    
    /* Inline Editing Styling */
    .pk-inline-edit-container {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin: 4px 0;
    }
    .pk-inline-input {
      flex: 1;
      padding: 10px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      font-size: 1rem;
      font-family: inherit;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s;
      background: #ffffff;
      width: 100%;
      box-sizing: border-box;
    }
    .pk-inline-input:focus {
      border-color: #ad1f35;
      box-shadow: 0 0 0 3px rgba(173, 31, 53, 0.12);
    }
    .pk-inline-textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: inherit;
      color: #475569;
      outline: none;
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
      background: #ffffff;
      box-sizing: border-box;
    }
    .pk-inline-textarea:focus {
      border-color: #ad1f35;
      box-shadow: 0 0 0 3px rgba(173, 31, 53, 0.12);
    }
    .pk-inline-edit-actions {
      display: flex;
      gap: 8px;
    }
    .pk-inline-save-btn, .pk-inline-cancel-btn {
      padding: 8px 14px;
      border: none;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-family: inherit;
      transition: all 0.2s;
    }
    .pk-inline-save-btn {
      background: #ad1f35;
      color: #ffffff;
    }
    .pk-inline-save-btn:hover {
      background: #8e182a;
    }
    .pk-inline-cancel-btn {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
    }
    .pk-inline-cancel-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    #pk-custom-prompt {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .pk-prompt-box {
      background: #ffffff;
      width: min(90%, 420px);
      border-radius: 20px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-sizing: border-box;
      font-family: inherit;
    }
    .pk-prompt-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }
    .pk-prompt-desc {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.4;
    }
    .pk-main-delete-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #e2e8f0;
      color: #ad1f35;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      transition: all 0.2s;
      z-index: 10;
    }
    .pk-main-delete-btn:hover {
      background: #ad1f35;
      color: #ffffff;
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);

  /* ───────────────────────────── HTML ─────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'pk-detail-modal-overlay';
  overlay.innerHTML = `
    <div class="pk-detail-box">
      <button class="pk-detail-close-btn" id="pk-detail-close" title="Close">&times;</button>
      <div class="pk-detail-grid">
        <!-- Left Column: Gallery -->
        <div class="pk-detail-gallery">
          <div class="pk-detail-main-display">
            <img id="pk-gallery-main-img" src="" alt="Product">
            <video id="pk-gallery-main-video" src="" controls style="display:none"></video>
            <button id="pk-main-display-delete-btn" class="pk-main-delete-btn" title="Delete current media" style="display:none;"><i class="fas fa-trash-alt"></i></button>
          </div>
          <div class="pk-detail-thumbnails">
            <!-- Main Image -->
            <div class="pk-thumb-slot active" id="pk-thumb-url" data-type="image" data-slot="url">
              <img>
              <button class="pk-thumb-admin-upload" title="Upload Main Image"><i class="fas fa-camera"></i></button>
            </div>
            <!-- Image 1 -->
            <div class="pk-thumb-slot placeholder-icon" id="pk-thumb-img1" data-type="image" data-slot="img1">
              <img style="display:none">
              <button class="pk-thumb-admin-upload" title="Upload Image 1"><i class="fas fa-camera"></i></button>
            </div>
            <!-- Image 2 -->
            <div class="pk-thumb-slot placeholder-icon" id="pk-thumb-img2" data-type="image" data-slot="img2">
              <img style="display:none">
              <button class="pk-thumb-admin-upload" title="Upload Image 2"><i class="fas fa-camera"></i></button>
            </div>
            <!-- Video -->
            <div class="pk-thumb-slot placeholder-icon" id="pk-thumb-video" data-type="video" data-slot="video">
              <div class="video-thumb-play"><i class="fas fa-play"></i></div>
              <button class="pk-thumb-admin-upload" title="Configure Video"><i class="fas fa-video"></i></button>
            </div>
          </div>
        </div>

        <!-- Right Column: Info Panel -->
        <div class="pk-detail-info">
          <!-- Title & Price Container -->
          <div id="pk-info-container" style="width: 100%; display: flex; flex-direction: column; gap: 12px;">
            <!-- Category and Title Section -->
            <div class="pk-detail-header-row" style="position: relative;">
              <span class="pk-detail-cat" id="pk-detail-cat">Category</span>
              <!-- Title View Box -->
              <div id="pk-title-display-box" style="display: flex; align-items: center; gap: 8px; width: 100%;">
                <h2 class="pk-detail-title" style="margin:0;">
                  <span id="pk-detail-title">Product Title</span>
                </h2>
                <button class="pk-admin-edit-inline-btn" id="pk-admin-edit-title-btn" title="Edit Title" style="display:none;"><i class="fas fa-pen"></i></button>
              </div>
              <!-- Title Edit Box -->
              <div id="pk-title-edit-box" style="display: none; align-items: center; gap: 8px; width: 100%;">
                <input type="text" id="pk-edit-title-input" class="pk-inline-input" placeholder="Product Title">
                <div style="display: flex; gap: 6px; flex-shrink: 0;">
                  <button class="pk-inline-save-btn" id="pk-save-title-btn" style="padding: 8px 12px;"><i class="fas fa-check"></i></button>
                  <button class="pk-inline-cancel-btn" id="pk-cancel-title-btn" style="padding: 8px 12px;"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>

            <!-- Price Section -->
            <div class="pk-detail-price-container" style="position: relative;">
              <!-- Price View Box -->
              <div id="pk-price-display-box" style="display: flex; align-items: baseline; gap: 12px; width: 100%;">
                <span class="pk-detail-price-current" id="pk-detail-price-current">Price</span>
                <span class="pk-detail-price-old" id="pk-detail-price-old"></span>
                <span class="pk-detail-price-discount" id="pk-detail-price-discount"></span>
                <button class="pk-admin-edit-inline-btn" id="pk-admin-edit-price-btn" title="Edit Price" style="display:none;"><i class="fas fa-pen"></i></button>
              </div>
              <!-- Price Edit Box -->
              <div id="pk-price-edit-box" style="display: none; align-items: center; gap: 8px; width: 100%;">
                <input type="text" id="pk-edit-price-input" class="pk-inline-input" placeholder="Price (e.g. 2490 or empty for Ask Price)">
                <div style="display: flex; gap: 6px; flex-shrink: 0;">
                  <button class="pk-inline-save-btn" id="pk-save-price-btn" style="padding: 8px 12px;"><i class="fas fa-check"></i></button>
                  <button class="pk-inline-cancel-btn" id="pk-cancel-price-btn" style="padding: 8px 12px;"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div class="pk-detail-actions">
            <button class="pk-detail-add-to-cart-btn" id="pk-detail-add-to-cart-btn"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
            <button class="pk-detail-add-to-wishlist-btn" id="pk-detail-add-to-wishlist-btn"><i class="far fa-heart"></i> Add to Wishlist</button>
          </div>

          <!-- Tab System -->
          <div class="pk-detail-tabs">
            <div class="pk-tab-header">
              <button class="pk-tab-btn active" data-tab="specs">Specifications</button>
              <button class="pk-tab-btn" data-tab="desc">Description</button>
            </div>
            
            <div class="pk-tab-content active" id="pk-tab-specs">
              <div id="pk-specs-view" style="width:100%; display: flex; flex-direction: column; gap: 8px;">
                <table class="pk-specs-table" id="pk-specs-table"></table>
                <textarea id="pk-edit-specs-input" class="pk-inline-textarea" style="display: none;" rows="6" placeholder="Brand: Peekey&#10;Warranty: 1 Year"></textarea>
                <div id="pk-specs-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button class="pk-admin-edit-btn" id="pk-admin-edit-specs-btn" style="display:none"><i class="fas fa-edit"></i> Edit Specifications</button>
                  <button class="pk-inline-save-btn" id="pk-save-specs-btn" style="display:none;"><i class="fas fa-check"></i> Save</button>
                  <button class="pk-inline-cancel-btn" id="pk-cancel-specs-btn" style="display:none;"><i class="fas fa-times"></i> Cancel</button>
                </div>
              </div>
            </div>
            
            <div class="pk-tab-content" id="pk-tab-desc">
              <div id="pk-desc-view" style="width:100%; display: flex; flex-direction: column; gap: 8px;">
                <p class="pk-desc-text" id="pk-desc-text"></p>
                <textarea id="pk-edit-desc-input" class="pk-inline-textarea" style="display: none;" rows="6" placeholder="Enter product description..."></textarea>
                <div id="pk-desc-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button class="pk-admin-edit-btn" id="pk-admin-edit-desc-btn" style="display:none"><i class="fas fa-edit"></i> Edit Description</button>
                  <button class="pk-inline-save-btn" id="pk-save-desc-btn" style="display:none;"><i class="fas fa-check"></i> Save</button>
                  <button class="pk-inline-cancel-btn" id="pk-cancel-desc-btn" style="display:none;"><i class="fas fa-times"></i> Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Custom Prompt Modal setup
  const promptModal = document.createElement('div');
  promptModal.id = 'pk-custom-prompt';
  promptModal.innerHTML = `
    <div class="pk-prompt-box">
      <h3 id="pk-custom-prompt-title" class="pk-prompt-title">Prompt</h3>
      <p id="pk-custom-prompt-desc" class="pk-prompt-desc" style="display:none;"></p>
      <div id="pk-custom-prompt-input-container">
        <input type="text" id="pk-custom-prompt-input" class="pk-inline-input" style="width:100%;">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
        <button id="pk-custom-prompt-cancel" class="pk-inline-cancel-btn">Cancel</button>
        <button id="pk-custom-prompt-ok" class="pk-inline-save-btn">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(promptModal);

  /* ───────────────────────────── REFS ─────────────────────────── */
  const mainImg     = document.getElementById('pk-gallery-main-img');
  const mainVideo   = document.getElementById('pk-gallery-main-video');
  const mainDeleteBtn = document.getElementById('pk-main-display-delete-btn');
  const closeBtn    = document.getElementById('pk-detail-close');
  const catEl       = document.getElementById('pk-detail-cat');
  const titleEl     = document.getElementById('pk-detail-title');
  
  const priceCurrent = document.getElementById('pk-detail-price-current');
  const priceOld     = document.getElementById('pk-detail-price-old');
  const priceDiscount = document.getElementById('pk-detail-price-discount');
  
  const cartBtn     = document.getElementById('pk-detail-add-to-cart-btn');
  const wishlistBtn = document.getElementById('pk-detail-add-to-wishlist-btn');
  
  const specsTable  = document.getElementById('pk-specs-table');
  const descText    = document.getElementById('pk-desc-text');
  
  const adminEditTitleBtn = document.getElementById('pk-admin-edit-title-btn');
  const adminEditPriceBtn = document.getElementById('pk-admin-edit-price-btn');
  const adminEditSpecs    = document.getElementById('pk-admin-edit-specs-btn');
  const adminEditDesc     = document.getElementById('pk-admin-edit-desc-btn');

  // Title Edit Refs
  const titleDisplayBox = document.getElementById('pk-title-display-box');
  const titleEditBox    = document.getElementById('pk-title-edit-box');
  const editTitleInput  = document.getElementById('pk-edit-title-input');
  const saveTitleBtn    = document.getElementById('pk-save-title-btn');
  const cancelTitleBtn  = document.getElementById('pk-cancel-title-btn');

  // Price Edit Refs
  const priceDisplayBox = document.getElementById('pk-price-display-box');
  const priceEditBox    = document.getElementById('pk-price-edit-box');
  const editPriceInput  = document.getElementById('pk-edit-price-input');
  const savePriceBtn    = document.getElementById('pk-save-price-btn');
  const cancelPriceBtn  = document.getElementById('pk-cancel-price-btn');

  // Specs Edit Refs
  const editSpecsInput = document.getElementById('pk-edit-specs-input');
  const saveSpecsBtn   = document.getElementById('pk-save-specs-btn');
  const cancelSpecsBtn = document.getElementById('pk-cancel-specs-btn');

  // Desc Edit Refs
  const editDescInput = document.getElementById('pk-edit-desc-input');
  const saveDescBtn   = document.getElementById('pk-save-desc-btn');
  const cancelDescBtn = document.getElementById('pk-cancel-desc-btn');

  let currentProduct = null;
  let originalFallbackImg = '';

  /* ───────────────────────────── HELPERS ──────────────────────── */
  function adminLoggedIn() {
    return sessionStorage.getItem('pk_user_email') === ADMIN_EMAIL;
  }

  function customPrompt(title, defaultValue, description = '') {
    return new Promise(resolve => {
      const pm = document.getElementById('pk-custom-prompt');
      const pmTitle = document.getElementById('pk-custom-prompt-title');
      const pmDesc = document.getElementById('pk-custom-prompt-desc');
      const pmInput = document.getElementById('pk-custom-prompt-input');
      const btnCancel = document.getElementById('pk-custom-prompt-cancel');
      const btnOk = document.getElementById('pk-custom-prompt-ok');
      
      pmTitle.textContent = title;
      if (description) {
        pmDesc.textContent = description;
        pmDesc.style.display = 'block';
      } else {
        pmDesc.style.display = 'none';
      }
      pmInput.value = defaultValue || '';
      pm.style.display = 'flex';
      pmInput.focus();
      
      function cleanUp() {
        pm.style.display = 'none';
        btnCancel.removeEventListener('click', onCancel);
        btnOk.removeEventListener('click', onOk);
        pmInput.removeEventListener('keydown', onKeyDown);
      }
      
      function onCancel() {
        cleanUp();
        resolve(null);
      }
      
      function onOk() {
        const val = pmInput.value;
        cleanUp();
        resolve(val);
      }
      
      function onKeyDown(e) {
        if (e.key === 'Enter') {
          onOk();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }
      
      btnCancel.addEventListener('click', onCancel);
      btnOk.addEventListener('click', onOk);
      pmInput.addEventListener('keydown', onKeyDown);
    });
  }

  function getProductByName(name) {
    try {
      const products = JSON.parse(localStorage.getItem(SK) || '[]');
      return products.find(p => p.name && p.name.toLowerCase().trim() === name.toLowerCase().trim());
    } catch(e) {}
    return null;
  }


  function saveProductField(name, field, value) {
    try {
      const products = JSON.parse(localStorage.getItem(SK) || '[]');
      let p = products.find(x => x.name && x.name.toLowerCase().trim() === name.toLowerCase().trim());
      if (!p) {
        // Create new dynamic catalog product if it was a static layout product, copying current fields
        p = {
          id: 'static-' + Date.now(),
          name: name,
          category: currentProduct ? (currentProduct.category || 'Home Appliances') : 'Home Appliances',
          url: currentProduct ? (currentProduct.url || '') : '',
          price: currentProduct ? (currentProduct.price || '') : '',
          img1: currentProduct ? (currentProduct.img1 || '') : '',
          img2: currentProduct ? (currentProduct.img2 || '') : '',
          video: currentProduct ? (currentProduct.video || '') : '',
          specs: currentProduct ? (currentProduct.specs || '') : '',
          description: currentProduct ? (currentProduct.description || '') : '',
          at: Date.now()
        };
        products.push(p);
      }
      p[field] = value;
      localStorage.setItem(SK, JSON.stringify(products));
      dispatchRefresh();
    } catch(e) {
      console.error(e);
    }
  }

  function dispatchRefresh() {
    window.dispatchEvent(new CustomEvent('pk_products_updated'));
    window.dispatchEvent(new StorageEvent('storage', { key: SK }));
  }

  function showToast(msg) {
    if (window.apToast) { window.apToast(msg, 'ok'); return; }
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:#1e293b;color:#ffffff;padding:12px 24px;border-radius:50px;font-family:"Outfit",sans-serif;' +
      'font-size:.9rem;font-weight:700;z-index:999999;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

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

  /* ───────────────────────────── RENDER TABS ──────────────────── */
  function renderSpecs(p) {
    specsTable.innerHTML = '';
    const specsStr = p.specs || `Brand: Peekey\nCategory: ${p.category || 'Appliances'}\nWarranty: 1 Year\nAvailability: In Stock`;
    const lines = specsStr.split('\n');
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        if (key && val) {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${key}</td><td>${val}</td>`;
          specsTable.appendChild(tr);
        }
      }
    });
  }

  function renderDescription(p) {
    descText.textContent = p.description || `Premium quality ${p.name || 'product'} from Peekey. Sourced from top-tier manufacturers to guarantee durability and elegant design.`;
  }

  /* ───────────────────────────── OPEN / CLOSE ─────────────────── */
  function openDetailModal(name, mainImgUrl, category) {
    if (mainImgUrl) originalFallbackImg = mainImgUrl;
    // Reset any open edit states to view mode
    if (titleDisplayBox) titleDisplayBox.style.display = 'flex';
    if (titleEditBox) titleEditBox.style.display = 'none';
    if (priceDisplayBox) priceDisplayBox.style.display = 'flex';
    if (priceEditBox) priceEditBox.style.display = 'none';
    
    if (specsTable) specsTable.style.display = 'table';
    if (editSpecsInput) editSpecsInput.style.display = 'none';
    if (saveSpecsBtn) saveSpecsBtn.style.display = 'none';
    if (cancelSpecsBtn) cancelSpecsBtn.style.display = 'none';
    
    if (descText) descText.style.display = 'block';
    if (editDescInput) editDescInput.style.display = 'none';
    if (saveDescBtn) saveDescBtn.style.display = 'none';
    if (cancelDescBtn) cancelDescBtn.style.display = 'none';

    // 1. Load details from localStorage or fall back
    let p = getProductByName(name);
    if (!p) {
      p = {
        name: name,
        url: mainImgUrl,
        category: category || 'Home Appliances',
        price: '',
        img1: '',
        img2: '',
        video: '',
        specs: '',
        description: ''
      };
    }
    currentProduct = p;

    // 2. Set Basic Info
    catEl.textContent = p.category;
    titleEl.textContent = p.name;

    // 3. Price formatting
    if (p.price) {
      const priceVal = parseInt(p.price.toString().replace(/[^0-9]/g, ''));
      priceCurrent.textContent = '₹' + priceVal.toLocaleString('en-IN');
      const mrp = Math.ceil(priceVal * 1.35 / 100) * 100;
      priceOld.textContent = '₹' + mrp.toLocaleString('en-IN');
      priceOld.style.display = 'inline';
      priceDiscount.textContent = '(25% OFF)';
      priceDiscount.style.display = 'inline';
    } else {
      priceCurrent.textContent = 'Price on Request';
      priceOld.style.display = 'none';
      priceDiscount.style.display = 'none';
    }

    // 4. Load Gallery Media
    mainImg.src = p.url;
    mainImg.style.display = 'block';
    mainVideo.style.display = 'none';
    mainVideo.src = '';

    // Thumb 1 (Main Image)
    const thumbUrl = document.getElementById('pk-thumb-url');
    thumbUrl.querySelector('img').src = p.url;
    
    // Reset thumbnail selections
    document.querySelectorAll('.pk-thumb-slot').forEach(slot => slot.classList.remove('active'));
    thumbUrl.classList.add('active');

    // Thumb 2 (Image 1)
    const thumbImg1 = document.getElementById('pk-thumb-img1');
    if (p.img1) {
      thumbImg1.querySelector('img').src = p.img1;
      thumbImg1.querySelector('img').style.display = 'block';
      thumbImg1.classList.remove('placeholder-icon');
    } else {
      thumbImg1.querySelector('img').style.display = 'none';
      thumbImg1.classList.add('placeholder-icon');
    }

    // Thumb 3 (Image 2)
    const thumbImg2 = document.getElementById('pk-thumb-img2');
    if (p.img2) {
      thumbImg2.querySelector('img').src = p.img2;
      thumbImg2.querySelector('img').style.display = 'block';
      thumbImg2.classList.remove('placeholder-icon');
    } else {
      thumbImg2.querySelector('img').style.display = 'none';
      thumbImg2.classList.add('placeholder-icon');
    }

    // Thumb 4 (Video)
    const thumbVideo = document.getElementById('pk-thumb-video');
    if (p.video) {
      thumbVideo.classList.add('has-video');
      thumbVideo.classList.remove('placeholder-icon');
    } else {
      thumbVideo.classList.remove('has-video');
      thumbVideo.classList.add('placeholder-icon');
    }

    // 5. Tabs rendering
    renderSpecs(p);
    renderDescription(p);

    // Reset Active Tab
    document.querySelectorAll('.pk-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.pk-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.pk-tab-btn[data-tab="specs"]').classList.add('active');
    document.getElementById('pk-tab-specs').classList.add('active');

    // 6. Action badges updates
    updateActionButtons();

    // 7. Admin Visibility Toggle
    const isAdmin = adminLoggedIn();
    document.querySelectorAll('.pk-thumb-admin-upload').forEach(btn => {
      btn.style.display = isAdmin ? 'flex' : 'none';
    });
    if (adminEditTitleBtn) adminEditTitleBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    if (adminEditPriceBtn) adminEditPriceBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    if (adminEditSpecs) adminEditSpecs.style.display = isAdmin ? 'inline-flex' : 'none';
    if (adminEditDesc) adminEditDesc.style.display = isAdmin ? 'inline-flex' : 'none';

    // Toggle delete button
    if (mainDeleteBtn) {
      const activeSlot = document.querySelector('.pk-thumb-slot.active');
      const hasMedia = activeSlot && (!activeSlot.classList.contains('placeholder-icon') || activeSlot.id === 'pk-thumb-url' || activeSlot.classList.contains('has-video'));
      mainDeleteBtn.style.display = (isAdmin && hasMedia) ? 'flex' : 'none';
    }

    // Show Overlay
    overlay.classList.add('active');
  }

  function closeDetailModal() {
    overlay.classList.remove('active');
    mainVideo.pause();
    mainVideo.src = '';
  }

  function updateActionButtons() {
    if (!currentProduct) return;
    
    // Cart Status
    const inCart = window.pkIsInCart && window.pkIsInCart(currentProduct.name);
    if (inCart) {
      cartBtn.innerHTML = '<i class="fas fa-trash"></i> Remove from Cart';
      cartBtn.style.background = '#64748b';
    } else {
      cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
      cartBtn.style.background = '#ad1f35';
    }

    // Wishlist Status
    const inWishlist = window.pkIsInWishlist && window.pkIsInWishlist(currentProduct.name);
    if (inWishlist) {
      wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> In Wishlist';
      wishlistBtn.style.background = '#ad1f35';
      wishlistBtn.style.color = '#ffffff';
    } else {
      wishlistBtn.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
      wishlistBtn.style.background = '#ffffff';
      wishlistBtn.style.color = '#ad1f35';
    }
  }

  /* ───────────────────────────── INTERACTIONS ────────────────── */
  
  // Close triggers
  closeBtn.addEventListener('click', closeDetailModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDetailModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetailModal(); });

  // Thumbnail clicks (updates main display preview)
  document.querySelectorAll('.pk-thumb-slot').forEach(slot => {
    slot.addEventListener('click', function (e) {
      if (e.target.closest('.pk-thumb-admin-upload')) return; // ignore admin click

      document.querySelectorAll('.pk-thumb-slot').forEach(s => s.classList.remove('active'));
      this.classList.add('active');

      const type = this.dataset.type;
      const slotName = this.dataset.slot;

      if (type === 'image') {
        mainVideo.style.display = 'none';
        mainVideo.pause();
        mainImg.style.display = 'block';

        if (slotName === 'url') {
          mainImg.src = currentProduct.url;
        } else if (slotName === 'img1') {
          mainImg.src = currentProduct.img1 || currentProduct.url;
        } else if (slotName === 'img2') {
          mainImg.src = currentProduct.img2 || currentProduct.url;
        }
      } else if (type === 'video') {
        if (currentProduct.video) {
          mainImg.style.display = 'none';
          mainVideo.style.display = 'block';
          mainVideo.src = currentProduct.video;
          mainVideo.play().catch(err => console.log('Autoplay prevented:', err));
        } else {
          // fallback to main image
          mainVideo.style.display = 'none';
          mainImg.style.display = 'block';
          mainImg.src = currentProduct.url;
        }
      }

      // Update delete button visibility on slot change
      if (mainDeleteBtn) {
        const isAdmin = adminLoggedIn();
        const hasMedia = !this.classList.contains('placeholder-icon') || this.id === 'pk-thumb-url' || this.classList.contains('has-video');
        mainDeleteBtn.style.display = (isAdmin && hasMedia) ? 'flex' : 'none';
      }
    });
  });

  // Touch Swiping logic for main gallery display
  let touchStartX = 0;
  let touchEndX = 0;
  const mainDisplay = document.querySelector('.pk-detail-main-display');

  if (mainDisplay) {
    mainDisplay.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mainDisplay.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const minSwipeDistance = 50; // pixels
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    // Get all slots that have media (not placeholders)
    const slots = Array.from(document.querySelectorAll('.pk-thumb-slot'));
    const activeIndex = slots.findIndex(s => s.classList.contains('active'));
    if (activeIndex === -1) return;

    if (swipeDistance < 0) {
      // Swiped Left -> Next media
      let nextIndex = activeIndex;
      // Find the next slot that is NOT a placeholder (or has media)
      for (let i = 1; i < slots.length; i++) {
        const idx = (activeIndex + i) % slots.length;
        if (!slots[idx].classList.contains('placeholder-icon') || slots[idx].id === 'pk-thumb-url' || slots[idx].classList.contains('has-video')) {
          nextIndex = idx;
          break;
        }
      }
      if (nextIndex !== activeIndex) {
        slots[nextIndex].click();
      }
    } else {
      // Swiped Right -> Previous media
      let prevIndex = activeIndex;
      for (let i = 1; i < slots.length; i++) {
        const idx = (activeIndex - i + slots.length) % slots.length;
        if (!slots[idx].classList.contains('placeholder-icon') || slots[idx].id === 'pk-thumb-url' || slots[idx].classList.contains('has-video')) {
          prevIndex = idx;
          break;
        }
      }
      if (prevIndex !== activeIndex) {
        slots[prevIndex].click();
      }
    }
  }

  // Delete current active slot media
  if (mainDeleteBtn) {
    mainDeleteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();

      if (!currentProduct) return;
      const activeSlot = document.querySelector('.pk-thumb-slot.active');
      if (!activeSlot) return;

      const slotName = activeSlot.dataset.slot;
      if (!confirm(`Are you sure you want to delete the media in this slot?`)) return;

      saveProductField(currentProduct.name, slotName, '');
      currentProduct[slotName] = '';

      showToast('🗑️ Media deleted successfully!');
      
      // Update UI thumbnails & display
      openDetailModal(currentProduct.name, originalFallbackImg, currentProduct.category);
    });
  }

  // Tab Header switching
  document.querySelectorAll('.pk-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pk-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pk-tab-content').forEach(c => c.classList.remove('active'));

      this.classList.add('active');
      const tabName = this.dataset.tab;
      document.getElementById('pk-tab-' + tabName).classList.add('active');
    });
  });

  // Cart click action
  cartBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const title = currentProduct.name;
    const priceText = currentProduct.price ? '₹' + currentProduct.price : 'Ask Price';
    const img = currentProduct.url;

    if (window.pkIsInCart && window.pkIsInCart(title)) {
      if (window.pkRemoveFromCart) window.pkRemoveFromCart(title);
    } else {
      if (window.pkAddToCart) window.pkAddToCart(title, priceText, img);
    }
    updateActionButtons();
    if (window.updateProductCardStatus) window.updateProductCardStatus();
  });

  // Wishlist click action
  wishlistBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const title = currentProduct.name;
    const priceText = currentProduct.price ? '₹' + currentProduct.price : 'Ask Price';
    const img = currentProduct.url;

    if (window.pkIsInWishlist && window.pkIsInWishlist(title)) {
      if (window.pkRemoveFromWishlist) window.pkRemoveFromWishlist(title);
    } else {
      if (window.pkAddToWishlist) window.pkAddToWishlist(title, priceText, img);
    }
    updateActionButtons();
    if (window.updateProductCardStatus) window.updateProductCardStatus();
  });

  /* ───────────────────────────── ADMIN CONFIGS ────────────────── */
  
  // Media slots uploads
  document.querySelectorAll('.pk-thumb-admin-upload').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      e.preventDefault();

      const slot = this.parentElement.dataset.slot;
      const type = this.parentElement.dataset.type;

      if (type === 'image') {
        const key = localStorage.getItem('pk_imgbb_key') || 'f8c12c3f56c637bbf020ca4ddaedc221';
        const file = await pickFile('image/*');
        if (!file) return;

        const origHtml = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
          const b64 = await toBase64(file);
          const fd = new FormData();
          fd.append('key', key);
          fd.append('image', b64.split(',')[1]);
          fd.append('name', 'slot-' + slot + '-' + currentProduct.name.replace(/\s+/g, '-'));

          const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
          const data = await res.json();

          if (data.success && data.data?.url) {
            const url = data.data.display_url || data.data.url;
            saveProductField(currentProduct.name, slot, url);
            currentProduct[slot] = url;

            // Update UI thumbnail & main display
            const img = this.parentElement.querySelector('img');
            img.src = url;
            img.style.display = 'block';
            this.parentElement.classList.remove('placeholder-icon');

            mainVideo.style.display = 'none';
            mainVideo.pause();
            mainImg.style.display = 'block';
            mainImg.src = url;

            document.querySelectorAll('.pk-thumb-slot').forEach(s => s.classList.remove('active'));
            this.parentElement.classList.add('active');

            showToast('✅ Image uploaded successfully!');
          } else {
            alert('Upload failed: ' + (data.error?.message || 'Unknown error'));
          }
        } catch(err) {
          alert('Error: ' + err.message);
        } finally {
          this.innerHTML = origHtml;
        }
      } else if (type === 'video') {
        const choice = await customPrompt('Configure Video', '', 'Enter Video URL (MP4 link, YouTube embedded url, etc.) OR type "upload" to load a small mp4 file:');
        if (choice === null) return;

        if (choice.toLowerCase() === 'upload') {
          const file = await pickFile('video/*');
          if (!file) return;

          const sizeLimit = 4 * 1024 * 1024; // 4MB Limit for base64 storage
          if (file.size > sizeLimit) {
            alert('Video file is too large! Please upload a file smaller than 4MB or paste a video URL.');
            return;
          }

          const origHtml = this.innerHTML;
          this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

          try {
            const b64 = await toBase64(file);
            saveProductField(currentProduct.name, 'video', b64);
            currentProduct.video = b64;

            this.parentElement.classList.add('has-video');
            this.parentElement.classList.remove('placeholder-icon');

            mainImg.style.display = 'none';
            mainVideo.style.display = 'block';
            mainVideo.src = b64;
            mainVideo.play().catch(err => console.log('Autoplay prevented:', err));

            document.querySelectorAll('.pk-thumb-slot').forEach(s => s.classList.remove('active'));
            this.parentElement.classList.add('active');

            showToast('✅ Video saved successfully!');
          } catch(err) {
            alert('Error loading video file: ' + err.message);
          } finally {
            this.innerHTML = origHtml;
          }
        } else if (choice.trim()) {
          const url = choice.trim();
          saveProductField(currentProduct.name, 'video', url);
          currentProduct.video = url;

          this.parentElement.classList.add('has-video');
          this.parentElement.classList.remove('placeholder-icon');

          mainImg.style.display = 'none';
          mainVideo.style.display = 'block';
          mainVideo.src = url;
          mainVideo.play().catch(err => console.log('Autoplay prevented:', err));

          document.querySelectorAll('.pk-thumb-slot').forEach(s => s.classList.remove('active'));
          this.parentElement.classList.add('active');

          showToast('✅ Video URL saved!');
        }
      }
    });
  });

  // Edit Title
  adminEditTitleBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    editTitleInput.value = currentProduct.name;
    titleDisplayBox.style.display = 'none';
    titleEditBox.style.display = 'flex';
    editTitleInput.focus();
  });

  cancelTitleBtn.addEventListener('click', function () {
    titleEditBox.style.display = 'none';
    titleDisplayBox.style.display = 'flex';
  });

  saveTitleBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const newName = editTitleInput.value.trim();
    if (!newName) {
      alert('Product name cannot be empty.');
      return;
    }
    updateProductInfo(newName, currentProduct.price);
  });

  // Edit Price
  adminEditPriceBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    editPriceInput.value = currentProduct.price || '';
    priceDisplayBox.style.display = 'none';
    priceEditBox.style.display = 'flex';
    editPriceInput.focus();
  });

  cancelPriceBtn.addEventListener('click', function () {
    priceEditBox.style.display = 'none';
    priceDisplayBox.style.display = 'flex';
  });

  savePriceBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const newPrice = editPriceInput.value.trim();
    updateProductInfo(currentProduct.name, newPrice);
  });

  function updateProductInfo(newName, newPrice) {
    try {
      const oldName = currentProduct.name;
      const products = JSON.parse(localStorage.getItem(SK) || '[]');
      let p = products.find(x => x.name && x.name.toLowerCase().trim() === oldName.toLowerCase().trim());
      if (!p) {
        p = { id: 'static-' + Date.now(), name: oldName, category: currentProduct.category || 'Home Appliances', url: currentProduct.url, at: Date.now() };
        products.push(p);
      }
      
      // Update in products array
      p.name = newName;
      p.price = newPrice;
      localStorage.setItem(SK, JSON.stringify(products));

      // Sync local current object
      currentProduct.name = newName;
      currentProduct.price = newPrice;

      // Update modal UI
      titleEl.textContent = newName;
      if (newPrice) {
        const priceVal = parseInt(newPrice.toString().replace(/[^0-9]/g, ''));
        priceCurrent.textContent = '₹' + priceVal.toLocaleString('en-IN');
        const mrp = Math.ceil(priceVal * 1.35 / 100) * 100;
        priceOld.textContent = '₹' + mrp.toLocaleString('en-IN');
        priceOld.style.display = 'inline';
        priceDiscount.textContent = '(25% OFF)';
        priceDiscount.style.display = 'inline';
      } else {
        priceCurrent.textContent = 'Price on Request';
        priceOld.style.display = 'none';
        priceDiscount.style.display = 'none';
      }

      titleEditBox.style.display = 'none';
      titleDisplayBox.style.display = 'flex';
      priceEditBox.style.display = 'none';
      priceDisplayBox.style.display = 'flex';

      dispatchRefresh();
      showToast('✅ Product details updated!');
    } catch(e) {
      console.error(e);
      alert('Error updating product info: ' + e.message);
    }
  }

  // Edit Specifications
  adminEditSpecs.addEventListener('click', function () {
    if (!currentProduct) return;
    const currentSpecs = currentProduct.specs || `Brand: Peekey\nCategory: ${currentProduct.category || 'Appliances'}\nWarranty: 1 Year\nAvailability: In Stock`;
    editSpecsInput.value = currentSpecs;
    specsTable.style.display = 'none';
    editSpecsInput.style.display = 'block';
    adminEditSpecs.style.display = 'none';
    saveSpecsBtn.style.display = 'inline-flex';
    cancelSpecsBtn.style.display = 'inline-flex';
    editSpecsInput.focus();
  });

  cancelSpecsBtn.addEventListener('click', function () {
    editSpecsInput.style.display = 'none';
    specsTable.style.display = 'table';
    adminEditSpecs.style.display = 'inline-flex';
    saveSpecsBtn.style.display = 'none';
    cancelSpecsBtn.style.display = 'none';
  });

  saveSpecsBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const newSpecs = editSpecsInput.value.trim();
    saveProductField(currentProduct.name, 'specs', newSpecs);
    currentProduct.specs = newSpecs;
    renderSpecs(currentProduct);
    
    editSpecsInput.style.display = 'none';
    specsTable.style.display = 'table';
    adminEditSpecs.style.display = 'inline-flex';
    saveSpecsBtn.style.display = 'none';
    cancelSpecsBtn.style.display = 'none';
    showToast('✅ Specifications updated!');
  });

  // Edit Description
  adminEditDesc.addEventListener('click', function () {
    if (!currentProduct) return;
    const currentDesc = currentProduct.description || `Premium quality ${currentProduct.name || 'product'} from Peekey. Sourced from top-tier manufacturers.`;
    editDescInput.value = currentDesc;
    descText.style.display = 'none';
    editDescInput.style.display = 'block';
    adminEditDesc.style.display = 'none';
    saveDescBtn.style.display = 'inline-flex';
    cancelDescBtn.style.display = 'inline-flex';
    editDescInput.focus();
  });

  cancelDescBtn.addEventListener('click', function () {
    editDescInput.style.display = 'none';
    descText.style.display = 'block';
    adminEditDesc.style.display = 'inline-flex';
    saveDescBtn.style.display = 'none';
    cancelDescBtn.style.display = 'none';
  });

  saveDescBtn.addEventListener('click', function () {
    if (!currentProduct) return;
    const newDesc = editDescInput.value.trim();
    saveProductField(currentProduct.name, 'description', newDesc);
    currentProduct.description = newDesc;
    renderDescription(currentProduct);
    
    editDescInput.style.display = 'none';
    descText.style.display = 'block';
    adminEditDesc.style.display = 'inline-flex';
    saveDescBtn.style.display = 'none';
    cancelDescBtn.style.display = 'none';
    showToast('✅ Description updated!');
  });

  /* ───────────────────────────── EVENT DELEGATION ───────────────── */
  document.addEventListener('click', function (e) {
    // Check if clicked inside a product card or shelf item
    const card = e.target.closest('.shelf-item, .product-card-exact');
    const isActionButton = e.target.closest('.wishlist-btn-exact, .cart-btn-exact, .shelf-actions, .shelf-wishlist-btn, .shelf-cart-btn');

    if (isActionButton) return; // Cart/wishlist buttons handle themselves
    if (e.target.closest('.cat-card-exact')) return; // Ignore category cards here

    if (card) {
      e.stopPropagation();
      e.preventDefault();

      const name = card.querySelector('.item-name, .product-title-exact')?.textContent?.trim() || '';
      const img = card.querySelector('img')?.src || '';
      const cat = card.getAttribute('data-category') || '';

      openDetailModal(name, img, cat);
    }
  }, true);

})();
