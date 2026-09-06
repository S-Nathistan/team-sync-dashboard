from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.repositories import ProjectRepositoryInterface
from app.infrastructure.models.project import ProjectModel
from app.infrastructure.models.project_member import ProjectMemberModel
from app.infrastructure.models.user import UserModel


class ProjectRepository(ProjectRepositoryInterface):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, project_data: dict) -> ProjectModel:
        project = ProjectModel(**project_data)
        self.db.add(project)
        await self.db.flush()
        await self.db.refresh(project)
        return project

    async def get_by_id(self, project_id: int) -> Optional[ProjectModel]:
        result = await self.db.execute(
            select(ProjectModel)
            .options(selectinload(ProjectModel.members).selectinload(ProjectMemberModel.user))
            .where(ProjectModel.id == project_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, skip: int = 0, limit: int = 100
    ) -> Tuple[List[ProjectModel], int]:
        count_result = await self.db.execute(
            select(func.count(ProjectModel.id)).where(ProjectModel.is_active == True)
        )
        total = count_result.scalar()

        result = await self.db.execute(
            select(ProjectModel)
            .where(ProjectModel.is_active == True)
            .order_by(ProjectModel.name)
            .offset(skip)
            .limit(limit)
        )
        projects = list(result.scalars().all())
        return projects, total

    async def update(self, project_id: int, data: dict) -> Optional[ProjectModel]:
        project = await self.get_by_id(project_id)
        if not project:
            return None
        for key, value in data.items():
            setattr(project, key, value)
        await self.db.flush()
        await self.db.refresh(project)
        return project

    async def delete(self, project_id: int) -> bool:
        project = await self.get_by_id(project_id)
        if not project:
            return False
        project.is_active = False  # Soft delete
        await self.db.flush()
        return True

    async def add_member(self, project_id: int, user_id: int) -> bool:
        # Check if already exists
        result = await self.db.execute(
            select(ProjectMemberModel).where(
                ProjectMemberModel.project_id == project_id,
                ProjectMemberModel.user_id == user_id,
            )
        )
        if result.scalar_one_or_none():
            return False  # Already a member

        member = ProjectMemberModel(project_id=project_id, user_id=user_id)
        self.db.add(member)
        await self.db.flush()
        return True

    async def remove_member(self, project_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            select(ProjectMemberModel).where(
                ProjectMemberModel.project_id == project_id,
                ProjectMemberModel.user_id == user_id,
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            return False
        await self.db.delete(member)
        await self.db.flush()
        return True

    async def get_members(self, project_id: int) -> List[UserModel]:
        result = await self.db.execute(
            select(UserModel)
            .join(ProjectMemberModel, ProjectMemberModel.user_id == UserModel.id)
            .where(ProjectMemberModel.project_id == project_id)
        )
        return list(result.scalars().all())