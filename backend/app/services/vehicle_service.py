from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.vehicle import VehicleModel
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from app.repositories import vehicle_repository as repo


def create_vehicle(db: Session, vehicle_in: VehicleCreate) -> VehicleModel:
    existing = repo.get_by_vin_or_plate(db, vehicle_in.vin, vehicle_in.license_plate)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A vehicle with this VIN or license plate already exists",
        )
    vehicle = VehicleModel(**vehicle_in.model_dump())
    return repo.create(db, vehicle)


def list_vehicles(db: Session, status_filter: Optional[str] = None) -> list[VehicleModel]:
    return repo.list_all(db, status_filter)


def get_vehicle(db: Session, vehicle_id: str) -> VehicleModel:
    vehicle = repo.get_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


def update_vehicle(db: Session, vehicle_id: str, vehicle_in: VehicleUpdate) -> VehicleModel:
    vehicle = get_vehicle(db, vehicle_id)
    update_data = vehicle_in.model_dump(exclude_unset=True)
    return repo.update(db, vehicle, update_data)


def delete_vehicle(db: Session, vehicle_id: str) -> None:
    vehicle = get_vehicle(db, vehicle_id)
    repo.delete(db, vehicle)


def vehicle_exists(db: Session, vehicle_id: Optional[str]) -> None:
    """Used by driver_service and maintenance_service."""
    if vehicle_id is None:
        return
    if not repo.get_by_id(db, vehicle_id):
        raise HTTPException(status_code=404, detail="Assigned vehicle not found")
