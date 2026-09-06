from abc import ABC, abstractmethod
from typing import Optional, List, Tuple
from datetime import date

from app.domain.enums import ReportStatus


class UserRepositoryInterface(ABC):
    @abstractmethod
    async def create(self, user_data: dict) -> object:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[object]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[object]:
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[object]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> Tuple[List[object], int]:
        pass

    @abstractmethod
    async def update(self, user_id: int, user_data: dict) -> Optional[object]:
        pass

    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        pass


class ProjectRepositoryInterface(ABC):
    @abstractmethod
    async def create(self, project_data: dict) -> object:
        pass

    @abstractmethod
    async def get_by_id(self, project_id: int) -> Optional[object]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> Tuple[List[object], int]:
        pass

    @abstractmethod
    async def update(self, project_id: int, data: dict) -> Optional[object]:
        pass

    @abstractmethod
    async def delete(self, project_id: int) -> bool:
        pass

    @abstractmethod
    async def add_member(self, project_id: int, user_id: int) -> bool:
        pass

    @abstractmethod
    async def remove_member(self, project_id: int, user_id: int) -> bool:
        pass

    @abstractmethod
    async def get_members(self, project_id: int) -> List[object]:
        pass


class ReportRepositoryInterface(ABC):
    @abstractmethod
    async def create(self, report_data: dict) -> object:
        pass

    @abstractmethod
    async def get_by_id(self, report_id: int) -> Optional[object]:
        pass

    @abstractmethod
    async def get_by_user(
        self, user_id: int, skip: int = 0, limit: int = 20
    ) -> Tuple[List[object], int]:
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        status: Optional[ReportStatus] = None,
        week_start: Optional[date] = None,
        week_end: Optional[date] = None,
    ) -> Tuple[List[object], int]:
        pass

    @abstractmethod
    async def update(self, report_id: int, data: dict) -> Optional[object]:
        pass

    @abstractmethod
    async def create_version(self, version_data: dict) -> object:
        pass

    @abstractmethod
    async def get_versions(self, report_id: int) -> List[object]:
        pass

    @abstractmethod
    async def get_latest_version(self, report_id: int) -> Optional[object]:
        pass


class ReviewRepositoryInterface(ABC):
    @abstractmethod
    async def create(self, review_data: dict) -> object:
        pass

    @abstractmethod
    async def get_by_report(self, report_id: int) -> List[object]:
        pass

    @abstractmethod
    async def get_latest_by_report(self, report_id: int) -> Optional[object]:
        pass