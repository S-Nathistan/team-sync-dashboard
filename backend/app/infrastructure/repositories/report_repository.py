from typing import Optional, List, Tuple
from datetime import date
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.repositories import ReportRepositoryInterface
from app.domain.enums import ReportStatus
from app.infrastructure.models.report import ReportModel
from app.infrastructure.models.report_version import ReportVersionModel


class ReportRepository(ReportRepositoryInterface):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, report_data: dict) -> ReportModel:
        report = ReportModel(**report_data)
        self.db.add(report)
        await self.db.flush()
        await self.db.refresh(report)
        return report

    async def get_by_id(self, report_id: int) -> Optional[ReportModel]:
        result = await self.db.execute(
            select(ReportModel)
            .options(
                selectinload(ReportModel.user),
                selectinload(ReportModel.project),
                selectinload(ReportModel.versions),
                selectinload(ReportModel.review_comments),
            )
            .where(ReportModel.id == report_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> Tuple[List[ReportModel], int]:
        count_result = await self.db.execute(
            select(func.count(ReportModel.id)).where(
                ReportModel.user_id == user_id
            )
        )
        total = count_result.scalar()

        result = await self.db.execute(
            select(ReportModel)
            .options(
                selectinload(ReportModel.project),
                selectinload(ReportModel.versions),
                selectinload(ReportModel.review_comments),
            )
            .where(ReportModel.user_id == user_id)
            .order_by(ReportModel.week_start.desc())
            .offset(skip)
            .limit(limit)
        )
        reports = list(result.scalars().all())
        return reports, total

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        status: Optional[ReportStatus] = None,
        week_start: Optional[date] = None,
        week_end: Optional[date] = None,
    ) -> Tuple[List[ReportModel], int]:
        # Build filter conditions
        conditions = []
        if user_id is not None:
            conditions.append(ReportModel.user_id == user_id)
        if project_id is not None:
            conditions.append(ReportModel.project_id == project_id)
        if status is not None:
            conditions.append(ReportModel.status == status.value)
        if week_start is not None:
            conditions.append(ReportModel.week_start >= week_start)
        if week_end is not None:
            conditions.append(ReportModel.week_end <= week_end)

        # Exclude drafts from manager view (they should only see submitted+)
        # This will be handled at service level, not here

        where_clause = and_(*conditions) if conditions else True

        count_result = await self.db.execute(
            select(func.count(ReportModel.id)).where(where_clause)
        )
        total = count_result.scalar()

        result = await self.db.execute(
            select(ReportModel)
            .options(
                selectinload(ReportModel.user),
                selectinload(ReportModel.project),
                selectinload(ReportModel.versions),
                selectinload(ReportModel.review_comments),
            )
            .where(where_clause)
            .order_by(ReportModel.week_start.desc(), ReportModel.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        reports = list(result.scalars().all())
        return reports, total

    async def update(self, report_id: int, data: dict) -> Optional[ReportModel]:
        report = await self.get_by_id(report_id)
        if not report:
            return None
        for key, value in data.items():
            setattr(report, key, value)
        await self.db.flush()
        await self.db.refresh(report)
        return report

    async def create_version(self, version_data: dict) -> ReportVersionModel:
        version = ReportVersionModel(**version_data)
        self.db.add(version)
        await self.db.flush()
        await self.db.refresh(version)
        return version

    async def get_versions(self, report_id: int) -> List[ReportVersionModel]:
        result = await self.db.execute(
            select(ReportVersionModel)
            .where(ReportVersionModel.report_id == report_id)
            .order_by(ReportVersionModel.version_number.desc())
        )
        return list(result.scalars().all())

    async def get_latest_version(
        self, report_id: int
    ) -> Optional[ReportVersionModel]:
        result = await self.db.execute(
            select(ReportVersionModel)
            .where(ReportVersionModel.report_id == report_id)
            .order_by(ReportVersionModel.version_number.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def check_duplicate_week(
        self, user_id: int, week_start: date, exclude_report_id: Optional[int] = None
    ) -> bool:
        conditions = [
            ReportModel.user_id == user_id,
            ReportModel.week_start == week_start,
        ]
        if exclude_report_id:
            conditions.append(ReportModel.id != exclude_report_id)

        result = await self.db.execute(
            select(func.count(ReportModel.id)).where(and_(*conditions))
        )
        count = result.scalar()
        return count > 0