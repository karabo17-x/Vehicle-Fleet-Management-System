# business logic for vehicles(feature3) assign/unassign a driver, keep history

from __future__ import annotations
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.models.driver import Driver, DriverStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.repositories.vehicle_repository import VehicleRepository
from app.services.audit_service import AuditService

class VehicleService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = VehicleRepository(db)
        self.audit = AuditService(db)

        #feature1 : CRUD
    def create(self, data: dict, actor_id: str, actor_role: str) -> Vehicle:
        if self.repo.get_by_registration(data["registration_number"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"vehicle with registration number '{data['registration_number']}' exists"
            )
        vehicle = Vehicle(**data)
        vehicle = self.repo.create(vehicle)
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="vehicle.create",
            resource_type="vehicle", resource_id=vehicle.id,
            detail=f"registration={vehicle.registration_number}",
        )
        return vehicle

    def get_or_404(self, vehicle_id: int) -> Vehicle:
        vehicle = self.repo.get(vehicle_id)
        if not vehicle:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found")
        return vehicle

    def list(self, *, search=None, status_filter: VehicleStatus | None = None, skip=0, limit=50):
        items = self.repo.list(search=search, status=status_filter, skip=skip, limit=limit)
        total = self.repo.count(search=search, status=status_filter)
        return items, total

    def update(self, vehicle_id: int, changes: dict, actor_id: str, actor_role: str) -> Vehicle:
        vehicle = self.get_or_404(vehicle_id)
        new_reg = changes.get("registration_number")
        if new_reg and new_reg != vehicle.registration_number and self.repo.get_by_registration(new_reg):
            raise HTTPException(status.HTTP_409_CONFLICT, "registration number in use")
        vehicle = self.repo.update(vehicle, {k: v for k, v in changes.items() if v is not None})
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="vehicle.update",
            resource_type="vehicle", resource_id=vehicle.id,
        )
        return vehicle

    def delete(self, vehicle_id: int, actor_id: str, actor_role: str) -> None:
        vehicle = self.get_or_404(vehicle_id)
        self.repo.delete(vehicle)
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="vehicle.delete",
            resource_type="vehicle", resource_id=vehicle_id,
        )

        # feature 3: assignment
    def assign_driver(self, vehicle_id: int, driver_id: int, actor_id: str, actor_role: str) -> Vehicle:
        vehicle = self.get_or_404(vehicle_id)
        driver = self.db.get(Driver, driver_id)
        if not driver:
            raise HTTPException(status.HTTP_404_NOT_FOUND,"Driver not found")
        if driver.status != DriverStatus.ACTIVE:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot assign non-active driver")
        if self.db.query(Vehicle.id).filter(Vehicle.current_driver_id == driver.id).first():
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Driver already has an active vehicle assignment",
            )
        if vehicle.current_driver_id is not None:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Vehicle has active driver assignemt; unassign first",
            )

        assignment = Assignment(vehicle_id=vehicle.id, driver_id=driver.id, assigned_by=actor_id)
        self.db.add(assignment)
        vehicle.current_driver_id = driver.id
        self.db.commit()
        self.db.refresh(vehicle)

        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="vehicle.assign_driver",
            resource_type="vehicle", resource_id=vehicle.id, detail=f"driver_id={driver.id}",
        )
        return vehicle

    def unassign_driver(self, vehicle_id: int, actor_id: str, actor_role: str) -> Vehicle:
        vehicle = self.get_or_404(vehicle_id)
        if vehicle.current_driver_id is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Vehicle has no active driver assignment")

        open_assignment = (
            self.db.query(Assignment)
            .filter(Assignment.vehicle_id == vehicle.id, Assignment.unassigned_at.is_(None))
            .order_by(Assignment.assigned_at.desc())
            .first()
        )
        if open_assignment:
            open_assignment.unassigned_at = datetime.now()
            open_assignment.unassigned_by = actor_id

        vehicle.current_driver_id = None
        self.db.commit()
        self.db.refresh(vehicle)

        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="vehicle.unassign_driver",
            resource_type="vehicle", resource_id=vehicle.id,
        )
        return vehicle

    def assignment_history(self, vehicle_id: int) -> list[Assignment]:
        self.get_or_404(vehicle_id)
        return(
            self.db.query(Assignment)
            .filter(Assignment.vehicle_id == vehicle_id)
            .order_by(Assignment.assigned_at.desc())
            .all()
        )




