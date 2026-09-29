from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.driver import DriverStatus


class DriverBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    license_number: str = Field(..., min_length=2, max_length=30)
    license_expiry: datetime
    phone: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    status: DriverStatus = DriverStatus.ACTIVE


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    first_name: str | None  = None
    last_name: str | None = None
    license_number: str | None = Field(default=None, min_length=2, max_length=30)
    license_expiry: datetime | None = None
    phone: str | None = None
    email: EmailStr | None = None
    status: DriverStatus | None = None


class DriverOut(DriverBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

class DriverPublicOut(BaseModel):
    #a reduced view without the license, for roles that shouldnt see sensitve data

    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    status: DriverStatus
