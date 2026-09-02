from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.maintenance import MaintenanceModel
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate
from app.repositories import maintenance_repository as repo
from app.services import vehicle_service


def create_record(db: Session, record_in: MaintenanceCreate) -> MaintenanceModel:
    vehicle_service.vehicle_exists(db, record_in.vehicle_id)
    record = MaintenanceModel(**record_in.model_dump())
    return repo.create(db, record)


def list_records(db: Session, vehicle_id: Optional[str] = None) -> list[MaintenanceModel]:
    if vehicle_id:
        vehicle_service.vehicle_exists(db, vehicle_id)
        return repo.list_by_vehicle(db, vehicle_id)
    return repo.list_all(db)


def get_record(db: Session, record_id: str) -> MaintenanceModel:
    record = repo.get_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


def update_record(db: Session, record_id: str, record_in: MaintenanceUpdate) -> MaintenanceModel:
    record = get_record(db, record_id)
    update_data = record_in.model_dump(exclude_unset=True)
    return repo.update(db, record, update_data)


def delete_record(db: Session, record_id: str) -> None:
    record = get_record(db, record_id)
    repo.delete(db, record)
