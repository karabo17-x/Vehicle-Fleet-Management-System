from __future__ import annotations
from datetime import datetime
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.driver import Driver, DriverStatus

class DriverRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, driver: Driver) -> Driver:
        self.db.add(driver)
        self.db.commit()
        self.db.refresh(driver)
        return driver

    def get(self, driver_id: int) -> Driver | None:
        return self.db.get(Driver, driver_id)

    def get_by_license(self, license_number: str) -> Driver | None:
        stmt = select(Driver).where(Driver.license_number == license_number)
        return self.db.execute(stmt).scalar_one_or_none()   

    def list(
            self,
            *,
            search: str | None = None,
            status: DriverStatus | None = None,
            skip: int = 0,
            limit: int = 50,

    ) -> list[Driver]:
        #feature5: search/filter by name or license number, and by status
        stmt = select(Driver)
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    Driver.first_name.ilike(like),
                    Driver.last_name.ilike(like),
                    Driver.license_number.ilike(like),
                )
            )
        if status:
            stmt = stmt.where(Driver.status == status)
        stmt = stmt.offset(skip).limit(limit).order_by(Driver.id)
        return list(self.db.execute(stmt).scalars().all())

    def count(self, *, search: str | None = None, status: DriverStatus | None = None) -> int:
        return len(self.list(search=search, status=status, skip=0, limit=1_000_000))

    def update(self, driver: Driver, changes: dict) -> Driver:
        for field, value in changes.items():
            setattr(driver, field, value)
        self.db.commit()
        self.db.refresh(driver)
        return driver

    def delete(self, driver: Driver) -> None:
        self.db.delete(driver)
        self.db.commit()

    def list_expiring_license(self, before: datetime) -> list[Driver]:
        #feature6: drivers whose license expires before cutoff
        stmt = select(Driver).where(Driver.license_expiry <= before)
        return list(self.db.execute(stmt).scalars().all())    



