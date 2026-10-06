# VFMS Auth Service

The auth service is a Go identity service. It validates credentials, issues short-lived RS256 access tokens and longer-lived refresh tokens, and publishes the RSA public key used by the FastAPI backend to verify access tokens. The private signing key must remain available only to the auth service.

## Run locally

From the repository root:

```bash
cd auth
go run ./cmd
```

By default it listens on port `8081`, uses `./internal/keys/private.pem` and `./internal/keys/public.pem`, stores accounts in `./data/users.json`, and seeds demo accounts. The backend expects the corresponding public key at `../auth/internal/keys/public.pem` when run from its `backend` directory.

To run auth and backend through Compose, return to the repository root and run:

```bash
docker compose up --build auth backend db
```

Compose stores keys in the `auth-keys` volume and users in the `auth-data` volume. Ordinary restarts retain signing keys, user accounts, and password changes. Removing these volumes deletes the corresponding data.

## Demo accounts

With `SEED_DEMO_USERS=true` (the default), these development-only accounts are created at service startup:

| Email | Password | Role |
| --- | --- | --- |
| `admin@vfms.com` | `Admin@12345` | `admin` |
| `manager@vfms.com` | `Manager@12345` | `manager` |
| `staff@vfms.com` | `Staff@12345` | `staff` |

Demo accounts are for local development only. Create real accounts through the admin-only `POST /users` endpoint. Account records and password changes are stored in a private JSON file by default; in Compose this file is persisted in `auth-data`.

## HTTP API

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/login` | None | Verify email/password and return access and refresh tokens |
| `POST` | `/refresh` | Refresh token in request body | Issue a new token pair |
| `POST` | `/users` | Admin access token | Create a manager, staff, or admin account |
| `POST` | `/forgot-password` | None | Send a time-limited recovery code to a registered email |
| `POST` | `/reset-password` | None | Verify the code and save a new password |
| `GET` | `/authorize` | `Bearer` access token | Validate token and return its identity/role |
| `GET` | `/.well-known/public-key.pem` | None | Return the RSA public key as PEM |
| `GET` | `/health` | None | Liveness check |

Login request:

```json
{"email":"manager@vfms.com","password":"Manager@12345"}
```

Successful login response:

```json
{
  "access_token": "<signed-access-token>",
  "refresh_token": "<signed-refresh-token>",
  "token_type": "Bearer",
  "expires_in": 900,
  "role": "manager"
}
```

Refresh request:

```json
{"refresh_token":"<signed-refresh-token>"}
```

Provision an account using a manager/admin-issued admin token:

```http
POST /users
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

```json
{"email":"person@example.com","full_name":"Fleet Operator","password":"a-long-initial-password","role":"staff"}
```

Request a recovery code with `POST /forgot-password` and `{"email":"person@example.com"}`. The service returns the same accepted response whether or not the email exists. If it is a registered email and SMTP is configured, a six-digit code is sent; it expires after 10 minutes and allows at most five attempts. Submit `POST /reset-password` with `email`, `code`, and `new_password` (12–128 characters). A successful reset invalidates the code and persists the new password.

### Email delivery setup

The service uses SMTP with STARTTLS when supported by the server. Set these variables in the root `.env` file before starting Compose; never commit SMTP credentials:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-app-password
SMTP_FROM=VFMS <no-reply@example.com>
```

The sender address must be authorized by the SMTP provider. Without valid SMTP settings, the endpoint keeps the same generic response for privacy, while the auth service logs a delivery error. Recovery codes are held in memory and become invalid if the auth process restarts; a user can request a new one.

Tokens contain `sub`, `email`, `role`, `token_type`, `iss`, `iat`, and `exp` claims. The default access-token lifetime is 15 minutes; refresh-token lifetime is 7 days. Refresh tokens are verified and exchanged for a new pair. Login attempts are rate-limited per remote address.

There is no public self-registration endpoint. An administrator creates user accounts through `POST /users`; this lets users recover access using an email address registered to their account. The frontend should link “Forgot password?” from the sign-in page to a recovery form that calls the two recovery endpoints above. The backend/auth API is implemented here; the browser form is a frontend task.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_PORT` | `8081` | HTTP listen port |
| `JWT_PRIVATE_KEY_PATH` | `./internal/keys/private.pem` | RSA signing key |
| `JWT_PUBLIC_KEY_PATH` | `./internal/keys/public.pem` | RSA verification key served to clients |
| `ACCESS_TOKEN_TTL` | `15m` | Access-token lifetime; Go duration syntax |
| `REFRESH_TOKEN_TTL` | `168h` | Refresh-token lifetime |
| `JWT_ISSUER` | `vfms-auth` | Issuer claim; must match backend `JWT_ISSUER` |
| `RATE_LIMIT_REQUESTS` | `5` | Login requests allowed in the window |
| `RATE_LIMIT_WINDOW` | `1m` | Login rate-limit window |
| `SEED_DEMO_USERS` | `true` | Seed development accounts at startup |
| `AUTH_USER_STORE_PATH` | `./data/users.json` | Persistent account store; Compose uses `/app/data/users.json` |
| `SMTP_HOST` | unset | SMTP server host for recovery emails |
| `SMTP_PORT` | `587` | SMTP server port (STARTTLS recommended) |
| `SMTP_USERNAME` | unset | SMTP username |
| `SMTP_PASSWORD` | unset | SMTP password or app password |
| `SMTP_FROM` | unset | Authorized sender email address |

## Roles and security notes

The recognized roles are `admin`, `manager`, and `staff`. The auth service's `/authorize` endpoint checks token validity and recognized role. Resource-level route permissions are enforced by the backend's FastAPI dependencies; both services should be kept consistent when role policy changes.

The service uses bcrypt password hashes and RS256 signatures. Keep the private key secret, persist the key pair across deployments, and configure the same issuer and public key in the backend. Rotating the signing key invalidates outstanding tokens unless the backend is configured to trust the replacement key.

## Tests

From the `auth` directory:

```bash
go test ./...
```
