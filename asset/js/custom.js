 let products = [];

const PAGE_SIZE = 8;
let cart = [];
let liked = new Set();
let activeCat = "all";
let visibleCount = PAGE_SIZE;

async function fetchProducts() {
  try {
    const res = await fetch('https://thriftgenius-backend.onrender.com/api/products');
    const data = await res.json();
    products = data.map(p => ({
      id: p._id,
      name: p.name,
      cat: p.category,
      price: p.price,
      sold: p.sold,
      badge: p.badge,
      img: p.images[0] || ''
    }));
    renderProducts();
  } catch (err) {
    console.log('Could not load products:', err);
  }
}

function getFiltered() {
  return activeCat === "all" ? products : products.filter(p => p.cat === activeCat);
}

function renderProducts() {
  const filtered = getFiltered();
  const toShow = filtered.slice(0, visibleCount);
  const grid = document.getElementById("product-grid");

  document.getElementById("item-count").textContent =
    filtered.length + " item" + (filtered.length !== 1 ? "s" : "");

  grid.innerHTML = toShow.map(p => `
    <div class="product-card">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/300x400/eeeeee/999999?text=No+Image'">
        ${p.sold ? '<span class="sold-out-badge">Sold Out</span>' : p.badge === "new" ? '<span class="new-badge">New</span>' : ''}
        <button class="wish-btn ${liked.has(p.id) ? 'liked' : ''}" onclick="toggleLike('${p.id}')">
          <i class="bi ${liked.has(p.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="cat-label">${p.cat}</div>
        <h3>${p.name}</h3>
        <div class="product-price ${p.sold ? 'sold' : ''}">&#8358;${p.price.toLocaleString()}</div>
        <button class="add-btn" ${p.sold ? "disabled" : ""} onclick="addToCart('${p.id}')">
          ${p.sold ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  `).join("");

  const btn = document.getElementById("load-more-btn");
  const remaining = filtered.length - visibleCount;
  if (remaining <= 0) {
    btn.textContent = "All items loaded";
    btn.disabled = true;
  } else {
    btn.textContent = "Load More (" + remaining + " remaining)";
    btn.disabled = false;
  }
}

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    visibleCount = PAGE_SIZE;
    renderProducts();
  });
});

document.getElementById("load-more-btn").addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  renderProducts();
});

function toggleLike(id) {
  liked.has(id) ? liked.delete(id) : liked.add(id);
  renderProducts();
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.sold) return;
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCart();
  showToast(p.name + " added to cart");
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  updateCart();
}

function updateCart() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const qty   = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById("cart-count").textContent = qty;
  document.getElementById("mobile-cart-count").textContent = qty;
  document.getElementById("cart-qty").textContent = qty;
  document.getElementById("cart-total").textContent = "₦" + total.toLocaleString();

  const body = document.getElementById("cart-body");
  if (!cart.length) {
    body.innerHTML = `<div class="empty-cart"><i class="bi bi-bag"></i><p>Your cart is empty.</p></div>`;
    return;
  }
  body.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.img}" alt="${c.name}" onerror="this.src='https://placehold.co/60x75/eeeeee/999?text=TG'">
      <div class="cart-item-details">
        <h4>${c.name}</h4>
        <div class="cat">${c.cat} &times; ${c.qty}</div>
        <div class="price">&#8358;${(c.price * c.qty).toLocaleString()}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${c.id}')"><i class="bi bi-x"></i></button>
    </div>
  `).join("");
}

function openCart() {
  document.getElementById("cart-sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCartFn() {
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("open-cart").addEventListener("click", e => { e.preventDefault(); openCart(); });
document.getElementById("mobile-cart-btn").addEventListener("click", e => { e.preventDefault(); openCart(); closeMenu(); });
document.getElementById("close-cart").addEventListener("click", closeCartFn);
document.getElementById("overlay").addEventListener("click", closeCartFn);

const ham = document.getElementById("hamburger");
const mob = document.getElementById("mobile-menu");
ham.addEventListener("click", () => { ham.classList.toggle("open"); mob.classList.toggle("open"); });
function closeMenu() { ham.classList.remove("open"); mob.classList.remove("open"); }

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2500);
}

fetchProducts();
updateCart();

// CHECKOUT
function openCheckout() {
  if (!cart.length) {
    showToast('Your cart is empty');
    return;
  }
  closeCartFn();
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const qty = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('co-items-count').textContent = qty + ' item' + (qty !== 1 ? 's' : '');
  document.getElementById('co-total').textContent = '₦' + total.toLocaleString();
  document.getElementById('checkout-overlay').classList.add('open');
  document.getElementById('checkout-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.getElementById('checkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('checkout-overlay').addEventListener('click', closeCheckout);

async function initiatePayment() {
  const name = document.getElementById('co-name').value.trim();
  const email = document.getElementById('co-email').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const deliveryDay = document.getElementById('co-delivery-day').value;

  if (!name || !email || !phone || !address || !deliveryDay) {
    showToast('Please fill in all fields');
    return;
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = cart.map(c => ({
    product: c.id,
    name: c.name,
    price: c.price,
    size: c.size || ''
  }));

  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await fetch('https://thriftgenius-backend.onrender.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name, email, phone, address, deliveryDay },
        items,
        totalAmount: total
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Redirect to Paystack
    window.location.href = data.authorizationUrl;

  } catch (err) {
    showToast('Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Pay with Paystack';
  }
}