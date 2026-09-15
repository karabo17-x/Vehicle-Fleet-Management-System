# VFMS Auth service
the identity/security microservice for the Vehicle Fleet Management System. it owns user credentials and is only part of the system that never touches a password. Every other service, the FastAPI backend and indirectly the frontend trusts JSON Web tokens this service signs, rather than checking password itself

## Responsibilities
- Authenticate user by email + password(`POST /login)
- Issue short lived **access tokens** and longer-lived **refresh tokens**, signed with RS256 (this service holds the private key, everyone else only needs the public key to verify(asymmetric))
- rotate acess tokens via `POST /refresh` without requiring the user to log in again
- ratelimit login attempts to slow down credential guessing
- publish its public key at `GET /.well-known/public-key.pem` so other service can verify tokens **without calling back this serice on every requests**