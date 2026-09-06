from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


class DashboardSummary(BaseModel):
    total_reports_this_week: int = 0
    total_submitted: int = 0
    total_pending: int = 0
    total_needs_correction: int = 0
    total_approved: int = 0
    total_draft: int = 0
    submission_compliance_rate: float = 0.0
    open_blockers_count: int = 0
    total_team_members: int = 0


class TasksTrendData(BaseModel):
    week: str
    tasks_completed: int = 0
    user_name: Optional[str] = None


class SubmissionStatusData(BaseModel):
    user_name: str
    user_id: int
    draft: int = 0
    submitted: int = 0
    needs_correction: int = 0
    approved: int = 0
    not_started: int = 0


class WorkloadData(BaseModel):
    project_name: str
    task_count: int = 0
    total_hours: float = 0.0


class TimeDistributionData(BaseModel):
    task_type: str
    total_hours: float = 0.0


class ActivityFeedItem(BaseModel):
    id: int
    report_id: int
    user_name: str
    action: str  # submitted, approved, needs_correction, created
    detail: str = ""
    timestamp: datetime


class DashboardChartsResponse(BaseModel):
    tasks_trend: List[TasksTrendData] = []
    submission_status: List[SubmissionStatusData] = []
    workload: List[WorkloadData] = []
    time_distribution: List[TimeDistributionData] = []
    activity_feed: List[ActivityFeedItem] = []