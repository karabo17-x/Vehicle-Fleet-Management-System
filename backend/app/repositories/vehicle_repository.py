# writes raw SQLAlchemy queries for vehicles.
from __future__ import annotations
from datetime import datetime
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle, VehicleStatus

class VehicleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, vehicle: Vehicle) -> Vehicle:
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def get(self, vehicle_id: int) -> Vehicle | None:
        return self.db.get(Vehicle, vehicle_id)

    def get_by_registration(self, registration_number: str) -> Vehicle | None:
        stmt = select(Vehicle).where(Vehicle.registration_number == registration_number)
        return self.db.execute(stmt).scalar_one_or_none()

    def list(
            self,
            *,
            search: str | None = None,
            status: VehicleStatus | None = None,
            skip: int = 0,
            limit: int = 50,      
    ) -> list[Vehicle]:
        #feature5: search/filter `search` martches registration number, make, model.
        stmt = select(Vehicle)
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    Vehicle.registration_number.ilike(like),
                    Vehicle.make.ilike(like),
                    Vehicle.model.ilike(like),
                )
            )
        if status:
            stmt = stmt.where(Vehicle.status == status)
        stmt = stmt.offset(skip).limit(limit).order_by(Vehicle.id)
        return list (self.db.execute(stmt).scalars().all()) 

    def count(self, *, search: str | None = None, status: VehicleStatus | None = None) -> int:
        return len(self.list(search=search, status=status, skip=0, limit=1_000_000))

    def update(self, vehicle: Vehicle, changes: dict) -> Vehicle:
        for field, value in changes.items():
            setattr(vehicle, field, value)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete(self, vehicle: Vehicle) -> None:
        self.db.delete(vehicle)
        self.db.commit()

    def list_expiring_documents(self, before: datetime) -> list[Vehicle]:
        #feature6: vehicles whose insurance or roadworthy certificates expires
        stmt = select(Vehicle).where(
            or_(
                Vehicle.insurance_expiry.is_not(None) & (Vehicle.insurance_expiry <= before),
                Vehicle.roadworthy_expiry.is_not(None) & (Vehicle.roadworthy_expiry <= before),
            )
        )
        return list(self.db.execute(stmt).scalars().all())
                
       
        

