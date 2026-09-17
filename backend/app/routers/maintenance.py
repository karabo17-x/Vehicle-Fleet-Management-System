"""
maintenance endpoint feature 4  (log vehcile maintenance and service)
vehicle validation reuses vehicleservice so vehicle exist rule not duplicate
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance import MaintenanceRecord
from app.schemas.maintenance import MaintenanceCreate, MaintenanceOut
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/maintenance", tags=["maintenance"])
@router.post("", response_model=MaintenanceOut, status_code=201)
def log_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    VehicleService(db).get_or_404(payload.model_dump()) # vehicle doesnt exist
    record = MaintenanceRecord(**payload.model_dump())
    db.commit()
    db.refresh(record)

    return record

@router.get("")
def list_maintenance(
    vehicle_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),

):
    query = db.query(MaintenanceRecord)
    if vehicle_id is not None:
        query = query.filter(MaintenanceRecord.vehicle_id == vehicle_id)
    total = query.count()
    items = (
        query.order_by(MaintenanceRecord.service_date)
        
    )
    return{
        "items": [MaintenanceOut.model_validate(i) for i in items],
        "total": total,
        "skip": skip,
        "limit": limit,
    } 

@router.get("/{record_id}", response_model=MaintenanceOut)
def get_maintenance(
    record_id: int,
    db: Session = Depends(get_db),

):
    record = db.get(MaintenanceRecord, record_id)
    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Maintenance record not found")
    return record

@router.delete("/{record_id}", status_code=204)
def delete_maintenance(
    record_id: int,
    db: Session = Depends(get_db),

):
    record = db.get(MaintenanceRecord, record_id)
    if not record:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Maintenance record not found")
    db.delete(record)
    db.commit()

    

    

