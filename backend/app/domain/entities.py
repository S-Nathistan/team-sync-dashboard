from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional, List
from app.domain.enums import (
    UserRole,
    ReportStatus,
    Priority,
    TaskStatus,
    TaskType,
    ReviewAction,
)


@dataclass
class TaskEntry:
    task_name: str
    priority: Priority
    planned_percentage: float
    actual_percentage: float
    status: TaskStatus
    time_planned_hours: float
    time_spent_hours: float
    output_deliverable: str = ""


@dataclass
class BlockerEntry:
    description: str
    is_key_issue: bool = False


@dataclass
class AchievementEntry:
    description: str
    is_key_achievement: bool = False


@dataclass
class HoursBreakdownEntry:
    task_type: TaskType
    hours: float


@dataclass
class User:
    id: Optional[int] = None
    email: str = ""
    username: str = ""
    full_name: str = ""
    role: UserRole = UserRole.TEAM_MEMBER
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Project:
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    color: str = "#3B82F6"
    is_active: bool = True
    created_at: Optional[datetime] = None


@dataclass
class Report:
    id: Optional[int] = None
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    week_start: Optional[date] = None
    week_end: Optional[date] = None
    status: ReportStatus = ReportStatus.DRAFT
    current_version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None


@dataclass
class ReportVersion:
    id: Optional[int] = None
    report_id: Optional[int] = None
    version_number: int = 1
    tasks_completed: List[TaskEntry] = field(default_factory=list)
    tasks_planned: str = ""
    blockers: List[BlockerEntry] = field(default_factory=list)
    achievements: List[AchievementEntry] = field(default_factory=list)
    hours_breakdown: List[HoursBreakdownEntry] = field(default_factory=list)
    notes: str = ""
    submitted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


@dataclass
class ReviewComment:
    id: Optional[int] = None
    report_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    version_number: int = 1
    comment: str = ""
    action: ReviewAction = ReviewAction.NEEDS_CORRECTION
    created_at: Optional[datetime] = None