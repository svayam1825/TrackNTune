const API = '/api';

const IMAGE_PRESETS = [
  { label: 'Sedan', url: '/images/car_sedan.svg', type: 'car' },
  { label: 'SUV', url: '/images/car_suv.svg', type: 'car' },
  { label: 'Electric EV', url: '/images/car_electric.svg', type: 'car' },
  { label: 'Hatchback', url: '/images/car_hatchback.svg', type: 'car' },
  { label: 'Cruiser', url: '/images/bike_cruiser.svg', type: 'bike' },
  { label: 'Superbike', url: '/images/bike_superbike.svg', type: 'bike' },
  { label: 'Scooter', url: '/images/bike_scooter.svg', type: 'bike' },
  { label: 'Adventure', url: '/images/bike_adventure.svg', type: 'bike' }
];

const SERVICE_TYPES = {
  car: ['Oil Change', 'Tire Rotation', 'Brake Pads & Rotors', 'AC Service', 'Battery Replacement', 'Wheel Alignment', 'Spark Plugs', 'General Service', 'Other'],
  bike: ['Engine Oil & Filter', 'Chain Lube & Adjustment', 'Brake Pads', 'Tire Replacement', 'Clutch Check', 'Spark Plug', 'Fork Oil Flush', 'General Service', 'Other']
};

let currentFilter = 'all';
let searchQuery = '';
let currentVehicleId = null;
let currentVehicle = null;
let selectedImagePreset = '/images/car_sedan.svg';
let garageRecords = [];

// Helper selector shortcut
const $ = (id) => document.getElementById(id);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A');
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function openModal(id) { $(id).hidden = false; }
function closeModal(id) { $(id).hidden = true; }

// ---------- Login / Registration ----------
function setAuthMessage(message = '', isError = false) {
  const messageEl = $('authMessage');
  messageEl.textContent = message;
  messageEl.hidden = !message;
  messageEl.style.color = isError ? 'var(--red)' : 'var(--green)';
}

function setAuthMode(mode) {
  const isRegister = mode === 'register';
  $('authModeInput').value = mode;
  const isGarage = $('authRoleInput').value === 'garage_owner';
  $('authModalTitle').textContent = isGarage ? 'Garage owner portal' : 'Personal vehicle owner';
  $('authRoleDescription').textContent = isRegister
    ? (isGarage ? 'Create a workspace for your garage and customer job cards.' : 'Create an account to organize your vehicles and maintenance.')
    : (isGarage ? 'Sign in to manage your workshop and customer service records.' : 'Sign in to manage your vehicles and maintenance.');
  $('authRoleIcon').textContent = isGarage ? '🔧' : '🚘';
  $('authStoryTitle').textContent = isGarage ? 'Your workshop, running in sync.' : 'A smarter way to care for every mile.';
  $('authStoryDescription').textContent = isGarage
    ? 'Keep customer job cards, service work and workshop activity together in one professional workspace.'
    : 'Keep your vehicle, service history and upcoming maintenance organized in one calm, clear dashboard.';
  $('authSubmitBtn').innerHTML = `${isRegister ? 'Create my account' : (isGarage ? 'Enter garage portal' : 'Sign in to my dashboard')} <span>→</span>`;
  $('authToggleText').textContent = isRegister ? 'Already have an account?' : 'New to TrackNTune?';
  $('authToggleBtn').textContent = isRegister ? 'Sign in instead' : 'Create an account';
  $('nameField').hidden = !isRegister;
  $('aName').required = isRegister;
  $('garageBusinessFields').hidden = !isRegister || !isGarage;
  $('aBusinessName').required = isRegister && isGarage;
  $('aPassword').autocomplete = isRegister ? 'new-password' : 'current-password';
  $('authDemoNote').hidden = isRegister;
  $('authDemoCredentials').textContent = isGarage
    ? 'Garage: garage@apex.com · password123'
    : 'Personal: user@trackntune.com · password123';
  $('authGate').dataset.role = isGarage ? 'garage' : 'personal';
  $('authFeatureList').innerHTML = isGarage
    ? '<div><span>01</span><p><strong>Organize every job</strong><br />Create clear customer service records and job cards.</p></div><div><span>02</span><p><strong>See the workshop at a glance</strong><br />Track completed, pending and in-progress work.</p></div><div><span>03</span><p><strong>Keep customer details close</strong><br />Find vehicle, service and billing information quickly.</p></div>'
    : '<div><span>01</span><p><strong>Know what’s next</strong><br />Stay ahead of service dates and document renewals.</p></div><div><span>02</span><p><strong>See the full picture</strong><br />Track fuel, maintenance and running costs together.</p></div><div><span>03</span><p><strong>Make every trip count</strong><br />Keep useful vehicle details close at hand.</p></div>';
  setAuthMessage();
}

function updateAuthBadge(user) {
  $('userBadgeIcon').textContent = user ? '👤' : '🔐';
  $('userBadgeText').textContent = user ? 'Log out' : 'Login / Register';
  $('openAuthBtn').title = user ? 'Click to log out' : 'Login or register';
}

let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem('tnt_user') || 'null');
} catch (error) {
  localStorage.removeItem('tnt_user');
}
updateAuthBadge(currentUser);

function showLoginGate(role = 'personal') {
  currentUser = null;
  localStorage.removeItem('tnt_token');
  document.body.classList.remove('role-personal', 'role-garage');
  document.body.classList.add('auth-required');
  $('authGate').hidden = false;
  $('authRoleInput').value = role;
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.arole === role);
  });
  $('authForm').reset();
  $('authRoleInput').value = role;
  setAuthMode('login');
}

function enterApp(user, token) {
  currentUser = user;
  localStorage.setItem('tnt_user', JSON.stringify(user));
  if (token) localStorage.setItem('tnt_token', token);
  updateAuthBadge(user);
  document.body.classList.remove('auth-required', 'role-personal', 'role-garage');
  document.body.classList.add(user.role === 'garage_owner' ? 'role-garage' : 'role-personal');
  $('authGate').hidden = true;
  if (user.role === 'garage_owner') setMainView('garage');
  else setMainView('fleet');
}

if (currentUser && ['personal', 'garage_owner'].includes(currentUser.role)) {
  enterApp(currentUser);
} else {
  localStorage.removeItem('tnt_user');
  showLoginGate();
}

function setMainView(view) {
  $('dashboardView').hidden = view !== 'fleet';
  $('garageOwnerView').hidden = view !== 'garage';
  $('detailView').hidden = true;
  $('globalAlertBanner').hidden = view !== 'fleet';
  document.querySelectorAll('#mainNavTabs [data-view]').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  if (view === 'fleet') loadDashboard();
  if (view === 'garage') loadGaragePortal();
}

function openGarageLogin() {
  showLoginGate('garage_owner');
}

document.querySelectorAll('#mainNavTabs [data-view]').forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.dataset.view === 'garage') {
      if (!currentUser) {
        openGarageLogin();
        return;
      }
      if (currentUser.role !== 'garage_owner') {
        alert('The Garage Portal is for garage-owner accounts. Log out and sign in with a garage account to continue.');
        return;
      }
      setMainView('garage');
      return;
    }
    setMainView('fleet');
  });
});

$('openAuthBtn').addEventListener('click', () => {
  if (currentUser) {
    localStorage.removeItem('tnt_user');
    updateAuthBadge(null);
    showLoginGate();
    return;
  }
  showLoginGate();
});

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $('authRoleInput').value = tab.dataset.arole;
    document.querySelectorAll('.auth-tab').forEach((item) => item.classList.toggle('active', item === tab));
    setAuthMode($('authModeInput').value);
  });
});

$('authToggleBtn').addEventListener('click', () => {
  setAuthMode($('authModeInput').value === 'login' ? 'register' : 'login');
});

$('demoFillBtn').addEventListener('click', () => {
  const garage = $('authRoleInput').value === 'garage_owner';
  $('aEmail').value = garage ? 'garage@apex.com' : 'user@trackntune.com';
  $('aPassword').value = 'password123';
});

