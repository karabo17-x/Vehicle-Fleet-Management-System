import enum 
from datetime import datetime 
from sqlalchemy import Datetime, Enum, String, func
from sqlalchemy.orm import mapped_column, relationship, Mapped
from app.database import Base

class DriverStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Driver(Base):
    __tablename__ = "drivers"
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(20), nullable=False)
    last_name: Mapped[str] = mapped_column(String(20), nullable=False)

    phone: Mapped[str|None] = mapped_column(String(15), nullable=True)
    email: Mapped[str|None] = mapped_column(String(30), nullable=True)
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus), default=DriverStatus.ACTIVE, nullable=False)

    created_at: Mapped[datetime] = mapped_column(Datetime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(Datetime, server_default=func.now(), onupdate=func.now()) 

    assignments = relationship("Assignment", back_populates="driver", foreign_keys="Assignment.driver_id")  