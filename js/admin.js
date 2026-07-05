const API = '/api';
let token = localStorage.getItem('meri_token');
let products = [];
let categories = [];
let currentAdminSearch = '';

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// ── AUTH ──
function getToken() { return token; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }; }

async function tryLogin() {
  const val = document.getElementById('adminPass').value;
  const btn = document.getElementById('btnLogin');
  btn.classList.add('loading');
  btn.textContent = 'Verificando...';
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: val }),
    });
    const data = await res.json();
    btn.classList.remove('loading');
    btn.textContent = 'Ingresar';
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem('meri_token', token);
      document.getElementById('loginScreen').classList.remove('open');
      openAdmin();
    } else {
      const inp = document.getElementById('adminPass');
      inp.classList.add('error');
      document.getElementById('loginError').style.display = 'block';
      inp.value = '';
      inp.focus();
    }
  } catch {
    btn.classList.remove('loading');
    btn.textContent = 'Ingresar';
    document.getElementById('loginError').textContent = 'Error de conexión.';
    document.getElementById('loginError').style.display = 'block';
  }
}

function togglePassVis() {
  const i = document.getElementById('adminPass');
  const e = document.getElementById('eyeIcon');
  if (i.type === 'password') { i.type = 'text'; e.textContent = '🙈'; }
  else { i.type = 'password'; e.textContent = '👁'; }
}

// ── ADMIN ──
async function openAdmin() {
  await loadData();
  renderAdminList();
  renderCategoryList();
  loadOfferForm();
  populateSelects();
  document.getElementById('adminPanel').classList.add('open');
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('loginScreen').classList.remove('open');
  document.body.style.overflow = '';
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// ── DATA ──
async function loadData() {
  try {
    const [prodsRes, catsRes] = await Promise.all([
      fetch(`${API}/products`),
      fetch(`${API}/categories`),
    ]);
    products = await prodsRes.json();
    categories = await catsRes.json();
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

// ── SELECTS ──
function populateSelects() {
  const selects = ['newCat', 'editCat'];
  selects.forEach((id) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  });
}

// ── PRODUCTS LIST ──
function renderAdminList(filter = '') {
  const list = document.getElementById('adminProductList');
  const lower = normalize(filter);
  const filtered = products.filter(
    (p) =>
      !lower ||
      normalize(p.name).includes(lower) ||
      normalize(p.gender).includes(lower) ||
      normalize(p.cat_id).includes(lower) ||
      normalize(p.stock).includes(lower)
  );

  const grouped = {};
  filtered.forEach((p) => {
    if (!grouped[p.cat_id]) grouped[p.cat_id] = [];
    grouped[p.cat_id].push(p);
  });

  let html = '';
  categories.forEach((c) => {
    const items = grouped[c.id];
    if (!items || !items.length) return;
    html += `<div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-light);margin:18px 0 7px;padding-left:3px">${c.name}</div>`;
    items.forEach((p) => {
      const stockClass = p.stock === 'disponible' ? 'disponible' : 'agotado';
      const stockLabel = p.stock === 'disponible' ? '✓ Disponible' : '✗ Sin stock';
      html += `<div class="admin-product-item">
        <div class="item-name">${p.name}</div>
        <div class="item-price">${p.price}</div>
        <span class="item-stock ${stockClass}">${stockLabel}</span>
        <div class="item-actions">
          <button class="btn-edit" onclick="openEditModal('${p.id}')">Editar</button>
          <button class="btn-toggle-stock" onclick="toggleStock('${p.id}')">${p.stock === 'disponible' ? 'Sin stock' : 'Disponible'}</button>
          <button class="btn-del" onclick="deleteProduct('${p.id}')">Eliminar</button>
        </div>
      </div>`;
    });
  });

  if (!filtered.length) {
    html = '<p style="text-align:center;color:var(--text-light);padding:30px;">No se encontraron productos.</p>';
  }

  list.innerHTML = html;
}

function filterAdminList(q) {
  currentAdminSearch = q;
  const clearBtn = document.getElementById('clearAdminSearch');
  clearBtn.classList.toggle('visible', q.trim().length > 0);
  renderAdminList(q);
}

function clearAdminSearch() {
  document.getElementById('adminSearchInput').value = '';
  document.getElementById('clearAdminSearch').classList.remove('visible');
  currentAdminSearch = '';
  renderAdminList();
}

// ── ADD PRODUCT ──
async function addProduct() {
  const name = document.getElementById('newName').value.trim();
  const price = document.getElementById('newPrice').value.trim();
  const gender = document.getElementById('newGender').value.trim();
  const cat_id = document.getElementById('newCat').value;
  const img = document.getElementById('newImg').value;
  if (!name || !price) {
    document.getElementById('addError').style.display = 'block';
    return;
  }
  document.getElementById('addError').style.display = 'none';

  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, gender, price, cat_id, img, stock: 'disponible' }),
    });
    if (res.ok) {
      const data = await res.json();
      products.push({ id: String(data.id), name, gender, price, cat_id, stock: 'disponible', img });
      document.getElementById('newName').value = '';
      document.getElementById('newGender').value = '';
      document.getElementById('newPrice').value = '';
      document.getElementById('newImg').value = '';
      resetUploadArea('newImgUpload');
      document.getElementById('addSuccess').style.display = 'block';
      setTimeout(() => document.getElementById('addSuccess').style.display = 'none', 1500);
      renderAdminList(currentAdminSearch);
    }
  } catch (err) {
    console.error('Error agregando producto:', err);
  }
}

