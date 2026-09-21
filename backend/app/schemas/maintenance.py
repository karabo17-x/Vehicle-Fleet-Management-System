from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MaintenanceBase(BaseModel):
    vehicle_id: int = Field(..., gt=0)
    service_date: datetime
    description: str = Field(..., min_length=1)
    cost: float = Field(..., ge=0)
    service_provider: Optional[str] = Field(None, max_length=100)


class MaintenanceCreate(MaintenanceBase):
    logged_by: Optional[str] = Field(None, max_length=50)


class MaintenanceUpdate(BaseModel):
    service_date: Optional[datetime] = None
    description: Optional[str] = Field(None, min_length=1)
    cost: Optional[float] = Field(None, ge=0)
    service_provider: Optional[str] = Field(None, max_length=100)


class MaintenanceOut(MaintenanceBase):
    id: int
    logged_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)