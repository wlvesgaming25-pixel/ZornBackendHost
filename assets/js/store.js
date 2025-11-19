// Store page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeStore();
    initializeCart();
    initializeProductFilters();
});

// Store state
let cart = JSON.parse(localStorage.getItem('zorn-cart')) || [];

function initializeStore() {
    updateCartDisplay();
    initializeAddToCartButtons();
    initializeSortFunction();
    
    // Load cart from localStorage
    displayCartItems();
}

function initializeProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-category');
            filterProducts(filterValue, productCards);
        });
    });
}

function filterProducts(category, productCards) {
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            showProductCard(card);
        } else {
            hideProductCard(card);
        }
    });
    
    // Update URL without reload
    const url = new URL(window.location);
    if (category !== 'all') {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url);
}

function showProductCard(card) {
    card.classList.remove('hidden');
    card.style.display = 'block';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }, 100);
}

function hideProductCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        card.classList.add('hidden');
        card.style.display = 'none';
    }, 300);
}

function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = this.getAttribute('data-product');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productName = productCard.querySelector('h3').textContent;
            const productImage = productCard.querySelector('.product-image img').src;
            
            // Get selected options
            const sizeSelect = productCard.querySelector('.size-select');
            const colorSelect = productCard.querySelector('.color-select');
            
            const selectedSize = sizeSelect ? sizeSelect.value : null;
            const selectedColor = colorSelect ? colorSelect.value : null;
            
            // Validate required selections
            if (sizeSelect && !selectedSize) {
                ZornUtils.showNotification('Please select a size', 'warning');
                return;
            }
            
            if (colorSelect && !selectedColor) {
                ZornUtils.showNotification('Please select a color', 'warning');
                return;
            }
            
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                size: selectedSize,
                color: selectedColor,
                quantity: 1
            };

            // Special-case: prevent actual checkout for the jersey (no payment configured)
            if (productId === 'jersey-2026') {
                // Show modal telling user checkout is unavailable
                const modal = document.getElementById('noPaymentModal');
                if (modal) {
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            addToCart(product);
        });
    });
}

function addToCart(product) {
    // Check if product with same options already exists
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(product);
    }
    
    updateCart();
    ZornUtils.showNotification(`${product.name} added to cart!`, 'success');
    
    // Animate the button
    const button = document.querySelector(`[data-product="${product.id}"]`);
    animateAddToCart(button);
}

function animateAddToCart(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Added';
    button.style.background = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 1500);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    ZornUtils.showNotification('Item removed from cart', 'info');
}

function updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        updateCart();
    }
}

function updateCart() {
    localStorage.setItem('zorn-cart', JSON.stringify(cart));
    updateCartDisplay();
    displayCartItems();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function initializeCart() {
    const cartToggle = document.getElementById('cartToggle');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCart && cartModal) {
        closeCart.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close cart when clicking outside
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                ZornUtils.showNotification('Your cart is empty', 'warning');
                return;
            }
            // There is no payment method configured — prevent checkout
            ZornUtils.showNotification('Checkout is currently unavailable (no payment method configured)', 'warning');
            console.log('Checkout attempted but payment not configured:', cart);
        });
    }
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItemsContainer || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>Your cart is empty</p>
                <a href="store.html" style="color: #e83e8c;">Continue Shopping</a>
            </div>
        `;
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                ${item.size ? `<p style="font-size: 0.9rem; color: #666;">Size: ${item.size}</p>` : ''}
                ${item.color ? `<p style="font-size: 0.9rem; color: #666;">Color: ${item.color}</p>` : ''}
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})" 
                                style="background: #f8f9fa; border: 1px solid #dee2e6; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">-</button>
                        <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})" 
                                style="background: #f8f9fa; border: 1px solid #dee2e6; width: 30px; height: 30px; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button onclick="removeFromCart(${index})" 
                            style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; margin-left: auto;">×</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function initializeSortFunction() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const productsContainer = document.querySelector('.products');
            const products = Array.from(document.querySelectorAll('.product-card'));
            
            products.sort((a, b) => {
                switch (sortValue) {
                    case 'price-low':
                        return getProductPrice(a) - getProductPrice(b);
                    case 'price-high':
                        return getProductPrice(b) - getProductPrice(a);
                    case 'newest':
                        // In a real app, this would sort by date
                        return Math.random() - 0.5;
                    case 'featured':
                    default:
                        // Keep original order for featured
                        return 0;
                }
            });
            
            // Re-append sorted products
            products.forEach(product => productsContainer.appendChild(product));
        });
    }
}

function getProductPrice(productCard) {
    const priceText = productCard.querySelector('.product-price').textContent;
    return parseFloat(priceText.replace('$', ''));
}

// Quick view functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quick-view-btn')) {
        const productCard = e.target.closest('.product-card');
        showQuickView(productCard);
    }
});

// No-payment modal handlers
document.addEventListener('DOMContentLoaded', function() {
    const noPaymentModal = document.getElementById('noPaymentModal');
    if (!noPaymentModal) return;

    const closeBtn = document.getElementById('closeNoPayment');
    const okBtn = document.getElementById('noPaymentOk');

    function closeModal() {
        noPaymentModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (okBtn) okBtn.addEventListener('click', closeModal);

    noPaymentModal.addEventListener('click', (e) => {
        if (e.target === noPaymentModal) closeModal();
    });
});

function showQuickView(productCard) {
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image img').src;
    
    // Create quick view modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <button class="close-quick-view">&times;</button>
            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img src="${productImage}" alt="${productName}">
                </div>
                <div class="quick-view-info">
                    <h2>${productName}</h2>
                    <div class="price">${productPrice}</div>
                    <p>Quick preview of this amazing product. Add to cart to purchase.</p>
                    <button class="btn-primary" onclick="this.closest('.quick-view-modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Close functionality
    modal.querySelector('.close-quick-view').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Make functions available globally
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;

// Initialize from URL parameters
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        const filterButton = document.querySelector(`[data-category="${category}"]`);
        if (filterButton) {
            filterButton.click();
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeFromURL);

// Export store-specific functions
window.StoreUtils = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cart: () => cart
};