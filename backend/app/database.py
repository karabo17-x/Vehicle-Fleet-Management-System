"""
SQLAlchemy engine/session setup.

Kept deliberately small: one engine, one sessionmaker, one Base, and a
`get_db` FastAPI dependency that every router uses to obtain a request
-scoped session. Repositories (see app/repositories/) receive this
session rather than importing it globally, which is what makes them
easy to unit test with an in-memory SQLite database.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# check_same_thread=False is only needed for SQLite (FastAPI may use a
# different thread per request); it's a no-op for other engines.
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for every ORM model in the app."""


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a request-scoped DB session, always
    closed afterwards even if the request raises."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables that don't exist yet. Called once at startup
    (see app/main.py). For the project's scope (a single-instance
    dev/demo deployment) this replaces a full migrations tool; the
    folder structure leaves room for Alembic migrations later if the
    project grows past this."""
    # Import models here (not at module load time) so every model is
    # registered on Base.metadata before create_all runs.
    from app.models import assignment, driver, maintenance, vehicle  # noqa: F401
    from app.services import audit_service  # noqa: F401 (registers AuditLog)

    Base.metadata.create_all(bind=engine)
