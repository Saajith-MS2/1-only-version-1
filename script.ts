const cart = [];

function addToCart(code) {
  if (!cart.includes(code)) {
    cart.push(code);
    alert(`${code} added to cart.`);
  } else {
    alert(`${code} is already in cart.`);
  }
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  const message = `Hello! I'm interested in buying the following posters: %0A${cart.map(c => '- ' + c).join('%0A')}`;
  window.open(`https://wa.me/91xxxxxxxxxx?text=${message}`, '_blank');
}
