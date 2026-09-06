from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.infrastructure.database import Base


class ReviewCommentModel(Base):
    __tablename__ = "review_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(
        Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    reviewer_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    version_number = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    action = Column(String(20), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships — Added lazy="selectin" to prevent MissingGreenlet crash
    report = relationship("ReportModel", back_populates="review_comments")
    reviewer = relationship("UserModel", back_populates="review_comments", lazy="selectin")

    def __repr__(self):
        return f"<ReviewComment(id={self.id}, action={self.action})>"