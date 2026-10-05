from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


def _build_engine():
    database_url = settings.database_url or "sqlite:///./vfms.db"
    engine_kwargs = {"future": True, "pool_pre_ping": True}
    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(database_url, **engine_kwargs)


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

# Import model modules so SQLAlchemy metadata is populated for migrations or optional creation.
from app.models.assignment import Assignment  # noqa: F401,E402
from app.models.driver import Driver  # noqa: F401,E402
from app.models.maintenance import MaintenanceRecord  # noqa: F401,E402
from app.models.vehicle import Vehicle  # noqa: F401,E402
from app.services.audit_service import AuditLog  # noqa: F401,E402

# Do NOT automatically create tables by default. Some teams prefer to manage
# schema with migrations or with an explicit init step. The behaviour can be
# enabled by setting the `create_tables_on_startup` setting to True (for
# local/dev convenience) — this mirrors the "no auto-seed" approach of the
# projectGuide-vfms repository.
try:
    from app.config import settings
except Exception:
    settings = None

if settings and getattr(settings, "create_tables_on_startup", False):
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
