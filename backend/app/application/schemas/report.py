from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class TaskEntrySchema(BaseModel):
    task_name: str = Field(..., min_length=1, max_length=500)
    priority: str = Field(..., pattern="^(low|medium|high|critical)$")
    planned_percentage: float = Field(..., ge=0, le=100)
    actual_percentage: float = Field(..., ge=0, le=100)
    status: str = Field(
        ...,
        pattern="^(not_started|in_progress|completed|blocked|deferred)$",
    )
    time_planned_hours: float = Field(..., ge=0)
    time_spent_hours: float = Field(..., ge=0)
    output_deliverable: str = ""


class BlockerEntrySchema(BaseModel):
    description: str = Field(..., min_length=1, max_length=1000)
    is_key_issue: bool = False


class AchievementEntrySchema(BaseModel):
    description: str = Field(..., min_length=1, max_length=1000)
    is_key_achievement: bool = False


class HoursBreakdownSchema(BaseModel):
    task_type: str = Field(
        ...,
        pattern="^(development|testing|meetings|documentation|review|planning|research|other)$",
    )
    hours: float = Field(..., ge=0)


class ReportCreateRequest(BaseModel):
    project_id: Optional[int] = None
    week_start: date
    week_end: date
    tasks_completed: List[TaskEntrySchema] = []
    tasks_planned: str = ""
    blockers: List[BlockerEntrySchema] = []
    achievements: List[AchievementEntrySchema] = []
    hours_breakdown: List[HoursBreakdownSchema] = []
    notes: str = ""


class ReportUpdateRequest(BaseModel):
    project_id: Optional[int] = None
    tasks_completed: List[TaskEntrySchema] = []
    tasks_planned: str = ""
    blockers: List[BlockerEntrySchema] = []
    achievements: List[AchievementEntrySchema] = []
    hours_breakdown: List[HoursBreakdownSchema] = []
    notes: str = ""


class ReportVersionResponse(BaseModel):
    id: int
    version_number: int
    tasks_completed: list = []
    tasks_planned: str = ""
    blockers: list = []
    achievements: list = []
    hours_breakdown: list = []
    notes: str = ""
    submitted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCommentResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewer_name: Optional[str] = None
    version_number: int
    comment: str
    action: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    week_start: date
    week_end: date
    status: str
    current_version: int
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    latest_version: Optional[ReportVersionResponse] = None
    versions: List[ReportVersionResponse] = []
    review_comments: List[ReviewCommentResponse] = []

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int
    page: int
    limit: int