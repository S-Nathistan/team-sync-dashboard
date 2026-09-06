from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.repositories import ReviewRepositoryInterface
from app.infrastructure.models.review_comment import ReviewCommentModel


class ReviewRepository(ReviewRepositoryInterface):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, review_data: dict) -> ReviewCommentModel:
        review = ReviewCommentModel(**review_data)
        self.db.add(review)
        await self.db.flush()
        await self.db.refresh(review)
        return review

    async def get_by_report(self, report_id: int) -> List[ReviewCommentModel]:
        result = await self.db.execute(
            select(ReviewCommentModel)
            .options(selectinload(ReviewCommentModel.reviewer))
            .where(ReviewCommentModel.report_id == report_id)
            .order_by(ReviewCommentModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_latest_by_report(
        self, report_id: int
    ) -> Optional[ReviewCommentModel]:
        result = await self.db.execute(
            select(ReviewCommentModel)
            .options(selectinload(ReviewCommentModel.reviewer))
            .where(ReviewCommentModel.report_id == report_id)
            .order_by(ReviewCommentModel.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()