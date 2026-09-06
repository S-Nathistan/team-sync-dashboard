from datetime import datetime, timezone, date
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.report_repository import ReportRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.schemas.report import (
    ReportCreateRequest,
    ReportUpdateRequest,
    ReportResponse,
    ReportListResponse,
    ReportVersionResponse,
    ReviewCommentResponse,
)
from app.domain.enums import ReportStatus, UserRole


class ReportService:
    def __init__(self, db: AsyncSession):
        self.report_repo = ReportRepository(db)
        self.user_repo = UserRepository(db)

    def _serialize_version(self, version) -> ReportVersionResponse:
        return ReportVersionResponse(
            id=version.id,
            version_number=version.version_number,
            tasks_completed=version.tasks_completed or [],
            tasks_planned=version.tasks_planned or "",
            blockers=version.blockers or [],
            achievements=version.achievements or [],
            hours_breakdown=version.hours_breakdown or [],
            notes=version.notes or "",
            submitted_at=version.submitted_at,
            created_at=version.created_at,
        )

    def _serialize_review_comment(self, rc) -> ReviewCommentResponse:
        reviewer_name = None
        try:
            if hasattr(rc, "reviewer") and rc.reviewer:
                reviewer_name = rc.reviewer.full_name
        except Exception:
            reviewer_name = "Manager"

        return ReviewCommentResponse(
            id=rc.id,
            reviewer_id=rc.reviewer_id,
            reviewer_name=reviewer_name,
            version_number=rc.version_number,
            comment=rc.comment or "",
            action=rc.action,
            created_at=rc.created_at,
        )

    def _serialize_report(self, report) -> ReportResponse:
        versions_sorted = sorted(
            report.versions or [], key=lambda v: v.version_number, reverse=True
        )
        latest_version = versions_sorted[0] if versions_sorted else None

        user_name = None
        user_email = None
        try:
            if hasattr(report, "user") and report.user:
                user_name = report.user.full_name
                user_email = report.user.email
        except Exception:
            pass

        project_name = None
        try:
            if hasattr(report, "project") and report.project:
                project_name = report.project.name
        except Exception:
            pass

        return ReportResponse(
            id=report.id,
            user_id=report.user_id,
            user_name=user_name,
            user_email=user_email,
            project_id=report.project_id,
            project_name=project_name,
            week_start=report.week_start,
            week_end=report.week_end,
            status=report.status,
            current_version=report.current_version,
            created_at=report.created_at,
            updated_at=report.updated_at,
            submitted_at=report.submitted_at,
            latest_version=self._serialize_version(latest_version) if latest_version else None,
            versions=[self._serialize_version(v) for v in versions_sorted],
            review_comments=[
                self._serialize_review_comment(rc) for rc in (report.review_comments or [])
            ],
        )

    async def create_report(
        self, request: ReportCreateRequest, current_user_id: int
    ) -> ReportResponse:
        if request.week_end < request.week_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="week_end must be on or after week_start",
            )

        duplicate = await self.report_repo.check_duplicate_week(
            user_id=current_user_id, week_start=request.week_start
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A report already exists for this week. Please edit the existing report.",
            )

        report_data = {
            "user_id": current_user_id,
            "project_id": request.project_id,
            "week_start": request.week_start,
            "week_end": request.week_end,
            "status": ReportStatus.DRAFT.value,
            "current_version": 1,
        }
        report = await self.report_repo.create(report_data)

        version_data = {
            "report_id": report.id,
            "version_number": 1,
            "tasks_completed": [t.model_dump() for t in request.tasks_completed],
            "tasks_planned": request.tasks_planned,
            "blockers": [b.model_dump() for b in request.blockers],
            "achievements": [a.model_dump() for a in request.achievements],
            "hours_breakdown": [h.model_dump() for h in request.hours_breakdown],
            "notes": request.notes,
        }
        await self.report_repo.create_version(version_data)

        report = await self.report_repo.get_by_id(report.id)
        return self._serialize_report(report)

    async def update_report(
        self, report_id: int, request: ReportUpdateRequest, current_user_id: int
    ) -> ReportResponse:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        if report.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own reports",
            )

        if report.status not in [
            ReportStatus.DRAFT.value,
            ReportStatus.NEEDS_CORRECTION.value,
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot edit report in status: {report.status}. Only Draft or Needs Correction reports are editable.",
            )

        latest_version = await self.report_repo.get_latest_version(report_id)
        if latest_version:
            latest_version.tasks_completed = [t.model_dump() for t in request.tasks_completed]
            latest_version.tasks_planned = request.tasks_planned
            latest_version.blockers = [b.model_dump() for b in request.blockers]
            latest_version.achievements = [a.model_dump() for a in request.achievements]
            latest_version.hours_breakdown = [h.model_dump() for h in request.hours_breakdown]
            latest_version.notes = request.notes

        update_data = {}
        if request.project_id is not None:
            update_data["project_id"] = request.project_id
        if update_data:
            await self.report_repo.update(report_id, update_data)

        report = await self.report_repo.get_by_id(report_id)
        return self._serialize_report(report)

    async def submit_report(
        self, report_id: int, current_user_id: int
    ) -> ReportResponse:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        if report.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit your own reports",
            )

        if report.status not in [
            ReportStatus.DRAFT.value,
            ReportStatus.NEEDS_CORRECTION.value,
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit report in status: {report.status}",
            )

        now = datetime.now(timezone.utc)

        if report.status == ReportStatus.NEEDS_CORRECTION.value:
            latest_version = await self.report_repo.get_latest_version(report_id)
            new_version_number = report.current_version + 1

            new_version_data = {
                "report_id": report_id,
                "version_number": new_version_number,
                "tasks_completed": latest_version.tasks_completed or [],
                "tasks_planned": latest_version.tasks_planned or "",
                "blockers": latest_version.blockers or [],
                "achievements": latest_version.achievements or [],
                "hours_breakdown": latest_version.hours_breakdown or [],
                "notes": latest_version.notes or "",
                "submitted_at": now,
            }
            await self.report_repo.create_version(new_version_data)

            await self.report_repo.update(
                report_id,
                {
                    "status": ReportStatus.SUBMITTED.value,
                    "current_version": new_version_number,
                    "submitted_at": now,
                },
            )
        else:
            latest_version = await self.report_repo.get_latest_version(report_id)
            if latest_version:
                latest_version.submitted_at = now

            await self.report_repo.update(
                report_id,
                {
                    "status": ReportStatus.SUBMITTED.value,
                    "submitted_at": now,
                },
            )

        report = await self.report_repo.get_by_id(report_id)
        return self._serialize_report(report)

    async def get_report_by_id(
        self, report_id: int, current_user
    ) -> ReportResponse:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        is_manager = current_user.role in [
            UserRole.MANAGER.value,
            UserRole.ADMIN.value,
        ]
        if not is_manager and report.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this report",
            )

        return self._serialize_report(report)

    async def get_my_reports(
        self,
        current_user_id: int,
        page: int = 1,
        limit: int = 20,
        status_filter: Optional[ReportStatus] = None,
    ) -> ReportListResponse:
        skip = (page - 1) * limit
        reports, total = await self.report_repo.get_all(
            skip=skip,
            limit=limit,
            user_id=current_user_id,
            status=status_filter,
        )

        return ReportListResponse(
            reports=[self._serialize_report(r) for r in reports],
            total=total,
            page=page,
            limit=limit,
        )

    async def get_team_reports(
        self,
        page: int = 1,
        limit: int = 20,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        status_filter: Optional[ReportStatus] = None,
        week_start: Optional[date] = None,
        week_end: Optional[date] = None,
    ) -> ReportListResponse:
        skip = (page - 1) * limit
        reports, total = await self.report_repo.get_all(
            skip=skip,
            limit=limit,
            user_id=user_id,
            project_id=project_id,
            status=status_filter,
            week_start=week_start,
            week_end=week_end,
        )

        filtered = [r for r in reports if r.status != ReportStatus.DRAFT.value]

        return ReportListResponse(
            reports=[self._serialize_report(r) for r in filtered],
            total=len(filtered),
            page=page,
            limit=limit,
        )

    async def get_versions(
        self, report_id: int, current_user
    ) -> List[ReportVersionResponse]:
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )

        is_manager = current_user.role in [
            UserRole.MANAGER.value,
            UserRole.ADMIN.value,
        ]
        if not is_manager and report.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

        versions = await self.report_repo.get_versions(report_id)
        return [self._serialize_version(v) for v in versions]