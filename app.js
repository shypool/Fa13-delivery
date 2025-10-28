/* FA13 Delivery - Frontend prototype (vanilla JS)
   - Menu statique (mock)
   - Cart (localStorage)
   - Formulaire de commande + validation
   - Simulation POST sur /api/orders
*/

const MENU = [
  { id: "m1", name: "Ragoût de bœuf", description: "Ragoût traditionnel, accompagné de banane frite.", price: 650, image: "ragout-boeuf.png" },
  { id: "m2", name: "Ragoût de poulet", description: "Poulet mijoté aux épices maison.", price: 0, image: "ragout-poulet.jpg" },
  { id: "m3", name: "Ragoût de porc", description: "Porc, légumes et épices locales.", price: 0, image: "ragout-porc.jpg" },
  { id: "m4", name: "Plat du jour (diri ak sòs pwa)", description: "Ragoût + diri + sòs pwa.", price: 0, image: "riz-sospwa.jpg" }
];

// DOM
const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartItemsEl = document.getElementById("cartItems");
const btnClear = document.getElementById("btnClear");
const orderForm = document.getElementById("orderForm");
const successSection = document.getElementById("successSection");
const successMessage = document.getElementById("successMessage");
const btnNewOrder = document.getElementById("btnNewOrder");

// Nav
const btnMenu = document.getElementById("btnMenu");
const btnOrder = document.getElementById("btnOrder");
const btnCart = document.getElementById("btnCart");
const menuSection = document.getElementById("menuSection");
const orderSection = document.getElementById("orderSection");

// Cart state (in localStorage)
let cart = JSON.parse(localStorage.getItem("fa13_cart") || "[]");

// Render menu
function renderMenu() {
  menuGrid.innerHTML = "";
  MENU.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="price">${item.price.toFixed(2)} Gdes</div>
      <div class="actions">
        <button class="btn" data-id="${item.id}" aria-label="Voir">Détails</button>
        <button class="btn primary" data-add="${item.id}">Ajouter</button>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

// Cart utilities
function saveCart() {
  localStorage.setItem("fa13_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  cartCount.textContent = cart.length;
  cartItemsEl.textContent = cart.length;
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price;
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `<div>
                      <strong>${it.name}</strong><br/>
                      <small>${it.price.toFixed(2)} Gdes</small>
                    </div>
                    <div>
                      <button class="btn" data-rem="${idx}">-</button>
                    </div>`;
    cartList.appendChild(li);
  });
  cartTotal.textContent = total.toFixed(2);
}

// Add to cart
document.addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-add");
  if (id) {
    const item = MENU.find(m => m.id === id);
    cart.push(item);
    saveCart();
    showToast(`${item.name} ajouté au panier`);
    return;
  }
  // remove item by index
  const rem = e.target.getAttribute("data-rem");
  if (rem !== null) {
    cart.splice(Number(rem), 1);
    saveCart();
    return;
  }
});

// clear cart
btnClear.addEventListener("click", () => {
  if (!confirm("Vider complètement le panier ?")) return;
  cart = [];
  saveCart();
});

// handle order submit
orderForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!name || !address || !phone) {
    alert("Merci de remplir les champs obligatoires.");
    return;
  }

  const total = cart.reduce((a,b)=>a+b.price,0);
  const orderPayload = {
    customerName: name,
    address,
    phone,
    notes,
    items: cart,
    totalPrice: total
  };

  // Show loading
  const btn = document.getElementById("btnPlaceOrder");
  btn.disabled = true;
  btn.textContent = "Envoi...";

  try {
    // If you have a backend, change the URL to your API.
    const res = await fetch("https://localhost:5001/api/orders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(orderPayload)
    });

    // If backend not available, simulate success
    if (!res.ok) {
      // simulate a success if server not present (status 404 or network)
      throw new Error("Serveur indisponible — simulation locale");
    }

    const data = await res.json();
    showSuccess(`Commande envoyée ! Réf : ${data.order?._id || 'N/A'}`);
  } catch (err) {
    // fallback: simulate a successful response and save draft in localStorage
    console.warn("Envoi réel échoué :", err.message);
    const fakeRef = "FA13-" + Date.now();
    // Save the draft order to localStorage "fa13_orders"
    const orders = JSON.parse(localStorage.getItem("fa13_orders") || "[]");
    orders.push({...orderPayload, ref: fakeRef, createdAt: new Date().toISOString()});
    localStorage.setItem("fa13_orders", JSON.stringify(orders));
    showSuccess(`Commande sauvegardée localement (réf: ${fakeRef}). Dès que le backend est disponible, tu pourras synchroniser.`);
  } finally {
    btn.disabled = false;
    btn.textContent = "Passer la commande";
    cart = [];
    saveCart();
    orderForm.reset();
  }
});

function showSuccess(msg) {
  successMessage.textContent = msg;
  menuSection.classList.add("hidden");
  orderSection.classList.add("hidden");
  successSection.classList.remove("hidden");
}

btnNewOrder.addEventListener("click", () => {
  successSection.classList.add("hidden");
  menuSection.classList.remove("hidden");
  btnMenu.classList.add("active");
  btnOrder.classList.remove("active");
});

// save draft
document.getElementById("btnSaveDraft").addEventListener("click", () => {
  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const draft = {name, address, phone, items: cart, savedAt: new Date().toISOString()};
  localStorage.setItem("fa13_draft", JSON.stringify(draft));
  showToast("Brouillon sauvegardé");
});

// small toast
function showToast(msg) {
  const t = document.createElement("div");
  t.style.position = "fixed";
  t.style.right = "20px";
  t.style.bottom = "20px";
  t.style.padding = "10px 14px";
  t.style.background = "rgba(0,0,0,0.8)";
  t.style.color = "white";
  t.style.borderRadius = "10px";
  t.style.zIndex = 9999;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2500);
}

// nav events
btnMenu.addEventListener("click", () => {
  menuSection.classList.remove("hidden");
  orderSection.classList.add("hidden");
  btnMenu.classList.add("active");
  btnOrder.classList.remove("active");
});
btnOrder.addEventListener("click", () => {
  menuSection.classList.add("hidden");
  orderSection.classList.remove("hidden");
  btnOrder.classList.add("active");
  btnMenu.classList.remove("active");
});
btnCart.addEventListener("click", () => {
  menuSection.classList.add("hidden");
  orderSection.classList.remove("hidden");
  btnOrder.classList.add("active");
  btnMenu.classList.remove("active");
});

// initial render
renderMenu();
updateCartUI();

// load draft if present
const draft = JSON.parse(localStorage.getItem("fa13_draft") || "null");
if (draft) {
  document.getElementById("customerName").value = draft.name || "";
  document.getElementById("address").value = draft.address || "";
  document.getElementById("phone").value = draft.phone || "";
  if (Array.isArray(draft.items) && draft.items.length) {
    cart = draft.items;
    saveCart();
  }
}
