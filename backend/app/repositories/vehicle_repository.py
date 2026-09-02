from typing import Optional
from sqlalchemy.orm import Session

from app.models.vehicle import VehicleModel


def get_by_id(db: Session, vehicle_id: str) -> Optional[VehicleModel]:
    return db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()


def get_by_vin_or_plate(db: Session, vin: str, license_plate: str) -> Optional[VehicleModel]:
    return db.query(VehicleModel).filter(
        (VehicleModel.vin == vin) | (VehicleModel.license_plate == license_plate)
    ).first()


def list_all(db: Session, status_filter: Optional[str] = None) -> list[VehicleModel]:
    query = db.query(VehicleModel)
    if status_filter:
        query = query.filter(VehicleModel.status == status_filter)
    return query.all()


def create(db: Session, vehicle: VehicleModel) -> VehicleModel:
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def update(db: Session, vehicle: VehicleModel, data: dict) -> VehicleModel:
    for field, value in data.items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def delete(db: Session, vehicle: VehicleModel) -> None:
    db.delete(vehicle)
    db.commit()
