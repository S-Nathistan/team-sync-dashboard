import enum


class UserRole(str, enum.Enum):
    TEAM_MEMBER = "team_member"
    MANAGER = "manager"
    ADMIN = "admin"


class ReportStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    NEEDS_CORRECTION = "needs_correction"
    APPROVED = "approved"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    DEFERRED = "deferred"


class TaskType(str, enum.Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    MEETINGS = "meetings"
    DOCUMENTATION = "documentation"
    REVIEW = "review"
    PLANNING = "planning"
    RESEARCH = "research"
    OTHER = "other"


class ReviewAction(str, enum.Enum):
    APPROVED = "approved"
    NEEDS_CORRECTION = "needs_correction"