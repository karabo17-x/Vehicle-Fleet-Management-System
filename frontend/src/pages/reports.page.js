import { requireAuth } from '../auth/authGuard.js';
import { logout } from '../auth/session.js';
import { getReportsSummary } from '../api/reports.api.js';
import { listVehicles } from '../api/vehicles.api.js';
import { listDrivers } from '../api/drivers.api.js';
import { listMaintenance } from '../api/maintenance.api.js';
import { escapeHtml } from '../utils/ui.js';

const SAMPLE = {
  vehicles: [
    { id: 1, registration_number: 'CA 123-456', status: 'Active' },
    { id: 2, registration_number: 'GP 987-654', status: 'Active' },
    { id: 3, registration_number: 'NW 555-111', status: 'In Maintenance' },
  ],
  drivers: [{ id: 1 }, { id: 2 }],
  maintenance: [
    { vehicle_id: 1, cost: 1450 },
    { vehicle_id: 1, cost: 555 },
    { vehicle_id: 3, cost: 3200 },
  ],
};

const demoMode = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');
const noticeEl = document.getElementById('notice');

/** Builds the same shape as a real GET /reports/summary would likely
 * return, computed client-side from the list endpoints. Used whenever the
 * dedicated summary endpoint isn't available (404, not built yet, etc). */
function computeSummary({ vehicles, drivers, maintenance }) {
  const byStatus = {};
  for (const v of vehicles) byStatus[v.status] = (byStatus[v.status] || 0) + 1;

  const byVehicle = {};
  for (const m of maintenance) {
    const key = m.vehicle_id;
    byVehicle[key] ??= { count: 0, cost: 0 };
    byVehicle[key].count += 1;
    byVehicle[key].cost += Number(m.cost) || 0;
  }

  return {
    totalVehicles: vehicles.length,
    totalDrivers: drivers.length,
    totalRecords: maintenance.length,
    totalCost: maintenance.reduce((sum, m) => sum + (Number(m.cost) || 0), 0),
    byStatus,
    byVehicle: Object.entries(byVehicle).map(([vehicleId, v]) => ({
      vehicle: vehicles.find((x) => String(x.id) === vehicleId)?.registration_number ?? `#${vehicleId}`,
      ...v,
    })),
  };
}

function render(summary) {
  document.getElementById('stat-vehicles').textContent = summary.totalVehicles;
  document.getElementById('stat-drivers').textContent = summary.totalDrivers;
  document.getElementById('stat-records').textContent = summary.totalRecords;
  document.getElementById('stat-cost').textContent = `R${summary.totalCost.toFixed(2)}`;

  const statusRows = document.getElementById('status-rows');
  const entries = Object.entries(summary.byStatus);
  statusRows.innerHTML = entries.length
    ? entries.map(([status, count]) => `<tr><td>${escapeHtml(status)}</td><td>${count}</td></tr>`).join('')
    : '<tr class="empty-row"><td colspan="2">No vehicles yet.</td></tr>';

  const costRows = document.getElementById('cost-rows');
  costRows.innerHTML = summary.byVehicle.length
    ? summary.byVehicle
        .map((v) => `<tr><td>${escapeHtml(v.vehicle)}</td><td>${v.count}</td><td>R${v.cost.toFixed(2)}</td></tr>`)
        .join('')
    : '<tr class="empty-row"><td colspan="3">No maintenance records yet.</td></tr>';
}

async function loadData() {
  if (demoMode) {
    noticeEl.hidden = false;
    noticeEl.textContent = "Can't reach the backend yet, so this is sample data.";
    render(computeSummary(SAMPLE));
    return;
  }

  try {
    // Try the real endpoint first (SDD FR33); if it's not built yet this
    // throws and we fall through to computing it from the list endpoints.
    const summary = await getReportsSummary();
    noticeEl.hidden = true;
    render(summary);
  } catch {
    try {
      const [vehicles, drivers, maintenance] = await Promise.all([listVehicles(), listDrivers(), listMaintenance()]);
      noticeEl.hidden = false;
      noticeEl.textContent = 'GET /reports/summary not available yet — computed from vehicles/drivers/maintenance instead.';
      render(computeSummary({ vehicles, drivers, maintenance }));
    } catch {
      noticeEl.hidden = false;
      noticeEl.textContent = "Can't reach the backend yet, so this is sample data.";
      render(computeSummary(SAMPLE));
    }
  }
}

if (requireAuth()) {
  document.getElementById('logout-btn').addEventListener('click', logout);
  loadData();
}
