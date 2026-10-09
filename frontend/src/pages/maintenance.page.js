import {
  listMaintenance,
  logMaintenance,
  deleteMaintenance,
} from '../api/maintenance.api.js';
import { listVehicles } from '../api/vehicles.api.js';
import { getRole } from '../auth/session.js';
import { formatDate, formatCurrency, toIsoOrNull } from '../utils/formatters.js';

const PAGE_SIZE = 20;

function makeCell(text) {
  const td = document.createElement('td');
  td.textContent = text === null || text === undefined ? '' : text;
  return td;
}

function makeButton(text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
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

export async function render(container) {
  // Keep in line with backend/app/routers/maintenance.py.
  // Staff can log and read service records; only managers and admins can delete them.
  const role = getRole();
  const canDelete = role === 'admin' || role === 'manager';

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <h1>Maintenance</h1>
    <div class="message hidden" data-message></div>

    <div class="card">
      <h2>Log service</h2>
      <form class="inline-form" data-log-form novalidate>
        <div><label for="vehicle_id">Vehicle</label><select id="vehicle_id" name="vehicle_id" data-log-vehicle></select></div>
        <div><label for="service_date">Service date</label><input id="service_date" name="service_date" type="date" required></div>
        <div><label for="description">Description</label><input id="description" name="description" required></div>
        <div><label for="cost">Cost (R)</label><input id="cost" name="cost" type="number" min="0" step="0.01" required></div>
        <div><label for="service_provider">Service provider</label><input id="service_provider" name="service_provider"></div>
        <button type="submit" data-log-submit>Log service</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="filter_vehicle">Vehicle</label><select id="filter_vehicle" name="vehicle_id" data-filter-vehicle></select></div>
      <button type="submit">Filter</button>
    </form>

    <div class="loading hidden" data-loading>Loading records...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;

  const messageBox = container.querySelector('[data-message]');
  const logForm = container.querySelector('[data-log-form]');
  const logSubmit = container.querySelector('[data-log-submit]');
  const logVehicleSelect = container.querySelector('[data-log-vehicle]');
  const filterForm = container.querySelector('[data-filter-form]');
  const filterVehicleSelect = container.querySelector('[data-filter-vehicle]');
  const loadingBox = container.querySelector('[data-loading]');
  const table = container.querySelector('[data-table]');
  const prevButton = container.querySelector('[data-prev]');
  const nextButton = container.querySelector('[data-next]');
  const pageInfo = container.querySelector('[data-page-info]');

  const state = { vehicleId: '', skip: 0, total: 0, vehicles: [] };

  /* ---------- Helpers ---------- */

  function vehicleLabel(vehicle) {
    return `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}`;
  }

  function vehicleNameById(vehicleId) {
    const vehicle = state.vehicles.find((v) => v.id === vehicleId);
    return vehicle ? vehicleLabel(vehicle) : `Vehicle #${vehicleId}`;
  }

  function fillVehicleSelects() {
    logVehicleSelect.replaceChildren();
    filterVehicleSelect.replaceChildren();

    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'All vehicles';
    filterVehicleSelect.append(all);

    state.vehicles.forEach((vehicle) => {
      const forLog = document.createElement('option');
      forLog.value = vehicle.id;
      forLog.textContent = vehicleLabel(vehicle);
      logVehicleSelect.append(forLog);

      const forFilter = forLog.cloneNode(true);
      filterVehicleSelect.append(forFilter);
    });
  }

  /* ---------- Table ---------- */

  function renderTable(items) {
    table.replaceChildren();

    const columns = ['Date', 'Vehicle', 'Description', 'Cost', 'Provider', 'Logged by'];
    if (canDelete) columns.push('Actions');

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
      const td = makeCell('No service records found.');
      td.colSpan = columns.length;
      td.className = 'empty';
      tr.append(td);
      body.append(tr);
    }

    items.forEach((record) => {
      const tr = document.createElement('tr');
      tr.append(
        makeCell(formatDate(record.service_date)),
        makeCell(vehicleNameById(record.vehicle_id)),
        makeCell(record.description),
        makeCell(formatCurrency(record.cost)),
        makeCell(record.service_provider || '-'),
        makeCell(record.logged_by),
      );

      if (canDelete) {
        const actions = document.createElement('td');
        actions.append(makeButton('Delete', 'danger', async () => {
          if (!window.confirm('Delete this service record?')) return;
          setMessage(messageBox, '');
          try {
            await deleteMaintenance(record.id);
            setMessage(messageBox, 'Record deleted.', 'success');
            await load();
          } catch (error) {
            setMessage(messageBox, error.message, 'error');
          }
        }));
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
      const data = await listMaintenance({
        vehicleId: state.vehicleId,
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
    state.vehicleId = filterForm.elements.vehicle_id.value;
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

  logForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(messageBox, '');

    const fields = logForm.elements;
    const vehicleId = Number(fields.vehicle_id.value);
    const serviceDate = toIsoOrNull(fields.service_date.value);
    const description = fields.description.value.trim();
    const cost = Number(fields.cost.value);

    if (!vehicleId || !serviceDate || !description || fields.cost.value === '' || cost < 0) {
      setMessage(messageBox, 'Please choose a vehicle and fill in date, description and cost.', 'error');
      return;
    }

    const payload = {
      vehicle_id: vehicleId,
      service_date: serviceDate,
      description,
      cost,
      service_provider: fields.service_provider.value.trim() || null,
    };

    // In flight
    logSubmit.disabled = true;
    logSubmit.textContent = 'Saving...';

    try {
      await logMaintenance(payload);
      logForm.reset(); // success: clear the form and re-fetch the list
      setMessage(messageBox, 'Service logged.', 'success');
      state.skip = 0;
      await load();
    } catch (error) {
      setMessage(messageBox, error.message, 'error'); // failure: form stays filled
    } finally {
      logSubmit.disabled = false;
      logSubmit.textContent = 'Log service';
    }
  });

  /* ---------- Start ---------- */

  // Load vehicles once for the dropdowns and to show registration numbers.
  try {
    const data = await listVehicles({ limit: 200 });
    state.vehicles = data.items;
  } catch (error) {
    setMessage(messageBox, `Could not load vehicles: ${error.message}`, 'error');
  }
  fillVehicleSelects();

  await load();
}
