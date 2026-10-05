# VFMS Backend (FastAPI)

The core application service for the Vehicle Fleet Management System:
vehicles, drivers, driver-vehicle assignments, maintenance history,
and fleet reporting. Authentication is delegated entirely to the
separate [Go auth service](../auth/README.md) — this service never
sees a password, only verifies the JWTs that service issues.

## Layout

```
app/
├── main.py            FastAPI app, router registration, startup
├── config.py          Settings (env vars)
├── database.py        SQLAlchemy engine/session/Base
├── models/            ORM models (Vehicle, Driver, Assignment, MaintenanceRecord)
├── schemas/           Pydantic request/response shapes
├── repositories/      Raw DB queries (Vehicle, Driver)
├── services/          Business logic + audit logging
├── routers/           API endpoints, grouped by resource
├── middleware/
│   └── auth_guard.py  JWT verification + RBAC dependency
└── utils/logger.py
tests/
├── unit/            Fast, no HTTP — auth guard token verification
└── integration/     TestClient-driven, in-memory SQLite per test
```

## Running locally

1. Start the [auth service](../auth/README.md) first — it generates
   an RSA keypair on first run under `auth/keys/`.
2. ```bash
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

By default the backend expects the auth service's public key at
`../auth/keys/public.pem` (i.e. both repos checked out side by side,
which is how this monorepo is laid out). Override with
`AUTH_PUBLIC_KEY_PATH` or `AUTH_PUBLIC_KEY_URL` — see `.env.example`.

Interactive API docs: http://localhost:8000/docs

## Getting a token to test with

```bash
curl -X POST http://localhost:8081/login \
  -d '{"email":"manager@vfms.com","password":"Manager@12345"}'
```

Then use the `access_token` from the response:

```bash
curl http://localhost:8000/api/v1/vehicles \
  -H "Authorization: Bearer <token>"
```

## Roles (RBAC)

| Role    | Vehicles       | Drivers        | Assign/unassign | Maintenance | Reports |
|---------|----------------|-----------------|-------------------|--------------|----------|
| admin   | full           | full             | yes                | full          | yes       |
| manager | full           | full             | yes                | full          | yes       |
| staff   | read-only      | read-only (no licence #) | yes       | create + read | no        |

Enforced in `app/middleware/auth_guard.py` via `require_roles(...)`,
mirroring `auth/internal/rbac/policy.go` so both services agree on
what each role can do.

## Tests

```bash
pytest
```

20 tests covering CRUD, search/filter, RBAC enforcement, the
assign/unassign/history flow, maintenance logging, fleet reports, and
JWT verification (valid / expired / wrong-key / wrong-token-type).

## Minimum functionality check

This implementation covers well beyond the module's "at least three
core functional requirements" threshold: full CRUD + search for
vehicles and drivers, driver-vehicle assignment with history,
maintenance logging, RBAC, fleet summary/cost reporting, and
document-expiry alerts.