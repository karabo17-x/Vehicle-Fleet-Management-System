#assignment endpoints feature 3 history/read
#assign/unassign write
#POST /vehicles{id}/assign, POST/ vehicle/{id}/unassign

from datetime import datetime 
from pydantic import BaseModel, ConfigDict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database  import get_db
from app.middleware.auth_guard import CurrentUser, get_current_user
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/assignments", tags=["assignments"])

class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id : int
    vehicle_id: int
    driver_id: int
    assigned_at: datetime
    unassigned_at: datetime | None
    assigned_by: str
    unassigned_by: str | None
    is_active: bool

@router.get("/vehicle/{vehicle_id}", response_model=list[AssignmentOut])
def vehicle_assignment_history(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),

):
    #assignemt history , feature 3
    # history of past assignments 
    history = VehicleService(db).assignment_history(vehicle_id) 
    return [
        AssignmentOut(
            id=a.id, vehicle_id=a.vehicle_id, driver_id=a.driver_id,
            assigned_at=a.assigned_at, unassigned_at=a.unassigned_at,
            assigned_by=a.assigned_by, unassigned_by=a.unassigned_by,
            is_active=a.is_active,    
        )
        for a in history
    ]
