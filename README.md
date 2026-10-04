# Vehicle-Fleet-Management-System
### Software Engineering:CMPG224

```
vehicle fleet management system /
vfms/
├── backend/                          # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── vehicle.py            # Feature 1 (+ current assignment field, Feature 3)
│   │   │   ├── driver.py             # Feature 2
│   │   │   └── maintenance.py        # Feature 4
│   │   ├── schemas/
│   │   │   ├── vehicle.py
│   │   │   ├── driver.py
│   │   │   └── maintenance.py
│   │   ├── routers/
│   │   │   ├── vehicles.py           # Features 1, 3 (assign action), 5 (search/filter params)
│   │   │   ├── drivers.py            # Features 2, 5
│   │   │   └── maintenance.py        # Feature 4
│   │   ├── services/
│   │   │   ├── vehicle_service.py
│   │   │   ├── driver_service.py
│   │   │   └── maintenance_service.py
│   │   ├── repositories/
│   │   │   ├── vehicle_repository.py
│   │   │   ├── driver_repository.py
│   │   │   └── maintenance_repository.py
│   │   ├── middleware/
│   │   │   └── auth_guard.py
│   │   └── utils/
│   │       └── logger.py
│   ├── db/                           # PostgreSQL schema — DB Engineer's home base
│   │   ├── schema.sql                # authoritative DDL, generated from app/models/*.py                 
│   │   └── README.md                 # setup instructions + example queries
│   ├── migrations/                 
│   │                                 
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pytest.ini
│
├── frontend/                          # Vite + vanilla JS, ES Modules
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src/
│   │   ├── main.js
│   │   ├── api/
│   │   │   ├── vehicles.api.js
│   │   │   ├── drivers.api.js
│   │   │   └── maintenance.api.js
│   │   ├── auth/
│   │   │   ├── session.js
│   │   │   └── authGuard.js
│   │   ├── pages/
│   │   │   ├── login.page.js
│   │   │   ├── dashboard.page.js     # Feature 6 — expiring items listed here, no separate service
│   │   │   ├── vehicles.page.js      # Features 1, 3 (assign dropdown), 5 (search/filter)
│   │   │   ├── drivers.page.js       # Features 2, 5
│   │   │   └── maintenance.page.js   # Feature 4
│   │   ├── components/
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── utils/
│   │       └── formatters.js
│   ├── public/
│   │   ├── service-worker.js
│   │   └── icons/
│   └── vercel.json
│
├── auth/                              # Go identity/security service — unchanged
│   ├── cmd/
│   ├── internal/
│   │   ├── config/
│   │   ├── password/
│   │   ├── token/
│   │   ├── rbac/
│   │   ├── store/
│   │   ├── ratelimit/
│   │   └── handlers/
│   ├── Dockerfile
│   └── README.md
│
├── docs/
│   ├── SRS.md
│   ├── SDD.md
│   ├── identity-service-api.md
│   ├── test-plan.md
│   └── meetings/
│
├── .github/workflows/
│   ├── backend-ci.yml
│   ├── frontend-ci.yml
│   └── auth-ci.yml
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── CONTRIBUTING.md


## Running with Docker (development)

A docker-compose setup is provided to run a local Postgres instance plus the auth, backend and frontend services. It starts with an empty Postgres database and applies the authoritative schema in `backend/db/schema.sql` at first initialization.

Quick start:

1. Build and start everything:

   docker compose up --build

2. Services (default ports):
   - Auth service: http://localhost:8081
   - Backend API: http://localhost:8000 (API prefix /api/v1)
   - Frontend dev server: http://localhost:5173

3. The Postgres service runs with the following local dev credentials (set in docker-compose.yml):

   - user: vfms_user
   - password: vfms_pass
   - database: vfms

4. To create application users (manager/staff/admin) use the auth service's admin endpoints or the auth service UI/README (auth service runs at port 8081 in the compose setup).

Notes:
- The local SQLite database used for quick single-machine demos has been removed from the repository to avoid accidental seeded data. The docker-compose Postgres instance starts empty and applies the schema from `backend/db/schema.sql`.
- Use your own production Postgres by setting DATABASE_URL in the backend service environment instead of the default in docker-compose.yml.
