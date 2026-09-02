from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.maintenance import Maintenance, MaintenanceCreate, MaintenanceUpdate
from app.services import maintenance_service


router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("/", response_model=Maintenance, status_code=status.HTTP_201_CREATED)
def create_record(record_in: MaintenanceCreate, db: Session = Depends(get_db)):
    return maintenance_service.create_record(db, record_in)


@router.get("/", response_model=list[Maintenance])
def list_records(vehicle_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List all maintenance records, or pass ?vehicle_id=... to see one vehicle's history."""
    return maintenance_service.list_records(db, vehicle_id)


@router.get("/{record_id}", response_model=Maintenance)
def get_record(record_id: str, db: Session = Depends(get_db)):
    return maintenance_service.get_record(db, record_id)


@router.put("/{record_id}", response_model=Maintenance)
def update_record(record_id: str, record_in: MaintenanceUpdate, db: Session = Depends(get_db)):
    return maintenance_service.update_record(db, record_id, record_in)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: str, db: Session = Depends(get_db)):
    maintenance_service.delete_record(db, record_id)
