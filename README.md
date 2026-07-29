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