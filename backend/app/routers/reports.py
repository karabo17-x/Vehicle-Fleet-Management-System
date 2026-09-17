# analytics endpoint
#feature 6: warn admin when license about to expire
#go auth internal/rbac/policy.go(report:read is denied for staff)

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceRecord
from app.models.driver import Driver
from app.models.vehicle import Vehicle, VehicleStatus
from app.database import get_db

router = APIRouter(prefix="reports", tags=["reports"])

@router.get("/summary")
def fleet_summary(
    db: Session = Depends(get_db)
):
    #counts by status, driver, total maintenance
    total_drivers = db.query(func.count(Vehicle.id)).scalar()
    by_status = dict(
        db.query(Vehicle.status, func.count(Vehicle.id)).group_by(Vehicle.status).all()

    )
    total_drivers = db.query(func.count(Driver.id)).scalar()
    total_maintenance_cost = db.query(func.coalesce(func.sum(MaintenanceRecord.cost), 0)).scalar()
    return{
        "total_drivers": total_drivers,
        "vehicle_by_status": {status.value: count for status, count in by_status.items()},
        "total_maintenance_cost": float(total_maintenance_cost),
    }

@router.get("/maintenance-cost-by-vehicle")
def maintenance_cost_by_vehicle(
    db: Session = Depends(get_db),

):
    rows = (
        Vehicle.id,
        func.count(MaintenanceRecord.id).label("service_count"),
    )
    return [
        {
            "vehicle_id": r.id,
            "service_count": r.service_count,
        }
        for r in rows
    
    ]

@router.get("/expiring-documents")
def expiring_documents(
    days: int = Query(default=None, ge=1, le=365, description="warning"),
    db: Session = Depends(get_db),


):
    #feature6: license, vehicle insurance alert for expiry
    winDays = days if days is not None else settings.expiry_warn_days
    cutoff = datetime.utcnow() + timedelta(days=winDays)

    
    
    
