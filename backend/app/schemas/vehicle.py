from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class VehicleStatus(str, Enum):
    ACTIVE = "active"
    IN_MAINTENANCE = "in_maintenance"
    OUT_OF_SERVICE = "out_of_service"
    RETIRED = "retired"


class VehicleBase(BaseModel):
    make: str = Field(..., examples=["Toyota"])
    model: str = Field(..., examples=["Hilux"])
    year: int = Field(..., ge=1980, le=date.today().year + 1)
    license_plate: str = Field(..., examples=["ND 12 AB GP"])
    vin: str = Field(..., min_length=11, max_length=17)
    mileage_km: float = Field(0, ge=0)
    status: VehicleStatus = VehicleStatus.ACTIVE


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = Field(None, ge=1980, le=date.today().year + 1)
    license_plate: Optional[str] = None
    vin: Optional[str] = Field(None, min_length=11, max_length=17)
    mileage_km: Optional[float] = Field(None, ge=0)
    status: Optional[VehicleStatus] = None


class Vehicle(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
