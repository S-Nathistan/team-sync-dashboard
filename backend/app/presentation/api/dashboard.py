from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date

from app.core.dependencies import get_db, require_manager
from app.application.services.dashboard_service import DashboardService
from app.application.schemas.dashboard import (
    DashboardSummary,
    DashboardChartsResponse,
    TasksTrendData,
    SubmissionStatusData,
    WorkloadData,
    TimeDistributionData,
    ActivityFeedItem,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_summary()


@router.get("/charts", response_model=DashboardChartsResponse)
async def get_all_charts(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_charts()


@router.get("/charts/tasks-trend", response_model=list[TasksTrendData])
async def get_tasks_trend(
    weeks: int = Query(8, ge=1, le=52),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_tasks_trend(weeks=weeks)


@router.get("/charts/submission-status", response_model=list[SubmissionStatusData])
async def get_submission_status(
    week_start: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_submission_status_by_member(week_start=week_start)


@router.get("/charts/workload", response_model=list[WorkloadData])
async def get_workload(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_workload_by_project()


@router.get("/charts/time-distribution", response_model=list[TimeDistributionData])
async def get_time_distribution(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_time_distribution()


@router.get("/activity-feed", response_model=list[ActivityFeedItem])
async def get_activity_feed(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = DashboardService(db)
    return await service.get_activity_feed(limit=limit)