$('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const mode = $('authModeInput').value;
  const role = $('authRoleInput').value;
  const payload = {
    email: $('aEmail').value.trim(),
    password: $('aPassword').value,
    role
  };
  if (mode === 'register') {
    payload.name = $('aName').value.trim();
    payload.businessName = $('aBusinessName').value.trim();
    payload.phone = $('aPhone').value.trim();
    payload.city = $('aCity').value.trim();
    payload.specialization = $('aSpecialization').value.trim();
  }

  const button = $('authSubmitBtn');
  button.disabled = true;
  setAuthMessage(mode === 'login' ? 'Signing in…' : 'Creating your account…');
  try {
    const response = await fetch(`${API}/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authentication failed.');
    if (data.user.role !== role) {
      throw new Error(`This account is registered as a ${data.user.role === 'garage_owner' ? 'garage owner' : 'personal vehicle owner'}. Choose the matching portal above.`);
    }
    enterApp(data.user, data.token);
  } catch (error) {
    setAuthMessage(error.message || 'Could not connect to the server. Please try again.', true);
  } finally {
    button.disabled = false;
  }
});

// ---------- AI Mechanic Chat ----------
async function openAiChat(vehicleId = '') {
  if ($('aiChatModal').hidden) {
    $('aiChatMessages').querySelectorAll('.ai-msg').forEach((message) => message.remove());
    $('aiWelcome').hidden = false;
    $('aiChatInput').value = '';
  }
  openModal('aiChatModal');
  const select = $('aiVehicleSelect');
  select.innerHTML = '<option value="">General Automotive Knowledge</option>';
  try {
    const response = await fetch(`${API}/vehicles`);
    if (!response.ok) throw new Error('Could not load vehicles.');
    const vehicles = await response.json();
    vehicles.forEach((vehicle) => {
      const option = document.createElement('option');
      option.value = vehicle._id;
      option.textContent = vehicle.name;
      select.appendChild(option);
    });
    select.value = vehicleId || currentVehicleId || '';
  } catch (error) {
    appendAiMessage('bot', 'Could not load vehicle context. You can still ask a general question.');
  }
  $('aiChatInput').focus();
}

function appendAiMessage(role, text) {
  $('aiWelcome').hidden = true;
  const row = document.createElement('div');
  row.className = `ai-msg ${role}`;
  const content = document.createElement('div');
  content.className = 'msg-content';
  content.textContent = text;
  row.append(content);
  $('aiChatMessages').appendChild(row);
  $('aiChatMessages').scrollTop = $('aiChatMessages').scrollHeight;
  return row;
}

[$('openAiBotBtn'), $('bannerAskAiBtn'), $('floatingAiBtn')].forEach((button) => {
  button.addEventListener('click', () => openAiChat());
});
$('askAiAboutVehicleBtn').addEventListener('click', () => openAiChat(currentVehicleId || ''));

document.querySelectorAll('.chip-btn').forEach((button) => {
  button.addEventListener('click', () => {
    $('aiChatInput').value = button.dataset.chip || '';
    $('aiChatForm').requestSubmit();
  });
});

$('aiChatForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = $('aiChatInput').value.trim();
  if (!prompt) return;
  appendAiMessage('user', prompt);
  $('aiChatInput').value = '';
  $('aiSendBtn').disabled = true;
  const waiting = appendAiMessage('bot', 'Thinking…');
  try {
    const response = await fetch(`${API}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, vehicleId: $('aiVehicleSelect').value || undefined })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI request failed.');
    waiting.querySelector('.msg-content').textContent = data.response || 'I could not generate a response. Please try another question.';
  } catch (error) {
    waiting.querySelector('.msg-content').textContent = `AI request failed: ${error.message}. Check that the server is running and try again.`;
  } finally {
    $('aiSendBtn').disabled = false;
    $('aiChatInput').focus();
  }
});

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// ---------- Image Presets UI ----------
function renderImagePresets(selectedUrl, vehicleType) {
  const container = $('imagePresetGrid');
  const filtered = IMAGE_PRESETS.filter((p) => p.type === vehicleType);

  container.innerHTML = filtered
    .map(
      (p) => `
    <div class="preset-thumb ${p.url === selectedUrl ? 'selected' : ''}" 
         style="background-image: url('${p.url}');" 
         onclick="selectPreset('${p.url}')">
      <span>${p.label}</span>
    </div>
  `
    )
    .join('');

  if (!selectedUrl && filtered.length > 0) {
    selectPreset(filtered[0].url);
  }
}

window.selectPreset = function (url) {
  selectedImagePreset = url;
  $('vImageUrl').value = url;
  const currentType = document.querySelector('input[name="type"]:checked')?.value || 'car';
  renderImagePresets(url, currentType);
};

document.querySelectorAll('input[name="type"]').forEach((r) => {
  r.addEventListener('change', (e) => {
    const defaultUrl = e.target.value === 'bike' ? '/images/bike_cruiser.svg' : '/images/car_sedan.svg';
    selectPreset(defaultUrl);
    populateServiceTypes(e.target.value);
  });
});

function populateServiceTypes(type) {
  const typeSelect = $('sType');
  const options = SERVICE_TYPES[type] || SERVICE_TYPES.car;
  typeSelect.innerHTML = options.map((t) => `<option value="${t}">${t}</option>`).join('');
}

// ---------- Dashboard & Fleet List ----------
async function loadDashboard() {
  let url = `${API}/vehicles`;
  if (currentFilter === 'car' || currentFilter === 'bike') {
    url += `?type=${currentFilter}`;
  }

  const res = await fetch(url);
  let vehicles = await res.json();

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    vehicles = vehicles.filter(
      (v) =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.make && v.make.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.regNumber && v.regNumber.toLowerCase().includes(q))
    );
  }

  // Action Needed tab filter
  if (currentFilter === 'action') {
    vehicles = vehicles.filter((v) => v.status === 'overdue' || v.status === 'due-soon');
  }

  renderStats(vehicles);
  renderGlobalBanner(vehicles);
  renderVehicleGrid(vehicles);
}

