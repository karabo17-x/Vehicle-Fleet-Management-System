# driver endpoints - feature 2 CRUD
#data confidentiality. RBAC + data-visbility
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database  import get_db
from app.middleware.auth_guard import CurrentUser, get_current_user, require_roles
from app.schemas.driver import DriverCreate, DriverOut, DriverPublicOut, DriverUpdate
from app.models.driver import DriverStatus
from app.services.driver_service import DriverService

router = APIRouter(prefix="/drivers", tags=["drivers"])

import logging
from pydantic import ValidationError

logger = logging.getLogger(__name__)


def _to_dict(driver, include_sensitive: bool) -> dict:
    # Build a plain dict from the ORM object to avoid pydantic-from-attributes
    # pitfalls. Use getattr so missing attributes become None/empty rather than
    # triggering attribute access issues on detached or partial instances.
    base = {
        "id": getattr(driver, "id", None),
        "first_name": getattr(driver, "first_name", ""),
        "last_name": getattr(driver, "last_name", ""),
        "status": getattr(driver, "status", DriverStatus.ACTIVE),
        "created_at": getattr(driver, "created_at", None),
        "updated_at": getattr(driver, "updated_at", None),
        "phone": getattr(driver, "phone", None),
        "email": getattr(driver, "email", None),
    }
    if include_sensitive:
        base.update({
            "license_number": getattr(driver, "license_number", ""),
            "license_expiry": getattr(driver, "license_expiry", None),
        })
    return base


def _serialize(driver, user: CurrentUser):
    """Serialize a Driver ORM object according to caller role.

    Convert ORM -> plain dict then validate with Pydantic model to avoid
    attribute-access related ValidationErrors. If validation still fails,
    return a conservative fallback dict to avoid 500s.
    """
    include_sensitive = user.role in ("admin", "manager")
    payload = _to_dict(driver, include_sensitive)
    try:
        if include_sensitive:
            return DriverOut.model_validate(payload)
        return DriverPublicOut.model_validate(payload)
    except ValidationError as exc:
        logger.warning(
            "Driver serialization (dict) failed for id=%s role=%s: %s",
            payload.get("id"), user.role, exc,
        )
        # Return the plain payload as a best-effort JSON-friendly dict
        return payload

@router.post("", response_model=DriverOut, status_code=201)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("manager")),
):
    return DriverService(db).create(payload.model_dump(), user.id, user.role)

@router.get("")
def list_drivers(
    search: str | None = Query(default=None, description="Matches name or license number"),
    status_filter: DriverStatus | None = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    items, total = DriverService(db).list(search=search, status_filter=status_filter, skip=skip, limit=limit)
    return{
        "items": [_serialize(d, user) for d in items],
        "total": total,
        "skip": skip,
        "limit": limit,
    }



    
 
 
