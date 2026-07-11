 let products = [];
const PAGE_SIZE = 8;
let cart = JSON.parse(localStorage.getItem('tg_cart') || '[]');
let liked = new Set();
let activeCat = "all";
let visibleCount = PAGE_SIZE;
let deliveryFee = 0;

let currentSlideIndex = 0;
let modalImages = [];
let touchStartX = 0;
let touchEndX = 0;
let selectedModalSizeValue = "";
let currentModalProduct = null;

async function fetchProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = `<div style="grid-column:span 4;text-align:center;padding:60px 20px;color:#888">
    <div style="width:32px;height:32px;border:3px solid #eee;border-top-color:#1a6b35;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    Loading products...
  </div>`;

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
      img: p.images[0] || '',
      images: p.images || [],
      video: p.video || '',
      description: p.description || '',
      sizes: p.sizes || []
    }));
    renderProducts();
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:span 4;text-align:center;padding:60px 20px;color:#888">
      <p>Could not load products. Please refresh the page.</p>
      <button onclick="fetchProducts()" style="margin-top:12px;padding:10px 24px;background:#1a6b35;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px">Try Again</button>
    </div>`;
    console.log('Could not load products:', err);
  }
}

function getFiltered() {
  if (activeCat === "all") return products;
  return products.filter(p => p.cat === activeCat || p.cat.startsWith(activeCat + '-'));
}

function renderProducts() {
  const filtered = getFiltered();
  const toShow = filtered.slice(0, visibleCount);
  const grid = document.getElementById("product-grid");

  document.getElementById("item-count").textContent =
    filtered.length + " item" + (filtered.length !== 1 ? "s" : "");

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:span 4;text-align:center;padding:60px 20px;color:#aaa"><i class="bi bi-bag" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3"></i><p>No items in this category yet.</p></div>`;
    document.getElementById("load-more-btn").disabled = true;
    document.getElementById("load-more-btn").textContent = "All items loaded";
    return;
  }

  grid.innerHTML = toShow.map(p => `
    <div class="product-card">
      <div class="product-img" onclick="openProductModal('${p.id}')">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/300x400/eeeeee/999999?text=No+Image'">
        ${p.sold ? '<span class="sold-out-badge">Sold Out</span>' : p.badge === "new" ? '<span class="new-badge">New</span>' : ''}
        <button class="wish-btn ${liked.has(p.id) ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${p.id}')">
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
  if (remaining <= 0) { btn.textContent = "All items loaded"; btn.disabled = true; }
  else { btn.textContent = "Load More (" + remaining + " remaining)"; btn.disabled = false; }
}

// Main category buttons
document.querySelectorAll(".main-cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".main-cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".sub-cats").forEach(s => s.style.display = "none");
    const cat = btn.dataset.cat;
    if (["clothing", "footwear", "accessories", "bottoms"].includes(cat)) {
      const sub = document.getElementById("sub-" + cat);
      if (sub) {
        sub.style.display = "flex";
        sub.querySelectorAll(".sub-cat-btn").forEach(b => b.classList.remove("active-sub"));
        sub.querySelectorAll(".sub-cat-btn")[0].classList.add("active-sub");
      }
    }
    activeCat = cat;
    visibleCount = PAGE_SIZE;
    renderProducts();
  });
});

// Sub category buttons
document.querySelectorAll(".sub-cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".sub-cats").querySelectorAll(".sub-cat-btn").forEach(b => b.classList.remove("active-sub"));
    btn.classList.add("active-sub");
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

function addToCart(id, size) {
  size = size || '';
  const p = products.find(x => x.id === id);
  if (!p || p.sold) return;
  const ex = cart.find(x => x.id === id && (x.size || '') === size);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1, size });
  localStorage.setItem('tg_cart', JSON.stringify(cart));
  updateCart();
  showToast(p.name + (size ? ` (${size})` : '') + " added to cart");
}

function removeFromCart(id, size) {
  size = size || '';
  cart = cart.filter(x => !(x.id === id && (x.size || '') === size));
  localStorage.setItem('tg_cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const qty = cart.reduce((s, c) => s + c.qty, 0);
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
        <h4>${c.name}${c.size ? ' — ' + c.size : ''}</h4>
        <div class="cat">${c.cat} &times; ${c.qty}</div>
        <div class="price">&#8358;${(c.price * c.qty).toLocaleString()}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${c.id}', '${c.size || ''}')"><i class="bi bi-x"></i></button>
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

// CHECKOUT
function openCheckout() {
  if (!cart.length) { showToast('Your cart is empty'); return; }
  closeCartFn();
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const qty = cart.reduce((s, c) => s + c.qty, 0);
  deliveryFee = 0;
  document.getElementById('co-items-count').textContent = qty + ' item' + (qty !== 1 ? 's' : '');
  document.getElementById('co-delivery-fee').textContent = '₦0';
  document.getElementById('co-total').textContent = '₦' + total.toLocaleString();
  document.getElementById('co-delivery-area').value = '0';
  document.getElementById('checkout-overlay').classList.add('open');
  document.getElementById('checkout-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateDeliveryFee() {
  const select = document.getElementById('co-delivery-area');
  deliveryFee = Number(select.value) || 0;
  document.getElementById('co-delivery-fee').textContent = '₦' + deliveryFee.toLocaleString();
  const itemsTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('co-total').textContent = '₦' + (itemsTotal + deliveryFee).toLocaleString();
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
  const areaSelect = document.getElementById('co-delivery-area');
  const deliveryArea = areaSelect.options[areaSelect.selectedIndex].text;

  if (!name || !email || !phone || !address || !deliveryDay) {
    showToast('Please fill in all required fields');
    return;
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0) + deliveryFee;
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
        customer: { name, email, phone, address, deliveryDay, deliveryArea, deliveryFee },
        items,
        totalAmount: total
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    window.location.href = data.authorizationUrl;

  } catch (err) {
    showToast(err.message || 'Error processing payment');
    btn.disabled = false;
    btn.textContent = 'Pay with Paystack';
  }
}

// PRODUCT MODAL / SLIDER
function openProductModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentModalProduct = p;
  currentSlideIndex = 0;
  selectedModalSizeValue = "";

  modalImages = p.images && p.images.length ? p.images : [p.img];

  document.getElementById('pm-cat').textContent = p.cat;
  document.getElementById('pm-name').textContent = p.name;
  document.getElementById('pm-price').textContent = '₦' + p.price.toLocaleString();
  document.getElementById('pm-description').textContent = p.description || '';

  const slider = document.getElementById('product-modal-slider');
  slider.innerHTML = modalImages.map(src =>
    `<div><img src="${src}" onerror="this.src='https://placehold.co/400x500/eeeeee/999999?text=No+Image'"></div>`
  ).join('');

  if (p.video) {
    slider.innerHTML += `<div><video src="${p.video}" controls muted style="width:100%;height:100%;object-fit:cover"></video></div>`;
    modalImages = [...modalImages, p.video];
  }

  updateModalDots();

  const sizesWrap = document.getElementById('pm-sizes-wrap');
  if (p.sizes && p.sizes.length) {
    sizesWrap.style.display = 'block';
    document.getElementById('pm-sizes').innerHTML = p.sizes.map(s =>
      `<button class="pm-size-btn" onclick="selectModalSize(this, '${s}')">${s}</button>`
    ).join('');
  } else {
    sizesWrap.style.display = 'none';
  }

  const addBtn = document.getElementById('pm-add-btn');
  if (p.sold) { addBtn.textContent = 'Sold Out'; addBtn.disabled = true; }
  else { addBtn.textContent = 'Add to Cart'; addBtn.disabled = false; }

  document.getElementById('product-modal-overlay').classList.add('open');
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  updateSliderPosition();
}

function updateSliderPosition() {
  const slider = document.getElementById('product-modal-slider');
  slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  updateModalDots();
}

function updateModalDots() {
  const dots = document.getElementById('product-modal-dots');
  if (!dots) return;
  dots.innerHTML = modalImages.map((_, i) =>
    `<div class="pm-dot ${i === currentSlideIndex ? 'active' : ''}" onclick="goToSlide(${i})"></div>`
  ).join('');
}

function goToSlide(i) { currentSlideIndex = i; updateSliderPosition(); }
function nextSlide() { currentSlideIndex = (currentSlideIndex + 1) % modalImages.length; updateSliderPosition(); }
function prevSlide() { currentSlideIndex = (currentSlideIndex - 1 + modalImages.length) % modalImages.length; updateSliderPosition(); }

function selectModalSize(btn, size) {
  document.querySelectorAll('.pm-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedModalSizeValue = size;
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').classList.remove('open');
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCartFromModal() {
  if (!currentModalProduct || currentModalProduct.sold) return;
  if (currentModalProduct.sizes && currentModalProduct.sizes.length && !selectedModalSizeValue) {
    showToast('Please select a size');
    return;
  }
  addToCart(currentModalProduct.id, selectedModalSizeValue);
  selectedModalSizeValue = "";
  closeProductModal();
}

// Touch swipe for mobile slider
const sliderEl = document.getElementById('product-modal-slider');
if (sliderEl) {
  sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  sliderEl.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) nextSlide();
    else if (touchEndX - touchStartX > 50) prevSlide();
  }, { passive: true });
}

fetchProducts();
updateCart();
setInterval(fetchProducts, 60000);