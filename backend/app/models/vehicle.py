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
