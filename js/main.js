// API Configuration
const API_URL = 'http://localhost:3000';

class Main {
    constructor() {
        // Create popup container immediately
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'popup-overlay';
        document.body.appendChild(this.popupContainer);
        
        this.init();
    }

    init() {
        this.setupMobileNav();
        this.loadFeaturedProducts();
        this.loadPromotions();
        this.setupPopups();
    }

    setupMobileNav() {
        const navToggle = document.querySelector('.nav__toggle');
        const navMenu = document.querySelector('.nav__menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    setupPopups() {
        // Add event listeners for promotion links
        document.querySelectorAll('[data-popup="back-to-school"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBackToSchoolPopup();
            });
        });

        document.querySelectorAll('[data-popup="trade-in"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTradeInPopup();
            });
        });

        // Close popup when clicking outside
        this.popupContainer.addEventListener('click', (e) => {
            if (e.target === this.popupContainer) {
                this.closePopup();
            }
        });
    }

    showBackToSchoolPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <button class="popup__close">&times;</button>
            <h2 class="popup__title">Back to School Promotion</h2>
            <div class="popup__content">
                <p>Get 10% off your purchase with our Back to School promotion! Use the code below at checkout.</p>
                <div class="popup__promocode">SCHOOL2024</div>
                <div class="popup__copy-message">Code copied to clipboard!</div>
            </div>
        `;

        this.showPopup(popup);

        // Add copy functionality
        const promocode = popup.querySelector('.popup__promocode');
        const copyMessage = popup.querySelector('.popup__copy-message');
        
        promocode.addEventListener('click', () => {
            navigator.clipboard.writeText('SCHOOL2024').then(() => {
                copyMessage.classList.add('show');
                setTimeout(() => copyMessage.classList.remove('show'), 2000);
            });
        });
    }

    showTradeInPopup() {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <button class="popup__close">&times;</button>
            <h2 class="popup__title">Trade In Your Device</h2>
            <div class="popup__content">
                <p>Trade in your eligible device for credit toward your next purchase or get an Apple Store Gift Card.</p>
                <ul class="trade-in-steps">
                    <li>Tell us about your device and get an estimated trade-in value</li>
                    <li>Send us your device using our prepaid shipping label</li>
                    <li>We'll verify your device's condition</li>
                    <li>Get your credit or gift card</li>
                </ul>
                <p>Trade-in values may vary based on the condition, year, and configuration of your device.</p>
            </div>
        `;

        this.showPopup(popup);
    }

    showPopup(popupContent) {
        this.popupContainer.innerHTML = '';
        this.popupContainer.appendChild(popupContent);
        this.popupContainer.classList.add('active');

        // Add close button functionality
        const closeBtn = popupContent.querySelector('.popup__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePopup());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePopup();
            }
        });
    }

    closePopup() {
        this.popupContainer.classList.remove('active');
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="btn btn--primary retry-btn">Retry</button>
            </div>
        `;

        const retryBtn = container.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (containerId === 'featured-products') {
                    this.loadFeaturedProducts();
                } else if (containerId === 'current-promotions') {
                    this.loadPromotions();
                }
            });
        }
    }

    async loadFeaturedProducts() {
        const containerId = 'featured-products';
        this.showLoading(containerId);

        try {
            const response = await fetch('http://localhost:3000/products?_limit=4');
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            const products = await response.json();
            this.renderProducts(products, containerId);
        } catch (error) {
            console.error('Error loading featured products:', error);
            this.showError(containerId, 'Failed to load products. Please try again.');
        }
    }

    async loadPromotions() {
        const containerId = 'current-promotions';
        this.showLoading(containerId);

        try {
            const response = await fetch('http://localhost:3000/promotions');
            if (!response.ok) {
                throw new Error('Failed to load promotions');
            }
            const promotions = await response.json();
            this.renderPromotions(promotions);
        } catch (error) {
            console.error('Error loading promotions:', error);
            this.showError(containerId, 'Failed to load promotions. Please try again.');
        }
    }

    renderProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products available at the moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-card__image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-card__content">
                    <h3>${product.name}</h3>
                    <p class="product-card__price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn--secondary add-to-cart" 
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}"
                        data-product-image="${product.image}">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Re-initialize cart buttons after rendering products
        if (window.cart) {
            window.cart.setupAddToCartButtons();
        }
    }

    renderPromotions(promotions) {
        const container = document.getElementById('current-promotions');
        if (!container) {
            console.error('Promotions container not found');
            return;
        }

        if (promotions.length === 0) {
            container.innerHTML = `
                <div class="no-promotions">
                    <i class="fas fa-tag"></i>
                    <p>No current promotions available.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = promotions.map(promotion => `
            <div class="promotion-card">
                <div class="promotion-card__content">
                    <h3>${promotion.title}</h3>
                    <p>${promotion.description}</p>
                    <button class="btn btn--primary" data-popup="${promotion.type}">Learn More</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for promotion buttons
        const buttons = container.querySelectorAll('[data-popup]');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const popupType = button.dataset.popup;
                if (popupType === 'back-to-school') {
                    this.showBackToSchoolPopup();
                } else if (popupType === 'trade-in') {
                    this.showTradeInPopup();
                }
            });
        });
    }
}

// Initialize the main functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Main();
}); 
