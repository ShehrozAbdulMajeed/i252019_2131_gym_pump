/* main.js - cart, navigation, recommender */

// basic product data (same structure used in fitguide.js)
const PRODUCTS = [
  { id: "p01", name: "Fitted Gym Shirt", price: 2499, availableSizes:["S","M","L"], fitType:["compressed","standard"], workoutTags:["push"], image:"../images/shirt01.png"},
  { id: "p02", name: "Training Shorts", price: 1999, availableSizes:["M","L","XL"], fitType:["standard"], workoutTags:["push","leg"], image:"../images/shorts01.png"},
  { id: "p03", name: "Performance Joggers", price: 3299, availableSizes:["M","L","XL"], fitType:["standard"], workoutTags:["running","leg"], image:"../images/joggers01.png"},
  { id: "p04", name: "Pump Cover Hoodie", price: 3499, availableSizes:["L","XL"], fitType:["oversized"], workoutTags:["push"], image:"../images/hoodie01.png"}
];

// ---------- cart helpers ----------
function getCart() {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(productId, size="M", qty=1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, size, qty });
  saveCart(cart);
  alert("Product added to cart!");
  console.log("Product added:", productId, size);
}

// Called from collection pages to go to product page with id param
function goToProduct(id) {
  // use product.html and pass id
  window.location.href = `product.html?id=${id}`;
}

// Render cart on cart.html
function renderCart() {
  const container = document.getElementById("cartList");
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }
  let html = "<ul style='list-style:none;padding:0;'>";
  let total = 0;
  cart.forEach(item => {
    const prod = PRODUCTS.find(p => p.id === item.id) || {};
    const subtotal = (prod.price || 0) * item.qty;
    total += subtotal;
    html += `<li style="margin-bottom:12px;">
      <img src="${prod.image}" style="width:80px;vertical-align:middle;border-radius:8px;margin-right:10px;">
      <strong>${prod.name}</strong> &nbsp; Size: ${item.size} &nbsp; Qty: ${item.qty}
      <button style="margin-left:12px;" onclick='removeFromCart("${item.id}","${item.size}")'>Remove</button>
      <div>Rs. ${subtotal}</div>
    </li>`;
  });
  html += `</ul><h3>Total: Rs. ${total}</h3>`;
  container.innerHTML = html;
}

function removeFromCart(id, size) {
  let cart = getCart();
  cart = cart.filter(it => !(it.id === id && it.size === size));
  saveCart(cart);
  renderCart();
  console.log("Removed from cart", id, size);
}

function checkout() {
  // if no items, prompt
  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  // Save purchases to 'purchases' and clear cart
  const purchasesRaw = localStorage.getItem("purchases");
  const purchases = purchasesRaw ? JSON.parse(purchasesRaw) : [];
  // Add simple purchase entries
  cart.forEach(it => {
    const prod = PRODUCTS.find(p => p.id === it.id);
    purchases.push({ productId: it.id, tags: prod ? prod.workoutTags : [] });
  });
  localStorage.setItem("purchases", JSON.stringify(purchases));
  localStorage.removeItem("cart");
  alert("Proceeding to checkout page.");
  window.location.href = "pages/checkout.html";
}

// On product.html, load product info from query string
function loadProductPage() {
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");
  if (!id) return;
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  // find elements and populate (if they exist)
  const titleEl = document.getElementById("prodTitle");
  const imgEl = document.getElementById("prodImage");
  const priceEl = document.getElementById("prodPrice");
  const descEl = document.getElementById("prodDesc");
  const sizesEl = document.getElementById("sizeSelect");

  if (titleEl) titleEl.innerText = prod.name;
  if (imgEl) imgEl.src = prod.image;
  if (priceEl) priceEl.innerText = "Rs. " + prod.price;
  if (descEl) descEl.innerText = "A great choice for your " + prod.workoutTags.join(", ") + " workouts.";
  if (sizesEl) {
    sizesEl.innerHTML = "";
    prod.availableSizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.innerText = s;
      sizesEl.appendChild(opt);
    });
  }

  // recommended area: other products with same workoutTags
  const recArea = document.getElementById("recommendedArea");
  if (recArea) {
    const recs = PRODUCTS.filter(p => p.id !== prod.id && p.workoutTags.some(t => prod.workoutTags.includes(t)));
    let out = recs.map(r => `<div class="product-card" style="width:200px;">
      <img src="${r.image}" alt="${r.name}" style="width:100%;">
      <h4>${r.name}</h4>
      <p>Rs. ${r.price}</p>
      <button onclick='addToCart("${r.id}")'>Add</button>
    </div>`).join("");
    recArea.innerHTML = out || "<p>No recommendations available.</p>";
  }
}

// simple recommender: detect user's dominant workout tag from purchases
function getUserWorkoutStyle() {
  const purchasesRaw = localStorage.getItem("purchases");
  if (!purchasesRaw) return null;
  const purchases = JSON.parse(purchasesRaw);
  const counts = {};
  purchases.forEach(p => {
    (p.tags || []).forEach(tag => counts[tag] = (counts[tag] || 0) + 1);
  });
  let best = null, bestCount = 0;
  Object.entries(counts).forEach(([k,v]) => { if (v>bestCount) { best=k; bestCount=v; }});
  console.log("User workout style determined:", best);
  return best;
}

// On pages where appropriate, show 'Recommended for your X'
function showPersonalRecommendations(containerId) {
  const style = getUserWorkoutStyle();
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!style) {
    container.innerHTML = "<p>Browse products and make purchases to get personalized recommendations.</p>";
    return;
  }
  const recs = PRODUCTS.filter(p => p.workoutTags.includes(style)).slice(0,4);
  container.innerHTML = recs.map(r => `<div class="product-card">
      <img src="${r.image}" alt="${r.name}">
      <h4>${r.name}</h4>
      <p>Rs. ${r.price}</p>
      <button onclick='addToCart("${r.id}")'>Add to cart</button>
    </div>`).join("");
}

// Run on DOM load for pages
document.addEventListener("DOMContentLoaded", function(){
  renderCart();  // safe to call on pages that have cartList or not
  loadProductPage();
});