async function loadGaragePortal() {
  if (!currentUser || currentUser.role !== 'garage_owner') return;
  const businessName = currentUser.businessName || 'Garage';
  $('garageHeroName').textContent = businessName;
  $('garageHeroDetails').textContent = [
    currentUser.name ? `Owner: ${currentUser.name}` : '',
    currentUser.phone || '',
    currentUser.city || '',
    currentUser.specialization || ''
  ].filter(Boolean).join(' • ');
  $('garageBusinessNameLabel').textContent = businessName;
  $('grecBusinessName').value = businessName;

  const list = $('garageRecordList');
  list.textContent = 'Loading garage records…';
  try {
    const response = await fetch(`${API}/garage/records?businessName=${encodeURIComponent(businessName)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load garage records.');
    garageRecords = data;
    renderGarageRecords();
    await loadGarageInventory();
  } catch (error) {
    list.textContent = `Could not load garage records: ${error.message}`;
  }
}

function populateStockPartSelector() {
  const select = $('grecSelectPart');
  if (!select) return;
  select.innerHTML = '<option value="">-- Select from Inventory Stock (Optional) --</option>';
  inventoryItems.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item._id;
    opt.textContent = `${item.partName} - ${money(item.unitPrice)} (${item.quantity} in stock)`;
    opt.dataset.price = item.unitPrice;
    opt.dataset.name = item.partName;
    select.appendChild(opt);
  });
}

function renderGarageRecords() {
  const query = $('garageSearchInput').value.trim().toLowerCase();
  const status = $('garageFilterStatus').value;
  const filtered = garageRecords.filter((record) => {
    const matchesQuery = !query || [record.customerName, record.vehicleName, record.regNumber, record.customerPhone]
      .some((value) => String(value || '').toLowerCase().includes(query));
    return matchesQuery && (status === 'all' || record.status === status);
  });

  const totalRevenue = garageRecords.reduce((sum, record) => sum + Number(record.totalAmount || 0), 0);
  const totalPartsRevenue = garageRecords.reduce((sum, record) => sum + Number(record.partsCost || 0), 0);
  const totalLaborRevenue = garageRecords.reduce((sum, record) => sum + Number(record.laborCost || 0), 0);
  const completed = garageRecords.filter((record) => record.status === 'Completed').length;
  
  $('garageStatsRow').innerHTML = `
    <div class="stat-card"><div class="num">${garageRecords.length}</div><div class="label">Total Job Cards</div></div>
    <div class="stat-card"><div class="num" style="color:var(--amber);">${money(totalRevenue)}</div><div class="label">Total Recorded Revenue</div></div>
    <div class="stat-card"><div class="num" style="color:var(--blue);">${money(totalPartsRevenue)}</div><div class="label">Spare Parts Revenue</div></div>
    <div class="stat-card"><div class="num" style="color:var(--green);">${money(totalLaborRevenue)}</div><div class="label">Labor Revenue</div></div>
  `;

  const container = $('garageRecordList');
  container.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = garageRecords.length ? 'No records match your filters.' : 'No job cards yet. Create your first garage record.';
    container.appendChild(empty);
    return;
  }

  filtered.forEach((record) => {
    const card = document.createElement('article');
    card.className = 'garage-card';
    const head = document.createElement('div');
    head.className = 'garage-card-head';
    const customer = document.createElement('h3');
    customer.className = 'garage-customer';
    customer.textContent = record.customerName || 'Customer';
    const badge = document.createElement('span');
    badge.className = `status-pill ${(record.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`;
    badge.textContent = record.status || 'Pending';
    head.append(customer, badge);

    const vehicle = document.createElement('strong');
    vehicle.textContent = `${record.vehicleType === 'car' ? '🚗' : '🏍️'} ${record.vehicleName || 'Vehicle'}`;
    const work = document.createElement('p');
    work.textContent = record.workDone || '';
    const details = document.createElement('div');
    details.className = 'hint';
    details.textContent = `${record.regNumber ? `${record.regNumber} · ` : ''}${fmtDate(record.serviceDate)} · Parts: ${money(record.partsCost || 0)} · Labor: ${money(record.laborCost || 0)} · Total: ${money(record.totalAmount)}`;
    card.append(head, vehicle, work, details);
    if (record.notes) {
      const notes = document.createElement('p');
      notes.className = 'hint';
      notes.textContent = record.notes;
      card.appendChild(notes);
    }

    // Action buttons footer
    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display:flex; gap:8px; margin-top:12px; border-top:1px solid var(--border); padding-top:8px; flex-wrap:wrap; align-items:center;';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn secondary small';
    editBtn.style.fontSize = '0.75rem';
    editBtn.textContent = '✏️ Edit Job';
    editBtn.addEventListener('click', () => editGarageRecord(record));

    const printBtn = document.createElement('button');
    printBtn.className = 'btn secondary small';
    printBtn.style.fontSize = '0.75rem';
    printBtn.textContent = '📄 Print Bill';
    printBtn.addEventListener('click', () => openGarageInvoice(record));

    const phoneClean = (record.customerPhone || '').replace(/\D/g, '');
    const waBtn = document.createElement('button');
    waBtn.className = 'btn secondary small';
    waBtn.style.cssText = 'font-size:0.75rem; color:#22c55e; border-color:#22c55e;';
    waBtn.textContent = '💬 WhatsApp';
    waBtn.addEventListener('click', () => {
      const msg = encodeURIComponent(`Hello ${record.customerName}, your ${record.vehicleName} (${record.regNumber || ''}) service status is now *${record.status}* at ${currentUser?.businessName || 'our garage'}. Total bill: ₹${record.totalAmount}. Thank you!`);
      const targetPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
    });

    const reminderBtn = document.createElement('button');
    reminderBtn.className = 'btn secondary small';
    reminderBtn.style.cssText = 'font-size:0.75rem; color:var(--amber); border-color:var(--amber);';
    reminderBtn.textContent = '🔔 6-Mo Reminder';
    reminderBtn.addEventListener('click', () => {
      const msg = encodeURIComponent(`Hello ${record.customerName}, greeting from ${currentUser?.businessName || 'our garage'}! It has been 6 months since your ${record.vehicleName} (${record.regNumber || ''}) was last serviced. Periodic maintenance ensures top performance & mileage. Book your appointment today!`);
      const targetPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
      window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn secondary small';
    delBtn.style.cssText = 'font-size:0.75rem; color:var(--red); margin-left:auto;';
    delBtn.textContent = '🗑️ Delete';
    delBtn.addEventListener('click', async () => {
      if (confirm('Delete this garage job record?')) {
        await fetch(`${API}/garage/records/${record._id}`, { method: 'DELETE' });
        await loadGaragePortal();
      }
    });

    actionsRow.append(editBtn, printBtn, waBtn, reminderBtn, delBtn);
    card.appendChild(actionsRow);
    container.appendChild(card);
  });
}

function openGarageInvoice(record) {
  const businessName = currentUser?.businessName || record.garageBusinessName || 'Apex Moto & Auto Tuning Garage';
  const ownerName = currentUser?.name || 'Garage Owner';
  const ownerPhone = currentUser?.phone || record.customerPhone || '+91 98765 43210';
  const address = currentUser?.address || 'Plot 42, Auto Hub Estate, MG Road, Pune';

  const parts = Number(record.partsCost || 0);
  const labor = Number(record.laborCost || 0);
  const subtotal = parts + labor;
  const gst = Math.round(subtotal * 0.18);
  const total = Number(record.totalAmount || (subtotal + gst));

  $('printableInvoiceContent').innerHTML = `
    <div style="padding: 24px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background:#ffffff; border-radius:8px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #e2e8f0; padding-bottom:16px; margin-bottom:20px;">
        <div>
          <h2 style="margin:0; color:#0f172a; font-size:1.5rem; font-weight:700;">${businessName}</h2>
          <p style="margin:4px 0 0 0; color:#64748b; font-size:0.85rem;">${address} • Phone: ${ownerPhone}</p>
          <p style="margin:2px 0 0 0; color:#64748b; font-size:0.85rem;">GSTIN: 27AAAAA0000A1Z5 · Multi-Brand Tuning & Maintenance</p>
        </div>
        <div style="text-align:right;">
          <h3 style="margin:0; color:#2563eb; font-size:1.25rem; letter-spacing:0.5px;">TAX INVOICE</h3>
          <p style="margin:4px 0 0 0; font-weight:600; font-size:0.9rem;">Invoice #: INV-${(record._id || '0000').slice(-6).toUpperCase()}</p>
          <p style="margin:2px 0 0 0; color:#64748b; font-size:0.85rem;">Date: ${fmtDate(record.serviceDate || record.createdAt)}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; background:#f8fafc; padding:12px 16px; border-radius:6px; margin-bottom:20px; border:1px solid #e2e8f0;">
        <div>
          <strong style="color:#475569; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">CUSTOMER DETAILS</strong>
          <p style="margin:4px 0 0 0; font-weight:600; font-size:1rem; color:#0f172a;">${record.customerName || 'Walk-in Customer'}</p>
          <p style="margin:2px 0 0 0; color:#64748b; font-size:0.85rem;">Phone: ${record.customerPhone || 'N/A'}</p>
        </div>
        <div>
          <strong style="color:#475569; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">VEHICLE DETAILS</strong>
          <p style="margin:4px 0 0 0; font-weight:600; font-size:1rem; color:#0f172a;">${record.vehicleType === 'car' ? '🚗' : '🏍️'} ${record.vehicleName}</p>
          <p style="margin:2px 0 0 0; color:#64748b; font-size:0.85rem;">Reg No: <strong>${record.regNumber || 'N/A'}</strong> · Odometer: ${record.odometer ? record.odometer + ' km' : 'N/A'}</p>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="background:#f1f5f9; text-align:left; font-size:0.85rem; color:#475569;">
            <th style="padding:10px; border-bottom:1px solid #cbd5e1;">Description of Work & Parts Replaced</th>
            <th style="padding:10px; text-align:right; border-bottom:1px solid #cbd5e1;">Parts (₹)</th>
            <th style="padding:10px; text-align:right; border-bottom:1px solid #cbd5e1;">Labor (₹)</th>
            <th style="padding:10px; text-align:right; border-bottom:1px solid #cbd5e1;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0; font-size:0.9rem;">
            <td style="padding:12px 10px;">
              <strong style="color:#0f172a;">${record.serviceCategory || 'General Service'}</strong>
              <p style="margin:4px 0 0 0; color:#475569; font-size:0.85rem;">${record.workDone || 'Regular maintenance service'}</p>
              ${record.notes ? `<p style="margin:2px 0 0 0; color:#64748b; font-size:0.8rem; font-style:italic;">Notes: ${record.notes}</p>` : ''}
            </td>
            <td style="padding:12px 10px; text-align:right; color:#334155;">${money(parts)}</td>
            <td style="padding:12px 10px; text-align:right; color:#334155;">${money(labor)}</td>
            <td style="padding:12px 10px; text-align:right; font-weight:600; color:#0f172a;">${money(subtotal)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-top:20px;">
        <div style="max-width:50%; font-size:0.8rem; color:#64748b;">
          <p style="margin:0 0 4px 0; font-weight:600; color:#334155;">Terms & Conditions:</p>
          <p style="margin:0;">1. Goods & spare parts supplied carry standard manufacturer warranty.</p>
          <p style="margin:0;">2. Please verify vehicle condition upon taking delivery.</p>
        </div>
        <div style="width:250px; background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem; color:#64748b;">
            <span>Parts + Labor Subtotal:</span>
            <span>${money(subtotal)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem; color:#64748b;">
            <span>Estimated GST (18%):</span>
            <span>${money(gst)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid #cbd5e1; font-weight:700; font-size:1.1rem; color:#0f172a;">
            <span>Total Payable:</span>
            <span style="color:#2563eb;">${money(total)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:40px; display:flex; justify-content:space-between; align-items:flex-end; padding-top:20px; border-top:1px dashed #cbd5e1; font-size:0.85rem; color:#64748b;">
        <div>Customer Signature</div>
        <div style="text-align:right;">
          <p style="margin:0 0 30px 0; font-weight:600; color:#334155;">For ${businessName}</p>
          <p style="margin:0;">Authorized Signatory</p>
        </div>
      </div>
    </div>
  `;

  openModal('garageInvoiceModal');
}

$('printGarageInvoiceBtn')?.addEventListener('click', () => {
  window.print();
});

// ---------- SPARE PARTS INVENTORY JS ----------
let inventoryItems = [];

async function loadGarageInventory() {
  if (!currentUser || currentUser.role !== 'garage_owner') return;
  const businessName = currentUser.businessName || 'Garage';
  try {
    const res = await fetch(`${API}/garage/inventory?businessName=${encodeURIComponent(businessName)}`);
    if (res.ok) {
      inventoryItems = await res.json();
      renderGarageInventory();
    }
  } catch (err) {
    console.error('Could not load inventory:', err);
  }
}

function renderGarageInventory() {
  const query = ($('inventorySearchInput')?.value || '').toLowerCase().trim();
  const filtered = inventoryItems.filter(item => 
    !query || (item.partName || '').toLowerCase().includes(query) || (item.category || '').toLowerCase().includes(query) || (item.supplier || '').toLowerCase().includes(query)
  );

  const lowStock = inventoryItems.filter(item => Number(item.quantity) <= Number(item.minStockLevel || 5));
  const alertBox = $('inventoryAlertBox');
  if (alertBox) {
    if (lowStock.length > 0) {
      alertBox.hidden = false;
      $('inventoryAlertMsg').textContent = `${lowStock.length} spare part(s) are running low on stock: ${lowStock.map(i => i.partName).join(', ')}`;
    } else {
      alertBox.hidden = true;
    }
  }

  const tbody = $('inventoryTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="padding:16px; text-align:center; color:var(--text-dim);">No spare parts found. Click "+ Add Stock Item" to add stock.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const isLow = Number(item.quantity) <= Number(item.minStockLevel || 5);
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    tr.innerHTML = `
      <td style="padding:10px;">
        <strong style="color:var(--text-main);">${item.partName}</strong>
        ${item.partNumber ? `<div style="font-size:0.75rem; color:var(--text-dim);">${item.partNumber}</div>` : ''}
      </td>
      <td style="padding:10px;"><span class="badge" style="font-size:0.75rem;">${item.category || 'General'}</span></td>
      <td style="padding:10px;">
        <strong style="color: ${isLow ? 'var(--red)' : 'var(--green)'}; font-size:0.95rem;">${item.quantity} units</strong>
        ${isLow ? `<span style="font-size:0.7rem; background:rgba(239, 68, 68, 0.2); color:var(--red); padding:2px 6px; border-radius:4px; margin-left:6px;">Low Stock ⚠️</span>` : ''}
      </td>
      <td style="padding:10px; font-weight:600;">${money(item.unitPrice)}</td>
      <td style="padding:10px; color:var(--text-dim);">${money(item.costPrice)}</td>
      <td style="padding:10px; font-size:0.85rem;">${item.supplier || '--'}</td>
      <td style="padding:10px;">
        <button class="btn secondary small inv-del-btn" data-invid="${item._id}" style="padding:2px 8px; font-size:0.75rem; color:var(--red);">🗑️ Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.inv-del-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.invid;
      if (confirm('Are you sure you want to remove this stock item from inventory?')) {
        await fetch(`${API}/garage/inventory/${id}`, { method: 'DELETE' });
        await loadGarageInventory();
      }
    });
  });
}

// Garage Sub-Tab Switching Logic
$('garageTabJobCards')?.addEventListener('click', () => {
  $('garageTabJobCards').classList.add('active');
  $('garageTabInventory').classList.remove('active');
  $('garageJobCardsSection').hidden = false;
  $('garageInventorySection').hidden = true;
});

$('garageTabInventory')?.addEventListener('click', () => {
  $('garageTabInventory').classList.add('active');
  $('garageTabJobCards').classList.remove('active');
  $('garageJobCardsSection').hidden = true;
  $('garageInventorySection').hidden = false;
  loadGarageInventory();
});

$('inventorySearchInput')?.addEventListener('input', renderGarageInventory);

['openAddInventoryBtn', 'openAddInventoryBtn2'].forEach(id => {
  $(id)?.addEventListener('click', () => {
    $('inventoryForm').reset();
    openModal('inventoryModal');
  });
});

$('inventoryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'garage_owner') return;

  const payload = {
    garageBusinessName: currentUser.businessName || 'Garage',
    partName: $('invPartName').value.trim(),
    category: $('invCategory').value,
    partNumber: $('invPartNumber').value.trim(),
    quantity: Number($('invQuantity').value || 0),
    minStockLevel: Number($('invMinStock').value || 5),
    unitPrice: Number($('invUnitPrice').value || 0),
    costPrice: Number($('invCostPrice').value || 0),
    supplier: $('invSupplier').value.trim(),
    notes: $('invNotes').value.trim()
  };

  const btn = $('saveInventoryBtn');
  if (btn) btn.disabled = true;
  try {
    const res = await fetch(`${API}/garage/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save inventory item');
    }
    closeModal('inventoryModal');
    await loadGarageInventory();
  } catch (err) {
    alert(err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
});

function editGarageRecord(record) {
  populateStockPartSelector();
  $('grecId').value = record._id || '';
  $('grecBusinessName').value = record.garageBusinessName || currentUser?.businessName || '';
  $('grecCustomerName').value = record.customerName || '';
  $('grecCustomerPhone').value = record.customerPhone || '';
  $('grecVehicleType').value = record.vehicleType || 'bike';
  $('grecVehicleName').value = record.vehicleName || '';
  $('grecRegNumber').value = record.regNumber || '';
  $('grecOdometer').value = record.odometer || '';
  $('grecWorkDone').value = record.workDone || '';
  $('grecPartsCost').value = record.partsCost || 0;
  $('grecLaborCost').value = record.laborCost || 0;
  $('grecTotalAmount').value = record.totalAmount || 0;
  $('grecStatus').value = record.status || 'Completed';
  $('grecVehicleCondition').value = record.vehicleCondition || 'Good';
  $('grecServiceDate').value = record.serviceDate ? record.serviceDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
  $('grecNotes').value = record.notes || '';
  openModal('garageJobCardModal');
}

// Auto-sum Parts + Labor into Total Bill Amount
['grecPartsCost', 'grecLaborCost'].forEach(id => {
  $(id)?.addEventListener('input', () => {
    const parts = Number($('grecPartsCost').value || 0);
    const labor = Number($('grecLaborCost').value || 0);
    $('grecTotalAmount').value = parts + labor;
  });
});

// Auto-fill Part Price from Inventory selection
$('grecSelectPart')?.addEventListener('change', (e) => {
  const selectedOpt = e.target.options[e.target.selectedIndex];
  if (selectedOpt && selectedOpt.dataset.price) {
    const price = Number(selectedOpt.dataset.price || 0);
    const partName = selectedOpt.dataset.name || '';
    const currentParts = Number($('grecPartsCost').value || 0);
    $('grecPartsCost').value = currentParts + price;
    const labor = Number($('grecLaborCost').value || 0);
    $('grecTotalAmount').value = currentParts + price + labor;

    const currentWork = $('grecWorkDone').value.trim();
    $('grecWorkDone').value = currentWork ? `${currentWork}, ${partName}` : partName;
  }
});

// Quick Price Estimate Quotation Calculator handlers
$('openQuickEstimateBtn')?.addEventListener('click', () => {
  $('quotationForm').reset();
  $('quoteParts').value = 0;
  $('quoteLabor').value = 0;
  $('quoteGst').value = 0;
  $('quoteTotal').value = 0;
  openModal('garageQuotationModal');
});

function calculateQuotation() {
  const parts = Number($('quoteParts').value || 0);
  const labor = Number($('quoteLabor').value || 0);
  const subtotal = parts + labor;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  $('quoteGst').value = gst;
  $('quoteTotal').value = total;
}

['quoteParts', 'quoteLabor'].forEach(id => {
  $(id)?.addEventListener('input', calculateQuotation);
});

$('shareQuoteWaBtn')?.addEventListener('click', () => {
  const customer = $('quoteCustomer').value.trim() || 'Valued Customer';
  const parts = Number($('quoteParts').value || 0);
  const labor = Number($('quoteLabor').value || 0);
  const gst = Number($('quoteGst').value || 0);
  const total = Number($('quoteTotal').value || 0);

  const text = encodeURIComponent(
    `Hello ${customer}, here is your repair cost estimate from ${currentUser?.businessName || 'our garage'}:\n` +
    `• Spare Parts: ₹${parts}\n` +
    `• Labor Charges: ₹${labor}\n` +
    `• Est. GST (18%): ₹${gst}\n` +
    `• Total Estimate: *₹${total}*\n` +
    `Please reply to approve this service order.`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
});

$('openAddGarageRecordBtn').addEventListener('click', () => {
  $('garageJobCardForm').reset();
  $('grecId').value = '';
  $('grecBusinessName').value = currentUser?.businessName || '';
  $('grecServiceDate').value = new Date().toISOString().slice(0, 10);
  populateStockPartSelector();
  openModal('garageJobCardModal');
});

$('garageJobCardForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser || currentUser.role !== 'garage_owner') return;

  const id = $('grecId').value;
  const selectedPartId = $('grecSelectPart').value;

  const payload = {
    garageOwnerId: currentUser._id,
    garageBusinessName: currentUser.businessName,
    customerName: $('grecCustomerName').value.trim(),
    customerPhone: $('grecCustomerPhone').value.trim(),
    vehicleType: $('grecVehicleType').value,
    vehicleName: $('grecVehicleName').value.trim(),
    regNumber: $('grecRegNumber').value.trim(),
    odometer: Number($('grecOdometer').value || 0),
    workDone: $('grecWorkDone').value.trim(),
    partsCost: Number($('grecPartsCost').value || 0),
    laborCost: Number($('grecLaborCost').value || 0),
    totalAmount: Number($('grecTotalAmount').value || 0),
    status: $('grecStatus').value,
    vehicleCondition: $('grecVehicleCondition').value,
    serviceDate: $('grecServiceDate').value || undefined,
    notes: $('grecNotes').value.trim()
  };

  const submit = $('garageJobCardForm').querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const url = id ? `${API}/garage/records/${id}` : `${API}/garage/records`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save garage record.');

    // If a stock part was selected, decrement 1 unit from inventory stock
    if (selectedPartId) {
      const part = inventoryItems.find(i => String(i._id) === String(selectedPartId));
      if (part && part.quantity > 0) {
        await fetch(`${API}/garage/inventory/${selectedPartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: part.quantity - 1 })
        });
      }
    }

    closeModal('garageJobCardModal');
    await loadGaragePortal();
  } catch (error) {
    alert(error.message);
  } finally {
    submit.disabled = false;
  }
});

