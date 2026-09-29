from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AssignmentBase(BaseModel):
    vehicle_id: int = Field(..., gt=0)
    driver_id: int = Field(..., gt=0)


class AssignmentCreate(AssignmentBase):
    """Not used directly by the assign endpoint (which takes only
    `driver_id` via VehicleAssignRequest, with vehicle_id coming from
    the URL path) `assigned_by` is deliberately NOT a field:
    it must always be derived server-side from the authenticated
    user's JWT subject, never taken from client input,"""
    pass


class AssignmentUpdate(BaseModel):
    """represents closing an assignment. `unassigned_at
    and `unassigned` not accepted
    both are set server-side (auth user JWT )
    POST /vehices/{id}/unassign called"""
    pass


class AssignmentOut(AssignmentBase):
    id: int
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
    unassigned_by: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

