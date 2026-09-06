from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6, max_length=128)


class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., pattern="^(team_member|manager|admin)$")


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int