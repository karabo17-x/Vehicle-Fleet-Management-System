from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class DriverStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class DriverBase(BaseModel):
    full_name: str = Field(..., examples=["Thabo Nkosi"])
    license_number: str = Field(..., examples=["N01234567890"])
    license_expiry: date
    status: DriverStatus = DriverStatus.ACTIVE
    assigned_vehicle_id: Optional[str] = None


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    status: Optional[DriverStatus] = None
    assigned_vehicle_id: Optional[str] = None


class Driver(DriverBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
