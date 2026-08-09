from datetime import datetime 
from sqlalchemy import Datetime,ForeignKey, Integer, Numeric, Text, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(Integer, primary_Key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    service_date: Mapped[datetime] = mapped_column(Datetime, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    cost: Mapped[float]= mapped_column(Numeric(10,2), nullable=False, default=0.00)
    service_provider: Mapped[str|None] = mapped_column(String(100), nullable=True)

    logged_by: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(Datetime, server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="maintenance_records")

