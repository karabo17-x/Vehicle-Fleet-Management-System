import { requireAuth } from '../auth/authGuard.js';
import { logout, isStaff } from '../auth/session.js';
import { listDrivers, createDriver, updateDriver, deleteDriver } from '../api/drivers.api.js';
import { showToast, confirmDelete, withLoading, escapeHtml } from '../utils/ui.js';
import { daysUntil } from '../utils/formatters.js';

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const SAMPLE = [
  { id: 1, first_name: 'Thabo', last_name: 'Mokoena', license_number: 'DL-0019283', license_expiry: inDays(5), status: 'Active' },
  { id: 2, first_name: 'Lerato', last_name: 'Dlamini', license_number: 'DL-0027441', license_expiry: inDays(300), status: 'Active' },
];

let drivers = [];
let usingSample = false;
const staff = isStaff();

const rowsEl = document.getElementById('rows');
const noticeEl = document.getElementById('notice');
const searchEl = document.getElementById('search');
const statusFilterEl = document.getElementById('status-filter');
const dialogEl = document.getElementById('driver-dialog');
const formEl = document.getElementById('driver-form');
const dialogTitleEl = document.getElementById('dialog-title');

const demoMode = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');

// Server already sends DriverPublicOut (no license_number) to staff per
// NFR13/POPIA — this just also hides the column/field client-side so the
// UI doesn't show an empty cell oddly, and staff can't open an edit form
// expecting to see a field that was never sent.
if (staff) {
  document.getElementById('licence-col').hidden = true;
  document.getElementById('licence-field').hidden = true;
  document.getElementById('d-licence').required = false;
}

function urgencyClass(days) {
  if (days <= 7) return 'badge-maintenance';
  return 'badge-active';
}

function renderRows() {
  const search = searchEl.value.trim().toLowerCase();
  const status = statusFilterEl.value;
  const filtered = drivers.filter((d) => {
    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    const matchesSearch = !search || fullName.includes(search);
    const matchesStatus = !status || d.status === status;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    rowsEl.innerHTML = `<tr class="empty-row"><td colspan="${staff ? 4 : 5}">No drivers match.</td></tr>`;
    return;
  }

  rowsEl.innerHTML = filtered
    .map((d) => {
      const days = d.license_expiry ? daysUntil(d.license_expiry) : null;
      const licenceCell = staff ? '' : `<td>${escapeHtml(d.license_number ?? '—')}</td>`;
      return `
    <tr data-id="${d.id}">
      <td>${escapeHtml(d.first_name)} ${escapeHtml(d.last_name)}</td>
      ${licenceCell}
      <td>${days !== null ? `<span class="badge ${urgencyClass(days)}">${d.license_expiry}</span>` : '—'}</td>
      <td>${escapeHtml(d.status)}</td>
      <td class="row-actions">
        <button class="edit-btn" type="button">Edit</button>
        ${staff ? '' : '<button class="danger delete-btn" type="button">Delete</button>'}
      </td>
    </tr>`;
    })
    .join('');
}

async function loadDrivers() {
  if (demoMode) {
    drivers = SAMPLE;
    usingSample = true;
  } else {
    try {
      drivers = await listDrivers();
      usingSample = false;
    } catch {
      drivers = SAMPLE;
      usingSample = true;
    }
  }
  noticeEl.hidden = !usingSample;
  if (usingSample) noticeEl.textContent = "Can't reach the backend yet, so this is sample data — changes here won't be saved.";
  renderRows();
}

function openDialogForAdd() {
  formEl.reset();
  document.getElementById('d-id').value = '';
  dialogTitleEl.textContent = 'Add driver';
  dialogEl.showModal();
}

function openDialogForEdit(driver) {
  document.getElementById('d-id').value = driver.id;
  document.getElementById('d-first').value = driver.first_name;
  document.getElementById('d-last').value = driver.last_name;
  if (!staff) document.getElementById('d-licence').value = driver.license_number ?? '';
  document.getElementById('d-expiry').value = driver.license_expiry ?? '';
  document.getElementById('d-status').value = driver.status;
  dialogTitleEl.textContent = 'Edit driver';
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
  const driver = drivers.find((d) => d.id === id);

  if (e.target.classList.contains('edit-btn')) {
    openDialogForEdit(driver);
  } else if (e.target.classList.contains('delete-btn')) {
    if (!confirmDelete(`${driver.first_name} ${driver.last_name}`)) return;
    await withLoading(e.target, async () => {
      if (usingSample) {
        drivers = drivers.filter((d) => d.id !== id);
      } else {
        try {
          await deleteDriver(id);
          drivers = drivers.filter((d) => d.id !== id);
        } catch (err) {
          showToast(err.message || 'Could not delete driver.', 'error');
          return;
        }
      }
      renderRows();
      showToast('Driver deleted.');
    });
  }
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('d-id').value;
  const data = {
    first_name: document.getElementById('d-first').value.trim(),
    last_name: document.getElementById('d-last').value.trim(),
    license_expiry: document.getElementById('d-expiry').value,
    status: document.getElementById('d-status').value,
  };
  if (!staff) data.license_number = document.getElementById('d-licence').value.trim();

  if (!staff) {
    const duplicate = drivers.some(
      (d) => d.license_number?.toLowerCase() === data.license_number.toLowerCase() && String(d.id) !== id,
    );
    if (duplicate) {
      showToast('A driver with that licence number already exists.', 'error');
      return;
    }
  }

  const saveBtn = document.getElementById('save-btn');
  await withLoading(saveBtn, async () => {
    try {
      if (usingSample) {
        if (id) {
          drivers = drivers.map((d) => (String(d.id) === id ? { ...d, ...data } : d));
        } else {
          drivers.push({ id: Date.now(), ...data });
        }
      } else if (id) {
        await updateDriver(id, data);
        drivers = drivers.map((d) => (String(d.id) === id ? { ...d, ...data } : d));
      } else {
        const created = await createDriver(data);
        drivers.push(created);
      }
      renderRows();
      showToast(id ? 'Driver updated.' : 'Driver added.');
      dialogEl.close();
    } catch (err) {
      showToast(err.message || 'Could not save driver.', 'error');
    }
  });
});

if (requireAuth()) {
  document.getElementById('logout-btn').addEventListener('click', logout);
  loadDrivers();
}
