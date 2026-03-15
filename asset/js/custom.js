 const products = [
  { id:1,  name:"Vintage Jacket",        cat:"bags",        price:18000, sold:false, badge:"",    img:"asset/img/item1.jpg" },
  { id:2,  name:"Street Hoodie",         cat:"jerseys",     price:12000, sold:true,  badge:"",    img:"asset/img/item2.jpg" },
  { id:3,  name:"Baggy Jeans",           cat:"dresses",     price:15000, sold:false, badge:"",    img:"asset/img/item3.jpg" },
  { id:4,  name:"Graphic Tee",           cat:"jerseys",     price:8000,  sold:false, badge:"new", img:"asset/img/item4.jpg" },
  { id:5,  name:"Leather Tote",          cat:"bags",        price:21000, sold:false, badge:"new", img:"asset/img/item5.jpg" },
  { id:6,  name:"Mini Dress",            cat:"dresses",     price:14000, sold:false, badge:"",    img:"asset/img/item6.jpg" },
  { id:7,  name:"Gold Necklace",         cat:"accessories", price:6500,  sold:true,  badge:"",    img:"asset/img/item7.jpg" },
  { id:8,  name:"Retro Sunglasses",      cat:"accessories", price:4500,  sold:false, badge:"new", img:"asset/img/item8.jpg" },
  { id:9,  name:"Oversized Blazer",      cat:"dresses",     price:19000, sold:false, badge:"new", img:"asset/img/item9.jpg" },
  { id:10, name:"Bucket Hat",            cat:"accessories", price:3500,  sold:false, badge:"",    img:"asset/img/item10.jpg" },
  { id:11, name:"Crossbody Bag",         cat:"bags",        price:16000, sold:false, badge:"",    img:"asset/img/item11.jpg" },
  { id:12, name:"Club Jersey",           cat:"jerseys",     price:11000, sold:true,  badge:"",    img:"asset/img/item12.jpg" },
  { id:13, name:"Denim Skirt",           cat:"dresses",     price:9000,  sold:false, badge:"new", img:"asset/img/item13.jpg" },
  { id:14, name:"Chunky Bracelet",       cat:"accessories", price:5000,  sold:false, badge:"",    img:"asset/img/item14.jpg" },
  { id:15, name:"Shoulder Bag",          cat:"bags",        price:17500, sold:false, badge:"new", img:"asset/img/item15.jpg" },
  { id:16, name:"Vintage Band Tee",      cat:"jerseys",     price:7500,  sold:false, badge:"",    img:"asset/img/item16.jpg" },
  { id:17, name:"Wrap Dress",            cat:"dresses",     price:13000, sold:false, badge:"",    img:"asset/img/item17.jpg" },
  { id:18, name:"Hoop Earrings",         cat:"accessories", price:3000,  sold:false, badge:"new", img:"asset/img/item18.jpg" },
  { id:19, name:"Mini Backpack",         cat:"bags",        price:14000, sold:true,  badge:"",    img:"asset/img/item19.jpg" },
  { id:20, name:"Retro Track Jacket",    cat:"jerseys",     price:13500, sold:false, badge:"new", img:"asset/img/item20.jpg" },
  { id:21, name:"Flared Trousers",       cat:"dresses",     price:11500, sold:false, badge:"",    img:"asset/img/item21.jpg" },
  { id:22, name:"Beaded Necklace",       cat:"accessories", price:4000,  sold:false, badge:"",    img:"asset/img/item22.jpg" },
  { id:23, name:"Duffle Bag",            cat:"bags",        price:22000, sold:false, badge:"",    img:"asset/img/item23.jpg" },
  { id:24, name:"Vintage Polo",          cat:"jerseys",     price:8500,  sold:false, badge:"new", img:"asset/img/item24.jpg" },
  { id:25, name:"Slip Dress",            cat:"dresses",     price:12500, sold:true,  badge:"",    img:"asset/img/item25.jpg" },
  { id:26, name:"Chain Belt",            cat:"accessories", price:5500,  sold:false, badge:"",    img:"asset/img/item26.jpg" },
  { id:27, name:"Woven Tote",            cat:"bags",        price:9500,  sold:false, badge:"new", img:"asset/img/item27.jpg" },
  { id:28, name:"Football Jersey",       cat:"jerseys",     price:10000, sold:false, badge:"",    img:"asset/img/item28.jpg" },
  { id:29, name:"Linen Co-ord Set",      cat:"dresses",     price:17000, sold:false, badge:"new", img:"asset/img/item29.jpg" },
  { id:30, name:"Vintage Watch",         cat:"accessories", price:25000, sold:false, badge:"new", img:"asset/img/item30.jpg" },
  { id:31, name:"Baguette Bag",          cat:"bags",        price:18500, sold:false, badge:"",    img:"asset/img/item31.jpg" },
  { id:32, name:"Tie-Dye Tee",           cat:"jerseys",     price:6000,  sold:true,  badge:"",    img:"asset/img/item32.jpg" },
];

const PAGE_SIZE = 8;
let cart = [];
let liked = new Set();
let activeCat = "all";
let visibleCount = PAGE_SIZE;

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
        <button class="wish-btn ${liked.has(p.id) ? 'liked' : ''}" onclick="toggleLike(${p.id})">
          <i class="bi ${liked.has(p.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="cat-label">${p.cat}</div>
        <h3>${p.name}</h3>
        <div class="product-price ${p.sold ? 'sold' : ''}">&#8358;${p.price.toLocaleString()}</div>
        <button class="add-btn" ${p.sold ? "disabled" : ""} onclick="addToCart(${p.id})">
          ${p.sold ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  `).join("");

  // Update load more button
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

// Category filter — resets visible count each time
document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    visibleCount = PAGE_SIZE;
    renderProducts();
  });
});

// Load more
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
  document.getElementById("cart-total").textContent = "&#8358;" + total.toLocaleString();

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
      <button class="remove-item" onclick="removeFromCart(${c.id})"><i class="bi bi-x"></i></button>
    </div>
  `).join("");
}

function openCart()  {
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

renderProducts();
updateCart();