# VFMS Frontend

Vite + vanilla JavaScript frontend for the Vehicle Fleet Management System
(CMPG224, Team 10), matching the stack and screens in the SDD (section 4.2, 7).

## Setup

```bash
npm install
cp .env.example .env   # defaults are fine if you use the dev proxy below
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies:

- `/api/*` → your FastAPI backend at `http://localhost:8000`
- `/auth/*` → the Go auth service at `http://localhost:8080`

Change the proxy targets in `vite.config.js` once you know the real ports/URLs,
or point `VITE_API_BASE_URL` / `VITE_AUTH_BASE_URL` in `.env` straight at
deployed URLs for production builds.

## Structure

```
index.html            Login screen (site root)
dashboard.html         Placeholder post-login screen (route guard demo)
src/
  api/
    client.js          apiFetch() wrapper for the FastAPI backend — attaches
                        the JWT, retries once after a silent refresh on 401
  auth/
    session.js          Talks to the Go auth service; owns token storage
    authGuard.js         requireAuth() — call at the top of any protected
                        page's <name>.page.js to redirect signed-out users
  pages/
    login.page.js        Login form logic (validation, loading state, errors)
    dashboard.page.js     Dashboard placeholder logic
  styles/
    main.css              All shared design tokens + page styles
```

Named to match the team's planned `frontend/` layout in the repo README
(`*.page.js`, `auth/session.js` + `auth/authGuard.js`, one `main.css`). Add
new screens as `src/pages/<name>.page.js` + a matching `<name>.html`, and
list the new HTML file under `build.rollupOptions.input` in `vite.config.js`.

Note: the team's README structure implies a single-page app (one `main.js`
entry, no separate `.html` per screen). This project is still multi-page
(separate `index.html` / `dashboard.html`) for simplicity — worth raising
with your team so everyone builds screens the same way once more people
start adding pages.

## Auth flow (how it maps to the SDD)

1. `login.page.js` posts `{ username, password }` to `POST /auth/login`.
2. `session.js` stores the returned `access_token` / `refresh_token` in
   `sessionStorage` (cleared when the tab closes) and decodes the JWT payload
   to read `role` and `exp` — no signature verification happens client-side,
   the backend verifies it against the Go service's public key per SDD 2.6.
3. Every other API call should go through `apiFetch()` in `client.js`, which
   attaches `Authorization: Bearer <token>` automatically. If a call comes
   back `401` (expired token), it silently calls `/auth/refresh` once and
   retries; if that also fails, it clears the session and sends the user
   back to `index.html`.
4. `dashboard.html` shows the route-guard pattern to copy for other pages:
   check `isAuthenticated()` on load, redirect to `/index.html` if false.

### Known simplification

Tokens live in `sessionStorage` rather than the more secure
in-memory-access-token + httpOnly-cookie-refresh-token split, because this is
a multi-page app (separate HTML documents) rather than an SPA, so in-memory
state doesn't survive navigation. This is a reasonable tradeoff for the
project's scope — flag it in your security section (NFR03/NFR04) as a known
limitation rather than pretending it isn't there.

## Next screens to build (per SDD 7.2–7.3)

- Vehicles list / detail / add-vehicle form
- Drivers list / detail (remember: staff role should never receive
  `license_number` — that's enforced server-side via `DriverPublicOut`, but
  the UI should also not assume it will always be present in the response)
- Assignments flow
- Maintenance log
- Dashboard: vehicle/driver counts + expiry warning cards
