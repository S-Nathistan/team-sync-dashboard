from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, hash_password
from app.infrastructure.repositories.user_repository import UserRepository
from app.application.schemas.user import (
    UserResponse,
    UserUpdateRequest,
    UserRoleUpdateRequest,
    UserListResponse,
)
from app.domain.enums import UserRole


class UserService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def get_all_users(
        self, page: int = 1, limit: int = 20
    ) -> UserListResponse:
        skip = (page - 1) * limit
        users, total = await self.user_repo.get_all(skip=skip, limit=limit)

        return UserListResponse(
            users=[UserResponse.model_validate(u) for u in users],
            total=total,
            page=page,
            limit=limit,
        )

    async def get_user_by_id(self, user_id: int) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return UserResponse.model_validate(user)

    async def update_user(
        self, user_id: int, request: UserUpdateRequest, current_user_id: int
    ) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        update_data = request.model_dump(exclude_unset=True)

        # Check unique email constraint
        if "email" in update_data and update_data["email"]:
            existing = await self.user_repo.get_by_email(update_data["email"])
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use",
                )

        # Check unique username constraint
        if "username" in update_data and update_data["username"]:
            existing = await self.user_repo.get_by_username(update_data["username"])
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken",
                )

        # Password update validation
        if update_data.get("new_password"):
            if not update_data.get("current_password"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password",
                )
            if not verify_password(update_data["current_password"], user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect",
                )
            update_data["hashed_password"] = hash_password(update_data["new_password"])

        # Remove raw password keys before updating DB
        update_data.pop("current_password", None)
        update_data.pop("new_password", None)

        updated_user = await self.user_repo.update(user_id, update_data)
        return UserResponse.model_validate(updated_user)

    async def update_role(
        self, user_id: int, request: UserRoleUpdateRequest
    ) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if request.role not in [r.value for r in UserRole]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role",
            )

        updated_user = await self.user_repo.update(user_id, {"role": request.role})
        return UserResponse.model_validate(updated_user)

    async def delete_user(self, user_id: int) -> dict:
        success = await self.user_repo.delete(user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return {"message": "User deleted successfully"}