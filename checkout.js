// Checkout functionality
class Checkout {
    constructor() {
        this.form = document.getElementById('checkout-form');
        this.setupEventListeners();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Format card number input
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Format expiry date input
        const expiry = document.getElementById('expiry');
        if (expiry) {
            expiry.addEventListener('input', (e) => this.formatExpiryDate(e));
        }

        // Format CVV input
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => this.formatCVV(e));
        }
    }

    updateOrderSummary() {
        const subtotal = cart.total;
        const shipping = subtotal > 0 ? 10 : 0; // Free shipping for orders over $0
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;

        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.shipping').textContent = `$${shipping.toFixed(2)}`;
        document.querySelector('.tax').textContent = `$${tax.toFixed(2)}`;
        document.querySelector('.cart-total').textContent = `$${total.toFixed(2)}`;
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19); // 16 digits + 3 spaces
    }

    formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    formatCVV(e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 3);
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearError(field);
            }
        });

        // Validate email
        const email = document.getElementById('email');
        if (email && !this.validateEmail(email.value)) {
            this.showError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate card number
        const cardNumber = document.getElementById('card-number');
        if (cardNumber && !this.validateCardNumber(cardNumber.value)) {
            this.showError(cardNumber, 'Please enter a valid card number');
            isValid = false;
        }

        // Validate expiry date
        const expiry = document.getElementById('expiry');
        if (expiry && !this.validateExpiryDate(expiry.value)) {
            this.showError(expiry, 'Please enter a valid expiry date (MM/YY)');
            isValid = false;
        }

        // Validate CVV
        const cvv = document.getElementById('cvv');
        if (cvv && !this.validateCVV(cvv.value)) {
            this.showError(cvv, 'Please enter a valid CVV');
            isValid = false;
        }

        return isValid;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validateCardNumber(cardNumber) {
        return cardNumber.replace(/\s/g, '').length === 16;
    }

    validateExpiryDate(expiry) {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (month < 1 || month > 12) return false;
        if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

        return true;
    }

    validateCVV(cvv) {
        return /^\d{3}$/.test(cvv);
    }

    showError(field, message) {
        const errorDiv = field.parentElement.querySelector('.error-message') || 
            document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (!field.parentElement.querySelector('.error-message')) {
            field.parentElement.appendChild(errorDiv);
        }
        
        field.classList.add('error');
    }

    clearError(field) {
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('error');
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        if (cart.getItems().length === 0) {
            alert('Your cart is empty');
            return;
        }

        try {
            // Simulate API call
            await this.processOrder();
            
            // Clear cart and show success message
            cart.clearCart();
            this.showSuccessMessage();
            
            // Reset form
            this.form.reset();
        } catch (error) {
            console.error('Error processing order:', error);
            alert('There was an error processing your order. Please try again.');
        }
    }

    async processOrder() {
        // Simulate API delay
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
            <a href="/" class="btn btn--primary">Continue Shopping</a>
        `;

        const cartContent = document.querySelector('.cart-content');
        cartContent.innerHTML = '';
        cartContent.appendChild(successMessage);
    }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Checkout();
}); 