['garageSearchInput', 'garageFilterStatus'].forEach((id) => {
  $(id).addEventListener(id === 'garageSearchInput' ? 'input' : 'change', renderGarageRecords);
});

$('switchUserRoleBtn').addEventListener('click', () => {
  localStorage.removeItem('tnt_user');
  updateAuthBadge(null);
  showLoginGate();
});

function renderStats(vehicles) {
  const total = vehicles.length;
  const overdue = vehicles.filter((v) => v.status === 'overdue').length;
  const dueSoon = vehicles.filter((v) => v.status === 'due-soon').length;
  const totalSpend = vehicles.reduce((sum, v) => sum + (v.totalSpend || 0), 0);

  $('statsRow').innerHTML = `
    <div class="stat-card">
      <div class="num">${total}</div>
      <div class="label">Total Fleet</div>
    </div>
    <div class="stat-card">
      <div class="num" style="color:var(--amber);">${money(totalSpend)}</div>
      <div class="label">Total Fleet Spend</div>
    </div>
    <div class="stat-card">
      <div class="num" style="color:var(--yellow);">${dueSoon}</div>
      <div class="label">Due Soon</div>
    </div>
    <div class="stat-card">
      <div class="num" style="color:var(--red);">${overdue}</div>
      <div class="label">Action Required</div>
    </div>
  `;
}

