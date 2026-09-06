from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date

from app.core.dependencies import get_db, get_current_user, require_manager
from app.application.services.report_service import ReportService
from app.application.services.review_service import ReviewService
from app.application.schemas.report import (
    ReportCreateRequest,
    ReportUpdateRequest,
    ReportResponse,
    ReportListResponse,
    ReportVersionResponse,
)
from app.application.schemas.review import ReviewRequest, ApproveRequest
from app.domain.enums import ReportStatus

router = APIRouter(prefix="/api/reports", tags=["Reports"])


# ─── Team Member Endpoints ─────────────────────────────

@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(
    request: ReportCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    return await service.create_report(request, current_user.id)


@router.get("/my", response_model=ReportListResponse)
async def get_my_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    status_enum = None
    if status_filter:
        try:
            status_enum = ReportStatus(status_filter)
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(400, f"Invalid status: {status_filter}")

    return await service.get_my_reports(
        current_user_id=current_user.id,
        page=page,
        limit=limit,
        status_filter=status_enum,
    )


# ─── Manager Endpoints ─────────────────────────────

@router.get("/team", response_model=ReportListResponse)
async def get_team_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    week_start: Optional[date] = None,
    week_end: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ReportService(db)
    status_enum = None
    if status_filter:
        try:
            status_enum = ReportStatus(status_filter)
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(400, f"Invalid status: {status_filter}")

    return await service.get_team_reports(
        page=page,
        limit=limit,
        user_id=user_id,
        project_id=project_id,
        status_filter=status_enum,
        week_start=week_start,
        week_end=week_end,
    )


# ─── Common Endpoints (RBAC inside service) ──────────

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    return await service.get_report_by_id(report_id, current_user)


@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    request: ReportUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    return await service.update_report(report_id, request, current_user.id)


@router.post("/{report_id}/submit", response_model=ReportResponse)
async def submit_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    return await service.submit_report(report_id, current_user.id)


@router.get("/{report_id}/versions", response_model=list[ReportVersionResponse])
async def get_report_versions(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ReportService(db)
    return await service.get_versions(report_id, current_user)


# ─── Manager Review Actions ─────────────────────────

@router.post("/{report_id}/approve", response_model=ReportResponse)
async def approve_report(
    report_id: int,
    request: ApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_manager()),
):
    service = ReviewService(db)
    return await service.approve_report(report_id, request, current_user.id)


@router.post("/{report_id}/request-changes", response_model=ReportResponse)
async def request_changes(
    report_id: int,
    request: ReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_manager()),
):
    service = ReviewService(db)
    return await service.request_changes(report_id, request, current_user.id)