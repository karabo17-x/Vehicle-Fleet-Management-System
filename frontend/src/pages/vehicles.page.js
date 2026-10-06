import { requireAuth } from '../auth/authGuard.js';
import { logout } from '../auth/session.js';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles.api.js';
import { showToast, confirmDelete, withLoading, escapeHtml } from '../utils/ui.js';

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// Shown only when the backend can't be reached, so the page is previewable
// with `?demo` while the backend team's endpoints aren't up yet.
const SAMPLE = [
  { id: 1, registration_number: 'CA 123-456', make: 'Toyota', model: 'Hilux', year: 2022, status: 'Active', insurance_expiry: inDays(20) },
  { id: 2, registration_number: 'GP 987-654', make: 'Isuzu', model: 'D-Max', year: 2021, status: 'Active', insurance_expiry: inDays(200) },
  { id: 3, registration_number: 'NW 555-111', make: 'Ford', model: 'Ranger', year: 2020, status: 'In Maintenance', insurance_expiry: inDays(90) },
];

let vehicles = [];
let usingSample = false;

const rowsEl = document.getElementById('rows');
const noticeEl = document.getElementById('notice');
const searchEl = document.getElementById('search');
const statusFilterEl = document.getElementById('status-filter');
const dialogEl = document.getElementById('vehicle-dialog');
const formEl = document.getElementById('vehicle-form');
const dialogTitleEl = document.getElementById('dialog-title');

const demoMode = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');

function statusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'badge-active';
  if (s.includes('maint')) return 'badge-maintenance';
  return 'badge-inactive';
}

function renderRows() {
  const search = searchEl.value.trim().toLowerCase();
  const status = statusFilterEl.value;
  const filtered = vehicles.filter((v) => {
    const matchesSearch = !search || v.registration_number.toLowerCase().includes(search);
    const matchesStatus = !status || v.status === status;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    rowsEl.innerHTML = `<tr class="empty-row"><td colspan="6">No vehicles match.</td></tr>`;
    return;
  }

  rowsEl.innerHTML = filtered
    .map(
      (v) => `
    <tr data-id="${v.id}">
      <td>${escapeHtml(v.registration_number)}</td>
      <td>${escapeHtml(v.make)} ${escapeHtml(v.model)}</td>
      <td>${escapeHtml(String(v.year))}</td>
      <td><span class="badge ${statusBadgeClass(v.status)}">${escapeHtml(v.status)}</span></td>
      <td>${v.insurance_expiry ?? '—'}</td>
      <td class="row-actions">
        <button class="edit-btn" type="button">Edit</button>
        <button class="danger delete-btn" type="button">Delete</button>
      </td>
    </tr>`,
    )
    .join('');
}

async function loadVehicles() {
  if (demoMode) {
    vehicles = SAMPLE;
    usingSample = true;
  } else {
    try {
      vehicles = await listVehicles();
      usingSample = false;
    } catch {
      vehicles = SAMPLE;
      usingSample = true;
    }
  }
  noticeEl.hidden = !usingSample;
  if (usingSample) noticeEl.textContent = "Can't reach the backend yet, so this is sample data — changes here won't be saved.";
  renderRows();
}

function openDialogForAdd() {
  formEl.reset();
  document.getElementById('v-id').value = '';
  dialogTitleEl.textContent = 'Add vehicle';
  dialogEl.showModal();
}

function openDialogForEdit(vehicle) {
  document.getElementById('v-id').value = vehicle.id;
  document.getElementById('v-registration').value = vehicle.registration_number;
  document.getElementById('v-make').value = vehicle.make;
  document.getElementById('v-model').value = vehicle.model;
  document.getElementById('v-year').value = vehicle.year;
  document.getElementById('v-status').value = vehicle.status;
  dialogTitleEl.textContent = 'Edit vehicle';
  dialogEl.showModal();
}

document.getElementById('add-btn').addEventListener('click', openDialogForAdd);
document.getElementById('cancel-btn').addEventListener('click', () => dialogEl.close());
searchEl.addEventListener('input', renderRows);
statusFilterEl.addEventListener('change', renderRows);

rowsEl.addEventListener('click', async (e) => {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = Number(tr.dataset.id);
  const vehicle = vehicles.find((v) => v.id === id);

  if (e.target.classList.contains('edit-btn')) {
    openDialogForEdit(vehicle);
  } else if (e.target.classList.contains('delete-btn')) {
    if (!confirmDelete(`vehicle ${vehicle.registration_number}`)) return;
    await withLoading(e.target, async () => {
      if (usingSample) {
        vehicles = vehicles.filter((v) => v.id !== id);
      } else {
        try {
          await deleteVehicle(id);
          vehicles = vehicles.filter((v) => v.id !== id);
        } catch (err) {
          showToast(err.message || 'Could not delete vehicle.', 'error');
          return;
        }
      }
      renderRows();
      showToast('Vehicle deleted.');
    });
  }
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault(); // form uses method="dialog"; we close it manually after saving succeeds
  const id = document.getElementById('v-id').value;
  const data = {
    registration_number: document.getElementById('v-registration').value.trim(),
    make: document.getElementById('v-make').value.trim(),
    model: document.getElementById('v-model').value.trim(),
    year: Number(document.getElementById('v-year').value),
    status: document.getElementById('v-status').value,
  };

  // Client-side duplicate check (SDD 7.1 "error prevention") — the real
  // check still happens server-side via the unique constraint (SDD 6.4).
  const duplicate = vehicles.some(
    (v) => v.registration_number.toLowerCase() === data.registration_number.toLowerCase() && String(v.id) !== id,
  );
  if (duplicate) {
    showToast('A vehicle with that registration number already exists.', 'error');
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  await withLoading(saveBtn, async () => {
    try {
      if (usingSample) {
        if (id) {
          vehicles = vehicles.map((v) => (String(v.id) === id ? { ...v, ...data } : v));
        } else {
          vehicles.push({ id: Date.now(), ...data, insurance_expiry: null });
        }
      } else if (id) {
        await updateVehicle(id, data);
        vehicles = vehicles.map((v) => (String(v.id) === id ? { ...v, ...data } : v));
      } else {
        const created = await createVehicle(data);
        vehicles.push(created);
      }
      renderRows();
      showToast(id ? 'Vehicle updated.' : 'Vehicle added.');
      dialogEl.close();
    } catch (err) {
      showToast(err.message || 'Could not save vehicle.', 'error');
    }
  });
});

if (requireAuth()) {
  document.getElementById('logout-btn').addEventListener('click', logout);
  loadVehicles();
}
