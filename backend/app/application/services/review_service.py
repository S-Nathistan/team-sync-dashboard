from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.report_repository import ReportRepository
from app.infrastructure.repositories.review_repository import ReviewRepository
from app.application.schemas.review import ReviewRequest, ApproveRequest
from app.application.schemas.report import ReportResponse
from app.application.services.report_service import ReportService
from app.domain.enums import ReportStatus, ReviewAction


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_repo = ReportRepository(db)
        self.review_repo = ReviewRepository(db)
        self.report_service = ReportService(db)

    async def approve_report(
        self,
        report_id: int,
        request: ApproveRequest,
        reviewer_id: int,
    ) -> ReportResponse:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        # Managers cannot approve their own reports
        if report.user_id == reviewer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot review your own report",
            )

        # Only submitted reports can be approved
        if report.status != ReportStatus.SUBMITTED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve report in status: {report.status}. Only submitted reports can be approved.",
            )

        # Create review comment
        review_data = {
            "report_id": report_id,
            "reviewer_id": reviewer_id,
            "version_number": report.current_version,
            "comment": request.comment or "Approved",
            "action": ReviewAction.APPROVED.value,
        }
        await self.review_repo.create(review_data)

        # Update report status
        await self.report_repo.update(
            report_id, {"status": ReportStatus.APPROVED.value}
        )

        report = await self.report_repo.get_by_id(report_id)
        return self.report_service._serialize_report(report)

    async def request_changes(
        self,
        report_id: int,
        request: ReviewRequest,
        reviewer_id: int,
    ) -> ReportResponse:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        # Cannot review own report
        if report.user_id == reviewer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot review your own report",
            )

        # Only submitted reports can be sent back for changes
        if report.status != ReportStatus.SUBMITTED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot request changes on report in status: {report.status}",
            )

        # Comment is required for "Request Changes"
        if not request.comment or not request.comment.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A comment is required when requesting changes",
            )

        # Create review comment
        review_data = {
            "report_id": report_id,
            "reviewer_id": reviewer_id,
            "version_number": report.current_version,
            "comment": request.comment,
            "action": ReviewAction.NEEDS_CORRECTION.value,
        }
        await self.review_repo.create(review_data)

        # Update status
        await self.report_repo.update(
            report_id, {"status": ReportStatus.NEEDS_CORRECTION.value}
        )

        report = await self.report_repo.get_by_id(report_id)
        return self.report_service._serialize_report(report)