// Initialize cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to add item to cart (for main page)
function addToCart(id) {
  const productElement = document.querySelector(`.product:nth-child(${parseInt(id.replace('CO', ''))})`);
  const sizeSelect = productElement.querySelector(".size-select");
  const qtySelect = productElement.querySelector(".qty-select");
  const size = sizeSelect.value;
  const quantity = parseInt(qtySelect.value);
  const price = size === "A3" ? 50 : 40;
  const img = productElement.querySelector("img").src;
  const title = productElement.querySelector("p").innerText;

  const existingItem = cart.find(item => item.id === id && item.size === size);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id, title, size, price, img, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Function to update cart count in UI (for both pages)
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = totalItems;
  });
}

// Function to remove item from cart (for cart page)
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Function to render cart items (for cart page)
function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #ccc;">Your cart is empty.</p>`;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}" class="cart-item-img"/>
        <div class="cart-details">
          <p><strong>${item.title}</strong></p>
          <p>Size: ${item.size}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: ₹${item.price} × ${item.quantity} = ₹${itemTotal}</p>
          <button onclick="removeFromCart(${index})">Remove ✖</button>
        </div>
      `;
      container.appendChild(div);
    });
  }

  updateCartCount();
  if (typeof populateOfferOptions === 'function') populateOfferOptions();
  if (typeof updateOfferSection === 'function') updateOfferSection();
}

// Function to get quantity by size (for cart page)
function getQtyBySize(size) {
  return cart.filter(item => item.size === size)
             .reduce((sum, item) => sum + item.quantity, 0);
}

// Function to update offer section (for cart page)
function updateOfferSection() {
  const offerSelect = document.getElementById("offer-select");
  const progress = document.getElementById("offer-progress");
  const posterCount = document.getElementById("poster-count");
  const offerMsg = document.getElementById("offer-message");
  const freeMsg = document.getElementById("free-poster-message");
  const subtotalBox = document.getElementById("subtotal-value");
  const discountBox = document.getElementById("discount-line");
  const discountValue = document.getElementById("discount-value");
  const grandTotalBox = document.getElementById("grand-total-value");

  if (!offerSelect) return;

  let a4Qty = getQtyBySize("A4");
  let a3Qty = getQtyBySize("A3");
  let totalQty = a4Qty + a3Qty;
  posterCount.textContent = totalQty;

  const percent = Math.min((Math.max(a3Qty, a4Qty) / 10) * 100, 100);
  progress.style.width = percent + "%";

  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let grandTotal = subtotal;
  let discount = 0;
  let freeNote = "";

  const selectedOffer = offerSelect.value;
  offerMsg.textContent = selectedOffer ? "" : "No offer selected.";

  if (selectedOffer === "a4_discount" && a4Qty >= 10) {
    discount = 100;
    grandTotal = subtotal - discount;
    offerMsg.textContent = "💸 ₹100 OFF on A4 posters applied.";
    freeNote = "💸 ₹100 OFF on A4 posters";
    showToast(freeNote);
  }
  else if (selectedOffer === "a4_free" && a4Qty >= 14) {
    const a4Items = cart.filter(item => item.size === "A4");
    let a4Count = 0, a4Extra = 0;
    a4Items.forEach(item => {
      if (a4Count + item.quantity <= 14) a4Count += item.quantity;
      else a4Extra += (a4Count + item.quantity - 14) * item.price;
    });
    const others = cart.filter(item => item.size !== "A4")
                       .reduce((sum, item) => sum + item.price * item.quantity, 0);
    grandTotal = 400 + a4Extra + others;
    freeNote = "🎁 14 A4 posters for ₹400 (4 FREE)";
    showToast(freeNote);
  }
  else if (selectedOffer === "a3_discount" && a3Qty >= 10) {
    discount = 100;
    grandTotal = subtotal - discount;
    offerMsg.textContent = "💸 ₹100 OFF on A3 posters applied.";
    freeNote = "💸 ₹100 OFF on A3 posters";
    showToast(freeNote);
  }
  else if (selectedOffer === "a3_free" && a3Qty >= 14) {
    const a3Items = cart.filter(item => item.size === "A3");
    let a3Count = 0, a3Extra = 0;
    a3Items.forEach(item => {
      if (a3Count + item.quantity <= 14) a3Count += item.quantity;
      else a3Extra += (a3Count + item.quantity - 14) * item.price;
    });
    const others = cart.filter(item => item.size !== "A3")
                       .reduce((sum, item) => sum + item.price * item.quantity, 0);
    grandTotal = 500 + a3Extra + others;
    freeNote = "🎁 14 A3 posters for ₹500 (4 FREE)";
    showToast(freeNote);
  }
  else if (selectedOffer) {
    offerMsg.textContent = "⚠️ Offer not applicable. Add more posters.";
    freeNote = "";
  }

  subtotalBox.textContent = `₹${subtotal}`;
  grandTotalBox.textContent = `₹${grandTotal}`;
  discountBox.style.display = discount > 0 ? "flex" : "none";
  discountValue.textContent = `– ₹${discount}`;
  freeMsg.textContent = freeNote;
}

// Function to populate offer dropdown (for cart page)
function populateOfferOptions() {
  const offerSelect = document.getElementById("offer-select");
  if (!offerSelect) return;

  offerSelect.innerHTML = `<option value="">-- Select an offer --</option>`;
  if (getQtyBySize("A4") >= 10) {
    offerSelect.innerHTML += `
      <option value="a4_discount">10 A4 for ₹300 (₹100 OFF)</option>
      <option value="a4_free">14 A4 for ₹400 (4 FREE)</option>
    `;
  }
  if (getQtyBySize("A3") >= 10) {
    offerSelect.innerHTML += `
      <option value="a3_discount">10 A3 for ₹400 (₹100 OFF)</option>
      <option value="a3_free">14 A3 for ₹500 (4 FREE)</option>
    `;
  }
}

// Function to checkout (for cart page)
function checkoutCart() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "#ff5252");
    return;
  }

  const offer = document.getElementById("offer-select").value;
  const a4Qty = getQtyBySize("A4");
  const a3Qty = getQtyBySize("A3");
  let discount = 0;
  let freeNote = "";
  let grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply offers
  if (offer === "a4_discount" && a4Qty >= 10) {
    discount = 100;
    freeNote = "💸 ₹100 OFF on A4 posters";
    grandTotal -= discount;
  }
  else if (offer === "a4_free" && a4Qty >= 14) {
    freeNote = "🎁 14 A4 posters for ₹400 (4 FREE)";
    let extra = 0, count = 0;
    cart.filter(i => i.size === "A4").forEach(i => {
      if (count + i.quantity <= 14) count += i.quantity;
      else extra += (count + i.quantity - 14) * i.price;
    });
    grandTotal = 400 + extra + cart.filter(i => i.size !== "A4")
                                  .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
  else if (offer === "a3_discount" && a3Qty >= 10) {
    discount = 100;
    freeNote = "💸 ₹100 OFF on A3 posters";
    grandTotal -= discount;
  }
  else if (offer === "a3_free" && a3Qty >= 14) {
    freeNote = "🎁 14 A3 posters for ₹500 (4 FREE)";
    let extra = 0, count = 0;
    cart.filter(i => i.size === "A3").forEach(i => {
      if (count + i.quantity <= 14) count += i.quantity;
      else extra += (count + i.quantity - 14) * i.price;
    });
    grandTotal = 500 + extra + cart.filter(i => i.size !== "A3")
                                  .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // Build structured WhatsApp message
  let itemsMessage = "Hey! I want to order these posters:\n\n";
  itemsMessage += "Sl.No | Product Name               | Qty | Rate | Total\n";
  itemsMessage += "------|----------------------------|-----|------|------\n";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    itemsMessage +=
      `${(index + 1).toString().padEnd(5)} | ` +
      `${item.title.padEnd(26)} | ` +
      `${item.quantity.toString().padEnd(3)} | ` +
      `₹${item.price.toString().padEnd(4)} | ` +
      `₹${itemTotal}\n`;
  });

  if (offer) {
    const offerText = document.querySelector(`#offer-select option[value="${offer}"]`).textContent;
    itemsMessage += `\n🎯 Offer: ${offerText}\n`;
  }
  if (freeNote) itemsMessage += `${freeNote}\n`;
  itemsMessage += `\n🧾 Grand Total: ₹${grandTotal}`;

  // Encode for WhatsApp URL
  const encodedMessage = encodeURIComponent(itemsMessage);
  window.location.href = `https://wa.me/917448467342?text=${encodedMessage}`;
}
function checkoutCart() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "#ff5252");
    return;
  }

  const offer = document.getElementById("offer-select").value;
  const a4Qty = getQtyBySize("A4");
  const a3Qty = getQtyBySize("A3");
  let discount = 0;
  let freeNote = "";
  let grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply offers
  if (offer === "a4_discount" && a4Qty >= 10) {
    discount = 100;
    freeNote = "💸 ₹100 OFF on A4 posters";
    grandTotal -= discount;
  }
  else if (offer === "a4_free" && a4Qty >= 14) {
    freeNote = "🎁 14 A4 posters for ₹400 (4 FREE)";
    let extra = 0, count = 0;
    cart.filter(i => i.size === "A4").forEach(i => {
      if (count + i.quantity <= 14) count += i.quantity;
      else extra += (count + i.quantity - 14) * i.price;
    });
    grandTotal = 400 + extra + cart.filter(i => i.size !== "A4")
                                  .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
  else if (offer === "a3_discount" && a3Qty >= 10) {
    discount = 100;
    freeNote = "💸 ₹100 OFF on A3 posters";
    grandTotal -= discount;
  }
  else if (offer === "a3_free" && a3Qty >= 14) {
    freeNote = "🎁 14 A3 posters for ₹500 (4 FREE)";
    let extra = 0, count = 0;
    cart.filter(i => i.size === "A3").forEach(i => {
      if (count + i.quantity <= 14) count += i.quantity;
      else extra += (count + i.quantity - 14) * i.price;
    });
    grandTotal = 500 + extra + cart.filter(i => i.size !== "A3")
                                  .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // Build structured WhatsApp message
  let itemsMessage = "Hey! I want to order these posters:\n\n";
  itemsMessage += "Sl.No | Product Name               | Qty | Rate | Total\n";
  itemsMessage += "------|----------------------------|-----|------|------\n";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    itemsMessage +=
      `${(index + 1).toString().padEnd(5)} | ` +
      `${item.title.padEnd(26)} | ` +
      `${item.quantity.toString().padEnd(3)} | ` +
      `₹${item.price.toString().padEnd(4)} | ` +
      `₹${itemTotal}\n`;
  });

  if (offer) {
    const offerText = document.querySelector(`#offer-select option[value="${offer}"]`).textContent;
    itemsMessage += `\n🎯 Offer: ${offerText}\n`;
  }
  if (freeNote) itemsMessage += `${freeNote}\n`;
  itemsMessage += `\n🧾 Grand Total: ₹${grandTotal}`;

  // Encode for WhatsApp URL
  const encodedMessage = encodeURIComponent(itemsMessage);
  window.location.href = `https://wa.me/917448467342?text=${encodedMessage}`;
}


