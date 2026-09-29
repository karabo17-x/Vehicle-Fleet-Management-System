#feature: creates clear record that checks when something is wrong

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text, func, select
from sqlalchemy.orm import Mapped, Session, mapped_column
from app.database import Base

class AuditLog(Base):
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(20), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False) # vehicle.create
    resource_type: Mapped[str] = mapped_column(String(30), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(30), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
            self,
            *,
            actor_id: str,
            actor_role: str,
            action: str,
            resource_type: str,
            resource_id: int | str,
            detail: str | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            detail=detail,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def list_for_resource(self, resource_type: str, resource_id: int | str) -> list[AuditLog]:
        stmt= (
            select(AuditLog)
            .where(AuditLog.resource_type == resource_type, AuditLog.resource_id == str(resource_id))
            .order_by(AuditLog.created_at.desc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def list_recent(self, limit: int = 100) -> list[AuditLog]:
        stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        return list(self.db.execute(stmt).scalars().all())
           


        





