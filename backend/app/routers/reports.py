"""Read-only fleet summary and expiry reports."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth_guard import CurrentUser, require_roles
from app.models.driver import Driver
from app.models.maintenance import MaintenanceRecord
from app.models.vehicle import Vehicle

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary")
def fleet_summary(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("manager", "staff")),
):
    by_status = db.query(Vehicle.status, func.count(Vehicle.id)).group_by(Vehicle.status).all()
    return {
        "total_vehicles": db.query(func.count(Vehicle.id)).scalar() or 0,
        "total_drivers": db.query(func.count(Driver.id)).scalar() or 0,
        "vehicle_by_status": {status.value: count for status, count in by_status},
        "total_maintenance_cost": float(
            db.query(func.coalesce(func.sum(MaintenanceRecord.cost), 0)).scalar() or 0
        ),
    }


@router.get("/maintenance-cost-by-vehicle")
def maintenance_cost_by_vehicle(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("manager", "staff")),
):
    rows = (
        db.query(
            Vehicle.id.label("vehicle_id"),
            func.count(MaintenanceRecord.id).label("service_count"),
            func.coalesce(func.sum(MaintenanceRecord.cost), 0).label("total_cost"),
        )
        .outerjoin(MaintenanceRecord, MaintenanceRecord.vehicle_id == Vehicle.id)
        .group_by(Vehicle.id)
        .order_by(Vehicle.id)
        .all()
    )
    return [
        {"vehicle_id": row.vehicle_id, "service_count": row.service_count, "total_cost": float(row.total_cost)}
        for row in rows
    ]


@router.get("/expiring-documents")
def expiring_documents(
    days: int | None = Query(default=None, ge=1, le=365),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles("manager", "staff")),
):
    window_days = days if days is not None else settings.expiry_warning_days
    now = datetime.utcnow()
    cutoff = now + timedelta(days=window_days)
    documents = []
    for driver in db.query(Driver).filter(Driver.license_expiry <= cutoff).all():
        documents.append({"type": "driver_license", "item_id": driver.id,
                          "name": f"{driver.first_name} {driver.last_name}",
                          "expiry_date": driver.license_expiry})
    for vehicle in db.query(Vehicle).all():
        for kind, expiry in (("insurance", vehicle.insurance_expiry), ("roadworthy", vehicle.roadworthy_expiry)):
            if expiry is not None and expiry <= cutoff:
                documents.append({"type": kind, "item_id": vehicle.id,
                                  "name": vehicle.registration_number, "expiry_date": expiry})
    documents.sort(key=lambda document: document["expiry_date"])
    return {"days": window_days, "items": documents}
