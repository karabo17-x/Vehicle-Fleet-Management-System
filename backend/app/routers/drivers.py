from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.driver import Driver, DriverCreate, DriverUpdate, DriverStatus
from app.services import driver_service


router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.post("/", response_model=Driver, status_code=status.HTTP_201_CREATED)
def create_driver(driver_in: DriverCreate, db: Session = Depends(get_db)):
    return driver_service.create_driver(db, driver_in)


@router.get("/", response_model=list[Driver])
def list_drivers(status_filter: Optional[DriverStatus] = None, db: Session = Depends(get_db)):
    return driver_service.list_drivers(db, status_filter)


@router.get("/{driver_id}", response_model=Driver)
def get_driver(driver_id: str, db: Session = Depends(get_db)):
    return driver_service.get_driver(db, driver_id)


@router.put("/{driver_id}", response_model=Driver)
def update_driver(driver_id: str, driver_in: DriverUpdate, db: Session = Depends(get_db)):
    return driver_service.update_driver(db, driver_id, driver_in)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: str, db: Session = Depends(get_db)):
    driver_service.delete_driver(db, driver_id)
