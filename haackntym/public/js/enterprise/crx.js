class CartManager {
    constructor() {
        this.cart = new Map();
        this.syncTimeout = null;
        this.init();
    }

    init() {
        this.loadCart();
        this.bindEvents();
        this.setupSync();
    }

    bindEvents() {
        document.addEventListener('cart:add', e => this.addItem(e.detail));
        document.addEventListener('cart:remove', e => this.removeItem(e.detail));
        document.addEventListener('cart:update', e => this.updateQuantity(e.detail));
    }

    async addItem({ productId, quantity = 1 }) {
        try {
            const response = await fetch('/api/products/' + productId);
            const product = await response.json();
            
            if (this.cart.has(productId)) {
                const current = this.cart.get(productId);
                this.cart.set(productId, {
                    ...current,
                    quantity: current.quantity + quantity
                });
            } else {
                this.cart.set(productId, { ...product, quantity });
            }

            this.scheduleSync();
            this.updateUI();
        } catch (error) {
            console.error('Failed to add item:', error);
        }
    }

    removeItem(productId) {
        if (this.cart.has(productId)) {
            this.cart.delete(productId);
            this.scheduleSync();
            this.updateUI();
        }
    }

    updateQuantity({ productId, quantity }) {
        if (this.cart.has(productId)) {
            const item = this.cart.get(productId);
            item.quantity = quantity;
            this.scheduleSync();
            this.updateUI();
        }
    }

    scheduleSync() {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => this.syncCart(), 2000);
    }

    async syncCart() {
        try {
            const cartData = Array.from(this.cart.entries()).map(([id, item]) => ({
                productId: id,
                quantity: item.quantity
            }));

            await fetch('/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartData)
            });
        } catch (error) {
            console.error('Cart sync failed:', error);
        }
    }

    updateUI() {
        const total = Array.from(this.cart.values()).reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        
        document.querySelectorAll('[data-cart-count]')
            .forEach(el => el.textContent = this.cart.size);
        
        document.querySelectorAll('[data-cart-total]')
            .forEach(el => el.textContent = `$${total.toFixed(2)}`);
        
        this.renderCartItems();
    }

    renderCartItems() {
        const cartList = document.querySelector('.cart-items');
        if (!cartList) return;

        cartList.innerHTML = Array.from(this.cart.values())
            .map(item => `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>$${item.price} × ${item.quantity}</p>
                        <button onclick="cartManager.removeItem('${item.id}')">Remove</button>
                    </div>
                </div>
            `).join('');
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.cart = new Map(Object.entries(parsed));
                this.updateUI();
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Export for global access
window.cartManager = cartManager;