function renderGlobalBanner(vehicles) {
  const urgent = vehicles.filter((v) => v.status === 'overdue');
  const banner = $('globalAlertBanner');
  if (urgent.length > 0) {
    banner.hidden = false;
    const names = urgent.map((v) => v.name).join(', ');
    $('globalAlertText').innerHTML = `<strong>Attention Required:</strong> ${urgent.length} vehicle(s) (${names}) have overdue maintenance or document expiries. Please inspect!`;
  } else {
    banner.hidden = true;
  }
}

function statusBadgeHtml(status) {
  if (status === 'overdue') {
    return `<span class="status-badge overdue"><span class="status-dot"></span>Overdue</span>`;
  }
  if (status === 'due-soon') {
    return `<span class="status-badge due-soon"><span class="status-dot"></span>Due Soon</span>`;
  }
  return `<span class="status-badge ok"><span class="status-dot"></span>On Track</span>`;
}

function renderVehicleGrid(vehicles) {
  const grid = $('vehicleGrid');
  $('emptyState').hidden = vehicles.length !== 0;

  grid.innerHTML = vehicles
    .map(
      (v) => {
        const interval = v.defaultIntervalKm || 5000;
        const remaining = v.kmRemaining !== undefined ? v.kmRemaining : interval;
        const healthPct = Math.max(0, Math.min(100, Math.round((remaining / interval) * 100)));
        const healthStatus = v.serviceStatus || (healthPct <= 0 ? 'overdue' : healthPct <= 20 ? 'due-soon' : 'ok');

        return `
    <div class="vehicle-card" data-id="${v._id}">
      <div class="hero-image" style="background-image: url('${v.imageUrl || '/images/car_sedan.svg'}');">
        <div class="hero-overlay">
          ${statusBadgeHtml(v.status)}
          ${v.avgKmPerLiter ? `<span class="pill ok">${v.avgKmPerLiter} km/L</span>` : ''}
          ${v.costPerKm !== undefined ? `<span class="cpk-badge" title="Cost Per Kilometer">₹${v.costPerKm}/km</span>` : ''}
        </div>
      </div>
      <div class="card-body">
        <h4>${v.name}</h4>
        <div class="sub">${[v.make, v.model, v.year].filter(Boolean).join(' · ') || '—'}</div>
        ${v.regNumber ? `<div class="plate">${v.regNumber}</div>` : ''}

        <div class="odo-bar">
          <span class="odo-label">ODO</span>
          <span class="odo-value">${v.currentOdometer.toLocaleString('en-IN')} <small style="font-size:11px;">km</small></span>
        </div>

        <div class="health-bar-wrapper">
          <div class="health-bar-label">
            <span>Service Health</span>
            <span>${healthPct}% remaining</span>
          </div>
          <div class="health-bar-track">
            <div class="health-bar-fill ${healthStatus}" style="width: ${healthPct}%;"></div>
          </div>
        </div>

        <div class="pills-row">
          <span class="pill ${v.serviceStatus}">Service: ${v.kmRemaining > 0 ? v.kmRemaining + ' km left' : 'Overdue!'}</span>
          ${v.insuranceInfo.status !== 'none' ? `<span class="pill ${v.insuranceInfo.status}">Ins: ${v.insuranceInfo.days > 0 ? v.insuranceInfo.days + 'd' : 'Expired!'}</span>` : ''}
          ${v.pucInfo.status !== 'none' ? `<span class="pill ${v.pucInfo.status}">PUC: ${v.pucInfo.days > 0 ? v.pucInfo.days + 'd' : 'Expired!'}</span>` : ''}
        </div>
      </div>
    </div>
  `;
      }
    )
    .join('');

  grid.querySelectorAll('.vehicle-card').forEach((card) => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

// Search input listener
$('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  loadDashboard();
});

// Category filter tabs
document.querySelectorAll('#typeTabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#typeTabs .tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.type;
    loadDashboard();
  });
});

// CSV Export All
$('exportAllBtn').addEventListener('click', () => {
  if (currentVehicleId) {
    window.open(`${API}/export/csv/${currentVehicleId}`, '_blank');
  } else {
    // Export first vehicle if in detail view, or alert
    alert('Open a vehicle to download its complete CSV record.');
  }
});

// ---------- Add / Edit Vehicle Modal ----------
$('openAddVehicle').addEventListener('click', () => {
  $('vehicleForm').reset();
  $('vehicleId').value = '';
  $('vehicleModalTitle').textContent = 'Add New Vehicle';
  selectPreset('/images/car_sedan.svg');
  openModal('vehicleModal');
});

