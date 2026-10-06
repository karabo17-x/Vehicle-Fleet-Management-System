import { requireAuth } from '../auth/authGuard.js';
import { logout } from '../auth/session.js';
import { listMaintenance, createMaintenance, deleteMaintenance } from '../api/maintenance.api.js';
import { listVehicles } from '../api/vehicles.api.js';
import { showToast, confirmDelete, withLoading, escapeHtml } from '../utils/ui.js';

const SAMPLE_VEHICLES = [
  { id: 1, registration_number: 'CA 123-456' },
  { id: 2, registration_number: 'GP 987-654' },
  { id: 3, registration_number: 'NW 555-111' },
];
const SAMPLE_RECORDS = [
  { id: 1, vehicle_id: 1, service_date: '2026-09-01', description: 'Oil change + filter', cost: 1450 },
  { id: 2, vehicle_id: 3, service_date: '2026-08-15', description: 'Brake pads replaced', cost: 3200 },
];

let vehicles = [];
let records = [];
let usingSample = false;

const rowsEl = document.getElementById('rows');
const noticeEl = document.getElementById('notice');
const vehicleFilterEl = document.getElementById('vehicle-filter');
const dialogEl = document.getElementById('maint-dialog');
const formEl = document.getElementById('maint-form');
const vehicleSelectEl = document.getElementById('m-vehicle');

const demoMode = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');

function vehicleLabel(id) {
  return vehicles.find((v) => v.id === id)?.registration_number ?? `#${id}`;
}

function populateVehicleOptions() {
  const options = vehicles.map((v) => `<option value="${v.id}">${escapeHtml(v.registration_number)}</option>`).join('');
  vehicleFilterEl.innerHTML = `<option value="">All vehicles</option>${options}`;
  vehicleSelectEl.innerHTML = options;
}

function renderRows() {
  const filterId = vehicleFilterEl.value;
  const filtered = filterId ? records.filter((r) => String(r.vehicle_id) === filterId) : records;
  const sorted = [...filtered].sort((a, b) => b.service_date.localeCompare(a.service_date));

  if (sorted.length === 0) {
    rowsEl.innerHTML = `<tr class="empty-row"><td colspan="5">No maintenance records.</td></tr>`;
    return;
  }

  rowsEl.innerHTML = sorted
    .map(
      (r) => `
    <tr data-id="${r.id}">
      <td>${escapeHtml(vehicleLabel(r.vehicle_id))}</td>
      <td>${r.service_date}</td>
      <td>${escapeHtml(r.description)}</td>
      <td>R${Number(r.cost).toFixed(2)}</td>
      <td class="row-actions">
        <button class="danger delete-btn" type="button">Delete</button>
      </td>
    </tr>`,
    )
    .join('');
}

async function loadData() {
  if (demoMode) {
    vehicles = SAMPLE_VEHICLES;
    records = SAMPLE_RECORDS;
    usingSample = true;
  } else {
    try {
      [vehicles, records] = await Promise.all([listVehicles(), listMaintenance()]);
      usingSample = false;
    } catch {
      vehicles = SAMPLE_VEHICLES;
      records = SAMPLE_RECORDS;
      usingSample = true;
    }
  }
  noticeEl.hidden = !usingSample;
  if (usingSample) noticeEl.textContent = "Can't reach the backend yet, so this is sample data — changes here won't be saved.";
  populateVehicleOptions();
  renderRows();
}

document.getElementById('add-btn').addEventListener('click', () => {
  formEl.reset();
  document.getElementById('m-id').value = '';
  dialogEl.showModal();
});
document.getElementById('cancel-btn').addEventListener('click', () => dialogEl.close());
vehicleFilterEl.addEventListener('change', renderRows);

rowsEl.addEventListener('click', async (e) => {
  const tr = e.target.closest('tr');
  if (!tr || !e.target.classList.contains('delete-btn')) return;
  const id = Number(tr.dataset.id);
  const record = records.find((r) => r.id === id);
  if (!confirmDelete(`this maintenance record for ${vehicleLabel(record.vehicle_id)}`)) return;

  await withLoading(e.target, async () => {
    if (usingSample) {
      records = records.filter((r) => r.id !== id);
    } else {
      try {
        await deleteMaintenance(id);
        records = records.filter((r) => r.id !== id);
      } catch (err) {
        showToast(err.message || 'Could not delete record.', 'error');
        return;
      }
    }
    renderRows();
    showToast('Maintenance record deleted.');
  });
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    vehicle_id: Number(vehicleSelectEl.value),
    service_date: document.getElementById('m-date').value,
    description: document.getElementById('m-description').value.trim(),
    cost: Number(document.getElementById('m-cost').value),
  };

  const saveBtn = document.getElementById('save-btn');
  await withLoading(saveBtn, async () => {
    try {
      if (usingSample) {
        records.push({ id: Date.now(), ...data });
      } else {
        const created = await createMaintenance(data);
        records.push(created);
      }
      renderRows();
      showToast('Maintenance logged.');
      dialogEl.close();
    } catch (err) {
      showToast(err.message || 'Could not save record.', 'error');
    }
  });
});

if (requireAuth()) {
  document.getElementById('logout-btn').addEventListener('click', logout);
  loadData();
}
