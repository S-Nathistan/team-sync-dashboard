import asyncio
from datetime import date, datetime, timedelta, timezone
import random

from app.infrastructure.database import async_session_factory, create_tables
from app.infrastructure.models.user import UserModel
from app.infrastructure.models.project import ProjectModel
from app.infrastructure.models.project_member import ProjectMemberModel
from app.infrastructure.models.report import ReportModel
from app.infrastructure.models.report_version import ReportVersionModel
from app.infrastructure.models.review_comment import ReviewCommentModel
from app.core.security import hash_password
from app.domain.enums import UserRole, ReportStatus, ReviewAction

from sqlalchemy import delete


async def clear_all(session):
    await session.execute(delete(ReviewCommentModel))
    await session.execute(delete(ReportVersionModel))
    await session.execute(delete(ReportModel))
    await session.execute(delete(ProjectMemberModel))
    await session.execute(delete(ProjectModel))
    await session.execute(delete(UserModel))
    await session.commit()


async def seed():
    await create_tables()

    async with async_session_factory() as session:
        print("Clearing old data…")
        await clear_all(session)

        print("Creating users…")
        admin = UserModel(
            email="admin@example.com",
            username="admin",
            full_name="System Admin",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN.value,
        )
        manager = UserModel(
            email="manager@example.com",
            username="manager",
            full_name="Sarah Manager",
            hashed_password=hash_password("manager123"),
            role=UserRole.MANAGER.value,
        )

        members_data = [
            ("alice@example.com", "alice", "Alice Johnson"),
            ("bob@example.com", "bob", "Bob Smith"),
            ("charlie@example.com", "charlie", "Charlie Davis"),
            ("diana@example.com", "diana", "Diana Wilson"),
            ("evan@example.com", "evan", "Evan Brown"),
        ]
        members = [
            UserModel(
                email=e,
                username=u,
                full_name=n,
                hashed_password=hash_password("member123"),
                role=UserRole.TEAM_MEMBER.value,
            )
            for e, u, n in members_data
        ]

        session.add_all([admin, manager, *members])
        await session.flush()

        print("Creating projects…")
        projects_data = [
            ("Client A - Portal", "Client A's customer portal", "#3B82F6"),
            ("Internal Tooling", "In-house developer tools", "#10B981"),
            ("R&D", "Research and prototyping", "#F59E0B"),
            ("Marketing Site", "Marketing website revamp", "#EF4444"),
        ]
        projects = [
            ProjectModel(name=n, description=d, color=c)
            for n, d, c in projects_data
        ]
        session.add_all(projects)
        await session.flush()

        for m in members:
            session.add(ProjectMemberModel(project_id=projects[0].id, user_id=m.id))
            session.add(ProjectMemberModel(project_id=projects[1].id, user_id=m.id))
        await session.flush()

        print("Creating reports…")
        today = date.today()
        current_week_start = today - timedelta(days=today.weekday())

        sample_tasks_pool = [
            ("Implement user login flow", "high", "development", 8, 7.5),
            ("Fix pagination bug", "medium", "development", 3, 3.5),
            ("Write unit tests", "medium", "testing", 5, 5),
            ("Sprint planning meeting", "low", "meetings", 2, 2),
            ("Code review PRs", "medium", "review", 3, 3.5),
            ("Design DB schema", "high", "planning", 4, 4),
            ("Update API docs", "low", "documentation", 2, 1.5),
            ("Research new library", "low", "research", 3, 4),
            ("Client demo prep", "high", "meetings", 4, 5),
            ("Refactor auth module", "high", "development", 10, 12),
        ]

        blocker_samples = [
            "Waiting on API access from client",
            "Blocked on design assets",
            "Need clarification on requirements",
            "Test environment is down",
            "Dependency on another team's PR",
        ]

        achievement_samples = [
            "Shipped feature ahead of schedule",
            "Reduced page load time by 40%",
            "Onboarded new team member",
            "Closed 12 tickets this week",
            "Wrote comprehensive test suite",
        ]

        for week_offset in range(4, 0, -1):
            week_start = current_week_start - timedelta(weeks=week_offset - 1)
            week_end = week_start + timedelta(days=6)
            days_ago = (week_offset - 1) * 7

            for idx, member in enumerate(members):
                if week_offset == 1:
                    if idx == 0:
                        status = ReportStatus.DRAFT.value
                    elif idx == 1:
                        status = ReportStatus.SUBMITTED.value
                    elif idx == 2:
                        status = ReportStatus.NEEDS_CORRECTION.value
                    elif idx == 3:
                        status = ReportStatus.APPROVED.value
                    else:
                        continue
                else:
                    status = ReportStatus.APPROVED.value

                submission_time = (
                    datetime.now(timezone.utc) - timedelta(days=days_ago + 2, hours=random.randint(1, 8))
                    if status != ReportStatus.DRAFT.value
                    else None
                )

                project = random.choice(projects[:3])
                report = ReportModel(
                    user_id=member.id,
                    project_id=project.id,
                    week_start=week_start,
                    week_end=week_end,
                    status=status,
                    current_version=1,
                    submitted_at=submission_time,
                )
                session.add(report)
                await session.flush()

                num_tasks = random.randint(3, 5)
                tasks = []
                for t in random.sample(sample_tasks_pool, num_tasks):
                    name, prio, ttype, planned_h, spent_h = t
                    tasks.append(
                        {
                            "task_name": name,
                            "priority": prio,
                            "planned_percentage": 100,
                            "actual_percentage": random.choice([80, 90, 100, 100]),
                            "status": random.choice(["completed", "completed", "in_progress"]),
                            "time_planned_hours": planned_h,
                            "time_spent_hours": spent_h,
                            "output_deliverable": "PR merged / doc updated",
                        }
                    )

                blockers = [
                    {"description": random.choice(blocker_samples), "is_key_issue": i == 0}
                    for i in range(random.randint(0, 2))
                ]

                achievements = [
                    {"description": random.choice(achievement_samples), "is_key_achievement": i == 0}
                    for i in range(random.randint(1, 2))
                ]

                hours_breakdown = [
                    {"task_type": "development", "hours": random.randint(15, 25)},
                    {"task_type": "meetings", "hours": random.randint(2, 6)},
                    {"task_type": "testing", "hours": random.randint(2, 6)},
                    {"task_type": "documentation", "hours": random.randint(1, 3)},
                ]

                v1 = ReportVersionModel(
                    report_id=report.id,
                    version_number=1,
                    tasks_completed=tasks,
                    tasks_planned="Continue sprint tickets and milestones.",
                    blockers=blockers,
                    achievements=achievements,
                    hours_breakdown=hours_breakdown,
                    notes="",
                    submitted_at=report.submitted_at,
                )
                session.add(v1)
                await session.flush()

                if status == ReportStatus.APPROVED.value and submission_time:
                    review_time = submission_time + timedelta(hours=random.randint(3, 12))
                    session.add(
                        ReviewCommentModel(
                            report_id=report.id,
                            reviewer_id=manager.id,
                            version_number=1,
                            comment="Great progress this week, approved!",
                            action=ReviewAction.APPROVED.value,
                            created_at=review_time,
                        )
                    )
                elif status == ReportStatus.NEEDS_CORRECTION.value and submission_time:
                    review_time = submission_time + timedelta(hours=random.randint(1, 4))
                    session.add(
                        ReviewCommentModel(
                            report_id=report.id,
                            reviewer_id=manager.id,
                            version_number=1,
                            comment="Please provide more details in the blockers section.",
                            action=ReviewAction.NEEDS_CORRECTION.value,
                            created_at=review_time,
                        )
                    )

        await session.commit()
        print("\n✅ Clean Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())