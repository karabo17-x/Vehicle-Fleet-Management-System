from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.vehicle import Vehicle, VehicleCreate, VehicleUpdate, VehicleStatus
from app.services import vehicle_service


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post("/", response_model=Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle_in: VehicleCreate, db: Session = Depends(get_db)):
    return vehicle_service.create_vehicle(db, vehicle_in)


@router.get("/", response_model=list[Vehicle])
def list_vehicles(status_filter: Optional[VehicleStatus] = None, db: Session = Depends(get_db)):
    return vehicle_service.list_vehicles(db, status_filter)


@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    return vehicle_service.get_vehicle(db, vehicle_id)


@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle(vehicle_id: str, vehicle_in: VehicleUpdate, db: Session = Depends(get_db)):
    return vehicle_service.update_vehicle(db, vehicle_id, vehicle_in)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle_service.delete_vehicle(db, vehicle_id)
