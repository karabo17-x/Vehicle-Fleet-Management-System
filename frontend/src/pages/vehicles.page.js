import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignDriver,
  unassignDriver,
} from '../api/vehicles.api.js';
import { listDrivers } from '../api/drivers.api.js';
import { getRole } from '../auth/session.js';
import { formatDate, formatStatus, toIsoOrNull } from '../utils/formatters.js';

// Must match the VehicleStatus values in backend/app/models/vehicle.py.
// Change this list if the backend uses different words.
const STATUS_OPTIONS = ['active', 'in_maintenance', 'retired'];

const PAGE_SIZE = 20;

function makeCell(text) {
  const td = document.createElement('td');
  td.textContent = text === null || text === undefined ? '' : text;
  return td;
}

function makeBadge(text, type) {
  const span = document.createElement('span');
  span.className = `badge ${type}`;
  span.textContent = text;
  return span;
}

function makeButton(text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

/** Date cell with a warning badge when expired or expiring within 30 days. Display only. */
function expiryCell(value) {
  const td = makeCell(formatDate(value));
  if (!value) return td;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return td;
  const days = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (days < 0) td.append(' ', makeBadge('Expired', 'danger'));
  else if (days <= 30) td.append(' ', makeBadge('Expires soon', 'warning'));
  return td;
}

function setMessage(box, text, type) {
  if (!text) {
    box.classList.add('hidden');
    box.textContent = '';
    return;
  }
  box.className = `message ${type}`;
  box.textContent = text;
}

function fillStatusSelect(select, withAllOption) {
  select.replaceChildren();
  if (withAllOption) {
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'All statuses';
    select.append(all);
  }
  STATUS_OPTIONS.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = formatStatus(status);
    select.append(option);
  });
}

/** "2026-09-29T00:00:00" -> "2026-09-29" for date inputs. */
function toDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

