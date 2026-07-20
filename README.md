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
├── backend/                 # Express API — vehicles, drivers, maintenance, reports (TypeScript)
├── frontend/                # React UI (TypeScript)
├── auth/                    # Standalone Go service — auth, RBAC, password hashing, tokens
│   ├── cmd/                 # Entrypoint
│   ├── internal/
│   │   ├── config/          # Env loading
│   │   ├── password/        # bcrypt hashing
│   │   ├── token/           # RS256 JWT issuance & verification
│   │   ├── rbac/            # Role/resource/action policy table
│   │   ├── store/           # UserStore interface (in-memory now, Postgres later)
│   │   ├── ratelimit/       # Login rate limiting
│   │   └── handlers/        # HTTP handlers (/login, /refresh, /authorize, /public-key)
│   ├── Dockerfile
│   └── README.md
├── docs/
│   ├── SRS.md / SDD.md
│   ├── identity-service-api.md   # Contract between auth/ and backend/
│   ├── go-code-walkthrough.md    # Line-by-line guide to the Go service
│   ├── test-plan.md
│   ├── threat-model.md
│   └── meetings/
├── .github/workflows/
│   ├── auth-ci.yml          # go vet, go test, govulncheck — scoped to auth/
│   └── ci.yml                # Node lint/test/scan — scoped to backend/ and frontend/
├── docker-compose.yml
├── .env.example
└── CONTRIBUTING.md          # Git workflow — read this before your first commit