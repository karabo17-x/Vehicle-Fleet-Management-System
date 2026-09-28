# ============================================
# backend/app/config.py
# Application configuration (environment-driven)
# Author: Thembeka Ne (47812036) - Database Engineer
# ============================================

import os
from functools import lru_cache

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Settings:
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://vfms_user:vfms_password@localhost:5432/vfms_db",
    )
    APP_NAME: str = os.getenv("APP_NAME", "VFMS Backend")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()