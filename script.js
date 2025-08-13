let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id) {
  const sizeSelect = document.getElementById(`size-${id}`);
  const size = sizeSelect ? sizeSelect.value : "A4";
  const price = size === "A3" ? 50 : 40;

  const qtyInput = document.getElementById(`qty-${id}`);
  const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

  const posterElement = document.querySelector(`[data-id="${id}"]`);
  const img = posterElement.querySelector("img").src;
  const title = posterElement.querySelector("strong").innerText;

  // Check if item already exists in cart
  const existingItem = cart.find(item => item.id === id && item.size === size);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const item = { id, size, price, title, img, quantity };
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateCartBar();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBar();
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cart-count, #cart-count-nav").forEach(el => {
    if (el) el.textContent = totalItems;
  });
}

function updateCartBar() {
  const cartBar = document.getElementById('cart-bar');
  if (!cartBar) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBar.textContent = `🛒 Cart (${totalItems})`;
  cartBar.style.display = totalItems > 0 ? "block" : "none";
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}" class="cart-item-img"/>
      <div class="cart-details">
        <p><strong>${item.title}</strong></p>
        <p>Size: ${item.size}</p>
        <p>Quantity: ${item.quantity}</p>
        <p>Total: ₹${item.price * item.quantity}</p>
        <button onclick="removeFromCart(${index})">Remove ✖</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const message = cart.map(item =>
    `${item.title} (${item.size}) x${item.quantity} - ₹${item.price * item.quantity}`
  ).join("%0A");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fullMessage = `Hey! I want to order these posters:%0A${message}%0A%0ATotal: ₹${total}`;

  window.location.href = `https://wa.me/917448467342?text=${fullMessage}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Prevent duplicate floating cart bar
  if (!document.getElementById('cart-bar')) {
    const cartBar = document.createElement('div');
    cartBar.id = 'cart-bar';
    cartBar.className = 'cart-bar';
    cartBar.style.display = 'none';
    cartBar.onclick = () => window.location.href = "cart.html";
    document.body.appendChild(cartBar);
  }

  updateCartCount();
  updateCartBar();
  renderCart(); // only works if cart-items container exists
});
