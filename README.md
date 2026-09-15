# Vehicle-Fleet-Management-System
### Software Engineering:CMPG224

```
<<<<<<< HEAD
vehicle fleet management system/

├── .github/
│   └── workflows/
│       ├── ci.yml                      # lint + typecheck + test + dependency scan, every PR
│       ├── build.yml                   # docker build on merge to main
│       └── security-scan.yml           # scheduled dependency/container scan
│
├── .gitignore
├── .env.example
├── docker-compose.yml                  # api + client + db + (optional) test-db
├── .nvmrc                              # pins Node LTS version for the whole team
├── package.json                        # npm/yarn/pnpm workspaces root
├── tsconfig.base.json                  # shared TS config, extended by each package
├── README.md
│
├── backend/                            # Express API, TypeScript
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── env.ts                  # validates required env vars on boot
│   │   ├── controllers/
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── driver.controller.ts
│   │   │   ├── assignment.controller.ts
│   │   │   ├── maintenance.controller.ts
│   │   │   └── report.controller.ts
│   │   ├── services/
│   │   │   ├── vehicle.service.ts
│   │   │   ├── driver.service.ts
│   │   │   ├── maintenance.service.ts
│   │   │   └── audit.service.ts
│   │   ├── repositories/
│   │   │   ├── vehicle.repository.ts
│   │   │   ├── driver.repository.ts
│   │   │   ├── assignment.repository.ts
│   │   │   └── maintenance.repository.ts
│   │   ├── models/                     # ORM entities/schema
│   │   │   ├── vehicle.model.ts
│   │   │   ├── driver.model.ts
│   │   │   ├── assignment.model.ts
│   │   │   ├── maintenanceRecord.model.ts
│   │   │   └── auditLog.model.ts
│   │   ├── routes/
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── driver.routes.ts
│   │   │   ├── maintenance.routes.ts
│   │   │   └── report.routes.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── migrations/
│   ├── seeds/                          # synthetic seed data, 1,500+ records
│   └── tests/                          # backend-local unit tests (fast, colocated)
│       └── unit/
│
├── frontend/                           # React, TypeScript
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── api/                        # typed API client, uses shared types from auth/
│       ├── components/
│       ├── pages/
│       │   ├── Dashboard/
│       │   ├── Vehicles/
│       │   ├── Drivers/
│       │   ├── Maintenance/
│       │   └── Reports/
│       └── styles/
│
├── auth/                               # shared auth module — used by backend AND referenced by tests
│   ├── package.json
│   ├── src/
│   │   ├── jwt.ts                      # sign/verify tokens, refresh flow
│   │   ├── password.ts                 # bcrypt/argon2 hashing wrapper
│   │   ├── rbac.policy.ts              # role → permission matrix, single source of truth
│   │   ├── roles.enum.ts               # Administrator | MaintenanceStaff | Driver
│   │   └── types.ts                    # shared AuthUser, JwtPayload types
│   └── tests/
│       └── rbac.policy.test.ts
│
├── security/                           # security engineering surface — Member 4's home base
│   ├── middleware/
│   │   ├── rbac.middleware.ts          # enforces auth/rbac.policy.ts at the API layer
│   │   ├── authGuard.middleware.ts     # verifies JWT on protected routes
│   │   ├── rateLimit.middleware.ts
│   │   ├── securityHeaders.middleware.ts  # helmet config, CSP, CORS policy
│   │   ├── validate.middleware.ts      # server-side input validation
│   │   └── errorHandler.middleware.ts  # generic error responses, no stack traces leaked
│   ├── encryption/
│   │   └── fieldEncryption.ts          # encrypts driver ID/licence number at rest
│   ├── scanning/
│   │   ├── dependency-check.config.json
│   │   └── docker-scan.sh
│   ├── policies/
│   │   ├── threat-model.md
│   │   ├── data-retention-policy.md
│   │   └── popia-alignment.md          # which POPIA principles map to which controls
│   └── audit/
│       └── audit-log.schema.ts
│
├── tests/                              # cross-cutting tests — not owned by one service
│   ├── integration/                    # API against real test DB
│   │   ├── vehicle.api.test.ts
│   │   ├── driver.api.test.ts
│   │   └── maintenance.api.test.ts
│   ├── security/                       # dedicated security test suite
│   │   ├── rbac-bypass.test.ts         # calls protected routes with wrong role's token
│   │   ├── auth-flow.test.ts
│   │   └── input-validation.test.ts
│   ├── e2e/                            # full user journeys, e.g. Playwright
│   │   ├── admin-registers-vehicle.spec.ts
│   │   └── driver-views-assignment.spec.ts
│   └── fixtures/                       # shared test data
│
├── infra/
│   ├── docker/
│   │   └── postgres/                   # init scripts for local/staging DB
│   └── scripts/
│       ├── seed-db.sh
│       └── setup-env.sh
│
└── docs/
    ├── SRS.md
    ├── SDD.md
    ├── architecture-diagram.png
    ├── ERD.png
    ├── test-plan.md
    ├── meetings/
    └── ai-usage/
```
=======
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
>>>>>>> origin/develop
