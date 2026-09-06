from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.project_repository import ProjectRepository
from app.application.schemas.project import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectMemberRequest,
    ProjectResponse,
    ProjectListResponse,
    MemberBasicResponse,
)


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.project_repo = ProjectRepository(db)

    async def create_project(self, request: ProjectCreateRequest) -> ProjectResponse:
        project_data = request.model_dump()
        project = await self.project_repo.create(project_data)
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            color=project.color,
            is_active=project.is_active,
            created_at=project.created_at,
            members=[],
        )

    async def get_all_projects(
        self, page: int = 1, limit: int = 100
    ) -> ProjectListResponse:
        skip = (page - 1) * limit
        projects, total = await self.project_repo.get_all(skip=skip, limit=limit)

        project_responses = []
        for p in projects:
            members = []
            if p.members:
                members = [
                    MemberBasicResponse(
                        id=pm.user.id,
                        username=pm.user.username,
                        full_name=pm.user.full_name,
                        email=pm.user.email,
                    )
                    for pm in p.members
                    if pm.user
                ]
            project_responses.append(
                ProjectResponse(
                    id=p.id,
                    name=p.name,
                    description=p.description,
                    color=p.color,
                    is_active=p.is_active,
                    created_at=p.created_at,
                    members=members,
                )
            )

        return ProjectListResponse(
            projects=project_responses,
            total=total,
            page=page,
            limit=limit,
        )

    async def get_project_by_id(self, project_id: int) -> ProjectResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

        members = []
        if project.members:
            members = [
                MemberBasicResponse(
                    id=pm.user.id,
                    username=pm.user.username,
                    full_name=pm.user.full_name,
                    email=pm.user.email,
                )
                for pm in project.members
                if pm.user
            ]

        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            color=project.color,
            is_active=project.is_active,
            created_at=project.created_at,
            members=members,
        )

    async def update_project(
        self, project_id: int, request: ProjectUpdateRequest
    ) -> ProjectResponse:
        update_data = request.model_dump(exclude_unset=True)
        project = await self.project_repo.update(project_id, update_data)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return await self.get_project_by_id(project_id)

    async def delete_project(self, project_id: int) -> dict:
        success = await self.project_repo.delete(project_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return {"message": "Project deleted successfully"}

    async def add_members(
        self, project_id: int, request: ProjectMemberRequest
    ) -> ProjectResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

        for user_id in request.user_ids:
            await self.project_repo.add_member(project_id, user_id)

        return await self.get_project_by_id(project_id)

    async def remove_member(
        self, project_id: int, user_id: int
    ) -> ProjectResponse:
        success = await self.project_repo.remove_member(project_id, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in project",
            )
        return await self.get_project_by_id(project_id)