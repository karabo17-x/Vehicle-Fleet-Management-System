# VFMS Backend

The backend is a FastAPI service for fleet data and business operations. It owns vehicle, driver, assignment, maintenance, and report APIs. The separate Go auth service issues tokens; the backend verifies access tokens locally with the auth service's RSA public key.

## Run locally

From the repository root, start PostgreSQL and the auth service with Docker Compose:

```bash
docker compose up --build db auth
```

Then in another terminal, start the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The compose database is published on `localhost:5433`. To use it, set `DATABASE_URL=postgresql://vfms_user:vfms_pass@localhost:5433/vfms` in `backend/.env`. Alternatively, use SQLite for local development with `DATABASE_URL=sqlite:///./vfms.db`.

To run all services together instead, run `docker compose up --build` from the repository root. The backend is then available at `http://localhost:8001`; auth is at `http://localhost:8081`. The frontend Vite proxy defaults to the compose backend port. Set `VFMS_API_URL=http://localhost:8000` when running the backend directly on port 8000.

## API and authentication

- Interactive API documentation: `http://localhost:8000/docs` (direct backend) or `http://localhost:8001/docs` (Compose).
- Liveness: `GET /health` (no token required).
- API prefix: `/api/v1`.
- Protected endpoints expect `Authorization: Bearer <access-token>`.
- The backend checks the token signature, issuer (`vfms-auth` by default), expiry, subject, and access-token type. It loads the public key from `AUTH_PUBLIC_KEY_PATH`, or from `AUTH_PUBLIC_KEY_URL` if configured, and caches the key for the process lifetime.
- `GET /api/v1/me` returns the authenticated user's ID, email, and role.

Log in through the auth service to obtain an access token. See [Auth Service](auth.md) for demo credentials and token endpoints. Requests from the Vite app use relative `/api` paths and are proxied to the backend.

## Endpoints

All paths below are relative to `/api/v1`.

| Area | Routes | Purpose |
| --- | --- | --- |
| Vehicles | `GET /vehicles`, `GET /vehicles/{id}`, `POST /vehicles`, `PATCH /vehicles/{id}`, `DELETE /vehicles/{id}` | Vehicle CRUD, search, status filtering, and pagination |
| Assignments | `POST /vehicles/{id}/assign`, `POST /vehicles/{id}/unassign`, `GET /assignments/vehicle/{id}` | Assign or unassign a driver and view assignment history |
| Drivers | `GET /drivers`, `GET /drivers/{id}`, `POST /drivers`, `PATCH /drivers/{id}`, `DELETE /drivers/{id}` | Driver management, search, status filtering, and pagination |
| Maintenance | `GET /maintenance`, `GET /maintenance/{id}`, `POST /maintenance`, `DELETE /maintenance/{id}` | Service records, filterable by vehicle and paginated |
| Reports | `GET /reports/summary`, `GET /reports/maintenance-cost-by-vehicle`, `GET /reports/expiring-documents` | Fleet totals, maintenance costs, and document expiry alerts |

List endpoints return an `items` array with `total`, `skip`, and `limit`. They accept `skip` and `limit`; drivers and vehicles also accept `search` and `status`. Maintenance accepts `vehicle_id`. Report expiry alerts accept an optional `days` query parameter (1–365; default is `EXPIRY_WARNING_DAYS`, normally 30).

## Roles

| Operation | Admin | Manager | Staff |
| --- | --- | --- | --- |
| Read vehicles and drivers | Yes | Yes | Yes; driver licence fields are omitted from driver list/get responses |
| Create, update, delete vehicles or drivers | Yes | Yes | No |
| Assign or unassign drivers; view assignment history | Yes | Yes | Yes |
| Read maintenance records | Yes | Yes | Yes |
| Log maintenance | Yes | Yes | Yes |
| Delete maintenance records | Yes | Yes | No |
| Read reports | Yes | Yes | Yes (as currently enforced by the FastAPI routes) |

The backend enforces these checks independently of frontend visibility. Admin is allowed through every `require_roles` check.

## Data and configuration

The authoritative PostgreSQL DDL is [`backend/db/schema.sql`](../backend/db/schema.sql). Compose applies it only when PostgreSQL initializes an empty data directory. The backend also calls SQLAlchemy `create_all` on startup to create missing tables; this does not migrate existing tables or update existing schema definitions. Back up data and use an explicit migration when changing an existing database schema.

Important settings (environment variables override defaults):

| Setting | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL at `localhost:5433` | SQLAlchemy database connection |
| `AUTH_PUBLIC_KEY_PATH` | `../auth/internal/keys/public.pem` | Local auth public key path |
| `AUTH_PUBLIC_KEY_URL` | unset | Optional HTTP URL for auth public key; takes precedence over file path |
| `JWT_ALGORITHM` | `RS256` | Token signature algorithm |
| `JWT_ISSUER` | `vfms-auth` | Required JWT issuer |
| `API_PREFIX` | `/api/v1` | API route prefix |
| `CORS_ALLOW_ORIGINS` | `http://localhost:5173` | Allowed browser origins (JSON list) |
| `EXPIRY_WARNING_DAYS` | `30` | Default warning window for expiring documents |
| `BACKFILL_MISSING_DRIVER_DATA` | `false` | If true, startup fills legacy drivers missing licence fields with placeholders |

Compose supplies container-specific database and key paths and shares the auth public key through the `auth-keys` volume. The PostgreSQL `db-data` volume preserves fleet data across normal restarts. Removing that volume deletes the database.

## Adding a new API feature

Define or update a Pydantic schema under `app/schemas`, ORM mapping under `app/models`, data access in a repository where appropriate, business rules in a service, and HTTP routes under `app/routers`. Register new routers in `app/main.py`. Keep database changes in sync with `backend/db/schema.sql` and use migrations for already initialized deployments. Apply authentication and role dependencies to every protected route.

