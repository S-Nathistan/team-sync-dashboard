from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.infrastructure.database import Base
from app.domain.enums import ReportStatus


class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default=ReportStatus.DRAFT.value)
    current_version = Column(Integer, nullable=False, default=1)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("UserModel", back_populates="reports", lazy="selectin")
    project = relationship("ProjectModel", back_populates="reports", lazy="selectin")
    versions = relationship(
        "ReportVersionModel",
        back_populates="report",
        lazy="selectin",
        order_by="ReportVersionModel.version_number",
    )
    review_comments = relationship(
        "ReviewCommentModel",
        back_populates="report",
        lazy="selectin",
        order_by="ReviewCommentModel.created_at.desc()",
    )

    def __repr__(self):
        return f"<Report(id={self.id}, user_id={self.user_id}, status={self.status})>"