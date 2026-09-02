from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.driver import DriverModel
from app.schemas.driver import DriverCreate, DriverUpdate
from app.repositories import driver_repository as repo
from app.services import vehicle_service


def create_driver(db: Session, driver_in: DriverCreate) -> DriverModel:
    existing = repo.get_by_license_number(db, driver_in.license_number)
    if existing:
        raise HTTPException(
            status_code=400, detail="A driver with this license number already exists"
        )
    vehicle_service.vehicle_exists(db, driver_in.assigned_vehicle_id)

    driver = DriverModel(**driver_in.model_dump())
    return repo.create(db, driver)


def list_drivers(db: Session, status_filter: Optional[str] = None) -> list[DriverModel]:
    return repo.list_all(db, status_filter)


def get_driver(db: Session, driver_id: str) -> DriverModel:
    driver = repo.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


def update_driver(db: Session, driver_id: str, driver_in: DriverUpdate) -> DriverModel:
    driver = get_driver(db, driver_id)
    update_data = driver_in.model_dump(exclude_unset=True)
    if "assigned_vehicle_id" in update_data:
        vehicle_service.vehicle_exists(db, update_data["assigned_vehicle_id"])
    return repo.update(db, driver, update_data)


def delete_driver(db: Session, driver_id: str) -> None:
    driver = get_driver(db, driver_id)
    repo.delete(db, driver)
