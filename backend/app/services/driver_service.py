# business logic for drivers (Feature2) mirroring VehicleService structure

from __future__ import annotations
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.driver import Driver, DriverStatus
from app.repositories.driver_repository import DriverRepository
from app.services.audit_service import AuditService

class DriverService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DriverRepository(db)
        self.audit = AuditService(db)

    def create(self, data: dict, actor_id: str, actor_role: str) -> Driver:
        if self.repo.get_by_license(data["license_number"]):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"A driver with license number '{data['license_number']}' exists",
            )
        driver = Driver(**data)
        driver = self.repo.create(driver)
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="driver.create",
            resource_type="driver", resource_id=driver.id,
        )
        return driver

    def get_or_404(self, driver_id: int) -> Driver:
        driver = self.repo.get(driver_id)
        if not driver:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Driver not found")
        return driver

    def list(self, *, search=None, status_filter: DriverStatus | None = None, skip=0, limit=50):
        items = self.repo.list(search=search, status=status_filter, skip=skip, limit=limit)
        total = self.repo.count(search=search, status=status_filter)
        return items, total

    def update(self, driver_id: int, changes: dict, actor_id: str, actor_role: str) -> Driver:
        driver = self.get_or_404(driver_id)
        new_license = changes.get("license_number")
        if new_license and new_license != driver.license_number and self.repo.get_by_license(new_license):
            raise HTTPException(status.HTTP_409_CONFLICT, "license number in use")
        driver = self.repo.update(driver, {k: v for k, v in changes.items() if v is not None})
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="driver.update",
            resource_type="driver", resource_id=driver.id,
        )
        return driver

    def delete(self, driver_id: int, actor_id: str, actor_role: str) -> None:
        driver = self.get_or_404(driver_id)
        self.repo.delete(driver)
        self.audit.log(
            actor_id=actor_id, actor_role=actor_role, action="driver.delete",
            resource_type="driver", resource_id=driver_id,
        )

        
           