export async function render(container) {
  // Same rules as the backend: admin/manager write, admin/manager/staff assign.
  const role = getRole();
  const canWrite = role === 'admin' || role === 'manager';
  const canAssign = canWrite || role === 'staff';

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <h1>Vehicles</h1>
    <div class="message hidden" data-message></div>

    <div class="card ${canWrite ? '' : 'hidden'}">
      <h2 data-form-title>Add vehicle</h2>
      <form class="inline-form" data-vehicle-form novalidate>
        <div><label for="registration_number">Registration number</label><input id="registration_number" name="registration_number" required></div>
        <div><label for="make">Make</label><input id="make" name="make" required></div>
        <div><label for="model">Model</label><input id="model" name="model" required></div>
        <div><label for="year">Year</label><input id="year" name="year" type="number" min="1950" max="2100" required></div>
        <div><label for="status">Status</label><select id="status" name="status" data-form-status></select></div>
        <div><label for="insurance_expiry">Insurance expiry</label><input id="insurance_expiry" name="insurance_expiry" type="date"></div>
        <div><label for="roadworthy_expiry">Roadworthy expiry</label><input id="roadworthy_expiry" name="roadworthy_expiry" type="date"></div>
        <button type="submit" data-save>Add vehicle</button>
        <button type="button" class="secondary hidden" data-cancel-edit>Cancel</button>
      </form>
    </div>

    <div class="card hidden" data-assign-card>
      <h2 data-assign-title>Assign driver</h2>
      <form class="inline-form" data-assign-form>
        <div><label for="driver_id">Driver</label><select id="driver_id" name="driver_id" data-driver-select></select></div>
        <button type="submit" data-assign-submit>Assign</button>
        <button type="button" class="secondary" data-assign-cancel>Cancel</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="search">Search</label><input id="search" name="search" placeholder="Registration, make or model"></div>
      <div><label for="status_filter">Status</label><select id="status_filter" name="status" data-filter-status></select></div>
      <button type="submit">Search</button>
    </form>

    <div class="loading hidden" data-loading>Loading vehicles...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;

  const messageBox = container.querySelector('[data-message]');
  const form = container.querySelector('[data-vehicle-form]');
  const formTitle = container.querySelector('[data-form-title]');
  const saveButton = container.querySelector('[data-save]');
  const cancelEditButton = container.querySelector('[data-cancel-edit]');
  const assignCard = container.querySelector('[data-assign-card]');
  const assignTitle = container.querySelector('[data-assign-title]');
  const assignForm = container.querySelector('[data-assign-form]');
  const assignSubmit = container.querySelector('[data-assign-submit]');
  const driverSelect = container.querySelector('[data-driver-select]');
  const filterForm = container.querySelector('[data-filter-form]');
  const loadingBox = container.querySelector('[data-loading]');
  const table = container.querySelector('[data-table]');
  const prevButton = container.querySelector('[data-prev]');
  const nextButton = container.querySelector('[data-next]');
  const pageInfo = container.querySelector('[data-page-info]');

  fillStatusSelect(container.querySelector('[data-form-status]'), false);
  fillStatusSelect(container.querySelector('[data-filter-status]'), true);

  const state = {
    search: '',
    status: '',
    skip: 0,
    total: 0,
    editingId: null,
    assigningId: null,
    drivers: [],
  };

  /* ---------- Helpers ---------- */

  function driverName(driverId) {
    if (driverId === null || driverId === undefined) return 'Unassigned';
    const driver = state.drivers.find((d) => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : `Driver #${driverId}`;
  }

  /** Run an action and show success or error. Returns true on success. */
  async function runAction(action, successText) {
    setMessage(messageBox, '');
    try {
      await action();
      if (successText) setMessage(messageBox, successText, 'success');
      return true;
    } catch (error) {
      setMessage(messageBox, error.message, 'error');
      return false;
    }
  }

  function resetForm() {
    form.reset();
    state.editingId = null;
    formTitle.textContent = 'Add vehicle';
    saveButton.textContent = 'Add vehicle';
    cancelEditButton.classList.add('hidden');
  }

  function startEdit(vehicle) {
    const fields = form.elements;
    state.editingId = vehicle.id;
    fields.registration_number.value = vehicle.registration_number;
    fields.make.value = vehicle.make;
    fields.model.value = vehicle.model;
    fields.year.value = vehicle.year;
    fields.status.value = vehicle.status;
    fields.insurance_expiry.value = toDateInput(vehicle.insurance_expiry);
    fields.roadworthy_expiry.value = toDateInput(vehicle.roadworthy_expiry);
    formTitle.textContent = 'Edit vehicle';
    saveButton.textContent = 'Save changes';
    cancelEditButton.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function openAssign(vehicle) {
    state.assigningId = vehicle.id;
    assignTitle.textContent = `Assign driver to ${vehicle.registration_number}`;
    driverSelect.replaceChildren();
    state.drivers.forEach((driver) => {
      const option = document.createElement('option');
      option.value = driver.id;
      option.textContent = `${driver.first_name} ${driver.last_name}`;
      driverSelect.append(option);
    });
    if (state.drivers.length === 0) {
      setMessage(messageBox, 'There are no drivers to assign yet.', 'error');
      return;
    }
    assignCard.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  function closeAssign() {
    state.assigningId = null;
    assignCard.classList.add('hidden');
  }

  /* ---------- Table ---------- */

  function renderTable(items) {
    table.replaceChildren();

    const columns = ['Registration', 'Vehicle', 'Year', 'Status', 'Insurance', 'Roadworthy', 'Driver'];
    if (canAssign) columns.push('Actions');

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach((name) => {
      const th = document.createElement('th');
      th.textContent = name;
      headRow.append(th);
    });
    head.append(headRow);

    const body = document.createElement('tbody');
    if (items.length === 0) {
      const tr = document.createElement('tr');
      const td = makeCell('No vehicles found.');
      td.colSpan = columns.length;
      td.className = 'empty';
      tr.append(td);
      body.append(tr);
    }

    items.forEach((vehicle) => {
      const tr = document.createElement('tr');
      tr.append(
        makeCell(vehicle.registration_number),
        makeCell(`${vehicle.make} ${vehicle.model}`),
        makeCell(vehicle.year),
        makeCell(formatStatus(vehicle.status)),
        expiryCell(vehicle.insurance_expiry),
        expiryCell(vehicle.roadworthy_expiry),
        makeCell(driverName(vehicle.current_driver_id)),
      );

      if (canAssign) {
        const actions = document.createElement('td');

        if (vehicle.current_driver_id === null || vehicle.current_driver_id === undefined) {
          actions.append(makeButton('Assign', 'secondary', () => openAssign(vehicle)));
        } else {
          actions.append(makeButton('Unassign', 'secondary', async () => {
            const ok = await runAction(() => unassignDriver(vehicle.id), 'Driver unassigned.');
            if (ok) await load();
          }));
        }

        if (canWrite) {
          actions.append(
            ' ',
            makeButton('Edit', 'secondary', () => startEdit(vehicle)),
            ' ',
            makeButton('Delete', 'danger', async () => {
              if (!window.confirm(`Delete vehicle ${vehicle.registration_number}?`)) return;
              const ok = await runAction(() => deleteVehicle(vehicle.id), 'Vehicle deleted.');
              if (ok) await load();
            }),
          );
        }
        tr.append(actions);
      }

      body.append(tr);
    });

    table.append(head, body);
  }

  function updatePager() {
    const from = state.total === 0 ? 0 : state.skip + 1;
    const to = Math.min(state.skip + PAGE_SIZE, state.total);
    pageInfo.textContent = `Showing ${from}-${to} of ${state.total}`;
    prevButton.disabled = state.skip === 0;
    nextButton.disabled = state.skip + PAGE_SIZE >= state.total;
  }

  async function load() {
    loadingBox.classList.remove('hidden');
    try {
      const data = await listVehicles({
        search: state.search,
        status: state.status,
        skip: state.skip,
        limit: PAGE_SIZE,
      });
      state.total = data.total;
      renderTable(data.items);
      updatePager();
    } catch (error) {
      setMessage(messageBox, error.message, 'error');
    } finally {
      loadingBox.classList.add('hidden');
    }
  }

  /* ---------- Events ---------- */

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setMessage(messageBox, '');
    state.search = filterForm.elements.search.value.trim();
    state.status = filterForm.elements.status.value;
    state.skip = 0;
    load();
  });

  prevButton.addEventListener('click', () => {
    state.skip = Math.max(0, state.skip - PAGE_SIZE);
    load();
  });

  nextButton.addEventListener('click', () => {
    state.skip += PAGE_SIZE;
    load();
  });

  cancelEditButton.addEventListener('click', resetForm);
  container.querySelector('[data-assign-cancel]').addEventListener('click', closeAssign);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(messageBox, '');

    const fields = form.elements;
    const registration = fields.registration_number.value.trim();
    const make = fields.make.value.trim();
    const model = fields.model.value.trim();
    const year = Number(fields.year.value);

    if (!registration || !make || !model || !year) {
      setMessage(messageBox, 'Please fill in registration number, make, model and year.', 'error');
      return;
    }

    const payload = {
      registration_number: registration,
      make,
      model,
      year,
      status: fields.status.value,
      insurance_expiry: toIsoOrNull(fields.insurance_expiry.value),
      roadworthy_expiry: toIsoOrNull(fields.roadworthy_expiry.value),
    };

    const editing = state.editingId !== null;

    // In flight
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    const ok = await runAction(
      () => (editing ? updateVehicle(state.editingId, payload) : createVehicle(payload)),
      editing ? 'Vehicle updated.' : 'Vehicle added.',
    );

    saveButton.disabled = false;
    if (ok) {
      resetForm(); // success: clear the form and re-fetch the list
      state.skip = 0;
      await load();
    } else {
      saveButton.textContent = editing ? 'Save changes' : 'Add vehicle'; // failure: form stays filled
    }
  });

  assignForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const driverId = Number(driverSelect.value);
    if (!driverId || state.assigningId === null) return;

    assignSubmit.disabled = true;
    assignSubmit.textContent = 'Assigning...';

    const ok = await runAction(
      () => assignDriver(state.assigningId, driverId),
      'Driver assigned.',
    );

    assignSubmit.disabled = false;
    assignSubmit.textContent = 'Assign';
    if (ok) {
      closeAssign();
      await load();
    }
  });

  /* ---------- Start ---------- */

  // Load drivers once so the table can show names instead of ids.
  try {
    const data = await listDrivers({ limit: 200 });
    state.drivers = data.items;
  } catch {
    // The table still works and shows "Driver #id".
  }

  await load();
}