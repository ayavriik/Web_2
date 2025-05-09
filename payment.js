class Payment {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupInputFormatting();
        this.updateOrderSummary();
    }

    setupFormValidation() {
        const form = document.getElementById('payment-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.processPayment();
            }
        });
    }

    setupInputFormatting() {
        // Format card number
        const cardInput = document.getElementById('card-number');
        if (cardInput) {
            cardInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }

        // Format expiry date
        const expiryInput = document.getElementById('expiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                }
                e.target.value = value;
            });
        }

        // Format CVV
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }

    validateForm() {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        const name = document.getElementById('name').value;

        if (cardNumber.length !== 16) {
            this.showError('Please enter a valid 16-digit card number');
            return false;
        }

        if (!expiry.match(/^\d{2}\/\d{2}$/)) {
            this.showError('Please enter a valid expiry date (MM/YY)');
            return false;
        }

        if (cvv.length !== 3) {
            this.showError('Please enter a valid 3-digit CVV');
            return false;
        }

        if (name.trim().length < 3) {
            this.showError('Please enter a valid name');
            return false;
        }

        return true;
    }

    processPayment() {
        const payBtn = document.querySelector('.pay-btn');
        const originalText = payBtn.textContent;
        payBtn.disabled = true;
        payBtn.textContent = 'Processing...';

        // Simulate payment processing
        setTimeout(() => {
            // Clear the cart
            if (window.cart) {
                window.cart.items = [];
                window.cart.saveCart();
                window.cart.updateCartCount();
            }

            // Show success message
            this.showSuccess('Payment successful! Thank you for your purchase.');

            // Redirect to home page after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }, 2000);
    }

    updateOrderSummary() {
        if (window.cart) {
            window.cart.updateCartTotal();
        }
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize payment when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Payment();
}); 