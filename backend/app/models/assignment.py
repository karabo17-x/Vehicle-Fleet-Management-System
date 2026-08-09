#driver assigned to vehicle, keep history of assignments

from datetime import datetime 
from sqlalchemy import Datetime, ForeignKey, Integer, func, String
from sqlalchemy.orm import Mapped, relationship, mapped_column
from app.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(Integer, primary_Key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False, index=True)

    assigned_at: Mapped[datetime] = mapped_column(Datetime, server_default=func.now())
    unassigned_at: Mapped[datetime|None] = mapped_column(Datetime, nullable=True)

    #user id from auth service, to track who assigned/unassigned 
    assigned_by: Mapped[str] = mapped_column(String(50), nullable=True)
    unassigned_by: Mapped[str|None] = mapped_column(String(50),nullable=True)

    vehicle = relationship("Vehicle", back_populates="assignments", foreign_keys=[vehicle_id])
    driver = relationship("Driver", back_populates="assignments", foreign_keys=[driver_id])

    @property
    def is_active(self) -> bool:
        return self.unassigned_at is None
