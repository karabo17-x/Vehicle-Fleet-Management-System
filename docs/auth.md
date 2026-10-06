# VFMS Auth Service

The auth service is a Go identity service. It verifies user credentials, issues RS256 access and refresh tokens, and publishes the RSA public key used by the FastAPI backend. The private signing key stays in the auth service.

## Run locally

From the repository root:

```bash
cd auth
go run ./cmd
```

The service listens on port `8081`, uses `./internal/keys/private.pem` and `./internal/keys/public.pem`, and seeds demo users by default. The user store is in memory; only the demo accounts are recreated when the service restarts.

Run the complete backend stack with Docker Compose:

```bash
docker compose up --build
```

Compose persists the auth signing keys in `auth-keys` and PostgreSQL data in `db-data`. Normal restarts retain those volumes.

## Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@vfms.com` | `Admin@12345` | `admin` |
| `manager@vfms.com` | `Manager@12345` | `manager` |
| `staff@vfms.com` | `Staff@12345` | `staff` |

These accounts are for development and demonstrations only.

## HTTP API

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/login` | None | Verify credentials and return access and refresh tokens |
| `POST` | `/refresh` | Refresh token in request body | Issue a replacement token pair |
| `GET` | `/authorize` | Bearer access token | Validate a token and return its identity and role |
| `GET` | `/.well-known/public-key.pem` | None | Publish the RSA public key as PEM |
| `GET` | `/health` | None | Liveness check |

Login request:

```json
{"email":"manager@vfms.com","password":"Manager@12345"}
```

Successful login returns `access_token`, `refresh_token`, `token_type`, `expires_in`, and `role`. Tokens contain `sub`, `email`, `role`, `token_type`, `iss`, `iat`, and `exp` claims. Defaults are a 15-minute access token and a 7-day refresh token. Login attempts are rate-limited by remote address.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_PORT` | `8081` | HTTP listen port |
| `JWT_PRIVATE_KEY_PATH` | `./internal/keys/private.pem` | RSA signing key |
| `JWT_PUBLIC_KEY_PATH` | `./internal/keys/public.pem` | RSA public key |
| `ACCESS_TOKEN_TTL` | `15m` | Access-token lifetime |
| `REFRESH_TOKEN_TTL` | `168h` | Refresh-token lifetime |
| `JWT_ISSUER` | `vfms-auth` | JWT issuer; must match the backend setting |
| `RATE_LIMIT_REQUESTS` | `5` | Login attempts allowed in a window |
| `RATE_LIMIT_WINDOW` | `1m` | Login rate-limit window |
| `SEED_DEMO_USERS` | `true` | Seed development accounts at startup |

## Backend integration

The backend verifies access tokens locally using the auth service's public key. It does not call `/authorize` for every API request. The services must use the same JWT issuer and matching key pair.

## Tests

From the `auth` directory:

```bash
go test ./...
```
