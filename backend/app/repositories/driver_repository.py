from typing import Optional
from sqlalchemy.orm import Session

from app.models.driver import DriverModel


def get_by_id(db: Session, driver_id: str) -> Optional[DriverModel]:
    return db.query(DriverModel).filter(DriverModel.id == driver_id).first()


def get_by_license_number(db: Session, license_number: str) -> Optional[DriverModel]:
    return db.query(DriverModel).filter(DriverModel.license_number == license_number).first()


def list_all(db: Session, status_filter: Optional[str] = None) -> list[DriverModel]:
    query = db.query(DriverModel)
    if status_filter:
        query = query.filter(DriverModel.status == status_filter)
    return query.all()


def create(db: Session, driver: DriverModel) -> DriverModel:
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def update(db: Session, driver: DriverModel, data: dict) -> DriverModel:
    for field, value in data.items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


def delete(db: Session, driver: DriverModel) -> None:
    db.delete(driver)
    db.commit()
