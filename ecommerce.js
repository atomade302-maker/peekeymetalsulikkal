// PEEKEY Fully Functioning E-commerce Logic
document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    let cart = JSON.parse(localStorage.getItem('peekey_cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('peekey_wishlist')) || [];

    // --- UI Elements ---
    const cartBadge = document.querySelector('.cart-icon-wrapper .badge') || document.querySelector('.cart-badge');
    const wishlistActionItem = Array.from(document.querySelectorAll('.ts-action-item')).find(el => el.innerText.includes('Wishlist'));
    
    // Add wishlist badge if not exists
    let wishlistBadge;
    if (wishlistActionItem) {
        wishlistBadge = wishlistActionItem.querySelector('.badge');
        if (!wishlistBadge) {
            wishlistActionItem.style.position = 'relative';
            wishlistBadge = document.createElement('span');
            wishlistBadge.className = 'badge';
            wishlistBadge.style.cssText = 'position: absolute; top: -5px; right: -10px; background: var(--red); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; font-weight: bold;';
            wishlistActionItem.appendChild(wishlistBadge);
        }
    }

    // --- Modals HTML ---
    const modalsHTML = `
        <!-- E-commerce Modals -->
        <div id="cart-modal" class="modal-overlay ecommerce-modal">
            <div class="modal-box ecom-modal-box">
                <button class="close-modal-btn ecom-close-btn" data-target="#cart-modal"><i class="fas fa-times"></i></button>
                <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
                <div class="ecom-items-list" id="cart-items-container"></div>
                <div class="ecom-total">Total: <span id="cart-total-price">₹0</span></div>
                <button class="btn btn-green w-100" id="checkout-btn">Proceed to Checkout</button>
            </div>
        </div>

        <div id="wishlist-modal" class="modal-overlay ecommerce-modal">
            <div class="modal-box ecom-modal-box">
                <button class="close-modal-btn ecom-close-btn" data-target="#wishlist-modal"><i class="fas fa-times"></i></button>
                <h2><i class="fas fa-heart" style="color:var(--red);"></i> Your Wishlist</h2>
                <div class="ecom-items-list" id="wishlist-items-container"></div>
            </div>
        </div>

        <div id="track-order-modal" class="modal-overlay ecommerce-modal">
            <div class="modal-box ecom-modal-box">
                <button class="close-modal-btn ecom-close-btn" data-target="#track-order-modal"><i class="fas fa-times"></i></button>
                <h2><i class="fas fa-truck"></i> Track Order</h2>
                <div class="form-group" style="margin-top:20px;">
                    <label>Order ID or Phone Number</label>
                    <input type="text" id="track-input" placeholder="e.g. PK-10045">
                </div>
                <button class="btn btn-primary w-100" id="track-btn" style="background:#111;color:#fff;">Track</button>
                <div id="track-result" style="margin-top:20px; font-weight:bold; text-align:center; display:none; padding:15px; border-radius:8px; background:#f5f5f5;"></div>
            </div>
        </div>

        <div id="ecom-checkout-modal" class="modal-overlay ecommerce-modal">
            <div class="modal-box ecom-modal-box" style="max-width: 450px;">
                <button class="close-modal-btn ecom-close-btn" data-target="#ecom-checkout-modal"><i class="fas fa-times"></i></button>
                <h2><i class="fab fa-whatsapp" style="color:var(--green)"></i> Checkout via WhatsApp</h2>
                <p style="font-size:0.85rem; color:#666; margin-top:5px; margin-bottom:15px;">Please fill in your delivery details to place your order.</p>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:0.8rem; font-weight:700; color:#444; display:block; margin-bottom:4px;">Full Name</label>
                        <input type="text" id="modal-checkout-name" placeholder="Enter your full name" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:0.9rem; font-family:inherit;">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:0.8rem; font-weight:700; color:#444; display:block; margin-bottom:4px;">WhatsApp Phone Number</label>
                        <input type="text" id="modal-checkout-phone" placeholder="Enter phone number" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:0.9rem; font-family:inherit;">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:0.8rem; font-weight:700; color:#444; display:block; margin-bottom:4px;">Delivery Address</label>
                        <textarea id="modal-checkout-address" placeholder="Enter full delivery address with pincode" rows="3" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:0.9rem; resize:vertical; font-family:inherit;"></textarea>
                    </div>
                    <!-- Hidden fields for single vs multi checkout -->
                    <input type="hidden" id="checkout-type" value="all">
                    <input type="hidden" id="checkout-single-title" value="">
                    <input type="hidden" id="checkout-single-price" value="">
                    
                    <button class="btn btn-green w-100" id="modal-confirm-checkout-btn" style="margin-top:10px; font-weight:700; background:var(--green); color:#fff; border:none; padding:12px; border-radius:8px; cursor:pointer;"><i class="fab fa-whatsapp"></i> Confirm & Send Order</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    // --- CSS for Modals ---
    const ecomStyles = `
        <style>
            .ecommerce-modal { z-index: 10000; }
            .ecom-modal-box { max-height: 90vh; display: flex; flex-direction: column; }
            .ecom-items-list { overflow-y: auto; max-height: 400px; margin: 20px 0; padding-right: 10px; }
            .ecom-item { display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee; }
            .ecom-item img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; background: #f9f9f9; padding: 5px; }
            .ecom-item-details { flex: 1; }
            .ecom-item-title { font-weight: 700; font-size: 0.95rem; color: #222; margin-bottom: 5px; }
            .ecom-item-price { font-weight: 800; color: var(--red); font-size: 1.1rem; }
            .ecom-remove-btn { color: #999; background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: 0.3s; }
            .ecom-remove-btn:hover { color: var(--red); }
            .ecom-total { font-size: 1.3rem; font-weight: 800; text-align: right; margin-bottom: 15px; border-top: 2px solid #eee; padding-top: 15px; }
            .empty-state { text-align: center; color: #888; padding: 40px 0; font-weight: 600; }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', ecomStyles);

    // --- Functions ---
    function updateBadges() {
        if (cartBadge) cartBadge.innerText = cart.length;
        if (wishlistBadge) wishlistBadge.innerText = wishlist.length;
        
        // Synchronize mobile bottom nav badges
        const mobCartBadge = document.getElementById('mob-cart-badge');
        const mobWishlistBadge = document.getElementById('mob-wishlist-badge');
        if (mobCartBadge) mobCartBadge.innerText = cart.length;
        if (mobWishlistBadge) mobWishlistBadge.innerText = wishlist.length;
    }

    function saveState() {
        localStorage.setItem('peekey_cart', JSON.stringify(cart));
        localStorage.setItem('peekey_wishlist', JSON.stringify(wishlist));
        updateBadges();
        renderCart();
        renderWishlist();
        renderPageCart();
        renderPageWishlist();
        updateProductCardStatus();
    }

    window.pkAddToCart = function(title, price, img) {
        if (cart.some(item => item.title === title)) return;
        cart.push({ title, price, img });
        saveState();
        showToast('Added to Cart!');
    };
    
    window.pkRemoveFromCart = function(title) {
        const index = cart.findIndex(item => item.title === title);
        if (index !== -1) {
            cart.splice(index, 1);
            saveState();
            showToast('Removed from Cart!', 'info');
        }
    };
    
    window.pkAddToWishlist = function(title, price, img) {
        if (wishlist.some(item => item.title === title)) return;
        wishlist.push({ title, price, img });
        saveState();
        showToast('Added to Wishlist!', 'wishlist');
    };
    
    window.pkRemoveFromWishlist = function(title) {
        const index = wishlist.findIndex(item => item.title === title);
        if (index !== -1) {
            wishlist.splice(index, 1);
            saveState();
            showToast('Removed from Wishlist!', 'info');
        }
    };
    
    window.pkIsInCart = function(title) {
        return cart.some(item => item.title === title);
    };
    
    window.pkIsInWishlist = function(title) {
        return wishlist.some(item => item.title === title);
    };

    window.updateProductCardStatus = function() {
        // 1. Best Sellers product cards
        document.querySelectorAll('.product-card-exact').forEach(card => {
            const titleEl = card.querySelector('.product-title-exact');
            if (!titleEl) return;
            const title = titleEl.innerText.trim();
            
            const cartBtn = card.querySelector('.cart-btn-exact');
            const wishlistBtn = card.querySelector('.wishlist-btn-exact');
            
            // Check if in cart
            const inCart = cart.some(item => item.title === title);
            if (cartBtn) {
                if (inCart) {
                    cartBtn.classList.add('active');
                    cartBtn.style.background = 'var(--red)';
                    cartBtn.style.color = '#fff';
                } else {
                    cartBtn.classList.remove('active');
                    cartBtn.style.background = '';
                    cartBtn.style.color = '';
                }
            }
            
            // Check if in wishlist
            const inWishlist = wishlist.some(item => item.title === title);
            if (wishlistBtn) {
                wishlistBtn.onmouseover = null;
                wishlistBtn.onmouseout = null;
                
                const icon = wishlistBtn.querySelector('i');
                if (inWishlist) {
                    wishlistBtn.classList.add('active');
                    wishlistBtn.style.background = 'var(--red)';
                    wishlistBtn.style.color = '#fff';
                    wishlistBtn.style.borderColor = 'var(--red)';
                    if (icon) {
                        icon.className = 'fas fa-heart';
                    }
                } else {
                    wishlistBtn.classList.remove('active');
                    wishlistBtn.style.background = '#fff';
                    wishlistBtn.style.color = '#ad1f35';
                    wishlistBtn.style.borderColor = '#ccc';
                    if (icon) {
                        icon.className = 'far fa-heart';
                    }
                }
            }
        });

        // 2. Shelf Items (Catalog) product cards
        document.querySelectorAll('.shelf-item').forEach(card => {
            const title = card.getAttribute('data-name') || card.querySelector('.item-name')?.innerText || '';
            if (!title) return;
            
            const cartBtn = card.querySelector('.shelf-cart-btn');
            const wishlistBtn = card.querySelector('.shelf-wishlist-btn');
            
            // Check if in cart
            const inCart = cart.some(item => item.title === title);
            if (cartBtn) {
                if (inCart) {
                    cartBtn.classList.add('active');
                    cartBtn.style.background = 'var(--red)';
                    cartBtn.style.color = '#fff';
                    cartBtn.style.borderColor = 'var(--red)';
                } else {
                    cartBtn.classList.remove('active');
                    cartBtn.style.background = '';
                    cartBtn.style.color = '';
                    cartBtn.style.borderColor = '';
                }
            }
            
            // Check if in wishlist
            const inWishlist = wishlist.some(item => item.title === title);
            if (wishlistBtn) {
                const icon = wishlistBtn.querySelector('i');
                if (inWishlist) {
                    wishlistBtn.classList.add('active');
                    wishlistBtn.style.background = 'var(--red)';
                    wishlistBtn.style.color = '#fff';
                    wishlistBtn.style.borderColor = 'var(--red)';
                    if (icon) {
                        icon.className = 'fas fa-heart';
                    }
                } else {
                    wishlistBtn.classList.remove('active');
                    wishlistBtn.style.background = '';
                    wishlistBtn.style.color = '';
                    wishlistBtn.style.borderColor = '';
                    if (icon) {
                        icon.className = 'far fa-heart';
                    }
                }
            }
        });
    }

    function showToast(msg, type='success') {
        const tc = document.querySelector('.toast-container');
        if(tc) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            let icon = '<i class="fas fa-check-circle"></i>';
            if (type === 'wishlist') {
                icon = '<i class="fas fa-heart"></i>';
            } else if (type === 'info') {
                icon = '<i class="fas fa-info-circle"></i>';
            }
            toast.innerHTML = `${icon} <span>${msg}</span>`;
            tc.appendChild(toast);
            toast.offsetHeight;
            toast.classList.add('active');
            setTimeout(() => { toast.classList.remove('active'); setTimeout(() => toast.remove(), 350); }, 3000);
        } else {
            alert(msg);
        }
    }

    function renderCart() {
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total-price');
        
        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
            totalEl.innerText = '₹0';
            return;
        }

        let total = 0;
        container.innerHTML = cart.map((item, index) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            total += price;
            return `
                <div class="ecom-item">
                    <img src="${item.img}" alt="">
                    <div class="ecom-item-details">
                        <div class="ecom-item-title">${item.title}</div>
                        ${item.price ? `<div class="ecom-item-price">${item.price}</div>` : ''}
                    </div>
                    <button class="ecom-remove-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }).join('');
        totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        saveState();
        renderCart();
    }

    function renderWishlist() {
        const container = document.getElementById('wishlist-items-container');
        if (wishlist.length === 0) {
            container.innerHTML = '<div class="empty-state">Your wishlist is empty.</div>';
            return;
        }

        container.innerHTML = wishlist.map((item, index) => {
            return `
                <div class="ecom-item">
                    <img src="${item.img}" alt="">
                    <div class="ecom-item-details">
                        <div class="ecom-item-title">${item.title}</div>
                        ${item.price ? `<div class="ecom-item-price">${item.price}</div>` : ''}
                    </div>
                    <button class="btn btn-green" onclick="moveWishlistToCart(${index})" style="padding:5px 10px; font-size:0.8rem;">Add to Cart</button>
                    <button class="ecom-remove-btn" onclick="removeFromWishlist(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }).join('');
    }

    window.removeFromWishlist = function(index) {
        wishlist.splice(index, 1);
        saveState();
        renderWishlist();
    }

    window.moveWishlistToCart = function(index) {
        const item = wishlist[index];
        if (cart.some(i => i.title === item.title)) {
            showToast('Already in Cart!', 'info');
            return;
        }
        cart.push(item);
        wishlist.splice(index, 1);
        saveState();
        renderWishlist();
        showToast('Moved to Cart!');
    }

    function renderPageCart() {
        const container = document.getElementById('page-cart-items');
        const totalEl = document.getElementById('page-cart-total');
        const summaryBox = document.getElementById('page-cart-summary');
        const countEl = document.getElementById('page-cart-count');
        
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-state" style="text-align: center; color: #888; padding: 40px 0; font-weight: 600;">Your cart is empty. Start shopping now!</div>';
            if (totalEl) totalEl.innerText = '₹0';
            if (summaryBox) summaryBox.style.display = 'none';
            if (countEl) countEl.innerText = '0';
            return;
        }

        let total = 0;
        container.innerHTML = cart.map((item, index) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            total += price;
            return `
                <div class="page-cart-item" style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                    <img src="${item.img}" alt="${item.title}" style="width:50px; height:50px; object-fit:contain; border-radius:8px; border:1px solid #f1f5f9; padding:3px; background:#fff; flex-shrink:0;">
                    <div style="flex:1; min-width:0;">
                        <h4 style="font-size:0.85rem; font-weight:700; color:#1e293b; margin:0 0 2px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.title}">${item.title}</h4>
                        <div style="font-size:0.95rem; font-weight:800; color:var(--red);">${item.price || ''}</div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                        <button class="btn-buy-single" onclick="quickBuyItem(${index})" style="background:var(--green); color:#fff; border:none; border-radius:6px; padding:6px 10px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:3px; transition:0.2s;"><i class="fab fa-whatsapp"></i> Buy</button>
                        <button onclick="removeFromCart(${index})" style="background:#f1f5f9; color:#64748b; border:none; border-radius:6px; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;"><i class="fas fa-trash" style="font-size:0.75rem;"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        if (totalEl) totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
        if (summaryBox) summaryBox.style.display = 'block';
        if (countEl) countEl.innerText = cart.length;
    }

    function renderPageWishlist() {
        const container = document.getElementById('page-wishlist-items');
        const countEl = document.getElementById('page-wishlist-count');
        
        if (!container) return;

        if (wishlist.length === 0) {
            container.innerHTML = '<div class="empty-state" style="text-align: center; color: #888; padding: 40px 0; font-weight: 600;">Your wishlist is empty.</div>';
            if (countEl) countEl.innerText = '0';
            return;
        }

        container.innerHTML = wishlist.map((item, index) => {
            return `
                <div class="page-wishlist-item" style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                    <img src="${item.img}" alt="${item.title}" style="width:50px; height:50px; object-fit:contain; border-radius:8px; border:1px solid #f1f5f9; padding:3px; background:#fff; flex-shrink:0;">
                    <div style="flex:1; min-width:0;">
                        <h4 style="font-size:0.85rem; font-weight:700; color:#1e293b; margin:0 0 2px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.title}">${item.title}</h4>
                        <div style="font-size:0.95rem; font-weight:800; color:var(--red);">${item.price || ''}</div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                        <button onclick="moveWishlistToCart(${index})" style="background:var(--red-light); color:var(--red); border:none; border-radius:6px; padding:6px 10px; font-size:0.75rem; font-weight:700; cursor:pointer; transition:0.2s;">Add to Cart</button>
                        <button onclick="removeFromWishlist(${index})" style="background:#f1f5f9; color:#64748b; border:none; border-radius:6px; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:0.2s;"><i class="fas fa-trash" style="font-size:0.75rem;"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        if (countEl) countEl.innerText = wishlist.length;
    }

    window.quickBuyItem = function(index) {
        const item = cart[index];
        if (!item) return;
        
        const typeInput = document.getElementById('checkout-type');
        const titleInput = document.getElementById('checkout-single-title');
        const priceInput = document.getElementById('checkout-single-price');
        
        if (typeInput) typeInput.value = 'single';
        if (titleInput) titleInput.value = item.title;
        if (priceInput) priceInput.value = item.price;
        
        openModal('ecom-checkout-modal');
    };

    // --- Event Listeners for Adding ---

    // 1. Add/Remove Cart (Best Sellers) — toggle on re-click
    document.querySelectorAll('.cart-btn-exact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = this.closest('.product-card-exact');
            const title = card.querySelector('.product-title-exact').innerText;
            const index = cart.findIndex(i => i.title === title);
            if (index !== -1) {
                cart.splice(index, 1);
                saveState();
                showToast('Removed from Cart!', 'info');
                return;
            }
            const priceEl = card.querySelector('.current');
            const item = {
                title: title,
                price: priceEl ? priceEl.innerText.trim() : '',
                img: card.querySelector('img').src
            };
            cart.push(item);
            saveState();
            showToast('Added to Cart!');
        });
    });

    
    // 1b. Add/Remove Wishlist (Best Sellers)
    document.querySelectorAll('.wishlist-btn-exact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = this.closest('.product-card-exact');
            const title = card.querySelector('.product-title-exact').innerText;
            const index = wishlist.findIndex(i => i.title === title);
            if (index !== -1) {
                wishlist.splice(index, 1);
                saveState();
                showToast('Removed from Wishlist!', 'info');
                return;
            }
            const priceEl2 = card.querySelector('.current');
            const item = {
                title: title,
                price: priceEl2 ? priceEl2.innerText.trim() : '',
                img: card.querySelector('img').src
            };
            wishlist.push(item);
            saveState();
            showToast('Added to Wishlist!', 'wishlist');
        });
    });

    // 2. Add to Cart / Wishlist (Shelf Items) using event delegation
    document.addEventListener('click', function(e) {
        const cartBtn = e.target.closest('.shelf-cart-btn');
        if (cartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const card = cartBtn.closest('.shelf-item');
            if (card) {
                const title = card.getAttribute('data-name') || card.querySelector('.item-name')?.innerText || '';
                const index = cart.findIndex(i => i.title === title);
                if (index !== -1) {
                    cart.splice(index, 1);
                    saveState();
                    showToast('Removed from Cart!', 'info');
                    return;
                }
                const priceEl = card.querySelector('.item-price');
                const price = priceEl ? priceEl.innerText : 'Ask Price';
                const img = card.querySelector('img')?.src || '';
                cart.push({ title, price, img });
                saveState();
                showToast('Added to Cart!');
            }
            return;
        }

        const wishlistBtn = e.target.closest('.shelf-wishlist-btn');
        if (wishlistBtn) {
            e.preventDefault();
            e.stopPropagation();
            const card = wishlistBtn.closest('.shelf-item');
            if (card) {
                const title = card.getAttribute('data-name') || card.querySelector('.item-name')?.innerText || '';
                const index = wishlist.findIndex(i => i.title === title);
                if (index !== -1) {
                    wishlist.splice(index, 1);
                    saveState();
                    showToast('Removed from Wishlist!', 'info');
                    return;
                }
                const priceEl = card.querySelector('.item-price');
                const price = priceEl ? priceEl.innerText : 'Ask Price';
                const img = card.querySelector('img')?.src || '';
                wishlist.push({ title, price, img });
                saveState();
                showToast('Added to Wishlist!', 'wishlist');
            }
            return;
        }
    });

    // --- Modal Toggles ---
    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }
    
    document.querySelectorAll('.ecom-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector(this.getAttribute('data-target')).classList.remove('active');
        });
    });

    // Header & Footer Links
    document.querySelectorAll('a, .ts-action-item').forEach(el => {
        const text = el.innerText.trim().toLowerCase();
        if (text.includes('cart') && el.classList.contains('cart-btn')) {
            el.addEventListener('click', (e) => { e.preventDefault(); renderCart(); openModal('cart-modal'); });
        } else if (text.includes('wishlist')) {
            el.addEventListener('click', (e) => { e.preventDefault(); renderWishlist(); openModal('wishlist-modal'); });
        } else if (text.includes('track order')) {
            el.addEventListener('click', (e) => { e.preventDefault(); openModal('track-order-modal'); });
        }
    });

    // Track Order Logic
    document.getElementById('track-btn').addEventListener('click', () => {
        const val = document.getElementById('track-input').value.trim();
        const res = document.getElementById('track-result');
        res.style.display = 'block';
        if (!val) {
            res.innerText = 'Please enter an Order ID.';
            res.style.color = 'var(--red)';
        } else {
            res.innerHTML = '<span style="color:var(--green)">Order Found!</span><br>Status: Processing & Packing.<br>Estimated Delivery: 3-5 Business Days.';
            res.style.color = '#333';
        }
    });

    // Checkout Logic
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        
        // Close cart modal
        document.getElementById('cart-modal').classList.remove('active');
        
        // Setup checkout modal for ALL items
        const typeInput = document.getElementById('checkout-type');
        if (typeInput) typeInput.value = 'all';
        
        // Open checkout modal
        openModal('ecom-checkout-modal');
    });

    // Modal Confirm Checkout Button Action
    const modalConfirmCheckoutBtn = document.getElementById('modal-confirm-checkout-btn');
    if (modalConfirmCheckoutBtn) {
        modalConfirmCheckoutBtn.addEventListener('click', () => {
            const name = document.getElementById('modal-checkout-name').value.trim();
            const phone = document.getElementById('modal-checkout-phone').value.trim();
            const address = document.getElementById('modal-checkout-address').value.trim();
            
            if (!name || !phone || !address) {
                alert('Please fill in all delivery details.');
                return;
            }
            
            const type = document.getElementById('checkout-type').value;
            let waText = '';
            
            if (type === 'single') {
                const title = document.getElementById('checkout-single-title').value;
                const price = document.getElementById('checkout-single-price').value;
                
                waText = `*NEW ORDER FROM PEEKEY WEBSITE*\n\n` +
                         `*Customer Details:*\n` +
                         `Name: ${name}\n` +
                         `Phone: ${phone}\n` +
                         `Address: ${address}\n\n` +
                         `*Item Ordered:*\n1. *${title}* - ${price}\n\n` +
                         `*Total Amount:* ${price}\n\n` +
                         `Please confirm my order. Thank you!`;
            } else {
                let itemsText = cart.map((item, idx) => `${idx + 1}. *${item.title}* - ${item.price}`).join('\n');
                let total = 0;
                cart.forEach(item => {
                    total += parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
                });
                
                waText = `*NEW ORDER FROM PEEKEY WEBSITE*\n\n` +
                         `*Customer Details:*\n` +
                         `Name: ${name}\n` +
                         `Phone: ${phone}\n` +
                         `Address: ${address}\n\n` +
                         `*Items Ordered:*\n${itemsText}\n\n` +
                         `*Total Amount:* ₹${total.toLocaleString('en-IN')}\n\n` +
                         `Please confirm my order. Thank you!`;
                
                // Clear cart
                cart = [];
                saveState();
            }
            
            const waNumber = '919495988211';
            const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);
            window.open(waUrl, '_blank');
            
            // Clear inputs
            document.getElementById('modal-checkout-name').value = '';
            document.getElementById('modal-checkout-phone').value = '';
            document.getElementById('modal-checkout-address').value = '';
            
            // Close modal
            document.getElementById('ecom-checkout-modal').classList.remove('active');
        });
    }

    // Page Cart Section Checkout Button Action
    const pageCheckoutBtn = document.getElementById('page-checkout-btn');
    if (pageCheckoutBtn) {
        pageCheckoutBtn.addEventListener('click', () => {
            const name = document.getElementById('checkout-name').value.trim();
            const phone = document.getElementById('checkout-phone').value.trim();
            const address = document.getElementById('checkout-address').value.trim();
            
            if (!name || !phone || !address) {
                alert('Please fill in your Name, Phone, and Delivery Address.');
                return;
            }
            
            let itemsText = cart.map((item, idx) => `${idx + 1}. *${item.title}* - ${item.price}`).join('\n');
            let total = 0;
            cart.forEach(item => {
                total += parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            });
            
            const waText = `*NEW ORDER FROM PEEKEY WEBSITE*\n\n` +
                           `*Customer Details:*\n` +
                           `Name: ${name}\n` +
                           `Phone: ${phone}\n` +
                           `Address: ${address}\n\n` +
                           `*Items Ordered:*\n${itemsText}\n\n` +
                           `*Total Amount:* ₹${total.toLocaleString('en-IN')}\n\n` +
                           `Please confirm my order. Thank you!`;
            
            const waNumber = '919495988211';
            const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);
            window.open(waUrl, '_blank');
            
            // Clear cart
            cart = [];
            saveState();
            
            // Clear form
            document.getElementById('checkout-name').value = '';
            document.getElementById('checkout-phone').value = '';
            document.getElementById('checkout-address').value = '';
        });
    }


    // --- 4. Interactive Search Bar Functionality ---
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    const searchBtn = document.querySelector('.search-wrapper-exact button, button[type="submit"]');
    const selectedCategoryText = document.getElementById('selected-category-text');
    const categoryDropdown = document.querySelector('.search-dropdown');
    const categoryDropdownMenu = document.querySelector('.search-dropdown-menu');

    // Category Selector Dropdown toggle
    if (categoryDropdown && categoryDropdownMenu) {
        categoryDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryDropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            categoryDropdownMenu.classList.remove('active');
        });

        categoryDropdownMenu.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                const catVal = li.getAttribute('data-value');
                selectedCategoryText.innerHTML = `${catVal} <i class="fas fa-chevron-down"></i>`;
                categoryDropdownMenu.classList.remove('active');
                if (searchInput) {
                    searchInput.placeholder = catVal === 'All Categories' 
                        ? 'Search for products, brands and more...' 
                        : `Search in ${catVal}...`;
                }
                performSearch();
            });
        });
    }

    // Levenshtein distance
    function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Fuzzy matching
    function fuzzyMatch(text, query) {
        text = text.toLowerCase().trim();
        query = query.toLowerCase().trim();
        if (!query) return true;
        if (text.includes(query)) return true;
        
        const textWords = text.split(/[\s,\-\/]+/);
        const queryWords = query.split(/[\s,\-\/]+/);
        
        return queryWords.every(qWord => {
            if (qWord.length <= 2) {
                return textWords.some(tWord => tWord.includes(qWord));
            }
            return textWords.some(tWord => {
                if (tWord.includes(qWord) || qWord.includes(tWord)) return true;
                const dist = levenshtein(tWord, qWord);
                const maxLen = Math.max(tWord.length, qWord.length);
                const similarity = 1 - dist / maxLen;
                const threshold = qWord.length <= 4 ? 0.5 : 0.7;
                return similarity >= threshold || (qWord.length > 4 && dist <= 1);
            });
        });
    }

    function performSearch() {
        if (!searchInput) return;
        const query = searchInput.value.trim().toLowerCase();
        const selectedCat = selectedCategoryText ? selectedCategoryText.innerText.replace(/\s*<i.*$/i, '').trim() : 'All Categories';
        
        // 1. Search in Best Sellers
        const productCards = document.querySelectorAll('.product-card-exact');
        let bestSellerCount = 0;
        productCards.forEach(card => {
            const title = card.querySelector('.product-title-exact').innerText;
            const cat = card.getAttribute('data-category');
            
            const matchesQuery = fuzzyMatch(title, query);
            const matchesCat = (selectedCat === 'All Categories' || cat === selectedCat);
            
            if (matchesQuery && matchesCat) {
                card.style.display = 'block';
                bestSellerCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 2. Search in Dynamic Shelf Products
        const shelfItems = document.querySelectorAll('.inventory-section:not(#cookers-collection-section) .shelf-item');
        let shelfCount = 0;
        shelfItems.forEach(item => {
            if (item.classList.contains('cooker-group-slot')) {
                if (query !== '') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'block';
                }
                return;
            }

            const name = item.getAttribute('data-name') || (item.querySelector('.item-name') ? item.querySelector('.item-name').innerText : '');
            const cat = item.getAttribute('data-category');
            
            const matchesQuery = fuzzyMatch(name, query);
            const matchesCat = (selectedCat === 'All Categories' || cat === selectedCat);
            
            if (matchesQuery && matchesCat) {
                if (item.classList.contains('cooker-item-hidden') && query === '') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'block';
                    shelfCount++;
                }
            } else {
                item.style.display = 'none';
            }
        });

        // Hide/Show dynamic sections depending on whether they contain visible products
        const sections = document.querySelectorAll('.inventory-section:not(#cookers-collection-section)');
        sections.forEach(section => {
            const visibleItems = section.querySelectorAll('.shelf-item:not([style*="display: none"])');
            const divider = section.nextElementSibling;
            
            if (visibleItems.length === 0 && query !== '') {
                section.style.display = 'none';
                if (divider && divider.classList.contains('section-divider')) {
                    divider.style.display = 'none';
                }
            } else {
                section.style.display = 'block';
                if (divider && divider.classList.contains('section-divider')) {
                    divider.style.display = 'block';
                }
            }
        });

        // Hide/Show Best Sellers Section if empty
        const bestSellersSec = document.getElementById('best-sellers');
        if (bestSellersSec) {
            const visibleCards = bestSellersSec.querySelectorAll('.product-card-exact:not([style*="display: none"])');
            if (visibleCards.length === 0 && query !== '') {
                bestSellersSec.style.display = 'none';
            } else {
                bestSellersSec.style.display = 'block';
            }
        }

        // 3. No Products Found Banner
        let banner = document.getElementById('pk-no-results');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'pk-no-results';
            banner.style.cssText = 'display:none;text-align:center;padding:60px 20px;font-family:"Outfit",sans-serif;color:#7a8099;font-size:1.05rem;';
            banner.innerHTML = '<i class="fas fa-search" style="font-size:2.5rem;color:#cbd5e1;display:block;margin-bottom:14px;"></i><strong style="color:#1a2035;font-size:1.2rem;">No products found</strong><p style="margin-top:8px;">Try a different keyword or category.</p>';
            const catalogAnchor = document.getElementById('catalog');
            if (catalogAnchor) catalogAnchor.after(banner);
        }

        if (query !== '' && bestSellerCount + shelfCount === 0) {
            if (banner) banner.style.display = 'block';
        } else {
            if (banner) banner.style.display = 'none';
        }

        // Scroll to Best Sellers or Catalog if a query was searched
        if (query !== '') {
            const targetSec = (bestSellerCount > 0) 
                ? document.getElementById('best-sellers') 
                : document.getElementById('catalog');
            if (targetSec && targetSec.style.display !== 'none') {
                targetSec.scrollIntoView({ behavior: 'smooth' });
            }
            showToast(`Found ${bestSellerCount + shelfCount} items matching "${query}"`, 'success');
        } else {
            showToast('Showing all products', 'success');
        }
    }
    // The interactive search listener has been migrated to the inline script in index.html and inventory.html
    // to properly handle category dropdown states, clear-box behavior (Escape), and no-results banners without conflicts.

    // Social links click handler for "Will be soon!"
    const socialSelectors = 'a[href*="facebook"], a[href*="twitter"], a[href*="youtube"], a[href*="instagram"], .social-icons a';
    document.querySelectorAll(socialSelectors).forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Will be soon!', 'info');
        });
    });

    // --- 5. Newsletter Subscription Functionality ---
    const newsletterInput = document.querySelector('.nl-right input[type="email"]');
    const newsletterBtn = document.querySelector('.nl-right button');

    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterInput.value.trim();
            if (!email) {
                showToast('Please enter an email address.', 'error');
            } else if (!email.includes('@') || !email.includes('.')) {
                showToast('Please enter a valid email address.', 'error');
            } else {
                showToast('Successfully subscribed to offers!', 'success');
                newsletterInput.value = '';
            }
        });
    }

    updateBadges();
    renderCart();
    renderWishlist();
    renderPageCart();
    renderPageWishlist();
    updateProductCardStatus();
});

    // --- Right Sidebar Logic ---
    const rightSidebar = document.getElementById('rightSidebar');
    const rightSidebarOverlay = document.getElementById('rightSidebarOverlay');
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    if (openSidebarBtn && rightSidebar) {
        function toggleSidebar() {
            rightSidebar.classList.toggle('active');
            rightSidebarOverlay.classList.toggle('active');
        }

        openSidebarBtn.addEventListener('click', toggleSidebar);
        closeSidebarBtn.addEventListener('click', toggleSidebar);
        rightSidebarOverlay.addEventListener('click', toggleSidebar);
        
        // Close sidebar when clicking a link
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                rightSidebar.classList.remove('active');
                rightSidebarOverlay.classList.remove('active');
            });
        });
    }