// Function to show toast (for cart page)
function showToast(message, color = "#00e676") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.color = color.includes("#") ? color : "#00e676";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  if (document.getElementById("cart-items")) {
    renderCart();
    document.getElementById("offer-select")
            .addEventListener("change", updateOfferSection);
  }
});
function toggleCollapsible(contentId) {
  const content = document.getElementById(contentId);
  const header = content.previousElementSibling;
  const icon = header.querySelector("i");

  // Toggle content visibility
  if (content.style.display === "block") {
    content.style.display = "none";
    icon.classList.remove("fa-chevron-up");
    icon.classList.add("fa-chevron-down");
  } else {
    content.style.display = "block";
    icon.classList.remove("fa-chevron-down");
    icon.classList.add("fa-chevron-up");
  }
}
// Show modal on page load
window.addEventListener("load", function() {
  setTimeout(function() {
    document.getElementById("offerModal").style.display = "block";
  }, 1000); // Delay for 1 second
});

// Close modal
function closeModal() {
  document.getElementById("offerModal").style.display = "none";
}

// Close modal if clicked outside
window.onclick = function(event) {
  const modal = document.getElementById("offerModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}
// Show offer explanation modal on page load
window.addEventListener("load", function() {
  setTimeout(function() {
    document.getElementById("offerExplanationModal").style.display = "block";
  }, 1000); // Delay for 1 second
});

// Close offer modal
function closeOfferModal() {
  document.getElementById("offerExplanationModal").style.display = "none";
}

// Close modal if clicked outside
window.onclick = function(event) {
  const modal = document.getElementById("offerExplanationModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Update offer summary box
function updateOfferSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const a4Items = cart.filter(item => item.size === "A4");
  const a3Items = cart.filter(item => item.size === "A3");

  let a4Qty = a4Items.reduce((sum, item) => sum + item.quantity, 0);
  let a3Qty = a3Items.reduce((sum, item) => sum + item.quantity, 0);

  let freeA4 = Math.floor(a4Qty / 10) * 4;
  let freeA3 = Math.floor(a3Qty / 10) * 4;

  if (a4Qty >= 10 || a3Qty >= 10) {
    document.getElementById("offerSummaryBox").style.display = "block";

    // Fill offer items table
    const offerItems = document.getElementById("offerItems");
    offerItems.innerHTML = "";

    a4Items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${item.price * item.quantity}</td>
        <td>${Math.floor(item.quantity / 10) * 4}</td>
      `;
      offerItems.appendChild(row);
    });

    a3Items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${item.price * item.quantity}</td>
        <td>${Math.floor(item.quantity / 10) * 4}</td>
      `;
      offerItems.appendChild(row);
    });

    // Update totals
    const totalPosters = a4Qty + a3Qty + freeA4 + freeA3;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const savings = (freeA4 + freeA3) * 40; // Assuming ₹40 per poster

    document.getElementById("totalPosters").textContent = totalPosters;
    document.getElementById("freePosters").textContent = freeA4 + freeA3;
    document.getElementById("subtotal").textContent = subtotal;
    document.getElementById("grandTotal").textContent = subtotal;
    document.getElementById("youSaved").textContent = savings;
  }
}

// Call this function when the cart is updated
document.addEventListener("DOMContentLoaded", function() {
  updateOfferSummary();
  // Your existing cart initialization code
});
// Show offer explanation modal on page load
window.addEventListener("load", function() {
  setTimeout(function() {
    document.getElementById("offerExplanationModal").style.display = "block";
  }, 1000);
});

// Close offer modal
function closeOfferModal() {
  document.getElementById("offerExplanationModal").style.display = "none";
}

// Close modal if clicked outside
window.onclick = function(event) {
  const modal = document.getElementById("offerExplanationModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Update offer summary box
function updateOfferSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  // Rest of the function from previous response
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", function() {
  updateOfferSummary();
  // Your existing cart initialization code
});
