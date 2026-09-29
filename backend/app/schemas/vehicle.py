# equest/response  shapes
#kept separate from ORM model (app/models/vehicles.py)
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    registration_number: str = Field(..., min_length=1, max_length=20)
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    year: int = Field(..., ge=1950, le=2100)
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: datetime | None = None
    roadworthy_expiry: datetime | None  = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    #All fields optional, PATCH style updates work without forcing client to resend whole record
    registration_number: str | None = Field( None, min_length=2, max_length=20)
    make: str | None = None
    model: str | None = None
    year: int | None = Field(default=None, ge=1950, le=2100)
    status: VehicleStatus | None = None
    insurance_expiry: datetime | None = None
    roadworthy_expiry: datetime | None = None


class VehicleOut(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    current_driver_id: int | None = None
    created_at: datetime
    updated_at: datetime

class VehicleAssignRewquest(BaseModel):
    driver_id: int     


