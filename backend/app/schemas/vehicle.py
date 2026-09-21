from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    registration_number: str = Field(..., min_length=1, max_length=20)
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    year: int
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: Optional[datetime] = None
    roadworthy_expiry: Optional[datetime] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = Field(
        None, min_length=1, max_length=20
    )
    make: Optional[str] = Field(
        None, min_length=1, max_length=50
    )
    model: Optional[str] = Field(
        None, min_length=1, max_length=50
    )
    year: Optional[int] = None
    status: Optional[VehicleStatus] = None
    insurance_expiry: Optional[datetime] = None
    roadworthy_expiry: Optional[datetime] = None
    current_driver_id: Optional[int] = None


class VehicleOut(VehicleBase):
    id: int
    current_driver_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

