from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user, require_manager
from app.application.services.project_service import ProjectService
from app.application.schemas.project import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectMemberRequest,
    ProjectResponse,
    ProjectListResponse,
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),  # Any authenticated user can view
):
    service = ProjectService(db)
    return await service.get_all_projects(page=page, limit=limit)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    service = ProjectService(db)
    return await service.get_project_by_id(project_id)


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    request: ProjectCreateRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ProjectService(db)
    return await service.create_project(request)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    request: ProjectUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ProjectService(db)
    return await service.update_project(project_id, request)


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ProjectService(db)
    return await service.delete_project(project_id)


@router.post("/{project_id}/members", response_model=ProjectResponse)
async def add_members(
    project_id: int,
    request: ProjectMemberRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ProjectService(db)
    return await service.add_members(project_id, request)


@router.delete("/{project_id}/members/{user_id}", response_model=ProjectResponse)
async def remove_member(
    project_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    service = ProjectService(db)
    return await service.remove_member(project_id, user_id)