// ── EDIT PRODUCT ──
function openEditModal(id) {
  const p = products.find((x) => x.id == id);
  if (!p) return;
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = p.name;
  document.getElementById('editGender').value = p.gender;
  document.getElementById('editPrice').value = p.price;
  document.getElementById('editCat').value = p.cat_id;
  document.getElementById('editImg').value = p.img || '';
  document.getElementById('editStock').value = p.stock;
  document.getElementById('editSuccess').style.display = 'none';

  const uploadArea = document.getElementById('editImgUpload');
  if (p.img) {
    uploadArea.classList.add('has-image');
    uploadArea.innerHTML = `<img src="${p.img}" alt="${p.name}">
      <button class="upload-remove" onclick="event.stopPropagation();removeEditImg()">✕</button>
      <input type="file" id="editImgInput" accept="image/*" onchange="handleUpload(this,'editImgUpload','editImg')" style="display:none">`;
  } else {
    resetUploadArea('editImgUpload');
  }

  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() { document.getElementById('editModal').classList.remove('open'); }

function removeEditImg() {
  document.getElementById('editImg').value = '';
  resetUploadArea('editImgUpload');
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const data = {
    name: document.getElementById('editName').value,
    gender: document.getElementById('editGender').value,
    price: document.getElementById('editPrice').value,
    cat_id: document.getElementById('editCat').value,
    img: document.getElementById('editImg').value,
    stock: document.getElementById('editStock').value,
  };
  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const idx = products.findIndex((x) => x.id == id);
      if (idx !== -1) products[idx] = { ...products[idx], ...data };
      document.getElementById('editSuccess').style.display = 'block';
      setTimeout(() => {
        document.getElementById('editSuccess').style.display = 'none';
        closeEditModal();
        renderAdminList(currentAdminSearch);
      }, 800);
    }
  } catch (err) {
    console.error('Error guardando:', err);
  }
}

// ── TOGGLE STOCK ──
async function toggleStock(id) {
  const p = products.find((x) => x.id == id);
  if (!p) return;
  const newStock = p.stock === 'disponible' ? 'sin-stock' : 'disponible';
  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...p, stock: newStock }),
    });
    if (res.ok) {
      p.stock = newStock;
      renderAdminList(currentAdminSearch);
    }
  } catch (err) {
    console.error('Error toggling stock:', err);
  }
}

