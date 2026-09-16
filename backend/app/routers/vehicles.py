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

@router.get("")
def list_vehicles(
    search: str | None = Query(default=none, description="Matches registration, make, model"),
    status_filter: VehicleStatus | None = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),

):
    service = VehicleSerice(db)
    items, total = service.list(search=search, status_filter=status_filter, skip=skip, limit=limit)
    return{
        "items": [Vehicle.model_validate(v) for v in items],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),

):
    return VehicleService(db).get_or_404(vehicle_id)

@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("manager")),
)
    
    
