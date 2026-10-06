import { requireAuth } from '../auth/authGuard.js';
import { getCurrentUser, logout } from '../auth/session.js';
import { listVehicles } from '../api/vehicles.api.js';
import { listDrivers } from '../api/drivers.api.js';
import { daysUntil, describeExpiry } from '../utils/formatters.js';

const WARN_DAYS = 30; // show items expiring within this many days

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// Shown only when the backend can't be reached, so the page is still previewable.
const SAMPLE = {
  vehicles: [
    { registration_number: 'CA 123-456', status: 'Active', insurance_expiry: inDays(20), roadworthy_expiry: inDays(28) },
    { registration_number: 'GP 987-654', status: 'Active', insurance_expiry: inDays(200) },
    { registration_number: 'NW 555-111', status: 'In Maintenance', insurance_expiry: inDays(90) },
  ],
  drivers: [
    { first_name: 'Thabo', last_name: 'Mokoena', license_expiry: inDays(5) },
    { first_name: 'Lerato', last_name: 'Dlamini', license_expiry: inDays(300) },
  ],
};

async function loadData() {
  try {
    const [vehicles, drivers] = await Promise.all([listVehicles(), listDrivers()]);
    return { vehicles, drivers, sample: false };
  } catch {
    return { ...SAMPLE, sample: true };
  }
}

function buildWarnings({ vehicles, drivers }) {
  const items = [];
  for (const d of drivers) {
    if (d.license_expiry) items.push({ label: `Driver licence: ${d.first_name} ${d.last_name}`, days: daysUntil(d.license_expiry) });
  }
  for (const v of vehicles) {
    if (v.insurance_expiry) items.push({ label: `Insurance: ${v.registration_number}`, days: daysUntil(v.insurance_expiry) });
    if (v.roadworthy_expiry) items.push({ label: `Roadworthy: ${v.registration_number}`, days: daysUntil(v.roadworthy_expiry) });
  }
  return items.filter((i) => i.days <= WARN_DAYS).sort((a, b) => a.days - b.days);
}

function render(data) {
  const { vehicles } = data;
  const inMaint = (v) => String(v.status).toLowerCase().includes('maint');
  document.getElementById('stat-total').textContent = vehicles.length;
  document.getElementById('stat-active').textContent = vehicles.filter((v) => String(v.status).toLowerCase() === 'active').length;
  document.getElementById('stat-maint').textContent = vehicles.filter(inMaint).length;
  document.getElementById('stat-drivers').textContent = data.drivers.length;

  const list = document.getElementById('warnings');
  list.replaceChildren();
  const warnings = buildWarnings(data);
  if (warnings.length === 0) {
    const li = document.createElement('li');
    li.textContent = `Nothing expiring in the next ${WARN_DAYS} days.`;
    list.append(li);
  }
  for (const w of warnings) {
    const li = document.createElement('li');
    if (w.days <= 7) li.className = 'urgent';
    li.textContent = `${w.label} — ${describeExpiry(w.days)}`;
    list.append(li);
  }

  const notice = document.getElementById('notice');
  notice.hidden = !data.sample;
  if (data.sample) notice.textContent = "Can't reach the backend yet, so this is sample data.";
}

if (requireAuth()) {
  const user = getCurrentUser();
  document.getElementById('welcome').textContent = user?.role ? `Signed in as ${user.role}` : 'Preview mode';
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('warnings').innerHTML = '<li>Loading…</li>';
  loadData().then(render);
}
