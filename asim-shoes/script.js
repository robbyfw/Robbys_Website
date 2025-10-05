// Sample product data
const products = [
    { id: 1, name: "Classic Sneakers", price: 89.99, category: "sneakers", emoji: "👟" },
    { id: 2, name: "Leather Boots", price: 149.99, category: "boots", emoji: "🥾" },
    { id: 3, name: "Formal Oxford", price: 199.99, category: "formal", emoji: "👞" },
    { id: 4, name: "Running Shoes", price: 119.99, category: "sneakers", emoji: "🏃‍♂️" },
    { id: 5, name: "High Heels", price: 129.99, category: "formal", emoji: "👠" },
    { id: 6, name: "Combat Boots", price: 169.99, category: "boots", emoji: "🥾" }
];

let cart = [];

// Initialize website
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartCount();
});

// Display products
function displayProducts(productsToShow) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter products
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filtered);
}

// Add to cart
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(c => c.id === id);
    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

// Cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Show notification
function showNotification(msg) {
    const notification = document.createElement('div');
    notification.textContent = msg;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px; background: #10b981;
        color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    displayCartItems();
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><p>Your cart is empty</p></div>`;
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} each</p>
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="qty-btn" onclick="removeFromCart(${item.id})" style="margin-left:10px;background:#ef4444;color:white;">×</button>
            </div>
        </div>
    `).join('');
    updateCartTotal();
}

// Update quantity
function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(id);
    else displayCartItems();
    updateCartCount();
}

// Remove item
function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    displayCartItems();
    updateCartCount();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Checkout
function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    toggleCart();
    showCheckoutModal();
}

// Checkout modal
function showCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) {
        // Create modal dynamically
        const checkoutHTML = `
            <div id="checkout-modal" class="checkout-modal" onclick="if(event.target==this) closeCheckout()">
                <div class="checkout-content">
                    <div class="checkout-header">
                        <h3>Checkout</h3>
                        <button class="close-btn" onclick="closeCheckout()">×</button>
                    </div>
                    <form class="checkout-form" onsubmit="processOrder(event)">
                        <div class="form-section">
                            <h4>Customer Info</h4>
                            <div class="form-row">
                                <input type="text" name="firstName" placeholder="First Name" required>
                                <input type="text" name="lastName" placeholder="Last Name" required>
                            </div>
                            <input type="email" name="email" placeholder="Email" required>
                            <input type="tel" name="phone" placeholder="Phone" required>
                        </div>
                        <div class="form-section">
                            <h4>Shipping Address</h4>
                            <input type="text" name="address" placeholder="Address" required>
                            <div class="form-row">
                                <input type="text" name="city" placeholder="City" required>
                                <input type="text" name="zipCode" placeholder="ZIP Code" required>
                            </div>
                            <input type="text" name="country" placeholder="Country" required>
                        </div>
                        <div class="checkout-summary" id="checkout-summary"></div>
                        <div class="checkout-total" id="checkout-total"></div>
                        <button type="submit" class="place-order-btn">Place Order</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
    }
    displayCheckoutSummary();
    document.getElementById('checkout-modal').style.display = 'block';
}

// Close checkout
function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'none';
}

// Display checkout summary
function displayCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    const totalEl = document.getElementById('checkout-total');
    summary.innerHTML = cart.map(item => `<div class="summary-item">${item.name} x${item.quantity} - $${(item.price*item.quantity).toFixed(2)}</div>`).join('');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// Process order
function processOrder(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const info = Object.fromEntries(data.entries());
    const orderItems = cart.map(i => `${i.name} x${i.quantity} - $${(i.price*i.quantity).toFixed(2)}`).join('\n');
    const total = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
    const msg = `🛍️ *New Order*\n\n👤 Name: ${info.firstName} ${info.lastName}\n📧 Email: ${info.email}\n📞 Phone: ${info.phone}\n\n🏠 Address:\n${info.address}, ${info.city}, ${info.zipCode}, ${info.country}\n\n🛒 Order:\n${orderItems}\n\n💰 Total: $${total.toFixed(2)}`;
    const waNumber = '923140170570';
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    cart = [];
    updateCartCount();
    closeCheckout();
    alert('Order sent to WhatsApp!');
}

// Scroll to products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}
