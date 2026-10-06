# VFMS Frontend

Vite + vanilla JavaScript frontend for the Vehicle Fleet Management System
(CMPG224, Team 10).

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```
Dev server proxies `/api` to the FastAPI backend (localhost:8000) and
`/auth` to the Go auth service (localhost:8080). Change targets in
`vite.config.js` once real URLs are known.

## Structure
```
index.html             Login screen
dashboard.html          Dashboard (stats + expiry warnings)
src/
  api/client.js          apiFetch() — attaches JWT, retries once after silent refresh on 401
  api/vehicles.api.js      Vehicle endpoints
  api/drivers.api.js       Driver endpoints
  auth/session.js          Token storage + login/refresh/logout
  auth/authGuard.js         requireAuth() route guard
  pages/login.page.js       Login form logic
  pages/dashboard.page.js    Dashboard logic
  utils/formatters.js       Date/expiry helpers
  styles/main.css           All design tokens + page styles
```

## Dashboard preview without a backend
Visit `/dashboard.html?demo` while running `npm run dev` to see the
dashboard with sample data, bypassing the login requirement. This only
works in dev mode — production builds strip it out.

## Known simplification
Tokens live in sessionStorage because this is a multi-page app (separate
HTML documents), not an SPA — in-memory tokens would be lost on navigation.

## What's built so far

- **Login** (`index.html`) — auth against the Go service, token storage
- **Dashboard** (`dashboard.html`) — vehicle/driver counts, expiry warnings
- **Vehicles** (`vehicles.html`) — list, search/filter by status, add, edit,
  delete (with confirm), client-side duplicate-registration check
- **Drivers** (`drivers.html`) — same pattern, plus role-based hiding: when
  the signed-in user's role is `staff`, the licence-number column/field and
  the delete button are hidden. The server should still be the real
  enforcement (`DriverPublicOut` vs `DriverOut`) — this is a client-side
  convenience on top of that, not a substitute for it.
- **Maintenance** (`maintenance.html`) — log a service record, filter history
  by vehicle, delete

Every list page falls back to small sample datasets (shown with a visible
"can't reach the backend" notice) when the API calls fail, so each page is
demoable before the backend endpoints are live. Add `?demo` to any page's
URL while running `npm run dev` to force this, e.g.
`localhost:5173/vehicles.html?demo`.

Shared logic across the three list pages lives in `src/utils/ui.js`
(toast messages, delete confirmation, button loading state) — implements the
usability rules in SDD section 7.1.

## Still to build

- **Assignments** page (assign a driver to a vehicle, view assignment
  history) — SDD section 2.4 says this happens via `PUT /drivers/{id}`
  (reassigning a driver's vehicle), so this is likely a dedicated page or a
  field added to the driver edit form, rather than a new API module
- **Reports** page (fleet summary, FR33)
- Real automated UI tests (the SDD's traceability matrix lists specific
  ones, e.g. "UI test form submit", "UI test badge states")
- Wiring up real backend data once FastAPI endpoints exist — check that
  field names here (`registration_number`, `license_number`, etc.) match
  what the backend actually returns; adjust the `.api.js` files if not

## Assignments & Reports (added after the first round)

- **Assignments** (`assignments.html`) — shows current driver↔vehicle
  assignments, lets you assign an unassigned driver to an unassigned-by-them
  vehicle, and unassign. **Important caveat:** the SDD has no dedicated
  assignment endpoint — this assumes `PUT /drivers/{id}` accepts a
  `vehicle_id` field (null to unassign). Confirm the real field name with
  the backend team; it's isolated to two `updateDriver(...)` calls in
  `assignments.page.js` if it needs changing. This page also only shows
  the *current* state, not history — true history needs a backend endpoint
  that doesn't exist yet (the SDD's `assignments` table with
  assignedAt/unassignedAt isn't exposed by any listed route).
- **Reports** (`reports.html`) — tries `GET /reports/summary` (FR33) first;
  if that 404s or isn't built yet, it falls back to computing the same
  totals client-side from the vehicles/drivers/maintenance list endpoints.
  Shows vehicle counts by status and maintenance cost per vehicle.

Both support the same `?demo` trick as the other pages.
