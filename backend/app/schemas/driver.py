from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.driver import DriverStatus


class DriverBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    license_number: str = Field(..., min_length=2, max_length=30)
    license_expiry: datetime
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    status: DriverStatus = DriverStatus.ACTIVE


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    first_name: Optional[str] = Field(
        None, min_length=2, max_length=50
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=20
    )

    license_number: Optional[str] = Field(
        None, min_length=2, max_length=30
    )
    license_expiry: Optional[datetime] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    status: Optional[DriverStatus] = None


class DriverOut(DriverBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DriverPublicOut(BaseModel):
    #reduced view without the license, for roles that shouldnt see sensitve data
    #required by app/routers/drivers.py which imports this to decide `staff` sees vs what `manager` /`admin` see
    id: int
    first_name: str
    last_name: str
    status: DriverStatus
    model_config = ConfigDict(from_attributes=True)
