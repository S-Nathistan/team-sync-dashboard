from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.infrastructure.database import Base


class ReportVersionModel(Base):
    __tablename__ = "report_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(
        Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    version_number = Column(Integer, nullable=False, default=1)
    tasks_completed = Column(JSON, default=list)
    tasks_planned = Column(Text, default="")
    blockers = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    hours_breakdown = Column(JSON, default=list)
    notes = Column(Text, default="")
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    report = relationship("ReportModel", back_populates="versions")

    def __repr__(self):
        return f"<ReportVersion(id={self.id}, report_id={self.report_id}, v={self.version_number})>"