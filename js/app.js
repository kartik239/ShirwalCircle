/* Shirwal Circle core interactions: login, cart, checkout->WhatsApp */
const KEY_CART = 'shirwal_circle_cart';
const KEY_USER = 'shirwal_circle_user';

function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY_CART)) || []; } catch { return []; }
}
function writeCart(cart) { localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() {
  const el = document.querySelector('[data-cart-count]');
  if (!el) return;
  const total = readCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = total;
}
function addToCart(item) {
  const cart = readCart();
  const found = cart.find((x) => x.id === item.id);
  if (found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });
  writeCart(cart);
  alert(`${item.name} added to cart`);
}

function bindAddButtons() {
  document.querySelectorAll('[data-add-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
      });
    });
  });
}

function renderCartPage() {
  const list = document.querySelector('[data-cart-items]');
  const summary = document.querySelector('[data-cart-summary]');
  if (!list || !summary) return;
  const cart = readCart();
  if (!cart.length) {
    list.innerHTML = '<p class="muted">Your cart is empty.</p>';
    summary.innerHTML = '<p>Total: ₹0</p>';
    return;
  }
  list.innerHTML = cart.map((item, idx) => `
    <article class="glass-card card-pad">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <div class="actions">
        <button class="glass-btn" data-dec="${idx}">-</button>
        <span>Qty: ${item.qty}</span>
        <button class="glass-btn" data-inc="${idx}">+</button>
        <button class="glass-btn" data-del="${idx}">Remove</button>
      </div>
    </article>
  `).join('');
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const delivery = subtotal ? 40 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + taxes;
  summary.innerHTML = `<p>Subtotal: ₹${subtotal}</p><p>Delivery: ₹${delivery}</p><p>Taxes: ₹${taxes}</p><p class="price">Total: ₹${total}</p>`;

  list.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{cart[b.dataset.inc].qty++; writeCart(cart); renderCartPage();});
  list.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const i=cart[b.dataset.dec]; i.qty=Math.max(1,i.qty-1); writeCart(cart); renderCartPage();});
  list.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{cart.splice(b.dataset.del,1); writeCart(cart); renderCartPage();});
}

function bindLogin() {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value.trim();
    if (!email || !password) return;
    const payload = { email, password, loggedAt: new Date().toISOString() };
    localStorage.setItem(KEY_USER, JSON.stringify(payload));
    alert('Login saved locally for demo.');
    location.href = 'account.html';
  });
}

function renderCredentialsPage() {
  const box = document.querySelector('[data-credentials]');
  if (!box) return;
  const user = JSON.parse(localStorage.getItem(KEY_USER) || 'null');
  box.innerHTML = user ? `<p><strong>Email:</strong> ${user.email}</p><p><strong>Password:</strong> ${user.password}</p><p><strong>Logged At:</strong> ${user.loggedAt}</p>` : '<p>No saved credentials.</p>';
}

function bindCheckoutWhatsapp() {
  const form = document.querySelector('[data-checkout-form]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = form.querySelector('[name="whatsapp"]').value.trim();
    const address = form.querySelector('[name="address"]').value.trim();
    const cart = readCart();
    if (!phone || !address || !cart.length) return alert('Please add phone, address, and cart items.');
    const lines = cart.map((i)=>`- ${i.name} x${i.qty} = ₹${i.qty*i.price}`).join('%0A');
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const msg = `New Shirwal Circle Order%0AAddress: ${encodeURIComponent(address)}%0AItems:%0A${lines}%0ATotal: ₹${total}`;
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  bindAddButtons();
  renderCartPage();
  bindLogin();
  renderCredentialsPage();
  bindCheckoutWhatsapp();
});
