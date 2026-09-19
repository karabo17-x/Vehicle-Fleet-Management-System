# VFMS Auth service
the identity/security microservice for the Vehicle Fleet Management System. it owns user credentials and is only part of the system that never touches a password. Every other service, the FastAPI backend and indirectly the frontend trusts JSON Web tokens this service signs, rather than checking password itself

## Responsibilities
- Authenticate user by email + password(`POST /login)
- Issue short lived **access tokens** and longer-lived **refresh tokens**, signed with RS256 (this service holds the private key, everyone else only needs the public key to verify(asymmetric))
- rotate acess tokens via `POST /refresh` without requiring the user to log in again
- ratelimit login attempts to slow down credential guessing
- publish its public key at `GET /.well-known/public-key.pem` so other service can verify tokens **without calling back this serice on every requests**

## Running locally

```bash
cd auth
go mod tidy #downloads golang.org/x/crypto (bycrypt)
go run ./cmd
```
On first run it generates an RSA keypair under `./keys/` and seeds three demo accounts (disable with `SEED_DEMO_USERS=false`):

| Email                | Password        | Role    |
|-----------------------|-----------------|---------|
| admin@vfms.com      | Admin@12345     | admin   |
| manager@vfms.com    | Manager@12345   | manager |
| staff@vfms.com     | Staff@12345     | staff   |
> dev-only seed credentials
> never used in real deployment - see `docs/identity-service-api.md`

## Environment variables

| Variable          | Default           | Meaning                   |
|-----------------------|-----------------------|---------------------|
| `Auth_Port`           | `8081`                | HTTP Port          |
| `JWT_PRIVATE_KEY_PATH`| `./keys/private.pem`  | RSA private key    |
| `JWT_PUBLIC_KEY_PATH` | `./keys/public.pem`   | RSA public key     |
| `ACCESS_TOKEN_TTL`    | `15m`                 | access token       |
|  `REFRESH_TOKEN_TTL`  | `168h` (7 days)       | Refresh token      |
| `JWT_ISSUER`           | `vfms-auth`          | `iss` claim value  |
| `RATE_LIMIT_REQUESTS`  | `5`                  | Login attempts     |
| `RATE_LIMIT_WINDOW`    | `1m`                 | Window for above   |
| `SEED_DEMO_USERS`      | `true`               | Seed demo accounts | 

## API

see [`docs/identity-service-api.md`](..docs/identity-service-api.md)
or full request/response examples.

| Method | Path                          | Auth required | Purpose                          |
|--------|--------------------------------|----------------|-----------------------------------|
| POST   | `/login`                       | no             | Exchange credentials for tokens  |
| POST   | `/refresh`                     | no (needs refresh token in body) | Rotate access token |
| GET    | `/authorize`                   | Bearer token   | Token introspection              |
| GET    | `/.well-known/public-key.pem`  | no             | Fetch the public key for verification |
| GET    | `/health`                      | no             | Liveness check                   |

## Integration with the FastAPI backend

The backend does **not** call `/authorize` on every request (that
would add a network round-trip to every API call). Instead it fetches
`/.well-known/public-key.pem` once at startup (see
`backend/app/config.py` / `backend/app/middleware/auth_guard.py`) and
verifies tokens locally using the same RS256 scheme implemented in
`internal/token/jwt.go`. Both services agree on the `Claims` shape —
`sub`, `email`, `role`, `token_type`, `iss`, `iat`, `exp` — documented
in `docs/identity-service-api.md`.

## Tests

Run with:

```bash
go test ./...
```
