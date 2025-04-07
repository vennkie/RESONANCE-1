class Navigation {
    static inject() {
        const nav = `
            <nav class="main-nav">
                <a href="/">Products</a>
                <a href="/cart">Cart</a>
                <a href="/orders">Orders</a>
                <a href="/order-management">Management</a>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', nav);
    }
}

// Auto-inject navigation
document.addEventListener('DOMContentLoaded', () => Navigation.inject());
