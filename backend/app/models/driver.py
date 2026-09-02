import uuid

from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class DriverModel(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    license_expiry = Column(Date, nullable=False)
    status = Column(String, default="active")
    assigned_vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=True)

    assigned_vehicle = relationship("VehicleModel")
