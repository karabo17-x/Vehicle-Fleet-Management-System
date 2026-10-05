# runtime configuration for FastAPI backend
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./vfms.db"

    #APP
    app_name: str = "VFMS Backend"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    #Auth integration(see auth/README.md)...
    #backend verifies JWTs issued by the Go auth service using
    #service's RSA public key
    #deployment AUTH_PUBLIC_KEY_URL point auth service
    #/.well-known/public-key.pem endpoint
    auth_public_key_path: str = "../auth/keys/public.pem"
    auth_public_key_url: str | None = None
    jwt_algorithm: str = "RS256"
    jwt_issuer: str = "vfms-auth"

    #CORS
    cors_allow_origins: list[str] = ["http://localhost:5173"]

    #Business rules
    #feature 6: warn when license/insurance/roadworthdy document is
    #within this many days of expiring
    expiry_warnings_days: int = 30

    # Dev helper: when true the ORM will call `Base.metadata.create_all` on startup.
    # Default is False to match the "no auto-seed" behavior used in the projectGuide-vfms
    # repository; production deployments should use migrations instead.
    create_tables_on_startup: bool = False


@lru_cache
def get_settings() -> Settings:
    # settings are cached so we parse the environment once per process, not on every request
    return Settings()


settings = get_settings()


    