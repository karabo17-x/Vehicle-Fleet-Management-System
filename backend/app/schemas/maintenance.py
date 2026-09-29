#Pydantic schemas for maintenance records (Feature 4)
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MaintenanceBase(BaseModel):
    vehicle_id: int
    service_date: datetime
    description: str = Field(..., min_length=1)
    cost: float = Field(..., ge=0)
    service_provider: str | None = None


class MaintenanceCreate(MaintenanceBase):
    """`logged_by` is deliberately NOT a field it must be
    derived server-side from the authenticated user's JWT subject
    when the record is created, never taken from client input, or
    the audit trail can be forged."""
    pass
    

class MaintenanceOut(MaintenanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    logged_by: str
    created_at: datetime