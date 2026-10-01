from collections.abc import Generator

from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """Database dependency stub for the app import path.

    Database functionality is intentionally not implemented in this task, so routes that
    require a live DB session will fail explicitly if used instead of silently importing
    a broken dependency.
    """
    raise RuntimeError("Database layer is not configured for this backend.")
