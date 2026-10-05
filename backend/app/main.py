"""
FastAPI application entry point. Run with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import assignments, drivers, maintenance, reports, vehicles
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


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Starting %s (%s environment)", settings.app_name, settings.environment)
    init_db()


@app.get("/health", tags=["health"])
def health_check():
    """Liveness check for container/orchestrator monitoring, and for
    the frontend to confirm the API is reachable before showing the
    login screen."""
    return {"status": "ok", "service": settings.app_name}
