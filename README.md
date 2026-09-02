# Vehicle-Fleet-Management-System
### Software Engineering:CMPG224

```
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