$('vehicleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('vehicleId').value;
  const payload = {
    type: document.querySelector('input[name="type"]:checked').value,
    name: $('vName').value,
    make: $('vMake').value,
    model: $('vModel').value,
    year: $('vYear').value ? Number($('vYear').value) : null,
    regNumber: $('vReg').value,
    fuelType: $('vFuel').value,
    currentOdometer: Number($('vOdometer').value),
    imageUrl: $('vImageUrl').value || selectedImagePreset,
    insuranceExpiry: $('vInsuranceExpiry').value || null,
    pucExpiry: $('vPucExpiry').value || null,
    taxExpiry: $('vTaxExpiry').value || null,
    defaultIntervalKm: Number($('vIntervalKm').value) || 5000,
    notes: $('vNotes').value
  };

  const url = id ? `${API}/vehicles/${id}` : `${API}/vehicles`;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  closeModal('vehicleModal');
  if (currentVehicleId) {
    openDetail(currentVehicleId);
  } else {
    loadDashboard();
  }
});

// ---------- Vehicle Detail View ----------
async function openDetail(id) {
  currentVehicleId = id;
  const res = await fetch(`${API}/vehicles/${id}`);
  currentVehicle = await res.json();

  $('dashboardView').hidden = true;
  $('detailView').hidden = false;

  const v = currentVehicle;

  $('detailHero').innerHTML = `
    <div class="detail-hero-banner" style="background-image: url('${v.imageUrl || '/images/car_sedan.svg'}');">
      <div class="detail-hero-overlay">
        <div>
          <h2>${v.name}</h2>
          <div class="sub">${[v.make, v.model, v.year, v.fuelType].filter(Boolean).join(' · ')}</div>
          ${v.regNumber ? `<div class="plate">${v.regNumber}</div>` : ''}
        </div>
        <div>
          ${statusBadgeHtml(v.status)}
          <button class="btn secondary small" onclick="editCurrentVehicle()" style="margin-left: 10px;">✏️ Edit</button>
          <button class="btn danger small" onclick="deleteCurrentVehicle()" style="margin-left: 6px;">🗑️ Delete</button>
        </div>
      </div>
    </div>
    <div class="detail-stats-bar">
      <div class="detail-stat-box">
        <div class="val">${v.currentOdometer.toLocaleString('en-IN')} km</div>
        <div class="lbl">Current Odo</div>
      </div>
      <div class="detail-stat-box">
        <div class="val">${v.avgKmPerLiter ? v.avgKmPerLiter + ' km/L' : 'N/A'}</div>
        <div class="lbl">Avg Mileage</div>
      </div>
      <div class="detail-stat-box">
        <div class="val">₹${v.costPerKm !== undefined ? v.costPerKm : '0'}/km</div>
        <div class="lbl">Cost / km</div>
      </div>
      <div class="detail-stat-box">
        <div class="val">${money(v.totalSpend)}</div>
        <div class="lbl">Total Spend</div>
      </div>
      <div class="detail-stat-box">
        <div class="val">${v.nextDueOdometer.toLocaleString('en-IN')} km</div>
        <div class="lbl">Next Due Service</div>
      </div>
    </div>
  `;

  // Render Service Entries
  renderServiceList(v.services || []);
  // Render Fuel Entries
  renderFuelList(v.fuelLogs || []);
  // Render Document Vault
  renderDocumentVault(v);

  // Switch to services tab by default
  switchDetailTab('services');
}

window.editCurrentVehicle = function () {
  if (!currentVehicle) return;
  const v = currentVehicle;
  $('vehicleId').value = v._id;
  $('vehicleModalTitle').textContent = 'Edit Vehicle';
  $('vName').value = v.name || '';
  $('vMake').value = v.make || '';
  $('vModel').value = v.model || '';
  $('vYear').value = v.year || '';
  $('vReg').value = v.regNumber || '';
  $('vFuel').value = v.fuelType || 'Petrol';
  $('vOdometer').value = v.currentOdometer || 0;
  $('vIntervalKm').value = v.defaultIntervalKm || 5000;
  $('vNotes').value = v.notes || '';
  if (v.insuranceExpiry) $('vInsuranceExpiry').value = v.insuranceExpiry.split('T')[0];
  if (v.pucExpiry) $('vPucExpiry').value = v.pucExpiry.split('T')[0];
  if (v.taxExpiry) $('vTaxExpiry').value = v.taxExpiry.split('T')[0];

  const r = document.querySelector(`input[name="type"][value="${v.type}"]`);
  if (r) r.checked = true;

  selectPreset(v.imageUrl || '/images/car_sedan.svg');
  openModal('vehicleModal');
};

window.deleteCurrentVehicle = async function () {
  if (!currentVehicleId) return;
  if (confirm(`Are you sure you want to delete ${currentVehicle.name}? All service and fuel records will be removed.`)) {
    await fetch(`${API}/vehicles/${currentVehicleId}`, { method: 'DELETE' });
    $('detailView').hidden = true;
    $('dashboardView').hidden = false;
    currentVehicleId = null;
    loadDashboard();
  }
};

$('backBtn').addEventListener('click', () => {
  $('detailView').hidden = true;
  $('dashboardView').hidden = false;
  currentVehicleId = null;
  loadDashboard();
});

// ---------- Sub-Tab Navigation inside Detail View ----------
function switchDetailTab(tabName) {
  document.querySelectorAll('.d-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.d-pane').forEach((p) => (p.hidden = true));

  const targetTab = document.querySelector(`.d-tab[data-dtab="${tabName}"]`);
  if (targetTab) targetTab.classList.add('active');

  if (tabName === 'services') $('paneServices').hidden = false;
  if (tabName === 'fuel') $('paneFuel').hidden = false;
  if (tabName === 'documents') $('paneDocuments').hidden = false;
  if (tabName === 'analytics') {
    $('paneAnalytics').hidden = false;
    loadAnalytics();
  }
  if (tabName === 'checklist') {
    $('paneChecklist').hidden = false;
    renderChecklist();
  }
}

document.querySelectorAll('.d-tab').forEach((tab) => {
  tab.addEventListener('click', () => switchDetailTab(tab.dataset.dtab));
});

