import { listDrivers, createDriver } from '../api/drivers.api.js';
import { getRole } from '../auth/session.js';
import { formatDate, formatStatus, toIsoOrNull } from '../utils/formatters.js';

// Must match the DriverStatus values in backend/app/models/driver.py.
// Change this list if the backend uses different words.
const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];

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

/** Warn when a licence has expired or expires within 30 days. Display only. */
function expiryBadge(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const days = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (days < 0) return makeBadge('Expired', 'danger');
  if (days <= 30) return makeBadge('Expires soon', 'warning');
  return null;
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

export function render(container) {
  // Only admin and manager see licence details and the Add form.
  // The backend enforces this too; this only avoids showing controls that would fail.
  const role = getRole();
  const canManage = role === 'admin' || role === 'manager';

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <h1>Drivers</h1>
    <div class="message hidden" data-message></div>

    <div class="card ${canManage ? '' : 'hidden'}" data-add-card>
      <h2>Add driver</h2>
      <form class="inline-form" data-add-form novalidate>
        <div><label for="first_name">First name</label><input id="first_name" name="first_name" required></div>
        <div><label for="last_name">Last name</label><input id="last_name" name="last_name" required></div>
        <div><label for="license_number">Licence number</label><input id="license_number" name="license_number" required></div>
        <div><label for="license_expiry">Licence expiry</label><input id="license_expiry" name="license_expiry" type="date" required></div>
        <div><label for="phone">Phone</label><input id="phone" name="phone"></div>
        <div><label for="email">Email</label><input id="email" name="email" type="email"></div>
        <div><label for="status">Status</label><select id="status" name="status" data-add-status></select></div>
        <button type="submit" data-add-submit>Add driver</button>
      </form>
    </div>

    <form class="inline-form" data-filter-form>
      <div><label for="search">Search</label><input id="search" name="search" placeholder="Name or licence number"></div>
      <div><label for="status_filter">Status</label><select id="status_filter" name="status" data-filter-status></select></div>
      <button type="submit">Search</button>
    </form>

    <div class="loading hidden" data-loading>Loading drivers...</div>
    <div class="table-wrap"><table data-table></table></div>
    <div class="inline-form">
      <button type="button" class="secondary" data-prev>Previous</button>
      <span class="muted" data-page-info></span>
      <button type="button" class="secondary" data-next>Next</button>
    </div>
  `;

  const messageBox = container.querySelector('[data-message]');
  const addForm = container.querySelector('[data-add-form]');
  const addSubmit = container.querySelector('[data-add-submit]');
  const filterForm = container.querySelector('[data-filter-form]');
  const loadingBox = container.querySelector('[data-loading]');
  const table = container.querySelector('[data-table]');
  const prevButton = container.querySelector('[data-prev]');
  const nextButton = container.querySelector('[data-next]');
  const pageInfo = container.querySelector('[data-page-info]');

  fillStatusSelect(container.querySelector('[data-add-status]'), false);
  fillStatusSelect(container.querySelector('[data-filter-status]'), true);

  const state = { search: '', status: '', skip: 0, total: 0 };

  function renderTable(items) {
    table.replaceChildren();

    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    const columns = canManage
      ? ['Name', 'Licence number', 'Licence expiry', 'Phone', 'Email', 'Status']
      : ['Name', 'Status'];
    columns.forEach((name) => {
      const th = document.createElement('th');
      th.textContent = name;
      headRow.append(th);
    });
    head.append(headRow);

    const body = document.createElement('tbody');
    if (items.length === 0) {
      const tr = document.createElement('tr');
      const td = makeCell('No drivers found.');
      td.colSpan = columns.length;
      td.className = 'empty';
      tr.append(td);
      body.append(tr);
    }

    items.forEach((driver) => {
      const tr = document.createElement('tr');
      tr.append(makeCell(`${driver.first_name} ${driver.last_name}`));

      if (canManage) {
        tr.append(makeCell(driver.license_number));

        const expiryCell = makeCell(formatDate(driver.license_expiry));
        const badge = expiryBadge(driver.license_expiry);
        if (badge) {
          expiryCell.append(' ', badge);
        }
        tr.append(expiryCell);

        tr.append(makeCell(driver.phone || '-'));
        tr.append(makeCell(driver.email || '-'));
      }

      tr.append(makeCell(formatStatus(driver.status)));
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
      const data = await listDrivers({
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

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setMessage(messageBox, '');
    state.search = filterForm.search.value.trim();
    state.status = filterForm.status.value;
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

  addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(messageBox, '');

    const expiry = toIsoOrNull(addForm.license_expiry.value);
    if (!addForm.first_name.value.trim() || !addForm.last_name.value.trim()
        || !addForm.license_number.value.trim() || !expiry) {
      setMessage(messageBox, 'Please fill in name, licence number and licence expiry.', 'error');
      return;
    }

    const payload = {
      first_name: addForm.first_name.value.trim(),
      last_name: addForm.last_name.value.trim(),
      license_number: addForm.license_number.value.trim(),
      license_expiry: expiry,
      phone: addForm.phone.value.trim() || null,
      email: addForm.email.value.trim() || null,
      status: addForm.status.value,
    };

    // In flight
    addSubmit.disabled = true;
    addSubmit.textContent = 'Saving...';

    try {
      await createDriver(payload);
      addForm.reset(); // success: clear the form and re-fetch the list
      setMessage(messageBox, 'Driver added.', 'success');
      state.skip = 0;
      await load();
    } catch (error) {
      setMessage(messageBox, error.message, 'error'); // failure: form stays filled
    } finally {
      addSubmit.disabled = false;
      addSubmit.textContent = 'Add driver';
    }
  });

  load();
}