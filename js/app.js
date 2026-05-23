/* Shirwal Circle interactions: auth, cart, checkout->WhatsApp */
const KEY_CART = 'shirwal_circle_cart';
const KEY_USER = 'shirwal_circle_user';

/*
  ADMIN ACCOUNT MANAGEMENT
  Edit this list manually to create login accounts.
  Required fields per account:
  username, password, name, phone, address
*/
const USER_ACCOUNTS = [
  {
    username: 'demo@shirwalcircle.in',
    password: 'Shirwal@123',
    name: 'Rohan Patil',
    phone: '+91 98765 12345',
    address: 'Datta Nagar, Shirwal'
  }
];

function findAccount(username, password) {
  return USER_ACCOUNTS.find(
    (acc) => acc.username === username && acc.password === password
  ) || null;
}

function getUser(){ try{return JSON.parse(localStorage.getItem(KEY_USER)||'null')}catch{return null} }
function setUser(user){ localStorage.setItem(KEY_USER, JSON.stringify(user)); }
function logout(){ localStorage.removeItem(KEY_USER); location.href='login.html'; }

function readCart(){ try{return JSON.parse(localStorage.getItem(KEY_CART))||[]}catch{return[]} }
function writeCart(cart){ localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){ document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=readCart().reduce((s,i)=>s+i.qty,0)); }

function updateAuthUI(){
  const user=getUser();
  document.querySelectorAll('[data-auth="logged-in"]').forEach(el=>el.style.display=user?'inline-flex':'none');
  document.querySelectorAll('[data-auth="logged-out"]').forEach(el=>el.style.display=user?'none':'inline-flex');
}
function bindLogout(){ document.querySelectorAll('[data-logout]').forEach(btn=>btn.addEventListener('click',(e)=>{e.preventDefault(); logout();})); }
function requireAuth(){ if(document.body.dataset.requiresAuth==='true' && !getUser()) location.href='login.html'; }

function addToCart(item){ const c=readCart(); const f=c.find(x=>x.id===item.id); if(f)f.qty++; else c.push({...item,qty:1}); writeCart(c); }
function bindAddButtons(){ document.querySelectorAll('[data-add-product]').forEach(btn=>btn.onclick=()=>addToCart({id:btn.dataset.id,name:btn.dataset.name,price:Number(btn.dataset.price)})); }

function renderCartPage(){
  const list=document.querySelector('[data-cart-items]'); const summary=document.querySelector('[data-cart-summary]'); if(!list||!summary)return;
  const cart=readCart();
  if(!cart.length){ list.innerHTML='<p class="muted">Your cart is empty.</p>'; summary.innerHTML='<p>Total: ₹0</p>'; return; }
  list.innerHTML=cart.map((i,n)=>`<article class="glass-card card-pad"><h3>${i.name}</h3><p>₹${i.price}</p><div class="actions"><button class="glass-btn" data-dec="${n}">-</button><span>Qty: ${i.qty}</span><button class="glass-btn" data-inc="${n}">+</button><button class="glass-btn" data-del="${n}">Remove</button></div></article>`).join('');
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0), del=sub?40:0, tax=Math.round(sub*0.05), total=sub+del+tax;
  summary.innerHTML=`<p>Subtotal: ₹${sub}</p><p>Delivery: ₹${del}</p><p>Taxes: ₹${tax}</p><p class="price">Total: ₹${total}</p>`;
  list.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{cart[b.dataset.inc].qty++;writeCart(cart);renderCartPage();});
  list.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const i=cart[b.dataset.dec];i.qty=Math.max(1,i.qty-1);writeCart(cart);renderCartPage();});
  list.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{cart.splice(b.dataset.del,1);writeCart(cart);renderCartPage();});
}

function bindLogin(){
  const form=document.querySelector('[data-login-form]'); if(!form)return;
  const help=form.querySelector('[data-login-help]');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const username=form.querySelector('[name="username"]').value.trim();
    const password=form.querySelector('[name="password"]').value.trim();
    const account = findAccount(username, password);
    if(!account){ help.textContent='Invalid credentials. Ask admin to add your account in js/app.js'; return; }
    setUser({ username: account.username, name: account.name, phone: account.phone, address: account.address, loggedAt:new Date().toISOString() });
    location.href='account.html';
  });
}

function renderAccountInfo(){
  const box=document.querySelector('[data-account-info]'); if(!box)return;
  const user=getUser();
  if(!user) return;
  box.innerHTML=`<h3>${user.name}</h3><p class="muted">${user.username} • ${user.phone} • ${user.address}</p><p><span class="badge success">Logged in</span></p>`;
}

function bindCheckoutWhatsapp(){
  const form=document.querySelector('[data-checkout-form]'); if(!form)return;
  form.addEventListener('submit',e=>{e.preventDefault(); const phone=form.querySelector('[name="whatsapp"]').value.trim(); const address=form.querySelector('[name="address"]').value.trim(); const cart=readCart(); if(!phone||!address||!cart.length)return alert('Please add phone, address, and cart items.'); const lines=cart.map(i=>`- ${i.name} x${i.qty} = ₹${i.qty*i.price}`).join('%0A'); const total=cart.reduce((s,i)=>s+i.price*i.qty,0); const msg=`New Shirwal Circle Order%0AAddress: ${encodeURIComponent(address)}%0AItems:%0A${lines}%0ATotal: ₹${total}`; window.open(`https://wa.me/${phone}?text=${msg}`,'_blank'); });
}

function bindServicePopup(){
  const popup=document.querySelector('[data-service-popup]');
  if(!popup) return;
  const title=popup.querySelector('[data-popup-title]');
  const copy=popup.querySelector('[data-popup-copy]');
  const link=popup.querySelector('[data-contact-link]');
  document.querySelectorAll('.vendor-detail-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const service=btn.dataset.service;
    const text=`Hello, I need ${service} service in Shirwal. Please share availability and charges.`;
    title.textContent=service;
    copy.textContent=`You selected ${service}. Tap contact to continue on WhatsApp with preloaded request text.`;
    link.href=`https://wa.me/917066644476?text=${encodeURIComponent(text)}`;
    popup.hidden=false;
    document.body.classList.add('modal-open');
  }));
  const hide=()=>{ popup.hidden=true; document.body.classList.remove('modal-open'); };
  popup.querySelectorAll('[data-close-popup]').forEach(el=>el.addEventListener('click', hide));
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && !popup.hidden) hide(); });
}

function bindScrollTheme(){ const root=document.documentElement; window.addEventListener('scroll',()=>{ const p=Math.min(window.scrollY/(document.body.scrollHeight-window.innerHeight||1),1); root.style.setProperty('--scrollGlow',(0.3+p*0.9).toFixed(2)); }); }

document.addEventListener('DOMContentLoaded',()=>{ requireAuth(); updateCartCount(); updateAuthUI(); bindLogout(); bindAddButtons(); renderCartPage(); bindLogin(); renderAccountInfo(); bindCheckoutWhatsapp(); bindServicePopup(); bindScrollTheme(); });
