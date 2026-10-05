import enum
from datetime import datetime
from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import mapped_column, relationship, Mapped
from app.database import Base

class DriverStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Driver(Base):
    __tablename__ = "drivers"
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)

    # License fields are part of the contract and must be present for the
    # public driver output schemas; include them on the ORM so serialization
    # and DDL match the contract.
    license_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    license_expiry: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[DriverStatus] = mapped_column(
        Enum(DriverStatus, values_callable=lambda enum: [item.value for item in enum]),
        default=DriverStatus.ACTIVE,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    assignments = relationship("Assignment", back_populates="driver", foreign_keys="Assignment.driver_id")
