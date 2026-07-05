const API = '/api';
const WA = '5491136534668';

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

let products = [];
let categories = [];
let currentCategory = 'oferta';

const WA_SVG = `<svg class="wa-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

function waLink(name, price) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(`Hola Meri! Me interesa: *${name}* (${price}). ¿Está disponible?`)}`;
}

function productCard(p) {
  const ss = p.stock === 'sin-stock';
  const genderUpper = p.gender ? p.gender.toUpperCase() : '';
  const isKit = genderUpper.includes('KIT');
  const isMini = genderUpper.includes('MINI');
  const img = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  return `<div class="product-card${ss ? ' sin-stock' : ''}">
    <div class="product-img-wrap">
      ${img}<div class="product-img-placeholder" style="${p.img ? 'display:none' : ''}">🌿</div>
      ${ss ? '<span class="badge-sin-stock">Sin stock</span>' : ''}
      ${isKit ? '<span class="badge-kit">Kit</span>' : ''}
      ${isMini ? '<span class="badge-kit" style="background:var(--accent)">Mini</span>' : ''}
    </div>
    <div class="product-body">
      <div class="product-gender">${p.gender}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${ss ? '<span style="color:var(--sin-stock);font-size:.85rem">Sin stock</span>' : p.price}</div>
      ${!ss
        ? `<a href="${waLink(p.name, p.price)}" target="_blank" class="btn-wa">${WA_SVG} Pedir por WhatsApp</a>`
        : '<span style="font-size:11px;color:var(--sin-stock);font-weight:600">No disponible</span>'}
    </div>
  </div>`;
}

function skeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-card skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>`;
  }
  return html;
}

function renderTabs() {
  const nav = document.getElementById('catTabs');
  let html = `<button class="cat-tab active" onclick="showSection('oferta',this)">Oferta</button>`;
  categories.forEach((c) => {
    html += `<button class="cat-tab" onclick="showSection('${c.id}',this)">${c.name}</button>`;
  });
  nav.innerHTML = html;
}

function renderSections() {
  const main = document.getElementById('mainSections');
  let html = `<section class="section visible" id="section-oferta">
    <h2 class="section-title">Oferta de la <em>semana</em></h2>
    <div class="section-divider"></div>
    <div class="offer-banner" id="offer-banner">
      <span class="offer-badge">Esta semana</span>
      <div class="offer-img-wrap" id="offerImgWrap"><div class="offer-img-placeholder">🌿</div></div>
      <div class="offer-info">
        <h3 id="offerTitle"></h3>
        <p id="offerDesc"></p>
        <div class="offer-price" id="offerPrice"></div>
      </div>
      <a href="#" target="_blank" class="offer-wa" id="offerWaLink">
        ${WA_SVG} Consultar por WhatsApp
      </a>
    </div>
    <h3 style="font-family:'Playfair Display',serif;color:var(--brown-deep);margin-bottom:8px;font-size:1.05rem;">Todos los productos</h3>
    <p style="font-size:13px;color:var(--text-light);margin-bottom:22px;">Navegá las categorías para ver cada línea en detalle.</p>
    <div class="products-grid" id="featured-grid"></div>
  </section>`;

  categories.forEach((c) => {
    html += `<section class="section" id="section-${c.id}">
      <h2 class="section-title">${c.name}</h2>
      <div class="section-divider"></div>
      <div class="products-grid" id="grid-${c.id}"></div>
    </section>`;
  });

  main.innerHTML = html;
}

function renderProducts() {
  categories.forEach((c) => {
    const el = document.getElementById(`grid-${c.id}`);
    if (!el) return;
    const items = products.filter((p) => p.cat_id === c.id);
    el.innerHTML = items.length
      ? items.map(productCard).join('')
      : '<p style="color:var(--text-light);font-size:14px">No hay productos en esta categoría.</p>';
  });

  const fg = document.getElementById('featured-grid');
  if (fg) {
    const featured = products.filter((p) => p.stock === 'disponible').slice(0, 8);
    fg.innerHTML = featured.map(productCard).join('');
  }

  initLazyLoading();
}

function renderOffer(offer) {
  document.getElementById('offerTitle').textContent = offer.name || '';
  document.getElementById('offerDesc').textContent = offer.description || '';
  document.getElementById('offerPrice').textContent = offer.price || '';
  document.getElementById('offerWaLink').href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hola Meri! Me interesa la Oferta de la Semana: ${offer.name} ${offer.price}`)}`;

  const imgWrap = document.getElementById('offerImgWrap');
  if (offer.img) {
    imgWrap.innerHTML = `<img src="${offer.img}" alt="${offer.name}" loading="lazy">`;
  }
}

function showSection(id, btn) {
  clearSearch();
  currentCategory = id;
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('visible'));
  document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
  const section = document.getElementById(`section-${id}`);
  if (section) section.classList.add('visible');
  if (btn) btn.classList.add('active');
}

function handleSearch(q) {
  const trimmed = q.trim();
  document.getElementById('clearBtn').style.display = trimmed ? 'block' : 'none';
  if (!trimmed) {
    document.getElementById('searchSection').classList.remove('visible');
    document.querySelectorAll('.section').forEach((s) => {
      if (s.id === 'section-oferta') s.classList.add('visible');
      else s.classList.remove('visible');
    });
    document.querySelectorAll('.cat-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    return;
  }
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('visible'));
  document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
  document.getElementById('searchSection').classList.add('visible');

  const lower = normalize(trimmed);
  const results = products.filter(
    (p) =>
      normalize(p.name).includes(lower) ||
      normalize(p.gender).includes(lower) ||
      normalize(p.cat_id).includes(lower)
  );
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = results.length
    ? results.map(productCard).join('')
    : `<div class="no-results" style="grid-column:1/-1">No encontramos "${trimmed}" en el catálogo.</div>`;
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearBtn').style.display = 'none';
  document.getElementById('searchSection').classList.remove('visible');
}

function initLazyLoading() {
  const cards = document.querySelectorAll('.product-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );
    cards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(card);
    });
  }
}

async function loadData() {
  const grid = document.getElementById('featured-grid');
  if (grid) grid.innerHTML = skeletonCards(8);

  try {
    const [prodsRes, catsRes, offerRes] = await Promise.all([
      fetch(`${API}/products`),
      fetch(`${API}/categories`),
      fetch(`${API}/offer`),
    ]);

    products = await prodsRes.json();
    categories = await catsRes.json();
    const offer = await offerRes.json();

    renderTabs();
    renderSections();
    renderProducts();
    renderOffer(offer);
  } catch (err) {
    console.error('Error cargando datos:', err);
    document.getElementById('featured-grid').innerHTML =
      '<p style="text-align:center;color:var(--text-light);padding:40px;">Error al cargar el catálogo. Intentá recargar.</p>';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

loadData();
