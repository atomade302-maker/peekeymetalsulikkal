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
    }

    function saveState() {
        localStorage.setItem('peekey_cart', JSON.stringify(cart));
        localStorage.setItem('peekey_wishlist', JSON.stringify(wishlist));
        updateBadges();
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
                        <div class="ecom-item-price">${item.price}</div>
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
                        <div class="ecom-item-price">${item.price}</div>
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
        cart.push(item);
        wishlist.splice(index, 1);
        saveState();
        renderWishlist();
        showToast('Moved to Cart!');
    }

    // --- Event Listeners for Adding ---

    // 1. Add to Cart (Best Sellers)
    document.querySelectorAll('.cart-btn-exact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = this.closest('.product-card-exact');
            const item = {
                title: card.querySelector('.product-title-exact').innerText,
                price: card.querySelector('.current').innerText,
                img: card.querySelector('img').src
            };
            cart.push(item);
            saveState();
            showToast('Added to Cart!');
        });
    });

    
    // 1b. Add to Wishlist (Best Sellers)
    document.querySelectorAll('.wishlist-btn-exact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = this.closest('.product-card-exact');
            const item = {
                title: card.querySelector('.product-title-exact').innerText,
                price: card.querySelector('.current').innerText,
                img: card.querySelector('img').src
            };
            wishlist.push(item);
            saveState();
            showToast('Added to Wishlist!', 'wishlist');
        });
    });

    // 2. Add to Cart (Quick View/WA Modal) -> We override WA modal to act as quick inquiry, but let's add a "Add to Cart" button to shelf items too
    // Inject Add to Cart / Wishlist buttons on shelf items on hover
    document.querySelectorAll('.shelf-item').forEach(item => {
        // We will just capture clicks if they have explicit Add to Cart buttons.
        // If not, we will rely on the WA modal for shelf items.
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
        // Open WA Modal with checkout details
        let details = cart.map(i => i.title).join(', ');
        alert(`Proceeding to checkout with: ${details}. \nThis will redirect to the payment gateway.`);
        cart = [];
        saveState();
        document.getElementById('cart-modal').classList.remove('active');
    });


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
                const threshold = qWord.length <= 4 ? 0.5 : 0.6;
                return similarity >= threshold || dist <= 2;
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
        const shelfItems = document.querySelectorAll('.shelf-item');
        let shelfCount = 0;
        shelfItems.forEach(item => {
            const name = item.getAttribute('data-name') || (item.querySelector('.item-name') ? item.querySelector('.item-name').innerText : '');
            const cat = item.getAttribute('data-category');
            
            const matchesQuery = fuzzyMatch(name, query);
            const matchesCat = (selectedCat === 'All Categories' || cat === selectedCat);
            
            if (matchesQuery && matchesCat) {
                item.style.display = 'block';
                shelfCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Hide/Show dynamic sections depending on whether they contain visible products
        const sections = document.querySelectorAll('.inventory-section');
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

    if (searchInput) {
        // Search trigger on button click
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performSearch();
            });
        }

        // Search trigger on pressing 'Enter' key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

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
