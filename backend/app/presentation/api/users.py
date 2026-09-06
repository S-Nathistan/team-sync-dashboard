from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user, require_admin, require_manager
from app.application.services.user_service import UserService
from app.application.schemas.user import (
    UserResponse,
    UserUpdateRequest,
    UserRoleUpdateRequest,
    UserListResponse,
)

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = UserService(db)
    return await service.get_all_users(page=page, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = UserService(db)
    return await service.get_user_by_id(user_id)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Users can update themselves; admins can update anyone
    from app.domain.enums import UserRole
    if current_user.id != user_id and current_user.role != UserRole.ADMIN.value:
        from fastapi import HTTPException, status as st
        raise HTTPException(
            status_code=st.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )
    service = UserService(db)
    return await service.update_user(user_id, request, current_user.id)


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    request: UserRoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin()),
):
    service = UserService(db)
    return await service.update_role(user_id, request)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin()),
):
    service = UserService(db)
    return await service.delete_user(user_id)