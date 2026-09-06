from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field("", max_length=1000)
    color: str = Field("#3B82F6", pattern="^#[0-9A-Fa-f]{6}$")


class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class ProjectMemberRequest(BaseModel):
    user_ids: List[int]


class MemberBasicResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    color: str
    is_active: bool
    created_at: datetime
    members: List[MemberBasicResponse] = []

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    limit: int