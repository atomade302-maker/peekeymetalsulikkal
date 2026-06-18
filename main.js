// PEEKEY Premium Interactive Engine

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Sticky Header Effect ---
    const mainHeader = document.querySelector('.main-header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // --- 2. Live Toast Notification System ---
    // Ensure toast container exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' 
            ? '<i class="fas fa-check-circle"></i>' 
            : '<i class="fas fa-heart"></i>';
            
        toast.innerHTML = `${icon} <span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        // Trigger reflow for transition
        toast.offsetHeight;
        toast.classList.add('active');
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 350);
        }, 3000);
    }

    // --- 3. Cart & Wishlist Counter Updates ---
    const cartBadge = document.querySelector('.cart-badge');
    const wishlistBadge = document.querySelector('.header-actions .action-item:nth-child(2) .badge');
    
    let cartCount = parseInt(cartBadge.innerText) || 0;
    let wishlistCount = parseInt(wishlistBadge.innerText) || 0;

    // Add to Cart
    document.querySelectorAll('.add-to-cart, .product-actions button[title="Add to Cart"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            cartCount++;
            cartBadge.innerText = cartCount;
            
            // Try to find product title
            const productCard = this.closest('.product-card');
            const title = productCard ? productCard.querySelector('.product-title a').innerText : 'Product';
            
            showToast(`"${title}" added to your Cart!`, 'success');
        });
    });

    // Add to Wishlist
    document.querySelectorAll('.product-actions button[title="Add to Wishlist"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // Add to wishlist
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ad1f35';
                wishlistCount++;
                wishlistBadge.innerText = wishlistCount;
                
                const productCard = this.closest('.product-card');
                const title = productCard ? productCard.querySelector('.product-title a').innerText : 'Product';
                
                showToast(`"${title}" added to your Wishlist!`, 'wishlist');
            } else {
                // Remove from wishlist
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                wishlistCount = Math.max(0, wishlistCount - 1);
                wishlistBadge.innerText = wishlistCount;
                
                const productCard = this.closest('.product-card');
                const title = productCard ? productCard.querySelector('.product-title a').innerText : 'Product';
                
                showToast(`"${title}" removed from your Wishlist!`, 'wishlist');
            }
        });
    });

    // --- 4. Interactive Quick View Modal ---
    // Create modal element and append to body
    let modal = document.querySelector('.modal-overlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <button class="close-modal-btn" title="Close"><i class="fas fa-times"></i></button>
                <div class="modal-content-grid">
                    <div class="modal-img-container">
                        <img src="" alt="Product Image">
                    </div>
                    <div class="modal-details">
                        <span class="product-category">Category</span>
                        <h2>Product Title</h2>
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <span>(0)</span>
                        </div>
                        <p class="product-desc">Experience maximum quality and durability with this premium item. Designed with traditional aesthetics and modern robustness, it makes a perfect addition to your home.</p>
                        <div class="product-price">
                            <span class="current">₹0.00</span>
                            <span class="old" style="display: none;">₹0.00</span>
                        </div>
                        <button class="btn btn-primary modal-cart-btn"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalImg = modal.querySelector('.modal-img-container img');
    const modalCategory = modal.querySelector('.product-category');
    const modalTitle = modal.querySelector('.modal-details h2');
    const modalRating = modal.querySelector('.product-rating');
    const modalPriceCurrent = modal.querySelector('.product-price .current');
    const modalPriceOld = modal.querySelector('.product-price .old');
    const modalCartBtn = modal.querySelector('.modal-cart-btn');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    
    let activeProductTitle = '';

    // Quick View click trigger
    document.querySelectorAll('.product-actions button[title="Quick View"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productCard = this.closest('.product-card');
            if (!productCard) return;

            // Extract data from the product card
            const title = productCard.querySelector('.product-title a').innerText;
            const category = productCard.querySelector('.product-category').innerText;
            const imgSrc = productCard.querySelector('.product-img img').getAttribute('src');
            const ratingHTML = productCard.querySelector('.product-rating').innerHTML;
            const currentPrice = productCard.querySelector('.product-price .current').innerText;
            
            const oldPriceEl = productCard.querySelector('.product-price .old');
            const oldPrice = oldPriceEl ? oldPriceEl.innerText : null;

            // Inject data into modal
            modalImg.setAttribute('src', imgSrc);
            modalImg.setAttribute('alt', title);
            modalCategory.innerText = category;
            modalTitle.innerText = title;
            modalRating.innerHTML = ratingHTML;
            modalPriceCurrent.innerText = currentPrice;
            
            activeProductTitle = title;

            if (oldPrice) {
                modalPriceOld.innerText = oldPrice;
                modalPriceOld.style.display = 'inline-block';
            } else {
                modalPriceOld.style.display = 'none';
            }

            // Open Modal
            modal.classList.add('active');
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });

    // Modal Add To Cart
    modalCartBtn.addEventListener('click', function() {
        cartCount++;
        cartBadge.innerText = cartCount;
        showToast(`"${activeProductTitle}" added to your Cart!`, 'success');
        closeModal();
    });

    // --- 5. Countdown Timer on Promotional Banner ---
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl && hoursEl && minutesEl && secondsEl) {
        const countDownDate = new Date();
        countDownDate.setDate(countDownDate.getDate() + 5);
        countDownDate.setHours(countDownDate.getHours() + 12);
        
        const timerInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = countDownDate.getTime() - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            daysEl.innerText = days < 10 ? "0" + days : days;
            hoursEl.innerText = hours < 10 ? "0" + hours : hours;
            minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
            secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
            
            if (distance < 0) {
                clearInterval(timerInterval);
                document.getElementById("countdown").innerHTML = "EXPIRED";
            }
        }, 1000);
    }

    // --- 6. Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', function() {
            // Toggle Display
            if (window.getComputedStyle(mainNav).display === 'none') {
                mainNav.style.display = 'block';
                mobileBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mainNav.style.display = 'none';
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Mobile Dropdown click handling
    const hasDropdowns = document.querySelectorAll('.has-dropdown');
    hasDropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
});
// --- WhatsApp Product Inquiry Modal ---
document.addEventListener('DOMContentLoaded', function() {
    let waModal = document.createElement('div');
    waModal.className = 'modal-overlay wa-modal-overlay';
    waModal.innerHTML = `
        <div class="modal-box wa-modal-box">
            <button class="close-modal-btn wa-close-btn" title="Close"><i class="fas fa-times"></i></button>
            <div class="wa-modal-header">
                <div class="wa-modal-img-container">
                    <img src="" class="wa-product-img" alt="Product">
                    <div class="wa-badge"><i class="fab fa-whatsapp"></i> Inquiry</div>
                </div>
                <h2 class="wa-product-name">Product Name</h2>
                <p>Please provide your details below to send an inquiry directly to our WhatsApp.</p>
            </div>
            <form id="wa-inquiry-form">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="wa-name" required placeholder="Enter your name">
                </div>
                <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" id="wa-phone" required placeholder="Enter your phone number">
                </div>
                <div class="form-group">
                    <label>Message (Optional)</label>
                    <textarea id="wa-message" rows="3" placeholder="Any specific requirements?"></textarea>
                </div>
                <button type="submit" class="btn btn-green w-100"><i class="fab fa-whatsapp"></i> Send to WhatsApp</button>
            </form>
        </div>
    `;
    document.body.appendChild(waModal);

    const waProductNameEl = waModal.querySelector('.wa-product-name');
    const waProductImgEl = waModal.querySelector('.wa-product-img');
    const waForm = document.getElementById('wa-inquiry-form');
    const waCloseBtn = waModal.querySelector('.wa-close-btn');
    
    let currentInquiryProduct = '';

    function openWaModal(productName, imgSrc) {
        currentInquiryProduct = productName;
        waProductNameEl.innerText = productName;
        if(imgSrc) {
            waProductImgEl.src = imgSrc;
            waProductImgEl.style.display = 'block';
        } else {
            waProductImgEl.style.display = 'none';
        }
        waModal.classList.add('active');
    }
    window.openWaModal = openWaModal;

    function closeWaModal() {
        waModal.classList.remove('active');
    }

    waCloseBtn.addEventListener('click', closeWaModal);
    waModal.addEventListener('click', function(e) {
        if (e.target === waModal) closeWaModal();
    });

    // Attach to shelf items
    document.querySelectorAll('.shelf-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const name = this.querySelector('.item-name').innerText;
            const img = this.querySelector('img').src;
            openWaModal(name, img);
        });
    });

    // Attach to product cards
    document.querySelectorAll('.product-card-exact').forEach(card => {
        // Prevent triggering if clicking Add to Cart
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return; 
            e.preventDefault();
            const name = this.querySelector('.product-title-exact').innerText;
            const img = this.querySelector('img').src;
            openWaModal(name, img);
        });
    });

    // Handle form submit
    waForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('wa-name').value;
        const phone = document.getElementById('wa-phone').value;
        const message = document.getElementById('wa-message').value;
        
        // WhatsApp Business Number (Replace with actual number)
        const waNumber = '+919495988211'; 
        
        const waText = "Hello Peekey, I would like to inquire about: *" + currentInquiryProduct + "*.\\n\\n*My Details:*\\nName: " + name + "\\nPhone: " + phone + "\\nMessage: " + message;
        
        const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);
        
        window.open(waUrl, '_blank');
        closeWaModal();
        waForm.reset();
    });
});
