class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.discount = 0; // Track discount
        this.promoApplied = false;
        this.init();
        console.log('Cart initialized:', this.items); // Debug log
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
        this.setupAddToCartButtons();
    }

    setupEventListeners() {
        // Listen for storage events to sync cart across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.items = JSON.parse(e.newValue) || [];
                this.updateCartCount();
                this.updateCartTotal();
            }
        });

        // Add event listener for checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Promo code event
        const promoBtn = document.querySelector('.apply-promo');
        if (promoBtn) {
            promoBtn.addEventListener('click', () => this.applyPromoCode());
        }
    }

    setupAddToCartButtons() {
        // Add event listeners to all "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(e.target.closest('.add-to-cart').dataset.productId);
                const product = {
                    id: productId,
                    name: e.target.closest('.add-to-cart').dataset.productName,
                    price: parseFloat(e.target.closest('.add-to-cart').dataset.productPrice),
                    image: e.target.closest('.add-to-cart').dataset.productImage
                };
                console.log('Adding product to cart:', product); // Debug log
                this.addItem(product);
            });
        });
    }

    addItem(product) {
        console.log('Adding item to cart:', product); // Debug log
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.updateCartTotal();
        this.showNotification('Product added to cart');
        
        // If we're on the cart page, re-render the cart items
        if (document.querySelector('.cart-items')) {
            this.renderCartItems();
        }
    }

    removeItem(productId) {
        console.log('Removing item from cart:', productId); // Debug log
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartTotal();
        this.showNotification('Product removed from cart');
        this.renderCartItems();
    }

    updateQuantity(productId, quantity) {
        console.log('Updating quantity:', productId, quantity); // Debug log
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.updateCartTotal();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        console.log('Cart saved:', this.items); // Debug log
        // Dispatch storage event to sync across tabs
        window.dispatchEvent(new Event('storage'));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            console.log('Cart count updated:', totalItems); // Debug log
        }
    }

    updateCartTotal() {
        let subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = this.promoApplied ? subtotal * this.discount : 0;
        this.total = subtotal - discountAmount;
        const totalElements = document.querySelectorAll('.cart-total');
        totalElements.forEach(element => {
            element.textContent = `$${this.total.toFixed(2)}`;
        });
        // Show discount row if applied
        const summary = document.querySelector('.cart-summary');
        let discountRow = summary.querySelector('.cart-summary__discount');
        if (this.promoApplied && discountAmount > 0) {
            if (!discountRow) {
                discountRow = document.createElement('div');
                discountRow.className = 'cart-summary__row cart-summary__discount';
                discountRow.innerHTML = `<span>Discount</span><span>-$${discountAmount.toFixed(2)}</span>`;
                summary.insertBefore(discountRow, summary.querySelector('.cart-summary__total'));
            } else {
                discountRow.innerHTML = `<span>Discount</span><span>-$${discountAmount.toFixed(2)}</span>`;
            }
        } else if (discountRow) {
            discountRow.remove();
        }
        console.log('Cart total updated:', this.total); // Debug log
        // Update checkout button state
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            checkoutBtn.disabled = totalItems === 0;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        console.log('Rendering cart items:', this.items); // Debug log

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="/catalog.html" class="btn btn--primary">Continue Shopping</a>
                </div>
            `;
            this.updateCartTotal(); // Update summary and button state when cart is empty
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item__image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item__content">
                    <h3>${item.name}</h3>
                    <p class="cart-item__price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item__quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="99">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="cart-item__remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for quantity buttons
        cartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.productId);
                const input = cartItem.querySelector('input');
                const currentValue = parseInt(input.value);
                
                if (e.target.classList.contains('plus')) {
                    input.value = currentValue + 1;
                } else if (e.target.classList.contains('minus')) {
                    input.value = Math.max(1, currentValue - 1);
                }
                
                this.updateQuantity(productId, parseInt(input.value));
                this.updateCartTotal(); // Update summary and button state after quantity change
            });
        });

        // Add event listeners for remove buttons
        cartItemsContainer.querySelectorAll('.cart-item__remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.cart-item').dataset.productId);
                this.removeItem(productId);
                this.updateCartTotal(); // Update summary and button state after removal
            });
        });
        this.updateCartTotal(); // Always update after rendering
    }

    handleCheckout() {
        if (this.items.length === 0) return;
        window.location.href = '/payment.html';
    }

    applyPromoCode() {
        const promoInput = document.querySelector('.promo-input');
        const code = promoInput.value.trim().toUpperCase();
        const promoBtn = document.querySelector('.apply-promo');
        const promoCodeDiv = document.querySelector('.promo-code');
        // Remove old messages
        promoCodeDiv.querySelectorAll('.error, .success').forEach(el => el.remove());
        if (code === 'SCHOOL2024' && !this.promoApplied) {
            this.discount = 0.1; // 10% discount
            this.promoApplied = true;
            this.updateCartTotal();
            // Show success message
            const msg = document.createElement('div');
            msg.className = 'success';
            msg.textContent = 'Promo code applied! 10% discount.';
            promoInput.disabled = true;
            promoBtn.disabled = true;
            promoCodeDiv.appendChild(msg);
        } else if (this.promoApplied) {
            // Already applied
            const msg = document.createElement('div');
            msg.className = 'error';
            msg.textContent = 'Promo code already applied.';
            promoCodeDiv.appendChild(msg);
        } else {
            // Invalid code
            const msg = document.createElement('div');
            msg.className = 'error';
            msg.textContent = 'Invalid promo code.';
            promoCodeDiv.appendChild(msg);
        }
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart...'); // Debug log
    window.cart = new Cart();
    
    // If we're on the cart page, render the cart items
    if (document.querySelector('.cart-items')) {
        window.cart.renderCartItems();
        window.cart.updateCartTotal(); // Ensure totals and button state are correct
    }
}); 