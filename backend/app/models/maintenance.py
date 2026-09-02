import uuid

from sqlalchemy import Column, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class MaintenanceModel(Base):
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    date = Column(Date, nullable=False)
    cost = Column(Float, nullable=False)
    description = Column(String, nullable=False)

    vehicle = relationship("VehicleModel")