// ── DELETE PRODUCT ──
async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  try {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      products = products.filter((x) => x.id != id);
      renderAdminList(currentAdminSearch);
    }
  } catch (err) {
    console.error('Error eliminando:', err);
  }
}

// ── CATEGORIES ──
function renderCategoryList() {
  const list = document.getElementById('adminCategoryList');
  let html = '';
  categories.forEach((c) => {
    const count = products.filter((p) => p.cat_id === c.id).length;
    html += `<div class="admin-category-item">
      <div class="cat-name">${c.name}</div>
      <div class="cat-id">${c.id}</div>
      <div class="cat-count">${count} productos</div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openEditCatModal('${c.id}')">Editar</button>
        <button class="btn-del" onclick="deleteCategory('${c.id}')">Eliminar</button>
      </div>
    </div>`;
  });
  list.innerHTML = html || '<p style="text-align:center;color:var(--text-light);padding:20px;">No hay categorías.</p>';
}

async function addCategory() {
  const id = document.getElementById('newCatId').value.trim();
  const name = document.getElementById('newCatName').value.trim();
  const display_order = parseInt(document.getElementById('newCatOrder').value) || 0;
  if (!id || !name) {
    document.getElementById('addCatError').style.display = 'block';
    return;
  }
  document.getElementById('addCatError').style.display = 'none';

  try {
    const res = await fetch(`${API}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ id, name, display_order }),
    });
    if (res.ok) {
      categories.push({ id, name, display_order: display_order || 0 });
      document.getElementById('newCatId').value = '';
      document.getElementById('newCatName').value = '';
      document.getElementById('newCatOrder').value = '0';
      document.getElementById('addCatSuccess').style.display = 'block';
      setTimeout(() => document.getElementById('addCatSuccess').style.display = 'none', 1500);
      renderCategoryList();
      populateSelects();
    } else {
      const data = await res.json();
      document.getElementById('addCatError').textContent = data.error || 'Error';
      document.getElementById('addCatError').style.display = 'block';
    }
  } catch (err) {
    console.error('Error creando categoría:', err);
  }
}

function openEditCatModal(id) {
  const c = categories.find((x) => x.id === id);
  if (!c) return;
  document.getElementById('editCatId').value = c.id;
  document.getElementById('editCatName').value = c.name;
  document.getElementById('editCatOrder').value = c.display_order;
  document.getElementById('editCatSuccess').style.display = 'none';
  document.getElementById('editCatModal').classList.add('open');
}

function closeEditCatModal() { document.getElementById('editCatModal').classList.remove('open'); }

async function saveEditCategory() {
  const id = document.getElementById('editCatId').value;
  const name = document.getElementById('editCatName').value;
  const display_order = parseInt(document.getElementById('editCatOrder').value) || 0;
  try {
    const res = await fetch(`${API}/categories/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, display_order }),
    });
    if (res.ok) {
      document.getElementById('editCatSuccess').style.display = 'block';
      setTimeout(() => {
        document.getElementById('editCatSuccess').style.display = 'none';
        closeEditCatModal();
        loadData().then(() => { renderCategoryList(); populateSelects(); });
      }, 800);
    }
  } catch (err) {
    console.error('Error guardando categoría:', err);
  }
}

async function deleteCategory(id) {
  const count = products.filter((p) => p.cat_id === id).length;
  if (count > 0) {
    alert(`No se puede eliminar: hay ${count} productos en esta categoría. Movelos primero.`);
    return;
  }
  if (!confirm('¿Eliminar esta categoría?')) return;
  try {
      await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
    categories = categories.filter((x) => x.id != id);
    renderCategoryList();
    populateSelects();
  } catch (err) {
    console.error('Error eliminando categoría:', err);
  }
}

