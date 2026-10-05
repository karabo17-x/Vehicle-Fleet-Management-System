"""
Centralised runtime configuration for the FastAPI backend.

Everything the app needs from the environment is read exactly once,
here, via pydantic-settings — the rest of the codebase imports
`settings` instead of calling os.getenv() in random places. This
mirrors the same pattern used in the Go auth service's
internal/config/env.go, so both backend services are configured the
same way.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    app_name: str = "VFMS Backend"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    # --- Database ---
    # PostgreSQL is the project's real database (see db/schema.sql and
    # db/README.md) -- chosen over SQLite because the module's
    # non-functional requirements explicitly call for scalability and
    # reliability under concurrent multi-user access, which a
    # single-writer, single-file database cannot provide. SQLAlchemy
    # abstracts the SQL dialect away from the rest of the app, so
    # nothing outside this one setting needs to know or care which
    # database is actually running.
    database_url: str = "postgresql://vfms_user:vfms_pass@localhost:5433/vfms"
    # For quick local hacking without Docker/Postgres installed, this
    # also works (see db/README.md for the trade-offs):
    #   DATABASE_URL=sqlite:///./vfms.db

    # --- Auth integration (see auth/README.md) ---
    # The backend verifies JWTs issued by the Go auth service using
    # that service's RSA public key. In development we read the key
    # straight from the shared file both services mount; in a real
    # deployment AUTH_PUBLIC_KEY_URL would point at the auth service's
    # /.well-known/public-key.pem endpoint instead.
    auth_public_key_path: str = "../auth/internal/keys/public.pem"
    auth_public_key_url: str | None = None
    jwt_algorithm: str = "RS256"
    jwt_issuer: str = "vfms-auth"

    # --- CORS ---
    cors_allow_origins: list[str] = ["http://localhost:5173"]

    # --- Business rules ---
    # Feature 6: warn when a licence/insurance/roadworthy document is
    # within this many days of expiring.
    expiry_warning_days: int = 30


@lru_cache
def get_settings() -> Settings:
    """Settings are cached so we parse the environment once per
    process, not on every request."""
    return Settings()


settings = get_settings()
