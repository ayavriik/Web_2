// Polyfill fetchProducts if not defined
if (typeof fetchProducts !== 'function') {
    var fetchProducts = async function() {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    };
}

// Polyfill createProductCard if not defined
if (typeof createProductCard !== 'function') {
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
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
        `;
        return card;
    }
}

// Catalog functionality
class Catalog {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.filters = {
            categories: [],
            priceRange: {
                min: 0,
                max: 3000
            },
            sortBy: 'price-asc'
        };
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
    }

    async loadProducts() {
        this.products = await fetchProducts();
        this.filteredProducts = [...this.products];
        console.log('Loaded products:', this.products); // Debug log
        if (!this.products || this.products.length === 0) {
            const container = document.getElementById('catalog-products');
            if (container) {
                container.innerHTML = '<div class="error-message">No products loaded. Please check your API or product data.</div>';
            }
        }
    }

    setupEventListeners() {
        // Category filters
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCategoryFilters();
                this.applyFilters();
            });
        });

        // Price range filters
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const priceMinValue = document.getElementById('price-min-value');
        const priceMaxValue = document.getElementById('price-max-value');

        [priceMin, priceMax].forEach(input => {
            input.addEventListener('input', () => {
                this.updatePriceRange();
                this.applyFilters();
            });
        });

        [priceMinValue, priceMaxValue].forEach(input => {
            input.addEventListener('change', () => {
                this.updatePriceRange();
                this.applyFilters();
            });
        });

        // Sort options
        const sortSelect = document.getElementById('sort-options');
        sortSelect.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        // Search bar
        const searchInput = document.getElementById('catalog-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.applyFilters();
            });
        }
    }

    updateCategoryFilters() {
        this.filters.categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(checkbox => checkbox.value);
    }

    updatePriceRange() {
        const minInput = document.getElementById('price-min');
        const maxInput = document.getElementById('price-max');
        const minValue = document.getElementById('price-min-value');
        const maxValue = document.getElementById('price-max-value');

        // Ensure min doesn't exceed max
        if (parseInt(minInput.value) > parseInt(maxInput.value)) {
            minInput.value = maxInput.value;
        }
        // Ensure max doesn't go below min
        if (parseInt(maxInput.value) < parseInt(minInput.value)) {
            maxInput.value = minInput.value;
        }

        // Update the number inputs
        minValue.value = minInput.value;
        maxValue.value = maxInput.value;

        this.filters.priceRange = {
            min: parseInt(minInput.value),
            max: parseInt(maxInput.value)
        };
    }

    applyFilters() {
        // Apply category filter
        this.filteredProducts = this.products.filter(product => {
            if (this.filters.categories.length === 0) return true;
            return this.filters.categories.includes(product.category);
        });

        // Apply price range filter
        this.filteredProducts = this.filteredProducts.filter(product => {
            return product.price >= this.filters.priceRange.min && 
                   product.price <= this.filters.priceRange.max;
        });

        // Apply search filter
        const searchInput = document.getElementById('catalog-search');
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (searchTerm) {
            this.filteredProducts = this.filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sorting
        this.filteredProducts.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('catalog-products');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
            return;
        }

        this.filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });
        // Re-initialize cart buttons after rendering
        if (window.cart) {
            window.cart.setupAddToCartButtons();
        }
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Catalog();
});

// Add search bar to catalog page if not present
if (!document.getElementById('catalog-search')) {
    const filters = document.querySelector('.catalog-filters');
    if (filters) {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'filter-section';
        searchDiv.innerHTML = `
            <h3>Search</h3>
            <input type="text" id="catalog-search" placeholder="Search products..." style="width:100%;padding:0.5rem;">
        `;
        filters.insertBefore(searchDiv, filters.firstChild);
    }
} 