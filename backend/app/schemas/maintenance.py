from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class MaintenanceBase(BaseModel):
    vehicle_id: str
    date: date_type = Field(..., examples=["2026-03-15"])
    cost: float = Field(..., ge=0, examples=[1250.00])
    description: str = Field(..., examples=["Oil change and brake pad replacement"])


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    date: Optional[date_type] = None
    cost: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None


class Maintenance(MaintenanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
