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

    
 
 
