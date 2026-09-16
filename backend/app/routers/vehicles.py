#vehicle endpoints - feature 1(CRUDfrom 
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.vehicle import VehicleStatus

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.post("", status_code=201)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles()),
):
    service = VehicleService(db)
    return service.create(payload.model_dump(), user.id, user.role)
