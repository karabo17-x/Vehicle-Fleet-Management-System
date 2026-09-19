from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AssignmentBase(BaseModel):
    vehicle_id: int = Field(..., gt=0)
    driver_id: int = Field(..., gt=0)


class AssignmentCreate(AssignmentBase):
    assigned_by: Optional[str] = Field(None, max_length=50)


class AssignmentUpdate(BaseModel):
    unassigned_at: Optional[datetime] = None
    unassigned_by: Optional[str] = Field(None, max_length=50)


class AssignmentOut(AssignmentBase):
    id: int
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
    unassigned_by: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

