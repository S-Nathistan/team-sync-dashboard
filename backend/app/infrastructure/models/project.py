from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.infrastructure.database import Base


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1000), default="")
    color = Column(String(7), default="#3B82F6")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    reports = relationship("ReportModel", back_populates="project", lazy="selectin")
    members = relationship("ProjectMemberModel", back_populates="project", lazy="selectin")

    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name})>"