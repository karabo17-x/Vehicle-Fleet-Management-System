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

def _serialize(driver, user: CurrentUser):
    if user.role in ("admin", "manger"):
        return DriverOut.model_validate(driver)
    return DriverPublicOut.model_validate(driver)

@router.post("", response_model=DriverOut, status_code=201)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("mamager")),
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



    
 
 
