"""
FastAPI application entry point. Run with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import assignments, drivers, maintenance, reports, vehicles, me
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title=settings.app_name,
    description=(
        "Vehicle Fleet Management System (VFMS) API — a central "
        "repository for vehicles, drivers, assignments, and "
        "maintenance history. Authentication is delegated to the "
        "separate Go identity service; this API verifies the JWTs it "
        "issues (see app/middleware/auth_guard.py)."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles.router, prefix=settings.api_prefix)
app.include_router(drivers.router, prefix=settings.api_prefix)
app.include_router(maintenance.router, prefix=settings.api_prefix)
app.include_router(assignments.router, prefix=settings.api_prefix)
app.include_router(reports.router, prefix=settings.api_prefix)
app.include_router(me.router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Starting %s (%s environment)", settings.app_name, settings.environment)
    init_db()

    # Data-integrity check: ensure every driver row has the license fields
    # required by the API contract. If any rows are missing these fields we
    # warn and optionally backfill them when BACKFILL_MISSING_DRIVER_DATA is
    # explicitly enabled in the environment. This prevents mysterious 500s
    # from Pydantic validation while preserving production safety by default.
    try:
        import os
        from datetime import datetime, timedelta
        from sqlalchemy import text
        from app.database import SessionLocal

        db = SessionLocal()
        try:
            missing = db.execute(
                text(
                    "SELECT id FROM drivers WHERE license_number IS NULL OR license_number = '' OR license_expiry IS NULL"
                )
            ).fetchall()
            if missing:
                ids = [r[0] for r in missing]
                logger.warning(
                    "Found %d driver(s) with missing license data: %s",
                    len(ids), ids,
                )
                if os.getenv("BACKFILL_MISSING_DRIVER_DATA", "false").lower() in ("1", "true", "yes"):
                    # Backfill a safe placeholder license and set expiry 1 year from now
                    expiry = (datetime.utcnow() + timedelta(days=365)).isoformat(sep=' ')
                    for driver_id in ids:
                        placeholder = f"AUTO-{driver_id}"
                        db.execute(
                            text(
                                "UPDATE drivers SET license_number = :ln, license_expiry = :le WHERE id = :id"
                            ),
                            {"ln": placeholder, "le": expiry, "id": driver_id},
                        )
                    db.commit()
                    logger.info("Backfilled %d driver(s) with placeholder license data", len(ids))
                else:
                    logger.warning(
                        "Set BACKFILL_MISSING_DRIVER_DATA=true to automatically backfill placeholder license data."
                    )
        finally:
            db.close()
    except Exception as exc:
        logger.exception("Driver data-integrity check failed: %s", exc)


@app.get("/health", tags=["health"])
def health_check():
    """Liveness check for container/orchestrator monitoring, and for
    the frontend to confirm the API is reachable before showing the
    login screen."""
    return {"status": "ok", "service": settings.app_name}
