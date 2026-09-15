<<<<<<< HEAD
import uuid

from sqlalchemy import Column, String, Integer, Float
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    license_plate = Column(String, unique=True, nullable=False)
    vin = Column(String, unique=True, nullable=False)
    mileage_km = Column(Float, default=0)
    status = Column(String, default="active")
=======
import enum 
from datetime import datetime 
from sqlalchemy import Datetime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship 
from app.database import Base 

class VehicleStatus(str,enum.Enum):
    ACTIVE = "active"
    IN_MAINTENANCE = "in_maintenance"
    RETIRED = "retired"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer,primary_key=True)
    registration_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable = False) 
    make: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(50), nullable=False)
    year: Mapped[str] = mapped_column(Integer, nullable=False)
    status: Mapped[VehicleStatus] = mapped_column(Enum(VehicleStatus), default=VehicleStatus.ACTIVE, nullable = False)  

    #document expiry feature6: expiry warnings 
    insurance_expiry: Mapped[datetime|None] = mapped_column(Datetime, nullable =True)
    roadworthy_expiry: Mapped[datetime|None] = mapped_column(Datetime, nullable=True)

    #feature3: which driver has a vehicle
    #assigment history tracked
    current_driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable = True)
    created_at: Mapped[datetime] = mapped_column(Datetime,server_default=func.now())
    updated_at:Mapped[datetime] = mapped_column(Datetime, server_default=func.now(), onupdate=func.now())

    current_driver = relationship("Driver", foreign_keys=[current_driver_id]) 
    assignments = relationship("Assignment", back_populates="vehicle", foreign_keys="Assignment.vehicle_id")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")  

>>>>>>> origin/develop
