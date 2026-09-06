from datetime import datetime, timedelta, date, timezone
from typing import Optional, List
from collections import defaultdict
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.models.user import UserModel
from app.infrastructure.models.report import ReportModel
from app.infrastructure.models.report_version import ReportVersionModel
from app.infrastructure.models.review_comment import ReviewCommentModel
from app.infrastructure.models.project import ProjectModel
from app.application.schemas.dashboard import (
    DashboardSummary,
    TasksTrendData,
    SubmissionStatusData,
    WorkloadData,
    TimeDistributionData,
    ActivityFeedItem,
    DashboardChartsResponse,
)
from app.domain.enums import ReportStatus, UserRole


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _get_current_week_range(self):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        return week_start, week_end

    async def get_summary(self) -> DashboardSummary:
        week_start, week_end = self._get_current_week_range()

        team_count_result = await self.db.execute(
            select(func.count(UserModel.id)).where(
                UserModel.role == UserRole.TEAM_MEMBER.value,
                UserModel.is_active == True,
            )
        )
        total_team_members = team_count_result.scalar() or 0

        reports_this_week_result = await self.db.execute(
            select(ReportModel).where(
                and_(
                    ReportModel.week_start == week_start,
                    ReportModel.status != ReportStatus.DRAFT.value,
                )
            )
        )
        reports_this_week = list(reports_this_week_result.scalars().all())
        total_reports_this_week = len(reports_this_week)

        all_reports_result = await self.db.execute(select(ReportModel))
        all_reports = list(all_reports_result.scalars().all())

        total_submitted = sum(1 for r in all_reports if r.status == ReportStatus.SUBMITTED.value)
        total_needs_correction = sum(
            1 for r in all_reports if r.status == ReportStatus.NEEDS_CORRECTION.value
        )
        total_approved = sum(1 for r in all_reports if r.status == ReportStatus.APPROVED.value)
        total_draft = sum(1 for r in all_reports if r.status == ReportStatus.DRAFT.value)

        submitted_user_ids = {r.user_id for r in reports_this_week}
        total_pending = max(0, total_team_members - len(submitted_user_ids))

        compliance_rate = 0.0
        if total_team_members > 0:
            compliance_rate = round(
                (len(submitted_user_ids) / total_team_members) * 100, 1
            )

        active_reports_result = await self.db.execute(
            select(ReportVersionModel)
            .join(ReportModel, ReportModel.id == ReportVersionModel.report_id)
            .where(
                ReportModel.status.in_(
                    [
                        ReportStatus.SUBMITTED.value,
                        ReportStatus.NEEDS_CORRECTION.value,
                    ]
                ),
                ReportVersionModel.version_number == ReportModel.current_version,
            )
        )
        active_versions = list(active_reports_result.scalars().all())
        open_blockers_count = sum(
            len(v.blockers or []) for v in active_versions
        )

        return DashboardSummary(
            total_reports_this_week=total_reports_this_week,
            total_submitted=total_submitted,
            total_pending=total_pending,
            total_needs_correction=total_needs_correction,
            total_approved=total_approved,
            total_draft=total_draft,
            submission_compliance_rate=compliance_rate,
            open_blockers_count=open_blockers_count,
            total_team_members=total_team_members,
        )

    async def get_tasks_trend(self, weeks: int = 8) -> List[TasksTrendData]:
        today = date.today()
        start_date = today - timedelta(weeks=weeks)

        result = await self.db.execute(
            select(ReportModel, ReportVersionModel)
            .join(ReportVersionModel, ReportVersionModel.report_id == ReportModel.id)
            .where(
                ReportModel.week_start >= start_date,
                ReportVersionModel.version_number == ReportModel.current_version,
                ReportModel.status != ReportStatus.DRAFT.value,
            )
        )
        rows = list(result.all())

        week_counts = defaultdict(int)
        for report, version in rows:
            week_key = report.week_start.isoformat()
            tasks = version.tasks_completed or []
            completed_count = sum(
                1 for t in tasks if t.get("status") == "completed"
            )
            week_counts[week_key] += completed_count

        sorted_weeks = sorted(week_counts.keys())
        return [
            TasksTrendData(week=w, tasks_completed=week_counts[w])
            for w in sorted_weeks
        ]

    async def get_submission_status_by_member(
        self, week_start: Optional[date] = None
    ) -> List[SubmissionStatusData]:
        if week_start is None:
            week_start, _ = self._get_current_week_range()

        users_result = await self.db.execute(
            select(UserModel).where(
                UserModel.role == UserRole.TEAM_MEMBER.value,
                UserModel.is_active == True,
            )
        )
        users = list(users_result.scalars().all())

        reports_result = await self.db.execute(
            select(ReportModel).where(ReportModel.week_start == week_start)
        )
        reports = list(reports_result.scalars().all())
        reports_by_user = {r.user_id: r for r in reports}

        data = []
        for user in users:
            report = reports_by_user.get(user.id)
            item = SubmissionStatusData(user_name=user.full_name, user_id=user.id)
            if report is None:
                item.not_started = 1
            elif report.status == ReportStatus.DRAFT.value:
                item.draft = 1
            elif report.status == ReportStatus.SUBMITTED.value:
                item.submitted = 1
            elif report.status == ReportStatus.NEEDS_CORRECTION.value:
                item.needs_correction = 1
            elif report.status == ReportStatus.APPROVED.value:
                item.approved = 1
            data.append(item)

        return data

    async def get_workload_by_project(self) -> List[WorkloadData]:
        cutoff = date.today() - timedelta(weeks=4)

        result = await self.db.execute(
            select(ProjectModel, ReportModel, ReportVersionModel)
            .join(ReportModel, ReportModel.project_id == ProjectModel.id)
            .join(ReportVersionModel, ReportVersionModel.report_id == ReportModel.id)
            .where(
                ReportModel.week_start >= cutoff,
                ReportVersionModel.version_number == ReportModel.current_version,
                ReportModel.status != ReportStatus.DRAFT.value,
            )
        )
        rows = list(result.all())

        project_stats = defaultdict(lambda: {"tasks": 0, "hours": 0.0})
        for project, report, version in rows:
            tasks = version.tasks_completed or []
            project_stats[project.name]["tasks"] += len(tasks)
            project_stats[project.name]["hours"] += sum(
                float(t.get("time_spent_hours", 0) or 0) for t in tasks
            )

        return [
            WorkloadData(
                project_name=name,
                task_count=stats["tasks"],
                total_hours=round(stats["hours"], 1),
            )
            for name, stats in project_stats.items()
        ]

    async def get_time_distribution(self) -> List[TimeDistributionData]:
        cutoff = date.today() - timedelta(weeks=4)

        result = await self.db.execute(
            select(ReportModel, ReportVersionModel)
            .join(ReportVersionModel, ReportVersionModel.report_id == ReportModel.id)
            .where(
                ReportModel.week_start >= cutoff,
                ReportVersionModel.version_number == ReportModel.current_version,
                ReportModel.status != ReportStatus.DRAFT.value,
            )
        )
        rows = list(result.all())

        type_hours = defaultdict(float)
        for _, version in rows:
            for entry in version.hours_breakdown or []:
                t_type = entry.get("task_type", "other")
                hours = float(entry.get("hours", 0) or 0)
                type_hours[t_type] += hours

        return [
            TimeDistributionData(task_type=k, total_hours=round(v, 1))
            for k, v in type_hours.items()
        ]

    async def get_activity_feed(self, limit: int = 20) -> List[ActivityFeedItem]:
        items = []

        submissions_result = await self.db.execute(
            select(ReportModel)
            .options(selectinload(ReportModel.user))
            .where(ReportModel.submitted_at.isnot(None))
            .order_by(ReportModel.submitted_at.desc())
            .limit(limit)
        )
        for report in submissions_result.scalars().all():
            if report.user and report.submitted_at:
                items.append(
                    ActivityFeedItem(
                        id=report.id,
                        report_id=report.id,
                        user_name=report.user.full_name,
                        action="submitted",
                        detail=f"submitted report for week of {report.week_start.strftime('%b %d')}",
                        timestamp=report.submitted_at,
                    )
                )

        reviews_result = await self.db.execute(
            select(ReviewCommentModel)
            .options(
                selectinload(ReviewCommentModel.reviewer),
                selectinload(ReviewCommentModel.report).selectinload(ReportModel.user),
            )
            .order_by(ReviewCommentModel.created_at.desc())
            .limit(limit)
        )
        for rc in reviews_result.scalars().all():
            reviewer_name = rc.reviewer.full_name if rc.reviewer else "Manager"
            author_name = rc.report.user.full_name if (rc.report and rc.report.user) else "a member"
            week_str = rc.report.week_start.strftime('%b %d') if rc.report else ""

            if rc.action == "approved":
                action_text = f"approved {author_name}'s report ({week_str})"
            else:
                action_text = f"requested changes on {author_name}'s report ({week_str})"

            items.append(
                ActivityFeedItem(
                    id=rc.id,
                    report_id=rc.report_id,
                    user_name=reviewer_name,
                    action=rc.action,
                    detail=action_text,
                    timestamp=rc.created_at,
                )
            )

        items.sort(key=lambda x: x.timestamp, reverse=True)
        return items[:limit]

    async def get_charts(self) -> DashboardChartsResponse:
        return DashboardChartsResponse(
            tasks_trend=await self.get_tasks_trend(),
            submission_status=await self.get_submission_status_by_member(),
            workload=await self.get_workload_by_project(),
            time_distribution=await self.get_time_distribution(),
            activity_feed=await self.get_activity_feed(),
        )