from typing import Optional
from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceModel


def get_by_id(db: Session, record_id: str) -> Optional[MaintenanceModel]:
    return db.query(MaintenanceModel).filter(MaintenanceModel.id == record_id).first()


def list_by_vehicle(db: Session, vehicle_id: str) -> list[MaintenanceModel]:
    return (
        db.query(MaintenanceModel)
        .filter(MaintenanceModel.vehicle_id == vehicle_id)
        .order_by(MaintenanceModel.date.desc())
        .all()
    )


def list_all(db: Session) -> list[MaintenanceModel]:
    return db.query(MaintenanceModel).order_by(MaintenanceModel.date.desc()).all()


def create(db: Session, record: MaintenanceModel) -> MaintenanceModel:
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update(db: Session, record: MaintenanceModel, data: dict) -> MaintenanceModel:
    for field, value in data.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def delete(db: Session, record: MaintenanceModel) -> None:
    db.delete(record)
    db.commit()
