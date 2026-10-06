import { requireAuth } from '../auth/authGuard.js';
import { logout } from '../auth/session.js';
import { listVehicles } from '../api/vehicles.api.js';
import { listDrivers, updateDriver } from '../api/drivers.api.js';
import { showToast, confirmDelete, withLoading, escapeHtml } from '../utils/ui.js';

// NOTE: the SDD doesn't define a dedicated assignment endpoint — section
// 2.4 says reassigning happens through `PUT /drivers/{id}`. This page
// assumes that update accepts a `vehicle_id` field (null to unassign).
// Confirm the actual field name with the backend team and adjust the two
// `updateDriver(...)` calls below if it's different (e.g. `current_vehicle_id`).
//
// This also means there's no real assignment *history* yet (the SDD's
// `assignments` table with assignedAt/unassignedAt isn't exposed by any
// listed endpoint) — this page only shows the current state.

const SAMPLE_VEHICLES = [
  { id: 1, registration_number: 'CA 123-456' },
  { id: 2, registration_number: 'GP 987-654' },
  { id: 3, registration_number: 'NW 555-111' },
];
const SAMPLE_DRIVERS = [
  { id: 1, first_name: 'Thabo', last_name: 'Mokoena', vehicle_id: 1, assigned_at: '2026-09-15' },
  { id: 2, first_name: 'Lerato', last_name: 'Dlamini', vehicle_id: null, assigned_at: null },
];

let vehicles = [];
let drivers = [];
let usingSample = false;

const rowsEl = document.getElementById('rows');
const unassignedEl = document.getElementById('unassigned-list');
const noticeEl = document.getElementById('notice');
const dialogEl = document.getElementById('assign-dialog');
const formEl = document.getElementById('assign-form');
const vehicleSelectEl = document.getElementById('a-vehicle');
const driverSelectEl = document.getElementById('a-driver');

const demoMode = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');

function vehicleLabel(id) {
  return vehicles.find((v) => v.id === id)?.registration_number ?? `#${id}`;
}

function render() {
  const assigned = drivers.filter((d) => d.vehicle_id);
  rowsEl.innerHTML =
    assigned.length === 0
      ? `<tr class="empty-row"><td colspan="4">No active assignments.</td></tr>`
      : assigned
          .map(
            (d) => `
    <tr data-driver-id="${d.id}">
      <td>${escapeHtml(vehicleLabel(d.vehicle_id))}</td>
      <td>${escapeHtml(d.first_name)} ${escapeHtml(d.last_name)}</td>
      <td>${d.assigned_at ?? '—'}</td>
      <td class="row-actions"><button class="danger unassign-btn" type="button">Unassign</button></td>
    </tr>`,
          )
          .join('');

  const assignedVehicleIds = new Set(assigned.map((d) => d.vehicle_id));
  const unassignedVehicles = vehicles.filter((v) => !assignedVehicleIds.has(v.id));
  unassignedEl.innerHTML =
    unassignedVehicles.length === 0
      ? '<li>Every vehicle currently has a driver assigned.</li>'
      : unassignedVehicles.map((v) => `<li>${escapeHtml(v.registration_number)}</li>`).join('');
}

function populateDialogOptions() {
  vehicleSelectEl.innerHTML = vehicles
    .map((v) => `<option value="${v.id}">${escapeHtml(v.registration_number)}</option>`)
    .join('');
  // Only drivers without a current vehicle can be assigned — avoids one
  // driver silently holding two vehicles (mirrors FR21 in the SDD).
  const available = drivers.filter((d) => !d.vehicle_id);
  driverSelectEl.innerHTML =
    available.length === 0
      ? '<option value="">No unassigned drivers</option>'
      : available.map((d) => `<option value="${d.id}">${escapeHtml(d.first_name)} ${escapeHtml(d.last_name)}</option>`).join('');
}

async function loadData() {
  if (demoMode) {
    vehicles = SAMPLE_VEHICLES;
    drivers = SAMPLE_DRIVERS;
    usingSample = true;
  } else {
    try {
      [vehicles, drivers] = await Promise.all([listVehicles(), listDrivers()]);
      usingSample = false;
    } catch {
      vehicles = SAMPLE_VEHICLES;
      drivers = SAMPLE_DRIVERS;
      usingSample = true;
    }
  }
  noticeEl.hidden = !usingSample;
  if (usingSample) noticeEl.textContent = "Can't reach the backend yet, so this is sample data — changes here won't be saved.";
  render();
}

document.getElementById('add-btn').addEventListener('click', () => {
  populateDialogOptions();
  dialogEl.showModal();
});
document.getElementById('cancel-btn').addEventListener('click', () => dialogEl.close());

rowsEl.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('unassign-btn')) return;
  const tr = e.target.closest('tr');
  const driverId = Number(tr.dataset.driverId);
  const driver = drivers.find((d) => d.id === driverId);
  if (!confirmDelete(`unassign ${driver.first_name} ${driver.last_name} from their vehicle`)) return;

  await withLoading(e.target, async () => {
    try {
      if (!usingSample) await updateDriver(driverId, { vehicle_id: null });
      drivers = drivers.map((d) => (d.id === driverId ? { ...d, vehicle_id: null, assigned_at: null } : d));
      render();
      showToast('Driver unassigned.');
    } catch (err) {
      showToast(err.message || 'Could not unassign driver.', 'error');
    }
  });
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const vehicleId = Number(vehicleSelectEl.value);
  const driverId = Number(driverSelectEl.value);
  if (!driverId) {
    showToast('No driver available to assign.', 'error');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const saveBtn = document.getElementById('save-btn');
  await withLoading(saveBtn, async () => {
    try {
      if (!usingSample) await updateDriver(driverId, { vehicle_id: vehicleId });
      drivers = drivers.map((d) => (d.id === driverId ? { ...d, vehicle_id: vehicleId, assigned_at: today } : d));
      render();
      showToast('Driver assigned.');
      dialogEl.close();
    } catch (err) {
      showToast(err.message || 'Could not assign driver.', 'error');
    }
  });
});

if (requireAuth()) {
  document.getElementById('logout-btn').addEventListener('click', logout);
  loadData();
}
