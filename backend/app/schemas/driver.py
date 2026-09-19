from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.driver import DriverStatus


class DriverBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=20)
    last_name: str = Field(..., min_length=1, max_length=20)
    phone: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = Field(None, max_length=30)
    status: DriverStatus = DriverStatus.ACTIVE


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    first_name: Optional[str] = Field(
        None, min_length=1, max_length=20
    )
    last_name: Optional[str] = Field(
        None, min_length=1, max_length=20
    )
    phone: Optional[str] = Field(None, max_length=15)
    email: Optional[str] = Field(None, max_length=30)
    status: Optional[DriverStatus] = None


class DriverOut(DriverBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)