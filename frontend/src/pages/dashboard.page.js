import { listVehicles } from '../api/vehicles.api.js';
import { listDrivers } from '../api/drivers.api.js';
import { listMaintenance } from '../api/maintenance.api.js';
import { getRole } from '../auth/session.js';
import { formatDate, formatCurrency } from '../utils/formatters.js';

const WARN_DAYS = 30; // warn when something expires within this many days
const LIMIT = 200; // enough rows for vehicle and driver summary counts
const RECENT_SERVICE_LIMIT = 5;

function daysUntil(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((date.getTime() - Date.now()) / 86400000);
}

function makeBadge(text, type) {
  const span = document.createElement('span');
  span.className = `badge ${type}`;
  span.textContent = text;
  return span;
}

/** Build a table. Each cell is a string or a DOM node. */
function buildTable(columns, rows, emptyText) {
  const table = document.createElement('table');

  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  columns.forEach((name) => {
    const th = document.createElement('th');
    th.textContent = name;
    headRow.append(th);
  });
  head.append(headRow);

  const body = document.createElement('tbody');
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.className = 'empty';
    td.textContent = emptyText;
    tr.append(td);
    body.append(tr);
  }
  rows.forEach((cells) => {
    const tr = document.createElement('tr');
    cells.forEach((cell) => {
      const td = document.createElement('td');
      if (cell instanceof Node) td.append(cell);
      else td.textContent = cell === null || cell === undefined ? '' : cell;
      tr.append(td);
    });
    body.append(tr);
  });

  table.append(head, body);
  return table;
}

function makeStat(label, value) {
  const card = document.createElement('div');
  card.className = 'card';
  const small = document.createElement('p');
  small.className = 'lf-label';
  small.textContent = label;
  const number = document.createElement('div');
  number.className = 'stat';
  number.textContent = value;
  card.append(small, number);
  return card;
}

export async function render(container) {
  // Only admin and manager receive licence dates from the backend.
  const role = getRole();
  const canSeeLicences = role === 'admin' || role === 'manager';

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <p class="lf-label">FLEET OPERATIONS</p>
    <h1>Fleet overview</h1>
    <div class="message hidden" data-message></div>
    <div class="loading" data-loading>Loading overview...</div>

    <div class="card-grid" data-stats></div>

    <h2>Expiry warnings</h2>
    <div class="table-wrap" data-warnings></div>

    <h2>Recent service</h2>
    <div class="table-wrap" data-recent></div>
  `;

  const messageBox = container.querySelector('[data-message]');
  const loadingBox = container.querySelector('[data-loading]');
  const statsBox = container.querySelector('[data-stats]');
  const warningsBox = container.querySelector('[data-warnings]');
  const recentBox = container.querySelector('[data-recent]');

  // One failed request must not break the whole page.
  const [vehicleResult, driverResult, serviceResult] = await Promise.allSettled([
    listVehicles({ limit: LIMIT }),
    listDrivers({ limit: LIMIT }),
    listMaintenance({ limit: RECENT_SERVICE_LIMIT }),
  ]);
  loadingBox.classList.add('hidden');

  const failed = [
    ['vehicles', vehicleResult],
    ['drivers', driverResult],
    ['service records', serviceResult],
  ].filter(([, result]) => result.status === 'rejected');

  if (failed.length > 0) {
    const [name, result] = failed[0];
    messageBox.className = 'message error';
    messageBox.textContent = `Could not load ${name}: ${result.reason.message}`;
  }

  const vehicles = vehicleResult.status === 'fulfilled' ? vehicleResult.value.items : [];
  const drivers = driverResult.status === 'fulfilled' ? driverResult.value.items : [];
  const services = serviceResult.status === 'fulfilled' ? serviceResult.value.items : [];

  /* ---------- Summary cards ---------- */

  const dash = '-';
  const count = (list, test) => list.filter(test).length;

  statsBox.append(
    makeStat('VEHICLES', vehicleResult.status === 'fulfilled' ? vehicleResult.value.total : dash),
    makeStat('ACTIVE VEHICLES', vehicleResult.status === 'fulfilled' ? count(vehicles, (v) => v.status === 'active') : dash),
    makeStat('IN MAINTENANCE', vehicleResult.status === 'fulfilled' ? count(vehicles, (v) => v.status === 'in_maintenance') : dash),
    makeStat('UNASSIGNED VEHICLES', vehicleResult.status === 'fulfilled' ? count(vehicles, (v) => !v.current_driver_id) : dash),
    makeStat('DRIVERS', driverResult.status === 'fulfilled' ? driverResult.value.total : dash),
    makeStat('SERVICE RECORDS', serviceResult.status === 'fulfilled' ? serviceResult.value.total : dash),
  );

  /* ---------- Expiry warnings ---------- */

  const warnings = [];
  function addWarning(type, name, value) {
    const days = daysUntil(value);
    if (days === null || days > WARN_DAYS) return;
    warnings.push({ type, name, value, days });
  }

  vehicles.forEach((vehicle) => {
    addWarning('Insurance', vehicle.registration_number, vehicle.insurance_expiry);
    addWarning('Roadworthy', vehicle.registration_number, vehicle.roadworthy_expiry);
  });
  if (canSeeLicences) {
    drivers.forEach((driver) => {
      addWarning('Driver licence', `${driver.first_name} ${driver.last_name}`, driver.license_expiry);
    });
  }
  warnings.sort((a, b) => a.days - b.days);

  const warningRows = warnings.map((w) => [
    w.type,
    w.name,
    formatDate(w.value),
    w.days < 0
      ? makeBadge('Expired', 'danger')
      : makeBadge(w.days === 0 ? 'Expires today' : `In ${w.days} days`, 'warning'),
  ]);
  warningsBox.append(
    buildTable(['Type', 'Item', 'Expiry date', 'Status'], warningRows,
      `Nothing expires in the next ${WARN_DAYS} days.`),
  );

  /* ---------- Recent service ---------- */

  const vehicleById = new Map(vehicles.map((v) => [v.id, v.registration_number]));
  // The maintenance endpoint returns rows newest first; fetch just those
  // rows while retaining its total for the summary card above.
  const recent = services;

  const recentRows = recent.map((record) => [
    formatDate(record.service_date),
    vehicleById.get(record.vehicle_id) || `Vehicle #${record.vehicle_id}`,
    record.description,
    formatCurrency(record.cost),
  ]);
  recentBox.append(
    buildTable(['Date', 'Vehicle', 'Description', 'Cost'], recentRows, 'No service records yet.'),
  );
}