// ---------- Service History Tab ----------
function renderServiceList(services) {
  const container = $('serviceList');
  if (!services || services.length === 0) {
    container.innerHTML = '<p class="hint">No service entries logged yet. Click "+ Log Service Entry" to start.</p>';
    return;
  }

  container.innerHTML = services
    .map(
      (s) => `
    <div class="service-item">
      <div class="row1">
        <span>${s.serviceType} <small style="color:var(--text-muted); font-size:12px;">(${s.category || 'Maintenance'})</small></span>
        <span>${money(s.cost)}</span>
      </div>
      <div class="row2">
        📅 ${fmtDate(s.date)} · 🛣️ ${s.odometer.toLocaleString('en-IN')} km ${s.garage ? '· 🏬 ' + s.garage : ''}
      </div>
      ${s.notes ? `<div class="row3">📝 ${s.notes}</div>` : ''}
      <div style="margin-top: 6px; text-align: right;">
        <button class="btn danger small" onclick="deleteService('${s._id}')">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

window.deleteService = async function (sId) {
  if (confirm('Delete this service entry?')) {
    await fetch(`${API}/services/${sId}`, { method: 'DELETE' });
    openDetail(currentVehicleId);
  }
};

// ---------- Fuel History Tab ----------
function renderFuelList(fuelLogs) {
  const container = $('fuelList');
  if (!fuelLogs || fuelLogs.length === 0) {
    container.innerHTML = '<p class="hint">No fuel refills logged yet. Click "+ Log Fuel Refill" to track mileage.</p>';
    return;
  }

  container.innerHTML = fuelLogs
    .map(
      (f) => `
    <div class="fuel-item">
      <div class="row1">
        <span>⛽ ${f.liters} ${currentVehicle.fuelType === 'Electric' ? 'kWh' : 'L'} @ ₹${f.pricePerLiter}/${currentVehicle.fuelType === 'Electric' ? 'kWh' : 'L'}</span>
        <span>${money(f.totalCost)}</span>
      </div>
      <div class="row2">
        📅 ${fmtDate(f.date)} · 🛣️ ${f.odometer.toLocaleString('en-IN')} km ${f.station ? '· ⛽ ' + f.station : ''} ${f.fullTank ? '· [Full Tank]' : ''}
      </div>
      ${f.notes ? `<div class="row3">📝 ${f.notes}</div>` : ''}
      <div style="margin-top: 6px; text-align: right;">
        <button class="btn danger small" onclick="deleteFuel('${f._id}')">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

window.deleteFuel = async function (fId) {
  if (confirm('Delete this fuel entry?')) {
    await fetch(`${API}/fuel/${fId}`, { method: 'DELETE' });
    openDetail(currentVehicleId);
  }
};

// ---------- Document Vault Tab ----------
function getCalendarUrl(title, expiryDays) {
  if (expiryDays === null || expiryDays === undefined || expiryDays < 0) return null;
  const targetDate = new Date(Date.now() + expiryDays * 86400000);
  const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '');
  const eventTitle = encodeURIComponent(`TrackNTune Expiry: ${title} - ${currentVehicle ? currentVehicle.name : 'Vehicle'}`);
  const details = encodeURIComponent(`Document expiry reminder logged via TrackNTune for ${currentVehicle ? currentVehicle.name : ''}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dateStr}/${dateStr}&details=${details}`;
}

function renderDocumentVault(v) {
  const container = $('docsVaultGrid');

  const docItem = (title, icon, info) => {
    let badgeClass = 'ok';
    let badgeLabel = 'Active';

    if (info.status === 'none') {
      badgeClass = 'secondary';
      badgeLabel = 'Not Set / N/A';
    } else if (info.status === 'overdue') {
      badgeClass = 'overdue';
      badgeLabel = 'EXPIRED!';
    } else if (info.status === 'due-soon') {
      badgeClass = 'due-soon';
      badgeLabel = `Due in ${info.days} days`;
    } else if (info.days) {
      badgeLabel = `${info.days} days left`;
    }

    const calUrl = getCalendarUrl(title, info.days);

    return `
      <div class="doc-card">
        <div>
          <div class="doc-title">${icon} ${title}</div>
          <div class="doc-date">${info.days !== null ? (info.days <= 0 ? 'Expired' : fmtDate(new Date(Date.now() + info.days * 86400000))) : 'No Date Logged'}</div>
        </div>
        <div class="doc-status" style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <span class="pill ${badgeClass}">${badgeLabel}</span>
          ${calUrl ? `<a href="${calUrl}" target="_blank" class="btn secondary small print-hide-btn" style="padding:3px 8px; font-size:11px; text-decoration:none;">📅 Add Reminder</a>` : ''}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    ${docItem('Insurance Policy', '🛡️', v.insuranceInfo)}
    ${docItem('PUC Certificate', '🌿', v.pucInfo)}
    ${docItem('Road Tax', '📜', v.taxInfo)}
    ${docItem('Scheduled Maintenance', '🛠️', { status: v.serviceStatus, days: v.daysRemaining })}
  `;

  $('editDocsBtn').onclick = () => editCurrentVehicle();
}

// ---------- Analytics Charts ----------
let categoryApexChart = null;
let mileageApexChart = null;

async function loadAnalytics() {
  const res = await fetch(`${API}/analytics/vehicle/${currentVehicleId}`);
  const data = await res.json();

  // Category Spend Donut Chart via ApexCharts
  const catContainer = $('categoryChart');
  const catKeys = Object.keys(data.categorySpend || {});
  if (catKeys.length === 0) {
    catContainer.innerHTML = '<p class="hint">No expense data available yet.</p>';
  } else {
    catContainer.innerHTML = '<div id="apexCategoryChart"></div>';
    const series = catKeys.map((k) => data.categorySpend[k]);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    if (typeof ApexCharts !== 'undefined') {
      if (categoryApexChart) categoryApexChart.destroy();
      categoryApexChart = new ApexCharts(document.querySelector("#apexCategoryChart"), {
        chart: { type: 'donut', height: 260, background: 'transparent' },
        labels: catKeys,
        series: series,
        theme: { mode: isDark ? 'dark' : 'light' },
        colors: ['#f5a623', '#3a92d4', '#4caf7d', '#e0393e', '#7000ff'],
        legend: { position: 'bottom', labels: { colors: isDark ? '#eef0f3' : '#212529' } },
        tooltip: { y: { formatter: (val) => '₹' + val.toLocaleString('en-IN') } }
      });
      categoryApexChart.render();
    }
  }

  // Mileage Trend Line Chart via ApexCharts
  const mileageContainer = $('mileageChart');
  const history = data.efficiencyHistory || [];
  if (history.length === 0) {
    mileageContainer.innerHTML = '<p class="hint">Log at least 2 full tank fuel refills to calculate mileage trend.</p>';
  } else {
    mileageContainer.innerHTML = '<div id="apexMileageChart"></div>';
    const dates = history.map((h) => fmtDate(h.date));
    const values = history.map((h) => h.kmPerLiter);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    if (typeof ApexCharts !== 'undefined') {
      if (mileageApexChart) mileageApexChart.destroy();
      mileageApexChart = new ApexCharts(document.querySelector("#apexMileageChart"), {
        chart: { type: 'line', height: 260, background: 'transparent', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        series: [{ name: 'Fuel Mileage (km/L)', data: values }],
        xaxis: { categories: dates, labels: { style: { colors: isDark ? '#8d939d' : '#6c757d' } } },
        yaxis: { labels: { style: { colors: isDark ? '#8d939d' : '#6c757d' } } },
        theme: { mode: isDark ? 'dark' : 'light' },
        colors: ['#4caf7d'],
        tooltip: { y: { formatter: (val) => val + ' km/L' } }
      });
      mileageApexChart.render();
    }
  }
}

// ---------- Add Service Modal Events ----------
$('openAddService').addEventListener('click', () => {
  $('serviceForm').reset();
  $('sDate').valueAsDate = new Date();
  populateServiceTypes(currentVehicle.type);
  $('sVehicleId').value = currentVehicleId;
  openModal('serviceModal');
});

$('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    vehicle: $('sVehicleId').value,
    date: $('sDate').value,
    odometer: Number($('sOdometer').value),
    category: $('sCategory').value,
    serviceType: $('sType').value,
    cost: Number($('sCost').value) || 0,
    garage: $('sGarage').value,
    notes: $('sNotes').value,
    intervalKm: $('sIntervalKm').value ? Number($('sIntervalKm').value) : null,
    intervalMonths: $('sIntervalMonths').value ? Number($('sIntervalMonths').value) : null
  };

  await fetch(`${API}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  closeModal('serviceModal');
  openDetail(currentVehicleId);
});

// ---------- Add Fuel Modal Events ----------
$('openAddFuel').addEventListener('click', () => {
  $('fuelForm').reset();
  $('fDate').valueAsDate = new Date();
  $('fVehicleId').value = currentVehicleId;

  if (currentVehicle.fuelType === 'Electric') {
    $('fVolumeLabel').textContent = 'Energy Added (kWh)';
    $('fPriceLabel').textContent = 'Price per kWh (₹)';
  } else {
    $('fVolumeLabel').textContent = 'Fuel Quantity (Liters)';
    $('fPriceLabel').textContent = 'Price per Liter (₹)';
  }

  openModal('fuelModal');
});

// Auto-calculate fuel total cost
function calcFuelTotal() {
  const liters = Number($('fLiters').value) || 0;
  const price = Number($('fPrice').value) || 0;
  if (liters && price) {
    $('fTotalCost').value = (liters * price).toFixed(2);
  }
}
$('fLiters').addEventListener('input', calcFuelTotal);
$('fPrice').addEventListener('input', calcFuelTotal);

$('fuelForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    vehicle: $('fVehicleId').value,
    date: $('fDate').value,
    odometer: Number($('fOdometer').value),
    liters: Number($('fLiters').value),
    pricePerLiter: Number($('fPrice').value),
    totalCost: Number($('fTotalCost').value),
    fullTank: $('fFullTank').checked,
    station: $('fStation').value,
    notes: $('fNotes').value
  };

  await fetch(`${API}/fuel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  closeModal('fuelModal');
  openDetail(currentVehicleId);
});

// ---------- Pre-Trip Safety Checklist ----------
const CHECKLIST_SECTIONS = [
  {
    category: '🛞 Tires & Wheels',
    items: ['Check cold tire pressure (including spare)', 'Inspect tire tread depth & uneven wear', 'Ensure wheel lug nuts are tightened', 'Inspect rims for cracks or bends']
  },
  {
    category: '🛢️ Engine & Vital Fluids',
    items: ['Check engine oil dipstick level', 'Inspect coolant level in overflow reservoir', 'Check brake fluid reservoir level', 'Top up windshield washer fluid', 'Inspect for under-car oil/fluid leaks']
  },
  {
    category: '⚡ Electricals & Battery',
    items: ['Test headlights, high beams & indicators', 'Check brake lights & reverse lamps', 'Inspect battery terminals for corrosion', 'Ensure horn and windshield wipers operate']
  },
  {
    category: '🧰 Safety Gear & Emergency Kit',
    items: ['First-aid kit present & restocked', 'Emergency warning triangle & reflective vest', 'Portable tire inflator / jack & lug wrench', 'Tool kit & spare fuses']
  }
];

function getChecklistStateKey() {
  return `tnt_checklist_${currentVehicleId || 'global'}`;
}

function getChecklistState() {
  try {
    const raw = localStorage.getItem(getChecklistStateKey());
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveChecklistState(state) {
  try {
    localStorage.setItem(getChecklistStateKey(), JSON.stringify(state));
  } catch (e) {}
}

function renderChecklist() {
  const container = $('checklistContainer');
  const state = getChecklistState();

  container.innerHTML = CHECKLIST_SECTIONS.map((sec, secIdx) => {
    const allChecked = sec.items.every((_, itemIdx) => state[`${secIdx}_${itemIdx}`]);

    return `
      <div class="checklist-card ${allChecked ? 'completed' : ''}">
        <h4>${sec.category} ${allChecked ? '✅' : ''}</h4>
        ${sec.items
          .map((item, itemIdx) => {
            const key = `${secIdx}_${itemIdx}`;
            const isChecked = !!state[key];
            return `
            <label class="checklist-item">
              <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${key}', this.checked)" />
              <span class="${isChecked ? 'checked' : ''}">${item}</span>
            </label>
          `;
          })
          .join('')}
      </div>
    `;
  }).join('');
}

window.toggleChecklistItem = function (key, isChecked) {
  const state = getChecklistState();
  state[key] = isChecked;
  saveChecklistState(state);
  renderChecklist();
};

$('resetChecklistBtn').addEventListener('click', () => {
  if (confirm('Reset all checklist items for this vehicle?')) {
    saveChecklistState({});
    renderChecklist();
  }
});

// ---------- Fleet Cost & Performance Comparison ----------
$('openCompareBtn').addEventListener('click', async () => {
  openModal('compareModal');
  const container = $('compareGrid');
  container.innerHTML = '<p class="hint">Calculating fleet metrics...</p>';

  const res = await fetch(`${API}/vehicles`);
  const vehicles = await res.json();

  if (!vehicles || vehicles.length === 0) {
    container.innerHTML = '<p class="hint">No vehicles available to compare.</p>';
    return;
  }

  // Find lowest cost per km to highlight
  let lowestCpk = Infinity;
  vehicles.forEach((v) => {
    if (v.costPerKm !== undefined && v.costPerKm < lowestCpk) lowestCpk = v.costPerKm;
  });

  container.innerHTML = vehicles
    .map((v) => {
      const isBest = v.costPerKm !== undefined && v.costPerKm === lowestCpk && vehicles.length > 1;
      return `
        <div class="compare-card ${isBest ? 'highlight' : ''}">
          ${isBest ? '<span class="pill ok" style="position:absolute; top:12px; right:12px; font-size:10px;">★ Most Economical</span>' : ''}
          <h4>${v.name}</h4>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">${v.type.toUpperCase()} · ${v.fuelType}</div>
          
          <div class="compare-metric-row">
            <span class="c-label">Running Cost / km:</span>
            <span class="c-val" style="color:var(--amber);">₹${v.costPerKm !== undefined ? v.costPerKm : '0.00'}/km</span>
          </div>
          <div class="compare-metric-row">
            <span class="c-label">Avg Fuel Economy:</span>
            <span class="c-val">${v.avgKmPerLiter ? v.avgKmPerLiter + (v.fuelType === 'Electric' ? ' km/kWh' : ' km/L') : 'N/A'}</span>
          </div>
          <div class="compare-metric-row">
            <span class="c-label">Current Odometer:</span>
            <span class="c-val">${v.currentOdometer.toLocaleString('en-IN')} km</span>
          </div>
          <div class="compare-metric-row">
            <span class="c-label">Total Maintenance Spend:</span>
            <span class="c-val">${money(v.totalServiceSpend)}</span>
          </div>
          <div class="compare-metric-row">
            <span class="c-label">Total Fuel Spend:</span>
            <span class="c-val">${money(v.totalFuelSpend)}</span>
          </div>
          <div class="compare-metric-row">
            <span class="c-label">Total Cost of Ownership:</span>
            <span class="c-val" style="font-size:15px; color:var(--text);">${money(v.totalSpend)}</span>
          </div>
        </div>
      `;
    })
    .join('');
});

// ---------- Floating Action Button (FAB) Speed Dial ----------
const fabMainBtn = $('fabMainBtn');
const fabMenu = $('fabMenu');

fabMainBtn.addEventListener('click', () => {
  fabMenu.hidden = !fabMenu.hidden;
  fabMainBtn.textContent = fabMenu.hidden ? '+' : '✕';
});

$('fabAddVehicle').addEventListener('click', () => {
  fabMenu.hidden = true;
  fabMainBtn.textContent = '+';
  $('vehicleForm').reset();
  $('vehicleId').value = '';
  $('vehicleModalTitle').textContent = 'Add New Vehicle';
  selectPreset('/images/car_sedan.svg');
  openModal('vehicleModal');
});

$('fabLogService').addEventListener('click', () => {
  fabMenu.hidden = true;
  fabMainBtn.textContent = '+';
  if (!currentVehicleId) {
    alert('Please select a vehicle from the dashboard to log a service entry.');
    return;
  }
  $('serviceForm').reset();
  $('sDate').valueAsDate = new Date();
  populateServiceTypes(currentVehicle ? currentVehicle.type : 'car');
  $('sVehicleId').value = currentVehicleId;
  openModal('serviceModal');
});

$('fabLogFuel').addEventListener('click', () => {
  fabMenu.hidden = true;
  fabMainBtn.textContent = '+';
  if (!currentVehicleId) {
    alert('Please select a vehicle from the dashboard to log a fuel refill.');
    return;
  }
  $('fuelForm').reset();
  $('fDate').valueAsDate = new Date();
  $('fVehicleId').value = currentVehicleId;
  openModal('fuelModal');
});

// ---------- App Theme Switching ----------
const themeSelect = $('themeSelect');
if (themeSelect) {
  const savedTheme = localStorage.getItem('tnt_theme') || 'dark';
  themeSelect.value = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    document.documentElement.setAttribute('data-theme', val);
    localStorage.setItem('tnt_theme', val);
    if (currentVehicleId && !$('paneAnalytics').hidden) {
      loadAnalytics();
    }
  });
}

// ---------- Navigation & Back Button Popstate Handler ----------
function goBackToFleet() {
  // Close any open modals first
  document.querySelectorAll('.modal-overlay').forEach((m) => (m.hidden = true));

  if (!$('detailView').hidden) {
    $('detailView').hidden = true;
    $('dashboardView').hidden = false;
    currentVehicleId = null;
    currentVehicle = null;
    loadDashboard();
    if (window.location.hash) history.pushState('', document.title, window.location.pathname + window.location.search);
  }
}

$('backBtn').addEventListener('click', goBackToFleet);

window.addEventListener('popstate', () => {
  const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter((m) => !m.hidden);
  if (openModals.length > 0) {
    openModals.forEach((m) => (m.hidden = true));
    return;
  }
  if (!$('detailView').hidden) {
    goBackToFleet();
  }
});

// ---------- Print Maintenance Certificate ----------
$('printCertBtn').addEventListener('click', () => {
  window.print();
});

// ---------- Trip Fuel Planner with Passenger Cost Split ----------
$('openTripPlannerBtn').addEventListener('click', async () => {
  openModal('tripPlannerModal');
  const select = $('tripVehicleSelect');
  const res = await fetch(`${API}/vehicles`);
  const vehicles = await res.json();
  select.innerHTML = vehicles
    .map((v) => `<option value="${v._id}">${v.name} (${v.avgKmPerLiter ? v.avgKmPerLiter + (v.fuelType === 'Electric' ? ' km/kWh' : ' km/L') : '15 km/L default'})</option>`)
    .join('');
  if (currentVehicleId) select.value = currentVehicleId;
});

$('tripPlannerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const vId = $('tripVehicleSelect').value;
  const dist = Number($('tripDistance').value) || 0;
  const passengers = Math.max(1, Number($('tripPassengers').value) || 1);
  const price = Number($('tripFuelPrice').value) || 0;

  const res = await fetch(`${API}/vehicles/${vId}`);
  const v = await res.json();
  const economy = v.avgKmPerLiter || 15;

  const estFuel = (dist / economy).toFixed(2);
  const estCost = Math.round((dist / economy) * price);
  const costPerPerson = Math.round(estCost / passengers);

  $('tripEstFuel').textContent = `${estFuel} ${v.fuelType === 'Electric' ? 'kWh' : 'L'}`;
  $('tripEstCost').textContent = money(estCost);
  $('tripCostPerPerson').textContent = money(costPerPerson) + (passengers > 1 ? ` (${passengers} passengers)` : '');
  $('tripAvgEconomy').textContent = `${economy} ${v.fuelType === 'Electric' ? 'km/kWh' : 'km/L'}`;
  $('tripResultCard').hidden = false;
});

// The selected account decides whether the login gate or its role dashboard is shown above.

// ---------- Register Service Worker for PWA ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
      .catch((err) => console.warn('PWA Service Worker registration failed:', err));
  });
}