// ── OFFER ──
async function loadOfferForm() {
  try {
    const res = await fetch(`${API}/offer`);
    const offer = await res.json();
    document.getElementById('offerName').value = offer.name || '';
    document.getElementById('offerDesc').value = offer.description || '';
    document.getElementById('offerPrice').value = offer.price || '';
    document.getElementById('offerImg').value = offer.img || '';

    const uploadArea = document.getElementById('offerImgUpload');
    if (offer.img) {
      uploadArea.classList.add('has-image');
      uploadArea.innerHTML = `<img src="${offer.img}" alt="Oferta">
        <button class="upload-remove" onclick="event.stopPropagation();removeOfferImg()">✕</button>
        <input type="file" id="offerImgInput" accept="image/*" onchange="handleUpload(this,'offerImgUpload','offerImg')" style="display:none">`;
    }
  } catch (err) {
    console.error('Error cargando oferta:', err);
  }
}

function removeOfferImg() {
  document.getElementById('offerImg').value = '';
  const area = document.getElementById('offerImgUpload');
  area.classList.remove('has-image');
  area.innerHTML = `<input type="file" id="offerImgInput" accept="image/*" onchange="handleUpload(this,'offerImgUpload','offerImg')" style="display:none">
    <div class="upload-placeholder">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      <div>Hacé clic para subir una foto</div>
    </div>`;
}

async function saveOffer() {
  const data = {
    name: document.getElementById('offerName').value,
    description: document.getElementById('offerDesc').value,
    price: document.getElementById('offerPrice').value,
    img: document.getElementById('offerImg').value,
  };
  try {
    const res = await fetch(`${API}/offer`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      document.getElementById('offerSuccess').style.display = 'block';
      setTimeout(() => document.getElementById('offerSuccess').style.display = 'none', 1500);
    }
  } catch (err) {
    console.error('Error guardando oferta:', err);
  }
}

// ── IMAGE UPLOAD ──
async function handleUpload(input, areaId, hiddenId) {
  const file = input.files[0];
  if (!file) return;

  const area = document.getElementById(areaId);
  const originalContent = area.innerHTML;
  area.innerHTML = '<div class="upload-placeholder">Subiendo...</div>';

  try {
    const base64 = await fileToBase64(file);
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ file: base64, folder: 'catalogo' }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      document.getElementById(hiddenId).value = data.url;
      area.classList.add('has-image');
      area.innerHTML = `<img src="${data.url}" alt="Imagen subida">
        <button class="upload-remove" onclick="event.stopPropagation();removeUploadedImg('${areaId}','${hiddenId}')">✕</button>
        <input type="file" id="${input.id}" accept="image/*" onchange="handleUpload(this,'${areaId}','${hiddenId}')" style="display:none">`;
    } else {
      area.innerHTML = originalContent;
      alert('Error al subir imagen: ' + (data.error || 'Error desconocido'));
    }
  } catch (err) {
    area.innerHTML = originalContent;
    alert('Error de conexión al subir imagen.');
    console.error(err);
  }
}

function removeUploadedImg(areaId, hiddenId) {
  document.getElementById(hiddenId).value = '';
  const area = document.getElementById(areaId);
  area.classList.remove('has-image');
  const inputId = area.querySelector('input[type="file"]')?.id || areaId.replace('Upload', 'Input');
  area.innerHTML = `<input type="file" id="${inputId}" accept="image/*" onchange="handleUpload(this,'${areaId}','${hiddenId}')" style="display:none">
    <div class="upload-placeholder">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      <div>Hacé clic para subir una foto</div>
    </div>`;
}

function resetUploadArea(areaId) {
  const area = document.getElementById(areaId);
  area.classList.remove('has-image');
  const inputId = areaId.replace('Upload', 'Input');
  area.innerHTML = `<input type="file" id="${inputId}" accept="image/*" onchange="handleUpload(this,'${areaId}','${areaId.replace('Upload','')}')" style="display:none">
    <div class="upload-placeholder">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      <div>Hacé clic para subir una foto</div>
    </div>`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
